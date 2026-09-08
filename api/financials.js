import crypto from "node:crypto";

const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

const base64Url = (value) => Buffer.from(value).toString("base64url");

const getAccessToken = async () => {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  );

  if (!email || !privateKey) {
    throw new Error("Google Sheets credentials are not configured");
  }

  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64Url(
    JSON.stringify({
      iss: email,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsignedToken = `${header}.${payload}`;
  const signature = crypto.createSign("RSA-SHA256");
  signature.update(unsignedToken);
  const assertion = `${unsignedToken}.${signature.sign(privateKey, "base64url")}`;

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok)
    throw new Error(`Google token request failed (${response.status})`);
  const data = await response.json();
  return data.access_token;
};

const readRows = async (token, range) => {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId || !range)
    throw new Error("Google Sheets ranges are not configured");

  const response = await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/${encodeURIComponent(range)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `Google Sheets read failed (${response.status}): ${details}`,
    );
  }

  const values = (await response.json()).values || [];
  const [headers = [], ...rows] = values;
  return rows
    .filter((row) => row.some((cell) => String(cell).trim()))
    .map((row) =>
      headers.reduce((record, header, index) => {
        record[String(header).trim().toLowerCase()] = row[index] ?? "";
        return record;
      }, {}),
    );
};

const numberValue = (value) =>
  Number(String(value ?? "0").replace(/[^0-9.-]/g, "")) || 0;
const firstValue = (record, keys) =>
  keys
    .map((key) => record[key])
    .find((value) => value !== undefined && value !== "") ?? "";

const mapOrder = (record, index) => ({
  id: firstValue(record, ["order id", "orderid", "id"]) || `order-${index + 1}`,
  date: firstValue(record, ["date", "created at", "createdat", "created_at"]),
  customer: firstValue(record, ["customer", "customer name", "name"]),
  status: String(firstValue(record, ["status"]) || "delivered").toLowerCase(),
  amount: numberValue(
    firstValue(record, [
      "amount",
      "total",
      "total amount",
      "totalamount",
      "revenue",
    ]),
  ),
});

const mapExpense = (record, index) => ({
  id: firstValue(record, ["id", "expense id"]) || `expense-${index + 1}`,
  date: firstValue(record, ["date", "expense date"]),
  category: firstValue(record, ["category", "type"]) || "Other",
  description: firstValue(record, ["description", "name", "expense"]),
  amount: numberValue(firstValue(record, ["amount", "cost", "total"])),
  fathy: numberValue(firstValue(record, ["fathy"])),
  megz: numberValue(firstValue(record, ["megz"])),
  totalFathy: numberValue(
    firstValue(record, ["total fathy", "totalfathy", "total_fathy"]),
  ),
  totalMegz: numberValue(
    firstValue(record, ["total megz", "totalmegz", "total_megz"]),
  ),
});

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = await getAccessToken();
    const ordersRange = process.env.GOOGLE_SHEETS_ORDERS_RANGE || "Orders!A:Z";
    const expensesRange =
      process.env.GOOGLE_SHEETS_EXPENSES_RANGE || "Expenses!A:Z";

    if (req.method === "POST") {
      const body = req.body || {};
      const owner = String(body.owner || "")
        .trim()
        .toLowerCase();
      if (
        !body.date ||
        !body.category ||
        !body.description ||
        !["fathy", "megz"].includes(owner) ||
        !Number(body.amount)
      ) {
        return res.status(400).json({
          error:
            "Date, category, description, a valid owner (Fathy or Megz), and a positive amount are required",
        });
      }

      const amount = Number(body.amount);
      const fathyValue = owner === "fathy" ? amount : 0;
      const megzValue = owner === "megz" ? amount : 0;

      const response = await fetch(
        `${SHEETS_API}/${process.env.GOOGLE_SHEETS_SPREADSHEET_ID}/values/${encodeURIComponent(expensesRange)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            values: [
              [
                body.date,
                body.category,
                amount,
                body.description,
                fathyValue,
                megzValue,
              ],
            ],
          }),
        },
      );
      if (!response.ok)
        throw new Error(`Google Sheets write failed (${response.status})`);
      return res.status(201).json({ saved: true });
    }

    const [orderRows, expenseRows] = await Promise.all([
      readRows(token, ordersRange),
      readRows(token, expensesRange),
    ]);
    return res.status(200).json({
      orders: orderRows.map(mapOrder),
      expenses: expenseRows.map(mapExpense),
    });
  } catch (error) {
    console.error("Financials API error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Unable to load financial data" });
  }
}
