const { Logger } = require('@chip-in/logger');
const defaultValue = require('../configDefaultValue.js');
const { LOG_MESSAGES } = require('../messages/logMessages');
const { MESSAGES } = require('../messages/responseMessages');
require('dotenv').config();

// Logger
const logger = Logger.getLogger(process.env.APP_FQDN || defaultValue.appFQDN);

module.exports = {

    /**
     * パスワードのバリデートチェック
     * @param {*} currentPassword  現在のパスワード
     * @param {*} newPassword 新しいパスワード
     * @param {*} confirmPassword 新しいパスワード（再）
     * @param {*} policyObj パスワードポリシー
     * @returns エラーメッセージ。パスワードが有効なときは null
     */
    checkValidityPassword : function(currentPassword, newPassword, confirmPassword, policyObj) {
        if (this.isEmptyPassword(currentPassword) || this.isEmptyPassword(newPassword) || this.isEmptyPassword(confirmPassword)) {
            logger.info(LOG_MESSAGES.EMPTY_PASSWORD.code, LOG_MESSAGES.EMPTY_PASSWORD.msg);
            return MESSAGES.EMPTY_PASSWORD;
        }
        
        if (!this.checkPasswordPolicy(currentPassword, policyObj) ||
            !this.checkPasswordPolicy(newPassword, policyObj) ||
            !this.checkPasswordPolicy(confirmPassword, policyObj)
        ) {
            logger.info(LOG_MESSAGES.VOILATES_POLICY.code, LOG_MESSAGES.VOILATES_POLICY.msg);
            return MESSAGES.VOILATES_POLICY;
        }
    
        // 新しいパスワード、新しいパスワード（再）が一致するか
        if (newPassword !== confirmPassword) {
            logger.info(LOG_MESSAGES.NOT_MATCH_PWD.code, LOG_MESSAGES.NOT_MATCH_PWD.msg);
            return MESSAGES.NOT_MATCH_PWD;
        }
        return null;
    },
    
    /**
     * パスワードが空でないか。trim 処理も行う
     * @param {*} value パスワード
     * @returns 空のとき true
     */
    isEmptyPassword : function(value) {
        if (value && value.trim() !== "") {
            return false;
        }
        return true;
    },
    
    /**
     * パスワードポリシー／桁数のチェック
     * @param {*} value パスワード
     * @param {*} policyObj パスワードポリシー
     * @returns ポリシーに従っている時 true
     */
    checkPasswordPolicy : function(value, policyObj) {
        if (value.length < policyObj.passwordMinLen || value.length > policyObj.passwordMaxLen) {
            return false;
        }
        if (policyObj.passwordPolicyRegexp !== null) {
            return policyObj.passwordPolicyRegexp.test(value);
        }
        return true;
    },
    
    /**
     * 設定ファイルの属性値をチェック
     * @param {*} val 属性値
     * @param {*} name 属性名
     * @returns 数値に変換した値。英字など有効でない場合は null
     */
    getNumber : function(val, name){
        const regexp = new RegExp(/^[0-9]+$/);
        if (!regexp.test(val)) {
            logger.warn(LOG_MESSAGES.CONFIG_NUMBER_ERROR.code, LOG_MESSAGES.CONFIG_NUMBER_ERROR.msg, [name]);
            return null;
        }
        return Number(val);
    },
    getNumberDecimal : function(val, name){
        const regexp = new RegExp(/^[0-9\.]+$/);
        if (!regexp.test(val)) {
            logger.warn(LOG_MESSAGES.CONFIG_NUMBER_ERROR.code, LOG_MESSAGES.CONFIG_NUMBER_ERROR.msg, [name]);
            return null;
        }
        const ret = Number(val);
        if (Number.isNaN(ret)) {
            logger.warn(LOG_MESSAGES.CONFIG_NUMBER_ERROR.code, LOG_MESSAGES.CONFIG_NUMBER_ERROR.msg, [name]);
            return null;
        }
        return ret;
    },
    
    /**
     * 設定ファイルの属性値（正規表現）をチェック
     * @param {*} val 属性値
     * @param {*} name 属性名
     * @returns RegExpオブジェクト。パターン構文として有効でない場合は null
     */
    getRegExp : function(val, name){
        try {
            const regexp = new RegExp(val);
            return regexp;
        } catch (error) {
            logger.warn(LOG_MESSAGES.CONFIG_REGEXP_ERROR.code, LOG_MESSAGES.CONFIG_REGEXP_ERROR.msg, [name,  error.toString()]);
            return null;
        }
    },
    
    /**
     * 設定ファイルの文字列をカンマ区切りで配列に分割
     * @param {*} val 属性値
     * @param {*} name 属性名
     * @returns 配列。有効でない場合は null
     */
    getScopes : function(val, name){
        const scopes = val && val.split(',');
        if (!val || !scopes || scopes.length < 1) {
            logger.info(LOG_MESSAGES.CONFIG_SCOPES_ERROR.code, LOG_MESSAGES.CONFIG_SCOPES_ERROR.msg, [name]);
            return null;
        }
        return scopes;
    }
    
};
