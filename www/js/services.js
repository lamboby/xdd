﻿angular.module('itrustoor.services', [])

.factory('Dash', function ($filter, Utils, DB) {
    return {
        all: function (date, callback) {
            if (date == null)
                date = new Date();
            date = $filter("date")(date, "yyyy-MM-dd");

            DB.query("select max(add_time) maxtime from attends", [], function (results) {
                var maxtime = "";
                for (i = 0; i < results.rows.length; i++) {
                    var row = results.rows.item(i);
                    if (row.maxtime != null) {
                        maxtime = row.maxtime
                        break;
                    }
                }

                maxtime = $filter('date')(maxtime, 'yyyy-MM-dd HH:mm:ss');
                var params = { user_id: itru_userId(), time: maxtime };
                Utils.exec("attends/list", params, function (data, status) {
                    if (status == 0) {
                        if (data.Data && data.Data.length > 0) {
                            DB.insert("attends", ["stu_id", "stu_name", "att_time", "sch_id", "sch_name",
                                "add_time", "type", "kind", "error", "entex_name", "entex_type"], data.Data, function () {
                                    DB.query("select 1 display_type,* from attends where strftime('%Y-%m-%d',att_time) = ?", [date], function (results) {
                                        callback(results.rows, status);
                                    });
                                });
                        }
                        else {
                            DB.query("select 1 display_type,* from attends where strftime('%Y-%m-%d',att_time) = ?", [date], function (results) {
                                callback(results.rows, status);
                            });
                        }
                    }
                    else
                        callback(data, status);
                });
            });
        }
    }
})

.factory('DB', function (Utils) {
    var errorFunc = function (err) {
        Utils.alert("操作数据失败，错误码：" + err.code + " " + err.message);
    };
    var getDb = function () {
        if (itru_db == null)
            itru_db = window.openDatabase(itru_dbName, itru_dbVersion, itru_dbName, itru_dbSize);
        return itru_db;
    };

    return {
        getDb: getDb,
        init: function () {
            var db = getDb();
            db.transaction(function (tx) {
                //tx.executeSql('drop table if exists attends');
                tx.executeSql('CREATE TABLE IF NOT EXISTS ATTENDS (stu_id,stu_name,att_time,sch_id,sch_name,add_time,type,kind,error,entex_name,entex_type)');
            }, errorFunc);
        },
        query: function (sql, params, callback) {
            var db = getDb();
            db.transaction(function (tx) {
                tx.executeSql(sql, params, function (tx, results) {
                    if (callback)
                        callback(results);
                });
            }, errorFunc);
        },
        insert: function (tab, fields, array, callback) {
            var sql = "insert into " + tab + " (";
            var fieldStr = "";
            var valueStr = "";
            for (i = 0; i < fields.length; i++) {
                fieldStr += fields[i] + ",";
                valueStr += "?,";
            }
            fieldStr = fieldStr.substr(0, fieldStr.length - 1);
            valueStr = valueStr.substr(0, valueStr.length - 1);
            sql += fieldStr + ") values (" + valueStr + ")";

            var db = getDb();
            db.transaction(function (tx) {
                for (i = 0 ; i < array.length; i++) {
                    var params = [];
                    for (j = 0; j < fields.length; j++)
                        params.push(array[i][fields[j]]);
                    tx.executeSql(sql, params);
                }
                if (callback)
                    callback();
            }, errorFunc);
        }
    }
})

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

