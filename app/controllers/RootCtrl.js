angular.module('cardboard.controllers')

.controller('RootCtrl',['$scope','$location','$http','DefaultSettings','ChromeFactory',function($scope, $location, $http, DefaultSettings, Chrome){

    /********* USEFUL FUNCTIONS **********/

    // Shuffles an array
    function shuffle(o){
        for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }

    // Determine if 2 dates are the same day (time independent)
    Date.prototype.isSameDateAs = function(pDate) {
        return (
            this.getFullYear() === pDate.getFullYear() &&
            this.getMonth() === pDate.getMonth() &&
            this.getDate() === pDate.getDate()
        );
    };

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

    /********* INIT STUFF **********/

    var trendsDataDeferred = Promise.defer();
    $scope.trendsData = trendsDataDeferred.promise;

    // Get storage (null == root object)
    var syncStorage = Chrome.storage.getAsync(null).then(function(storage){
        // If storage empty or settings version is older ...
        if((Object.keys(storage).length == 0) || (storage.version && storage.version.settings < DefaultSettings.version.settings)){
            // ... we clear storage, set it to default and return it
            return Chrome.storage.clearAsync().then(function(){
                return Chrome.storage.setAsync(DefaultSettings);
            })
            .then(function(){
                return DefaultSettings;
            });
        }
        else
            return storage;
    });

    var localStorage = Chrome.cache.getAsync(null);

    Promise.all([syncStorage,localStorage])
    // Once we get all the settings, we fill the scope with it
    .then(function(storage){
        var settings = storage[0];
        var cache = storage[1];

        // If local background (dataURl) we get it from cache
        for(var i in settings.backgrounds)
            if(settings.backgrounds[i].type == "Local" && settings.backgrounds[i].url)
                settings.backgrounds[i].url = cache.localBackgroundDataUrl;

        // Fill the scope
        $scope.backgrounds = settings.backgrounds;
        $scope.background = settings.backgrounds[settings.backgroundId];

        $scope.trends = settings.trends;

        // Check each card permissions
        Promise.map(settings.cards, function(card){
            return Chrome.permissions.check(card.permissions)
            .then(function(granted){
                // Disable the card if not granted AND enabled
                card.enabled = (granted && card.enabled);
                return card;
            });
        })
        .then(function(cards){
            $scope.$apply(function(){
                $scope.cards = cards;
            });
            checkCardsEnabled();
        });

        // load new trends of the day
        if(!settings.trends.lastRefresh || !(new Date(settings.trends.lastRefresh).isSameDateAs(new Date()))){
            $http.get(settings.trends.url)
            // Load trends (even if disabled to allow quick toggle)
            .success(function(data) {
                var allTrends = [];
                for(var i=0; i<12; i++)
                    if(data[i]) // some data is undefined
                        allTrends = allTrends.concat(data[i]);

                // update the lastRefresh Date, update storage and resolve data
                $scope.trends['lastRefresh'] = new Date().toString();
                Chrome.storage.setAsync({trends: $scope.trends});
                // Note: trends data is stored in local storage as opposed to
                // others settings because it would take up too much space and
                // exceed the QUOTA_BYTES_PER_ITEM storage limit of Chrome
                Chrome.cache.setAsync({trendsData: allTrends});
                trendsDataDeferred.resolve(shuffle(allTrends));
            })
            .error(function(error){
                toast("Can't load trends", 4000);
                trendsDataDeferred.resolve(['Google Trends']);
            });
        }
        else
            Chrome.cache.getAsync('trendsData').then(function(cache){
                trendsDataDeferred.resolve(shuffle(cache.trendsData));
            });
    });

    /********* HEADER BACKGROUND FUNCTIONS **********/

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

    /********* PERMISSIONS FUNCTIONS **********/

    $scope.toggle = function(card, on){
        var self = this;
        if(typeof on === "undefined")
            on = card.enabled;

        if(on)
            Chrome.permissions.request(card.permissions)
            .then(function(){
                // Granted
                $scope.$apply(function(){
                    card.enabled = true;
                });
                checkCardsEnabled();
                $scope.save('cards', $scope.cards);
            })
            .catch(function(){
                // Denied, we don't enable the card
                $scope.$apply(function(){
                    card.enabled = false;
                });
                checkCardsEnabled();
                toast("Card needs permission to run", 4000);
            });
        else
            Chrome.permissions.revoke(card.permissions)
            .then(function(){
                $scope.$apply(function(){
                    card.enabled = false;
                });
                checkCardsEnabled();
                $scope.save('cards', $scope.cards);
            });
    };

    function checkCardsEnabled(){
        $scope.allCardsEnabled = false;
        for(var i=0; i<$scope.cards.length; i++){
            if(!$scope.cards[i].enabled){
                $scope.$apply(function(){$scope.allCardsEnabled = false;});
                break;
            }
            else if(i == $scope.cards.length-1)
                $scope.$apply(function(){$scope.allCardsEnabled = true;});
        }
    }

    $scope.save = function(storageKey, value){
        var toSave = {};
        toSave[storageKey] = value;
        Chrome.storage.setAsync(toSave);
    };
}]);
