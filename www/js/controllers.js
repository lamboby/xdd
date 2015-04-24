angular.module('itrustoor.controllers', [])

.controller('DashCtrl', function ($scope, $state, Auth, Utils) {
    Utils.loading();
    var res = Auth.refreshAccessToken();
    if (res === -1) {
        Utils.hideLoading();
        $state.go("signin");
    }
    else if (res != 0) {
        res.then(function (data) {
            Utils.hideLoading();
            if (data.Code != 'undefined') {
                if (data.Code == 0) {
                    itru_isLogin = true;
                    itru_accessToken = data.Data[0].access_token;
                    itru_lastGetTokenTime = new Date();
                }
                else {
                    Utils.alert("令牌已失效，请重新登录");
                    itru_isLogin = false;
                    $state.go("signin");
                }
            }
            else
                Utils.alert("获取令牌失败，错误码：" + data)
        });
    }
    else
        Utils.hideLoading();
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
            Utils.loading();
            Auth.login($scope.user, function (data, status) {
                if (status == 0) {
                    $window.location.hash = "#/select-family";
                    return;
                }
                Utils.hideLoading();
                var msg = data ? data.Code + " " + data.Msg : status;
                Utils.alert("登录失败，错误码：" + msg);
            });
        }
    }
})

.controller('SelectFamilyCtrl', function ($scope, $state, Family, Utils) {
    Utils.loading();
    $scope.current = { familyId: "" };
    Family.all(function (data, status) {
        if (status == 0) {
            $scope.familys = data.Data;
            if ($scope.familys && $scope.familys.length > 0)
                $scope.current.familyId = $scope.familys[0].fml_id;
        }
        else {
            var msg = data ? data.Code + " " + data.Msg : status;
            Utils.alert("获取家庭列表失败，错误码：" + msg);
        }
    });

    $scope.selected = function () {
        Family.isPrimary($scope.current.familyId, function (data, status) {
            if (status == 0) {
                itru_familyId($scope.current.familyId);
                itru_isPrimary = data.Data[0].primary;
                $state.go("tab.dash");
            }
            else {
                var msg = data ? data.Code + " " + data.Msg : status;
                Utils.alert("选择家庭失败，错误码：" + msg);
            }
        });
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

.controller('StudentCtrl', function ($scope, Student, Utils) {
    Utils.loading();
    Student.all(function (data, status) {
        if (status == 0)
            $scope.students = data.Data;
        else {
            var msg = data ? data.Code + " " + data.Msg : status;
            Utils.alert("获取学生列表失败，错误码：" + msg);
        }
    });

    $scope.del = function (student) {
        Utils.confirm("确定要删除学生吗?", function (res) {
            if (res) {
                Student.del(student, function (data, status) {
                    if (status != 0) {
                        var msg = data ? data.Code + " " + data.Msg : status;
                        Utils.alert("删除学生失败，错误码：" + msg);
                    }
                });
            }
        });
    };
})

.controller('CreateStudentCtrl', function ($scope, $state, $ionicModal, $filter, Student, School, Utils) {
    $scope.schools = [];
    $scope.grades = [];
    $scope.classes = [];

    $scope.current = {
        query: "",
        schoolName: "",
    };
    $scope.student = {
        stu_name: "",
        gender: 0,
        birthday: "",
        picture: "",
        sid: "",
        sch_id: "",
        grade_id: "",
        class_id: ""
    };

    $ionicModal.fromTemplateUrl('school-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });

    $scope.showModal = function () {
        $scope.modal.show();
    };

    $scope.hideModal = function () {
        $scope.modal.hide();
    };

    $scope.querySchool = function () {
        if (!$scope.current.query) {
            Utils.alert("请输入学校名称");
            return;
        }

        Utils.loading();
        School.all($scope.current.query, function (data, status) {
            if (status == 0) {
                $scope.schools = data.Data;
                if ($scope.schools.length > 0)
                    $scope.student.sch_id = $scope.schools[0].id;
            }
            else {
                var msg = data ? data.Code + " " + data.Msg : status;
                Utils.alert("查找学校失败，错误码：" + msg);
            }
        });
    };

    $scope.selectSchool = function () {
        $scope.current.schoolName = "";
        if ($scope.student.sch_id) {
            for (var i = 0; i < $scope.schools.length; i++) {
                if ($scope.schools[i].id == $scope.student.sch_id) {
                    $scope.current.schoolName = $scope.schools[i].name;
                    break;
                }
            }
        }

        Utils.loading();
        School.allGrades($scope.student.sch_id, function (data, status) {
            if (status == 0) {
                $scope.grades = data.Data[0].grade;
                if ($scope.grades && $scope.grades.length > 0) {
                    $scope.student.grade_id = $scope.grades[0].grade_id;
                    if ($scope.grades[0].class && $scope.grades[0].class.length > 0)
                        $scope.classes = $scope.grades[0].class;
                }

                $scope.current.query = "";
                $scope.schools = [];
                $scope.hideModal();
            }
            else {
                var msg = data ? data.Code + " " + data.Msg : status;
                Utils.alert("获取年级列表失败，错误码：" + msg);
            }
        });
    };

    $scope.selectGrade = function () {
        for (var i = 0; i <= $scope.grades.length; i++) {
            if ($scope.grades[i].grade_id == $scope.student.grade_id) {
                $scope.classes = $scope.grades[i].class;
                break;
            }
        }
    };

    $scope.save = function () {
        if (!$scope.student.stu_name)
            Utils.alert("请输入姓名");
        else if ($scope.student.stu_name.length > 20)
            Utils.alert("姓名不能超过20个字符");
        else if (!$scope.student.sch_id)
            Utils.alert("请选择学校");
        else if (!$scope.student.grade_id)
            Utils.alert("请选择年级");
        else if (!$scope.student.class_id)
            Utils.alert("请选择班级");
        else if (!$scope.student.birthday)
            Utils.alert("请输入生日");
        else {
            $scope.student.birthday = $filter("date")($scope.student.birthday, "yyyy-MM-dd");
            Utils.loading();
            Student.create($scope.student, function (data, status) {
                if (status == 0)
                    $state.go("tab.student");
                else {
                    var msg = data ? data.Code + " " + data.Msg : status;
                    Utils.alert("添加学生失败，错误码：" + msg);
                }
            });
        }
    };
})

.controller('FamilyCtrl', function ($scope, $state, Family, Utils) {
    Utils.loading();
    Family.all(function (data, status) {
        if (status == 0)
            $scope.familys = data.Data;
        else {
            var msg = data ? data.Code + " " + data.Msg : status;
            Utils.alert("获取家庭列表失败，错误码：" + msg);
        }
    });

    $scope.switch = function (family) {
        Utils.confirm("确定要切换家庭吗?", function (res) {
            if (res) {
                Utils.loading();
                Family.isPrimary(family.fml_id, function (data, status) {
                    if (status == 0) {
                        itru_familyId(family.fml_id);
                        itru_isPrimary = data.Data[0].primary;
                        $state.go("tab.setting");
                    }
                    else {
                        var msg = data ? data.Code + " " + data.Msg : status;
                        Utils.alert("切换家庭失败，错误码：" + msg);
                    }
                });
            }
        });
    };
})

.controller('CreateFamilyCtrl', function ($scope, $state, Family, Utils) {
    $scope.family = { fml_name: "" };
    $scope.save = function () {
        if (!$scope.family.fml_name)
            Utils.alert("请输入家庭名称");
        else if ($scope.family.fml_name.length < 3)
            Utils.alert("家庭名称不能少于3个字符");
        else if ($scope.family.fml_name.length > 20)
            Utils.alert("家庭名称不能超过20个字符");
        else {
            Utils.loading();
            Family.create($scope.family, function (data, status) {
                if (status == 0)
                    $state.go("tab.family");
                else {
                    var msg = data ? data.Code + " " + data.Msg : status;
                    Utils.alert("添加家庭失败，错误码：" + msg);
                }
            });
        }
    };
})

.controller('EditFamilyCtrl', function ($scope, $state, $stateParams, Family, Utils) {
    Utils.loading();
    Family.isPrimary($stateParams.familyId, function (data, status) {
        if (status == 0) {
            $scope.isPrimary = data.Data[0].primary;
            if ($scope.isPrimary)
                $scope.family = angular.copy(Family.get($stateParams.familyId));
            else {
                Utils.alert("非主家长不能修改此家庭");
                $state.go("tab.family");
            }
        }
        else {
            var msg = data ? data.Code + " " + data.Msg : status;
            Utils.alert("获取家庭信息失败，错误码：" + msg);
            $state.go("tab.family");
        }
    });

    $scope.save = function () {
        if (!$scope.family.fml_name)
            Utils.alert("请输入家庭名称");
        else if ($scope.family.fml_name.length < 3)
            Utils.alert("家庭名称不能少于3个字符");
        else if ($scope.family.fml_name.length > 20)
            Utils.alert("家庭名称不能超过20个字符");
        else {
            Utils.loading();
            Family.update($scope.family, function (data, status) {
                if (status == 0)
                    $state.go("tab.family");
                else {
                    var msg = data ? data.Code + " " + data.Msg : status;
                    Utils.alert("修改家庭失败，错误码：" + msg);
                }
            });
        }
    };
})

.controller('ParentCtrl', function ($scope, Parent, Utils) {
    Utils.loading();
    $scope.isPrimary = itru_isPrimary;
    Parent.all(function (data, status) {
        if (status == 0)
            $scope.parents = data.Data;
        else {
            var msg = data ? data.Code + " " + data.Msg : status;
            Utils.alert("获取家长列表失败，错误码：" + msg);
        }
    });

    $scope.del = function (parent) {
        Utils.confirm("确定要删除家长吗?", function (res) {
            if (res) {
                if (parent.is_primary) {
                    Utils.alert("不允许删除主家长");
                    return;
                }
                Parent.del(parent, function (data, status) {
                    if (status != 0) {
                        var msg = data ? data.Code + " " + data.Msg : status;
                        Utils.alert("删除家长失败，错误码：" + msg);
                    }
                });
            }
        });
    };
})

.controller('CreateParentCtrl', function ($scope, $state, $filter, Parent, Utils) {
    $scope.parent = {
        username: "",
        gender: 0,
        birthday: "",
        phone: "",
        id_card: "",
        fml_id: itru_familyId()
    };
    $scope.save = function () {
        if (!$scope.parent.username)
            Utils.alert("请输入家长姓名");
        else if ($scope.parent.length > 20)
            Utils.alert("家长姓名不能超过20个字符");
        else if (!$scope.parent.phone)
            Utils.alert("请输入手机号");
        else {
            Utils.loading();
            if ($scope.parent.birthday)
                $scope.parent.birthday = $filter('date')($scope.parent.birthday, 'yyyy-MM-dd');
            Parent.create($scope.parent, function (data, status) {
                if (status == 0)
                    $state.go("tab.parent");
                else {
                    var msg = data ? data.Code + " " + data.Msg : status;
                    Utils.alert("添加副家长失败，错误码：" + msg);
                }
            });
        }
    };
});
