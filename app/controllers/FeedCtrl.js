angular.module('cardboard.controllers')

.controller('FeedCtrl',['$scope', function($scope){

    $scope.isDrag = false;
    // see http://packery.metafizzy.co/faq.html#order-after-drag
    // and http://packery.metafizzy.co/methods.html#packery-data
    // var pckryElement = document.querySelector('#feed > div');
    // console.log(pckryElement);
    // var pckry = Packery.data(pckryElement);
    // console.log(pckry.getItemElements());

}]);
