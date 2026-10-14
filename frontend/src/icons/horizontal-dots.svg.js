var _path;
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from "react";
var SvgHorizontalDots = function SvgHorizontalDots(props) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    fill: "none"
  }, props), _path || (_path = /*#__PURE__*/React.createElement("path", {
    fill: "currentColor",
    fillRule: "evenodd",
    d: "M6 10.245c.966 0 1.75.784 1.75 1.75v.01a1.75 1.75 0 0 1-3.5 0v-.01c0-.966.783-1.75 1.75-1.75m12 0c.966 0 1.75.784 1.75 1.75v.01a1.75 1.75 0 1 1-3.5 0v-.01c0-.966.783-1.75 1.75-1.75m-4.25 1.75a1.75 1.75 0 1 0-3.5 0v.01a1.75 1.75 0 1 0 3.5 0z",
    clipRule: "evenodd"
  })));
};
export default SvgHorizontalDots;