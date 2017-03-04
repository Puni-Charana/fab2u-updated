app.factory('signUpService', function ($q,$ionicLoading,$cordovaToast,$rootScope) {
    return {
        signUp: function(email,password,name){
            return $q(function (resolve,reject) {
                firebase.auth().createUserWithEmailAndPassword(email,password).then(function(data){
                    console.log(data)
                    $ionicLoading.hide();
                    var user = firebase.auth().currentUser;
                    user.updateProfile({
                        displayName:name
                    }).then(function() {
                        // Update successful.
                    }, function(error) {
                        // An error happened.
                    });
                    resolve(data.uid);
                }, function (error) {
                    reject(error);
                    $ionicLoading.hide();
                    console.log(error)
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    if ((errorCode == 'auth/email-already-in-use')) {
                        $cordovaToast
                            .show('Already exists an account with the given email address.Please try with another email address.', 'long', 'center')
                            .then(function (success) {
                                // success
                            }, function (error) {
                                // error
                            });
                    }
                    else if ((errorCode == 'auth/invalid-email')) {
                        $cordovaToast
                            .show('The given email address is not valid.Please try with another email address.', 'long', 'center')
                            .then(function (success) {
                                // success
                            }, function (error) {
                                // error
                            });
                    }
                    else if ((errorCode == 'auth/operation-not-allowed')) {
                        $cordovaToast
                            .show('Sorry, you can not sign Up by using email and password.', 'long', 'center')
                            .then(function (success) {
                                // success
                            }, function (error) {
                                // error
                            });
                    }
                    else if ((errorCode == 'auth/weak-password')) {
                        $cordovaToast
                            .show('The password is too weak.Please enter at-least six digit password', 'long', 'center')
                            .then(function (success) {
                                // success
                            }, function (error) {
                                // error
                            });
                    }
                    else if ((errorCode == 'Sorry network error.Please try again!')) {
                        $cordovaToast
                            .show('Already exists an account with the given email address.Please try with another email address.', 'long', 'center')
                            .then(function (success) {
                                // success
                            }, function (error) {
                                // error
                            });
                    }

                    console.log("errorCode",errorCode,errorMessage)
                })
            })

        },
        oldUserSignUp: function(oldUserInfo,password){
            return $q(function (resolve,reject) {
                firebase.auth().createUserWithEmailAndPassword(oldUserInfo.custInfo.email,password).then(function(data){
                    var user = firebase.auth().currentUser;
                    $ionicLoading.hide();

                    user.updateProfile({
                        displayName:oldUserInfo.custInfo.name
                    }).then(function() {
                        // Update successful.
                    }, function(error) {
                        // An error happened.
                    });
                    resolve(data.uid);
                }, function (error) {
                    $ionicLoading.hide();
                    reject(error);
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    if (errorCode == 'auth/email-already-in-use') {
                            $cordovaToast
                                .show('Already exists an account with the given email address.Please try with another email address.', 'long', 'center')
                                .then(function (success) {
                                    // success
                                }, function (error) {
                                    // error
                                });

                        $rootScope.$broadcast('oldUserError', { message: 'usr logged in' });

                    }
                    else if (errorCode == 'auth/invalid-email') {

                            $cordovaToast
                                .show('The given email address is not valid.Please try with another email address.', 'long', 'center')
                                .then(function (success) {
                                    // success
                                }, function (error) {
                                    // error
                                });

                        $rootScope.$broadcast('oldUserError', { message: 'usr logged in' });

                    }
                    else if (errorCode == 'auth/operation-not-allowed') {

                            $cordovaToast
                                .show('Sorry, you can not sign Up by using email and password.', 'long', 'center')
                                .then(function (success) {
                                    // success
                                }, function (error) {
                                    // error
                                });


                        $rootScope.$broadcast('oldUserError', { message: 'usr logged in' });

                    }
                    else if (errorCode == 'auth/weak-password') {

                            $cordovaToast
                                .show('The password is too weak.Please enter at-least six digit password', 'long', 'center')
                                .then(function (success) {
                                    // success
                                }, function (error) {
                                    // error
                                });

                        $rootScope.$broadcast('oldUserError', { message: 'usr logged in' });
                    }
                    else if (errorCode == 'auth/network-request-failed') {

                            $cordovaToast
                                .show('Sorry network error.Please try again!', 'long', 'center')
                                .then(function (success) {
                                    // success
                                }, function (error) {
                                    // error
                                });

                        $rootScope.$broadcast('oldUserError', { message: 'usr logged in' });
                    }
                    console.log("errorCode",errorCode,errorMessage)
                })
            })

        }
    }
})