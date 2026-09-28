(function() {
  const container = d3.select("#donut-chart");

  function render() {
    container.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
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

      const color = d3.scaleOrdinal()
        .domain(validData.map(d => d.Tech))
        .range(d3.schemeCategory10);

      const pie = d3.pie()
        .value(d => d.Value)
        .sort(null);

      const arc = d3.arc()
        .innerRadius(radius * 0.5)
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
        .style("stroke-width", "2px");

      arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .style("fill", "#ffffff")
        .style("font-weight", "bold")
        .text(d => d.data.Tech);

    }).catch(err => console.error("Error loading Donut Chart data:", err));
  }

  render();
  window.addEventListener("resize", render);
})();