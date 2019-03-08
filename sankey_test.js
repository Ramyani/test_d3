$(function() {
  var units = "Widgets";

  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 10, bottom: 10, left: 10},
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

  // Set the sankey diagram properties
  var sankey = d3.sankey()
      .nodeWidth(20)
      .nodePadding(15)
      .size([width, height]);

  var path = sankey.link();

  // load the data
  var graph = {
    "nodes":[
      {"node": 0, "name": "Challenged Claims"},
      {"node": 1, "name": "Instituted Claims"},
      {"node": 2, "name": "Denied Instituted"},
      {"node": 3, "name": "Patentable"},
      {"node": 4, "name": "Unpatentable"},
      {"node": 5, "name": "Terminated Before Institution", "halfway": true},
      {"node": 6, "name": "Other", "halfway": true},
      {"node": 7, "name": "Terminated After Institution", "halfway": true},
      {"node": 8, "name": "Pending Final Decision", "halfway": true}
    ],
    "links": [
      {"source":0,"target":1,"value":70},
      {"source":0,"target":2,"value":30},
      {"source":1,"target":3,"value":60},
      {"source":1,"target":4,"value":40},
      {"source":1,"target":7,"value":14},
      {"source":1,"target":8,"value":15},
      {"source":0,"target":5,"value":24},
      {"source":0,"target":6,"value":2}
    ]
  };

  //d3.json(data, function(error, graph) {

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
        .sort(function(a, b) { return b.dy - a.dy; });

  // add the link titles
    link.append("title")
          .text(function(d) {
          return d.source.name + " → " +
                  d.target.name + "\n" + format(d.value); });

  // add in the nodes
    var node = svg.append("g").selectAll(".node")
        .data(graph.nodes)
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")"; })
        .call(d3.drag()
          .subject(function(d) {
            return d;
          })
          .on("start", function() {
            this.parentNode.appendChild(this);
          })
          //.on("drag", dragmove)

        );

  // add the rectangles for the nodes
    node.append("rect")
        .attr("height", function(d) { return d.dy; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) {
        return d.color = color(d.name.replace(/ .*/, "")); })
        .style("stroke", function(d) {
        return d3.rgb(d.color).darker(2); })
      .append("title")
        .text(function(d) {
        return d.name + "\n" + format(d.value); });

  // add in the title for the nodes
    node.append("text")
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { return d.name; })
      .filter(function(d) { return d.x < width / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");

});