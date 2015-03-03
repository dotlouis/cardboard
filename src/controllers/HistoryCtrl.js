angular.module('cardboard.controllers')

.controller('HistoryCtrl', [
    '$scope',
    'ChromeFactory',
    function($scope, Chrome){
    $scope.maxHistory = 5;

    Chrome.history.searchAsync({
        text: "", // empty for all pages
        maxResults: $scope.maxHistory
    }).then(function(history){
        $scope.$apply(function(){
            $scope.history = history;
        });
        $scope.initDropdowns('.card.history .dropdown-card-btn');
    });
}]);
