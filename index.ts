/* eslint-disable no-unused-vars */
import XEUtils from 'xe-utils/ctor'
import {
  VXETable,
  Table,
  InterceptorExportParams,
  InterceptorImportParams,
  ColumnConfig,
  TableExportConfig
} from 'vxe-table/lib/vxe-table'
import XLSX from 'xlsx'
/* eslint-enable no-unused-vars */

function getFooterCellValue ($table: Table, opts: TableExportConfig, rows: any[], column: ColumnConfig) {
  const cellValue = rows[$table.$getColumnIndex(column)]
  return cellValue
}

function getFooterData (opts: TableExportConfig, footerData: any[][]) {
  const { footerFilterMethod } = opts
  return footerFilterMethod ? footerData.filter((items, index) => footerFilterMethod({ items, $rowIndex: index })) : footerData
}

function toBuffer (wbout: any) {
  const buf = new ArrayBuffer(wbout.length)
  const view = new Uint8Array(buf)
  for (let index = 0; index !== wbout.length; ++index) view[index] = wbout.charCodeAt(index) & 0xFF
  return buf
}

function getCellLabel (column: ColumnConfig, cellValue: any) {
  if (cellValue) {
    switch (column.cellType) {
      case 'string':
        break
      case 'number':
        if (!isNaN(cellValue)) {
          return Number(cellValue)
        }
        break
      default:
        if (cellValue.length < 12 && !isNaN(cellValue)) {
          return Number(cellValue)
        }
        break
    }
  }
  return cellValue
}

declare module 'vxe-table/lib/vxe-table' {
  interface ColumnInfo {
    _row: any;
    _colSpan: number;
    _rowSpan: number;
    childNodes: ColumnConfig[];
  }
}

function getValidColumn (column: ColumnConfig): ColumnConfig {
  const { childNodes } = column
  const isColGroup = childNodes && childNodes.length
  if (isColGroup) {
    return getValidColumn(childNodes[0])
  }
  return column
}

function exportXLSX (params: InterceptorExportParams) {
  const msgKey = 'xlsx'
  const { $table, options, columns, colgroups, datas } = params
  const { $vxe } = $table
  const { modal, t } = $vxe
  const { message, sheetName, isHeader, isFooter, isMerge, isColgroup, original } = options
  const showMsg = message !== false
  const mergeCells = $table.getMergeCells()
  const colList: any[] = []
  const footList: any[] = []
  const sheetCols: { wpx: number }[] = []
  const sheetMerges: { s: { r: number, c: number }, e: { r: number, c: number } }[] = []
  // 处理表头
  if (isHeader) {
    const colHead: any = {}
    columns.forEach((column) => {
      colHead[column.id] = original ? column.property : column.getTitle()
      sheetCols.push({
        wpx: XEUtils.toInteger(column.renderWidth * 0.75)
      })
    })
    if (isColgroup && !original && colgroups) {
      colgroups.forEach((cols, rIndex) => {
        let groupHead: any = {}
        columns.forEach((column) => {
          groupHead[column.id] = null
        })
        cols.forEach((column) => {
          const { _colSpan, _rowSpan } = column
          const validColumn = getValidColumn(column)
          const columnIndex = columns.indexOf(validColumn)
          groupHead[validColumn.id] = original ? validColumn.property : column.getTitle()
          if (_colSpan > 1 || _rowSpan > 1) {
            sheetMerges.push({
              s: { r: rIndex, c: columnIndex },
              e: { r: rIndex + _rowSpan - 1, c: columnIndex + _colSpan - 1 }
            })
          }
        })
        colList.push(groupHead)
      })
    } else {
      colList.push(colHead)
    }
  }
  // 处理合并
  if (isMerge && !original) {
    mergeCells.forEach(mergeItem => {
      let { row: mergeRowIndex, rowspan: mergeRowspan, col: mergeColIndex, colspan: mergeColspan } = mergeItem
      for (let rIndex = 0; rIndex < datas.length; rIndex++) {
        let rowIndex = $table.getVTRowIndex(datas[rIndex]._row)
        if (rowIndex === mergeRowIndex) {
          if (isHeader && colgroups) {
            rowIndex = rIndex + colgroups.length
          }
          sheetMerges.push({
            s: { r: rowIndex, c: mergeColIndex },
            e: { r: rowIndex + mergeRowspan - 1, c: mergeColIndex + mergeColspan - 1 }
          })
          break
        }
      }
    })
  }
  const rowList = datas.map(item => {
    const rest: any = {}
    columns.forEach((column) => {
      rest[column.id] = getCellLabel(column, item[column.id])
    })
    return rest
  })
  // 处理表尾
  if (isFooter) {
    const { footerData } = $table.getTableData()
    const footers = getFooterData(options, footerData)
    footers.forEach((rows) => {
      const item: any = {}
      columns.forEach((column) => {
        item[column.id] = getFooterCellValue($table, options, rows, column)
      })
      footList.push(item)
    })
  }
  const exportMethod = () => {
    const book = XLSX.utils.book_new()
    const list = (isHeader ? colList : []).concat(rowList).concat(footList)
    const sheet = XLSX.utils.json_to_sheet(list.length ? list : [{}], { skipHeader: true })
    sheet['!cols'] = sheetCols
    sheet['!merges'] = sheetMerges
    // 转换数据
    XLSX.utils.book_append_sheet(book, sheet, sheetName)
    const wbout = XLSX.write(book, { bookType: 'xlsx', bookSST: false, type: 'binary' })
    const blob = new Blob([toBuffer(wbout)], { type: 'application/octet-stream' })
    // 导出 xlsx
    downloadFile(params, blob, options)
    if (showMsg) {
      modal.close(msgKey)
      modal.message({ message: t('vxe.table.expSuccess'), status: 'success' })
    }
  }
  if (showMsg) {
    modal.message({ id: msgKey, message: t('vxe.table.expLoading'), status: 'loading', duration: -1 })
    setTimeout(exportMethod, 1500)
  } else {
    exportMethod()
  }
}

