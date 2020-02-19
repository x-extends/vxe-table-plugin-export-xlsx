import XEUtils from 'xe-utils/methods/xe-utils'
import VXETable from 'vxe-table/lib/vxe-table'
import XLSX from 'xlsx'

function getFooterCellValue ($table: any, opts: any, rows: any[], column: any) {
  var cellValue = XEUtils.toString(rows[$table.$getColumnIndex(column)])
  return cellValue
}

function toBuffer (wbout: any) {
  let buf = new ArrayBuffer(wbout.length)
  let view = new Uint8Array(buf)
  for (let index = 0; index !== wbout.length; ++index) view[index] = wbout.charCodeAt(index) & 0xFF
  return buf
}

function exportXLSX (params: any) {
  const { $table, options, columns, datas } = params
  const { sheetName, type, isHeader, isFooter, original, message, footerFilterMethod } = options
  const colHead: any = {}
  const footList: any[] = []
  const rowList = datas
  if (isHeader) {
    columns.forEach((column: any) => {
      colHead[column.id] = XEUtils.toString(original ? column.property : column.getTitle())
    })
  }
  if (isFooter) {
    const footerData: any[] = $table.footerData
    const footers: any[] = footerFilterMethod ? footerData.filter(footerFilterMethod) : footerData
    footers.forEach((rows: any[]) => {
      const item: any = {}
      columns.forEach((column: any) => {
        item[column.id] = getFooterCellValue($table, options, rows, column)
      })
      footList.push(item)
    })
  }
  const book = XLSX.utils.book_new()
  const sheet = XLSX.utils.json_to_sheet((isHeader ? [colHead] : []).concat(rowList).concat(footList), { skipHeader: true })
  // 转换数据
  XLSX.utils.book_append_sheet(book, sheet, sheetName)
  const wbout = XLSX.write(book, { bookType: type, bookSST: false, type: 'binary' })
  const blob = new Blob([toBuffer(wbout)], { type: 'application/octet-stream' })
  // 保存导出
  downloadFile(blob, options)
  if (message !== false) {
    $table.$XModal.message({ message: i18n('vxe.table.expSuccess'), status: 'success' })
  }
}

function downloadFile (blob: Blob, options: any) {
  if (window.Blob) {
    const { filename, type } = options
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, `${filename}.${type}`)
    } else {
      var linkElem = document.createElement('a')
      linkElem.target = '_blank'
      linkElem.download = `${filename}.${type}`
      linkElem.href = URL.createObjectURL(blob)
      document.body.appendChild(linkElem)
      linkElem.click()
      document.body.removeChild(linkElem)
    }
  } else {
    console.error(i18n('vxe.error.notExp'))
  }
}

function replaceDoubleQuotation (val: string) {
  return val.replace(/^"/, '').replace(/"$/, '')
}

function parseCsv (columns: any[], content: string) {
  const list: string[] = content.split('\n')
  const fields: any[] = []
  const rows: any[] = []
  if (list.length) {
    const rList: string[] = list.slice(1)
    list[0].split(',').map(replaceDoubleQuotation)
    rList.forEach((r: string) => {
      if (r) {
        const item: any = {}
        r.split(',').forEach((val: string, colIndex: number) => {
          if (fields[colIndex]) {
            item[fields[colIndex]] = replaceDoubleQuotation(val)
          }
        })
        rows.push(item)
      }
    })
  }
  return { fields, rows }
}

function checkImportData (columns: any[], fields: string[], rows: any[]) {
  let tableFields: string[] = []
  columns.forEach((column: any) => {
    let field: string = column.property
    if (field) {
      tableFields.push(field)
    }
  })
  return tableFields.every((field: string) => fields.includes(field))
}

function importXLSX (params: any) {
  const { $table, columns, options, file } = params
  const { _importCallback, _importResolve } = $table
  const fileReader = new FileReader()
  fileReader.onload = (e: any) => {
    const workbook = XLSX.read(e.target.result, { type: 'binary' })
    const csvData: string = XLSX.utils.sheet_to_csv(workbook.Sheets.Sheet1)
    const rest: any = parseCsv(columns, csvData)
    const { fields, rows } = rest
    const status = checkImportData(columns, fields, rows)
    if (status) {
      $table.createData(rows)
        .then((data: any[]) => {
          if (options.mode === 'append') {
            $table.insertAt(data, -1)
          } else {
            $table.reloadData(data)
          }
        })
      if (options.message !== false) {
        $table.$XModal.message({ message: i18n('vxe.table.impSuccess'), status: 'success' })
      }
    } else if (options.message !== false) {
      $table.$XModal.message({ message: i18n('vxe.error.impFields'), status: 'error' })
    }
    if (_importResolve) {
      _importResolve(status)
      $table._importResolve = null
    } else if (_importCallback) {
      // 已废弃
      _importCallback(status)
      $table._importCallback = null
    }
  }
  fileReader.readAsBinaryString(file)
}

function handleImportEvent (params: any) {
  if (params.options.type === 'xlsx') {
    importXLSX(params)
    return false
  }
}

function handleExportEvent (params: any) {
  if (params.options.type === 'xlsx') {
    exportXLSX(params)
    return false
  }
}

/**
 * 基于 vxe-table 表格的增强插件，支持导出 xlsx 格式
 */
export const VXETablePluginExportXLSX: any = {
  install (xtable: typeof VXETable) {
    Object.assign(xtable.types, { xlsx: 1 })
    xtable.interceptor.mixin({
      'event.import': handleImportEvent,
      'event.export': handleExportEvent
    })
    VXETablePluginExportXLSX.t = xtable.t
  }
}

function i18n (key: string) {
  if (VXETablePluginExportXLSX.t) {
    return VXETablePluginExportXLSX.t(key)
  }
}

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(VXETablePluginExportXLSX)
}

export default VXETablePluginExportXLSX
