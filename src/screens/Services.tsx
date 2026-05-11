


import React, { useEffect, useState } from "react";
import { serviceApi } from "../service/serviceapi";
import type { Service } from "../service/serviceapi";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaEdit, FaSearch } from "react-icons/fa";

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);

  // ✅ Loading States
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // ✅ Search State
  const [search, setSearch] = useState("");

  // ✅ Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  // ✅ Duration Check
  const isDurationObject = (
    d: any
  ): d is { value: number; unit: string } => {
    return typeof d === "object" && d !== null && "value" in d;
  };

  // ✅ Fetch Services
  const fetchServices = async (
    currentPage = 1,
    searchText = ""
  ) => {
    try {

      // ✅ Initial Loader
      if (services.length === 0) {
        setInitialLoading(true);
      } else {
        setLoading(true);
      }

      let res: any;

      // ✅ Search API
      if (searchText.trim()) {

        res = await serviceApi.searchServices({
          q: searchText,
          page: currentPage,
          limit: 20,
        });

      } else {

        // ✅ Normal API
        res = await serviceApi.getAllServices({
          page: currentPage,
          limit: 20,
        });

      }

      const responseData = res.data || res;

      setServices(responseData.services || []);
      setTotalPages(responseData.pagination?.totalPages || 1);
      setPage(responseData.pagination?.currentPage || 1);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
      setInitialLoading(false);

    }
  };

  // ✅ Search + Pagination Effect
  useEffect(() => {

    const timer = setTimeout(() => {
      fetchServices(page, search);
    }, 700);

    return () => clearTimeout(timer);

  }, [page, search]);

  // ❌ DELETE
  const handleDelete = async (id: string) => {

    const confirmDelete = window.confirm(
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

  // ✅ Pagination Logic
  const getPageNumbers = () => {

    const pages = [];

    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, page + 1);

    if (page === 1) {
      end = Math.min(3, totalPages);
    }

    if (page === totalPages) {
      start = Math.max(totalPages - 2, 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  // ✅ Initial Full Loader
  if (initialLoading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>

      {/* Header */}
      <div
        style={{
          backgroundColor: "#14344A",
          padding: "18px",
          textAlign: "center",
        }}
      >
        <h2 style={{ color: "#fff", margin: 0 }}>
          Senior America Services
        </h2>
      </div>

      <div className="container mt-3">

        {/* ✅ Top Bar */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">

          {/* Add Button */}
          <button
            className="btn text-white"
            style={{
              backgroundColor:
                "rgba(52, 183, 234, 1)",
            }}
            onClick={() =>
              navigate("/add-service")
            }
          >
            + Add New Service
          </button>

          {/* ✅ Search Bar */}
          <div
            className="d-flex align-items-center border rounded px-3"
            style={{
              width: "320px",
              height: "45px",
              background: "#fff",
            }}
          >
            <FaSearch color="#999" />

            <input
              type="text"
              placeholder="Search services..."
              className="form-control border-0 shadow-none"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

        </div>

        {/* ✅ Small Loader */}
        {loading && (
          <div className="text-center mb-3">
            <div
              className="spinner-border spinner-border-sm"
              role="status"
            />
          </div>
        )}

        {/* ✅ Services List */}
        {services.length > 0 ? (

          services.map((item) => (

            <div
              key={item._id}
              className="card mb-3 p-3 shadow-sm"
              style={{
                borderRadius: "12px",
              }}
            >

              <h5 style={{ color: "#10d2f0" }}>
                {item.name}
              </h5>

              <div className="row mt-2">

                <div className="col-md-6">
                  <small>Category</small>
                  <p>{item.category}</p>
                </div>

                <div className="col-md-6">
                  <small>Price</small>
                  <p>₹ {item.basePrice}</p>
                </div>

                {item.description && (
                  <div className="col-md-6">
                    <small>Description</small>
                    <p>{item.description}</p>
                  </div>
                )}

                {item.duration && (
                  <div className="col-md-6">
                    <small>Duration</small>

                    <p>
                      {isDurationObject(
                        item.duration
                      )
                        ? `${item.duration.value} ${item.duration.unit}`
                        : `${item.duration} mins`}
                    </p>
                  </div>
                )}

                <div className="col-md-6">
                  <small>Status</small>

                  <p
                    style={{
                      color: item.isActive
                        ? "green"
                        : "red",
                    }}
                  >
                    {item.isActive
                      ? "Active"
                      : "Inactive"}
                  </p>
                </div>

                {item.tags && (
                  <div className="col-md-6">
                    <small>Tags</small>

                    <p>
                      {item.tags.join(", ")}
                    </p>
                  </div>
                )}

                <div className="col-md-6">
                  <small>Created</small>

                  <p>
                    {new Date(
                      item.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>

                <div className="col-md-6">
                  <small>Popularity</small>

                  <p>{item.popularity}</p>
                </div>

              </div>

              {/* ✅ Buttons */}
              <div className="d-flex justify-content-between mt-3">

                <button
                  className="btn btn-outline-primary"
                  onClick={() =>
                    navigate("/edit-service", {
                      state: {
                        service: item,
                      },
                    })
                  }
                >
                  <FaEdit /> Edit
                </button>

                <button
                  className="btn text-white"
                  style={{
                    backgroundColor:
                      "#1C355D",
                  }}
                  onClick={() =>
                    handleDelete(item._id)
                  }
                >
                  <FaTrash /> Delete
                </button>

              </div>

            </div>

          ))

        ) : (

          <div className="text-center mt-5">
            <h5>No Services Found</h5>
          </div>

        )}

        {/* ✅ Pagination */}
        <div className="d-flex justify-content-center align-items-center gap-2 mt-4">

          {/* Prev */}
          <button
            className="btn btn-outline-secondary"
            disabled={page === 1}
            onClick={() =>
              setPage(page - 1)
            }
          >
            Prev
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((p) => (
            <button
              key={p}
              className={`btn ${
                p === page
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}

          {/* Next */}
          <button
            className="btn btn-outline-secondary"
            disabled={page === totalPages}
            onClick={() =>
              setPage(page + 1)
            }
          >
            Next
          </button>

        </div>

      </div>
    </div>
  );
};

export default Services;