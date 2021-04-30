// Base Data URL
const baseDataURL = window.location.pathname

// --- Data Store ---

// map data
let mapData
let mapJSON
let mapLayer
const maplayers = {
  district: { type: 'FeatureCollection', features: [] },
  province: { type: 'FeatureCollection', features: [] },
  national: { type: 'FeatureCollection', features: [] }
}
const mapLayerGroup = L.layerGroup([])
// enablers data
let enablersNational
let enablersProvince
let enablersDistricts
let allProvinces
let allDistricts

// Global function
jQuery(document).ready(async function () {
  $('[data-toggle="tooltip"]').tooltip()

  // Set tab click event listeners
  const tabBtns = Object.values($('ul.navbar-nav').children('li').children('a'))
  for (let i = 0; i < tabBtns.length; i += 1) {
    if (tabBtns[i].innerText) {
      text = tabBtns[i].innerText.trim().toLowerCase()

      switch (text) {
      case 'intro': tabBtns[i].addEventListener('click', () => click_tab('intro')); break
      case 'site selection': tabBtns[i].addEventListener('click', () => click_tab('site')); break
      case 'cropping system': tabBtns[i].addEventListener('click', () => click_tab('cropping')); break
      case 'climate': tabBtns[i].addEventListener('click', () => click_tab('climate')); break
      case 'climate risk': tabBtns[i].addEventListener('click', () => click_tab('risk')); break
      case 'climate impacts': tabBtns[i].addEventListener('click', () => click_tab('impacts')); break
      case 'practices': tabBtns[i].addEventListener('click', () => click_tab('practices')); break
      case 'enablers': tabBtns[i].addEventListener('click', () => click_tab('enablers')); break
      default: break
      }
    }
  }

  $('#climate_tab a').on('click', function (e) {
    e.preventDefault()
    $(this).tab('show')
  })

  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    climate_load()
  })

  // Set Site selection tab aggregation btn listeners
  $('#site_district').click(function (e) {
    siteMapAgg = 'district'
    selectSiteLevel()
  })

  $('#site_province').click(function (e) {
    siteMapAgg = 'province'
    selectSiteLevel()
  })

  $('#site_national').click(function (e) {
    siteMapAgg = 'national'
    selectSiteLevel()
  })
})

// Parameters
let tab = 'intro'
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
let color_indicator
let province = ''
let district = ''
let coords
let type_agg = ''
// Datasets
let hazard_d = []
let practices_d = []
let climate_indicator_d = []
let climate_indicator_province = ''
let climate_indicator_district = ''
const climate_indicator_var = ''
let climate_indicator_coords = []
let crop_c_full = []
let hazard_c_full = []
tab = ''
// Controls
let map_i
let map
let siteMapAgg = 'district'

/**
 * This function change the type of information and functionalities of the web page depending of the value
 */
