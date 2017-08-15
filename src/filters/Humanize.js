angular.module('cardboard.filters').filter('humanize', function() {
  return function humanize(input) {
    var isUpper = function(s) {
      return !/[^a-z\xC0-\xFF]/.test(s.toLowerCase()) && s.toUpperCase() === s;
    };

    input = input
      .replace(/(^\s*|\s*$)/g, '')
      .replace(/([a-z\d])([A-Z]+)/g, '$1_$2')
      .replace(/[-\s]+/g, '_')
      .toLowerCase();
    if (isUpper(input.charAt(0))) {
      input = '_' + input;
    }

    input = input
      .replace(/_id$/, '')
      .replace(/_/g, ' ')
      .replace(/(^\s*|\s*$)/g, '');
    input = input.substr(0, 1).toUpperCase() + input.substring(1).toLowerCase();

    return input;
  };
});
