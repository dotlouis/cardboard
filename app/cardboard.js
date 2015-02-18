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
	backgrounds : [
		{id: 0, name: "Austin", type: "Google Now", url: "/resources/headers/Austin"},
		{id: 1, name: "Beach", type: "Google Now", url: "/resources/headers/Beach"},
		{id: 2, name: "Berlin", type: "Google Now", url: "/resources/headers/Berlin"},
		{id: 3, name: "Chicago", type: "Google Now", url: "/resources/headers/Chicago"},
		{id: 4, name: "Default", type: "Google Now", url: "/resources/headers/Default"},
		{id: 5, name: "Great Plains", type: "Google Now", url: "/resources/headers/GreatPlains"},
		{id: 6, name: "London", type: "Google Now", url: "/resources/headers/London"},
		{id: 7, name: "New York", type: "Google Now", url: "/resources/headers/NewYork"},
		{id: 8, name: "Paris", type: "Google Now", url: "/resources/headers/Paris"},
		{id: 9, name: "San Francisco", type: "Google Now", url: "/resources/headers/SanFrancisco"},
		{id: 10, name: "Seattle", type: "Google Now", url: "/resources/headers/Seattle"},
		{id: 11, name: "Tahoe", type: "Google Now", url: "/resources/headers/Tahoe"},
		{id: 13, name: "choose", type: "URL"},
		{id: 14, name: "choose", type: "Local"}
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
			permissions: ["management"]
		},
		{
			name: "bookmarks",
			enabled: false,
			template: "app/templates/cards/BookmarkCard.html",
			permissions: ["bookmarks"]
		},
		{
			name: "quick_settings",
			enabled: false,
			template: "app/templates/cards/QuickSettingsCard.html",
			permissions: ["browsingData"]
		},
		{
			name: "downloads",
			enabled: false,
			template: "app/templates/cards/DownloadCard.html",
			permissions: ["downloads"]
		},
		{
			name: "top_sites",
			enabled: false,
			template: "app/templates/cards/TopSitesCard.html",
			permissions: ["topSites"]
		},
		{
			name: "history",
			enabled: false,
			template: "app/templates/cards/HistoryCard.html",
			permissions: ["history"]
		},
		{
			name: "recently_closed",
			enabled: false,
			template: "app/templates/cards/RecentlyClosedCard.html",
			permissions: ["sessions", "tabs"]
		}
		// {name: "changelog", system: true, enabled: false, template: "app/templates/cards/ChangelogCard.html" }
		// {name: "appearance", system: true, enabled: true, template: "app/templates/cards/AppearanceCard.html" },
		// {name: "cards", system: true, enabled: true, template: "app/templates/cards/CardsCard.html" },
		// {name: "about", system: true, enabled: true, template: "app/templates/cards/AboutCard.html" }
	],
	faviconURL: "https://www.google.com/s2/favicons?domain_url="
});
