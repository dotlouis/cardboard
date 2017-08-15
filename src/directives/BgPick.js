angular.module('cardboard.directives').directive('myBgPick', [
  '$q',
  function($q) {
    return {
      restrict: 'E',
      replace: true,
      template:
        '<input type="file" accept="image/png, image/jpeg, image/webp"/>',
      link: function(scope, elem, attrs) {
        elem.bind('change', function(input) {
          if (input.target.files && input.target.files[0]) {
            var reader = new FileReader();

            // read file
            reader.readAsDataURL(input.target.files[0]);

            // create a promise for when file reading is done
            var deferred = $q.defer();
            scope.backgroundFromDevice = deferred.promise;
            reader.onload = function(e) {
              // resolve the promise with file data
              deferred.resolve({
                filename: input.target.value.replace('C:\\fakepath\\', ''),
                dataUrl: e.target.result,
              });
            };
          }
        });
      },
    };
  },
]);
