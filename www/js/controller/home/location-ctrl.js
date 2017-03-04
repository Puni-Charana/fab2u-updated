app.controller('LocationCtrl', function($state, $scope,$timeout,$rootScope,$ionicHistory,
										$ionicModal,$ionicLoading,LocationService) {

	$timeout(function () {
		$ionicLoading.hide();
	}, 5000);
	$scope.backButtonValue = false;
	$scope.localities = [];
	function backButtonVisibility() {
		if($ionicHistory.backView().stateName == 'app.home'){
			$scope.backButtonValue = true;
		}
		else{
			$scope.backButtonValue = false;
		}
	}
	backButtonVisibility();

	function getCityList() {
		$ionicLoading.show();
		LocationService.getAllCity().then(function (result) {
			console.log(result)
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
	getCityList();

    $scope.backButton = function(){
        $state.go('app.home');
    };
    $scope.selected_city = function(cityInfo){
    	$scope.cityId = cityInfo.cityId;
        	$timeout( function() {
				openLocalityOption();
        	}, 500);
    };

	$ionicModal.fromTemplateUrl('templates/home/locality.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.location = modal;
	});
	function openLocalityOption() {
		$ionicLoading.show();
		$scope.localities = [];
		LocationService.getCityLocality($scope.cityId).then(function (result) {
			if(result){
				for(key in result){
					$scope.localities.push(result[key]);
				}
				$scope.location.show();
				$ionicLoading.hide();
			}
			else{
				$scope.localities = [];
				$ionicLoading.hide();
			}
		})
	}
	$scope.close_location = function() {
		$scope.location.hide();
	};

	$scope.location_selected = function(val){
		console.log(window.localStorage['selectedLocation'])
		var selectedLocation = JSON.parse(window.localStorage['selectedLocation'] || '{}');
		selectedLocation.cityId = val.cityId;
		selectedLocation.cityName	= val.cityName;
		selectedLocation.latitude = val.latitude;
		selectedLocation.longitude = val.longitude;
		selectedLocation.state = val.state;
		selectedLocation.country = val.country;
		selectedLocation.locationName = val.locationName;
		window.localStorage['selectedLocation'] = JSON.stringify(selectedLocation);
		$rootScope.$broadcast('location', { message: 'location changed' });
		$timeout( function() {
			$scope.location.hide();
			$state.go('feed');
		}, 500);
	};
});