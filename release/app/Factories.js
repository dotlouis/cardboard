// SearchFactory
cardboard.factory('SearchFactory', ['$q','WebFactory','BookmarkFactory','HistoryFactory', function($q, wf, bf, hf){
	return{
		getSuggestions : function(query){

			var maxWebSuggest = 4;
			var maxBookmarkSuggest = 3;
			var maxAppSuggest = 3;
			var maxHistorySuggest = 3;

			var p_web = wf.getWebSuggestions(query, maxWebSuggest);
			var p_bookmark = []; // bf.getSearchResults(query, maxBookmarkSuggest);
			var p_history = []; // hf.getSearchResults({text: query, maxResults: maxHistorySuggest});

			// when all the suggestions part are loaded we merge into one array
			return $q.all([p_web, p_bookmark, p_history]).then(function(arrays){
				// the first element is always the typed query
				var all_suggest = [{
							type: "web",
							icon: "fa-search", // class for font-awesome icons (only show the first)
							label: query
						}];
				// then we concatenate with other suggestions
				for(i in arrays){
					all_suggest = all_suggest.concat(arrays[i]);
				}
				return all_suggest;
			});
		}
	}

}]);


// WebFactory
cardboard.factory('WebFactory', ['$http','$q', function($http, $q){
	return{
		getWebSuggestions : function(query, max){
			return $http.get('https://suggestqueries.google.com/complete/search?client=firefox&hl=en&q='+query).then(function(suggestions){
				// the [0] is the query, the [1] is the suggestions
				var web_suggestions = [];
				for(var i=0; i<max; i++){
					if(suggestions.data[1][i])
						web_suggestions.push({
							type: "web",
							icon: "fa-search blank",
							label: suggestions.data[1][i]
						});
				}
				return web_suggestions;
			});
		}
	}
}]);

// DownloadsFactory
cardboard.factory('DownloadFactory', ['$q', '$rootScope', function($q, $rootScope){
	return {
		getAll : function(){
			var deferred = $q.defer();
			chrome.downloads.search({orderBy: '-startTime'},function(downloads){
				$rootScope.$apply(deferred.resolve(downloads));
			});
			return deferred.promise;
		},
		getRecent : function(limit){
			var deferred = $q.defer();
			chrome.downloads.search({limit: limit, orderBy: ['-startTime']}, function(downloads){
				for(var i=0; i<downloads.length; i++){

					//transformation date to universal dating (ms)
					downloads[i].endTime = new Date(downloads[i].endTime);

					// get file icon
					// closure again muffugas
					(function(i_copy){
						chrome.downloads.getFileIcon(downloads[i_copy].id,function(iconUrl){
							downloads[i_copy].iconUrl = iconUrl;
							if(i_copy == downloads.length-1)
								$rootScope.$apply(deferred.resolve(downloads));
						});
					}(i));
				}
			});
			return deferred.promise;
		},
		search : function(query){
			var deferred = $q.defer();
			chrome.downloads.search(query,function(downloads){
				$rootScope.$apply(deferred.resolve(downloads));
			});
			return deferred.promise;
		},
		show : function(downloadID){
			chrome.downloads.show(downloadID);
		},
		open : function(downloadID){
			chrome.downloads.open(downloadID);
		},
		pause : function(downloadID){
			chrome.downloads.pause(downloadID);
		},
		resume : function(downloadID){
			chrome.downloads.resume(downloadID);
		},
		cancel : function(downloadID){
			chrome.downloads.cancel(downloadID);
		},
		download : function(downloadUrl){
			chrome.downloads.download({url:downloadUrl});
		}
	}
}]);

