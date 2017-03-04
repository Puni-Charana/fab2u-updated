app.controller('BookingsCtrl', function($scope,$state,$ionicLoading,$ionicPopup,$rootScope,
										$cordovaToast,$timeout,userServices){

	$timeout(function () {
		$ionicLoading.hide();
	}, 10000);
	$ionicLoading.show();

	$scope.bookingIds = [];
	$scope.allBookings = [];
	$scope.bookingsLoaded = false;
	$scope.activeBookingId = '';
	$scope.allBookingInfo = {};
	var count1 = 0;
	var count2 = 0;
	$scope.fromDate = new Date();
	$scope.monthName = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

	var locationInfo = JSON.parse(window.localStorage['selectedLocation']);


	if(window.localStorage['allBookingInfo']){
		$scope.allBookingInfo = JSON.parse(window.localStorage['allBookingInfo']);
		if(_.size($scope.allBookingInfo)>0){
			getAllBookingIds();
		}
		else{
			getBookingTimings();
		}
	}
	else if(localStorage.getItem('uid')){
		getBookingTimings();
	}
	else{
		$scope.allBookingInfo = {};
	}

	function getAllBookingIds() {
		userServices.AllBookingIds(localStorage.getItem('uid')).then(function (result) {
			if(result){
				count1 = Object.keys(result).length;
				for(key in result){
					count2++;
					$scope.bookingIds.push(key)
				}
				if(count1 == count2){
					allBookingsDetail()
				}
			}
			else{
				$ionicLoading.hide();
			}
		})
	}

	// All the booking id for cancelled booking and active booking and their detail
var count4 = 0;
var count3 = 0;
	function allBookingsDetail() {
		count3 = $scope.bookingIds.length;
		for (var i = 0; i <$scope.bookingIds.length; i++) {
			count4++;
			detailBooking($scope.bookingIds[i], count4, $scope.bookingIds.length)
		}
	}
	function detailBooking(bookingId, x, y) {
		firebase.database().ref('bookings/' + bookingId).once('value', function (response) {
			if (response.val()) {
				$scope.allBookings.push(response.val());
			}
		}).then(function(){
			if(x == y){
				$ionicLoading.hide();
				$scope.bookingsLoaded = true;
			}
		});
	}

	function getBookingTimings() {
		userServices.getAllBookingTimes(localStorage.getItem('uid')).then(function (result) {
			if(result){
				console.log("if")
				$scope.allBookingInfo = result;
				getAllBookingIds();
			}
			else{
				firebase.database().ref('userBookings/'+localStorage.getItem('uid')).once('value', function (response) {
					console.log(response.val())
					if(response.val()) {
						for(key in response.val()){
							$scope.bookingIds.push(key)
						}
						allBookingsDetail()
					}
					else{
						$timeout(function () {
							$ionicLoading.hide();
							$scope.bookingsLoaded = true;
						},100)
					}
				})

			}
		})
	}

	///////////////////////////cancel booking ///////////////////////////////////////////


	//////    To check time of cancellation of booking is less than two hour of appointment time ///
	getTimeFormat();
	function getTimeFormat() {

		var bookDateForAppointment = $scope.fromDate.getDate()+'-'+$scope.monthName[$scope.fromDate.getMonth()]+'-'+$scope.fromDate.getFullYear();

		/// add '2' for difference of 2 hour from right now time ////////
		$scope.timeTobe = (new Date().getHours()+2)+':'+new Date().getMinutes();

		$scope.thisCancelTime = toTimestamp(bookDateForAppointment + ' ' + $scope.timeTobe);
	}


	//  To calculate the time stamp for selected date and and current time  ////

	function toTimestamp(thisBookingTime) {
		var datum = Date.parse(thisBookingTime);
		return datum;
	}

	$scope.bookingCancel = function(b_id){
		var confirmPopup = $ionicPopup.confirm({
			title: 'Note',
			template: 'Wallet Money is refundable only if booking is cancelled 2 hour prior to Appointment Time'
		});

		confirmPopup.then(function(res) {
			if(res) {
				cancelAppointment(b_id);
			} else {
				console.log('You are not sure');
			}
		});
	};

	function cancelAppointment(booking_id){
		$ionicLoading.show();
		var updates = {};
		firebase.database().ref('bookings/' + booking_id).once('value', function (response) {
			if(response.val()){
				$scope.bookingInformation = response.val();
				if(($scope.thisCancelTime == $scope.bookingInformation.appointmentTime) || ($scope.thisCancelTime < $scope.bookingInformation.appointmentTime)){
					console.log("refund wallet money if used");
					if($scope.bookingInformation.walletAmount > 0){
						var walletTransactionId = db.ref('userWallet/' + localStorage.getItem('uid')+'/credit').push().key;
						var transactionDetail = {
							'amount': $scope.bookingInformation.walletAmount,
							'transactionId': walletTransactionId,
							'bookingId': $scope.bookingInformation.bookingId,
							'creditDate': new Date().getTime(),
							'type':'userCancelled'
						};
						updates['userWallet/' + localStorage.getItem('uid')+'/credit/'+walletTransactionId] = transactionDetail;
					}
					updates['bookings/'+$scope.bookingInformation.bookingId+'/'+'userStatus'] = 'cancelled';
					updates['userBookings/'+localStorage.getItem('uid')+'/'+$scope.bookingInformation.bookingId] = 'cancelled';
					updates['vendorBookings/'+$scope.bookingInformation.vendorId+'/'+$scope.bookingInformation.bookingId] = 'cancelled';
					updates['bookingsTiming/' + localStorage.getItem('uid') + '/' + $scope.bookingInformation.bookingId] = null;
					confirmationMsg(updates)
				}
				else{
					updates['bookings/'+$scope.bookingInformation.bookingId+'/'+'userStatus'] = 'cancelled';
					updates['userBookings/'+localStorage.getItem('uid')+'/'+$scope.bookingInformation.bookingId] = 'cancelled';
					updates['vendorBookings/'+$scope.bookingInformation.vendorId+'/'+$scope.bookingInformation.bookingId] = 'cancelled';
					confirmationMsg(updates)
				}

			}
		})
	}


	function confirmationMsg(updates) {
		db.ref().update(updates).then(function(){
			///// delete booking id from local storage ///////
			delete $scope.allBookingInfo[$scope.bookingInformation.bookingId];
			window.localStorage['allBookingInfo'] = JSON.stringify($scope.allBookingInfo);
			$rootScope.$broadcast('booking', { message: 'booking cancelled' });
			$state.go('app.home');
			$ionicLoading.hide();
			if($scope.bookingInformation.walletAmount>0){

					$cordovaToast
						.show('Your booking is cancelled. Rs.' + $scope.bookingInformation.walletAmount + 'is successfully refunded in your wallet', 'long', 'center')
						.then(function (success) {
							// success
						}, function (error) {
							// error
						});

			}
			else{

					$cordovaToast
						.show('Your booking is cancelled.', 'long', 'center')
						.then(function (success) {
							// success
						}, function (error) {
							// error
						});

			}
		});
	}
	
	$scope.go_home = function () {
		$state.go('app.home');
	};

	$scope.bookingDetail = function (id) {
		$state.go('bookingDetail',{bookingId:id});
	};
});