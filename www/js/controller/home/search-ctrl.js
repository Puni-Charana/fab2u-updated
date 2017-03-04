app.controller('SearchCtrl', function($state, $scope,$http,$timeout,$ionicLoading) {

    $scope.searchQuery = '';
    clearUnUsedLocalStorage();
    function clearUnUsedLocalStorage() {
        delete window.localStorage.slectedItems;
        delete window.localStorage.catItems;
        delete window.localStorage.serviceId;
        delete window.localStorage.selectedTab;
        delete window.localStorage.serviceId;
        delete window.localStorage.BegItems;
    }

    var locationInfo = JSON.parse(window.localStorage['selectedLocation']);
    $scope.vendorNames = [];

    $ionicLoading.show();

    $timeout(function () {
        $ionicLoading.hide();
    }, 5000);

    var hasVendorList = checkLocalStorage('vendorsName');
    if(!hasVendorList){
        vendorList();
    }
    else{
        firebase.database().ref('vendorList/'+locationInfo.cityId+'/version').once('value',function(res) {
            var newVersion = res.val()
            if(window.localStorage['vendorsListVersion']<newVersion){
                vendorList();
            }
            else {
                $scope.vendorNames = JSON.parse(window.localStorage['vendorsName'])
                console.log( $scope.vendorNames)
            }
        })
    }
    function vendorList() {
        firebase.database().ref('vendorList/'+locationInfo.cityId).once('value',function(response){
            var vendors = response.val();
            var version = response.val().version;
            for(key in vendors){
                var venObj={
                    vid: key,
                    vName: vendors[key]
                }
                $scope.vendorNames.push(venObj);
            }
            window.localStorage['vendorsName'] = JSON.stringify($scope.vendorNames)
            window.localStorage['vendorsListVersion'] = version;
        });
    }


    $scope.home = function(){
        $state.go('app.home');
    };

    $scope.vendorMenu = function(vendorId){
     window.localStorage.setItem("service_type",'vendor');
     $state.go('vendorMenu',{vendor_id:vendorId});
    };


});

