// app.controller("profileCtrl",function($scope, $timeout,$state, $ionicLoading, $http,
//                                       $cordovaCamera,userServices, $ionicModal,$cordovaToast){
//    $scope.uid = window.localStorage.uid;
//    var basic;
//
//    $timeout(function () {
//       $ionicLoading.hide();
//    }, 10000);
//
//    if($scope.uid){
//       getUserDetail();
//       function getUserDetail() {
//          $ionicLoading.show();
//          userServices.getUserInfo($scope.uid).then(function (result) {
//             $ionicLoading.hide();
//             if(result){
//                $scope.userDetails = result;
//             }
//             else{
//                $scope.userDetails = '';
//             }
//          })
//       }
//
//       $ionicModal.fromTemplateUrl('templates/user/image-crop.html', {
//          scope: $scope
//       }).then(function(modal) {
//          $scope.modal = modal;
//       });
//
//       $scope.cameraUpload = function() {
//          var options = {
//             destinationType : Camera.DestinationType.FILE_URI,
//             sourceType :	Camera.PictureSourceType.CAMERA,
//             allowEdit : false,
//             encodingType: Camera.EncodingType.JPEG,
//             popoverOptions: CameraPopoverOptions,
//          };
//          $cordovaCamera.getPicture(options).then(function(imageURI) {
//             var image = document.getElementById('profile-pic');
//             image.src = imageURI;
//             $scope.url = imageURI;
//             // alert(JSON.stringify(imageURI)+ 'line number 283, imageURI');
//             if($scope.url){
//                cropImage($scope.url);
//             }
//             // resizeImage(imageURI);
//          }, function(err) {
//             console.log(err);
//          });
//       };
//
//       function cropImage(source){
//          var basic = {};
//          $scope.modal.show();
//          basic = $('.demo').croppie({
//             viewport: {
//                width: 200,
//                height: 200,
//                type: 'circle'
//             }
//          });
//          basic.croppie('bind', {
//             url: source
//          });
//       }
//
//       $scope.testFunc = function(){
//          $scope.modal.show();
//       }
//
//       $scope.cropClick = function() {
//          basic.croppie('result', {
//             type: 'canvas',
//             format: 'jpeg',
//             circle: true
//          }).then(function (resp) {
//             // alert('test');
//             // alert(JSON.stringify(resp));
//             $http.post("http://139.162.3.205/api/testupload", {path: resp})
//                 .success(function (response) {
//                    $ionicLoading.hide();
//
//                    // alert("success  uploaded on server"+JSON.stringify(response));
//
//                    var updates1 = {};
//                    // alert($scope.uid + " " + response.Message);
//                    updates1["/users/data/" + $scope.uid + "/photoUrl"] = response.Message;
//                    window.localStorage.setItem("userPhoto", response.Message);
//                    db.ref().update(updates1).then(function () {
//                       // alert("updated in users obj")
//                       user.updateProfile({
//                          photoURL: response.Message
//                       }).then(function () {
//                          $cordovaToast
//                              .show('Photo updated successfully', 'long', 'center')
//                              .then(function (success) {
//                                 // success
//                              }, function (error) {
//                                 // error
//                              });
//                          $scope.modal.hide();
//                       });
//                    });
//
//                 })
//                 .error(function (response) {
//                    $ionicLoading.hide();
//                    $cordovaToast
//                        .show('Please try again, something went wrong', 'long', 'center')
//                        .then(function (success) {
//                           // success
//                        }, function (error) {
//                           // error
//                        });
//                 });
//          })
//       };
//       $scope.galleryUpload = function() {
//          var options = {
//             destinationType : Camera.DestinationType.FILE_URI,
//             sourceType :	Camera.PictureSourceType.PHOTOLIBRARY, //, Camera.PictureSourceType.CAMERA,
//             allowEdit : false,
//             encodingType: Camera.EncodingType.JPEG,
//             popoverOptions: CameraPopoverOptions,
//          };
//          $cordovaCamera.getPicture(options).then(function(imageURI) {
//             var image = document.getElementById('profile-pic');
//             // image.src = imageURI;
//             $scope.url = imageURI;
//             if($scope.url) {
//                cropImage($scope.url);
//             }
//             // resizeImage(imageURI);
//          }, function(err) {
//             console.log(err);
//          });
//       };
//
//       $scope.goBack = function(){
//          history.back();
//       };
//
//    }
//    else{
//       $state.go('login')
//    }
// });

