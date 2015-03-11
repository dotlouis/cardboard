angular.module('cardboard.factories')

.factory('ChromePermissions', [function(){

    // see https://github.com/petkaantonov/bluebird/blob/master/API.md#option-promisifier
    var promisifyOptions = {promisifier: function noErrPromisifier(originalMethod){
        return function promisified(){
             var args = [].slice.call(arguments);
             var self = this;
             return new Promise(function(resolve,reject){
                 args.push(resolve);
                 originalMethod.apply(self,args);
             });
        };
    }};

    // take the permission string and return the corresponding api
    function getApi(permission){
        var parts = permission.split('.');
        var api = chrome;
        for (var i in parts)
            api = api[parts[i]];

        return api;
    }

    // returns the promisified API
    function promisify(api){
        for(var i in api){
            // if there is a "promisified" method. It's already promisified
            if(api[i].name == "promisified")
                return api;
        }
        return Promise.promisifyAll(api, promisifyOptions);
    }

    function isOptional(permission){
       return ([
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
       ].indexOf(permission) != -1);
    }

    // promisify the permission API to help ourself
    promisify(chrome.permissions);

    return {

        // same parameters/Api as chrome.permissions.contains
        contains: function(obj){
            if(!obj || (!obj.permissions && !obj.origins))
                return Promise.resolve();
                // return Promise.reject(new Error("invalid object provided"));

            // combine origins and permissions in one array
            var allPermissions = [];
            for(var i in obj.permissions)
                allPermissions.push({'name': obj.permissions[i], 'type': 'permissions'});
            for(var i in obj.origins)
                allPermissions.push({'name': obj.origins[i], 'type': 'origins'});

            // We check each permission one by one for finer control.
            // We could have checked them all at once but the result would have
            // been all or nothing without a way of knowing wich one was granted
            // and which one was not.
            return Promise.map(allPermissions, function(permission){
                var toCheck = {};
                toCheck[permission.type] = [permission.name];
                // we verify the permissions with its respective type
                return chrome.permissions.containsAsync(toCheck)
                .then(function(alreadyGranted){
                    permission.granted = alreadyGranted;
                    return permission;
                });
            })
            // split back permissions into two objects (same as args)
            .then(function(permissions){
                var result = {};

                for(var i in permissions){
                    if(permissions[i].granted){
                        // promisify the granted api
                        promisify(getApi(permissions[i].name));
                        if(!result.granted)
                            result.granted = {};

                        if(!result.granted[permissions[i].type])
                            result.granted[permissions[i].type] = [];

                        result.granted[permissions[i].type].push(permissions[i].name)
                    }
                    else{
                        if(!result.denied)
                            result.denied = {};

                        if(!result.denied[permissions[i].type])
                            result.denied[permissions[i].type] = [];

                        result.denied[permissions[i].type].push(permissions[i].name)
                    }
                }
                return result;
            });
        },

        // same parameters/Api as chrome.permissions.request
        request: function(obj){
            if(!obj || (!obj.permissions && !obj.origins))
                return Promise.resolve();

            // we check permissions that already have been granted
            return this.contains(obj)
            .then(function(permissions){
                // request the one that are not yet granted
                if(permissions.denied)
                    return chrome.permissions.requestAsync(permissions.denied)
                    .then(function(granted){
                        if(granted){
                            // Switch the denied permissions in the granted property
                            if(!permissions.granted){
                                permissions.granted = permissions.denied;
                            }
                            else{
                                if(permissions.denied.origins){
                                    if(permissions.granted.origins)
                                        permissions.granted.origins = permissions.granted.origins.concat(permissions.denied.origins);
                                    else
                                        permissions.granted.origins = permissions.denied.origins;
                                }

                                if(permissions.denied.permissions){
                                    if(permissions.granted.permissions)
                                        permissions.granted.permissions = permissions.granted.permissions.concat(permissions.denied.permissions);
                                    else
                                        permissions.granted.permissions = permissions.denied.permissions;
                                }
                            }

                            // we promisify the apis that just have been granted
                            if(permissions.denied.permissions)
                                return Promise.map(permissions.denied.permissions,
                                    function(permission){
                                        return promisify(getApi(permission));
                                })
                                .then(function(){
                                    delete permissions.denied;
                                    return permissions;
                                });
                            else
                                return permissions;
                        }
                        else
                            return Promise.reject(permissions);
                    });
                else
                    return Promise.resolve(permissions);
            });
        },

        // same parameters/Api as chrome.permissions.remove
        remove: function(obj){
            if(!obj || (!obj.permissions && !obj.origins))
                return Promise.resolve();

            // only process optional permissions
            var toRemove = [];
            for(var i in obj.permissions)
                if(isOptional(obj.permissions[i]))
                    toRemove.push(obj.permissions[i]);

            // revoke permissions and origins
            if(toRemove.length > 0 || (obj.origins && obj.origins.length > 0))
                return chrome.permissions.removeAsync({permissions: toRemove, origins: obj.origins})
                .then(function(removed){
                    if(removed)
                        return obj;
                    else
                        return Promise.reject(obj);
                });
            else
                return Promise.resolve(obj);
        }
    };
}]);
