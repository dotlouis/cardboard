angular.module('cardboard.controllers')

.controller('BookmarkCtrl', ['$scope','ChromeFactory', function($scope, Chrome){
    // init tabs
    $('.card.bookmarks .tabs').tabs();
    $('.card.bookmarks .tabs').tabs('select_tab', 'recent-bookmarks');

    Chrome.bookmarks.getRecentAsync(5).then(function(recents){
        $scope.$apply(function(){
            $scope.recents = recents;
        });
        $scope.initDropdowns('.card.bookmarks .dropdown-card-btn');
    });

    // get root bookmarks
    Chrome.bookmarks.getChildrenAsync("0").then(function(root){
        $scope.$apply(function(){
            $scope.tree = root;
        });
    });

    $scope.getChildren = function(id){
        Chrome.bookmarks.getChildrenAsync(id).then(function(children){
            if(children.length > 0){
                $scope.tree = children;
                return Chrome.bookmarks.getAsync(children[0].parentId);
            }
            else
                return Promise.reject("Empty");
        })
        .then(function(parent){
            $scope.parentNode = parent[0];
            $scope.$apply();
        })
        .catch(function(error){
            toast(error, 4000);
        });
    };
}]);
