app.controller('AppCtrl', function($scope,$state,$rootScope,$ionicPopup,$ionicLoading,
								   $cordovaInAppBrowser,$cordovaDevice,AuthenticationService,
								   allVendorService,$cordovaToast,$timeout) {


	$scope.liked = false;
	$scope.vendorNames = [];
	$scope.location_info = JSON.parse(window.localStorage['selectedLocation']);
	$scope.uid = window.localStorage.getItem('uid');
	$rootScope.from ={
		stateName: 'app.home',
		params:''
	}

	$rootScope.$on('logged_in', function (event, args) {
		$scope.uid = window.localStorage.getItem('uid');
	});
	$timeout(function () {
		$ionicLoading.hide();
	}, 5000);

	////////////on location change delete local storage for new data regarding to selected city ////
	$rootScope.$on('location', function (event, args) {
		$scope.message = args.message;
		delete window.localStorage.vendorsName;
		delete window.localStorage.vendorsListVersion;
		delete window.localStorage.VendorServiceListVersion;
		delete window.localStorage.VendorServiceList;
		delete window.localStorage.allVendors;
		delete window.localStorage.allVendorsVersion;
		delete window.localStorage.pageName;
		$scope.location_info = JSON.parse(window.localStorage['selectedLocation']);
	});

	////////////////////end ///////////////////////////////////

	$scope.searchVendor = function(){
		$state.go('search');
	};

	$scope.selectLocation = function(){
		$state.go('location');
	};
	$scope.favouriteVendorList = function(){
		$state.go('favourite');
	};


	///////////////////Log out ///////////////////////

	$scope.logOut = function(){
		AuthenticationService.Logout();
		$rootScope.$broadcast('logout', {message: 'log out'});
		$state.go('app.home');
	};
	$rootScope.$on('logout', function (event, args) {
		$scope.uid = '';

			$cordovaToast
				.show('Logged out successfully!', 'long', 'center')
				.then(function (success) {
					// success
				}, function (error) {
					// error
				});

	});

	////////////Rate us over play store or iTunes   ////////////////////////////////

	$scope.rateUs = function(){
		var options = {
			location: 'yes',
			clearcache: 'yes',
			toolbar: 'no'
		};
		if($cordovaDevice.getDevice().manufacturer != 'Apple') {
			$cordovaInAppBrowser.open('https://play.google.com/store/apps/details?id=com.ionicframework.fab2u641617', '_system', options);
		}
		else if($cordovaDevice.getDevice().manufacturer == 'Apple'){
		  $cordovaInAppBrowser.open('https://itunes.apple.com/in/app/fab2u/id1089939160?mt=8', '_system', options);
		}
		else {
			var alertPopup = $ionicPopup.alert({
				title:'Currently not available',
				template: 'You will be able to rate us soon'
			});
		}

	};

	///////////////vendor list regarding to selected city for discover salon///////////////////

	var hasVendorList = checkLocalStorage('vendorsName');
	function vendorList() {
		$ionicLoading.show();
		allVendorService.getVendorsList($scope.location_info.cityId).then(function(response){
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
	if(!hasVendorList){
		vendorList();
	}
	else{
		allVendorService.getVlistVersion($scope.location_info.cityId).then(function(res){
			var newVersion = res
			if(window.localStorage['vendorsListVersion']<newVersion){
				vendorList();
			}
			else{
				///////////do nothing   ////////////////
				console.log("latest vendor list stored")
			}
		})
	}
	///////////////////end vendor list   ////////////////////////////////////////

});