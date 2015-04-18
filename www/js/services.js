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
        sch_name: '中心小学',
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
        stu_name: 'Ben Sparrow',
        gender: 0,
        birthday: '2014-8-9',
        sch_id: 1,
        sch_name: '广州市第三小学',
        picture: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
    }, {
        stu_id: 1,
        stu_name: 'Ben Sparrow',
        gender: 0,
        birthday: '2014-8-9',
        sch_id: 1,
        sch_name: '中心小学',
        picture: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
    }, {
        stu_id: 1,
        stu_name: 'Ben Sparrow',
        gender: 0,
        birthday: '2014-8-9',
        sch_id: 1,
        sch_name: '中心小学',
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

.factory("Auth", function ($http, $ionicLoading) {
    var accessToken = function (callback) {
        var url = itru_builUrl("users/accessToken", { token: itru_loginToken() });
        $http.jsonp(url).success(function (data) {
            if (data.Code == 0)
                itru_accessToken = data.Data[0].access_token;

            if (callback)
                callback(data, data.Code);
        }).error(function (data, statusText) {
            if (callback)
                callback(data, statusText);
        }).finally(function () {
            $ionicLoading.hide();
        });
    };

    return {
        login: function (user, callback) {
            var phone = itru_encrypt(user.phone);
            var pwd = itru_encrypt(user.password);
            var params = { username: phone, password: pwd };
            var url = itru_builUrl("users/tickets", params);

            $http.jsonp(url).success(function (data) {
                if (data.Code == 0) {
                    itru_isLogin = true;
                    itru_userId(data.Data[0].user_id);
                    itru_loginToken(data.Data[0].token);
                }
                accessToken(callback);
            }).error(function (data, statusText) {
                $ionicLoading.hide();
                if (callback)
                    callback(data, statusText);
            });
        },
        getAccessToken: accessToken
    }
});