app.controller("profileCtrl", function($scope,$location, $timeout, $ionicLoading, $http,
                                       $cordovaCamera, $ionicModal){
   $scope.uid = window.localStorage.uid;
   console.log($scope.uid);
   $scope.email = window.localStorage.email;

   $scope.goBack = function(){
      history.back();
   }

      $ionicModal.fromTemplateUrl('templates/user/image-crop.html', {
         scope: $scope
      }).then(function(modal) {
         $scope.modal1 = modal;
      });


   $scope.testData = 'asdsdfb';

   $ionicLoading.show();

   $timeout(function () {
      $ionicLoading.hide();
   }, 10000);

   firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
         // User is signed in.
         console.log(user);

         db.ref("users/data/"+$scope.uid).on("value", function(snapshot){
            $ionicLoading.hide();
            console.log(snapshot.val());
            $scope.userDetails = snapshot.val();
         });

         $scope.galleryUpload = function() {
            var options = {
               destinationType : Camera.DestinationType.DATA_URL,
               sourceType :	Camera.PictureSourceType.PHOTOLIBRARY, //, Camera.PictureSourceType.CAMERA,
               allowEdit : false,
               encodingType: Camera.EncodingType.JPEG,
               popoverOptions: CameraPopoverOptions,
            };
            $cordovaCamera.getPicture(options).then(function(imageURI) {
               var image = document.getElementById('profile-pic');
               image.src = "data:image/jpeg;base64,"+imageURI;
               $scope.url = imageURI;
               $scope.image_base_64 = image.src;
               cropImage($scope.image_base_64);
               // resizeImage(imageURI);
            }, function(err) {
               console.log(err);
            });
         };


         $scope.cameraUpload = function() {
            var options = {
               destinationType : Camera.DestinationType.DATA_URL,
               sourceType :	Camera.PictureSourceType.CAMERA,
               allowEdit : false,
               encodingType: Camera.EncodingType.JPEG,
               popoverOptions: CameraPopoverOptions,
            };

            $cordovaCamera.getPicture(options).then(function(imageURI) {
               var image = document.getElementById('profile-pic');
               image.src = "data:image/jpeg;base64,"+imageURI;
               $scope.url = imageURI;
               $scope.image_base_64 = image.src;
               cropImage($scope.image_base_64);
            }, function(err) {
               console.log(err);
            });
         };

         $scope.testFunc = function(){
            $scope.modal1.show();
         }

         var basic;

         function cropImage(source){
            console.log("source",source)
            $scope.modal1.show();
            basic = $('.demo').croppie({
               viewport: {
                  width: 200,
                  height: 200,
                  type: 'circle'
               }
            });
            basic.croppie('bind', {
               url: source
            });
         }

         $scope.cropClick = function(){
            $ionicLoading.show({
               template: 'Loading! Please wait...'
            });
            basic.croppie('result', {
               type: 'canvas',
               format: 'jpeg',
               circle: true
            }).then(function (resp) {
               // alert(JSON.stringify(resp));
               $http.post("http://139.162.3.205/api/testupload", {path: resp})
                   .success(function(response){
                      var updates1 = {};
                      updates1["/users/data/"+$scope.uid+"/photoUrl"] = response.Message;
                      window.localStorage.setItem("userPhoto", response.Message);
                      db.ref().update(updates1).then(function(){
                         user.updateProfile({
                            photoURL: response.Message
                         }).then(function(){
                            $ionicLoading.hide();
                            alert("photo updated in firebase object");
                            $scope.modal1.hide();
                         });
                      });

                   })
                   .error(function(response){
                      $ionicLoading.hide();
                      alert(JSON.stringify(response));
                   });
            });
         }

         function resizeImage(source){
            alert('resizeImage called')
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");

            img = new Image();
            alert('img '+ img);
            img.onload = function () {
               // alert("onload called javascript");
               canvas.height = canvas.width * (img.height / img.width);
               /// step 1
               var oc = document.createElement('canvas');
               var octx = oc.getContext('2d');
               oc.width = img.width * 0.5;
               oc.height = img.height * 0.5;
               octx.drawImage(img, 0, 0, oc.width, oc.height);
               /// step 2
               octx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5);
               ctx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5, 0, 0, canvas.width, canvas.height);
               // alert(canvas.width+" "+canvas.height+" "+img.width+" "+img.height);
               var dataURL = canvas.toDataURL("image/jpeg");
               alert('dataURL ' + dataURL);

               $http.post("http://139.162.3.205/api/testupload", {path: dataURL})
                   .success(function(response){
                      alert("success "+JSON.stringify(response));

                      var updates1 = {};
                      alert($scope.uid + " " + response.Message);
                      updates1["/users/data/"+$scope.uid+"/photoUrl"] = response.Message;
                      window.localStorage.setItem("userPhoto", response.Message);
                      db.ref().update(updates1).then(function(){
                         alert("updated in users obj")
                         user.updateProfile({
                            photoURL: response.Message
                         }).then(function(){
                            alert("photo updated in firebase object");
                         });
                      });

                   })
                   .error(function(response){
                      alert(JSON.stringify(response));
                   });
            }
            alert('source '+ source);
            img.src = source;
         }
      }
      else{
         $ionicLoading.hide();
         $location.path("#/login");
      }
   });
});