// import React, { useEffect, useState } from "react";
// import "./bookinghistory.css";
// import { useNavigate } from "react-router-dom";
// import {
//   CalendarDays,
//   CheckCircle2,
//   XCircle,
//   Clock3,
//   UserRound,
//   BriefcaseBusiness,
//   RefreshCw,
//   Search,
//   ChevronLeft,
//   ChevronRight,
//   Ban,
//   ArrowLeft,
// } from "lucide-react";

// import {
//   getAdminServiceResponses,
//   getAdminScheduledServices,
//   getAdminPastServices,
//   type ServiceResponse,
//   type ScheduledService,
//   type PastService,
//   type ServiceResponseParams,
//   type PastServicesParams,
// } from "../service/adminbookingservice";

// type Tab = "responses" | "scheduled" | "past";

// const BookingHistoryScreen: React.FC = () => {
//   const navigate = useNavigate();

//   const [activeTab, setActiveTab] = useState<Tab>("responses");

//   const [responses, setResponses] = useState<ServiceResponse[]>([]);
//   const [scheduled, setScheduled] = useState<ScheduledService[]>([]);
//   const [pastServices, setPastServices] = useState<PastService[]>([]);

//   const [loading, setLoading] = useState(false);

//   const [search, setSearch] = useState("");

//   const [responseStatus, setResponseStatus] =
//     useState<ServiceResponseParams["status"]>(undefined);

//   const [pastStatus, setPastStatus] =
//     useState<PastServicesParams["status"]>(undefined);

//   const [page, setPage] = useState(1);
//   const [limit] = useState(20);

//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 20,
//     total: 0,
//     totalPages: 1,
//   });

//   const getName = (
//     person?: {
//       firstName?: string;
//       lastName?: string;
//       email?: string;
//     } | null
//   ) => {
//     if (!person) return "—";

//     const name = `${person.firstName || ""} ${
//       person.lastName || ""
//     }`.trim();

//     return name || person.email || "—";
//   };

//   const formatDate = (date?: string | null) => {
//     if (!date) return "—";

//     return new Date(date).toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     });
//   };

//   const formatDateTime = (date?: string | null) => {
//     if (!date) return "—";

//     return new Date(date).toLocaleString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//       hour: "numeric",
//       minute: "2-digit",
//     });
//   };

//   const formatStatus = (status?: string) => {
//     if (!status) return "—";

//     return status
//       .replaceAll("_", " ")
//       .replaceAll("-", " ")
//       .replace(/\b\w/g, (char) => char.toUpperCase());
//   };

//   const loadData = async () => {
//     try {
//       setLoading(true);

//       if (activeTab === "responses") {
//         const result = await getAdminServiceResponses({
//           page,
//           limit,
//           search: search.trim() || undefined,
//           status: responseStatus,
//         });

//         setResponses(result.data || []);

//         setPagination(
//           result.pagination || {
//             page,
//             limit,
//             total: 0,
//             totalPages: 1,
//           }
//         );
//       }

//       if (activeTab === "scheduled") {
//         const result = await getAdminScheduledServices({
//           page,
//           limit,
//         });

//         setScheduled(result.data || []);

//         setPagination(
//           result.pagination || {
//             page,
//             limit,
//             total: 0,
//             totalPages: 1,
//           }
//         );
//       }

//       if (activeTab === "past") {
//         const result = await getAdminPastServices({
//           page,
//           limit,
//           status: pastStatus,
//         });

//         setPastServices(result.data || []);

//         setPagination(
//           result.pagination || {
//             page,
//             limit,
//             total: 0,
//             totalPages: 1,
//           }
//         );
//       }
//     } catch (error) {
//       console.error("Failed to load admin booking data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadData();
//   }, [activeTab, page, responseStatus, pastStatus]);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (activeTab === "responses") {
//         setPage(1);
//         loadData();
//       }
//     }, 400);

//     return () => clearTimeout(timer);
//   }, [search]);

//   const changeTab = (tab: Tab) => {
//     setActiveTab(tab);
//     setPage(1);
//     setSearch("");
//     setResponseStatus(undefined);
//     setPastStatus(undefined);
//   };

//   const getResponseBadge = (type: string) => {
//     switch (type) {
//       case "accepted":
//         return (
//           <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 badge">
//             <CheckCircle2 size={14} />
//             Accepted
//           </span>
//         );

