angular.module('cardboard.factories')
    .factory('TrendsFactory', [
        '$http',
        'DefaultSettings',
        function ($http, DefaultSettings) {
            let Trends = {};
            function fromNetwork() {
                var deferred = Promise.defer();
                $http.get(DefaultSettings.trends.url)
                    // Load trends (even if disabled to allow quick toggle)
                    .then(function (res) {
                        if (res.status !== 200) {
                            Materialize.toast("Can't load trends", 4000);
                            deferred.resolve(['Google Trends']);
                        } else {
                            let allTrends = [];
                            for (var i = 0; i < 12; i++)
                                if (res.data[i]) // some data is undefined
                                    allTrends = allTrends.concat(res.data[i]);
                            // update the lastRefresh Date and cache trends data
                            chrome.storage.local.setAsync({
                                'trends': {
                                    'lastRefresh': new Date().toString(),
                                    'data': allTrends
                                }
                            });
                            // Note: trends data is stored in cache (ie. chrome local storage, not sync storage)
                            // because it would take up too much space and exceed the QUOTA_BYTES_PER_ITEM limit
                            deferred.resolve(shuffle(allTrends));
                        }
                    }, function (error) {
                        Materialize.toast("Can't load trends", 4000);
                        deferred.resolve(['Google Trends']);
                    });

                return deferred.promise;
            }

            Trends.get = function (enabled = false) {
                return chrome.storage.local.getAsync("trends")
                    .then(function (cache) {
                        // if there is nothing in cache we load trends from network
                        if (!cache.trends)
                            return fromNetwork();
                        // if cache is outdated (1 day) and trends enabled
                        else if (enabled && !(new Date(cache.trends.lastRefresh).isSameDateAs(new Date())))
                            return fromNetwork();
                        // we return the cached trends
                        return shuffle(cache.trends.data);
                    });
            }

            return Trends;

        }]);

// Determine if 2 dates are the same day (time independent)
Date.prototype.isSameDateAs = function (pDate) {
    return (
        this.getFullYear() === pDate.getFullYear() &&
        this.getMonth() === pDate.getMonth() &&
        this.getDate() === pDate.getDate()
    );
};

// Shuffles an array
function shuffle(o) {
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}
