import "./paymentreport.css";
import React, { useMemo, useState } from "react";
import {
  Wallet,
  ArrowLeftRight,
  Clock,
  CircleX,
  Download,
  Search,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Landmark,
  X,
  CheckCircle2,
  AlertCircle,
  DollarSign,
 } from "lucide-react";

// ==========================================
// TYPES
// ==========================================

type PaymentStatus =
  | "Successful"
  | "Pending"
  | "Failed"
  | "Refunded";

type PaymentMethod =
  | "Credit Card"
  | "PayPal"
  | "Venmo"
  | "Bank Transfer";

interface PaymentRecord {
  id: string;
  requester: string;
  requesterEmail: string;
  provider: string;
  bookingId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  transactionId: string;
  status: PaymentStatus;
  date: string;
  time: string;
}

// ==========================================
// DUMMY DATA
// ==========================================

const paymentRecords: PaymentRecord[] = [
  {
    id: "1",
    requester: "Priya Sharma",
    requesterEmail: "priya@gmail.com",
    provider: "Rahul Verma",
    bookingId: "BK-1001",
    paymentMethod: "Credit Card",
    amount: 120,
    transactionId: "txn_123456789",
    status: "Successful",
    date: "2026-11-12",
    time: "02:45 PM",
  },
  {
    id: "2",
    requester: "Amit Patel",
    requesterEmail: "amit@gmail.com",
    provider: "Sneha Kapoor",
    bookingId: "BK-1002",
    paymentMethod: "PayPal",
    amount: 85,
    transactionId: "txn_987654321",
    status: "Pending",
    date: "2026-11-12",
    time: "01:20 PM",
  },
  {
    id: "3",
    requester: "Neha Gupta",
    requesterEmail: "neha@gmail.com",
    provider: "Rajesh Kumar",
    bookingId: "BK-1003",
    paymentMethod: "Venmo",
    amount: 200,
    transactionId: "txn_456789123",
    status: "Successful",
    date: "2026-11-11",
    time: "06:15 PM",
  },
  {
    id: "4",
    requester: "Vikram Singh",
    requesterEmail: "vikram@gmail.com",
    provider: "Anita Sharma",
    bookingId: "BK-1004",
    paymentMethod: "Credit Card",
    amount: 150,
    transactionId: "txn_654321987",
    status: "Failed",
    date: "2026-11-11",
    time: "04:50 PM",
  },
  {
    id: "5",
    requester: "Rohan Mehta",
    requesterEmail: "rohan@gmail.com",
    provider: "Deepak Kumar",
    bookingId: "BK-1005",
    paymentMethod: "Bank Transfer",
    amount: 300,
    transactionId: "txn_321654987",
    status: "Successful",
    date: "2026-11-11",
    time: "03:30 PM",
  },
  {
    id: "6",
    requester: "Anjali Verma",
    requesterEmail: "anjali@gmail.com",
    provider: "Mohit Sharma",
    bookingId: "BK-1006",
    paymentMethod: "PayPal",
    amount: 175,
    transactionId: "txn_741852963",
    status: "Refunded",
    date: "2026-11-10",
    time: "11:30 AM",
  },
  {
    id: "7",
    requester: "Karan Malhotra",
    requesterEmail: "karan@gmail.com",
    provider: "Pooja Singh",
    bookingId: "BK-1007",
    paymentMethod: "Venmo",
    amount: 250,
    transactionId: "txn_852963741",
    status: "Successful",
    date: "2026-11-10",
    time: "10:15 AM",
  },
  {
    id: "8",
    requester: "Simran Kaur",
    requesterEmail: "simran@gmail.com",
    provider: "Aman Gupta",
    bookingId: "BK-1008",
    paymentMethod: "Credit Card",
    amount: 95,
    transactionId: "txn_963741852",
    status: "Pending",
    date: "2026-11-09",
    time: "09:45 AM",
  },
];

// ==========================================
// HELPERS
// ==========================================

const currency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

const statusStyle: Record<PaymentStatus, string> = {
  Successful: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Failed: "bg-red-50 text-red-600 border-red-200",
  Refunded: "bg-purple-50 text-purple-700 border-purple-200",
};

