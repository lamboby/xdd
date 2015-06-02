angular.module('itrustoor.controllers', [])

.controller('DashCtrl', function ($scope, $state, $filter,$ionicActionSheet, $ionicScrollDelegate, Dash, Utils) {
    if (!itru_isDbInit())
        $state.go("signin");
	if (itru_isTest())
		itru_serviceUrl = "http://test.itrustoor.com:8080/api/";
	$scope.first = true;
    $scope.current = { date: null };
    $scope.items = [];

    $scope.refresh = function () {
        if (!$scope.current.date)
            $scope.current.date = new Date();
        Dash.all($scope.current.date, function (data, status) {
            if (status == 0) {
                var items = [];
                if (data && data.length > 0) {
                    for (i = 0; i < data.length; i++) {
                        var item = data.item(i);
                        item.display_time = $filter('date')(new Date(item.att_time), 'HH:mm');
                        items.push(item);
                    }

                    items.sort(function (a, b) {
                        var aTime = parseInt(a.display_time.replace(':', ''));
                        var bTime = parseInt(b.display_time.replace(':', ''));
                        return aTime > bTime ? 1 : -1;
                    });

                    for (i = 0; i <= 23; i++) {
                        var time = (i >= 10 ? "" + i : "0" + i) + ":00";
                        for (j = 0; j < items.length; j++) {
                            if (items[j].display_time.substr(0, 2) + ":00" == time) {
                                items.splice(j, 0, { display_time: time, display_type: 0 });
                                break;
                            }
                        }
                    }
                }
                $scope.items = items;
            }
            else
                Utils.error(data, status, "获取信息失败");

            if (!$scope.first && $scope.items && $scope.items.length > 0)
                $ionicScrollDelegate.scrollBottom(true);
            else
                $ionicScrollDelegate.scrollTop(true);

            $scope.first = false;
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
                var date = Utils.getDate(0);
                if (index == 1)
                    date = Utils.getDate(1);
                else if (index == 2)
                    date = Utils.getDate(2);

                if (!$scope.current.date || $filter('date')($scope.current.date, 'yyyy-MM-dd') != $filter('date')(date, 'yyyy-MM-dd')) {
                    $scope.current.date = date;
                    $scope.first = true;
                    $scope.refresh();
                    return true;
                }
                return true;
            }
        });
    };
    $scope.refresh();
})

