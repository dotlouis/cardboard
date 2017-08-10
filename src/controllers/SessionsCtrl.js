angular.module('cardboard.controllers')

    .controller('SessionsCtrl', [
        '$scope',
        function ($scope) {
            $scope.maxDevices = 5;
            $scope.maxDeviceTabs = 5;
            $scope.maxRecentlyClosed = 5;

            var willGetRecentlyClosed = chrome.sessions.getRecentlyClosedAsync({
                maxResults: $scope.maxRecentlyClosed
            }).then(function (recentlyClosed) {
                $scope.recentlyClosed = mergeTabsAndWindows(recentlyClosed);
            });

            var willGetDevices = chrome.sessions.getDevicesAsync({
                maxResults: $scope.maxDevices
            }).then(function (devices) {
                for (var d in devices)
                    devices[d]['tabs'] = mergeTabsAndWindows(devices[d].sessions);
                $scope.devices = devices;
            });


            Promise.all([willGetDevices, willGetRecentlyClosed])
                .then(function () {
                    $scope.$apply();
                    $scope.initDropdowns('.card.sessions .dropdown-card-btn');
                    $('.card.sessions .tabs').tabs();
                    // dirty fix for the tab indicator to display at correct size
                    setTimeout(function () {
                        $('.card.sessions .tabs').tabs('select_tab', 'tab-content-recent');
                    }, 450);
                });

            // Return an array of tabs wether the input object contains tabs
            // or windows of tabs
            function mergeTabsAndWindows(sessionItem) {
                var tabs = [];
                for (var i in sessionItem) {
                    // If it's a tab we push it with lastModified value
                    if (sessionItem[i].tab) {
                        var tab = sessionItem[i].tab;
                        tab['lastModified'] = moment.unix(sessionItem[i].lastModified);
                        tabs.push(tab);
                    }
                    // If it's a window we gather each tab and add them to the others
                    // e.g: we don't care about the difference between tabs and windows
                    else if (sessionItem[i].window) {
                        for (var j in sessionItem[i].window.tabs) {
                            var tab = sessionItem[i].window.tabs[j];
                            tab['lastModified'] = moment.unix(sessionItem[i].lastModified);
                            tabs.push(tab);
                        }
                    }
                }
                return tabs;
            }

        }]);
