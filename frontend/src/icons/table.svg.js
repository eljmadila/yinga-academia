var _path;
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from "react";
var SvgTable = function SvgTable(props) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    fill: "none"
  }, props), _path || (_path = /*#__PURE__*/React.createElement("path", {
    fill: "currentColor",
    fillRule: "evenodd",
    d: "M3.25 5.5A2.25 2.25 0 0 1 5.5 3.25h13a2.25 2.25 0 0 1 2.25 2.25v13a2.25 2.25 0 0 1-2.25 2.25h-13a2.25 2.25 0 0 1-2.25-2.25zm2.25-.75a.75.75 0 0 0-.75.75v3.083h14.5V5.5a.75.75 0 0 0-.75-.75zm13.75 5.333h-3.834v3.833h3.834zm-5.334 0h-3.833v3.833h3.833zm-5.333 0H4.75v3.833h3.833zM4.75 18.5v-3.084h3.833v3.834H5.5a.75.75 0 0 1-.75-.75m5.333.75v-3.834h3.833v3.834zm5.333 0v-3.834h3.834V18.5a.75.75 0 0 1-.75.75z",
    clipRule: "evenodd"
  })));
};
export default SvgTable;