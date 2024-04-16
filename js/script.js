// Data source
const filteredDataUrl = 'data/processed/filtered-final.csv';
// const filteredDataUrl = 'https://raw.githubusercontent.com/fecosta/generic_files/main/data/processed/filtered-final.csv';
// Graph setup
const width = 800;
const height = 600;

const svg = d3.select('#chart')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

// Load pre-processed data
// TODO: promise all csv and geojson calling
d3.csv(filteredDataUrl)
  .then(function (data) {
    d3.json(worldmapUrl)
      .then(function (geojson) {
        // Remove Antarctica based on website
        geojson.features = geojson.features.filter(feature => feature.properties.name !== 'Antarctica');

        // spherical Mercator projection
        // https://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object
        const projection = d3.geoMercator()
          .fitSize([width, height], geojson)

        const path = d3.geoPath()
          .projection(projection);

        // https://d3js.org/d3-scale/sequential
        // const color = d3.scaleSequential(d3.interpolateBlues); // domains defaults to [0, 1]
        const domainMin = d3.min(data, datum => datum.Value);
        const domainMax = d3.max(data, datum => datum.Value);
        console.log('domain:', domainMin, domainMax);
        const color = d3.scaleSequential()
          .domain([domainMin, domainMax])
          .interpolator(d3.interpolate('#a62bff', '#f3ff00'));
        console.log('domain colors:', color(domainMin), color(domainMax));

        const tooltip = d3.select('body')
          .append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0);

        svg.selectAll('path')
          .data(geojson.features)
          .enter()
          .append('path')
          .attr('d', path)
          .style('fill', datum => {
            const country = data.find(country => country.iso === datum.id);
            let fillColor = '#ddd';
            if (country) {
              fillColor = color(country.Value);
            }
            return fillColor;
          })
          .style('stroke-width', '1')
          .style('stroke', '#555')
          .on('mouseover', (event, datum) => { // (datum, index) = (d, i) is deprecated
            const country = data.find(country => country.iso === datum.id);
            if (country) {
              const { name, Value } = country;
              const value = parseFloat(Value).toFixed(2);
              const tooltipContent = `<strong>${name}</strong><br>value=${value}`;
              tooltip.transition()
                .duration(300)
                .style('opacity', 1);
              tooltip.html(tooltipContent)
                .style('left', `${event.pageX}px`)
                .style('top', `${event.pageY}px`);
            }
          })
          .on('mouseout', (_event, _datum) => { // (datum, index) = (d, i) is deprecated
            tooltip.transition()
              .duration(400)
              .style('opacity', 0);
          });

        const colorBarTicks = d3.select('#color-bar-ticks');

        const ticks = color.ticks(10);

        colorBarTicks.selectAll('.color-bar-tick')
          .data(ticks)
          .enter()
          .append('div')
          .attr('class', 'color-bar-tick')
          .style('background-color', d => color(d))
          .text(d => d);
      })
      .catch(function (err) {
        console.log('error loading geojson:', err);
      })
      .finally(() => {
        console.log('done loading geojson');
      });
  })
  .catch(function (err) {
    console.log('error loading data:', err);
  })
  .finally(() => {
    console.log('Done reading data');
  });
