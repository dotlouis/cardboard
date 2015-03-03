angular.module('cardboard.controllers')

.controller('SystemCtrl', [
    '$scope',
    'ChromeFactory',
    function($scope, Chrome){

    Chrome.system.cpu.getInfoAsync().then(function(cpu){
        $scope.$apply(function(){
            $scope.cpu = cpu;
        });
        $scope.initDropdowns('.card.system .dropdown-card-btn');
    });

    Chrome.system.memory.getInfoAsync().then(function(memory){
        $scope.$apply(function(){
            $scope.memory = memory;
        });
    });

    Chrome.system.storage.getInfoAsync().then(function(storage){
        $scope.$apply(function(){
            $scope.storage = storage;
        });
    });

    Chrome.system.storage.onAttached.addListener(function(storage){
        $scope.storage.push(storage);
        $scope.$apply();
    });

    Chrome.system.storage.onDetached.addListener(function(storageId){
        for(var i in $scope.storage)
            if($scope.storage[i].id == storageId)
                $scope.storage.splice(i,1);

        $scope.$apply();
    });

    $scope.getCpuLoad = function(cpuIndex){
        return Chrome.system.cpu.getInfoAsync().then(function(cpu){
            return {
                progress: cpu.processors[cpuIndex].usage.kernel +
                         cpu.processors[cpuIndex].usage.user,
                total: cpu.processors[cpuIndex].usage.total
            };
        });
    };

    $scope.getMemoryLoad = function(){
        return Chrome.system.memory.getInfoAsync().then(function(memory){
            $scope.memory = memory;
            return {
                progress: memory.capacity - memory.availableCapacity,
                total: memory.capacity
            };
        });
    };
}]);
