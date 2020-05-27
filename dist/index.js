(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define("vxe-table-plugin-export-xlsx", ["exports", "xe-utils", "xlsx"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("xe-utils"), require("xlsx"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.XEUtils, global.XLSX);
    global.VXETablePluginExportXLSX = mod.exports.default;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _xeUtils, _xlsx) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports["default"] = _exports.VXETablePluginExportXLSX = void 0;
  _xeUtils = _interopRequireDefault(_xeUtils);
  _xlsx = _interopRequireDefault(_xlsx);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

  /* eslint-disable no-unused-vars */

  /* eslint-enable no-unused-vars */
  var _vxetable;

  function getFooterCellValue($table, opts, rows, column) {
    var cellValue = rows[$table.$getColumnIndex(column)];
    return cellValue;
  }

  function toBuffer(wbout) {
    var buf = new ArrayBuffer(wbout.length);
    var view = new Uint8Array(buf);

    for (var index = 0; index !== wbout.length; ++index) {
      view[index] = wbout.charCodeAt(index) & 0xFF;
    }

    return buf;
  }

  function getCellLabel(column, cellValue) {
    if (cellValue) {
      switch (column.cellType) {
        case 'string':
          break;

        case 'number':
          if (!isNaN(cellValue)) {
            return Number(cellValue);
          }

          break;

        default:
          if (cellValue.length < 12 && !isNaN(cellValue)) {
            return Number(cellValue);
          }

          break;
      }
    }

    return cellValue;
  }

  function exportXLSX(params) {
    var msgKey = 'xlsx';
    var $table = params.$table,
        options = params.options,
        columns = params.columns,
        datas = params.datas;
    var sheetName = options.sheetName,
        isHeader = options.isHeader,
        isFooter = options.isFooter,
        original = options.original,
        footerFilterMethod = options.footerFilterMethod;
    var showMsg = options.message !== false;
    var colHead = {};
    var footList = [];
    var sheetCols = [];

    if (isHeader) {
      columns.forEach(function (column) {
        colHead[column.id] = original ? column.property : column.getTitle();
        sheetCols.push({
          wpx: _xeUtils["default"].toInteger(column.renderWidth * 0.8)
        });
      });
    }

    var rowList = datas.map(function (item) {
      columns.forEach(function (column) {
        item[column.id] = getCellLabel(column, item[column.id]);
      });
      return item;
    });

    if (isFooter) {
      var _$table$getTableData = $table.getTableData(),
          footerData = _$table$getTableData.footerData;

      var footers = footerFilterMethod ? footerData.filter(footerFilterMethod) : footerData;
      footers.forEach(function (rows) {
        var item = {};
        columns.forEach(function (column) {
          item[column.id] = getFooterCellValue($table, options, rows, column);
        });
        footList.push(item);
      });
    }

    var exportMethod = function exportMethod() {
      var book = _xlsx["default"].utils.book_new();

      var sheet = _xlsx["default"].utils.json_to_sheet((isHeader ? [colHead] : []).concat(rowList).concat(footList), {
        skipHeader: true
      }); // 设置列宽


      sheet['!cols'] = sheetCols; // 转换数据

      _xlsx["default"].utils.book_append_sheet(book, sheet, sheetName);

      var wbout = _xlsx["default"].write(book, {
        bookType: 'xlsx',
        bookSST: false,
        type: 'binary'
      });

      var blob = new Blob([toBuffer(wbout)], {
        type: 'application/octet-stream'
      }); // 导出 xlsx

      downloadFile(blob, options);

      if (showMsg) {
        _vxetable.modal.close(msgKey);

        _vxetable.modal.message({
          message: _vxetable.t('vxe.table.expSuccess'),
          status: 'success'
        });
      }
    };

    if (showMsg) {
      _vxetable.modal.message({
        id: msgKey,
        message: _vxetable.t('vxe.table.expLoading'),
        status: 'loading',
        duration: -1
      });

      setTimeout(exportMethod, 1500);
    } else {
      exportMethod();
    }
  }

  function downloadFile(blob, options) {
    if (window.Blob) {
      var filename = options.filename,
          type = options.type;

      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, "".concat(filename, ".").concat(type));
      } else {
        var linkElem = document.createElement('a');
        linkElem.target = '_blank';
        linkElem.download = "".concat(filename, ".").concat(type);
        linkElem.href = URL.createObjectURL(blob);
        document.body.appendChild(linkElem);
        linkElem.click();
        document.body.removeChild(linkElem);
      }
    } else {
      console.error(_vxetable.t('vxe.error.notExp'));
    }
  }

  function replaceDoubleQuotation(val) {
    return val.replace(/^"/, '').replace(/"$/, '');
  }

  function parseCsv(columns, content) {
    var list = content.split('\n');
    var fields = [];
    var rows = [];

    if (list.length) {
      var rList = list.slice(1);
      list[0].split(',').map(replaceDoubleQuotation);
      rList.forEach(function (r) {
        if (r) {
          var item = {};
          r.split(',').forEach(function (val, colIndex) {
            if (fields[colIndex]) {
              item[fields[colIndex]] = replaceDoubleQuotation(val);
            }
          });
          rows.push(item);
        }
      });
    }

    return {
      fields: fields,
      rows: rows
    };
  }

  function checkImportData(columns, fields, rows) {
    var tableFields = [];
    columns.forEach(function (column) {
      var field = column.property;

      if (field) {
        tableFields.push(field);
      }
    });
    return tableFields.every(function (field) {
      return fields.includes(field);
    });
  }

  function importXLSX(params) {
    var columns = params.columns,
        options = params.options,
        file = params.file;
    var showMsg = options.message !== false;
    var $table = params.$table;
    var _importResolve = $table._importResolve;
    var fileReader = new FileReader();

    fileReader.onload = function (e) {
      var workbook = _xlsx["default"].read(e.target.result, {
        type: 'binary'
      });

      var csvData = _xlsx["default"].utils.sheet_to_csv(workbook.Sheets.Sheet1);

      var _parseCsv = parseCsv(columns, csvData),
          fields = _parseCsv.fields,
          rows = _parseCsv.rows;

      var status = checkImportData(columns, fields, rows);

      if (status) {
        $table.createData(rows).then(function (data) {
          if (options.mode === 'append') {
            $table.insertAt(data, -1);
          } else {
            $table.reloadData(data);
          }
        });

        if (showMsg) {
          _vxetable.modal.message({
            message: _xeUtils["default"].template(_vxetable.t('vxe.table.impSuccess'), [rows.length]),
            status: 'success'
          });
        }
      } else {
        if (showMsg) {
          _vxetable.modal.message({
            message: _vxetable.t('vxe.error.impFields'),
            status: 'error'
          });
        }
      }

      if (_importResolve) {
        _importResolve(status);

        $table._importResolve = null;
      }
    };

    fileReader.readAsBinaryString(file);
  }

  function handleImportEvent(params) {
    if (params.options.type === 'xlsx') {
      importXLSX(params);
      return false;
    }
  }

  function handleExportEvent(params) {
    if (params.options.type === 'xlsx') {
      exportXLSX(params);
      return false;
    }
  }
  /**
   * 基于 vxe-table 表格的增强插件，支持导出 xlsx 格式
   */


  var VXETablePluginExportXLSX = {
    install: function install(xtable) {
      var interceptor = xtable.interceptor;
      _vxetable = xtable;
      Object.assign(xtable.types, {
        xlsx: 1
      });
      interceptor.mixin({
        'event.import': handleImportEvent,
        'event.export': handleExportEvent
      });
    }
  };
  _exports.VXETablePluginExportXLSX = VXETablePluginExportXLSX;

  if (typeof window !== 'undefined' && window.VXETable) {
    window.VXETable.use(VXETablePluginExportXLSX);
  }

  var _default = VXETablePluginExportXLSX;
  _exports["default"] = _default;
});