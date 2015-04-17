angular.module('itrustoor.controllers', [])

.controller('DashCtrl', function ($scope) { })

.controller('NewsCtrl', function ($scope, News) {
    $scope.chats = News.all();
    $scope.remove = function (chat) {
        News.remove(chat);
    }
})

.controller('NewsDetailCtrl', function ($scope, $stateParams, News) {
    $scope.chat = News.get($stateParams.chatId);
})

.controller('SettingCtrl', function ($scope) {

})

.controller('StudentCtrl', function ($scope, Student) {
    $scope.students = Student.all();
})

.controller('LoginCtrl', function ($scope) {
    $scope.phone = "";
    $scope.password = "";
    $scope.remark = "";

    $scope.login = function () {
        $scope.remark = "sdfwefwe";
    };
});
