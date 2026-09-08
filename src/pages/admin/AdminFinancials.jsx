import { useEffect, useMemo, useState } from "react";
import { financialService } from "../../services/financialService";
import "./financials.css";

const tabs = [
  ["dashboard", "Dashboard"],
  ["revenue", "Revenue"],
  ["expenses", "Expenses"],
  ["category", "By Category"],
  ["monthly", "Monthly"],
];

const money = (value) =>
  `${Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

const parseMonthDate = (date) => {
  if (!date) return null;

  if (typeof date === "string") {
    const slashMatch = date.match(/^\s*(\d{1,2})\/(\d{1,2})\/(\d{4})\s*$/);
    const dashMatch = date.match(/^\s*(\d{4})-(\d{1,2})-(\d{1,2})\s*$/);

    if (slashMatch) {
      const [, day, month, year] = slashMatch;
      const parsed = new Date(Number(year), Number(month) - 1, Number(day));
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    if (dashMatch) {
      const [, year, month, day] = dashMatch;
      const parsed = new Date(Number(year), Number(month) - 1, Number(day));
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
  }

  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const monthLabel = (date) => {
  const parsed = parseMonthDate(date);
  return parsed
    ? parsed.toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Unknown";
};

function AdminFinancials() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: "Operations",
    owner: "Fathy",
    description: "",
    amount: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await financialService.getFinancials();
      setOrders(data.orders || []);
      setExpenses(data.expenses || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const visibleExpenses = expenses.filter(
    (expense) => Number(expense.amount) > 0,
  );

  const deliveredOrders = orders.filter(
    (order) => order.status === "delivered" || !order.status,
  );
  const totalRevenue = deliveredOrders.reduce(
    (sum, order) => sum + order.amount,
    0,
  );
  const totalExpenses = visibleExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const profit = totalRevenue - totalExpenses;
  const margin = totalRevenue ? (profit / totalRevenue) * 100 : null;

  const ownerTotals = useMemo(
    () =>
      visibleExpenses.reduce(
        (totals, expense) => {
          const fathySource = Number.isFinite(Number(expense.totalFathy))
            ? Number(expense.totalFathy)
            : Number(expense.fathy || 0);
          const megzSource = Number.isFinite(Number(expense.totalMegz))
            ? Number(expense.totalMegz)
            : Number(expense.megz || 0);
          totals.Fathy += fathySource;
          totals.Megz += megzSource;
          return totals;
        },
        { Fathy: 0, Megz: 0 },
      ),
    [visibleExpenses],
  );

  const fathyTotal = ownerTotals.Fathy || 0;
  const megzTotal = ownerTotals.Megz || 0;
  const fathyPercentage = totalExpenses
    ? (fathyTotal / totalExpenses) * 100
    : 0;
  const megzPercentage = totalExpenses ? (megzTotal / totalExpenses) * 100 : 0;

  const ownerSettlement = useMemo(() => {
    if (fathyTotal === megzTotal) return null;

    if (fathyTotal < megzTotal) {
      return {
        payer: "Fathy",
        receiver: "Megz",
        amount: (megzTotal - fathyTotal) / 2,
      };
    }

    return {
      payer: "Megz",
      receiver: "Fathy",
      amount: (fathyTotal - megzTotal) / 2,
    };
  }, [fathyTotal, megzTotal]);

  const categoryTotals = useMemo(
    () =>
      visibleExpenses.reduce((totals, expense) => {
        totals[expense.category] =
          (totals[expense.category] || 0) + expense.amount;
        return totals;
      }, {}),
    [visibleExpenses],
  );

  const monthlyTotals = useMemo(() => {
    const totals = {};

    deliveredOrders.forEach((order) => {
      const key = monthLabel(order.date);
      totals[key] = {
        ...(totals[key] || { revenue: 0, expenses: 0, orders: 0 }),
        revenue: (totals[key]?.revenue || 0) + order.amount,
        orders: (totals[key]?.orders || 0) + 1,
      };
    });

    visibleExpenses.forEach((expense) => {
      const key = monthLabel(expense.date);
      totals[key] = {
        ...(totals[key] || { revenue: 0, expenses: 0, orders: 0 }),
        expenses: (totals[key]?.expenses || 0) + expense.amount,
      };
    });

    return Object.entries(totals).sort(([a], [b]) => new Date(b) - new Date(a));
  }, [deliveredOrders, visibleExpenses]);

  const handleExpenseSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      await financialService.addExpense(form);
      setForm({
        date: new Date().toISOString().slice(0, 10),
        category: "Operations",
        owner: "Fathy",
        description: "",
        amount: "",
      });
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const exportData = () => {
    const rows = [
      ["Type", "Date", "Category/Customer", "Description/Order ID", "Amount"],
      ...deliveredOrders.map((order) => [
        "Revenue",
        order.date,
        order.customer,
        order.id,
        order.amount,
      ]),
      ...visibleExpenses.map((expense) => [
        "Expense",
        expense.date,
        expense.category,
        expense.description,
        expense.amount,
      ]),
    ];
    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    link.download = `khat-financials-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (loading) return <div className="loading">Loading financials...</div>;

  return (
    <section className="financials-page">
      <div className="financials-heading">
        <div>
          <p className="eyebrow">Admin reporting</p>
          <h1>Financials</h1>
        </div>
      </div>
      <nav className="financial-tabs" aria-label="Financial views">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            className={activeTab === key ? "active" : ""}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>
      {error && <p className="financial-error">{error}</p>}
      {activeTab === "dashboard" && (
        <>
          <div className="financial-summary">
            <Metric label="Delivered Orders" value={deliveredOrders.length} />
            <Metric label="Total Sales" value={money(totalRevenue)} />
            <Metric label="Total Expenses" value={money(totalExpenses)} />
            <Metric
              label="Total Profit"
              value={money(profit)}
              negative={profit < 0}
            />
            <Metric
              label="Profit Margin"
              value={margin === null ? "N/A" : `${margin.toFixed(1)}%`}
              negative={margin !== null && margin < 0}
            />
          </div>
          <div className="financial-dashboard-grid">
            <SummaryList
              title="Recent revenue"
              items={deliveredOrders.slice(0, 5).map((order) => ({
                label: order.customer || order.id,
                detail: order.date,
                value: money(order.amount),
              }))}
            />
            <SummaryList
              title="Top expense categories"
              items={Object.entries(categoryTotals)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([category, value]) => ({
                  label: category,
                  value: money(value),
                }))}
            />
          </div>
          <div className="financial-person-summary">
            <div className="financial-person-row">
              <span>Fathy</span>
              <div className="financial-person-value">
                <b>{money(fathyTotal)}</b>
                <small>{fathyPercentage.toFixed(1)}%</small>
              </div>
            </div>
            <div className="financial-person-row">
              <span>Megz</span>
              <div className="financial-person-value">
                <b>{money(megzTotal)}</b>
                <small>{megzPercentage.toFixed(1)}%</small>
              </div>
            </div>
            {ownerSettlement && (
              <div className="financial-settlement-message">
                <span>
                  {ownerSettlement.payer} has to pay {ownerSettlement.receiver}{" "}
                  <b>{money(ownerSettlement.amount)} LE</b>
                </span>
              </div>
            )}
          </div>
        </>
      )}
      {activeTab === "revenue" && (
        <DataTable
          title="Revenue from orders sheet"
          columns={["Order ID", "Date", "Customer", "Status", "Amount"]}
          rows={deliveredOrders.map((order) => [
            order.id,
            order.date,
            order.customer || "-",
            order.status,
            money(order.amount),
          ])}
        />
      )}
      {activeTab === "expenses" && (
        <div className="expenses-layout">
          <form className="expense-form" onSubmit={handleExpenseSubmit}>
            <h2>Add expense</h2>
            <label>
              Date
              <input
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm({ ...form, date: event.target.value })
                }
                required
              />
            </label>
            <label>
              Category
              <input
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
                required
              />
            </label>
            <label>
              Owner
              <select
                value={form.owner}
                onChange={(event) =>
                  setForm({ ...form, owner: event.target.value })
                }
                required
              >
                <option value="Fathy">Fathy</option>
                <option value="Megz">Megz</option>
              </select>
            </label>
            <label>
              Description
              <input
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                required
              />
            </label>
            <label>
              Amount (LE)
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(event) =>
                  setForm({ ...form, amount: event.target.value })
                }
                required
              />
            </label>
            <button className="financial-primary" disabled={saving}>
              {saving ? "Saving..." : "Add expense"}
            </button>
          </form>
          <DataTable
            title="Expenses from sheet"
            columns={[
              "Date",
              "Amount (LE)",
              "Category",
              "Description",
              "Fathy",
              "Megz",
            ]}
            rows={visibleExpenses.map((expense) => [
              expense.date,
              money(expense.amount),
              expense.category,
              expense.description,
              money(expense.fathy || 0),
              money(expense.megz || 0),
            ])}
          />
        </div>
      )}
      {activeTab === "category" && <CategoryView totals={categoryTotals} />}
      {activeTab === "monthly" && (
        <DataTable
          title="Monthly summary"
          columns={[
            "Month",
            "Orders",
            "Revenue",
            "Expenses",
            "Profit",
            "Profit %",
          ]}
          rows={monthlyTotals.map(([month, values]) => {
            const monthlyProfit = values.revenue - values.expenses;
            const monthlyProfitPct = values.revenue
              ? (monthlyProfit / values.revenue) * 100
              : null;

            return [
              month,
              values.orders || 0,
              money(values.revenue),
              money(values.expenses),
              money(monthlyProfit),
              monthlyProfitPct === null
                ? "N/A"
                : `${monthlyProfitPct.toFixed(1)}%`,
            ];
          })}
        />
      )}
      <button className="export-button" onClick={exportData}>
        Export all data
      </button>
    </section>
  );
}

