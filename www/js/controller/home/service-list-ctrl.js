app.controller('ServiceListCtrl', function($state, $scope,$ionicSlideBoxDelegate,$timeout,
                                           $ionicScrollDelegate, $rootScope,$cordovaToast,
                                           $ionicLoading,allVendorService) {
    $scope.selectedServices = {}; // Stores selected services
    $scope.categoryItems = {};
    $scope.index_number = 0;
    $scope.vendorNames = [];
    $scope.currSlide = 0;// initialize the current slide number for slide box
    $scope.tabActive = false;
    $scope.services = {
        "Face":
        {
            "name": [
                {
                    name:'Bleach',
                    id:'2001'
                },
                {
                    name:'Eyebrow/EyeLash',
                    id:'2002'
                },
                {
                    name:'Face Threading',
                    id:'2003'
                },
                {
                    name:'Face Waxing',
                    id:'2004'
                },
                {
                    name:'Facials',
                    id:'2005'
                },
                {
                    name:'Clean-up',
                    id:'2006'
                },
                {
                    name:'Laser Treatment',
                    id:'2007'
                },
                {
                    name:'Shaving',
                    id:'2008'
                },
                {
                    name:'Skin Treatments',
                    id:'2009'
                },
                {
                    name:'Skincare Consultations',
                    id:'2010'
                }
            ],
            "image": 'img/home/new-slider/Face.jpg'
        },
        "Hair":
        {
            "name": [
                {
                    name:'Beard Styling',
                    id:'1001'
                },
                {
                    name:'Blow Dry',
                    id:'1002'
                },
                {
                    name:'Hair Coloring',
                    id:'1003'
                },
                {
                    name:'Hair Consulting',
                    id:'1004'
                },
                {
                    name:'Hair Cut & Styling',
                    id:'1005'
                },
                {
                    name:'Hair Extension',
                    id:'1006'
                },
                {
                    name:'Head Massage',
                    id:'1007'
                },
                {
                    name:'Hair Spa',
                    id:'1008'
                },
                {
                    name:'Hair Transplant',
                    id:'1009'
                },
                {
                    name:'Hair Wash',
                    id:'1010'
                },
                {
                    name:'Other Hair Treatments',
                    id:'1011'
                },
                {
                    name:'Straightening/Perming',
                    id:'1012'
                },
                {
                    name:'Anti HairFall Treatment',
                    id:'1013'
                }
            ],
            "image": 'img/home/new-slider/Hair.jpg'
        },
        "HairRemoval":{
            "name": [
                {
                    name:'Underarms',
                    id:'3001'
                },
                {
                    name:'Arms',
                    id:'3002'
                },
                {
                    name:'Legs',
                    id:'3003'
                },
                {
                    name:'Full Body',
                    id:'3004'
                },
                {
                    name:'Full Back',
                    id:'3005'
                },
                {
                    name:'Midriff',
                    id:'3006'
                },
                {
                    name:'Bikini',
                    id:'3007'
                },
                {
                    name:'Side Locks',
                    id:'3008'
                },
                {
                    name:'Laser Hair Removal',
                    id:'3009'
                }
            ],
            "image": 'img/home/new-slider/Hair-Removal.jpg'
        },
        "Body": {
            "name": [
                {
                    name:'Body Polishing',
                    id:'4001'
                },
                {
                    name:'Body Toning',
                    id:'4002'
                },
                {
                    name:'Bleach',
                    id:'4003'
                },
                {
                    name:'Body Scrub',
                    id:'4004'
                },
                {
                    name:'Body wrap',
                    id:'4005'
                },
                {
                    name:'Body Treatments',
                    id:'4006'
                },
                {
                    name:'Botox Treatment',
                    id:'4007'
                },
                {
                    name:'Body Shaping and Contouring',
                    id:'4008'
                },
                {
                    name:'Tanning',
                    id:'4009'
                }],
            "image": 'img/home/new-slider/Body.jpg'
        },
        "HandsNfeets": {
            "name": [
                {
                    name:'Pedicure',
                    id:'5001'
                },
                {
                    name:'Manicure',
                    id:'5002'
                },
                {
                    name:'Cleanings',
                    id:'5003'
                }],
            "image": 'img/home/new-slider/Hands-Feet.jpg'
        },
        "Nails": {
            "name": [
                {
                    name:'Nail Art',
                    id:'6001'
                },
                {
                    name:'Nail Extension/Bar',
                    id:'6002'
                }],
            "image": 'img/home/new-slider/Nails.jpg'
        },
        "Packages": {
            "name": [
                {
                    name:'Packages',
                    id:'7001'
                }],
            "image": 'img/home/new-slider/Packages.jpg'
        }
    };
    $ionicLoading.show();
    $timeout(function () {
        $ionicLoading.hide();
    }, 10000);
    var VendorServiceList  = JSON.parse(window.localStorage['VendorServiceList']);
    var locationInfo = JSON.parse(window.localStorage['selectedLocation'])
    var hasVendorList = checkLocalStorage('vendorsName');
    if(!hasVendorList){
        vendorList();
    }
    else{
        allVendorService.getVlistVersion(locationInfo.cityId).then(function(res){
            var newVersion = res
            if(window.localStorage['vendorsListVersion']<newVersion){
                vendorList();
            }
            else{
                $scope.vendorNames = JSON.stringify(window.localStorage['vendorsName'])
                $ionicLoading.hide();

            }
        })
    }
    function vendorList() {
        $ionicLoading.show();
        allVendorService.getVendorsList(locationInfo.cityId).then(function(response){
            $ionicLoading.hide();
            var vendors = response;
            var version = response.version;
            for(key in vendors){
                var venObj={
                    vid: key,
                    vName: vendors[key]
                }
                $scope.vendorNames.push(venObj);
            }
            window.localStorage['vendorsName'] = JSON.stringify($scope.vendorNames)
            window.localStorage['vendorsListVersion'] = version;
        })
    }


    ///////     Get selected services if previously stored in localStorage           //////////

    if ((localStorage.getItem("slectedItems") != null) && (localStorage.getItem('catItems') != null)) {
        $scope.selectedServices = JSON.parse(localStorage.getItem('slectedItems'));
        $scope.categoryItems = JSON.parse(localStorage.getItem('catItems'));
    }
    else{
        $scope.selectedServices = {};
        $scope.categoryItems = {};
    }

    $rootScope.$on('category', function (event, args) {
        $scope.message = args.message;
        $scope.selectedServices = JSON.parse(localStorage.getItem('slectedItems'));
        $scope.categoryItems = JSON.parse(localStorage.getItem('catItems'));
    });

    //             update the slide number for slide box    ////////////

    $scope.slideHasChanged = function(index,activeTab) {
        if(activeTab == true){
            $scope.currSlide = index;
            $scope.tabActive = false;
        }
        else if(activeTab == false){
            $scope.index_number = index;
            $scope.currSlide = $ionicSlideBoxDelegate.currentIndex();
            if(index == 3){
                $ionicScrollDelegate.$getByHandle('myhandel').scrollTo(300, 0, true);
            }
            else if(index == 2){
                $ionicScrollDelegate.$getByHandle('myhandel').scrollTo(30, 0, true);

            }
            else if(index == 5){
                $ionicScrollDelegate.$getByHandle('myhandel').scrollTo(700, 0, true);
            }
        }
    };

    $scope.nextSlide = function() {
        $ionicSlideBoxDelegate.next();
    };


    $scope.scrollToRight = function($event) {
        $($event.currentTarget).toggleClass("ion-chevron-right ion-chevron-left");
        if($($event.currentTarget).hasClass("ion-chevron-right")){
            $ionicScrollDelegate.$getByHandle('myhandel').scrollTo(0, 0, true);
        }else{
            $ionicScrollDelegate.$getByHandle('myhandel').scrollTo(500, 0, true);
        }
    };

    $scope.tabWithSlideChanged = function (indexNum) {
        $scope.tabActive = true;
        $scope.index_number = indexNum;
        $ionicSlideBoxDelegate.slide(indexNum);
        if(indexNum == 3){
            $ionicScrollDelegate.$getByHandle('myhandel').scrollTo(300, 0, true);
        }
        else if(indexNum == 2){
            $ionicScrollDelegate.$getByHandle('myhandel').scrollTo(30, 0, true);

        }
        else if(indexNum == 5){
            $ionicScrollDelegate.$getByHandle('myhandel').scrollTo(700, 0, true);
        }
    };

    $scope.selectItem = function(index,serviceName,service_id) {
        var data = {
            name:serviceName,
            id:service_id
        };
        // If not already present remove else store the name/id
        if(($scope.selectedServices[serviceName]) && ($scope.categoryItems[serviceName])){
            delete $scope.selectedServices[serviceName];
            delete $scope.categoryItems[serviceName];
        }else{
            $scope.selectedServices[serviceName] = true;
            $scope.categoryItems[serviceName] = data;
        }
        localStorage.setItem('slectedItems', JSON.stringify($scope.selectedServices));
        localStorage.setItem('catItems', JSON.stringify($scope.categoryItems));
        $rootScope.$broadcast('category', { message: 'category length changed' });
    };

    $scope.backButton = function(){
        $state.go('app.home');
    };

    $scope.discoverSalons = function () {
        $state.go('vendorList',{vendorPage:'discoverSalons'});
    };
    $scope.findVendors = function() {
        var itemLength = _.size($scope.selectedServices);
        if(itemLength == 0){

                $cordovaToast
                    .show('Please select at least one service', 'long', 'center')
                    .then(function (success) {
                        // success
                    }, function (error) {
                        // error
                    });

        }
        else{
            $scope.serviceIds = [];
            if (localStorage.getItem('catItems')) {
                var items = JSON.parse(localStorage.getItem('catItems'))
                for(key in items){
                    $scope.serviceIds.push(items[key].id);
                }
            }
            $scope.finalServiceIds = _.uniq($scope.serviceIds)
            $scope.vendorIds = [];
            var count = 0;
            var vendorsIds = [];
            var finalVendorIds =[];
            for(key in $scope.finalServiceIds){
                if(VendorServiceList[$scope.finalServiceIds[key]]){
                    vendorsIds[count] = VendorServiceList[$scope.finalServiceIds[key]].split(',');
                    if(count != 0) {
                        finalVendorIds = _.intersection(vendorsIds[count], finalVendorIds)
                    }
                    else{
                        finalVendorIds = vendorsIds[count];
                    }
                    count++;
                }
                else{
                    vendorsIds[count] = [];
                    if(count != 0) {
                        finalVendorIds = _.intersection(vendorsIds[count], finalVendorIds)
                    }
                    else{
                        finalVendorIds = vendorsIds[count];
                    }
                    count++;
                }
            }
            if(finalVendorIds.length>0){
                window.localStorage['VendorServiceListIds'] = JSON.stringify(finalVendorIds);
                $state.go('vendorList',{vendorPage:'serviceList'});
            }
            else{

                    $cordovaToast
                        .show('No,vendor found for selected services.', 'long', 'center')
                        .then(function (success) {
                            // success
                        }, function (error) {
                            // error
                        });

            }
        }
    };
});