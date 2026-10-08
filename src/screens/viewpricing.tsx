import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate =useNavigate();
  // ============================================
  // Master Data
  // ============================================

  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [services, setServices] = useState<ServiceCatalogItem[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);

  // ============================================
  // Pagination
  // ============================================

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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
        pricingResponse,
      ] = await Promise.all([
        getStates(),
        getCities(),
        getServiceCatalog(),
        getPricingRules(currentPage, itemsPerPage),
      ]);

      console.log("VIEW PRICING - STATES:", statesData);
      console.log("VIEW PRICING - CITIES:", citiesData);
      console.log(
        "VIEW PRICING - SERVICE CATALOG:",
        servicesData
      );
      console.log(
        "VIEW PRICING - PRICING RULES:",
        pricingResponse
      );

      setStates(statesData);
      setCities(citiesData);
      setServices(servicesData);

      // Current page pricing records
      setPricingRules(pricingResponse.data);

      // Backend pagination information
      setTotalRecords(
        pricingResponse.pagination?.total ?? 0
      );

      setTotalPages(
        pricingResponse.pagination?.totalPages ?? 0
      );
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
  }, [currentPage, itemsPerPage]);

  // ============================================
  // Initial Load / Page Change
  // ============================================

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
        <div className="relative z-10 d-flex flex-col lg:flex-row lg:items-center" style={{justifyContent:"space-between"}}>
          <div className="flex">
            <h1
              style={{
                color: "#14344A",
                fontWeight: 700,
                fontSize:"27px",
                margin: 0,
                alignItems: "center",
              }}
            >
            Pricing Records
            </h1>
          </div>

          <div className="d-flex gap-4 justify-end lg:ml-auto">
            <button
              onClick={handleRefresh}
              style={{
                border: "none",
                 padding: "11px 20px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(20, 52, 74, 0.2)",
                background:
                  "linear-gradient(to right, #FFFF6D, #8FDAFA)",
                color: "#14344A",
               
                transition: "0.3s",
              }}
            >
              <RefreshCw className="h-6 w-6 transition-transform duration-300 group-hover:rotate-180" />

              Refresh Data
            </button>
             <button
          onClick={() => navigate("/pricing")}
          style={{
            background: "linear-gradient(135deg, #14344A, #163A5F)",
            color: "#fff",
            border: "none",
            padding: "11px 20px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(20, 52, 74, 0.2)",
          }}
        >
         pricing management
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
            {totalRecords}
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
                          {(currentPage - 1) *
                            itemsPerPage +
                            index +
                            1}
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
          {/* ===================================================== */}
{/* PAGINATION */}
{/* ===================================================== */}

<div
  className=" w-full items-center "
  style={{
   display:"flex",
   justifyContent:"space-between",
    minHeight: "64px",
    padding: "12px 18px",
    marginTop: "12px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
  }}
