const path = require('path');
const jwt_decode = require("jwt-decode");
const { Logger } = require('@chip-in/logger');
const defaultValue = require('./configDefaultValue.js');
const passwdUtil = require('./util/passwdUtil.js');
const httpClient = require('./util/httpClient.js');
const { UserOperationException } = require('./exception/UserOperationException.js');
const { ChangePasswordException } = require('./exception/ChangePasswordException.js');
const { LOG_MESSAGES } = require('./messages/logMessages');
const { MESSAGES } = require('./messages/responseMessages');
require('dotenv').config();

// Logger
const logger = Logger.getLogger(process.env.APP_FQDN || defaultValue.appFQDN);

// Configuration for ChangePasswordWebApp
const urlUsers = process.env.URL_USERS || defaultValue.urlUsers;;
const passwordPolicyRegexp = process.env.PASSWORD_LETTER_REGEXP && passwdUtil.getRegExp(process.env.PASSWORD_LETTER_REGEXP, "PASSWORD_LETTER_REGEXP") || defaultValue.passwordPolicyRegexp;
const passwordMinLen = process.env.PASSWORD_MINLEN && passwdUtil.getNumber(process.env.PASSWORD_MINLEN, "PASSWORD_MINLEN") || defaultValue.passwordMinLen;
const passwordMaxLen = process.env.PASSWORD_MAXLEN && passwdUtil.getNumber(process.env.PASSWORD_MAXLEN, "PASSWORD_MAXLEN") || defaultValue.passwordMaxLen;
const policyObj = {passwordPolicyRegexp, passwordMinLen, passwordMaxLen};

/**
 * パスワード変更処理（POST リクエスト）
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
function doChangePassword(req, res, next) { 
    logger.trace(LOG_MESSAGES.START_POST.code, LOG_MESSAGES.START_POST.msg, ['/doChangePassword']);

    // Cookies の確認
    if (!req.cookies || !req.cookies.access_token) {
        logger.info(LOG_MESSAGES.NOT_FOUND_COOKIES.code, LOG_MESSAGES.NOT_FOUND_COOKIES.msg);
        res.status(400).json(setResponseBody(MESSAGES.NOT_FOUND_COOKIES));
        return;
    }
    logger.trace(LOG_MESSAGES.PROGRESS_LOG.code, LOG_MESSAGES.PROGRESS_LOG.msg, ["Checked cookies"]);

    // JWTからアカウントIDを取得
    let accountid = null;
    try {
        var decoded = jwt_decode(req.cookies.access_token);
        if (!decoded || !decoded.sub) {
            throw new ChangePasswordException("NOT_FOUND_USERID");
        }
        accountid = decoded.sub;
    } catch(err) {
        let resultMessage = MESSAGES.JWT_VERIFY_ERROR;
        if (err.name) {
            logger.info(LOG_MESSAGES.JWT_VERIFY_ERROR.code, LOG_MESSAGES.JWT_VERIFY_ERROR.msg, [err.name, err.message]);
            switch (err.name) {
                case "ChangePasswordException":
                    resultMessage = MESSAGES.JWT_NOT_FOUND_USERID;
                    break;
                default:
                    resultMessage = MESSAGES.JWT_VERIFY_ERROR;
            }
        } else {
            logger.info(LOG_MESSAGES.JWT_VERIFY_ERROR_OTHER.code, LOG_MESSAGES.JWT_VERIFY_ERROR_OTHER.msg, [err.toString()]);
        }
        res.status(400).json(setResponseBody(resultMessage));
        return;
    }
    logger.trace(LOG_MESSAGES.PROGRESS_LOG.code, LOG_MESSAGES.PROGRESS_LOG.msg, ["Checked jwt"]);

    logger.info(LOG_MESSAGES.TRY_CHANGE_PWD.code, LOG_MESSAGES.TRY_CHANGE_PWD.msg, [accountid]);

    // パスワードの取得および検証
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;

    const resultCheckValidity = passwdUtil.checkValidityPassword(currentPassword, newPassword, confirmPassword, policyObj);
    if (resultCheckValidity !== null) {
        res.status(400).json(setResponseBody(resultCheckValidity));
        return;
    }
    logger.trace(LOG_MESSAGES.PROGRESS_LOG.code, LOG_MESSAGES.PROGRESS_LOG.msg, ["Validator check was successful."]);


    // パスワードを変更
    updatePassword(accountid, currentPassword, newPassword).then(() => {
        logger.info(LOG_MESSAGES.SUCCESS_CHANGE_PWD.code, LOG_MESSAGES.SUCCESS_CHANGE_PWD.msg, [accountid]);
        res.status(200).json(setResponseBody(MESSAGES.SUCCESS_CHANGE_PWD));
        return;
    }).catch((error) => {
        logger.info(LOG_MESSAGES.FAILURE_CHANGE_PWD.code, LOG_MESSAGES.FAILURE_CHANGE_PWD.msg, [accountid]);
        let resultMessage = MESSAGES.FAILURE_CHANGE_PWD;
        if (error.name) {
            logger.debug(LOG_MESSAGES.CATCH_ERROR.code, LOG_MESSAGES.CATCH_ERROR.msg, [error.name, error.message]);
            if (error.name == "UserOperationException") {
                resultMessage = error.responseMessage;
                res.status(400).json(setResponseBody(resultMessage));
                return;
            } else if (error.name == "ChangePasswordException" && error.responseMessage !== null) {
                resultMessage = error.responseMessage;
            }
        } else {
            logger.debug(LOG_MESSAGES.CATCH_ERROR_OTHER.code, LOG_MESSAGES.CATCH_ERROR_OTHER.msg, [error.toString()]);
        }
        res.status(500).json(setResponseBody(resultMessage));
        return;
    });
}

/**
 * パスワード変更完了（GET リクエスト）
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
function displaySuccessPage(req, res, next) { 
    res.sendFile(path.join(__dirname, '../public/success.html'));
    return;
}

/**
 * レスポンスボディに設定するJSONオブジェクトを作成
 * @param {*} messageInfo MESSAGES のキー
 * @returns JSONオブジェクト
 */
