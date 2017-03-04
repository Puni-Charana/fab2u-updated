app.controller("tagFeedCtrl", function(userServices,$scope, $stateParams, $timeout,$sce, $state,
                                       $location, $ionicLoading, $ionicModal,$cordovaToast,
                                       $ionicPopup,$rootScope, $ionicPopover){

	$ionicLoading.show();
	$scope.uid = window.localStorage.getItem("uid");
    $rootScope.$on('logged_in', function (event, args) {
        $scope.uid = window.localStorage.getItem('uid');
    });
    $scope.followOption = false;
    $scope.moreMessagesScroll = true;
    $scope.moreMessagesRefresh = true;
    $scope.tagName = $stateParams.tag;
    $scope.blogIdList = {};
    $scope.dataLoaded = false;
    $scope.blogLength = 0;
    var count = 0;

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

    // Open a in app browser
    $scope.openUrl = function(url){
        window.open(url, '_blank', 'location=yes');
        return false;
    }
    // ----------------------------------------------------------------------

    $timeout(function () {
        $ionicLoading.hide();
    }, 10000);

    $scope.commentToggle = function(feedId) {
        $("#"+feedId+"-commentsBlock").toggle();
    };

    if($scope.uid){
        userServices.getUserInfo($scope.uid).then(function (result) {
            $scope.userName = result.name;
        })
    }
    else{
        $scope.userName = '';
    }
    // $scope.$on('$stateChangeSuccess', function() {
    //     $scope.loadMore();
    // });

	$scope.loadMore = function(){
        $ionicLoading.show();
        if(Object.keys($scope.blogIdList).length == 0){
            db.ref('tags').child($scope.tagName).child("blogs").limitToLast(5).once('value', function(snapshot){
                $ionicLoading.hide();
                $scope.blogIdList = snapshot.val();
                if(snapshot.val()){
                    $scope.bottomKey = Object.keys($scope.blogIdList)[0];
                    $scope.topKey = Object.keys($scope.blogIdList)[Object.keys($scope.blogIdList).length - 1];
                    $scope.blogArr = [];
                    $scope.blogLength = Object.keys($scope.blogIdList).length;
                    for(var i in $scope.blogIdList){
                        blogAlgo(i);
                    }
                    $scope.dataLoaded = true;

                }
                else{
                    $scope.dataLoaded = true;

                      $cordovaToast
                          .show('This feed is not available!', 'long', 'center')
                          .then(function (success) {
                              // success
                          }, function (error) {
                              // error
                          });

                }
                $timeout(function () {
                }, 0);
            })
        }

        else if(Object.keys($scope.blogIdList).length > 0){
			db.ref("tags/"+$scope.tagName+"/blogs").orderByKey().limitToFirst(6).endAt($scope.bottomKey).once("value", function(snap){
				if(snap.numChildren() == 1){
					$scope.moreMessagesScroll = false;
                    $ionicLoading.hide();
					$scope.$broadcast('scroll.infiniteScrollComplete');
				}
				else{
					$scope.oldBottomKey = $scope.bottomKey;
					$scope.bottomKey = Object.keys(snap.val())[0];
                    $scope.blogLength = Object.keys(snap.val()).length - 1;
                    for(var i in snap.val()){
						if (i != $scope.oldBottomKey){
							blogAlgo(i);
						}
					}
					$scope.$broadcast('scroll.infiniteScrollComplete');
				}
			});
		}
	}

	$scope.loadMore();
    function blogAlgo(i){
        count++;
        var blogData = db.ref().child("feeds").child(i);
        blogData.once("value", function(snap){ //access individual blog
            single_blog = snap.val();
            if(single_blog){
                if(single_blog.photoUrl){
                    single_blog.photoUrl = "http://1272343129.rsc.cdn77.org/fab2u/feeds/"+
                        single_blog.blog_id+"/"+single_blog.photoUrl+'-m.jpg';
                    // if(snap.val().photoUrl.indexOf('http')==-1){
                    //     single_blog.photoUrl = "http://cdn.roofpik.com/roofpik/fab2u/post/"+snap.val().user.user_id+
                    //         "/postImage/"+snap.val().photoUrl+'-m.jpg';
                    //
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
                if(single_blog.likedBy) {
                    single_blog['numLikes'] = Object.keys(single_blog.likedBy).length;
                }
                single_blog.liked = false;
                checkFollowOrFollowerUser(single_blog,i);
                $scope.blogArr.push(single_blog);
            }
        });
        if(count == $scope.blogLength){
            $ionicLoading.hide();
            $scope.moreMessagesScroll = true;
        }
    }
    function checkFollowOrFollowerUser(single_blog,i) {
        if(single_blog.user){
            if($scope.uid){
                if(single_blog.user.user_id == $scope.uid){
                    $timeout(function () {
                        $('.'+single_blog.user.user_id+'-follow').hide();
                        $scope.followOption = true;
                    }, 0);
                }
                if(single_blog.likedBy){
                    if($scope.uid in single_blog.likedBy){
                        $timeout(function () {
                            single_blog.liked = true;
                        }, 0);
                    }
                }
                db.ref("users/data/"+single_blog.user.user_id).once("value", function(snap){
                    if(snap.val().photoUrl){
                        // single_blog.profilePic = snap.val().photoUrl;

                        single_blog.profilePic = "http://1272343129.rsc.cdn77.org/fab2u/users/"+single_blog.user.user_id+
                            "/"+snap.val().photoUrl+"-xs.jpg";

                        // if(snap.val().photoUrl.indexOf('http')==-1){
                        //     single_blog.profilePic = "http://cdn.roofpik.com/roofpik/fab2u/profile/"+snap.val().userId+
                        //         "/profileImage/"+snap.val().photoUrl+'-m.jpg';
                        // }
                        // else{
                        //     single_blog.profilePic = snap.val().photoUrl;
                        //
                        // }
                    }
                    if(snap.val().myFollowers){

                        for(key in snap.val().myFollowers){
                            console.log("key",key)
                            if($scope.uid  == key){
                                $timeout(function() {
                                    $('.' + single_blog.user.user_id + '-follow').hide();
                                    $("." + single_blog.user.user_id + '-unfollow').css("display", "block");
                                    $scope.followOption = true;
                                }, 0);
                            }
                        }
                        // if ($scope.uid in snap.val().myFollowers){
                        //     $timeout(function () {
                        //         $('.'+single_blog.user.user_id+'-follow').hide();
                        //         $("."+single_blog.user.user_id+'-unfollow').css("display", "block");
                        //         $scope.followOption = true;
                        //     }, 0);
                        // }
                    }
                });
            }
            else{
                db.ref("users/data/"+single_blog.user.user_id).once("value", function(snap) {
                    if (snap.val().photoUrl) {
                        // single_blog.profilePic = snap.val().photoUrl;

                        single_blog.profilePic = "http://1272343129.rsc.cdn77.org/fab2u/users/"+single_blog.user.user_id+
                            "/"+snap.val().photoUrl+"-xs.jpg";

                        // if(snap.val().photoUrl.indexOf('http')==-1){
                        //     single_blog.profilePic = "http://cdn.roofpik.com/roofpik/fab2u/profile/"+snap.val().userId+
                        //         "/profileImage/"+snap.val().photoUrl+'-m.jpg';
                        // }
                        // else{
                        //     single_blog.profilePic = snap.val().photoUrl;
                        //
                        // }
                    }
                })
            }

        }
    }

    $scope.doRefresh = function(){
        db.ref("tags/"+$scope.tagName+"/blogs").orderByKey().startAt($scope.topKey).once("value", function(snapshot){
            if(snapshot.numChildren() == 1){
                $scope.moreMessagesRefresh = false;
            }
            else{
                $scope.prevTopKey = $scope.topKey;
                $scope.topKey = Object.keys(snapshot.val())[Object.keys(snapshot.val()).length - 1];
                var single_blog = {};
                for(var i in snapshot.val()){
                    if (i != $scope.prevTopKey){
                        blogAlgo(i);
                    }
                }
            }
            $scope.$broadcast('scroll.refreshComplete');
        })
    };

    $scope.showPopup = function(id) {
        if(!$scope.uid){
            showLoginSignUp()
        }
        else {
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
                                    userId: $scope.uid,
                                    userName: $scope.userName
                                };
                                console.log(commentObject_blog);
                                var updateComment = {};
                                updateComment['feeds/' + id + '/comments/' + newCommentKey] = commentObject_blog;
                                // updateComment['users/data/'+$scope.uid+"/comments/"+newCommentKey] = commentObject_user;
                                db.ref().update(updateComment).then(function () {
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
        }
    };
    $scope.toTrustedHTML = function( html ){
        return $sce.trustAsHtml( html );
    }
    $scope.followUser = function(id){
        $ionicLoading.show();
        if(!$scope.uid){
            $ionicLoading.hide();
            showLoginSignUp()
        }
        else {
            var updateFollow = {};
            updateFollow['users/data/' + id + '/myFollowers/' + $scope.uid] = true;
            updateFollow['users/data/' + $scope.uid + '/following/' + id] = true;
            db.ref().update(updateFollow).then(function () {
                console.log('success');
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

                $state.go('tagFeed',{tag:$stateParams.tag})

            });
        }
    };

    $scope.unfollowUser = function(id){
        $ionicLoading.show();
        if(!$scope.uid){
            showLoginSignUp()
        }
        else{
            var updateFollow = {};
            updateFollow['users/data/'+id+'/myFollowers/'+$scope.uid] = null;
            updateFollow['users/data/'+$scope.uid+'/following/'+id] = null;
            db.ref().update(updateFollow).then(function(){
                console.log('success');
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

                $state.go('tagFeed',{tag:$stateParams.tag})
            });
        }
    }


    $scope.likeThisFeed = function(feed){
        $ionicLoading.show();
        if(!$scope.uid){
            $ionicLoading.hide();
            showLoginSignUp()
        }
        else{
            if(feed.liked){
                feed.numLikes -= 1;
                db.ref("feeds/"+feed.blog_id+"/likedBy/"+$scope.uid).remove().then(function(){
                    db.ref("users/data/"+$scope.uid+'/likedBlogs/'+feed.blog_id).remove().then(function () {
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
                updates["feeds/" + feed.blog_id + "/likedBy/" + $scope.uid] = true;
                updates["users/data/"+$scope.uid+"/likedBlogs/"+feed.blog_id] = true;
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

                    },0)
                });
            }
            db.ref("feeds/"+feed.blog_id+"/likedBy").on("value", function(snap){
                $ionicLoading.hide();
                feed.numLikes = snap.numChildren();
                $state.go('tagFeed',{tag:$scope.tagName})
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
                $rootScope.from ={
                    stateName: 'tagFeed',
                    params:$scope.tagName
                }
                $state.go('login')
            } else {
                console.log('You are not sure');
            }
        });
    }

    $scope.goBack = function(){
        history.back();
    };

    $scope.createNew = function(){
        if($scope.uid){
            $ionicLoading.hide();
            $location.path("/new-feed");
        }
        else{
            showLoginSignUp();
        }
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

});
