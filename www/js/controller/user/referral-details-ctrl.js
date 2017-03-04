app.controller('ReferralDetailsCtrl',function($scope,$timeout,$state,$ionicLoading,
											  userServices,$rootScope,$cordovaToast){

	$timeout(function () {
		$ionicLoading.hide();
	}, 5000);
	var uId = window.localStorage.getItem('uid');
	if(uId){
		myReferral();
	}
	else{
		if($rootScope.mobileDevice) {
			$cordovaToast
				.show('Please login/SignUp first!', 'long', 'center')
				.then(function (success) {
					// success
				}, function (error) {
					// error
				});
		}
	}
	function myReferral() {
		userServices.getReferralCode(uId).then(function (result) {
			if(result){
				$scope.myReferralCode = result;
				myReferralHistory()
			}
			else{
				$scope.myReferralCode= '';
			}
		})
	}

	function myReferralHistory(){
		userServices.getReferralHistory($scope.myReferralCode).then(function (result) {
			if(result){
				if(result.referredBy){
					$scope.referralDetails = result.referredUsers;
					$scope.referredBy = result.referredBy;
					$scope.referredDate = result.referredDate;
					referredByInfo()
				}
				else{
					$scope.referralDetails = result.referredUsers;
				}
			}
			else{
				$scope.msg1 = 'Sorry,no history found yet!';
			}
		})
	}

	function referredByInfo() {
		userServices.getUserInfo($scope.referredBy).then(function (result) {
			if(result){
				$scope.referredByDetail = result;
			}
			else{
				$scope.referredByDetail = '';
			}
		})
	}

	$scope.goToRefer = function(){
		$state.go('refer');
	};
	$scope.referNearn = function () {
		$state.go('refer');
	};
})