async function click_tab (tab_selected) {
  tab = tab_selected
  $('.tab_layout').addClass('d-none')
  $('#general').removeClass('d-none')

  if (tab === 'intro') {
    $('#title').html('Intro')
    $('#description').html('')
    $('.tab_layout').addClass('d-none')
    $('#general').addClass('d-none')
    $('#intro').removeClass('d-none')
  } else if (tab === 'site') {
    $('#title').html('Site selection')
    $('#description').html('Please use the below map to select the region (National, Province, District) you would like to focus on. You can also see in the project site tab a list of all districts and villages included in the study.')
    $('#site').removeClass('d-none')
    site_fill()
  } else if (tab === 'cropping') {
    $('#title').html('Cropping system')
    $('#description').html('In this tab you will find cropping and livestock data for each of the districts included in the study, based on the most recent provincial crop reporting data. Then for each of the villages in the province for which a CSV plan was prepared, you will find the cropping and hazard calendar constructed through village level consultations.')
    $('#cropping').removeClass('d-none')
    d3.csv(`${baseDataURL}data/cropping/production.csv`, function (error, data) {
      if (error) { console.log(error) }
      const c_production = data.filter(function (item) { return item.district === district })
      d3.csv(`${baseDataURL}data/cropping/cropping_calendar.csv`, function (error, data2) {
        if (error) { console.log(error) }
        crop_c_full = data2.filter(function (item) { return item.district === district })
        d3.csv(`${baseDataURL}data/cropping/hazard.csv`, function (error, data3) {
          if (error) { console.log(error) }
          hazard_c_full = data3.filter(function (item) { return item.district === district })
          cropping_fill(c_production)

          // Filling the cbo controls village
          const village = d3.map(crop_c_full, function (d) { return d.village }).keys()
          const cbo_village = $('#cbo_village')
          cbo_village.empty()
          $.each(village, function () {
            cbo_village.append($('<option />').val(this).text(this))
          })

          // Set the event change for both controls
          cbo_village.on('change', function (e) {
            const crop_c_f = crop_c_full.filter(function (item) { return item.village === cbo_village.val() })
            const hazard_c_f = hazard_c_full.filter(function (item) { return item.village === cbo_village.val() })
            cropping_calendar_hazard(crop_c_f, hazard_c_f)
          })

          const crop_c_f = crop_c_full.filter(function (item) { return item.village === cbo_village.val() })
          const hazard_c_f = hazard_c_full.filter(function (item) { return item.village === cbo_village.val() })
          cropping_calendar_hazard(crop_c_f, hazard_c_f)
        })
      })
    })
  } else if (tab === 'climate') {
    $('#title').html('Climate')
    $('#description').html('This tab presents the results of a number of modelling exercises conducted by the Alliance of Bioversity International and CIATs modelling team. This includes climatology data on monthly mean precipitation, minimum and maximum temperatures, modelling of future annual mean temperatures and precipitation using an ensemble of Global Circulation Models (GCMs), and the historic and future time series of a number of climatic indicators that impact agricultural production. For a breakdown of the modelling process please see modelling support doc through <a href="https://drive.google.com/file/d/1fXpeykS-ipEzR9NCBw1GeIXGORNMopZo/view" target="_blank">this link</a>.')
    $('#climate').removeClass('d-none')
    climate_load()
  } else if (tab === 'impacts') {
    $('#title').html('Climate impacts')
    $('#description').html('This tab presents the results of the climate impact analysis where value chain experts in each of the districts identified the impacts of certain hazards on key commodity value chains for the district. The impacts are ordered with those that were selected the most frequently at the top. It is possible to further filter the impacts looking at specific hazards of commodity value chains.')
    $('#impacts').removeClass('d-none')
    d3.csv(`${baseDataURL}data/impacts/impacts.csv`, function (error, data) {
      if (error) { console.log(error) }
      hazard_d = data.filter(function (item) { return item.district === district })
      // Filling the cbo controls with hazard and crops
      const crops_livestock = d3.map(hazard_d, function (d) { return d.crop_livestock }).keys()
      const cbo_impact_crop = $('#cbo_impact_crop')
      cbo_impact_crop.empty()
      $.each(crops_livestock, function () {
        cbo_impact_crop.append($('<option />').val(this).text(this))
      })
      cbo_impact_crop.append($('<option />').val('All').text('All'))
      cbo_impact_crop.val('All')

      const hazard = d3.map(hazard_d, function (d) { return d.hazard }).keys()
      const cbo_impact_hazard = $('#cbo_impact_hazard')
      cbo_impact_hazard.empty()
      $.each(hazard, function () {
        cbo_impact_hazard.append($('<option />').val(this).text(this))
      })
      cbo_impact_hazard.append($('<option />').val('All').text('All'))
      cbo_impact_hazard.val('All')

      // Set the event change for both controls
      cbo_impact_crop.on('change', function (e) {
        impact_fill_table(cbo_impact_crop.val(), cbo_impact_hazard.val())
      })
      cbo_impact_hazard.on('change', function (e) {
        impact_fill_table(cbo_impact_crop.val(), cbo_impact_hazard.val())
      })

      // Default fill
      impact_fill_table(cbo_impact_crop.val(), cbo_impact_hazard.val())
    })
  } else if (tab === 'risk') {
    $('#title').html('Climate risk')
    $('#description').html('This tab presents a risk matrix generated through responses from agricultural experts in the districts on the frequency and severity of major hazards.')
    $('#risk').removeClass('d-none')
    d3.csv(`${baseDataURL}data/risk/risk.csv`, function (error, data) {
      if (error) { console.log(error) }
      const risk_d = data.filter(function (item) { return item.district === district })
      risk_fill(risk_d)
    })
  } else if (tab === 'practices') {
    $('#title').html('Practices')
    $('#description').html('This tab presents the types of CSA practices prioritised by experts in the district, along with the areas were they have an impact, the hazards they address, and the barriers to adoption. the practices can be filtered by the commodity they look at, the areas where they have an impact or the types of hazards they address, allowing decision makers to identify practices that address certain priority issues.')
    $('#practices').removeClass('d-none')
    d3.csv(`${baseDataURL}data/practices/practices.csv`, function (error, data) {
      if (error) { console.log(error) }
      practices_d = data.filter(function (item) { return item.district === district })

      // Filling the cbo controls with hazard and crops
      const crop = Array.from(new Set(d3.map(practices_d, function (d) { return d.crop }).keys()))
      const cbo_practices_crop = $('#cbo_practices_crop')
      cbo_practices_crop.empty()
      crop.forEach(function (i, v) {
        cbo_practices_crop.append($('<option />').val(i).text(i))
      })
      cbo_practices_crop.append($('<option />').val('All').text('All'))
      cbo_practices_crop.val('All')

      const hazard = Array.from(new Set(d3.map(practices_d, function (d) { return d.hazard }).keys()))
      const cbo_practices_hazard = $('#cbo_practices_hazard')
      cbo_practices_hazard.empty()
      hazard.forEach(function (i, v) {
        cbo_practices_hazard.append($('<option />').val(i).text(i))
      })
      cbo_practices_hazard.append($('<option />').val('All').text('All'))
      cbo_practices_hazard.val('All')

      // Set the event change for both controls
      cbo_practices_crop.on('change', function (e) {
        practices_fill(cbo_practices_crop.val(), cbo_practices_hazard.val())
      })
      cbo_practices_hazard.on('change', function (e) {
        practices_fill(cbo_practices_crop.val(), cbo_practices_hazard.val())
      })

      // Default fill
      practices_fill(cbo_practices_crop.val(), cbo_practices_hazard.val())
    })
  } else if (tab === 'enablers') {
    $('#title').html('Enablers')
    $('#description').html('CSA enablers provide essential services and build core capacities, empowering individuals and agrarian communities to better manage their response to climate related pressures. This section looks at which types of enabler are prioritised in each of the districts.')
    $('#enablers').removeClass('d-none')
    enablers_load()
  }

  if (map) {
    map.off()
    map.remove()
  }

  map = L.map('map').setView([29.8724623, 66.1822339], 5)
  mapLayerGroup.addTo(map)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map)

  if (!mapData) {
    mapData = await loadMapData()
    console.log('---map data loaded!')

    // Pre-load enablers data to use its province and district names list as reference for site selection
    try {
      enablersProvince = await loadD3CSVData('/enablers/enablers_prov.csv')
    } catch (err) {
      console.log(err.message)
    }

    try {
      enablersDistricts = await loadD3CSVData('/enablers/enablers_dist.csv')
    } catch (err) {
      console.log(err.message)
    }

    try {
      enablersNational = await loadD3CSVData('/enablers/enablers_nati.csv')
    } catch (err) {
      console.log(err.message)
    }

    // Get all province and district names
    allProvinces = [...new Set(enablersDistricts.map(x => x.province))]
    allDistricts = [...new Set(enablersDistricts.map(x => x.district))]

    // Rename "Sindh" from enablers province to "Sind", which the site map uses (?)
    allProvinces[allProvinces.indexOf('Sindh')] = 'Sind'

    try {
      // Load map JSON
      const layer_url = `${baseDataURL}data/maps/pakistan_map.json`
      mapJSON = await $.getJSON(layer_url)
    } catch (err) {
      console.log(err.message)
    }
  }

  reloadMapLayer()
}

