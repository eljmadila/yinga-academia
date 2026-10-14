var _path;
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from "react";
var SvgCloseLine = function SvgCloseLine(props) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: 17,
    height: 16,
    fill: "none"
  }, props), _path || (_path = /*#__PURE__*/React.createElement("path", {
    fill: "currentColor",
    fillRule: "evenodd",
    d: "M4.054 4.78a.75.75 0 0 1 1.06-1.06l3.22 3.22 3.218-3.218a.75.75 0 1 1 1.06 1.06L9.396 8l3.218 3.218a.75.75 0 0 1-1.06 1.06L8.333 9.061l-3.22 3.22a.75.75 0 0 1-1.06-1.061L7.274 8z",
    clipRule: "evenodd"
  })));
};
export default SvgCloseLine;