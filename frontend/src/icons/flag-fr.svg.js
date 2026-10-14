var _path, _path2, _path3, _circle;
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from "react";
var SvgFlagFr = function SvgFlagFr(props) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    fill: "none"
  }, props), _path || (_path = /*#__PURE__*/React.createElement("path", {
    fill: "#1E40AF",
    d: "M2 2h6.67v20H2z"
  })), _path2 || (_path2 = /*#__PURE__*/React.createElement("path", {
    fill: "#FFF",
    d: "M8.67 2h6.66v20H8.67z"
  })), _path3 || (_path3 = /*#__PURE__*/React.createElement("path", {
    fill: "#EF4444",
    d: "M15.33 2H22v20h-6.67z"
  })), _circle || (_circle = /*#__PURE__*/React.createElement("circle", {
    cx: 12,
    cy: 12,
    r: 10,
    stroke: "#D0D5DD"
  })));
};
export default SvgFlagFr;