/**
 * Function which fill cropping data
 */
function cropping_fill (production) {
  // Clear chart
  $('#cropping_planted_plot svg').html('')
  $('#cropping_production_plot svg').html('')
  $('#cropping_livestock_plot svg').html('')
  // Filtering data
  const d_pl = production.filter(function (d) { return d.sector === 'Crops' }).map(function (d) { return { label: d.crop_livestock, value: parseFloat(d.value) } })
  const d_pr = production.filter(function (d) { return d.sector === 'Production' }).map(function (d) { return { label: d.crop_livestock, value: parseFloat(d.value) } })
  const d_li = production.filter(function (d) { return d.sector === 'Livestock' }).map(function (d) { return { label: d.crop_livestock, value: parseFloat(d.value) } })

  const colors_pie = ['#6e4c1f', '#9d9fa2', '#0088c6', '#8ebf3f', '#cad32b', '#f5d226', '#f68b33', '#993399', '#009933', '#cc3333', '#414042', '#2f8927', '#003580', '#19191a']
  // Production plots
  nv.addGraph(function () {
    const d_pl_chart = nv.models.pieChart()
      .x(function (d) { return d.label })
      .y(function (d) { return d.value })
      .color(colors_pie)
      .showLabels(true)

    d3.select('#cropping_planted_plot svg')
      .datum(d_pl)
      .transition().duration(1200)
      .call(d_pl_chart)

    return d_pl_chart
  })
  nv.addGraph(function () {
    const d_pr_chart = nv.models.pieChart()
      .x(function (d) { return d.label })
      .y(function (d) { return d.value })
      .color(colors_pie)
      .showLabels(true)

    d3.select('#cropping_production_plot svg')
      .datum(d_pr)
      .transition().duration(1200)
      .call(d_pr_chart)

    return d_pr_chart
  })
  nv.addGraph(function () {
    const d_li_chart = nv.models.pieChart()
      .x(function (d) { return d.label })
      .y(function (d) { return d.value })
      .color(colors_pie)
      .showLabels(true)

    d3.select('#cropping_livestock_plot svg')
      .datum(d_li)
      .transition().duration(1200)
      .call(d_li_chart)

    return d_li_chart
  })
}

/**
 * Function which fill cropping data about calendar and hazard
 */
function cropping_calendar_hazard (crop_c, hazard_c) {
  // Cropping calendar
  const crops = Array.from(new Set(crop_c.map(function (d) { return d.crop_livestock })))
  let table = ''
  $.each(crops, function (index, value) {
    table = table + '<tr>'
    table = table + '<td>' + value + '</td>'
    $.each(months, function (i, v) {
      const cell = crop_c.filter(function (d) { return d.crop_livestock === value && d.month === v })[0]
      table = table + '<td class="crop_c_' + cell.value + '" ' +
                        'data-toggle="tooltip" ' +
                        // 'data-position="bottom" '  +
                        'title="' + cell['management Practices'] + '"></td>'
      // 'data-tooltip="' + cell.practices + '"></td>';
    })
    table = table + '</tr>'
  })
  // table = table + '</table>';
  $('#cropping_calendar_table  > tbody').html(table)

  // Hazard calendar
  const hazards = Array.from(new Set(hazard_c.map(function (d) { return d.hazard })))
  table = ''
  $.each(hazards, function (index, value) {
    table = table + '<tr>'
    table = table + '<td>' + value + '</td>'
    $.each(months, function (i, v) {
      table = table + '<td class="text-center text-danger">' + hazard_c.filter(function (d) { return d.hazard === value && d.month === v })[0].value + '</td>'
    })
    table = table + '</tr>'
  })
  // table = table + '</table>';
  $('#cropping_hazard_table  > tbody').html(table)
}

/**
 * Function which loads and draws all plots for climate section
 */
