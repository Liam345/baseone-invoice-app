"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceEmail = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var components_1 = require("@react-email/components");
var logo_1 = require("../components/logo");
var theme_1 = require("../components/theme");
var InvoiceEmail = function (_a) {
    var _b = _a.customerName, customerName = _b === void 0 ? "Customer" : _b, _c = _a.teamName, teamName = _c === void 0 ? "BaseOne" : _c, _d = _a.invoiceNumber, invoiceNumber = _d === void 0 ? "INV-0001" : _d, _e = _a.link, link = _e === void 0 ? "https://app.baseone.local/i/1234567890" : _e, logoUrl = _a.logoUrl, companyName = _a.companyName;
    var text = "You've Received Invoice ".concat(invoiceNumber, " from ").concat(teamName);
    var themeClasses = (0, theme_1.getEmailThemeClasses)();
    var lightStyles = (0, theme_1.getEmailInlineStyles)("light");
    return ((0, jsx_runtime_1.jsx)(theme_1.EmailThemeProvider, { preview: (0, jsx_runtime_1.jsx)(components_1.Preview, { children: text }), children: (0, jsx_runtime_1.jsx)(components_1.Body, { className: "my-auto mx-auto font-sans ".concat(themeClasses.body), style: lightStyles.body, children: (0, jsx_runtime_1.jsxs)(components_1.Container, { className: "my-[40px] mx-auto p-[20px] max-w-[600px] ".concat(themeClasses.container), style: {
                    borderStyle: "solid",
                    borderWidth: 1,
                    borderRadius: 8,
                    borderColor: lightStyles.container.borderColor,
                }, children: [(0, jsx_runtime_1.jsx)(logo_1.Logo, { logoUrl: logoUrl, companyName: companyName || teamName }), (0, jsx_runtime_1.jsxs)(components_1.Heading, { className: "text-[21px] font-normal text-center p-0 my-[30px] mx-0 ".concat(themeClasses.heading), style: { color: lightStyles.text.color }, children: ["You've Received Invoice ", invoiceNumber, " ", (0, jsx_runtime_1.jsx)("br", {}), " from ", teamName] }), (0, jsx_runtime_1.jsx)("br", {}), (0, jsx_runtime_1.jsxs)("span", { className: "font-medium ".concat(themeClasses.text), style: { color: lightStyles.text.color }, children: ["Hi ", customerName, ","] }), (0, jsx_runtime_1.jsx)(components_1.Text, { className: themeClasses.text, style: { color: lightStyles.text.color }, children: "Thank you for your business. Please find your invoice attached and review the details below. Payment is due according to the terms specified in the invoice." }), (0, jsx_runtime_1.jsx)(components_1.Text, { className: themeClasses.text, style: { color: lightStyles.text.color }, children: "If you have any questions about this invoice or need assistance, please don't hesitate to reply to this email or contact our support team." }), (0, jsx_runtime_1.jsx)(components_1.Section, { className: "text-center mt-[50px] mb-[50px]", children: (0, jsx_runtime_1.jsx)(theme_1.Button, { href: link, children: "View Invoice" }) }), (0, jsx_runtime_1.jsxs)(components_1.Text, { className: "text-[12px] ".concat(themeClasses.mutedText), style: { color: lightStyles.mutedText.color }, children: ["This email was sent by ", teamName, ". If you believe you received this email in error, please contact us."] }), (0, jsx_runtime_1.jsx)("br", {})] }) }) }));
};
exports.InvoiceEmail = InvoiceEmail;
exports.default = exports.InvoiceEmail;
