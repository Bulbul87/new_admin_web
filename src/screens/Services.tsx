import React, { useEffect, useState } from "react";

import { serviceApi } from "../service/serviceapi";
import type { Service } from "../service/serviceapi";

import { useNavigate } from "react-router-dom";

import {
  FaTrash,
  FaEdit,
  FaSearch,
  FaLayerGroup,
  FaClock,
  FaFire,
  FaRupeeSign,
} from "react-icons/fa";

const Services: React.FC = () => {

  const [services, setServices] = useState<Service[]>([]);

  // ✅ Loading States
  const [loading, setLoading] = useState(false);

  const [initialLoading, setInitialLoading] =
    useState(true);

  // ✅ Search State
  const [search, setSearch] = useState("");

  // ✅ Pagination State
  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const navigate = useNavigate();

  // ✅ Duration Check
  const isDurationObject = (
    d: any
  ): d is {
    value: number;
    unit: string;
  } => {

    return (
      typeof d === "object" &&
      d !== null &&
      "value" in d
    );
  };

  // ==============================
  // FETCH SERVICES
  // ==============================

  const fetchServices = async (
    currentPage = 1,
    searchText = ""
  ) => {

    try {

      if (services.length === 0) {

        setInitialLoading(true);

      } else {

        setLoading(true);

      }

      let res: any;

      // ✅ Search API
      if (searchText.trim()) {

        res =
          await serviceApi.searchServices({
            q: searchText,
            page: currentPage,
            limit: 20,
          });

      } else {

        // ✅ Normal API
        res =
          await serviceApi.getAllServices({
            page: currentPage,
            limit: 20,
          });
      }

      const responseData =
        res.data || res;

      setServices(
        responseData.services || []
      );

      setTotalPages(
        responseData.pagination
          ?.totalPages || 1
      );

      setPage(
        responseData.pagination
          ?.currentPage || 1
      );

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

      setInitialLoading(false);

    }
  };

  // ==============================
  // EFFECT
  // ==============================

  useEffect(() => {

    const timer = setTimeout(() => {

      fetchServices(page, search);

    }, 700);

    return () => clearTimeout(timer);

  }, [page, search]);

  // ==============================
  // DELETE
  // ==============================

  const handleDelete = async (
    id: string
  ) => {

    const confirmDelete =
      window.confirm(
        "Delete this service?"
      );

    if (!confirmDelete) return;

    try {

      await serviceApi.deleteService(id);

      fetchServices(page, search);

    } catch (error) {

      console.log(error);

    }
  };

  // ==============================
  // PAGINATION
  // ==============================

  const getPageNumbers = () => {

    const pages = [];

    let start = Math.max(1, page - 1);

    let end = Math.min(
      totalPages,
      page + 1
    );

    if (page === 1) {
      end = Math.min(3, totalPages);
    }

    if (page === totalPages) {
      start = Math.max(
        totalPages - 2,
        1
      );
    }

    for (
      let i = start;
      i <= end;
      i++
    ) {
      pages.push(i);
    }

    return pages;
  };

  // ==============================
  // LOADER
  // ==============================

  if (initialLoading) {

    return (

      <div
        style={{
          marginLeft: "260px",
          marginTop: "90px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div className="spinner-border" />
      </div>

    );
  }

  // ==============================
  // UI
  // ==============================

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

      {/* ============================== */}
      {/* TOP BAR */}
      {/* ============================== */}

      <div
        style={{
          display: "flex",

          justifyContent:
            "space-between",

          alignItems: "center",

          flexWrap: "wrap",

          gap: 20,

          marginBottom: 30,
        }}
      >

        {/* ADD BUTTON */}

        <button
          onClick={() =>
            navigate("/add-service")
          }
          style={{
            border: "none",

            background:
              "linear-gradient(to right, #FFFF6D, #8FDAFA)",

            color: "#14344A",

            fontWeight: 700,

            padding: "14px 24px",

            borderRadius: 14,

            boxShadow:
              "0 6px 20px rgba(0,0,0,0.08)",

            transition: "0.3s",
          }}
        >
          + Add New Service
        </button>

        {/* SEARCH BAR */}

        <div
          style={{
            width: 350,

            height: 52,

            background: "#fff",

            borderRadius: 16,

            display: "flex",

            alignItems: "center",

            padding: "0 18px",

            boxShadow:
              "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >

          <FaSearch
            color="#999"
            size={16}
          />

          <input
            type="text"

            placeholder="Search services..."

            value={search}

            onChange={(e) => {

              setSearch(
                e.target.value
              );

              setPage(1);

            }}

            style={{
              border: "none",

              outline: "none",

              width: "100%",

              marginLeft: 12,

              background: "transparent",
            }}
          />

        </div>

      </div>

      {/* ============================== */}
      {/* SMALL LOADER */}
      {/* ============================== */}

      {loading && (

        <div className="text-center mb-3">
          <div
            className="spinner-border spinner-border-sm"
            role="status"
          />
        </div>

      )}

      {/* ============================== */}
      {/* SERVICES GRID */}
      {/* ============================== */}

      {services.length > 0 ? (

        <div
          style={{
            display: "grid",

            gridTemplateColumns:
              "repeat(2, 1fr)",

            gap: 25,
          }}
        >

          {services.map((item) => (

            <div
              key={item._id}
              style={{
                background: "#fff",

                borderRadius: 24,

                padding: 24,

                boxShadow:
                  "0 4px 20px rgba(0,0,0,0.06)",

                transition: "0.3s",
              }}
            >

              {/* TOP */}

              <div
                style={{
                  display: "flex",

                  justifyContent:
                    "space-between",

                  alignItems: "center",

                  marginBottom: 20,
                }}
              >

                <div>

                  <h4
                    style={{
                      color: "#14344A",

                      marginBottom: 8,

                      fontWeight: 700,
                    }}
                  >
                    {item.name}
                  </h4>

                  <div
                    style={{
                      display: "inline-block",

                      background:
                        "rgba(143,218,250,0.2)",

                      color: "#14344A",

                      padding:
                        "6px 14px",

                      borderRadius: 20,

                      fontSize: 13,

                      fontWeight: 600,
                    }}
                  >
                    {item.category}
                  </div>

                </div>

                {/* STATUS */}

                <div
                  style={{
                    background:
                      item.isActive
                        ? "rgba(0,200,83,0.12)"
                        : "rgba(255,0,0,0.1)",

                    color:
                      item.isActive
                        ? "green"
                        : "red",

                    padding:
                      "8px 14px",

                    borderRadius: 20,

                    fontSize: 13,

                    fontWeight: 700,
                  }}
                >
                  {item.isActive
                    ? "Active"
                    : "Inactive"}
                </div>

              </div>

              {/* DESCRIPTION */}

              {item.description && (

                <p
                  style={{
                    color: "#666",

                    lineHeight: 1.7,

                    minHeight: 55,
                  }}
                >
                  {item.description}
                </p>

              )}

              {/* DETAILS */}

              <div
                style={{
                  display: "grid",

                  gridTemplateColumns:
                    "1fr 1fr",

                  gap: 18,

                  marginTop: 20,
                }}
              >

                {/* PRICE */}

                <div
                  style={{
                    background:
                      "#f8fbff",

                    borderRadius: 16,

                    padding: 16,
                  }}
                >

                  <div
                    style={{
                      display: "flex",

                      alignItems: "center",

                      gap: 10,

                      marginBottom: 8,
                    }}
                  >

                    <FaRupeeSign color="#14344A" />

                    <small
                      style={{
                        color: "#777",
                      }}
                    >
                      Price
                    </small>

                  </div>

                  <h6
                    style={{
                      margin: 0,

                      color: "#14344A",

                      fontWeight: 700,
                    }}
                  >
                    ₹ {item.basePrice}
                  </h6>

                </div>

                {/* DURATION */}

                <div
                  style={{
                    background:
                      "#f8fbff",

                    borderRadius: 16,

                    padding: 16,
                  }}
                >

                  <div
                    style={{
                      display: "flex",

                      alignItems: "center",

                      gap: 10,

                      marginBottom: 8,
                    }}
                  >

                    <FaClock color="#14344A" />

                    <small
                      style={{
                        color: "#777",
                      }}
                    >
                      Duration
                    </small>

                  </div>

                  <h6
                    style={{
                      margin: 0,

                      color: "#14344A",

                      fontWeight: 700,
                    }}
                  >
                    {item.duration
                      ? isDurationObject(
                          item.duration
                        )
                        ? `${item.duration.value} ${item.duration.unit}`
                        : `${item.duration} mins`
                      : "N/A"}
                  </h6>

                </div>

                {/* POPULARITY */}

                <div
                  style={{
                    background:
                      "#f8fbff",

                    borderRadius: 16,

                    padding: 16,
                  }}
                >

                  <div
                    style={{
                      display: "flex",

                      alignItems: "center",

                      gap: 10,

                      marginBottom: 8,
                    }}
                  >

                    <FaFire color="#14344A" />

                    <small
                      style={{
                        color: "#777",
                      }}
                    >
                      Popularity
                    </small>

                  </div>

                  <h6
                    style={{
                      margin: 0,

                      color: "#14344A",

                      fontWeight: 700,
                    }}
                  >
                    {item.popularity || 0}
                  </h6>

                </div>

                {/* CREATED */}

                <div
                  style={{
                    background:
                      "#f8fbff",

                    borderRadius: 16,

                    padding: 16,
                  }}
                >

                  <div
                    style={{
                      display: "flex",

                      alignItems: "center",

                      gap: 10,

                      marginBottom: 8,
                    }}
                  >

                    <FaLayerGroup color="#14344A" />

                    <small
                      style={{
                        color: "#777",
                      }}
                    >
                      Created
                    </small>

                  </div>

                  <h6
                    style={{
                      margin: 0,

                      color: "#14344A",

                      fontWeight: 700,

                      fontSize: 14,
                    }}
                  >
                    {new Date(
                      item.createdAt
                    ).toLocaleDateString()}
                  </h6>

                </div>

              </div>

              {/* TAGS */}

              {item.tags &&
                item.tags.length > 0 && (

                  <div
                    style={{
                      marginTop: 20,
                    }}
                  >

                    {item.tags.map(
                      (tag, index) => (

                        <span
                          key={index}
                          style={{
                            display:
                              "inline-block",

                            background:
                              "rgba(52,183,234,0.12)",

                            color:
                              "#14344A",

                            padding:
                              "7px 14px",

                            borderRadius: 20,

                            fontSize: 12,

                            marginRight: 8,

                            marginBottom: 8,

                            fontWeight: 600,
                          }}
                        >
                          {tag}
                        </span>

                      )
                    )}

                  </div>

                )}

              {/* BUTTONS */}

              <div
                style={{
                  display: "flex",

                  justifyContent:
                    "space-between",

                  marginTop: 25,

                  gap: 14,
                }}
              >

                {/* EDIT */}

                <button
                  onClick={() =>
                    navigate(
                      "/edit-service",
                      {
                        state: {
                          service:
                            item,
                        },
                      }
                    )
                  }

                  style={{
                    flex: 1,

                    border: "none",

                    background:
                      "rgba(52,183,234,0.15)",

                    color: "#14344A",

                    padding:
                      "12px 16px",

                    borderRadius: 14,

                    fontWeight: 700,
                  }}
                >

                  <FaEdit /> Edit

                </button>

                {/* DELETE */}

                <button
                  onClick={() =>
                    handleDelete(
                      item._id
                    )
                  }

                  style={{
                    flex: 1,

                    border: "none",

                    background:
                      "#14344A",

                    color: "#fff",

                    padding:
                      "12px 16px",

                    borderRadius: 14,

                    fontWeight: 700,
                  }}
                >

                  <FaTrash /> Delete

                </button>

              </div>

            </div>

          ))}

        </div>

      ) : (

        <div className="text-center mt-5">
          <h5>No Services Found</h5>
        </div>

      )}

      {/* ============================== */}
      {/* PAGINATION */}
      {/* ============================== */}

      <div
        style={{
          display: "flex",

          justifyContent: "center",

          alignItems: "center",

          gap: 12,

          marginTop: 40,
        }}
      >

        {/* PREV */}

        <button
          disabled={page === 1}

          onClick={() =>
            setPage(page - 1)
          }

          style={{
            border: "none",

            background: "#fff",

            padding: "10px 18px",

            borderRadius: 12,

            boxShadow:
              "0 3px 12px rgba(0,0,0,0.06)",

            fontWeight: 600,
          }}
        >
          Prev
        </button>

        {/* PAGE NUMBERS */}

        {getPageNumbers().map((p) => (

          <button
            key={p}

            onClick={() =>
              setPage(p)
            }

            style={{
              border: "none",

              width: 42,
              height: 42,

              borderRadius: 12,

              background:
                p === page
                  ? "#14344A"
                  : "#fff",

              color:
                p === page
                  ? "#fff"
                  : "#14344A",

              fontWeight: 700,

              boxShadow:
                "0 3px 12px rgba(0,0,0,0.06)",
            }}
          >
            {p}
          </button>

        ))}

        {/* NEXT */}

        <button
          disabled={
            page === totalPages
          }

          onClick={() =>
            setPage(page + 1)
          }

          style={{
            border: "none",

            background: "#fff",

            padding: "10px 18px",

            borderRadius: 12,

            boxShadow:
              "0 3px 12px rgba(0,0,0,0.06)",

            fontWeight: 600,
          }}
        >
          Next
        </button>

      </div>

    </div>
  );
};

export default Services;