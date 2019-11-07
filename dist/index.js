(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define("vxe-table-plugin-export", ["exports", "xe-utils", "xlsx"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("xe-utils"), require("xlsx"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.XEUtils, global.XLSX);
    global.VXETablePluginExport = mod.exports.default;
  }
})(this, function (_exports, _xeUtils, XLSX) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports["default"] = _exports.VXETablePluginExport = void 0;
  _xeUtils = _interopRequireDefault(_xeUtils);
  XLSX = _interopRequireWildcard(XLSX);

  function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

  function toBuffer(wbout) {
    var buf = new ArrayBuffer(wbout.length);
    var view = new Uint8Array(buf);

    for (var index = 0; index !== wbout.length; ++index) {
      view[index] = wbout.charCodeAt(index) & 0xFF;
    }

    return buf;
  }

  function exportXLSX(params) {
    var $table = params.$table,
        options = params.options,
        columns = params.columns,
        datas = params.datas;
    var sheetName = options.sheetName,
        type = options.type,
        isHeader = options.isHeader,
        original = options.original,
        message = options.message;
    var colHead = {};

    if (isHeader) {
      columns.forEach(function (column) {
        colHead[column.id] = original ? column.property : column.getTitle();
      });
    }

    var rowList = datas.map(function (row) {
      var item = {};
      columns.forEach(function (column) {
        item[column.id] = original ? _xeUtils["default"].get(row, column.property) : row[column.id];
      });
      return item;
    });
    var book = XLSX.utils.book_new();
    var sheet = XLSX.utils.json_to_sheet((isHeader ? [colHead] : []).concat(rowList), {
      skipHeader: true
    }); // 转换数据

    XLSX.utils.book_append_sheet(book, sheet, sheetName);
    var wbout = XLSX.write(book, {
      bookType: type,
      bookSST: false,
      type: 'binary'
    });
    var blob = new Blob([toBuffer(wbout)], {
      type: 'application/octet-stream'
    }); // 保存导出

    download(blob, options);

    if (message) {
      $table.$XModal.message({
        message: i18n('vxe.table.expSuccess'),
        status: 'success'
      });
    }
  }

  function download(blob, options) {
    if (window.Blob) {
      var filename = options.filename,
          type = options.type;

      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, filename);
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
      console.error('[vxe-table-plugin-export] The current environment does not support exports.');
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
      list[0].split(',').forEach(function (val) {
        var field = replaceDoubleQuotation(val);

        if (field) {
          fields.push(field);
        }
      });
      rList.forEach(function (r) {
        if (r) {
          var item = {};
          r.split(',').forEach(function (val, colIndex) {
            item[fields[colIndex]] = replaceDoubleQuotation(val);
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
    var $table = params.$table,
        columns = params.columns,
        options = params.options,
        file = params.file;
    var _importCallback = $table._importCallback;
    var fileReader = new FileReader();

    fileReader.onload = function (e) {
      var workbook = XLSX.read(e.target.result, {
        type: 'binary'
      });
      var csvData = XLSX.utils.sheet_to_csv(workbook.Sheets.Sheet1);
      var rest = parseCsv(columns, csvData);
      var fields = rest.fields,
          rows = rest.rows;
      var status = checkImportData(columns, fields, rows);

      if (status) {
        $table.createData(rows).then(function (data) {
          if (options.mode === 'append') {
            $table.insertAt(data, -1);
          } else {
            $table.reloadData(data);
          }
        });

        if (options.message) {
          $table.$XModal.message({
            message: i18n('vxe.table.impSuccess'),
            status: 'success'
          });
        }
      } else if (options.message) {
        $table.$XModal.message({
          message: i18n('vxe.error.impFields'),
          status: 'error'
        });
      }

      if (_importCallback) {
        _importCallback(status);
      }
    };

    fileReader.readAsBinaryString(file);
  }

  function handleImportEvent(params) {
    switch (params.options.type) {
      case 'xlsx':
        importXLSX(params);
        return false;
    }
  }

  function handleExportEvent(params) {
    switch (params.options.type) {
      case 'xlsx':
        exportXLSX(params);
        return false;
    }
  }
  /**
   * 基于 vxe-table 表格的增强插件，支持导出 xlsx 等格式
   */


  var VXETablePluginExport = {
    install: function install(xtable) {
      Object.assign(xtable.types, {
        xlsx: 1
      });
      xtable.interceptor.mixin({
        'event.import': handleImportEvent,
        'event.export': handleExportEvent
      });
      VXETablePluginExport.t = xtable.t;
    }
  };
  _exports.VXETablePluginExport = VXETablePluginExport;

  function i18n(key) {
    if (VXETablePluginExport.t) {
      return VXETablePluginExport.t(key);
    }
  }

  if (typeof window !== 'undefined' && window.VXETable) {
    window.VXETable.use(VXETablePluginExport);
  }

  var _default = VXETablePluginExport;
  _exports["default"] = _default;
});