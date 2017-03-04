app.controller('VendorDetailsCtrl',
    function(allVendorService,$scope, $ionicSlideBoxDelegate, $ionicModal,$stateParams,$state
        ,$ionicLoading,$rootScope,$cordovaToast,$timeout,favouriteVendorsService){

        $scope.vendorId = $stateParams.ven_id;
        $scope.images =[];
        $scope.dataLoaded = false;
        $scope.reviewerName = '';
        $scope.reviewerImage = '';
        $scope.selectedServices = {};
        $scope.menu_button = true;
        $scope.more = false;
        $scope.days = [];
        $scope.review_info = [];
        $scope.currentValue = 0;
        $scope.liked = false;
        var d = new Date();
        var sorter = {
            // "sunday": 0, // << if sunday is first day of week
            "monday": 1,
            "tuesday": 2,
            "wednesday": 3,
            "thursday": 4,
            "friday": 5,
            "saturday": 6,
            "sunday": 7
        }

        var weekday = new Array(7);
        weekday[0]=  "sunday";
        weekday[1] = "monday";
        weekday[2] = "tuesday";
        weekday[3] = "wednesday";
        weekday[4] = "thursday";
        weekday[5] = "friday";
        weekday[6] = "saturday";
        var n = weekday[d.getDay()];
        $scope.location = JSON.parse(window.localStorage['selectedLocation']);
        $scope.myUid = localStorage.getItem('uid');

        $timeout(function () {
            $ionicLoading.hide();
        }, 10000);

        showMenuButton();
        function showMenuButton() {
            if(window.localStorage.getItem("selectedTab")=='true'){
                $scope.menu_button = false;
            }
            else{
                $scope.menu_button = true;
            }
        }
        // Get selected services if previously stored in localstorage
        checkSelectedServices();
        function checkSelectedServices() {
            if ((localStorage.getItem("slectedItem") != null) && (localStorage.getItem('BegItems'))) {
                $scope.selectedServices = JSON.parse(localStorage.getItem('slectedItem'));
            }
            else{
                $scope.selectedServices = {};
            }
        }

        $rootScope.$on('cart', function (event, args) {
            $scope.message = args.message;
            $scope.selectedServices = JSON.parse(localStorage.getItem('slectedItem'));
        });

        ///////////////////////////////////////////////////////////////////////////////////

        ////////////////////// To update slide number ////////////////////////////////////////
        $scope.next = function() {
            $ionicSlideBoxDelegate.next();
        };
        $scope.previous = function() {
            $ionicSlideBoxDelegate.previous();
        };
        $scope.changeSlide = function(val){
            $scope.currentValue = val;
            $ionicSlideBoxDelegate.$getByHandle('vendorMainDetails').slide(val);
        };

        //////////////////////////Get vendor detail  /////////////////////////////////////
        getVendorDetail();

        function getVendorDetail() {
            $ionicLoading.show();
            allVendorService.getVendorInfo($scope.location.cityId,$scope.vendorId).then(function (result) {
                if(result){
                    $scope.vendor_detail = result;
                    getDistance($scope.location.latitude,$scope.location.longitude,$scope.vendor_detail.address.latitude,$scope.vendor_detail.address.longitude,'km');
                    $ionicLoading.hide();
                    if($scope.vendor_detail.images){
                        if($scope.vendor_detail.images.gallery){
                            angular.forEach($scope.vendor_detail.images.gallery, function (value, key) {
                                var imgUrl = 'http://1272343129.rsc.cdn77.org/fab2u/vendors/'+$scope.location.cityId+
                                    '/'+$scope.vendorId+'/gallery/'+value.url+'-s.jpg'
                                // $scope.images.push({id: key, src: value.url})
                                $scope.images.push({id: key, src: imgUrl})
                            });
                        }
                        else{
                            $scope.images.push({id: 'dummy', src: 'img/vendorMain.jpg'})
                        }

                    }
                    else{
                        $scope.images.push({id: 'dummy', src: 'img/vendorMain.jpg'})
                    }
                }
                else{
                    $scope.vendor_detail = '';
                    $ionicLoading.hide();
                }
            })
        }

        /////////////////////get distance ////////////////////////////////
        function getDistance(latitude1,longitude1,latitude2,longitude2,units) {
            var p = 0.017453292519943295;    //This is  Math.PI / 180
            var c = Math.cos;
            var a = 0.5 - c((latitude2 - latitude1) * p)/2 +
                c(latitude1 * p) * c(latitude2 * p) *
                (1 - c((longitude2 - longitude1) * p))/2;
            var R = 6371; //  Earth distance in km so it will return the distance in km
            $scope.dist = Math.round(2 * R * Math.asin(Math.sqrt(a)));
            if($scope.dist){
                return true;
            }
            else{
                return false;
            }

        }
        ///////////////////////ratings         /////////////////////////////
        $scope.starrating=function(rating) {
            if(rating){
                var newRating = Math.round(rating)
                return new Array(newRating);
            }//ng-repeat will run as many times as size of array
        };


        //////////////////////////vendor service timings   //////////////////////
        $scope.showVendorTiming = function(time_info){
            $scope.days = [];
            for(key in time_info){
                $scope.days.push({name : key,Times:time_info[key]})
            }
            $scope.more = !$scope.more;
            daySorter();
        };

        function daySorter() {
            $scope.days.sort(function sortByDay(a, b) {
                var day1 = a.name.toLowerCase();
                var day2 = b.name.toLowerCase();
                return sorter[day1] > sorter[day2];
            });
        }

        ////////////////////Gallery image show up and down   ///////////////////
        $ionicModal.fromTemplateUrl('templates/vendor/image.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });

        $scope.openModal = function() {
            $ionicSlideBoxDelegate.$getByHandle('ImgGallery').slide(0);
            $scope.modal.show();
        };

        $scope.closeModal = function() {
            $scope.modal.hide();
        };

        $scope.goToSlide = function(value){
            $ionicSlideBoxDelegate.$getByHandle('ImgGallery').slide(value);
            $scope.modal.show();
        };

        ///////////////////to check active function  ////////////////////////
        $scope.slideHasChanged = function(value){
            if(value == 2){
                getReviewList();
            }
            else{
                $scope.review_info = [];
            }
            $scope.currentValue = value;
        };

        $rootScope.$on('reviewList', function (event, args) {
            getReviewList();
        });
        /////////////////////////////////////////////////////////////////////////

        ///////// To get review for a particular vendor ////////////////////////

        function getReviewList() {
            $ionicLoading.show();
            allVendorService.getAllReview($scope.location.cityId, $scope.vendorId).then(function (result) {
                if (result) {
                    $scope.reviews = result;
                    for (key in $scope.reviews) {
                        if($scope.reviews[key].image){
                            if($scope.reviews[key].image.indexOf('http')==-1){
                                $scope.reviews[key].image = "http://1272343129.rsc.cdn77.org/fab2u/users/"+
                                    $scope.reviews[key].userId+"/"+$scope.reviews[key].image+"-xs.jpg";
                            }
                            else{
                                $scope.reviews[key].image = $scope.reviews[key].image;
                            }
                        }
                        $scope.review_info.push($scope.reviews[key]);

                    }
                    $scope.dataLoaded = true;
                    $ionicLoading.hide();
                }
                else {
                    $scope.dataLoaded = true;
                    $scope.reviews = '';
                    $ionicLoading.hide();
                }
            })
        }

        //////////////////post and edit review for a vendor      /////////////////////

        $scope.ratingsCallback = function(rating) {
            console.log("rating",rating)
            $scope.custReview.rating = rating;
        };
        $scope.ratingsObject = {
            iconOn: 'ion-ios-star',
            iconOff: 'ion-ios-star-outline',
            iconOnColor: '#ffd11a',
            iconOffColor: '#b38f00',
            rating: 0,
            minRating: 0,
            readOnly:false,
            callback: function(rating) {
                $scope.ratingsCallback(rating);
            }
        };

        $scope.custReview ={
            review:'',
            rating: 0
        };

        $ionicModal.fromTemplateUrl('templates/vendor/editReview.html',{
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.edit_rate_vendor = modal;
        });

        $scope.close_edit_modal = function(){
            $scope.edit_rate_vendor.hide();
        };

        $ionicModal.fromTemplateUrl('templates/checkout/review.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.rate_vendor = modal;
        });

        $scope.rateVendor = function() {
            $scope.custReview ={
                review:'',
                rating: 0
            };
            $scope.ratingsObject = {
                iconOn: 'ion-ios-star',
                iconOff: 'ion-ios-star-outline',
                iconOnColor: '#ffd11a',
                iconOffColor: '#b38f00',
                rating: 0,
                minRating: 0,
                readOnly:false,
                callback: function(rating) {
                    $scope.ratingsCallback(rating);
                }
            };
            $scope.rate_vendor.show();
        };

        $scope.storeReview = function(){
            if(localStorage.getItem('uid')){
                if($scope.custReview.rating == 0){
                    $cordovaToast
                        .show('Please, select rating', 'long', 'center')
                        .then(function(success) {
                            // success
                        }, function (error) {
                            // error
                        });
                }
                else{
                    var updates = {};
                    var reviewId = firebase.database().ref('reviews/'+ $scope.location.cityId+'/'+
                        $scope.vendorId+'/Reviews').push().key;
                    firebase.database().ref('users/data/'+localStorage.getItem('uid')).once('value',function(response) {
                        if(response.val()){
                            if(response.val().photoUrl){
                                $scope.reviewData = {
                                    'ReviewId':reviewId,
                                    'BookingId':'',
                                    'userId':localStorage.getItem('uid'),
                                    'ReviewText':$scope.custReview.review,
                                    'ReviewRating':$scope.custReview.rating,
                                    'VendorId':$scope.vendorId,
                                    'cityName':$scope.location.cityName,
                                    'ReviewDate':new Date().getTime(),
                                    'name':response.val().name,
                                    'image':response.val().photoUrl
                                };
                            }
                            else{
                                $scope.reviewData = {
                                    'ReviewId':reviewId,
                                    'BookingId':'',
                                    'userId':localStorage.getItem('uid'),
                                    'ReviewText':$scope.custReview.review,
                                    'ReviewRating':$scope.custReview.rating,
                                    'VendorId':$scope.vendorId,
                                    'cityName': $scope.location.cityName,
                                    'ReviewDate':new Date().getTime(),
                                    'name':response.val().name,
                                    'image':''
                                };
                            }

                            var userReviewData = {
                                'VendorId':$scope.vendorId,
                                'cityId':$scope.location.cityId,
                                'cityName':$scope.location.cityName

                            }
                            updates['reviews/'+$scope.location.cityId+'/'+ $scope.vendorId+
                            '/Reviews/'+$scope.reviewData.ReviewId] = $scope.reviewData;
                            updates['userReviews/'+localStorage.getItem('uid')+'/'+$scope.reviewData.ReviewId] = userReviewData;

                            db.ref().update(updates).then(function () {
                                $scope.custReview ={
                                    review:'',
                                    rating: 0
                                };
                                $state.reload();
                                $ionicLoading.hide();
                                $rootScope.$broadcast('reviewList', { message: 'review list changed' });

                                    $cordovaToast
                                        .show('Thanks for reviewing, your feedback is important to us.', 'long', 'center')
                                        .then(function (success) {
                                            // success
                                        }, function (error) {
                                            // error
                                        });

                                $scope.rate_vendor.hide();
                            });
                        }
                        else{
                                $cordovaToast
                                    .show('Something went wrong!', 'long', 'center')
                                    .then(function (success) {
                                        // success
                                    }, function (error) {
                                        // error
                                    });

                        }
                    })
                }
            }
            else{

                    $cordovaToast
                        .show('Please login first!', 'long', 'center')
                        .then(function (success) {
                            // success
                        }, function (error) {
                            // error
                        });

            }
        };

        $scope.close_modal = function () {
            $scope.rate_vendor.hide();

        };


        $scope.editReview = function (editReviewInfo) {
            $scope.editData = editReviewInfo;
            $scope.edit_rate_vendor.show();
        };


        $scope.storeEditReview = function(data){
            if(localStorage.getItem('uid')){
                if($scope.custReview.rating == 0){

                        $cordovaToast
                            .show('Please, select rating', 'long', 'center')
                            .then(function (success) {
                                // success
                            }, function (error) {
                                // error
                            });

                }
                else{
                    var updates = {};
                    var reviewId = data.ReviewId;
                    firebase.database().ref('users/data/'+localStorage.getItem('uid')).once('value',function(response) {
                        if(response.val()){
                            if(response.val().photoUrl){
                                $scope.reviewData = {
                                    'ReviewId':reviewId,
                                    'BookingId':'',
                                    'userId':localStorage.getItem('uid'),
                                    'ReviewText':$scope.custReview.review,
                                    'ReviewRating':$scope.custReview.rating,
                                    'VendorId':$scope.vendorId,
                                    'cityName':$scope.location.cityName,
                                    'ReviewDate':new Date().getTime(),
                                    'name':response.val().name,
                                    'image':response.val().photoUrl
                                };
                            }
                            else{
                                $scope.reviewData = {
                                    'ReviewId':reviewId,
                                    'BookingId':'',
                                    'userId':localStorage.getItem('uid'),
                                    'ReviewText':$scope.custReview.review,
                                    'ReviewRating':$scope.custReview.rating,
                                    'VendorId':$scope.vendorId,
                                    'cityName':$scope.location.cityName,
                                    'ReviewDate':new Date().getTime(),
                                    'name':response.val().name,
                                    'image':''
                                };
                            }

                            var userReviewData = {
                                'VendorId':$scope.vendorId,
                                'cityId':$scope.location.cityId,
                                'cityName':$scope.location.cityName
                            }
                            updates['reviews/'+$scope.location.cityId+'/'+
                            $scope.vendorId+'/Reviews/'+$scope.reviewData.ReviewId] = $scope.reviewData;
                            updates['userReviews/'+localStorage.getItem('uid')+'/'+$scope.reviewData.ReviewId] = userReviewData;
                            db.ref().update(updates).then(function () {
                                $scope.custReview ={
                                    review:'',
                                    rating: 0
                                };
                                $state.reload();
                                $ionicLoading.hide();
                                $rootScope.$broadcast('reviewList', { message: 'review list changed' });

                                    $cordovaToast
                                        .show('Thanks for reviewing, your feedback is important to us.', 'long', 'center')
                                        .then(function (success) {
                                            // success
                                        }, function (error) {
                                            // error
                                        });

                                $scope.edit_rate_vendor.hide();
                            });
                        }
                        else{

                                $cordovaToast
                                    .show('Something went wrong!', 'long', 'center')
                                    .then(function (success) {
                                        // success
                                    }, function (error) {
                                        // error
                                    });
                        }

                    })
                }
            }
            else{

                    $cordovaToast
                        .show('Please login first!', 'long', 'center')
                        .then(function (success) {
                            // success
                        }, function (error) {
                            // error
                        });

            }
        }


        ///////////////////////// To check vendor is fav or not //////////////
        getFavVendor();
        function getFavVendor() {
            if(localStorage.getItem('uid')){
                favouriteVendorsService.getFavVendors(localStorage.getItem('uid')).then(function(result){
                    if(result){
                        for(key in result){
                            if(result[key] == $scope.vendorId){
                                $scope.liked = true;
                                return;
                            }
                            else{
                                $scope.liked = false;
                            }
                        }
                    }
                    else{
                        $scope.liked = false;
                    }
                })
            }
            else{
                $scope.liked = false;
            }
        }


        $scope.likeVendor = function(){
            var key = db.ref('favourites/'+localStorage.getItem('uid')).push().key;
            var favouriteData = {
                vendorId:$stateParams.ven_id,
                vendorDetail:$scope.vendor_detail
            };
            if(localStorage.getItem('uid') && key){
                firebase.database().ref('favourites/'+localStorage.getItem('uid')+'/'+key)
                    .set(favouriteData,function(response) {
                        if(response ==null){
                            $scope.liked  = !$scope.liked ;

                                $cordovaToast
                                    .show('Vendor added to your favorite list.', 'long', 'center')
                                    .then(function (success) {
                                        // success
                                    }, function (error) {
                                        // error
                                    });

                        }
                        else{

                                $cordovaToast
                                    .show('Sorry, we can not added this vendor to your favourite vendor list. Please try again!', 'long', 'center')
                                    .then(function (success) {
                                        // success
                                    }, function (error) {
                                        // error
                                    });

                        }
                    })
            }
            else{

                    $cordovaToast
                        .show('Please login/SignUp first!.', 'long', 'center')
                        .then(function (success) {
                            // success
                        }, function (error) {
                            // error
                        });

            }

        };

        $scope.open_map = function(latitude,longitude,line1,line2,vendorName){
            $state.go('map',{
                'lat': latitude,
                'lng': longitude,
                'add1': line1,
                'add2': line2,
                'name': vendorName
            });
        };


        $scope.cart = function(){
            if(_.size($scope.selectedServices)>0){
                $ionicLoading.hide();
                $state.go('cart',{'ven_id':$stateParams.ven_id});
            }
            else{

                    $cordovaToast
                        .show('Please select at least one service.', 'long', 'center')
                        .then(function (success) {
                            // success
                        }, function (error) {
                            // error
                        });

            }
        };

        $scope.vendorMenu = function(){
            if(window.localStorage.getItem("selectedTab")=='true'){
                $ionicLoading.hide()
                $state.go('vendorSelectedMenu',{vendor_id:$stateParams.ven_id});
            }
            else{
                $ionicLoading.hide();
                $state.go('vendorMenu',{'vendor_id':$stateParams.ven_id})

            }
        };

    });