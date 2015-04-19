angular.module('itrustoor.controllers', [])

.controller('DashCtrl', function ($scope, $window, Auth, Utils) {
    if (!itru_isLogin) {
        if (!itru_loginToken())
            $window.location.hash = "#/signin";
        else {
            Auth.getAccessToken(function (data, status) {
                if (status != 0) {
                    Utils.alert("验证身份信息失败，请重新登录");
                    $window.location.hash = "#/signin";
                }
            });
        }
    }
})

.controller('SigninCtrl', function ($scope, $window, Auth, Utils) {
    $scope.user = {
        phone: '18627228035',
        password: '1234567890'
    };

    $scope.signin = function () {
        if (!$scope.user.phone)
            Utils.alert("请输入手机号");
        else if (!$scope.user.password)
            Utils.alert("请输入密码");
        else {
            Utils.loading('登录中...');
            Auth.login($scope.user, function (data, status) {
                if (status == 0) {
                    //$window.history.back();
                    $window.location.hash = "#/select-family";
                    return;
                }

                var msg = data ? data.Code + " " + data.Msg : status;
                Utils.alert("登录失败，错误码：" + msg);
            });
        }
    }
})

.controller('SelectFamilyCtrl', function ($scope, $window, Family, Utils) {
    Utils.loading('获取家庭列表中...');
    Family.getFamilySelectList(function (data, status) {
        if (status == 0) {
            $scope.familys = data.Data;
            if ($scope.familys && $scope.familys.length > 0)
                $scope.familyId = $scope.familys[0].fml_id;
        }
        else {
            var msg = data ? data.Code + " " + data.Msg : status;
            Utils.alert("获取家庭列表失败，错误码：" + msg);
        }
    });

    $scope.selected = function () {
        itru_familyId($scope.familyId);
        $window.history.go(-2);
    };
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

.controller('CreateStudentCtrl', function ($scope, $state, Student, Utils) {
    $scope.student = {
        stu_name: "",
        gender: 0,
        birthday: ""
    };

    $scope.save = function () {
        if (!$scope.student.stu_name)
            Utils.alert("请输入姓名");
        else {
            var student = {
                stu_id: 5,
                stu_name: $scope.student.stu_name,
                gender: $scope.student.gender,
                birthday: $scope.student.birthday,
                sch_id: 1,
                sch_name: '北京第一小学',
                picture: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
            };
            Student.put(student);
            $state.go("tab.student");
        }
    };
});