.factory("Student", function ($filter, Utils) {
    var students = [];

    return {
        all: function (callback) {
            var params = { fml_id: itru_familyId() };
            Utils.exec("families/getAllStudents", params, callback, function (data) {
                if (data.Data)
                    students = data.Data;
                else
                    students.length = 0;
            });
        },
        del: function (student, callback) {
            var params = { fml_id: itru_familyId(), stu_id: student.stu_id, sch_id: student.sch_id };
            Utils.exec("students/delete", params, callback, function (data) {
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
        create: function (student, callback) {
            var params = angular.copy(student);
            params.name = student.stu_name;
            params.birthday = $filter("date")(params.birthday, 'yyyy-MM-dd');
            params.fml_id = itru_familyId();
            Utils.exec("students/create", params, callback);
        },
        update: function (student, callback) {
            var params = {
                id: student.stu_id,
                name: student.stu_name,
                gender: student.gender,
                picture: student.picture,
                birthday: $filter("date")(student.birthday, 'yyyy-MM-dd'),
                sch_id: student.sch_id,
                grade_id: student.grade_id,
                class_id: student.class_id,
                ssid: student.ssid,
                sid: student.stu_sid
            };
            Utils.exec("students/update", params, callback);
        }
    };
})

.factory("School", function (Utils) {
    var schools = [];

    return {
        all: function (name, callback) {
            var params = { key: name };
            Utils.exec("schools/searchSchools", params, callback, function (data) {
                schools = data.Data;
            });
        },
        allGrades: function (schoolId, callback) {
            var params = { id: schoolId };
            Utils.exec("schools/getGradeAndClass", params, callback);
        }
    };
})

.factory("Family", function (Utils) {
    var familys = [];

    return {
        all: function (callback) {
            var params = { id: itru_userId() };
            Utils.exec("families/loginList", params, callback, function (data) {
                if (data.Data)
                    familys = data.Data;
                else
                    familys.length = 0;
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
            var params = { id: itru_userId(), name: family.fml_name };
            Utils.exec("families/create", params, callback);
        },
        update: function (family, callback) {
            var params = { id: family.fml_id, name: family.fml_name };
            Utils.exec("families/update", params, callback);
        },
        isPrimary: function (familyId, callback) {
            var params = { fml_id: familyId, user_id: itru_userId() };
            Utils.exec("users/isPrimary", params, callback);
        }
    }
})

.factory("Parent", function ($filter, Utils) {
    var parents = [];

    return {
        all: function (callback) {
            var params = { fml_id: itru_familyId() };
            Utils.exec("families/getAllUsers", params, callback, function (data) {
                if (data.Data)
                    parents = data.Data;
                else
                    parents.length = 0;
            });
        },
        get: function (userId) {
            for (var i = 0; i < parents.length; i++) {
                if (parents[i].user_id == parseInt(userId)) {
                    return parents[i];
                }
            }
        },
        getProfile: function (userId, callback) {
            var params = { user_id: userId };
            Utils.exec("users/getUserById", params, callback);
        },
        update: function (parent, callback) {
            var params = angular.copy(parent);
            params.birthday = $filter("date")(params.birthday, "yyyy-MM-dd");
            Utils.exec("users/update", params, callback, function (data) {
                if (parent.user_id == itru_userId())
                    itru_userName = parent.realname;
            });
        },
        create: function (parent, callback) {
            var params = angular.copy(parent);
            params.birthday = $filter("date")(params.birthday, "yyyy-MM-dd");
            Utils.exec("users/createViceParents", params, callback);
        },
        del: function (parent, callback) {
            var params = { fml_id: itru_familyId(), pri_id: itru_userId(), user_id: parent.user_id };
            Utils.exec("users/deleteViceParents", params, callback, function (data) {
                parents.splice(parents.indexOf(parent), 1);
            });
        }
    }
})

.factory("Card", function (Utils) {
    var cards = [];

    return {
        all: function (callback) {
            var params = { fml_id: itru_familyId() };
            Utils.exec("cards/getCardsByFml", params, callback, function (data) {
                if (data.Data)
                    cards = data.Data;
                else
                    cards.length = 0;
            });
        },
        get: function (cardNo) {
            for (var i = 0; i < cards.length; i++) {
                if (cards[i].card == cardNo) {
                    return cards[i];
                }
            }
        },
        updateStatus: function (card, callback) {
            var newStatus = card.enabled == 0 ? 1 : 0;
            var params = { card: card.card, status: newStatus, fml_id: itru_familyId(), sch_id: card.sch_id };
            Utils.exec("cards/changeCardStatus", params, callback, function (data) {
                card.enabled = newStatus;
            });
        },
        create: function (card, callback) {
            var params = angular.copy(card);
            Utils.exec("cards/createCard", params, callback);
        },
        updateCardUser: function (params, callback) {
            params.fml_id = itru_familyId();
            Utils.exec("cards/bindCard", params, callback);
        },
        getCardPush: function (cardNo, callback) {
            var params = { card: cardNo };
            Utils.exec("cards/getInfoReceiverByCard", params, callback);
        },
        updateCardPush: function (cardNo, schoolId, users, callback) {
            var params = { fml_id: itru_familyId(), sch_id: schoolId, card: cardNo, users: users };
            Utils.exec("families/updateReceivers", params, callback);
        },
        createCardPush: function (params, callback) {
            Utils.exec("families/createReceivers", params, callback);
        },
        deleteCardPush: function (params, callback) {
            Utils.exec("families/deleteReceivers", params, callback);
        }
    }
})

.factory('UserService', function () {
    var temp_icloudphone;
    var temp_regphone;
    var temp_regpassword;
    return {
        geticloudphone: function () {
            return temp_icloudphone;
        },
        seticloudphone: function (user) {
            temp_icloudphone = user;
        },
        getregphone: function () {
            return temp_regphone;
        },
        setregphone: function (user) {
            temp_regphone = user;
        },
        getregpassword: function () {
            return temp_regpassword;
        },
        setregpassword: function (pwd) {
            temp_regpassword = pwd;
        }
    };
})

.factory("Reg", function ($http, $state, Utils) {
    var phones = [];

    return {
        getphone: function (callback) {
            var params = {};
            Utils.execWithoutToken("configs/getPhones", params, callback, function (data) {
                if (data.Data)
                    phones = data.Data;
                else
                    phones.length = 0;
            });
        },
        addreg: function (register, openid, callback) {
            var params = { phone: register.phone, open_id: openid };
            Utils.execWithoutToken("configs/addRegister", params, callback);
        }
    }
})

.factory("Utils", function ($http, $state, $ionicPopup, $ionicLoading, $location) {
    var _buildUrl = function (path, params) {
        var url = itru_serviceUrl + path + "?callback=JSON_CALLBACK";
        for (var item in params) {
            var val = params[item];
            if (val instanceof Array)
                url += "&" + item + "=" + encodeURIComponent(JSON.stringify(val));
            else
                url += "&" + item + "=" + encodeURIComponent(val);
        }
        return url;
    };
    var _alertMsg = function (msg) {
        $ionicPopup.alert({
            title: '<strong>提示</strong>',
            template: msg,
            okText: '确定'
        });
    };
    var _showLoading = function () {
        $ionicLoading.show({ templateUrl: 'loading.html' });
    };
    var _hideLoading = function () {
        $ionicLoading.hide();
    };
    var _error = function (data, status, prefix) {
        var msg = prefix + ", " + (data ? data.Code + " " + data.Msg : status);
        var signout = false;
        if (status == 404)
            msg = "请求失败，请检查网络连接";
        else if (data && data.Code == 1000) {
            msg = "令牌已失效，请重新登录"
            signout = true;
        }
        _alertMsg(msg);
        if (signout)
            _signout();
    };
    var _encrypt = function (src) {
        var keyHex = CryptoJS.enc.Utf8.parse(itru_encryptKey);
        var encrypted = CryptoJS.DES.encrypt(src, keyHex, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.ZeroPadding
        });
        return encrypted.toString();
    };
    var _signout = function () {
        itru_isLogin = false;
        itru_accessToken = "";
        itru_lastGetTokenTime = null;
        itru_isPrimary(false);
        itru_loginToken(-1);
        itru_familyId(-1);
        itru_userId(-1);
        $state.go("signin");
    };
    var _accessToken = function (callback) {
        if ((!itru_isLogin && !itru_loginToken()) || (!itru_familyId() && $location.url() != "/select-family"))
            callback(-1);
        else {
            if (itru_lastGetTokenTime) {
                var nowTicks = Date.parse(new Date());
                var lastGetTicks = Date.parse(itru_lastGetTokenTime);
                if ((nowTicks - lastGetTicks) / 1000 < 7080) {
                    callback(0);
                    return;
                }
            }

            var url = _buildUrl("users/accessToken", { token: itru_loginToken() });
            $http.jsonp(url).success(function (data) {
                if (data.Code == 0) {
                    itru_isLogin = true;
                    itru_accessToken = data.Data[0].access_token;
                    itru_userName = data.Data[0].username;
                    itru_userPicture = data.Data[0].picture;
                    itru_lastGetTokenTime = new Date();
                    callback(0);
                }
                else
                    callback(data.Code);
            }).error(function (statusText) {
                callback(statusText);
            });
        }
    };
    var _execWithoutToken = function (url, params, callback, code0_callback) {
        _showLoading();
        $http.jsonp(_buildUrl(url, params)).success(function (data) {
            if (data.Code == 0 && code0_callback)
                code0_callback(data);
            if (callback)
                callback(data, data.Code);
        }).error(function (data, statusText) {
            if (statusText == 404)
                _error(null, statusText, null);
            else if (callback)
                callback(data, statusText);
        }).finally(function () {
            _hideLoading();
        });
    };

    return {
        alert: _alertMsg,
        error: _error,
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
        loading: _showLoading,
        hideLoading: _hideLoading,
        encrypt: _encrypt,
        buildUrl: _buildUrl,
        signout: _signout,
        exec: function (url, params, callback, code0_callback) {
            _showLoading();
            _accessToken(function (code) {
                if (code == 0) {
                    params.token = itru_accessToken;
                    _execWithoutToken(url, params, callback, code0_callback);
                }
                else if (code == -1) {
                    _hideLoading();
                    $state.go("signin");
                }
                else if (code == 1005 || code == 1000) {
                    _hideLoading();
                    _alertMsg("令牌已失效，请重新登录");
                    _signout();
                }
                else if (code == 404) {
                    _hideLoading();
                    _alertMsg("请求失败，请检查网络连接");
                }
                else {
                    _hideLoading();
                    _alertMsg("获取令牌失败，请稍后重试，错误码：" + code);
                }
            });
        },
        execWithoutToken: _execWithoutToken,
        objToArray: function (obj) {
            var array = [];
            for (var p in obj)
                array.push(obj[p]);
            return array;
        },
        getDate: function (days) {
            return new Date(new Date() - 1000 * 60 * 60 * 24 * days);
        },
        checkDate: function check(date) {
            return (new Date(date).getDate() == date.substring(date.length - 2));
        },
        signin: function (user, callback) {
            var phone = _encrypt(user.phone);
            var pwd = _encrypt(user.password);
            var params = { username: phone, password: pwd };
            _execWithoutToken("users/tickets", params, callback, function (data) {
                itru_isLogin = true;
                itru_userId(data.Data[0].user_id);
                itru_loginToken(data.Data[0].token);
                itru_userName = data.Data[0].username;
                itru_userPicture = data.Data[0].picture;
            });
        },
        refreshAccessToken: _accessToken
    }
});


