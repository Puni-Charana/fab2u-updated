app.controller('LoginCtrl', function($scope, $ionicHistory, $state, AuthenticationService,
    $ionicPopup, $cordovaToast, $rootScope, $ionicLoading) {
    AuthenticationService.Logout();
    $scope.user = {
        user_email: '',
        user_password: ''
    };
    $scope.back = function() {
        console.log("else", $ionicHistory.viewHistory().histories.root)
        var stateObj = $rootScope.from;
        console.log("stateName", stateObj);
        if (stateObj && (Object.keys(stateObj).length > 0)) {
            if (stateObj.stateName == 'confirmation') {
                $ionicLoading.hide();
                $state.go('dateTime')
            } else if (stateObj.stateName == 'app.home') {
                $ionicLoading.hide();
                $state.go('app.home')
            } else if (stateObj.stateName == 'nearmeFeed') {
                $ionicLoading.hide();
                $state.go('nearmeFeed')
            } else {
                $ionicLoading.hide();
                $state.go('feed')
            }
        } else {
            $ionicLoading.hide();
            $state.go('feed')
        }


    };

    $scope.loginEmail = function() {
        AuthenticationService.LoginEmail($scope.user.user_email, $scope.user.user_password);
    };

    $scope.showPopup = function() {
        $scope.data = {}
            // Custom popup
        var myPopup = $ionicPopup.show({
            template: '<input type = "text" ng-model = "data.model">',
            title: 'Reset Password',
            subTitle: 'Enter your email address',
            scope: $scope,

            buttons: [
                { text: 'Cancel' }, {
                    text: '<b style="color:#fff !important;">Send Link</b>',
                    type: 'pinkcolor',
                    onTap: function(e) {
                        if (!$scope.data.model) {
                            //don't allow the user to close unless he enters model...
                            e.preventDefault();
                        } else {
                            var auth = firebase.auth();
                            var emailAddress = $scope.data.model;
                            auth.sendPasswordResetEmail(emailAddress).then(function() {
                                sentPopup();
                            }, function(error) {
                                console.log(error);

                                $cordovaToast
                                    .show(error.message, 'long', 'center')
                                    .then(function(success) {
                                        // success
                                    }, function(error) {
                                        // error
                                    });

                            });
                            return $scope.data.model;
                        }
                    }
                }
            ]
        });
    };

    function sentPopup() {
        $ionicPopup.alert({
            title: 'Reset Link sent to your email address!'
        });
    };

});
