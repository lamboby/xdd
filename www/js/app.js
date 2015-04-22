﻿angular.module('itrustoor', ['ionic', 'itrustoor.controllers', 'itrustoor.services', 'itrustoor.filters'])

.run(function ($ionicPlatform, $location, $ionicHistory, $rootScope, $urlRouter, $state, Utils, Auth) {
    $ionicPlatform.ready(function () {
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard)
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        if (window.StatusBar)
            StatusBar.styleDefault();

        //处理android返回键
        $ionicPlatform.registerBackButtonAction(function (e) {
            e.preventDefault();
            var path = $location.path();
            if (!itru_isLogin || path == '/tab/dash'
                || path == "/tab/news" || path == "/tab/setting" || path == "/select-family") {
                Utils.confirm("确定退出应用吗?", function (res) {
                    if (res)
                        ionic.Platform.exitApp();
                });
            }
            else
                $ionicHistory.goBack();
            return false;
        }, 101);

        //AccessToken
        $rootScope.$on('$locationChangeSuccess', function (evt) {
            evt.preventDefault();
            var path = $location.path();
            if (path == "/signin")
                $urlRouter.sync();
            else {
                var res = Auth.refreshAccessToken();
                if (res === -1) 
                    $state.go("signin");
                else if (res === 0)
                    $urlRouter.sync();
                else {
                    res.then(function (data) {
                        if (data.Code != 'undefined') {
                            if (data.Code == 0) {
                                itru_isLogin = true;
                                itru_accessToken = data.Data[0].access_token;
                                itru_lastGetTokenTime = new Date();
                                $urlRouter.sync();
                            }
                            else {
                                Utils.hideLoading();
                                Utils.alert("令牌已失效，请重新登录");
                                itru_isLogin = false;
                                $state.go("signin");
                            }
                        }
                        else {
                            Utils.hideLoading();
                            Utils.alert("获取令牌失败，错误码：" + data)
                        }
                    });
                }
            }
        });
    });
})

.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $ionicConfigProvider.tabs.position('bottom');
    $ionicConfigProvider.tabs.style('standard');
    $ionicConfigProvider.backButton.icon("ion-ios-arrow-back");

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
    .state('tab.student', {
        url: '/setting/student',
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
    .state('tab.family', {
        url: '/setting/family',
        views: {
            'tab-setting': {
                templateUrl: 'templates/family-list.html',
                controller: 'FamilyCtrl'
            }
        }
    })
    .state('tab.create-family', {
        url: '/setting/create-family',
        views: {
            'tab-setting': {
                templateUrl: 'templates/create-family.html',
                controller: 'CreateFamilyCtrl'
            }
        }
    })
    .state('tab.edit-family', {
        url: '/setting/family/:familyId',
        views: {
            'tab-setting': {
                templateUrl: 'templates/edit-family.html',
                controller: 'EditFamilyCtrl'
            }
        }
    })
    .state('tab.parent', {
        url: '/setting/parent',
        views: {
            'tab-setting': {
                templateUrl: 'templates/parent-list.html',
                controller: 'ParentCtrl'
            }
        }
    })
    .state('tab.create-parent', {
        url: '/setting/create-parent',
        views: {
            'tab-setting': {
                templateUrl: 'templates/create-parent.html',
                controller: 'CreateParentCtrl'
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
