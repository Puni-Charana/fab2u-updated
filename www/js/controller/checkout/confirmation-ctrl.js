app.controller('ConfirmationCtrl', function($scope, $ionicLoading, $state, $timeout,$ionicPopup,
											$rootScope,$cordovaToast, $http, $filter) {
	$ionicLoading.show();
	$timeout(function () {
		$ionicLoading.hide();
	}, 5000);
	$scope.promoAmount = 0;
	var loggedIn = checkLocalStorage('uid');
	$scope.appointmentTime = '';
	$scope.goBack = function(){
		$state.go('dateTime');
	};
	if(!loggedIn){
		localStorage.setItem('confirmation', true);
		$ionicLoading.hide();
		$rootScope.from ={
			stateName: 'confirmation',
			params:''
		}
		$state.go('login');
	} else {
		function referralDetail() {
			if(window.localStorage.getItem("referralCode")){
				db.ref('referralCode/'+window.localStorage.getItem("referralCode")).on("value", function(response){
					if(response.val()){
						db.ref("users/data/"+response.val().uid).on("value", function(snapshot){
							$scope.referralName = snapshot.val().name;
							$scope.referralContact = snapshot.val().mobile.mobileNum;
						});
					}
					else{
						$scope.referralContact = '';
						$scope.referralName = '';
					}
				});
			}
			else{
				$scope.referralContact = '';
				$scope.referralName = '';
			}
		}
		referralDetail();

		var hasCartItems = checkLocalStorage('BegItems');
		var vendorId = window.localStorage.getItem("vendorId");
		var locationInfo = JSON.parse(window.localStorage['selectedLocation']);
		var userId = localStorage.getItem('uid');
		var timeOfAppointment = window.localStorage.getItem("chosenTime");
		var appointmentDate = JSON.parse(localStorage.getItem('appointmentDate'));
		var appointmentDateInfo = appointmentDate.date + '/' + appointmentDate.month + '/' + appointmentDate.year;
		var couponForBooking;

		var bookDateForAppointment = appointmentDate.date +'-'+appointmentDate.month+'-'+appointmentDate.year;

		var time = '';
		var format = timeOfAppointment.substring(timeOfAppointment.length-2, timeOfAppointment.length);
		console.log("time format",format);
		if(format == 'AM'){
			time = timeOfAppointment.substring(0, timeOfAppointment.length-2);
			toTimestamp(bookDateForAppointment + ' ' + time);
			console.log("time in case of am",time);
		} else {
			var res = timeOfAppointment.split(":");
			var hh = res[0];
			console.log("hh",hh);
			if(hh == 12){
				time= hh+':'+res[1];
				time = time.substring(0, time.length-2);
				toTimestamp(bookDateForAppointment + ' ' + time);
				console.log("time in case of pm with 12",time);
			}
			else{
				hh = parseInt(hh)+12;
				time= hh+':'+res[1];
				time = time.substring(0, time.length-2);
				toTimestamp(bookDateForAppointment + ' ' + time);
				console.log("time in case of pm",time);
			}
		}

		// console.log(vendorId, locationInfo);

		// console.log(hasCartItems);
		var newCart = [];
		var cartItems;
		$scope.total_fabtu = 0;
        $scope.total_original = 0;
        $scope.customer_price = 0;
        $scope.version = 0;
        $scope.paidFromWallet = 0;
        $scope.walletAmount = 0;
        $scope.hasWalletBalance = false;
        $scope.discountAmount = 0;
        $scope.amountPayable = 0;
        $scope.fab2uPayableAmount = 0;
        $scope.promoCodeApplied = false;
        $scope.amount = 0;

	    $scope.getWalletAmount = function() {
	        if ($scope.amount > 0) {
	            if ($scope.customer_price > $scope.amount) {
	                var amount1 = parseInt($scope.customer_price/ 2);
	                var amount2 = $scope.amount;
	                var balance = 0;
	                if (amount1 < amount2) {
	                    balance = amount1;
	                } else {
	                    balance = amount2;
	                }
	                if (balance > 200) {
	                    $scope.walletAmount = 200;
	                } else {
	                    $scope.walletAmount = balance;
	                }
	            } else {
	                var amount1 = parseInt($scope.customer_price / 2);
	                var amount2 = $scope.amount;
	                var balance = 0;
	                if (amount1 < amount2) {
	                    balance = amount1;
	                } else {
	                    balance = amount2;
	                }
	                if (balance > 200) {
	                    $scope.walletAmount = 200;
	                } else {
	                    $scope.walletAmount = balance;
	                }
	            }
	            $scope.useWalletAmount = true;
	        } else {
	            $scope.useWalletAmount = false;
	        }
	        $ionicLoading.hide();
	    }


		function toTimestamp(thisBookingTime) {
			console.log("thisBookingTime",thisBookingTime)

			$scope.appointmentTime = Date.parse(thisBookingTime);
              console.log("datum",$scope.appointmentTime)
		}

	    $scope.getWalletInfo = function() {
	        $ionicLoading.show();
	        firebase.database().ref('userWallet/' + userId).once('value', function(response) {
	        	var debitAmount = 0;
	        	var creditAmount = 0;
	        	if(response.val()){
	        		if(response.val().debit){
	        			angular.forEach(response.val().debit, function(value, key){
	        				debitAmount = debitAmount+ value.amount;
	        			})
	        		}
	        		if(response.val().credit){
	        			angular.forEach(response.val().credit, function(value, key){
	        				console.log("value",value);
	        				console.log("key",key);
	        				creditAmount = creditAmount+ value.amount;
	        			})
	        		}
	        		$scope.amount = creditAmount - debitAmount;
	        		if($scope.amount > 0){
	        			$scope.hasWalletBalance = true;
	        			$scope.getWalletAmount();
	        		} else {
	        			$ionicLoading.hide();
	        		}
	        	} else {
	        		$ionicLoading.hide();
	        	}
	            // $scope.userWalletInfo = response.val();
	            // console.log($scope.userWalletInfo);
	            // $scope.amount = $scope.amount;
	            // if($scope.amount > 0){
	            // 	$scope.hasWalletBalance = true;
	            // 	$scope.getWalletAmount();
	            // } else {
	            // 	$ionicLoading.hide();
	            // }
	        })
	    };

	    $scope.getWalletInfo();

        $scope.bookingInfo = function(){
        	firebase.database().ref('protectedVendorsVersions/' + locationInfo.cityId + '/' + vendorId + '/live/version').once('value', function(snapshot){
        		console.log(snapshot.val());
        		$scope.version = snapshot.val();
        	})
        	// console.log('working');
        }

		$scope.getPrice = function(cart){
	        var count = 0;
	        angular.forEach(cartItems, function(value, key) {
	            count++;
	            $scope.total_fabtu += value.fab2uPrice;
	            $scope.total_original += value.vendorPrice;
	            $scope.customer_price += value.customerPrice;
	            if (count == _.size(cart)) {
	            	$scope.amountPayable = $scope.customer_price;
	                $scope.bookingInfo();
	            }
	        });
		}

		if(hasCartItems){
			cartItems = JSON.parse(localStorage.getItem('BegItems'));
			var count = 0;
			console.log(_.size(cartItems));
			angular.forEach(cartItems, function(value, key) {
				newCart.push(value);
				console.log(newCart);
				count++;
				if(count == _.size(cartItems)){
					$scope.getPrice(newCart);
				}
			});
		}

		$scope.toggleCheckbox = function(){
			$scope.isChecked = !$scope.isChecked;
			if($scope.isChecked == true){

					$cordovaToast
						.show('You can utilize only 50% of booking amount from wallet maximum upto Rs. 200 '+
							'in one booking.', 'long', 'center')
						.then(function (success) {
							// success
						}, function (error) {
							// error
						});

			}
			$scope.calculateAmountPayable();
		};

		$scope.addCoupon = function(couponCode) {
			console.log('called');
			$ionicLoading.show();
			//  get city and check if the coupon code is apllicable to the selected city
			//  check if the coupon code is applicable to the selected vendor
			//  check if coupon code id valid
			//  check user cart amount
			//  get coupon code amount

			// if coupon code is not undefined && not empty
			couponForBooking = couponCode
			if(couponCode!=undefined && couponCode!='' && couponCode!=' '){
				console.log(couponCode);
				firebase.database().ref().child('promotions/cart')
					.orderByChild('promoCode')
					.startAt(couponCode)
					.endAt(couponCode)
					.once('value', function(snapshot) {
						console.log('called');
						$timeout(function(){
							if(snapshot.val()!=null){
								console.log(snapshot.val());
								verifyPromoCode(snapshot.val(), couponCode);
							}else{
								$ionicLoading.hide();

									$cordovaToast
										.show('Enter a valid promo code, not found.', 'long', 'center')
										.then(function (success) {
											// success
										}, function (error) {
											// error
										});

							}
						});
					});
			}
			else{

					$cordovaToast
						.show('Please enter a coupon code!', 'long', 'center')
						.then(function (success) {
							// success
						}, function (error) {
							// error
						});

			}
		}

		function verifyPromoCode(promoData , coupon) {
			console.log('called');
	        var promotionCodeInfo = "";
	        var city = locationInfo;
	        var applicableCities = null;
	        var applicableVendors = null;
	        var isValidPromo = false;

	        angular.forEach(promoData, function(promotionValue, key){
	            promotionCodeInfo = promotionValue;
	            applicableCities = promotionCodeInfo.applicableCities;
	            applicableVendors = promotionCodeInfo.applicableVendors;
	        });

	        var today = (new Date).getTime();
	        // check if the promo code is active
	        // Note +86400000 because the endate entered is 12 AM. the code should continue till the end of the day
	        if(today > promotionCodeInfo.startDate && today < (promotionCodeInfo.endDate)){
	            // check if the promo code is appicable to the user selected city
	            if(applicableCities!= undefined || applicableCities!=null){
	                angular.forEach(applicableCities, function(city, key){
	                    console.log(city, key);
	                    if(city.cityName==locationInfo.cityName){
	                        isValidPromo = true;
	                    }
	                });
	                if(!isValidPromo){
	                	$ionicLoading.hide();

							$cordovaToast
								.show('Sorry the promo code you entered is not applicable to your current city.', 'long', 'center')
								.then(function (success) {
									// success
								}, function (error) {
									// error
								});

						return;
	                }else{
	                    console.log("valid for city");
	                }
	            } // if applicableCities

	            // check if the promo code is appicable to the user selected vendor
	            if(applicableVendors!= undefined || applicableVendors!=null){
	                angular.forEach(applicableVendors, function(vendor, vendorKey){
	                    // compare with key because key is unique
	                    console.log(vendor.vendorId , vendorId);
	                    if(vendor.vendorId == vendorId){
	                        isValidPromo = true;
	                    }else{
	                        isValidPromo = false;
	                    }
	                });

	                if(!isValidPromo){
	                	$ionicLoading.hide();

							$cordovaToast
								.show('Sorry the promo code you entered is not applicable to this vendor.', 'long', 'center')
								.then(function (success) {
									// success
								}, function (error) {
									// error
								});

						return;
	                }else{
	                    console.log("valid for vendor");
	                }
	            } // if applicableVendors
	        }else{
	            isValidPromo = false;
	            $ionicLoading.hide();

					$cordovaToast
						.show('Promo code expired', 'long', 'center')
						.then(function (success) {
							// success
						}, function (error) {
							// error
						});

	            return;
	        } // is active


	        // if promo code is valid for city or vendor 
	        if(isValidPromo) {
	            // alert("promo code is valid");
	            // check if min cart value is applicable
	            if($scope.customer_price>=promotionCodeInfo.minCartAmount){
	                // continue with booking
					if(promotionCodeInfo.amountType == 'fixed'){
						console.log(promotionCodeInfo.amount);
						$scope.promoAmount = promotionCodeInfo.amount;
						$scope.discountAmount = promotionCodeInfo.amount;
						$scope.promoCodeApplied = true;
						$scope.calculateAmountPayable();
						$ionicLoading.hide();
						$ionicPopup.alert({
							title: 'Promo Code Applied',
							template: 'Successfully applied '+coupon
						})
						console.log("promo code is valid, apply promo code");
					}
					else if(promotionCodeInfo.amountType == 'percentage'){
						var discountUpTo = Math.round(($scope.customer_price * promotionCodeInfo.amount)/100);
						if(discountUpTo <= promotionCodeInfo.maxDiscount){
							$scope.discountAmount = discountUpTo;
							$scope.promoAmount = promotionCodeInfo.maxDiscount;
							$scope.promoCodeApplied = true;
							$scope.calculateAmountPayable();
							$ionicLoading.hide();
							$ionicPopup.alert({
								title: 'Promo Code Applied',
								template: 'Successfully applied '+coupon
							})
						}
						else{
							$scope.discountAmount = promotionCodeInfo.maxDiscount;
							$scope.promoAmount = promotionCodeInfo.maxDiscount;
							$scope.promoCodeApplied = true;
							$scope.calculateAmountPayable();
							$ionicLoading.hide();
							$ionicPopup.alert({
								title: 'Promo Code Applied',
								template: 'Successfully applied '+coupon
							})
						}
					}

	            }else{
	                // min cart value does not meet required condition
	                $ionicLoading.hide();

						$cordovaToast
							.show('Your cart value is less than min cart value (' + promotionCodeInfo.minCartAmount + ')', 'long', 'center')
							.then(function (success) {
								// success
							}, function (error) {
								// error
							});

	            }

	        }else{
	        	$ionicLoading.hide();

					$cordovaToast
						.show('Not a valid promo code.', 'long', 'center')
						.then(function (success) {
							// success
						}, function (error) {
							// error
						});

	        }// isValidPromo
	    }

	    $scope.calculateAmountPayable = function() {
	        $scope.getWalletAmount();
	        if ($scope.isChecked == true) {
	            $scope.paidFromWallet = $scope.walletAmount;
	            $scope.amount = $scope.amount- $scope.walletAmount;
	            $scope.amountPayable = $scope.customer_price - $scope.walletAmount -$scope.discountAmount;
				$scope.fab2uPayableAmount = $scope.walletAmount + $scope.discountAmount;
	            if ($scope.amountPayable < 0) {
	                $scope.amountPayable = 0;
	            }
	        } else {
	        	console.log($scope.amountPayable, $scope.walletAmount, $scope.discountAmount);
	        	// $scope.amount = $scope.amount;  first it was
	        	$scope.amount = $scope.amount + $scope.walletAmount;
	        	// $scope.amount = $scope.walletAmount;
	            $scope.paidFromWallet = 0;
	            $scope.amountPayable = $scope.customer_price -$scope.discountAmount;
				$scope.fab2uPayableAmount = $scope.discountAmount;
	            console.log($scope.amountPayable);
	            if ($scope.amountPayable < 0) {
	                $scope.amountPayable = 0;
	            }
	        }
	    }

		String.prototype.shuffle = function () {
		    var a = this.split(""),
		        n = a.length;
		    for(var i = n - 1; i > 0; i--) {
		        var j = Math.floor(Math.random() * (i + 1));
		        var tmp = a[i];
		        a[i] = a[j];
		        a[j] = tmp;
		    }
		    return a.join("");
		}

		function generateBookingId(length, chars) {
		    var result = '';
		    for (var i = length-1; i > 0; --i){
				result += chars[Math.round(Math.random() * (chars.length - 1))];
			}
		    return (result+Math.floor(Math.random() * 10)).shuffle();
		}
		var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';



	    $scope.confirmedBooking = function(){
	    	$ionicLoading.show();
	    	bookingId = generateBookingId(8, chars);
	    	console.log(bookingId);
            var bookingDetails = {
            	'bookingId': bookingId,
                'userId': userId,
                'userName': localStorage.getItem('name'),
                'userMobile': localStorage.getItem('mobileNumber'),
                'cityId': locationInfo.cityId,
                'cityName': locationInfo.cityName,
                'vendorId': vendorId,
                'vendorName': window.localStorage.getItem("vendorName"),
				'vendorMobile':window.localStorage.getItem("vendorMobile"),
			    'vendorLandline':window.localStorage.getItem("vendorLandline"),
			    'vendorLandmark':window.localStorage.getItem("vendorLandmark"),
			    'vendorAmount': $scope.total_original,
                'serviceInfo': newCart,
				'promoAmount':$scope.promoAmount,
                'createdDate': new Date().getTime(),
                'appointmentTime': $scope.appointmentTime,
                'versionNumber': $scope.version,
				'userStatus': 'upComing',
                'walletAmount' : $scope.paidFromWallet,
                'discountAmount': $scope.discountAmount,
                'customerAmount': $scope.customer_price,
                'amountPayable': $scope.amountPayable,
                'walletTransId': '0',
                'discountTransId': '0',
                'specialRequest': 'updated soon!',
				'vendorStatus':'upComing',
				'referralCode':window.localStorage.getItem("referralCode"),
				'referralName':$scope.referralName,
				'referralContactNumber':$scope.referralContact,
				'fab2uPayableAmount':$scope.fab2uPayableAmount

            };
            console.log("bookingDetails",bookingDetails);
			$scope.insertBooking(bookingDetails);
		};

		$scope.insertBooking = function(bookingDetails){
			var updates = {};
			if(bookingDetails.walletAmount > 0){
				console.log('yes');
				var walletTransactionId = db.ref('userWallet/' + userId+'/debit').push().key;
				bookingDetails.walletTransId = walletTransactionId;
				console.log(walletTransactionId);
				var transactionDetail = {
					'amount': bookingDetails.walletAmount,
					'transactionId': walletTransactionId,
					'bookingId': bookingDetails.bookingId,
					'usedAt': bookingDetails.createdDate,
					'type':''
				}
				updates['userWallet/' + userId+'/debit/'+walletTransactionId] = transactionDetail;
			}
			if(bookingDetails.discountAmount > 0){
				console.log(bookingDetails.discountAmount);
				var walletTransactionId1 = db.ref('userWallet/' + userId+'/discountCoupons').push().key;
				bookingDetails.discountTransId = walletTransactionId1;
				bookingDetails.couponUsed = couponForBooking;
				var transactionDetail1 = {
					'amount': bookingDetails.discountAmount,
					'transactionId': walletTransactionId1,
					'bookingId': bookingDetails.bookingId,
					'usedAt': bookingDetails.createdDate,
					'couponCode': couponForBooking
				}
				updates['userWallet/' + userId+'/discountCoupons/'+walletTransactionId1] = transactionDetail1;
			}
			updates['bookings/'+bookingDetails.bookingId] = bookingDetails;
			updates['userBookings/'+userId+'/'+bookingDetails.bookingId] = 'active';
			updates['cityBookings/'+locationInfo.cityId+'/'+vendorId+'/'+bookingDetails.bookingId] = true;
			updates['vendorBookings/'+vendorId+'/'+bookingDetails.bookingId] = 'active';
			updates['bookingsTiming/'+userId+'/'+bookingDetails.bookingId] = bookingDetails.appointmentTime;

			db.ref().update(updates).then(function(){
				
				if(checkLocalStorage('allBookingInfo')){
					var allBookingInfo = JSON.parse(window.localStorage['allBookingInfo'])
					allBookingInfo[bookingDetails.bookingId] = bookingDetails.appointmentTime;
				}
				else{
					var allBookingInfo = {};
					allBookingInfo[bookingDetails.bookingId] = bookingDetails.appointmentTime;
				}
				window.localStorage['allBookingInfo'] = JSON.stringify(allBookingInfo);
				window.localStorage.setItem("currentBookingId", bookingDetails.bookingId);
				clearOldLocalStorage();
				$rootScope.$broadcast('booking', { message: 'booking changed' });
				bookingUpdates(bookingDetails);
			});
		}
		/*
		* This function call an api to send reminder sms about booking 
		* made by user to vendor and user once booking is confirm
		*/
		function bookingUpdates(bookingDetails){
			var selected_services = [];
			for (var i=0; i<bookingDetails.serviceInfo.length; i++){
				selected_services.push(bookingDetails.serviceInfo[i].menuItemName);
			}
			var unix_time =  bookingDetails.appointmentTime;
			var date = $filter('date')(new Date(unix_time), "MMM d, y"); 
    		var time = $filter('date')(new Date(unix_time), "h:mm a");
    		var vendor_mobile = bookingDetails.vendorMobile;
    		
    		if(!vendor_mobile){ // If vendor number not found add fab2u number
    			vendor_mobile = 7349080684;
    		}
    		// vendor_mobile = 9799914449; // used for testting
			url ="http://35.154.142.199/api/booking-update?"
				+"user_mobile="+bookingDetails.userMobile
				+"&vendor_mobile="+vendor_mobile
				+"&venue="+bookingDetails.vendorName
				+"&booking_id="+bookingDetails.bookingId
				+"&date="+date
				+"&time="+time
				+"&customer_amount="+bookingDetails.customerAmount
				+"&fab2u_amount="+bookingDetails.fab2uPayableAmount
				+"&customer="+bookingDetails.userName
				+"&services="+selected_services.toString()

				$http({
				   	method: 'POST',
				   	url:url,
				   	crossDomain: true
				}).success(function(data, status, headers, config) {
				   	// console.log(data);
				   	// alert(data);
				   	$ionicLoading.hide();
				   	$state.go('bill');
				}).error(function(data, status, headers, config){
				   	// console.log(data, status);
				   	$ionicLoading.hide();
				   	$state.go('bill');
				});
		}

		function clearOldLocalStorage() {
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
			delete window.localStorage.mapStorage;
			delete window.localStorage.appointmentDate;
		}
	}
});
