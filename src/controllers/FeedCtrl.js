// get JSON-friendly data for items positions
Packery.prototype.getShiftPositions = function (attrName) {
    attrName = attrName || 'id';
    let _this = this;
    return this.items.map(function (item) {
        return {
            attr: item.element.getAttribute(attrName),
            x: item.rect.x / _this.packer.width,
            y: item.rect.y
        }
    });
};

Packery.prototype.initShiftLayout = function (positions, attr) {
    if (!positions) {
        // if no initial positions, run packery layout
        this.layout();
        return;
    }
    // parse string to JSON
    if (typeof positions == 'string') {
        try {
            positions = JSON.parse(positions);
        } catch (error) {
            console.error('JSON parse error: ' + error);
            this.layout();
            return;
        }
    }

    attr = attr || 'id'; // default to id attribute
    this._resetLayout();
    // set item order and horizontal position from saved positions
    this.items = positions.map(function (itemPosition) {
        const selector = '[' + attr + '="' + itemPosition.attr + '"]';
        const itemElem = this.element.querySelector(selector);
        let item = this.getItem(itemElem);
        if (!item)
            return false;
        item.rect.x = Math.round(itemPosition.x * this.packer.width);
        return item;
    }, this).filter(function (value) {
        return value !== false;
    });
    this.shiftLayout();
};