//       case "rejected":
//         return (
//           <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 badge">
//             <XCircle size={14} />
//             Provider Rejected
//           </span>
//         );

//       case "cancelled_by_requestor":
//         return (
//           <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 badge">
//             <Ban size={14} />
//             User Cancelled
//           </span>
//         );

//       case "cancelled_by_provider":
//         return (
//           <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 badge">
//             <Ban size={14} />
//             Provider Cancelled
//           </span>
//         );

//       default:
//         return (
//           <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 formatstatus">
//             {formatStatus(type)}
//           </span>
//         );
//     }
//   };

//   const renderResponses = () => {
//     return (
//       <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
//         <div className="overflow-x-auto">
//           <table className="w-full min-w-[1150px] bookingtable">
//             <thead className="bg-slate-50 bookingtheader">
//               <tr className="bookingtr">
//                 <th className="table-head">Requestor</th>
//                 <th className="table-head">Caregiver</th>
//                 <th className="table-head">Service</th>
//                 <th className="table-head">Scheduled</th>
//                 <th className="table-head">Response</th>
//                 <th className="table-head">Reason</th>
//               </tr>
//             </thead>

//             <tbody className="bookingtbody" >
//               {responses.map((item) => (
//                 <tr
//                   key={item.id}
//                   className="border-t border-slate-100 hover:bg-slate-50  tbody-row"
//                 >
//                   <td className="table-cell">
//                     <div className="flex items-center gap-3  cell-div">
//                       <div className="avatar">
//                         <UserRound size={17} />
//                       </div>

//                       <div  >
//                         <p className="font-semibold text-slate-800">
//                           {getName(item.requestor)}
//                         </p>

//                         <p className="text-xs text-slate-500">
//                           {item.requestor?.email || "—"}
//                         </p>
//                       </div>
//                     </div>
//                   </td>

//                   <td className="table-cell">
//                     <div className="flex items-center gap-3">
//                       <div className="avatar">
//                         <UserRound size={17} />
//                       </div>

//                       <div>
//                         <p className="font-semibold text-slate-800">
//                           {getName(item.provider)}
//                         </p>

//                         <p className="text-xs text-slate-500">
//                           {item.provider?.email || "—"}
//                         </p>
//                       </div>
//                     </div>
//                   </td>

//                   <td className="table-cell">
//                     <div className="flex items-center gap-2">
//                       <BriefcaseBusiness
//                         size={16}
//                         className="text-slate-400"
//                       />

//                       <span className="font-medium text-slate-700">
//                         {item.service?.name || "—"}
//                       </span>
//                     </div>
//                   </td>

//                   <td className="table-cell">
//                     <div className="text-sm">
//                       <p className="font-medium text-slate-700">
//                         {formatDate(item.scheduledDate)}
//                       </p>

//                       <p className="text-xs text-slate-500">
//                         {item.scheduledTime?.start || "—"}{" "}
//                         {item.scheduledTime?.end
//                           ? `- ${item.scheduledTime.end}`
//                           : ""}
//                       </p>
//                     </div>
//                   </td>

//                   <td className="table-cell">
//                     <div>
//                       {getResponseBadge(item.type)}

//                       <p className="mt-1 text-xs text-slate-400">
//                         {formatDateTime(item.responseAt)}
//                       </p>
//                     </div>
//                   </td>

//                   <td className="table-cell max-w-[250px]">
//                     <span className="text-sm text-slate-600">
//                       {item.cancellation?.reason || "—"}
//                     </span>
//                   </td>
//                 </tr>
//               ))}

//               {!loading && responses.length === 0 && (
//                 <tr>
//                   <td
//                     colSpan={6}
//                     className="py-16 text-center text-slate-500"
//                   >
//                     No service responses found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     );
//   };

//   const renderScheduled = () => {
//     return (
//       <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
//         <div className="overflow-x-auto">
//           <table className="w-full min-w-[1100px] bookingtable">
//             <thead className="bg-slate-50  bookingtheader">
//               <tr className="bookingtr">
//                 <th className="table-head">Caregiver</th>
//                 <th className="table-head">Requestor</th>
//                 <th className="table-head">Service</th>
//                 <th className="table-head">Date</th>
//                 <th className="table-head">Time</th>
//                 <th className="table-head">Status</th>
//                 <th className="table-head">Type</th>
//               </tr>
//             </thead>

