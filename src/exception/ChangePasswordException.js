/**
 * @desc ChangePasswordException. 
 */
const ExceptionMassages = {
  'NOT_FOUND_USERID': 'AccountID not found.',
  'ACCOUNT_LOCKED': 'The Account is temporarily locked.',
  'INVALID_PASSWORD': 'Failed to get a token because the password is incorrect.',
  'FAILURE_REST_API': 'Failed to operate by REST API.', 
  'TOKEN_CLIENT_AUTH_ERROR': 'Failed to get the token with "ClientAuthError" error.',
  'TOKEN_UNEXPECTED_ERROR': 'Failed to get the token with an unexpected error.',
  'EOD': 'End of data'
}

exports.ChangePasswordException = function (code, exception, responseMessage) {
   this.code = code;
   this.name = "ChangePasswordException";
   this.message = ExceptionMassages[this.code] || "(Caution) The message could not get because an unexpected code was specified. code="+this.code;
   this.exception = exception;
   this.responseMessage = responseMessage || null;
   this.toString = function() {
      return `${this.name}:${this.code} - ${this.message}`;
   };
}
