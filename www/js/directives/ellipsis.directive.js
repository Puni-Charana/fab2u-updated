app.directive('ellipsis', [function () {
  return {
    required: 'ngBindHtml',
    restrict: 'A',
    priority: 100,
    link: function ($scope, element, attrs, ctrl) {
      $scope.hasEllipsis = false;
      $scope.$watch(element.html(), function (value) {
        if (!$scope.hasEllipsis) {
          // apply this code ONCE
          $scope.hasEllipsis = true;
          $(element).trunk8({
            fill: ' <a id="read-more"><i class="icon ion-more"></i></a>',
            lines: 1,
            tooltip: false,
            parseHTML: true
          });
          $(element).on('click', '#read-more', function (event) {
            $(element).trunk8('revert').append(' <a id="read-less">less</a>');
          });
          $(element).on('click', '#read-less', function (event) {
            $(element).trunk8();
          });
        }
      });
    }
  };
}]);
