angular.module('cardboard.controllers')

.controller('RootCtrl',[
    '$scope',
    '$location',
    '$http',
    'DefaultSettings',
    'ChromeFactory',
    'TrendsFactory',
    function($scope, $location, $http, DefaultSettings, Chrome, Trends){

    // We gather all the settings;
    $scope.settings = Chrome.settings;

    // then we init background and trends with it
    $scope.settings.spread(function(settings, cache, status){

        // Init trends
        $scope.trends = settings.trends;
        $scope.trends.data = Trends.get();
        $scope.trends.start = true;

        // If local background (dataURl) we get it from cache
        for(var i in settings.backgrounds)
            if(settings.backgrounds[i].type == "Local" && settings.backgrounds[i].url)
                settings.backgrounds[i].url = cache.localBackgroundDataUrl;

        $scope.backgrounds = settings.backgrounds;
        $scope.background = settings.backgrounds[settings.backgroundId];

    });

    $scope.getBackgroundStyle = function(){
        var style = {
            backgroundPosition: "center",
            backgroundSize: "cover"
        };
        // check background property exists to avoid errors due to promise not
        // beeing resolved yet
        if($scope.background){
            if($scope.background.type == "Google Now")
                style.backgroundImage = "url("+getBackgroundTime($scope.background.url)+")";
            else if($scope.background.url)
                style.backgroundImage = "url("+$scope.background.url+")";
        }
        return style;
    };

    function getBackgroundTime(url){
        var date = new Date;
        date.setTime(date);
        var hour = date.getHours();
        var time;

        if (hour>5 && hour<8)
            time = url.dawn;
        else if (hour>8 && hour<19)
            time = url.day;
        else if (hour>19 && hour<21)
            time = url.dusk;
        else
            time = url.night;
        return time;
    }

    /********* USEFUL STUFF **********/

    $scope.getFavicon = function(url){
        return DefaultSettings.faviconURL + encodeURI(url);
    };

    $scope.initDropdowns = function(selector){
        $(selector).dropdown({
            inDuration: 300,
            outDuration: 225,
            constrain_width: false, // Does not change width of dropdown to that of the activator
            hover: false, // Activate on click
            alignment: 'right', // Aligns dropdown to left or right edge (works with constrain_width)
            gutter: 0 // Spacing from edge
        });
    };

    // Allows views to know in which route they are
    $scope.route = function(){
        return $location.path();
    };

}]);
