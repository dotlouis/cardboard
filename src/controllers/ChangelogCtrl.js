angular.module('cardboard.controllers')

.controller('ChangelogCtrl', [
    '$scope',
    'ChromeFactory',
    function($scope, Chrome){
    $scope.settings.spread(function(settings){
        $scope.version = settings.version;
    });
}]);
