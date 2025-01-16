import { neon } from "@neondatabase/serverless";
import { LatestInvoice } from "@/app/lib/definitions";
import { formatCurrency } from "@/app/lib/utils";
import { CustomerField } from '@/app/lib/definitions';


export type data = {
  month: string;
  revenue: number;
};

export async function getdata(): Promise<data[]> {
  try {
    const sql = neon(process.env.DATABASE_URL || "default_connection_string");
    const rawData = await sql`SELECT * FROM revenue;`;

    const data: data[] = rawData.map((row) => ({
      month: row.month as string,
      revenue: row.revenue as number,
    }));

    return data;
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    throw new Error("Failed to fetch revenue data.");
  }
}

export async function getinvoices(): Promise<LatestInvoice[]> {
    try {
      const sql = neon(process.env.DATABASE_URL || "default_connection_string");
      const rawData = await sql`SELECT * FROM customers;`;
     
      const data: LatestInvoice[] = rawData.map((row) => ({
        id: row.id as string ,
        name: row.name as string,
        email: row.email as string,
        image_url: row.image_url as string,
        amount:'1000.00'       
      }));
  
      return data;
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      throw new Error("Failed to fetch revenue data.");
    }
  }

  export async function fetchCardData() {
    try {
      const sql = neon(process.env.DATABASE_URL || "default_connection_string");
  
      // Parallel queries
      const [invoiceCountResult, customerCountResult, invoiceStatusResult] = await Promise.all([
        sql`SELECT COUNT(*) AS count FROM invoices`,
        sql`SELECT COUNT(*) AS count FROM customers`,
        sql`
          SELECT
            SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS paid,
            SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS pending
          FROM invoices
        `,
      ]);
  
      const numberOfInvoices = Number(invoiceCountResult[0]?.count || '0');
      const numberOfCustomers = Number(customerCountResult[0]?.count || '0');
      const totalPaidInvoices = formatCurrency(invoiceStatusResult[0]?.paid || '0');
      const totalPendingInvoices = formatCurrency(invoiceStatusResult[0]?.pending || '0');
  
      return {
        numberOfCustomers,
        numberOfInvoices,
        totalPaidInvoices,
        totalPendingInvoices,
      };
    } catch (error) {
      console.error("Database Error:", error);
      throw new Error("Failed to fetch card data.");
    }
  }
 
  const ITEMS_PER_PAGE = 6;
  export async function fetchFilteredInvoi(
    query: string,
    currentPage: number,
  ) {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
    const sql = neon(process.env.DATABASE_URL || "default_connection_string");
    try {
      const invoices = await sql`
        SELECT
          invoices.id,
          invoices.amount,
          invoices.date,
          invoices.status,
          customers.name,
          customers.email,
          customers.image_url
        FROM invoices
        JOIN customers ON invoices.customer_id = customers.id
        WHERE
          customers.name ILIKE ${`%${query}%`} OR
          customers.email ILIKE ${`%${query}%`} OR
          invoices.amount::text ILIKE ${`%${query}%`} OR
          invoices.date::text ILIKE ${`%${query}%`} OR
          invoices.status ILIKE ${`%${query}%`}
        ORDER BY invoices.date DESC
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
      `;
  
      return invoices;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch invoices.');
    }
  }

  export async function getCustomers() {
    try {
      const sql = neon(process.env.DATABASE_URL || "default_connection_string");
      const rewdata = await sql`
        SELECT
          id,
          name
        FROM customers
        ORDER BY name ASC
      `;
  
      const data: CustomerField[] = rewdata.map((row) => ({
        id: row.id as string ,
        name: row.name as string      
      }));
      return data;
    } catch (err) {
      console.error('Database Error:', err);
      throw new Error('Failed to fetch all customers.');
    }
  }

export type Invoice = {
  id: string;
  customer_id: string;
  amount: number;
  status: 'pending' | 'paid';
};

export async function InvoiceById(id: string): Promise<Invoice | null> {
  if (!id) {
    console.warn('Invoice ID is empty or invalid.');
    return null;
  }

  try {
    const sql = neon(process.env.DATABASE_URL || 'default_connection_string');

    const data = await sql`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    if (data.length === 0) {
      return null;
    }

    const invoice: Invoice = {
      id: data[0].id as string,
      customer_id: data[0].customer_id as string,
      amount: parseFloat(data[0].amount) / 100, // Validasi tambahan jika perlu
      status: data[0].status as 'pending' | 'paid',
    };
    console.log(invoice)
    return invoice;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}
