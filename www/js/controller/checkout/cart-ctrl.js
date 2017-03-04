app.controller("CartCtrl", function ($scope, $rootScope, $stateParams, $cordovaToast, $state,
                                     $ionicLoading,$timeout) {
    $ionicLoading.show();
    $scope.total_original = 0;
    $scope.total_fabtu = 0;
    $scope.total_customer = 0;
    $scope.cartItems = {};
    $scope.cart_item = 0;
    $scope.selectedServices = {};
    $timeout(function () {
        $ionicLoading.hide();
    }, 2000);

    window.localStorage.setItem("vendorId", $stateParams.ven_id);

    // Get selected services if previously stored in localstorage    ////////////////////////
    getSelectedServices();
    function getSelectedServices() {
        if ((localStorage.getItem("slectedItem") != null) && (localStorage.getItem('BegItems') != null)) {
            $scope.selectedServices = JSON.parse(localStorage.getItem('slectedItem'));
            $scope.cart_item = _.size($scope.selectedServices);
            $scope.cartItems = JSON.parse(localStorage.getItem('BegItems'));
            calPrice($scope.cartItems);
        }
        else{
            $scope.selectedServices = {};
            $scope.cartItems = {};
            $scope.cart_item = 0;
        }
    }
    $rootScope.$on('cart', function (event, args) {
        $scope.message = args.message;
        $scope.selectedServices = JSON.parse(localStorage.getItem('slectedItem'));
        $scope.cart_item = _.size($scope.selectedServices);
    });

     function calPrice(item_list) {
        $scope.total_fabtu = 0;
        $scope.total_original = 0;
        $scope.total_customer = 0;
        angular.forEach(item_list, function (value, key) {
            $scope.total_fabtu += value.fab2uPrice;
            $scope.total_original += value.vendorPrice;
            $scope.total_customer += value.customerPrice;
        })
    }

    $scope.list_changed = function (serv_id, serviceName) {
        console.log($scope.cartItems,serv_id)
        if (($scope.cartItems[serv_id]) && ($scope.selectedServices[serv_id])) {
            delete $scope.cartItems[serv_id];
            delete $scope.selectedServices[serv_id];
        }
        localStorage.setItem('BegItems', JSON.stringify($scope.cartItems));
        localStorage.setItem('slectedItem', JSON.stringify($scope.selectedServices));
        calPrice(JSON.parse(localStorage.getItem('BegItems')));
        $rootScope.$broadcast('cart', {message: 'cart length changed'});
    };

    $scope.edit_cart = function () {
        if (window.localStorage.getItem("selectedTab") == 'true') {
            $ionicLoading.hide();
            $state.go('vendorSelectedMenu', {vendor_id: $stateParams.ven_id});
        }
        else {
            $ionicLoading.hide();
            $state.go('vendorMenu', {'vendor_id': $stateParams.ven_id});
        }
    };

    $scope.backButton = function () {
        //later on back history will be here////////
        if (window.localStorage.getItem("selectedTab") == 'true') {
            $ionicLoading.hide();
            $state.go('vendorSelectedMenu', {vendor_id: $stateParams.ven_id});
        }
        else {
            $ionicLoading.hide();
            $state.go('vendorMenu', {'vendor_id': $stateParams.ven_id});
        }

    };

    $scope.select_time = function () {
        if (_.size($scope.selectedServices) > 0) {
            $ionicLoading.hide();
            $state.go('dateTime');
        }
        else {
            $ionicLoading.hide();

                $cordovaToast
                    .show('Please, select some service!', 'long', 'center')
                    .then(function (success) {
                        // success
                    }, function (error) {
                        // error
                    });

        }
    };

});