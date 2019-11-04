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
exports.VXETablePluginExport = VXETablePluginExport;

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(VXETablePluginExport);
}

var _default = VXETablePluginExport;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbInRvQnVmZmVyIiwid2JvdXQiLCJidWYiLCJBcnJheUJ1ZmZlciIsImxlbmd0aCIsInZpZXciLCJVaW50OEFycmF5IiwiaW5kZXgiLCJjaGFyQ29kZUF0IiwidG9YTFNYIiwicGFyYW1zIiwib3B0aW9ucyIsImNvbHVtbnMiLCJkYXRhcyIsImZpbGVuYW1lIiwidHlwZSIsImlzSGVhZGVyIiwib3JpZ2luYWwiLCJjb2xIZWFkIiwiZm9yRWFjaCIsImNvbHVtbiIsImlkIiwiZ2V0VGl0bGUiLCJyb3dMaXN0IiwibWFwIiwicm93IiwiaXRlbSIsIlhFVXRpbHMiLCJnZXQiLCJwcm9wZXJ0eSIsImJvb2siLCJYTFNYIiwidXRpbHMiLCJib29rX25ldyIsInNoZWV0IiwianNvbl90b19zaGVldCIsImNvbmNhdCIsInNraXBIZWFkZXIiLCJib29rX2FwcGVuZF9zaGVldCIsIndyaXRlIiwiYm9va1R5cGUiLCJib29rU1NUIiwiYmxvYiIsIkJsb2IiLCJGaWxlU2F2ZXIiLCJzYXZlQXMiLCJoYW5kbGVFeHBvcnRFdmVudCIsIlZYRVRhYmxlUGx1Z2luRXhwb3J0IiwiaW5zdGFsbCIsInh0YWJsZSIsIk9iamVjdCIsImFzc2lnbiIsInR5cGVzIiwieGxzeCIsImludGVyY2VwdG9yIiwiYWRkIiwid2luZG93IiwiVlhFVGFibGUiLCJ1c2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFFQTs7QUFDQTs7Ozs7Ozs7QUFFQSxTQUFTQSxRQUFULENBQWtCQyxLQUFsQixFQUE0QjtBQUMxQixNQUFJQyxHQUFHLEdBQUcsSUFBSUMsV0FBSixDQUFnQkYsS0FBSyxDQUFDRyxNQUF0QixDQUFWO0FBQ0EsTUFBSUMsSUFBSSxHQUFHLElBQUlDLFVBQUosQ0FBZUosR0FBZixDQUFYOztBQUNBLE9BQUssSUFBSUssS0FBSyxHQUFHLENBQWpCLEVBQW9CQSxLQUFLLEtBQUtOLEtBQUssQ0FBQ0csTUFBcEMsRUFBNEMsRUFBRUcsS0FBOUM7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QUdPLElBQU1xQyxvQkFBb0IsR0FBRztBQUNsQ0MsRUFBQUEsT0FEa0MsbUJBQzFCQyxNQUQwQixFQUNmO0FBQ2pCQyxJQUFBQSxNQUFNLENBQUNDLE1BQVAsQ0FBY0YsTUFBTSxDQUFDRyxLQUFyQixFQUE0QjtBQUFFQyxNQUFBQSxJQUFJLEVBQUU7QUFBUixLQUE1QjtBQUNBSixJQUFBQSxNQUFNLENBQUNLLFdBQVAsQ0FBbUJDLEdBQW5CLENBQXVCLGNBQXZCLEVBQXVDVCxpQkFBdkM7QUFDRDtBQUppQyxDQUE3Qjs7O0FBT1AsSUFBSSxPQUFPVSxNQUFQLEtBQWtCLFdBQWxCLElBQWlDQSxNQUFNLENBQUNDLFFBQTVDLEVBQXNEO0FBQ3BERCxFQUFBQSxNQUFNLENBQUNDLFFBQVAsQ0FBZ0JDLEdBQWhCLENBQW9CWCxvQkFBcEI7QUFDRDs7ZUFFY0Esb0IiLCJmaWxlIjoiaW5kZXguY29tbW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFhFVXRpbHMgZnJvbSAneGUtdXRpbHMvbWV0aG9kcy94ZS11dGlscydcclxuaW1wb3J0IFZYRVRhYmxlIGZyb20gJ3Z4ZS10YWJsZS9saWIvdnhlLXRhYmxlJ1xyXG5pbXBvcnQgKiBhcyBYTFNYIGZyb20gJ3hsc3gnXHJcbmltcG9ydCAqIGFzIEZpbGVTYXZlciBmcm9tICdmaWxlLXNhdmVyJ1xyXG5cclxuZnVuY3Rpb24gdG9CdWZmZXIod2JvdXQ6IGFueSkge1xyXG4gIGxldCBidWYgPSBuZXcgQXJyYXlCdWZmZXIod2JvdXQubGVuZ3RoKVxyXG4gIGxldCB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxyXG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggIT09IHdib3V0Lmxlbmd0aDsgKytpbmRleCkgdmlld1tpbmRleF0gPSB3Ym91dC5jaGFyQ29kZUF0KGluZGV4KSAmIDB4RkZcclxuICByZXR1cm4gYnVmXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRvWExTWChwYXJhbXM6IGFueSkge1xyXG4gIGNvbnN0IHsgb3B0aW9ucywgY29sdW1ucywgZGF0YXMgfSA9IHBhcmFtc1xyXG4gIGNvbnN0IHsgZmlsZW5hbWUsIHR5cGUsIGlzSGVhZGVyLCBvcmlnaW5hbCB9ID0gb3B0aW9uc1xyXG4gIGNvbnN0IGNvbEhlYWQ6IGFueSA9IHt9XHJcbiAgaWYgKGlzSGVhZGVyKSB7XHJcbiAgICBjb2x1bW5zLmZvckVhY2goKGNvbHVtbjogYW55KSA9PiB7XHJcbiAgICAgIGNvbEhlYWRbY29sdW1uLmlkXSA9IGNvbHVtbi5nZXRUaXRsZSgpXHJcbiAgICB9KVxyXG4gIH1cclxuICBjb25zdCByb3dMaXN0ID0gZGF0YXMubWFwKChyb3c6IGFueSkgPT4ge1xyXG4gICAgY29uc3QgaXRlbTogYW55ID0ge31cclxuICAgIGNvbHVtbnMuZm9yRWFjaCgoY29sdW1uOiBhbnkpID0+IHtcclxuICAgICAgaXRlbVtjb2x1bW4uaWRdID0gb3JpZ2luYWwgPyBYRVV0aWxzLmdldChyb3csIGNvbHVtbi5wcm9wZXJ0eSkgOiByb3dbY29sdW1uLmlkXVxyXG4gICAgfSlcclxuICAgIHJldHVybiBpdGVtXHJcbiAgfSlcclxuICBjb25zdCBib29rID0gWExTWC51dGlscy5ib29rX25ldygpXHJcbiAgY29uc3Qgc2hlZXQgPSBYTFNYLnV0aWxzLmpzb25fdG9fc2hlZXQoKGlzSGVhZGVyID8gW2NvbEhlYWRdIDogW10pLmNvbmNhdChyb3dMaXN0KSwgeyBza2lwSGVhZGVyOiB0cnVlIH0pXHJcbiAgLy8g6L2s5o2i5pWw5o2uXHJcbiAgWExTWC51dGlscy5ib29rX2FwcGVuZF9zaGVldChib29rLCBzaGVldCwgZmlsZW5hbWUpXHJcbiAgY29uc3Qgd2JvdXQgPSBYTFNYLndyaXRlKGJvb2ssIHsgYm9va1R5cGU6IHR5cGUsIGJvb2tTU1Q6IGZhbHNlLCB0eXBlOiAnYmluYXJ5JyB9KVxyXG4gIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbdG9CdWZmZXIod2JvdXQpXSwgeyB0eXBlOiAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJyB9KVxyXG4gIC8vIOS/neWtmOWvvOWHulxyXG4gIEZpbGVTYXZlci5zYXZlQXMoYmxvYiwgYCR7ZmlsZW5hbWV9LiR7dHlwZX1gKVxyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVFeHBvcnRFdmVudChwYXJhbXM6IGFueSkge1xyXG4gIHN3aXRjaCAocGFyYW1zLm9wdGlvbnMudHlwZSkge1xyXG4gICAgY2FzZSAneGxzeCc6XHJcbiAgICAgIHRvWExTWChwYXJhbXMpXHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOWfuuS6jiB2eGUtdGFibGUg6KGo5qC855qE5aKe5by65o+S5Lu277yM5pSv5oyB5a+85Ye6IHhsc3gg562J5qC85byPXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVlhFVGFibGVQbHVnaW5FeHBvcnQgPSB7XHJcbiAgaW5zdGFsbCh4dGFibGU6IGFueSkge1xyXG4gICAgT2JqZWN0LmFzc2lnbih4dGFibGUudHlwZXMsIHsgeGxzeDogMSB9KVxyXG4gICAgeHRhYmxlLmludGVyY2VwdG9yLmFkZCgnZXZlbnQuZXhwb3J0JywgaGFuZGxlRXhwb3J0RXZlbnQpXHJcbiAgfVxyXG59XHJcblxyXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LlZYRVRhYmxlKSB7XHJcbiAgd2luZG93LlZYRVRhYmxlLnVzZShWWEVUYWJsZVBsdWdpbkV4cG9ydClcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVlhFVGFibGVQbHVnaW5FeHBvcnRcclxuIl19
