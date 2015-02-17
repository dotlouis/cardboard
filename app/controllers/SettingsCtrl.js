angular.module('cardboard.controllers')

.controller('SettingsCtrl',['$scope','$q','ChromeFactory',function($scope, $q, Chrome){

    //init tooltips
    $('.tooltipped').tooltip({delay: 50});

    $scope.saveBackgroundFromDevice = function(){
        // backgroundFromDevice is defined into <bg-pick> (directive)
        if(!this.backgroundFromDevice)
            toast("no file selected", 4000);
        else
            this.backgroundFromDevice.then(function(bg){
                $scope.$parent.background.url = bg.dataUrl;
                $scope.$parent.background.name = bg.filename;
                // persist in storage
                $scope.save('backgrounds', $scope.$parent.backgrounds);
            });
    };

    $scope.saveBackgroundFromUrl = function(){
        // backgroundFromUrl is defined via ng-model (view)
        if(!this.backgroundFromUrl)
            toast("invalid URL", 4000);
        else{
            $scope.$parent.background.url = this.backgroundFromUrl;
            $scope.$parent.background.name = this.backgroundFromUrl.substring(this.backgroundFromUrl.lastIndexOf('/')+1);
            // persist in storage
            $scope.save('backgrounds', $scope.$parent.backgrounds);
        }
    };

    $scope.selectBg = function(){
        if($scope.background.type == "URL")
            $('#modalBgUrl').openModal();
        else if($scope.background.type == "Local")
            $('#modalBgDevice').openModal();

        $scope.save('backgroundId', $scope.background.id);
    };

    $scope.request = function(){
        var self = this;
        // if card is enabled
        if(self.card.enabled)
            Chrome.permissions.request(self.card.permissions)
            .then(function(){
                // Granted, we save the change
                $scope.save('cards', $scope.cards);
            })
            .catch(function(){
                // Denied, we don't enable the card
                self.card.enabled = false;
                toast("Card needs permission to run", 4000);
            });
        else if(!self.card.enabled)
            Chrome.permissions.revoke(self.card.permissions)
            .then(function(){
                $scope.save('cards', $scope.cards);
            });
    };

    $scope.save = function(storageKey, value){
        var toSave = {};
        toSave[storageKey] = value;
        Chrome.storage.setAsync(toSave);
    };

}]);
