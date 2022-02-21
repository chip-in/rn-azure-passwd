/**
 * @desc ChangePasswordWebApp response messages.
 */

const common_message_failure = "パスワードの変更に失敗しました。入力情報を確認してください。";

exports.MESSAGES = {
  SUCCESS_CHANGE_PWD:   {code:     0, name: "Success_ChangePassword",     message: "パスワードを変更しました。"},
  INVALID_PASSWORD:     {code:  4000, name: "Invalid_Password",           message: common_message_failure},
  EMPTY_PASSWORD:       {code:  4001, name: "Empty_Password",             message: common_message_failure},
  VOILATES_POLICY:      {code:  4002, name: "Violates_Policy",            message: common_message_failure},
  NOT_MATCH_PWD:        {code:  4003, name: "NotMatch_Password",          message: common_message_failure},
  NOT_FOUND_COOKIES:    {code:  4004, name: "NotFound_Cookies",           message: "パスワードの変更に失敗しました。ユーザ情報が設定されていません。ログインしなおしてください。"},
  JWT_TOKEN_EXPIRED_ERROR:  {code:  4005, name: "TokenExpiredError",      message: "パスワードの変更に失敗しました。タイムアウトしている可能性があります。"},
  JWT_JSON_WEB_TOKEN_ERROR: {code:  4006, name: "JsonWebTokenError",      message: "パスワードの変更に失敗しました。ユーザ情報が正しくありません。"},
  JWT_NOT_BEFORE_ERROR:     {code:  4007, name: "NotBeforeError",         message: "パスワードの変更に失敗しました。ユーザ情報が現在利用できません。時間をおいてお試しください。"},
  JWT_VERIFY_ERROR:         {code:  4008, name: "jwtVerifyError",         message: "パスワードの変更に失敗しました。タイムアウトしている可能性があります。"},
  JWT_NOT_FOUND_USERID:     {code:  4009, name: "NotFound_UserInfo",      message: "パスワードの変更に失敗しました。ユーザ情報が設定されていません。ログインしなおしてください。"},
  ACCOUNT_LOCKED:           {code:  4010, name: "Account_Locked",         message: "アカウントが一時的にロックされています。時間をおいてお試しください。"},
  FAILURE_CHANGE_PWD:       {code:  4011, name: "Failure_ChangePassword", message: common_message_failure},
  GRAPH_INVALID_PASSWORD:   {code:  4012, name: "Invalid_Violates_Policy",message: common_message_failure},
  INTERNAL_ERROR:           {code:  4013, name: "Internal_Error",         message: "エラーが発生しました。ネットワークエラーが発生した等の可能性があります。お手数ですが、サービスへのアクセスからやり直してください。<br />問題が解決しない場合は、ヘルプデスク、ネットワーク管理者等にご連絡ください。"},

  EOD: {code: -1, message: 'End of data'}
}