//             <tbody className="bookingtbody">
//               {scheduled.map((item) => (
//                 <tr
//                   key={item.bookingId}
//                   className="border-t border-slate-100 hover:bg-slate-50 tbody-row"
//                 >
//                   <td className="table-cell">
//                     <div className="flex items-center gap-3 cell-div">
//                       <div className="avatar">
//                         <UserRound size={17} />
//                       </div>

//                       <span className="font-semibold text-slate-800 cell-span">
//                         {getName(item.provider)}
//                       </span>
//                     </div>
//                   </td>

//                   <td className="table-cell">
//                     {getName(item.requestor)}
//                   </td>

//                   <td className="table-cell">
//                     <span className="font-medium text-slate-700 cellspan-name">
//                       {item.service?.name || "—"}
//                     </span>
//                   </td>

//                   <td className="table-cell">
//                     {formatDate(item.scheduledDate)}
//                   </td>

//                   <td className="table-cell">
//                     {item.scheduledTime?.start || "—"}{" "}
//                     {item.scheduledTime?.end
//                       ? `- ${item.scheduledTime.end}`
//                       : ""}
//                   </td>

//                   <td className="table-cell">
//                     <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 cellspan-status">
//                       {formatStatus(item.status)}
//                     </span>
//                   </td>

//                   <td className="table-cell">
//                     {item.isMultiDay ? (
//                       <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 cellspan-multiday">
//                         Multi-Day
//                       </span>
//                     ) : (
//                       <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 cellspan-one">
//                         One-Time
//                       </span>
//                     )}
//                   </td>
//                 </tr>
//               ))}

//               {!loading && scheduled.length === 0 && (
//                 <tr className="notfound-row">
//                   <td
//                     colSpan={7}
//                     className="py-16 text-center text-slate-500 notfound-td"
//                   >
//                     No scheduled services found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     );
//   };

//   const renderPast = () => {
//     return (
//       <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
//         <div className="overflow-x-auto">
//           <table className="w-full min-w-[1200px]">
//             <thead className="bg-slate-50">
//               <tr>
//                 <th className="table-head">Requestor</th>
//                 <th className="table-head">Caregiver</th>
//                 <th className="table-head">Service</th>
//                 <th className="table-head">Date</th>
//                 <th className="table-head">Status</th>
//                 <th className="table-head">Completed</th>
//                 <th className="table-head">Cancelled By</th>
//                 <th className="table-head">Reason</th>
//               </tr>
//             </thead>

//             <tbody>
//               {pastServices.map((item) => (
//                 <tr
//                   key={item.bookingId}
//                   className="border-t border-slate-100 hover:bg-slate-50"
//                 >
//                   <td className="table-cell">
//                     <div className="flex items-center gap-3">
//                       <div className="avatar">
//                         <UserRound size={17} />
//                       </div>

//                       <span className="font-semibold text-slate-800">
//                         {getName(item.requestor)}
//                       </span>
//                     </div>
//                   </td>

//                   <td className="table-cell">
//                     {getName(item.provider)}
//                   </td>

//                   <td className="table-cell">
//                     <span className="font-medium text-slate-700">
//                       {item.service?.name || "—"}
//                     </span>
//                   </td>

//                   <td className="table-cell">
//                     {formatDate(item.scheduledDate)}
//                   </td>

//                   <td className="table-cell">
//                     <span
//                       className={`rounded-full px-3 py-1 text-xs font-semibold ${
//                         item.status === "completed"
//                           ? "bg-green-50 text-green-700"
//                           : item.status === "cancelled"
//                           ? "bg-orange-50 text-orange-700"
//                           : "bg-red-50 text-red-700"
//                       }`}
//                     >
//                       {formatStatus(item.status)}
//                     </span>
//                   </td>

//                   <td className="table-cell">
//                     {formatDateTime(item.completedAt)}
//                   </td>

