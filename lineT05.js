(function() {
  const container = d3.select("#line-chart");
  const tooltip = d3.select("#dashboard-tooltip");

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

      // Subtle Grid Lines
      svg.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y).tickSize(-width).tickFormat(""));

      // Axes
      svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(8));

      svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y));

      // Axis Labels
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .attr("class", "chart-label")
        .text("Year");

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -45)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .attr("class", "chart-label")
        .text("Spot Price ($/MWh)");

      const line = d3.line()
        .x(d => x(d.Year))
        .y(d => y(d.Price))
        .curve(d3.curveMonotoneX);

      // Line Path
      svg.append("path")
        .datum(validData)
        .attr("fill", "none")
        .attr("stroke", "#0284c7")
        .attr("stroke-width", 2.5)
        .attr("d", line);

      // Focus Circle Overlay for Tooltips
      const focus = svg.append("circle")
        .attr("r", 5)
        .attr("fill", "#0284c7")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 2)
        .style("opacity", 0);

      // Transparent Overlay for Tracking Hover
      const bisectDate = d3.bisector(d => d.Year).left;

      svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("mouseover", () => focus.style("opacity", 1))
        .on("mouseout", () => {
          focus.style("opacity", 0);
          tooltip.style("opacity", 0);
        })
        .on("mousemove", (event) => {
          const x0 = x.invert(d3.pointer(event)[0]);
          const i = bisectDate(validData, x0, 1);
          const d0 = validData[i - 1];
          const d1 = validData[i];
          const d = (d1 && (x0 - d0.Year > d1.Year - x0)) ? d1 : d0;

          if (d) {
            focus.attr("cx", x(d.Year)).attr("cy", y(d.Price));
            tooltip.style("opacity", 1)
              .html(`<strong>Year:</strong> ${d.Year.getFullYear()}<br><strong>Price:</strong> $${d.Price.toFixed(2)}/MWh`)
              .style("left", (event.pageX + 12) + "px")
              .style("top", (event.pageY - 28) + "px");
          }
        });

    }).catch(err => console.error("Error loading Line Chart data:", err));
  }

  render();
  window.addEventListener("resize", render);
})();
