app.controller('VendorSelectedServicesListCtrl',function(allVendorService,$scope,$stateParams,
                                                         $rootScope,$state, $ionicLoading,$ionicPopup,
                                                         $cordovaToast,$timeout){


        $scope.total_fabtu=0;
        $scope.total_original=0;
        $scope.total_customer = 0;
        $scope.selectedServices = {}; // Stores selected services
        $scope.begItems = {};
        $scope.currSlide = 0; // Current slide index
        $scope.selected_ids = [];
        $scope.selected_cat = [];
        $scope.menu = [];
        $scope.cart_item = 0;
        $scope.cart_price = {};
        $scope.fabSelected = false;
        delete window.localStorage.vendorMobile;
        delete window.localStorage.vendorLandline;
        delete window.localStorage.vendorLandmark;
        delete window.localStorage.vendorName;
        $scope.selected_items = JSON.parse(localStorage.getItem('catItems'));
        $scope.vendorId = $stateParams.vendor_id;




    console.log($scope.vendorId)

        $timeout(function () {
            $ionicLoading.hide();
        }, 10000);

        $scope.selectMain = function(val){
            if(val == 1){
                $scope.fabSelected = false;
                window.localStorage.setItem("selectedTab", true)
            } else {
                $scope.fabSelected = true;
                if(_.size($scope.selectedServices)>0){
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Note',
                        template: 'Your current selection will be discarded. You have to select services again from menu.'
                    });
                    confirmPopup.then(function(res) {
                        if(res) {
                            window.localStorage.setItem("selectedTab", false)
                            $state.go('vendorMenu',{vendor_id:$scope.vendorId});
                            delete window.localStorage.slectedItems;
                            delete window.localStorage.BegItems;
                            delete window.localStorage.selectedTab;
                            $rootScope.$broadcast('cart', { message: 'cart length changed' });
                        } else {
                            console.log('You are not sure');
                        }
                    });
                }
                else{
                    delete window.localStorage.selectedTab;
                    $state.go('vendorMenu',{vendor_id:$scope.vendorId});
                }
            }
        };

        //////////////////////check services are selected or not  //////////////////////
        checkSelectedServices();
        function checkSelectedServices() {
            if($scope.selected_items){
                for(key in $scope.selected_items){
                    $scope.selected_ids.push($scope.selected_items[key].id);
                }
                findCatName();
            }
            else{
                $scope.selected_ids = [];
            }
        }

        function findCatName() {
            $scope.sorted_id = _.sortBy($scope.selected_ids, function(num){
                return num;
            });

            for(var i=0;i<$scope.sorted_id.length;i++){
                if($scope.sorted_id[i]<='1013' && $scope.sorted_id[i]>='1001'){
                    var cat_name = 'cat-01'
                    $scope.selected_cat.push(cat_name);
                }
                else if($scope.sorted_id[i]<='2010' && $scope.sorted_id[i]>='2001'){
                    var cat_name = 'cat-02'
                    $scope.selected_cat.push(cat_name);
                }
                else if($scope.sorted_id[i]<='3009' && $scope.sorted_id[i]>='3001'){
                    var cat_name = 'cat-03'
                    $scope.selected_cat.push(cat_name);
                }
                else if($scope.sorted_id[i]<='4009' && $scope.sorted_id[i]>='4001'){
                    var cat_name = 'cat-04'
                    $scope.selected_cat.push(cat_name);
                }
                else if($scope.sorted_id[i]<='5003' && $scope.sorted_id[i]>='5001'){
                    var cat_name = 'cat-05'
                    $scope.selected_cat.push(cat_name);
                }
                else if($scope.sorted_id[i]<='6002' && $scope.sorted_id[i]>='6001'){
                    var cat_name = 'cat-06'
                    $scope.selected_cat.push(cat_name);
                }
                else if($scope.sorted_id[i]=='7001'){
                    var cat_name = 'cat-07'
                    $scope.selected_cat.push(cat_name);
                }
                else if($scope.sorted_id[i]<='8001'){
                    var cat_name = 'cat-08'
                    $scope.selected_cat.push(cat_name);
                }
                else if($scope.sorted_id[i]<='9001'){
                    var cat_name = 'cat-09'
                    $scope.selected_cat.push(cat_name);
                }
                else if($scope.sorted_id[i]<='1101'){
                    var cat_name = 'cat-11'
                    $scope.selected_cat.push(cat_name);
                }
                else if($scope.sorted_id[i]<='1201'){
                    var cat_name = 'cat-12'
                    $scope.selected_cat.push(cat_name);
                }
            }
            selectedMenu();
        }

       function selectedMenu() {
           $ionicLoading.show();
           var mySubArray = _.uniq($scope.selected_cat, function (name) {
               return name;
           });
           $scope.menu1 = {};
           if(mySubArray.length>0) {
               allVendorService.getMenu($scope.vendorId).then(function (result) {
                   if (result) {
                       $scope.menuInfo = result.services;
                       window.localStorage.setItem("vendorName", result.vendorName);
                       for(var j = 0; j< mySubArray.length;j++){
                           angular.forEach($scope.menuInfo, function (value, key) {
                               if(key == mySubArray[j]) {
                                   for (var k = 0; k < $scope.sorted_id.length; k++){
                                       angular.forEach(value, function (value1, key1) {
                                           if(key1 == $scope.sorted_id[k]){
                                               console.log("value1",value1)
                                               $scope.menu1[key1]=value1;

                                           }
                                       })
                                   }
                               }
                           })
                       }
                       vendorDetail();
                   }
                   else{

                           $cordovaToast
                               .show('No,menu found for this vendor,please select another vendor!', 'long', 'center')
                               .then(function (success) {
                                   // success
                               }, function (error) {
                                   // error
                               });

                       $ionicLoading.hide();
                   }
               })
           }
           else{
               $ionicLoading.hide();

                   $cordovaToast
                       .show('Please select some other services, don not find any detail for your selected services', 'long', 'center')
                       .then(function (success) {
                           // success
                       }, function (error) {
                           // error
                       });

           }
       }

         function vendorDetail() {
             allVendorService.getVendorInfo($scope.cityId,$scope.vendorId).then(function (result) {
                 if(result){
                     $scope.vendor_detail = result;
                     window.localStorage.setItem("vendorMobile",$scope.vendor_detail.contactDetails.phone);
                     window.localStorage.setItem("vendorLandline",$scope.vendor_detail.contactDetails.landline);
                     window.localStorage.setItem("vendorLandmark",$scope.vendor_detail.address.landmark);
                     $ionicLoading.hide();
                 }
                 else{
                     $ionicLoading.hide();
                 }
             })
        }


        // Get selected services if previously stored in localstorage
        if ((localStorage.getItem("slectedItem") != null) && (localStorage.getItem('BegItems'))) {
            $scope.selectedServices = JSON.parse(localStorage.getItem('slectedItem'));
            $scope.begItems = JSON.parse(localStorage.getItem('BegItems'));
            console.log("hgggggggggggg",$scope.selectedServices,$scope.begItems)

            calPrice($scope.begItems);
            $scope.cart_item = _.size($scope.selectedServices);
        }
        else{
            $scope.selectedServices = {};
            $scope.begItems = {}
            $scope.cart_item = 0;
        }
        $rootScope.$on('cart', function (event, args) {
            $scope.message = args.message;
            $scope.selectedServices = JSON.parse(localStorage.getItem('slectedItem'));
            $scope.begItems = JSON.parse(localStorage.getItem('BegItems'));
            console.log("ssss",$scope.selectedServices,$scope.begItems)
            $scope.cart_item = _.size($scope.selectedServices);
           calPrice($scope.begItems);
        });


        ///To calculate cart price //////

          function calPrice(item_list) {
            $scope.total_fabtu=0;
            $scope.total_original=0;
            $scope.total_customer = 0;
            angular.forEach(item_list, function(value, key) {
                $scope.total_fabtu += value.fab2uPrice;
                $scope.total_original += value.vendorPrice;
                $scope.total_customer += value.customerPrice;
            })
        };

        $scope.selectItem = function(index, serviceName,selectObj) {
            var data = selectObj;
            if(($scope.begItems[data.menuItemId]) && ($scope.selectedServices[serviceName])){
                delete $scope.begItems[data.menuItemId];
                delete $scope.selectedServices[serviceName];
            }
            else {
                $scope.begItems[data.menuItemId] = data;
                $scope.selectedServices[serviceName] = true;
            }
            localStorage.setItem('BegItems', JSON.stringify($scope.begItems));
            localStorage.setItem('slectedItem', JSON.stringify($scope.selectedServices));
            $rootScope.$broadcast('cart', { message: 'cart length changed' });
        };


        // handel back button
        $scope.backButton = function() {
            if(localStorage.getItem('favourite') == 'true') {
                localStorage.setItem('favourite', '');
                $state.go('favourite');
            }
            else if(localStorage.getItem("service_type")=='vendor'){
                localStorage.setItem('service_type', '');
                $state.go('app.home');
            }
            else{
                // history.back();
                // $state.go('vendorList');
                $state.go('vendorList',{vendorPage:window.localStorage['pageName']});
            }
            // TODO
        };

        // handel on click overview button
        $scope.overviewButton = function() {
            window.localStorage.setItem("selectedTab", true);
            $state.go('vendorDetails',{'ven_id':$stateParams.vendor_id})
            // TODO
        };


        // handel on click proceed button
        $scope.proceedButton = function() {
            if(_.size($scope.selectedServices)>0){
                window.localStorage.setItem("selectedTab", true);
                $state.go('cart',{'ven_id':$stateParams.vendor_id});

            }
            else{
                    $cordovaToast
                        .show('Please select at least one service', 'long', 'center')
                        .then(function (success) {
                            // success
                        }, function (error) {
                            // error
                        });

            }
        };

    });

