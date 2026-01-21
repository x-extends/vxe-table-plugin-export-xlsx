# vxe-table-plugin-export-xlsx （该版本已停止维护）

！！！您正在查看的是 vxe-table 4.0 ~ 4.6 版本的扩展插件，该插件于 2024-12-01 起停止维护，此后它将不再推出新功能、更新或修复补丁。最新版本为 vxe-table 4.7+，对应扩展插件库 [@vxe-ui/plugin-export-xlsx](https://github.com/x-extends/vxe-ui-plugins/tree/main/plugin-export-xlsx)，建议及时更新到新版本，避免出现 bug 与安全问题！！！

[![gitee star](https://gitee.com/x-extends/vxe-table-plugin-export-xlsx/badge/star.svg?theme=dark)](https://gitee.com/x-extends/vxe-table-plugin-export-xlsx/stargazers)
[![npm version](https://img.shields.io/npm/v/vxe-table-plugin-export-xlsx.svg?style=flat-square)](https://www.npmjs.com/package/vxe-table-plugin-export-xlsx)
[![npm downloads](https://img.shields.io/npm/dm/vxe-table-plugin-export-xlsx.svg?style=flat-square)](http://npm-stat.com/charts.html?package=vxe-table-plugin-export-xlsx)
[![npm license](https://img.shields.io/github/license/mashape/apistatus.svg)](LICENSE)

基于 [vxe-table](https://www.npmjs.com/package/vxe-table) 的表格插件，支持导出 xlsx 格式，基于 [exceljs](https://github.com/exceljs/exceljs) 实现

## Compatibility

对应 vxe-table v4 版本  

## Installing

```shell
npm install vxe-table vxe-table-plugin-export-xlsx exceljs
```

```javascript
// ...
import { VxeUI } from 'vxe-table'
import VXETablePluginExportXLSX from 'vxe-table-plugin-export-xlsx'
import ExcelJS from 'exceljs'
// ...

// 方式1：NPM 安装，注入 ExcelJS 对象
VxeUI.use(VXETablePluginExportXLSX, {
  ExcelJS
})

// 方式2：CDN 安装，只要确保 window.ExcelJS 存在即可
// VxeUI.use(VXETablePluginExportXLSX)
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

## Contributors

Thank you to everyone who contributed to this project.

[![vxe-table-plugin-export-xlsx](https://contrib.rocks/image?repo=x-extends/vxe-table-plugin-export-xlsx)](https://github.com/x-extends/vxe-table-plugin-export-xlsx/graphs/contributors)

## License

[MIT](LICENSE) © 2019-present, Xu Liangzhan
