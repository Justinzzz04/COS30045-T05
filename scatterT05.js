(function() {
  const container = d3.select("#scatter-chart");
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

    d3.csv("Ex5_TV_energy.csv").then(data => {
      data.forEach(d => {
        const keys = Object.keys(d);
        const starKey = keys.find(k => k.toLowerCase().includes("star")) || "Star_Rating";
        const energyKey = keys.find(k => k.toLowerCase().includes("energy") || k.toLowerCase().includes("kwh")) || "Energy_Consumption";

        d.Star = +d[starKey];
        d.Energy = +d[energyKey];
      });

      const validData = data.filter(d => !isNaN(d.Star) && !isNaN(d.Energy));
      if (validData.length === 0) return;

      const x = d3.scaleLinear()
        .domain([d3.min(validData, d => d.Star) - 0.5, d3.max(validData, d => d.Star) + 0.5])
        .range([0, width]);

      const y = d3.scaleLinear()
        .domain([0, d3.max(validData, d => d.Energy) * 1.1])
        .range([height, 0]);

      // Subtle Background Grid
      svg.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y).tickSize(-width).tickFormat(""));

      // Axes
      svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

      svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y));

      // Labels
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .attr("class", "chart-label")
        .text("Star Rating");

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -45)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .attr("class", "chart-label")
        .text("Energy Consumption (kWh/year)");

      // Scatter Points
      svg.selectAll("circle")
        .data(validData)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.Star))
        .attr("cy", d => y(d.Energy))
        .attr("r", 5)
        .attr("fill", "#2563eb")
        .attr("opacity", 0.6)
        .attr("stroke", "#1d4ed8")
        .attr("stroke-width", 1)
        .on("mouseover", (event, d) => {
          tooltip.style("opacity", 1)
            .html(`<strong>Star Rating:</strong> ${d.Star}<br><strong>Energy:</strong> ${d.Energy} kWh/year`);
        })
        .on("mousemove", (event) => {
          tooltip.style("left", (event.pageX + 12) + "px")
                 .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
          tooltip.style("opacity", 0);
        });

    }).catch(err => console.error("Error loading Scatter Plot CSV:", err));
  }

  render();
  window.addEventListener("resize", render);
})();
