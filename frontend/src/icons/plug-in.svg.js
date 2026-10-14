var _path;
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from "react";
var SvgPlugIn = function SvgPlugIn(props) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    fill: "none"
  }, props), _path || (_path = /*#__PURE__*/React.createElement("path", {
    fill: "currentColor",
    fillRule: "evenodd",
    d: "M14 2.75a.75.75 0 0 1 1.5 0v2.983H19a.75.75 0 0 1 0 1.5h-.5v5a6.5 6.5 0 0 1-5.75 6.457v2.56a.75.75 0 0 1-1.5 0v-2.56a6.5 6.5 0 0 1-5.75-6.457v-5H5a.75.75 0 0 1 0-1.5h3.5V2.75a.75.75 0 0 1 1.5 0v2.983h4zM7 7.233v5a5 5 0 0 0 10 0v-5z",
    clipRule: "evenodd"
  })));
};
export default SvgPlugIn;