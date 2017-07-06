angular.module('cardboard.factories')
    .factory('DoodlesFactory', [
        '$http',
        'DefaultSettings',
        function ($http, DefaultSettings) {
            let Doodles = {};
            function fromNetwork() {
                var deferred = Promise.defer();
                $http.get(DefaultSettings.doodles.url).then(function (res) {
                    if (res.status !== 200) {
                        Materialize.toast("Can't load doodles", 4000);
                        deferred.resolve(['Google Doodles']);
                    } else {
                        const doodles = { url: "https://www.google.com/doodles/" + res.data.doodles[0].name, img: "https:" + res.data.doodles[0].hires_url };
                        // update the lastRefresh Date and cache trends data
                        chrome.storage.local.setAsync({
                            'doodles': {
                                'lastRefresh': new Date().toString(),
                                'data': doodles
                            }
                        });
                        // Note: doodle data is stored in cache (ie. chrome local storage, not sync storage)
                        // because it would take up too much space and exceed the QUOTA_BYTES_PER_ITEM limit
                        deferred.resolve(doodles);
                    }
                }, function (error) {
                    Materialize.toast("Can't load doodles", 4000);
                    deferred.resolve(['Google Doodles']);
                });

                return deferred.promise;
            }

            Doodles.get = function (enabled = false) {
                return chrome.storage.local.getAsync("doodles")
                    .then(function (cache) {
                        // if there is nothing in cache we load doodle from network
                        if (!cache.doodles)
                            return fromNetwork();
                        // if cache is outdated (1 day)
                        else if (enabled && !(new Date(cache.doodles.lastRefresh).isSameDateAs(new Date())))
                            return fromNetwork();
                        // we return the cached doodles
                        return cache.doodles.data;
                    });
            }

            return Doodles;

        }]);

// Determine if 2 dates are the same day (time independent)
Date.prototype.isSameDateAs = function (pDate) {
    return (
        this.getFullYear() === pDate.getFullYear() &&
        this.getMonth() === pDate.getMonth() &&
        this.getDate() === pDate.getDate()
    );
};