/**
 * Created by 150T on 2017/2/28.
 */

mapModule.directive('deviceDetectContent',function() {
    return {
        restrict: 'ACEM',
        templateUrl: 'device-detect/tpls/device-detect-content.html',
        replace: true,
        controller: ['$scope', '$http', function ($scope, $http) {
            /**鼠标特效 */
            (function() {

                var width, height, largeHeader, canvas, ctx, points, target, animateHeader = true;

                // Main
                initHeader();
                initAnimation();
                addListeners();

                function initHeader() {
                    width = window.innerWidth;
                    height = window.innerHeight;
                    target = {x: width/2, y: height/2};

                    largeHeader = document.getElementById('large-header');
                    largeHeader.style.height = height+'px';

                    canvas = document.getElementById('demo-canvas');
                    canvas.width = width;
                    canvas.height = height;
                    ctx = canvas.getContext('2d');

                    // create points
                    points = [];
                    for(var x = 0; x < width; x = x + width/20) {
                        for(var y = 0; y < height; y = y + height/20) {
                            var px = x + Math.random()*width/20;
                            var py = y + Math.random()*height/20;
                            var p = {x: px, originX: px, y: py, originY: py };
                            points.push(p);
                        }
                    }

                    // for each point find the 5 closest points
                    for(var i = 0; i < points.length; i++) {
                        var closest = [];
                        var p1 = points[i];
                        for(var j = 0; j < points.length; j++) {
                            var p2 = points[j]
                            if(!(p1 == p2)) {
                                var placed = false;
                                for(var k = 0; k < 5; k++) {
                                    if(!placed) {
                                        if(closest[k] == undefined) {
                                            closest[k] = p2;
                                            placed = true;
                                        }
                                    }
                                }

                                for(var k = 0; k < 5; k++) {
                                    if(!placed) {
                                        if(getDistance(p1, p2) < getDistance(p1, closest[k])) {
                                            closest[k] = p2;
                                            placed = true;
                                        }
                                    }
                                }
                            }
                        }
                        p1.closest = closest;
                    }

                    // assign a circle to each point
                    for(var i in points) {
                        var c = new Circle(points[i], 2+Math.random()*2, 'rgba(255,255,255,0.3)');
                        points[i].circle = c;
                    }
                }

                // Event handling
                function addListeners() {
                    if(!('ontouchstart' in window)) {
                        // window.addEventListener('mousemove', mouseMove);
                    }
                    window.addEventListener('scroll', scrollCheck);
                    window.addEventListener('resize', resize);
                }

                function mouseMove(e) {
                    var posx = posy = 0;
                    if (e.pageX || e.pageY) {
                        posx = e.pageX;
                        posy = e.pageY;
                    }
                    else if (e.clientX || e.clientY)    {
                        posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                        posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                    }
                    target.x = posx;
                    target.y = posy;
                }

                function scrollCheck() {
                    if(document.body.scrollTop > height) animateHeader = false;
                    else animateHeader = true;
                }

                function resize() {
                    width = window.innerWidth;
                    height = window.innerHeight;
                    largeHeader.style.height = height+'px';
                    canvas.width = width;
                    canvas.height = height;
                }

                // animation
                function initAnimation() {
                    animate();
                    for(var i in points) {
                        shiftPoint(points[i]);
                    }
                }

                function animate() {
                    if(animateHeader) {
                        ctx.clearRect(0,0,width,height);
                        for(var i in points) {
                            // detect points in range
                            if(Math.abs(getDistance(target, points[i])) < 4000) {
                                points[i].active = 0.3;
                                points[i].circle.active = 0.6;
                            } else if(Math.abs(getDistance(target, points[i])) < 20000) {
                                points[i].active = 0.1;
                                points[i].circle.active = 0.3;
                            } else if(Math.abs(getDistance(target, points[i])) < 40000) {
                                points[i].active = 0.02;
                                points[i].circle.active = 0.1;
                            } else {
                                points[i].active = 0;
                                points[i].circle.active = 0;
                            }

                            drawLines(points[i]);
                            points[i].circle.draw();
                        }
                    }
                    requestAnimationFrame(animate);
                }

                function shiftPoint(p) {
                    TweenLite.to(p, 1+1*Math.random(), {x:p.originX-50+Math.random()*100,
                        y: p.originY-50+Math.random()*100, ease:Circ.easeInOut,
                        onComplete: function() {
                            shiftPoint(p);
                        }});
                }

                // Canvas manipulation
                function drawLines(p) {
                    if(!p.active) return;
                    for(var i in p.closest) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p.closest[i].x, p.closest[i].y);
                        ctx.strokeStyle = 'rgba(156,217,249,'+ p.active+')';
                        ctx.stroke();
                    }
                }

                function Circle(pos,rad,color) {
                    var _this = this;

                    // constructor
                    (function() {
                        _this.pos = pos || null;
                        _this.radius = rad || null;
                        _this.color = color || null;
                    })();

                    this.draw = function() {
                        if(!_this.active) return;
                        ctx.beginPath();
                        ctx.arc(_this.pos.x, _this.pos.y, _this.radius, 0, 2 * Math.PI, false);
                        ctx.fillStyle = 'rgba(156,217,249,'+ _this.active+')';
                        ctx.fill();
                    };
                }

                // Util
                function getDistance(p1, p2) {
                    return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
                }

            })();



            // 设备检测
            // $scope.backInfos = {
            //                     "Check1": "Negative",
            //                     "Connection": "close",
            //                     "Check2": "Positive",
            //                     "Date": "Fri, 03 Mar 2017 14:02:09 GMT",
            //                     "unencode": "Negative",
            //                     "Cache-Control": "private",
            //                     "Content-Length": "3119",
            //                     "Result": "Password too simple!\n",
            //                     "Server": "Netwave IP Camera",
            //                     "Content-Type": "text/html"
            //                 };
            
            $scope.devInfos1 = []; // 基本信息
            $scope.devInfos2 = []; // 弱口令检测
            $scope.devInfos3 = []; // 加密检测
            $scope.devInfos4 = []; // 漏洞关联
            $scope.devInfos5 = []; // 不良记录

            $scope.checkIP = function(){
                // console.log($scope.wanted);
                $scope.devInfos1 = []; // 基本信息
                $scope.devInfos2 = []; // 常见漏洞检测
                $scope.devInfos3 = []; // 加密检测
                $scope.devInfos4 = []; // 漏洞关联
                $scope.devInfos5 = []; // 不良记录
                // $scope.$apply(infoProcess());
                $scope.infoProcess();
                $scope.myLoading = true;
            };

            $scope.infoProcess = function(){
                // 测试：封装全部信息
                // for(var i in $scope.backInfos){
                //     $scope.devInfos1.push({
                //         a: i,
                //         b: $scope.backInfos[i]
                //     });
                // }

                // 41.41.220.134:1080
                // 206.45.135.143:80
                var ip_add = $scope.wanted.split(':');


                $http.get('http://127.0.0.1:8000/app/' + ip_add[0] + '/' + ip_add[1]).then(function(response){

                    console.log(response);
                    $scope.backInfos = response.data;

                    // 基本信息
                    $scope.devInfos1.push({
                        a: 'IP',
                        b: $scope.wanted
                    });

                    for(var i in $scope.backInfos){
                        if( i.slice(0, 5) != 'Check' && i != 'unencode' && i != 'problems'
                            && i != 'SQL_Injection' && i != 'Xss_Detection'){
                            $scope.devInfos1.push({
                                a: i,
                                b: $scope.backInfos[i]
                            });
                        }
                    }

                    // 常见漏洞检测
                    var simple_paswrd = false;
                    for(var i in $scope.backInfos){
                        if( i.slice(0, 5) === 'Check'){
                            if($scope.backInfos[i] === 'Positive'){
                                simple_paswrd = true;
                                break;
                            }
                        }
                    }
                    if(simple_paswrd){
                        $scope.devInfos2.push({
                            a: '是否弱口令',
                            b: '是'
                        });
                    }else{
                        $scope.devInfos2.push({
                            a: '是否弱口令',
                            b: '否'
                        });
                    }
                    $scope.devInfos2.push({
                        a: 'SQL_Injection',
                        b: $scope.backInfos['SQL_Injection']
                    });
                    $scope.devInfos2.push({
                        a: 'Xss_Detection',
                        b: $scope.backInfos['Xss_Detection']
                    });

                    // 加密检测
                    // if($scope.backInfos['unencode'] === 'Negative'){
                    //     $scope.devInfos3.push({
                    //         a: '口令是否加密传输',
                    //         b: '否'
                    //     });
                    // }else{
                    //     $scope.devInfos3.push({
                    //         a: '口令是否加密传输',
                    //         b: '是'
                    //     });
                    // }
                    $scope.devInfos3.push({
                        a: 'unencode',
                        b: $scope.backInfos['unencode']
                    });

                    // 漏洞关联
                    // 假数据
                    // $scope.devInfos4.push({
                    //     a: '1',
                    //     b: 'CVE-2005-1422'
                    // });
                    // $scope.devInfos4.push({
                    //     a: '2',
                    //     b: 'CVE-2007-4927'
                    // });
                    for(var i in $scope.backInfos['problems']){
                        $scope.devInfos4.push({
                            a: i,
                            b: $scope.backInfos['problems'][i]
                        });
                    }

                    // 不良记录
                    // 假数据
                    $scope.devInfos5.push({
                        a: '威胁记录',
                        b: $scope.backInfos['threat']
                    });
                    // $scope.devInfos5.push({
                    //     a: '威胁记录',
                    //     b: '123.151.42.61'
                    // });

                    $scope.myLoading = false;

                });




                

            };

            

            





        }]
    }
});