"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderEmail = renderEmail;
exports.renderEmailPlainText = renderEmailPlainText;
var render_1 = require("@react-email/render");
/**
 * Renders a React Email component to HTML string
 */
function renderEmail(element) {
    return (0, render_1.render)(element, {
        pretty: false, // Optimize for email clients
    });
}
/**
 * Renders a React Email component to plain text
 */
function renderEmailPlainText(element) {
    return (0, render_1.render)(element, {
        plainText: true,
    });
}
