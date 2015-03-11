angular.module('cardboard.controllers')

.controller('ChangelogCtrl', [
    '$scope',
    'ChromeFactory',
    function($scope, Chrome){
    $scope.settings.then(function(settings){
        $scope.version = settings.self.version;
    });
}]);
