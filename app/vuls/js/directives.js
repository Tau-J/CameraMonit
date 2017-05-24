/**
 * Created by JT on 2017/2/6.
 */

//cve漏洞库 by JT
vulsModule.directive('vulsContent',function(){
    return {
        restrict: 'ACEM',
        templateUrl:'vuls/tpls/vuls-content.html',
        replace:true,
        controller:['$scope','$http',function ($scope,$http) {
        

            /*设置controller属性以及初始化*/

            //总的页表项
            $scope.totalvuls = [];
            //分页页表项
            $scope.vuls = [];
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
            var stagetotalvuls = [];
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
                $scope.vuls = $scope.totalvuls.slice(0, pageSize);
                //获得页码数
                len = Math.ceil($scope.totalvuls.length / pageSize);
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

                $scope.totalvuls = stagetotalvuls.slice(0, stagetotalvuls.length)
                var tempVuls = [];
                for (var i = 0; i < $scope.totalvuls.length; i++) {
                    // var temp = $scope.totalvuls[i]['devices'].join("");
                    var temp = $scope.totalvuls[i]['id'] + $scope.totalvuls[i]['score'] + $scope.totalvuls[i]['finddate'];
                    if (temp.toLowerCase().indexOf($scope.wanted.toLowerCase()) >= 0) {
                        tempVuls.push($scope.totalvuls[i])
                    }
                }
                $scope.totalvuls = tempVuls;
                $scope.initPages();


            };

            //用于实现分页跳转
            $scope.setPage = function (page) {
                if (page > 0 && page < len + 1) {
                    var tail = pageSize * page;
                    var head = tail - pageSize;
                    $scope.currentPage = page;
                    $scope.vuls = $scope.totalvuls.slice(head, tail);
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
            $scope.getData = function () {
                d3.json('/app/vuls/json/cve.json',function(data){
                    $scope.totalvuls = data;
                    stagetotalvuls = $scope.totalvuls.slice(0, $scope.totalvuls.length);
                    $scope.$apply($scope.initPages());
                });
                    
            
            };

            //用于设置Model数据
            $scope.setVul = function (vul) {
                $scope.modelVul = vul
            };

            //根据level设置颜色
            $scope.setColor = function (value) {
                if (value == '严重')
                    return 'red';
                else if (value == '中等')
                    return 'yellow';
                else
                    return 'green'
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

vulsModule.directive('vulsYear',function(){
    return {
        restrict: 'ACEM',
        templateUrl:'vuls/tpls/vuls-year.html',
        replace:true,
        controller:['$scope','$http',function ($scope,$http) {


            var getForm2 = function (data) {
                var a = new Array();
                var b = new Array();
                var c = new Array();

                var result = new Array();
                for (var item in data) {
                    var d = {
                        value: 0,
                        name: 'hmi'
                    }
                    name = item;
                    value = data[item];

                    d.name = name;
                    d.value = value;

                    a.push(name)
                    b.push(value)
                    c.push(d)
                }
                result.push(a);
                result.push(b);
                result.push(c);
                return result;
            }

            d3.json('/app/vuls/json/counting.json',function(data){

                        var temp = this;
                        temp.result = getForm2(data);
                        var temp1 = echarts
                            .init(document
                                .getElementById('vuls-year'), 'camera-monit');
                        // 指定图表的配置项和数据

                        var optionPicture = {
                            title: {
                                // text: '不同年份的漏洞数量',
                                textStyle: {
                                    fontSize: '16px',
                                    left: '15%',
                                    color: '#fff'
                                },
                            },
                            tooltip: {
                                trigger: 'axis'
                            },
                            toolbox: {
                                show: false,
                                feature: {
                                    dataZoom: {
                                        yAxisIndex: 'none'
                                    },
                                    dataView: {
                                        readOnly: false
                                    },
                                    magicType: {
                                        type: ['line',
                                            'bar']
                                    },
                                    restore: {},
                                    saveAsImage: {}
                                }
                            },
                            grid: {
                                x: 35,
                                y: 15,
                                x2: 30,
                                y2: 30
                            },
                            xAxis: {
                                type: 'category',
                                axisLabel:{
                                    textStyle:{
                                        color : 'rgba(255,255,255,0.8)'
                                    }
                                },
                                boundaryGap: false,
                                data: temp.result[0]
                            },
                            yAxis: {
                                type: 'value',
                                axisLabel: {
                                    textStyle:{
                                        color : 'rgba(255,255,255,0.8)'
                                    },
                                    formatter: '{value}'
                                },
                                axisTick:{
                                    lineStyle:{
                                        color: 'rgba(255,255,255,0.4)'
                                    }
                                }
                            },
                            series: [{
                                name: '年漏洞量',
                                type: 'line',
                                data: temp.result[1],
                                markLine: {
                                    data: [{
                                        type: 'average',
                                        name: '平均值'
                                    }]
                                }
                            }]
                        };

                        // 使用刚指定的配置项和数据显示图表。
                        temp1.setOption(optionPicture);
                        // 根据视口大小改变图表
                        window.onresize = temp1.resize;
                });
        }]
    };
});