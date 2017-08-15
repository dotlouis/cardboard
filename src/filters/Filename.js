angular.module('cardboard.filters').filter('filename', function() {
  return function(filename) {
    return filename.replace(/^.*[\\\/]/, '');
  };
});
