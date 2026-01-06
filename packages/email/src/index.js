"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicePaidEmail = exports.InvoiceOverdueEmail = exports.InvoiceReminderEmail = exports.InvoiceEmail = void 0;
// Re-export email client and utilities
__exportStar(require("./client"), exports);
__exportStar(require("./render"), exports);
// Re-export email components
__exportStar(require("./components/theme"), exports);
__exportStar(require("./components/logo"), exports);
__exportStar(require("./components/button"), exports);
// Re-export email templates
var invoice_1 = require("./emails/invoice");
Object.defineProperty(exports, "InvoiceEmail", { enumerable: true, get: function () { return invoice_1.InvoiceEmail; } });
var invoice_reminder_1 = require("./emails/invoice-reminder");
Object.defineProperty(exports, "InvoiceReminderEmail", { enumerable: true, get: function () { return invoice_reminder_1.InvoiceReminderEmail; } });
var invoice_overdue_1 = require("./emails/invoice-overdue");
Object.defineProperty(exports, "InvoiceOverdueEmail", { enumerable: true, get: function () { return invoice_overdue_1.InvoiceOverdueEmail; } });
var invoice_paid_1 = require("./emails/invoice-paid");
Object.defineProperty(exports, "InvoicePaidEmail", { enumerable: true, get: function () { return invoice_paid_1.InvoicePaidEmail; } });
