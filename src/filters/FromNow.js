angular.module('cardboard.filters').filter('fromNow', function() {
  return function(dateString) {
    return moment(new Date(dateString)).fromNow();
  };
});
