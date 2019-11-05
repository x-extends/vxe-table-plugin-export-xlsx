"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.VXETablePluginExport = void 0;

var _xeUtils = _interopRequireDefault(require("xe-utils/methods/xe-utils"));

var XLSX = _interopRequireWildcard(require("xlsx"));

var FileSaver = _interopRequireWildcard(require("file-saver"));

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
exports.VXETablePluginExport = VXETablePluginExport;

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(VXETablePluginExport);
}

var _default = VXETablePluginExport;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbInRvQnVmZmVyIiwid2JvdXQiLCJidWYiLCJBcnJheUJ1ZmZlciIsImxlbmd0aCIsInZpZXciLCJVaW50OEFycmF5IiwiaW5kZXgiLCJjaGFyQ29kZUF0IiwidG9YTFNYIiwicGFyYW1zIiwib3B0aW9ucyIsImNvbHVtbnMiLCJkYXRhcyIsImZpbGVuYW1lIiwic2hlZXROYW1lIiwidHlwZSIsImlzSGVhZGVyIiwib3JpZ2luYWwiLCJjb2xIZWFkIiwiZm9yRWFjaCIsImNvbHVtbiIsImlkIiwiZ2V0VGl0bGUiLCJyb3dMaXN0IiwibWFwIiwicm93IiwiaXRlbSIsIlhFVXRpbHMiLCJnZXQiLCJwcm9wZXJ0eSIsImJvb2siLCJYTFNYIiwidXRpbHMiLCJib29rX25ldyIsInNoZWV0IiwianNvbl90b19zaGVldCIsImNvbmNhdCIsInNraXBIZWFkZXIiLCJib29rX2FwcGVuZF9zaGVldCIsIndyaXRlIiwiYm9va1R5cGUiLCJib29rU1NUIiwiYmxvYiIsIkJsb2IiLCJGaWxlU2F2ZXIiLCJzYXZlQXMiLCJoYW5kbGVFeHBvcnRFdmVudCIsIlZYRVRhYmxlUGx1Z2luRXhwb3J0IiwiaW5zdGFsbCIsInh0YWJsZSIsIk9iamVjdCIsImFzc2lnbiIsInR5cGVzIiwieGxzeCIsImludGVyY2VwdG9yIiwiYWRkIiwid2luZG93IiwiVlhFVGFibGUiLCJ1c2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFFQTs7QUFDQTs7Ozs7Ozs7QUFFQSxTQUFTQSxRQUFULENBQWtCQyxLQUFsQixFQUE0QjtBQUMxQixNQUFJQyxHQUFHLEdBQUcsSUFBSUMsV0FBSixDQUFnQkYsS0FBSyxDQUFDRyxNQUF0QixDQUFWO0FBQ0EsTUFBSUMsSUFBSSxHQUFHLElBQUlDLFVBQUosQ0FBZUosR0FBZixDQUFYOztBQUNBLE9BQUssSUFBSUssS0FBSyxHQUFHLENBQWpCLEVBQW9CQSxLQUFLLEtBQUtOLEtBQUssQ0FBQ0csTUFBcEMsRUFBNEMs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TUFBTSxDQUFDQyxNQUFELENBQU47QUFDQSxhQUFPLEtBQVA7QUFISjtBQUtEO0FBRUQ7Ozs7O0FBR08sSUFBTXNDLG9CQUFvQixHQUFHO0FBQ2xDQyxFQUFBQSxPQURrQyxtQkFDMUJDLE1BRDBCLEVBQ0g7QUFDN0JDLElBQUFBLE1BQU0sQ0FBQ0MsTUFBUCxDQUFjRixNQUFNLENBQUNHLEtBQXJCLEVBQTRCO0FBQUVDLE1BQUFBLElBQUksRUFBRTtBQUFSLEtBQTVCO0FBQ0FKLElBQUFBLE1BQU0sQ0FBQ0ssV0FBUCxDQUFtQkMsR0FBbkIsQ0FBdUIsY0FBdkIsRUFBdUNULGlCQUF2QztBQUNEO0FBSmlDLENBQTdCOzs7QUFPUCxJQUFJLE9BQU9VLE1BQVAsS0FBa0IsV0FBbEIsSUFBaUNBLE1BQU0sQ0FBQ0MsUUFBNUMsRUFBc0Q7QUFDcERELEVBQUFBLE1BQU0sQ0FBQ0MsUUFBUCxDQUFnQkMsR0FBaEIsQ0FBb0JYLG9CQUFwQjtBQUNEOztlQUVjQSxvQiIsImZpbGUiOiJpbmRleC5jb21tb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgWEVVdGlscyBmcm9tICd4ZS11dGlscy9tZXRob2RzL3hlLXV0aWxzJ1xyXG5pbXBvcnQgVlhFVGFibGUgZnJvbSAndnhlLXRhYmxlL2xpYi92eGUtdGFibGUnXHJcbmltcG9ydCAqIGFzIFhMU1ggZnJvbSAneGxzeCdcclxuaW1wb3J0ICogYXMgRmlsZVNhdmVyIGZyb20gJ2ZpbGUtc2F2ZXInXHJcblxyXG5mdW5jdGlvbiB0b0J1ZmZlcih3Ym91dDogYW55KSB7XHJcbiAgbGV0IGJ1ZiA9IG5ldyBBcnJheUJ1ZmZlcih3Ym91dC5sZW5ndGgpXHJcbiAgbGV0IHZpZXcgPSBuZXcgVWludDhBcnJheShidWYpXHJcbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCAhPT0gd2JvdXQubGVuZ3RoOyArK2luZGV4KSB2aWV3W2luZGV4XSA9IHdib3V0LmNoYXJDb2RlQXQoaW5kZXgpICYgMHhGRlxyXG4gIHJldHVybiBidWZcclxufVxyXG5cclxuZnVuY3Rpb24gdG9YTFNYKHBhcmFtczogYW55KSB7XHJcbiAgY29uc3QgeyBvcHRpb25zLCBjb2x1bW5zLCBkYXRhcyB9ID0gcGFyYW1zXHJcbiAgY29uc3QgeyBmaWxlbmFtZSwgc2hlZXROYW1lLCB0eXBlLCBpc0hlYWRlciwgb3JpZ2luYWwgfSA9IG9wdGlvbnNcclxuICBjb25zdCBjb2xIZWFkOiBhbnkgPSB7fVxyXG4gIGlmIChpc0hlYWRlcikge1xyXG4gICAgY29sdW1ucy5mb3JFYWNoKChjb2x1bW46IGFueSkgPT4ge1xyXG4gICAgICBjb2xIZWFkW2NvbHVtbi5pZF0gPSBjb2x1bW4uZ2V0VGl0bGUoKVxyXG4gICAgfSlcclxuICB9XHJcbiAgY29uc3Qgcm93TGlzdCA9IGRhdGFzLm1hcCgocm93OiBhbnkpID0+IHtcclxuICAgIGNvbnN0IGl0ZW06IGFueSA9IHt9XHJcbiAgICBjb2x1bW5zLmZvckVhY2goKGNvbHVtbjogYW55KSA9PiB7XHJcbiAgICAgIGl0ZW1bY29sdW1uLmlkXSA9IG9yaWdpbmFsID8gWEVVdGlscy5nZXQocm93LCBjb2x1bW4ucHJvcGVydHkpIDogcm93W2NvbHVtbi5pZF1cclxuICAgIH0pXHJcbiAgICByZXR1cm4gaXRlbVxyXG4gIH0pXHJcbiAgY29uc3QgYm9vayA9IFhMU1gudXRpbHMuYm9va19uZXcoKVxyXG4gIGNvbnN0IHNoZWV0ID0gWExTWC51dGlscy5qc29uX3RvX3NoZWV0KChpc0hlYWRlciA/IFtjb2xIZWFkXSA6IFtdKS5jb25jYXQocm93TGlzdCksIHsgc2tpcEhlYWRlcjogdHJ1ZSB9KVxyXG4gIC8vIOi9rOaNouaVsOaNrlxyXG4gIFhMU1gudXRpbHMuYm9va19hcHBlbmRfc2hlZXQoYm9vaywgc2hlZXQsIHNoZWV0TmFtZSlcclxuICBjb25zdCB3Ym91dCA9IFhMU1gud3JpdGUoYm9vaywgeyBib29rVHlwZTogdHlwZSwgYm9va1NTVDogZmFsc2UsIHR5cGU6ICdiaW5hcnknIH0pXHJcbiAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFt0b0J1ZmZlcih3Ym91dCldLCB7IHR5cGU6ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nIH0pXHJcbiAgLy8g5L+d5a2Y5a+85Ye6XHJcbiAgRmlsZVNhdmVyLnNhdmVBcyhibG9iLCBgJHtmaWxlbmFtZX0uJHt0eXBlfWApXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUV4cG9ydEV2ZW50KHBhcmFtczogYW55KSB7XHJcbiAgc3dpdGNoIChwYXJhbXMub3B0aW9ucy50eXBlKSB7XHJcbiAgICBjYXNlICd4bHN4JzpcclxuICAgICAgdG9YTFNYKHBhcmFtcylcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICog5Z+65LqOIHZ4ZS10YWJsZSDooajmoLznmoTlop7lvLrmj5Lku7bvvIzmlK/mjIHlr7zlh7ogeGxzeCDnrYnmoLzlvI9cclxuICovXHJcbmV4cG9ydCBjb25zdCBWWEVUYWJsZVBsdWdpbkV4cG9ydCA9IHtcclxuICBpbnN0YWxsKHh0YWJsZTogdHlwZW9mIFZYRVRhYmxlKSB7XHJcbiAgICBPYmplY3QuYXNzaWduKHh0YWJsZS50eXBlcywgeyB4bHN4OiAxIH0pXHJcbiAgICB4dGFibGUuaW50ZXJjZXB0b3IuYWRkKCdldmVudC5leHBvcnQnLCBoYW5kbGVFeHBvcnRFdmVudClcclxuICB9XHJcbn1cclxuXHJcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuVlhFVGFibGUpIHtcclxuICB3aW5kb3cuVlhFVGFibGUudXNlKFZYRVRhYmxlUGx1Z2luRXhwb3J0KVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBWWEVUYWJsZVBsdWdpbkV4cG9ydFxyXG4iXX0=
