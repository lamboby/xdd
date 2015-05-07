angular.module('itrustoor.controllers', [])

.controller('DashCtrl', function ($scope, $state, $filter, Dash, Auth, Utils) {
    $scope.items = [];
    $scope.refresh = function (date) {
        Dash.all('2015-05-01', function (data, status) {
            if (status == 0) {
                $scope.items.length = 0;
                if (data.length > 0) {
                    for (i = 0; i < data.length; i++) {
                        var item = data.item(i);
                        item.display_time = $filter('date')(new Date(item.att_time), 'HH:mm');
                        $scope.items.push(item);
                    }

                    $scope.items.sort(function (a, b) {
                        var aTime = parseInt(a.display_time.replace(':', ''));
                        var bTime = parseInt(b.display_time.replace(':', ''));
                        return aTime > bTime ? 1 : -1;
                    });

                    for (i = 0; i <= 23; i++) {
                        var time = (i >= 10 ? "" + i : "0" + i) + ":00";
                        for (j = 0; j < $scope.items.length; j++) {
                            if ($scope.items[j].display_time.substr(0, 2) + ":00" == time) {
                                $scope.items.splice(j, 0, { display_time: time, display_type: 0 });
                                break;
                            }
                        }
                    }
                }
            }
            else {
                var msg = data ? data.Code + " " + data.Msg : status;
                Utils.alert("获取信息失败，错误码：" + msg);
            }

            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    var res = Auth.refreshAccessToken();
    if (res === -1) {
        Utils.hideLoading();
        $state.go("signin");
    }
    else if (res != 0) {
        try {
            res.then(function (data) {
                Utils.hideLoading();
                if (data.Code != 'undefined') {
                    if (data.Code == 0) {
                        itru_isLogin = true;
                        itru_accessToken = data.Data[0].access_token;
                        itru_lastGetTokenTime = new Date();
                        $scope.refresh(null);
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
        finally {
            Utils.hideLoading();
        }
    }
    else {
        $scope.refresh(null);
        Utils.hideLoading();
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

.controller('AboutCtrl', function ($scope, Utils) {
    $scope.version = itru_version;

    $scope.checkVersion = function () {
        Utils.alert("当前已是最新版本");
    };
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

.controller('SettingCtrl', function ($scope, $state, Utils) {
    $scope.signout = function () {
        Utils.confirm("确定要注销?", function (res) {
            if (!res)
                return;
            itru_isLogin = false;
            itru_accessToken = "";
            itru_lastGetTokenTime = null;
            itru_isPrimary = false;
            itru_loginToken(-1);
            itru_familyId(-1);
            itru_userId(-1);
            $state.go("signin");
        });
    };
})

.controller('StudentCtrl', function ($scope, $state, Student, Utils) {
    Utils.loading();
    $scope.isPrimary = itru_isPrimary;
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

.controller('CreateStudentCtrl', function ($scope, $state, $ionicModal, Student, School, Utils) {
    $scope.schools = [];
    $scope.grades = [];
    $scope.classes = [];

    $scope.current = {
        query: ""
    };
    $scope.student = {
        stu_name: "",
        gender: 0,
        birthday: "",
        picture: "",
        sid: "",
        sch_id: "",
        sch_name: "",
        grade_id: "",
        grade_name: "",
        class_id: "",
        class_name: ""
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
        if ($scope.student.sch_id) {
            for (var i = 0; i < $scope.schools.length; i++) {
                if ($scope.schools[i].id == $scope.student.sch_id) {
                    $scope.student.sch_name = $scope.schools[i].name;
                    break;
                }
            }
        }
        else {
            Utils.alert("请选择学校");
            return;
        }

        Utils.loading();
        School.allGrades($scope.student.sch_id, function (data, status) {
            if (status == 0) {
                var gSelected = false;
                var cSelected = false;
                $scope.grades = data.Data[0].grade;
                if ($scope.grades && $scope.grades.length > 0) {
                    $scope.student.grade_id = $scope.grades[0].grade_id;
                    $scope.student.grade_name = $scope.grades[0].name;
                    gSelected = true;
                    if ($scope.grades[0].class && $scope.grades[0].class.length > 0) {
                        $scope.classes = $scope.grades[0].class;
                        if ($scope.classes && $scope.classes.length > 0) {
                            $scope.student.class_id = $scope.classes[0].class_id;
                            $scope.student.class_name = $scope.classes[0].name;
                            cSelected = true;
                        }
                    }
                }

                if (!gSelected) {
                    $scope.student.grade_id = "";
                    $scope.student.grade_name = "";
                }

                if (!cSelected) {
                    $scope.student.class_id = "";
                    $scope.student.class_name = "";
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
        var cSelected = false;
        for (var i = 0; i <= $scope.grades.length; i++) {
            if ($scope.grades[i].grade_id == $scope.student.grade_id) {
                $scope.classes = $scope.grades[i].class;
                $scope.student.grade_name = $scope.grades[i].name;
                if ($scope.classes && $scope.classes.length > 0) {
                    $scope.student.class_id = $scope.classes[0].class_id;
                    $scope.student.class_name = $scope.classes[0].name;
                    cSelected = true;
                }
                break;
            }
        }

        if (!cSelected) {
            $scope.student.class_id = "";
            $scope.student.class_name = "";
        }
    };

    $scope.selectClass = function () {
        var selected = false;
        for (var i = 0; i <= $scope.classes.length; i++) {
            if ($scope.classes[i].class_id == $scope.student.class_id) {
                $scope.student.class_name = $scope.classes[i].name;
                selected = true;
                break;
            }
        }

        if (!selected) {
            $scope.student.class_id = "";
            $scope.student.class_name = "";
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

.controller('EditStudentCtrl', function ($scope, $state, $ionicModal, $stateParams, $filter, Student, School, Utils) {
    $scope.schools = [];
    $scope.grades = [];
    $scope.classes = [];
    $scope.student = Student.get($stateParams.studentId);
    $scope.student.birthday = new Date($scope.student.birthday);
    $scope.grades.push({ grade_id: $scope.student.grade_id, name: $scope.student.grade_name });
    $scope.classes.push({ class_id: $scope.student.class_id, name: $scope.student.class_name });
    $scope.current = {
        query: ""
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
        if ($scope.student.sch_id) {
            for (var i = 0; i < $scope.schools.length; i++) {
                if ($scope.schools[i].id == $scope.student.sch_id) {
                    $scope.student.sch_name = $scope.schools[i].name;
                    break;
                }
            }
        }
        else {
            Utils.alert("请选择学校");
            return;
        }

        Utils.loading();
        School.allGrades($scope.student.sch_id, function (data, status) {
            if (status == 0) {
                var gSelected = false;
                var cSelected = false;
                $scope.grades = data.Data[0].grade;
                if ($scope.grades && $scope.grades.length > 0) {
                    $scope.student.grade_id = $scope.grades[0].grade_id;
                    $scope.student.grade_name = $scope.grades[0].name;
                    gSelected = true;
                    if ($scope.grades[0].class && $scope.grades[0].class.length > 0) {
                        $scope.classes = $scope.grades[0].class;
                        if ($scope.classes && $scope.classes.length > 0) {
                            $scope.student.class_id = $scope.classes[0].class_id;
                            $scope.student.class_name = $scope.classes[0].name;
                            cSelected = true;
                        }
                    }
                }

                if (!gSelected) {
                    $scope.student.grade_id = "";
                    $scope.student.grade_name = "";
                }

                if (!cSelected) {
                    $scope.student.class_id = "";
                    $scope.student.class_name = "";
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
        var cSelected = false;
        for (var i = 0; i <= $scope.grades.length; i++) {
            if ($scope.grades[i].grade_id == $scope.student.grade_id) {
                $scope.classes = $scope.grades[i].class;
                $scope.student.grade_name = $scope.grades[i].name;
                if ($scope.classes && $scope.classes.length > 0) {
                    $scope.student.class_id = $scope.classes[0].class_id;
                    $scope.student.class_name = $scope.classes[0].name;
                    cSelected = true;
                }
                break;
            }
        }

        if (!cSelected) {
            $scope.student.class_id = "";
            $scope.student.class_name = "";
        }
    };

    $scope.selectClass = function () {
        var selected = false;
        for (var i = 0; i <= $scope.classes.length; i++) {
            if ($scope.classes[i].class_id == $scope.student.class_id) {
                $scope.student.class_name = $scope.classes[i].name;
                selected = true;
                break;
            }
        }

        if (!selected) {
            $scope.student.class_id = "";
            $scope.student.class_name = "";
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
            Utils.loading();
            Student.update($scope.student, function (data, status) {
                if (status == 0)
                    $state.go("tab.student");
                else {
                    var msg = data ? data.Code + " " + data.Msg : status;
                    Utils.alert("修改学生失败，错误码：" + msg);
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
                $scope.family = Family.get($stateParams.familyId);
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

.controller('CreateParentCtrl', function ($scope, $state, Parent, Utils) {
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
        else if (!$scope.parent.birthday)
            Utils.alert("请输入生日");
        else {
            Utils.loading();
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
})

.controller('CardCtrl', function ($scope, $state, Card, Utils) {
    Utils.loading();
    $scope.isPrimary = itru_isPrimary;
    Card.all(function (data, status) {
        if (status == 0)
            $scope.cards = data.Data;
        else {
            var msg = data ? data.Code + " " + data.Msg : status;
            Utils.alert("获取卡列表失败，错误码：" + msg);
        }
    });

    $scope.changeStatus = function (card) {
        var statusStr = card.enabled == 0 ? "启用" : "禁用";
        Utils.confirm("确定要" + statusStr + "卡吗?", function (res) {
            if (res) {
                Utils.loading();
                Card.updateStatus(card, function (data, status) {
                    if (status != 0) {
                        var msg = data ? data.Code + " " + data.Msg : status;
                        Utils.alert(statusStr + "卡失败，错误码：" + msg);
                    }
                });
            }
        });
    };
})

.controller('CreateCardCtrl', function ($scope, $state, $ionicModal, Card, School, Utils) {
    $scope.schools = [];
    $scope.kinds = [{ id: 0, name: "铜卡" }, { id: 1, name: "蜗牛卡" }, { id: 2, name: "银卡" }];
    $scope.current = {
        query: "",
        sch_name: ""
    };

    $scope.card = {
        card: "",
        kind: 0,
        enabled: 1,
        sch_id: "",
        fml_id: itru_familyId()
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
                    $scope.card.sch_id = $scope.schools[0].id;
            }
            else {
                var msg = data ? data.Code + " " + data.Msg : status;
                Utils.alert("查找学校失败，错误码：" + msg);
            }
        });
    };

    $scope.selectSchool = function () {
        if ($scope.card.sch_id) {
            for (var i = 0; i < $scope.schools.length; i++) {
                if ($scope.schools[i].id == $scope.card.sch_id) {
                    $scope.current.sch_name = $scope.schools[i].name;
                    $scope.current.query = "";
                    $scope.schools = [];
                    $scope.hideModal();
                    break;
                }
            }
        }
        else {
            Utils.alert("请选择学校");
            return;
        }
    };

    $scope.save = function () {
        if (!$scope.card.card)
            Utils.alert("请输入卡号");
        else if ($scope.card.card.length > 32)
            Utils.alert("卡号不能超过32个字符");
        else if (!$scope.card.sch_id)
            Utils.alert("请选择学校");
        else {
            Utils.loading();
            Card.create($scope.card, function (data, status) {
                if (status == 0)
                    $state.go("tab.card");
                else {
                    var msg = data ? data.Code + " " + data.Msg : status;
                    Utils.alert("添加卡失败，错误码：" + msg);
                }
            });
        }
    };
})

.controller('CardUserCtrl', function ($scope, $state, $stateParams, Card, Parent, Student, Utils) {
    Utils.loading();
    Parent.all(function (data, status) {
        if (status == 0) {
            $scope.parents = data.Data;
            Student.all(function (data, status) {
                if (status == 0) {
                    $scope.students = data.Data;
                    $scope.card = Card.get($stateParams.card);

                    if ($scope.card.bind && $scope.card.bind.length > 0)
                        $scope.card.studentId = $scope.card.bind[0].id;
                    if ($scope.card.carry && $scope.card.carry.length > 0)
                        $scope.card.parentId = $scope.card.carry[0].id;
                }
                else {
                    var msg = data ? data.Code + " " + data.Msg : status;
                    Utils.alert("获取学生信息失败，错误码：" + msg);
                }
            });
        }
        else {
            var msg = data ? data.Code + " " + data.Msg : status;
            Utils.alert("获取家长信息失败，错误码：" + msg);
        }
    });

    $scope.save = function () {
        if (!$scope.card.studentId)
            Utils.alert("请选择使用者");
        else if (!$scope.card.parentId)
            Utils.alert("请选择携带者");
        else {
            Utils.confirm("确定要更改此卡的用户关联吗?", function (res) {
                if (res) {
                    var params = { stu_id: $scope.card.studentId, user_id: $scope.card.parentId, card: $stateParams.card, sch_id: "" };
                    for (i = 0; i < $scope.students.length; i++) {
                        if ($scope.students[i].stu_id == params.stu_id) {
                            params.sch_id = $scope.students[i].sch_id;
                            break;
                        }
                    }

                    Utils.loading();
                    Card.updateCardUser(params, function (data, status) {
                        if (status == 0)
                            $state.go("tab.card");
                        else {
                            var msg = data ? data.Code + " " + data.Msg : status;
                            Utils.alert("修改用户关联失败，错误码：" + msg);
                        }
                    });
                }
            });
        }
    };
})

.controller('CardPushCtrl', function ($scope, $state, $stateParams, Card, Parent, Utils) {
    Utils.loading();
    $scope.relations = [];
    $scope.card = Card.get($stateParams.card);
    Parent.all(function (data, status) {
        if (status == 0) {
            $scope.parents = data.Data;
            Card.getCardPush($stateParams.card, function (data, status) {
                if (status == 0) {
                    for (i = 0; i < $scope.parents.length; i++) {
                        var parent = $scope.parents[i];
                        var item = { parentId: parent.user_id, parentName: parent.username, checked: false };
                        if (data.Data && data.Data.length > 0) {
                            for (j = 0; j < data.Data.length; j++) {
                                if (parent.user_id == data.Data[j].id) {
                                    item.checked = true;
                                    break;
                                }
                            }
                        }
                        $scope.relations.push(item);
                    }
                }
                else {
                    var msg = data ? data.Code + " " + data.Msg : status;
                    Utils.alert("获取推送关系失败，错误码：" + msg);
                }
            });
        }
        else {
            var msg = data ? data.Code + " " + data.Msg : status;
            Utils.alert("获取家长信息失败，错误码：" + msg);
        }
    });

    $scope.save = function () {
        var users = [];
        for (i = 0; i < $scope.relations.length; i++) {
            var item = $scope.relations[i];
            if (item.checked)
                users.push({ id: item.parentId, type: 1 });
        }

        Utils.loading();
        Card.updateCardPush($stateParams.card, $scope.card.sch_id, users, function (data, status) {
            if (status == 0)
                $state.go("tab.card");
            else {
                var msg = data ? data.Code + " " + data.Msg : status;
                Utils.alert("修改推送关系失败，错误码：" + msg);
            }
        });
    };

    $scope.checkAll = function () {
        for (i = 0; i < $scope.relations.length; i++)
            $scope.relations[i].checked = true;
    };
});