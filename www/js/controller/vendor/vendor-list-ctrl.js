app.controller('VendorListCtrl',
    function ($scope,allVendorService, LocationService,$timeout, $ionicHistory, $state, $stateParams,$timeout,
              $ionicLoading,$ionicModal,$ionicScrollDelegate, $ionicPopover, $rootScope,
              $cordovaToast) {

        delete window.localStorage.mapStorage;
        $timeout(function () {
            $ionicLoading.hide();
        }, 10000);
        var locationInfo = JSON.parse(window.localStorage['selectedLocation']);
        $scope.cityId = locationInfo.cityId;
        $scope.limit= 4;
        $scope.sortValue = 'distance';
        $scope.active_button1 = false;
        $scope.active_button2 = false;
        $scope.active_button3 = false;
        $scope.bindedVendors = [];
        $scope.bindedVendorsIds = [];
        $scope.gender = '';
        $scope.genSelected = false;
        $scope.isDisabled = false;  /////for infinite scroll

        if (checkLocalStorage('allVendors')) {
            allVendorService.getVersion(locationInfo.cityId).then(function (res) {
                var newVersion = res;
                console.log(newVersion,window.localStorage['allVendorsVersion'])
                if (window.localStorage['allVendorsVersion'] < newVersion) {
                    console.log("if")
                        getAllVendors();
                }
                else{
                    $scope.allVendors = JSON.parse(window.localStorage['allVendors']);
                    bindedVendorInfo();
                }
            })
        }
        else{
            getAllVendors();
        }


        function getAllVendors() {
            $ionicLoading.show();
            allVendorService.getAllVendors(locationInfo.cityId).then(function (res) {
                var vendorDetail = res;
                var version = res.version;
                for (key in vendorDetail) {
                    if (key != 'version') {
                        var distance = get_distance(locationInfo.latitude, locationInfo.longitude, vendorDetail[key].address.latitude, vendorDetail[key].address.longitude)
                        vendorDetail[key].distance = distance;
                    }
                }
                window.localStorage['allVendors'] = JSON.stringify(vendorDetail);
                window.localStorage['allVendorsVersion'] = version;
                $scope.allVendors = vendorDetail;
                bindedVendorInfo();
            })
        }

        function get_distance(latitude1, longitude1, latitude2, longitude2, units) {
            var p = 0.017453292519943295;    //This is  Math.PI / 180
            var c = Math.cos;
            var a = 0.5 - c((latitude2 - latitude1) * p) / 2 +
                c(latitude1 * p) * c(latitude2 * p) *
                (1 - c((longitude2 - longitude1) * p)) / 2;
            var R = 6371; //  Earth distance in km so it will return the distance in km
            $scope.dist = Math.round(2 * R * Math.asin(Math.sqrt(a)));
            return $scope.dist;
        }


        function bindedVendorInfo(){
            if($stateParams.vendorPage == 'discoverSalons'){
                $scope.vendorNames = JSON.parse(window.localStorage['vendorsName']);
                console.log($scope.vendorNames)
                window.localStorage['pageName'] = 'discoverSalons';
                delete window.localStorage.VendorServiceListIds;
                delete window.localStorage.VendorServiceListVersion;
                for(key in $scope.vendorNames) {
                    // load_vendors($scope.vendorNames[key].vid)
                    for(key1 in $scope.allVendors) {
                        if ((key1 == $scope.vendorNames[key].vid) && (key1 != 'version')) {
                            $scope.bindedVendors.push($scope.allVendors[key1]);
                            $scope.bindedVendorsIds.push(key1);
                        }
                    }
                }
                window.localStorage['mapStorage'] = JSON.stringify($scope.bindedVendors)
                if($scope.bindedVendorsIds){
                    vendorInfoForFilter($scope.bindedVendorsIds)
                }
            }
            else{
                $scope.VendorServiceListIds = JSON.parse(window.localStorage['VendorServiceListIds']);
                window.localStorage['pageName'] = 'serviceList';
                delete window.localStorage.vendorsName;
                delete window.localStorage.vendorsListVersion;
                for(key in $scope.VendorServiceListIds) {
                    var id = $scope.VendorServiceListIds[key]
                    for(key in $scope.allVendors) {
                        if ((key == id) && (key != 'version')) {
                            $scope.bindedVendors.push($scope.allVendors[key]);
                            $scope.bindedVendorsIds.push(key);
                        }
                    }
                }
                window.localStorage['mapStorage'] = JSON.stringify($scope.bindedVendors)
                if($scope.bindedVendorsIds){
                    vendorInfoForFilter($scope.bindedVendorsIds)
                }
            }
        }


     ///////////////To get final vendors on which filter will apply    ////////////////////
        $scope.vendorsForFilter = {};
        function vendorInfoForFilter(bindedVendorsIds) {
            if(bindedVendorsIds){
                for (var i =0; i<bindedVendorsIds.length;i++){
                    $scope.vendorsForFilter[bindedVendorsIds[i]] = $scope.allVendors[bindedVendorsIds[i]]
                }
                $ionicLoading.hide();
            }
            else {
                $ionicLoading.hide();
            }
            console.log($scope.vendorsForFilter)
        }


     //////////////////////////////////////end/////////////////////////////////////////////


     ///////////////////////////Filter function to get filtered vendor list  //////////////


        function start_filtering(filters) {
            if ($scope.vendorsForFilter.length == 0) {

                    $cordovaToast
                        .show('No,vendor found for selected criteria.', 'long', 'center')
                        .then(function (success) {
                            // success
                        }, function (error) {
                            // error
                        });

            }
            else {
                $scope.bindedVendors = [];
                var response = $scope.vendorsForFilter;
                var allVendorKeys = Object.keys(response);
                var obtainedVendorIds = $scope.bindedVendorsIds;
                for (key in obtainedVendorIds) {
                    if (_.contains(allVendorKeys, obtainedVendorIds[key])) {
                        response[obtainedVendorIds[key]].show = true;
                    }
                }
                if (filters.type) {
                    for (key in response) {
                        if ((response[key].vendorType).toLowerCase() === filters.type) {
                            response[key].show = true;
                        } else {
                            response[key].show = false;
                        }
                    }
                }
                if (filters.gender) {
                    console.log(filters.gender)
                    for (key in response) {
                        if(response[key].show){
                            if (((response[key].gender).toLowerCase() == filters.gender) || ((response[key].gender).toLowerCase() == 'unisex')) {
                                response[key].show = true;
                            } else {
                                response[key].show = false;
                            }
                        }
                    }
                }
                if(filters.amenities){
                    if (filters.amenities.length > 0) {
                        for (key in response) {
                            if (response[key].show) {
                                if (response[key].amenities) {
                                    var setA = Object.keys(response[key].amenities);
                                    var setB = filters.amenities;
                                    var setC = _.intersection(setA, setB);
                                    // console.log(setA, setB);
                                    if (setB.length != setC.length) {
                                        response[key].show = false;
                                    }
                                }

                            }
                        }
                    }
                }
                if(filters.location){
                    if (filters.location.length > 0) {
                        for (key in response) {
                            if (response[key].show) {
                                var setX = response[key].address.locationId;
                                var setY = filters.location;
                                console.log(setX);
                                console.log(setY);
                                if (!_.contains(setY, setX)) {
                                    response[key].show = false;
                                }
                            }
                        }
                    }
                }
                for (key in response) {
                    if (response[key].show) {
                        $scope.bindedVendors.push(response[key])
                    } else {
                        console.log("inside else");
                    }
                }
                window.localStorage['mapStorage'] = JSON.stringify($scope.bindedVendors)
            }
        }


        /////////////////////////////end //////////////////////////////////////////////////////

     ////////////Filter based on gender  //////////////////////////////////////////////

        $scope.toggleColor = function (val) {
            $ionicLoading.show();
            $timeout(function () {
                $ionicLoading.hide();
            }, 200);
            if (val == 1) {
                $scope.genSelected = true;
                $scope.gender = 'male';
                var filters = {
                    type: $scope.type,
                    amenities: $scope.final_amenity,
                    location: Object.keys($scope.selectedLocation),
                    gender: $scope.gender
                }
                start_filtering(filters);
                $ionicLoading.hide();
            }
            else {
                $scope.genSelected = false;
                $scope.gender = 'female';
                var filters = {
                    type: $scope.type,
                    amenities: $scope.final_amenity,
                    location: Object.keys($scope.selectedLocation),
                    gender: $scope.gender
                }
                start_filtering(filters);
                $ionicLoading.hide();

            }
        };





        //////      Map for a particular vendor   //////////////////


        $scope.open_map = function (latitude, longitude, line1, line2, vendorName) {
            $state.go('map', {
                'lat': latitude,
                'lng': longitude,
                'add1': line1,
                'add2': line2,
                'name': vendorName
            });
        };

        ///////////////////////////////////////////////////////////////////////////



        $scope.vendor_menu = function (id) {
            delete window.localStorage.slectedItems;
            delete window.localStorage.BegItems;
            if (localStorage.getItem('catItems')) {
                $state.go('vendorSelectedMenu', {vendor_id: id});
            }
            else {
                $state.go('vendorMenu', {vendor_id: id});
            }
        };



        /////////////////////////////filter screen ///////////////////


        $ionicModal.fromTemplateUrl('templates/vendor/filter.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.filter_screen = modal;
        });

        $scope.open_filter = function () {
            $scope.filter_screen.show();
        };

        $scope.close_filter = function () {
            $scope.filter_screen.hide();

        };

        $ionicModal.fromTemplateUrl('templates/vendor/filter-location.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.location = modal;
        });
        $scope.open_location = function () {
            $ionicLoading.show();
            LocationService.getCityLocality(locationInfo.cityId).then(function (result) {
                if(result){
                    $scope.location_detail = result;
                    $scope.location.show();
                    $ionicLoading.hide();
                }
                else{
                    $scope.location_detail = '';
                    $ionicLoading.hide();
                }
            })
        };
        $scope.close_location = function () {
            $scope.location.hide();
        };
        $scope.final_amenity = [];
        $scope.selectedLocation = [];
        $scope.isChecked = false;
        $scope.amenities = [
            {
                'name': 'card',
                'selected': false,
                'icon': 'ion-card'
            },
            {
                'name': 'ac',
                'selected': false,
                'icon': 'ion-laptop'
            },
            {
                'name': 'parking',
                'selected': false,
                'icon': 'ion-android-car'
            },
            {
                'name': 'wifi',
                'selected': false,
                'icon': 'ion-wifi'
            }
        ];
        $scope.typeFn = function (val) {
            $scope.type = val;
            if(val =='silver'){
                $scope.active_button1 = true;
                $scope.active_button2 = false;
                $scope.active_button3 = false;
            }
            else if(val == 'gold'){
                $scope.active_button1 = false;
                $scope.active_button2 = true;
                $scope.active_button3 = false;
            }
            else if(val == 'platinum'){
                $scope.active_button1 = false;
                $scope.active_button2 = false;
                $scope.active_button3 = true;
            }
        };
        $scope.locationName = {};
        $scope.location_selected = function (val, isChecked,location) {
            console.log("location",location)
            if ($scope.selectedLocation[val] && $scope.locationName[location.locationName]) {
                delete $scope.selectedLocation[val];
                delete $scope.locationName[location.locationName];
            }
            else {
                $scope.selectedLocation[val] = true;
                $scope.locationName[location.locationName] = true;
            }
        };
        $scope.refresh = function () {
            location.reload()
        };
        $scope.amenity_list = function (val) {
            val.selected = !val.selected;
        };

        $scope.applyFilter = function () {
            for (var i = 0; i < $scope.amenities.length; i++) {
                if ($scope.amenities[i].selected == true) {
                    $scope.final_amenity.push($scope.amenities[i].name);
                }
            }
            var filters = {
                type: $scope.type,
                amenities: $scope.final_amenity,
                location: Object.keys($scope.selectedLocation),
                gender: $scope.gender
            }
            start_filtering(filters);
            $scope.filter_screen.hide();
            $timeout(function () {
                $ionicScrollDelegate.scrollTop();
            },500)
        }


        /////////////////////////Load more vendors ///////////////////////

        $scope.loadMore = function(){
            $scope.limit = $scope.limit+4;
            var vendorListLength = $scope.bindedVendors.length;
            if(vendorListLength<$scope.limit){
                $scope.isDisabled = true;
            }
            else{
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        };

        //////////////////////////////end /////////////////////////////////////
        $scope.backButton = function () {
            $state.go('app.home');
        };

        $scope.multipleAddressMapView = function () {
            $state.go('mapMultiple',{vendorPage:$stateParams.vendorPage})
        };



        /////////////////////Sort vendor list /////////////////////////

        $ionicPopover.fromTemplateUrl('templates/popover.html', {
            scope: $scope,
        }).then(function (popover) {
            $scope.popover = popover;
        });

        $scope.closePopover = function () {
            $scope.popover.hide();
        };

        $scope.closePopover = function () {
            $scope.popover.hide();
        };

        $scope.sortVendors = function (val) {
            console.log("val", val)
            $scope.sortValue = val;
        }

    });