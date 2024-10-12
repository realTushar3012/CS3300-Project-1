// WildfireChart.js

// Import D3
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Define and export the chart component function
export function renderWildfireChart(svgId, csvPath) {
  // Set up margins, dimensions, and styling
  const mainSvg = d3.select(`#${svgId}`);
  const margin = { top: 80, right: 30, bottom: 70, left: 70 };
  const width = 1000 - margin.left - margin.right;
  const height = 700 - margin.top - margin.bottom;

  const graphGroup = mainSvg.append("g")
    .attr("transform", `translate(${margin.left + 50},${margin.top + 50})`);

  // Title
  mainSvg.append("text")
    .attr("x", (margin.left + width + 200) / 2) // Shifted by +50
    .attr("y", margin.top + 20)
    .attr("class", "title")
    .text("Type of Land Burned by Year (2012-2023)");

  // Load data and render chart
  d3.csv(csvPath).then((data) => {
    const aggregatedData = d3.groups(data, d => d.Year).map(([year, values]) => ({
      Year: +year,
      "Shrublands and Grasslands": d3.sum(values, v => +v["Yearly burned area across shrublands and grasslands"]),
      "Savannas": d3.sum(values, v => +v["Yearly burned area across savannas"]),
      "Forests": d3.sum(values, v => +v["Yearly burned area across forests"]),
      "Croplands": d3.sum(values, v => +v["Yearly burned area across croplands"])
    }));

    const colors = {
      "Shrublands and Grasslands": "#4f83cc",
      "Savannas": "#ff4d4d",
      "Forests": "#ff944d",
      "Croplands": "#ffd700"
    };

    const xScale = d3.scaleLinear()
      .domain(d3.extent(aggregatedData, d => d.Year))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(aggregatedData, d => d3.max(Object.values(d).slice(1)))])
      .range([height, 0]);

    // X and Y axes
    graphGroup.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
      .selectAll("text")
      .style("font-size", "16px")
      .style("font-family", "Roboto");

    graphGroup.append("g")
      .call(d3.axisLeft(yScale).ticks(5, "~s"))
      .selectAll("text")
      .style("font-size", "16px")
      .style("font-family", "Roboto");

    // Axis labels
    graphGroup.append("text")
      .attr("class", "axis-label")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 20)
      .style("text-anchor", "middle")
      .text("Year");

    graphGroup.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 20)
      .style("text-anchor", "middle")
      .text("Area of land burned in ha");

    // Lines and circles for each data point
    Object.keys(colors).forEach((key) => {
      const landTypeData = aggregatedData.map(d => ({ Year: d.Year, Area: d[key] }));

      const lineGenerator = d3.line()
        .x(d => xScale(d.Year))
        .y(d => yScale(d.Area));

      // Append line for each land type
      graphGroup.append("path")
        .datum(landTypeData)
        .attr("class", "line")
        .attr("stroke", colors[key])
        .attr("d", lineGenerator)
        .attr("fill", "none");

      // Circles at each data point
      graphGroup.selectAll(`.circle-${key}`)
        .data(landTypeData)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.Year))
        .attr("cy", d => yScale(d.Area))
        .attr("r", 4)
        .attr("fill", colors[key]);
    });

    // Legend
    const legend = graphGroup.selectAll(".legend")
      .data(Object.keys(colors))
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(${width + 20}, ${i * 25})`);

    legend.append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", d => colors[d]);

    legend.append("text")
      .attr("x", 25)
      .attr("y", 12)
      .style("font-size", "16px")
      .style("font-family", "Roboto")
      .text(d => d);
  });
}
