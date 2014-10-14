cardboard.directive('escFocus', function() {
	return {
		restrict: 'A',
		link: function(scope, elem, attrs) {
			elem.bind('keyup', function (e) {
				// esc
				if (e.keyCode == 27) {
					if(!scope.$first) {
						elem[0].blur();
					}
				}
			});
		}
	};
});

cardboard.directive('pieDownloader', ['DownloadFactory','$interval','$timeout', function(df,$interval,$timeout) {
	return {
		restrict: 'A',
		link: function(scope, elem, attrs) {

			// create the canvas and appends it in the element
			var canvas = document.createElement('canvas');
			var savedIconUrl = scope.download.iconUrl;
			canvas.width = canvas.height = 38;
			elem.prepend(canvas);
			var ctx = canvas.getContext('2d');

			Math.TAU = 2 * Math.PI;

			// Draw one time the progression
			drawProgressSpinner(ctx, (scope.download.bytesReceived / scope.download.totalBytes));
			// update the progression each 1000ms
			$interval(pollProgress,1000,0,false);

			function pollProgress(){
				if(scope.download.state == "in_progress" && !scope.download.paused)
					df.search({id:scope.download.id}).then(function(dl){
						// update received bytes and estimated time at each iteration
						scope.download.bytesReceived = dl[0].bytesReceived;
						scope.download.totalBytes = dl[0].totalBytes;
						scope.download.estimatedEndTime = dl[0].estimatedEndTime;

						drawProgressSpinner(ctx, (scope.download.bytesReceived / scope.download.totalBytes));
					});
			}

			function drawProgressSpinner(ctx, stage) {
				ctx.fillStyle = ctx.strokeStyle = "#009ddc"; // green: #53a93f

				var clocktop = -Math.TAU/4;
				drawProgressArc(ctx, clocktop, clocktop + (stage * Math.TAU));
			}

			function drawProgressArc(ctx, startAngle, endAngle) {
				var center = ctx.canvas.width/2;
				ctx.lineWidth = Math.round(ctx.canvas.width*0.1);
				ctx.beginPath();
				ctx.moveTo(center, center);
				ctx.arc(center, center, center * 0.9, startAngle, endAngle, false);
				ctx.fill();
			}

		}
	};
}]);

cardboard.directive('bgPick', ['SettingsFactory',function(sf) {
	return {
		restrict: 'E',
		replace: true,
		template: '<input type="file" accept="image/png, image/jpeg, image/webp" />',
		link: function(scope, elem, attrs) {

			elem.bind('change', function(input) {

				if (input.target.files && input.target.files[0]) {
					var reader = new FileReader();
					var filename = input.target.value.replace("C:\\fakepath\\","");

					// we store the background as a dataURL in the local storage (no sync because too large)
					reader.readAsDataURL(input.target.files[0]);
					reader.onload = function (e) {
						chrome.storage.local.set({"bgDataUrl": e.target.result}, function(){
							var lastId = scope.settings.backgrounds.length;
							// replace the previous custom bg if there is any;
							if(scope.settings.backgrounds[lastId-1].type == "Custom")
								lastId--;

							var userBackground =  {id: lastId, name: filename, type: "Custom" };

							// the custom bg gets pushed into the array of default bgs
							scope.settings.backgrounds[lastId] = userBackground;
							// save the new bgs array in sync settings
							sf.set({backgrounds: scope.settings.backgrounds}).then(function(){
								// update the bg immediatly on screen/scope
								scope.background = userBackground;
								scope.settings.bgDataUrl = e.target.result;
								scope.updateBg();
							});
						});
					}

				}
			});
		}
	};
}]);