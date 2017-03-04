app.controller('ContactCtrl', function($state, $scope,$cordovaToast,$timeout,LocationService,
                                       $ionicLoading,$rootScope) {

    $timeout(function () {
        $ionicLoading.hide();
    }, 5000);

    $scope.user = {};


    $scope.query_options = ['HR','Appointment Booking','Marketing','Sales','Payment','Others'];

    function getCity() {
         $ionicLoading.show();
         LocationService.getAllCity().then(function (result) {
             if(result){
                 $scope.cityList = result;
                 $ionicLoading.hide();
             }
             else{
                 $scope.cityList = '';
                 $ionicLoading.hide();
             }
         })
     }
    getCity();

    $scope.submit_query = function(){
        $ionicLoading.show();
        firebase.database().ref('contactUs').push($scope.user,function (error) {
            if(error){
                $ionicLoading.hide();
                $scope.user = {};

                    $cordovaToast
                        .show('Please try again!', 'long', 'center')
                        .then(function (success) {
                            // success
                        }, function (error) {
                            // error
                        });

            }
            else{
                $ionicLoading.hide();
                $scope.user = {};

                    $cordovaToast
                        .show('Thanks for submitting your query. We will soon get back to you.', 'long', 'center')
                        .then(function (success) {
                            // success
                        }, function (error) {
                            // error
                        });

                $state.go('app.home')
            }
        });
    };
});