function climate_load () {
  d3.csv(`${baseDataURL}data/climate/climatology.csv`, function (error, data) {
    if (error) { console.log(error) }
    const climatology = data.filter(function (item) { return item.district === district })
    d3.csv(`${baseDataURL}data/climate/gcm.csv`, function (error, data2) {
      if (error) { console.log(error) }
      const gcm = data2.filter(function (item) { return item.district === district })

      climate_fill(climatology, gcm)

      d3.csv(`${baseDataURL}data/climate/indicators.csv`, function (error, data3) {
        if (error) { console.log(error) }
        climate_indicator_d = data3.filter(function (item) { return item.district === district })

        climate_indicator_province = province
        climate_indicator_district = district
        climate_indicator_coords = coords

        // Filling the cbo controls with hazard and crops
        const indicators = d3.map(climate_indicator_d, function (d) { return d.vars }).keys()
        const cbo_climate_indicator = $('#cbo_climate_indicator')
        cbo_climate_indicator.empty()
        $.each(indicators, function () {
          cbo_climate_indicator.append($('<option />').val(this).text(this.toUpperCase()))
        })

        const season = d3.map(climate_indicator_d, function (d) { return d.season }).keys()
        const cbo_climate_season = $('#cbo_climate_season')
        cbo_climate_season.empty()
        $.each(season, function () {
          cbo_climate_season.append($('<option />').val(this).text(this))
        })

        // Set the event change for both controls
        cbo_climate_indicator.on('change', function (e) {
          climate_indicator_fill(cbo_climate_indicator.val(), cbo_climate_season.val())
        })
        cbo_climate_season.on('change', function (e) {
          climate_indicator_fill(cbo_climate_indicator.val(), cbo_climate_season.val())
        })

        // Default fill
        climate_indicator_fill(cbo_climate_indicator.val(), cbo_climate_season.val())
      })
    })
  })
}

/**
 * Function which displays the list of all provinces and villages on the site selection sub-tab
 */
function site_fill () {
  let provinces = ''
  for (let i = 0; i < allProvinces.length; i += 1) {
    let table = '<table class="table table-bordered table-sm">'
    let row = `<tr><th>${allProvinces[i]}</th></tr>`

    const districts = mapJSON.features.filter(x => x.properties.NAME_1 === allProvinces[i] && allDistricts.includes(x.properties.NAME_3)).map(x => x.properties.NAME_3)
    for (let j = 0; j < districts.length; j += 1) {
      row += `<tr><td>${districts[j]}</td></tr>`
    }

    table += `${row}</table>`
    provinces += table
  }

  $('#site_provinces').html(provinces)
}

/**
 * Function which fill climate data
 */
function climate_fill (climatology, gcm) {
  // Clear chart
  $('.climatology_plot svg').html('')
  // Climatology
  const c_p = [{
    values: climatology.map(function (item) {
      return {
        x: parseInt(item.month),
        y: parseFloat(item.prec)
      }
    }), // values - represents the array of {x,y} data points
    key: 'Precipitation', // key  - the name of the series.
    color: '#596dad' // color - optional: choose your own line color.
  }]
  const c_t = [{
    values: climatology.map(function (item) {
      return {
        x: parseInt(item.month),
        y: parseFloat(item.tmax)
      }
    }), // values - represents the array of {x,y} data points
    key: 'Maximum temperature', // key  - the name of the series.
    color: '#e34147' // color - optional: choose your own line color.
  },
  {
    values: climatology.map(function (item) {
      return {
        x: parseInt(item.month),
        y: parseFloat(item.tmin)
      }
    }), // values - represents the array of {x,y} data points
    key: 'Minimum temperature', // key  - the name of the series.
    color: '#e5d900' // color - optional: choose your own line color.
  }]

  // console.log(c_p);

  nv.addGraph(function () {
    const chart_pre = nv.models.multiBarChart()
      .stacked(true)
    // .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
      .showLegend(true) // Show the legend, allowing users to turn on/off line series.
      .staggerLabels(false)
      .showControls(false)
    // .showValues(true)
      .color(['#596dad'])

    chart_pre.xAxis // Chart x-axis settings
      .axisLabel('Months')
      .tickFormat(function (d, i) {
        return months[d - 1]
      })

    chart_pre.yAxis // Chart y-axis settings
      .axisLabel('Precipitation (mm)')
      .tickFormat(d3.format('.0f'))

    d3.select('#climate_prec_plot svg') // Select the <svg> element you want to render the chart in.
      .datum(c_p) // Populate the <svg> element with chart data...
      .transition().duration(500)
      .call(chart_pre) // Finally, render the chart!

    // Update the chart when window resizes.

    nv.utils.windowResize(function () { chart_pre.update() })
    return chart_pre
  })

  nv.addGraph(function () {
    const chart_tem = nv.models.lineChart()
      .useInteractiveGuideline(true) // We want nice looking tooltips and a guideline!
      .showLegend(true) // Show the legend, allowing users to turn on/off line series.

    chart_tem.xAxis // Chart x-axis settings
      .axisLabel('Months')
      .tickFormat(function (d, i) {
        return months[d - 1]
      })

    chart_tem.yAxis // Chart y-axis settings
      .axisLabel('Temperature (°C)')
      .tickFormat(d3.format('.0f'))

    d3.select('#climate_temp_plot svg') // Select the <svg> element you want to render the chart in.
      .datum(c_t) // Populate the <svg> element with chart data...
      .transition().duration(500)
      .call(chart_tem) // Finally, render the chart!

    // Update the chart when window resizes.
    nv.utils.windowResize(function () { chart_tem.update() })
    return chart_tem
  })

  // GCM
  const g_p = [{
    values: gcm.map(function (item) {
      return {
        x: parseInt(item.year),
        y: parseFloat(item.prec)
      }
    }), // values - represents the array of {x,y} data points
    key: 'Precipitation', // key  - the name of the series.
    color: '#596dad' // color - optional: choose your own line color.
  }]
  const g_t = [{
    values: gcm.map(function (item) {
      return {
        x: parseInt(item.year),
        y: parseFloat(item.tmean)
      }
    }), // values - represents the array of {x,y} data points
    key: 'Temperature', // key  - the name of the series.
    color: '#e34147' // color - optional: choose your own line color.
  }]

  nv.addGraph(function () {
    const gcm_pre = nv.models.lineChart()
      .useInteractiveGuideline(true) // We want nice looking tooltips and a guideline!
      .showLegend(true) // Show the legend, allowing users to turn on/off line series.

    gcm_pre.xAxis // Chart x-axis settings
      .axisLabel('Year')
    // .tickFormat(d3.format('.0f'))

    gcm_pre.yAxis // Chart y-axis settings
      .axisLabel('Precipitation (mm)')
      .tickFormat(d3.format('.0f'))

    d3.select('#gcm_prec_plot svg') // Select the <svg> element you want to render the chart in.
      .datum(g_p) // Populate the <svg> element with chart data...
      .transition().duration(500)
      .call(gcm_pre) // Finally, render the chart!

    // Update the chart when window resizes.
    nv.utils.windowResize(function () { gcm_pre.update() })
    return gcm_pre
  })
  nv.addGraph(function () {
    const gcm_tem = nv.models.lineChart()
      .useInteractiveGuideline(true) // We want nice looking tooltips and a guideline!
      .showLegend(true) // Show the legend, allowing users to turn on/off line series.

    gcm_tem.xAxis // Chart x-axis settings
      .axisLabel('Year')
    // .tickFormat(d3.format('.0f'))

    gcm_tem.yAxis // Chart y-axis settings
      .axisLabel('Temperature (°C)')
      .tickFormat(d3.format('.0f'))

    d3.select('#gcm_temp_plot svg') // Select the <svg> element you want to render the chart in.
      .datum(g_t) // Populate the <svg> element with chart data...
      .transition().duration(500)
      .call(gcm_tem) // Finally, render the chart!

    // Update the chart when window resizes.
    nv.utils.windowResize(function () { gcm_tem.update() })
    return gcm_tem
  })
}

