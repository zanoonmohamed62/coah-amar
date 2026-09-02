import { ProductType } from "@prisma/client";

// PayPal does not settle in EGP. Charge in EUR using the same conversion already
// advertised on the site (299 EGP -> 11 EUR, 1,499 EGP -> 71 EUR) rather than a
// live FX rate — these are the two only products and the numbers are fixed.
const EUR_PRICE_BY_PRODUCT_TYPE: Record<ProductType, number> = {
  TRAINING_PLAN: 11,
  PERSONAL_COACHING: 71,
};

export function isPayPalConfigured(): boolean {
  return !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const secret = process.env.PAYPAL_CLIENT_SECRET!;
  const res = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to obtain PayPal access token");
  return data.access_token;
}

export async function createPayPalOrder({
  orderRef,
  productType,
  productName,
  returnUrl,
  cancelUrl,
}: {
  orderRef: string;
  productType: ProductType;
  productName: string;
  returnUrl: string;
  cancelUrl: string;
}): Promise<{ approvalUrl: string }> {
  const accessToken = await getAccessToken();
  const eurAmount = EUR_PRICE_BY_PRODUCT_TYPE[productType].toFixed(2);

  const res = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: orderRef,
          invoice_id: orderRef,
          description: productName,
          amount: { currency_code: "EUR", value: eurAmount },
        },
      ],
      application_context: {
        brand_name: "Amar X Split",
        user_action: "PAY_NOW",
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  });

  const data = await res.json();
  const approvalUrl = (data.links || []).find((l: { rel: string; href: string }) => l.rel === "approve")?.href;
  if (!approvalUrl) throw new Error("PayPal did not return an approval URL");

  return { approvalUrl };
}

// Called from the return page once the customer approves on PayPal's site.
// This is what actually moves the money — PayPal then fires the
// PAYMENT.CAPTURE.COMPLETED webhook asynchronously, which is what activates
// the order in the DB. This call itself does not touch our database.
export async function capturePayPalOrder(paypalOrderId: string): Promise<{ success: boolean }> {
  const accessToken = await getAccessToken();
  const res = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  const success = res.ok && (data.status === "COMPLETED" || data.status === "APPROVED");
  return { success };
}
