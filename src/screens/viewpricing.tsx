
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BriefcaseBusiness,
  Database,
  Filter,
  Loader2,
  MapPin,
  MapPinned,
  RefreshCw,
  Search,
} from "lucide-react";

import {
  getCities,
  getPricingRules,
  getServiceCatalog,
  getStates,
  getParentServices,
  getChildServices,
  getStateIdFromCity,
} from "../service/pricingService";

import type {
  CityOption,
  PricingRule,
  ServiceCatalogItem,
  StateOption,
} from "../service/pricingService";

const PricingRules: React.FC = () => {
  // ============================================
  // Master Data
  // ============================================

  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [services, setServices] = useState<ServiceCatalogItem[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);

  // ============================================
  // Loading
  // ============================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // Filters
  // ============================================

  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");

  // IMPORTANT:
  // This stores ServiceCatalog.categoryId
  const [selectedParentServiceId, setSelectedParentServiceId] =
    useState("");

  // IMPORTANT:
  // This stores ServiceCatalog.services[].servId
  const [selectedServiceId, setSelectedServiceId] = useState("");

  const [search, setSearch] = useState("");

  // ============================================
  // Load Data
  // ============================================

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        statesData,
        citiesData,
        servicesData,
        pricingData,
      ] = await Promise.all([
        getStates(),
        getCities(),
        getServiceCatalog(),
        getPricingRules(),
      ]);

      console.log("VIEW PRICING - STATES:", statesData);
      console.log("VIEW PRICING - CITIES:", citiesData);
      console.log("VIEW PRICING - SERVICE CATALOG:", servicesData);
      console.log("VIEW PRICING - PRICING RULES:", pricingData);

      setStates(statesData);
      setCities(citiesData);
      setServices(servicesData);
      setPricingRules(pricingData);
    } catch (err) {
      console.error("Pricing Rules Load Error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load pricing rules."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // Refresh
  // ============================================

  const handleRefresh = async () => {
    await loadData();
  };

  // ============================================
  // Category lookup
  // ============================================

  const getCategoryForRule = (
    rule: PricingRule
  ): ServiceCatalogItem | null => {
    const categoryId = String(rule.categoryId || "").trim();

    if (!categoryId) {
      // If backend already provided categoryName,
      // try resolving by name.
      if (rule.categoryName) {
        const categoryByName = services.find(
          (item) =>
            String(item.categoryName || "")
              .trim()
              .toLowerCase() ===
            String(rule.categoryName || "")
              .trim()
              .toLowerCase()
        );

        if (categoryByName) {
          return categoryByName;
        }
      }

      return null;
    }

    // ============================================
    // 1. Business categoryId
    // ============================================

    const category = services.find(
      (item) =>
        String(item.categoryId || "").trim() === categoryId
    );

    if (category) {
      return category;
    }

    // ============================================
    // 2. Legacy Mongo _id fallback
    // ============================================

    const legacyCategory = services.find(
      (item) =>
        String(item._id || "").trim() === categoryId
    );

    if (legacyCategory) {
      return legacyCategory;
    }

    // ============================================
    // 3. categoryName fallback
    // ============================================

    if (rule.categoryName) {
      const categoryByName = services.find(
        (item) =>
          String(item.categoryName || "")
            .trim()
            .toLowerCase() ===
          String(rule.categoryName || "")
            .trim()
            .toLowerCase()
      );

      if (categoryByName) {
        return categoryByName;
      }
    }

    return null;
  };

  // ============================================
  // Service lookup
  // ============================================

  const getServiceForRule = (rule: PricingRule) => {
    const serviceId = String(rule.serviceId || "").trim();

    if (!serviceId) {
      return null;
    }

    // ============================================
    // 1. Find category first
    // ============================================

    const category = getCategoryForRule(rule);

    if (category) {
      // Business ID
      const service = category.services?.find(
        (item) =>
          String(item.servId || "").trim() === serviceId
      );

      if (service) {
        return service;
      }

      // Legacy Mongo _id
      const legacyService = category.services?.find(
        (item) =>
          String(item._id || "").trim() === serviceId
      );

      if (legacyService) {
        return legacyService;
      }
    }

    // ============================================
    // 2. Search entire catalog by servId
    // ============================================

    for (const categoryItem of services) {
      const service = categoryItem.services?.find(
        (item) =>
          String(item.servId || "").trim() === serviceId
      );

      if (service) {
        return service;
      }
    }

    // ============================================
    // 3. Search entire catalog by Mongo _id
    // ============================================

    for (const categoryItem of services) {
      const service = categoryItem.services?.find(
        (item) =>
          String(item._id || "").trim() === serviceId
      );

      if (service) {
        return service;
      }
    }

    return null;
  };

  // ============================================
  // Category Name
  // ============================================

  const getCategoryName = (
    rule: PricingRule
  ): string => {
    if (rule.categoryName?.trim()) {
      return rule.categoryName;
    }

    return (
      getCategoryForRule(rule)?.categoryName ??
      "-"
    );
  };

  // ============================================
  // Service Name
  // ============================================

  const getServiceName = (
    rule: PricingRule
  ): string => {
    if (rule.serviceName?.trim()) {
      return rule.serviceName;
    }

    return getServiceForRule(rule)?.name ?? "-";
  };

  // ============================================
  // Initial Load
  // ============================================

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // ============================================
  // Filtered Cities
  // ============================================

  const filteredCities = useMemo(() => {
    if (!selectedStateId) {
      return [];
    }

    return cities.filter(
      (city) =>
        String(getStateIdFromCity(city)) ===
        String(selectedStateId)
    );
  }, [cities, selectedStateId]);

  // ============================================
  // Parent Categories
  // ============================================

  const parentServices = useMemo(() => {
    return getParentServices(services);
  }, [services]);

  // ============================================
  // Child Services
  // ============================================

  const childServices = useMemo(() => {
    if (!selectedParentServiceId) {
      return [];
    }

    console.log(
      "Selected Category ID:",
      selectedParentServiceId
    );

    console.log(
      "All Categories:",
      services
    );

    const selectedCategory = services.find(
      (category) =>
        String(category.categoryId || "").trim() ===
        String(selectedParentServiceId).trim()
    );

    console.log(
      "Selected Category:",
      selectedCategory
    );

    console.log(
      "Selected Category Services:",
      selectedCategory?.services
    );

    // Direct catalog lookup
    if (selectedCategory) {
      return (
        selectedCategory.services?.filter(
          (service) => service.isActive !== false
        ) || []
      );
    }

    // Existing helper fallback
    return getChildServices(
      services,
      selectedParentServiceId
    );
  }, [services, selectedParentServiceId]);

  // ============================================
  // Filtered Pricing Rules
  // ============================================

  const filteredPricingRules = useMemo(() => {
    return pricingRules.filter((rule) => {
      // ==========================================
      // State
      // ==========================================

      if (selectedStateId) {
        const ruleStateId = String(
          rule.stateId?._id || ""
        );

        if (ruleStateId !== String(selectedStateId)) {
          return false;
        }
      }

      // ==========================================
      // City
      // ==========================================

      if (selectedCityId) {
        const ruleCityId = String(
          rule.cityId?._id || ""
        );

        if (ruleCityId !== String(selectedCityId)) {
          return false;
        }
      }

      // ==========================================
      // Service Category
      // ==========================================

      if (selectedParentServiceId) {
        const parent = getCategoryForRule(rule);

        if (!parent) {
          return false;
        }

        const parentCategoryId = String(
          parent.categoryId || ""
        ).trim();

        const selectedCategoryId = String(
          selectedParentServiceId
        ).trim();

        // IMPORTANT:
        // Compare business categoryId
        if (
          parentCategoryId !==
          selectedCategoryId
        ) {
          return false;
        }
      }

      // ==========================================
      // Child Service
      // ==========================================

      if (selectedServiceId) {
        const service = getServiceForRule(rule);

        if (!service) {
          return false;
        }

        const serviceBusinessId = String(
          service.servId || ""
        ).trim();

        const selectedBusinessServiceId =
          String(selectedServiceId).trim();

        // IMPORTANT:
        // Compare business servId
        if (
          serviceBusinessId !==
          selectedBusinessServiceId
        ) {
          return false;
        }
      }

      // ==========================================
      // Search
      // ==========================================

      if (search.trim()) {
        const keyword = search
          .trim()
          .toLowerCase();

        const parentName =
          getCategoryName(rule);

        const childName =
          getServiceName(rule);

        const stateName =
          rule.stateId?.name ?? "";

        const cityName =
          rule.cityId?.name ?? "";

        const found =
          stateName
            .toLowerCase()
            .includes(keyword) ||
          cityName
            .toLowerCase()
            .includes(keyword) ||
          parentName
            .toLowerCase()
            .includes(keyword) ||
          childName
            .toLowerCase()
            .includes(keyword);

        if (!found) {
          return false;
        }
      }

      return true;
    });
  }, [
    pricingRules,
    selectedStateId,
    selectedCityId,
    selectedParentServiceId,
    selectedServiceId,
    search,
    services,
  ]);

  // ============================================
  // Clear Filters
  // ============================================

  const clearFilters = () => {
    setSelectedStateId("");
    setSelectedCityId("");
    setSelectedParentServiceId("");
    setSelectedServiceId("");
    setSearch("");
  };

  // ============================================
  // Loading UI
  // ============================================

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="mr-3 h-6 w-6 animate-spin text-indigo-600" />

        <span className="text-lg font-medium text-slate-600">
          Loading pricing rules...
        </span>
      </div>
    );
  }

  // ============================================
  // UI
  // ============================================

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
      style={{
        marginLeft: "260px",
        marginTop: "70px",
        padding: "32px",
      }}
    >
      {/* ========================================================= */}
      {/* HERO HEADER */}
      {/* ========================================================= */}

      <div className="relative overflow-hidden rounded-[32px]">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center">
          <div className="flex">
            <h1
              style={{
                color: "#14344A",
                fontWeight: 700,
                marginBottom: 10,
                alignItems: "center",
              }}
            >
              Pricing Dashboard
            </h1>
          </div>

          <div className="flex gap-4 justify-end lg:ml-auto">
            <button
              onClick={handleRefresh}
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
              <RefreshCw className="h-6 w-6 transition-transform duration-300 group-hover:rotate-180" />

              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ERROR */}
      {/* ========================================================= */}

      {error && (
        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 shadow">
          <AlertCircle className="h-6 w-6" />
          <span>{error}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* DASHBOARD STATS */}
      {/* ========================================================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
          marginBottom: 35,
          paddingTop: 20,
        }}
      >
        {/* Total Rules */}
        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: 25,
            boxShadow:
              "0 8px 30px rgba(0,0,0,0.06)",
            position: "relative" as const,
            overflow: "hidden" as const,
            cursor: "pointer",
            transition: "0.3s",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 18,
              background:
                "linear-gradient(to right, #FFFF6D, #8FDAFA)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 18,
            }}
          >
            <Database className="h-8 w-8 text-slate-900" />
          </div>

          <h4
            style={{
              color: "#6b7280",
              fontSize: 20,
            }}
          >
            Total Pricing Records
          </h4>

          <h1
            style={{
              margin: "8px 0",
              color: "#14344A",
              fontWeight: 800,
              fontSize: 20,
            }}
          >
            {pricingRules.length}
          </h1>
        </div>

        {/* Showing */}
        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: 25,
            boxShadow:
              "0 8px 30px rgba(0,0,0,0.06)",
            position: "relative" as const,
            overflow: "hidden" as const,
            cursor: "pointer",
            transition: "0.3s",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 18,
              background:
                "linear-gradient(to right, #FFFF6D, #8FDAFA)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 18,
            }}
          >
            <Filter className="h-8 w-8 text-slate-900" />
          </div>

          <h4
            style={{
              color: "#6b7280",
              fontSize: 20,
            }}
          >
            Filtered Records
          </h4>

          <h1
            style={{
              margin: "8px 0",
              color: "#14344A",
              fontWeight: 800,
              fontSize: 20,
            }}
          >
            {filteredPricingRules.length}
          </h1>
        </div>

        {/* States */}
        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: 25,
            boxShadow:
              "0 8px 30px rgba(0,0,0,0.06)",
            position: "relative" as const,
            overflow: "hidden" as const,
            cursor: "pointer",
            transition: "0.3s",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 18,
              background:
                "linear-gradient(to right, #FFFF6D, #8FDAFA)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 18,
            }}
          >
            <MapPinned className="h-8 w-8 text-slate-900" />
          </div>

          <h4
            style={{
              color: "#6b7280",
              fontSize: 20,
            }}
          >
            Available States
          </h4>

          <h1
            style={{
              margin: "8px 0",
              color: "#14344A",
              fontWeight: 800,
              fontSize: 20,
            }}
          >
            {states.length}
          </h1>
        </div>

        {/* Services */}
        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: 25,
            boxShadow:
              "0 8px 30px rgba(0,0,0,0.06)",
            position: "relative" as const,
            overflow: "hidden" as const,
            cursor: "pointer",
            transition: "0.3s",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 18,
              background:
                "linear-gradient(to right, #FFFF6D, #8FDAFA)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 18,
            }}
          >
            <BriefcaseBusiness className="h-8 w-8 text-slate-900" />
          </div>

          <h4
            style={{
              color: "#6b7280",
              fontSize: 20,
            }}
          >
            All categories
          </h4>

          <h1
            style={{
              margin: "8px 0",
              color: "#14344A",
              fontWeight: 800,
              fontSize: 20,
            }}
          >
            {services.length}
          </h1>
        </div>
      </div>

      {/* ========================================================= */}
      {/* FILTER TOOLBAR */}
      {/* ========================================================= */}

      <section className="mt-8 overflow-hidden">
        {/* LOCATION */}
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
            <MapPin size={24} color="#14344A" />

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
              gridTemplateColumns: "1fr 1fr",
              gap: 25,
            }}
          >
            {/* STATE */}
            <div>
              <label
                style={{
                  fontWeight: 600,
                  color: "#14344A",
                  marginBottom: 10,
                  display: "block",
                }}
              >
                State
              </label>

              <select
                value={selectedStateId}
                onChange={(e) => {
                  setSelectedStateId(e.target.value);
                  setSelectedCityId("");
                }}
                style={{
                  width: "100%",
                  padding: 16,
                  borderRadius: 14,
                  border: "1px solid #ddd",
                  outline: "none",
                  fontSize: 15,
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
            </div>

            {/* CITY */}
            <div>
              <label
                style={{
                  fontWeight: 600,
                  color: "#14344A",
                  marginBottom: 10,
                  display: "block",
                }}
              >
                City
              </label>

              <select
                value={selectedCityId}
                disabled={!selectedStateId}
                onChange={(e) =>
                  setSelectedCityId(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: 16,
                  borderRadius: 14,
                  border: "1px solid #ddd",
                  outline: "none",
                  fontSize: 15,
                }}
              >
                <option value="">
                  Select City
                </option>

                {filteredCities.map((city) => (
                  <option
                    key={city._id}
                    value={city._id}
                  >
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SERVICE */}
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
            <MapPin size={24} color="#14344A" />

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
              gridTemplateColumns: "1fr 1fr",
              gap: 25,
            }}
          >
            {/* SERVICE CATEGORY */}
            <div>
              <label
                style={{
                  fontWeight: 600,
                  color: "#14344A",
                  marginBottom: 10,
                  display: "block",
                }}
              >
                Service Category
              </label>

              <select
                value={selectedParentServiceId}
                onChange={(e) => {
                  const categoryId =
                    e.target.value;

                  console.log(
                    "CATEGORY SELECTED:",
                    categoryId
                  );

                  setSelectedParentServiceId(
                    categoryId
                  );

                  setSelectedServiceId("");
                }}
                style={{
                  width: "100%",
                  padding: 16,
                  borderRadius: 14,
                  border: "1px solid #ddd",
                  outline: "none",
                  fontSize: 15,
                }}
              >
                <option value="">
                  Select Service Category
                </option>

                {parentServices.map((category) => (
                  <option
                    key={category.categoryId}
                    value={category.categoryId}
                  >
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>

            {/* SERVICES */}
            <div>
              <label
                style={{
                  fontWeight: 600,
                  color: "#14344A",
                  marginBottom: 10,
                  display: "block",
                }}
              >
                Services
              </label>

              <select
                value={selectedServiceId}
                disabled={!selectedParentServiceId}
                onChange={(e) => {
                  setSelectedServiceId(
                    e.target.value
                  );
                }}
                style={{
                  width: "100%",
                  padding: 16,
                  borderRadius: 14,
                  border: "1px solid #ddd",
                  outline: "none",
                  fontSize: 15,
                }}
              >
                <option value="">
                  Select Service
                </option>

                {childServices.map((service) => (
                  <option
                    key={service.servId}
                    value={service.servId}
                  >
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mt-8 flex items-center">
          <div
            style={{
              width: 450,
              height: 52,
              margin: "0 auto",
              background: "#fff",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              paddingTop: "18px",
              paddingBottom: "18px",
              paddingLeft: "18px",
              paddingRight: "0px",
              boxShadow:
                "0 4px 20px rgba(0,0,0,0.06)",
              flexShrink: 0,
            }}
          >
            <Search
              className="h-4 w-4"
              color="#999"
              size={16}
              strokeWidth={2}
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search data by state, city, services"
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                marginLeft: 12,
                background: "transparent",
                fontSize: 14,
              }}
            />

            <button
              onClick={clearFilters}
              style={{
                border: "none",
                background:
                  "linear-gradient(to right, #FFFF6D, #8FDAFA)",
                color: "#14344A",
                fontWeight: 700,
                padding: "14px 24px",
                borderTopRightRadius: 14,
                borderBottomRightRadius: 14,
                boxShadow:
                  "0 6px 20px rgba(0,0,0,0.08)",
                transition: "0.3s",
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* PRICING TABLE */}
      {/* ========================================================= */}

      <section className="mt-10 overflow-hidden">
        <div
          style={{
            padding: "3px",
            borderRadius: "20px",
            marginTop: 20,
            background:
              "linear-gradient(to right, #FFFF6D, #8FDAFA)",
            maxHeight: "600px",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <table
            className="min-w-full border-collapse"
            style={{
              width: "100%",
            }}
          >
            <thead>
              <tr
                style={{
                  background:
                    "linear-gradient(to right,#FFFF6D,#8FDAFA)",
                  height: 70,
                  position: "sticky",
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  top: -3,
                  zIndex: 100,
                }}
              >
                <th style={headerStyle}>#</th>
                <th style={headerStyle}>State</th>
                <th style={headerStyle}>City</th>
                <th style={headerStyle}>
                  Service Category
                </th>
                <th style={headerStyle}>
                  Services
                </th>
                <th style={headerStyle}>
                  Requester Price
                </th>
                <th style={headerStyle}>
                  Provider Price
                </th>
              </tr>
            </thead>

            <tbody style={{ background: "#fff" }}>
              {filteredPricingRules.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      color: "#14344A",
                      border: "1px solid #cde3f8",
                      padding: "18px 20px",
                      fontWeight: 600,
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 shadow-lg">
                        <Search className="h-10 w-10 text-indigo-500" />
                      </div>

                      <h3 className="text-2xl font-extrabold text-indigo-900">
                        No Pricing Rules Found
                      </h3>

                      <p className="mt-3 text-base text-slate-500">
                        Try changing filters or search keywords.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPricingRules.map(
                  (rule, index) => {
                    const categoryDisplayName =
                      getCategoryName(rule);

                    const serviceDisplayName =
                      getServiceName(rule);

                    return (
                      <tr
                        key={rule._id}
                        style={{
                          borderBottom:
                            "2px solid #78bcf3",
                        }}
                      >
                        {/* SR NO */}
                        <td style={cellStyle}>
                          {index + 1}
                        </td>

                        {/* STATE */}
                        <td style={cellStyle}>
                          <p className="font-bold text-indigo-900">
                            {rule.stateId?.name || "-"}
                          </p>
                        </td>

                        {/* CITY */}
                        <td style={cellStyle}>
                          <p className="font-bold text-indigo-900">
                            {rule.cityId?.name || "-"}
                          </p>
                        </td>

                        {/* CATEGORY */}
                        <td style={cellStyle}>
                          <span>
                            {categoryDisplayName}
                          </span>
                        </td>

                        {/* SERVICE */}
                        <td style={cellStyle}>
                          <span>
                            {serviceDisplayName}
                          </span>
                        </td>

                        {/* REQUESTER PRICE */}
                        <td style={cellStyle}>
                          <span>
                            ${rule.requesterPrice}
                          </span>
                        </td>

                        {/* PROVIDER PRICE */}
                        <td
                          style={{
                            ...cellStyle,
                            borderRight: "none",
                          }}
                        >
                          <span>
                            ${rule.providerPrice}
                          </span>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

// ============================================================
// TABLE STYLES
// ============================================================

const headerStyle: React.CSSProperties = {
  color: "#14344A",
  fontWeight: 700,
  fontSize: 13,
  letterSpacing: "1px",
  textTransform: "uppercase",
  padding: "18px 24px",
  borderRight:
    "1px solid rgba(255,255,255,0.18)",
  borderBottom:
    "1px solid rgba(255,255,255,0.15)",
  textShadow:
    "0 1px 2px rgba(0,0,0,0.2)",
  textAlign: "center",
};

const cellStyle: React.CSSProperties = {
  color: "#14344A",
  borderRight: "1px solid #bbd5ea",
  padding: "14px",
  fontWeight: 600,
  fontSize: 14,
};

export default PricingRules;

