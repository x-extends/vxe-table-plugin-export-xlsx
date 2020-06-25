# vxe-table-plugin-export-xlsx

[![gitee star](https://gitee.com/xuliangzhan_admin/vxe-table-plugin-export-xlsx/badge/star.svg?theme=dark)](https://gitee.com/xuliangzhan_admin/vxe-table-plugin-export-xlsx/stargazers)
[![npm version](https://img.shields.io/npm/v/vxe-table-plugin-export-xlsx.svg?style=flat-square)](https://www.npmjs.org/package/vxe-table-plugin-export-xlsx)
[![npm downloads](https://img.shields.io/npm/dm/vxe-table-plugin-export-xlsx.svg?style=flat-square)](http://npm-stat.com/charts.html?package=vxe-table-plugin-export-xlsx)
[![gzip size: JS](http://img.badgesize.io/https://unpkg.com/vxe-table-plugin-export-xlsx/dist/index.min.js?compression=gzip&label=gzip%20size:%20JS)](https://unpkg.com/vxe-table-plugin-export-xlsx/dist/index.min.js)
[![npm license](https://img.shields.io/github/license/mashape/apistatus.svg)](LICENSE)

基于 [vxe-table](https://github.com/xuliangzhan/vxe-table) 表格的增强插件，支持导出 xlsx 格式

## Installing

```shell
npm install xe-utils vxe-table vxe-table-plugin-export-xlsx xlsx
```

```javascript
// ...
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
  border
  ref="xTable"
  height="600"
  :data="tableData">
  <vxe-table-column type="index" width="60"></vxe-table-column>
  <vxe-table-column field="name" title="Name"></vxe-table-column>
  <vxe-table-column field="age" title="Age"></vxe-table-column>
  <vxe-table-column field="date" title="Date"></vxe-table-column>
</vxe-table>
```

```javascript
export default {
  data () {
    return {
      tableData: [
        {
          id: 100,
          name: 'test',
          age: 26,
          date: null
        }
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
