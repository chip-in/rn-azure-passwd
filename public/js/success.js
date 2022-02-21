/**
 * 更新中の画面ロック
 */
function lockWindow() {
  $('#lock').removeClass('d-none').addClass('d-block');
  $("#returnAppButton").find(".spinner-border").removeClass('d-none');
  $("#returnAppButton").get(0).disabled = true;
}

/**
 * 更新中の画面ロック解除
 */
 function unlockWindow() {
  $('#lock').removeClass('d-block').addClass('d-none');
  $("#returnAppButton").find(".spinner-border").addClass('d-none');
  $("#returnAppButton").get(0).disabled = false;
}
