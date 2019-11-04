(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define("vxe-table-plugin-export", ["exports", "xe-utils", "xlsx", "file-saver"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("xe-utils"), require("xlsx"), require("file-saver"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.XEUtils, global.xlsx, global.fileSaver);
    global.VXETablePluginExport = mod.exports.default;
  }
})(this, function (_exports, _xeUtils, XLSX, FileSaver) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports["default"] = _exports.VXETablePluginExport = void 0;
  _xeUtils = _interopRequireDefault(_xeUtils);
  XLSX = _interopRequireWildcard(XLSX);
  FileSaver = _interopRequireWildcard(FileSaver);

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

  function toXLSX(params) {
    var options = params.options,
        columns = params.columns,
        datas = params.datas;
    var filename = options.filename,
        type = options.type,
        isHeader = options.isHeader,
        original = options.original;
    var colHead = {};

    if (isHeader) {
      columns.forEach(function (column) {
        colHead[column.id] = column.getTitle();
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

    XLSX.utils.book_append_sheet(book, sheet, filename);
    var wbout = XLSX.write(book, {
      bookType: type,
      bookSST: false,
      type: 'binary'
    });
    var blob = new Blob([toBuffer(wbout)], {
      type: 'application/octet-stream'
    }); // 保存导出

    FileSaver.saveAs(blob, "".concat(filename, ".").concat(type));
  }

  function handleExportEvent(params) {
    switch (params.options.type) {
      case 'xlsx':
        toXLSX(params);
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
      xtable.interceptor.add('event.export', handleExportEvent);
    }
  };
  _exports.VXETablePluginExport = VXETablePluginExport;

  if (typeof window !== 'undefined' && window.VXETable) {
    window.VXETable.use(VXETablePluginExport);
  }

  var _default = VXETablePluginExport;
  _exports["default"] = _default;
});