angular.module('cardboard.directives').directive('myPieDownloader', [
  '$interval',
  '$timeout',
  function($interval, $timeout) {
    return {
      scope: {
        stream: '=',
      },
      link: function(scope, elem, attrs) {
        // create the canvas and appends it in the element
        var canvas = document.createElement('canvas');
        var savedIconUrl = scope.stream.iconUrl;
        canvas.width = canvas.height = 38;
        elem.prepend(canvas);
        var ctx = canvas.getContext('2d');

        Math.TAU = 2 * Math.PI;

        // Draw one time the progression
        drawProgressSpinner(
          ctx,
          scope.stream.bytesReceived / scope.stream.totalBytes,
        );
        // update the progression each 1000ms
        var timeoutId = $interval(pollProgress, 1000, 0, false);
        // cancel the timeout on element destroy to save memory leaks
        elem.on('$destroy', function() {
          $interval.cancel(timeoutId);
        });

        function pollProgress() {
          if (scope.stream.state == 'in_progress' && !scope.stream.paused)
            chrome.downloads
              .searchAsync({ id: scope.stream.id })
              .then(function(dl) {
                // update received bytes and estimated time at each iteration
                scope.stream.bytesReceived = dl[0].bytesReceived;
                scope.stream.totalBytes = dl[0].totalBytes;
                scope.stream.estimatedEndTime = dl[0].estimatedEndTime;

                drawProgressSpinner(
                  ctx,
                  scope.stream.bytesReceived / scope.stream.totalBytes,
                );
                scope.$apply();
              });
        }

        function drawProgressSpinner(ctx, stage) {
          ctx.fillStyle = ctx.strokeStyle = '#1565C0';

          var clocktop = -Math.TAU / 4;
          drawProgressArc(ctx, clocktop, clocktop + stage * Math.TAU);
        }

        function drawProgressArc(ctx, startAngle, endAngle) {
          var center = ctx.canvas.width / 2;
          ctx.lineWidth = Math.round(ctx.canvas.width * 0.1);
          ctx.beginPath();
          ctx.moveTo(center, center);
          ctx.arc(center, center, center * 0.9, startAngle, endAngle, false);
          ctx.fill();
        }
      },
    };
  },
]);
