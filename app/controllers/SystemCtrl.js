angular.module('cardboard.controllers')

.controller('SystemCtrl', ['$scope','ChromeFactory',function($scope, Chrome){

    Chrome.system.cpu.getInfoAsync().then(function(cpu){
        $scope.cpu = cpu;
    });

    Chrome.system.memory.getInfoAsync().then(function(memory){
        $scope.memory = memory;
    });

    Chrome.system.storage.getInfoAsync().then(function(storage){
        $scope.storage = storage;
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
