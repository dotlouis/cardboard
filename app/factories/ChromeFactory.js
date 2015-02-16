angular.module('cardboard.factories')

.factory('ChromeFactory', [function(){

    var promisifiedApis = {};

    function promisify(api){
        // if not already promisified we do it and save it
        if(!angular.isDefined(promisifiedApis[api]))
            promisifiedApis[api] = Promise.promisifyAll(chrome[api], {promisifier: noErrPromisifier});

        // We link the api to the factory object
        Chrome[api] = promisifiedApis[api];
    }

    return Chrome = {

        storage: Promise.promisifyAll(chrome.storage.sync, {promisifier: noErrPromisifier}),
        cache: Promise.promisifyAll(chrome.storage.local, {promisifier: noErrPromisifier}),

        permissions: {

            check: function(permissions){
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
            },

            request: function(permissions){
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
                    // if there are permissions not already granted we make the request
                    if(toRequest.length > 0)
                    chrome.permissions.request({permissions: toRequest}, function(granted){
                        // Again we make the corresponding API available
                        if(granted){
                            for(var i in toRequest)
                                promisify(toRequest[i]);
                            return Promise.resolve(permissions);
                        }
                        // if the user denied the permission prompt we make a reject
                        else
                        return Promise.reject(permissions);
                    });
                });
            },

            revoke: function(permissions){
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
            }
        }
    };

}]);

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
