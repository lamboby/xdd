angular.module('itrustoor.filters', []).filter('gender', function () {
    return function (input) {
        return input === 0 ? '男' : '女';
    };
});
