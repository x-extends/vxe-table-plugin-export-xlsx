import XEUtils from 'xe-utils/methods/xe-utils'
import VXETable from 'vxe-table/lib/vxe-table'
import * as XLSX from 'xlsx'
import * as FileSaver from 'file-saver'

function toBuffer(wbout: any) {
  let buf = new ArrayBuffer(wbout.length)
  let view = new Uint8Array(buf)
  for (let index = 0; index !== wbout.length; ++index) view[index] = wbout.charCodeAt(index) & 0xFF
  return buf
}

function toXLSX(params: any) {
  const { options, columns, datas } = params
  const { filename, sheetName, type, isHeader, original } = options
  const colHead: any = {}
  if (isHeader) {
    columns.forEach((column: any) => {
      colHead[column.id] = column.getTitle()
    })
  }
  const rowList = datas.map((row: any) => {
    const item: any = {}
    columns.forEach((column: any) => {
      item[column.id] = original ? XEUtils.get(row, column.property) : row[column.id]
    })
    return item
  })
  const book = XLSX.utils.book_new()
  const sheet = XLSX.utils.json_to_sheet((isHeader ? [colHead] : []).concat(rowList), { skipHeader: true })
  // 转换数据
  XLSX.utils.book_append_sheet(book, sheet, sheetName)
  const wbout = XLSX.write(book, { bookType: type, bookSST: false, type: 'binary' })
  const blob = new Blob([toBuffer(wbout)], { type: 'application/octet-stream' })
  // 保存导出
  FileSaver.saveAs(blob, `${filename}.${type}`)
}

function handleExportEvent(params: any) {
  switch (params.options.type) {
    case 'xlsx':
      toXLSX(params)
      return false
  }
}

/**
 * 基于 vxe-table 表格的增强插件，支持导出 xlsx 等格式
 */
export const VXETablePluginExport = {
  install(xtable: typeof VXETable) {
    Object.assign(xtable.types, { xlsx: 1 })
    xtable.interceptor.add('event.export', handleExportEvent)
  }
}

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(VXETablePluginExport)
}

export default VXETablePluginExport