function setResponseBody(messageInfo) {
    const body = {
        /*
        retCode: messageInfo.code,
        name: messageInfo.name,
        */
        message: messageInfo.message
    }
    return body;
}

/**
 * パスワードを変更する
 * @param {String} accountid  アカウントID
 * @param {String} oldpass 現在のパスワード
 * @param {String} newpass 新しいパスワード
 * @throws ChangePasswordException ライブラリ共通例外
 */
async function updatePassword(accountid, oldpass, newpass) {
    logger.trace(LOG_MESSAGES.PROGRESS_LOG.code, LOG_MESSAGES.PROGRESS_LOG.msg, ["Start updatePassword."]);

    try {
        // ユーザ委任トークンを取得する
        const token = await httpClient.getUserToken(accountid, oldpass);
        logger.trace(LOG_MESSAGES.PROGRESS_LOG.code, LOG_MESSAGES.PROGRESS_LOG.msg, ["After getUserToken."]);

        // リクエストURLを生成する
//      const url = urlUsers+"/"+encodeURIComponent(accountid); // TODO: original   passwordProfile使用時
        const url = urlUsers+"/"+encodeURIComponent(accountid)+"/changePassword"; // TODO: for Test  changePassowrdメソッド使用時
        logger.trace(LOG_MESSAGES.PROGRESS_LOG.code, LOG_MESSAGES.PROGRESS_LOG.msg, ["Created url."]);

        // リクエストボディを生成する
        /*
        const passwordProfile = {};
        passwordProfile.password = newpass;
        passwordProfile.forceChangePasswordNextSignIn = false;

        const body = {};
        body.passwordProfile = passwordProfile;
        */

        // リクエストボディを生成する(changePassword メソッド利用)
        const body = {
            currentPassword: oldpass,
            newPassword: newpass
        };
        logger.trace(LOG_MESSAGES.PROGRESS_LOG.code, LOG_MESSAGES.PROGRESS_LOG.msg, ["Created request-body."]);

        // パスワードを更新する
        //await httpClient.patch(token, url, body, accountid); // TODO: passwordProfile 更新
        await httpClient.post(token, url, body, accountid); // TODO: changePassword メソッド利用
        logger.trace(LOG_MESSAGES.PROGRESS_LOG.code, LOG_MESSAGES.PROGRESS_LOG.msg, ["After Microsoft Graph request."]);

        return;
    } catch (error) {
        logger.debug(LOG_MESSAGES.PROGRESS_LOG.code, LOG_MESSAGES.PROGRESS_LOG.msg, ["Catch an error in updatePassword."]);
        throw error;
    }
}

export { doChangePassword, displaySuccessPage };