// AppFactory
cardboard.factory('AppFactory', ['$q', '$rootScope', 'SettingsFactory', function($q, $rootScope, sf){
	return {
		getAll : function(){
			var deferred = $q.defer();
			chrome.management.getAll(function(apps){
				$rootScope.$apply(deferred.resolve(apps));
			});
			return deferred.promise;
		},
		getApps : function(){
			var deferred = $q.defer();
			var apps_only = [];
			chrome.management.getAll(function(apps){
					angular.forEach(apps, function(value, key){
						if(value.isApp && value.enabled){
							// get the frequency from settings
							(function(value_copy){
								sf.get(value_copy.id).then(function(app_pref){
									if(app_pref)
										value_copy.frequency = app_pref.frequency;
									else
										value_copy.frequency = 0;
									apps_only.push(value_copy);
								});
							}(value));
						}
					}, apps_only);
					$rootScope.$apply(deferred.resolve(apps_only));
			});
			return deferred.promise;
		},
		get : function(id){
			chrome.management.get(id);
		},
		getSearchResults : function(query, max){
			query = query.toLowerCase();
			var deferred = $q.defer();
			var search_results = [];
			this.getAll().then(function(apps){
				var cpt = 0;
				angular.forEach(apps, function(value, key){
					if(cpt >= max)
						return true;
					if(value.name.toLowerCase().indexOf(query) !=-1){
						this.push({
							type: "app",
							icon: "fa-puzzle-piece", // class for font-awesome icons
							label: value.name,
							data: value
						});
						cpt++;
					}
				}, search_results);
				deferred.resolve(search_results);
			});
			return deferred.promise;
		},
		getPermissions : function(id){
			var deferred = $q.defer();
			chrome.management.getPermissionWarningsById(id, function(perms){
				$rootScope.$apply(deferred.resolve(perms));
			});
			return deferred.promise;
		},
		launchApp : function(app){
			chrome.management.launchApp(app.id);
			var dataObj = {};
			dataObj[app.id] = {"frequency" : (app.frequency)+1};
			sf.set(dataObj);
		},
		enable : function(id, enable){
			chrome.management.setEnabled(id, enable);
		},
		uninstall: function(id){
			chrome.management.uninstall(id);
		}
	}
}]);

// BookmarkFactory
cardboard.factory('BookmarkFactory', ['$q', '$rootScope', function($q, $rootScope){
	return {
		getAll : function(){
			var deferred = $q.defer();
			chrome.bookmarks.getTree(function(bookmarks){
				$rootScope.$apply(deferred.resolve(bookmarks));
			});
			return deferred.promise;
		},
		getRecent : function(limit){
			var deferred = $q.defer();
			chrome.bookmarks.getRecent(limit, function(bookmarks){
				$rootScope.$apply(deferred.resolve(bookmarks));
			});
			return deferred.promise;
		},
		getSearchResults : function(query, max){
			var deferred = $q.defer();
			var search_results = [];
			chrome.bookmarks.search(query, function(bookmarks){
				var cpt = 0;
				angular.forEach(bookmarks, function(value, key){
					if(cpt >= max)
						return true;
					this.push({
						type: "bookmark",
						icon: "fa-star-o"+((key!=0) ? " blank": ""), // class for font-awesome icons (only show the first)
						label: value.title,
						data: value
					});
					cpt++;
				}, search_results);
				$rootScope.$apply(deferred.resolve(search_results));
			});
			return deferred.promise;
		}
	}
}]);

// QuickSettingsFactory
cardboard.factory('QuickSettingsFactory', ['$q', '$rootScope', function($q, $rootScope){
	return {
		clearCache : function(){
			var deferred = $q.defer();
			chrome.browsingData.remove({
				"since": 0
			}, {
				"cache": true,
			}, function(){
				$rootScope.$apply(deferred.resolve());
			});
			return deferred.promise;
		},
		clearCookies : function(){
			var deferred = $q.defer();
				chrome.browsingData.remove({
				  "since": 0
				}, {
				  "cookies": true,
				}, function(){
					$rootScope.$apply(deferred.resolve());
				});
			return deferred.promise;
		},
		clearHistory : function(){
			var deferred = $q.defer();
				chrome.browsingData.remove({
				  "since": 0
				}, {
				  "history": true,
				}, function(){
					$rootScope.$apply(deferred.resolve());
				});
			return deferred.promise;
		},
		clearLocalStorage : function(){
			var deferred = $q.defer();
				chrome.browsingData.remove({
				  "since": 0
				}, {
				  "localStorage": true,
				}, function(){
					$rootScope.$apply(deferred.resolve());
				});
			return deferred.promise;
		}
	}
}]);

