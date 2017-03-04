app.controller('BookingDetailCtrl', function(userServices,$scope,$state,$ionicLoading,
                                             $stateParams,$timeout,allVendorService){


    var locationInfo = JSON.parse(window.localStorage['selectedLocation']);
    var bookingId = $stateParams.bookingId;
    $scope.bookingInformation = {};
    $scope.vendorDetail = {};

    $timeout(function () {
        $ionicLoading.hide();
    }, 10000);

    // Booking detail /////
    bookingDetail();

     function bookingDetail() {
        $ionicLoading.show();
         userServices.getBookingDetail(bookingId).then(function (result) {
             if(result){
                 console.log("result",result)
                 $scope.bookingInformation = result;
                 $scope.vendorId = result.vendorId;
                 getVendorDetail();
             }
             else{
                 $scope.bookingInformation = {};
                 $ionicLoading.hide();
             }
         })
     }

    function getVendorDetail() {
        allVendorService.getVendorInfo(locationInfo.cityId,$scope.vendorId).then(function (result) {
            if(result){
                $scope.vendorDetail = result;
                $ionicLoading.hide()
            }
            else{
                $scope.vendorDetail = {};
                $ionicLoading.hide()
            }
        })
    }

    $scope.back = function () {
        $state.go('bookings');
    };

    //////////////Map for vendor location  ////////////////////////////////
    $scope.open_map = function(latitude,longitude,line1,line2,vendorName){
        $state.go('map',{
            'lat': latitude,
            'lng': longitude,
            'add1': line1,
            'add2': line2,
            'name': vendorName
        });
    };


});