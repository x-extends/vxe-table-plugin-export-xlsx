import type ExcelJS from 'exceljs'

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
