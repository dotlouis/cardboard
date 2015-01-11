// Default Settings
cardboard.value('DefaultSettings',{
	version : { "update": 3, "settings": 2 },
	backgrounds : [
		{id: 0, name: "Austin", type: "Google Now", url: "img/headers/Austin"},
		{id: 1, name: "Beach", type: "Google Now", url: "img/headers/Beach"},
		{id: 2, name: "Berlin", type: "Google Now", url: "img/headers/Berlin"},
		{id: 3, name: "Chicago", type: "Google Now", url: "img/headers/Chicago"},
		{id: 4, name: "Default", type: "Google Now", url: "img/headers/Default"},
		{id: 5, name: "Great Plains", type: "Google Now", url: "img/headers/GreatPlains"},
		{id: 6, name: "London", type: "Google Now", url: "img/headers/London"},
		{id: 7, name: "New York", type: "Google Now", url: "img/headers/NewYork"},
		{id: 8, name: "Paris", type: "Google Now", url: "img/headers/Paris"},
		{id: 9, name: "San Francisco", type: "Google Now", url: "img/headers/SanFrancisco"},
		{id: 10, name: "Seattle", type: "Google Now", url: "img/headers/Seattle"},
		{id: 11, name: "Tahoe", type: "Google Now", url: "img/headers/Tahoe"}
	],
	backgroundId : 4,
	backgroundPosition : "center",
	backgroundLogo : true,
	cards : {
		"apps": {name: "Apps & Plugins", enabled: true, partial: "app/partials/AppCard.html", permissions: {apis:["management"]} },
		"bookmarks": {name: "Recent Bookmarks", enabled: true, partial: "app/partials/BookmarkCard.html", permissions: {apis:["bookmarks"]} },
		"qsettings": {name: "Quick Settings", enabled: true, partial: "app/partials/QuickSettingsCard.html", permissions: {apis: ["browsingData"]} },
		"downloads": {name: "Recent Downloads", enabled: true, partial: "app/partials/DownloadCard.html", permissions: {apis:["downloads"]} },
		"topsites": {name: "Top Sites", enabled: true, partial: "app/partials/TopSitesCard.html", permissions: {apis:["topSites"]} }
	},
	searchEngine : "https://google.com/search?q="
});
