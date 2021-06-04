function _prompt(message, style, time) {
    style = (style === undefined) ? 'alert-success' : style;
    time = (time === undefined) ? 1200 : time;
    $('<div>')
        .appendTo('body')
        .addClass('alert ' + style)
        .html(message)
        .show()
        .delay(time)
        .fadeOut()
        .bind("contextmenu", function (e) {
            return false;
        });
}

// 成功提示
function success_prompt(message, time) {
    _prompt(message, 'alert-success', time);
}

// 失败提示
function fail_prompt(message, time) {
    _prompt(message, 'alert-danger', time);
}

// 提醒
function warning_prompt(message, time) {
    _prompt(message, 'alert-warning', time);
}

// 信息提示
function info_prompt(message, time) {
    _prompt(message, 'alert-info', time);
}
