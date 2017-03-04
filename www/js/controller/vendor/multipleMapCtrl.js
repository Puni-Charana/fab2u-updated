app.controller('multipleMapCtrl', function($scope, $ionicPlatform, $state, $timeout,
                                           $ionicLoading, $ionicHistory, $stateParams) {


    $scope.centerLocation = JSON.parse(window.localStorage['selectedLocation'] || '{}');

    var centerLat = $scope.centerLocation.latitude;
    var centerLong = $scope.centerLocation.longitude;

    $scope.showPrevious = function(){
       $state.go('vendorList',{vendorPage:$stateParams.vendorPage})
    };
    var mapData = JSON.parse(window.localStorage['mapStorage'])

    function initialize(){
        var myOptions = {
            center: new google.maps.LatLng(centerLat, centerLong),
            zoom: 12
        };

        var map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
        setMarkers(map);
    }
    initialize();

    function setMarkers(map){

        var marker, i

        for (index in mapData)
        {
            var data = mapData[index];
            var name = data.vendorName;
            var lat = data.address.latitude;
            var long = data.address.longitude;
            var add =  data.address.address1;

            latlngset = new google.maps.LatLng(lat, long);

            var marker = new google.maps.Marker({
                map: map, title: name , position: latlngset
            });
            map.setCenter(marker.getPosition())


            var content =  "<a href='#/vendorDetails/" + data.vendorId + "' id='DetailsButton'>"+
                createInfo(data) + "</a>" ;

            var infowindow = new google.maps.InfoWindow()

            google.maps.event.addListener(marker,'click', (function(marker,content,infowindow){
                return function() {
                    infowindow.setContent(content);
                    infowindow.open(map,marker);
                };
            })(marker,content,infowindow));

        }
    }

    function createInfo(vendor){
      var content =   ' <div class="card m-5 fab_card" style="text-decoration: none!important">' +
          '<div class="row"> <div class="col-33 image_display_1">'+
              ' <img ng-show="vendor.mainImage" src="http://1272343129.rsc.cdn77.org/fab2u/vendors/'+
          $scope.centerLocation.cityId+'/'+vendor.vendorId+'/main/'+vendor.mainImage+'-xs.jpg" class="pkg-img"' +
          ' style="max-width:80px; margin-top:25px">'+

           ' </div>'+
           ' <div id="part2" class="col-67">'+
           ' <div class="row"> <div class="col-50"> '+
            '<p id="f_13">' +
          '<i class="icon ion-ios-location c-location-icon"> </i>' +
           vendor.distance + 'Km'+
       ' </p> &nbsp; </div> '+
        '<div class="col-50">'+
            '<p id="vendor_type">'+vendor.vendorType+'</p>'+
        '</div> </div>'+
        '<div class="row" id="m_t">'+
            '<div class="col">'+
            '<p id="f_15">'+vendor.vendorName+'</p>'+
        '<p id="land_mark">'+ vendor.address.landmark+'</p>'+
        '</div> </div> </div> </div> </div>';
        return content;
    }



    // for(index in mapData){
    //     var markers = locations.map(function(location, i) {
    //         return new google.maps.Marker({
    //             position: location,
    //             label: labels[i % labels.length]
    //         });
    //     });
    // }

    $scope.showSalonList = function(){
        $scope.hashistory = Object.keys($ionicHistory.viewHistory().views).length;

        if(  $scope.hashistory != 1){
            $ionicHistory.goBack();
        }
        else{
            $state.go('app.home');
        }
    }

});



