/*

  DeepBlue Starter Kit - version 1.1
  Copyright (c) 2015 INMAGIK SRL - www.inmagik.com
  All rights reserved

  written by Mauro Bianchi
  bianchimro@gmail.com  
  
  file: app.js
  
*/

angular
  .module("deepBlue", [
    "ionic",
    "deepBlue.controllers",
    "deepBlue.services",
    "firebase",
    "chart.js",
    "zingchart-angularjs",
    "ngCordova",
    "ngMap"
  ])

  .run(function($ionicPlatform, $rootScope, $timeout, $state) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }

      /* 
      #SIMPLIFIED-IMPLEMENTATION:
      Example access control.
      A real app would probably call a service method to check if there
      is a logged user.

      #IMPLEMENTATION-DETAIL: views that require authorizations have an
      "auth" key with value = "true".
    */
      $rootScope.$on("$stateChangeStart", function(
        event,
        toState,
        toParams,
        fromState,
        fromParams
      ) {
        if (
          toState.data &&
          toState.data.auth == true &&
          !$rootScope.user.email
        ) {
          event.preventDefault();
          $state.go("app.login");
        }
      });
    });
  })

  .config(function($stateProvider, $urlRouterProvider) {
    /*

    Here we setup the views of our app.
    In this case:
    - feed, account, shop, checkout, cart will require login
    - app will go to the "start view" when launched.

    #IMPLEMENTATION-DETAIL: views that require authorizations have an
    "auth" key with value = "true".

  */

    $stateProvider

      .state("app", {
        url: "/app",
        abstract: true,
        templateUrl: "templates/menu.html",
        controller: "AppCtrl"
      })

      .state("app.start", {
        url: "/start",
        views: {
          menuContent: {
            templateUrl: "templates/start.html"
          }
        }
      })

      .state("app.login", {
        url: "/login",
        cached: false,
        views: {
          menuContent: {
            templateUrl: "templates/login.html",
            controller: "LoginCtrl"
          }
        }
      })

      .state("app.forgot", {
        url: "/forgot",
        views: {
          menuContent: {
            templateUrl: "templates/forgot.html",
            controller: "LoginCtrl"
          }
        }
      })

      .state("app.signup", {
        url: "/signup",
        views: {
          menuContent: {
            templateUrl: "templates/signup.html",
            controller: "SignupCtrl"
          }
        }
      })

      .state("app.account", {
        url: "/account",
        views: {
          menuContent: {
            templateUrl: "templates/account.html",
            controller: "AccountCtrl"
          }
        }
      })

      .state("app.feed", {
        url: "/feed",
        views: {
          menuContent: {
            templateUrl: "templates/feed.html",
            controller: "FeedsCtrl"
          }
        }
      })

      .state("app.measure", {
        url: "/measure",
        views: {
          menuContent: {
            templateUrl: "templates/measure.html",
            controller: "MeasureCtrl"
          }
        }
      })

      .state("app.shop", {
        url: "/shop",
        views: {
          menuContent: {
            templateUrl: "templates/shop.html",
            controller: "ShopCtrl"
          }
        }
      })

      .state("app.cart", {
        url: "/cart",
        views: {
          menuContent: {
            templateUrl: "templates/cart.html",
            controller: "CartCtrl"
          }
        }
      })

      .state("app.checkout", {
        url: "/checkout",
        views: {
          menuContent: {
            templateUrl: "templates/checkout.html",
            controller: "CheckoutCtrl"
          }
        }
      });

    // If none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise("/app/start");
  });
