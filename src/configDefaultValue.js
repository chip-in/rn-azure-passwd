/**
 * @desc Default value of environment variable.
 */
module.exports = {
    appFQDN: "changePasswordWebApp",
    passwordPolicyRegexp : new RegExp("^[\x21-\x7e]*$"),
    passwordMinLen : 8,
    passwordMaxLen : 60,
    scopes : ["https://graph.microsoft.com/.default"],
    retryCount : 3,
    backOffMultiplier : 2.0,
    backOffInitialInterval : 300,
    backOffMaxInterval : 30000,
    accountLockedErrCd : "50053",
    urlUsers : "https://graph.microsoft.com/v1.0/users",
    urlAuthority : "https://login.microsoftonline.com/"
}