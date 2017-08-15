angular.module('cardboard.directives').directive('myTyper', [
  '$interval',
  '$timeout',
  function($interval, $timeout) {
    return {
      scope: {
        source: '=',
        delay: '=',
        start: '=',
        wipeDelay: '=',
        term: '=',
        callbackFn: '&',
      },
      link: function(scope, element, attrs) {
        var delay = attrs.delay || 150,
          wipeDelay = attrs.wipeDelay || 2500,
          callbackFn = scope.callbackFn || angular.noop,
          // loop = ("loop" in attrs && attrs.loop !=="false") || false,
          cursor = 0,
          chain,
          cancel;

        // implementation of a blinker cursor (not optimized)
        // element.html('<span></span><i style="font-style:normal; -webkit-animation: blink-it steps(1) 1s infinite;">|</i>');

        // We watch the 'start' expression to kick off the promise chain
        // or cancel it
        scope.$watch('start', function(start) {
          cancel = !start;
          if (start) {
            parse(scope.source)
              // When everything is done we call the callback
              .then(callbackFn)
              .catch(function(error) {
                // Callback for a canceled promise chain. Typically
                // when 'start' changes and evaluates to false
                return error;
              });
          } else wipe(0);
        });

        function parse(source) {
          // We iterate sequentially through the array or promise of an array
          return Promise.each(source, function(str, index, value) {
            if (attrs.term)
              scope.$apply(function() {
                scope.term = str;
              });
            // Write each word
            return write(str).then(function() {
              // don't wipe if it's the last one
              if (index < value - 1) return wipe(wipeDelay);
              return;
            });
          });
        }

        function write(str) {
          // We loop through each char at a given interval delay
          chain = $interval(
            function() {
              // if user cancel we wipe immediately
              // and cancel the $interval to prevent memory leaks
              if (cancel) {
                wipe(0);
                $interval.cancel(chain);
              } else {
                // element.find('span').text(element.find('span').text()+str.charAt(cursor));
                element.text(element.text() + str.charAt(cursor));
                cursor++;
              }
            },
            delay,
            str.length,
          );

          return chain;
        }

        function wipe(timeout) {
          // We reset the cursor when a word is done writing
          return $timeout(function() {
            // element.find('span').text("");
            element.text('');
            cursor = 0;
          }, timeout);
        }

        // Cancel the interval on element destroy to save memory leaks
        element.on('$destroy', function() {
          $interval.cancel(chain);
        });
      },
    };
  },
]);
