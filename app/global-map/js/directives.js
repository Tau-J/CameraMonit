/**
 * Created by JT on 2017/1/17.
 */

mapModule.directive('globalMapContent',function(){
    return {
        restrict:'ACEM',
        templateUrl: 'global-map/tpls/global-map-content.html',
        replace: true,
        controller:['$scope','$http',function($scope,$http){
			
			$scope.show_insecure = false;
			$scope.Change_show_insecure = function(){
				$scope.show_insecure = !$scope.show_insecure;
				console.log($scope.show_insecure);
			};

			/* 地图绘制初始化 */

        	var width = document.getElementById('mysearch').offsetWidth;
        	var height = window.innerHeight 
        			- document.getElementById('headbanner').offsetHeight
        			- document.getElementById('mysearch').offsetHeight
					- 2 * 15.4; // 2倍headbanner的padding 以及 边框

        	var startCountry = "China",
				globe, land, countries, borders, features, cities, cameras, badIPs, cnt, scale = 1, moved = true,
				wasMoved = [], clickPoints = [], dragging, zoom, drag;

			var mousepos = {};

			var tooltip = d3.select("#tooltip");

			var frameCount = 0;
			var fps = 30, now, elapsed;
			var fpsInterval = 1000 / fps;
			var then = Date.now();
			var startTime = then;

			var projection = d3.geo.orthographic()
				.scale(280)
				.translate([width / 2, height / 2])
				.clipAngle(90)
				.precision(.1);

			var canvas = d3.select("#canvas-map").append("canvas")
				.attr("width", width)
				.attr("height", height);

			var c = canvas.node().getContext("2d");

			var path = d3.geo.path()
				.projection(projection) // put barProjection for testing distances
				.pointRadius(1.5)
				.context(c);

			var graticule = d3.geo.graticule();

			// 用于获取canvas中的鼠标位置
			var elem = document.querySelector('canvas'),
				elem1 = document.getElementById('mytab'),
				elemLeft = elem.offsetLeft + elem1.offsetWidth + 10,
				elemTop = elem.offsetTop + elem1.offsetTop + 40,
				// context = elem.getContext('2d'),
				elements = [],
				lastCountryName = '',
				lastCountryGeometry = null;

			// var showCam = false;

/**雷达图全球初始数据 */
			$scope.stageRadarGlobalIndicator = [
						{name: 'apachel', max: 200000},
						{name: 'dnvrs-web', max: 200000},
						{name: 'nginx/1', max: 200000},
						{name: 'idea-web', max: 200000},
						{name: 'cross-web', max: 200000},
						{name: 'microsoft', max: 200000},
						{name: 'mini-web', max: 200000},
						{name: 'web-server', max: 200000},
						{name: 'apache/X', max: 200000},
						{name: 'goahead-web', max: 200000}
			];

			$scope.radarIndicator = $scope.stageRadarGlobalIndicator;

			$scope.stageRadarGlobalData = [
				[37096,169292,31438,70052,63844,64612,41622,32571,74107,42956]
			];

			$scope.radarData = $scope.stageRadarGlobalData;

			$scope.stageRadarServer = [];
/**雷达图全球初始数据 */			

// start of canvas-map by JT
        	queue()
        		.defer(d3.json, "global-map/json/world-110m.json")
				.defer(d3.tsv, "global-map/json/world-110m-country-names.tsv")
				.defer(d3.json, "global-map/json/cities.geojson")
				.defer(d3.json, "global-map/json/ServeSatr.json")
				.defer(d3.json, "global-map/json/cnt.json")
				.defer(d3.json, "global-map/json/badIP2.json")
				.await(drawMap);



			function drawMap(error, world, names, _cities, _servers, _cnt, _badIP){
				
				if(error) throw error;

				var countryById = {};

				names.forEach(function(d){
					countryById[d.id] = d.name;
				});

				features = topojson.feature(world, world.objects.countries).features;

				features.forEach(function(object){
					object.name =  countryById[object.id];
				});

				globe = {type: "Sphere"},
				land = topojson.feature(world, world.objects.land)
				countries = features,
				cities = _cities.features,
				borders = topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; });


				// cameras
				// cameras = new Array(1000);
				// for(var i in _cameras){
				// 	var t = {
				// 		geometry:{
				// 			coordinates: [ _cameras[i].longitude , _cameras[i].latitude],
				// 			type:"Point"
				// 		},
				// 		id: "a",
				// 		type: "Feature",
				// 		properties:{
				// 			city: "a",
				// 			wikipedia: "a,a"
				// 		}
				// 	};
				// 	cameras[i] = t;
				// }

				// servers
				$scope.stageRadarServer = _servers;

				// cnt
				var all_camera_cities = {};
				cameras = new Array();
				for( var i in _cnt){
					var temp = _cnt[i];
					// var len = Object.getOwnPropertyNames(temp[1]).length // 获得每个国家里省的个数

					Object.assign(all_camera_cities, temp[1]); // 将对象的属性合并到第一个参数对象中
				}
				for( var i in all_camera_cities){
					var temp = all_camera_cities[i];
					var t = {
						geometry: {
							coordinates: [temp[2], temp[1]],
							type:"Point"
						},
						id: i,
						type: "Feature",
						properties:{
							city: i,
							wikipedia: i
						},
						num: temp[0]
					};
					cameras.push(t);
				}

				// badIPs
				badIPs = new Array();
				for(var i in _badIP){
					var temp = _badIP[i];
					var t = {
						geometry: {
							coordinates: [temp['longitude'], temp['latitude']],
							type:"Point"
						},
						id: '',
						type: "Feature",
						properties:{
							city: '',
							wikipedia: ''
						}
					};
					badIPs.push(t);
				}

				var xz = d3.range(-180, 181, 30),
					yz = d3.range(-60, 61, 30),
					circle = d3.geo.circle().angle(7).origin(function(x, y) { return [x, y]; }),
					circles = d3.merge(xz.map(function(x) { return yz.map(function(y) { return circle(x, y); }); }));

				canvas.append("path")
					.datum({type: "GeometryCollection", geometries: circles})
					.attr("class", "tissot")
					.attr("d", path);

				features = features.filter(function(d) {
					return names.some(function(n) {
						if (d.id == parseInt(n.id)){ return d.name = n.name; }
					});
				}).sort(function(a, b) {
					return a.name.localeCompare(b.name);
				});

// 				将startCountry的内容统一为小写形式（用于忽略大小写差异），通过过滤器获取地图中startCountry的对象
				var startIDObj = features.filter(function(d){
					return (d.name).toLowerCase() == (startCountry).toLowerCase();
				})[0];

//  			通过过滤器从地图中获取startCountry的id
				var startGeom = features.filter(function(d){
					return d.id == startIDObj.id
				});

				// 获取startCountry的中心经纬度 
				var startCoord = d3.geo.centroid(startGeom[0]);

				var coords = [-startCoord[0], -startCoord[1]];

				projection.rotate(coords);

				animate();

				zoom = d3.behavior.zoom()
					.center([width / 2, height / 2])
					.on("zoom", onZoom)
					.on("zoomend", function(){ dragging = false; });

				drag = d3.behavior.drag()
					.on('drag', onDrag)
					.on('dragend', function(){ dragging = false; });

				canvas.call(zoom);
				canvas.call(drag);
			}

			var animate = function() {

				requestAnimationFrame(animate);

				now = Date.now();
				elapsed = now - then;

				// if enough time has elapsed, draw the next frame
				if (elapsed > fpsInterval) {
					
					// Get ready for next frame by setting then=now, but...
					// Also, adjust for fpsInterval not being multiple of 16.67
					then = now - (elapsed % fpsInterval);

					if(moved){
						draw();
						moved = false;
					}
				}
			};

			var draw = function(){
			
				// Store the current transformation matrix
				c.save();

				// Use the identity matrix while clearing the canvas
				c.setTransform(1, 0, 0, 1, 0, 0);
				c.clearRect(0, 0, width, height);

				// Restore the transform
				c.restore();

				// sea //003366'
				//c.fillStyle = '#003366', c.beginPath(), path.context(c)(globe), c.fill(), c.stroke();
				//graticule
				c.strokeStyle = "#DBFFD5", c.lineWidth = .5, c.beginPath(), path.context(c)(graticule()), c.stroke();
				// land
				// c.fillStyle = "#006699", c.beginPath(), path.context(c)(land) /*path(land)*/, c.fill();
				c.fillStyle = "#032207", c.beginPath(), path.context(c)(land) /*path(land)*/, c.fill();
				// countries
				c.strokeStyle = "#73FF5C",c.beginPath(),path.context(c)(land),c.stroke();
		
				// mobile
				/*for(var i in countries){
					c.fillStyle = "#f00", c.beginPath(), path(countries[i]), c.fill();
				}*/
				// borders
				c.strokeStyle = "#73FF5C", c.lineWidth = 1, c.beginPath(), path(borders), c.stroke();

				var protate = projection.rotate(),
					mouseCoords = projection.invert([mousepos.x, mousepos.y]),
					scaleLevel = zoom && zoom.scale() || 0;

				// console.log(cities[0]);
				// console.log(cameras[0]);

				// cities
				for(var i in cities){

					// no show
					//if(scaleLevel < 4)
					//	return;

					// c.fillStyle = "#fff", c.beginPath(), path(cities[i]), c.fill();

					var cds = cities[i].geometry.coordinates,
						xyFromCoordinates = projection([cds[0],cds[1]]);

					// mask and labels
					var longitude = Number(cds[0]) + 180,
						startLongitude = 360 - ((protate[0] + 270) % 360),
						endLongitude = (startLongitude + 180) % 360;

					if ((startLongitude < endLongitude && longitude > startLongitude && longitude < endLongitude) ||
							(startLongitude > endLongitude && (longitude > startLongitude || longitude < endLongitude))){
								// labels
								// c.font = '8px Monospace';
								// 这里是城市名称
								// c.fillStyle = "#fb0", c.beginPath(), c.fillText(decodeURI(cities[i].properties.city).toUpperCase(), xyFromCoordinates[0], xyFromCoordinates[1]);
								// white outline
								// 城市名外发光
								// c.fillStyle = 'rgba(144, 122, 122, 0.2)', c.beginPath(), c.fillRect(xyFromCoordinates[0] -1, xyFromCoordinates[1] -6, (decodeURI(cities[i].properties.city).toUpperCase().length * 5), 7);
					} else {
						// 被挡住的部分城市名
						// c.font = '5px Monospace';
						// c.fillStyle = "rgba(32, 45, 21, 0.2)", c.beginPath(), c.fillText(decodeURI(cities[i].properties.city).toUpperCase(), xyFromCoordinates[0], xyFromCoordinates[1]);
						// c.fillStyle = 'rgba(255, 255, 255, 0.0)', c.beginPath(), c.fillRect(xyFromCoordinates[0] -1, xyFromCoordinates[1] -6, (decodeURI(cities[i].properties.city).toUpperCase().length * 5), 7);
					}
				}

				// cameras 
				for(var i in cameras){
					var _lon = cameras[i].geometry.coordinates[0],
						_lat = cameras[i].geometry.coordinates[1];
					
					// var cds = projection([_lon, _lat]);
					var cds = cameras[i].geometry.coordinates,
						xyFromCoordinates = projection([cds[0],cds[1]]);

					// mask and labels
					var longitude = Number(cds[0]) + 180,
						startLongitude = 360 - ((protate[0] + 270) % 360),
						endLongitude = (startLongitude + 180) % 360;
					
					if ((startLongitude < endLongitude && longitude > startLongitude && longitude < endLongitude) ||
							(startLongitude > endLongitude && (longitude > startLongitude || longitude < endLongitude))){
						// 正面显示的部分
						c.fillStyle = "rgba(212,180,33,0.6)", c.beginPath(), c.arc(xyFromCoordinates[0], xyFromCoordinates[1], 12 ,0, 2*Math.PI), c.fill();
						c.fillStyle = "#D4B421", c.beginPath(), c.arc(xyFromCoordinates[0], xyFromCoordinates[1], 8, 0, 2*Math.PI), c.fill();
						c.fillStyle = "#000", c.font = "10px Georgia", c.fillText( ''+i[0] , xyFromCoordinates[0] - 4, xyFromCoordinates[1] + 4);
								
					} else {
						// 被挡住的部分
						c.fillStyle = "rgba(212,180,33,0.0)", c.beginPath(), c.arc(xyFromCoordinates[0], xyFromCoordinates[1], 12 ,0, 2*Math.PI), c.fill();
						c.fillStyle = "rgba(212,180,33,0.0)", c.beginPath(), c.arc(xyFromCoordinates[0], xyFromCoordinates[1], 8, 0, 2*Math.PI), c.fill();
						c.fillStyle = "rgba(212,180,33,0.0)", c.font = "10px Georgia", c.fillText( ''+i[0] , xyFromCoordinates[0] - 4, xyFromCoordinates[1] + 4);
					}
				}

				// badIPs
				// console.log($scope.show_insecure);
				if($scope.show_insecure){
					// console.log('1');
					for(var i in badIPs){
						_lon = badIPs[i].geometry.coordinates[0];
						_lat = badIPs[i].geometry.coordinates[1];

						// var cds = projection([_lon, _lat]);
						cds = badIPs[i].geometry.coordinates;
						xyFromCoordinates = projection([cds[0],cds[1]]);

						// mask and labels
						longitude = Number(cds[0]) + 180;
						startLongitude = 360 - ((protate[0] + 270) % 360);
						endLongitude = (startLongitude + 180) % 360;

						if ((startLongitude < endLongitude && longitude > startLongitude && longitude < endLongitude) ||
							(startLongitude > endLongitude && (longitude > startLongitude || longitude < endLongitude))){
							// 正面显示的部分
							c.fillStyle = "rgba(215,21,21,0.6)", c.beginPath(), c.arc(xyFromCoordinates[0], xyFromCoordinates[1], 6 ,0, 2*Math.PI), c.fill();
							c.fillStyle = "#DA1515", c.beginPath(), c.arc(xyFromCoordinates[0], xyFromCoordinates[1], 4, 0, 2*Math.PI), c.fill();
							// c.fillStyle = "#000", c.font = "10px Georgia", c.fillText( ''+i[0] , xyFromCoordinates[0] - 4, xyFromCoordinates[1] + 4);

						} else {
							// 被挡住的部分
							c.fillStyle = "rgba(212,180,33,0.0)", c.beginPath(), c.arc(xyFromCoordinates[0], xyFromCoordinates[1], 12 ,0, 2*Math.PI), c.fill();
							c.fillStyle = "rgba(212,180,33,0.0)", c.beginPath(), c.arc(xyFromCoordinates[0], xyFromCoordinates[1], 8, 0, 2*Math.PI), c.fill();
							// c.fillStyle = "rgba(212,180,33,0.0)", c.font = "10px Georgia", c.fillText( ''+i[0] , xyFromCoordinates[0] - 4, xyFromCoordinates[1] + 4);
						}
					}
				}

				
			};
 
 			var onDrag = function(){
				var dx = d3.event.dx,
					dy = d3.event.dy,
					rotation = projection.rotate(),
					radius = projection.scale(),
					// barRotation = barProjection.rotate(),
					// barRadius = barProjection.scale();

				scale = d3.scale.linear()
					.domain([-1 * radius, radius])
					.range([-90, 90]);

				var degX = scale(dx), degY = scale(dy);

				rotation[0] += degX;
				rotation[1] -= degY;
				if (rotation[1] > 90)   rotation[1] = 90;
				if (rotation[1] < -90)  rotation[1] = -90;

				if (rotation[0] >= 180) rotation[0] -= 360;

				// barprojection
				// scale = d3.scale.linear()
				// 	.domain([-1 * barRadius, barRadius])
				// 	.range([-90, 90]);

				// barRotation sphere is ~~twice bigger thus degree scales must be twice
				// bigger as well (if you want 3d effect)
				var degrX = scale(dx) * 1.367, degrY = scale(dy)* 1.367;

				// barRotation[0] += degrX;
				// barRotation[1] -= degrY;
				// if (barRotation[1] > 90)   barRotation[1] = 90;
				// if (barRotation[1] < -90)  barRotation[1] = -90;

				// if (barRotation[0] >= 180) barRotation[0] -= 360;

				projection.rotate(rotation);
				// barProjection.rotate(barRotation);

				moved = true;
				dragging = true;
					
				wasMoved.push([dx, dy]);
			};

			var onZoom = function(){
				zoom.scaleExtent([zoom.scale()*0.5, zoom.scale()*1.1]);

				// 缩放范围限定，存在bug
				// scale = (d3.event.scale >= 1) ? d3.event.scale : 1;

				scale = d3.event.scale;
				projection.scale(280 * scale);

				// this is double scaled projection, if you change scale
				// you must also change rotation and control point factors
				// to reflect this scale size
				// barProjection.scale(410.1 * zoom.scale());

				moved  = true;
				dragging = true;

				// 缩放时将搜索数据源头还原为全球范围
				$scope.totalInfos = $scope.stageTotalInfos;
			};

			var detectCountry = function(inverted){
				if(!features)
					return;

				var foundCountryElement;

				features.forEach(function(element) {
					if(element.geometry.type == 'Polygon'){
						if(gju.pointInPolygon(inverted, element.geometry) && !foundCountryElement){
							foundCountryElement = element;
						}
					}

					else if(element.geometry.type == 'MultiPolygon'){
						if(gju.pointInMultiPolygon(inverted, element.geometry) && !foundCountryElement){
							foundCountryElement = element;
						}
					}
				});

				var name = foundCountryElement? foundCountryElement.name: null,
					geometry = foundCountryElement? foundCountryElement.geometry: null;

				return {
					name: name,
					geometry: geometry
				}
			};

			elem.addEventListener('mousemove', function(event) {
				
				// huge performance improvement for firefox
				if(dragging){
					return;
				}

				var x = event.clientX - elemLeft,
					y = event.clientY - elemTop,
					inverted = projection.invert([x,y]),
					country = detectCountry(inverted);
				var hide_tooltip = true;

				// mouse out of current territory
				if(lastCountryGeometry && country.geometry && lastCountryGeometry.coordinates[0][0] != country.geometry.coordinates[0][0] ){
					draw();
					lastCountryName = null;
					lastCountryGeometry = null;
					if(hide_tooltip){
						tooltip.transition()    
				            .duration(500)    
				            .style("opacity", 0);
				        hide_tooltip = false;
					}
				}

				// ocean
				if(country && !country.geometry){
					draw();
					lastCountryName = null;
					lastCountryGeometry = null;
					if(hide_tooltip){
						tooltip.transition()    
				            .duration(500)    
				            .style("opacity", 0);
						hide_tooltip = false;
					}
				}

				// mouse over territory
				if(country && country.name){
					if(lastCountryName != country.name){

						c.fillStyle = "rgba(198, 237, 219, 0.4)", c.beginPath(), path(country.geometry), c.fill();

						// // country text
						// c.fillStyle = 'rgba(244, 244, 244, 0.8)', c.beginPath(), c.fillRect(x -1, y -10, ((decodeURI(country.name)).toUpperCase().length * 7.5), 12);

						// c.font = '12px Monospace';
						// c.fillStyle = "#000", c.beginPath(), c.fillText((decodeURI(country.name)).toUpperCase(), x, y);

						tooltip.transition()
							.duration(200)
							.style('opacity',0.9);
						tooltip.html(country.name);
					
						// tooltip.style("left", event.clientX + "px")   
				        //    .style("top", event.clientY + "px"); 

						tooltip.style('left',0 + 'px')
							.style('top',height + 'px');

						lastCountryName = country.name;
						lastCountryGeometry = country.geometry;
						hide_tooltip = true;
					}
				}

				
			}, false);

			var getCountryInfos = function(countryName){
				var temp = [];
				for( var t in $scope.stageTotalInfos){
					if($scope.stageTotalInfos[t].country === countryName)
						temp.push($scope.stageTotalInfos[t]);
				}
				return temp;
			}

			var getCountryIndicator = function(countryName){
				var temp = [];
				for( var t in $scope.stageRadarServer){
					if(t === countryName){
						var countryServer = $scope.stageRadarServer[t];
						var maxNum = 0;
						for(var i in countryServer){
							if(countryServer[i] > maxNum){
								maxNum = countryServer[i];
							}
							temp.push({name: i, max:0});
						}
						for(var i in temp){
							temp[i].max = maxNum;
						}
						break;
					}
							
				}
				return temp;
			}

			var getCountryServerData = function(countryName){
				var temp = [];
				var notExitst = true;
				for( var t in $scope.stageRadarServer){
					if(t === countryName){
						notExitst = false;
						var item = $scope.stageRadarServer[t];
						for(var i in item){
							temp.push(item[i]);
						}
						break;
					}
				}
				if(notExitst)return [[0,0,0,0,0,0,0,0,0,0]];
				return [temp];
			}

			var setMyOption = function(){
				var lineStyle = {
					normal: {
						width: 1,
						opacity: 0.5
					}
				};
				$scope.option = {
					tooltip:{
						show: true  
					},
					radar: {
						nameGap: -50,
						indicator: $scope.radarIndicator,
						shape: 'circle',
						splitNumber: 5,
						name: {
							textStyle: {
								color: 'rgb(238, 197, 102)'
							}
						},
						splitLine: {
							lineStyle: {
								color: [
									'rgba(238, 197, 102, 0.1)', 'rgba(238, 197, 102, 0.2)',
									'rgba(238, 197, 102, 0.4)', 'rgba(238, 197, 102, 0.6)',
									'rgba(238, 197, 102, 0.8)', 'rgba(238, 197, 102, 1)'
								].reverse()
							}
						},
						splitArea: {
							show: false
						},
						axisLine: {
							lineStyle: {
								color: 'rgba(238, 197, 102, 0.5)'
							}
						},
						radius: 100
					},
					series: [
						{
							name: 'Global',
							type: 'radar',
							lineStyle: lineStyle,
							data: $scope.radarData,
							symbol: 'none',
							itemStyle: {
								normal: {
									color: '#C6EDDB'
								}
							},
							areaStyle: {
								normal: {
									opacity: 0.3
								}
							}
						}
					]
				};
				// console.log($scope.radarIndicator);
				// console.log($scope.radarData);
			}

			elem.addEventListener('click', function(event){

				// 根据点击位置所在的国家，设置详细信息的数据源
				// 设置雷达图的数据源 2017.3.2 by JT
				if(lastCountryName == null){
					$scope.totalInfos = $scope.stageTotalInfos;
					$scope.initPage();
					$scope.radarIndicator = $scope.stageRadarGlobalIndicator;
					$scope.radarData = $scope.stageRadarGlobalData;
					setMyOption();
					radarMap.setOption($scope.option);
				}else{
					$scope.totalInfos = getCountryInfos(lastCountryName);
					$scope.initPage();
					$scope.radarIndicator = getCountryIndicator(lastCountryName);
					$scope.radarData = getCountryServerData(lastCountryName);
					setMyOption();
					radarMap.setOption($scope.option);
				}

				// prevents clicks on dragend
				if(wasMoved.length > 1){
					wasMoved = [];
					return;
				}

				var x = event.clientX - elemLeft,
					y = event.clientY - elemTop,
					inverted = projection.invert([x,y]),
					zoomBy = zoomByB = 1,
					initialProjectionScale = projection.scale(),
					_loc = projection(inverted);
					// initialBarProjectionScale = barProjection.scale(),
					zoomIn = initialProjectionScale > 3000 ? false: true;

				// 当点击位置不在地球上时无视该次点击
				if (isNaN(inverted[0]) || isNaN(inverted[1])){return ;}
				
				// 旋转至点击位置
				d3.transition()
					.duration(1250)
					.tween("rotate", function() {
						var r = d3.interpolate(projection.rotate(), [-inverted[0], -inverted[1]]);
						
						return function(t) {
							projection.rotate(r(t));
							// barProjection.rotate(r(t));

							zoomBy = zoomIn ? initialProjectionScale + (t * 900) : initialProjectionScale - (t * 1200);
							// zoomByB = zoomIn ? initialBarProjectionScale + (t * 1230.3) : initialBarProjectionScale - (1640.4)
							
							zoom.scale(t * 3.1);

							projection.scale(zoomBy);
							// barProjection.scale(zoomByB);
							
							wasMoved = [];
							draw();
						};
					})
					.transition()
					.each('end',function(){
						wasMoved = [];
					});
				
			// 点击位置显示动画
			canvas.append("circle")
							.attr("x", _loc[0])
							.attr("y", _loc[1])
							.attr("radius", 0)
							.attr("strokeStyle", "rgba(23, 188, 156,1)")
							.transition()
							.duration(800)
							.ease(Math.sqrt)
							.attr("radius", 200)
							.attr("strokeStyle", "rgba(23, 188, 156,0)")
							.remove();
			d3.timer(animDraw);	

			}, false);

// end of canvas-map by JT

// start of country_count by JT

			$scope.country1_name = 'Poland';
			$scope.country1_count = 14975;

			$scope.country2_name = 'United States';
			$scope.country2_count = 11707;

			$scope.country3_name = 'Thailand';
			$scope.country3_count = 4281;

// end of country_count by JT

// start of radar-map by JT

			var radarMap = echarts.init(document.getElementById('radar-map'), 'camera_monit');

			

			var lineStyle = {
				normal: {
					width: 1,
					opacity: 0.5
				}
			};

			setMyOption();
			radarMap.setOption($scope.option);

// end of radar-map by JT

			// 波纹涟漪效果
			var animDraw = function(){
				var cir = document.querySelector('circle');
				if(cir != null){
					c.strokeStyle = cir.getAttribute('strokeStyle');
					c.beginPath();
					c.arc(cir.getAttribute('x'), cir.getAttribute('y'), cir.getAttribute('radius'), 0, 2*Math.PI);
					c.stroke();
				}				
			}
			d3.timer(animDraw);

			// 搜索下拉选框回调函数
			$scope.selectedInfo = function($item){
				
				/* 根据选项旋转地图至对应位置 */ 

				var inverted = [$item.originalObject.longitude,$item.originalObject.latitude],
					zoomBy = zoomByB = 1,
					initialProjectionScale = projection.scale(),
					zoomIn = initialProjectionScale > 3000 ? false: true,
					_loc = projection(inverted);
				
				// showCam = true;

				canvas.append("circle")
							.attr("x", _loc[0])
							.attr("y", _loc[1])
							.attr("radius", 0)
							.attr("strokeStyle", "rgba(23, 188, 156,1)")
							.transition()
							.duration(800)
							.ease(Math.sqrt)
							.attr("radius", 200)
							.attr("strokeStyle", "rgba(23, 188, 156,0)")
							.remove();

				
				// var camDraw = function(){
				// 		if(showCam && !dragging){
				// 			c.fillStyle = "rgb(253, 156, 115)", c.beginPath(), c.arc(_loc[0], _loc[1], 12 ,0, 2*Math.PI), c.fill();
				// 			c.fillStyle = "#D4B421", c.beginPath(), c.arc(_loc[0], _loc[1], 8, 0, 2*Math.PI), c.fill();
				// 			c.fillStyle = "#000", c.font = "10px Georgia", c.fillText( '★', _loc[0] - 4, _loc[1] + 4);		
				// 		}else{
				// 			showCam = false;
				// 		}
				// }
				
				// d3.timer(camDraw,1000);
				// var t_anim = setInterval(animDraw,10);
				$scope.modelInfo = $item.originalObject;
				setTimeout(function(){
							
							$('#myModal').modal();
						},1300);

				d3.transition()
					.delay(500)
					.duration(1250)
					.tween("rotate", function() {
						var r = d3.interpolate(projection.rotate(), [-inverted[0], -inverted[1]]);
						
						return function(t) {
							projection.rotate(r(t));

							zoomBy = zoomIn ? initialProjectionScale + (t * 900) : initialProjectionScale - (t * 1200);
							
							zoom.scale(t * 3.1);

							projection.scale(zoomBy);
							
							wasMoved = [];
							draw();
						};
					})
					.transition()
					.each('end',function(){
						wasMoved = [];
						// clearInterval(t_anim);
						
						
	
					});
/* 单个摄像头位置标注 */
						
					
				
			}

        }]
    };
});

