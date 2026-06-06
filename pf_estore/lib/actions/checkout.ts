"use server"

type BillingAddress = {
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  email?: string;
  phone?: string;
}

export async function createPayFabricSession(
  amount: number,
  tender: "CreditCard" | "ECheck",
  billing: BillingAddress
): Promise<{ iframeUrl: string; transactionKey: string }> {

  const deviceId = process.env.PAYFABRIC_DEVICE_ID!;
  const devicePassword = process.env.PAYFABRIC_DEVICE_PASSWORD!;
  const baseUrl = process.env.PAYFABRIC_URL!;

  const authHeader = `${deviceId}|${devicePassword}`;
  const headers = {
    "Content-Type": "application/json",
    "Authorization": authHeader,
  };

  // Step 1 — Create transaction
  const setupId = tender === "CreditCard" ? "EVO US_CC" : "EVO US_ACH";

  const trxResponse = await fetch(`${baseUrl}/payment/api/transaction/create`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      Amount: parseFloat(amount.toFixed(2)),
      Currency: "USD",
      SetupId: setupId,
      Tender: tender,
      Type: "Sale",
  //     Card: {
  //   Tender: tender,
  // },
  Document: {
  DefaultBillTo: {
    Line1: billing.line1,
    City: billing.city,
    State: billing.state,
    Zip: billing.zip,
    Country: billing.country,
    ...(billing.email && { Email: billing.email }),
    ...(billing.phone && { Phone: billing.phone }),
  }
}
    }),
  });

  console.log("PayFabric transaction create response", trxResponse);
  // const trxData = await trxResponse.json();

  const responseText = await trxResponse.text();
console.log("PayFabric transaction create response text:", responseText);

// Then try to parse if it looks like JSON
let trxData;
try {
  trxData = JSON.parse(responseText);
} catch (e) {
  throw new Error(`PayFabric error: ${responseText}`);
}
  console.log(trxData);
  const transactionKey = trxData.Key;

  if (!transactionKey) {
    throw new Error("Failed to create PayFabric transaction");
  }

  // Step 2 — Generate JWT token
  const jwtResponse = await fetch(`${baseUrl}/payment/api/jwt/create`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      Audience: "PaymentPage",
      Subject: transactionKey,
    }),
  });

  const jwtData = await jwtResponse.json();
  const token = jwtData.Token;
  console.log("JWT token:", token)

  if (!token) {
    throw new Error("Failed to generate PayFabric JWT token");
  }

  // Step 3 — Build iframe URL with billing address pre-populated
  const params = new URLSearchParams({
    // key: transactionKey,
    token: typeof token === "string" ? token : JSON.stringify(token),
    // Street1: billing.line1,
    // City: billing.city,
    // State: billing.state,
    // Zip: billing.zip,
    // Country: billing.country,
    // ...(billing.email && { Email: billing.email }),
    // ...(billing.phone && { Phone: billing.phone }),
  });

  const iframeUrl = `${baseUrl}/Payment/Web/Transaction/ResponsiveProcess?Token=${token}`;
  console.log("iframe URL:", iframeUrl)


  return { iframeUrl, transactionKey };
}