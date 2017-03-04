app.controller('mapCtrl', function($scope, $ionicPlatform, $state, $timeout, $ionicLoading,$rootScope,
                                   $cordovaLaunchNavigator,$ionicHistory, $stateParams,$cordovaToast){

    $scope.showPrevious = function(){
        $scope.hashistory = Object.keys($ionicHistory.viewHistory().views).length;

        if($scope.hashistory != 1){
            $ionicHistory.goBack();
        }
        else{
            $state.go('app.home');
        }
    }

    var address= $stateParams.name.concat('</br>',$stateParams.add1,'</br>',$stateParams.add2);

    function showMap(coords) {

        var myLatlng = new google.maps.LatLng(coords.latitude,coords.longitude);

        var mapOptions = {
            center: myLatlng,
            zoom:15,
            mapTypeId : google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

        var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            title: 'Salon'
        });

        marker.addListener('click', function() {
            infowindow.open(map, marker);
        });

        var infowindow = new google.maps.InfoWindow({
            content: address
        });

        infowindow.open(map, marker);
    }



    $ionicPlatform.ready(function() {
        var posOptions = {timeout:50000, enableHighAccuracy:false};
        $scope.coords = [];
        $scope.coords.latitude = $stateParams.lat;
        $scope.coords.longitude = $stateParams.lng;
        showMap($scope.coords);
    });
    var locationInfo = JSON.parse(window.localStorage['selectedLocation']);

    $scope.centerOnMe = function () {
        var destination = [$stateParams.lat, $stateParams.lng];
        var start = [locationInfo.latitude,locationInfo.longitude];
        $cordovaLaunchNavigator.navigate(destination, start).then(function() {
            console.log("Navigator launched");
        }, function (err) {
                $cordovaToast
                    .show(err, 'long', 'center')
                    .then(function (success) {
                        // success
                    }, function (error) {
                        // error
                    });

            console.error(err);
        });
    };

});
