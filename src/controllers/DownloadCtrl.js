angular.module('cardboard.controllers')

    .controller('DownloadCtrl', [
        '$scope',
        'fromNowFilter',
        'humanizeFilter',
        function ($scope, fromNow, humanize) {
            $scope.downloads = [];

            // get recent Downloads
            chrome.downloads.searchAsync({ limit: 15, orderBy: ['-startTime'] })
                .map(function (download, index, arrayLength) {
                    // Avoid a case where fetching icons with no filename throws an error
                    if (download.filename) {
                        // fetch their icon
                        return chrome.downloads.getFileIconAsync(download.id)
                            .then(function (dataUrl) {
                                download.icon = dataUrl;
                                return download;
                            });
                    }
                    else
                        return download;
                })
                .then(function (downloads) {
                    $scope.downloads = downloads;
                    $scope.$apply();
                    // init all dropdowns
                    $scope.initDropdowns('.card.downloads .dropdown-card-btn');
                    $scope.initDropdowns('.card.downloads .download .more');
                });

            // Watch changes in download states and apply them to the model
            chrome.downloads.onChanged.addListener(function (downloadDelta) {
                for (i in $scope.downloads)
                    if ($scope.downloads[i].id == downloadDelta.id) {
                        for (j in downloadDelta)
                            if (j != "id")
                                $scope.downloads[i][j] = downloadDelta[j].current;
                        break;
                    }

                $scope.$apply();
            });

            // Watch if a download is created and add it to the card
            chrome.downloads.onCreated.addListener(function (download) {
                $scope.downloads.pop(); // remove the last element
                $scope.downloads.unshift(download); // add the newly created at the beggining

                // wait 500ms after download starts to get the icon
                Promise.delay(500).then(function () {
                    // Avoid a case where fetching icons with no filename throws an error
                    if (download.filename)
                        return chrome.downloads.getFileIconAsync(download.id);
                    else
                        throw new Error("No filename");
                })
                    .then(function (dataUrl) {
                        for (var i in $scope.downloads)
                            if ($scope.downloads[i].id == download.id) {
                                $scope.downloads[i].icon = dataUrl;
                                break;
                            }
                        // Should init the new new dropdown but doesn't work
                        // $scope.initDropdowns('#dropdown-'+download.id);
                    })
                    .finally(function () { $scope.$apply(); });
            });

            $scope.open = function () {
                if (this.download.state == "interrupted")
                    Materialize.toast(humanize(this.download.error), 4000);
                else if (this.download.state == "complete") {
                    if (this.download.exists)
                        chrome.downloads.open(this.download.id);
                    else
                        Materialize.toast("File moved or deleted", 4000);
                }
            };
            $scope.resume = function () {
                chrome.downloads.resumeAsync(this.download.id);
            };
            $scope.pause = function () {
                chrome.downloads.pauseAsync(this.download.id);
            };
            $scope.cancel = function () {
                chrome.downloads.cancelAsync(this.download.id);
            };
            $scope.retry = function () {
                chrome.downloads.downloadAsync({ url: this.download.url });
            };
            $scope.remove = function () {
                chrome.downloads.eraseAsync({ id: this.download.id })
                    .then(function (erased) {
                        for (var i in $scope.downloads)
                            if ($scope.downloads[i].id == erased[0]) {
                                $scope.downloads.splice(i, 1);
                                break;
                            }
                        $scope.$apply();
                    });
            };
            $scope.show = function () {
                chrome.downloads.show(this.download.id);
            };

            $scope.getStatus = function () {
                var str;

                if (this.download.state == "in_progress") {
                    if (this.download.paused)
                        str = "Paused";
                    else
                        str = fromNow(this.download.estimatedEndTime);
                }
                else if (this.download.state == "interrupted") {
                    str = humanize(this.download.error);
                }
                else if (this.download.state == "complete") {
                    str = fromNow(this.download.endTime);
                }
                return str;
            };

        }]);
