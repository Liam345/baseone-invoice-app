export type LineItem = {
  name: string; // TipTap JSONContent
  quantity: number;
  unit?: string;
  price: number;
  vat?: number;
  tax?: number;
  productId?: string;
};

export type EditorDoc = {
  type: "doc";
  content?: Array<{
    type: string;
    attrs?: Record<string, any>;
    content?: Array<any>;
  }>;
};

export type Template = {
  customerLabel: string;
  title: string;
  fromLabel: string;
  invoiceNoLabel: string;
  issueDateLabel: string;
  dueDateLabel: string;
  descriptionLabel: string;
  priceLabel: string;
  quantityLabel: string;
  totalLabel: string;
  totalSummaryLabel: string;
  vatLabel: string;
  subtotalLabel: string;
  taxLabel: string;
  discountLabel: string;
  timezone: string;
  paymentLabel: string;
  noteLabel: string;
  logoUrl: string | null;
  currency: string;
  paymentDetails: EditorDoc | null;
  fromDetails: EditorDoc | null;
  noteDetails: EditorDoc | null;
  dateFormat: string;
  includeVat: boolean;
  includeTax: boolean;
  includeDiscount: boolean;
  includeDecimals: boolean;
  includeUnits: boolean;
  includeQr: boolean;
  taxRate: number;
  vatRate: number;
  size: "a4" | "letter";
  deliveryType: "create" | "create_and_send" | "scheduled";
  locale: string;
};