import { UTCDate } from "@date-fns/utc";
import type { Database } from "../client";
import {
  customers,
  exchangeRates,
  invoiceStatusEnum,
  invoices,
  teams,
} from "../schema";
import type { EditorDoc, LineItem, Template } from "../types";
import { generateToken } from "@invoice/invoice/token";
import camelcaseKeys from "camelcase-keys";
import {
  addMonths,
  eachMonthOfInterval,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
} from "date-fns";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import type { SQL } from "drizzle-orm/sql/sql";
import { v4 as uuidv4 } from "uuid";

export type GetInvoicesParams = {
  teamId: string;
  cursor?: string | null;
  pageSize?: number;
  q?: string | null;
  statuses?: string[] | null;
  customers?: string[] | null;
  start?: string | null;
  end?: string | null;
  sort?: string[] | null;
};

export async function getInvoices(db: Database, params: GetInvoicesParams) {
  const {
    teamId,
    sort,
    cursor,
    pageSize = 25,
    q,
    statuses,
    start,
    end,
    customers: customerIds,
  } = params;

  const whereConditions: SQL[] = [eq(invoices.teamId, teamId)];

  // Apply status filter
  if (statuses && statuses.length > 0) {
    const validStatuses = statuses.filter((status) =>
      invoiceStatusEnum.enumValues.includes(
        status as (typeof invoiceStatusEnum.enumValues)[number],
      ),
    ) as (typeof invoiceStatusEnum.enumValues)[number][];

    if (validStatuses.length > 0) {
      whereConditions.push(inArray(invoices.status, validStatuses));
    }
  }

  // Apply date range filter
  if (start && end) {
    whereConditions.push(gte(invoices.dueDate, start));
    whereConditions.push(lte(invoices.dueDate, end));
  }

  // Apply customer filter
  if (customerIds && customerIds.length > 0) {
    whereConditions.push(inArray(invoices.customerId, customerIds));
  }

  // Apply search query filter
  if (q) {
    if (!Number.isNaN(Number.parseInt(q))) {
      whereConditions.push(
        sql`${invoices.amount}::text = ${Number(q).toString()}`,
      );
    } else {
      whereConditions.push(
        sql`(${invoices.fts} @@ plainto_tsquery('english', ${q}) OR ${invoices.invoiceNumber} ILIKE '%' || ${q} || '%' OR ${invoices.customerName} ILIKE '%' || ${q} || '%')`,
      );
    }
  }

  // Start building the query
  const query = db
    .select({
      id: invoices.id,
      dueDate: invoices.dueDate,
      invoiceNumber: invoices.invoiceNumber,
      createdAt: invoices.createdAt,
      amount: invoices.amount,
      currency: invoices.currency,
      lineItems: invoices.lineItems,
      paymentDetails: invoices.paymentDetails,
      customerDetails: invoices.customerDetails,
      reminderSentAt: invoices.reminderSentAt,
      updatedAt: invoices.updatedAt,
      note: invoices.note,
      internalNote: invoices.internalNote,
      paidAt: invoices.paidAt,
      vat: invoices.vat,
      tax: invoices.tax,
      filePath: invoices.filePath,
      status: invoices.status,
      fileSize: invoices.fileSize,
      viewedAt: invoices.viewedAt,
      fromDetails: invoices.fromDetails,
      issueDate: invoices.issueDate,
      sentAt: invoices.sentAt,
      template: invoices.template,
      noteDetails: invoices.noteDetails,
      customerName: invoices.customerName,
      token: invoices.token,
      sentTo: invoices.sentTo,
      discount: invoices.discount,
      subtotal: invoices.subtotal,
      topBlock: invoices.topBlock,
      bottomBlock: invoices.bottomBlock,
      scheduledAt: invoices.scheduledAt,
      scheduledJobId: invoices.scheduledJobId,
      customer: {
        id: customers.id,
        name: customers.name,
        website: customers.website,
        email: customers.email,
      },
      customerId: invoices.customerId,
      team: {
        name: teams.name,
      },
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .leftJoin(teams, eq(invoices.teamId, teams.id))
    .where(and(...whereConditions));

  // Apply sorting
  if (sort && sort.length === 2) {
    const [column, direction] = sort;
    const isAscending = direction === "asc";

    if (column === "customer") {
      isAscending
        ? query.orderBy(asc(customers.name))
        : query.orderBy(desc(customers.name));
    } else if (column === "created_at") {
      isAscending
        ? query.orderBy(asc(invoices.createdAt))
        : query.orderBy(desc(invoices.createdAt));
    } else if (column === "due_date") {
      isAscending
        ? query.orderBy(asc(invoices.dueDate))
        : query.orderBy(desc(invoices.dueDate));
    } else if (column === "amount") {
      isAscending
        ? query.orderBy(asc(invoices.amount))
        : query.orderBy(desc(invoices.amount));
    } else if (column === "status") {
      isAscending
        ? query.orderBy(asc(invoices.status))
        : query.orderBy(desc(invoices.status));
    }
  } else {
    query.orderBy(desc(invoices.createdAt));
  }

  // Apply pagination
  const offset = cursor ? Number.parseInt(cursor, 10) : 0;
  query.limit(pageSize).offset(offset);

  const data = await query;

  const nextCursor =
    data && data.length === pageSize
      ? (offset + pageSize).toString()
      : undefined;

  return {
    meta: {
      cursor: nextCursor ?? null,
      hasPreviousPage: offset > 0,
      hasNextPage: data && data.length === pageSize,
    },
    data,
  };
}

export type GetInvoiceByIdParams = {
  id: string;
  teamId?: string;
};

export async function getInvoiceById(
  db: Database,
  params: GetInvoiceByIdParams,
) {
  const { id, teamId } = params;

  const [result] = await db
    .select({
      id: invoices.id,
      dueDate: invoices.dueDate,
      invoiceNumber: invoices.invoiceNumber,
      createdAt: invoices.createdAt,
      amount: invoices.amount,
      currency: invoices.currency,
      lineItems: invoices.lineItems,
      paymentDetails: invoices.paymentDetails,
      customerDetails: invoices.customerDetails,
      reminderSentAt: invoices.reminderSentAt,
      updatedAt: invoices.updatedAt,
      note: invoices.note,
      internalNote: invoices.internalNote,
      paidAt: invoices.paidAt,
      vat: invoices.vat,
      tax: invoices.tax,
      filePath: invoices.filePath,
      status: invoices.status,
      fileSize: invoices.fileSize,
      viewedAt: invoices.viewedAt,
      fromDetails: invoices.fromDetails,
      issueDate: invoices.issueDate,
      sentAt: invoices.sentAt,
      template: invoices.template,
      noteDetails: invoices.noteDetails,
      customerName: invoices.customerName,
      token: invoices.token,
      sentTo: invoices.sentTo,
      discount: invoices.discount,
      subtotal: invoices.subtotal,
      topBlock: invoices.topBlock,
      bottomBlock: invoices.bottomBlock,
      scheduledAt: invoices.scheduledAt,
      scheduledJobId: invoices.scheduledJobId,
      customer: {
        id: customers.id,
        name: customers.name,
        website: customers.website,
        email: customers.email,
      },
      customerId: invoices.customerId,
      team: {
        name: teams.name,
      },
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .leftJoin(teams, eq(invoices.teamId, teams.id))
    .where(
      and(
        eq(invoices.id, id),
        teamId !== undefined ? eq(invoices.teamId, teamId) : undefined,
      ),
    );

  if (!result) {
    return null;
  }

  return {
    ...result,
    template: camelcaseKeys(result?.template as Record<string, unknown>, {
      deep: true,
    }) as Template,
    lineItems: result.lineItems as LineItem[],
    paymentDetails: result.paymentDetails as EditorDoc | null,
    customerDetails: result.customerDetails as EditorDoc | null,
    fromDetails: result.fromDetails as EditorDoc | null,
    noteDetails: result.noteDetails as EditorDoc | null,
    topBlock: result.topBlock as EditorDoc | null,
    bottomBlock: result.bottomBlock as EditorDoc | null,
  };
}

type DraftInvoiceLineItemParams = {
  name?: string | null;
  quantity?: number;
  unit?: string | null;
  price?: number;
  vat?: number | null;
  tax?: number | null;
};

type DraftInvoiceTemplateParams = {
  customerLabel?: string;
  title?: string;
  fromLabel?: string;
  invoiceNoLabel?: string;
  issueDateLabel?: string;
  dueDateLabel?: string;
  descriptionLabel?: string;
  priceLabel?: string;
  quantityLabel?: string;
  totalLabel?: string;
  totalSummaryLabel?: string;
  vatLabel?: string;
  subtotalLabel?: string;
  taxLabel?: string;
  discountLabel?: string;
  paymentLabel?: string;
  noteLabel?: string;
  logoUrl?: string | null;
  currency?: string;
  paymentDetails?: string | null;
  fromDetails?: string | null;
  dateFormat?: string;
  includeVat?: boolean;
  includeTax?: boolean;
  includeDiscount?: boolean;
  includeDecimals?: boolean;
  includeUnits?: boolean;
  includeQr?: boolean;
  taxRate?: number;
  vatRate?: number;
  size?: "a4" | "letter";
  deliveryType?: "create" | "create_and_send" | "scheduled";
  locale?: string;
};

type DraftInvoiceParams = {
  id: string;
  template: DraftInvoiceTemplateParams;
  fromDetails?: string | null;
  customerDetails?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  paymentDetails?: string | null;
  noteDetails?: string | null;
  dueDate: string;
  issueDate: string;
  invoiceNumber: string;
  logoUrl?: string | null;
  vat?: number | null;
  tax?: number | null;
  discount?: number | null;
  subtotal?: number | null;
  topBlock?: string | null;
  bottomBlock?: string | null;
  amount?: number | null;
  lineItems?: DraftInvoiceLineItemParams[];
  token?: string;
  teamId: string;
  userId: string;
};

export async function draftInvoice(db: Database, params: DraftInvoiceParams) {
  const {
    id,
    teamId,
    userId,
    token,
    template,
    paymentDetails,
    fromDetails,
    customerDetails,
    noteDetails,
    ...restInput
  } = params;

  const useToken = token ?? (await generateToken(id));

  const { paymentDetails: _, fromDetails: __, ...restTemplate } = template;

  const [result] = await db
    .insert(invoices)
    .values({
      id,
      teamId,
      userId,
      token: useToken,
      ...restInput,
      currency: template.currency?.toUpperCase(),
      template: restTemplate,
      paymentDetails: paymentDetails,
      fromDetails: fromDetails,
      customerDetails: customerDetails,
      noteDetails: noteDetails,
    })
    .onConflictDoUpdate({
      target: invoices.id,
      set: {
        teamId,
        userId,
        token: useToken,
        ...restInput,
        currency: template.currency?.toUpperCase(),
        template: camelcaseKeys(restTemplate, { deep: true }),
        paymentDetails: paymentDetails,
        fromDetails: fromDetails,
        customerDetails: customerDetails,
        noteDetails: noteDetails,
      },
    })
    .returning();

  return result;
}

export type GetInvoiceSummaryParams = {
  teamId: string;
  statuses?: (
    | "paid"
    | "canceled"
    | "overdue"
    | "unpaid"
    | "draft"
    | "scheduled"
  )[];
};

export async function getInvoiceSummary(
  db: Database,
  params: GetInvoiceSummaryParams,
) {
  const { teamId, statuses } = params;

  const whereConditions: SQL[] = [eq(invoices.teamId, teamId)];

  if (statuses && statuses.length > 0) {
    whereConditions.push(inArray(invoices.status, statuses));
  }

  const [team] = await db
    .select({ baseCurrency: teams.baseCurrency })
    .from(teams)
    .where(eq(teams.id, teamId))
    .limit(1);

  const baseCurrency = team?.baseCurrency || "USD";

  const invoiceData = await db
    .select({
      amount: invoices.amount,
      currency: invoices.currency,
    })
    .from(invoices)
    .where(and(...whereConditions));

  if (invoiceData.length === 0) {
    return {
      totalAmount: 0,
      invoiceCount: 0,
      currency: baseCurrency,
    };
  }

  let totalAmount = 0;
  const currencyBreakdown = new Map<
    string,
    { amount: number; count: number; convertedAmount: number }
  >();

  for (const invoice of invoiceData) {
    const amount = Number(invoice.amount) || 0;
    const currency = invoice.currency || baseCurrency;

    if (currency === baseCurrency) {
      totalAmount += amount;
      const existing = currencyBreakdown.get(currency) || {
        amount: 0,
        count: 0,
        convertedAmount: 0,
      };
      currencyBreakdown.set(currency, {
        amount: existing.amount + amount,
        count: existing.count + 1,
        convertedAmount: existing.convertedAmount + amount,
      });
    } else {
      const [exchangeRate] = await db
        .select({ rate: exchangeRates.rate })
        .from(exchangeRates)
        .where(
          and(
            eq(exchangeRates.base, currency),
            eq(exchangeRates.target, baseCurrency),
          ),
        )
        .limit(1);

      if (exchangeRate?.rate) {
        const convertedAmount = amount * Number(exchangeRate.rate);
        totalAmount += convertedAmount;

        const existing = currencyBreakdown.get(currency) || {
          amount: 0,
          count: 0,
          convertedAmount: 0,
        };
        currencyBreakdown.set(currency, {
          amount: existing.amount + amount,
          count: existing.count + 1,
          convertedAmount: existing.convertedAmount + convertedAmount,
        });
      }
    }
  }

  const breakdown = Array.from(currencyBreakdown.entries())
    .map(([currency, data]) => ({
      currency,
      originalAmount: Math.round(data.amount * 100) / 100,
      convertedAmount: Math.round(data.convertedAmount * 100) / 100,
      count: data.count,
    }))
    .sort((a, b) => b.originalAmount - a.originalAmount);

  const invoiceCount = Array.from(currencyBreakdown.values()).reduce(
    (sum, data) => sum + data.count,
    0,
  );

  return {
    totalAmount: Math.round(totalAmount * 100) / 100,
    invoiceCount,
    currency: baseCurrency,
    breakdown: breakdown.length > 1 ? breakdown : undefined,
  };
}

export type DeleteInvoiceParams = {
  id: string;
  teamId: string;
};

export async function deleteInvoice(db: Database, params: DeleteInvoiceParams) {
  const { id, teamId } = params;

  const [result] = await db
    .delete(invoices)
    .where(
      and(
        eq(invoices.id, id),
        eq(invoices.teamId, teamId),
        and(or(eq(invoices.status, "draft"), eq(invoices.status, "canceled"))),
      ),
    )
    .returning({
      id: invoices.id,
    });

  return result;
}

export type UpdateInvoiceParams = {
  id: string;
  status?: "paid" | "canceled" | "unpaid" | "scheduled" | "draft";
  paidAt?: string | null;
  internalNote?: string | null;
  reminderSentAt?: string | null;
  scheduledAt?: string | null;
  scheduledJobId?: string | null;
  teamId: string;
  userId?: string;
};

export async function updateInvoice(db: Database, params: UpdateInvoiceParams) {
  const { id, teamId, userId, ...rest } = params;

  const [result] = await db
    .update(invoices)
    .set(rest)
    .where(and(eq(invoices.id, id), eq(invoices.teamId, teamId)))
    .returning();

  return result;
}

export async function getNextInvoiceNumber(
  db: Database,
  teamId: string,
): Promise<string> {
  const [row] = await db.execute(
    sql`SELECT get_next_invoice_number(${teamId}) AS next_invoice_number`,
  );

  if (!row) {
    throw new Error("Failed to fetch next invoice number");
  }

  return row.next_invoice_number as string;
}

export async function isInvoiceNumberUsed(
  db: Database,
  teamId: string,
  invoiceNumber: string,
): Promise<boolean> {
  const [result] = await db
    .select({
      id: invoices.id,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.teamId, teamId),
        eq(invoices.invoiceNumber, invoiceNumber),
      ),
    )
    .limit(1);

  return !!result;
}