angular.module('cardboard.controllers')
    .controller('FeedCtrl', [
        '$scope',
        '$timeout',
        'ChromePermissions',
        'ChromeSettings',
        function ($scope, $timeout, Permissions, Settings) {

            $scope.isDrag = true;

            // Prevent the FAB from flashing due to value beeing brievly undefined
            $scope.allCardsEnabled = true;

            let pckry;
            let childLoaded = 0;

            $scope.settings.then(function (settings) {

                // init welcome messages
                $scope.dailyMsg = settings.sync.welcomeMessages[Math.floor((Math.random() * settings.sync.welcomeMessages.length))];

                // init cards
                return Promise.map(settings.sync.cards, function (card) {
                    // if cardboard installed or updated we show the changelog
                    if (settings.update && settings.update != "patch" && card.name == 'changelog' && ($scope.route() == '/feed'))
                        card.enabled = true;
                    // if the card has permission we check for them before
                    if (card.permissions)
                        return Permissions.contains({ permissions: card.permissions })
                            .then(function (permissions) {
                                // if a permission is denied we can't enable the card
                                // Disable the card if not granted AND enabled
                                card.enabled = (!permissions.denied && card.enabled);
                                return card;
                            });
                    else
                        return card;
                });
            })
                .then(function (cards) {
                    // we save the init state
                    Settings.set({ 'cards': cards });

                    $scope.$apply(function () {
                        $scope.cards = cards;
                    });
                    checkCardsEnabled();
                    checkCardsDisabled();
                });

            $scope.onEnd = function () {
                const grid = document.querySelector('#grid');
                pckry = new Packery(grid, {
                    itemSelector: '#grid-item',
                    columnWidth: 400,
                    gutter: 10,
                    percentPosition: true,
                    initLayout: false,
                });
                if (!pckry)
                    return;
                chrome.storage.sync.get('dragPositions', function (initPositions) {
                    $timeout(function () {
                        let pos;
                        if (Object.keys(initPositions).length !== 0)
                            pos = JSON.parse(initPositions.dragPositions);
                        // init layout with saved positions
                        pckry.initShiftLayout(pos, 'data-item-id');
                        const items = grid.querySelectorAll('#grid-item');
                        for (let i = 0; i < items.length; i++) {
                            const itemElem = items[i];
                            const posElem = pckry.getItemElements();
                            posElem.forEach(function (element, index) {
                                posElem[index] = element.getAttribute('data-item-id');
                            });
                            if (!posElem.includes(items[i].getAttribute('data-item-id')))
                                pckry.addItems(items[i]);
                            const draggie = new Draggabilly(itemElem);
                            pckry.bindDraggabillyEvents(draggie);
                        }
                    }, 0);
                });
                pckry.on('dragItemPositioned', function () {
                    // save drag positions
                    chrome.storage.sync.setAsync({ 'dragPositions': JSON.stringify(pckry.getShiftPositions('data-item-id')) });
                });
            };

            $scope.toggle = function (card, on) {
                const self = this;
                let isOk = false;
                if (typeof on === "undefined")
                    on = card.enabled;
                if (on)
                    Permissions.request({ permissions: card.permissions })
                        .then(function () {
                            // Granted
                            isOk = true;
                            tracker.sendEvent('Card', 'Granted', card.name);
                            enable(card);
                        })
                        .catch(function () {
                            if (isOk)
                                return;
                            // Denied, we don't enable the card
                            tracker.sendEvent('Card', 'Denied', card.name);
                            disable(card);
                            //toast("Card needs permission to run", 4000);
                        });
                else
                    Permissions.remove({ permissions: card.permissions })
                        .then(function () {
                            tracker.sendEvent('Card', 'Removed', card.name);
                            disable(card);
                        });
            };

            function enable(card) {
                $scope.$apply(function () {
                    card.enabled = true;
                    // We know all cards are not disabled, we just enabled one
                    $scope.allCardsDisabled = false;
                });
                checkCardsEnabled();
                Settings.set({ 'cards': $scope.cards });
                //Prevent bug
                $timeout(function () {
                    const selector = '[data-item-id="' + card.name + '"]'
                    const itemElem = document.querySelector(selector);
                    if (!pckry) {
                        const grid = document.querySelector('#grid');
                        pckry = new Packery(grid, {
                            itemSelector: '#grid-item',
                            columnWidth: 400,
                            gutter: 10,
                            percentPosition: true,
                            initLayout: false,
                        });
                    }
                    $timeout(function () {
                        pckry.appended(itemElem);
                        $timeout(function () {
                            // save drag positions
                            chrome.storage.sync.setAsync({ 'dragPositions': JSON.stringify(pckry.getShiftPositions('data-item-id')) });
                            const draggie = new Draggabilly(itemElem);
                            pckry.bindDraggabillyEvents(draggie);
                        }, 0)
                    }, 400);
                }, 100);
            }
            function disable(card) {
                $scope.$apply(function () {
                    card.enabled = false;
                    // We know all cards are not enabled, we just disabled one
                    if (!card.system)
                        $scope.allCardsEnabled = false;
                });
                checkCardsDisabled();
                Settings.set({ 'cards': $scope.cards });
                const selector = '[data-item-id="' + card.name + '"]'
                const itemElem = document.querySelector(selector);
                $timeout(function () {
                    pckry.remove(itemElem);
                    chrome.storage.sync.setAsync({ 'dragPositions': JSON.stringify(pckry.getShiftPositions('data-item-id')) });
                    pckry.shiftLayout();
                }, 400);
            }

            function checkCardsEnabled() {
                if ($scope.cards)
                    for (var i = 0; i < $scope.cards.length; i++) {
                        if (!$scope.cards[i].enabled && !$scope.cards[i].system) {
                            $scope.$apply(function () { $scope.allCardsEnabled = false; });
                            break;
                        }
                        else if (i == $scope.cards.length - 1)
                            $scope.$apply(function () { $scope.allCardsEnabled = true; });
                    }
            }
            function checkCardsDisabled() {
                if ($scope.cards)
                    for (var i = 0; i < $scope.cards.length; i++) {
                        if ($scope.cards[i].enabled) {
                            $scope.$apply(function () { $scope.allCardsDisabled = false; });
                            break;
                        }
                        else if (i == $scope.cards.length - 1)
                            $scope.$apply(function () { $scope.allCardsDisabled = true; });
                    }
            }

            /********* ONBOARDING **********/

            $timeout(function () {
                $scope.nextCard = 0;
            }, 200);

            $scope.next = function () {
                $scope.nextCard++;
            };

            /********* FAB STUFF **********/

            const fab = $('.fab');

            $scope.triggerFab = function () {
                if ($scope.fab)
                    fabOff();
                else
                    fabOn();
            };

            function fabOn() {
                $('.btn-floating > i:last').css({ '-webkit-transform': 'rotate(405deg)' });
                $scope.fab = true;
            }

            function fabOff() {
                $('.btn-floating > i:last').css({ '-webkit-transform': 'rotate(0deg)' });
                $scope.fab = false;
            }

        }]);
