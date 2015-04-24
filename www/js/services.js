angular.module('itrustoor.services', [])

.factory('News', function () {
    var news = [{
        id: 0,
        title: '系统升级',
        time: '2015-09-08 10:00:55',
        content: '系统于明日凌晨 01:00升级，所有服务将暂停'
    }, {
        id: 1,
        title: '新版本',
        time: '2015-09-08 10:00:55',
        content: '小叮当APP发布新版本啦，赶紧升级吧'
    }, {
        id: 2,
        title: '故障通知',
        time: '2015-09-08 10:00:55',
        content: '系统于今日 12:00发生故障，现已修复，不便之处请见谅'
    }];

    return {
        all: function () {
            return news;
        },
        remove: function (item) {
            news.splice(news.indexOf(item), 1);
        },
        get: function (newsId) {
            for (var i = 0; i < news.length; i++) {
                if (news[i].id === parseInt(newsId)) {
                    return news[i];
                }
            }
            return null;
        },
        put: function (item) {
            news.push(item);
        }
    };
})

.factory("Student", function (Utils) {
    var students = [];

    return {
        all: function (callback) {
            var params = { token: itru_accessToken, fml_id: itru_familyId() };
            var url = Utils.buildUrl("families/getAllStudents", params);
            Utils.exec(url, params, callback, function (data) {
                students = data.Data;
            });
        },
        del: function (student, callback) {
            var params = { token: itru_accessToken, fml_id: itru_familyId(), stu_id: student.stu_id, sch_id: student.sch_id };
            var url = Utils.buildUrl("students/delete", params);
            Utils.exec(url, params, callback, function (data) {
                students.splice(students.indexOf(student), 1);
            });
        },
        get: function (studentId) {
            for (var i = 0; i < students.length; i++) {
                if (students[i].stu_id === parseInt(studentId)) {
                    return students[i];
                }
            }
            return null;
        },
        put: function (student) {
            students.push(student);
        }
    };
})

.factory("School", function (Utils) {
    var schools = [];

    return {
        all: function (name, callback) {
            var params = { token: itru_accessToken, key: name };
            var url = Utils.buildUrl("families/loginList", params);
            Utils.exec(url, params, callback, function (data) {
                familys = data.Data;
            });
        }
    };
})

.factory("Family", function (Utils) {
    var familys = [];

    return {
        all: function (callback) {
            var params = { token: itru_accessToken, id: itru_userId() };
            var url = Utils.buildUrl("families/loginList", params);
            Utils.exec(url, params, callback, function (data) {
                familys = data.Data;
            });
        },
        get: function (familyId) {
            for (var i = 0; i < familys.length; i++) {
                if (familys[i].fml_id == parseInt(familyId)) {
                    return familys[i];
                }
            }
        },
        create: function (family, callback) {
            var params = { token: itru_accessToken, id: itru_userId(), name: family.fml_name };
            var url = Utils.buildUrl("families/create", params);
            Utils.exec(url, params, callback, function (data) {
                family.fml_id = data.Data[0].id;
                familys.push(family);
            });
        },
        update: function (family, callback) {
            var params = { token: itru_accessToken, id: family.fml_id, name: family.fml_name };
            var url = Utils.buildUrl("families/update", params);
            Utils.exec(url, params, callback, function (data) {
                for (var i = 0; i < familys.length; i++) {
                    if (familys[i].fml_id == family.fml_id) {
                        familys[i].fml_name = family.fml_name;
                        break;
                    }
                }
            });
        },
        isPrimary: function (familyId, callback) {
            var params = { token: itru_accessToken, fml_id: familyId, user_id: itru_userId() };
            var url = Utils.buildUrl("users/isPrimary", params);
            Utils.exec(url, params, callback);
        }
    }
})

.factory("Parent", function (Utils) {
    var parents = [];

    return {
        all: function (callback) {
            var params = { token: itru_accessToken, fml_id: itru_familyId() };
            var url = Utils.buildUrl("families/getAllUsers", params);
            Utils.exec(url, params, callback, function (data) {
                parents = data.Data;
            });
        },
        create: function (parent, callback) {
            var params = angular.copy(parent);
            params.token = itru_accessToken;
            var url = Utils.buildUrl("users/createViceParents", params);
            Utils.exec(url, params, callback, function (data) {
                parent.user_id = data.Data[0].user_id;
                parents.push(parent);
            });
        },
        del: function (parent, callback) {
            var params = { token: itru_accessToken, fml_id: itru_familyId(), pri_id: itru_userId(), user_id: parent.user_id };
            var url = Utils.buildUrl("users/deleteViceParents", params);
            Utils.exec(url, params, callback, function (data) {
                parents.splice(parents.indexOf(parent), 1);
            });
        }
    }
})

.factory("Auth", function ($http, $q, $state, Utils) {
    return {
        login: function (user, callback) {
            var phone = Utils.encrypt(user.phone);
            var pwd = Utils.encrypt(user.password);
            var params = { username: phone, password: pwd };
            var url = Utils.buildUrl("users/tickets", params);

            Utils.exec(url, params, callback, function (data) {
                itru_isLogin = true;
                itru_userId(data.Data[0].user_id);
                itru_loginToken(data.Data[0].token);
            });
        },
        refreshAccessToken: function () {
            if (!itru_isLogin && !itru_loginToken()) {
                $state.go("signin");
                return -1;
            }
            else {
                if (itru_lastGetTokenTime) {
                    var nowTicks = Date.parse(new Date());
                    var lastGetTicks = Date.parse(itru_lastGetTokenTime);
                    if ((nowTicks - lastGetTicks) / 1000 < 7080)
                        return 0;
                }

                var deferred = $q.defer();
                var url = Utils.buildUrl("users/accessToken", { token: itru_loginToken() });
                $http.jsonp(url).success(function (data) {
                    deferred.resolve(data);
                }).error(function (statusText) {
                    deferred.reject(statusText);
                });
                return deferred.promise;
            }
        }
    }
})

.factory("Utils", function ($http, $ionicPopup, $ionicLoading) {
    return {
        alert: function (msg) {
            $ionicPopup.alert({
                title: '<strong>提示</strong>',
                template: msg,
                okText: '确定'
            });
        },
        confirm: function (msg, callback) {
            var confirmPopup = $ionicPopup.confirm({
                title: '<strong>提示</strong>',
                template: msg,
                okText: '确定',
                cancelText: '取消'
            });
            confirmPopup.then(function (res) {
                if (callback)
                    callback(res);
            });
        },
        loading: function () {
            $ionicLoading.show({ templateUrl: 'loading.html' });
        },
        hideLoading: function () {
            $ionicLoading.hide();
        },
        encrypt: function (src) {
            var keyHex = CryptoJS.enc.Utf8.parse(itru_encryptKey);
            var encrypted = CryptoJS.DES.encrypt(src, keyHex, {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.ZeroPadding
            });
            return encrypted.toString();
        },
        buildUrl: function (path, params) {
            var url = itru_serviceUrl + path + "?callback=JSON_CALLBACK";
            for (var item in params)
                url += "&" + item + "=" + encodeURIComponent(params[item]);
            return url;
        },
        exec: function (url, params, callback, code0_callback) {
            $http.jsonp(url).success(function (data) {
                if (data.Code == 0 && code0_callback)
                    code0_callback(data);
                if (callback)
                    callback(data, data.Code);
            }).error(function (data, statusText) {
                if (callback)
                    callback(data, statusText);
            }).finally(function () {
                $ionicLoading.hide();
            });
        }
    }
});
