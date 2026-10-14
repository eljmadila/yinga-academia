var _path;
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from "react";
var SvgPieChart = function SvgPieChart(props) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    fill: "none"
  }, props), _path || (_path = /*#__PURE__*/React.createElement("path", {
    fill: "currentColor",
    fillRule: "evenodd",
    d: "M12 2a.75.75 0 0 0-.75.75V12c0 .414.336.75.75.75h9.25A.75.75 0 0 0 22 12c0-5.523-4.477-10-10-10m.75 9.25V3.533a8.492 8.492 0 0 1 5.26 2.457 8.5 8.5 0 0 1 2.457 5.26zM2 12c0-4.75 3.31-8.725 7.75-9.746v1.547A8.5 8.5 0 1 0 20.199 14.25h1.547C20.726 18.69 16.749 22 12 22 6.477 22 2 17.523 2 12",
    clipRule: "evenodd"
  })));
};
export default SvgPieChart;