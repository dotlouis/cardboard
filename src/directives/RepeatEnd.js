angular.module('cardboard.directives')

    .directive('repeatEnd', [
        function () {
            return {
                restrict: "A",
                link: (scope, element, attrs) => {
                    if (scope.$last) {
                        scope.$evalAsync(attrs.repeatEnd);
                    }
                }
            }
        }]);
