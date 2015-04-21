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

.factory("Student", function () {
    var students = [{
        stu_id: 1,
        stu_name: 'Ben Sparrow',
        gender: 0,
        birthday: '2014-8-9',
        sch_id: 1,
        sch_name: '中心一小',
        picture: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
    }, {
        stu_id: 1,
        stu_name: 'Mike',
        gender: 1,
        birthday: '2014-8-10',
        sch_id: 1,
        sch_name: '中心小学',
        picture: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
    }, {
        stu_id: 1,
        stu_name: 'Eva',
        gender: 0,
        birthday: '2014-8-9',
        sch_id: 1,
        sch_name: '广州市第三小学',
        picture: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
    }];

    return {
        all: function () {
            return students;
        },
        remove: function (student) {
            students.splice(students.indexOf(student), 1);
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

.factory("Family", function ($http, Auth, Utils) {
    var familys = [];

    return {
        all: function (callback) {
            Auth.refreshAccessToken();
            var params = { token: itru_accessToken, id: itru_userId() };
            var url = Utils.buildUrl("families/loginList", params);
            $http.jsonp(url).success(function (data) {
                if (data.Code == 0)
                    familys = data.Data;
                callback(data, data.Code);
            }).error(function (data, statusText) {
                callback(data, statusText);
            }).finally(function () {
                Utils.hideLoading();
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
            Auth.refreshAccessToken();
            var params = { token: itru_accessToken, id: itru_userId(), name: family.fml_name };
            var url = Utils.buildUrl("families/create", params);

            $http.jsonp(url).success(function (data) {
                if (data.Code == 0) {
                    family.fml_id = data.Data[0].id;
                    familys.push(family);
                }
                callback(data, data.Code);
            }).error(function (data, statusText) {
                callback(data, statusText);
            }).finally(function () {
                Utils.hideLoading();
            });
        },
        update: function (family, callback) {
            Auth.refreshAccessToken();
            var params = { token: itru_accessToken, id: family.fml_id, name: family.fml_name };
            var url = Utils.buildUrl("families/update", params);

            $http.jsonp(url).success(function (data) {
                if (data.Code == 0) {
                    for (var i = 0; i < familys.length; i++) {
                        if (familys[i].fml_id == family.fml_id) {
                            familys[i].fml_name = family.fml_name;
                            break;
                        }
                    }
                }

                callback(data, data.Code);
            }).error(function (data, statusText) {
                callback(data, statusText);
            }).finally(function () {
                Utils.hideLoading();
            });
        },
        isPrimary: function (familyId, callback) {
            Auth.refreshAccessToken();
            var params = { token: itru_accessToken, fml_id: familyId, user_id: itru_userId() };
            var url = Utils.buildUrl("users/isPrimary", params);
            $http.jsonp(url).success(function (data) {
                callback(data, data.Code);
            }).error(function (data, statusText) {
                callback(data, statusText);
            }).finally(function () {
                Utils.hideLoading();
            });
        }
    }
})

.factory("Parent", function ($http, Auth, Utils) {
    var parents = [];

    return {
        all: function (callback) {
            Auth.refreshAccessToken();
            var params = { token: itru_accessToken, fml_id: itru_familyId() };
            var url = Utils.buildUrl("families/getAllUsers", params);
            $http.jsonp(url).success(function (data) {
                if (data.Code == 0)
                    parents = data.Data;
                callback(data, data.Code);
            }).error(function (data, statusText) {
                callback(data, statusText);
            }).finally(function () {
                Utils.hideLoading();
            });
        },
        create: function (parent, callback) {
            Auth.refreshAccessToken();
            var params = angular.copy(parent);
            params.token = itru_accessToken;
            var url = Utils.buildUrl("users/createViceParents", params);

            $http.jsonp(url).success(function (data) {
                if (data.Code == 0) {
                    parent.user_id = data.Data[0].user_id;
                    parents.push(parent);
                }
                callback(data, data.Code);
            }).error(function (data, statusText) {
                callback(data, statusText);
            }).finally(function () {
                Utils.hideLoading();
            });
        },
        del: function (parent, callback) {
            Auth.refreshAccessToken();
            var params = { token: itru_accessToken, fml_id: itru_familyId(), pri_id: itru_userId(), user_id: parent.user_id };
            var url = Utils.buildUrl("users/deleteViceParents", params);

            $http.jsonp(url).success(function (data) {
                if (data.Code == 0)
                    parents.splice(parents.indexOf(parent), 1);
                callback(data, data.Code);
            }).error(function (data, statusText) {
                callback(data, statusText);
            }).finally(function () {
                Utils.hideLoading();
            });
        }
    }
})

.factory("Auth", function ($http, $q, $state, Utils) {
    var accessToken = function () {
        if (itru_lastGetTokenTime) {
            var nowTicks = Date.parse(new Date());
            var lastGetTicks = Date.parse(itru_lastGetTokenTime);
            if ((nowTicks - lastGetTicks) / 1000 < 7080)
                return;
        }

        var deferred = $q.defer();
        var url = Utils.buildUrl("users/accessToken", { token: itru_loginToken() });
        var now = new Date();
        $http.jsonp(url).success(function (data) {
            deferred.resolve(data);
        }).error(function (statusText) {
            deferred.reject(statusText);
        });

        deferred.promise.then(function (data) {
            if (data.Code != 'undefined') {
                if (data.Code == 0) {
                    itru_isLogin = true;
                    itru_accessToken = data.Data[0].access_token;
                    itru_lastGetTokenTime = now;
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
    };

    return {
        login: function (user, callback) {
            var phone = Utils.encrypt(user.phone);
            var pwd = Utils.encrypt(user.password);
            var params = { username: phone, password: pwd };
            var url = Utils.buildUrl("users/tickets", params);

            $http.jsonp(url).success(function (data) {
                if (data.Code == 0) {
                    itru_isLogin = true;
                    itru_userId(data.Data[0].user_id);
                    itru_loginToken(data.Data[0].token);
                }
                accessToken();
                callback(data, data.Code);
            }).error(function (data, statusText) {
                Utils.hideLoading();
                callback(data, statusText);
            });
        },
        refreshAccessToken: accessToken
    }
})

.factory("Utils", function ($ionicPopup, $ionicLoading) {
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
        }
    }
});
