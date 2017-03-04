app.controller("newFeedCtrl",function($scope,userServices, $http, $location, $timeout,$cordovaToast,
                                      $cordovaCamera,$ionicPopup,$state, $ionicLoading,$rootScope,$ionicPopover){

    $scope.uid = localStorage.getItem("uid");
    $rootScope.$on('logged_in', function (event, args) {
        $scope.uid = window.localStorage.getItem('uid');
    });
    $scope.goBack = function(){
        history.back();
    };


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

    $scope.imageType = 'feeds';

    $scope.feedPushKey = db.ref().child("blogs").push().key;
    $scope.uploadPath = $scope.feedPushKey;
    $scope.uploadedImage = 'http://www.e-codices.unifr.ch/documents/media/Collections/img-not-available_en.jpg';



    $scope.createFeed = function(){
        if($scope.uid){
               $timeout(function () {
                   $scope.demo = true;
                   // $scope.popover.show($event);
               },100)
        }
        else{
           showLoginSignUp()
        }
    };
    $scope.createFeed();

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


    $scope.imageUploadResponseFn = function(valueFromDirective,feedDescription) {

       // alert(feedDescription)
        console.log("valueFromDirective",valueFromDirective)

        $scope.image_url = valueFromDirective;

        var newBlogKey = $scope.feedPushKey;
        blogData = {
            blog_id: newBlogKey,
            introduction: feedDescription,
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
        while (hashTag = re.exec(feedDescription)) {
            tagsValue.push(hashTag[1]);
        }
        // blog object update without tags, functional
        var updateBlog = {};
        updateBlog['/feeds/' + newBlogKey] = blogData;
        updateBlog['/cityFeeds/'+blogData.city_id+"/"+newBlogKey] = true;
        db.ref().update(updateBlog);
        for(var i=0; i<tagsValue.length; i++){
            var tagsData = db.ref().child("tags").child(tagsValue[i]);
            var tag_blog =  tagsData.child("blogs");
            var obj = {};
            obj[newBlogKey] = true;
            console.log(obj);
            tag_blog.update(obj);

            var updates = {};
            updates['/feeds/'+newBlogKey+'/tags/' + tagsValue[i]] = true;
            db.ref().update(updates);
        }
        // user object update, functional
        var authUpdate = {};
        authUpdate['/users/data/'+ blogData.user.user_id+ '/blogs/' + newBlogKey] = true;// alert('4');
        db.ref().update(authUpdate).then(function(){
            $timeout(function () {
                $ionicLoading.hide();
                $location.path("/feed");

                $cordovaToast
                    .show('Feed created successfully!', 'long', 'center')
                    .then(function (success) {
                        // success
                    }, function (error) {
                        // error
                    });

                // alert('post creation completed')
            }, 0);
        });

    }
});
