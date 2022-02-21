/**
 * @desc ChangePasswordWebApp log messages.
 */
 exports.LOG_MESSAGES = {
  // index
  START_LISTEN:             {code:  1000, msg: 'listening on port %1.'}, // %1:Port

  // passwdCallback
  START_POST:               {code:  2000, msg: 'POST %1'},
  NOT_FOUND_COOKIES:        {code:  2001, msg: 'Cookies are not set.'},
  JWT_VERIFY_ERROR:         {code:  2002, msg: 'JWT validation failed. name=%1, message=%2'}, // %1: errorName, %2: errorMessage
  JWT_VERIFY_ERROR_OTHER:   {code:  2003, msg: 'JWT validation failed. error=%1.'}, // %1: error
  TRY_CHANGE_PWD:           {code:  2004, msg: 'Attempting to change ths password. user="%1"'}, //  %1: accountid
  SUCCESS_CHANGE_PWD:       {code:  2005, msg: 'Successfully changed the password by "%1".'}, //  %1: accountid
  FAILURE_CHANGE_PWD:       {code:  2006, msg: 'Failed to change the password by "%1".'}, //  %1: accountid
  CATCH_ERROR:              {code:  2007, msg: 'Catch error. name=%1, message=%2'}, // %1: errorName, %2: errorMessage
  CATCH_ERROR_OTHER:        {code:  2008, msg: 'Catch error. error=%1.'}, // %1: error

  // httpClient
  CONFIG_RETRY_VALUES:      {code:  3000, msg: 'Retry related settings. retryCount=%d1, backOffMultiplier=%1, backOffInitialInterval=%d2, backOffMaxInterval=%d3'}, // %1, %d1-%d3: retry config value
  SUCCESS_GET_TOKEN:        {code:  3001, msg: 'Succeeded to get the token by password grant. user="%1"'}, // %1: accountid
  FAILURE_GET_TOKEN:        {code:  3002, msg: 'Failed to get the token by password grant. user="%1" Error: name=%2, message=%3'}, // %1: accountid, %2: errorName, %3: errorMessage
  SUCCESS_REST_API:         {code:  3003, msg: 'Succeeded to operate by REST API. user="%1", status=%2'}, // %1: accountid, %2: response.status
  FAILURE_REST_API:         {code:  3004, msg: 'Failed to operate by REST API. user="%1", code=%2, status=%3, name::message=%4'}, // %1: accountid, %2: code, %3: status, %4: errorName+errorMessage
  RETRY_REST_API:           {code:  3005, msg: 'REST API request retry=%d1.'}, // %d1: retryCount
  MS_GRAPH_ERROR:           {code:  3006, msg: 'Graph detail error. user="%1". Error: %2, %3'}, // %1: accountid, %2: response.status, %3: response.data
  RETRY_GET_TOKEN:          {code:  3007, msg: 'getUserToken retry=%d1.'}, // %d1: retryCount

  // passwdUtil
  CONFIG_NUMBER_ERROR:      {code:  4000, msg: 'Non-integer is specified for %1. Processing continues with the default value.'}, // %1: property name
  CONFIG_REGEXP_ERROR:      {code:  4001, msg: 'The regular expression pattern syntax for %1 is incorrect. Ignores the regular expression check and continues processing. detail=%2'}, // %1: property name, %2: catch error
  CONFIG_SCOPES_ERROR:      {code:  4002, msg: 'No value is specified for %1. Processing continues with the default value.'}, // %1: property name
  EMPTY_PASSWORD:           {code:  4003, msg: 'Empty password.'},
  VOILATES_POLICY:          {code:  4004, msg: 'Violates the password policy.'},
  NOT_MATCH_PWD:            {code:  4005, msg: 'New passwords do not match.'},

  // common
  FREE_LOG:                 {code:  5000, msg: '%1'}, // %1: free message
  PROGRESS_LOG:             {code:  5001, msg: 'PASS: %1'}, // %1: pass point


  EOD: {code: -1, msg: 'End of data'}
}
