var _path;
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from "react";
var SvgArrowRight = function SvgArrowRight(props) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: 20,
    height: 20,
    fill: "none"
  }, props), _path || (_path = /*#__PURE__*/React.createElement("path", {
    fill: "currentColor",
    fillRule: "evenodd",
    d: "M17.418 9.999a.75.75 0 0 1-.22.531l-4.997 5a.75.75 0 1 1-1.06-1.06l3.72-3.723H3.332a.75.75 0 0 1 0-1.5h11.522L11.14 5.53a.75.75 0 0 1 1.061-1.06l4.958 4.96c.158.138.259.34.259.567z",
    clipRule: "evenodd"
  })));
};
export default SvgArrowRight;