/**
 * Function which fill the indicators for climate
 */
function climate_indicator_fill (indicator, season) {
  // Clear chart
  $('.indicator_plot svg').html('')
  $('#climate_indicator_map').html('')
  // Set global vars
  climate_indicator_let = indicator

  const i_i = climate_indicator_d.filter(function (d) { return d.season === season && d.vars === indicator })
  const i_p = [{
    values: i_i.filter(function (d) { return d.time === 'past' }).map(function (item) {
      return {
        x: parseInt(item.year),
        y: parseFloat(item.value)
      }
    }), // values - represents the array of {x,y} data points
    key: 'Past', // key  - the name of the series.
    color: '#ffbe7d' // color - optional: choose your own line color.
  },
  {
    values: i_i.filter(function (d) { return d.time === 'future' }).map(function (item) {
      return {
        x: parseInt(item.year),
        y: parseFloat(item.value)
      }
    }), // values - represents the array of {x,y} data points
    key: 'Future', // key  - the name of the series.
    color: '#4e79a7' // color - optional: choose your own line color.
  },
  {
    values: i_i.filter(function (d) { return d.time === 'future' }).map(function (item) {
      return {
        x: parseInt(item.year),
        y: parseFloat(item.CI_lower)
      }
    }), // values - represents the array of {x,y} data points
    key: 'CI lower', // key  - the name of the series.
    color: '#75a1c7' // color - optional: choose your own line color.
  },
  {
    values: i_i.filter(function (d) { return d.time === 'future' }).map(function (item) {
      return {
        x: parseInt(item.year),
        y: parseFloat(item.CI_upper)
      }
    }), // values - represents the array of {x,y} data points
    key: 'CI upper', // key  - the name of the series.
    color: '#75a1c7' // color - optional: choose your own line color.
  }]

  nv.addGraph(function () {
    const ind_p = nv.models.lineChart()
      .useInteractiveGuideline(true) // We want nice looking tooltips and a guideline!
      .showLegend(true) // Show the legend, allowing users to turn on/off line series.

    ind_p.xAxis // Chart x-axis settings
      .axisLabel('Year')
    // .tickFormat(d3.format('.0f'))

    ind_p.yAxis // Chart y-axis settings
      .axisLabel('Value')
      .tickFormat(d3.format('.0f'))

    d3.select('#climate_indicator_plot svg') // Select the <svg> element you want to render the chart in.
      .datum(i_p) // Populate the <svg> element with chart data...
      .call(ind_p) // Finally, render the chart!

    // Update the chart when window resizes.
    nv.utils.windowResize(function () { ind_p.update() })
    return ind_p
  })

  if (map_i) {
    map_i.off()
    map_i.remove()
  }
  map_i = L.map('climate_indicator_map').setView([climate_indicator_coords[1], climate_indicator_coords[0]], 7)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map_i)

  const min = d3.min(i_i, function (d) { return parseFloat(d.value) })
  const max = d3.max(i_i, function (d) { return parseFloat(d.value) })
  color_indicator = d3.scale.linear()
    .domain([min, max])
    .range([0, 1])

  const indicator_url = `${baseDataURL}data/climate/${season}_new_version.json`
  $.getJSON(indicator_url, function (data) {
    L.geoJSON(data, { filter: filter_map, onEachFeature: onEachFeature2, weight: 0.5 }).addTo(map_i)
  })

  const legend = L.control({ position: 'topright' })
  legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend')
    div.innerHTML += '<h4>Scale (' + climate_indicator_let + ')</h4>' +
                    '<div id="map_scale"><svg></svg></div>'
    return div
  }
  legend.addTo(map_i)

  const range = d3.range(min, max, (max - min) / 100)
  const svg = d3.select('#map_scale svg')
  const rects = svg.selectAll('.rects')
    .data(range)
    .enter()
    .append('rect')
    .attr('y', 10)
    .attr('height', 25)
    .attr('x', (d, i) => 10 + i)
    .attr('width', 6)
    .attr('fill', function (d) { return '' + d3.interpolateOranges(color_indicator(d)) })

  svg.append('text')
  // .attr("x", function(d) { return x(d) - 3; })
    .attr('y', 7)
    .attr('dy', '.35em')
    .text(function (d) { return min })
  svg.append('text')
    .attr('x', 110)
    .attr('y', 7)
    .attr('dy', '.35em')
    .text(function (d) { return max })
}

