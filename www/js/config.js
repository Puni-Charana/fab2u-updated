app
.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {
	if (!ionic.Platform.isIOS()) {
		$ionicConfigProvider.scrolling.jsScrolling(false);
	}

    // App landing controller
    $stateProvider.state('landing', {
        url: '/landing',
        abstract: false,
		cache:false,
        templateUrl: 'templates/app/app-landing.html',
        controller: 'appLandingCtrl'
    });

    	$stateProvider
		.state('intro-slider', {
			url: '/intro-slider',
			templateUrl: 'templates/auth/intro-slider.html',
			controller: 'IntroSliderCtrl'
		})
		.state('app', {
			url: '/app',
			abstract: true,
			templateUrl: 'templates/home/menu.html',
			controller: 'AppCtrl'
		})
		.state('app.home', {
			url: '/home',
			cache:false,
			views: {
				'menuContent': {
					templateUrl: 'templates/home/home.html',
					controller: 'HomeCtrl'
				}
			}
		})

		.state('termsnConditions', {
			url: '/termsnConditions',
			templateUrl: 'templates/legal/termsnConditions.html'
		})
		.state('privacyPolicy', {
			url: '/privacyPolicy',
			templateUrl: 'templates/legal/privacyPolicy.html'
		});

	//State for vendor details
	$stateProvider.state('vendorDetails', {
		url: '/vendorDetails/:ven_id',
		cache:false,
		templateUrl: 'templates/vendor/vendorDetails.html',
		controller: 'VendorDetailsCtrl'
	});

	//State for refer a friend
	$stateProvider.state('refer', {
		url: '/refer',
		cache:false,
		templateUrl: 'templates/user/refer.html',
		controller: 'ReferCtrl'
	});

	//State for referral details
	$stateProvider.state('referralDetails', {
		url: '/referralDetails',
		cache:false,
		templateUrl: 'templates/user/referralDetails.html',
		controller: 'ReferralDetailsCtrl'
	});

	//State for date time
	$stateProvider.state('dateTime', {
		url: '/dateTime',
		cache:false,
		templateUrl: 'templates/checkout/dateTime.html',
		controller: 'DateTimeCtrl'
	});

	//State for bookings
	$stateProvider.state('bookings', {
		url: '/bookings',
		cache:false,
		templateUrl: 'templates/user/bookings.html',
		controller: 'BookingsCtrl'
	});
	//State for booking detail
	$stateProvider.state('bookingDetail', {
		url: '/bookingDetail/:bookingId',
		cache:false,
		templateUrl: 'templates/user/bookingDetail.html',
		controller: 'BookingDetailCtrl'
	});

	//State for search
	$stateProvider.state('search', {
		url: '/search',
		cache:false,
		templateUrl: 'templates/home/search.html',
		controller: 'SearchCtrl'
	});

	//State for location
	$stateProvider.state('location', {
		url: '/location',
		cache:false,
		templateUrl: 'templates/home/location.html',
		controller: 'LocationCtrl'
	});

	//State for service list
	$stateProvider.state('salonServices', {
		url: '/salonServices',
		cache:false,
		templateUrl: 'templates/home/service-list.html',
		controller: 'ServiceListCtrl'
	});

	$stateProvider.state('contact', {
		url: '/contact',
		cache:false,
		templateUrl: 'templates/legal/contact.html',
		controller:'ContactCtrl'

	});

	//State for favourites vendor
	$stateProvider.state('favourite', {
		url: '/favourite',
		cache:false,
		templateUrl: 'templates/home/favourite.html',
		controller: 'FavouriteCtrl'
	});

	//State for update app
	$stateProvider.state('updateApp', {
		url: '/updateApp',
		templateUrl: 'templates/general/updateApp.html',
		controller: 'updateAppCtrl'

	});
	$stateProvider.state('under-construction', {
		url: '/under-construction',
		templateUrl: 'templates/general/AppUnderConstruction.html',
		controller: 'AppUnderConstructionCtrl'

	});


	//State for cart
	$stateProvider.state('cart', {
		url: '/cart/:ven_id',
		cache:false,
		templateUrl: 'templates/checkout/cart.html',
		controller: 'CartCtrl'
	});

	//State for login
	$stateProvider.state('login', {
		url: '/login',
		cache:false,
		templateUrl: 'templates/auth/login.html',
		controller: 'LoginCtrl'
	});

	//State for signup
	$stateProvider.state('signup', {
		url: '/signup',
		cache:false,
		templateUrl: 'templates/auth/signup.html',
		controller: 'SignupCtrl'
	});

	//State for interest
	$stateProvider.state('interests', {
		url: '/interests',
		cache:false,
		templateUrl: 'templates/auth/interests.html',
		controller: 'interestCtrl'
	});

	//State for vendorList
	$stateProvider.state('vendorList', {
		url: '/vendorList/:vendorPage',
		cache:false,
		templateUrl: 'templates/vendor/vendorList.html',
		controller: 'VendorListCtrl'
	});

	$stateProvider.state('vendorMenu', {
		url: '/vendorMenu/:vendor_id',
		cache:false,
		templateUrl: 'templates/vendor/vendor-menu.html',
		controller: 'VendorServicesListCtrl'
	});

	//State for confirmation
	$stateProvider.state('confirmation', {
		url: '/confirmation',
		templateUrl: 'templates/checkout/confirmation.html',
		controller: 'ConfirmationCtrl'
	});

	//State for bill
	$stateProvider.state('bill', {
		url: '/bill',
		cache:false,
		templateUrl: 'templates/checkout/bill.html',
		controller: 'BillCtrl'
	});

	$stateProvider.state('map', {
		url: '/map/:lat/:lng/:add1/:add2/:name',
		cache:false,
		templateUrl: 'templates/vendor/map.html',
		controller: 'mapCtrl'
	});
	$stateProvider.state('mapMultiple', {
		url: '/mapMultiple/:vendorPage',
		cache:false,
		templateUrl: 'templates/vendor/mapMultiple.html',
		controller: 'multipleMapCtrl'
	});

	// $stateProvider.state('new-slider', {
	// 	url: '/new-slider',
	// 	templateUrl: 'templates/home/new-slider.html',
	// 	controller: 'NewSliderCtrl'
	// });

	//State for user wallet
	$stateProvider.state('userWallet', {
		url: '/userWallet',
		cache:false,
		templateUrl: 'templates/user/userWallet.html',
		controller: 'UserWalletCtrl'
	});


	$stateProvider.state('vendorSelectedMenu', {
		url: '/vendorSelectedMenu/:vendor_id',
		cache:false,
		templateUrl: 'templates/vendor/vendor-selected-menu.html',
		controller: 'VendorSelectedServicesListCtrl'
	});


	// $stateProvider.state('profile', {
	// 	url: '/profile',
	// 	templateUrl: 'templates/user/profile.html',
	// 	controller: 'profileCtrl',
	// 	resolve: {
	// 		currentAuth: function(AuthenticationService){
	// 			return AuthenticationService.checkAuthentication();
	// 		}
	// 	}
	// });

	$stateProvider
		.state('feed', {
			url: '/feed',
			cache:false,
			templateUrl: 'templates/feed/feed.html',
			controller: 'FeedCtrl'
		})
		.state('follow', {
			url: '/follow/:uid',
			cache:false,
			templateUrl: 'templates/feed/follow.html',
			controller: 'followCtrl'
		})
		.state('follower', {
			url: '/follower/:uid',
			cache:false,
			templateUrl: 'templates/feed/follower.html',
			controller: 'followerCtrl'
		})
		.state('followPosts', {
			url: '/followPosts/:followId',
			cache:false,
			templateUrl: 'templates/feed/followPosts.html',
			controller: 'followPostsCtrl'
		})
        .state('userSpecificPosts', {
            url: '/userSpecificPosts/:userIdForFeeds',
            cache:false,
            templateUrl: 'templates/feed/usersFeed.html',
            controller: 'usersFeedCtrl'
        })
		.state('tagFeed', {
			url: '/tag/:tag',
			cache:false,
			templateUrl: 'templates/feed/tag-feed.html',
			controller: 'tagFeedCtrl'
		})
		.state('userFeed', {
			url: '/user',
			cache:false,
			templateUrl: 'templates/feed/user-feed.html',
			controller: 'userFeedCtrl'
		})
		.state('newFeed', {
			url: '/new-feed',
			cache:false,
			templateUrl: 'templates/feed/new-feed.html',
			controller: 'newFeedCtrl'
			// resolve: {
			// 	currentAuth: function(AuthenticationService){
			// 		return AuthenticationService.checkAuthentication();
			// 	}
			// }
		})
		.state('nearmeFeed', {
			url: '/nearme',
			cache:false,
			templateUrl: 'templates/feed/nearme-feed.html',
			controller: 'nearmeFeedCtrl'
		});

	 $urlRouterProvider.otherwise('/landing');

	// var hasCurrentBooking = checkLocalStorage('currentBooking');
	// if(hasCurrentBooking == true){
	// 	$urlRouterProvider.otherwise("/bill");
	// }
	// else if(window.localStorage.getItem('SkipIntro')== "true"){
	// 	$urlRouterProvider.otherwise("/app/home");
	// }else{
	// 	$urlRouterProvider.otherwise("/app-start");
	// }
});
