const ADMIN_EMAIL =
  process.env.ORDER_NOTIFICATION_EMAIL || "khat.eg111@gmail.com";
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
const SENDER_NAME = process.env.BREVO_SENDER_NAME || "Khat";
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatItems = (items = []) =>
  items
    .map(
      (item) => `
  <tr>
    <td>${escapeHtml(item.name)}</td>
    <td>${escapeHtml(item.quantity)}</td>
    <td>${escapeHtml(item.price)} LE</td>
    <td>${escapeHtml(item.total)} LE</td>
  </tr>
`,
    )
    .join("");

const createEmailHtml = (order, recipientType) => {
  const customer = order.customerInfo || {};
  const greeting =
    recipientType === "customer"
      ? `Thank you ${escapeHtml(customer.name)} for your order.`
      : "A new order has been placed.";

  return `
    <h2>Khat order confirmation</h2>
    <p>${greeting}</p>
    <p><strong>Order ID:</strong> ${escapeHtml(order.orderId)}</p>
    <p><strong>Status:</strong> ${escapeHtml(order.status || "pending")}</p>
    <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse">
      <thead><tr><th>Item</th><th>Quantity</th><th>Price</th><th>Total</th></tr></thead>
      <tbody>${formatItems(order.items)}</tbody>
    </table>
    <p><strong>Order total:</strong> ${escapeHtml(order.totalAmount)} LE</p>
    ${
      recipientType === "admin"
        ? `<h3>Customer details</h3>
    <p>Name: ${escapeHtml(customer.name)}<br>
    Email: <a href="mailto:${escapeHtml(customer.email)}">${escapeHtml(customer.email)}</a><br>
    Phone: <a href="tel:${escapeHtml(customer.phone)}">${escapeHtml(customer.phone)}</a><br>
    Address: ${escapeHtml(customer.address)}</p>`
        : `<h3>Delivery details</h3>
    <p>Phone: ${escapeHtml(customer.phone)}<br>
    Address: ${escapeHtml(customer.address)}</p>`
    }
  `;
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.BREVO_API_KEY || !SENDER_EMAIL) {
    console.error("Brevo email environment variables are not configured");
    return res.status(500).json({ error: "Email service is not configured" });
  }

  const order = req.body || {};
  const customerEmail = order.customerInfo?.email;

  if (
    !order.orderId ||
    !isValidEmail(customerEmail) ||
    !Array.isArray(order.items)
  ) {
    return res.status(400).json({ error: "Invalid order data" });
  }

  const messages = [
    {
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: ADMIN_EMAIL, name: "Khat" }],
      subject: `New Khat order ${order.orderId}`,
      htmlContent: createEmailHtml(order, "admin"),
    },
    {
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [
        { email: customerEmail, name: order.customerInfo.name || "Customer" },
      ],
      subject: `Your Khat order ${order.orderId}`,
      htmlContent: createEmailHtml(order, "customer"),
    },
  ];

  try {
    await Promise.all(
      messages.map(async (message) => {
        const response = await fetch(BREVO_API_URL, {
          method: "POST",
          headers: {
            accept: "application/json",
            "api-key": process.env.BREVO_API_KEY,
            "content-type": "application/json",
          },
          body: JSON.stringify(message),
        });

        if (!response.ok) {
          const details = await response.text();
          throw new Error(`Brevo returned ${response.status}: ${details}`);
        }
      }),
    );

    return res.status(200).json({ sent: true });
  } catch (error) {
    console.error("Failed to send order emails:", error);
    return res.status(502).json({ error: "Failed to send order emails" });
  }
}
