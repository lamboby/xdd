angular.module('itrustoor.controllers', [])

.controller('DashCtrl', function ($scope, $state, $filter, $ionicActionSheet, Dash, Utils) {
    $scope.current = { date: null };
    $scope.items = [];
    $scope.refresh = function () {
        Dash.all($scope.current.date, function (data, status) {
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
            else
                Utils.error(data, status, "获取信息失败");
            $scope.$broadcast('scroll.refreshComplete');
        });
    };
    $scope.show = function () {
        var today = $filter('date')(Utils.getDate(0), 'yyyy-MM-dd');
        var yesterday = $filter('date')(Utils.getDate(1), 'yyyy-MM-dd');
        var beforeYesterday = $filter('date')(Utils.getDate(2), 'yyyy-MM-dd');

        $ionicActionSheet.show({
            buttons: [
              { text: '今天[' + today + ']' },
              { text: '昨天[' + yesterday + ']' },
              { text: '前天[' + beforeYesterday + ']' }
            ],
            titleText: '历史',
            cancelText: '取消',
            buttonClicked: function (index) {
                $scope.current.date = Utils.getDate(0);
                if (index == 1)
                    $scope.current.date = Utils.getDate(1);
                else if (index == 2)
                    $scope.current.date = Utils.getDate(2);
                $scope.refresh($scope.current.date);
                return true;
            }
        });
    };

    $scope.refresh(null);
})

.controller('SigninCtrl', function ($scope, $state, Utils) {
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
            Utils.signin($scope.user, function (data, status) {
                if (status == 0)
                    $state.go("select-family");
                else if (status == 1003)
                    Utils.alert("账号不存在");
                else if (status == 1004)
                    Utils.alert("密码错误");
                else if (status == 1015)
                    Utils.alert("账号未认证");
                else
                    Utils.error(data, status, "登录失败");
            });
        }
    }
})

.controller('AboutCtrl', function ($scope, $cordovaAppVersion, Utils) {
    $cordovaAppVersion.getAppVersion().then(function (version) {
        $scope.version = version;
    });
    $scope.checkVersion = function () {
        Utils.alert("当前已是最新版本");
    };
})

.controller('SelectFamilyCtrl', function ($scope, $state, Family, Utils) {
    $scope.current = { familyId: "" };
    Family.all(function (data, status) {
        if (status == 0) {
            if (data.Data && data.Data.length > 0) {
                $scope.familys = data.Data;
                if ($scope.familys && $scope.familys.length > 0)
                    $scope.current.familyId = $scope.familys[0].fml_id;
            }
            else {
                Family.create({ fml_name: "我的家庭" }, function (data, status) {
                    if (status == 0) {
                        $scope.familys = [{ fml_id: data.Data[0].id, fml_name: "我的家庭" }];
                        $scope.current.familyId = data.Data[0].id;
                    }
                    else
                        Utils.error(data, status, "初始化家庭失败");
                });
            }
        }
        else
            Utils.error(data, status, "获取家庭列表失败");
    });

    $scope.selected = function () {
        Family.isPrimary($scope.current.familyId, function (data, status) {
            if (status == 0) {
                itru_familyId($scope.current.familyId);
                itru_isPrimary(data.Data[0].primary);
                $state.go("tab.dash");
            }
            else
                Utils.error(data, status, "选择家庭失败");
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
            Utils.signout();
        });
    };
})

.controller('StudentCtrl', function ($scope, $state, Student, Utils) {
    $scope.isPrimary = itru_isPrimary();
    Student.all(function (data, status) {
        if (status == 0)
            $scope.students = data.Data;
        else
            Utils.error(data, status, "获取学生列表失败");
    });

    $scope.del = function (student) {
        Utils.confirm("确定要删除学生吗?", function (res) {
            if (res) {
                Student.del(student, function (data, status) {
                    if (status != 0)
                        Utils.error(data, status, "删除学生失败");
                });
            }
        });
    };
})