//                   <td className="table-cell">
//                     {item.cancellation?.cancelledBy ? (
//                       <span
//                         className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
//                           typeof item.cancellation.cancelledBy === "object"
//                             ? getName(
//                                 item.cancellation.cancelledBy
//                               ) === getName(item.requestor)
//                               ? "bg-orange-50 text-orange-700"
//                               : "bg-purple-50 text-purple-700"
//                             : item.cancellation.cancelledBy === "user"
//                             ? "bg-orange-50 text-orange-700"
//                             : "bg-purple-50 text-purple-700"
//                         }`}
//                       >
//                         {typeof item.cancellation.cancelledBy === "object"
//                           ? getName(item.cancellation.cancelledBy)
//                           : item.cancellation.cancelledBy === "user"
//                           ? "Requestor"
//                           : item.cancellation.cancelledBy === "provider"
//                           ? "Caregiver"
//                           : formatStatus(
//                               item.cancellation.cancelledBy
//                             )}
//                       </span>
//                     ) : (
//                       "—"
//                     )}
//                   </td>

//                   <td className="table-cell max-w-[280px]">
//                     {item.cancellation ? (
//                       <div>
//                         <p className="text-sm text-slate-700">
//                           {item.cancellation.reason || "Cancelled"}
//                         </p>

//                         <p className="text-xs text-slate-400">
//                           {formatDateTime(
//                             item.cancellation.cancelledAt
//                           )}
//                         </p>
//                       </div>
//                     ) : (
//                       "—"
//                     )}
//                   </td>
//                 </tr>
//               ))}

//               {!loading && pastServices.length === 0 && (
//                 <tr>
//                   <td
//                     colSpan={8}
//                     className="py-16 text-center text-slate-500"
//                   >
//                     No past services found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div
//       style={{
//         marginLeft: "260px",
//         marginTop: "70px",
//         minHeight: "100vh",
//         background: "#f5f7fb",
//         padding: "30px",
//       }}
//     >
//       <div className="mx-auto max-w-[1600px]">
//         {/* Header */}
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             marginBottom: "20px",
//           }}
//         >
//           <div>
//             <h1
//               style={{
//                 color: "#14344A",
//                 fontSize: "26px",
//                 fontWeight: 700,
//                 margin: 0,
//               }}
//             >
//               Booking Management
//             </h1>

//             <p
//               style={{
//                 color: "#6b7c8d",
//                 margin: 0,
//                 fontSize: "14px",
//               }}
//             >
//               Manage caregiver responses, scheduled services and
//               requestor booking history.
//             </p>
//           </div>

//           <div className="flex flex-col items-end gap-1">
//             <button
//               onClick={() => navigate("/admin-config")}
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "8px",
//                 border: "none",
//                 background: "transparent",
//                 color: "#14344A",
//                 fontWeight: 600,
//                 cursor: "pointer",
//               }}
//             >
//               <ArrowLeft size={18} />
//               Back
//             </button>

//             <button
//               onClick={loadData}
//               disabled={loading}
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "8px",
//                 border: "none",
//                 background:
//                   "linear-gradient(to right, #FFFF6D, #8FDAFA)",
//                 color: "#14344A",
//                 fontWeight: 700,
//                 padding: "14px 24px",
//                 borderRadius: 14,
//                 boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
//                 cursor: loading ? "not-allowed" : "pointer",
//                 opacity: loading ? 0.7 : 1,
//               }}
//             >
//               <RefreshCw
//                 size={17}
//                 className={loading ? "animate-spin" : ""}
//               />
//               Refresh
//             </button>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
//           <div className="flex flex-wrap gap-2">
//             <button
//               onClick={() => changeTab("responses")}
//               className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
//                 activeTab === "responses"
//                   ? "bg-[#14344A] text-white shadow"
//                   : "text-slate-600 hover:bg-slate-100"
//               }`}
//             >
//               <CheckCircle2 size={17} />
//               Service Responses
//             </button>

//             <button
//               onClick={() => changeTab("scheduled")}
//               className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
//                 activeTab === "scheduled"
//                   ? "bg-[#14344A] text-white shadow"
//                   : "text-slate-600 hover:bg-slate-100"
//               }`}
//             >
//               <CalendarDays size={17} />
//               Scheduled Services
//             </button>

//             <button
//               onClick={() => changeTab("past")}
//               className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
//                 activeTab === "past"
//                   ? "bg-[#14344A] text-white shadow"
//                   : "text-slate-600 hover:bg-slate-100"
//               }`}
//             >
//               <Clock3 size={17} />
//               Past Services
//             </button>
//           </div>
//         </div>

