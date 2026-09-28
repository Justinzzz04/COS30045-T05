(function() {
  const container = d3.select("#line-chart");

  function render() {
    container.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = 320 - margin.top - margin.bottom;

    const svg = container.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.csv("Ex5_ARE_Spot_Prices.csv").then(data => {
      const parseYear = d3.timeParse("%Y");

      data.forEach(d => {
        const keys = Object.keys(d);
        const yearKey = keys.find(k => k.toLowerCase().includes("year") || k.toLowerCase().includes("date")) || "Year";
        const priceKey = keys.find(k => k.toLowerCase().includes("price") || k.toLowerCase().includes("val") || k.toLowerCase().includes("avg")) || "Price";

        const yrStr = d[yearKey] ? d[yearKey].toString().trim() : "";
        d.Year = parseYear(yrStr) || new Date(+yrStr, 0, 1);
        d.Price = +d[priceKey];
      });

      const validData = data.filter(d => d.Year && !isNaN(d.Price)).sort((a, b) => a.Year - b.Year);

      if (validData.length === 0) return;

      const x = d3.scaleTime()
        .domain(d3.extent(validData, d => d.Year))
        .range([0, width]);

      const y = d3.scaleLinear()
        .domain([0, d3.max(validData, d => d.Price) * 1.1])
        .range([height, 0]);

      svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(8));

      svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y));

      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Year");

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -45)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Price ($/MWh)");

      const line = d3.line()
        .x(d => x(d.Year))
        .y(d => y(d.Price))
        .curve(d3.curveMonotoneX);

      svg.append("path")
        .datum(validData)
        .attr("fill", "none")
        .attr("stroke", "#e91e63")
        .attr("stroke-width", 2.5)
        .attr("d", line);

    }).catch(err => console.error("Error loading Line Chart data:", err));
  }

  render();
  window.addEventListener("resize", render);
})();