function filter_map (feature) {
  if (feature.properties.county === climate_indicator_district) return true
}

function onEachFeature2 (feature, layer) {
  layer.setStyle({
    fillColor: d3.interpolateOranges(color_indicator(feature.properties[climate_indicator_var])),
    fillOpacity: 0.8,
    weight: 0.5
  })
  layer.on('click', function (e) {

  })
}

function color_impact (value) {
  return value >= 60 ? 'class="table-danger"' : (value < 60 && value >= 30 ? 'class="table-warning"' : '')
}
/**
 * Function which filter dataset for impacts and show data into the table
 */
function impact_fill_table (crop, hazard) {
  const filter_level = crop !== 'All' && hazard !== 'All'
  // Filtering data and order by frequency
  let inputs = hazard_d.filter(function (item) { return item.vc_stage === '1. Input' && (crop === 'All' ? true : item.crop_livestock === crop) && (hazard === 'All' ? true : item.hazard === hazard) }).sort((a, b) => d3.descending(parseFloat(a.freq), parseFloat(b.freq)))
  let on_farm = hazard_d.filter(function (item) { return item.vc_stage === '2. On-farm' && (crop === 'All' ? true : item.crop_livestock === crop) && (hazard === 'All' ? true : item.hazard === hazard) }).sort((a, b) => d3.descending(parseFloat(a.freq), parseFloat(b.freq)))
  let harvesting = hazard_d.filter(function (item) { return item.vc_stage === '3. Harvesting, storage & processing' && (crop === 'All' ? true : item.crop_livestock === crop) && (hazard === 'All' ? true : item.hazard === hazard) }).sort((a, b) => d3.descending(parseFloat(a.freq), parseFloat(b.freq)))
  let marketing = hazard_d.filter(function (item) { return item.vc_stage === '4. Marketing' && (crop === 'All' ? true : item.crop_livestock === crop) && (hazard === 'All' ? true : item.hazard === hazard) }).sort((a, b) => d3.descending(parseFloat(a.freq), parseFloat(b.freq)))
  let severity = hazard_d.filter(function (item) { return item.crop_livestock === crop && item.hazard === hazard })
  severity = d3.map(severity, function (d) { return d.severity }).keys()
  let count = hazard_d.filter(function (item) { return item.crop_livestock === crop && item.hazard === hazard })
  count = d3.map(count, function (d) { return d.count }).keys()

  // Fixing groups and Removing duplicates
  // console.log(inputs);
  inputs = d3.nest()
    .key(function (d) { return d.impact })
    .rollup(function (v) { return d3.mean(v, function (k) { return parseFloat(k.percentage) }) })
    .entries(inputs).filter(function (d) { return d.values > 20 })
  on_farm = d3.nest()
    .key(function (d) { return d.impact })
    .rollup(function (v) { return d3.mean(v, function (k) { return parseFloat(k.percentage) }) })
    .entries(on_farm).filter(function (d) { return d.values > 20 })
  harvesting = d3.nest()
    .key(function (d) { return d.impact })
    .rollup(function (v) { return d3.mean(v, function (k) { return parseFloat(k.percentage) }) })
    .entries(harvesting).filter(function (d) { return d.values > 20 })
  marketing = d3.nest()
    .key(function (d) { return d.impact })
    .rollup(function (v) { return d3.mean(v, function (k) { return parseFloat(k.percentage) }) })
    .entries(marketing).filter(function (d) { return d.values > 20 })
  // console.log(inputs);
  // Fixing data in the table
  const max = d3.max([d3.max([d3.max([inputs.length, on_farm.length]), harvesting.length]), marketing.length])
  let table = ''
  for (let i = 0; i < max; i++) {
    table = table + '<tr>'
    table = table + (inputs.length > i ? '<td ' + (filter_level ? color_impact(inputs[i].values) : '') + '>' + inputs[i].key + '</td>' : '<td></td>')
    table = table + (on_farm.length > i ? '<td ' + (filter_level ? color_impact(on_farm[i].values) : '') + '>' + on_farm[i].key + '</td>' : '<td></td>')
    table = table + (harvesting.length > i ? '<td ' + (filter_level ? color_impact(harvesting[i].values) : '') + '>' + harvesting[i].key + '</td>' : '<td></td>')
    table = table + (marketing.length > i ? '<td ' + (filter_level ? color_impact(marketing[i].values) : '') + '>' + marketing[i].key + '</td>' : '<td></td>')
    table = table + '</tr>'
  }
  // table = table + '</table>';
  $('#impacts_table  > tbody').html(table)

  // Sverity
  if (severity.length > 0) {
    table = '<table class="table table-striped table-sm">'
    for (let i = 0; i < severity.length; i++) {
      table = table + '<tr><th>Severity</th><td>' + severity[i] + '</td><th>Count</th><td>' + count[i] + '</td></tr>'
    }
    table = table + '</table>'
    $('#impacts_severity').html(table)
  } else {
    $('#impacts_severity').html('')
  }
}

