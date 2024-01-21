import { VXETableCore } from 'vxe-table'

/**
 * 基于 vxe-table 表格的扩展插件，支持导出 xlsx 格式
 */
export declare const VXETablePluginExportXLSX: {
  install (vxetable: VXETableCore, options?: {
    ExcelJS?: any
  }): void
}

export default VXETablePluginExportXLSX
