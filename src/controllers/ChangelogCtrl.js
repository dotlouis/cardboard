angular.module('cardboard.controllers').controller('ChangelogCtrl', [
  '$scope',
  function($scope) {
    $scope.settings.then(function(settings) {
      $scope.version = settings.self.version;
    });
  },
]);
