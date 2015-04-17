angular.module('itrustoor.services', [])

.factory('News', function () {
    // Might use a resource here that returns a JSON array

    // Some fake testing data
    var news = [{
        id: 0,
        name: 'Ben Sparrow',
        lastText: 'You on your way?',
        face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
    }, {
        id: 1,
        name: 'Max Lynx',
        lastText: 'Hey, it\'s me',
        face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
    }, {
        id: 2,
        name: 'Andrew Jostlin',
        lastText: 'Did you get the ice cream?',
        face: 'https://pbs.twimg.com/profile_images/491274378181488640/Tti0fFVJ.jpeg'
    }, {
        id: 3,
        name: 'Adam Bradleyson',
        lastText: 'I should buy a boat',
        face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
    }, {
        id: 4,
        name: 'Perry Governor',
        lastText: 'Look at my mukluks!',
        face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
    }];

    return {
        all: function () {
            return news;
        },
        remove: function (chat) {
            news.splice(news.indexOf(chat), 1);
        },
        get: function (chatId) {
            for (var i = 0; i < news.length; i++) {
                if (news[i].id === parseInt(chatId)) {
                    return news[i];
                }
            }
            return null;
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
        }
    };
});
