// CardboardCtrl = main controller with settings & header
cardboard.controller('CardboardCtrl', ['$scope','$location','SettingsFactory','SearchFactory','AppFactory','PermissionFactory','ToolFactory', function($scope, $location, sf, schf, af, pf, tf){
	
	// Get SyncArea settings
	sf.update().then(function(update){
		$scope.settings = update.content;
		$scope.checkPermissions();
		$scope.update = update.state;
		if($scope.update == 1)
			$location.path("welcome");
	});

	// Get bgDataUrl from LocalArea storage
	sf.getLocal("bgDataUrl").then(function(value){
		// Avoid non-blocking/minors errors at load (because settings are not yet defined)
		if($scope.settings){
			$scope.settings.bgDataUrl = value;

			// if no local bg, delete the matching record and put back to default bg
			if(!value && ($scope.settings.backgrounds[$scope.settings.backgroundId].type == "Custom")){
				$scope.settings.backgrounds.pop();
				$scope.settings.backgroundId = 4;
				$scope.background = $scope.settings.backgrounds[4];
				sf.set({backgroundId : 4});
				sf.set({backgrounds : $scope.settings.backgrounds});
				alert("No custom background found here. Back to default");
			}
		}
	});


	// Why the hell do I need this function ? ==> fix this
	$scope.dismiss = function(){
		$scope.update = 0;
	};

	$scope.checkPermissions = function(){
		// Allows cards based on settings and permissions
		for(var i in $scope.settings.cards){
			// Closure: Yo dawg we heard yo' like functions... So we put a function in yo' function: http://www.apaxsoftware.com/2012/05/common-javascript-mistakes-loops-and-callbacks/
			(function(i_copy){
				pf.verify($scope.settings.cards[i_copy].permissions).then(function(granted){
					if(granted)
						$scope.settings.cards[i_copy].allowed = true;
					else
						$scope.settings.cards[i_copy].allowed = false;
				});
			}(i));
		}
	};

	$scope.goTo = function(url){
		chrome.tabs.update({url:url});
	};
	$scope.getHeaderStyle = function(noLogo){
		var style = {};
		var bgUrl;
		var bgImg = true;
		// Avoid non-blocking/minors errors at load (because settings are not yet defined)
		if($scope.settings){
			// if noLogo is true don't display google logo
			var logo = (!noLogo ? $scope.settings.backgroundLogo : false);
			var customBg = ($scope.settings.backgrounds[$scope.settings.backgroundId].type == "Custom");
			if(customBg)
				if($scope.settings.bgDataUrl)
					bgUrl = $scope.settings.bgDataUrl;
				else // if undefined (due to speed of exec) background-image = none
					bgImg = false;
			else
				bgUrl = $scope.settings.backgrounds[$scope.settings.backgroundId].url+"_"+tf.getTime()+".webp";

			if(bgImg)
				style.backgroundImage = "url("+(logo ? "../img/google.webp), url(":"")+bgUrl+")";
			else
				style.backgroundImage = "none";
			style.backgroundPosition = (logo ? "center 25px,":"")+$scope.settings.backgroundPosition;
			style.backgroundSize = (logo ? "280px,":"")+"cover";
		}
		return style;
	};
	$scope.suggestions = function(input){
		// suggestions for typeahead
		return schf.getSuggestions(input);
	};
	$scope.onSelect = function (item) {
	    switch(item.type){
	    	case "app":
	    	af.launchApp(item.data.id);
	    	break;
	    	case "history":
	    	case "bookmark":
	    	this.goTo(item.data.url);
	    	break;
	    	case "web":
	    	default:
	    	this.search();
	    };
	};
	$scope.search = function(){
		// Process the google search
		if(this.query && this.query.length>0){
			this.isLoading = true;
			this.goTo(this.settings.searchEngine + this.query);
		}
	};
}]);

// AppCtrl
cardboard.controller('AppCtrl', ['$scope','AppFactory', function($scope, af){
	af.getApps().then(function(apps){
		$scope.apps = apps;
	});	
	$scope.launch = function(){
		af.launchApp(this.app);
	};
	$scope.viewPermissions = function(){
		this.permissions = af.getPermissions(this.app.id);
	};
	$scope.uninstall = function(){
		if(confirm("Uninstall "+this.app.name+" ?")){
			af.uninstall(this.app.id);
			$scope.apps.splice(this.key,1);
		}
	};
	$scope.getIcon = function(){
		var icon_url;
		if(this.app.icons)
			icon_url = this.app.icons[this.app.icons.length-1].url;
		else
			icon_url = "chrome://extension-icon/khopmbdjffemhegeeobelklnbglcdgfh/256/1";
		if(!this.app.enabled)
			icon_url+="?grayscale=true";
		return icon_url;
	};
}]);

// BookmarkCtrl
cardboard.controller('BookmarkCtrl', ['$scope','BookmarkFactory', function($scope, bf){
	bf.getRecent(5).then(function(bookmarks){
		$scope.bookmarks = bookmarks;
	});
}]);

