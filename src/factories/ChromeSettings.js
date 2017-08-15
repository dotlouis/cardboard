angular.module('cardboard.factories').factory('ChromeSettings', [
  function() {
    var promisifyOptions = {
      promisifier: function noErrPromisifier(originalMethod) {
        return function promisified() {
          var args = [].slice.call(arguments);
          var self = this;
          return new Promise(function(resolve, reject) {
            args.push(resolve);
            originalMethod.apply(self, args);
          });
        };
      },
    };

    function promisify(api) {
      for (var i in api) {
        // if there is a "promisified" method. It's already promisified
        if (api[i].name == 'promisified') return api;
      }
      return Promise.promisifyAll(api, promisifyOptions);
    }

    promisify(chrome.storage.sync);
    promisify(chrome.storage.local);
    promisify(chrome.management);

    function versionDiff(newVersion, oldVersion) {
      // if version is not even a string we know it's a new major version
      if (typeof oldVersion !== 'string') return 'major';

      var newV = newVersion.split('.');
      var oldV = oldVersion.split('.');

      for (var i in newV) {
        // if number is greater it's a new version
        if (newV[i] > oldV[i]) {
          // if it's the first iteration it's a major
          if (i == 0) return 'major';
          else if (i == 1)
            // if it's the second iteration it's a minor
            return 'minor';
          else
            // if it's the third or more iteration it's a patch
            return 'patch';
        }
      }
      return;
    }

    return {
      // returns settings {extensionInfo, sync, local, update<optional>}
      get: function() {
        return Promise.all([
          chrome.management.getSelfAsync(),
          chrome.storage.sync.getAsync(null),
          chrome.storage.local.getAsync(null),
        ]).spread(function(self, sync, local) {
          // we check if the application have been updated
          var update = versionDiff(self.version, sync.version);
          // we remove the version from the sync variable to avoid
          // confusion between self.version and sync.version
          delete sync.version;
          // we store the new version number in storage
          chrome.storage.sync.setAsync({ version: self.version });

          var settings = {
            self: self,
            sync: sync,
            local: local,
          };

          if (update) settings.update = update;

          return settings;
        });
      },

      set: function(newSettings, options) {
        var options = options || { area: 'sync', override: false };

        // strip angular $$hashKey properties
        newSettings = JSON.parse(angular.toJson(newSettings));

        // if override we clear and write the new settings
        if (options.override)
          return chrome.storage[options.area].clearAsync().then(function() {
            return chrome.storage[options.area].setAsync(newSettings);
          });
        else return chrome.storage[options.area].setAsync(newSettings);

        // // Otherwise we compute the difference with the current Settings
        // // see https://github.com/flitbit/diff
        // return chrome.storage[options.area].getAsync(null)
        // .then(function(currentSettings){
        //     // strip angular $$hashKey properties
        //     currentSettings = JSON.parse(angular.toJson(currentSettings));
        //
        //     var jsDiff = jsondiffpatch.create({
        //         // used to match objects when diffing arrays, by default only === operator is used
        //         objectHash: function(obj) {
        //             // this function is used only to when objects are not equal by ref
        //             return obj.name;
        //         },
        //         arrays: {
        //             // default true, detect items moved inside the array (otherwise they will be registered as remove+add)
        //             detectMove: true,
        //             // default false, the value of items moved is not included in deltas
        //             includeValueOnMove: false
        //         },
        //         textDiff: {
        //             // default 60, minimum string length (left and right sides) to use text diff algorythm: google-diff-match-patch
        //             minLength: 60
        //         }
        //     });
        //
        //     var userSettingsDiffFilter = function(context) {
        //         // console.log(context);
        //         if(context.childname == "enabled")
        //             context.exit();
        //         // if (typeof context.left === 'number' && typeof context.right === 'number') {
        //             // context.setResult([0, context.right - context.left, NUMERIC_DIFFERENCE]).exit();
        //         // }
        //     };
        //     userSettingsDiffFilter.filterName = 'userSettings';
        //     console.log(jsDiff.processor.pipes.diff.list());
        //
        //     // insert my new filter, right before trivial one
        //     jsDiff.processor.pipes.diff.before('dates', userSettingsDiffFilter);
        //
        //     // for debugging, log each filter
        //     // jsDiff.processor.pipes.diff.debug = true;
        //
        //
        //     var delta = jsDiff.diff(newSettings, currentSettings);
        //     console.log(delta);
        //
        //     jsDiff.patch(currentSettings, delta);
        //     console.log(currentSettings);
        //
        // });
      },
    };
  },
]);
