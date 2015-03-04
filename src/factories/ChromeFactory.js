angular.module('cardboard.factories')

.factory('ChromeFactory', [
    'DefaultSettings',
    function(DefaultSettings){

    var Chrome = {};
    var promisifiedApis = {};

    // Promisify the api if it has not already been
    function promisify(api){
        // if the API is simple (e.g: chrome.history)
        if(!isNestedAPI(api)){
            // if not already promisified we do it and save it
            if(!angular.isDefined(promisifiedApis[api]))
                promisifiedApis[api] = Promise.promisifyAll(chrome[api], {promisifier: noErrPromisifier});

            // We link the api to the factory object
            Chrome[api] = promisifiedApis[api];
        }
        // if the api is nested (e.g: chrome.system.cpu)
        else{
            var apiBase = api.substring(0,api.indexOf('.'));
            var apiEnd = api.substring(api.indexOf('.')+1);

            if(!angular.isDefined(promisifiedApis[apiBase]))
                promisifiedApis[apiBase] = {};

            if(!angular.isDefined(promisifiedApis[apiBase][apiEnd]))
                promisifiedApis[apiBase][apiEnd] = Promise.promisifyAll(chrome[apiBase][apiEnd], {promisifier: noErrPromisifier});

            Chrome[apiBase] = promisifiedApis[apiBase];
        }
    }


    Chrome.storage = Promise.promisifyAll(chrome.storage.sync, {promisifier: noErrPromisifier});
    Chrome.cache = Promise.promisifyAll(chrome.storage.local, {promisifier: noErrPromisifier});
    Chrome.extension = Promise.promisifyAll({'getSelf':chrome.management.getSelf}, {promisifier: noErrPromisifier});

    Chrome.permissions = {};

    // Check if the given permissions are already granted
    Chrome.permissions.check = function(permissions){
        return Promise.map(permissions, function(permission){
            var deferred = Promise.defer();
            chrome.permissions.contains({permissions: [permission]}, function(granted){
                if(granted)
                    promisify(permission);
                deferred.resolve(granted);
            });
            return deferred.promise;
        })
        .then(function(permissions){
            for(var i in permissions)
                if(!permissions[i])
                    return false;
            return true;
        });
    };

    // Request given permissions. Takes care of the already granted permisisons
    Chrome.permissions.request = function(permissions){
        if(!permissions)
            return Promise.resolve();

        var toRequest = [];
        // We first check each permissions if it's not already granted to avoid throwing errors
        return Promise.map(permissions, function(permission){
            var deferred = Promise.defer();
            chrome.permissions.contains({permissions:[permission]}, function(alreadyGranted){
                // If so, we make the corresponding API available
                if(alreadyGranted)
                    promisify(permission);
                // If not, we save it to requests all permissions at once later
                else
                    toRequest.push(permission);
                deferred.resolve(permission);
            });
            return deferred.promise;
        })
        // Then we request the one which are not already granted
        .then(function(){
            var deferred = Promise.defer();
            // if there are permissions not already granted we make the request
            if(toRequest.length > 0)
                chrome.permissions.request({permissions: toRequest}, function(granted){
                    // Again we make the corresponding API available
                    if(granted){
                        for(var i in toRequest)
                            promisify(toRequest[i]);
                        deferred.resolve(permissions);
                    }
                    // if the user denied the permission prompt we make a reject
                    else
                        deferred.reject(permissions);
                });
            else
                deferred.resolve();
            return deferred.promise;
        });
    };

    // Revoke given permission if possible (required permissions can't be revoked)
    Chrome.permissions.revoke = function(permissions){
        if(!permissions)
            return Promise.resolve();

        var toRemove = [];
        for(var i in permissions)
            if(isOptional(permissions[i]))
                toRemove.push(permissions[i]);

        var deferred = Promise.defer();
        if(toRemove.length > 0)
            chrome.permissions.remove({
                permissions: toRemove
            }, function(removed){
                if (removed)
                    deferred.resolve();
                else
                    deferred.reject();
            });
        else
            deferred.resolve();

        return deferred.promise.then(function(){
            // We make the API unavailable
            for(var i in toRemove)
                delete Chrome[toRemove[i]];
        })
        .catch(function(){
            // The permissions have not been removed (e.g., you tried to
            // remove required permissions)
        });
    };

    // Retreive settings, cache and extension info;
    Chrome.settings = Promise.all([
        Chrome.storage.getAsync(null),
        Chrome.cache.getAsync(null),
        Chrome.extension.getSelfAsync()
    ])
    .spread(function(storage, cache, info){
        var settings = {};

        // Default version is the current extension version
        DefaultSettings.version = info.version;

        // If no previous settings we set the defaults
        if((Object.keys(storage).length == 0)){
            Chrome.storage.setAsync(DefaultSettings);
            settings = DefaultSettings;
            settings.status = "new";
        }

        // We compare versions. If new version we update the settings
        else if(storage.version && isNewerVersion(info.version, storage.version)){
            Chrome.cache.clearAsync();
            Chrome.storage.clearAsync().then(function(){
                Chrome.storage.setAsync(DefaultSettings);
            });
            settings = DefaultSettings;
            settings.status = "updated";
        }

        // If nothing special settings are the one saved in storage
        else
            settings = storage;

        return [settings, cache, settings.status];
    });

    return Chrome;

}]);

function isNewerVersion(newVersion, oldVersion){
    // if version is not even a string we know it's a new version
    if(typeof oldVersion !== 'string')
        return true;

    return versionCompare(newVersion, oldVersion) > 0;
}

// see https://github.com/petkaantonov/bluebird/blob/master/API.md#option-promisifier
function noErrPromisifier(originalMethod){
    return function promisified(){
         var args = [].slice.call(arguments);
         var self = this;
         return new Promise(function(resolve,reject){
             args.push(resolve);
             originalMethod.apply(self,args);
         });
    };
}

function isOptional(permission){
   var optionals = [
       "host permissions",
       "background",
       "bookmarks",
       "clipboardRead",
       "clipboardWrite",
       "contentSettings",
       "contextMenus",
       "cookies",
       "debugger",
       "history",
       "idle",
       "management",
       "notifications",
       "pageCapture",
       "tabs",
       "topSites",
       "webNavigation",
       "webRequest",
       "webRequestBlocking"
   ];
   for(var i in optionals)
       if(permission == optionals[i])
           return true;
   return false;
}


function isNestedAPI(api){
    var nested = [
        "system.cpu",
        "system.memory",
        "system.storage"
    ];

    for(var i in nested)
        if(api == nested[i])
            return true;
    return false;
}


// from https://gist.github.com/TheDistantSea/8021359
function versionCompare(v1, v2, options) {
    var lexicographical = options && options.lexicographical,
        zeroExtend = options && options.zeroExtend,
        v1parts = v1.split('.'),
        v2parts = v2.split('.');

    function isValidPart(x) {
        return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
    }

    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart))
        return NaN;

    if (zeroExtend) {
        while (v1parts.length < v2parts.length) v1parts.push("0");
        while (v2parts.length < v1parts.length) v2parts.push("0");
    }

    if (!lexicographical) {
        v1parts = v1parts.map(Number);
        v2parts = v2parts.map(Number);
    }

    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length == i)
            return 1;

        if (v1parts[i] == v2parts[i])
            continue;
        else if (v1parts[i] > v2parts[i])
            return 1;
        else
            return -1;
    }

    if (v1parts.length != v2parts.length)
        return -1;

    return 0;
}
