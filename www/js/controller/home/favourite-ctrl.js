app.controller('FavouriteCtrl', function($state,favouriteVendorsService,$timeout,
                                         $ionicLoading,$cordovaToast, $scope) {
    $timeout(function () {
        $ionicLoading.hide();
    }, 5000);
    if(localStorage.getItem('uid')){
        getFavouriteVendor();
    }
    else{
        $cordovaToast
            .show('Please,login first!', 'long', 'center')
            .then(function(success) {
                // success
            }, function (error) {
                // error
            });
    }
    $scope.location = JSON.parse(window.localStorage['selectedLocation']);
    $scope.vendorList = [];

    function getFavouriteVendor() {
        $ionicLoading.show();
        favouriteVendorsService.getFavVendors(localStorage.getItem('uid')).then(function(result){
            if(result){
                // $scope.vendorList = result;
                for(key in result){
                    if(result[key].vendorDetail.images){
                        if(result[key].vendorDetail.images.main){
                            if(result[key].vendorDetail.images.main.url.indexOf('http')==-1){
                                result[key].vendorDetail.images.main.url = "http://1272343129.rsc.cdn77.org/fab2u/vendors/"+
                                    $scope.location.cityId+"/"+result[key].vendorId+"/main/"
                                    +result[key].vendorDetail.images.main.url+"-xs.jpg";
                            }
                            else{
                                result[key].vendorDetail.images.main.url = result[key].vendorDetail.images.main.url;
                            }

                        }
                    }
                    $scope.vendorList.push(result[key]);
                }
                $ionicLoading.hide();
            }
            else{
                $scope.vendorList ='';
                $ionicLoading.hide();
            }
        })
    }

    $scope.home = function(){
        $state.go('app.home');
    };

    $scope.vendor_menu = function(id){
        localStorage.setItem('favourite', true);
        $state.go('vendorMenu',{vendor_id:id});
    };

    $scope.open_map = function (latitude, longitude, line1, line2, vendorName) {
        $state.go('map', {
            'lat': latitude,
            'lng': longitude,
            'add1': line1,
            'add2': line2,
            'name': vendorName
        });
    };
});