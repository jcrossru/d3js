var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
      d3.max(censusData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating y-scale var upon click on axis label
function yScale(censusData, chosenXAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
      d3.max(censusData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis, newYScale, chosenYaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating text on circle with a transition to
// new circles
function renderText(cLableGroup, newXScale, chosenXaxis, newYScale, chosenYaxis) {

  cLableGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]) - 5)
    .attr("y", d => newYScale(d[chosenYAxis]) + 5);

  return cLableGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var labelX = "In Poverty %";
  }
  else if (chosenXAxis === "age") {
    var labelX = "Age (Median)";
  }
  else {
    var labelX = "Household Income (Median)"
  }

  if (chosenYAxis === "healthcare") {
    var labelY = "Lacks Healthcare (%)";
  }
  else if (chosenYAxis === "smokes") {
    var labelY = "Smokes (%)";
  }
  else {
    var labelY = "Obesity (%)"
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${labelX} ${d[chosenXAxis]}<br>${labelY} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv", function(err, censusData) {
  if (err) throw err;

  // parse data
  censusData.forEach(function(data) {
    data.abbr = data.abbr;
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.income = +data.income;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(censusData, chosenXAxis);

  // yLinearScale function above csv import
  var yLinearScale = yScale(censusData, chosenYAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(censusData, d => d.healthcare)])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
   .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("fill", "blue")
    .attr("opacity", ".5")
    ;

    // append initial circle labels
  var cLabelGroup = chartGroup.selectAll("text")
  .data(censusData)
  .enter()
  .append("text")
  .attr("x", d => xLinearScale(d[chosenXAxis]) - 5)
  .attr("y", d => yLinearScale(d[chosenYAxis]) + 5)
  .text(function (d) { return d.abbr ; })
  .attr("font-family", "sans-serif")
  .attr("font-size", "8px")
  .attr("fill", "red");
  ;

  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var labelsYGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)");

  var hairLengthLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text(" In Poverty (%)");

  var albumsLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Income (Median)");

  // append y axis
  var healthCareLabel = labelsYGroup.append("text")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("value", "healthcare") // value to grab for event listener
    .attr("dy", "1em")
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  var smokesLabel = labelsYGroup.append("text")
    .attr("y", 0 - margin.left + 15)
    .attr("x", 0 - (height / 2))
    .attr("value", "smokes") // value to grab for event listener
    .attr("dy", "1em")
    .classed("inactive", true)
    .text("Smokes (%)");

  var obesityLabel = labelsYGroup.append("text")
    .attr("y", 0 - margin.left + 30)
    .attr("x", 0 - (height / 2))
    .attr("value", "obesity") // value to grab for event listener
    .attr("dy", "1em")
    .classed("inactive", true)
    .text("obesity (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        if (value === "poverty") {
          chosenXAxis = value;
        }
        else if (value === "age"){
          chosenXAxis = value;
        }
        else {
          chosenXAxis = value;
        }

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        cLabelGroup = renderText(cLabelGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "age") {
          albumsLabel
            .classed("active", true)
            .classed("inactive", false);
          hairLengthLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "income") {
          albumsLabel
            .classed("active", false)
            .classed("inactive", true);
          hairLengthLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
        else {
          albumsLabel
            .classed("active", false)
            .classed("inactive", true);
          hairLengthLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
      }
    });

  // y axis labels event listener
  labelsYGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {
        // replaces chosenYAxis with value
        if (value === "obesity"){
          chosenYAxis = value;
        }
        else if (value === "smokes"){
          chosenYAxis = value;
        }
        else {chosenYAxis = value;}
        

        // console.log(chosenYAxis)

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(censusData, chosenYAxis);

        // updates x axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        cLabelGroup = renderText(cLabelGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
      if (chosenYAxis === "obesity") {
        obesityLabel
          .classed("active", true)
          .classed("inactive", false);
        healthCareLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenYAxis === "healthcare") {
        obesityLabel
          .classed("active", false)
          .classed("inactive", true);
        healthCareLabel
          .classed("active", true)
          .classed("inactive", false);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else  {
        obesityLabel
          .classed("active", false)
          .classed("inactive", true);
        healthCareLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", true)
          .classed("inactive", false);
      }
    }
    });

  });
