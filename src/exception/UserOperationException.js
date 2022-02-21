/**
 * @desc UserOperationException. 
 */
const UserExceptionMassages = {
   'TOKEN_ACCOUNT_LOCKED': 'The Account is temporarily locked.',
   'TOKEN_INVALID_PASSWORD': 'Failed to get a token because the password is incorrect.',
   'INVALID_PASSWORD': 'Failed to change a password because the password is incorrect.',
  'EOD': 'End of data'
}

exports.UserOperationException = function (code, exception, responseMessage) {
   this.code = code;
   this.name = "UserOperationException";
   this.message = UserExceptionMassages[this.code] || "(Caution) The message could not get because an unexpected code was specified. code="+this.code;
   this.exception = exception;
   this.responseMessage = responseMessage || null;
   this.toString = function() {
      return `${this.name}:${this.code} - ${this.message}`;
   };
}
