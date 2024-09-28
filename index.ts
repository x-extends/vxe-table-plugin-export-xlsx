import XEUtils from 'xe-utils'
import { VXETableCore } from 'vxe-table'
import type ExcelJS from 'exceljs'

let globalExcelJS: any

const defaultHeaderBackgroundColor = 'f8f8f9'
const defaultCellFontColor = '606266'
const defaultCellBorderStyle = 'thin'
const defaultCellBorderColor = 'e8eaec'

function getCellLabel (column: any, cellValue: any) {
  if (cellValue) {
    if (column.type === 'seq') {
      return XEUtils.toValueString(cellValue)
    }
    switch (column.cellType) {
      case 'string':
        return XEUtils.toValueString(cellValue)
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

function getFooterData (opts: any, footerData: any[][]) {
  const { footerFilterMethod } = opts
  return footerFilterMethod ? footerData.filter((items, index) => footerFilterMethod({ items, $rowIndex: index })) : footerData
}

function getFooterCellValue ($xeTable: any, opts: any, row: any, column: any) {
  const _columnIndex = $xeTable.getVTColumnIndex(column)
  // 兼容老模式
  if (XEUtils.isArray(row)) {
    return getCellLabel(column, row[_columnIndex])
  }
  return getCellLabel(column, XEUtils.get(row, column.field))
}

declare module 'vxe-table' {
  export interface ColumnInfo {
    _row: any;
    _colSpan: number;
    _rowSpan: number;
    childNodes: any[];
  }
}

function getValidColumn (column: any): any {
  const { childNodes } = column
  const isColGroup = childNodes && childNodes.length
  if (isColGroup) {
    return getValidColumn(childNodes[0])
  }
  return column
}

function setExcelRowHeight (excelRow: ExcelJS.Row, height: number) {
  if (height) {
    excelRow.height = XEUtils.floor(height * 0.75, 12)
  }
}

function setExcelCellStyle (excelCell: ExcelJS.Cell, align?: any) {
  excelCell.protection = {
    locked: false
  }
  excelCell.alignment = {
    vertical: 'middle',
    horizontal: align || 'left'
  }
}

function getDefaultBorderStyle () {
  return {
    top: {
      style: defaultCellBorderStyle,
      color: {
        argb: defaultCellBorderColor
      }
    },
    left: {
      style: defaultCellBorderStyle,
      color: {
        argb: defaultCellBorderColor
      }
    },
    bottom: {
      style: defaultCellBorderStyle,
      color: {
        argb: defaultCellBorderColor
      }
    },
    right: {
      style: defaultCellBorderStyle,
      color: {
        argb: defaultCellBorderColor
      }
    }
  }
}

function exportXLSX (params: any) {
  const msgKey = 'xlsx'
  const { $table, options, columns, colgroups, datas } = params
  const { $vxe, rowHeight, headerAlign: allHeaderAlign, align: allAlign, footerAlign: allFooterAlign, columnOpts } = $table
  const { modal, t } = $vxe
  const { message, sheetName, isHeader, isFooter, isMerge, isColgroup, original, useStyle, sheetMethod } = options
  const showMsg = message !== false
  const mergeCells = $table.getMergeCells()
  const colList: any[] = []
  const footList: any[] = []
  const sheetCols: any[] = []
  const sheetMerges: { s: { r: number, c: number }, e: { r: number, c: number } }[] = []
  let beforeRowCount = 0
  columns.forEach((column: any) => {
    const { id, renderWidth } = column
    sheetCols.push({
      key: id,
      width: XEUtils.ceil(renderWidth / 8, 1)
    })
  })
  // 处理表头
  if (isHeader) {
    // 处理分组
    if (isColgroup && colgroups) {
      colgroups.forEach((cols: any, rIndex: any) => {
        const groupHead: any = {}
        columns.forEach((column: any) => {
          groupHead[column.id] = null
        })
        cols.forEach((column: any) => {
          const { _colSpan, _rowSpan } = column
          const validColumn = getValidColumn(column)
          const columnIndex = columns.indexOf(validColumn)
          const headExportMethod = column.headerExportMethod || columnOpts.headerExportMethod
          groupHead[validColumn.id] = headExportMethod ? headExportMethod({ column, options, $table }) : (original ? validColumn.field : column.getTitle())
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
      const colHead: any = {}
      columns.forEach((column: any) => {
        const { id, field } = column
        const headExportMethod = column.headerExportMethod || columnOpts.headerExportMethod
        colHead[id] = headExportMethod ? headExportMethod({ column, options, $table }) : (original ? field : column.getTitle())
      })
      colList.push(colHead)
    }
    beforeRowCount += colList.length
  }
  // 处理合并
  if (isMerge) {
    mergeCells.forEach((mergeItem: any) => {
      const { row: mergeRowIndex, rowspan: mergeRowspan, col: mergeColIndex, colspan: mergeColspan } = mergeItem
      sheetMerges.push({
        s: { r: mergeRowIndex + beforeRowCount, c: mergeColIndex },
        e: { r: mergeRowIndex + beforeRowCount + mergeRowspan - 1, c: mergeColIndex + mergeColspan - 1 }
      })
    })
  }
  const rowList = datas.map((item: any) => {
    const rest: any = {}
    columns.forEach((column: any) => {
      rest[column.id] = getCellLabel(column, item[column.id])
    })
    return rest
  })
  beforeRowCount += rowList.length
  // 处理表尾
  if (isFooter) {
    const { footerData } = $table.getTableData()
    const footers = getFooterData(options, footerData)
    const mergeFooterItems = $table.getMergeFooterItems()
    // 处理合并
    if (isMerge) {
      mergeFooterItems.forEach((mergeItem: any) => {
        const { row: mergeRowIndex, rowspan: mergeRowspan, col: mergeColIndex, colspan: mergeColspan } = mergeItem
        sheetMerges.push({
          s: { r: mergeRowIndex + beforeRowCount, c: mergeColIndex },
          e: { r: mergeRowIndex + beforeRowCount + mergeRowspan - 1, c: mergeColIndex + mergeColspan - 1 }
        })
      })
    }
    footers.forEach((rows) => {
      const item: any = {}
      columns.forEach((column: any) => {
        item[column.id] = getFooterCellValue($table, options, rows, column)
      })
      footList.push(item)
    })
  }
  const exportMethod = () => {
    const workbook: ExcelJS.Workbook = new (globalExcelJS || (window as any).ExcelJS).Workbook()
    const sheet = workbook.addWorksheet(sheetName)
    workbook.creator = 'vxe-table'
    sheet.columns = sheetCols
    if (isHeader) {
      sheet.addRows(colList).forEach((excelRow: any) => {
        if (useStyle) {
          setExcelRowHeight(excelRow, rowHeight)
        }
        excelRow.eachCell((excelCell: any) => {
          const excelCol = sheet.getColumn(excelCell.col)
          const column: any = $table.getColumnById(excelCol.key as string)
          const { headerAlign, align } = column
          setExcelCellStyle(excelCell, headerAlign || align || allHeaderAlign || allAlign)
          if (useStyle) {
            Object.assign(excelCell, {
              font: {
                bold: true,
                color: {
                  argb: defaultCellFontColor
                }
              },
              fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: {
                  argb: defaultHeaderBackgroundColor
                }
              },
              border: getDefaultBorderStyle()
            })
          }
        })
      })
    }
    sheet.addRows(rowList).forEach((excelRow) => {
      if (useStyle) {
        setExcelRowHeight(excelRow, rowHeight)
      }
      excelRow.eachCell((excelCell) => {
        const excelCol = sheet.getColumn(excelCell.col)
        const column: any = $table.getColumnById(excelCol.key as string)
        const { align } = column
        setExcelCellStyle(excelCell, align || allAlign)
        if (useStyle) {
          Object.assign(excelCell, {
            font: {
              color: {
                argb: defaultCellFontColor
              }
            },
            border: getDefaultBorderStyle()
          })
        }
      })
    })
    if (isFooter) {
      sheet.addRows(footList).forEach(excelRow => {
        if (useStyle) {
          setExcelRowHeight(excelRow, rowHeight)
        }
        excelRow.eachCell(excelCell => {
          const excelCol = sheet.getColumn(excelCell.col)
          const column: any = $table.getColumnById(excelCol.key as string)
          const { footerAlign, align } = column
          setExcelCellStyle(excelCell, footerAlign || align || allFooterAlign || allAlign)
          if (useStyle) {
            Object.assign(excelCell, {
              font: {
                color: {
                  argb: defaultCellFontColor
                }
              },
              border: getDefaultBorderStyle()
            })
          }
        })
      })
    }
    // 自定义处理
    if (sheetMethod) {
      const sParams = { options: options as any, workbook, worksheet: sheet, columns, colgroups, datas, $table }
      sheetMethod(sParams)
    }
    sheetMerges.forEach(({ s, e }) => {
      sheet.mergeCells(s.r + 1, s.c + 1, e.r + 1, e.c + 1)
    })
    workbook.xlsx.writeBuffer().then((buffer: any) => {
      const blob = new Blob([buffer], { type: 'application/octet-stream' })
      // 导出 xlsx
      downloadFile(params, blob, options)
      if (showMsg && modal) {
        modal.close(msgKey)
        modal.message({ content: t('vxe.table.expSuccess') as string, status: 'success' })
      }
    })
  }
  if (showMsg && modal) {
    modal.message({ id: msgKey, content: t('vxe.table.expLoading') as string, status: 'loading', duration: -1 })
    setTimeout(exportMethod, 1500)
  } else {
    exportMethod()
  }
}

function downloadFile (params: any, blob: Blob, options: any) {
  const { $table } = params
  const { $vxe } = $table
  const { modal, t } = $vxe
  const { message, filename, type } = options
  const showMsg = message !== false
  if (window.Blob) {
    if ((navigator as any).msSaveBlob) {
      (navigator as any).msSaveBlob(blob, `${filename}.${type}`)
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
    if (showMsg && modal) {
      modal.alert({ content: t('vxe.error.notExp') as string, status: 'error' })
    }
  }
}

function checkImportData (tableFields: string[], fields: string[]) {
  return fields.some(field => tableFields.indexOf(field) > -1)
}

declare module 'vxe-table' {
  export interface Table {
    _importResolve?: Function | null;
    _importReject?: Function | null;
  }
}
function importError (params: any) {
  const { $table, options } = params
  const { $vxe, _importReject } = $table
  const showMsg = options.message !== false
  const { modal, t } = $vxe
  if (showMsg && modal) {
    modal.message({ content: t('vxe.error.impFields') as string, status: 'error' })
  }
  if (_importReject) {
    _importReject({ status: false })
  }
}

function importXLSX (params: any) {
  const { $table, columns, options, file } = params
  const { $vxe, _importResolve } = $table
  const { modal, t } = $vxe
  const showMsg = options.message !== false
  const fileReader = new FileReader()
  fileReader.onerror = () => {
    importError(params)
  }
  fileReader.onload = (evnt) => {
    const tableFields: string[] = []
    columns.forEach((column: any) => {
      const field = column.field
      if (field) {
        tableFields.push(field)
      }
    })
    const workbook: ExcelJS.Workbook = new (globalExcelJS || (window as any).ExcelJS).Workbook()
    const readerTarget = evnt.target
    if (readerTarget) {
      workbook.xlsx.load(readerTarget.result as ArrayBuffer).then(wb => {
        const firstSheet = wb.worksheets[0]
        if (firstSheet) {
          const sheetValues = firstSheet.getSheetValues() as string[][]
          const fieldIndex = XEUtils.findIndexOf(sheetValues, (list) => list && list.length > 0)
          const fields = sheetValues[fieldIndex] as string[]
          const status = checkImportData(tableFields, fields)
          if (status) {
            const records = sheetValues.slice(fieldIndex).map(list => {
              const item : any = {}
              list.forEach((cellValue, cIndex) => {
                item[fields[cIndex]] = cellValue
              })
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
            if (showMsg && modal) {
              modal.message({ content: t('vxe.table.impSuccess', [records.length]) as string, status: 'success' })
            }
          } else {
            importError(params)
          }
        } else {
          importError(params)
        }
      })
    } else {
      importError(params)
    }
  }
  fileReader.readAsArrayBuffer(file)
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
export const VXETablePluginExportXLSX = {
  install (vxetable: VXETableCore, options?: {
    ExcelJS?: any
  }) {
    // 检查版本
    if (!/^(3)\./.test(vxetable.version)) {
      console.error('[vxe-table-plugin-export-xlsx 3.x] Version vxe-table 3.x is required')
    }

    globalExcelJS = options ? options.ExcelJS : null

    vxetable.config({
      table: {
        importConfig: {
          _typeMaps: {
            xlsx: 1
          }
        },
        exportConfig: {
          _typeMaps: {
            xlsx: 1
          }
        }
      },
      export: {
        types: {
          xlsx: 0
        }
      }
    })
    vxetable.interceptor.mixin({
      'event.import': handleImportEvent,
      'event.export': handleExportEvent
    })
  }
}

if (typeof window !== 'undefined' && window.VXETable && window.VXETable.use) {
  window.VXETable.use(VXETablePluginExportXLSX)
}

export default VXETablePluginExportXLSX
