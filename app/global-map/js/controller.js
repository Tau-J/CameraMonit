/**
 * Created by 150T on 2017/3/25.
 */
mapModule.controller('GCtrl',function($scope){
    $scope.Change_show_insecure = function(){
        $scope.show_insecure = !$scope.show_insecure;
        console.log($scope.show_insecure);
    };
});