/**
 * Function which filter dataset for practices and show data into the table
 */
function practices_fill (crop, hazard) {
  // Filtering data
  const records = practices_d.filter(function (item) { return (crop === 'All' ? true : item.crop === crop) && (hazard === 'All' ? true : item.hazard === hazard || item.hazard_1 === hazard || item.hazard_2 === hazard || item.hazard_3 === hazard) })

  // let table = '';
  let table = '<table class="table table-bordered table-sm">'
  for (let i = 0; i < records.length; i++) {
    table = table + '<tr class="table-secondary d-flex">'
    table = table + '<td class="col-1 text-center"><span class="practices_id">' + records[i].Order + '</span></td>'
    table = table + '<td class="col-2"><h4>' + records[i].crop + '</h4><p class="text-justify">' + records[i].csa + '</p><p class="text-warning"><b>' + records[i].adoption + '</b></p></td>'
    table = table + '<td class="col-5"><table class="table borderless"><tr><td>' +
                    (records[i].ind_1 === '' ? '' : '<img src="https://ciat-dapa.github.io/pakistan_web/img/indicators/' + records[i].ind_1 + '.png" class="rounded practices_img_icons" alt="' + records[i].ind_1 + '" />') +
                    (records[i].ind_2 === '' ? '' : '<img src="https://ciat-dapa.github.io/pakistan_web/img/indicators/' + records[i].ind_2 + '.png" class="rounded practices_img_icons" alt="' + records[i].ind_2 + '" />') +
                    (records[i].ind_3 === '' ? '' : '<img src="https://ciat-dapa.github.io/pakistan_web/img/indicators/' + records[i].ind_3 + '.png" class="rounded practices_img_icons" alt="' + records[i].ind_3 + '" />') +
                    (records[i].ind_4 === '' ? '' : '<img src="https://ciat-dapa.github.io/pakistan_web/img/indicators/' + records[i].ind_4 + '.png" class="rounded practices_img_icons" alt="' + records[i].ind_4 + '" />') +
                    (records[i].ind_5 === '' ? '' : '<img src="https://ciat-dapa.github.io/pakistan_web/img/indicators/' + records[i].ind_5 + '.png" class="rounded practices_img_icons" alt="' + records[i].ind_5 + '" />') +
                    (records[i].ind_6 === '' ? '' : '<img src="https://ciat-dapa.github.io/pakistan_web/img/indicators/' + records[i].ind_6 + '.png" class="rounded practices_img_icons" alt="' + records[i].ind_6 + '" />') +
                    '</td></tr>'
    table = table + '<tr><td>' +
                    (records[i].hazard === '' ? '' : '<img src="https://ciat-dapa.github.io/pakistan_web/img/hazards/' + records[i].hazard + '.png" class="rounded practices_img_icons" alt="' + records[i].hazard + '" />') +
                    (records[i].hazard_1 === '' ? '' : '<img src="https://ciat-dapa.github.io/pakistan_web/img/hazards/' + records[i].hazard_1 + '.png" class="rounded practices_img_icons" alt="' + records[i].hazard_1 + '" />') +
                    (records[i].hazard_2 === '' ? '' : '<img src="https://ciat-dapa.github.io/pakistan_web/img/hazards/' + records[i].hazard_2 + '.png" class="rounded practices_img_icons" alt="' + records[i].hazard_2 + '" />') +
                    (records[i].hazard_3 === '' ? '' : '<img src="https://ciat-dapa.github.io/pakistan_web/img/hazards/' + records[i].hazard_3 + '.png" class="rounded practices_img_icons" alt="' + records[i].hazard_3 + '" />') +
                    '</td></tr></table></td>'
    table = table + '<td class="col-4"><table class="table borderless">'
    if (records[i].barrier_1 !== '') {
      table = table + '<tr><td><img src="https://ciat-dapa.github.io/pakistan_web/img/barriers/' + records[i].barrier_1 + '.png" class="rounded practices_img_icons" alt="' + records[i].barrier_1 + '" /></td>' +
                        '<td>' + records[i].b1_exp + '</td></tr>'
    }
    if (records[i].barrier_2 !== '') {
      table = table + '<tr><td><img src="https://ciat-dapa.github.io/pakistan_web/img/barriers/' + records[i].barrier_2 + '.png" class="rounded practices_img_icons" alt="' + records[i].barrier_2 + '" /></td>' +
                        '<td>' + records[i].b2_exp + '</td></tr>'
    }
    table = table + '</table></td>'
    table = table + '</tr>'
  }
  // table = table + '</div>';
  $('#practices_table').html(table)
}

/**
 * Function which fill table of risk for climate risk
 */
