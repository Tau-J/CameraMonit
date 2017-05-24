/**
 * Created by JT on 2017/1/17.
 */

insecureModule.directive('insecureDevicesList',function(){
    return {
        restrict: 'ACEM',
        templateUrl: 'insecure-devices/tpls/insecure-devices-list-content.html',
        replace: true,
        controller:['$scope','$http',function($scope){
            /*设置controller属性以及初始化*/

            //总的页表项
            $scope.totaldevs = [];
            //分页页表项
            $scope.devs = [];
            //默认分页长度
            var len = 1;
            //起始页表索引
            $scope.currentPage = 1;
            //总的索引表
            $scope.pages_total = [];
            //缩略索引表
            $scope.pages = [];
            //漏洞详情弹窗数据初始化
            $scope.modelVul = {
                'name': 'AAAAAAAAAAAAAAAA'
            };
            //提供搜索的字符串绑定
            $scope.wanted = "";
            //备份本地数据
            var stagetotaldevs = [];
            //设置页表长度
            var pageSize = 13;
            //设置排名参数
            var index_01 = 0;//名称
            var index_02 = 0;//漏洞等级
            var index_03 = 1;//发布年份

            /*封装controller相关方法调用*/

            //用于页表索引初始化
            $scope.initPages = function () {
                $scope.currentPage = 1;
                $scope.devs = $scope.totaldevs.slice(0, pageSize);
                // $scope.setLocs();
                //获得页码数
                len = Math.ceil($scope.totaldevs.length / pageSize);
                //设置总的分页索引
                $scope.pages_total = [];
                for (var i = 1; i <= len; i++) {
                    $scope.pages_total.push(i);
                }
                //设置初始索引
                $scope.pages = [];
                if (len <= 9) {
                    $scope.pages = $scope.pages_total;
                }
                else {
                    for (var i = 1; i <= $scope.currentPage + 2; i++) {
                        $scope.pages.push(i);
                    }
                    $scope.pages.push("..");
                    $scope.pages.push(len);
                }
            };

            //搜索功能
            $scope.searchAction = function () {

                $scope.totaldevs = stagetotaldevs.slice(0, stagetotaldevs.length)
                var tempDevs = [];
                for (var i = 0; i < $scope.totaldevs.length; i++) {
                    // var temp = $scope.totaldevs[i]['devices'].join("");
                    var temp = $scope.totaldevs[i]['sourceIP'] + $scope.totaldevs[i]['protocol'] + $scope.totaldevs[i]['sourcePort'];
                    if (temp.toLowerCase().indexOf($scope.wanted.toLowerCase()) >= 0) {
                        tempDevs.push($scope.totaldevs[i])
                    }
                }
                $scope.totaldevs = tempDevs;
                $scope.initPages();


            };

            //用于实现分页跳转
            $scope.setPage = function (page) {
                if (page > 0 && page < len + 1) {
                    var tail = pageSize * page;
                    var head = tail - pageSize;
                    $scope.currentPage = page;
                    $scope.devs = $scope.totaldevs.slice(head, tail);
                    $scope.setLocs();
                    if (len <= 9) {
                        $scope.pages = $scope.pages_total
                    }
                    else if ($scope.currentPage - 2 > 1 && $scope.currentPage + 2 < len) {
                        $scope.pages = [];
                        $scope.pages.push(1);
                        $scope.pages.push("..");

                        $scope.pages.push($scope.currentPage - 2);
                        $scope.pages.push($scope.currentPage - 1);
                        $scope.pages.push($scope.currentPage);
                        $scope.pages.push($scope.currentPage + 1);
                        $scope.pages.push($scope.currentPage + 2);

                        $scope.pages.push("...");
                        $scope.pages.push(len);
                    }
                    else if ($scope.currentPage - 2 > 1) {
                        $scope.pages = [];
                        $scope.pages.push(1);
                        $scope.pages.push("..");

                        for (var i = $scope.currentPage - 2; i <= len; i++) {
                            $scope.pages.push(i);
                        }
                    }
                    else if ($scope.currentPage + 2 < len) {
                        $scope.pages = [];

                        for (var i = 1; i <= $scope.currentPage + 2; i++) {
                            $scope.pages.push(i);
                        }
                        $scope.pages.push("..");
                        $scope.pages.push(len);
                    }

                }
            }

            //用于调用相关API
            $scope.getData = function (urlData) {
                d3.json('/app/insecure-devices/json/badIP.json',function (data) {
                    $scope.totaldevs = data;
                    stagetotaldevs = $scope.totaldevs.slice(0, $scope.totaldevs.length);
                    sort($scope.totaldevs, 'date', 0);
                    $scope.$apply($scope.initPages());
                });
            };

            //用于设置Model数据
            $scope.setDev = function (dev) {
                $scope.modelVul = dev;
            };
            

            //是否返回省略号
            $scope.judgeStr_01 = function (str, num) {
                if (str.length > num)
                    return '...'
            };
            $scope.judgeStr_02 = function (devs, num) {
                if (devs.length == 0)
                    return '暂无'
                var temp = devs[0];
                if (temp.length > num)
                    return temp.slice(0, num) + '...';
                else
                    return temp;

            };

            //获取API
            var getApi = function () {
                $scope.getData();
            };

            //排序函数
            var sort = function (array, str, order, is_ScoreSort) {
                var len = array.length;
                if(is_ScoreSort){
                    if (order == 1) {
                        for (var i = 0; i < len - 1; i++) {
                            for (var j = i + 1; j < len; j++) {
                                if ($scope.ScoreSort(array[i][str]) > $scope.ScoreSort(array[j][str])) {
                                    var temp = array[i];
                                    array[i] = array[j];
                                    array[j] = temp;
                                }
                            }
                        }
                    }
                    else if (order == 0) {
                        for (var i = 0; i < len - 1; i++) {
                            for (var j = i + 1; j < len; j++) {
                                if ($scope.ScoreSort(array[i][str]) < $scope.ScoreSort(array[j][str])) {
                                    var temp = array[i];
                                    array[i] = array[j];
                                    array[j] = temp;
                                }
                            }
                        }
                    }
                }else{
                    if (order == 1) {
                        for (var i = 0; i < len - 1; i++) {
                            for (var j = i + 1; j < len; j++) {
                                if (array[i][str].localeCompare(array[j][str]) > 0) {
                                    var temp = array[i];
                                    array[i] = array[j];
                                    array[j] = temp;
                                }
                            }
                        }
                    }
                    else if (order == 0) {
                        for (var i = 0; i < len - 1; i++) {
                            for (var j = i + 1; j < len; j++) {
                                if (array[i][str].localeCompare(array[j][str]) < 0) {
                                    var temp = array[i];
                                    array[i] = array[j];
                                    array[j] = temp;
                                }
                            }
                        }
                    }
                }

            };
            $scope.ScoreSort = function(str){
                if(str == '严重')return 3;
                else if(str == '不详')return 2;
                else if(str == '中等')return 1;
                else return 0;
            }
            $scope.doSort = function (str) {
                switch (str) {
                    case 'id':
                        sort($scope.totaldevs, str, index_01, false);
                        index_01 = (index_01 + 1) % 2;
                        $scope.initPages();
                        break;
                    case 'score':
                        sort($scope.totaldevs, str, index_02, true);
                        index_02 = (index_02 + 1) % 2;
                        $scope.initPages();
                        break;
                    case 'finddate':
                        sort($scope.totaldevs, str, index_03, false);
                        index_03 = (index_03 + 1) % 2;
                        $scope.initPages();
                        break;
                }
            };

            /*controller正文*/

            getApi();


            $(function () {
                $("[data-toggle='popover']").popover();
            });

            $scope.$watch('wanted', function (newValue, oldValue) {
                $scope.searchAction();
            });
        }]
    };
});

