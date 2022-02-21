const msal = require('@azure/msal-node');
const axios = require('axios');
const retry = require('async-retry');
const { isNetworkError, isRetryableError }  = require('axios-retry');
const { Logger } = require('@chip-in/logger');
const defaultValue = require('../configDefaultValue.js');
const passwdUtil = require('./passwdUtil.js');
const { UserOperationException } = require('../exception/UserOperationException.js');
const { ChangePasswordException } = require('../exception/ChangePasswordException.js');
const { LOG_MESSAGES } = require('../messages/logMessages');
const { MESSAGES } = require('../messages/responseMessages');
require('dotenv').config();

// Logger
const logger = Logger.getLogger(process.env.APP_FQDN || defaultValue.appFQDN);

// Retry condition
const CUSTOM_SAFE_HTTP_METHODS = ['get', 'head', 'options'];
const CUSTOM_IDEMPOTENT_HTTP_METHODS = CUSTOM_SAFE_HTTP_METHODS.concat(['post'/*, 'patch'*/]); // TODO:

// Configuration for ChangePasswordWebApp
const urlAuthority = process.env.CLOUD_INSTANCE_ID || defaultValue.urlAuthority;
const scopes = process.env.SCOPES && passwdUtil.getScopes(process.env.SCOPES, "SCOPES") || defaultValue.scopes;
const accountLockedErrCd = process.env.accountLockedErrCd || defaultValue.accountLockedErrCd;
const retryCount = process.env.retryCount && passwdUtil.getNumber(process.env.retryCount, "retryCount") || defaultValue.retryCount;
const backOffMultiplier = process.env.backOffMultiplier && passwdUtil.getNumberDecimal(process.env.backOffMultiplier, "backOffMultiplier") || defaultValue.backOffMultiplier;
const backOffInitialInterval = process.env.backOffInitialInterval && passwdUtil.getNumber(process.env.backOffInitialInterval, "backOffInitialInterval") || defaultValue.backOffInitialInterval;
const backOffMaxInterval = process.env.backOffMaxInterval && passwdUtil.getNumber(process.env.backOffMaxInterval, "backOffMaxInterval") || defaultValue.backOffMaxInterval;

logger.debug(LOG_MESSAGES.CONFIG_RETRY_VALUES.code, LOG_MESSAGES.CONFIG_RETRY_VALUES.msg,
    [backOffMultiplier.toString()],
    [retryCount, backOffInitialInterval, backOffMaxInterval]
);


