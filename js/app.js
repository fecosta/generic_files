const worldmapUrl = 'https://fecosta.github.io/generic_files/data/world.geojson';
const finalDataUrl = 'https://fecosta.github.io/generic_files/data/processed/final.csv';
const finalTableDataUrl = 'https://fecosta.github.io/generic_files/data/processed/final_table.csv';

const COLUMNS = {
  Name: 'name',
  ISO: 'iso',
  Year: 'y',
  Country: 'c',
  Circumstances: 'Circumstances',
  Latest: 'latest',
  Variable: 'var',
  Region: 'Region',
  Approach1: 'Approach1',
  Value: 'Value',
  Measure: 'Measure',
  Approach: 'Approach',
  Perspective: 'Perspective'
};

const ALL_CIRCUMSTANCES = 'all';
const MEASURE_GINI = 'Gini';
const PERSPECTIVE_EX_POST_TREE = 'Ex-Post Tree';
const APPROACH_RELATIVE = 'Relative';
const VARIABLE_CONSUMPTION = 'Consumption';

let worldData;
let tableData;

const measureDropdown = $('#measure');
const perspectiveDropdown = $('#perspective');
const approachDropdown = $('#approach');
const variableDropdown = $('#variable');
const yearDropdown = $('#variable');
const regionDropdown = $('#region');

measureDropdown.on('change', updateVisualization);
perspectiveDropdown.on('change', updateVisualization);
approachDropdown.on('change', updateVisualization);
variableDropdown.on('change', updateVisualization);
yearDropdown.on('change', updateTable);
regionDropdown.on('change', updateTable);

function loadCsvData() {
  Promise.all([d3.csv(finalDataUrl), d3.csv(finalTableDataUrl)])
    .then(function (data) {
      worldData = data[0]; // final.csv data
      tableData = data[1]; // final_table.csv data
      console.log('loaded data:', worldData.length, worldData);
      console.log('loaded table data:', tableData.length, tableData);
      updateVisualization();
    })
    .catch((err) => {
      console.log('Error loading CSV data:', err);
    })
    .finally(() => {
      console.log('Done reading data');
    });
}

$(document).ready(function() {
  loadCsvData(); 
});

$('#world-view').on('click', function () {
  $(this).addClass('active');
  $('#table-view').removeClass('active');
  updateVisualization();
  toggleFilters('world-view');
});

$('#table-view').on('click', function () {
  $(this).addClass('active');
  $('#world-view').removeClass('active');
  updateTable();
  toggleFilters('table-view');
});

function toggleFilters(visualizationMode) {
  if (visualizationMode === 'world-view') {
    $('#world-view-filters').show();
    $('#chart-container').show();
    $('#table-view-filters').hide();
    $('#table-container').hide();
  } else if (visualizationMode === 'table-view') {
    $('#world-view-filters').hide();
    $('#chart-container').hide();
    $('#table-view-filters').show();
    $('#table-container').show();
  }
}

function updateVisualization() {
  const measure = measureDropdown.val();
  const perspective = perspectiveDropdown.val();
  const approach = approachDropdown.val();
  const variable = variableDropdown.val();

  console.log('Measure:', measure);
  console.log('Perspective:', perspective);
  console.log('Approach:', approach);
  console.log('Variable:', variable);

  updateChoropleth(measure, perspective, approach, variable);
}

function updateTable() {
  const measure = measureDropdown.val();
  const approach = approachDropdown.val();
  const year = yearDropdown.val();
  const region = regionDropdown.val();

  const filteredData = filterTableData(tableData, measure, approach, year, region);
  console.log('updated tableData:', filteredData.length, filteredData);

  $('#table-container').empty();

  const table = $('<table>').addClass('table');

  const thead = $('<thead>').appendTo(table);
  const headerRow = $('<tr>').appendTo(thead);
  $('<th>').text('Name').appendTo(headerRow);
  $('<th>').text('Year').appendTo(headerRow);
  $('<th>').text('Total Inequality').appendTo(headerRow);
  $('<th>').text('IOp Ex-Ante RF').appendTo(headerRow);
  $('<th>').text('IOp Ex-Post').appendTo(headerRow);

  const tbody = $('<tbody>').appendTo(table);

  filteredData.forEach(row => {
    const dataRow = $('<tr>').appendTo(tbody);
    $('<td>').text(row.Name).appendTo(dataRow);
    $('<td>').text(row.Year).appendTo(dataRow);
    $('<td>').text(row['Total Inequality']).appendTo(dataRow);
    $('<td>').text(row['IOp Ex-Ante RF']).appendTo(dataRow);
    $('<td>').text(row['IOp Ex-Post']).appendTo(dataRow);
  });

  $('#table-container').append(table);
}

