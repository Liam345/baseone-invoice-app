import { render as reactEmailRender } from "@react-email/render";
import type { ReactElement } from "react";

/**
 * Renders a React Email component to HTML string
 */
export async function renderEmail(element: ReactElement): Promise<string> {
  return await reactEmailRender(element, {
    pretty: false, // Optimize for email clients
  });
}

/**
 * Renders a React Email component to plain text
 */
export async function renderEmailPlainText(element: ReactElement): Promise<string> {
  return await reactEmailRender(element, {
    plainText: true,
  });
}