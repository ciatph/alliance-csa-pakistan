/**
 * Simple filter tree viewer.
 * Displays 1-level items a "rootText" level.
 * Requires the "gijgo" treeviewer library and related dependencies.
 */
class SimpleFilter {
  /**
   * Create a new instance of a SimpleFilter object
   * @param {Object[]} data - Should contain the search key field specified in the "keys" param to list within the subtree
   * @param {String} id - Document element ID of a <div /> on which to attach the treeviewer
   * @param {String} rootText - Text to display for the rootText-level filter.
   * @param {String} key - key to search for from the "data" param.
   */
  constructor ({ data, id, rootText, key }) {
    this.tree = null
    this.createTree(data, id, rootText, key)
  }

  // Process and render the treeviewer's data
  createTree (data, id, rootText, key) {
    const keys = d3.map(data, x => x[key]).keys()

    // Format the treeviewer's dataSource
    const dataSource = [{
      id: rootText,
      text: rootText,
      children: Array.from(keys, x => ({ id: x, text: x })) // commodities
    }]

    // Create the internal gijgo treeviewer
    this.tree = $(`#${id}`).tree({
      primaryKey: 'id',
      uiLibrary: 'bootstrap4',
      dataSource,
      checkboxes: true
    })
  }
}
