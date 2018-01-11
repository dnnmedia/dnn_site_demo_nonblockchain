'use strict';

// Declare app level module which depends on views, and components
angular.module('DNN', [
  'ngRoute'
])
.config(['$locationProvider', '$routeProvider', '$interpolateProvider', function($locationProvider, $routeProvider, $interpolateProvider) {
        $locationProvider.hashPrefix('!');
        $interpolateProvider.startSymbol('[[');
        $interpolateProvider.endSymbol(']]');
}])

.filter('trust', ['$sce', function($sce) {
    return function(text) {
        return $sce.trustAsHtml(text);
    };
}])

.filter('fromnow', [function(){
    return function(text) {
        return moment((new Date(text))).fromNow();
    };
}])

.filter('date', [function(){
    return function(text) {
        return moment((new Date(text))).format('MMMM Do YYYY');
    };
}])
