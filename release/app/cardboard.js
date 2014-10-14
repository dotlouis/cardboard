/**
 *  CardBoard module
 *
 * This module encapsulate the whole application
 */
var cardboard = angular.module('cardboard', ['ngRoute','ngSanitize','ngAnimate','ui.scrollfix','ui.bootstrap']);

cardboard.config(['$routeProvider', '$compileProvider', '$provide', function($routeProvider, $compileProvider, $provide) {
	$routeProvider
	.when('/cardboard', {
		templateUrl: 'app/partials/CardboardView.html'
	})
	.when('/welcome', {
		controller: 'WelcomeCtrl',
		templateUrl: 'app/partials/WelcomeView.html'
	})
	.when('/settings', {
		templateUrl:'app/partials/SettingsView.html'
	})
	.when('/changelog', {
		templateUrl: 'app/partials/ChangelogView.html'
	})
	.otherwise({ redirectTo: '/cardboard'});

	// authorize chrome urls for imgs (appcard)
	$compileProvider.imgSrcSanitizationWhitelist(/^\s*(chrome):/);

}]);