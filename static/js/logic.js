const url = "https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json";

// Fetch the JSON data and console log it
d3.json(url).then(function(data) {
  console.log(data);  
  
  // Use D3 to select the dropdown menu
  let samples = data.names;
  let dropdown = d3.select("#sample-select");

  // Populate the dropdown menu with sample names
  samples.forEach(function(name) {
    dropdown.append("option")
            .text(name)
            .property("value", name);
  });

  // Create bar chart
  function createBarChart(sample) {
    // Find the sample data
    const sampleData = data.samples.filter(s => s.id === sample)[0];
    
    const top10 = sampleData.sample_values
      .map((value, index) => ({
        otu_id: sampleData.otu_ids[index],
        otu_label: sampleData.otu_labels[index],
        sample_value: value
      }))
      .sort((a, b) => b.sample_value - a.sample_value)
      .slice(0, 10);

    // Create a horizontal bar chart using D3
    const margin = { top: 20, right: 30, bottom: 40, left: 90 };
    const width = 500 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#bar-chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3.scaleLinear()
      .domain([0, d3.max(top10, d => d.sample_value)])
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(top10.map(d => d.otu_id))
      .range([0, height])
      .padding(0.1);

    svg.selectAll(".bar")
      .data(top10)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", d => y(d.otu_id))
      .attr("width", d => x(d.sample_value))
      .attr("height", y.bandwidth())
      .on("mouseover", function(event, d) {
        d3.select(this).style("fill", "orange");
      })
      .on("mouseout", function(event, d) {
        d3.select(this).style("fill", "steelblue");
      });

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    svg.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(y));
  }

  // Create bubble chart
  function createBubbleChart(sample) {
    const sampleData = data.samples.filter(s => s.id === sample)[0];
    
    const trace = {
      x: sampleData.otu_ids,
      y: sampleData.sample_values,
      mode: "markers",
      marker: {
        size: sampleData.sample_values,
        color: sampleData.otu_ids,
        colorscale: "Viridis"
      },
      text: sampleData.otu_labels
    };
    
    const layout = {
      showlegend: false,
      height: 500,
      xaxis: { title: "OTU ID" },
      yaxis: { title: "Sample Values" }
    };
    
    Plotly.newPlot("#bubble-chart", [trace], layout);
  }

  // Loop through the metadata and display each key-value pair
  function displayMetadata(sample) {
    const metadata = data.metadata.filter(m => m.id === sample)[0];
    const panel = d3.select("#sample-metadata");
    
    panel.html("");  // Clear previous metadata
    
    Object.entries(metadata).forEach(([key, value]) => {
      panel.append("p").text(`${key}: ${value}`);
    });
  }

  // Update all plots
  function updateDashboard(sample) {
    createBarChart(sample);
    createBubbleChart(sample);
    displayMetadata(sample);
  }

  // Putting it all together
  const initialSample = data.names[0];  // Default to the first sample
  updateDashboard(initialSample);
});
