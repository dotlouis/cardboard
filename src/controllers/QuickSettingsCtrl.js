angular.module('cardboard.controllers').controller('QuickSettingsCtrl', [
  '$rootScope',
  '$scope',
  function($rootScope, $scope) {
    $scope.clearTypes = {
      cache: false,
      cookies: false,
      history: false,
      localStorage: false,
    };
    $scope.initDropdowns('.card.quicksettings .dropdown-card-btn i');

    function isAllFalse(object) {
      for (var key in object)
        if (object.hasOwnProperty(key)) if (object[key] !== false) return false;
      return true;
    }

    $scope.clearDisabled = function() {
      return $scope.isClearing || isAllFalse($scope.clearTypes);
    };

    $scope.clearText = 'Clear';
    $scope.isClearing = false;
    $scope.waveTimeout = true;

    $scope.clear = function() {
      // forbid spamming button immediately
      if (!$scope.clearDisabled()) {
        // general progress bar
        $rootScope.loading = true;
        $scope.waveTimeout = false;
        $scope.isClearing = true;

        // wait 500ms until the wave animation ends before disabing it
        Promise.delay(500).then(function() {
          if ($scope.isClearing) $scope.clearText = 'Clearing';
          $scope.waveTimeout = true;
          $scope.$apply();
        });

        chrome.browsingData
          .removeAsync({ since: 0 }, $scope.clearTypes)
          // Promise.delay(3000) //mocks
          .then(function() {
            // completed
            $rootScope.loading = false;
            $scope.clearText = 'Clear';
            $scope.isClearing = false;
            $scope.waveTimeout = true;
            $scope.$apply();
            Materialize.toast('Cleared !', 4000);
          });
      }
    };
  },
]);
