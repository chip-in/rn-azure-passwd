/**
 * 初期画面表示（ボタンの表示・非表示）
 */
function loadFunc() {
  const result = getHostNameQueryParamValue('returnURL');
  if (result.value) {
    $('#returnAppButton').removeClass('d-none').addClass('d-block');
  } else {
    $('#returnAppButton').removeClass('d-block').addClass('d-none');
  }
}

/**
 * アプリケーションに戻る処理
 */
function backToApp() {
  lockWindow();
  setTimeout(function() {
    const returnURL = isOwnURL();
    unlockWindow();
    if (returnURL) {
      location.href=returnURL;
    } else {
      window.alert("不正な値が指定されているため、アプリケーションに戻る操作を中止しました。");
    }
    return;    
  },10);
}

/**
 * returnURLのチェック
 * @returns returnURL。不正な値のときは null
 */
function isOwnURL() {
  const result = getHostNameQueryParamValue('returnURL');
  if (!result.value) return null;

  const url = new URL(result.value);
  if (result.hostname != url.hostname) {
    console.log(`The url is incorrect. own=${result.hostname}, return=${url.hostname}`);
    return null;
  }
  return result.value;
}

/**
 * 自身のURLからホスト名およびクエリパラメータ値を取得する
 * @param {*} key 取得するクエリパラメータキー名
 * @returns {Object} {hostname, value}
 */
function getHostNameQueryParamValue(key) {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  return { hostname: url.hostname, value: params.get(key)};
}
