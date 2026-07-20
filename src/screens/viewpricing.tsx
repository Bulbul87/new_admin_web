import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  Loader2,
  
  RefreshCw,
  Search,

  XCircle,
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

  const [selectedStateId, setSelectedStateId] =
    useState("");

  const [selectedCityId, setSelectedCityId] =
    useState("");

  const [selectedParentServiceId,
    setSelectedParentServiceId] =
    useState("");

  const [selectedServiceId,
    setSelectedServiceId] =
    useState("");

  const [search, setSearch] =
    useState("");

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

      setStates(statesData);
      setCities(citiesData);
      setServices(servicesData);
      setPricingRules(pricingData);

    } catch (err) {

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
  // Helpers
  // ============================================



  const getChildService = (
    serviceId: string
  ) => {

    return services.find(
      (service) =>
        service._id === serviceId
    );

  };

  const getParentService = (
    serviceId: string
  ) => {

    const child = getChildService(serviceId);

    if (!child?.parentId) {

      return null;

    }

    return services.find(
      (service) =>
        service._id === child.parentId?._id
    );

  };
    // ============================================
  // Initial Load
  // ============================================

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // ============================================
  // Dropdown Data
  // ============================================

  const filteredCities = useMemo(() => {
    if (!selectedStateId) return [];

    return cities.filter(
      (city) =>
        getStateIdFromCity(city) === selectedStateId
    );
  }, [cities, selectedStateId]);

  const parentServices = useMemo(() => {
    return getParentServices(services);
  }, [services]);

  const childServices = useMemo(() => {
    if (!selectedParentServiceId) return [];

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
      // ------------------------
      // State
      // ------------------------

      if (
        selectedStateId &&
        rule.stateId?._id !== selectedStateId
      ) {
        return false;
      }

      // ------------------------
      // City
      // ------------------------

      if (
        selectedCityId &&
        rule.cityId?._id !== selectedCityId
      ) {
        return false;
      }

      // ------------------------
      // Parent Service
      // ------------------------

      if (selectedParentServiceId) {
        const parent = getParentService(
          rule.serviceId._id
        );

        if (
          parent?._id !==
          selectedParentServiceId
        ) {
          return false;
        }
      }

      // ------------------------
      // Child Service
      // ------------------------

      if (
        selectedServiceId &&
        rule.serviceId._id !==
          selectedServiceId
      ) {
        return false;
      }

      // ------------------------
      // Search
      // ------------------------

      if (search.trim()) {
        const keyword = search.toLowerCase();

        const parentName =
          getParentService(rule.serviceId._id)
            ?.name ?? "";

        const childName =
          getChildService(rule.serviceId._id)
            ?.name ?? "";

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
      {/* ========================= Header ========================= */}

      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2 text-indigo-600">
            <Building2 className="h-5 w-5" />
            <span className="text-sm font-semibold tracking-wide uppercase">
              Pricing Management
            </span>
          </div>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Pricing Rules
          </h1>

          <p className="mt-2 text-slate-500">
            View, search and filter pricing rules.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105"
        >
          <RefreshCw className="h-5 w-5" />
          Refresh
        </button>
      </div>

      {/* ========================= Error ========================= */}

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* ========================= Summary ========================= */}

      <div className="mb-8 grid gap-6 md:grid-cols-2">

        <div className="rounded-3xl bg-white p-6 shadow-xl">

          <p className="text-sm font-medium text-slate-500">
            Total Pricing Rules
          </p>

          <h2 className="mt-2 text-4xl font-bold text-indigo-600">
            {pricingRules.length}
          </h2>

        </div>

        <div className="rounded-3xl bg-white p-6 shadow-xl">

          <p className="text-sm font-medium text-slate-500">
            Showing Results
          </p>

          <h2 className="mt-2 text-4xl font-bold text-emerald-600">
            {filteredPricingRules.length}
          </h2>

        </div>

      </div>

      {/* ========================= Filter Card ========================= */}

      <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">

        <div className="mb-6 flex items-center gap-3">

          <Search className="h-6 w-6 text-indigo-600" />

          <h2 className="text-2xl font-bold text-slate-800">
            Search & Filters
          </h2>

        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">

          {/* State */}

          <select
            value={selectedStateId}
            onChange={(e) => {
              setSelectedStateId(e.target.value);
              setSelectedCityId("");
            }}
            className="rounded-2xl border border-slate-300 p-3"
          >
            <option value="">
              All States
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

          {/* City */}

          <select
            value={selectedCityId}
            disabled={!selectedStateId}
            onChange={(e) =>
              setSelectedCityId(e.target.value)
            }
            className="rounded-2xl border border-slate-300 p-3 disabled:bg-slate-100"
          >
            <option value="">
              All Cities
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

          {/* Parent Service */}

          <select
            value={selectedParentServiceId}
            onChange={(e) => {
              setSelectedParentServiceId(
                e.target.value
              );

              setSelectedServiceId("");
            }}
            className="rounded-2xl border border-slate-300 p-3"
          >
            <option value="">
              All Parent Services
            </option>

            {parentServices.map((service) => (
              <option
                key={service._id}
                value={service._id}
              >
                {service.name}
              </option>
            ))}
          </select>
                    {/* Sub Service */}

          <select
            value={selectedServiceId}
            disabled={!selectedParentServiceId}
            onChange={(e) =>
              setSelectedServiceId(e.target.value)
            }
            className="rounded-2xl border border-slate-300 p-3 disabled:bg-slate-100"
          >
            <option value="">
              All Sub Services
            </option>

            {childServices.map((service) => (
              <option
                key={service._id}
                value={service._id}
              >
                {service.name}
              </option>
            ))}
          </select>

          {/* Search */}

          <div className="relative">

            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search..."
              className="w-full rounded-2xl border border-slate-300 py-3 pl-12 pr-4"
            />

          </div>

        </div>

        {/* Clear Button */}

        <div className="mt-6 flex justify-end">

          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-100"
          >
            <XCircle className="h-5 w-5" />

            Clear Filters

          </button>

        </div>

      </section>

      {/* ========================= Table ========================= */}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">

        <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 text-white">

          <Building2 className="h-5 w-5" />

          <h2 className="text-xl font-bold">
            Pricing Rules
          </h2>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="sticky top-0 bg-slate-100">

              <tr className="text-left text-sm font-bold text-slate-700">

                <th className="px-6 py-4">
                  State
                </th>

                <th className="px-6 py-4">
                  City
                </th>

                <th className="px-6 py-4">
                  Parent Service
                </th>

                <th className="px-6 py-4">
                  Sub Service
                </th>

                <th className="px-6 py-4 text-right">
                  Requester Price
                </th>

                <th className="px-6 py-4 text-right">
                  Provider Price
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredPricingRules.length === 0 ? (

                <tr>

                  <td
                    colSpan={6}
                    className="py-16 text-center text-slate-500"
                  >

                    <div className="flex flex-col items-center">

                      <Search className="mb-3 h-12 w-12 text-slate-300" />

                      <h3 className="text-lg font-semibold">
                        No Pricing Rules Found
                      </h3>

                      <p className="mt-2">
                        Try changing your filters.
                      </p>

                    </div>

                  </td>

                </tr>

              ) : (

                filteredPricingRules.map((rule) => {

                  const child =
                    getChildService(rule.serviceId._id);

                  const parent =
                    getParentService(rule.serviceId._id);

                  return (

                    <tr
                      key={rule._id}
                      className="border-t border-slate-100 transition hover:bg-indigo-50"
                    >

                      <td className="px-6 py-5 font-medium">
                        {rule.stateId?.name}
                      </td>

                      <td className="px-6 py-5">
                        {rule.cityId?.name}
                      </td>

                      <td className="px-6 py-5">

                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">

                          {parent?.name ?? "-"}

                        </span>

                      </td>

                      <td className="px-6 py-5">

                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">

                          {child?.name ?? "-"}

                        </span>

                      </td>

                      <td className="px-6 py-5 text-right font-bold text-emerald-600">

                        ${rule.requesterPrice}

                      </td>

                      <td className="px-6 py-5 text-right font-bold text-indigo-600">

                        ${rule.providerPrice}

                      </td>

                    </tr>

                  );

                })

              )}

            </tbody>

          </table>

        </div>

      </section>
          </div>
  );
};

export default PricingRules;