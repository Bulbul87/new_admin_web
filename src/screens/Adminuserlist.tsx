
import React, { useEffect, useState } from "react";

import {
  getAllUsers,
  getAllProviders,
  approveProvider,
  rejectProvider,
  activateUser,
} from "../service/admin.service";

import { useNavigate, useLocation } from "react-router-dom";

import {
  FaEnvelope,
  FaPhone,
  FaSearch,
  FaUserCircle,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const AdminUsers: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ACTIVE TAB
  const [activeTab, setActiveTab] = useState<
    "requester" | "deactive" | "provider"
  >(
    location.state?.activeTab === "provider"
      ? "provider"
      : location.state?.activeTab === "deactive"
      ? "deactive"
      : "requester"
  );

  // DATA
  const [data, setData] = useState<any[]>([]);
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // ACTIVATION LOADING
  const [activatingId, setActivatingId] = useState<string | null>(null);

  // PAGINATION
  const [requesterPage, setRequesterPage] = useState(1);
  const [deactivePage, setDeactivePage] = useState(1);
  const [providerPage, setProviderPage] = useState(1);

  const [requesterTotalPages, setRequesterTotalPages] = useState(1);
  const [deactiveTotalPages, setDeactiveTotalPages] = useState(1);
  const [providerTotalPages, setProviderTotalPages] = useState(1);

  const ITEMS_PER_PAGE = 20;

  // FETCH ACTIVE REQUESTERS
  const loadRequesters = async (page = requesterPage) => {
    try {
      setLoading(true);
      setActiveTab("requester");
      setSearch("");

      const response = await getAllUsers(page, ITEMS_PER_PAGE);

      console.log("ACTIVE REQUESTERS RESPONSE:", response);

      const users = response?.users || [];

      const activeUsers = users
        .filter((user: any) => user.isActive === true)
        .map((user: any) => ({
          ...user,
          _isProvider: false,
        }));

      setData(activeUsers);
      setOriginalData(activeUsers);

      setRequesterTotalPages(response?.pagination?.totalPages || 1);
      setRequesterPage(response?.pagination?.page || page);
    } catch (err) {
      console.log("Requester Error:", err);
      setData([]);
      setOriginalData([]);
    } finally {
      setLoading(false);
    }
  };

  // FETCH ONLY INACTIVE REQUESTERS
  // Unverified providers are NOT included in this tab.
  const loadDeactiveUsers = async (page = deactivePage) => {
    try {
      setLoading(true);
      setActiveTab("deactive");
      setSearch("");

      const response = await getAllUsers(page, ITEMS_PER_PAGE);

      console.log("INACTIVE REQUESTERS RESPONSE:", response);

      const users = response?.users || [];

      const inactiveRequesters = users
        .filter((user: any) => user.isActive === false)
        .map((user: any) => ({
          ...user,
          _isProvider: false,
        }));

      setData(inactiveRequesters);
      setOriginalData(inactiveRequesters);

      setDeactiveTotalPages(response?.pagination?.totalPages || 1);
      setDeactivePage(response?.pagination?.page || page);
    } catch (err) {
      console.log("Deactive Users Error:", err);
      setData([]);
      setOriginalData([]);
    } finally {
      setLoading(false);
    }
  };

  // FETCH ALL PROVIDERS: VERIFIED + UNVERIFIED
  const loadProviders = async (page = providerPage) => {
    try {
      setLoading(true);
      setActiveTab("provider");
      setSearch("");

      const response = await getAllProviders(page, ITEMS_PER_PAGE);

      console.log("PROVIDERS RESPONSE:", response);

      const providers = response?.users || [];

      const formattedProviders = providers.map((provider: any) => ({
        ...provider,
        _isProvider: true,
      }));

      setData(formattedProviders);
      setOriginalData(formattedProviders);

      setProviderTotalPages(response?.pagination?.totalPages || 1);
      setProviderPage(response?.pagination?.page || page);
    } catch (err) {
      console.log("Provider Error:", err);
      setData([]);
      setOriginalData([]);
    } finally {
      setLoading(false);
    }
  };

  // ACTIVATE INACTIVE REQUESTER
  const handleActivate = async (id: string) => {
    if (activatingId) return;

    const confirmed = window.confirm(
      "Are you sure you want to activate this requester account?"
    );

    if (!confirmed) return;

    try {
      setActivatingId(id);

      const response = await activateUser(id);

      console.log("ACTIVATE REQUESTER RESPONSE:", response);

      alert("Requester account activated successfully");

      // Refresh inactive list so the activated requester disappears.
      await loadDeactiveUsers(deactivePage);
    } catch (error: any) {
      console.error("Activate Requester Error:", error);

      alert(
        error?.message ||
          "Failed to activate requester. Please try again."
      );
    } finally {
      setActivatingId(null);
    }
  };

  // APPROVE PROVIDER
  const handleApprove = async (id: string) => {
    try {
      await approveProvider(id);
      alert("Caregiver approved successfully");
      loadProviders(providerPage);
    } catch (error) {
      console.error("Approve Error:", error);
      alert("Failed to approve Caregiver");
    }
  };

  // REJECT PROVIDER
  const handleReject = async (id: string) => {
    const reason = window.prompt("Enter rejection reason");

    if (!reason) return;

    try {
      await rejectProvider(id, reason);
      alert("Caregiver rejected successfully");
      loadProviders(providerPage);
    } catch (error) {
      console.error("Reject Error:", error);
      alert("Failed to reject Caregiver");
    }
  };

  // INITIAL LOAD
  useEffect(() => {
    if (activeTab === "provider") {
      loadProviders(1);
    } else if (activeTab === "deactive") {
      loadDeactiveUsers(1);
    } else {
      loadRequesters(1);
    }
    // Initial load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


// SEARCH
useEffect(() => {
  if (!search.trim()) {
    setData(originalData);
    return;
  }

  const query = search.toLowerCase().trim();

  const filteredData = originalData.filter((item) => {
    const fullName =
      item.name ||
      `${item.firstName || ""} ${item.lastName || ""}`;

    const publicId =
      item.requestorInfo?.publicRequesterId ||
      item.providerInfo?.publicProviderId ||
      item.publicRequesterId ||
      item.publicProviderId ||
      "";

    return (
      fullName.toLowerCase().includes(query) ||
      (item.email || "").toLowerCase().includes(query) ||
      publicId.toLowerCase().includes(query)
    );
  });

  setData(filteredData);
}, [search, originalData]);


  // PAGINATION BUTTON STYLE
  const getPageButtonStyle = (
    isActive: boolean
  ): React.CSSProperties => ({
    minWidth: 38,
    height: 38,
    padding: "0 10px",
    borderRadius: 9,
    border: isActive ? "none" : "1px solid rgba(20,52,74,.12)",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    color: "#14344A",
    background: isActive
      ? "linear-gradient(to right,#FFFF6D,#8FDAFA)"
      : "#fff",
    boxShadow: isActive ? "0 4px 12px rgba(0,0,0,.08)" : "none",
    transition: ".2s",
  });

  // PAGINATION
  const renderPagination = () => {
    let currentPage = 1;
    let totalPages = 1;

    if (activeTab === "requester") {
      currentPage = requesterPage;
      totalPages = requesterTotalPages;
    } else if (activeTab === "deactive") {
      currentPage = deactivePage;
      totalPages = deactiveTotalPages;
    } else {
      currentPage = providerPage;
      totalPages = providerTotalPages;
    }

    if (totalPages <= 1) return null;

    const loadPage = (page: number) => {
      if (page === currentPage || loading) return;

      if (activeTab === "requester") {
        loadRequesters(page);
      } else if (activeTab === "deactive") {
        loadDeactiveUsers(page);
      } else {
        loadProviders(page);
      }
    };

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    const pages: number[] = [];

    for (let page = startPage; page <= endPage; page++) {
      pages.push(page);
    }

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
          padding: "22px 20px",
          borderTop: "1px solid rgba(20,52,74,.08)",
          background: "#fff",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => loadPage(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          style={{
            height: 38,
            padding: "0 14px",
            borderRadius: 9,
            border: "1px solid rgba(20,52,74,.12)",
            background: currentPage === 1 ? "#f2f4f6" : "#fff",
            color: currentPage === 1 ? "#aaa" : "#14344A",
            cursor:
              currentPage === 1 || loading ? "not-allowed" : "pointer",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <FaChevronLeft size={11} />
          Previous
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => loadPage(1)}
              style={getPageButtonStyle(currentPage === 1)}
              disabled={loading}
            >
              1
            </button>

            {startPage > 2 && (
              <span style={{ color: "#8A98A8", padding: "0 3px" }}>
                ...
              </span>
            )}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => loadPage(page)}
            disabled={loading}
            style={getPageButtonStyle(currentPage === page)}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span style={{ color: "#8A98A8", padding: "0 3px" }}>
                ...
              </span>
            )}

            <button
              onClick={() => loadPage(totalPages)}
              style={getPageButtonStyle(currentPage === totalPages)}
              disabled={loading}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => loadPage(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          style={{
            height: 38,
            padding: "0 14px",
            borderRadius: 9,
            border: "1px solid rgba(20,52,74,.12)",
            background: currentPage === totalPages ? "#f2f4f6" : "#fff",
            color: currentPage === totalPages ? "#aaa" : "#14344A",
            cursor:
              currentPage === totalPages || loading
                ? "not-allowed"
                : "pointer",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          Next
          <FaChevronRight size={11} />
        </button>
      </div>
    );
  };

  // TAB BUTTON STYLE
  const getTabStyle = (
    tab: "requester" | "deactive" | "provider"
  ): React.CSSProperties => ({
    width: 180,
    padding: "12px",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    transition: "0.3s",
    background:
      activeTab === tab
        ? "linear-gradient(to right, #FFFF6D, #8FDAFA)"
        : "#fff",
    color: activeTab === tab ? "#14344A" : "#666",
    boxShadow:
      activeTab === tab
        ? "0 6px 20px rgba(0,0,0,0.1)"
        : "0 2px 10px rgba(0,0,0,0.06)",
  });

  // STATUS TEXT
  const getStatusText = (item: any) => {
    if (item._isProvider) {
      return item.providerInfo?.isVerified ? "Verified" : "Unverified";
    }

    return item.isActive ? "Active" : "Inactive";
  };

  // STATUS STYLE
  const getStatusStyle = (item: any): React.CSSProperties => {
    if (item._isProvider) {
      const verified = item.providerInfo?.isVerified === true;

      return {
        display: "inline-block",
        padding: "7px 14px",
        borderRadius: 20,
        fontSize: 13,
        fontWeight: 700,
        color: verified ? "#198754" : "#dc3545",
        background: verified
          ? "rgba(25,135,84,.12)"
          : "rgba(220,53,69,.12)",
      };
    }

    const active = item.isActive === true;

    return {
      display: "inline-block",
      padding: "7px 14px",
      borderRadius: 20,
      fontSize: 13,
      fontWeight: 700,
      color: active ? "#198754" : "#dc3545",
      background: active
        ? "rgba(25,135,84,.12)"
        : "rgba(220,53,69,.12)",
    };
  };

  return (
    <div
      style={{
        marginLeft: "260px",
        marginTop: "70px",
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "30px",
      }}
    >
      {/* TAB BUTTONS */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 20,
          marginBottom: 30,
          flexWrap: "wrap",
        }}
      >
        <button
          style={getTabStyle("requester")}
          onClick={() => loadRequesters(requesterPage)}
        >
          Requesters
        </button>

        <button
          style={getTabStyle("deactive")}
          onClick={() => loadDeactiveUsers(deactivePage)}
        >
          Deactive Users
        </button>

        <button
          style={getTabStyle("provider")}
          onClick={() => loadProviders(providerPage)}
        >
          Caregivers
        </button>

        {/* PROVIDER STATUS */}
        <button
          style={{
            width: 180,
            padding: "12px",
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            transition: "0.3s",
            background: "#fff",
            color: "#666",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          }}
          onClick={() => navigate("/provider-status")}
        >
          Caregiver Status
        </button>
      </div>

      {/* SEARCH BAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 35,
        }}
      >
        <div
          style={{
            width: "420px",
            height: "52px",
            display: "flex",
            alignItems: "center",
            background: "#fff",
            borderRadius: "40px",
            padding: "0 18px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <FaSearch color="#14344A" size={16} />

          <input
            type="text"
            placeholder={
              activeTab === "deactive"
                ? "Search inactive requester by Id name or email"
                : `Search ${
                    activeTab === "provider" ? "provider" : "requester"
                  } by Id name or email`
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              width: "100%",
              marginLeft: 12,
              fontSize: 15,
              background: "transparent",
            }}
          />
        </div>
      </div>

      {/* LOADER AND TABLE */}
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 60,
          }}
        >
          <div className="spinner-border" />
        </div>
      ) : data.length === 0 ? (
        <p style={{ textAlign: "center", color: "#777" }}>
          {activeTab === "deactive"
            ? "No Inactive Requesters Found"
            : activeTab === "requester"
            ? "No Active Requesters Found"
            : "No Providers Found"}
        </p>
      ) : (
        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 10px 35px rgba(0,0,0,.08)",
            border: "1px solid rgba(20,52,74,.08)",
          }}
        >
          <div
            style={{
              overflowX: "auto",
              overflowY: "auto",
              maxHeight: "650px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "1100px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "linear-gradient(to right,#FFFF6D,#8FDAFA)",
                    height: 72,
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  {["Profile", "Email", "Phone Number", "Status", "Action"].map(
                    (heading) => (
                      <th
                        key={heading}
                        style={{
                          padding: "0 20px",
                          textAlign: "left",
                          color: "#14344A",
                          fontWeight: 700,
                          fontSize: 15,
                        }}
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {data.map((item, index) => (
                  <tr
                    key={item._id}
                    style={{
                      height: 88,
                      background: index % 2 === 0 ? "#ffffff" : "#FCFDFE",
                      borderBottom: "1px solid rgba(20,52,74,.08)",
                    }}
                  >
                    {/* PROFILE */}
                    <td style={{ padding: "18px 24px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                        }}
                      >
                        <div
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: "50%",
                            background:
                              "linear-gradient(to right,#FFFF6D,#8FDAFA)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxShadow: "0 6px 15px rgba(0,0,0,.08)",
                          }}
                        >
                          <FaUserCircle size={20} color="#14344A" />
                        </div>

                        <div>
                          <div
                            style={{
                              color: "#14344A",
                              fontWeight: 700,
                              fontSize: 16,
                              marginBottom: 4,
                            }}
                          >
                            {item.firstName || item.name || "-"}{" "}
                            {item.lastName || ""}
                            <p  style={{
                            color: "#a4a8af",
                            fontSize: 12,
                            wordBreak: "break-word",
                          }}>{item.requestorInfo?.publicRequesterId || item.providerInfo?.publicProviderId } </p>
                          </div>

                         
                        </div>
                      </div>
                    </td>

                    {/* EMAIL */}
                    <td style={{ padding: "18px 20px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: "#EEF9FE",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FaEnvelope size={15} color="#14344A" />
                        </div>

                        <span
                          style={{
                            color: "#4A5568",
                            fontSize: 15,
                            wordBreak: "break-word",
                          }}
                        >
                          {item.email || "-"}
                        </span>
                      </div>
                    </td>

                    {/* PHONE */}
                    <td style={{ padding: "18px 20px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: "#EEF9FE",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FaPhone
                            size={15}
                            color="#14344A"
                            style={{ transform: "rotate(90deg)" }}
                          />
                        </div>

                        <span
                          style={{
                            color: "#4A5568",
                            fontSize: 15,
                            fontWeight: 500,
                          }}
                        >
                          {item.phone || "-"}
                        </span>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td style={{ padding: "18px 20px", textAlign: "left" }}>
                      <span style={getStatusStyle(item)}>
                        {getStatusText(item)}
                      </span>
                    </td>

                    {/* ACTION */}
                    <td style={{ padding: "18px 20px", textAlign: "left" }}>
                      <div
                        style={{
                          display: "flex",
                        
                          alignItems: "center",
                          gap: 10,
                          flexWrap: "nowrap",
                        }}
                      >
                        {/* ACTIVATE INACTIVE REQUESTER */}
                        {activeTab === "deactive" && !item._isProvider && (
                          <button
                            onClick={() => handleActivate(item._id)}
                            disabled={activatingId !== null}
                            style={{
                              padding: "9px 16px",
                              border: "none",
                              borderRadius: 10,
                              cursor:
                                activatingId !== null
                                  ? "not-allowed"
                                  : "pointer",
                              background:
                                activatingId === item._id
                                  ? "#D1D5DB"
                                  : "#198754",
                              color: "#fff",
                              fontWeight: 600,
                              fontSize: 14,
                              opacity: activatingId !== null ? 0.75 : 1,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {activatingId === item._id
                              ? "Activating..."
                              : "Activate"}
                          </button>
                        )}

                        {activeTab === "provider" && item._isProvider && (
                          <>
                            <button
                              onClick={() => handleApprove(item._id)}
                              disabled={item.providerInfo?.isVerified === true}
                              style={{
                                padding: "9px 16px",
                                border: "none",
                                borderRadius: 10,
                                cursor:
                                  item.providerInfo?.isVerified === true
                                    ? "not-allowed"
                                    : "pointer",
                                background:
                                  item.providerInfo?.isVerified === true
                                    ? "#D1D5DB"
                                    : "#28a745",
                                color:
                                  item.providerInfo?.isVerified === true
                                    ? "#6B7280"
                                    : "#fff",
                                fontWeight: 600,
                                fontSize: 14,
                                opacity:
                                  item.providerInfo?.isVerified === true
                                    ? 0.8
                                    : 1,
                                boxShadow:
                                  item.providerInfo?.isVerified === true
                                    ? "none"
                                    : "0 4px 10px rgba(40,167,69,.18)",
                              }}
                            >
                              Approve
                            </button>

                            <button
                              onClick={() => handleReject(item._id)}
                              style={{
                                padding: "9px 16px",
                                border: "none",
                                borderRadius: 10,
                                cursor: "pointer",
                                background: "#dc3545",
                                color: "#fff",
                                fontWeight: 600,
                                fontSize: 14,
                                boxShadow:
                                  "0 4px 10px rgba(220,53,69,.18)",
                              }}
                            >
                              Reject
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => {
                            if (item._isProvider) {
                              navigate(`/provider-details/${item._id}`, {
                                state: { activeTab },
                              });
                            } else {
                              navigate(`/requester-details/${item._id}`, {
                                state: { activeTab },
                              });
                            }
                          }}
                          style={{
                            padding: "9px 9px",
                            border: "none",
                            borderRadius: 10,
                            cursor: "pointer",
                            fontWeight: 700,
                            color: "#14344A",
                            background:
                              "linear-gradient(to right,#FFFF6D,#8FDAFA)",
                            boxShadow: "0 4px 12px rgba(0,0,0,.08)",
                          }}
                        >
                          See Profile
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {renderPagination()}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;