app.controller('UserWalletCtrl',function($scope,$state,userServices,$ionicLoading,
										 $timeout,$rootScope,$cordovaToast){

	$timeout(function () {
		$ionicLoading.hide();
	}, 3000);

	var uId = localStorage.getItem('uid');
	$scope.amount = 0;
	$scope.walletHistory = [];

	if(uId){
		getWalletInfo();
	}
	else{

			$cordovaToast
				.show('Please login/SignUp first!', 'long', 'center')
				.then(function (success) {
					// success
				}, function (error) {
					// error
				});

	}

	// To get user wallet information for wallet money and transactions

	function getWalletInfo() {
		$ionicLoading.show();
		userServices.getWalletInfo(uId).then(function (result) {
			var debitAmount = 0;
			var creditAmount = 0;
			if(result){
				if(result.debit){
					angular.forEach(result.debit, function(value, key){
						$scope.walletHistory.push(value);
						debitAmount = debitAmount+ value.amount;
					})
				}
				if(result.credit){
					angular.forEach(result.credit, function(value, key){
						$scope.walletHistory.push(value);
						creditAmount = creditAmount+ value.amount;
					})
				}
				$scope.amount = creditAmount - debitAmount;
				$ionicLoading.hide();
			}
			else {
				$scope.msg = 'No history found';
				$ionicLoading.hide();
			}
		})
	}

	$scope.go_home = function () {
		$state.go('app.home')
	};
	$scope.myReferral = function () {
		$state.go('refer');
	};

});