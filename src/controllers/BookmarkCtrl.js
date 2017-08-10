angular.module('cardboard.controllers')

    .controller('BookmarkCtrl', [
        '$scope',
        function ($scope) {
            // init tabs
            $('.card.bookmarks .tabs').tabs();
            $('.card.bookmarks .tabs').tabs('select_tab', 'recent-bookmarks');

            chrome.bookmarks.getRecentAsync(5).then(function (recents) {
                $scope.$apply(function () {
                    $scope.recents = recents;
                });
                $scope.initDropdowns('.card.bookmarks .dropdown-card-btn');
                // dirty fix for the tab indicator to display at correct size
                setTimeout(function () {
                    $('.card.bookmarks .tabs').tabs();
                }, 450);
            });

            // get root bookmarks
            chrome.bookmarks.getChildrenAsync("0").then(function (root) {
                $scope.$apply(function () {
                    $scope.tree = root;
                });
            });

            $scope.getChildren = function (id) {
                chrome.bookmarks.getChildrenAsync(id).then(function (children) {
                    if (children.length > 0) {
                        $scope.tree = children;
                        return chrome.bookmarks.getAsync(children[0].parentId);
                    }
                    else
                        return Promise.reject("Empty");
                })
                    .then(function (parent) {
                        $scope.parentNode = parent[0];
                        $scope.$apply();
                    })
                    .catch(function (error) {
                        Materialize.toast(error, 4000);
                    });
            };
        }]);
