var _path, _path2;
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from "react";
var SvgLock = function SvgLock(props) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: 20,
    height: 20,
    fill: "none"
  }, props), _path || (_path = /*#__PURE__*/React.createElement("path", {
    fill: "#667085",
    d: "M10.625 13.958a.625.625 0 0 0-1.25 0v1.25a.625.625 0 0 0 1.25 0z"
  })), _path2 || (_path2 = /*#__PURE__*/React.createElement("path", {
    fill: "currentColor",
    fillRule: "evenodd",
    d: "M10 1.667a4.375 4.375 0 0 0-4.375 4.375v1.562H4.584c-1.036 0-1.875.84-1.875 1.875v6.979c0 1.035.839 1.875 1.874 1.875h10.834c1.035 0 1.875-.84 1.875-1.875V9.479c0-1.036-.84-1.875-1.875-1.875h-1.042V6.042A4.375 4.375 0 0 0 10 1.667m3.125 4.375v1.562h-6.25V6.042a3.125 3.125 0 0 1 6.25 0M4.584 8.854a.625.625 0 0 0-.625.625v6.979c0 .345.28.625.624.625h10.834c.345 0 .625-.28.625-.625V9.479a.625.625 0 0 0-.625-.625z",
    clipRule: "evenodd"
  })));
};
export default SvgLock;