export const financialService = {
  async getFinancials() {
    const response = await fetch("/api/financials");
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || "Unable to load financial data");
    return data;
  },

  async addExpense(expense) {
    const response = await fetch("/api/financials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expense),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to save expense");
    return data;
  },
};
