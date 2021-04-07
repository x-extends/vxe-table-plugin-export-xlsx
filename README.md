# vxe-table-plugin-export-xlsx

[![gitee star](https://gitee.com/x-extends/vxe-table-plugin-export-xlsx/badge/star.svg?theme=dark)](https://gitee.com/x-extends/vxe-table-plugin-export-xlsx/stargazers)
[![npm version](https://img.shields.io/npm/v/vxe-table-plugin-export-xlsx.svg?style=flat-square)](https://www.npmjs.com/package/vxe-table-plugin-export-xlsx)
[![npm downloads](https://img.shields.io/npm/dm/vxe-table-plugin-export-xlsx.svg?style=flat-square)](http://npm-stat.com/charts.html?package=vxe-table-plugin-export-xlsx)
[![npm license](https://img.shields.io/github/license/mashape/apistatus.svg)](LICENSE)

基于 [vxe-table](https://www.npmjs.com/package/vxe-table) 的表格插件，支持导出 xlsx 格式，基于 [exceljs](https://github.com/exceljs/exceljs) 实现

## Installing

```shell
npm install xe-utils vxe-table@next vxe-table-plugin-export-xlsx@next exceljs
```

```javascript
// ...
import VXETable from 'vxe-table'
import VXETablePluginExportXLSX from 'vxe-table-plugin-export-xlsx'
// ...

VXETable.use(VXETablePluginExportXLSX)
```

## Demo

```html
<vxe-toolbar>
  <template v-slot:buttons>
    <vxe-button @click="exportEvent">导出.xlsx</vxe-button>
  </template>
</vxe-toolbar>

<vxe-table
  ref="xTable"
  height="600"
  :data="tableData">
  <vxe-column type="seq" width="60"></vxe-column>
  <vxe-column field="name" title="Name"></vxe-column>
  <vxe-column field="age" title="Age"></vxe-column>
  <vxe-column field="date" title="Date"></vxe-column>
</vxe-table>
```

```javascript
export default {
  data () {
    return {
      tableData: [
        { id: 100, name: 'test', age: 26, date: null },
        { id: 101, name: 'test1', age: 30, date: null },
        { id: 102, name: 'test2', age: 34, date: null }
      ]
    }
  },
  methods: {
    exportEvent() {
      this.$refs.xTable.exportData({
        filename: 'export',
        sheetName: 'Sheet1',
        type: 'xlsx'
      })
    }
  }
}
```

## License

[MIT](LICENSE) © 2019-present, Xu Liangzhan
