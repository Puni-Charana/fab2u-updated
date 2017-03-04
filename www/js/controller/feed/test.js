app.controller("newFeedCtrl",function($scope,userServices, $http, $location, $timeout,$cordovaToast,
                                      $cordovaCamera,$ionicPopup,$state, $ionicLoading,$rootScope){

    $scope.uid = localStorage.getItem("uid");
    $rootScope.$on('logged_in', function (event, args) {
        $scope.uid = window.localStorage.getItem('uid');
    });
    var blogData;
    var locDetails = JSON.parse(localStorage.getItem('selectedLocation'));

    $scope.feed = {};
    $timeout(function () {
        $ionicLoading.hide();
    }, 10000);

    if($scope.uid){
        getUserInfo();
    }
    else{
        showLoginSignUp()
    }

    function getUserInfo() {
        userServices.getUserInfo($scope.uid).then(function (result) {
            $scope.uname = result.name;
        })
    }

    $scope.galleryUpload = function() {
        $timeout(function () {
            $ionicLoading.show();
        }, 2000);
        var options = {
            destinationType : Camera.DestinationType.FILE_URI,
            sourceType :   Camera.PictureSourceType.PHOTOLIBRARY, //, Camera.PictureSourceType.CAMERA,
            allowEdit : false,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
        };
        $ionicLoading.hide();
        $cordovaCamera.getPicture(options).then(function(imageURI) {
            var image = document.getElementById('myImage');
            image.src = imageURI;
            $scope.url = imageURI;
            // if(imageURI){
            //     resizeImage(imageURI);
            // }
        }, function(err) {
            console.log(err);
        });
    };

    $scope.cameraUpload = function() {
        $timeout(function () {
            $ionicLoading.show();
        }, 2000);
        var options = {
            destinationType : Camera.DestinationType.FILE_URI,
            sourceType :   Camera.PictureSourceType.CAMERA,
            allowEdit : false,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
        };
        $ionicLoading.hide();

        $cordovaCamera.getPicture(options).then(function(imageURI) {
            var image = document.getElementById('myImage');
            image.src = imageURI;
            $scope.url = imageURI;
            // if(imageURI){
            //     resizeImage(imageURI);
            // }
        }, function(err) {
            console.log(err);
        });
    };

    function resizeImage(source){
        $ionicLoading.show();




        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");

        img = new Image();
        img.onload = function () {
            // alert("onload called javascript");
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            var dataURL = canvas.toDataURL("image/jpeg");

            $http.post("http://139.162.3.205/api/testupload", {path: dataURL})
                .success(function(response){
                    $scope.image_url = response.Message;
                    $(".upload").css("display", 'none');
                    var newBlogKey = db.ref().child("blogs").push().key;
                    blogData = {
                        blog_id: newBlogKey,
                        introduction: $scope.feed.introduction,
                        photoUrl:$scope.image_url,
                        user: {
                            user_name: $scope.uname,
                            user_id: localStorage.getItem("uid"),
                            user_email: localStorage.getItem("email")
                        },
                        active: true,
                        created_time: new Date().getTime(),
                        city_id: locDetails.cityId,
                        city_name: locDetails.cityName
                    };
                    var re = /#(\w+)(?!\w)/g, hashTag, tagsValue = [];
                    while (hashTag = re.exec($scope.feed.introduction)) {
                        tagsValue.push(hashTag[1]);
                    }
                    // blog object update without tags, functional
                    var updateBlog = {};
                    updateBlog['/blogs/' + newBlogKey] = blogData;
                    updateBlog['/cityBlogs/'+blogData.city_id+"/blogs/"+newBlogKey] = true;
                    db.ref().update(updateBlog);
                    for(var i=0; i<tagsValue.length; i++){
                        var tagsData = db.ref().child("tags").child(tagsValue[i]);
                        var tag_blog =  tagsData.child("blogs");
                        var obj = {};
                        obj[newBlogKey] = true;
                        console.log(obj);
                        tag_blog.update(obj);

                        var updates = {};
                        updates['/blogs/'+newBlogKey+'/tags/' + tagsValue[i]] = true;
                        db.ref().update(updates);
                    }
                    // user object update, functional
                    var authUpdate = {};
                    authUpdate['/users/data/'+ blogData.user.user_id+ '/blogs/' + newBlogKey] = true;// alert('4');
                    db.ref().update(authUpdate).then(function(){
                        $timeout(function () {
                            $ionicLoading.hide();
                            $location.path("/feed");
                        }, 0);
                    });


                })
                .error(function(response){
                    $scope.url = '';

                    $cordovaToast
                        .show('Please try after some time', 'long', 'center')
                        .then(function (success) {
                            // success
                        }, function (error) {
                            // error
                        });

                    $ionicLoading.hide();

                });
        }
        img.src = source;
        $(".upload").css("display", 'none');
    }

    $scope.submitFeed = function(){
        if($scope.uid){
            if(!$scope.feed.introduction && ! $scope.url){

                $cordovaToast
                    .show('Please add an image and description.', 'long', 'center')
                    .then(function (success) {
                        // success
                    }, function (error) {
                        // error
                    });

            }
            else if($scope.feed.introduction && ! $scope.url){

                $cordovaToast
                    .show('Please add an image', 'long', 'center')
                    .then(function (success) {
                        // success
                    }, function (error) {
                        // error
                    });


            }
            else if(!$scope.feed.introduction &&  $scope.url){

                $cordovaToast
                    .show('Please add description.', 'long', 'center')
                    .then(function (success) {
                        // success
                    }, function (error) {
                        // error
                    });


            }
            else if($scope.feed.introduction &&  $scope.url){
                resizeImage($scope.url);

                //
                // if($scope.feed.introduction.substring(0, 1) == '#'){
                //     var newBlogKey = db.ref().child("blogs").push().key;
                //     blogData = {
                //         blog_id: newBlogKey,
                //         introduction: $scope.feed.introduction,
                //         photoUrl:$scope.image_url,
                //         user: {
                //             user_name: $scope.uname,
                //             user_id: localStorage.getItem("uid"),
                //             user_email: localStorage.getItem("email")
                //         },
                //         active: true,
                //         created_time: new Date().getTime(),
                //         city_id: locDetails.cityId,
                //         city_name: locDetails.cityName
                //     };
                //     var re = /#(\w+)(?!\w)/g, hashTag, tagsValue = [];
                //     while (hashTag = re.exec($scope.feed.introduction)) {
                //         tagsValue.push(hashTag[1]);
                //     }
                //     // blog object update without tags, functional
                //     var updateBlog = {};
                //     updateBlog['/blogs/' + newBlogKey] = blogData;
                //     updateBlog['/cityBlogs/'+blogData.city_id+"/blogs/"+newBlogKey] = true;
                //     db.ref().update(updateBlog);
                //     for(var i=0; i<tagsValue.length; i++){
                //         var tagsData = db.ref().child("tags").child(tagsValue[i]);
                //         var tag_blog =  tagsData.child("blogs");
                //         var obj = {};
                //         obj[newBlogKey] = true;
                //         console.log(obj);
                //         tag_blog.update(obj);
                //
                //         var updates = {};
                //         updates['/blogs/'+newBlogKey+'/tags/' + tagsValue[i]] = true;
                //         db.ref().update(updates);
                //     }
                //     // user object update, functional
                //     var authUpdate = {};
                //     authUpdate['/users/data/'+ blogData.user.user_id+ '/blogs/' + newBlogKey] = true;// alert('4');
                //     db.ref().update(authUpdate).then(function(){
                //         $timeout(function () {
                //             $location.path("/feed");
                //         }, 0);
                //     });
                // }
                // else{
                //     $cordovaToast
                //         .show('Please add # in your description.', 'long', 'center')
                //         .then(function(success) {
                //             // success
                //         }, function (error) {
                //             // error
                //         });
                // }
            }
        }
        else{
            showLoginSignUp()
        }
    };
    $scope.goBack = function(){
        history.back();
    };
    function showLoginSignUp() {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Not logged in',
            template: 'Please login/sign up to continue'
        });
        confirmPopup.then(function(res) {
            if(res) {
                $ionicLoading.hide();
                $state.go('login')
            } else {
                console.log('You are not sure');
            }
        });
    }
});
