// get JSON-friendly data for items positions
Packery.prototype.getShiftPositions = function(attrName) {
  attrName = attrName || 'id';
  let _this = this;
  return this.items.map(function(item) {
    return {
      attr: item.element.getAttribute(attrName),
      x: item.rect.x / _this.packer.width,
      y: item.rect.y,
    };
  });
};

Packery.prototype.initShiftLayout = function(positions, attr) {
  if (!positions) {
    //Unhide cards
    this.items.forEach(function(item) {
      if (item) item.element.style.display = 'block';
    });
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
  this.items = positions
    .map(function(itemPosition) {
      const selector = '[' + attr + '="' + itemPosition.attr + '"]';
      const itemElem = this.element.querySelector(selector);
      if (itemElem) {
        itemElem.style.display = 'block';
        let item = this.getItem(itemElem);
        if (!item) return false;
        item.rect.x = Math.round(itemPosition.x * this.packer.width);
        return item;
      } else {
        return false;
      }
    }, this)
    .filter(function(value) {
      return value !== false;
    });
  this.shiftLayout();
};

angular.module('cardboard.controllers').controller('FeedCtrl', [
  '$scope',
  '$timeout',
  'ChromePermissions',
  'ChromeSettings',
  function($scope, $timeout, Permissions, Settings) {
    $scope.isDrag = true;

    // Prevent the FAB from flashing due to value beeing brievly undefined
    $scope.allCardsEnabled = true;

    let pckry;
    let childLoaded = 0;
    let isInit = false;
    let ngForEnd = false;
    let cardToEnable;

    $scope.settings
      .then(function(settings) {
        // init welcome messages
        $scope.dailyMsg =
          settings.sync.welcomeMessages[
            Math.floor(Math.random() * settings.sync.welcomeMessages.length)
          ];

        // init cards
        return Promise.map(settings.sync.cards, function(card) {
          // if cardboard installed or updated we show the changelog
          if (
            settings.update &&
            settings.update != 'patch' &&
            card.name == 'changelog' &&
            $scope.route() == '/feed'
          )
            card.enabled = true;
          // if the card has permission we check for them before
          if (card.permissions)
            return Permissions.contains({
              permissions: card.permissions,
            }).then(function(permissions) {
              // if a permission is denied we can't enable the card
              // Disable the card if not granted AND enabled
              card.enabled = !permissions.denied && card.enabled;
              return card;
            });
          else return card;
        });
      })
      .then(function(cards) {
        // we save the init state
        Settings.set({ cards: cards });

        $scope.$apply(function() {
          $scope.cards = cards;
        });
        checkCardsEnabled();
        checkCardsDisabled();
      });

    $scope.onEnd = function() {
      ngForEnd = true;
    };

    $scope.$on('$includeContentLoaded', function(event, target) {
      if (target.includes('cards')) childLoaded++;
      const enabledCardLength = $scope.cards.filter(card => {
        return card.enabled;
      }).length;
      if (enabledCardLength === childLoaded && !isInit) {
        initLayout(enabledCardLength);
        isInit = true;
      }
    });

    function initLayout(enabledCardLength) {
      $timeout(() => {
        if (ngForEnd) {
          const grid = document.querySelector('#grid');
          pckry = new Packery(grid, {
            itemSelector: '#grid-item',
            columnWidth: 400,
            gutter: 10,
            percentPosition: false,
            initLayout: false,
          });
          if (!pckry) return;
          chrome.storage.sync.get('dragPositions', function(initPositions) {
            let pos;
            if (Object.keys(initPositions).length !== 0)
              pos = JSON.parse(initPositions.dragPositions);
            const items = grid.querySelectorAll('#grid-item');
            // init layout with saved positions
            pckry.initShiftLayout(pos, 'data-item-id');
            // Drag card
            let posElem = pckry.getItemElements();
            // If card is not in last pos add it.
            posElem.forEach((element, index) => {
              posElem[index] = element.getAttribute('data-item-id');
            });
            let needToSave = false;
            for (let i = 0; i < items.length; i++) {
              if (!posElem.includes(items[i].getAttribute('data-item-id'))) {
                items[i].style.display = 'block';
                pckry.appended(items[i]);
                posElem.push(items[i].getAttribute('data-item-id'));
                needToSave = true;
              }
              const draggie = new Draggabilly(items[i], {
                handle: '.card-title',
              });
              pckry.bindDraggabillyEvents(draggie);
            }
            if (needToSave)
              chrome.storage.sync.setAsync({
                dragPositions: JSON.stringify(
                  pckry.getShiftPositions('data-item-id'),
                ),
              });
          });
          // save drag positions
          pckry.on('dragItemPositioned', function() {
            chrome.storage.sync.setAsync({
              dragPositions: JSON.stringify(
                pckry.getShiftPositions('data-item-id'),
              ),
            });
          });
        }
      }, 25 * enabledCardLength);
    }

    $scope.toggle = function(card, on) {
      const self = this;
      let isOk = false;
      if (typeof on === 'undefined') on = card.enabled;
      if (on)
        Permissions.request({ permissions: card.permissions })
          .then(function() {
            // Granted
            isOk = true;
            tracker.sendEvent('Card', 'Granted', card.name);
            enable(card);
          })
          .catch(function() {
            if (isOk) return;
            // Denied, we don't enable the card
            tracker.sendEvent('Card', 'Denied', card.name);
            disable(card);
            Materialize.toast('Card needs permission to run', 4000);
          });
      else
        Permissions.remove({ permissions: card.permissions }).then(function() {
          tracker.sendEvent('Card', 'Removed', card.name);
          disable(card);
        });
    };

    function enable(card) {
      $scope.$apply(function() {
        card.enabled = true;
        // We know all cards are not disabled, we just enabled one
        $scope.allCardsDisabled = false;
      });
      checkCardsEnabled();
      Settings.set({ cards: $scope.cards });
      cardToEnable = card;
      //Prevent bug
      if (!pckry) return;
      $timeout(function() {
        const selector = '[data-item-id="' + card.name + '"]';
        const itemElem = document.querySelector(selector);
        if (itemElem) {
          pckry.appended(itemElem);
          itemElem.style.display = 'block';
        }
        // save drag positions
        chrome.storage.sync.setAsync({
          dragPositions: JSON.stringify(
            pckry.getShiftPositions('data-item-id'),
          ),
        });
        const draggie = new Draggabilly(itemElem, { handle: '.card-title' });
        pckry.bindDraggabillyEvents(draggie);
      }, 200);
    }
    function disable(card) {
      $scope.$apply(function() {
        card.enabled = false;
        // We know all cards are not enabled, we just disabled one
        if (!card.system) $scope.allCardsEnabled = false;
      });
      checkCardsDisabled();
      Settings.set({ cards: $scope.cards });
      const selector = '[data-item-id="' + card.name + '"]';
      const itemElem = document.querySelector(selector);
      if (!pckry) return;
      pckry.remove(itemElem);
      chrome.storage.sync.setAsync({
        dragPositions: JSON.stringify(pckry.getShiftPositions('data-item-id')),
      });
      $timeout(function() {
        pckry.shiftLayout();
      }, 200);
    }

    function checkCardsEnabled() {
      if ($scope.cards)
        for (var i = 0; i < $scope.cards.length; i++) {
          if (!$scope.cards[i].enabled && !$scope.cards[i].system) {
            $scope.$apply(function() {
              $scope.allCardsEnabled = false;
            });
            break;
          } else if (i == $scope.cards.length - 1)
            $scope.$apply(function() {
              $scope.allCardsEnabled = true;
            });
        }
    }
    function checkCardsDisabled() {
      if ($scope.cards)
        for (var i = 0; i < $scope.cards.length; i++) {
          if ($scope.cards[i].enabled) {
            $scope.$apply(function() {
              $scope.allCardsDisabled = false;
            });
            break;
          } else if (i == $scope.cards.length - 1)
            $scope.$apply(function() {
              $scope.allCardsDisabled = true;
            });
        }
    }

    /********* ONBOARDING **********/

    $timeout(function() {
      $scope.nextCard = 0;
    }, 200);

    $scope.next = function() {
      $scope.nextCard++;
    };

    /********* FAB STUFF **********/

    const fab = $('.fab');

    $scope.triggerFab = function() {
      if ($scope.fab) fabOff();
      else fabOn();
    };

    function fabOn() {
      $('.btn-floating > i:last').css({
        '-webkit-transform': 'rotate(225deg)',
      });
      $scope.fab = true;
    }

    function fabOff() {
      $('.btn-floating > i:last').css({ '-webkit-transform': 'rotate(0deg)' });
      $scope.fab = false;
    }
  },
]);
