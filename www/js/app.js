angular.module('itrustoor', ['ionic', 'itrustoor.controllers', 'itrustoor.services', 'itrustoor.filters'])

.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleLightContent();
        }
    });
})

.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $ionicConfigProvider.tabs.position('bottom');
    $ionicConfigProvider.tabs.style('standard');
    $ionicConfigProvider.backButton.icon("ion-ios-arrow-left");

    $stateProvider
      .state('tab', {
          url: "/tab",
          abstract: true,
          templateUrl: "templates/tabs.html"
      })
    .state('tab.dash', {
        url: '/dash',
        views: {
            'tab-dash': {
                templateUrl: 'templates/tab-dash.html',
                controller: 'DashCtrl'
            }
        }
    })
    .state('tab.news', {
        url: '/news',
        views: {
            'tab-news': {
                templateUrl: 'templates/tab-news.html',
                controller: 'NewsCtrl'
            }
        }
    })
      .state('tab.news-detail', {
          url: '/news/:newId',
          views: {
              'tab-news': {
                  templateUrl: 'templates/news-detail.html',
                  controller: 'NewsDetailCtrl'
              }
          }
      })
    .state('tab.setting', {
        url: '/setting',
        views: {
            'tab-setting': {
                templateUrl: 'templates/tab-setting.html',
                controller: 'SettingCtrl'
            }
        }
    })
    .state('tab.students', {
        url: '/setting/students',
        views: {
            'tab-setting': {
                templateUrl: 'templates/student-list.html',
                controller: 'StudentCtrl'
            }
        }
    })
    .state('tab.create-student', {
        url: '/setting/create-student',
        views: {
            'tab-setting': {
                templateUrl: 'templates/create-student.html',
                controller: 'CreateStudentCtrl'
            }
        }
    })
    .state('signin', {
        url: '/signin',
        templateUrl: 'templates/signin.html',
        controller: 'SigninCtrl'
    })
    .state('select-family', {
        url: '/select-family',
        templateUrl: 'templates/select-family.html',
        controller: 'SelectFamilyCtrl'
    });

    $urlRouterProvider.otherwise('/tab/dash');
});
