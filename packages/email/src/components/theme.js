"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmailDarkModeCSS = exports.emailTheme = exports.Button = void 0;
exports.EmailThemeProvider = EmailThemeProvider;
exports.getEmailThemeClasses = getEmailThemeClasses;
exports.getEmailInlineStyles = getEmailInlineStyles;
exports.useEmailTheme = useEmailTheme;
var jsx_runtime_1 = require("react/jsx-runtime");
var components_1 = require("@react-email/components");
// Re-export Button component for convenience
var button_1 = require("./button");
Object.defineProperty(exports, "Button", { enumerable: true, get: function () { return button_1.Button; } });
// Email-optimized theme colors (avoiding pure white/black for better email client compatibility)
exports.emailTheme = {
    light: {
        background: "#ffffff",
        foreground: "#0e0e0e", // Slightly off-black to prevent auto-inversion
        muted: "#6b7280",
        border: "#e5e7eb",
        accent: "#0e0e0e",
        secondary: "#9ca3af",
    },
    dark: {
        background: "#0C0C0C",
        foreground: "#fefefe", // Slightly off-white to prevent auto-inversion
        muted: "#a1a1aa",
        border: "#1D1D1D",
        accent: "#fefefe",
        secondary: "#6b7280",
    },
};
// Industry-standard dark mode CSS for email clients
var getEmailDarkModeCSS = function () {
    return "\n    /* Root CSS for email dark mode support */\n    :root {\n      color-scheme: light dark;\n      supported-color-schemes: light dark;\n    }\n\n    /* Apple Mail, iOS Mail, and some webview clients */\n    @media (prefers-color-scheme: dark) {\n      .email-body {\n        background-color: ".concat(exports.emailTheme.dark.background, " !important;\n        color: ").concat(exports.emailTheme.dark.foreground, " !important;\n      }\n      .email-container {\n        border-color: ").concat(exports.emailTheme.dark.border, " !important;\n      }\n      .email-text {\n        color: ").concat(exports.emailTheme.dark.foreground, " !important;\n      }\n      .email-muted {\n        color: ").concat(exports.emailTheme.dark.muted, " !important;\n      }\n      .email-secondary {\n        color: ").concat(exports.emailTheme.dark.secondary, " !important;\n      }\n      .email-accent {\n        color: ").concat(exports.emailTheme.dark.accent, " !important;\n        border-color: ").concat(exports.emailTheme.dark.accent, " !important;\n      }\n      .email-border {\n        border-color: ").concat(exports.emailTheme.dark.border, " !important;\n      }\n      \n      /* Image swapping for dark mode */\n      .dark-mode-hide {\n        display: none !important;\n      }\n      .dark-mode-show {\n        display: block !important;\n      }\n    }\n\n    /* Gmail Desktop Dark Mode - Multiple targeting approaches */\n    @media (prefers-color-scheme: dark) {\n      /* Gmail specific selectors */\n      .gmail_dark .email-body,\n      .gmail_dark_theme .email-body,\n      [data-darkmode=\"true\"] .email-body {\n        background-color: ").concat(exports.emailTheme.dark.background, " !important;\n        color: ").concat(exports.emailTheme.dark.foreground, " !important;\n      }\n      .gmail_dark .email-container,\n      .gmail_dark_theme .email-container,\n      [data-darkmode=\"true\"] .email-container {\n        border-color: ").concat(exports.emailTheme.dark.border, " !important;\n      }\n      .gmail_dark .email-text,\n      .gmail_dark_theme .email-text,\n      [data-darkmode=\"true\"] .email-text {\n        color: ").concat(exports.emailTheme.dark.foreground, " !important;\n      }\n      .gmail_dark .email-muted,\n      .gmail_dark_theme .email-muted,\n      [data-darkmode=\"true\"] .email-muted {\n        color: ").concat(exports.emailTheme.dark.muted, " !important;\n      }\n      .gmail_dark .email-accent,\n      .gmail_dark_theme .email-accent,\n      [data-darkmode=\"true\"] .email-accent {\n        color: ").concat(exports.emailTheme.dark.accent, " !important;\n        border-color: ").concat(exports.emailTheme.dark.accent, " !important;\n      }\n    }\n\n    /* Gmail Desktop conditional dark mode targeting */\n    @media screen and (prefers-color-scheme: dark) {\n      /* More aggressive Gmail desktop targeting */\n      div[style*=\"background\"] .email-body,\n      .ii .email-body {\n        background-color: ").concat(exports.emailTheme.dark.background, " !important;\n        color: ").concat(exports.emailTheme.dark.foreground, " !important;\n      }\n      div[style*=\"background\"] .email-container,\n      .ii .email-container {\n        border-color: ").concat(exports.emailTheme.dark.border, " !important;\n      }\n      div[style*=\"background\"] .email-text,\n      .ii .email-text {\n        color: ").concat(exports.emailTheme.dark.foreground, " !important;\n      }\n      div[style*=\"background\"] .email-muted,\n      .ii .email-muted {\n        color: ").concat(exports.emailTheme.dark.muted, " !important;\n      }\n      div[style*=\"background\"] .email-accent,\n      .ii .email-accent {\n        color: ").concat(exports.emailTheme.dark.accent, " !important;\n        border-color: ").concat(exports.emailTheme.dark.accent, " !important;\n      }\n    }\n\n    /* Outlook Web App and Outlook mobile targeting */\n    [data-ogsc] .email-text {\n      color: ").concat(exports.emailTheme.dark.foreground, " !important;\n    }\n    [data-ogsc] .email-muted {\n      color: ").concat(exports.emailTheme.dark.muted, " !important;\n    }\n    [data-ogsc] .email-accent {\n      color: ").concat(exports.emailTheme.dark.accent, " !important;\n      border-color: ").concat(exports.emailTheme.dark.accent, " !important;\n    }\n    [data-ogsc] .dark-mode-hide {\n      display: none !important;\n    }\n    [data-ogsc] .dark-mode-show {\n      display: block !important;\n    }\n\n    /* Outlook background targeting */\n    [data-ogsb] .email-body {\n      background-color: ").concat(exports.emailTheme.dark.background, " !important;\n    }\n    [data-ogsb] .email-container {\n      border-color: ").concat(exports.emailTheme.dark.border, " !important;\n    }\n  ");
};
exports.getEmailDarkModeCSS = getEmailDarkModeCSS;
function EmailThemeProvider(_a) {
    var children = _a.children, preview = _a.preview, additionalHeadContent = _a.additionalHeadContent;
    return ((0, jsx_runtime_1.jsx)(components_1.Html, { children: (0, jsx_runtime_1.jsxs)(components_1.Tailwind, { children: [(0, jsx_runtime_1.jsxs)(components_1.Head, { children: [(0, jsx_runtime_1.jsx)("meta", { name: "color-scheme", content: "light dark" }), (0, jsx_runtime_1.jsx)("meta", { name: "supported-color-schemes", content: "light dark" }), (0, jsx_runtime_1.jsx)("meta", { name: "theme-color", content: "#0C0C0C", media: "(prefers-color-scheme: dark)" }), (0, jsx_runtime_1.jsx)("meta", { name: "theme-color", content: "#ffffff", media: "(prefers-color-scheme: light)" }), (0, jsx_runtime_1.jsx)("meta", { name: "msapplication-navbutton-color", content: "#0C0C0C" }), (0, jsx_runtime_1.jsx)("style", { children: (0, exports.getEmailDarkModeCSS)() }), (0, jsx_runtime_1.jsx)(components_1.Font, { fontFamily: "Inter", fallbackFontFamily: "Helvetica", webFont: {
                                url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
                                format: "woff2",
                            }, fontWeight: 400, fontStyle: "normal" }), (0, jsx_runtime_1.jsx)(components_1.Font, { fontFamily: "Inter", fallbackFontFamily: "Helvetica", webFont: {
                                url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
                                format: "woff2",
                            }, fontWeight: 500, fontStyle: "normal" }), (0, jsx_runtime_1.jsx)(components_1.Font, { fontFamily: "Inter", fallbackFontFamily: "Helvetica", webFont: {
                                url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
                                format: "woff2",
                            }, fontWeight: 600, fontStyle: "normal" }), additionalHeadContent] }), preview, children] }) }));
}
// Email-optimized theme classes (no Tailwind dependencies)
function getEmailThemeClasses() {
    return {
        // Base classes that work across email clients
        body: "email-body",
        container: "email-container",
        heading: "email-text",
        text: "email-text",
        mutedText: "email-muted",
        secondaryText: "email-secondary",
        button: "email-accent",
        border: "email-border",
        link: "email-text",
        mutedLink: "email-muted",
        // Dark mode image control
        hideInDark: "dark-mode-hide",
        showInDark: "dark-mode-show",
    };
}
// Utility to get inline styles (fallback for older email clients)
function getEmailInlineStyles(mode) {
    if (mode === void 0) { mode = "light"; }
    var theme = exports.emailTheme[mode];
    return {
        body: {
            backgroundColor: theme.background,
            color: theme.foreground,
        },
        container: {
            borderColor: theme.border,
        },
        text: {
            color: theme.foreground,
        },
        mutedText: {
            color: theme.muted,
        },
        secondaryText: {
            color: theme.secondary,
        },
        button: {
            color: theme.accent,
            borderColor: theme.accent,
        },
    };
}
// Simplified theme hook for email components
function useEmailTheme() {
    return {
        classes: getEmailThemeClasses(),
        lightStyles: getEmailInlineStyles("light"),
    };
}
