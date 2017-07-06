angular.module('cardboard.controllers')
    .controller('AppCtrl', [
        '$scope',
        function ($scope) {
            $scope.apps = [];
            $scope.extensions = [];
            $scope.themes = [];
            if (chrome.management.getAll)
                chrome.management.getAll(function (all) {
                    angular.forEach(all, function (value, key) {
                        if (value.type == "extension")
                            $scope.extensions.push(value);
                        else if (value.type == "theme")
                            $scope.themes.push(value);
                        else if (value.enabled) {
                            if ($scope.$parent.card.settings && $scope.$parent.card.settings[value.id])
                                value.frequency = $scope.$parent.card.settings[value.id].frequency;
                            else
                                value.frequency = 0;

                            $scope.apps.push(value);
                        }
                    });
                    $scope.$apply();
                });
            $scope.initDropdowns('.card.apps .dropdown-card-btn');
            $('.card.apps .tooltipped').tooltip({ delay: 1000 });

            $scope.launch = function () {
                if (this.app.launchType == "OPEN_AS_WINDOW")
                    chrome.management.launchApp(this.app.id);
            }

            $scope.getIcon = function () {
                let icon_url;
                if (this.app.icons)
                    icon_url = this.app.icons[this.app.icons.length - 1].url;
                else
                    icon_url = "chrome://extension-icon/khopmbdjffemhegeeobelklnbglcdgfh/256/1";
                if (!this.app.enabled)
                    icon_url += "?grayscale=true";
                return icon_url;
            };

            $scope.updateFrequency = function () {
                if (!$scope.$parent.card.settings)
                    $scope.$parent.card.settings = {};

                // If frequency not defined we put 1 else we increment it
                if (!$scope.$parent.card.settings[this.app.id])
                    $scope.$parent.card.settings[this.app.id] = { 'frequency': 1 };
                else if ($scope.$parent.card.settings[this.app.id].frequency)
                    $scope.$parent.card.settings[this.app.id] = { 'frequency': $scope.$parent.card.settings[this.app.id].frequency + 1 };

                // We don't update scope to avoid suddenly changing apps position after click

                // We save frequency in storage
                chrome.storage.sync.setAsync({ 'cards': $scope.$parent.cards });
            };

        }]);
