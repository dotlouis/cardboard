angular.module('cardboard.controllers')
    .controller('RootCtrl', [
        '$scope',
        '$location',
        '$http',
        '$timeout',
        'DefaultSettings',
        'ChromePermissions',
        'ChromeSettings',
        'TrendsFactory',
        'DoodlesFactory',
        function ($scope, $location, $http, $timeout, DefaultSettings, Permissions, Settings, Trends, Doodles) {

            // we gather all the settings
            $scope.settings = Settings.get().then(function (settings) {
                if (settings.update == "major") {
                    settings.sync = DefaultSettings;
                    Settings.set(DefaultSettings);
                    // if it's a new install we redirect to the onboarding page
                    $location.path("onboarding");
                }
                return settings;
            });

            // then we init background and trends with it
            $scope.settings.then(function (settings) {

                // Init trends
                $scope.trends = settings.sync.trends;
                $scope.trends.data = Trends.get($scope.trends.enabled);
                $scope.trends.start = true

                // Init doodles
                $scope.doodles = settings.sync.doodles;
                const doodles = Doodles.get($scope.doodles.enabled);
                Promise.resolve(doodles, () => { }).then(function (str) {
                    $scope.doodles.data = str;
                });

                // If local background (dataURl) we get it from cache
                for (var i in settings.sync.backgrounds)
                    if (settings.sync.backgrounds[i].type == "Local" && settings.sync.backgrounds[i].url)
                        settings.sync.backgrounds[i].url = settings.local.localBackgroundDataUrl;

                $scope.backgrounds = settings.sync.backgrounds;
                $scope.background = settings.sync.backgrounds[settings.sync.backgroundId];
                $scope.setBackground($scope.background);
            });

            $scope.searchTrend = function () {
                return 'https://google.com/search?q=' + encodeURI($scope.trendTerm);
            };

            $scope.setBackground = function (background) {
                // check background property exists to avoid errors due to promise not
                // beeing resolved yet
                if (background.type == "Google Now")
                    $scope.backgroundImageUrl = getBackgroundTime(background.url);
                else
                    $scope.backgroundImageUrl = background.url;
            };

            $scope.wipe = function () {
                $scope.wipeRipple = true;
                $timeout(function () {
                    $scope.wipeRipple = false;
                }, 1300);
            };

            function getBackgroundTime(url) {
                var date = new Date;
                date.setTime(date);
                var hour = date.getHours();
                var time;

                if (hour > 5 && hour < 8)
                    time = url.dawn;
                else if (hour > 8 && hour < 19)
                    time = url.day;
                else if (hour > 19 && hour < 21)
                    time = url.dusk;
                else
                    time = url.night;
                return time;
            }

            /********* USEFUL STUFF **********/

            $scope.getFavicon = function (url) {
                const regex = /(chrome:\/\/|view-source:)/ig;
                if (!regex.test(url))
                    return DefaultSettings.faviconURL + encodeURI(url);
                return "";
            };

            $scope.initDropdowns = function (selector) {
                $(selector).dropdown({
                    inDuration: 300,
                    outDuration: 225,
                    constrain_width: false, // Does not change width of dropdown to that of the activator
                    hover: false, // Activate on click
                    alignment: 'right', // Aligns dropdown to left or right edge (works with constrain_width)
                    gutter: 0, // Spacing from edge
                    belowOrigin: true,
                });
            };

            // Allows views to know in which route they are
            $scope.route = function () {
                return $location.path();
            };

            $scope.goTo = function (url) {
                chrome.tabs.update({ url: url });
            };

            $scope.track = function (category, action, label, value) {
                tracker.sendEvent(category, action, label, value);
            };
        }]);
