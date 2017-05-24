/**
 * Created by 150T on 2017/1/14.
 */
indexModule.directive('mainHeader', function () {
    return {
        restrict: 'AECM',
        templateUrl: 'index/tpls/main-header.html',
        scope: {},
        replace: true,
        controller: ['$scope', '$rootScope', '$element', function ($scope, $rootScope, $element) {
            

            //此处刷新页面的函数用来解决ui-router跳转之后的GC问题，即重复加载问题
            //项目使用了ui-router会导致各种图标/控件重复加载（例如D3MAP/leaflet会刷新多少次，就加载多少实例，interval同理），使用刷新方法解决
            //感觉效率还可以
            
            $scope.value = 1;
            
            $scope.refreshPage = function () {
                location.reload();
            };
            $scope.setActive = function (value) {
                location.reload();
                var i = document.getElementsByClassName("active");
                if(i != null)
                    i[0].setAttribute('class','dropdown1');
                switch (value){
                    case 1:
                        i = document.getElementById("home");
                        break;
                    case 2:
                        i = document.getElementById("detect");
                        break;
                    case 3:
                        i = document.getElementById("global");
                        break;
                    case 4:
                        i = document.getElementById("public");
                        break;
                    case 5:
                        i = document.getElementById("vuls");
                        break;
                    case 6:
                        i = document.getElementById("insecure");
                        break;

                }
                i.setAttribute('class','active');
            };
        }]
    }
});