//         {/* Response Filters */}
//         {activeTab === "responses" && (
//           <div className="mb-5 flex flex-wrap gap-3">
//             <div className="relative min-w-[280px] flex-1">
//               <Search
//                 size={18}
//                 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//               />

//               <input
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search requestor, caregiver or service..."
//                 className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-[#14344A]"
//               />
//             </div>

//             <select
//               value={responseStatus || ""}
//               onChange={(e) => {
//                 setResponseStatus(
//                   e.target.value
//                     ? (e.target.value as ServiceResponseParams["status"])
//                     : undefined
//                 );
//                 setPage(1);
//               }}
//               className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none"
//             >
//               <option value="">All Responses</option>
//               <option value="accepted">Accepted</option>
//               <option value="rejected">Provider Rejected</option>
//               <option value="cancelled_by_requestor">
//                 User Cancelled
//               </option>
//               <option value="cancelled_by_provider">
//                 Provider Cancelled
//               </option>
//             </select>
//           </div>
//         )}

//         {/* Past Filters */}
//         {activeTab === "past" && (
//           <div className="mb-5 flex flex-wrap gap-3">
//             <select
//               value={pastStatus || ""}
//               onChange={(e) => {
//                 setPastStatus(
//                   e.target.value
//                     ? (e.target.value as PastServicesParams["status"])
//                     : undefined
//                 );
//                 setPage(1);
//               }}
//               className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none"
//             >
//               <option value="">All Past Services</option>
//               <option value="completed">Completed</option>
//               <option value="cancelled">Cancelled</option>
//               <option value="no-show">No Show</option>
//             </select>
//           </div>
//         )}

//         {/* Content */}
//         {loading ? (
//           <div className="flex min-h-[350px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
//             <div className="flex items-center gap-3 text-slate-500">
//               <RefreshCw size={20} className="animate-spin" />
//               Loading...
//             </div>
//           </div>
//         ) : (
//           <>
//             {activeTab === "responses" && renderResponses()}
//             {activeTab === "scheduled" && renderScheduled()}
//             {activeTab === "past" && renderPast()}
//           </>
//         )}

//         {/* Pagination */}
//         <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
//           <p className="text-sm text-slate-500">
//             Total:{" "}
//             <span className="font-semibold text-slate-700">
//               {pagination.total}
//             </span>
//           </p>

//           <div className="flex items-center gap-2">
//             <button
//               disabled={page <= 1 || loading}
//               onClick={() =>
//                 setPage((current) => Math.max(current - 1, 1))
//               }
//               className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
//             >
//               <ChevronLeft size={16} />
//               Previous
//             </button>

//             <span className="px-3 text-sm font-semibold text-slate-700">
//               {pagination.page} / {pagination.totalPages || 1}
//             </span>

//             <button
//               disabled={
//                 page >= pagination.totalPages || loading
//               }
//               onClick={() =>
//                 setPage((current) => current + 1)
//               }
//               className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
//             >
//               Next
//               <ChevronRight size={16} />
//             </button>
//           </div>
//         </div>
//       </div>

//     </div>
//   );
// };

// export default BookingHistoryScreen;


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock3,
  UserRound,
  BriefcaseBusiness,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Ban,
  ArrowLeft,
} from "lucide-react";

import {
  getAdminServiceResponses,
  getAdminScheduledServices,
  getAdminPastServices,
  type ServiceResponse,
  type ScheduledService,
  type PastService,
  type ServiceResponseParams,
  type PastServicesParams,
} from "../service/adminbookingservice";

import "./bookinghistory.css";

type Tab = "responses" | "scheduled" | "past";

