import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const [transactions, setTransactions] = useState([]);
  const [metrics, setMetrics] = useState({});
  const navigate = useNavigate();

  const token = localStorage.getItem("admin-token");

  // Logout logic
  const logout = () => {
    localStorage.removeItem("admin-token");
    navigate("/admin-login");
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) return logout();
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/metrics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) return logout();
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.error("Failed to fetch metrics", err);
    }
  };

  const retryTransaction = async (txnId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/transactions/${txnId}/manual-retry`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.status === 401) return logout();
      const data = await res.json();
      alert(data.message);
      fetchTransactions();
      fetchMetrics();
    } catch (err) {
      console.error("Retry failed", err);
    }
  };

  useEffect(() => {
    if (!token) return navigate("/admin-login");
    fetchTransactions();
    fetchMetrics();
  }, []);

  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex justify-between items-center">
        📊 Admin Dashboard
        <button
          onClick={logout}
          className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </h1>

      {/* Metrics */}
      <div className="mb-6 flex gap-4 text-sm">
        <div className="bg-green-100 p-2 rounded">
          ✅ Success: {metrics.successCount}
        </div>
        <div className="bg-red-100 p-2 rounded">
          ❌ Failed: {metrics.failedCount}
        </div>
        <div className="bg-blue-100 p-2 rounded">
          🔁 Avg Retries: {metrics.avgRetries}
        </div>
        <div className="bg-gray-100 p-2 rounded">
          📦 Total: {metrics.total}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <table className="min-w-full table-auto border text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="border px-3 py-2">Txn ID</th>
              <th className="border px-3 py-2">User</th>
              <th className="border px-3 py-2">Amount</th>
              <th className="border px-3 py-2">Status</th>
              <th className="border px-3 py-2">Retries</th>
              <th className="border px-3 py-2">Last Error</th>
              <th className="border px-3 py-2">Created</th>
              <th className="border px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn._id} className="hover:bg-gray-50">
                <td className="border px-3 py-2">{txn._id}</td>
                <td className="border px-3 py-2">{txn.userId}</td>
                <td className="border px-3 py-2">₹{txn.amount}</td>
                <td className="border px-3 py-2">{txn.status}</td>
                <td className="border px-3 py-2">{txn.retryCount}</td>
                <td className="border px-3 py-2">{txn.lastError || "-"}</td>
                <td className="border px-3 py-2">
                  {new Date(txn.createdAt).toLocaleString()}
                </td>
                <td className="border px-3 py-2">
                  {txn.status === "failed" && (
                    <button
                      onClick={() => retryTransaction(txn._id)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-xs text-white px-2 py-1 rounded"
                    >
                      Retry
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
