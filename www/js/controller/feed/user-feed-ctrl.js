app.controller("userFeedCtrl", function($scope,userInfoService, $timeout,$cordovaCamera,
                                        $http,$state, $location,$ionicModal, $ionicLoading,$sce,
                                        $ionicPopup,$cordovaToast,$ionicPopover,$rootScope){

    if(checkLocalStorage('uid')){
        $scope.myUid = window.localStorage.getItem("uid");
    }
    $rootScope.$on('logged_in', function (event, args) {
        $scope.myUid = window.localStorage.getItem('uid');
    });
    $scope.cityId = JSON.parse(window.localStorage.getItem('selectedLocation')).cityId;
    $scope.blogIdList = {};
    $scope.moreMessagesScroll = true;
    $scope.myBlogIds = [];
    $scope.blogArr = [];
    $scope.storedIds = [];
    $scope.followingIds = {};
    $scope.myFollowersDetail = {};
    $scope.blogIdList = {};
    $scope.blogLength = 0;
    var blogsNum= 0;
    var blogCount = 0;
    var count = 0;
    var count1 =0;
    var followingNum = 0;
    var functionCallCount = 0;
    $scope.totalLikes = 0;
    delete window.localStorage.iFollowingIds;
    delete window.localStorage.myFollowers;

    // Open a in app browser
    $scope.openUrl = function(url){
        window.open(url, '_blank', 'location=yes');
        return false;
    }

    // ----------------------------------------------------------------------
    $ionicModal.fromTemplateUrl('templates/feed/image-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.openModal = function() {
        $scope.modal.show();
    };

    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });

    $scope.showImage = function(source) {
        $scope.imageSrc = source;
        $scope.openModal();
    }
    // ----------------------------------------------------------------------

    $scope.imageType = 'users';
    $scope.uploadPath = $scope.myUid;
    $scope.uploadedImage = 'http://www.e-codices.unifr.ch/documents/media/Collections/img-not-available_en.jpg';

    // $scope.imageName = uid;
    // http://1272343129.rsc.cdn77.org/fab2u/general/854b6f33-2b00-4f91-b637-2a36e61cebf0-m.jpeg
    $scope.imageUploadResponseFn = function(valueFromDirective) {

        db.ref('/users/data/' + $scope.myUid + '/photoUrl').set(valueFromDirective).then(function() {
            // $scope.userDetails.photoUrl = valueFromDirective;

            $scope.userDetails.photoUrl = "http://1272343129.rsc.cdn77.org/fab2u/users/"+$scope.myUid+
            "/"+valueFromDirective+"-xs.jpg";

            $cordovaToast
            .show('Photo updated successfully!', 'long', 'center')
            .then(function (success) {
                // success
            }, function (error) {
                // error
            });
         });
        console.log("valueFromDirective",valueFromDirective)
    }

    if($scope.myUid){
        /////////////do all things here

        function getPersonalInfo() {
            userInfoService.getPersonalInfo($scope.myUid).then(function (result) {
                console.log(result)
                $scope.userDetails = result;
                if($scope.userDetails.photoUrl){
                    $scope.userDetails.photoUrl = "http://1272343129.rsc.cdn77.org/fab2u/users/"+$scope.myUid+
                        "/"+$scope.userDetails.photoUrl+"-xs.jpg";

                }


                if($scope.userDetails.following){
                    $scope.following = Object.keys($scope.userDetails.following).length;
                    $scope.followingIds = $scope.userDetails.following;
                }
                if($scope.userDetails.blogs){
                    $scope.numFeeds = Object.keys($scope.userDetails.blogs).length;
                }
                if($scope.userDetails.myFollowers){
                    $scope.followers = Object.keys($scope.userDetails.myFollowers).length;
                    $scope.myFollowersDetail = $scope.userDetails.myFollowers;
                }
                if($scope.userDetails.likedBlogs){
                    $scope.totalLikes = Object.keys($scope.userDetails.likedBlogs).length;
                    $scope.likeBlogIds = $scope.userDetails.likedBlogs;
                }
                if(functionCallCount>0) {
                    $scope.likeFeeds();
                }
                functionCallCount++;
            })
        }
        getPersonalInfo();



        ////////////////////////////Total posts///////////////////////
        $scope.$on('$stateChangeSuccess', function() {
            getPostInfo();
        });

        function getPostInfo(){
            // $ionicLoading.show();
            if(Object.keys($scope.blogIdList).length == 0){
                db.ref("users/data/"+$scope.myUid +"/blogs").limitToLast(5).once("value", function(snapshot){
                   if(snapshot.val()){
                       $scope.blogIdList = snapshot.val();
                       $scope.blogLength = Object.keys($scope.blogIdList).length;
                       if($scope.blogIdList !== null){
                           $scope.bottomKey = Object.keys($scope.blogIdList)[0];
                       }
                       for(var key in snapshot.val()){
                           blogAlgo(key);
                       }
                   }
                });
            }		//db.ref("blogs").orderByKey().limitToFirst(6).endAt($scope.bottomKey)
            else if(Object.keys($scope.blogIdList).length > 0){
                db.ref("users/data/"+$scope.myUid+"/blogs").
                orderByKey().limitToFirst(6).endAt($scope.bottomKey).once("value", function(snap){
                    if(snap.numChildren() == 1){
                        $scope.moreMessagesScroll = false;
                        $ionicLoading.hide();
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }
                    else{
                        $scope.oldBottomKey = $scope.bottomKey;
                        $scope.bottomKey = Object.keys(snap.val())[0];
                        $scope.blogLength = Object.keys(snap.val()).length - 1;
                        count1 = 0;
                        for(var key in snap.val()){
                            if (key != $scope.oldBottomKey){
                               blogAlgo(key);
                            }
                        }
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }
                })
            }

        }

        /////////////////////        posts detail            //////////////////////
        function blogAlgo(i){
            count1++;
            var blogData = db.ref().child("feeds").child(i);
            blogData.once("value", function(snap){ //access individual blog
                $timeout(function(){
                    single_blog = snap.val();
                    console.log("single bloggg",JSON.stringify(single_blog))
                    if(single_blog!=null){
                        single_blog.profilePic = $scope.userPhoto;
                        if(single_blog.photoUrl){
                            single_blog.photoUrl = "http://1272343129.rsc.cdn77.org/fab2u/feeds/"+
                                single_blog.blog_id+"/"+single_blog.photoUrl+'-m.jpg';
                            // if(snap.val().photoUrl.indexOf('http')==-1){
                            //     // single_blog.photoUrl = "http://1272343129.rsc.cdn77.org/fab2u/feeds/"+
                            //     //     single_blog.blog_id+"/"+single_blog.photoUrl+"-m.jpg";
                            //     single_blog.photoUrl = "http://cdn.roofpik.com/roofpik/fab2u/post/"+snap.val().user.user_id+
                            //         "/postImage/"+snap.val().photoUrl+'-m.jpg';
                            // }
                            // else{
                            //     single_blog.photoUrl = snap.val().photoUrl;
                            // }
                        }
                        if(single_blog.introduction){
                            var temp = single_blog.introduction;
                            single_blog.introduction =  temp.replace(/#(\w+)(?!\w)/g,'<a href="#/tag/$1">#$1</a><span>&nbsp;</span>');
                        }
                        if(single_blog.comments){
                            single_blog['commentCount'] = Object.keys(single_blog.comments).length;
                        }
                        single_blog['commentsArr'] = $.map(single_blog.comments, function(value, index) {
                            return [value];
                        });
                        single_blog.liked = false;
                        if(single_blog.likedBy){
                            var count2 = Object.keys(single_blog.likedBy).length;
                            single_blog['numLikes'] = count2;
                            if($scope.myUid in single_blog.likedBy){
                                single_blog.liked = true;
                            }
                        }
                        console.log(single_blog);
                        $scope.blogArr.push(single_blog);
                        console.log($scope.blogArr);
                    }
                });

            });
            if(count1 == $scope.blogLength){
                $ionicLoading.hide();
                $scope.moreMessagesScroll = true;
            }
        }


        ///////////////////////Get post Info function /////////////////


        $scope.postInfo = function(){
            location.reload();
        };


        ///////////////////end Get post Info ///////////////////////
        /////////////////////liked post Info/////////////////////////////////


        $scope.likeFeeds = function(){
            $scope.blogArr = [];
            $ionicLoading.show();
            if($scope.likeBlogIds){
                $scope.blogLength = Object.keys($scope.likeBlogIds).length;
                count1 = 0;
                console.log($scope.totalLikes)
                if($scope.totalLikes>0){
                    for(key in $scope.likeBlogIds){
                        blogAlgo(key);
                    }
                }
            }
            else{
                $ionicLoading.hide();

                    $cordovaToast
                        .show('You do not have any liked post yet.For more liked post use our services and create post.', 'long', 'center')
                        .then(function (success) {
                            // success
                        }, function (error) {
                            // error
                        });

            }
        };

        //////////////////////end liked post info///////////////////

        ///////////////////////Get follower count and detail /////////////

        $scope.myFollowers = function(val){
            $ionicLoading.show();
            console.log("val",val)
            if(val){
                window.localStorage['myFollowers'] = JSON.stringify($scope.myFollowersDetail);
                $ionicLoading.hide();
                $state.go('follower',{uid:$scope.myUid });
            }
            else{
                $ionicLoading.hide();

                    $cordovaToast
                        .show('You do not have any follower yet.For more follower use our services and create post.', 'long', 'center')
                        .then(function (success) {
                            // success
                        }, function (error) {
                            // error
                        });

            }
        };

        //////////////////////end get follower info //////////////////////

        //////////////////////Get follow info //////////////////////////

        $scope.followDetail = function (val) {
            $ionicLoading.show();
            if(val){
                window.localStorage['iFollowingIds'] = JSON.stringify($scope.followingIds);
                $ionicLoading.hide();
                $state.go('follow',{uid:$scope.myUid});
            }
            else{
                $ionicLoading.hide();

                $cordovaToast
                .show('You do not have any follow yet.For more follow  see Fabbook', 'long', 'center')
                .then(function (success) {
                    // success
                }, function (error) {
                    // error
                });

            }
        };

        ///////////////////////end follow detail  ////////////////////////
        //////////////////////////Like a particular feed ////////////////
        $scope.likeThisFeed = function(feed){
            $ionicLoading.show();
                if(feed.liked){
                    feed.numLikes -= 1;
                    db.ref("feeds/"+feed.blog_id+"/likedBy/"+$scope.myUid).remove().then(function(){
                        db.ref("users/data/"+$scope.myUid+'/likedBlogs/'+feed.blog_id).remove().then(function () {
                            $timeout(function(){
                                feed.liked = false;

                                    $cordovaToast
                                    .show('This post removed from your liked list', 'long', 'center')
                                    .then(function (success) {
                                        // success
                                    }, function (error) {
                                        // error
                                    });
                                    $ionicLoading.hide();

                            },0);
                            delete $scope.likeBlogIds[feed.blog_id];
                        })
                    });
                }
                else {
                    if (feed.numLikes == undefined) {
                        feed.numLikes = 0;
                    }
                    feed.numLikes += 1;
                    var updates = {};
                    updates["feeds/" + feed.blog_id + "/likedBy/" + $scope.myUid] = true;
                    updates["users/data/"+$scope.myUid+'/likedBlogs/'+feed.blog_id] = true;
                    db.ref().update(updates).then(function () {
                        $timeout(function(){
                            feed.liked = true;

                            $cordovaToast
                            .show('This post added to your liked list', 'long', 'center')
                            .then(function (success) {
                                // success
                            }, function (error) {
                                // error
                            });
                            $ionicLoading.hide();

                        },0);
                        if(!$scope.likeBlogIds){
                            $scope.likeBlogIds = {};
                        }
                        $scope.likeBlogIds[feed.blog_id] = true;
                    });
                }
                // db.ref("feeds/"+feed.blog_id+"/likedBy").on("value", function(snap){
                //     $ionicLoading.hide();
                //     feed.numLikes = snap.numChildren();
                //     getPersonalInfo();
                // });
        };

        /////////////////////////////end like particular feed///////////////////////////

        /////////////////Comment over particular feed ////////////////////////////////
        $scope.commentPost = function(id) {
                $scope.data = {}
                var myPopup = $ionicPopup.show({
                    template: '<input type="text" ng-model="data.comment">',
                    title: 'Enter your Comment',
                    // subTitle: 'Please use normal things',
                    scope: $scope,
                    buttons: [
                        {text: 'Cancel'},
                        {
                            text: '<b>Comment</b>',
                            type: 'button-positive',
                            onTap: function (e) {
                                if (!$scope.data.comment) {
                                    e.preventDefault();
                                } else {
                                    console.log(id);
                                    var newCommentKey = db.ref().push().key;
                                    var commentObject_blog = {
                                        blogId: id,
                                        created_time: new Date().getTime(),
                                        comment: $scope.data.comment,
                                        userId: $scope.myUid,
                                        userName: $scope.userDetails.name
                                    };
                                    console.log(commentObject_blog);
                                    var updateComment = {};
                                    updateComment['feeds/' + id + '/comments/' + newCommentKey] = commentObject_blog;
                                    // updateComment['users/data/'+myUid+"/comments/"+newCommentKey] = commentObject_user;
                                    db.ref().update(updateComment).then(function () {
                                        console.log('comment addedd successfully');
                                        // start: adding comment to particular feed
                                        var result = $.grep($scope.blogArr, function (e) {
                                            return e.blog_id == id;
                                        });
                                        console.log(result);
                                        if (result[0].commentCount == undefined) {
                                            result[0].commentCount = 0;
                                        }
                                        $timeout(function () {
                                            result[0].commentCount += 1;
                                            result[0].commentsArr.push(commentObject_blog);
                                            $("#" + id + "-commentsBlock").show();
                                        }, 0);
                                        // end: adding comment to particular feed
                                    });
                                    return $scope.data.comment;
                                }
                            }
                        },
                    ]
                });
                myPopup.then(function (res) {
                    console.log('Tapped!', res, id);
                });
        };
        $scope.commentToggle = function(feedId) {
            $("#"+feedId+"-commentsBlock").toggle();
        };
        $scope.goBack = function(){
            $ionicLoading.hide();
            $location.path("/app/home");
        };
        $scope.toTrustedHTML = function( html ){
            return $sce.trustAsHtml( html );
        };

        $scope.createNew = function(){
            $ionicLoading.hide();
            $location.path("/new-feed");
        };

        //////////////////////////////LoadMore feeds ///////////////////////////////////////

        $scope.loadMore = function(){
            getPostInfo();
        };

    }
    else{
       showLoginSignUp();
    }
    function showLoginSignUp() {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Not logged in',
            template: 'Please login/sign up to continue'
        });
        confirmPopup.then(function(res) {
            if(res) {
                $ionicLoading.hide();
                $rootScope.from ={
                    stateName: 'userFeed',
                    params:''
                }
                $state.go('login')
            } else {
                $ionicLoading.hide();
               $state.go('feed')
            }
        });
    }

    $ionicPopover.fromTemplateUrl('templates/popover.html', {
        scope: $scope,
    }).then(function(popover) {
        $scope.popover = popover;
    });

    $scope.openPopover = function($event,Post) {
        $scope.popover.show($event);
        console.log("uidForPost",Post)
        $scope.postInfo = Post
    };

    $scope.deletePost = function (post) {
        if(post.$$hashKey){
            delete post.$$hashKey;
        }
        if(post.profilePic==undefined){
            delete post.profilePic;
        }
        var confirmPopup = $ionicPopup.confirm({
            title: 'Are you sure?',
            template: 'You want to delete this post.'
        });
        confirmPopup.then(function(res) {
            if(res) {
                $ionicLoading.show();
                firebase.database().ref('deleted-blogs/' + post.feed_id).set(post).then(function() {

                    var updates = {};

                    for(key in post.likedBy){
                        updates['users/data/'+key+'/likedBlogs/'+post.feed_id] = null;
                    }

                    updates['feeds/' + post.feed_id] = null;
                    updates['users/data/'+post.user.user_id+'/blogs/'+post.feed_id] = null;
                    updates['cityFeeds/'+post.city_id+'/'+post.feed_id] = null;
                    console.log(updates);
                    firebase.database().ref().update(updates).then(function() {
                        $ionicLoading.show();
                        $scope.popover.hide();
                        $cordovaToast
                            .show('Post deleted successfully', 'long', 'center')
                            .then(function (success) {
                                // success
                            }, function (error) {
                                // error
                            });
                        location.reload();
                    });
                });
            }
            else {
                $scope.popover.hide();
                console.log('You are not sure');
            }
        });

    };
});
