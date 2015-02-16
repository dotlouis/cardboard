angular.module('cardboard.controllers')

.controller('AppCtrl', ['$scope','ChromeFactory', function($scope, Chrome){
    $scope.apps = [];
    $scope.extensions = [];
    $scope.themes = [];
    $scope.maxApps = 8;

    Chrome.management.getAllAsync()
    .then(function(all){
        angular.forEach(all, function(value, key){
            if(value.type == "extension")
                $scope.extensions.push(value);
            else if (value.type == "theme")
                $scope.themes.push(value);
            else
                if(value.enabled)
                    $scope.apps.push(value);
        });
        $scope.$apply();
        $('.card.apps .tooltipped').tooltip({delay: 1000});
    });

    $scope.launch = function(){
        if(this.app.launchType == "OPEN_AS_WINDOW")
            Chrome.management.launchApp(this.app.id);
    }

    $scope.getIcon = function(){
        var icon_url;
        if(this.app.icons)
            icon_url = this.app.icons[this.app.icons.length-1].url;
        else
            icon_url = "chrome://extension-icon/khopmbdjffemhegeeobelklnbglcdgfh/256/1";
        if(!this.app.enabled)
            icon_url+="?grayscale=true";
        return icon_url;
    };

}]);