const BookingHistoryScreen: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>("responses");

  const [responses, setResponses] = useState<ServiceResponse[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledService[]>([]);
  const [pastServices, setPastServices] = useState<PastService[]>([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [responseStatus, setResponseStatus] =
    useState<ServiceResponseParams["status"]>(undefined);

  const [pastStatus, setPastStatus] =
    useState<PastServicesParams["status"]>(undefined);

  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const getName = (
    person?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    } | null
  ) => {
    if (!person) return "—";

    const name = `${person.firstName || ""} ${
      person.lastName || ""
    }`.trim();

    return name || person.email || "—";
  };

  const formatDate = (date?: string | null) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (date?: string | null) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatStatus = (status?: string) => {
    if (!status) return "—";

    return status
      .replaceAll("_", " ")
      .replaceAll("-", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const loadData = async () => {
    try {
      setLoading(true);

      if (activeTab === "responses") {
        const result = await getAdminServiceResponses({
          page,
          limit,
          search: search.trim() || undefined,
          status: responseStatus,
        });

        setResponses(result.data || []);

        setPagination(
          result.pagination || {
            page,
            limit,
            total: 0,
            totalPages: 1,
          }
        );
      }

      if (activeTab === "scheduled") {
        const result = await getAdminScheduledServices({
          page,
          limit,
        });

        setScheduled(result.data || []);

        setPagination(
          result.pagination || {
            page,
            limit,
            total: 0,
            totalPages: 1,
          }
        );
      }

      if (activeTab === "past") {
        const result = await getAdminPastServices({
          page,
          limit,
          status: pastStatus,
        });

        setPastServices(result.data || []);

        setPagination(
          result.pagination || {
            page,
            limit,
            total: 0,
            totalPages: 1,
          }
        );
      }
    } catch (error) {
      console.error("Failed to load admin booking data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, page, responseStatus, pastStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "responses") {
        setPage(1);
        loadData();
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const changeTab = (tab: Tab) => {
    setActiveTab(tab);
    setPage(1);
    setSearch("");
    setResponseStatus(undefined);
    setPastStatus(undefined);
  };

  const getResponseBadge = (type: string) => {
    switch (type) {
      case "accepted":
        return (
          <span className="booking-badge booking-badge--accepted">
            <CheckCircle2 size={14} />
            Accepted
          </span>
        );

      case "rejected":
        return (
          <span className="booking-badge booking-badge--rejected">
            <XCircle size={14} />
            Provider Rejected
          </span>
        );

      case "cancelled_by_requestor":
        return (
          <span className="booking-badge booking-badge--requestor-cancelled">
            <Ban size={14} />
            User Cancelled
          </span>
        );

      case "cancelled_by_provider":
        return (
          <span className="booking-badge booking-badge--provider-cancelled">
            <Ban size={14} />
            Provider Cancelled
          </span>
        );

      default:
        return (
          <span className="booking-badge booking-badge--default">
            {formatStatus(type)}
          </span>
        );
    }
  };

  const renderResponses = () => (
    <div className="booking-table-card">
      <div className="booking-table-wrapper">
        <table className="booking-table booking-table--responses">
          <thead>
            <tr>
              <th>Requestor</th>
              <th>Caregiver</th>
              <th>Service</th>
              <th>Scheduled</th>
              <th>Response</th>
              <th>Reason</th>
            </tr>
          </thead>

          <tbody>
            {responses.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="booking-person">
                    <div className="booking-avatar">
                      <UserRound size={17} />
                    </div>

                    <div className="booking-person-info">
                      <p className="booking-person-name">
                        {getName(item.requestor)}
                      </p>

                      <p className="booking-person-email">
                        {item.requestor?.email || "—"}
                      </p>
                    </div>
                  </div>
                </td>

                <td>
                  <div className="booking-person">
                    <div className="booking-avatar">
                      <UserRound size={17} />
                    </div>

                    <div className="booking-person-info">
                      <p className="booking-person-name">
                        {getName(item.provider)}
                      </p>

                      <p className="booking-person-email">
                        {item.provider?.email || "—"}
                      </p>
                    </div>
                  </div>
                </td>

                <td>
                  <div className="booking-service">
                    <BriefcaseBusiness size={16} />

                    <span>{item.service?.name || "—"}</span>
                  </div>
                </td>

                <td>
                  <div className="booking-date-block">
                    <p>{formatDate(item.scheduledDate)}</p>

                    <span>
                      {item.scheduledTime?.start || "—"}{" "}
                      {item.scheduledTime?.end
                        ? `- ${item.scheduledTime.end}`
                        : ""}
                    </span>
                  </div>
                </td>

                <td>
                  <div className="booking-response">
                    {getResponseBadge(item.type)}

                    <span>
                      {formatDateTime(item.responseAt)}
                    </span>
                  </div>
                </td>

                <td>
                  <span className="booking-reason">
                    {item.cancellation?.reason || "—"}
                  </span>
                </td>
              </tr>
            ))}

            {!loading && responses.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="booking-empty">
                    No service responses found.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderScheduled = () => (
    <div className="booking-table-card">
      <div className="booking-table-wrapper">
        <table className="booking-table booking-table--scheduled">
          <thead>
            <tr>
              <th>Caregiver</th>
              <th>Requestor</th>
              <th>Service</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Type</th>
            </tr>
          </thead>

          <tbody>
            {scheduled.map((item) => (
              <tr key={item.bookingId}>
                <td>
                  <div className="booking-person">
                    <div className="booking-avatar">
                      <UserRound size={17} />
                    </div>

                    <span className="booking-person-name">
                      {getName(item.provider)}
                    </span>
                  </div>
                </td>

                <td>
                  <span className="booking-table-text">
                    {getName(item.requestor)}
                  </span>
                </td>

                <td>
                  <span className="booking-service-name">
                    {item.service?.name || "—"}
                  </span>
                </td>

                <td>
                  <span className="booking-table-text">
                    {formatDate(item.scheduledDate)}
                  </span>
                </td>

                <td>
                  <span className="booking-table-text">
                    {item.scheduledTime?.start || "—"}{" "}
                    {item.scheduledTime?.end
                      ? `- ${item.scheduledTime.end}`
                      : ""}
                  </span>
                </td>

                <td>
                  <span className="booking-status booking-status--scheduled">
                    {formatStatus(item.status)}
                  </span>
                </td>

                <td>
                  {item.isMultiDay ? (
                    <span className="booking-status booking-status--multiday">
                      Multi-Day
                    </span>
                  ) : (
                    <span className="booking-status booking-status--onetime">
                      One-Time
                    </span>
                  )}
                </td>
              </tr>
            ))}

            {!loading && scheduled.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <div className="booking-empty">
                    No scheduled services found.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPast = () => (
    <div className="booking-table-card">
      <div className="booking-table-wrapper">
        <table className="booking-table booking-table--past">
          <thead>
            <tr>
              <th>Requestor</th>
              <th>Caregiver</th>
              <th>Service</th>
              <th>Date</th>
              <th>Status</th>
              <th>Completed</th>
              <th>Cancelled By</th>
              <th>Reason</th>
            </tr>
          </thead>

          <tbody>
            {pastServices.map((item) => (
              <tr key={item.bookingId}>
                <td>
                  <div className="booking-person">
                    <div className="booking-avatar">
                      <UserRound size={17} />
                    </div>

                    <span className="booking-person-name">
                      {getName(item.requestor)}
                    </span>
                  </div>
                </td>

                <td>
                  <span className="booking-table-text">
                    {getName(item.provider)}
                  </span>
                </td>

                <td>
                  <span className="booking-service-name">
                    {item.service?.name || "—"}
                  </span>
                </td>

                <td>
                  <span className="booking-table-text">
                    {formatDate(item.scheduledDate)}
                  </span>
                </td>

                <td>
                  <span
                    className={`booking-status ${
                      item.status === "completed"
                        ? "booking-status--completed"
                        : item.status === "cancelled"
                        ? "booking-status--cancelled"
                        : "booking-status--noshow"
                    }`}
                  >
                    {formatStatus(item.status)}
                  </span>
                </td>

                <td>
                  <span className="booking-table-text">
                    {formatDateTime(item.completedAt)}
                  </span>
                </td>

                <td>
                  {item.cancellation?.cancelledBy ? (
                    <span
                      className={`booking-status ${
                        typeof item.cancellation.cancelledBy ===
                        "object"
                          ? getName(
                              item.cancellation.cancelledBy
                            ) === getName(item.requestor)
                            ? "booking-status--cancelled"
                            : "booking-status--provider-cancelled"
                          : item.cancellation.cancelledBy ===
                            "user"
                          ? "booking-status--cancelled"
                          : "booking-status--provider-cancelled"
                      }`}
                    >
                      {typeof item.cancellation.cancelledBy ===
                      "object"
                        ? getName(item.cancellation.cancelledBy)
                        : item.cancellation.cancelledBy ===
                          "user"
                        ? "Requestor"
                        : item.cancellation.cancelledBy ===
                          "provider"
                        ? "Caregiver"
                        : formatStatus(
                            item.cancellation.cancelledBy
                          )}
                    </span>
                  ) : (
                    <span className="booking-muted">—</span>
                  )}
                </td>

                <td>
                  {item.cancellation ? (
                    <div className="booking-cancellation">
                      <p>
                        {item.cancellation.reason || "Cancelled"}
                      </p>

                      <span>
                        {formatDateTime(
                          item.cancellation.cancelledAt
                        )}
                      </span>
                    </div>
                  ) : (
                    <span className="booking-muted">—</span>
                  )}
                </td>
              </tr>
            ))}

            {!loading && pastServices.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <div className="booking-empty">
                    No past services found.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="booking-page">
      <div className="booking-container">
        {/* Header */}
        <div className="booking-header">
          <div className="booking-header-content">
            <div>
              <div className="booking-title-row">
                <div className="booking-title-icon">
                  <CalendarDays size={21} />
                </div>

                <h1 className="booking-title">
                  Booking Management
                </h1>
              </div>

              <p className="booking-subtitle">
                Manage caregiver responses, scheduled services and
                requestor booking history.
              </p>
            </div>

            <div className="booking-header-actions">
              <button
                onClick={() => navigate("/admin-config")}
                className="booking-back-btn"
              >
                <ArrowLeft size={17} />
                Back
              </button>

              <button
                onClick={loadData}
                disabled={loading}
                className="booking-refresh-btn"
              >
                <RefreshCw
                  size={17}
                  className={loading ? "booking-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="booking-tabs-card">
          <div className="booking-tabs">
            <button
              onClick={() => changeTab("responses")}
              className={`booking-tab ${
                activeTab === "responses"
                  ? "booking-tab--active"
                  : ""
              }`}
            >
              <CheckCircle2 size={17} />
              Service Responses
            </button>

            <button
              onClick={() => changeTab("scheduled")}
              className={`booking-tab ${
                activeTab === "scheduled"
                  ? "booking-tab--active"
                  : ""
              }`}
            >
              <CalendarDays size={17} />
              Scheduled Services
            </button>

            <button
              onClick={() => changeTab("past")}
              className={`booking-tab ${
                activeTab === "past"
                  ? "booking-tab--active"
                  : ""
              }`}
            >
              <Clock3 size={17} />
              Past Services
            </button>
          </div>
        </div>

        {/* Response Filters */}
        {activeTab === "responses" && (
          <div className="booking-filter-card">
            <div className="booking-search">
              <Search size={18} />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search requestor, caregiver or service..."
              />
            </div>

            <select
              value={responseStatus || ""}
              onChange={(e) => {
                setResponseStatus(
                  e.target.value
                    ? (e.target.value as ServiceResponseParams["status"])
                    : undefined
                );
                setPage(1);
              }}
              className="booking-select"
            >
              <option value="">All Responses</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">
                Provider Rejected
              </option>
              <option value="cancelled_by_requestor">
                User Cancelled
              </option>
              <option value="cancelled_by_provider">
                Provider Cancelled
              </option>
            </select>
          </div>
        )}

        {/* Past Filters */}
        {activeTab === "past" && (
          <div className="booking-filter-card booking-filter-card--past">
            <select
              value={pastStatus || ""}
              onChange={(e) => {
                setPastStatus(
                  e.target.value
                    ? (e.target.value as PastServicesParams["status"])
                    : undefined
                );
                setPage(1);
              }}
              className="booking-select"
            >
              <option value="">All Past Services</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="booking-loading-card">
            <RefreshCw size={22} className="booking-spin" />
            <span>Loading booking data...</span>
          </div>
        ) : (
          <div className="booking-content">
            {activeTab === "responses" && renderResponses()}
            {activeTab === "scheduled" && renderScheduled()}
            {activeTab === "past" && renderPast()}
          </div>
        )}

        {/* Pagination */}
        <div className="booking-pagination">
          <div className="booking-pagination-info">
            <span>Total</span>
            <strong>{pagination.total}</strong>
          </div>

          <div className="booking-pagination-controls">
            <button
              disabled={page <= 1 || loading}
              onClick={() =>
                setPage((current) =>
                  Math.max(current - 1, 1)
                )
              }
              className="booking-pagination-btn"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <div className="booking-page-number">
              <span>{pagination.page}</span>
              <small>/</small>
              <span>{pagination.totalPages || 1}</span>
            </div>

            <button
              disabled={
                page >= pagination.totalPages || loading
              }
              onClick={() =>
                setPage((current) => current + 1)
              }
              className="booking-pagination-btn"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingHistoryScreen;