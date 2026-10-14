var _path;
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from "react";
var SvgCopy = function SvgCopy(props) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: 20,
    height: 20,
    fill: "none"
  }, props), _path || (_path = /*#__PURE__*/React.createElement("path", {
    fill: "currentColor",
    fillRule: "evenodd",
    d: "M6.588 4.584a.5.5 0 0 1 .5-.5h8.327a.5.5 0 0 1 .5.5v8.329a.5.5 0 0 1-.5.5H7.088a.5.5 0 0 1-.5-.5zm.5-2a2 2 0 0 0-2 2v.51h-.503a2 2 0 0 0-2 2v8.322a2 2 0 0 0 2 2h8.322a2 2 0 0 0 2-2v-.503h.508a2 2 0 0 0 2-2V4.584a2 2 0 0 0-2-2zm6.319 12.329H7.088a2 2 0 0 1-2-2V6.594h-.503a.5.5 0 0 0-.5.5v8.322a.5.5 0 0 0 .5.5h8.322a.5.5 0 0 0 .5-.5z",
    clipRule: "evenodd"
  })));
};
export default SvgCopy;