/**
 * Created by JT on 2017/1/17.
 */

mapModule.directive('globalMapContent',function(){
    return {
        restrict:'ACEM',
        templateUrl: 'global-map/tpls/global-map-content.html',
        replace: true,
        controller:['$scope','$http',function($scope,$http){

            var width = document.getElementById('mysearch').offsetWidth;
            var height = window.innerHeight
                - document.getElementById('headbanner').offsetHeight
                - document.getElementById('mysearch').offsetHeight;

            console.log(width,height);

            var feature;

            var projection = d3.geo.azimuthal()
                .scale(280)
                .origin([-71.03,42.37])
                .mode("orthographic")
                .translate([width/2,height/2]);

            var circle = d3.geo.greatCircle()
                .origin(projection.origin());


            var scale = {
                orthographic: 380,
                stereographic: 380,
                gnomonic: 380,
                equidistant: 380 / Math.PI * 2,
                equalarea: 380 / Math.SQRT2
            };

            var path = d3.geo.path()
                .projection(projection);

            var svg = d3.select('#canvas-map').append('svg')
                .attr('width',width)
                .attr('height',height)
                .on('mousedown',mousedown);

            d3.json('global-map/json/world-countries.json',function(collection){
                feature = svg.selectAll("path")
                    .data(collection.features)
                    .enter().append("path")
                    .style('fill','#032207')
                    .style('stroke','#73FF5C')
                    .attr("d", clip);

                feature.append("title")
                    .text(function(d) { return d.properties.name; });
            });

            d3.select(window)
                .on("mousemove", mousemove)
                .on("mouseup", mouseup);

            d3.select("select").on("change", function() {
                projection.mode(this.value).scale(scale[this.value]);
                refresh(750);
            });

            var m0,
                o0;

            function mousedown() {
                m0 = [d3.event.pageX, d3.event.pageY];
                o0 = projection.origin();
                d3.event.preventDefault();
            }

            function mousemove() {
                if (m0) {
                    var m1 = [d3.event.pageX, d3.event.pageY],
                        o1 = [o0[0] + (m0[0] - m1[0]) / 8, o0[1] + (m1[1] - m0[1]) / 8];
                    projection.origin(o1);
                    circle.origin(o1)
                    refresh();
                }
            }

            function mouseup() {
                if (m0) {
                    mousemove();
                    m0 = null;
                }
            }

            function refresh(duration) {
                (duration ? feature.transition().duration(duration) : feature).attr("d", clip);
            }

            function clip(d) {
                return path(circle.clip(d));
            }

        }]
    };
});