.controller('CreateStudentCtrl', function ($scope, $state, $ionicModal, Student, School, Utils) {
    $scope.schools = [];
    $scope.grades = [];
    $scope.classes = [];
    $scope.supportDatePicker = itru_supportDatePicker();

    $scope.current = {
        query: "",
        birthdayStr: ""
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
        School.all($scope.current.query, function (data, status) {
            if (status == 0) {
                $scope.schools = data.Data;
                if ($scope.schools.length > 0)
                    $scope.student.sch_id = $scope.schools[0].id;
            }
            else
                Utils.error(data, status, "查找学校失败");
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
            else
                Utils.error(data, status, "获取年级列表失败");
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
        else if (itru_supportDatePicker() && !$scope.student.birthday)
            Utils.alert("请输入生日");
        else if (!itru_supportDatePicker() && !Utils.checkDate($scope.current.birthdayStr))
            Utils.alert("生日的格式不正确");
        else {
            if (!itru_supportDatePicker())
                $scope.student.birthday = new Date($scope.current.birthdayStr);
            Student.create($scope.student, function (data, status) {
                if (status == 0)
                    $state.go("tab.student");
                else
                    Utils.error(data, status, "添加学生失败");
            });
        }
    };
})

.controller('EditStudentCtrl', function ($scope, $state, $ionicModal, $stateParams, $filter, Student, School, Utils) {
    $scope.current = {
        query: "",
        birthdayStr: ""
    };

    $scope.schools = [];
    $scope.grades = [];
    $scope.classes = [];
    $scope.supportDatePicker = itru_supportDatePicker();
    $scope.student = Student.get($stateParams.studentId);
    $scope.student.birthday = new Date($scope.student.birthday);
    $scope.current.birthdayStr = $filter('date')($scope.student.birthday, 'yyyy-MM-dd');

    School.allGrades($scope.student.sch_id, function (data, status) {
        if (status == 0) {
            $scope.grades = data.Data[0].grade;
            if ($scope.grades && $scope.grades.length > 0) {
                for (i = 0 ; i < $scope.grades.length; i++) {
                    if ($scope.grades[i].grade_id == $scope.student.grade_id) {
                        $scope.classes = $scope.grades[i].class;
                        break;
                    }
                }
            }
        }
        else
            Utils.error(data, status, "获取年级列表失败");
    });

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
        School.all($scope.current.query, function (data, status) {
            if (status == 0) {
                $scope.schools = data.Data;
                if ($scope.schools.length > 0)
                    $scope.student.sch_id = $scope.schools[0].id;
            }
            else
                Utils.error(data, status, "查找学校失败");
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
            else
                Utils.error(data, status, "获取年级列表失败");
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
        else if (itru_supportDatePicker() && !$scope.student.birthday)
            Utils.alert("请输入生日");
        else if (!itru_supportDatePicker() && !Utils.checkDate($scope.current.birthdayStr))
            Utils.alert("生日的格式不正确");
        else {
            if (!itru_supportDatePicker())
                $scope.student.birthday = new Date($scope.current.birthdayStr);
            Student.update($scope.student, function (data, status) {
                if (status == 0)
                    $state.go("tab.student");
                else
                    Utils.error(data, status, "修改学生失败");
            });
        }
    };
})

.controller('FamilyCtrl', function ($scope, $state, Family, Utils) {
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
                Family.isPrimary(family.fml_id, function (data, status) {
                    if (status == 0) {
                        itru_familyId(family.fml_id);
                        itru_isPrimary(data.Data[0].primary);
                        $state.go("tab.setting");
                    }
                    else
                        Utils.error(data, status, "切换家庭失败");
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
            Family.create($scope.family, function (data, status) {
                if (status == 0)
                    $state.go("tab.family");
                else
                    Utils.error(data, status, "添加家庭失败");
            });
        }
    };
})

.controller('EditFamilyCtrl', function ($scope, $state, $stateParams, Family, Utils) {
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
            Utils.error(data, status, "获取家庭信息失败");
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
            Family.update($scope.family, function (data, status) {
                if (status == 0)
                    $state.go("tab.family");
                else
                    Utils.error(data, status, "修改家庭失败");
            });
        }
    };
})

.controller('ParentCtrl', function ($scope, Parent, Utils) {
    $scope.isPrimary = itru_isPrimary();
    Parent.all(function (data, status) {
        if (status == 0)
            $scope.parents = data.Data;
        else
            Utils.error(data, status, "获取家长列表失败");
    });

    $scope.del = function (parent) {
        Utils.confirm("确定要删除家长吗?", function (res) {
            if (res) {
                if (parent.is_primary) {
                    Utils.alert("不允许删除主家长");
                    return;
                }
                Parent.del(parent, function (data, status) {
                    if (status != 0)
                        Utils.error(data, status, "删除家长失败");
                });
            }
        });
    };
})

.controller('CreateParentCtrl', function ($scope, $state, Parent, Utils) {
    $scope.supportDatePicker = itru_supportDatePicker();
    $scope.current = { birthdayStr: "" };

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
        else if (itru_supportDatePicker() && !$scope.parent.birthday)
            Utils.alert("请输入生日");
        else if (!itru_supportDatePicker() && !Utils.checkDate($scope.current.birthdayStr))
            Utils.alert("生日的格式不正确");
        else {
            if (!itru_supportDatePicker())
                $scope.parent.birthday = new Date($scope.current.birthdayStr);
            Parent.create($scope.parent, function (data, status) {
                if (status == 0)
                    $state.go("tab.parent");
                else
                    Utils.error(data, status, "添加副家长失败");
            });
        }
    };
})

