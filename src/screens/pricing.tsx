
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  DollarSign,
  Loader2,
  MapPin,
  RefreshCw,
  Save,
  Wrench,
} from "lucide-react";

import {
  buildPricingPayload,
  getCities,
  getPricingRules,
  getServiceCatalog,
  getStateIdFromCity,
  getStates,
  updatePricing,
} from "../service/pricingService";

import type {
  CityOption,
  PricingRule,
  ServiceCatalogItem,
  ServiceItem,
  StateOption,
} from "../service/pricingService";

// ======================================================
// TYPES
// ======================================================

interface FormErrors {
  state?: string;
  requesterPrice?: string;
  providerPrice?: string;
}

interface StatusMessage {
  type: "success" | "error";
  text: string;
}

// ======================================================
// COMPONENT
// ======================================================

const Pricing: React.FC = () => {
  // ======================================================
  // MASTER DATA
  // ======================================================

  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [categories, setCategories] = useState<ServiceCatalogItem[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);

  // ======================================================
  // LOADING / ERROR
  // ======================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<StatusMessage | null>(null);

  // ======================================================
  // SELECTED VALUES
  // ======================================================

  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");

  // ======================================================
  // PRICES
  // ======================================================

  const [requesterPrice, setRequesterPrice] = useState("");
  const [providerPrice, setProviderPrice] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});

  // ======================================================
  // LOAD MASTER DATA
  // ======================================================

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        statesData,
        citiesData,
        categoriesData,
        pricingData,
      ] = await Promise.all([
        getStates(),
        getCities(),
        getServiceCatalog(),
        getPricingRules(),
      ]);

      // ----------------------------------------------
      // States
      // ----------------------------------------------

      setStates(Array.isArray(statesData) ? statesData : []);

      // ----------------------------------------------
      // Cities
      // ----------------------------------------------

      setCities(Array.isArray(citiesData) ? citiesData : []);

      // ----------------------------------------------
      // Service Categories
      // ----------------------------------------------
      // Keep the COMPLETE ServiceCatalog object.
      // Do NOT strip category / careTier / price etc.
      // ----------------------------------------------

      const activeCategories = (
        Array.isArray(categoriesData) ? categoriesData : []
      )
        .filter((category) => category.isActive !== false)
        .map((category) => ({
          ...category,
          services: (category.services || []).filter(
            (service) => service.isActive !== false
          ),
        }));

      setCategories(activeCategories);

      // ----------------------------------------------
      // Pricing Rules
      // ----------------------------------------------

      setPricingRules(
        Array.isArray(pricingData) ? pricingData : []
      );

      console.log("====================================");
      console.log("PRICING MASTER DATA");
      console.log("States =", statesData);
      console.log("Cities =", citiesData);
      console.log("Categories =", activeCategories);
      console.log("Pricing Rules =", pricingData);
      console.log("====================================");
    } catch (err) {
      console.error("Pricing load error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load pricing."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // ======================================================
  // FILTERED CITIES
  // ======================================================

  const filteredCities = useMemo(() => {
    if (!Array.isArray(cities) || !selectedStateId) {
      return [];
    }

    return cities.filter((city) => {
      return (
        getStateIdFromCity(city) === selectedStateId
      );
    });
  }, [cities, selectedStateId]);

  // ======================================================
  // SELECTED CATEGORY
  // ======================================================
  // selectedCategoryId contains Mongo _id because the
  // select option uses category._id.
  // ======================================================

  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId) {
      return null;
    }

    return (
      categories.find(
        (category) =>
          category._id === selectedCategoryId
      ) ?? null
    );
  }, [categories, selectedCategoryId]);

  // ======================================================
  // FILTERED SERVICES
  // ======================================================

  const filteredServices = useMemo<ServiceItem[]>(() => {
    if (!selectedCategory) {
      return [];
    }

    return (selectedCategory.services || []).filter(
      (service) => service.isActive !== false
    );
  }, [selectedCategory]);

  // ======================================================
  // RESOLVED BUSINESS CATEGORY ID
  // ======================================================
  // Backend expects:
  // categoryId = "medical-care" / "CAT001" etc.
  //
  // UI uses:
  // selectedCategoryId = Mongo _id
  // ======================================================

  const resolvedCategoryId = useMemo(() => {
    return selectedCategory?.categoryId || "";
  }, [selectedCategory]);

  // ======================================================
  // RESOLVED BUSINESS SERVICE ID
  // ======================================================
  // Backend expects:
  // serviceId = service.servId
  //
  // UI uses:
  // selectedServiceId = Mongo subdocument _id
  // ======================================================

  const resolvedServiceId = useMemo(() => {
    if (!selectedServiceId) {
      return "";
    }

    return (
      filteredServices.find(
        (service) =>
          service._id === selectedServiceId
      )?.servId || ""
    );
  }, [filteredServices, selectedServiceId]);

  // ======================================================
  // LOAD EXISTING PRICING
  // ======================================================

  const loadExistingPricing = useCallback(
    (rules: PricingRule[] = pricingRules) => {
      if (!selectedStateId) {
        setRequesterPrice("");
        setProviderPrice("");
        return;
      }

      // ----------------------------------------------
      // Filter by state
      // ----------------------------------------------

      let candidates = (rules || []).filter((item) => {
        return item.stateId?._id === selectedStateId;
      });

      // ----------------------------------------------
      // Filter by city
      // ----------------------------------------------

      if (selectedCityId) {
        candidates = candidates.filter((item) => {
          return item.cityId?._id === selectedCityId;
        });
      }

      // ----------------------------------------------
      // Filter by SERVICE
      // ----------------------------------------------

      if (selectedServiceId && resolvedServiceId) {
        candidates = candidates.filter((item) => {
          return (
            item.serviceId === resolvedServiceId
          );
        });
      }

      // ----------------------------------------------
      // Filter by CATEGORY
      // ----------------------------------------------

      else if (
        selectedCategoryId &&
        resolvedCategoryId
      ) {
        candidates = candidates.filter((item) => {
          return (
            item.categoryId === resolvedCategoryId
          );
        });
      }

      // ----------------------------------------------
      // No pricing found
      // ----------------------------------------------

      if (candidates.length === 0) {
        setRequesterPrice("");
        setProviderPrice("");
        return;
      }

      // ----------------------------------------------
      // Find most common price
      // ----------------------------------------------
      // Important for STATE/CITY/CATEGORY level:
      // multiple pricing records can exist because the
      // backend creates pricing for many services/cities.
      // We select the most common requester/provider pair.
      // ----------------------------------------------

      let rule: PricingRule | undefined;

      if (candidates.length === 1) {
        rule = candidates[0];
      } else {
        const counts = new Map<
          string,
          {
            rule: PricingRule;
            count: number;
          }
        >();

        for (const item of candidates) {
          const key = `${item.requesterPrice}_${item.providerPrice}`;

          const existing = counts.get(key);

          if (existing) {
            existing.count += 1;
          } else {
            counts.set(key, {
              rule: item,
              count: 1,
            });
          }
        }

        let best:
          | {
              rule: PricingRule;
              count: number;
            }
          | undefined;

        counts.forEach((entry) => {
          if (!best || entry.count > best.count) {
            best = entry;
          }
        });

        rule = best?.rule;
      }

      // ----------------------------------------------
      // Set prices
      // ----------------------------------------------

      setRequesterPrice(
        rule ? String(rule.requesterPrice) : ""
      );

      setProviderPrice(
        rule ? String(rule.providerPrice) : ""
      );
    },
    [
      pricingRules,
      selectedStateId,
      selectedCityId,
      selectedCategoryId,
      selectedServiceId,
      resolvedCategoryId,
      resolvedServiceId,
    ]
  );

  // ======================================================
  // AUTO LOAD EXISTING PRICING
  // ======================================================

  useEffect(() => {
    loadExistingPricing();
  }, [loadExistingPricing]);

  // ======================================================
  // PRICING LEVEL
  // ======================================================

  const pricingLevel =
    !selectedCityId
      ? "State"
      : !selectedCategoryId
      ? "City"
      : !selectedServiceId
      ? "Category"
      : "Service";

  // ======================================================
  // CLEAR FORM MESSAGES
  // ======================================================

  const clearMessages = () => {
    setErrors({});
    setStatus(null);
  };

  // ======================================================
  // STATE CHANGE
  // ======================================================

  const handleStateChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const stateId = event.target.value;

    setSelectedStateId(stateId);

    // Reset dependent fields
    setSelectedCityId("");
    setSelectedCategoryId("");
    setSelectedServiceId("");

    // Clear old prices because location changed
    setRequesterPrice("");
    setProviderPrice("");

    clearMessages();
  };

  // ======================================================
  // CITY CHANGE
  // ======================================================

  const handleCityChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const cityId = event.target.value;

    setSelectedCityId(cityId);

    // Reset dependent fields
    setSelectedCategoryId("");
    setSelectedServiceId("");

    // Price will be loaded by effect
    setRequesterPrice("");
    setProviderPrice("");

    clearMessages();
  };

  // ======================================================
  // CATEGORY CHANGE
  // ======================================================

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const categoryId = event.target.value;

    setSelectedCategoryId(categoryId);

    // Reset service
    setSelectedServiceId("");

    // Price will be loaded by effect
    setRequesterPrice("");
    setProviderPrice("");

    clearMessages();
  };

  // ======================================================
  // SERVICE CHANGE
  // ======================================================

  const handleServiceChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const serviceId = event.target.value;

    setSelectedServiceId(serviceId);

    // Price will be loaded by effect
    setRequesterPrice("");
    setProviderPrice("");

    clearMessages();
  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const nextErrors: FormErrors = {};

    const requester = Number(requesterPrice);
    const provider = Number(providerPrice);

    // ----------------------------------------------
    // State validation
    // ----------------------------------------------

    if (!selectedStateId) {
      nextErrors.state = "Please select a state.";
    }

    // ----------------------------------------------
    // Requester price validation
    // ----------------------------------------------

    if (
      requesterPrice === "" ||
      !Number.isFinite(requester) ||
      requester < 0
    ) {
      nextErrors.requesterPrice =
        "Enter a valid requester price.";
    }

    // ----------------------------------------------
    // Provider price validation
    // ----------------------------------------------

    if (
      providerPrice === "" ||
      !Number.isFinite(provider) ||
      provider < 0
    ) {
      nextErrors.providerPrice =
        "Enter a valid provider price.";
    }

    setErrors(nextErrors);
    setStatus(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    // ----------------------------------------------
    // Validate category when selected
    // ----------------------------------------------

    if (selectedCategoryId && !resolvedCategoryId) {
      setStatus({
        type: "error",
        text: "Selected category could not be resolved.",
      });

      return;
    }

    // ----------------------------------------------
    // Validate service when selected
    // ----------------------------------------------

    if (selectedServiceId && !resolvedServiceId) {
      setStatus({
        type: "error",
        text: "Selected service could not be resolved.",
      });

      return;
    }

    setSaving(true);

    try {
      // ----------------------------------------------
      // Build backend payload
      // ----------------------------------------------
      //
      // UI:
      // selectedCategoryId = Mongo _id
      // selectedServiceId   = Mongo subdoc _id
      //
      // Backend:
      // categoryId = category.categoryId
      // serviceId  = service.servId
      // ----------------------------------------------

      const payload = buildPricingPayload({
        stateId: selectedStateId,

        cityId:
          selectedCityId || undefined,

        categoryId:
          selectedCategoryId
            ? resolvedCategoryId
            : undefined,

        serviceId:
          selectedServiceId
            ? resolvedServiceId
            : undefined,

        requesterPrice: requester,

        providerPrice: provider,
      });

      console.log(
        "===================================="
      );
      console.log("UPDATE PRICING PAYLOAD =", payload);
      console.log(
        "===================================="
      );

      // ----------------------------------------------
      // Update Pricing
      // ----------------------------------------------

      const response = await updatePricing(payload);

      setStatus({
        type: "success",
        text:
          response.message ||
          "Pricing updated successfully.",
      });

      // ----------------------------------------------
      // Reload pricing rules
      // ----------------------------------------------

      const updatedRules = await getPricingRules();

      setPricingRules(
        Array.isArray(updatedRules)
          ? updatedRules
          : []
      );

      // ----------------------------------------------
      // Reload current pricing value
      // ----------------------------------------------

      loadExistingPricing(updatedRules);
    } catch (err) {
      console.error(
        "Update pricing error:",
        err
      );

      setStatus({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Unable to update pricing.",
      });
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // LOADING SCREEN
  // ======================================================

  if (loading) {
    return (
      <div
        style={{
          marginLeft: "260px",
          marginTop: "70px",
          minHeight: "100vh",
          background: "#f5f7fb",
          padding: "30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: "30px 40px",
            boxShadow:
              "0 4px 20px rgba(0,0,0,.06)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#14344A",
            fontWeight: 600,
          }}
        >
          <Loader2
            className="animate-spin"
            size={22}
          />

          Loading pricing data...
        </div>
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
        background: "#f5f7fb",
        padding: "30px",
      }}
    >
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              color: "#14344A",
              fontWeight: 700,
              margin: 0,
              textAlign: "center",
              fontSize: 30,
            }}
          >
            Pricing Management
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading || saving}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
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
              cursor:
                loading || saving
                  ? "not-allowed"
                  : "pointer",
              opacity:
                loading || saving ? 0.6 : 1,
            }}
          >
            <RefreshCw
              className="h-4 w-4"
            />

            Refresh
          </button>
        </div>
      </div>

      {/* ================================================== */}
      {/* GLOBAL ERROR */}
      {/* ================================================== */}

      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderRadius: 14,
            border: "1px solid #FECACA",
            background: "#FEF2F2",
            padding: 16,
            color: "#B42318",
            marginBottom: 24,
          }}
        >
          <AlertCircle
            size={20}
            style={{ flexShrink: 0 }}
          />

          <span>{error}</span>
        </div>
      )}

      {/* ================================================== */}
      {/* FORM */}
      {/* ================================================== */}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {/* ================================================== */}
        {/* LOCATION DETAILS */}
        {/* ================================================== */}

        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: 30,
            marginBottom: 30,
            boxShadow:
              "0 4px 20px rgba(0,0,0,.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 25,
            }}
          >
            <MapPin
              size={24}
              color="#14344A"
            />

            <h3
              style={{
                color: "#14344A",
                fontSize: 24,
                fontWeight: 700,
                margin: 0,
              }}
            >
              Location Details
            </h3>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: 25,
            }}
          >
            {/* STATE */}

            <div>
              <label
                style={{
                  fontWeight: 600,
                  color: "#14344A",
                  display: "block",
                  marginBottom: 10,
                }}
              >
                State
              </label>

              <select
                value={selectedStateId}
                onChange={handleStateChange}
                style={{
                  width: "100%",
                  padding: 16,
                  borderRadius: 14,
                  border: "1px solid #ddd",
                  fontSize: 15,
                  boxSizing: "border-box",
                  background: "#fff",
                }}
              >
                <option value="">
                  Select State
                </option>

                {states.map((state) => (
                  <option
                    key={state._id}
                    value={state._id}
                  >
                    {state.name}
                  </option>
                ))}
              </select>

              {errors.state && (
                <span
                  style={{
                    color: "red",
                    fontSize: 13,
                    display: "block",
                    marginTop: 6,
                  }}
                >
                  {errors.state}
                </span>
              )}
            </div>

            {/* CITY */}

            <div>
              <label
                style={{
                  fontWeight: 600,
                  color: "#14344A",
                  display: "block",
                  marginBottom: 10,
                }}
              >
                City
              </label>

              <select
                value={selectedCityId}
                onChange={handleCityChange}
                disabled={!selectedStateId}
                style={{
                  width: "100%",
                  padding: 16,
                  borderRadius: 14,
                  border: "1px solid #ddd",
                  fontSize: 15,
                  boxSizing: "border-box",
                  background:
                    !selectedStateId
                      ? "#f5f5f5"
                      : "#fff",
                  cursor:
                    !selectedStateId
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                <option value="">
                  Select City
                </option>

                {filteredCities.map(
                  (city) => (
                    <option
                      key={city._id}
                      value={city._id}
                    >
                      {city.name}
                    </option>
                  )
                )}
              </select>

              {selectedStateId &&
                filteredCities.length === 0 && (
                  <span
                    style={{
                      color: "#667085",
                      fontSize: 13,
                      display: "block",
                      marginTop: 6,
                    }}
                  >
                    No cities found for this
                    state.
                  </span>
                )}
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* SERVICE DETAILS */}
        {/* ================================================== */}

        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: 30,
            marginBottom: 30,
            boxShadow:
              "0 4px 20px rgba(0,0,0,.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 25,
            }}
          >
            <Wrench
              size={24}
              color="#14344A"
            />

            <h3
              style={{
                color: "#14344A",
                fontSize: 24,
                fontWeight: 700,
                margin: 0,
              }}
            >
              Service Details
            </h3>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: 25,
            }}
          >
            {/* CATEGORY */}

            <div>
              <label
                style={{
                  fontWeight: 600,
                  color: "#14344A",
                  display: "block",
                  marginBottom: 10,
                }}
              >
                Service Category
              </label>

              <select
                value={selectedCategoryId}
                onChange={handleCategoryChange}
                disabled={!selectedCityId}
                style={{
                  width: "100%",
                  padding: 16,
                  borderRadius: 14,
                  border: "1px solid #ddd",
                  fontSize: 15,
                  boxSizing: "border-box",
                  background:
                    !selectedCityId
                      ? "#f5f5f5"
                      : "#fff",
                  cursor:
                    !selectedCityId
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                <option value="">
                  Select Category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category._id}
                      value={category._id}
                    >
                      {category.categoryName}
                    </option>
                  )
                )}
              </select>

              {selectedCityId &&
                categories.length === 0 && (
                  <span
                    style={{
                      color: "#667085",
                      fontSize: 13,
                      display: "block",
                      marginTop: 6,
                    }}
                  >
                    No service categories
                    available.
                  </span>
                )}
            </div>

            {/* SERVICE */}

            <div>
              <label
                style={{
                  fontWeight: 600,
                  color: "#14344A",
                  display: "block",
                  marginBottom: 10,
                }}
              >
                Service
              </label>

              <select
                value={selectedServiceId}
                onChange={handleServiceChange}
                disabled={
                  !selectedCategoryId
                }
                style={{
                  width: "100%",
                  padding: 16,
                  borderRadius: 14,
                  border: "1px solid #ddd",
                  fontSize: 15,
                  boxSizing: "border-box",
                  background:
                    !selectedCategoryId
                      ? "#f5f5f5"
                      : "#fff",
                  cursor:
                    !selectedCategoryId
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                <option value="">
                  Select Service
                </option>

                {filteredServices.map(
                  (service) => (
                    <option
                      key={service._id}
                      value={service._id}
                    >
                      {service.name}
                    </option>
                  )
                )}
              </select>

              {selectedCategoryId &&
                filteredServices.length === 0 && (
                  <span
                    style={{
                      color: "#667085",
                      fontSize: 13,
                      display: "block",
                      marginTop: 6,
                    }}
                  >
                    No active services
                    available in this
                    category.
                  </span>
                )}
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* PRICING DETAILS */}
        {/* ================================================== */}

        <section>
          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              padding: 30,
              marginBottom: 30,
              boxShadow:
                "0 4px 20px rgba(0,0,0,.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 25,
              }}
            >
              <DollarSign
                size={24}
                color="#14344A"
              />

              <h3
                style={{
                  color: "#14344A",
                  fontSize: 24,
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                Pricing Details
              </h3>
            </div>

            {/* CURRENT LEVEL */}

            <div
              style={{
                marginBottom: 25,
                padding: 15,
                borderRadius: 12,
                background: "#F5F8FC",
                color: "#14344A",
                fontWeight: 600,
              }}
            >
              Current Pricing Level :{" "}
              <strong>
                {pricingLevel}
              </strong>
            </div>

            {/* RESOLVED IDS - DEBUG/INFO */}

            {(selectedCategoryId ||
              selectedServiceId) && (
              <div
                style={{
                  marginBottom: 25,
                  padding: 14,
                  borderRadius: 12,
                  background: "#FAFAFA",
                  border:
                    "1px solid #EAECF0",
                  fontSize: 13,
                  color: "#667085",
                }}
              >
                {selectedCategoryId && (
                  <div>
                    Category ID:{" "}
                    <strong>
                      {resolvedCategoryId ||
                        "Not resolved"}
                    </strong>
                  </div>
                )}

                {selectedServiceId && (
                  <div
                    style={{
                      marginTop: 4,
                    }}
                  >
                    Service ID:{" "}
                    <strong>
                      {resolvedServiceId ||
                        "Not resolved"}
                    </strong>
                  </div>
                )}
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: 25,
              }}
            >
              {/* REQUESTER PRICE */}

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    color: "#14344A",
                    marginBottom: 10,
                  }}
                >
                  Requester Price
                </label>

                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <DollarSign
                    style={{
                      position: "absolute",
                      left: 16,
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      width: 18,
                      height: 18,
                      color: "#14344A",
                    }}
                  />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={requesterPrice}
                    onChange={(e) =>
                      setRequesterPrice(
                        e.target.value
                      )
                    }
                    placeholder="Requester Price"
                    style={{
                      width: "100%",
                      padding:
                        "16px 16px 16px 48px",
                      borderRadius: 14,
                      border:
                        "1px solid #ddd",
                      fontSize: 15,
                      boxSizing:
                        "border-box",
                    }}
                  />
                </div>

                {errors.requesterPrice && (
                  <span
                    style={{
                      color: "red",
                      fontSize: 13,
                      display: "block",
                      marginTop: 6,
                    }}
                  >
                    {
                      errors.requesterPrice
                    }
                  </span>
                )}
              </div>

              {/* PROVIDER PRICE */}

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    color: "#14344A",
                    marginBottom: 10,
                  }}
                >
                  Provider Price
                </label>

                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <DollarSign
                    style={{
                      position: "absolute",
                      left: 16,
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      width: 18,
                      height: 18,
                      color: "#14344A",
                    }}
                  />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={providerPrice}
                    onChange={(e) =>
                      setProviderPrice(
                        e.target.value
                      )
                    }
                    placeholder="Provider Price"
                    style={{
                      width: "100%",
                      padding:
                        "16px 16px 16px 48px",
                      borderRadius: 14,
                      border:
                        "1px solid #ddd",
                      fontSize: 15,
                      boxSizing:
                        "border-box",
                    }}
                  />
                </div>

                {errors.providerPrice && (
                  <span
                    style={{
                      color: "red",
                      fontSize: 13,
                      display: "block",
                      marginTop: 6,
                    }}
                  >
                    {
                      errors.providerPrice
                    }
                  </span>
                )}
              </div>
            </div>

            {/* STATUS */}

            {status && (
              <div
                style={{
                  marginTop: 25,
                  padding: 16,
                  borderRadius: 12,
                  background:
                    status.type ===
                    "success"
                      ? "#ECFDF3"
                      : "#FEF2F2",
                  color:
                    status.type ===
                    "success"
                      ? "#067647"
                      : "#B42318",
                  fontWeight: 500,
                }}
              >
                {status.text}
              </div>
            )}

            {/* UPDATE BUTTON */}

            <div
              style={{
                marginTop: 35,
                display: "flex",
                justifyContent:
                  "flex-end",
              }}
            >
              <button
                type="submit"
                disabled={saving}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  border: "none",
                  padding: "14px 28px",
                  borderRadius: 14,
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                  background:
                    "linear-gradient(to right,#FFFF6D,#8FDAFA)",
                  color: "#14344A",
                  fontWeight: 700,
                  fontSize: 15,
                  boxShadow:
                    "0 8px 20px rgba(0,0,0,.08)",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? (
                  <>
                    <Loader2
                      className="animate-spin"
                      size={18}
                    />

                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={18} />

                    Update Pricing
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
};

export default Pricing;

