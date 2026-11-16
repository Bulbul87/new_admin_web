
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Eye,
  RefreshCw,
  ReceiptText,
  CheckCircle2,
  Clock3,
  XCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  CreditCard,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  paymentReceiptService,
 type PaymentReceipt,
 type PaymentStatus,
} from "../service/paymentReceiptService";

const PAGE_SIZE = 20;

const formatCurrency = (
  amount?: number,
  currency = "USD"
) => {
  const value = Number(amount ?? 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(value);
};

const formatDate = (date?: string) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getRequesterName = (user?: PaymentReceipt["user"]) => {
  if (!user) return "—";

  if (typeof user === "string") return user;

  return (
    user.name ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.email ||
    "—"
  );
};

const getTransactionId = (payment: PaymentReceipt) => {
  return (
    payment.transactionId ||
    payment.paymentGateway?.transactionId ||
    payment.paymentGateway?.paymentIntentId ||
    payment.paymentIntentId ||
    "—"
  );
};

const getAmount = (payment: PaymentReceipt) => {
  return Number(
    payment.totalAmount ?? payment.amount ?? 0
  );
};

const getStatusClasses = (status?: PaymentStatus) => {
  const value = String(status || "").toLowerCase();

  if (["completed", "succeeded", "paid"].includes(value)) {
    return "bg-green-50 text-green-700 border-green-200";
  }

  if (["pending", "processing", "authorized", "held"].includes(value)) {
    return "bg-yellow-50 text-yellow-700 border-yellow-200";
  }

  if (["failed", "cancelled", "canceled"].includes(value)) {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (value === "refunded") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }

  return "bg-gray-100 text-gray-700 border-gray-200";
};

const PaymentReceipts: React.FC = () => {
  const navigate = useNavigate();

  const [payments, setPayments] = useState<PaymentReceipt[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const loadReceipts = useCallback(async () => {
    try {
      setLoading(true);

      const result = await paymentReceiptService.getReceipts({
        page,
        limit: PAGE_SIZE,
        status,
        search,
        startDate,
        endDate,
      });

      setPayments(result.payments);
      setTotal(result.pagination.total);
      setTotalPages(Math.max(result.pagination.totalPages, 1));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load payment receipts.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, status, search, startDate, endDate]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadReceipts();
    }, 350);

    return () => window.clearTimeout(timer);
  }, [loadReceipts]);

  const pageStats = useMemo(() => {
    return {
      completed: payments.filter((item) =>
        ["completed", "succeeded", "paid"].includes(
          String(item.status).toLowerCase()
        )
      ).length,

      pending: payments.filter((item) =>
        ["pending", "processing", "authorized", "held"].includes(
          String(item.status).toLowerCase()
        )
      ).length,

      failed: payments.filter((item) =>
        ["failed", "cancelled", "canceled"].includes(
          String(item.status).toLowerCase()
        )
      ).length,
    };
  }, [payments]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const openDetails = (payment: PaymentReceipt) => {
    navigate(`/payment-receipts/${payment._id}`);
  };

  const firstRecord = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastRecord = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="payment-receipts-page" style={{
        marginLeft: "260px",
        marginTop: "70px",
        minHeight: "100vh",
        background: "#F3F6FB",
        padding: "30px",
      }} >
      <style>{`
        .payment-receipts-page {
          --receipt-navy: #14344A;
          --receipt-blue: #1769F5;
          --receipt-cyan: #0799DC;
          --receipt-muted: #718397;
          color: #18364b;
          background-color: #F5F7FB;
          background-image: radial-gradient(circle at 92% 0%, rgba(7,153,220,.13), transparent 25%), radial-gradient(circle at 4% 30%, rgba(23,105,245,.055), transparent 24%);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .payment-receipts-page > .mx-auto { max-width: 1600px; }
        .payment-receipts-page h1 { color: var(--receipt-navy); letter-spacing: -.05em; line-height: 1.08; font-size: clamp(28px, 2.2vw, 36px); }
        .payment-receipts-page h3 { letter-spacing: -.025em; }
        .payment-receipts-page .receipt-header { position: relative; display:flex; align-items:center; justify-content:space-between; gap:24px; padding: 25px 28px; overflow:hidden; border:1px solid #e2ebf4; border-radius:22px; background:linear-gradient(115deg,rgba(255,255,255,.98),rgba(247,251,255,.96)); box-shadow:0 10px 30px rgba(20,52,74,.055); }
        .payment-receipts-page .receipt-header:after { content:""; position:absolute; width:230px; height:230px; right:8%; top:-165px; border-radius:50%; background:linear-gradient(135deg,rgba(23,105,245,.10),rgba(7,153,220,.03)); pointer-events:none; }
        .payment-receipts-page .receipt-header > div, .payment-receipts-page .receipt-header > button { position:relative; z-index:1; }
        .payment-receipts-page .receipt-header > div > div:first-child { display:inline-flex; align-items:center; gap:9px; padding:7px 12px; margin-bottom:13px; border:1px solid #d9eafa; border-radius:999px; background:#f0f7ff; color:#24618b; font-size:11px; font-weight:800; letter-spacing:.075em; text-transform:uppercase; }
        .payment-receipts-page .receipt-header p { color:#78899a; }
        .payment-receipts-page .receipt-header button { min-height:46px; padding:0 20px; border-radius:12px; background:linear-gradient(115deg,#14344A 0%,#1769A5 58%,#0799DC 100%); box-shadow:0 8px 18px rgba(20,80,125,.2); letter-spacing:.01em; }
        .payment-receipts-page .receipt-header button:hover { transform:translateY(-2px); box-shadow:0 12px 24px rgba(20,80,125,.26); }

        .payment-receipts-page .receipt-stats-grid { gap:18px; }
        .payment-receipts-page .receipt-stat-card { position:relative; min-height:145px; padding:22px 23px; overflow:hidden; border:1px solid #e5edf5; border-radius:20px; background:linear-gradient(145deg,#fff 0%,#fbfdff 100%); box-shadow:0 7px 22px rgba(19,52,74,.045); transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease; }
        .payment-receipts-page .receipt-stat-card:before { content:""; position:absolute; left:0; top:0; width:100%; height:4px; background:linear-gradient(90deg,#1769F5,#0799DC); opacity:.9; }
        .payment-receipts-page .receipt-stat-card:after { content:""; position:absolute; width:135px; height:135px; right:-54px; bottom:-70px; border-radius:50%; background:currentColor; opacity:.045; pointer-events:none; }
        .payment-receipts-page .receipt-stat-card:hover { transform:translateY(-4px); border-color:#cbddec; box-shadow:0 14px 30px rgba(19,52,74,.09); }
        .payment-receipts-page .receipt-stat-card p:first-child { color:#75879a; font-size:12px; font-weight:700; letter-spacing:.025em; }
        .payment-receipts-page .receipt-stat-card h2 { margin-top:9px; font-size:31px; line-height:1; letter-spacing:-.045em; }
        .payment-receipts-page .receipt-stat-card > div > div:last-child { display:flex; width:52px; height:52px; align-items:center; justify-content:center; border-radius:16px; box-shadow:inset 0 0 0 1px rgba(30,90,140,.045); }
        .payment-receipts-page .receipt-stat-card > p:last-child { margin-top:16px; color:#9aa8b5; font-size:11px; font-weight:600; }
        .payment-receipts-page .receipt-stat-card:nth-child(1):before { background:linear-gradient(90deg,#1769F5,#45b5ee); }
        .payment-receipts-page .receipt-stat-card:nth-child(2):before { background:linear-gradient(90deg,#0b9b72,#55c99d); }
        .payment-receipts-page .receipt-stat-card:nth-child(3):before { background:linear-gradient(90deg,#d99a17,#f3c45b); }
        .payment-receipts-page .receipt-stat-card:nth-child(4):before { background:linear-gradient(90deg,#dc5260,#f18a91); }

        .payment-receipts-page .receipt-filter-card { position:relative; padding:23px 24px 19px; border:1px solid #e3ebf3; border-radius:21px; background:rgba(255,255,255,.97); box-shadow:0 8px 25px rgba(19,52,74,.05); }
        .payment-receipts-page .receipt-filter-title { display:flex; align-items:center; gap:11px; margin-bottom:19px; color:#14344A; }
        .payment-receipts-page .receipt-filter-title > svg { width:36px; height:36px; padding:9px; border-radius:11px; background:#edf5ff; color:#1769b5; }
        .payment-receipts-page .receipt-filter-title h3 { font-size:15px; font-weight:800; }
        .payment-receipts-page .receipt-filter-card input, .payment-receipts-page .receipt-filter-card select { min-height:48px; border:1px solid #dfe8f0; border-radius:12px; background:#f8fafc; color:#334b5e; font-size:12px; font-weight:600; transition:border-color .18s ease,box-shadow .18s ease,background .18s ease; }
        .payment-receipts-page .receipt-filter-card input::placeholder { color:#9aaaba; font-weight:500; }
        .payment-receipts-page .receipt-filter-card input:hover, .payment-receipts-page .receipt-filter-card select:hover { border-color:#b8cfe1; background:#fff; }
        .payment-receipts-page .receipt-filter-card input:focus, .payment-receipts-page .receipt-filter-card select:focus { border-color:#3b8bd0; background:#fff; outline:0; box-shadow:0 0 0 4px rgba(23,105,245,.09); }
        .payment-receipts-page .receipt-filter-card button { border:1px solid #dceafa; border-radius:10px; padding:9px 15px; background:#f3f8ff; color:#24618b; font-size:12px; font-weight:800; }
        .payment-receipts-page .receipt-filter-card button:hover { border-color:#1769b5; background:#e8f2ff; color:#14344A; }

        .payment-receipts-page .receipt-table-card { overflow:hidden; border:1px solid #e2eaf2; border-radius:21px; background:#fff; box-shadow:0 9px 28px rgba(19,52,74,.055); }
        .payment-receipts-page .receipt-table-heading { display:flex; align-items:center; justify-content:space-between; min-height:82px; padding:19px 24px; border-bottom:1px solid #eaf0f5; background:linear-gradient(105deg,#fff 0%,#f8fbff 100%); }
        .payment-receipts-page .receipt-table-heading h3 { display:flex; align-items:center; gap:10px; color:#14344A; font-size:16px; font-weight:800; }
        .payment-receipts-page .receipt-table-heading h3:before { content:""; display:inline-block; width:4px; height:19px; border-radius:8px; background:linear-gradient(180deg,#1769F5,#0799DC); }
        .payment-receipts-page .receipt-table-heading p { margin-top:6px; color:#8796a5; font-size:11px; font-weight:600; }
        .payment-receipts-page table { width:100%; border-collapse:separate; border-spacing:0; }
        .payment-receipts-page thead { background:linear-gradient(90deg,#f0f5fa 0%,#f7faff 100%); }
        .payment-receipts-page thead th { padding:16px 19px; color:#657b8e; font-size:10px; font-weight:800; letter-spacing:.085em; white-space:nowrap; border-bottom:1px solid #e4edf5; }
        .payment-receipts-page tbody tr { background:#fff; transition:background .18s ease,box-shadow .18s ease; }
        .payment-receipts-page tbody tr:hover { background:#f4f9ff; box-shadow:inset 3px 0 0 #3194df; }
        .payment-receipts-page tbody td { padding:17px 19px; border-bottom:1px solid #edf2f6; color:#42586a; font-size:12px; vertical-align:middle; }
        .payment-receipts-page tbody tr:last-child td { border-bottom:0; }
        .payment-receipts-page tbody td p:first-child { color:#233f54; font-size:12px; font-weight:750; }
        .payment-receipts-page tbody td p + p { color:#96a4b1; font-size:10px; font-weight:500; }
        .payment-receipts-page tbody td .font-mono { display:inline-block; max-width:190px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding:6px 8px; border:1px solid #e8eef4; border-radius:7px; background:#f8fafc; color:#64788a; font-size:10px; }
        .payment-receipts-page tbody td > span.rounded-full { padding:6px 11px; border-width:1px; font-size:10px; font-weight:800; letter-spacing:.015em; }
        .payment-receipts-page tbody td button { min-height:34px; padding:0 12px; border:1px solid #cfe2f5; border-radius:9px; background:linear-gradient(180deg,#f5faff,#eaf4ff); color:#24618b; font-size:11px; font-weight:800; }
        .payment-receipts-page tbody td button:hover { transform:translateY(-1px); border-color:#14344A; background:linear-gradient(120deg,#14344A,#1769A5); color:#fff; box-shadow:0 5px 12px rgba(20,52,74,.16); }
        .payment-receipts-page .receipt-pagination { min-height:70px; padding:14px 22px; border-top:1px solid #eaf0f5; background:#fbfdff; }
        .payment-receipts-page .receipt-pagination p { color:#7d8e9d; font-size:11px; font-weight:650; }
        .payment-receipts-page .receipt-pagination button { min-height:36px; padding:0 12px; border:1px solid #dce6ef; border-radius:9px; background:#fff; color:#536b7e; font-size:11px; font-weight:750; transition:all .18s ease; }
        .payment-receipts-page .receipt-pagination button:hover:not(:disabled) { border-color:#a9c7df; background:#f0f7fd; color:#14344A; }
        .payment-receipts-page .receipt-pagination button:disabled { opacity:.4; cursor:not-allowed; }
        .payment-receipts-page .receipt-pagination .receipt-page-current { display:inline-flex; min-width:36px; height:36px; align-items:center; justify-content:center; border-radius:9px; background:linear-gradient(135deg,#14344A,#1769A5); color:#fff; font-size:12px; font-weight:800; box-shadow:0 5px 12px rgba(20,52,74,.16); }
        .payment-receipts-page button:focus-visible, .payment-receipts-page input:focus-visible, .payment-receipts-page select:focus-visible { outline:3px solid rgba(57,117,165,.18); outline-offset:2px; }
        @media (max-width: 1024px) { .payment-receipts-page { padding:24px !important; } .payment-receipts-page .receipt-stats-grid { gap:14px; } }
        @media (max-width: 768px) { .payment-receipts-page { margin-left:0 !important; margin-top:64px !important; padding:15px !important; } .payment-receipts-page .receipt-header { align-items:flex-start; flex-direction:column; padding:20px; } .payment-receipts-page .receipt-header button { width:100%; } .payment-receipts-page .receipt-stat-card { min-height:126px; padding:18px; } .payment-receipts-page .receipt-filter-card { padding:18px; } .payment-receipts-page .receipt-table-heading { padding:16px 18px; } .payment-receipts-page .receipt-pagination { align-items:flex-start; } }
      `}</style>
      <div className="mx-auto max-w-[1600px] space-y-6">

        {/* HEADER */}
        <div className="receipt-header flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#3975A5]">
              <CreditCard size={16} />
              Payment Management
            </div>

            <h1 className="text-2xl font-bold text-[#14344A] md:text-3xl">
              Payment Receipts
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View and manage requester payment receipt records.
            </p>
          </div>

          <button
            onClick={loadReceipts}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#14344A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1D4D6C] disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="receipt-stats-grid grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="receipt-stat-card rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Receipts
                </p>
                <h2 className="mt-2 text-2xl font-bold text-[#14344A]">
                  {total}
                </h2>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                <ReceiptText size={23} />
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Total matching records
            </p>
          </div>

          <div className="receipt-stat-card rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Completed
                </p>
                <h2 className="mt-2 text-2xl font-bold text-green-700">
                  {pageStats.completed}
                </h2>
              </div>
              <div className="rounded-xl bg-green-50 p-3 text-green-700">
                <CheckCircle2 size={23} />
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              On this page
            </p>
          </div>

          <div className="receipt-stat-card rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pending / Held
                </p>
                <h2 className="mt-2 text-2xl font-bold text-yellow-700">
                  {pageStats.pending}
                </h2>
              </div>
              <div className="rounded-xl bg-yellow-50 p-3 text-yellow-700">
                <Clock3 size={23} />
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              On this page
            </p>
          </div>

          <div className="receipt-stat-card rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Failed / Cancelled
                </p>
                <h2 className="mt-2 text-2xl font-bold text-red-700">
                  {pageStats.failed}
                </h2>
              </div>
              <div className="rounded-xl bg-red-50 p-3 text-red-700">
                <XCircle size={23} />
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              On this page
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="receipt-filter-card rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="receipt-filter-title mb-4 flex items-center gap-2 text-[#14344A]">
            <Filter size={18} />
            <h3 className="font-semibold">Search & Filters</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">

            <div className="relative xl:col-span-2">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search requester, email, transaction ID..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#3975A5] focus:bg-white"
              />
            </div>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#3975A5]"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="authorized">Authorized</option>
              <option value="held">Held</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <div className="relative">
              <CalendarDays
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-3 text-sm outline-none focus:border-[#3975A5]"
                aria-label="Start date"
              />
            </div>

            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#3975A5]"
              aria-label="End date"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={resetFilters}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-[#3975A5] transition hover:bg-blue-50"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="receipt-table-card overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="receipt-table-heading flex flex-col justify-between gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-bold text-[#14344A]">
                Receipt Records
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Showing {firstRecord}–{lastRecord} of {total} records
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-[#F7F9FC]">
                <tr className="text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-4 font-semibold">Receipt / Payment ID</th>
                  <th className="px-5 py-4 font-semibold">Requester</th>
                  <th className="px-5 py-4 font-semibold">Transaction ID</th>
                  <th className="px-5 py-4 font-semibold">Amount</th>
                  <th className="px-5 py-4 font-semibold">Payment Date</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-center font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <RefreshCw
                        size={25}
                        className="mx-auto animate-spin text-[#3975A5]"
                      />
                      <p className="mt-3 text-sm text-gray-500">
                        Loading payment receipts...
                      </p>
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <ReceiptText
                        size={35}
                        className="mx-auto text-gray-300"
                      />
                      <p className="mt-3 font-semibold text-gray-600">
                        No payment receipts found
                      </p>
                      <p className="mt-1 text-sm text-gray-400">
                        Try changing your search or filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="transition hover:bg-blue-50/40"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#14344A]">
                          {payment.receiptNumber || payment._id}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {payment._id}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-800">
                          {getRequesterName(payment.user)}
                        </p>
                        {typeof payment.user === "object" && payment.user?.email && (
                          <p className="mt-1 text-xs text-gray-400">
                            {payment.user.email}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-gray-600">
                          {getTransactionId(payment)}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-semibold text-[#14344A]">
                        {formatCurrency(
                          getAmount(payment),
                          payment.currency || "USD"
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {formatDate(payment.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(payment.status)}`}
                        >
                          {payment.status || "Unknown"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => openDetails(payment)}
                          title="View Receipt"
                          className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-[#24618B] transition hover:bg-[#14344A] hover:text-white"
                        >
                          <Eye size={15} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="receipt-pagination flex flex-col justify-between gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage((current) => current - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <span className="receipt-page-current rounded-lg bg-[#14344A] px-4 py-2 text-sm font-semibold text-white">
                {page}
              </span>

              <button
                disabled={page >= totalPages || loading}
                onClick={() => setPage((current) => current + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentReceipts;