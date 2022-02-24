const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const confirmPasswordInvalidFeedbackDiv = document.getElementById("confirmPasswordInvalidFeedback");

/**
 * レスポンスの返却コード
 */
const HTTP_STATUS_200 = 200;
const HTTP_STATUS_400 = 400;
const HTTP_STATUS_500 = 500;
 
/**
 * 入力値のバリデートチェック（input要素のカスタム検証）
 * @param {*} input 入力フィールド
 * @returns 
 */
function checkNewPassword(input) {
    const newPasswordValue = newPasswordInput.value;
    const confirmPasswordValue = confirmPasswordInput.value;

    if (!confirmPasswordValue) {
      confirmPasswordInput.setCustomValidity('使用可能な文字からなる8～60桁のパスワードを入力してください');
      confirmPasswordInvalidFeedbackDiv.innerHTML = '使用可能な文字からなる8～60桁のパスワードを入力してください';
      return;
    }

    if (newPasswordValue !== confirmPasswordValue) {
      confirmPasswordInput.setCustomValidity('新しいパスワードが一致していません');
      confirmPasswordInvalidFeedbackDiv.innerHTML = '新しいパスワードが一致していません';
    } else {
      confirmPasswordInput.setCustomValidity('');
      confirmPasswordInvalidFeedbackDiv.innerHTML = '使用可能な文字からなる8～60桁のパスワードを入力してください';
    }
}

/**
 * パスワード変更を実行
 */
function doChangePassword() {
  const formToJSON = (elements) =>
  [].reduce.call(
    elements,
    (data, element) => {
      data[element.id] = element.value;
      return data;
    },
    {},
  );

  lockWindow();
  setTimeout(function() {
    if ($(".alert").length !== 0) {
      $(".alert").alert('close')
    }

    const formData = formToJSON(document.getElementById('changePasswordForm').elements);
    const url = "/a/passwd/doChangePassword";
    const options = {
      method : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    };
    fetch(url,options)
    .then((response) => {
      if (response.status > HTTP_STATUS_400 && response.status != HTTP_STATUS_500) {
        throw new Error(`HTTPエラー ${response.status}(${response.statusText})`)
      }
      return response.json().then(data => ({status: response.status, data}))
    })
    .then(({status, data}) => {
      if (status == HTTP_STATUS_200) { // 正常終了
        const url = new URL(window.location.href);
        const search = url.search? url.search : "";
        location.href="/a/passwd/complete"+search;
        return;
      } else if (status == HTTP_STATUS_400 || status == HTTP_STATUS_500) {
        insertAlert(data.message);
      } else {
        insertAlert("予期しない結果が返却されました。 (" + status + ")");
      }
    })
    .catch((error) => {
      insertAlert("予期しないエラーが発生しました。 (" + error.toString() + ")");
    })
    .finally(() => {
      unlockWindow();
    });
  },10);
}

/**
 * エラーメッセージの表示
 * @param {*} errorMassage エラーメッセージ
 */
function insertAlert(errorMassage) {
  if ('content' in document.createElement('template')) {
    var errorArea = document.querySelector('#errorMessageArea');
    var template = document.querySelector('#templateChagePasswordAlert');
    while(errorArea.firstChild){
      errorArea.removeChild(errorArea.firstChild);
    }

    var clone = template.content.cloneNode(true);
    var spanMessageArea = clone.querySelectorAll(".errorMessage");
    spanMessageArea[0].innerHTML = errorMassage;
    errorArea.appendChild(clone);
  } else {
    window.alert(errorMassage);
  }  
}

/**
 * 更新中の画面ロック
 */
function lockWindow() {
  $('#lock').removeClass('d-none').addClass('d-block');
  $("#doChangePasswordButton").find(".spinner-border").removeClass('d-none');
  $("#doChangePasswordButton").get(0).disabled = true;
  $("#returnAppButton").get(0).disabled = true;
}

/**
 * 更新中の画面ロック解除
 */
 function unlockWindow() {
  $('#lock').removeClass('d-block').addClass('d-none');
  $("#doChangePasswordButton").find(".spinner-border").addClass('d-none');
  $("#doChangePasswordButton").get(0).disabled = false;
  $("#returnAppButton").get(0).disabled = false;
}
