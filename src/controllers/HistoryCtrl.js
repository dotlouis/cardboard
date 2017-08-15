angular.module('cardboard.controllers').controller('HistoryCtrl', [
  '$scope',
  function($scope) {
    $scope.maxHistory = 5;

    chrome.history
      .searchAsync({
        text: '', // empty for all pages
        maxResults: $scope.maxHistory,
      })
      .then(function(history) {
        $scope.$apply(function() {
          $scope.history = history;
        });
        $scope.initDropdowns('.card.history .dropdown-card-btn i');
      });
  },
]);