.controller('SigninCtrl', function ($scope, $state, Utils, Reg) {
    if (itru_reload) {
        itru_reload = false;
        location.hash = "#signin";
        location.reload();
    }

    $scope.user = {
        phone: '',
        password: ''
    };
	if (itru_isTest()) $scope.pattern = "[内测模式]";
    $scope.telchange = function () {
        if ($scope.user.phone == "0.01") {
            $scope.pattern = "[内测模式]";
			itru_isTest(true) ;
            $scope.user.phone = "";
            Utils.alert("秘密被你发现了,欢迎进入内测模式.");
        }
    }
    $scope.signin = function () {
        if (itru_isTest())
            itru_serviceUrl = "http://test.itrustoor.com:8080/api/";
        else
            itru_serviceUrl = "http://svr.itrustoor.com:8080/api/";

        if (!$scope.user.phone)
            Utils.alert("请输入手机号");
        else if (!$scope.user.password)
            Utils.alert("请输入密码");
        else {
            Utils.signin($scope.user, function (data, status) {
                if (status == 0) {
                    Reg.updateopenid($scope.user, itru_openId, function (data, status) {
                        if (status != 0)
                            Utils.alert("更新OpenID错误");
                    });
                    $scope.pattern = "";
                    $state.go("select-family");
                }
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

.controller('AboutCtrl', function ($scope, $cordovaAppVersion, UserService, Utils, $cordovaAppVersion, $ionicPopup) {
    $cordovaAppVersion.getAppVersion().then(function (version) {
        $scope.version = version;
    });
    $scope.checkVersion = function () {
        //Utils.alert("当前已是最新版本");
        UserService.checkUpdate(function (data, status) {
            if (status == 0) {
                if (data.Data) {
                    $cordovaAppVersion.getAppVersion().then(function (version) {
                        var serverAppVersion = data.Data[0].new_ver;
                        if (version != serverAppVersion) {
                            var confirmPopup = $ionicPopup.confirm({
                                title: '检测到更新:V'+data.Data[0].app_new_ver,
                                template: data.Data[0].content,
                                cancelText: '以后再说',
                                okText: '开始更新'
                            });
                            confirmPopup.then(function (res) {
                                if (res) UserService.updateApp(data.Data[0].path);
                            })
                        }
                        else {
                            Utils.alert("当前已是最新版本");
                        }
                    });
                }
                else {
                    Utils.alert("当前已是最新版本");
                }
            }
            else
                Utils.alert("无法检测最新版本信息.");
        });
    }
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
    $scope.isPrimary = itru_isPrimary();
    $scope.userId = itru_userId();
    $scope.userName = itru_userName;
    $scope.picture = itru_userPicture;

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
    //$scope.supportDatePicker = itru_supportDatePicker();
    $scope.gohelp = function () {
        $state.go("tab.helpaddstu");
    }
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
        else if ($scope.current.birthdayStr && !Utils.checkDate($scope.current.birthdayStr))
            Utils.alert("生日的格式不正确");
        else {
            if ($scope.current.birthdayStr)
                $scope.student.birthday = new Date($scope.current.birthdayStr);
            else
                $scope.student.birthday = "";
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
    //$scope.supportDatePicker = itru_supportDatePicker();
    $scope.student = Student.get($stateParams.studentId);
    if ($scope.student.birthday) {
        $scope.student.birthday = new Date($scope.student.birthday);
        $scope.current.birthdayStr = $filter('date')($scope.student.birthday, 'yyyy-MM-dd');
    }

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
        else if ($scope.current.birthdayStr && !Utils.checkDate($scope.current.birthdayStr))
            Utils.alert("生日的格式不正确");
        else {
            if ($scope.current.birthdayStr)
                $scope.student.birthday = new Date($scope.current.birthdayStr);
            else
                $scope.student.birthday = "";
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
    $scope.currentFamilyId = itru_familyId();
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
    //$scope.supportDatePicker = itru_supportDatePicker();
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
        else if ($scope.current.birthdayStr && !Utils.checkDate($scope.current.birthdayStr))
            Utils.alert("生日的格式不正确");
        else {
            if ($scope.current.birthdayStr)
                $scope.parent.birthday = new Date($scope.current.birthdayStr);
            else
                $scope.parent.birthday = "";
            Parent.create($scope.parent, function (data, status) {
                if (status == 0)
                    $state.go("tab.parent");
                else
                    Utils.error(data, status, "添加副家长失败");
            });
        }
    };
})

.controller('EditParentCtrl', function ($scope, $state, $filter, $stateParams, Parent, Utils) {
    // $scope.supportDatePicker = itru_supportDatePicker();
    $scope.current = { birthdayStr: "" };

    Parent.getProfile($stateParams.parentId, function (data, status) {
        if (status == 0) {
            $scope.parent = data.Data[0];
            if ($scope.parent.birthday) {
                $scope.parent.birthday = new Date($scope.parent.birthday);
                $scope.current.birthdayStr = $filter('date')($scope.parent.birthday, 'yyyy-MM-dd');
            }
        }
        else
            Utils.error(data, status, "获取家长失败");
    });

    $scope.save = function () {
        if (!$scope.parent.realname)
            Utils.alert("请输入姓名");
        else if ($scope.parent.realname.length > 20)
            Utils.alert("姓名不能超过20个字符");
        else if ($scope.current.birthdayStr && !Utils.checkDate($scope.current.birthdayStr))
            Utils.alert("生日的格式不正确");
        else {
            if ($scope.current.birthdayStr)
                $scope.parent.birthday = new Date($scope.current.birthdayStr);
            else
                $scope.parent.birthday = "";
            Parent.update($scope.parent, function (data, status) {
                if (status == 0)
                    $state.go("tab.parent");
                else
                    Utils.error(data, status, "修改家长失败");
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

.controller('PhotoCtrl', function ($scope, $state, Parent, Student, Utils) {
    Parent.all(function (data, status) {
        if (status == 0) {
            if (itru_isPrimary())
                $scope.parents = data.Data;
            else if (data.Data && data.Data.length > 0) {
                for (i = 0; i < data.Data.length; i++) {
                    if (data.Data[i].user_id == itru_userId()) {
                        $scope.parents = [data.Data[i]];
                        break;
                    }
                }
            }

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

.controller('TakePhotoCtrl', function ($scope, $state, $stateParams, $cordovaCamera, $cordovaFileTransfer, Parent, Student, Oss, Utils) {
    $scope.current = {
        photo_path: "",
        progress: "上 传",
        showProgress: false
    };

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
        //$cordovaCamera.cleanup().then(function (msg) { Utils.alert("success:" + msg); }, function (msg) { Utils.alert("error:" + msg); });
        var options = {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: type == 0 ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.PHOTOLIBRARY,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
            correctOrientation: true,
            saveToPhotoAlbum: false
        };
        $cordovaCamera.getPicture(options).then(function (imageData) {
            if (type != 0)
                $scope.user.picture = "";
            $scope.user.picture = imageData;
            $scope.current.photo_path = imageData;
        }, function (err) {
            if (err != "Camera cancelled." && err != "Selection cancelled.")
                Utils.alert(err);
        });
    };

    $scope.save = function () {
        if (!$scope.current.photo_path) {
            Utils.alert("请选择照片");
            return;
        }

        $scope.current.progress = "预处理中……";
        $scope.current.showProgress = true;

        Oss.get(function (data, status) {
            if (status == 0) {
                var POLICY_JSON = {
                    "expiration": "2099-12-01T12:00:00.000Z",
                    "conditions": [
                        ["starts-with", "$key", ""],
                        { "bucket": itru_ossBucket },
                        ["starts-with", "$Content-Type", ""],
                        ["content-length-range", 0, 524288000]
                    ]
                };

                var policyBase64 = Base64.encode(JSON.stringify(POLICY_JSON));
                var signature = b64_hmac_sha1(itru_ossSecret, policyBase64);
                var url = "http://" + itru_ossBucket + ".oss-cn-" + itru_ossChannel + ".aliyuncs.com";
                var fileName = itru_userId() + "-" + new Date().getTime();

                var options = new FileUploadOptions();
                options.fileKey = "file";
                options.fileName = fileName;
                options.mineType = "image/jpeg";
                options.params = {
                    "key": fileName,
                    "Content-Type": "image/jpeg",
                    "OSSAccessKeyId": itru_ossKey,
                    "policy": policyBase64,
                    "signature": signature
                };

                Utils.loading();
                $scope.current.progress = "正在上传 0%";

                $cordovaFileTransfer.upload(url, $scope.current.photo_path, options)
                 .then(function (result) {
                     $scope.current.progress = "后期处理中……";
                     var photoUrl = "http://" + itru_ossDomain + "/" + fileName + "@" + itru_ossStyle;
                     var executer = $stateParams.userType == 0 ? Student : Parent;
                     executer.updatePicture($scope.user.userId, photoUrl, function (data, status) {
                         $scope.current.progress = "上 传";
                         if (status == 0) {
                             itru_userPicture = photoUrl;
                             $scope.user.picture = photoUrl;
                             $scope.current.showProgress = false;
                             Utils.alert("上传成功");
                         }
                         else {
                             $scope.current.showProgress = false;
                             Utils.error(data, status, "更新照片信息失败");
                         }
                     });
                 }, function (error) {
                     $scope.current.progress = "上 传";
                     $scope.current.showProgress = false;
                     Utils.hideLoading();
                     var msg = "上传失败!</br>" +
                          "code:" + error.code + "</br>" +
                          "status:" + error.http_status;
                     Utils.alert(msg);
                 }, function (progress) {
                     $scope.current.progress = "正在上传 " + (progress.loaded / progress.total).toFixed(2) * 100.00 + "%";
                 });
            }
            else {
                $scope.current.progress = "上 传";
                Utils.error(data, status, "获取OSS信息失败");
            }
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
})

.controller('RingtoneCtrl', function ($scope, $state, Ringtone, Parent, Utils) {
    $scope.current = { path: itru_ringtone() };
    $scope.items = itru_ringtones;

    $scope.select = function (path) {
        $scope.current.path = path;
        Ringtone.play($scope.current.path);
    };
    $scope.save = function () {
        itru_ringtone($scope.current.path);
        Ringtone.stop($scope.current.path);
        $state.go("tab.setting");
    };
})

.controller('BugCtrl', function ($scope, $state, Bug, Utils) {
    $scope.bug = {
        user_id: itru_userId(),
        fml_id: itru_familyId(),
        title: "",
        desc: ""
    };

    $scope.save = function () {
        if (!$scope.bug.title)
            Utils.alert("请输入标题");
        else if (!$scope.bug.desc)
            Utils.alert("请输入问题描述");
        else {
            Bug.create($scope.bug, function (data, status) {
                if (status == 0) {
                    Utils.alert("提交成功，感谢您的反馈");
                    $state.go("tab.setting");
                }
                else
                    Utils.err(data, status, "提交问题失败");
            });
        }
    };
})

.controller('SendmsgCtrl', function ($scope, $state, $cordovaSms, $ionicLoading, UserService, Utils) {
    $scope.icloudphone = UserService.geticloudphone();
    $scope.phone = UserService.getregphone();
    $scope.password = UserService.getregpassword();

    $scope.sendmessage = function () {
        try {
            var options = {
                replaceLineBreaks: false, // true to replace \n by a new line, false by default
                android: { intent: '' }
            };
            $ionicLoading.show({
                template: "短信发送中..."
            });
            $cordovaSms.send($scope.icloudphone, $scope.password, options)
            .then(function () {
                $ionicLoading.hide();
                $state.go("regvalid");
            },
            function (error) {
                $ionicLoading.hide();
                Utils.alert("短信发送失败,可手动发送密码至上面的手机号,或联系客服.");
            });
        }
        catch (exception) {
            $ionicLoading.hide();
            Utils.alert(exception);
        }
    }
})

.controller('RegisterCtrl', function ($scope, $state, Reg, UserService, Utils) {

    var bolgetphone = false;

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
                        Reg.addreg($scope.register, itru_openId, function (data, status) {
                            if (status == 1901 || status == 0)
                                $state.go("regsendmsg");
                            else if (status == 1009)
                                Utils.alert("无效手机号/OpenID");
                            else if (status == 1006) {
                                Utils.alert("手机号已存在,继续将重新设置密码");
                                $state.go("regsendmsg");
                            }
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
})

.controller('ChangepwdCtrl', function ($scope, $state, Reg, UserService, Utils) {

    var bolgetphone = false;
    var openid = 1;
    $scope.register = {
        phone: '',
        password: ''
    };

    $scope.gologin = function () {
        $state.go("signin");
    }

    $scope.changepwdsubmit = function () {
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
                        Reg.addreg($scope.register, itru_openId, function (data, status) {
                            if (status == 1006)
                                $state.go("regsendmsg");
                            else if (status == 1009)
                                Utils.alert("无效手机号/Openid");
                            else if (status == 1901 || status == 0) {
                                Utils.alert("手机号不存在,将为您新建用户");
                                $state.go("regsendmsg");
                            }
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
})

.controller('HelpaddstrCtrl', function ($scope, $state) {
    $scope.gocreatestudent = function () {
		$state.go("tab.create-student");
    }
});