var _path;
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from "react";
var SvgUpload = function SvgUpload(props) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: 18,
    height: 18,
    fill: "none"
  }, props), _path || (_path = /*#__PURE__*/React.createElement("path", {
    fill: "currentColor",
    d: "M15 11.25a.75.75 0 0 1 .75.75v1.5a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25V12a.75.75 0 0 1 1.5 0v1.5c0 .414.335.75.75.75h9a.75.75 0 0 0 .75-.75V12a.75.75 0 0 1 .75-.75m-5.998-9a.74.74 0 0 1 .547.241L13 5.938a.75.75 0 0 1-1.061 1.061L9.752 4.813V12a.75.75 0 0 1-1.5 0V4.809l-2.19 2.19A.75.75 0 0 1 5 5.938l3.468-3.466a.745.745 0 0 1 .532-.222"
  })));
};
export default SvgUpload;