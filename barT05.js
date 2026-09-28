(function() {
  const container = d3.select("#bar-chart");

  function render() {
    container.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
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

      const validData = data.filter(d => d.Tech && !isNaN(d.Energy));

      if (validData.length === 0) return;

      const x = d3.scaleBand()
        .domain(validData.map(d => d.Tech))
        .range([0, width])
        .padding(0.3);

      const y = d3.scaleLinear()
        .domain([0, d3.max(validData, d => d.Energy) * 1.15])
        .range([height, 0]);

      svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

      svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y));

      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 45)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Screen Technology");

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -45)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Mean Energy (kWh/year)");

      svg.selectAll(".bar")
        .data(validData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.Tech))
        .attr("y", d => y(d.Energy))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.Energy))
        .attr("fill", "#66bb6a")
        .attr("rx", 4);

    }).catch(err => console.error("Error loading Bar Chart data:", err));
  }

  render();
  window.addEventListener("resize", render);
})();