>
  {/* ================= LEFT ================= */}
  <div
   
    style={{
display:"flex",
alignItems:"center",
      gap: "18px",
    }}
  >
    {/* Total */}
    <div
      className="flex items-center"
      style={{
        gap: "8px",
        whiteSpace: "nowrap",
        display:"flex",
       
      }}
    >
      <span
        style={{
          fontSize: "13px",
          fontWeight: 500,
          color: "#64748b",
        }}
      >
        Total :
      </span>

      <span
        style={{
          fontSize: "13px",
          fontWeight: 700,
          color: "#14344A",
        }}
      >
        {totalRecords}
      </span>
    </div>

    {/* Divider */}
    <div
      style={{
        width: "1px",
        height: "24px",
        background: "#e2e8f0",
      }}
    />

    {/* Rows Per Page */}
    <div
      className="d-flex items-center"
      style={{
        gap: "9px",
        whiteSpace: "nowrap",
         alignItems:"center"
        
      }}
    >
      <span
        style={{
          fontSize: "13px",
          fontWeight: 500,
          color: "#64748b",
        }}
      >
        Rows per page
      </span>

      <select
        value={itemsPerPage}
        onChange={(e) => {
          setItemsPerPage(Number(e.target.value));
          setCurrentPage(1);
        }}
        style={{
          height: "31px",
          minWidth: "61px",
          padding: "2px 10px",
          border: "1px solid #dbe3ec",
          borderRadius: "9px",
          background: "#ffffff",
          color: "#14344A",
          fontSize: "13px",
          fontWeight: 600,
          outline: "none",
          cursor: "pointer",
          boxShadow:
            "0 1px 3px rgba(15, 23, 42, 0.04)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor =
            "#14344A";
          e.currentTarget.style.boxShadow =
            "0 0 0 3px rgba(20, 52, 74, 0.08)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor =
            "#dbe3ec";
          e.currentTarget.style.boxShadow =
            "0 1px 3px rgba(15, 23, 42, 0.04)";
        }}
      >
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select>
    </div>
  </div>

  {/* ================= RIGHT ================= */}
  <div
    className="d-flex items-center"
    style={{
      gap: "10px",
    }}
  >
    {/* Previous */}
    <button
      type="button"
      onClick={() =>
        setCurrentPage((prev) =>
          Math.max(prev - 1, 1)
        )
      }
      disabled={currentPage === 1}
      style={{
        height: "38px",
        minWidth: "100px",
        padding: "0 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        borderRadius: "9px",
        border: "1px solid #e2e8f0",
        background:
          currentPage === 1
            ? "#f8fafc"
            : "#ffffff",
        color:
          currentPage === 1
            ? "#b5c0cc"
            : "#64748b",
        fontSize: "13px",
        fontWeight: 600,
        cursor:
          currentPage === 1
            ? "not-allowed"
            : "pointer",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (currentPage !== 1) {
          e.currentTarget.style.background =
            "#f8fafc";
          e.currentTarget.style.borderColor =
            "#cbd5e1";
          e.currentTarget.style.color =
            "#14344A";
        }
      }}
      onMouseLeave={(e) => {
        if (currentPage !== 1) {
          e.currentTarget.style.background =
            "#ffffff";
          e.currentTarget.style.borderColor =
            "#e2e8f0";
          e.currentTarget.style.color =
            "#64748b";
        }
      }}
    >
      <span style={{ fontSize: "17px" }}>‹</span>
      Previous
    </button>

    {/* Page */}
    <div
      style={{
        minWidth: "55px",
        height: "38px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "13px",
        fontWeight: 700,
        color: "#14344A",
        whiteSpace: "nowrap",
      }}
    >
      {currentPage} / {totalPages || 1}
    </div>

    {/* Next */}
    <button
      type="button"
      onClick={() =>
        setCurrentPage((prev) =>
          Math.min(
            prev + 1,
            totalPages
          )
        )
      }
      disabled={
        totalPages === 0 ||
        currentPage >= totalPages
      }
      style={{
        height: "38px",
        minWidth: "78px",
        padding: "0 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        borderRadius: "9px",
        border: "1px solid #e2e8f0",
        background:
          totalPages === 0 ||
          currentPage >= totalPages
            ? "#f8fafc"
            : "#ffffff",
        color:
          totalPages === 0 ||
          currentPage >= totalPages
            ? "#b5c0cc"
            : "#64748b",
        fontSize: "13px",
        fontWeight: 600,
        cursor:
          totalPages === 0 ||
          currentPage >= totalPages
            ? "not-allowed"
            : "pointer",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (
          totalPages > 0 &&
          currentPage < totalPages
        ) {
          e.currentTarget.style.background =
            "#f8fafc";
          e.currentTarget.style.borderColor =
            "#cbd5e1";
          e.currentTarget.style.color =
            "#14344A";
        }
      }}
      onMouseLeave={(e) => {
        if (
          totalPages > 0 &&
          currentPage < totalPages
        ) {
          e.currentTarget.style.background =
            "#ffffff";
          e.currentTarget.style.borderColor =
            "#e2e8f0";
          e.currentTarget.style.color =
            "#64748b";
        }
      }}
    >
      Next
      <span style={{ fontSize: "17px" }}>›</span>
    </button>
  </div>
</div>
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