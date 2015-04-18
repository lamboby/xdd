﻿angular.module('itrustoor.controllers', [])

.controller('DashCtrl', function ($scope) {

})

.controller('NewsCtrl', function ($scope, News) {
    $scope.news = News.all();
    $scope.remove = function (item) {
        News.remove(item);
    };
    $scope.doRefresh = function () {
        var item = {
            id: 4,
            title: '测试数据',
            time: '2015-09-08 10:00:55',
            content: '测试测试测试测试测试测试测试测试测试测试'
        };
        News.put(item);
        $scope.$broadcast('scroll.refreshComplete');
    }
})

.controller('NewsDetailCtrl', function ($scope, $stateParams, News) {
    $scope.new = News.get($stateParams.newId);
})

.controller('SettingCtrl', function ($scope) {

})

.controller('StudentCtrl', function ($scope, $ionicPopup, Student) {
    $scope.students = Student.all();

    $scope.remove = function (student) {
        var confirmPopup = $ionicPopup.confirm({
            title: '提示',
            template: '确定要删除学生吗?'
        });
        confirmPopup.then(function (res) {
            if (res) {
                Student.remove(student);
            }
        });
    };
})

.controller('CreateStudentCtrl', function ($scope, Student) {
    $scope.student = {
        stu_name: "",
        gender: "",
        birthday: ""
    };

    $scope.save = function (data) {
        var student = {
            stu_id: 5,
            stu_name: data.stu_name,
            gender: data.gender,
            birthday: data.birthday,
            sch_id: 1,
            sch_name: 'First Middle School',
            picture: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
        };
        Student.put(student);
        window.history.back();
    };
})

.controller('LoginCtrl', function ($scope) {
    $scope.phone = "";
    $scope.password = "";
    $scope.remark = "";

    $scope.login = function () {
        $scope.remark = "sdfwefwe";
    };
});
