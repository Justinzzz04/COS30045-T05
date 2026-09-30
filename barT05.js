(function() {
  const container = d3.select("#bar-chart");
  const tooltip = d3.select("#dashboard-tooltip");

  function render() {
    container.selectAll("*").remove();

    const margin = { top: 20, right: 60, bottom: 40, left: 100 };
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = 320 - margin.top - margin.bottom;

    const svg = container.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.csv("Ex5_TV_energy_55inchtv_byScreenType.csv").then(data => {
      data.forEach(d => {
        const keys = Object.keys(d);
        const techKey = keys.find(k => k.toLowerCase().includes("tech") || k.toLowerCase().includes("type") || k.toLowerCase().includes("screen")) || keys[0];
        const energyKey = keys.find(k => k.toLowerCase().includes("energy") || k.toLowerCase().includes("mean") || k.toLowerCase().includes("kwh")) || keys[1];

        d.Tech = d[techKey];
        d.Energy = +d[energyKey];
      });

      // Sort descending for visual hierarchy
      const validData = data.filter(d => d.Tech && !isNaN(d.Energy))
        .sort((a, b) => b.Energy - a.Energy);

      if (validData.length === 0) return;

      const y = d3.scaleBand()
        .domain(validData.map(d => d.Tech))
        .range([0, height])
        .padding(0.25);

      const x = d3.scaleLinear()
        .domain([0, d3.max(validData, d => d.Energy) * 1.15])
        .range([0, width]);

      // Subtle Vertical Grid
      svg.append("g")
        .attr("class", "grid")
        .call(d3.axisBottom(x).tickSize(height).tickFormat(""));

      // Axes
      svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(5));

      svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y));

      // X-Axis Title
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 35)
        .attr("text-anchor", "middle")
        .attr("class", "chart-label")
        .text("Mean Energy Consumption (kWh/year)");

      // Horizontal Bars
      svg.selectAll(".bar")
        .data(validData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", d => y(d.Tech))
        .attr("x", 0)
        .attr("height", y.bandwidth())
        .attr("width", d => x(d.Energy))
        .attr("fill", "#059669")
        .attr("rx", 4)
        .on("mouseover", (event, d) => {
          tooltip.style("opacity", 1)
            .html(`<strong>${d.Tech}:</strong> ${d.Energy.toFixed(1)} kWh/year`);
        })
        .on("mousemove", (event) => {
          tooltip.style("left", (event.pageX + 12) + "px")
                 .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
          tooltip.style("opacity", 0);
        });

      // Direct Value Labels on Bars
      svg.selectAll(".value-label")
        .data(validData)
        .enter()
        .append("text")
        .attr("class", "value-label")
        .attr("x", d => x(d.Energy) + 6)
        .attr("y", d => y(d.Tech) + y.bandwidth() / 2 + 4)
        .attr("font-size", "11px")
        .attr("fill", "#334155")
        .attr("font-weight", "500")
        .text(d => d.Energy.toFixed(1));

    }).catch(err => console.error("Error loading Bar Chart data:", err));
  }

  render();
  window.addEventListener("resize", render);
})();
