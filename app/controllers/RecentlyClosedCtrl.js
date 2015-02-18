angular.module('cardboard.controllers')

.controller('RecentlyClosedCtrl', ['$scope','ChromeFactory', function($scope, Chrome){
    $scope.maxRecentlyClosed = 5;

    Chrome.sessions.getRecentlyClosedAsync({
        maxResults: $scope.maxRecentlyClosed
    }).then(function(recentlyClosed){
        var tabs = [];
        for(var i in recentlyClosed){
            // if it's a tab we push it with lastModified value
            if(recentlyClosed[i].tab){
                var tab = recentlyClosed[i].tab;
                tab['lastModified'] = moment.unix(recentlyClosed[i].lastModified);
                tabs.push(tab);
            }
            // if it's a window we gather each tab and add them to the others
            // e.g: we don't care about the difference between tabs and windows
            else if(recentlyClosed[i].window){
                for(var j in recentlyClosed[i].window.tabs){
                    var tab = recentlyClosed[i].window.tabs[j];
                    tab['lastModified'] = moment.unix(recentlyClosed[i].lastModified);
                    tabs.push(tab);
                }
            }
        }
        $scope.recentlyClosed = tabs;
    });
}]);
