angular.module('cardboard.controllers')

.controller('SessionsCtrl', ['$scope','ChromeFactory', function($scope, Chrome){
    $scope.maxDevices = 5;
    $scope.maxDeviceTabs = 5;
    $scope.maxRecentlyClosed = 5;

    var willGetRecentlyClosed = Chrome.sessions.getRecentlyClosedAsync({
        maxResults: $scope.maxRecentlyClosed
    }).then(function(recentlyClosed){
        console.log(recentlyClosed);
        $scope.recentlyClosed = mergeTabsAndWindows(recentlyClosed);
    });

    var willGetDevices = Chrome.sessions.getDevicesAsync({
        maxResults: $scope.maxDevices
    }).then(function(devices){
        for(var d in devices)
            devices[d]['tabs'] = mergeTabsAndWindows(devices[d].sessions);
        $scope.devices = devices;
    });


    Promise.all([willGetDevices, willGetRecentlyClosed])
    .then(function(){
        $scope.$apply();
        $('.card.sessions .tabs').tabs();
        $('.card.sessions .tabs').tabs('select_tab', 'tab-content-recent');
    });

    // Return an array of tabs wether the input object contains tabs
    // or windows of tabs
    function mergeTabsAndWindows(sessionItem){
        var tabs = [];
        for(var i in sessionItem){
            // If it's a tab we push it with lastModified value
            if(sessionItem[i].tab){
                var tab = sessionItem[i].tab;
                tab['lastModified'] = moment.unix(sessionItem[i].lastModified);
                tabs.push(tab);
            }
            // If it's a window we gather each tab and add them to the others
            // e.g: we don't care about the difference between tabs and windows
            else if(sessionItem[i].window){
                for(var j in sessionItem[i].window.tabs){
                    var tab = sessionItem[i].window.tabs[j];
                    tab['lastModified'] = moment.unix(sessionItem[i].lastModified);
                    tabs.push(tab);
                }
            }
        }
        return tabs;
    }

}]);
