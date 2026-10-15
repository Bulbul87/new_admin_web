import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  X,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import {
  getStates,
  getCities,
  createCity,
  updateCityName,
} from "../service/pricingService";

import type {
  StateOption,
  CityOption,
} from "../service/pricingService";

const PAGE_SIZE = 10;

const colors = {
  navy: "#14344A",
  blue: "#163A5F",
  lightBlue: "#EAF4FF",
  background: "#F5F7FB",
  border: "#E3EAF2",
  text: "#26384A",
  muted: "#758396",
  green: "#15803D",
  red: "#DC2626",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${colors.border}`,
  borderRadius: 10,
  padding: "12px 13px",
  outline: "none",
  fontSize: 14,
  color: colors.text,
  background: "#FFFFFF",
};

const primaryButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  border: "none",
  borderRadius: 10,
  padding: "11px 17px",
  background: "linear-gradient(135deg, #14344A, #2876A8)",
  color: "#FFFFFF",
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
};

const secondaryButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  border: `1px solid ${colors.border}`,
  borderRadius: 10,
  padding: "10px 14px",
  background: "#FFFFFF",
  color: colors.navy,
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
};

function getCityStateId(city: CityOption): string {
  return typeof city.stateId === "string"
    ? city.stateId
    : city.stateId?._id ?? "";
}

const Cities: React.FC = () => {
  const navigate = useNavigate();

  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);

  const [selectedStateId, setSelectedStateId] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<CityOption | null>(null);
  const [cityName, setCityName] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [statesData, citiesData] = await Promise.all([
        getStates(),
        getCities(),
      ]);

      setStates(statesData);
      setCities(citiesData);

      setSelectedStateId((previous) => {
        if (previous && statesData.some((s) => s._id === previous)) {
          return previous;
        }
        return statesData[0]?._id ?? "";
      });
    } catch (err: any) {
      console.error("Failed to load city management data:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load states and cities. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const selectedState = useMemo(
    () => states.find((state) => state._id === selectedStateId),
    [states, selectedStateId]
  );

  const stateCities = useMemo(() => {
    if (!selectedStateId) return [];

    return cities.filter(
      (city) => getCityStateId(city) === selectedStateId
    );
  }, [cities, selectedStateId]);

  const filteredCities = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return stateCities;

    return stateCities.filter((city) =>
      city.name.toLowerCase().includes(term)
    );
  }, [stateCities, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCities.length / PAGE_SIZE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedCities = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredCities.slice(start, start + PAGE_SIZE);
  }, [filteredCities, safePage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStateId, search]);

  const openAddModal = () => {
    setEditingCity(null);
    setCityName("");
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const openEditModal = (city: CityOption) => {
    setEditingCity(city);
    setCityName(city.name);
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingCity(null);
    setCityName("");
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = cityName.trim();

    if (!trimmedName) {
      setError("Please enter a city name.");
      return;
    }

    if (!selectedStateId) {
      setError("Please select a state first.");
      return;
    }

    const duplicate = stateCities.some(
      (city) =>
        city.name.trim().toLowerCase() === trimmedName.toLowerCase() &&
        city._id !== editingCity?._id
    );

    if (duplicate) {
      setError("This city already exists in the selected state.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editingCity) {
        // Only the city name is updated. The stateId is never changed.
        await updateCityName(editingCity._id, trimmedName);
        setSuccess("City updated successfully.");
      } else {
        await createCity(trimmedName, selectedStateId);
        setSuccess("City added successfully.");
      }

      setModalOpen(false);
      setEditingCity(null);
      setCityName("");

      await loadData();
    } catch (err: any) {
      console.error("Failed to save city:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to save city. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    setSuccess("");
    await loadData();
  };

  return (
    <div
      style={{
        marginLeft: 260,
        marginTop: 70,
        minHeight: "100vh",
        boxSizing: "border-box",
        padding: "30px",
        background: colors.background,
        color: colors.text,
      }}
    >
      <div style={{ maxWidth: 1450, margin: "0 auto" }}>
        {/* PAGE HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 18,
            marginBottom: 28,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #14344A, #2876A8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  boxShadow: "0 7px 18px rgba(20,52,74,0.18)",
                }}
              >
                <Building2 size={23} />
              </div>

              <div>
                <h1
                  style={{
                    color: colors.navy,
                    fontSize: 28,
                    fontWeight: 750,
                    margin: 0,
                    letterSpacing: "-0.6px",
                  }}
                >
                  City Management
                </h1>
                <p
                  style={{
                    color: colors.muted,
                    fontSize: 13,
                    margin: "5px 0 0",
                  }}
                >
                  Manage cities by state and maintain your location directory.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/pricing")}
            style={secondaryButton}
          >
            <ArrowLeft size={16} />
            Back 
          </button>
        </div>

        {/* ALERTS */}
        {error && !modalOpen && (
          <div
            role="alert"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "13px 15px",
              marginBottom: 18,
              border: "1px solid #FECACA",
              background: "#FEF2F2",
              borderRadius: 12,
              color: colors.red,
              fontSize: 13,
            }}
          >
            <AlertCircle size={18} />
            <span style={{ flex: 1 }}>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              style={{
                border: 0,
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "13px 15px",
              marginBottom: 18,
              border: "1px solid #BBF7D0",
              background: "#F0FDF4",
              borderRadius: 12,
              color: colors.green,
              fontSize: 13,
            }}
          >
            <CheckCircle2 size={18} />
            <span style={{ flex: 1 }}>{success}</span>
            <button
              type="button"
              onClick={() => setSuccess("")}
              style={{
                border: 0,
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* STATE SUMMARY */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 18,
            marginBottom: 22,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              border: `1px solid ${colors.border}`,
              borderRadius: 16,
              padding: "21px 22px",
              boxShadow: "0 4px 15px rgba(25,55,85,0.035)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: colors.muted, fontSize: 13 }}>
                Total States
              </span>
              <span
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 39,
                  height: 39,
                  borderRadius: 12,
                  background: "#EAF4FF",
                  color: "#23699A",
                }}
              >
                <MapPin size={20} />
              </span>
            </div>
            <div
              style={{
                marginTop: 12,
                color: colors.navy,
                fontSize: 29,
                fontWeight: 750,
              }}
            >
              {loading ? "—" : states.length}
            </div>
            <div style={{ color: colors.muted, fontSize: 12, marginTop: 5 }}>
              Available in the directory
            </div>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              border: `1px solid ${colors.border}`,
              borderRadius: 16,
              padding: "21px 22px",
              boxShadow: "0 4px 15px rgba(25,55,85,0.035)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: colors.muted, fontSize: 13 }}>
                Cities in Selected State
              </span>
              <span
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 39,
                  height: 39,
                  borderRadius: 12,
                  background: "#E8F8EF",
                  color: "#16804A",
                }}
              >
                <Building2 size={20} />
              </span>
            </div>
            <div
              style={{
                marginTop: 12,
                color: colors.navy,
                fontSize: 29,
                fontWeight: 750,
              }}
            >
              {loading ? "—" : stateCities.length}
            </div>
            <div style={{ color: colors.muted, fontSize: 12, marginTop: 5 }}>
              {selectedState?.name || "Select a state"}
            </div>
          </div>
        </div>

        {/* MAIN PANEL */}
        <div
          style={{
            background: "#FFFFFF",
            border: `1px solid ${colors.border}`,
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: "0 8px 28px rgba(25,55,85,0.045)",
          }}
        >
          {/* PANEL TITLE */}
          <div
            style={{
              padding: "22px 24px",
              borderBottom: `1px solid ${colors.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 750,
                  color: colors.navy,
                  margin: 0,
                }}
              >
                City Directory
              </h2>
              <p
                style={{
                  fontSize: 12,
                  color: colors.muted,
                  margin: "6px 0 0",
                }}
              >
                Select a state to view and manage its cities.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                style={{
                  ...secondaryButton,
                  opacity: loading ? 0.65 : 1,
                }}
              >
                <RefreshCw
                  size={15}
                  style={{
                    animation: loading ? "citySpin 1s linear infinite" : "none",
                  }}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={openAddModal}
                disabled={!selectedStateId || loading}
                style={{
                  ...primaryButton,
                  opacity: !selectedStateId || loading ? 0.6 : 1,
                }}
              >
                <Plus size={17} />
                Add City
              </button>
            </div>
          </div>

          {/* FILTERS */}
          <div
            style={{
              padding: "20px 24px",
              display: "grid",
              gridTemplateColumns: "minmax(220px, 0.85fr) minmax(240px, 1.5fr)",
              gap: 16,
              borderBottom: `1px solid ${colors.border}`,
            }}
            className="city-filter-grid"
          >
            <div>
              <label
                htmlFor="city-state"
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                Select State
              </label>

              <div style={{ position: "relative" }}>
                <MapPin
                  size={17}
                  color={colors.muted}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
                <select
                  id="city-state"
                  value={selectedStateId}
                  onChange={(e) => {
                    setSelectedStateId(e.target.value);
                    setSuccess("");
                    setError("");
                  }}
                  style={{
                    ...inputStyle,
                    paddingLeft: 38,
                    paddingRight: 35,
                    appearance: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="">Select a state</option>
                  {states.map((state) => (
                    <option key={state._id} value={state._id}>
                      {state.name}
                      {state.code ? ` (${state.code})` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  color={colors.muted}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="city-search"
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                Search City
              </label>

              <div style={{ position: "relative" }}>
                <Search
                  size={17}
                  color={colors.muted}
                  style={{
                    position: "absolute",
                    left: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  id="city-search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by city name..."
                  style={{ ...inputStyle, paddingLeft: 40 }}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: 0,
                      background: "transparent",
                      color: colors.muted,
                      cursor: "pointer",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                minWidth: 650,
              }}
            >
              <thead>
                <tr style={{ background: "#F8FAFD" }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>CITY NAME</th>
                  <th style={thStyle}>STATE</th>
                  <th style={thStyle}>CITY ID</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "65px 20px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: 10,
                          color: colors.muted,
                          fontSize: 13,
                        }}
                      >
                        <LoaderCircle
                          size={19}
                          style={{
                            animation: "citySpin 1s linear infinite",
                          }}
                        />
                        Fetching states and cities...
                      </div>
                    </td>
                  </tr>
                ) : !selectedStateId ? (
                  <tr>
                    <td colSpan={5} style={emptyCellStyle}>
                      <MapPin
                        size={32}
                        color="#9CAFC1"
                        style={{ marginBottom: 10 }}
                      />
                      <div style={{ color: colors.navy, fontWeight: 700 }}>
                        Select a state
                      </div>
                      <div style={{ marginTop: 6, fontSize: 13 }}>
                        Choose a state above to view its cities.
                      </div>
                    </td>
                  </tr>
                ) : paginatedCities.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={emptyCellStyle}>
                      <Building2
                        size={32}
                        color="#9CAFC1"
                        style={{ marginBottom: 10 }}
                      />
                      <div style={{ color: colors.navy, fontWeight: 700 }}>
                        {search ? "No matching cities found" : "No cities found"}
                      </div>
                      <div style={{ marginTop: 6, fontSize: 13 }}>
                        {search
                          ? "Try another city name or clear your search."
                          : "Add a city to this state to get started."}
                      </div>
                      {!search && (
                        <button
                          type="button"
                          onClick={openAddModal}
                          style={{ ...primaryButton, marginTop: 17 }}
                        >
                          <Plus size={16} />
                          Add First City
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedCities.map((city, index) => (
                    <tr
                      key={city._id}
                      style={{
                        borderBottom: `1px solid #EDF1F6`,
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#FAFCFF";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#FFFFFF";
                      }}
                    >
                      <td style={tdStyle}>
                        <span
                          style={{
                            color: colors.muted,
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {(safePage - 1) * PAGE_SIZE + index + 1}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 11,
                          }}
                        >
                          <span
                            style={{
                              display: "grid",
                              placeItems: "center",
                              flexShrink: 0,
                              width: 37,
                              height: 37,
                              borderRadius: 11,
                              background: colors.lightBlue,
                              color: "#23699A",
                            }}
                          >
                            <MapPin size={17} />
                          </span>
                          <span
                            style={{
                              color: colors.navy,
                              fontWeight: 650,
                              fontSize: 13,
                            }}
                          >
                            {city.name}
                          </span>
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 7,
                            background: "#F1F5F9",
                            color: "#43576A",
                            padding: "6px 10px",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          <MapPin size={13} />
                          {selectedState?.name || "—"}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: 11,
                            color: colors.muted,
                          }}
                        >
                          {city._id}
                        </span>
                      </td>

                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => openEditModal(city)}
                          title={`Edit ${city.name}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 7,
                            padding: "8px 12px",
                            borderRadius: 9,
                            border: "1px solid #CFE3F5",
                            background: "#F0F7FF",
                            color: "#1D6090",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          <Edit3 size={14} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {!loading && filteredCities.length > 0 && (
            <div
              style={{
                padding: "17px 24px",
                borderTop: `1px solid ${colors.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 15,
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: 12, color: colors.muted }}>
                Showing{" "}
                <strong style={{ color: colors.navy }}>
                  {(safePage - 1) * PAGE_SIZE + 1}–
                  {Math.min(safePage * PAGE_SIZE, filteredCities.length)}
                </strong>{" "}
                of{" "}
                <strong style={{ color: colors.navy }}>
                  {filteredCities.length}
                </strong>{" "}
                cities
              </span>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  style={paginationButton(safePage <= 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - safePage) <= 1
                  )
                  .reduce<(number | string)[]>((items, page, index, list) => {
                    if (index > 0 && page - list[index - 1] > 1) {
                      items.push("...");
                    }
                    items.push(page);
                    return items;
                  }, [])
                  .map((page, index) =>
                    typeof page === "string" ? (
                      <span
                        key={`ellipsis-${index}`}
                        style={{ padding: "0 3px", color: colors.muted }}
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        style={{
                          ...paginationButton(false),
                          background:
                            safePage === page
                              ? "linear-gradient(135deg, #14344A, #2876A8)"
                              : "#FFFFFF",
                          borderColor:
                            safePage === page ? colors.navy : colors.border,
                          color: safePage === page ? "#FFFFFF" : colors.text,
                          fontWeight: safePage === page ? 700 : 500,
                        }}
                      >
                        {page}
                      </button>
                    )
                  )}

                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  style={paginationButton(safePage >= totalPages)}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "#98A5B4",
            marginTop: 18,
          }}
        >
          SeniorAmerica Admin · City Directory Management
        </p>
      </div>

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(12, 30, 46, 0.56)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 18,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="city-modal-title"
            style={{
              width: "100%",
              maxWidth: 490,
              background: "#FFFFFF",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 25px 80px rgba(0,0,0,0.22)",
              animation: "cityModalIn 0.18s ease-out",
            }}
          >
            {/* MODAL HEADER */}
            <div
              style={{
                padding: "22px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, #14344A, #24638B)",
                color: "#FFFFFF",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 43,
                    height: 43,
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.15)",
                  }}
                >
                  {editingCity ? <Edit3 size={21} /> : <Plus size={22} />}
                </div>
                <div>
                  <h2
                    id="city-modal-title"
                    style={{
                      fontSize: 19,
                      fontWeight: 750,
                      margin: 0,
                    }}
                  >
                    {editingCity ? "Edit City" : "Add New City"}
                  </h2>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#D8E8F5",
                      margin: "5px 0 0",
                    }}
                  >
                    {editingCity
                      ? "Update the city name"
                      : "Add a city to the selected state"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close modal"
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 35,
                  height: 35,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.25)",
                  background: "rgba(255,255,255,0.1)",
                  color: "#FFFFFF",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ padding: "24px" }}>
                {error && (
                  <div
                    role="alert"
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "flex-start",
                      padding: 12,
                      marginBottom: 18,
                      borderRadius: 10,
                      background: "#FEF2F2",
                      border: "1px solid #FECACA",
                      color: colors.red,
                      fontSize: 12,
                    }}
                  >
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    {error}
                  </div>
                )}

                <div style={{ marginBottom: 20 }}>
                  <label
                    htmlFor="modal-city-state"
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      color: colors.text,
                    }}
                  >
                    State
                  </label>

                  {/* State is deliberately locked while editing. */}
                  <div style={{ position: "relative" }}>
                    <MapPin
                      size={16}
                      color={colors.muted}
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    />
                    <input
                      id="modal-city-state"
                      value={selectedState?.name ?? ""}
                      readOnly
                      style={{
                        ...inputStyle,
                        paddingLeft: 38,
                        background: "#F4F7FA",
                        color: "#66788A",
                        cursor: "not-allowed",
                      }}
                    />
                  </div>

                  <p
                    style={{
                      margin: "7px 0 0",
                      fontSize: 11,
                      color: colors.muted,
                    }}
                  >
                    {editingCity
                      ? "A city cannot be moved to another state."
                      : "The new city will belong to this state."}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="modal-city-name"
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      color: colors.text,
                    }}
                  >
                    City Name <span style={{ color: colors.red }}>*</span>
                  </label>

                  <input
                    id="modal-city-name"
                    autoFocus
                    type="text"
                    value={cityName}
                    onChange={(e) => {
                      setCityName(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Enter city name"
                    maxLength={100}
                    required
                    style={inputStyle}
                  />
                  <p
                    style={{
                      fontSize: 11,
                      color: colors.muted,
                      margin: "7px 0 0",
                    }}
                  >
                    {cityName.trim().length}/100 characters
                  </p>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  padding: "16px 24px",
                  borderTop: `1px solid ${colors.border}`,
                  background: "#FAFCFE",
                }}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  style={{
                    ...secondaryButton,
                    padding: "11px 17px",
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || !cityName.trim() || !selectedStateId}
                  style={{
                    ...primaryButton,
                    minWidth: 130,
                    opacity:
                      saving || !cityName.trim() || !selectedStateId
                        ? 0.65
                        : 1,
                  }}
                >
                  {saving ? (
                    <>
                      <LoaderCircle
                        size={16}
                        style={{
                          animation: "citySpin 1s linear infinite",
                        }}
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingCity ? <CheckCircle2 size={16} /> : <Plus size={17} />}
                      {editingCity ? "Save Changes" : "Add City"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOCAL ANIMATIONS + RESPONSIVE FILTERS */}
      <style>
        {`
          @keyframes citySpin {
            to { transform: rotate(360deg); }
          }

          @keyframes cityModalIn {
            from { opacity: 0; transform: translateY(8px) scale(0.99); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }

          @media (max-width: 900px) {
            .city-filter-grid {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 768px) {
            .city-filter-grid {
              padding: 16px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: "15px 18px",
  color: "#758396",
  fontSize: 10,
  letterSpacing: "0.7px",
  fontWeight: 750,
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 18px",
  fontSize: 13,
  verticalAlign: "middle",
};

const emptyCellStyle: React.CSSProperties = {
  padding: "58px 20px",
  textAlign: "center",
  color: "#758396",
  fontSize: 13,
};

function paginationButton(disabled: boolean): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 34,
    height: 34,
    padding: "0 8px",
    border: `1px solid ${colors.border}`,
    borderRadius: 9,
    background: "#FFFFFF",
    color: disabled ? "#B6C0CC" : colors.text,
    fontSize: 12,
    cursor: disabled ? "not-allowed" : "pointer",
  };
}

export default Cities;