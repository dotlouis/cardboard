angular.module('cardboard.controllers').controller('TopSitesCtrl', [
  '$scope',
  function($scope) {
    $scope.maxTopSites = 5;

    chrome.topSites.getAsync().then(function(topSites) {
      $scope.$apply(function() {
        $scope.topSites = topSites;
      });
      $scope.initDropdowns('.card.topsites .dropdown-card-btn i');
    });
  },
]);
