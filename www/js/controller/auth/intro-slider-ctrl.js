app.controller('IntroSliderCtrl', function($scope, $ionicSlideBoxDelegate, $state,$ionicLoading) {
    $ionicLoading.hide();
    $scope.skipSlide = function() {
     $state.go('location');
    };

    $scope.nextSlide = function() {
        if ($ionicSlideBoxDelegate.currentIndex() == 3){
            $state.go('location');
        }
        else{
            $ionicSlideBoxDelegate.next();
        }
    };

});
