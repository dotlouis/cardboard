angular.module('cardboard.controllers')

.controller('FeedCtrl',['$scope', function($scope){

    $scope.isDrag = false;

    $scope.settings.then(function(storage){
        var settings = storage[0];

        // init welcome messages
        $scope.dailyMsg = settings.welcomeMessages[Math.floor((Math.random() * settings.welcomeMessages.length))];

        // check each card permissions;
        return Promise.map(settings.cards, function(card){
            return Chrome.permissions.check(card.permissions)
            .then(function(granted){
                // Disable the card if not granted AND enabled
                card.enabled = (granted && card.enabled);
                return card;
            });
        });
    })
    .then(function(cards){
        $scope.$apply(function(){
            $scope.cards = cards;
        });
        checkCardsEnabled();
        checkCardsDisabled();
    });


    // see http://packery.metafizzy.co/faq.html#order-after-drag
    // and http://packery.metafizzy.co/methods.html#packery-data
    // var pckryElement = document.querySelector('#feed > div');
    // console.log(pckryElement);
    // var pckry = Packery.data(pckryElement);
    // console.log(pckry.getItemElements());

    $scope.toggle = function(card, on){
        var self = this;
        if(typeof on === "undefined")
            on = card.enabled;

        if(on)
            Chrome.permissions.request(card.permissions)
            .then(function(){
                // Granted
                $scope.$apply(function(){
                    card.enabled = true;
                    // We know all cards are not disabled, we just enabled one
                    $scope.allCardsDisabled = false;
                });
                checkCardsEnabled();
                Chrome.storage.setAsync({'cards':$scope.cards});
            })
            .catch(function(){
                // Denied, we don't enable the card
                $scope.$apply(function(){
                    card.enabled = false;
                    // We know all cards are not enabled, we just disabled one
                    $scope.allCardsEnabled = false;
                });
                checkCardsDisabled();
                toast("Card needs permission to run", 4000);
            });
        else
            Chrome.permissions.revoke(card.permissions)
            .then(function(){
                $scope.$apply(function(){
                    card.enabled = false;
                    // We know all cards are not enabled, we just disabled one
                    $scope.allCardsEnabled = false;
                });
                checkCardsDisabled();
                Chrome.storage.setAsync({'cards':$scope.cards});
            });
    };

    function checkCardsEnabled(){
        for(var i=0; i<$scope.cards.length; i++){
            if(!$scope.cards[i].enabled){
                $scope.$apply(function(){$scope.allCardsEnabled = false;});
                break;
            }
            else if(i == $scope.cards.length-1)
                $scope.$apply(function(){$scope.allCardsEnabled = true;});
        }
    }
    function checkCardsDisabled(){
        for(var i=0; i<$scope.cards.length; i++){
            if($scope.cards[i].enabled){
                $scope.$apply(function(){$scope.allCardsDisabled = false;});
                break;
            }
            else if(i == $scope.cards.length-1)
                $scope.$apply(function(){$scope.allCardsDisabled = true;});
        }
    }

    /********* FAB STUFF **********/

    var fab = $('.fixed-action-btn');
    fab.off( "mouseenter mouseleave" ); // Disable FAB on hover

    $('.fixed-action-btn').mouseleave(fabOff);

    $scope.triggerFab = function(){
        if($scope.fab)
            fabOff();
        else
            fabOn();
    };

    function fabOn(){
        var time = 0;
        fab.children('ul').css('display','block');
        fab.find('ul a.btn-floating').reverse().each(function () {
            $(this).velocity(
                { opacity: "1", scaleX: "1", scaleY: "1", translateY: "0"},
                { duration: 100, delay: time });
            time += 40;
        });
        $scope.fab = true;
    }

    function fabOff(){
        var time = 0;
        fab.find('ul a.btn-floating').velocity("stop", true);
        fab.find('ul a.btn-floating').velocity(
            { opacity: "0", scaleX: ".4", scaleY: ".4", translateY: "40px"},
            {
                duration: 100,
                complete: function(){
                    setTimeout(function () {
                        fab.children('ul').css('display','none');
                    }, 50);
                }
            });

        $scope.fab = false;
    }

}]);
