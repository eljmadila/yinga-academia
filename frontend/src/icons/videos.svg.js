var _path;
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from "react";
var SvgVideos = function SvgVideos(props) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: 25,
    height: 24,
    fill: "none"
  }, props), _path || (_path = /*#__PURE__*/React.createElement("path", {
    stroke: "currentColor",
    strokeLinejoin: "round",
    strokeWidth: 1.5,
    d: "M6.708 5.931V18.07a1.5 1.5 0 0 0 2.285 1.278l9.884-6.069a1.5 1.5 0 0 0 0-2.556L8.993 4.653a1.5 1.5 0 0 0-2.285 1.278Z"
  })));
};
export default SvgVideos;