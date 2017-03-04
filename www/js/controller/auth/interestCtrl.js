app.controller('interestCtrl',function($scope,$rootScope,$state,$ionicLoading,$cordovaToast){

    $scope.selectedInterests = {};
    $scope.interestList = {};
    $scope.updates = {};
    if(checkLocalStorage('uid')){
        $scope.myUid = window.localStorage.getItem("uid");
    }
    $rootScope.$on('logged_in', function (event, args) {
        $scope.myUid = window.localStorage.getItem('uid');
    });
$scope.options = [
    {
        id:1,
        name:'demo1'
    },
    {
        id:2,
        name:'demo2'
    },
    {
        id:3,
        name:'demo3'
    },
    {
        id:4,
        name:'demo4'
    },
    {
        id:5,
        name:'demo5'
    },
    {
        id:6,
        name:'demo6'
    },
    {
        id:7,
        name:'demo7'
    },
    {
        id:8,
        name:'demo8'
    },
    {
        id:9,
        name:'demo9'
    },
    {
        id:10,
        name:'demo10'
    }
];
    var count = 0;

    $scope.selectItems = function(item) {
        var data = {
            name: item.name,
            id: item.id,
            order: count
        }
        count++;

        if(($scope.selectedInterests[item.name]) && ($scope.interestList[item.name])){
            delete $scope.selectedInterests[item.name];
            delete $scope.interestList[item.name];
        }else{
            $scope.selectedInterests[item.name] = true;
            $scope.interestList[item.name] = data;
        }

    };
$scope.sortedInterestList = {};
    $scope.saveInterest = function () {
           console.log($scope.selectedInterests,$scope.interestList)

          var newObj = _.sortBy($scope.interestList, 'order');
        console.log("sorted newObj",newObj);
        for(key in newObj){
            console.log("newObj",key,newObj[key])
            newObj[key].order = key;
            $scope.sortedInterestList[key] = newObj[key]
        }
        console.log("final order", $scope.sortedInterestList)
        console.log("final order length", Object.keys($scope.sortedInterestList).length)

        if(Object.keys($scope.sortedInterestList).length>=5){
            ////////////call function to save data in to database regarding to user ////
            storeUserInterests()
        }
        else{
            $cordovaToast
                    .show('Please select at-least 5 interested feed', 'long', 'center')
                    .then(function (success) {
                        // success
                    }, function (error) {
                        // error
                    });
        }

    };
    function storeUserInterests(){
        $scope.updates['users/data/'+$scope.myUid+'/interests'] = $scope.sortedInterestList;

            db.ref().update($scope.updates).then(function(response){
                    if(response == null){
                       /////go to default states///

                        var stateObj = $rootScope.from;
                        if(stateObj && (Object.keys(stateObj).length > 0)) {
                            if (stateObj.stateName != 'tagFeed') {
                                $rootScope.from = {};
                                    $cordovaToast
                                        .show('We have updated your interested feed', 'long', 'center')
                                        .then(function (success) {
                                            // success
                                        }, function (error) {
                                            // error
                                        });

                                $ionicLoading.hide();
                                $state.go(stateObj.stateName);
                            }
                            else {
                                $rootScope.from = {};

                                    $cordovaToast
                                        .show('We have updated your interested feed', 'long', 'center')
                                        .then(function (success) {
                                            // success
                                        }, function (error) {
                                            // error
                                        });

                                $ionicLoading.hide();
                                $state.go(stateObj.stateName, {tag: stateObj.params});
                            }
                        }
                        else{

                                $cordovaToast
                                    .show('We have updated your interested feed', 'long', 'center')
                                    .then(function (success) {
                                        // success
                                    }, function (error) {
                                        // error
                                    });

                            $ionicLoading.hide();
                            $state.go('feed')
                        }
                    }
                    else{
                        ///// stay on same page with error msg /////
                        $cordovaToast
                            .show('Please try again.', 'long', 'center')
                            .then(function (success) {
                                // success
                            }, function (error) {
                                // error
                            });
                    }
                },
                function (error) {
                   /////// show error msg and stay on same page /////
                    console.log("error",error)
                    $cordovaToast
                        .show('Please try after some time.', 'long', 'center')
                        .then(function (success) {
                            // success
                        }, function (error) {
                            // error
                        });
                });
    }

})