function risk_fill (data) {
  for (let i = 1; i < 5; i++) {
    for (let j = 1; j < 5; j++) {
      $('#r' + i + '-' + j).html('')
    }
  }
  data.forEach(element => {
    const key = '#r' + element.frequency + '-' + element.severity
    if (element.severity !== '#N/A' && element.frequency !== '#N/A') {
      $(key).html($(key).html() + '- ' + element.hazard + '<br />')
    }
  })
}

function enablers_load () {
  let data
  type_agg = $('#cbo_enablers_agg').val()

  switch (type_agg) {
  case 'dist': data = enablersDistricts; break
  case 'prov': data = enablersProvince; break
  default: data = enablersNational; break
  }

  let enablers = null
  if (type_agg === 'dist') { enablers = data.filter(function (item) { return item.district === district }) } else if (type_agg === 'prov') { enablers = data.filter(function (item) { return item.province === province }) } else { enablers = data }
  console.log(enablers)
  enablers = enablers.sort((a, b) => d3.descending(parseFloat(a.rank), parseFloat(b.rank)))
  // enablers = data;
  // Default fill
  enablers_fill(enablers)
}
/**
 * Function which fill table of enablers
 */
function enablers_fill (data) {
  table = ''
  $('#enablers_table  > tbody').html(table)
  for (const item in data) {
    table = table + '<tr>'
    table = table + '<th>' + data[item].type + '</th>'
    table = table + '<td>' + data[item].name + '</td>'
    table = table + '<td>' + data[item].description + '</td>'
    table = table + '</tr>'
  }
  // table = table + '</table>';
  $('#enablers_table  > tbody').html(table)
}
/**
 * Function for each feature into the map
 */
function onEachFeature (feature, layer) {
  if (!mapData) {
    console.log('--must load the map data first.')
    return
  }

  const districtTemp = mapData.filter(function (item) { return item.NAME_3 === layer.feature.properties.NAME_3 })
  layer.setStyle({
    fillColor: districtTemp.length > 0 && districtTemp[0][tab] === '1' ? '#0099e6' : '#a6a6a6',
    fillOpacity: 0.8,
    weight: 0.5
  })

  if (layer.feature.geometry.coordinates && districtTemp[0].site === '1' && siteMapAgg === 'district') {
    // const text = `Province: ${layer.feature.properties.NAME_1}<br>NAME_2: ${layer.feature.properties.NAME_2}<br>District: ${layer.feature.properties.NAME_3}`
    let text = layer.feature.properties.NAME_3
    switch (siteMapAgg) {
    case 'district': text = layer.feature.properties.NAME_3; break
    case 'province': text = layer.feature.properties.NAME_1; break
    case 'national': text = 'Pakistan'; break
    default: break
    }
    layer.bindTooltip(text, { permanent: true })
  }

  layer.on('click', function (e) {
    console.log(layer.feature.properties)
    province = layer.feature.properties.NAME_1
    district = layer.feature.properties.NAME_3
    coords = layer.feature.geometry.coordinates[0][0]
    console.log(`---PROVINCE: ${province}\n---DISTRICT: ${district}\n---COORDS: ${coords}`)

    $('#txt_site_selected').html(province + ' - ' + district)
  })
}
/**
 * Function to load the map CSV data only once
 */
const loadMapData = () => new Promise((resolve, reject) => {
  d3.csv(`${baseDataURL}data/maps/pakistan_data.csv`, function (error, data) {
    if (error) {
      reject(error)
    } else {
      resolve(data)
    }
  })
})
/**
 * Function to load CSV data using D3
 */
const loadD3CSVData = (path) => new Promise((resolve, reject) => {
  d3.csv(`${baseDataURL}data/${path}`, function (error, data) {
    if (error) {
      reject(error)
    } else {
      resolve(data)
    }
  })
})
/**
 * Function to reload the map's current (or new) JSON layer and display new tooltip values
 */
const reloadMapLayer = (layer) => {
  mapLayerGroup.clearLayers()
  mapLayerGroup.addLayer(L.geoJSON(layer ?? mapJSON, { onEachFeature: onEachFeature }))
}
/**
 * Function that displays the province or national labels on the center, in the case of multipolygons
 */
const selectSiteLevel = (level) => {
  reloadMapLayer()

  if (level ?? siteMapAgg === 'national') {
    mapLayerGroup.addLayer(
      L.marker(L.geoJSON(mapJSON).getBounds().getCenter(), {
        icon: L.divIcon({
          iconSize: null,
          html: '<div class="map-label"><div class="map-label-content">Pakistan</div><div class="map-label-arrow"></div></div>'
        })
      })
    )
  } else if (level ?? siteMapAgg === 'province') {
    if (!mapJSON) {
      return
    }

    for (let i = 0; i < allProvinces.length; i += 1) {
      console.log(`---processing province ${allProvinces[i]}`)
      const provinceLayer = {
        type: 'FeatureCollection',
        features: mapJSON.features.filter(x => x.properties.NAME_1 === allProvinces[i])
      }

      mapLayerGroup.addLayer(
        L.marker(L.geoJSON(provinceLayer).getBounds().getCenter(), {
          icon: L.divIcon({
            iconSize: null,
            html: `<div class="map-label"><div class="map-label-content">${allProvinces[i]}</div><div class="map-label-arrow"></div></div>`
          })
        })
      )

      console.log(provinceLayer)
      maplayers.province.features = [...maplayers.province.features, ...provinceLayer.features]
    }
  }
}

// Default tab
click_tab('intro')
