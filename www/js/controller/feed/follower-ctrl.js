app.controller("followerCtrl", function(userServices,$scope,$stateParams,$cordovaToast,$state,$timeout,$ionicLoading){

    $ionicLoading.show();

    var FollowerIds = JSON.parse(window.localStorage['myFollowers']);
    $scope.followerUserDetail = [];
    $scope.msg = false;
    $timeout(function () {
        $ionicLoading.hide();
    }, 5000);

    if(FollowerIds){
        FollowerDetail(FollowerIds);
    }
    else{
        $scope.msg = true;
    }
    function FollowerDetail(info) {
        console.log("info",info)
        $ionicLoading.show();
        for(key in info){
            userServices.getUserInfo(key).then(function (result) {
                $ionicLoading.hide();

                console.log("resulyt",JSON.stringify(result))
                if(result){
                    if(result.photoUrl){
                        result.photoUrl  = "http://1272343129.rsc.cdn77.org/fab2u/users/"+result.userId+
                            "/"+result.photoUrl+"-xs.jpg";

                        // if(result.photoUrl.indexOf('http')==-1){
                        //     result.photoUrl = "http://cdn.roofpik.com/roofpik/fab2u/profile/"+result.userId+
                        //         "/profileImage/"+result.photoUrl+'-m.jpg';
                        // }
                        // else{
                        //     result.photoUrl = result.photoUrl;
                        //
                        // }
                    }
                    if(result.blogs){
                        result.postNum = Object.keys(result.blogs).length;
                        $scope.followerUserDetail.push(result);
                    }
                    else{
                        $scope.followerUserDetail.push(result);
                    }
                }

            })
        }
        $timeout(function () {
            $ionicLoading.hide();
        }, 1500);
    }

    $scope.viewPosts = function (followId,postNumber) {
        if(postNumber>0){
            window.localStorage.setItem("follower",true);
            $ionicLoading.hide();
            $state.go('followPosts',{followId:followId})
        }
        else{
            $ionicLoading.hide();
            $cordovaToast
                .show('Sorry we do not found any post regarding to select user.', 'long', 'center')
                .then(function (success) {
                    // success
                }, function (error) {
                    // error
                });
        }

    };
    $scope.goBack = function(){
        $ionicLoading.hide();
        $state.go('userFeed',{user_id:$stateParams.uid})
    };
})