angular.module('cardboard', [
	'ngRoute',
	'angular-packery',
	'cardboard.controllers',
	'cardboard.factories',
	'cardboard.directives',
	'cardboard.filters'
])

.config(['$routeProvider','$compileProvider', function($routeProvider, $compileProvider) {
	$routeProvider
	.when('/feed', {
		controller: 'FeedCtrl',
		templateUrl: 'app/templates/Feed.html'
	})
	.when('/settings', {
		controller: 'SettingsCtrl',
		templateUrl: 'app/templates/Settings.html'
	})
	// .when('/onboarding', {
	// 	controller: 'OnboardingCtrl',
	// 	templateUrl: 'app/templates/Onboarding.html'
	// })
	.otherwise({ redirectTo: '/feed'});

	// sanitize urls from chrome-extension
	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|chrome-extension):/);
}])


.value('DefaultSettings',{
	version: { "update": 4, "settings": 4},

	// imgur album: https://imgur.com/a/NAaUE
	backgrounds : [
		{
			id: 0,
			name: "Austin",
			type: "Google Now",
			url: {
				dawn: "https://i.imgur.com/7ndeJog.png",
				day: "https://i.imgur.com/FsJ8mCW.png",
				dusk: "https://i.imgur.com/Mmwv5GQ.png",
				night: "https://i.imgur.com/brJBKA3.png"
			}
		},
		{
			id: 1,
			name: "Beach",
			type: "Google Now",
			url: {
				dawn: "https://i.imgur.com/Q5Tn8u9.png",
				day: "https://i.imgur.com/dTFXUxt.png",
				dusk: "https://i.imgur.com/vdO9Ote.png",
				night: "https://i.imgur.com/YaoPX9P.png"
			}
		},
		{
			id: 2,
			name: "Berlin",
			type: "Google Now",
			url: {
				dawn: "https://i.imgur.com/jG1OdPc.png",
				day: "https://i.imgur.com/lnILrRU.png",
				dusk: "https://i.imgur.com/ZCJVfSn.png",
				night: "https://i.imgur.com/5mN7Iau.png"
			}
		},
		{
			id: 3,
			name: "Chicago",
			type: "Google Now",
			url: {
				dawn: "https://i.imgur.com/f4HUPlZ.png",
				day: "https://i.imgur.com/t5wzT8j.png",
				dusk: "https://i.imgur.com/XrJi3O1.png",
				night: "https://i.imgur.com/xDWHJ45.png"
			}
		},
		{
			id: 4,
			name: "Default",
			type: "Google Now",
			url: {
				dawn: "https://i.imgur.com/kJFNQLr.png",
				day: "https://i.imgur.com/foVYQ6T.png",
				dusk: "https://i.imgur.com/dW217U5.png",
				night: "https://i.imgur.com/87UObPk.png"
			}
		},
		{
			id: 5,
			name: "Great Plains",
			type: "Google Now",
			url: {
				dawn: "https://i.imgur.com/dWzcGbr.png",
				day: "https://i.imgur.com/huGlyp2.png",
				dusk: "https://i.imgur.com/XNUMKAT.png",
				night: "https://i.imgur.com/d7KaqQ1.png"
			}
		},
		{
			id: 6,
			name: "London",
			type: "Google Now",
			url: {
				dawn: "https://i.imgur.com/ZD0XBoz.jpg",
				day: "https://i.imgur.com/C2Sg6JG.jpg",
				dusk: "https://i.imgur.com/Qb8PHnA.jpg",
				night: "https://i.imgur.com/k0idCJG.jpg"
			}
		},
		{
			id: 7,
			name: "New York",
			type: "Google Now",
			url: {
				dawn: "https://i.imgur.com/JVK8ID7.png",
				day: "https://i.imgur.com/yB93g10.png",
				dusk: "https://i.imgur.com/z4elpiG.png",
				night: "https://i.imgur.com/lh0LV5L.png"
			}
		},
		{
			id: 8,
			name: "Paris",
			type: "Google Now",
			url: {
				dawn: "https://i.imgur.com/c3wAjp2.png",
				day: "https://i.imgur.com/c3wAjp2.png",
				dusk: "https://i.imgur.com/vmfdH9T.png",
				night: "https://i.imgur.com/vmfdH9T.png"
			}
		},
		{
			id: 9,
			name: "San Francisco",
			type: "Google Now",
			url: {
				dawn: "https://i.imgur.com/fqewVsW.png",
				day: "https://i.imgur.com/lUZp177.png",
				dusk: "https://i.imgur.com/XP6Omxa.png",
				night: "https://i.imgur.com/NATsgio.png"
			}
		},
		{
			id: 10,
			name: "Seatte",
			type: "Google Now",
			url: {
				dawn: "https://i.imgur.com/7nsrzRK.jpg",
				day: "https://i.imgur.com/0E2xXb0.jpg",
				dusk: "https://i.imgur.com/wYytDhF.jpg",
				night: "https://i.imgur.com/ddI0eBh.jpg"
			}
		},
		{
			id: 11,
			name: "Tahoe",
			type: "Google Now",
			url: {
				dawn: "https://i.imgur.com/ZSXPIkL.jpg",
				day: "https://i.imgur.com/xeVYGPU.jpg",
				dusk: "https://i.imgur.com/Buxx2Cs.jpg",
				night: "https://i.imgur.com/g761v2t.jpg"
			}
		}
	],
	backgroundId : 4,
	trends : {
		url: "https://hawttrends.appspot.com/api/terms/",
		enabled: true
	},
	cards : [
		{
			name: "apps",
			enabled: false,
			template: "app/templates/cards/AppCard.html",
			icon: "mdi-navigation-apps",
			permissions: ["management"]
		},
		{
			name: "bookmarks",
			enabled: false,
			template: "app/templates/cards/BookmarkCard.html",
			icon: "mdi-action-bookmark",
			permissions: ["bookmarks"]
		},
		{
			name: "quick_settings",
			enabled: false,
			template: "app/templates/cards/QuickSettingsCard.html",
			icon: "mdi-action-settings",
			permissions: ["browsingData"]
		},
		{
			name: "downloads",
			enabled: false,
			template: "app/templates/cards/DownloadCard.html",
			icon: "mdi-file-cloud-download",
			permissions: ["downloads"]
		},
		{
			name: "top_sites",
			enabled: false,
			template: "app/templates/cards/TopSitesCard.html",
			icon: "mdi-social-whatshot",
			permissions: ["topSites"]
		},
		{
			name: "history",
			enabled: false,
			template: "app/templates/cards/HistoryCard.html",
			icon: "mdi-action-history",
			permissions: ["history"]
		},
		{
			name: "sessions",
			enabled: false,
			template: "app/templates/cards/SessionsCard.html",
			icon: "mdi-device-devices",
			permissions: ["sessions", "tabs"]
		},
		{
			name: "system",
			enabled: false,
			template: "app/templates/cards/SystemCard.html",
			icon: "mdi-hardware-memory",
			permissions: ["system.cpu", "system.memory", "system.storage"]
		}

		// {name: "changelog", system: true, enabled: false, template: "app/templates/cards/ChangelogCard.html" }
		// {name: "appearance", system: true, enabled: true, template: "app/templates/cards/AppearanceCard.html" },
		// {name: "cards", system: true, enabled: true, template: "app/templates/cards/CardsCard.html" },
		// {name: "about", system: true, enabled: true, template: "app/templates/cards/AboutCard.html" }
	],
	faviconURL: "https://www.google.com/s2/favicons?domain_url="
});
