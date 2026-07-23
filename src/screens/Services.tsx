
import React, { useEffect, useMemo, useState } from "react";
import { FaSearch, FaClock } from "react-icons/fa";

import {
  getServiceCatalog,
  type ServiceCategory,
  type ServiceItem,
} from "../service/service_catlog";

const Services: React.FC = () => {
  // ======================================================
  // DATA
  // ======================================================

  const [categories, setCategories] = useState<ServiceCategory[]>([]);

  // ======================================================
  // UI STATE
  // ======================================================

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  // ======================================================
  // LOAD DATA
  // ======================================================

  const loadData = async () => {
    try {
      setLoading(true);

      const catalogData = await getServiceCatalog();

      setCategories(catalogData || []);

      console.log("Service Catalog =", catalogData);
    } catch (error) {
      console.error("Load Error :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ======================================================
  // SEARCH FILTER
  // ======================================================
  // NOTE: this `useMemo` (and every other hook) must run on *every* render,
  // regardless of loading state — that's why it's declared here, before the
  // `if (loading) return ...` early-return below. Hooks can never sit after
  // a conditional return, or React sees a different number of hooks between
  // renders and throws "Rendered more hooks than during the previous
  // render."

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;

    const keyword = search.toLowerCase();

    return categories
      .map((category) => {
        // Category Name Match
        const categoryMatched = category.categoryName
          .toLowerCase()
          .includes(keyword);

        // Service Match
        const services = category.services.filter((service) => {
          return (
            service.name
              .toLowerCase()
              .includes(keyword) ||
            service.description
              ?.toLowerCase()
              .includes(keyword)
          );
        });

        if (categoryMatched) {
          return category;
        }

        return {
          ...category,
          services,
        };
      })
      .filter((category) => category.services.length > 0);
  }, [categories, search]);

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div
        style={{
          marginLeft: "260px",
          marginTop: "80px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div className="spinner-border" />
      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div
      style={{
        marginLeft: "260px",
        marginTop: "70px",
        minHeight: "100vh",
        background: "#F5F7FB",
        padding: "30px",
      }}
    >
      {/* ========================================= */}
      {/* PAGE TITLE */}
      {/* ========================================= */}

      <div
        style={{
          marginBottom: 25,
        }}
      >
        <h1
          style={{
            color: "#14344A",
            fontWeight: 700,
            marginBottom: 8,
            textAlign:"center"
          }}
        >
          Services 
        </h1>

        
      </div>

      {/* ========================================= */}
      {/* SEARCH */}
      {/* ========================================= */}

      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          padding: 20,
          marginBottom: 30,
          boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            width: 420,
            height: 50,
            background: "#F8FAFC",
            border: "1px solid #E5E7EB",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            padding: "0px 18px",
          }}
        >
          <FaSearch
            color="#64748B"
            size={15}
          />

          <input
            type="text"
            placeholder="Search category or service..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            style={{
              flex: 1,
              marginLeft: 12,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 15,
            }}
          />
        </div>
      </div>

            {/* ========================================= */}
      {/* CATEGORY LIST */}
      {/* ========================================= */}

      {filteredCategories.length === 0 ? (
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: 40,
            textAlign: "center",
            color: "#64748B",
            fontWeight: 600,
            boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
          }}
        >
          No services found.
        </div>
      ) : (
        filteredCategories.map((category) => (
          <div
            key={category._id}
            style={{
              background: "#fff",
              borderRadius: 24,
              marginBottom: 35,
              overflow: "hidden",
              boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
            }}
          >
            {/* ========================================= */}
            {/* CATEGORY HEADER */}
            {/* ========================================= */}

            <div
              style={{
                background:
                  "linear-gradient(90deg,#14344A,#245A7A)",
                color: "#fff",
                padding: "18px 25px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h4
                  style={{
                    margin: 0,
                    fontWeight: 700,
                  }}
                >
                  {category.categoryName}
                </h4>

                <small
                  style={{
                    opacity: 0.9,
                  }}
                >
                  {category.services.length} Services
                </small>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,.15)",
                  padding: "8px 16px",
                  borderRadius: 30,
                  fontWeight: 600,
                }}
              >
                {category.categoryId}
              </div>
            </div>

            {/* ========================================= */}
            {/* TABLE */}
            {/* ========================================= */}

            <div
              style={{
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#EEF5FB",
                      color: "#14344A",
                    }}
                  >
                    <th style={thStyle}>
                      Service ID
                    </th>

                    <th style={thStyle}>
                      Service Name
                    </th>

                    <th style={thStyle}>
                      Description
                    </th>

                    <th style={thStyle}>
                      Duration
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {category.services.map((service) => {
                    return (
                      <tr
                        key={service._id}
                        style={{
                          borderBottom:
                            "1px solid #EEF2F7",
                          transition: "0.25s",
                        }}
                      >
                        {/* ============================= */}
                        {/* SERVICE ID */}
                        {/* ============================= */}

                        <td style={tdStyle}>
                          <div
                            style={{
                              fontWeight: 700,
                              color: "#14344A",
                              fontSize: 14,
                            }}
                          >
                            {service.servId}
                          </div>
                        </td>

                        {/* ============================= */}
                        {/* SERVICE NAME */}
                        {/* ============================= */}

                        <td style={tdStyle}>
                          <div
                            style={{
                              fontWeight: 700,
                              color: "#14344A",
                              fontSize: 15,
                            }}
                          >
                            {service.name}
                          </div>
                        </td>

                        {/* ============================= */}
                        {/* DESCRIPTION */}
                        {/* ============================= */}

                        <td
                          style={{
                            ...tdStyle,
                            maxWidth: 380,
                            color: "#4B5563",
                            lineHeight: 1.6,
                          }}
                        >
                          {service.description}
                        </td>

                        {/* ============================= */}
                        {/* DURATION */}
                        {/* ============================= */}

                        <td style={tdStyle}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <FaClock color="#14344A" />

                            {/* Future API Field */}
                            <span>
                              30 mins
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
            {/* ========================================= */}
      {/* FOOTER */}
      {/* ========================================= */}

      <div
        style={{
          marginTop: 30,
          textAlign: "center",
          color: "#64748B",
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        Total Categories : <b>{filteredCategories.length}</b>
      </div>
    </div>
  );
};

// ======================================================
// TABLE STYLES
// ======================================================

const thStyle: React.CSSProperties = {
  padding: "16px",
  textAlign: "left",
  fontWeight: 700,
  fontSize: 14,
  color: "#14344A",
  whiteSpace: "nowrap",
  borderBottom: "2px solid #DCE7F3",
};

const tdStyle: React.CSSProperties = {
  padding: "18px 16px",
  verticalAlign: "middle",
  fontSize: 14,
  color: "#14344A",
};

export default Services;