const StatusBadge = ({ status }: { status: PaymentStatus }) => {
  const Icon =
    status === "Successful"
      ? CheckCircle2
      : status === "Pending"
      ? Clock
      : AlertCircle;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold s-badge ${statusStyle[status]}`}
    >
      <Icon size={14} />
      {status}
    </span>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================

const PaymentReports: React.FC = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [methodFilter, setMethodFilter] = useState("All Methods");
  const [dateFilter, setDateFilter] = useState("Last 30 Days");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] =
    useState<PaymentRecord | null>(null);

  const pageSize = 5;

  // ========================================
  // FILTER RECORDS
  // ========================================

  const filteredRecords = useMemo(() => {
    return paymentRecords.filter((payment) => {
      const query = search.toLowerCase();

      const matchesSearch =
        payment.requester.toLowerCase().includes(query) ||
        payment.provider.toLowerCase().includes(query) ||
        payment.bookingId.toLowerCase().includes(query) ||
        payment.transactionId.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All Status" ||
        payment.status === statusFilter;

      const matchesMethod =
        methodFilter === "All Methods" ||
        payment.paymentMethod === methodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [search, statusFilter, methodFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecords.length / pageSize)
  );

  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ========================================
  // RESET FILTERS
  // ========================================

  const handleReset = () => {
    setSearch("");
    setStatusFilter("All Status");
    setMethodFilter("All Methods");
    setDateFilter("Last 30 Days");
    setCurrentPage(1);
  };

  // ========================================
  // EXPORT CSV
  // ========================================

  const handleExport = () => {
    const headers = [
      "Requester",
      "Requester Email",
      "Provider",
      "Booking ID",
      "Payment Method",
      "Amount",
      "Transaction ID",
      "Status",
      "Date",
      "Time",
    ];

    const rows = filteredRecords.map((p) => [
      p.requester,
      p.requesterEmail,
      p.provider,
      p.bookingId,
      p.paymentMethod,
      p.amount,
      p.transactionId,
      p.status,
      p.date,
      p.time,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((value) => `"${value}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "payment-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  // ========================================
  // SUMMARY CARDS
  // ========================================

  const summaryCards = [
    {
      title: "Total Payments",
      value: "$48,250.00",
      subtitle: "Total successful payment amount",
      icon: Wallet,
      color: "blue",
      change: "+12.5%",
    },
    {
      title: "Total Transactions",
      value: "342",
      subtitle: "All payment transactions",
      icon: ArrowLeftRight,
      color: "green",
      change: "+8.7%",
    },
    {
      title: "Pending Payments",
      value: "$3,750.00",
      subtitle: "Payments awaiting completion",
      icon: Clock,
      color: "orange",
      change: "+5.2%",
    },
    {
      title: "Failed Payments",
      value: "$1,250.00",
      subtitle: "Failed payment amount",
      icon: CircleX,
      color: "purple",
      change: "-8.1%",
    },
  ];

 

  return (
    <div style={{
        marginLeft: "260px",

        marginTop: "70px",

        padding: "25px",

        minHeight: "100vh",

        background: "#F5F7FB",
      }}
      className="payment-page"
      >

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 payment-header">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#14344A]">
            Payment Reports
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View complete payment summary and transaction details.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-sm outline-none"
          >
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>Last 90 Days</option>
            <option>This Year</option>
            <option>All Time</option>
          </select>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-[#143F9B] to-[#0799DC] hover:opacity-90 shadow-md"
          >
            <Download size={17} />
            Export Report
          </button>
        </div>
      </div>

      {/* ================================= */}
      {/* SUMMARY CARDS */}
      {/* ================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 payment-summary">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {card.title}
                  </p>
                  <h2 className="text-2xl font-bold text-[#14344A] mt-2">
                    {card.value}
                  </h2>
                </div>

                <div className="card-table p-3 rounded-xl ${colorStyles[card.color]}">
                  <Icon size={24} />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-gray-400">
                  {card.subtitle}
                </p>
                <span className="text-xs font-semibold text-emerald-600">
                  {card.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================================= */}
      {/* ANALYTICS SECTION */}
      {/* ================================= */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 payment-analytics">

        {/* Payment Overview Chart */}

        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#14344A]">
                Payment Overview
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Payment performance over time
              </p>
            </div>

            <select className="border rounded-lg px-3 py-2 text-sm outline-none">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>Last 12 Months</option>
            </select>
          </div>

          <div className="flex gap-5 mb-4 text-xs font-medium">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              Total Payments
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Successful Payments
            </span>
          </div>

          <div className="w-full overflow-hidden">
            <svg
              viewBox="0 0 700 240"
              className="w-full h-auto"
              preserveAspectRatio="none"
            >
              {[40, 90, 140, 190].map((y) => (
                <line
                  key={y}
                  x1="55"
                  y1={y}
                  x2="690"
                  y2={y}
                  stroke="#E9EEF5"
                  strokeWidth="1"
                />
              ))}

              <polyline
                points="55,165 135,120 215,145 295,100 375,75 455,110 535,65 615,78 690,40"
                fill="none"
                stroke="#1769F5"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <polyline
                points="55,195 135,155 215,180 295,140 375,110 455,145 535,105 615,115 690,88"
                fill="none"
                stroke="#10B981"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {[
                ["Oct 14", 55],
                ["Oct 21", 215],
                ["Oct 28", 375],
                ["Nov 04", 535],
                ["Nov 12", 690],
              ].map(([label, x]) => (
                <text
                  key={label}
                  x={Number(x)}
                  y="230"
                  textAnchor="middle"
                  fill="#64748B"
                  fontSize="12"
                >
                  {label}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Payment Status */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-lg font-bold text-[#14344A]">
            Payment Status
          </h2>

          <p className="text-xs text-gray-400 mt-1">
            Transaction distribution
          </p>

          <div className="flex flex-col items-center mt-7">
            <div className="relative w-44 h-44 rounded-full flex items-center justify-center"
              style={{
                background:
                  "conic-gradient(#10B981 0% 87.5%, #F59E0B 87.5% 95.3%, #EF4444 95.3% 100%)",
              }}
            >
              <div className="w-32 h-32 rounded-full bg-white flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-[#14344A]">
                  87.5%
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  Successful
                </span>
              </div>
            </div>

            <div className="w-full space-y-4 mt-7">
              {[
                {
                  name: "Successful",
                  amount: "$42,100.00",
                  percentage: "87.5%",
                  color: "bg-emerald-500",
                },
                {
                  name: "Pending",
                  amount: "$3,750.00",
                  percentage: "7.8%",
                  color: "bg-amber-500",
                },
                {
                  name: "Failed",
                  amount: "$1,250.00",
                  percentage: "4.7%",
                  color: "bg-red-500",
                },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm text-gray-600">
                      {item.name}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-sm text-[#14344A]">
                      {item.amount}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.percentage}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================================= */}
      {/* TRANSACTION RECORDS */}
      {/* ================================= */}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden payment-table-card">

        {/* Table Header */}

        <div className="p-5 border-b border-gray-100">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 table-search-outerdiv">
            <div>
              <h2 className="text-lg font-bold text-[#14344A]">
                Transaction Records
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                View and manage all payment transactions.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 table-records">
              <div className="relative flex-1 min-w-[200px] table-search">
                <Search
                  size={17}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search user, booking or transaction ID..."
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
              >
                <option>All Status</option>
                <option>Successful</option>
                <option>Pending</option>
                <option>Failed</option>
                <option>Refunded</option>
              </select>

              <select
                value={methodFilter}
                onChange={(e) => {
                  setMethodFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
              >
                <option>All Methods</option>
                <option>Credit Card</option>
                <option>PayPal</option>
                <option>Venmo</option>
                <option>Bank Transfer</option>
              </select>

              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#14344A] hover:bg-gray-50"
              >
                <RefreshCw size={15} />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Table */}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px] text-left">
            <thead className="bg-[#F5F7FB]">
              <tr className="text-xs uppercase text-gray-500">
                <th className="px-5 py-4">#</th>
                <th className="px-5 py-4">User / Requester</th>
                <th className="px-5 py-4">Care Giver</th>
                <th className="px-5 py-4">Booking ID</th>
                <th className="px-5 py-4">Payment Method</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Transaction ID</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Date & Time</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {paginatedRecords.map((payment, index) => (
                <tr
                  key={payment.id}
                  className="hover:bg-blue-50/40 transition text-sm"
                >
                  <td className="px-5 py-4 font-medium text-gray-500">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>

                  <td className="px-5 py-4">
                    <div className="font-semibold text-[#14344A]">
                      {payment.requester}
                    </div>
                    <div className="text-xs text-gray-400">
                      Requester
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-700">
                      {payment.provider}
                    </div>
                    <div className="text-xs text-gray-400">
                      Care giver
                    </div>
                  </td>

                  <td className="px-5 py-4 font-semibold text-blue-700">
                    {payment.bookingId}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      {payment.paymentMethod === "Bank Transfer" ? (
                        <Landmark size={17} />
                      ) : payment.paymentMethod === "Credit Card" ? (
                        <CreditCard size={17} />
                      ) : (
                        <DollarSign size={17} />
                      )}
                      {payment.paymentMethod}
                    </div>
                  </td>

                  <td className="px-5 py-4 font-bold text-[#14344A]">
                    {currency(payment.amount)}
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-xs font-medium text-gray-600">
                      {payment.transactionId}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={payment.status} />
                  </td>

                  <td className="px-5 py-4">
                    <div className="text-gray-700">
                      {payment.date}
                    </div>
                    <div className="text-xs text-gray-400">
                      {payment.time}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <button
                      onClick={() => setSelectedPayment(payment)}
                      className="flex items-center gap-1.5 px-4 py-2 border border-blue-200 rounded-lg text-blue-600 font-semibold hover:bg-blue-50"
                    >
                      <Eye size={15} />
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {paginatedRecords.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="text-center py-12 text-gray-400"
                  >
                    No payment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing{" "}
            {filteredRecords.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            {" "}to{" "}
            {Math.min(currentPage * pageSize, filteredRecords.length)}
            {" "}of {filteredRecords.length} records
          </p>

          <div className="flex items-center gap-2 " style={{ display: "flex", alignItems: "center" }}>
            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((prev) => Math.max(1, prev - 1))
              }
              className="p-2 border rounded-lg disabled:opacity-40"
            >
              <ChevronLeft size={17} />
            </button>

            <span className="text-sm font-semibold text-blue-700 px-3">
              {currentPage} / {totalPages}
            </span>

            <button
              disabled={currentPage >= totalPages}
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(totalPages, prev + 1)
                )
              }
              className="p-2 border rounded-lg disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* ================================= */}
      {/* TRANSACTION DETAIL MODAL */}
      {/* ================================= */}

      {selectedPayment && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 payment-modal-overlay"
          onClick={() => setSelectedPayment(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between  border-b model">
              <div>
                <h2 className="text-xl font-bold text-[#14344A]">
                  Transaction Details
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  complete information about this payment transaction
                </p>
              </div>

              <button
                onClick={() => setSelectedPayment(null)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-gradient-to-r from-[#14344A] to-[#087CC0] rounded-xl p-5 text-white t-amount">
                <p className="text-sm text-blue-100 " >
                  Transaction Amount
                </p>
                <h2 className="text-3xl font-bold mt-2">
                  {currency(selectedPayment.amount)}
                </h2>
                <div className="">
                  <StatusBadge status={selectedPayment.status} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  ["Requester", selectedPayment.requester],
                  ["Requester Email", selectedPayment.requesterEmail],
                  ["Caregiver", selectedPayment.provider],
                  ["Booking ID", selectedPayment.bookingId],
                  ["Payment Method", selectedPayment.paymentMethod],
                  ["Transaction ID", selectedPayment.transactionId],
                  ["Payment Date", selectedPayment.date],
                  ["Payment Time", selectedPayment.time],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400 mb-1">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-[#14344A] break-all">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-2 border-t flex justify-end">
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-6 py-2.5 rounded-xl bg-[#14344A] text-white text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentReports;