module.exports = {
    // Msal PublicClientApplication
    pca : null,

    // Configuration for msal 
    msalConfig : {
        auth: {
            clientId: process.env.AZURE_CLIENTID,
            authority: urlAuthority + process.env.AZURE_TENANTID,
        },
        system: {
            loggerOptions: {
                loggerCallback(loglevel, message, containsPii) {
                    console.log(message);
                },
                piiLoggingEnabled: false,
                logLevel: process.env.MSAL_LOGLEVEL && msal.LogLevel[process.env.MSAL_LOGLEVEL] || msal.LogLevel.Verbose
            }
        }
    },

    /**
     * Create an instance of PublicClientApplication
     */
    createMsalApplication : function() {
        this.pca = new msal.PublicClientApplication(this.msalConfig);
    },
    
    /**
     * ユーザ委任トークンを取得する
     * @param {*} accountid アカウントID
     * @param {*} oldpass パスワード
     * @returns ユーザ委任トークン
     */
    getUserToken : async function(accountid, oldpass) {
        logger.trace(LOG_MESSAGES.PROGRESS_LOG.code, LOG_MESSAGES.PROGRESS_LOG.msg, ["Start getUserToken."]);
    
        const usernamePasswordRequest = {
            scopes: scopes,
            username: accountid,
            password: oldpass
        };
    
        const token = await retry(
            async (bail, num) => { // num は１相対
                logger.debug(LOG_MESSAGES.RETRY_GET_TOKEN.code, LOG_MESSAGES.RETRY_GET_TOKEN.msg, null, [(num - 1)]);
    
                const ret = await this.pca.acquireTokenByUsernamePassword(usernamePasswordRequest).then((response) => {
                    logger.info(LOG_MESSAGES.SUCCESS_GET_TOKEN.code, LOG_MESSAGES.SUCCESS_GET_TOKEN.msg, [accountid]);
                    return response.accessToken;
                }).catch((error) => {
                    logger.info(LOG_MESSAGES.FAILURE_GET_TOKEN.code, LOG_MESSAGES.FAILURE_GET_TOKEN.msg,
                         [accountid, error.name, error.message]
                    );
        
                    // ユーザIDもしくはパスワード誤りの場合は認証エラーをスローする。
                    if (error.name && error.name == "ServerError") { // 更に 400 で切り分けることは出来ない
                        if (error.errorMessage && error.errorMessage.startsWith(accountLockedErrCd)) {
                            // アカウントロック
                            bail(new UserOperationException("TOKEN_ACCOUNT_LOCKED", error, MESSAGES.ACCOUNT_LOCKED));
                            return null;
                        } else {
                            // アカウントが存在しない、もしくはパスワード誤り
                            bail(new UserOperationException("TOKEN_INVALID_PASSWORD", error, MESSAGES.INVALID_PASSWORD));
                            return null;
                        }
                    }
                    if (error.name && error.name == "ClientAuthError") {
                        // AADがエラー応答した場合、ネットワークエラーが発生した場合はリトライする。
                        throw new ChangePasswordException("TOKEN_CLIENT_AUTH_ERROR", error, MESSAGES.INTERNAL_ERROR);
                    } else {
                        // それ以外は、想定外エラーをスローする。
                        bail(new ChangePasswordException("TOKEN_UNEXPECTED_ERROR", error, MESSAGES.INTERNAL_ERROR));
                        return null;
                    }
                });
                return ret;
            }, {
                retries: retryCount,
                factor: backOffMultiplier,
                minTimeout: backOffInitialInterval,
                maxTimeout: backOffMaxInterval,
                randomize: false
            }
        );
    
        logger.trace(LOG_MESSAGES.PROGRESS_LOG.code, LOG_MESSAGES.PROGRESS_LOG.msg, ["End getUserToken."]);
        return token;
    },
    
    /**
     * HTTPリクエスト（PATCHメソッド）を送信する
     * @param {*} token ユーザ委任トークン
     * @param {*} url リクエストURL
     * @param {*} body リクエストボディ
     * @param {*} accountid アカウントID
     * @returns 
     */
    //patch : async function(token, url, body, accountid) { // TODO: 
    post : async function(token, url, body, accountid) { // TODO: 
        logger.trace(LOG_MESSAGES.PROGRESS_LOG.code, LOG_MESSAGES.PROGRESS_LOG.msg, ["Start REST API."]);
    
        // HTTPリクエストヘッダを生成
        const options = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-store'
            }
        };
    
        await retry(
            async (bail, num) => { // num は１相対
                logger.debug(LOG_MESSAGES.RETRY_REST_API.code, LOG_MESSAGES.RETRY_REST_API.msg, null, [(num - 1)]);
    
    //          await axios.patch(url, body, options).then((response) => { // TODO: 
                await axios.post(url, body, options).then((response) => { // TODO: 
                    // 成功時 HTTP 204 No Content
                    logger.info(LOG_MESSAGES.SUCCESS_REST_API.code, LOG_MESSAGES.SUCCESS_REST_API.msg, [accountid, response.status.toString()]);
                    return;
                }).catch((error) => {
                    this.outputLogForRestAPI(error, accountid);
    
                    /**
                     * ネットワークエラー、5xx系エラー発生時はリトライする
                     * パスワードが間違っているとき、パスワードポリシーに反しているときは、ユーザ起因のエラーにする
                     * それ以外は、想定外エラーをスローする
                     */
                    const isRetry = isNetworkError(error) || this.isCustomIdempotentRequestError(error);
                    if (!isRetry) {
                        if (error.response && error.response.status == 400) {
                            bail(new UserOperationException("INVALID_PASSWORD", error, MESSAGES.GRAPH_INVALID_PASSWORD));
                            return;
                        }
                        bail(new ChangePasswordException("FAILURE_REST_API", error, MESSAGES.INTERNAL_ERROR));
                        return;
                    }
                    throw new ChangePasswordException("FAILURE_REST_API", error, MESSAGES.INTERNAL_ERROR);
                });
            }, {
                retries: retryCount,
                factor: backOffMultiplier,
                minTimeout: backOffInitialInterval,
                maxTimeout: backOffMaxInterval,
                randomize: false
            }
        );
    
        logger.trace(LOG_MESSAGES.PROGRESS_LOG.code, LOG_MESSAGES.PROGRESS_LOG.msg, ["End REST API."]);
        return;
    },
    
    outputLogForRestAPI : function(error, accountid) {
        logger.info(LOG_MESSAGES.FAILURE_REST_API.code, LOG_MESSAGES.FAILURE_REST_API.msg, [
            accountid,
            error.code && error.code.toString() || "",
            error.response && error.response.status && error.response.status.toString() || "",
            `${error.name}::${error.message}`
        ]);
    
        if (error.response) {
            logger.info(LOG_MESSAGES.MS_GRAPH_ERROR.code, LOG_MESSAGES.MS_GRAPH_ERROR.msg, [
                accountid,
                error.response.status && error.response.status.toString() || "",
                error.response.data && JSON.stringify(error.response.data) || ""
            ]);
        }
    },
    
    /**
     * axios リトライ条件判定関数（カスタマイズ）
     * @see axios-retry#isIdempotentRequestError
     * @param  {Error}  error
     * @return {boolean}
     */
    isCustomIdempotentRequestError : function(error) {
        if (!error.config) {
          // Cannot determine if the request can be retried
          return false;
        }
        return isRetryableError(error) && CUSTOM_IDEMPOTENT_HTTP_METHODS.indexOf(error.config.method) !== -1;
    }

};