insecureModule.directive('insecureMap',function(){
    return {
        restrict: 'ACEM',
        templateUrl: 'insecure-devices/tpls/insecure-map.html',
        replace: true,
        controller:['$scope','$http',function($scope){

            var width = document.getElementById('insecure-map').offsetWidth - 80,
                height = document.getElementById('insecure-map').offsetHeight - 30;

            var projection = d3.geo.mercator()
                .scale(100)
                .center([0,0])
				.translate([width / 2, height / 2]);

            var x,y,tx,ty,loc;

            $scope.locAnim = function(){
                var forEach = function(array, callback, scope) {
                    for (var i = 0; i < array.length; i++) {
                        callback.call(scope, i, array[i]); // passes back stuff we need
                    }
                };

                var randomIntFromInterval = function(min,max) {
                    return Math.floor(Math.random()*(max-min+1)+min);
                }

                var $mapPins = document.querySelectorAll('#Map-shape g');

                // Setup timelines attached to each map pin
                forEach($mapPins, function(index, value) {
                    // Group opacity timeline
                    value.groupTimeline = new TimelineMax({
                        paused: true
                    });
                    
                    value.groupTimeline
                        .to(value, 0.25, {
                        opacity: 0
                    });
                    
                    // Pulse animation
                    var pinTimeline = new TimelineMax({
                        repeat: -1,
                        delay: randomIntFromInterval(1,3),
                        repeatDelay: randomIntFromInterval(0, 1)
                    });
                        
                    pinTimeline.
                    to(value.querySelector('.Pin-back'), 3, {
                        scale: 50,
                        transformOrigin: 'center center',
                        opacity: 0
                    });
                });
            }

            $scope.setLocs = function(){

                var locs = document.querySelectorAll('circle');
                var parent = document.getElementById('Map-shape');
                var pre_child;

                for (var child = parent.firstChild; child; pre_child = child, child = child.nextSibling){
                    if(child.tagName === 'g'){
                        parent.removeChild(child);
                        child = pre_child;
                    }
                    
                }

                for ( var i in $scope.devs){
                
                    x = $scope.devs[i].longitude;
                    y = $scope.devs[i].latitude;

                    if( x === 'None' || y === 'None')continue;

                    loc = projection([x,y]);

                    tx = loc[0];
                    ty = loc[1];

                    var canvas = d3.select('#Map-shape')
                        .append('g')
                        .attr('data-location','TR');

                    canvas.append('circle')
                        .attr('class','Pin-back')
                        .attr('cx',tx+'')
                        .attr('cy',ty+'')
                        .attr('r','2.5')
                        .attr('fill','#E0CF78')
                        .attr('fill-opacitry','0.5');
                    
                    canvas.append('circle')
                        .attr('class','Pin-front')
                        .attr('cx',tx+'')
                        .attr('cy',ty+'')
                        .attr('r','4')
                        .attr('fill','#FFD600');
                }

                $scope.locAnim();
            }
            
            
            $scope.setLocs();

            
        
            

            //     forEach(document.querySelectorAll('.js-Location-nav [data-location]'), function(index, value) {
                
            //     value.addEventListener('mouseenter', function(e) {   
            //         var location = e.target.getAttribute('data-location');
                    
            //         // Hide other map pins
            //         forEach($mapPins, function(index, value) {
            //         if (value.getAttribute('data-location') !== location) {
            //             value.groupTimeline.play();
            //         }
            //         });
            //     }, false);
                
            //     value.addEventListener('mouseleave', function(e) {
            //         // Reverse all hidden map pins
            //         forEach($mapPins, function(index, value) {
            //         value.groupTimeline.reverse();
            //         });
                    
            //     }, false);
            // });
            
            

            
        }]
    };
});

