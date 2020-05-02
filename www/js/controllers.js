/*
  
  DeepBlue Starter Kit - version 1.1
  Copyright (c) 2015 INMAGIK SRL - www.inmagik.com
  All rights reserved

  written by Mauro Bianchi
  bianchimro@gmail.com  
  
  file: controllers.js
  description: this file contains all controllers of the DeepBlue app.

*/

//controllers are packed into a module
angular
  .module('deepBlue.controllers', [
    'chart.js',
    'zingchart-angularjs',
    'ngCordova',
    'ngMap'
  ])

  //top view controller
  .controller('AppCtrl', function (
    $scope,
    $rootScope,
    $state,
    $firebaseObject
  ) {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        var user = firebase.auth().currentUser
        if (user) {
          $scope.user = {
            id: user.uid
          }
          $scope.userProfile = $firebaseObject(
            firebase
              .database()
              .ref()
              .child('Dfhir')
              .child('Patients')
              .child(user.uid)
              .child('entry')
              .child('resource')
              .child($scope.user.id)
          )
        }
      } else {
        $state.go('app.start')
      }
    })

    $scope.logout = function () {
      firebase
        .auth()
        .signOut()
        .then(function () {
          $rootScope.user = {}
          $state.go('app.start')
        })
        .catch(function (error) {
          alert(error.message)
        })
    }
  })

  // This controller is bound to the "app.account" view
  .controller('AccountCtrl', function (
    $scope,
    $rootScope,
    $firebaseObject,
    BackendService
  ) {
    $scope.export = function () {
      BackendService.exportJson($scope.userProfile_all, 'FullAccount')
    }
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        var user = firebase.auth().currentUser
        if (user) {
          $scope.user = user.uid
          $scope.userProfile_all = $firebaseObject(
            firebase
              .database()
              .ref()
              .child('Dfhir')
              .child('Patients')
              .child(user.uid)
              .child('entry')
              .child('resource')
          )
          $scope.userProfile = $firebaseObject(
            firebase
              .database()
              .ref()
              .child('Dfhir')
              .child('Patients')
              .child(user.uid)
              .child('entry')
              .child('resource')
              .child(user.uid)
          )
          //alert($scope.userProfile);
        }
      } else {
        $state.go('app.login')
      }
    })
    //readonly property is used to control editability of account form
    $scope.readonly = true
    // #SIMPLIFIED-IMPLEMENTATION:
    // We act on a copy of the root user
    var userCopy = {}

    $scope.startEdit = function () {
      $scope.readonly = false
      userCopy = angular.copy($scope.user)
    }

    $scope.cancelEdit = function () {
      $scope.readonly = true
      $scope.user = userCopy
    }

    // #SIMPLIFIED-IMPLEMENTATION:
    // this function should call a service to update and save
    // the data of current user.
    // In this case we'll just set form to readonly and copy data back to $rootScope.
    $scope.saveEdit = function () {
      $scope.readonly = true
      firebase
        .database()
        .ref()
        .child('Dfhir')
        .child('Patients')
        .child($scope.user)
        .child('entry')
        .child('resource')
        .child($scope.user)
        .update({
          name: {
            given: $scope.userProfile.name.given,
            use: $scope.userProfile.name.given,
            family: 'salem'
          },
          telecom: {
            system: 'email',
            value: $scope.userProfile.telecom.value,
            use: 'email'
          },
          address: {
            city: $scope.userProfile.address.city,
            country: $scope.userProfile.address.country,
            district: $scope.userProfile.address.country,
            postalCode: $scope.userProfile.address.postalCode
          },
          photo: document.getElementById('myImg').src
        })
      Swal.fire('Good job!', 'Your Profile is complete!', 'success')
    }

    $scope.fileNameChanged = function () {
      var preview = document.querySelector('img')
      var file = document.querySelector('input[type=file]').files[0]
      var reader = new FileReader()

      reader.onloadend = function () {
        preview.src = reader.result
      }

      if (file) {
        reader.readAsDataURL(file)
      } else {
        preview.src = ''
      }
      firebase
        .database()
        .ref()
        .child('Dfhir')
        .child('Patients')
        .child($scope.user)
        .child('entry')
        .child('resource')
        .child($scope.user)
        .update({
          photo: document.getElementById('myImg').src
        })
    }
  })

  .controller('SignupCtrl', function (
    $scope,
    $state,
    $rootScope,
    $firebaseAuth,
    $firebaseObject
  ) {
    // #SIMPLIFIED-IMPLEMENTATION:
    // This login function is just an example.
    // A real one should call a service that checks the auth against some
    // web service
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        $state.go('app.feed')
      } else {
        //alert("nouser");
        $scope.user = {
          id: ''
        }
      }
    })
    function yyyymmdd (dateIn) {
      var yyyy = dateIn.getFullYear()
      var mm = dateIn.getMonth() + 1 // getMonth() is zero-based
      var dd = dateIn.getDate()
      return String(yyyy + '-' + mm + '-' + dd) // Leading zeros for mm and dd
    }
    $scope.signUp = function (
      name,
      family,
      birthDate,
      gender,
      email,
      password,
      confirmPass
    ) {
      // Create a new user
      if (confirmPass == password) {
        $firebaseAuth()
          .$createUserWithEmailAndPassword(email, password)
          .then(function (firebaseUser) {
            $scope.message = firebaseUser.uid
            firebase
              .database()
              .ref()
              .child('Dfhir')
              .child('Patients')
              .child(firebaseUser.uid)
              .child('entry')
              .child('resource')
              .child(firebaseUser.uid)
              .set({
                birthDate: yyyymmdd(birthDate),
                gender: gender,
                active: 'True',
                deceasedBoolean: 'False',
                managingOrganization: {
                  reference: 'Diabetes FHIR App',
                  display: 'Diabetes FHIR App'
                },
                id: firebaseUser.uid,
                name: { family: family, given: name, use: name },
                resourceType: 'Patient',
                telecom: { value: email },
                address: ''
              })
            Swal.fire('Good job!', 'Your Profile is Created!', 'success')
          })
          .catch(function (error) {
            $scope.error = error
          })
      }
    }
    $scope.validatePass = function (confirmPass, password) {
      if (confirmPass != password) {
        Swal.fire({
          title: 'Error!',
          text: 'Passowrd should be equal',
          icon: 'error',
          confirmButtonText: 'OK'
        })
      }
    }
  })

  .controller('LoginCtrl', function (
    $scope,
    $state,
    $rootScope,
    $firebaseAuth,
    BackendService
  ) {
    // #SIMPLIFIED-IMPLEMENTATION:
    // This login function is just an example.
    // A real one should call a service that checks the auth against some
    // web service
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        $state.go('app.feed')
      } else {
        //alert("nouser");
        $scope.user = {
          id: ''
        }
      }
    })

    $scope.login = function (email, password) {
      //in this case we just set the user in $rootScope
      $firebaseAuth()
        .$signInWithEmailAndPassword(email, password)
        .then(function (firebaseUser) {
          //$scope.message = "User created with uid: " + firebaseUser.uid;
          $state.go('app.feed')
        })
        .catch(function (error) {
          alert(error.message)
          //$scope.error = error;
        })

      //finally, we route our app to the 'app.shop' view
    }
    $scope.forget = function (email) {
      firebase
        .auth()
        .sendPasswordResetEmail(email)
        .then(function () {
          // Password reset email sent.
          Swal.fire('Good job!', 'Password reset email sent!', 'success')

          $state.go('app.start')
        })
        .catch(function (error) {
          // Error occurred. Inspect error.code.
        })
    }
  })
  .controller('MeasureCtrl', function (
    $scope,
    $state,
    BackendService,
    $firebaseArray
  ) {
    $scope.length = []
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        $scope.user = {
          id: user.uid
        }
        // firebase
        //   .database()
        //   .ref()
        //   .child('Dfhir')
        //   .child('location')
        //   .update({
        //     chicagouu: {
        //       population: 45,
        //       position: [32.2518342, 35.2769043]
        //     },
        //     chicagouu3: {
        //       population: 45,
        //       position: [32.2418342, 35.1769043]
        //     },
        //     newyork: {
        //       population: 21,
        //       position: [31.8166379, 35.3983529]
        //     },
        //     newyork2: {
        //       population: 21,
        //       position: [31.8163379, 35.3943529]
        //     },
        //     losangeles: {
        //       population: 34,
        //       position: [31.3986093, 35.0740213]
        //     },
        //     losangeles2: {
        //       population: 34,
        //       position: [31.3996093, 35.0040213]
        //     },
        //     vancouver: { population: 60, position: [31.3072776, 34.3069376] },
        //     vancouver2: { population: 60, position: [31.3072776, 34.6069376] }
        //   })
        $scope.date = new Date()
        $scope.ArrayofLocation = $firebaseArray(
          firebase
            .database()
            .ref()
            .child('Dfhir')
            .child('Alllocation')
            .child($scope.user.id)
        )
      } else {
        $state.go('app.start')
      }
    })

    $scope.save = function (date, time, result, note) {
      if (result == 'Positive') {
        angular.forEach($scope.ArrayofLocation, function (value, key) {
          if (value.lat && value.Lng != undefined) {
            firebase
              .database()
              .ref()
              .child('Dfhir')
              .child('location')
              .push({
                population: 3,
                position: [value.lat, value.Lng]
              })
          }
        })
      }
      var number = Math.random() // 0.9394456857981651
      var id = number.toString(36).substr(2, 9) // 'xtis06h6'
      firebase
        .database()
        .ref()
        .child('Dfhir')
        .child('Patients')
        .child($scope.user.id)
        .child('entry')
        .child('resource')
        .child(id)
        .set({
          id: id,
          managingOrganization: {
            reference: 'Diabetes FHIR App',
            display: 'Diabetes FHIR App'
          },
          resourceType: 'Medication',
          text: {
            status: 'generated',
            div:
              "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p><b>Generated Narrative with Details</b></p><p><b>id</b>: f001</p><p><b>identifier</b>: 6323 (OFFICIAL)</p><p><b>status</b>: final</p><p><b>code</b>: Glucose [Moles/volume] in Blood <span>(Details : {LOINC code '15074-8' = 'Glucose [Moles/volume] in Blood', given as 'Glucose [Moles/volume] in Blood'})</span></p><p><b>subject</b>: <a>P. van de Heuvel</a></p><p><b>effective</b>: 02/04/2013 9:30:10 AM --&gt; (ongoing)</p><p><b>issued</b>: 03/04/2013 3:30:10 PM</p><p><b>performer</b>: <a>A. Langeveld</a></p><p><b>value</b>: 6.3 mmol/l<span> (Details: UCUM code mmol/L = 'mmol/L')</span></p><p><b>interpretation</b>: High <span>(Details : {http://terminology.hl7.org/CodeSystem/v3-MedicationInterpretation code 'H' = 'High', given as 'High'})</span></p><h3>ReferenceRanges</h3><table><tr><td>-</td><td><b>Low</b></td><td><b>High</b></td></tr><tr><td>*</td><td>3.1 mmol/l<span> (Details: UCUM code mmol/L = 'mmol/L')</span></td><td>6.2 mmol/l<span> (Details: UCUM code mmol/L = 'mmol/L')</span></td></tr></table></div>"
          },
          identifier: [
            {
              use: 'official',
              system: 'http://www.bmc.nl/zorgportal/identifiers/Medications',
              value: '6323'
            }
          ],
          status: 'final',
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '15074-8',
                display: 'Glucose [Moles/volume] in Blood'
              }
            ]
          },
          subject: {
            reference: $scope.user.id
          },
          effectivePeriod: {
            start: BackendService.yyyymmdd(date)
          },
          issued: BackendService.yyyymmdd(date),
          performer: [
            {
              reference: $scope.user.id
            }
          ],
          category: result,
          note: note,
          time: BackendService.takeTime(time),
          timeStamp: new Date().valueOf()
        })
      Swal.fire('Good job!', 'Your Result is Saved!', 'success')
      $state.go('app.feed')
    }
  })
  // Feeds controller.
  .controller('FeedsCtrl', function (
    $scope,
    $state,
    BackendService,
    $cordovaGeolocation,
    $firebaseObject,
    NgMap,
    $firebaseArray
  ) {
    $scope.length = []
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        var user = firebase.auth().currentUser
        if (user) {
          $scope.user = {
            id: user.uid
          }
          $scope.userProfile = $firebaseObject(
            firebase
              .database()
              .ref()
              .child('Dfhir')
              .child('Patients')
              .child(user.uid)
              .child('entry')
              .child('resource')
              .child($scope.user.id)
          )
        }

        NgMap.getMap().then(function (map) {
          $scope.map = map
          $scope.track()
          $scope.ArrayofLocation = $firebaseObject(
            firebase
              .database()
              .ref()
              .child('Dfhir')
              .child('Alllocation')
              .child($scope.user.id)
          )
          // firebase
          //   .database()
          //   .ref()
          //   .child("Dfhir")
          //   .child("location")
          //   .update({
          //     chicagouu: {
          //       population: 45,
          //       position: [32.2518342, 35.2769043]
          //     },
          //     chicagouu3: {
          //       population: 45,
          //       position: [32.2418342, 35.1769043]
          //     },
          //     newyork: {
          //       population: 21,
          //       position: [31.8166379, 35.3983529]
          //     },
          //     newyork2: {
          //       population: 21,
          //       position: [31.8163379, 35.3943529]
          //     },
          //     losangeles: {
          //       population: 34,
          //       position: [31.3986093, 35.0740213]
          //     },
          //     losangeles2: {
          //       population: 34,
          //       position: [31.3996093, 35.0040213]
          //     },
          //     vancouver: { population: 60, position: [31.3072776, 34.3069376] },
          //     vancouver2: { population: 60, position: [31.3072776, 34.6069376] }
          //   });
          $scope.cities = $firebaseArray(
            firebase
              .database()
              .ref()
              .child('Dfhir')
              .child('location')
          )
          console.log($scope.map.getCenter())
          // console.log("markers", map.markers);
          // console.log("shapes", map.shapes);
        })

        setInterval(function () {
          $scope.track()
        }, 20000)
      } else {
        $state.go('app.start')
      }
    })
    $scope.setCenter = function () {
      $scope.map.setCenter($scope.center)
    }

    $scope.getRadius = function (num) {
      return Math.sqrt(num) * 100
    }
    // alert(new Date().valueOf());
    var options = {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 0
    }
    $scope.track = function () {
      //getCurrentPosition watchPosition
      $cordovaGeolocation.getCurrentPosition(options).then(
        function (position) {
          $scope.lat = position.coords.latitude
          $scope.Lng = position.coords.longitude
          console.log($scope.lat)
          firebase
            .database()
            .ref()
            .child('Dfhir')
            .child('Alllocation')
            .child($scope.user.id)
            .push({
              lat: $scope.lat,
              Lng: $scope.Lng
            })
          angular.forEach($scope.cities, function (value, key) {
            $scope.length.push(
              getDistanceFromLatLonInKm(
                value.position[0],
                value.position[1],
                $scope.lat,
                $scope.Lng
              )
            )
          })
          $scope.center = new google.maps.LatLng($scope.lat, $scope.Lng)
          //
        },
        function (error) {
          console.log('Could not get location')
        }
      )
    }
    $scope.percentage = function () {
      if (Math.min.apply(Math, $scope.length) == 0) {
        //Swal.fire("Good job!", "please Visit Take the test", "success");
        $scope.note = 'Your in Danger, Please take the test'
        return 10
      } else if (Math.min.apply(Math, $scope.length) <= 1) {
        $scope.note = 'Please take the test for your Safety'
        return 5
      } else {
        $scope.note = 'Be Carefull and take Care'
        //Swal.fire("Good job!", "Your Safe, Be carefull ", "success");
        return Math.floor(Math.random() * 3)
      }
    }

    function getDistanceFromLatLonInKm (lat1, lon1, lat2, lon2) {
      var R = 6371 // Radius of the earth in km
      var dLat = deg2rad(lat2 - lat1) // deg2rad below
      var dLon = deg2rad(lon2 - lon1)
      var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
          Math.cos(deg2rad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2)
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      var d = R * c // Distance in km
      return d
    }

    function deg2rad (deg) {
      return deg * (Math.PI / 180)
    }
    $scope.getAllData = function () {
      var ref = firebase
        .database()
        .ref()
        .child('Dfhir')
        .child('Patients')
        .child($scope.user.id)
        .child('entry')
        .child('resource')
      ref.orderByChild('timeStamp').on('child_added', function (snapshot) {
        if (snapshot.val().resourceType == 'Medication') {
          console.log(snapshot.val())
          $scope.Allobjects.push(snapshot.val())
          $scope.labels.push(snapshot.val().issued)
          $scope.issued.push(snapshot.val().issued)
          $scope.time.push(snapshot.val().time)
          $scope.dataDoughnutCateg.push(snapshot.val().category)
          $scope.data.push(snapshot.val().valueQuantity.value)
        }
      })
    }

    // firebase.auth().onAuthStateChanged(function(user) {
    //   if (user) {
    //     $scope.user = {
    //       id: user.uid
    //     };
    //     $scope.myData = [];
    //     $scope.labelsDoughnut2 = [];
    //     $scope.labels = [];
    //     $scope.issued = [];
    //     $scope.time = [];
    //     $scope.dataDoughnutCateg = [];
    //     $scope.data = [];
    //     $scope.Allobjects = [];
    //     $scope.getAllData();
    //   } else {
    //     $state.go("app.start");
    //   }
    // });
    // $scope.changedate = function(date_from, date_to) {
    //   if (date_from && date_to) {
    //     $scope.labels = [];
    //     $scope.issued = [];
    //     $scope.time = [];
    //     $scope.Allobjects = [];
    //     $scope.dataDoughnutCateg = [];
    //     $scope.data = [];
    //     var ref = firebase
    //       .database()
    //       .ref()
    //       .child("Dfhir")
    //       .child("Patients")
    //       .child($scope.user.id)
    //       .child("entry")
    //       .child("resource");
    //     ref.orderByChild("timeStamp").on("child_added", function(snapshot) {
    //       if (snapshot.val().resourceType == "Medication") {
    //         // console.log(snapshot.val());
    //         var dateFrom = new Date(date_from);
    //         var dateTo = new Date(date_to);
    //         var dateCheck = new Date(snapshot.val().issued);
    //         console.log(dateCheck >= dateFrom && dateCheck <= dateTo);
    //         if (dateCheck >= dateFrom && dateCheck <= dateTo) {
    //           $scope.Allobjects.push(snapshot.val());
    //           $scope.labels.push(snapshot.val().issued);
    //           $scope.issued.push(snapshot.val().issued);
    //           $scope.time.push(snapshot.val().time);
    //           $scope.dataDoughnutCateg.push(snapshot.val().category);
    //           $scope.data.push(snapshot.val().valueQuantity.value);
    //         }
    //       }
    //     });
    //   } else {
    //     $scope.labels = [];
    //     $scope.issued = [];
    //     $scope.time = [];
    //     $scope.Allobjects = [];
    //     $scope.dataDoughnutCateg = [];
    //     $scope.data = [];
    //     $scope.getAllData();
    //   }
    // };

    // $scope.changeLabel = function(categ) {
    //   if (categ == "time") {
    //     $scope.labels = $scope.time;
    //   } else if (categ == "category") {
    //     $scope.labels = $scope.dataDoughnutCateg;
    //   } else {
    //     $scope.labels = $scope.issued;
    //   }
    // };
  })

  // Shop controller.
  .controller('ShopCtrl', function (
    $scope,
    $ionicActionSheet,
    BackendService,
    CartService
  ) {
    // In this example feeds are loaded from a json file.
    // (using "getProducts" method in BackendService, see services.js)
    // In your application you can use the same approach or load
    // products from a web service.

    //using the CartService to load cart from localStorage
    $scope.cart = CartService.loadCart()

    $scope.doRefresh = function () {
      BackendService.getProducts()
        .success(function (newItems) {
          $scope.products = newItems
        })
        .finally(function () {
          // Stop the ion-refresher from spinning (not needed in this view)
          $scope.$broadcast('scroll.refreshComplete')
        })
    }

    // private method to add a product to cart
    var addProductToCart = function (product) {
      $scope.cart.products.push(product)
      CartService.saveCart($scope.cart)
    }

    // method to add a product to cart via $ionicActionSheet
    $scope.addProduct = function (product) {
      $ionicActionSheet.show({
        buttons: [{ text: '<b>Add to cart</b>' }],
        titleText: 'Buy ' + product.title,
        cancelText: 'Cancel',
        cancel: function () {
          // add cancel code if needed ..
        },
        buttonClicked: function (index) {
          if (index == 0) {
            addProductToCart(product)
            return true
          }
          return true
        }
      })
    }

    //trigger initial refresh of products
    $scope.doRefresh()
  })

  // controller for "app.cart" view
  .controller('CartCtrl', function ($scope, CartService, $ionicListDelegate) {
    // using the CartService to load cart from localStorage
    $scope.cart = CartService.loadCart()

    // we assign getTotal method of CartService to $scope to have it available
    // in our template
    $scope.getTotal = CartService.getTotal

    // removes product from cart (making in persistent)
    $scope.dropProduct = function ($index) {
      $scope.cart.products.splice($index, 1)
      CartService.saveCart($scope.cart)
      // as this method is triggered in an <ion-option-button>
      // we close the list after that (not strictly needed)
      $ionicListDelegate.closeOptionButtons()
    }
  })

  .controller('CheckoutCtrl', function ($scope, CartService, $state) {
    //using the CartService to load cart from localStorage
    $scope.cart = CartService.loadCart()
    $scope.getTotal = CartService.getTotal

    $scope.getTotal = CartService.getTotal

    // #NOT-IMPLEMENTED: This method is just calling alert()
    // you should implement this method to connect an ecommerce
    // after that the cart is reset and user is redirected to shop
    $scope.checkout = function () {
      alert('this implementation is up to you!')
      $scope.cart = CartService.resetCart()
      $state.go('app.shop')
    }
  })