function Metric({ label, value, negative }) {
  return (
    <div className="financial-metric">
      <span>{label}</span>
      <strong className={negative ? "negative" : ""}>{value}</strong>
    </div>
  );
}
function SummaryList({ title, items }) {
  return (
    <div className="financial-panel">
      <h2>{title}</h2>
      {items.length ? (
        items.map((item) => (
          <div className="summary-row" key={`${item.label}-${item.detail}`}>
            <span>
              <strong>{item.label}</strong>
              <small>{item.detail}</small>
            </span>
            <b>{item.value}</b>
          </div>
        ))
      ) : (
        <p className="empty-state">No data yet.</p>
      )}
    </div>
  );
}
function DataTable({ title, columns, rows }) {
  return (
    <div className="financial-panel table-panel">
      <h2>{title}</h2>
      {rows.length ? (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-state">No data found in this sheet.</p>
      )}
    </div>
  );
}
function CategoryView({ totals }) {
  const entries = Object.entries(totals).sort(([, a], [, b]) => b - a);
  const totalExpenses = entries.reduce((sum, [, value]) => sum + value, 0);
  const max = Math.max(...entries.map(([, value]) => value), 1);
  return (
    <div className="financial-panel category-panel">
      <h2>Expenses by category</h2>
      {entries.length ? (
        entries.map(([category, value]) => {
          const percentage = totalExpenses ? (value / totalExpenses) * 100 : 0;
          return (
            <div className="category-row" key={category}>
              <div>
                <strong>{category}</strong>
                <div className="category-value-wrap">
                  <b>{money(value)}</b>
                  <span className="category-percent">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <span>
                <i style={{ width: `${(value / max) * 100}%` }} />
              </span>
            </div>
          );
        })
      ) : (
        <p className="empty-state">No expense categories yet.</p>
      )}
    </div>
  );
}

export default AdminFinancials;
