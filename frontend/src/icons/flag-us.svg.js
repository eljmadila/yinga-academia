var _path, _path2, _path3, _marker, _path4;
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from "react";
var SvgFlagUs = function SvgFlagUs(props) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 512 512"
  }, props), _path || (_path = /*#__PURE__*/React.createElement("path", {
    fill: "#bd3d44",
    d: "M0 0h512v512H0"
  })), _path2 || (_path2 = /*#__PURE__*/React.createElement("path", {
    stroke: "#fff",
    strokeWidth: 40,
    d: "M0 58h512M0 137h512M0 216h512M0 295h512M0 374h512M0 453h512"
  })), _path3 || (_path3 = /*#__PURE__*/React.createElement("path", {
    fill: "#192f5d",
    d: "M0 0h390v275H0z"
  })), _marker || (_marker = /*#__PURE__*/React.createElement("marker", {
    id: "flag-us_svg__a",
    markerHeight: 30,
    markerWidth: 30
  }, /*#__PURE__*/React.createElement("path", {
    fill: "#fff",
    d: "m15 0 9.3 28.6L0 11h30L5.7 28.6"
  }))), _path4 || (_path4 = /*#__PURE__*/React.createElement("path", {
    fill: "none",
    markerMid: "url(#flag-us_svg__a)",
    d: "m0 0 18 11h65 65 65 65 66L51 39h65 65 65 65L18 66h65 65 65 65 66L51 94h65 65 65 65L18 121h65 65 65 65 66L51 149h65 65 65 65L18 177h65 65 65 65 66L51 205h65 65 65 65L18 232h65 65 65 65 66z"
  })));
};
export default SvgFlagUs;