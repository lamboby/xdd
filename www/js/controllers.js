angular.module('itrustoor.controllers', [])

.controller('DashCtrl', function ($scope) { })

.controller('NewsCtrl', function ($scope, News) {
    $scope.news = News.all();
    $scope.remove = function (item) {
        News.remove(item);
    };
})

.controller('NewsDetailCtrl', function ($scope, $stateParams, News) {
    $scope.new = News.get($stateParams);
})

.controller('SettingCtrl', function ($scope) {

})

.controller('StudentCtrl', function ($scope, Student) {
    $scope.students = Student.all();
})

.controller('LoginCtrl', function ($scope) {
    $scope.phone = "";
    $scope.password = "";
    $scope.remark = "";

    $scope.login = function () {
        $scope.remark = "sdfwefwe";
    };
});
