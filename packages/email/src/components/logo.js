"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logo = Logo;
var jsx_runtime_1 = require("react/jsx-runtime");
var components_1 = require("@react-email/components");
function Logo(_a) {
    var logoUrl = _a.logoUrl, _b = _a.companyName, companyName = _b === void 0 ? "BaseOne" : _b, _c = _a.width, width = _c === void 0 ? 40 : _c, _d = _a.height, height = _d === void 0 ? 40 : _d;
    // Default fallback logo (simple text-based logo)
    var defaultLogo = "data:image/svg+xml;base64,".concat(Buffer.from("\n    <svg width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n      <rect width=\"40\" height=\"40\" rx=\"8\" fill=\"#000\"/>\n      <text x=\"20\" y=\"28\" text-anchor=\"middle\" font-family=\"Arial, sans-serif\" font-size=\"18\" font-weight=\"bold\" fill=\"white\">B1</text>\n    </svg>\n  ").toString('base64'));
    // CSS-blended version for automatic dark mode adaptation
    return ((0, jsx_runtime_1.jsxs)(components_1.Section, { className: "mt-[32px]", children: [(0, jsx_runtime_1.jsx)("style", { children: "\n          .logo-blend {\n            filter: none;\n          }\n          \n          /* Regular dark mode - exclude Outlook.com and disable-dark-mode class */\n          @media (prefers-color-scheme: dark) {\n            .logo-blend:not([class^=\"x_\"]):not(.disable-dark-mode .logo-blend) {\n              filter: invert(1) brightness(1);\n            }\n          }\n          \n          /* Outlook.com specific dark mode targeting - but not when dark mode is disabled */\n          [data-ogsb]:not(.disable-dark-mode) .logo-blend,\n          [data-ogsc]:not(.disable-dark-mode) .logo-blend,\n          [data-ogac]:not(.disable-dark-mode) .logo-blend,\n          [data-ogab]:not(.disable-dark-mode) .logo-blend {\n            filter: invert(1) brightness(1);\n          }\n          \n          /* Force no filter when dark mode is disabled */\n          .disable-dark-mode .logo-blend {\n            filter: none !important;\n          }\n        " }), (0, jsx_runtime_1.jsx)(components_1.Img, { src: logoUrl || defaultLogo, width: width.toString(), height: height.toString(), alt: companyName, className: "my-0 mx-auto block logo-blend" })] }));
}
