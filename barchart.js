// GlobalFireChart.js

// Import D3
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Define and export the chart component function
export function renderGlobalFireChart(svgId, csvPath) {
  const mainSvg = d3.select(`#${svgId}`);

  const margin = { top: 80, right: 30, bottom: 70, left: 70 };
  const width = 1000 - margin.left - margin.right;
  const height = 700 - margin.top - margin.bottom;

  const countriesOfInterest = ["United States", "Canada", "Australia", "Russia", "Brazil"];
  const referenceAreas = [
    { name: "75,000 Football Fields", size: 50000000 },
    { name: "1.5 Californias", size: 100000000 },
    { name: "Corn & Wheat Fields in U.S.", size: 200000000 },
    { name: "Rocky Mountain Region", size: 300000000 },
    { name: "Entire U.S.", size: 550000000 }
  ];

  const graphGroup = mainSvg.append("g")
    .attr("transform", `translate(${margin.left + 50},${margin.top + 50})`);

  const graphWidth = width;
  const graphHeight = height;

  mainSvg.append("text")
    .attr("x", (margin.left + width + 200) / 2)
    .attr("y", margin.top + 20)
    .attr("class", "title")
    .text("Wildfire Area Burned by Year (2012-2023)");

  d3.csv(csvPath).then(data => {
    data.forEach(d => {
      d.Year = +d.Year;
      countriesOfInterest.forEach(country => {
        d[country] = +d[country];
      });
    });

    const stack = d3.stack()
      .keys(countriesOfInterest)
      .order(d3.stackOrderDescending);

    const series = stack(data);

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.Year))
      .range([0, graphWidth])
      .padding(0.2);

    const maxY = d3.max(series.flat().map(d => d[1]));
    let yScale = d3.scaleLinear()
      .domain([0, maxY])
      .range([graphHeight, 0]);

    const colorPalette = [
      "#4f83cc",
      "#ff4d4d",
      "#ff944d",
      "#ffd700",
      "#9b59b6"
    ];

    const colorScale = d3.scaleOrdinal()
      .domain(countriesOfInterest)
      .range(colorPalette);

    const xAxis = d3.axisBottom(xScale).ticks(10).tickFormat(d3.format("d"));
    graphGroup.append("g")
      .attr("transform", `translate(0,${graphHeight})`)
      .call(xAxis)
      .selectAll("text")
      .attr("class", "tick")
      .style("font-size", "14px");

    const yAxis = d3.axisLeft(yScale).ticks(6).tickFormat(d => d / 1000000);
    graphGroup.append("g")
      .call(yAxis)
      .selectAll("text")
      .attr("class", "tick")
      .style("font-size", "14px");

    graphGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 10)
      .attr("x", (-graphHeight / 2) - 20)
      .attr("dy", "1em")
      .attr("class", "axis-label")
      .text("Area Burned by Wildfires (Mha)");

    graphGroup.append("text")
      .attr("x", graphWidth / 2)
      .attr("y", graphHeight + margin.bottom - 10)
      .attr("class", "axis-label")
      .text("Year");

    const yGridlines = d3.axisLeft(yScale)
      .tickSize(-graphWidth)
      .tickFormat("");
    graphGroup.append("g")
      .attr("class", "gridlines")
      .call(yGridlines);

    graphGroup.selectAll("g.layer")
      .data(series)
      .join("g")
      .attr("class", "layer")
      .attr("fill", d => colorScale(d.key))
      .selectAll("rect")
      .data(d => d)
      .join("rect")
      .attr("x", d => xScale(d.data.Year))
      .attr("y", d => yScale(d[1]))
      .attr("height", d => yScale(d[0]) - yScale(d[1]))
      .attr("width", xScale.bandwidth())
      .attr("rx", 5)
      .attr("ry", 5);

    const comparisonGroup = mainSvg.append("g")
      .attr("transform", `translate(${graphWidth + 200}, ${margin.top + 120})`);

    let cumulativeY = 0;

    comparisonGroup.selectAll("rect")
      .data(referenceAreas)
      .join("rect")
      .attr("x", 0)
      .attr("y", d => {
        let yPosition = cumulativeY;
        cumulativeY += graphHeight - yScale(d.size) + 10;
        return yPosition;
      })
      .attr("width", 60)
      .attr("height", d => graphHeight - yScale(d.size))
      .attr("fill", "#33cc99")
      .attr("rx", 5)
      .attr("ry", 5);

    cumulativeY = 0;

    comparisonGroup.selectAll("text")
      .data(referenceAreas)
      .join("text")
      .attr("x", 70)
      .attr("y", d => {
        let yPosition = cumulativeY + 10;
        cumulativeY += graphHeight - yScale(d.size) + 10;
        return yPosition;
      })
      .text(d => `${d.name}: ${Math.round(d.size / 1000000)}M ha`)
      .style("font-size", "14px")
      .style("font-family", "Roboto")
      .style("font-weight", "bold")
      .style("fill", "darkgreen");

    comparisonGroup.append("text")
      .attr("x", 100)
      .attr("y", -30)
      .attr("class", "comparison-title")
      .text("Chart for Comparison");

    const legendGroup = mainSvg.append("g")
      .attr("transform", `translate(${graphWidth + 200}, ${margin.top + 450})`);

    const legend = legendGroup.selectAll(".legend")
      .data(countriesOfInterest)
      .join("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(0, ${i * 30})`);

    legend.append("rect")
      .attr("x", 0)
      .attr("width", 12)
      .attr("height", 12)
      .style("fill", colorScale);

    legend.append("text")
      .attr("x", 20)
      .attr("y", 6)
      .attr("dy", ".35em")
      .attr("class", "legend")
      .text(d => d);
  });
}
