angular.module('cardboard.controllers')

.controller('TopSitesCtrl', ['$scope','ChromeFactory', function($scope, Chrome){
    $scope.maxTopSites = 5;

    Chrome.topSites.getAsync().then(function(topSites){
        $scope.$apply(function(){
            $scope.topSites = topSites;
        });
        $scope.initDropdowns('.card.topsites .dropdown-card-btn');
    });
}]);
