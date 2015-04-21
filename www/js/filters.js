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
});
