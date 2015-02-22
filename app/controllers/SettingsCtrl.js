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
                $scope.backgroundSave({
                    name: bg.filename,
                    type: "Local",
                    url: bg.dataUrl
                });
            });
    };

    $scope.saveBackgroundFromUrl = function(){
        // backgroundFromUrl is defined via ng-model (view)
        if(!this.backgroundFromUrl)
            toast("invalid URL", 4000);
        else{
            $scope.backgroundSave({
                name: this.backgroundFromUrl.substring(this.backgroundFromUrl.lastIndexOf('/')+1),
                type: "URL",
                url: this.backgroundFromUrl
            });
        }
    };

    $scope.openUrl = function(){
        $('#modalBgUrl').openModal();
    };

    $scope.openLocal = function(){
        $('#modalBgDevice').openModal();
    };

    $scope.backgroundSave = function(bg){
        var bgIndex = $scope.$parent.backgrounds.length;

        // identify previous background (url or local)
        for(var i=0; i<$scope.$parent.backgrounds.length; i++)
            if($scope.$parent.backgrounds[i].type == bg.type && $scope.$parent.backgrounds[i].url){
                bgIndex = i;
                break;
            }

        // Add the determinded id
        bg.id = bgIndex;
        // Update the scope (add the new background in the list)
        $scope.$parent.backgrounds[bgIndex] = bg;
        $scope.$parent.background = bg;
        // $scope.backgroundSelect = bg;
        $scope.$parent.backgroundId = bgIndex;

        // Create a copy of $scope.$parent.backgrounds
        var bgs = JSON.parse(JSON.stringify($scope.$parent.backgrounds));

        // Save the background dataUrl to the cache
        if(bg.type == "Local")
            Chrome.cache.setAsync({"localBackgroundDataUrl": bg.url});

        // Remove dataUrl because it's too big to fit sync storage
        for(var i in bgs)
            if(bgs[i].type == "Local")
                bgs[i].url = true;

        Chrome.storage.setAsync({
            'backgrounds': bgs,
            'backgroundId': bg.id
        });
    };
}]);
