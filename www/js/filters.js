angular.module('itrustoor.filters', [])

.filter('gender', function () {
    return function (input) {
        return input === 0 ? '男' : '女';
    };
})

.filter('avatar', function () {
    return function (src) {
        return src ? src : "img/avatar.png";
    };
})

.filter('kind', function () {
    return function (src) {
        if (src == 0)
            return "铜卡";
        else if (src == 1)
            return "蜗牛卡";
        else if (src == 2)
            return "银卡";
        else
            return "未知";
    };
})

.filter('status', function () {
    return function (src) {
        if (src == 0)
            return "禁用";
        else
            return "启用";
    };
})

.filter('use', function () {
    return function (src) {
        if (src == 0)
            return "未使用";
        else
            return "已使用";
    };
});