/** 详细信息表 */
mapModule.directive('cameraInfo',function(){
    return {
        restrict:'ACEM',
        templateUrl: 'global-map/tpls/cameraInfos.html',
        replace: true,
        controller:['$scope','$http',function($scope,$http){
		
// start of cameraInfos by JT

/* 初始化详细信息表 */

			// 总页表项
			$scope.totalInfos = [];
			// 分页表项
			$scope.cameraInfos = [];
			// 默认分页长度
			var len = 1;
			// 起始页表索引
			$scope.currentPage = 1;
			// // 总的索引表
			// $scope.pages_total = [];
			// // 缩略索引表
			// $scope.pages = [];
			// 详情弹窗数据初始化
			$scope.modelInfo = {
				'ip' : '0.0.0.0'
			};
			// 提供搜索的字符串绑定
			$scope.wanted = '';
			// 备份的数据
		 	$scope.stageTotalInfos = [];
			// 设置页表长度
			var pageSize = 5;

			// 获取总摄像头信息
			d3.json('global-map/json/portInfo.json',function(data){
				// 此处的写法是为了获得复制后的副本，而不是引用  
				// 引用会在函数调用结束后清除
				$scope.totalInfos = data;
				$scope.stageTotalInfos = $scope.totalInfos.slice(0, $scope.totalInfos.length);
				// $scope.currentPage = 1;
				// $scope.cameraInfos = $scope.totalInfos.slice(0, pageSize);
				// 初始化页码数
				// len = Math.ceil($scope.totalInfos.length / pageSize);
				// $scope.setPage(1);
				$scope.initPage();
			});

			$scope.initPage = function(){
				len = Math.ceil($scope.totalInfos.length / pageSize);
				$scope.$apply($scope.setPage(1));
			}

			// 设置分页页表项
			$scope.setPage = function(page){
				if(page > 0 && page < len + 1 ){
					var tail = pageSize * page;
					var head = tail - pageSize;
					$scope.currentPage = page;
					$scope.cameraInfos = $scope.totalInfos.slice(head, tail);
				}
			}

			// 获取页表项索引
			$scope.getPageNum = function(cam){
				return $scope.totalInfos.indexOf(cam) + 1;
			}
		
			// 设置model数据
			$scope.setInfo = function(cameraInfo){
				$scope.modelInfo = cameraInfo;
			}
			

			



// end of cameraInfos by JT 
		}]
	}
});

/**全球品牌统计图 */
mapModule.directive('globalCameras',function(){
    return {
        restrict:'ACEM',
        templateUrl: 'global-map/tpls/global-cameras.html',
        replace: true,
        controller:['$scope','$http',function($scope,$http){

// start of global-cameras by JT

			var globalCameras = echarts.init(document.getElementById('global-cameras'), 'camera_monit');
			var option = {
				tooltip: {
					trigger: 'item',
					formatter: "{a} <br/>{b}: {c} ({d}%)"
				},
				legend: {
					orient: 'vertical',
					x: 'left',
					textStyle:{
						color: '#fff'
					},
					data:['Avtech','AXis','Mobtix','Vivotek','Hikvision']
				},
				series: [
					{
						name:'访问来源',
						type:'pie',
						radius: ['20%', '35%'],

						data:[
							{value:604862, name:'Avtech'},
							{value:54441, name:'AXis'},
							{value:36452, name:'Mobtix'},
							{value:78214, name:'Vivotek'},
							{value:2093536, name:'Hikvision'}
						]
					}
				]
			};
			globalCameras.setOption(option);
// end of global-cameras by JT

		}]
	}
});