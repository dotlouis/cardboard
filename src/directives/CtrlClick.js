angular.module('cardboard.directives').directive('myCtrlClick', [
  function() {
    return {
      restrict: 'A',
      scope: {
        url: '=',
        beforeClick: '&',
      },
      link: function(scope, element, attrs) {
        var beforeClick = scope.beforeClick || angular.noop;

        element.bind('click', function(event) {
          beforeClick();

          if (scope.url) {
            // in background tab if ctrl or cmd key is held
            if (event.ctrlKey || event.metaKey || event.which == 2)
              chrome.tabs.create({
                url: scope.url,
                active: false,
              });
            else
              // in current tab otherwise
              chrome.tabs.update({
                url: scope.url,
              });
          }
        });
      },
    };
  },
]);
