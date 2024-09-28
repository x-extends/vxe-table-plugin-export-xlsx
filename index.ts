import XEUtils from 'xe-utils'
import type { VXETableCore, VxeTableConstructor, VxeTablePropTypes, VxeTableDefines, VxeGlobalInterceptorHandles } from 'vxe-table'
import type ExcelJS from 'exceljs'

let globalVxetable: VXETableCore
let globalExcelJS: any

declare module 'vxe-table' {
  export namespace VxeTableDefines {
    export interface ExtortSheetMethodParams {
      workbook: ExcelJS.Workbook;
      worksheet: ExcelJS.Worksheet;
    }
    export interface ColumnInfo {
      _row: any;
      _colSpan: number;
      _rowSpan: number;
      childNodes: VxeTableDefines.ColumnInfo[];
    }
  }
}

const defaultHeaderBackgroundColor = 'f8f8f9'
const defaultCellFontColor = '606266'
const defaultCellBorderStyle = 'thin'
const defaultCellBorderColor = 'e8eaec'

function getCellLabel (column: VxeTableDefines.ColumnInfo, cellValue: any) {
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

function getFooterData (opts: VxeTablePropTypes.ExportConfig, footerData: any[][]) {
  const { footerFilterMethod } = opts
  return footerFilterMethod ? footerData.filter((items, index) => footerFilterMethod({ items, $rowIndex: index })) : footerData
}

function getFooterCellValue ($xeTable: VxeTableConstructor, opts: VxeTablePropTypes.ExportConfig, row: any, column: VxeTableDefines.ColumnInfo) {
  const _columnIndex = $xeTable.getVTColumnIndex(column)
  // 兼容老模式
  if (XEUtils.isArray(row)) {
    return getCellLabel(column, row[_columnIndex])
  }
  return getCellLabel(column, XEUtils.get(row, column.field))
}

function getValidColumn (column: VxeTableDefines.ColumnInfo): VxeTableDefines.ColumnInfo {
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

function setExcelCellStyle (excelCell: ExcelJS.Cell, align?: VxeTablePropTypes.Align | VxeTablePropTypes.HeaderAlign | VxeTablePropTypes.FooterAlign) {
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

function exportXLSX (params: VxeGlobalInterceptorHandles.InterceptorExportParams) {
  const msgKey = 'xlsx'
  const { modal, t } = globalVxetable
  const { $table, options, columns, colgroups, datas } = params
  const { props, reactData } = $table
  const { computeColumnOpts } = $table.getComputeMaps()
  const { headerAlign: allHeaderAlign, align: allAlign, footerAlign: allFooterAlign } = props
  const { rowHeight } = reactData
  const { message, sheetName, isHeader, isFooter, isMerge, isColgroup, original, useStyle, sheetMethod } = options
  const columnOpts = computeColumnOpts.value
  const showMsg = message !== false
  const mergeCells = $table.getMergeCells()
  const colList: any[] = []
  const footList: any[] = []
  const sheetCols: any[] = []
  const sheetMerges: { s: { r: number, c: number }, e: { r: number, c: number } }[] = []
  let beforeRowCount = 0
  columns.forEach((column) => {
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
      colgroups.forEach((cols, rIndex) => {
        const groupHead: any = {}
        columns.forEach((column) => {
          groupHead[column.id] = null
        })
        cols.forEach((column) => {
          const { _colSpan, _rowSpan } = column
          const validColumn = getValidColumn(column)
          const columnIndex = columns.indexOf(validColumn)
          const headExportMethod = (column as any).headerExportMethod || (columnOpts as any).headerExportMethod
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
      columns.forEach((column) => {
        const { id, field } = column as any
        const headExportMethod = (column as any).headerExportMethod || (columnOpts as any).headerExportMethod
        colHead[id] = headExportMethod ? headExportMethod({ column, options, $table }) : (original ? field : column.getTitle())
      })
      colList.push(colHead)
    }
    beforeRowCount += colList.length
  }
  // 处理合并
  if (isMerge) {
    mergeCells.forEach(mergeItem => {
      const { row: mergeRowIndex, rowspan: mergeRowspan, col: mergeColIndex, colspan: mergeColspan } = mergeItem
      sheetMerges.push({
        s: { r: mergeRowIndex + beforeRowCount, c: mergeColIndex },
        e: { r: mergeRowIndex + beforeRowCount + mergeRowspan - 1, c: mergeColIndex + mergeColspan - 1 }
      })
    })
  }
  const rowList = datas.map(item => {
    const rest: any = {}
    columns.forEach((column) => {
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
      mergeFooterItems.forEach(mergeItem => {
        const { row: mergeRowIndex, rowspan: mergeRowspan, col: mergeColIndex, colspan: mergeColspan } = mergeItem
        sheetMerges.push({
          s: { r: mergeRowIndex + beforeRowCount, c: mergeColIndex },
          e: { r: mergeRowIndex + beforeRowCount + mergeRowspan - 1, c: mergeColIndex + mergeColspan - 1 }
        })
      })
    }
    footers.forEach((rows) => {
      const item: any = {}
      columns.forEach((column) => {
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
      sheet.addRows(colList).forEach(excelRow => {
        if (useStyle) {
          setExcelRowHeight(excelRow, rowHeight)
        }
        excelRow.eachCell(excelCell => {
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
    sheet.addRows(rowList).forEach(excelRow => {
      if (useStyle) {
        setExcelRowHeight(excelRow, rowHeight)
      }
      excelRow.eachCell(excelCell => {
        const excelCol = sheet.getColumn(excelCell.col)
        const column = $table.getColumnById(excelCol.key as string)
        if (column) {
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
          const column = $table.getColumnById(excelCol.key as string)
          if (column) {
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
          }
        })
      })
    }
    // 自定义处理
    if (sheetMethod) {
      sheetMethod({ options: options, workbook, worksheet: sheet, columns, colgroups, datas, $table })
    }
    sheetMerges.forEach(({ s, e }) => {
      sheet.mergeCells(s.r + 1, s.c + 1, e.r + 1, e.c + 1)
    })
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/octet-stream' })
      // 导出 xlsx
      downloadFile(params, blob, options)
      if (showMsg && modal) {
        modal.close(msgKey)
        modal.message({ content: t('vxe.table.expSuccess'), status: 'success' })
      }
    })
  }
  if (showMsg && modal) {
    modal.message({ id: msgKey, content: t('vxe.table.expLoading'), status: 'loading', duration: -1 })
    setTimeout(exportMethod, 1500)
  } else {
    exportMethod()
  }
}

function downloadFile (params: VxeGlobalInterceptorHandles.InterceptorExportParams, blob: Blob, options: VxeTablePropTypes.ExportConfig) {
  const { modal, t } = globalVxetable
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
      modal.alert({ content: t('vxe.error.notExp'), status: 'error' })
    }
  }
}

function checkImportData (tableFields: string[], fields: string[]) {
  return fields.some(field => tableFields.indexOf(field) > -1)
}

function importError (params: VxeGlobalInterceptorHandles.InterceptorImportParams) {
  const { modal, t } = globalVxetable
  const { $table, options } = params
  const { internalData } = $table
  const { _importReject } = internalData
  const showMsg = options.message !== false
  if (showMsg && modal) {
    modal.message({ content: t('vxe.error.impFields'), status: 'error' })
  }
  if (_importReject) {
    _importReject({ status: false })
  }
}

function importXLSX (params: VxeGlobalInterceptorHandles.InterceptorImportParams) {
  const { modal, t } = globalVxetable
  const { $table, columns, options, file } = params
  const { internalData } = $table
  const { _importResolve } = internalData
  const showMsg = options.message !== false
  const fileReader = new FileReader()
  fileReader.onerror = () => {
    importError(params)
  }
  fileReader.onload = (evnt) => {
    const tableFields: string[] = []
    columns.forEach((column) => {
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
              modal.message({ content: t('vxe.table.impSuccess', [records.length]), status: 'success' })
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

function handleImportEvent (params: VxeGlobalInterceptorHandles.InterceptorImportParams) {
  if (params.options.type === 'xlsx') {
    importXLSX(params)
    return false
  }
}

function handleExportEvent (params: VxeGlobalInterceptorHandles.InterceptorExportParams) {
  if (params.options.type === 'xlsx') {
    exportXLSX(params)
    return false
  }
}

/**
 * 基于 vxe-table 表格的扩展插件，支持导出 xlsx 格式
 */
export const VXETablePluginExportXLSX = {
  install (vxetable: VXETableCore, options?: {
    ExcelJS?: any
  }) {
    // 检查版本
    if (!/^(4)\./.test(vxetable.version) && !/v4/i.test((vxetable as any).v)) {
      console.error('[vxe-table-plugin-export-pdf 4.x] Version vxe-table 4.x is required')
    }

    globalVxetable = vxetable
    globalExcelJS = options ? options.ExcelJS : null

    const setConfig = vxetable.setConfig || vxetable.config
    setConfig({
      table: {
        importConfig: {
          _typeMaps: {
            xlsx: 1
          }
        } as any,
        exportConfig: {
          _typeMaps: {
            xlsx: 1
          }
        } as any
      },
      // 兼容老
      export: {
        types: {
          xlsx: 0
        }
      } as any
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