const width = 800;
const height = 600;

const svg = d3.select('#chart')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

function calculateTickValues(domainMin, domainMax, numTicks) {
  const tickValues = [];
  const min = parseFloat(domainMin);
  const max = parseFloat(domainMax);
  const step = (max - min) / (numTicks - 1);
  console.log('step:', step);
  for (let i = 0; i < numTicks; i++) {
    tickValues.push(min + step * i);
  }
  return tickValues;
}

function updateColorBarTicks(color, domainMin, domainMax) {
  console.log('updateColorBarTicks:', domainMin, domainMax);
  const numTicks = 10;
  const tickValues = calculateTickValues(domainMin, domainMax, numTicks);

  console.log('tickValues:', tickValues);

  const colorBarTicks = d3.select('#color-bar-ticks');

  colorBarTicks.selectAll('.color-bar-tick').remove();

  colorBarTicks.selectAll('.color-bar-tick')
    .data(tickValues)
    .enter()
    .append('div')
    .attr('class', 'color-bar-tick')
    .style('background-color', d => {
      return color(d);
    })
    .text(d => d.toFixed(2));
}

function filterWorldData(data, measure, perspective, approach, variable) {
  // Assume Gini, Ex-Post (Tree), Relative, Consumption
  // df_map = df[df['Circumstances'] == 'all'].copy()
  // df_map = df_map[df_map['latest'] == 1].copy()
  // df_map = df_map[df_map['Perspective'] == 'Ex-Post Tree'].copy()
  // df_map = df_map[df_map['Measure'] == 'Gini'].copy()
  // df_map = df_map[df_map['Approach'] == 'Relative'].copy()
  // df_map = df_map[df_map['var'] == 'Consumption'].copy()
  return data.filter(row =>
    row[COLUMNS.Circumstances] === ALL_CIRCUMSTANCES &&
    parseInt(row[COLUMNS.Latest]) === 1 &&
    row[COLUMNS.Perspective] === perspective &&
    row[COLUMNS.Measure] === measure &&
    row[COLUMNS.Approach] === approach &&
    row[COLUMNS.Variable] === variable
  );
}

  function filterTableData(data, measure, approach, year, regions) {
    let filteredData = data.filter(row =>
      row[COLUMNS.Measure] === measure &&
      row[COLUMNS.Approach] === approach &&
      (year === 'Latest' ? row.Latest === 1 : true) &&
      regions.includes(row.Region)
    );

    return filteredData;
  }

function updateChoropleth(measure, perspective, approach, variable) {
  console.log('updateChoropleth:', measure, perspective, approach, variable);

  if (!worldData) return;

  const mapData = filterWorldData(worldData, measure, perspective, approach, variable);
  console.log('updated mapData:', mapData.length, mapData);

  svg.selectAll('path').remove();

  d3.json(worldmapUrl) // only needed for world map
    .then(function (geojson) {
      geojson.features = geojson.features.filter(feature => feature.properties.name !== 'Antarctica');

      const projection = d3.geoMercator()
        .fitSize([width, height], geojson)

      const path = d3.geoPath()
        .projection(projection);

      const domainMin = d3.min(mapData, datum => datum.Value);
      const domainMax = d3.max(mapData, datum => datum.Value);
      console.log('domain:', domainMin, domainMax);
      const color = d3.scaleSequential()
        .domain([domainMin, domainMax])
        .interpolator(d3.interpolate('#a62bff', '#ffff00'));

      console.warn('domain colors:', color(domainMin), color(domainMax));

      const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

      updateColorBarTicks(color, domainMin, domainMax);

      svg.selectAll('path')
        .data(geojson.features)
        .enter()
        .append('path')
        .attr('d', path)
        .style('fill', datum => {
          // console.log(d);
          const country = mapData.find(country => country.iso === datum.id);
          let fillColor = '#ddd';
          if (country) {
            fillColor = color(country.Value);
            // console.log(fillColor);
          }
          return fillColor;
        })
        .style('stroke-width', '1')
        .style('stroke', '#fff')
        .on('mouseover', (event, datum) => { // (datum, index) = (d, i) is deprecated
          // console.log('mouseover:', event, datum);
          const country = mapData.find(country => country.iso === datum.id);
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
          // console.log('mouseout:', event, datum);
          tooltip.transition()
            .duration(400)
            .style('opacity', 0);
        });
    })
    .catch(function (err) {
      console.log('error loading geojson:', err);
    })
    .finally(() => {
      console.log('done loading geojson');
    });
}
