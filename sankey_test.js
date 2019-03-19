$(function() {
  var units = "Claims";
  // set the dimensions and margins of the graph
  var margin = {top: 30, right: 10, bottom: 10, left: 10},
      width = 800 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

  // format variables
  var formatNumber = d3.format(",.0f"),    // zero decimal places
      format = function(d) { return formatNumber(d) + " " + units; },
      color = d3.scaleOrdinal(d3.schemeCategory20);

  // append the svg object to the body of the page
  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  var positionTooltip = function(mouse, scene, tooltip)
    {
        //Distance of element from the right edge of viewport
        if (scene.width - (mouse.x + tooltip.width) < 20)
        { //If tooltip exceeds the X coordinate of viewport
            mouse.x = mouse.x - tooltip.width - 20;
        }
        //Distance of element from the bottom of viewport
        if (scene.height - (mouse.y + tooltip.height) < 20)
        { //If tooltip exceeds the Y coordinate of viewport
            mouse.y = mouse.y - tooltip.height - 20;
        }
        return {
            top: mouse.y,
            left: mouse.x
        };
    };


  var axisLabels = ['Pre-Institution', 'Trial Phase'];

  svg.selectAll('text')
      .data(axisLabels)
      .enter()
      .append("text")
      .attr("font-weight", 700)
      .attr("font-size", '12px')
      .attr('font-family', "Lucida Grande")
      .attr("class", "axis-label")
      //.attr("transform", "rotate(-90)")
      .attr("x", function(d,i){
        var fact = width / (axisLabels.length * 2.0);
        return fact + (width / (axisLabels.length)) * i;
      })
      .attr("y", -10)
      .attr("fill", "#333333")
      .style("text-anchor", "middle")
      .text(function(d){return d });



  // Set the sankey diagram properties
  var sankey = d3.sankey()
      .nodeWidth(20)
      .nodePadding(15)
      .size([width, height]);

  var path = sankey.link();


  // load the data
  var graph = {"nodes":
  [{"node":0, "name":"Challenged Claims"},
   {"node":1, "name":"Instituted Claims 53%", "subtitle":"PTAB Average: 61%"},
   {"node":2, "name":"Institution Denied 47%", "subtitle":"PTAB Average: 39%"},
   {"node":3, "name":"Patentable 12%", "subtitle":"PTAB Average: 22%"},
   {"node":4, "name":"Unpatentable 88%", "subtitle":"PTAB Average: 78%"},
   {"node":5, "name":"Terminated Before Institution", "halfway":true},
   {"node":6, "name":"Other", "halfway":true},
   {"node":7, "name":"Terminated After Institution", "halfway":true},
   {"node":8, "name":"Pending Final Decision", "halfway":true}],
 "links":
  [{"source":0, "target":1, "value":974},
   {"source":0, "target":2, "value":875},
   {"source":1, "target":3, "value":86},
   {"source":1, "target":4, "value":659},
   {"source":0, "target":5, "value":584},
   {"source":0, "target":6, "value":33},
   {"source":1, "target":7, "value":135},
   {"source":1, "target":8, "value":143}]};


   var ultimateCount = d3.sum(graph.links, function (link) {
     if(link.source == 0){
        return link.value;
     }
   });
   var calculatePercentage = function(d) {
    return ((d / (ultimateCount * 1.0)) * 100).toFixed();
   };

    sankey
        .nodes(graph.nodes)
        .links(graph.links)
        .layout(32);

  // add in the links
    var link = svg.append("g").selectAll(".link")
        .data(graph.links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", path)
        .style("stroke-width", function(d) { return Math.max(1, d.dy); })
        //.sort(function(a, b) { return b.dy - a.dy; });

  // // add the link titles
  //   link.append("title")
  //         .text(function(d) {
  //         return d.source.name + " → " +
  //                 d.target.name + "\n" + format(d.value); });

  // add tooltip for nodes
  var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


  // add in the nodes
    var node = svg.append("g").selectAll(".node")
        .data(graph.nodes)
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")"; })
        .on("mouseover", function(d) {
          var tooltipTxt = "<span>" + d.name + "</span><br><span>" +
                              format(d.value) + "</span><br><span>" +
                                calculatePercentage(d.value) + "% of the Challenged Claims (" + format(ultimateCount) + ")</span>";


           var w = $(window).width();
            var h = $(window).height();
            var margin = {
                x: 10,
                y: 10
            };
            var padding = {
                x: 10,
                y: 10
            };

          var tooltipProps = {
              width: $('.tooltip').width(),
              height: $('.tooltip').height(),
          }
          var scene = {
              x: margin.x + padding.x,
              y: margin.y + padding.y,
              width: w - (margin.x * 2) - (padding.x * 2),
              height: h - (margin.y * 2) - (padding.y * 2)
          }

          tooltip.transition()
                // .duration(2)
                .style("opacity", .9);
            tooltip.html(tooltipTxt)
                .style("left", function()
            {
                var pos = positionTooltip(
                {
                    x: d3.event.pageX,
                    y: d3.event.pageY
                }, scene, tooltipProps);
                return (pos.left + 10) + 'px';
            }).style("top", function()
            {
                var pos = positionTooltip(
                {
                    x: d3.event.pageX,
                    y: d3.event.pageY
                }, scene, tooltipProps);
                return (pos.top - 10) + 'px';
            });
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });


        // .call(d3.drag()
        //   .subject(function(d) {
        //     return d;
        //   })
        //   .on("start", function() {
        //     this.parentNode.appendChild(this);
        //   })
        //   //.on("drag", dragmove)

        // );

  // add the rectangles for the nodes
    node.append("rect")
        .attr("height", function(d) {
          return d.dy;
        })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) {
        return d.color = color(d.name.replace(/ .*/, "")); })
        .style("stroke", function(d) {
        return d3.rgb(d.color).darker(2); })
      .append("title")
        // .text(function(d) {
        // return d.name + "\n" + format(d.value); });

  // add in the title for the nodes
    node.append("text")
        .attr("font-size", '12px')
        .attr('font-family', "Lucida Grande")
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { return d.name })
      .filter(function(d) { return d.x < width / 3; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");

    node.append("text")
        .attr('font-family', "Lucida Grande")
        .attr("font-size", '11px')
        .attr("x", -6)
        .attr("y", function(d) { return (d.dy / 2) + 15; })
        .attr("dy", ".45em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { return d.subtitle })
      .filter(function(d) { return d.x < width / 3; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");
});