// HistoryFactory
cardboard.factory('HistoryFactory', ['$q', '$rootScope', function($q, $rootScope){
	return {
		getAll : function(){
			var deferred = $q.defer();
			chrome.bookmarks.getTree(function(bookmarks){
				$rootScope.$apply(deferred.resolve(bookmarks));
			});
			return deferred.promise;
		},
		getRecent : function(nb){
			var deferred = $q.defer();
			chrome.bookmarks.getRecent(nb, function(bookmarks){
				$rootScope.$apply(deferred.resolve(bookmarks));
			});
			return deferred.promise;
		},
		getSearchResults : function(query){
			var deferred = $q.defer();
			chrome.history.search(query, function(history){
				var search_results = [];
				angular.forEach(history, function(value, key){
					this.push({
						type: "history",
						icon: "fa-clock-o"+((key!=0) ? " blank": ""), // class for font-awesome icons (only show the first)
						label: value.url,
						data: value
					});
				}, search_results);

				$rootScope.$apply(deferred.resolve(search_results));
			});
			return deferred.promise;
		}
	}
}]);

cardboard.factory('TopSitesFactory', ['$q', '$rootScope', function($q, $rootScope){
	return{
		get: function(max){
			// if max not specified: all topSites
			max = typeof max !== 'undefined' ? max : null;
			var deferred = $q.defer();
			chrome.topSites.get(function(allTopSites){
				var topSites = allTopSites;
					if(max != null)
						topSites.length = max;
				$rootScope.$apply(deferred.resolve(topSites));
			});
			return deferred.promise;
		}
	}
}]);

cardboard.factory('StorageFactory', ['$q', '$rootScope', function($q, $rootScope){
	return{
		getInfo: function(){
			var deferred = $q.defer();
			chrome.system.storage.getInfo(function(storageUnits){
				console.log(storageUnits);
				$rootScope.$apply(deferred.resolve(storageUnits));
			});
			return deferred.promise;
		}
	}
}]);

/******************************************************************/
/*							SETTINGS							  */
/******************************************************************/

cardboard.factory('SettingsFactory', ['$q','$rootScope','DefaultSettings','ToolFactory', function($q,$rootScope,defaultSettings,tf){
	return{
		state: {
			NONE: 0,
			FIRST: 1,
			SETTINGS_UPDATED: 2,
			APP_UPDATED: 3
		},
		getProperties: function(){
			chrome.storage.StorageArea.getBytesInUse(null,function(bytes){
				console.log("You use "+bytes+" bytes");
			});
		},
		get: function(item){
			// default value => get all 
			item = typeof item !== 'undefined' ? item : null;
			var deferred = $q.defer();
			chrome.storage.sync.get(item, function(storage){
				if(tf.isEmptyObject(storage))
					$rootScope.$apply(deferred.resolve(null));
				else{
					if(item == null)
						$rootScope.$apply(deferred.resolve(storage));
					else
						$rootScope.$apply(deferred.resolve(storage[item]));
				}
			});
			return deferred.promise;
		},
		set: function(item){
			// default value => set all
			item = typeof item !== 'undefined' ? item : null;

			var deferred = $q.defer();
			chrome.storage.sync.set(item, function(){
				$rootScope.$apply(deferred.resolve(true));
			});
			return deferred.promise;
		},
		update: function(){
			var deferred = $q.defer();
			var return_state = this.state.NONE;
			var this_copy = this;
			this.get().then(function(old_settings){
				// No settings or outdated ones => install new settings !!! user values lost !!!
				if(!old_settings)
					return_state = this_copy.state.FIRST;
				else if(old_settings.version.settings < defaultSettings.version.settings)
					return_state = this_copy.state.SETTINGS_UPDATED;
				else if(old_settings.version.update < defaultSettings.version.update)
					return_state = this_copy.state.APP_UPDATED;

				if(return_state == this_copy.state.SETTINGS_UPDATED || return_state == this_copy.state.FIRST){
					// we update all settings
					chrome.storage.sync.clear();
					chrome.storage.sync.set(defaultSettings, function(){
						$rootScope.$apply(deferred.resolve({content: defaultSettings, state:return_state}));
					});
				}
				else if(return_state == this_copy.state.APP_UPDATED){
					// We update the version only
					chrome.storage.sync.set({version: defaultSettings.version }, function(){
						$rootScope.$apply(deferred.resolve({content: old_settings, state:return_state}));
					});
				}
				else
					deferred.resolve({content: old_settings, state:return_state});
			});
			return deferred.promise;
		},
		setDefault: function(){
			chrome.storage.sync.set(defaultSettings);
		},
		clear: function(){
			chrome.storage.sync.clear();
		},
		getLocal: function(item){
			// default value => get all 
			item = typeof item !== 'undefined' ? item : null;
			var deferred = $q.defer();
			chrome.storage.local.get(item, function(storage){
				if(tf.isEmptyObject(storage))
					$rootScope.$apply(deferred.resolve(null));
				else{
					if(item == null)
						$rootScope.$apply(deferred.resolve(storage));
					else
						$rootScope.$apply(deferred.resolve(storage[item]));
				}
			});
			return deferred.promise;
		},
		setLocal: function(item){
			// default value => set all
			item = typeof item !== 'undefined' ? item : null;

			var deferred = $q.defer();
			chrome.storage.local.set(item, function(){
				$rootScope.$apply(deferred.resolve(true));
			});
			return deferred.promise;
		},
	}
}]);