// DownloadCtrl
cardboard.controller('DownloadCtrl', ['$scope','DownloadFactory', function($scope, df){
	df.getRecent(5).then(function(downloads){
		$scope.downloads = downloads;
	});
	// Watch changes in download states and apply them to the model
	chrome.downloads.onChanged.addListener(function(downloadDelta){
		for (i in $scope.downloads){
			if($scope.downloads[i].id == downloadDelta.id){
				for (j in downloadDelta)
					if(j != "id")
						$scope.downloads[i][j] = downloadDelta[j].current;
				$scope.$apply();
				break;
			}
		}
	});
	// whatch if a download is created and add it to the card
	chrome.downloads.onCreated.addListener(function(downloadCreated){
		$scope.$apply(function(){
			$scope.downloads.pop(); // remove the last element
			$scope.downloads.unshift(downloadCreated); // add the newly created at the beggining
		});
	});

	$scope.show = function(){
		df.show(this.download.id);
	};
	$scope.open = function(){
		df.open(this.download.id);
	};
	$scope.pause = function(){
		df.pause(this.download.id);
	};
	$scope.resume = function(){
		df.resume(this.download.id);
	};
	$scope.cancel = function(){
		df.cancel(this.download.id);
	};
	$scope.retry = function(){
		df.download(this.download.url);
	};
}]);


// QuickSettingsCtrl
cardboard.controller('QuickSettingsCtrl', ['$scope','QuickSettingsFactory', function($scope, qsf){
	$scope.isWorking = false;

	$scope.clearCache = function(){
		$scope.isWorking = true;
		qsf.clearCache().then(function(){ $scope.isWorking = false;});
	};
	$scope.clearCookies = function(){
		if(confirm("Clear Cookies?")){
			$scope.isWorking = true;
			qsf.clearCookies().then(function(){$scope.isWorking = false;});
		}
	};
	$scope.clearHistory = function(){
		if(confirm("Clear Browser History?")){
			$scope.isWorking = true;
			qsf.clearHistory().then(function(){$scope.isWorking = false;});
		}
	};
	$scope.clearLocalStorage = function(){
		if(confirm("Clear Local Storage?")){
			$scope.isWorking = true;
			qsf.clearLocalStorage().then(function(){$scope.isWorking = false;});
		}
	};
}]);

// TopSitesCtrl
cardboard.controller('TopSitesCtrl', ['$scope','TopSitesFactory', function($scope, tsf){
	tsf.get(5).then(function(topSites){
		$scope.topSites = topSites;
	});
}]);

// StorageCtrl
cardboard.controller('StorageCtrl', ['$scope','StorageFactory', function($scope, sf){
	sf.getInfo().then(function(storageUnits){
		$scope.storageUnits = storageUnits;
	});
}]);

/******************************************************************/
/*							SETTINGS							  */
/******************************************************************/


cardboard.controller('AppearanceCtrl', ['$scope','SettingsFactory', function($scope, sf){
	$scope.background;
	$scope.updateBg = function(){
		$scope.settings.backgroundId = this.background.id;
		sf.set({backgroundId : this.background.id});
	};
	$scope.updateBgPos = function(){
		sf.set({backgroundPosition : this.settings.backgroundPosition});
	};
	$scope.updateBgLogo = function(){
		sf.set({backgroundLogo : this.settings.backgroundLogo});
	};
}]);

cardboard.controller('CardsCtrl', ['$scope','SettingsFactory','PermissionFactory', function($scope, sf, pf){
	$scope.updateCards = function(){
		// delete the allow property for security measure (even if permissions are verified at load)
		// Plus it saves unnecessary bits from sync storage
		delete this.settings.cards.allowed;
		sf.set({cards:this.settings.cards});
	};
	$scope.request = function(){
		var cardId = this.key;
		if(!this.card.allowed)
			pf.request(this.card.permissions).then(function(granted){
				if(granted)
					$scope.settings.cards[cardId].allowed = true;
			});
		else
			console.log("already granted");
	};
	$scope.revokeAll = function(){
		// revoke the cards permissions
		var warning = "Be careful, this will revoke all permissions for this extension.";
		warning += "\nThis will disable cards that needs authorization until you grant corresponding permission again.";
		warning += "\nIMPORTANT : Due to a odd chrome behavior you won't see any confirm popup next time you grant permissions.";
		warning += "\nMore details here: https://plus.google.com/115967816314012668475/posts/VepEbyyw7yf";

		if(confirm(warning))
			for(i in $scope.settings.cards){
				(function(i_copy){
					pf.revoke($scope.settings.cards[i_copy].permissions).then(function(revoked){
						if(revoked)
							$scope.settings.cards[i_copy].allowed = false;
						else
							console.log("Error while revoking permission");
					});
				}(i));
			}
	};
}]);

cardboard.controller('WelcomeCtrl', ['$scope', function($scope){
	$scope.nextCard = 0;
	$scope.next = function(){
		$scope.nextCard++;
	};
}]);
