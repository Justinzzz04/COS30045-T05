(function() {
  const container = d3.select("#donut-chart");
  const tooltip = d3.select("#dashboard-tooltip");

  function render() {
    container.selectAll("*").remove();

    const margin = { top: 20, right: 120, bottom: 20, left: 20 };
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = 320 - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2 - 10;

    const svg = container.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${width / 2 + margin.left},${height / 2 + margin.top})`);

    d3.csv("Ex5_TV_energy_Allsizes_byScreenType.csv").then(data => {
      data.forEach(d => {
        const keys = Object.keys(d);
        const techKey = keys.find(k => k.toLowerCase().includes("tech") || k.toLowerCase().includes("type") || k.toLowerCase().includes("screen")) || keys[0];
        const valueKey = keys.find(k => k.toLowerCase().includes("total") || k.toLowerCase().includes("energy") || k.toLowerCase().includes("value") || k.toLowerCase().includes("kwh")) || keys[1];

        d.Tech = d[techKey];
        d.Value = +d[valueKey];
      });

      const validData = data.filter(d => d.Tech && !isNaN(d.Value));
      if (validData.length === 0) return;

      const totalValue = d3.sum(validData, d => d.Value);

      // Accessible, Colorblind-Friendly Palette
      const color = d3.scaleOrdinal()
        .domain(validData.map(d => d.Tech))
        .range(["#2563eb", "#0d9488", "#d97706", "#7c3aed", "#e11d48"]);

      const pie = d3.pie()
        .value(d => d.Value)
        .sort(null);

      const arc = d3.arc()
        .innerRadius(radius * 0.55)
        .outerRadius(radius * 0.85);

      const arcs = svg.selectAll(".arc")
        .data(pie(validData))
        .enter()
        .append("g")
        .attr("class", "arc");

      arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.Tech))
        .attr("stroke", "#ffffff")
        .style("stroke-width", "2px")
        .on("mouseover", (event, d) => {
          const pct = ((d.data.Value / totalValue) * 100).toFixed(1);
          tooltip.style("opacity", 1)
            .html(`<strong>${d.data.Tech}:</strong> ${d.data.Value.toLocaleString()} (${pct}%)`);
        })
        .on("mousemove", (event) => {
          tooltip.style("left", (event.pageX + 12) + "px")
                 .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
          tooltip.style("opacity", 0);
        });

      // Center Overlay Metric
      svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-0.2em")
        .attr("font-size", "12px")
        .attr("fill", "#64748b")
        .text("Total Energy");

      svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "1.1em")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("fill", "#0f172a")
        .text(`${Math.round(totalValue).toLocaleString()} kWh`);

      // Side Legend
      const legend = svg.append("g")
        .attr("transform", `translate(${radius + 25}, ${-radius / 2})`);

      validData.forEach((d, i) => {
        const pct = ((d.Value / totalValue) * 100).toFixed(1);
        const legendRow = legend.append("g")
          .attr("transform", `translate(0, ${i * 22})`);

        legendRow.append("rect")
          .attr("width", 12)
          .attr("height", 12)
          .attr("rx", 3)
          .attr("fill", color(d.Tech));

        legendRow.append("text")
          .attr("x", 18)
          .attr("y", 10)
          .attr("font-size", "11px")
          .attr("fill", "#334155")
          .text(`${d.Tech} (${pct}%)`);
      });

    }).catch(err => console.error("Error loading Donut Chart data:", err));
  }

  render();
  window.addEventListener("resize", render);
})();