/******************************************************************/
/*							PERMISSIONS							  */
/******************************************************************/

cardboard.factory('PermissionFactory', ['$q', '$rootScope', function($q, $rootScope){
	return {
		request : function(p){
			var permissions = p;
			var deferred = $q.defer();

			if(permissions){
				// if one of the arg above is not defined
				if(!permissions.apis)
					permissions.apis = [];
				else if(!permissions.origins)
					permissions.origins = [];

				chrome.permissions.request({
					permissions: permissions.apis,
					origins: permissions.origins
				}, function(granted) {
					$rootScope.$apply(deferred.resolve(granted));
				});
			}
			else	// if no permissions are requested, "nothing" is granted
				deferred.resolve(true);
			return deferred.promise;
		},
		verify : function(p){
			var permissions = p;
			var deferred = $q.defer();

			if(permissions){
				// if one of the arg above is not defined
				if(!permissions.apis)
					permissions.apis = [];
				else if(!permissions.origins)
					permissions.origins = [];

				chrome.permissions.contains({
					permissions: permissions.apis,
					origins: permissions.origins
				}, function(granted) {
					$rootScope.$apply(deferred.resolve(granted));
				});
			}
			else	// if no permissions are verified, "nothing" is granted
				deferred.resolve(true);
			return deferred.promise;
		},
		revoke : function(p){
			var permissions = p;
			var deferred = $q.defer();

			if(permissions){
				// if one of the arg above is not defined
				if(!permissions.apis)
					permissions.apis = [];
				else if(!permissions.origins)
					permissions.origins = [];

				chrome.permissions.remove({
					permissions: permissions.apis,
					origins: permissions.origins
				}, function(removed) {
					$rootScope.$apply(deferred.resolve(removed));
				});
			}
			else	// if no permissions are revoked, "nothing" is revoked
				deferred.resolve(true);
			return deferred.promise;
		},
		getAll: function(){
			var deferred = $q.defer();
			chrome.permissions.getAll(function(permissions){
				$rootScope.$apply(deferred.resolve(permissions));
			});
			return deferred.promise;
		}
	}
}]);

/******************************************************************/
/*							TOOLS								  */
/******************************************************************/

cardboard.factory('ToolFactory', ['$q', '$rootScope', function($q, $rootScope){
	return {
		isEmptyObject : function(o){
			for(var i in o){ return false;}
				return true;
		},
		getTime : function(){
		// for the header background
			var date = new Date;
			date.setTime(date);
			var hour = date.getHours();
			var time;

			if (hour>5 && hour<8)
				time="Dawn";
			else if (hour>8 && hour<19)
				time="Day";
			else if (hour>19 && hour<21)
				time="Dusk";
			else
				time="Night";
			return time;
		}
	}
}]);