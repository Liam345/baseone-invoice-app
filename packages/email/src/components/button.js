"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = Button;
var jsx_runtime_1 = require("react/jsx-runtime");
var components_1 = require("@react-email/components");
var theme_1 = require("./theme");
function Button(_a) {
    var href = _a.href, children = _a.children, _b = _a.variant, variant = _b === void 0 ? "primary" : _b, _c = _a.className, className = _c === void 0 ? "" : _c;
    var themeClasses = (0, theme_1.getEmailThemeClasses)();
    var lightStyles = (0, theme_1.getEmailInlineStyles)("light");
    var baseClasses = "bg-transparent text-[14px] font-medium no-underline text-center px-6 py-3 border border-solid rounded-md";
    var variantClasses = variant === "primary"
        ? themeClasses.button
        : "border-gray-300 text-gray-600";
    // Inline styles for maximum email client compatibility
    var buttonStyle = variant === "primary"
        ? {
            color: lightStyles.button.color,
            borderColor: lightStyles.button.borderColor,
        }
        : {
            color: "#6b7280",
            borderColor: "#d1d5db",
        };
    return ((0, jsx_runtime_1.jsx)(components_1.Button, { className: "".concat(baseClasses, " ").concat(variantClasses, " ").concat(className), href: href, style: buttonStyle, children: children }));
}