.controller('CardCtrl', function ($scope, $state, Card, Utils) {
    $scope.isPrimary = itru_isPrimary();
    Card.all(function (data, status) {
        if (status == 0)
            $scope.cards = data.Data;
        else
            Utils.error(data, status, "获取卡列表失败");
    });

    $scope.changeStatus = function (card) {
        var statusStr = card.enabled == 0 ? "启用" : "禁用";
        Utils.confirm("确定要" + statusStr + "卡吗?", function (res) {
            if (res) {
                Card.updateStatus(card, function (data, status) {
                    if (status != 0)
                        Utils.error(data, status, statusStr + "卡失败");
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

        School.all($scope.current.query, function (data, status) {
            if (status == 0) {
                $scope.schools = data.Data;
                if ($scope.schools.length > 0)
                    $scope.card.sch_id = $scope.schools[0].id;
            }
            else
                Utils.error(data, status, "查找学校失败");
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
        else if (/[^0-9a-zA-Z]/g.test($scope.card.card))
            Utils.alert("卡号只能包含英文或数字");
        else if ($scope.card.card.length > 32)
            Utils.alert("卡号不能超过32个字符");
        else if (!$scope.card.sch_id)
            Utils.alert("请选择学校");
        else {
            Card.create($scope.card, function (data, status) {
                if (status == 0)
                    $state.go("tab.card");
                else
                    Utils.error(data, status, "添加卡失败");
            });
        }
    };
})

.controller('CardUserCtrl', function ($scope, $state, $stateParams, Card, Parent, Student, Utils) {
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
                else
                    Utils.error(data, status, "获取学生信息失败");
            });
        }
        else
            Utils.error(data, status, "获取家长信息失败");
    });

    $scope.save = function () {
        if (!$scope.card.studentId)
            Utils.alert("请选择使用者");
        else if (!$scope.card.parentId)
            Utils.alert("请选择携带者");
        else {
            Utils.confirm("确定要更改此卡的用户关联吗?", function (res) {
                if (res) {
                    var params = { stu_id: $scope.card.studentId, user_id: $scope.card.parentId, card: $stateParams.card, sch_id: $scope.card.sch_id };
                    Card.updateCardUser(params, function (data, status) {
                        if (status == 0)
                            $state.go("tab.card");
                        else
                            Utils.error(data, status, "修改用户关联失败");
                    });
                }
            });
        }
    };
})

.controller('CardPushCtrl', function ($scope, $state, $stateParams, Card, Parent, Utils) {
    $scope.relations = [];
    $scope.card = Card.get($stateParams.card);
    $scope.isPrimary = itru_isPrimary();

    Parent.all(function (data, status) {
        if (status == 0) {
            $scope.parents = data.Data;
            Card.getCardPush($stateParams.card, function (data, status) {
                if (status == 0) {
                    for (i = 0; i < $scope.parents.length; i++) {
                        var parent = $scope.parents[i];
                        if (!itru_isPrimary() && parent.user_id != itru_userId())
                            continue;

                        var item = { parentId: parent.user_id, parentName: parent.username, checked: false, oldValue: false };
                        if (data.Data && data.Data.length > 0) {
                            for (j = 0; j < data.Data.length; j++) {
                                if (parent.user_id == data.Data[j].id) {
                                    item.checked = true;
                                    item.oldValue = true;
                                    break;
                                }
                            }
                        }
                        $scope.relations.push(item);
                    }
                }
                else
                    Utils.error(data, status, "获取推送关系失败");
            });
        }
        else
            Utils.error(data, status, "获取家长信息失败");
    });

    $scope.save = function () {
        if (itru_isPrimary()) {
            var users = [];
            for (i = 0; i < $scope.relations.length; i++) {
                var item = $scope.relations[i];
                if (item.checked)
                    users.push({ id: item.parentId, type: 1 });
            }
            Card.updateCardPush($stateParams.card, $scope.card.sch_id, users, function (data, status) {
                if (status == 0)
                    $state.go("tab.card");
                else
                    Utils.error(data, status, "修改推送关系失败");
            });
        }
        else {
            var item = $scope.relations[0];
            var params = { id: itru_userId(), fml_id: itru_familyId(), sch_id: $scope.card.sch_id, card: $stateParams.card, type: 1 };

            if (!item.oldValue && item.checked) {
                Card.createCardPush(params, function (data, status) {
                    if (status == 0)
                        $state.go("tab.card");
                    else
                        Utils.error(data, status, "修改推送关系失败");
                });
            }
            else if (item.oldValue && !item.checked) {
                Card.deleteCardPush(params, function (data, status) {
                    if (status == 0)
                        $state.go("tab.card");
                    else
                        Utils.error(data, status, "修改推送关系失败");
                });
            }
            else
                $state.go("tab.card");
        }
    };

    $scope.checkAll = function () {
        for (i = 0; i < $scope.relations.length; i++)
            $scope.relations[i].checked = true;
    };
})

.controller('ProfileCtrl', function ($scope, $state, $filter, Profile, Utils) {
    $scope.supportDatePicker = itru_supportDatePicker();
    $scope.current = { birthdayStr: "" };

    Profile.get(function (data, status) {
        if (status == 0) {
            $scope.profile = data.Data[0];
            $scope.profile.birthday = new Date($scope.profile.birthday);
            $scope.current.birthdayStr = $filter('date')($scope.profile.birthday, 'yyyy-MM-dd');
        }
        else
            Utils.error(data, status, "获取个人信息失败");
    });

    $scope.save = function () {
        if (!$scope.profile.realname)
            Utils.alert("请输入姓名");
        else if ($scope.profile.realname.length > 20)
            Utils.alert("姓名不能超过20个字符");
        else if (itru_supportDatePicker() && !$scope.profile.birthday)
            Utils.alert("请输入生日");
        else if (!itru_supportDatePicker() && !Utils.checkDate($scope.current.birthdayStr))
            Utils.alert("生日的格式不正确");
        else {
            if (!itru_supportDatePicker())
                $scope.profile.birthday = new Date($scope.current.birthdayStr);
            Profile.update($scope.profile, function (data, status) {
                if (status == 0)
                    $state.go("tab.setting");
                else
                    Utils.error(data, status, "修改个人信息失败");
            });
        }
    };
})

.controller('PhotoCtrl', function ($scope, $state, Parent, Student, Utils) {
    Parent.all(function (data, status) {
        if (status == 0) {
            $scope.parents = data.Data;
            Student.all(function (data, status) {
                if (status == 0)
                    $scope.students = data.Data;
                else
                    Utils.error(data, status, "获取学生信息失败");
            });
        }
        else
            Utils.error(data, status, "获取家长信息失败");
    });
})

.controller('TakePhotoCtrl', function ($scope, $state, $stateParams, $cordovaCamera, $cordovaImagePicker, Parent, Student, Utils) {
    $scope.user = {
        userId: $stateParams.userId,
        type: $stateParams.userType,
        userName: "",
        picture: ""
    };

    if ($stateParams.userType == 0) {
        var student = Student.get($stateParams.userId);
        $scope.user.userName = student.stu_name;
        $scope.user.picture = student.picture;
    }
    else {
        var parent = Parent.get($stateParams.userId);
        $scope.user.userName = parent.username;
        $scope.user.picture = parent.picture;
    }

    $scope.openCamera = function (type) {
        $cordovaCamera.cleanup().then();
        var options = {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: type == 0 ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.PHOTOLIBRARY,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            //targetWidth: 600,
            //targetHeight: 600,
            popoverOptions: CameraPopoverOptions,
            correctOrientation: true,
            saveToPhotoAlbum: false
        };
        $cordovaCamera.getPicture(options).then(function (imageData) {
            $scope.user.picture = imageData;
        }, function (err) {
            if (err != "Camera cancelled." && err != "Selection cancelled.")
                Utils.alert(err);
        });
    };


    //$scope.openLocalStore = function () {
    //    var options = {
    //        maximumImagesCount: 1,
    //        width: 600,
    //        height: 600,
    //        quality: 50
    //    };

    //    $cordovaImagePicker.getPictures(options)
    //    .then(function (results) {
    //        $scope.user.picture = results[0];
    //    }, function (error) {
    //        //Utils.alert(error);
    //    });
    //};

    $scope.save = function () {

    };
})

.controller('SendmsgCtrl', function ($scope, $state, $cordovaSms, UserService, Utils) {
    $scope.icloudphone = UserService.geticloudphone();
    $scope.phone = UserService.getregphone();
    $scope.password = UserService.getregpassword();

    $scope.sendmessage = function () {
        try {
            var options = {
                replaceLineBreaks: false, // true to replace \n by a new line, false by default
                android: { intent: '' }
            };
            $cordovaSms.send($scope.icloudphone, $scope.password, options)
            .then(function () {
                $state.go("regvalid");
            },
            function (error) {
                Utils.alert("短信发送失败,可手动发送密码至上面的手机号,或联系客服.");
            });
        }
        catch (exception) {
            Utils.alert(exception);
        }
    }
})

.controller('RegisterCtrl', function ($scope, $state, Reg, UserService, Utils) {
    var bolgetphone = false;
    var openid = 1;
    $scope.register = {
        phone: '',
        password: ''
    };

    $scope.gologin = function () {
        $state.go("signin");
    }

    $scope.regsubmit = function () {
        //获取手机号
        Reg.getphone(function (data, status) {
            try {
                if (status == 0) {
                    var index = Math.floor(Math.random() * data.Data.length);
                    if (index == data.Data.length)
                        index = index - 1;
                    $scope.icloudphone = data.Data[index].phone;

                    //获取手机号后发送注册信息,包括用户名,OPENID
                    UserService.seticloudphone($scope.icloudphone);
                    temp_icloudphone = $scope.icloudphone;

                    if (!$scope.register.phone)
                        Utils.alert("手机号错误");
                    else if (!$scope.register.password)
                        Utils.alert("请输入密码");
                    else {
                        UserService.setregphone($scope.register.phone);
                        UserService.setregpassword($scope.register.password);
                        Reg.addreg($scope.register, openid, function (data, status) {
                            if (status == 1901 || status == 0)
                                $state.go("regsendmsg");
                            else if (status = 1009)
                                Utils.alert("无效手机号");
                            else if (status == 1100)
                                Utils.alert("数据库执行错误");
                            else
                                Utils.error(data, status, "注册失败");
                        })
                    }
                }
                else
                    Utils.error(data, status, "获取短信验证通道错误");
            }
            catch (exception) {
                Utils.alert(exception);
            }
        });
    }
});