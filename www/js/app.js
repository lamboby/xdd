angular.module('itrustoor', ['ionic', 'ngCordova', 'itrustoor.controllers', 'itrustoor.services', 'itrustoor.filters'])

.run(function ($ionicPlatform, $location, $ionicHistory, $rootScope, $cordovaFile, $urlRouter, $state, Utils, DB, Ringtone, UserService) {
    $ionicPlatform.ready(function () {
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard)
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        if (window.StatusBar)
            StatusBar.styleDefault();

        if (ionic.Platform.isAndroid() && ionic.Platform.version() < 4.3)
            itru_supportDatePicker(false);
        else
            itru_supportDatePicker(true);

        //处理android返回键
        $ionicPlatform.registerBackButtonAction(function (e) {
            e.preventDefault();
            var path = $location.path();
            if ((!itru_isLogin && path != "/regsubmit" && path != "/changepwd" && path != "/regsendmsg" && path != "/regvalid") ||
                path == '/tab/dash' || path == "/tab/news" || path == "/tab/setting" || path == "/select-family") {
                Utils.confirm("确定退出应用吗?", function (res) {
                    if (res)
                        ionic.Platform.exitApp();
                });
            }
            else
                $ionicHistory.goBack();
            return false;
        }, 101);

        //初始化DB
        DB.init();

        //默认铃声
        Ringtone.init();

        //获取OPENID		
        UserService.initOpenId();
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
        cache: false,
        views: {
            'tab-dash': {
                templateUrl: 'templates/tab-dash.html',
                controller: 'DashCtrl'
            }
        }
    })
    .state('tab.news', {
        url: '/news',
        cache: false,
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
        cache: false,
        views: {
            'tab-setting': {
                templateUrl: 'templates/tab-setting.html',
                controller: 'SettingCtrl'
            }
        }
    })
    .state('tab.student', {
        url: '/setting/student',
        cache: false,
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
    .state('tab.edit-student', {
        url: '/setting/student/:studentId',
        views: {
            'tab-setting': {
                templateUrl: 'templates/edit-student.html',
                controller: 'EditStudentCtrl'
            }
        }
    })
    .state('tab.family', {
        url: '/setting/family',
        cache: false,
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
        cache: false,
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
    .state('tab.edit-parent', {
        url: '/setting/parent/:parentId',
        views: {
            'tab-setting': {
                templateUrl: 'templates/edit-parent.html',
                controller: 'EditParentCtrl'
            }
        }
    })
    .state('tab.photo', {
        url: '/setting/photo',
        views: {
            'tab-setting': {
                templateUrl: 'templates/photo.html',
                controller: 'PhotoCtrl'
            }
        }
    })
    .state('tab.take-photo', {
        url: '/setting/photo/:userId/:userType',
        views: {
            'tab-setting': {
                templateUrl: 'templates/take-photo.html',
                controller: 'TakePhotoCtrl'
            }
        }
    })
    .state('tab.card', {
        url: '/setting/card',
        cache: false,
        views: {
            'tab-setting': {
                templateUrl: 'templates/card-list.html',
                controller: 'CardCtrl'
            }
        }
    })
    .state('tab.create-card', {
        url: '/setting/create-card',
        views: {
            'tab-setting': {
                templateUrl: 'templates/create-card.html',
                controller: 'CreateCardCtrl'
            }
        }
    })
    .state('tab.card-user', {
        url: '/setting/card-user/:card',
        views: {
            'tab-setting': {
                templateUrl: 'templates/card-user.html',
                controller: 'CardUserCtrl'
            }
        }
    })
    .state('tab.card-push', {
        url: '/setting/card-push/:card',
        views: {
            'tab-setting': {
                templateUrl: 'templates/card-push.html',
                controller: 'CardPushCtrl'
            }
        }
    })
    .state('tab.ringtone', {
        url: '/setting/ringtone',
        views: {
            'tab-setting': {
                templateUrl: 'templates/ringtone.html',
                controller: 'RingtoneCtrl'
            }
        }
    })
    .state('tab.bug', {
        url: '/setting/bug',
        views: {
            'tab-setting': {
                templateUrl: 'templates/bug.html',
                controller: 'BugCtrl'
            }
        }
    })
    .state('tab.about', {
        url: '/setting/about',
        views: {
            'tab-setting': {
                templateUrl: 'templates/about.html',
                controller: 'AboutCtrl'
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
    })

    .state('regsubmit', {
        url: '/regsubmit',
        templateUrl: 'templates/reg-submit.html',
        controller: 'RegisterCtrl'
    })
	.state('regsendmsg', {
	    url: '/regsendmsg',
	    templateUrl: 'templates/reg-sendmsg.html',
	    controller: 'SendmsgCtrl'
	})
	.state('regvalid', {
	    url: '/regvalid',
	    templateUrl: 'templates/reg-valid.html',
	    controller: 'RegisterCtrl'
	})
	.state('changepwd', {
	    url: '/changepwd',
	    templateUrl: 'templates/changepwd.html',
	    controller: 'ChangepwdCtrl'
	});

    $urlRouterProvider.otherwise('/tab/dash');
});
