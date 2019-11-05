"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.VXETablePluginExport = void 0;

var _xeUtils = _interopRequireDefault(require("xe-utils/methods/xe-utils"));

var XLSX = _interopRequireWildcard(require("xlsx"));

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
      sheetName = options.sheetName,
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
exports.VXETablePluginExport = VXETablePluginExport;

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(VXETablePluginExport);
}

var _default = VXETablePluginExport;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbInRvQnVmZmVyIiwid2JvdXQiLCJidWYiLCJBcnJheUJ1ZmZlciIsImxlbmd0aCIsInZpZXciLCJVaW50OEFycmF5IiwiaW5kZXgiLCJjaGFyQ29kZUF0IiwidG9YTFNYIiwicGFyYW1zIiwib3B0aW9ucyIsImNvbHVtbnMiLCJkYXRhcyIsImZpbGVuYW1lIiwic2hlZXROYW1lIiwidHlwZSIsImlzSGVhZGVyIiwib3JpZ2luYWwiLCJjb2xIZWFkIiwiZm9yRWFjaCIsImNvbHVtbiIsImlkIiwiZ2V0VGl0bGUiLCJyb3dMaXN0IiwibWFwIiwicm93IiwiaXRlbSIsIlhFVXRpbHMiLCJnZXQiLCJwcm9wZXJ0eSIsImJvb2siLCJYTFNYIiwidXRpbHMiLCJib29rX25ldyIsInNoZWV0IiwianNvbl90b19zaGVldCIsImNvbmNhdCIsInNraXBIZWFkZXIiLCJib29rX2FwcGVuZF9zaGVldCIsIndyaXRlIiwiYm9va1R5cGUiLCJib29rU1NUIiwiYmxvYiIsIkJsb2IiLCJkb3dubG9hZCIsIndpbmRvdyIsIm5hdmlnYXRvciIsIm1zU2F2ZUJsb2IiLCJsaW5rRWxlbSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInRhcmdldCIsImhyZWYiLCJVUkwiLCJjcmVhdGVPYmplY3RVUkwiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJjbGljayIsInJlbW92ZUNoaWxkIiwiY29uc29sZSIsImVycm9yIiwiaGFuZGxlRXhwb3J0RXZlbnQiLCJWWEVUYWJsZVBsdWdpbkV4cG9ydCIsImluc3RhbGwiLCJ4dGFibGUiLCJPYmplY3QiLCJhc3NpZ24iLCJ0eXBlcyIsInhsc3giLCJpbnRlcmNlcHRvciIsImFkZCIsIlZYRVRhYmxlIiwidXNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBRUE7Ozs7Ozs7O0FBRUEsU0FBU0EsUUFBVCxDQUFrQkMsS0FBbEIsRUFBNEI7QUFDMUIsTUFBSUMsR0FBRyxHQUFHLElBQUlDLFdBQUosQ0FB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QyxFQUFBQSxPQURrQyxtQkFDMUJDLE1BRDBCLEVBQ0g7QUFDN0JDLElBQUFBLE1BQU0sQ0FBQ0MsTUFBUCxDQUFjRixNQUFNLENBQUNHLEtBQXJCLEVBQTRCO0FBQUVDLE1BQUFBLElBQUksRUFBRTtBQUFSLEtBQTVCO0FBQ0FKLElBQUFBLE1BQU0sQ0FBQ0ssV0FBUCxDQUFtQkMsR0FBbkIsQ0FBdUIsY0FBdkIsRUFBdUNULGlCQUF2QztBQUNEO0FBSmlDLENBQTdCOzs7QUFPUCxJQUFJLE9BQU9oQixNQUFQLEtBQWtCLFdBQWxCLElBQWlDQSxNQUFNLENBQUMwQixRQUE1QyxFQUFzRDtBQUNwRDFCLEVBQUFBLE1BQU0sQ0FBQzBCLFFBQVAsQ0FBZ0JDLEdBQWhCLENBQW9CVixvQkFBcEI7QUFDRDs7ZUFFY0Esb0IiLCJmaWxlIjoiaW5kZXguY29tbW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFhFVXRpbHMgZnJvbSAneGUtdXRpbHMvbWV0aG9kcy94ZS11dGlscydcclxuaW1wb3J0IFZYRVRhYmxlIGZyb20gJ3Z4ZS10YWJsZS9saWIvdnhlLXRhYmxlJ1xyXG5pbXBvcnQgKiBhcyBYTFNYIGZyb20gJ3hsc3gnXHJcblxyXG5mdW5jdGlvbiB0b0J1ZmZlcih3Ym91dDogYW55KSB7XHJcbiAgbGV0IGJ1ZiA9IG5ldyBBcnJheUJ1ZmZlcih3Ym91dC5sZW5ndGgpXHJcbiAgbGV0IHZpZXcgPSBuZXcgVWludDhBcnJheShidWYpXHJcbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCAhPT0gd2JvdXQubGVuZ3RoOyArK2luZGV4KSB2aWV3W2luZGV4XSA9IHdib3V0LmNoYXJDb2RlQXQoaW5kZXgpICYgMHhGRlxyXG4gIHJldHVybiBidWZcclxufVxyXG5cclxuZnVuY3Rpb24gdG9YTFNYKHBhcmFtczogYW55KSB7XHJcbiAgY29uc3QgeyBvcHRpb25zLCBjb2x1bW5zLCBkYXRhcyB9ID0gcGFyYW1zXHJcbiAgY29uc3QgeyBmaWxlbmFtZSwgc2hlZXROYW1lLCB0eXBlLCBpc0hlYWRlciwgb3JpZ2luYWwgfSA9IG9wdGlvbnNcclxuICBjb25zdCBjb2xIZWFkOiBhbnkgPSB7fVxyXG4gIGlmIChpc0hlYWRlcikge1xyXG4gICAgY29sdW1ucy5mb3JFYWNoKChjb2x1bW46IGFueSkgPT4ge1xyXG4gICAgICBjb2xIZWFkW2NvbHVtbi5pZF0gPSBjb2x1bW4uZ2V0VGl0bGUoKVxyXG4gICAgfSlcclxuICB9XHJcbiAgY29uc3Qgcm93TGlzdCA9IGRhdGFzLm1hcCgocm93OiBhbnkpID0+IHtcclxuICAgIGNvbnN0IGl0ZW06IGFueSA9IHt9XHJcbiAgICBjb2x1bW5zLmZvckVhY2goKGNvbHVtbjogYW55KSA9PiB7XHJcbiAgICAgIGl0ZW1bY29sdW1uLmlkXSA9IG9yaWdpbmFsID8gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpIDogcm93W2NvbHVtbi5pZF1cclxuICAgIH0pXHJcbiAgICByZXR1cm4gaXRlbVxyXG4gIH0pXHJcbiAgY29uc3QgYm9vayA9IFhMU1gudXRpbHMuYm9va19uZXcoKVxyXG4gIGNvbnN0IHNoZWV0ID0gWExTWC51dGlscy5qc29uX3RvX3NoZWV0KChpc0hlYWRlciA/IFtjb2xIZWFkXSA6IFtdKS5jb25jYXQocm93TGlzdCksIHsgc2tpcEhlYWRlcjogdHJ1ZSB9KVxyXG4gIC8vIOi9rOaNouaVsOaNrlxyXG4gIFhMU1gudXRpbHMuYm9va19hcHBlbmRfc2hlZXQoYm9vaywgc2hlZXQsIHNoZWV0TmFtZSlcclxuICBjb25zdCB3Ym91dCA9IFhMU1gud3JpdGUoYm9vaywgeyBib29rVHlwZTogdHlwZSwgYm9va1NTVDogZmFsc2UsIHR5cGU6ICdiaW5hcnknIH0pXHJcbiAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFt0b0J1ZmZlcih3Ym91dCldLCB7IHR5cGU6ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nIH0pXHJcbiAgLy8g5L+d5a2Y5a+85Ye6XHJcbiAgZG93bmxvYWQoYmxvYiwgb3B0aW9ucylcclxufVxyXG5cclxuZnVuY3Rpb24gZG93bmxvYWQoYmxvYjogQmxvYiwgb3B0aW9uczogYW55KSB7XHJcbiAgaWYgKHdpbmRvdy5CbG9iKSB7XHJcbiAgICBjb25zdCB7IGZpbGVuYW1lLCB0eXBlIH0gPSBvcHRpb25zXHJcbiAgICBpZiAobmF2aWdhdG9yLm1zU2F2ZUJsb2IpIHtcclxuICAgICAgbmF2aWdhdG9yLm1zU2F2ZUJsb2IoYmxvYiwgZmlsZW5hbWUpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB2YXIgbGlua0VsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJylcclxuICAgICAgbGlua0VsZW0udGFyZ2V0ID0gJ19ibGFuaydcclxuICAgICAgbGlua0VsZW0uZG93bmxvYWQgPSBgJHtmaWxlbmFtZX0uJHt0eXBlfWBcclxuICAgICAgbGlua0VsZW0uaHJlZiA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYilcclxuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsaW5rRWxlbSlcclxuICAgICAgbGlua0VsZW0uY2xpY2soKVxyXG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGxpbmtFbGVtKVxyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdbdnhlLXRhYmxlLXBsdWdpbi1leHBvcnRdIFRoZSBjdXJyZW50IGVudmlyb25tZW50IGRvZXMgbm90IHN1cHBvcnQgZXhwb3J0cy4nKVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlRXhwb3J0RXZlbnQocGFyYW1zOiBhbnkpIHtcclxuICBzd2l0Y2ggKHBhcmFtcy5vcHRpb25zLnR5cGUpIHtcclxuICAgIGNhc2UgJ3hsc3gnOlxyXG4gICAgICB0b1hMU1gocGFyYW1zKVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDln7rkuo4gdnhlLXRhYmxlIOihqOagvOeahOWinuW8uuaPkuS7tu+8jOaUr+aMgeWvvOWHuiB4bHN4IOetieagvOW8j1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IFZYRVRhYmxlUGx1Z2luRXhwb3J0ID0ge1xyXG4gIGluc3RhbGwoeHRhYmxlOiB0eXBlb2YgVlhFVGFibGUpIHtcclxuICAgIE9iamVjdC5hc3NpZ24oeHRhYmxlLnR5cGVzLCB7IHhsc3g6IDEgfSlcclxuICAgIHh0YWJsZS5pbnRlcmNlcHRvci5hZGQoJ2V2ZW50LmV4cG9ydCcsIGhhbmRsZUV4cG9ydEV2ZW50KVxyXG4gIH1cclxufVxyXG5cclxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5WWEVUYWJsZSkge1xyXG4gIHdpbmRvdy5WWEVUYWJsZS51c2UoVlhFVGFibGVQbHVnaW5FeHBvcnQpXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFZYRVRhYmxlUGx1Z2luRXhwb3J0XHJcbiJdfQ==
