/**
 * Created by 150T on 2017/2/19.
 */
indexModule.controller('MyCtrl',function($scope){
    $scope.jumpToUrl = function(path){
        location.href = path;
        // location.reload();
    };
});
