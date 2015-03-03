angular.module('cardboard.controllers')

.controller('FeedCtrl',[
    '$scope',
    '$timeout',
    'ChromeFactory',
    function($scope, $timeout, Chrome){

    $scope.isDrag = false;

    // Prevent the FAB from flashing due to value beeing brievly undefined
    $scope.allCardsEnabled = true;

    $scope.settings.spread(function(settings){

        // init welcome messages
        $scope.dailyMsg = settings.welcomeMessages[Math.floor((Math.random() * settings.welcomeMessages.length))];

        // init cards
        return Promise.map(settings.cards, function(card){
            // if cardboard installed or updated we show the changelog
            if(settings.status && card.name == 'changelog' && ($scope.route()=='/feed') )
                card.enabled = true;

            // if the card has permission we check for them before
            if(card.permissions)
                return Chrome.permissions.check(card.permissions)
                .then(function(granted){
                    // Disable the card if not granted AND enabled
                    card.enabled = (granted && card.enabled);
                    return card;
                });
            else
                return card;
        });
    })
    .then(function(cards){
        // we save the init state
        Chrome.storage.setAsync({'cards':cards});

        $scope.$apply(function(){
            $scope.cards = cards;
        });
        checkCardsEnabled();
        checkCardsDisabled();
    });


    // see http://packery.metafizzy.co/faq.html#order-after-drag
    // and http://packery.metafizzy.co/methods.html#packery-data
    // var pckryElement = document.querySelector('#feed > div');
    // var pckry = Packery.data(pckryElement);

    $scope.toggle = function(card, on){
        var self = this;
        if(typeof on === "undefined")
            on = card.enabled;

        if(on)
            Chrome.permissions.request(card.permissions)
            .then(function(){
                // Granted
                tracker.sendEvent('Card', 'Granted', card.name);
                enable(card);
            })
            .catch(function(){
                // Denied, we don't enable the card
                tracker.sendEvent('Card', 'Denied', card.name);
                disable(card);
                toast("Card needs permission to run", 4000);
            });
        else
            Chrome.permissions.revoke(card.permissions)
            .then(function(){
                tracker.sendEvent('Card', 'Removed', card.name);
                disable(card);
            });
    };

    function enable(card){
        $scope.$apply(function(){
            card.enabled = true;
            // We know all cards are not disabled, we just enabled one
            $scope.allCardsDisabled = false;
        });
        checkCardsEnabled();
        Chrome.storage.setAsync({'cards':$scope.cards});
    }
    function disable(card){
        $scope.$apply(function(){
            card.enabled = false;
            // We know all cards are not enabled, we just disabled one
            if(!card.system)
                $scope.allCardsEnabled = false;
        });
        checkCardsDisabled();
        Chrome.storage.setAsync({'cards':$scope.cards});
    }

    function checkCardsEnabled(){
        if($scope.cards)
            for(var i=0; i<$scope.cards.length; i++){
                if(!$scope.cards[i].enabled && !$scope.cards[i].system){
                    $scope.$apply(function(){$scope.allCardsEnabled = false;});
                    break;
                }
                else if(i == $scope.cards.length-1)
                    $scope.$apply(function(){$scope.allCardsEnabled = true;});
            }
    }
    function checkCardsDisabled(){
        if($scope.cards)
            for(var i=0; i<$scope.cards.length; i++){
                if($scope.cards[i].enabled){
                    $scope.$apply(function(){$scope.allCardsDisabled = false;});
                    break;
                }
                else if(i == $scope.cards.length-1)
                    $scope.$apply(function(){$scope.allCardsDisabled = true;});
            }
    }

    /********* ONBOARDING **********/

    $timeout(function(){
        $scope.nextCard = 0;
    }, 200);

    $scope.next = function(){
        $scope.nextCard++;
    };

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
