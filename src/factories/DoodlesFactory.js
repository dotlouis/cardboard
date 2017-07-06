angular.module('cardboard.factories')
    .factory('DoodlesFactory', [
        '$http',
        'DefaultSettings',
        function ($http, DefaultSettings) {
            let Trends = {};
            function fromNetwork() {
                var deferred = Promise.defer();
                $http.get("https://www.google.com/doodles/search?query=France").then(function (res) {
                    if (res.status !== 200) {
                        Materialize.toast("Can't load doodles", 4000);
                        deferred.resolve(['Google Doodles']);
                    } else {
                        const doodle = "https:" + res.data.doodles[0].hires_url;
                        // update the lastRefresh Date and cache trends data
                        chrome.storage.local.setAsync({
                            'doodle': {
                                'lastRefresh': new Date().toString(),
                                'data': doodle
                            }
                        });
                        // Note: doodle data is stored in cache (ie. chrome local storage, not sync storage)
                        // because it would take up too much space and exceed the QUOTA_BYTES_PER_ITEM limit
                        deferred.resolve(doodle);
                    }
                }, function (error) {
                    Materialize.toast("Can't load doodles", 4000);
                    deferred.resolve(['Google Doodles']);
                });

                return deferred.promise;
            }

            Trends.get = function () {
                return chrome.storage.local.getAsync("doodle")
                    .then(function (cache) {
                        // if there is nothing in cache we load doodle from network
                        if (!cache.trends)
                            return fromNetwork();
                        // if cache is outdated (1 day)
                        else if (!(new Date(cache.doodle.lastRefresh).isSameDateAs(new Date())))
                            return fromNetwork();
                        // we return the cached trends
                        return cache.doodle.data;
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