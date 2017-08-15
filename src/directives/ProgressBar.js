angular.module('cardboard.directives').directive('myProgressBar', [
  '$interval',
  '$timeout',
  function($interval, $timeout) {
    return {
      restrict: 'E',
      scope: {
        progress: '&',
        monitor: '=',
        relative: '=',
      },
      template:
        '<div class="progress"><div class="determinate" style="transition: transform .5s ease-in-out; width: 100%; overflow: hidden; transform: translateX(-100%);"></div></div>',
      link: function(scope, element, attrs) {
        var monitor = parseInt(attrs.monitor) || 1000,
          relative =
            ('relative' in attrs && attrs.relative !== 'false') || false;

        var previous;

        // update progress once
        scope.progress().then(function(current) {
          updateBar(current);
        });

        // if monitor attribute is defined we repeat the functions with the
        // given interval delay
        if (typeof attrs.monitor !== 'undefined')
          var interval = $interval(function() {
            scope.progress().then(function(current) {
              updateBar(current);
            });
          }, monitor);

        function updateBar(current) {
          var percent = 0;

          if (relative && previous && current.total != previous.total)
            percent = Math.floor(
              (current.progress - previous.progress) /
                (current.total - previous.total) *
                100,
            );
          else percent = Math.floor(current.progress * 100 / current.total);

          previous = current;

          element
            .children()
            .children()
            .css('transform', 'translateX(-' + (100 - percent) + '%)');
        }

        // Cancel the interval on element destroy to save memory leaks
        element.on('$destroy', function() {
          $interval.cancel(interval);
        });
      },
    };
  },
]);