function downloadFile (params: InterceptorExportParams, blob: Blob, options: TableExportConfig) {
  const { $table } = params
  const { $vxe } = $table
  const { modal, t } = $vxe
  const { message, filename, type } = options
  const showMsg = message !== false
  if (window.Blob) {
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, `${filename}.${type}`)
    } else {
      const linkElem = document.createElement('a')
      linkElem.target = '_blank'
      linkElem.download = `${filename}.${type}`
      linkElem.href = URL.createObjectURL(blob)
      document.body.appendChild(linkElem)
      linkElem.click()
      document.body.removeChild(linkElem)
    }
  } else {
    if (showMsg) {
      modal.alert({ message: t('vxe.error.notExp'), status: 'error' })
    }
  }
}

function checkImportData (tableFields: string[], fields: string[]) {
  return fields.some(field => tableFields.indexOf(field) > -1)
}

declare module 'vxe-table/lib/vxe-table' {
  interface Table {
    _importResolve?: Function | null;
    _importReject?: Function | null;
  }
}

function importXLSX (params: InterceptorImportParams) {
  const { $table, columns, options, file } = params
  const { $vxe, _importResolve, _importReject } = $table
  const { modal, t } = $vxe
  const showMsg = options.message !== false
  const fileReader = new FileReader()
  fileReader.onload = (e: any) => {
    const tableFields: string[] = []
    columns.forEach((column) => {
      const field = column.property
      if (field) {
        tableFields.push(field)
      }
    })
    const workbook = XLSX.read(e.target.result, { type: 'binary' })
    const rest = XLSX.utils.sheet_to_json(XEUtils.first(workbook.Sheets)) as any[]
    const fields = rest ? XEUtils.keys(rest[0]) : []
    const list = rest
    const status = checkImportData(tableFields, fields)
    if (status) {
      const records: any[] = list.map(item => {
        const record: any = {}
        tableFields.forEach(field => {
          record[field] = XEUtils.isUndefined(item[field]) ? null : item[field]
        })
        return record
      })
      $table.createData(records)
        .then((data: any[]) => {
          let loadRest: Promise<any>
          if (options.mode === 'insert') {
            loadRest = $table.insertAt(data, -1)
          } else {
            loadRest = $table.reloadData(data)
          }
          return loadRest.then(() => {
            if (_importResolve) {
              _importResolve({ status: true })
            }
          })
        })
      if (showMsg) {
        modal.message({ message: t('vxe.table.impSuccess', [records.length]), status: 'success' })
      }
    } else {
      if (showMsg) {
        modal.message({ message: t('vxe.error.impFields'), status: 'error' })
      }
      if (_importReject) {
        _importReject({ status: false })
      }
    }
  }
  fileReader.readAsBinaryString(file)
}

function handleImportEvent (params: InterceptorImportParams) {
  if (params.options.type === 'xlsx') {
    importXLSX(params)
    return false
  }
}

function handleExportEvent (params: InterceptorExportParams) {
  if (params.options.type === 'xlsx') {
    exportXLSX(params)
    return false
  }
}

/**
 * 基于 vxe-table 表格的增强插件，支持导出 xlsx 格式
 */
export const VXETablePluginExportXLSX = {
  install (vxetable: typeof VXETable) {
    const { interceptor } = vxetable
    vxetable.setup({
      export: {
        types: {
          xlsx: 0
        }
      }
    })
    interceptor.mixin({
      'event.import': handleImportEvent,
      'event.export': handleExportEvent
    })
  }
}

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(VXETablePluginExportXLSX)
}

export default VXETablePluginExportXLSX
