declare module 'xlsx' {
  interface utils {
    /* eslint-disable camelcase */
    book_new(): any;
    json_to_sheet(list: any[], options: any): any;
    sheet_to_csv(Sheet: any): any;
    book_append_sheet(book: any, sheet: any, sheetName?: string): any;
  }
  interface XLSXMethods {
    utils: utils;
    read(result: any, options: any): any;
    write(book: any, options: any): any;
  }
  const XLSX: XLSXMethods
  export default XLSX
}
