app.controller("followPostsCtrl", function(userInfoService,$scope,$stateParams,$state,$timeout,
                                           $ionicLoading,$location,$ionicPopup,$cordovaToast,
                                           $ionicModal,$rootScope,$sce, $ionicPopover){

    if(checkLocalStorage('uid')){
        $scope.myUid = window.localStorage.getItem("uid");
    }
    $rootScope.$on('logged_in', function (event, args) {
        $scope.myUid = window.localStorage.getItem('uid');
    });
    var followId = $stateParams.followId;
    $scope.followOption = false;

    $scope.uid = window.localStorage.getItem("uid");
    $scope.cityId = JSON.parse(window.localStorage.getItem('selectedLocation')).cityId;
    $scope.blogIdList = {};
    $scope.moreMessagesScroll = true;
    $scope.blogArr = [];
    $scope.dataLoaded = false;
    $scope.blogLength = 0;
    var count = 0;
    $timeout(function () {
        $ionicLoading.hide();
    }, 10000);

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

    if($scope.myUid){
        myInfo();
    }
    if(followId){
        followOrFollowerDetail();
    }
    else{
        showLoginSignUp()
    }

    function myInfo() {
        userInfoService.getPersonalInfo($scope.myUid).then(function (result) {
            $scope.myName = result.name;
        })
    }
    function followOrFollowerDetail() {
        userInfoService.getPersonalInfo(followId).then(function (result) {
            $scope.userDetails = result;
            $scope.email = result.email.userEmail;
            // $scope.userPhoto = result.photoUrl;
            if(result.photoUrl){
                $scope.userPhoto = "http://1272343129.rsc.cdn77.org/fab2u/users/"+followId+
                    "/"+result.photoUrl+"-xs.jpg";
            }
        })
    }

    $scope.commentToggle = function(feedId) {
        $("#"+feedId+"-commentsBlock").toggle();
    };
    // $scope.$on('$stateChangeSuccess', function() {
    //     $scope.loadMore();
    // });


    $scope.doRefresh = function () {
        console.log("top key",$scope.topKey)
        db.ref("users/data/"+followId+"/blogs").orderByKey().startAt($scope.topKey).once("value", function (snapshot) {
            console.log(snapshot.val());
            if (snapshot.numChildren() == 1) {
                console.log('one child');
                $scope.moreMessagesRefresh = false;
            }
            else {
                console.log(snapshot.val());
                $scope.prevTopKey = $scope.topKey;
                $scope.topKey = Object.keys(snapshot.val())[Object.keys(snapshot.val()).length - 1];
                var single_blog = {};
                for (var i in snapshot.val()) {
                    // console.log(i); // i is the key of blogs object or the id of each blog
                    if (i != $scope.prevTopKey) {
                        blogAlgo(i);
                    }
                }
            }
            $scope.$broadcast('scroll.refreshComplete');
        })
    };

    $scope.loadMore = function(){
        $ionicLoading.show()
        if(Object.keys($scope.blogIdList).length > 0){
            db.ref("users/data/"+followId+"/blogs").orderByKey().limitToFirst(6).endAt($scope.bottomKey).once("value", function(snap){
                if(snap.numChildren() == 1){
                    $scope.moreMessagesScroll = false;
                    $ionicLoading.hide();
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }
                else{
                    $scope.oldBottomKey = $scope.bottomKey;
                    $scope.bottomKey = Object.keys(snap.val())[0];
                    $scope.blogLength = Object.keys(snap.val()).length - 1;
                    count = 0;
                    for(var i in snap.val()){
                        if (i != $scope.oldBottomKey){
                            blogAlgo(i);
                        }
                    }
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }
            })
        }
        else if(Object.keys($scope.blogIdList).length == 0){
            db.ref("users/data/"+followId +"/blogs").limitToLast(5).once("value", function(snapshot){
                if(snapshot.val()){
                    $scope.blogIdList = snapshot.val();
                    if($scope.blogIdList !== null){
                        $scope.bottomKey = Object.keys($scope.blogIdList)[0];
                        $scope.topKey = Object.keys($scope.blogIdList)[Object.keys($scope.blogIdList).length - 1];

                    }
                    $scope.blogLength = Object.keys($scope.blogIdList).length;
                    for(var i in $scope.blogIdList){
                        blogAlgo(i);
                    }
                    $scope.dataLoaded = true;
                    $ionicLoading.hide();
                }
                else{
                    $scope.dataLoaded = true;
                    $ionicLoading.hide();

                        $cordovaToast
                            .show('No feeds available!', 'long', 'center')
                            .then(function (success) {
                                // success
                            }, function (error) {
                                // error
                            });

                }

            });
        }
    };
    $scope.loadMore();
    $scope.toTrustedHTML = function( html ){
        return $sce.trustAsHtml( html );
    };
    function blogAlgo(i){
        count++;
        var blogData = db.ref().child("feeds").child(i);
        blogData.once("value", function(snap){ //access individual blog
           single_blog = snap.val();
            if(single_blog){
                single_blog.profilePic = $scope.userPhoto;
                if(single_blog.photoUrl){
                    single_blog.photoUrl = "http://1272343129.rsc.cdn77.org/fab2u/feeds/"+
                        single_blog.blog_id+"/"+single_blog.photoUrl+'-m.jpg';
                    // if(snap.val().photoUrl.indexOf('http')==-1){
                    //     single_blog.photoUrl = "http://cdn.roofpik.com/roofpik/fab2u/post/"+snap.val().user.user_id+
                    //         "/postImage/"+snap.val().photoUrl+'-m.jpg';
                    //     // single_blog.photoUrl = "http://1272343129.rsc.cdn77.org/fab2u/feeds/"+
                    //     //     single_blog.blog_id+"/"+single_blog.photoUrl+"-m.jpg";
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
                (function(single_blog){
                    if(single_blog.user.user_id == $scope.myUid){
                        $timeout(function () {
                            $('.'+single_blog.user.user_id+'-follow').hide();
                            $scope.followOption = true;

                        }, 0);
                    }
                    db.ref("users/data/"+single_blog.user.user_id).once("value", function(snap){
                        if(snap.val().photoUrl){
                            // single_blog.profilePic = snap.val().photoUrl;
                            // if(snap.val().photoUrl.indexOf('http')==-1){
                            //     single_blog.profilePic = "http://cdn.roofpik.com/roofpik/fab2u/profile/"+snap.val().userId+
                            //         "/profileImage/"+snap.val().photoUrl+'-m.jpg';
                            // }
                            // else{
                            //     single_blog.profilePic = snap.val().photoUrl;
                            // }
                            single_blog.profilePic = "http://1272343129.rsc.cdn77.org/fab2u/users/"+single_blog.user.user_id+
                                "/"+snap.val().photoUrl+"-xs.jpg";
                        }
                        if(snap.val().myFollowers){

                            for(key in snap.val().myFollowers){
                                console.log("key",key)
                                if($scope.myUid  == key){
                                    $timeout(function() {
                                        $('.' + single_blog.user.user_id + '-follow').hide();
                                        $("." + single_blog.user.user_id + '-unfollow').css("display", "block");
                                        $scope.followOption = true;
                                    }, 0);
                                }
                            }

                            // if ($scope.myUid in snap.val().myFollowers){
                            //     $timeout(function () {
                            //         $('.'+single_blog.user.user_id+'-follow').hide();
                            //         $("."+single_blog.user.user_id+'-unfollow').css("display", "block");
                            //         $scope.followOption = true;
                            //     }, 0);
                            // }
                        }
                    });
                })(single_blog);
                if(single_blog.likedBy){
                    var count11 = Object.keys(single_blog.likedBy).length;
                    single_blog['numLikes'] = count11;
                    if($scope.myUid in single_blog.likedBy){
                        $timeout(function () {
                            single_blog.liked = true;
                        }, 0);
                    }
                }
                $scope.blogArr.push(single_blog);
            }
        })
        if(count == $scope.blogLength){
            $ionicLoading.hide();
            $scope.moreMessagesScroll = true;
        }
    }

    $scope.commentPost = function(id) {
        if($scope.myUid){
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
                                var newCommentKey = db.ref().push().key;
                                var commentObject_blog = {
                                    blogId: id,
                                    created_time: new Date().getTime(),
                                    comment: $scope.data.comment,
                                    userId: $scope.myUid,
                                    userName: $scope.myName
                                };
                                var updateComment = {};
                                updateComment['feeds/' + id + '/comments/' + newCommentKey] = commentObject_blog;
                                db.ref().update(updateComment).then(function () {
                                    // start: adding comment to particular feed
                                    var result = $.grep($scope.blogArr, function (e) {
                                        return e.blog_id == id;
                                    });
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
                    }
                ]
            });
            myPopup.then(function (res) {
                console.log('Tapped!', res, id);
            });
        }
        else{
            showLoginSignUp()
        }
    };

    $scope.likeThisFeed = function(feed){
        $ionicLoading.show()
        if($scope.myUid){
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

                        },0);
                    })
                });
            }
            else {
                if (feed.numLikes == undefined) {
                    feed.numLikes = 0;
                }
                feed.numLikes += 1;
                var updates = {};
                updates["users/data/"+$scope.myUid+'/likedBlogs/'+feed.blog_id] = true;
                updates["feeds/" + feed.blog_id + "/likedBy/" + $scope.myUid] = true;
                db.ref().update(updates).then(function () {
                    $timeout(function () {
                        feed.liked = true;

                            $cordovaToast
                                .show('This post added to your liked list', 'long', 'center')
                                .then(function (success) {
                                    // success
                                }, function (error) {
                                    // error
                                });

                    }, 0);
                });
            }
            db.ref("feeds/"+feed.blog_id+"/likedBy").on("value", function(snap){
                feed.numLikes = snap.numChildren();
                $ionicLoading.hide()
                $state.go('followPosts',{followId:followId})
            });

        }
        else{
            $ionicLoading.hide()
            showLoginSignUp()
        }
    }

    $scope.followUser = function(id) {
        $ionicLoading.show()
        if (!$scope.myUid) {
            $ionicLoading.hide()
            showLoginSignUp()
        }
        else {
            var updateFollow = {};
            updateFollow['users/data/' + id + '/myFollowers/' + $scope.myUid] = true;
            updateFollow['users/data/' + $scope.uid + '/following/' + id] = true;
            db.ref().update(updateFollow).then(function () {
                $('.' + id + '-follow').hide();
                $("."+id+'-unfollow').css("display", "block");
                $scope.followOption = true;
                $ionicLoading.hide();
                $scope.popover.hide();

                    $cordovaToast
                        .show('This user added to your follow list', 'long', 'center')
                        .then(function (success) {
                            // success
                        }, function (error) {
                            // error
                        });

                $state.go('feed')
            });
        }
    };

    $scope.unfollowUser = function(id){
        $ionicLoading.show()
        if(!$scope.myUid){
            $ionicLoading.hide()
            showLoginSignUp()
        }
        else{
            var updateFollow = {};
            updateFollow['users/data/'+id+'/myFollowers/'+$scope.myUid] = null;
            updateFollow['users/data/'+$scope.uid+'/following/'+id] = null;
            db.ref().update(updateFollow).then(function(){
                $('.'+id+'-follow').show();
                $("."+id+'-unfollow').css("display", "none");
                $scope.followOption = false;
                $ionicLoading.hide();
                $scope.popover.hide();
                    $cordovaToast
                        .show('This user removed from your follow list', 'long', 'center')
                        .then(function (success) {
                            // success
                        }, function (error) {
                            // error
                        });

                $state.go('feed')
            });
        }
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
    $scope.goBack = function(){
        if(window.localStorage.getItem("follower")=='true') {
            $ionicLoading.hide();
            $state.go('follower', {uid: $scope.myUid});
        }
        else{
            $ionicLoading.hide();
            $state.go('follow',{uid:$scope.myUid})
        }
    };

    $scope.createNew = function(){
        $ionicLoading.hide();
        $location.path("/new-feed");
    };

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
        if(post.profilePic == undefined){
            delete post.profilePic;
        }
        var confirmPopup = $ionicPopup.confirm({
            title: 'Are you sure?',
            template: 'You want to delete this post.'
        });
        confirmPopup.then(function(res) {
            if(res) {
                $ionicLoading.show();
                console.log("post",post)
                firebase.database().ref('deleted-blogs/' + post.blog_id).set(post).then(function() {

                    var updates = {};

                    for(key in post.likedBy){
                        updates['users/data/'+key+'/likedBlogs/'+post.blog_id] = null;
                    }

                    updates['feeds/' + post.blog_id] = null;
                    updates['users/data/'+post.user.user_id+'/blogs/'+post.blog_id] = null;
                    updates['cityFeeds/'+post.city_id+'/'+post.blog_id] = null;
                    firebase.database().ref().update(updates).then(function() {
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

    $scope.spamPost = function (postInfo) {
        console.log("postInfo",postInfo)
        var updates = {};
        var spamPostInfo = {
            spamTime:new Date().getTime(),
            blogId:postInfo.blog_id
        }

        updates['spamPosts/' + postInfo.blog_id] = spamPostInfo;

        firebase.database().ref().update(updates).then(function() {
            $scope.popover.hide();
            $cordovaToast
                .show('Post spammed successfully', 'long', 'center')
                .then(function (success) {
                    // success
                }, function (error) {
                    // error
                });
            location.reload();
        });
    }

    $scope.userSpecificFeeds = function(id){
        $state.go('userSpecificPosts',{userIdForFeeds:id})
    }
})
