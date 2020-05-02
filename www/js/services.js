/*

  DeepBlue Starter Kit - version 1.1
  Copyright (c) 2015 INMAGIK SRL - www.inmagik.com
  All rights reserved

  written by Mauro Bianchi
  bianchimro@gmail.com  
  
  file: services.js
  description: this file contains all services of the DeepBlue app.

*/

angular
  .module("deepBlue.services", [])

  // CartService is an example of service using localStorage
  // to persist items of the cart.
  .factory("CartService", [
    function() {
      var svc = {};

      svc.saveCart = function(cart) {
        window.localStorage.setItem("cart", JSON.stringify(cart));
      };

      svc.loadCart = function() {
        var cart = window.localStorage.getItem("cart");
        if (!cart) {
          return { products: [] };
        }
        return JSON.parse(cart);
      };

      svc.resetCart = function() {
        var cart = { products: [] };
        svc.saveCart(cart);
        return cart;
      };

      svc.getTotal = function(cart) {
        var out = 0;
        if (!cart || !cart.products || !angular.isArray(cart.products)) {
          return out;
        }
        for (var i = 0; i < cart.products.length; i++) {
          out += cart.products[i].price;
        }
        return out;
      };

      return svc;
    }
  ])

  // #SIMPLIFIED-IMPLEMENTATION
  // This is an example if backend service using $http to get
  // data from files.
  // In this example, files are shipped with the application, so
  // they are static and cannot change unless you deploy an application update
  // Other possible implementations (not covered by this kit) include:
  // - loading dynamically json files from the web
  // - calling a web service to fetch data dinamically
  // in those cases be sure to handle url whitelisting (specially in android)
  // (https://cordova.apache.org/docs/en/5.0.0/guide_appdev_whitelist_index.md.html)
  // and handle network errors in your interface
  .factory("BackendService", [
    "$http",
    function($http) {
      var svc = {};
      svc.exportJson = function(obj, name) {
        // alert("a");
        var filename = name + ".json";
        var blob = new Blob([angular.toJson(obj, true)], {
          type: "text/json"
        });
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(blob, filename);
        } else {
          var e = document.createEvent("MouseEvents"),
            a = document.createElement("a");
          a.download = filename;
          a.href = window.URL.createObjectURL(blob);
          a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
          e.initEvent(
            "click",
            true,
            false,
            window,
            0,
            0,
            0,
            0,
            0,
            false,
            false,
            false,
            false,
            0,
            null
          );
          a.dispatchEvent(e);
          // window.URL.revokeObjectURL(a.href); // clean the url.createObjectURL resource
        }
      };
      svc.getFeeds = function() {
        return $http.get("sampledata/feeds.json");
      };

      svc.getProducts = function() {
        return $http.get("sampledata/products.json");
      };
      svc.yyyymmdd = function(dateIn) {
        var yyyy = dateIn.getFullYear();
        var mm = dateIn.getMonth() + 1; // getMonth() is zero-based
        var dd = dateIn.getDate();
        return String(yyyy + "-" + mm + "-" + dd); // Leading zeros for mm and dd
      };
      svc.takeTime = function(dateIn) {
        var hh = dateIn.getHours();
        var mm = dateIn.getMinutes();
        if (mm < 10) {
          mm = "0" + mm;
        }
        if (hh < 10) {
          hh = "0" + hh;
        }
        return String(hh + ":" + mm); // Leading zeros for mm and dd
      };

      return svc;
    }
  ]);
