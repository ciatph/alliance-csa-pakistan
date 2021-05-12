/**
 * Geographic filter tree viewer.
 * Displays the provinces and districts sub-trees under a "National" level.
 * Requires the "gijgo" treeviewer library and related dependencies.
 */
class GeographicFilter {
  /**
   * Create a new instance of a GeographicFilter object
   * @param {Object[]} data - Should contain "province" and "district" keys to categorize within the subtree
   * @param {String} id - Document element ID of a <div /> on which to attach the treeviewer
   */
  constructor (data, id) {
    this.tree = null
    this.createTree(data, id)
  }

  // Process and render the treeviewer's data
  createTree (data, id) {
    // Get provinces
    const provinces = d3.map(data, x => x.province).keys()
    console.log(provinces)

    // Get districts per province
    const districts = data.reduce((acc, curr) => {
      if (!acc[curr.province]) {
        acc[curr.province] = [curr.district]
      } else {
        if (!acc[curr.province].includes(curr.district)) {
          acc[curr.province].push(curr.district)
        }
      }
      return { ...acc }
    }, {})

    // Format the treeviewer's dataSource
    const dataSource = [{
      id: 'national',
      text: 'Pakistan',
      children: []
    }]

    for (let i = 0; i < provinces.length; i += 1) {
      dataSource[0].children.push({
        id: provinces[i],
        text: provinces[i],
        children: Array.from(districts[provinces[i]], x => ({ id: x, text: x }))
      })
    }

    // Create the internal gijgo treeviewer
    this.tree = $(`#${id}`).tree({
      primaryKey: 'id',
      uiLibrary: 'bootstrap4',
      dataSource,
      checkboxes: true
    })

    this.tree.on('checkboxChange', (e, $node, record, state) => {
      console.log('The new state of record ' + record.text + ' is ' + state)
    })
  }
}
