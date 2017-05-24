var routerApp = angular.module('routerApp',['ui.router','ui.grid','ngResource','ngAnimate','angucomplete-alt','IndexModule','InsecureModule'
    ,'MapModule','DetectModule','VulsModule']);

routerApp.run(function ($rootScope,$state,$stateParams) {
  $rootScope.$state = $state;
  $rootScope.$stateParam = $stateParams;
});


routerApp.config(function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/index');
  $stateProvider
      // .state('index',{
      //   url: '/index',
      //   views: {
      //     '': {
      //       templateUrl: 'index/tpls/index.html'
      //     },
      //     'content@index':{
      //       templateUrl: 'index/tpls/main.html'
      //     }
      //   }
      // })
      .state('index',{
          url: '/index',
          views: {
              '': {
                  templateUrl: 'index/tpls/firstpage.html'
              }
          }
      })
      .state('insecureDevices',{
          url: '/insecure-devices',
          views: {
            '': {
                templateUrl: 'index/tpls/index.html'
            },
            'content@insecureDevices':{
                templateUrl: 'insecure-devices/tpls/insecure-devices-list-main.html'
            }
          }
      })
      .state('globalMap',{
          url: '/global-map',
          views: {
            '': {
                templateUrl: 'index/tpls/index.html'
            },
            'content@globalMap':{
                templateUrl: 'global-map/tpls/global-map-main.html'
            }
          }
      })
      .state('vuls',{
          url: '/vuls',
          views:{
              '':{
                templateUrl: 'index/tpls/index.html'
              },
              'content@vuls' :{
                templateUrl: 'vuls/tpls/vuls-main.html'
              }
          }  
      })
      .state('deviceDetect',{
          url: '/device-detect',
          views:{
              '':{
                  templateUrl: 'index/tpls/index.html'
              },
              'content@deviceDetect':{
                  templateUrl: 'device-detect/tpls/device-detect-main.html'
              }
          }
      });
});