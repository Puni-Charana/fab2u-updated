app.controller('HomeCtrl',function($scope,$q,$state,$timeout,$ionicLoading,$location,$cordovaToast,
								$ionicSlideBoxDelegate,$ionicHistory,allServiceList,$rootScope,
								   homeServices) {
	$ionicHistory.clearHistory();
	$ionicHistory.clearCache();
	$timeout(function () {
		$ionicLoading.hide();
	}, 10000);

	/// clear all the un-required local Storage ////////////

	clearUnUsedLocalStorage();
	function clearUnUsedLocalStorage() {
		delete window.localStorage.slectedItems;
		delete window.localStorage.catItems;
		delete window.localStorage.serviceId;
		delete window.localStorage.chosenTime;
		delete window.localStorage.vendorName;
		delete window.localStorage.vendorMobile;
		delete window.localStorage.vendorLandmark;
		delete window.localStorage.vendorLandline;
		delete window.localStorage.vendorId;
		delete window.localStorage.slectedItem;
		delete window.localStorage.BegItems;
		delete window.localStorage.previousOtp;
		delete window.localStorage.pageName;
		delete window.localStorage.selectedTab;
		delete window.localStorage.currentBookingId;
		delete window.localStorage.mapStorage;
		delete window.localStorage.VendorServiceListIds;
	}
	$scope.fabSelected = false;
	var locationInfo = JSON.parse(window.localStorage['selectedLocation']);

	$scope.categories = [
		{catHeading: 'Salons', catSubheading: 'Be Bold, Be Daring, Be Fabulous', catImg: 'img/home/cat/salon.jpg'},
		{catHeading: 'Spa', catSubheading: 'Walk in , Float out', catImg: 'img/home/cat/spa.jpg',serviceId:'8001'},
		{catHeading: 'Fitness', catSubheading: 'Stop Saying Tomorrow', catImg: 'img/home/cat/fitness.jpg',serviceId:'9001'},
		{catHeading: 'Wedding & Party', catSubheading: 'Because Memories Last Forever', catImg: 'img/home/cat/wedding.jpg',serviceId:'1101'},
		{catHeading: 'Tattoo', catSubheading: 'Show The Word Your Story', catImg: 'img/home/cat/tattoo.jpg',serviceId:'1201'}
	];


	///////////////////////Select fab-book or  services //////////////
	$scope.selectButton = function(val){
		if(val == 1){
			$scope.fabSelected = false;
		} else {
			$scope.fabSelected = true;
			$location.path("/feed");
		}
	};

	/////////////////////////////Get home banners for selected city////////////////////////
	function getBanners(){
		$ionicLoading.show();
		homeServices.getSelectedCityBanner(locationInfo.cityId).then(function(result){
			console.log("result",JSON.stringify(result))
			if(result){
				$scope.banners = result;
				$ionicSlideBoxDelegate.update();
				$ionicLoading.hide();
			}
			else{
				homeServices.getDefaultBanner().then(function (result) {
					$scope.banners = result;
					$ionicSlideBoxDelegate.update();
					$ionicLoading.hide();
				})
			}
		})
	}
	getBanners();


	//////////////////////end get banners function /////////////////////////////////
	///////////////////////Get vendor list regarding to their services /////////////

	if(!checkLocalStorage('VendorServiceList')){
		getVendorServiceList()
	}
	else{
		allServiceList.getServiceVersion(locationInfo.cityId).then(function(res){
			var newVersion = res;
			if(window.localStorage['VendorServiceListVersion']<newVersion){
				getVendorServiceList()
			}
			else{
				$scope.VendorIdForService = JSON.parse(window.localStorage['VendorServiceList']);
			}
		})
	}
	function getVendorServiceList(){
		allServiceList.getAllServices(locationInfo.cityId).then(function (response) {
			var result = response;
			var version = response.version;
			window.localStorage['VendorServiceList'] = JSON.stringify(result);
			window.localStorage['VendorServiceListVersion'] = version;
			$scope.VendorIdForService  = response;
		})
	}


	////////////////////////end vendor list regarding to services   ///////////////////////


	$scope.selectedCategory = function(cat){
		if(cat == 'Salons'){
			$state.go('salonServices');
		}
		else if(cat == 'Spa') {
			var serviceIds = ["8001"];
			VendorIdsForSelectedCategory(serviceIds)
		}
		else if(cat == 'Fitness') {
			var serviceIds = ["9001"];
			VendorIdsForSelectedCategory(serviceIds)
		}
		else if(cat == 'Wedding & Party') {
			var serviceIds = ["1101"];
			VendorIdsForSelectedCategory(serviceIds)
		}
		else if(cat == 'Tattoo') {
			var serviceIds = ["1201"];
			VendorIdsForSelectedCategory(serviceIds)
		}
	};

	////////////////////////////vendor's list for selected category   ////////////////////

	function VendorIdsForSelectedCategory(serviceId) {
		if(serviceId){
			$scope.finalServiceIds = _.uniq(serviceId)
			$scope.vendorIds = [];
			var count = 0;
			var vendorsIds = [];
			var finalVendorIds =[];
			for(key in $scope.finalServiceIds){
				if($scope.VendorIdForService[$scope.finalServiceIds[key]]){
					vendorsIds[count] = $scope.VendorIdForService[$scope.finalServiceIds[key]].split(',');
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
						.then(function(success) {
							// success
						}, function (error) {
							// error
						});

			}
		}
		else{

				$cordovaToast
					.show('Please, select some services!', 'long', 'center')
					.then(function (success) {
						// success
					}, function (error) {
						// error
					});

		}
	}



});
