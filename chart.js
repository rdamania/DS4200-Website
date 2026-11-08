// D3 bar chart: S&P 500 total return by year, colored by the president's party
// IMPORTANT: "sp500_by_party.csv" has NO leading slash.
// A leading slash looks in the root of github.io and gives a 404 on GitHub Pages
// (the bug from the 11/2 lecture).

d3.csv("sp500_by_party.csv").then(function (data) {

  // CSV values come in as text, so convert the return column to numbers
  data.forEach(function (d) {
    d.return = +d.return;
  });

  // 1. Chart size and margins
  const margin = { top: 20, right: 20, bottom: 40, left: 55 };
  const width = 670 - margin.left - margin.right;
  const height = 380 - margin.top - margin.bottom;

  // 2. Create the SVG with a fixed width and height
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // 3. Scales: band scale for years (x), linear scale for returns (y)
  const x = d3.scaleBand()
    .domain(data.map(d => d.year))
    .range([0, width])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([d3.min(data, d => d.return) - 5, d3.max(data, d => d.return) + 5])
    .range([height, 0]);   // SVG y starts at the TOP, so we flip it

  // 4. Axes (only label every 4th year so the labels don't overlap)
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickValues(x.domain().filter((d, i) => i % 4 === 0)));

  svg.append("g")
    .call(d3.axisLeft(y).tickFormat(d => d + "%"));

  // 5. A line at 0% so gains and losses are easy to see
  svg.append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", y(0))
    .attr("y2", y(0))
    .attr("class", "zero-line");

  // 6. Bars: blue for Democratic presidents, red for Republican presidents
  svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", d => d.party === "Democratic" ? "bar bar-dem" : "bar bar-rep")
    .attr("x", d => x(d.year))
    .attr("width", x.bandwidth())
    .attr("y", d => y(Math.max(0, d.return)))
    .attr("height", d => Math.abs(y(d.return) - y(0)))
    .append("title")                       // simple hover tooltip
    .text(d => `${d.year} (${d.president}): ${d.return}%`);

}).catch(function (error) {
  // If the CSV doesn't load, show a message instead of a blank space
  d3.select("#chart").append("p").text("The chart data didn’t load. Check that sp500_by_party.csv is in the same folder as markets.html.");
  console.error(error);
});
