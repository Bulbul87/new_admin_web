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
   CheckCircle2,
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

    <div className="relative overflow-hidden rounded-[32px] ">


     

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center">

        <div className="flex text-align: center; ">

        

          <h1  style={{
              color: "#14344A",
              fontWeight: 700,
              marginBottom: 10,
              alignItems: "center",
            }}>

            Pricing Rules

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

<div style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 25,
          marginBottom: 35,
          paddingTop: 20,
        }}>

  {/* Total Rules */}    

        <div style={{background: "#fff",
    borderRadius: 24,
    padding: 25,
    boxShadow:
      "0 8px 30px rgba(0,0,0,0.06)",
    position: "relative" as const,
    overflow: "hidden" as const,
    cursor: "pointer",
    transition: "0.3s",}}>
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
              fontSize: 24,
            }}
          >
           Total Pricing Records
          </h4>

          <h1
            style={{
              margin: "8px 0",
              color: "#14344A",
              fontWeight: 800,
              fontSize: 30,
            }}
          >
          {pricingRules.length}
          </h1>
        </div>


  {/* Showing */}
   <div style={{background: "#fff",
    borderRadius: 24,
    padding: 25,
    boxShadow:
      "0 8px 30px rgba(0,0,0,0.06)",
    position: "relative" as const,
    overflow: "hidden" as const,
    cursor: "pointer",
    transition: "0.3s",}}>
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
              fontSize: 24,
            }}
          >
           Showing Records
          </h4>

          <h1
            style={{
              margin: "8px 0",
              color: "#14344A",
              fontWeight: 800,
              fontSize: 30,
            }}
          >
    {filteredPricingRules.length}
          </h1>
        </div>

  
  {/* States */}
 <div style={{background: "#fff",
    borderRadius: 24,
    padding: 25,
    boxShadow:
      "0 8px 30px rgba(0,0,0,0.06)",
    position: "relative" as const,
    overflow: "hidden" as const,
    cursor: "pointer",
    transition: "0.3s",}}>
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
                fontSize: 24,
            }}
          >
            Available States
          </h4>

          <h1
            style={{
              margin: "8px 0",
              color: "#14344A",
              fontWeight: 800,
              fontSize: 30,
            }}
          >
  {states.length}
          </h1>
        </div>

  

  {/* Services */}
 <div style={{background: "#fff",
    borderRadius: 24,
    padding: 25,
    boxShadow:
      "0 8px 30px rgba(0,0,0,0.06)",
    position: "relative" as const,
    overflow: "hidden" as const,
    cursor: "pointer",
    transition: "0.3s",}}>
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
               fontSize: 24,
            }}
          >
        Total Services
          
          </h4>

          <h1
            style={{
              margin: "8px 0",
              color: "#14344A",
              fontWeight: 800,
              fontSize: 30,
            }}
          >
 {services.length}
          </h1>
        </div>

</div>

   {/* ========================================================= */}
{/* FILTER TOOLBAR */}
{/* ========================================================= */}


<section className="mt-8 overflow-hidden  ">

 
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: 30,
          marginBottom: 30,
          boxShadow: "0 4px 20px rgba(0,0,0,.06)",
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
 {/* city */}
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

       <div
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: 30,
          marginBottom: 30,
          boxShadow: "0 4px 20px rgba(0,0,0,.06)",
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

          {/* PARENT SERVICE */}

          <div>

            <label
              style={{
                fontWeight: 600,
                color: "#14344A",
                marginBottom: 10,
                display: "block",
              }}
            >
                  Parent Service
            </label>

            <select
              value={selectedParentServiceId}
              onChange={(e) => {

                setSelectedParentServiceId(e.target.value);

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

                Select Parent Service

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

          </div>
 {/* SUB SERVICE */}
           <div>

            <label
              style={{
                fontWeight: 600,
                color: "#14344A",
                marginBottom: 10,
                display: "block",
              }}
            >
               Sub Service
            </label>

            <select
               value={selectedServiceId}
              disabled={!selectedParentServiceId}
              onChange={(e) =>
                setSelectedServiceId(e.target.value)
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

                Select Sub Service

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

          </div>

        </div>

      </div>
 
  {/* Search + Clear Button */}
<div className="mt-8 flex items-center " >
  {/* Search Bar */}
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
      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
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
      onChange={(e) => setSearch(e.target.value)}
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
    {/* Clear Button */}
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
{/* PREMIUM PRICING TABLE */}
{/* ========================================================= */}

<section className="mt-10 overflow-hidden ">


  <div className="overflow-x-auto bg-white">

    <table className="min-w-full border-collapse">

      {/* ========================================================= */}
      {/* TABLE HEADER */}
      {/* ========================================================= */}

      <thead>

        <tr  style={{
    background:
              "linear-gradient(to right, #FFFF6D, #8FDAFA)",
    boxShadow:
      "0 8px 24px rgba(37,99,235,0.30), inset 0 1px 0 rgba(255,255,255,0.25)",
    borderBottom: "1px solid rgba(255,255,255,0.18)",
  }}>

          <th  style={{
    color: "#14344A",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: "1px",
    textTransform: "uppercase",
    padding: "18px 24px",
    borderRight: "1px solid rgba(255,255,255,0.18)",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
  }}>
            #
          </th>

          <th  style={{
    color: "#14344A",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: "1px",
    textTransform: "uppercase",
    padding: "18px 24px",
    borderRight: "1px solid rgba(255,255,255,0.18)",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
  }}>
            State
          </th>

          <th  style={{
     color: "#14344A",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: "1px",
    textTransform: "uppercase",
    padding: "18px 24px",
    borderRight: "1px solid rgba(255,255,255,0.18)",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
  }}>
            City
          </th>

          <th  style={{
    color: "#14344A",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: "1px",
    textTransform: "uppercase",
    padding: "18px 24px",
    borderRight: "1px solid rgba(255,255,255,0.18)",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
  }}>
            Parent Service
          </th>

          <th  style={{
     color: "#14344A",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: "1px",
    textTransform: "uppercase",
    padding: "18px 24px",
    borderRight: "1px solid rgba(255,255,255,0.18)",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
  }}>
            Sub Service
          </th>

          <th  style={{
     color: "#14344A",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: "1px",
    textTransform: "uppercase",
    padding: "18px 24px",
    borderRight: "1px solid rgba(255,255,255,0.18)",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
  }}>
            Requester Price
          </th>

          <th  style={{
     color: "#14344A",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: "1px",
    textTransform: "uppercase",
    padding: "18px 24px",
    borderRight: "1px solid rgba(255,255,255,0.18)",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
  }}>
            Provider Price
          </th>

        </tr>

      </thead>

      <tbody>
        {filteredPricingRules.length === 0 ? (

  <tr>
    <td
      colSpan={7}
   
      style={{
    color: "#14344A",
    background: "#ece16e88",
    border: "1px solid #D8E6F2",
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

  filteredPricingRules.map((rule, index) => {

    const child = getChildService(rule.serviceId._id);
    const parent = getParentService(rule.serviceId._id);

    return (

      <tr
        key={rule._id}
       
      >

        {/* ================================================= */}
        {/* SR NO */}
        {/* ================================================= */}

        <td style={{
    color: "#14344A",
    background: "#ece16e88",
    border: "1px solid #D8E6F2",
    padding: "18px 20px",
    fontWeight: 600,
  }}>

            {index + 1}
        </td>

        {/* ================================================= */}
        {/* STATE */}
        {/* ================================================= */}

        <td style={{
    color: "#14344A",
    background: "#ece16e88",
    border: "1px solid #D8E6F2",
    padding: "18px 20px",
    fontWeight: 600,
  }}>
              <p className="font-bold text-indigo-900">
                {rule.stateId?.name}
              </p>            </td>

        {/* ================================================= */}
        {/* CITY */}
        {/* ================================================= */}

        <td style={{
    color: "#14344A",
    background: "#ece16e88",
    border: "1px solid #D8E6F2",
    padding: "18px 20px",
    fontWeight: 600,
  }}>

    <p className="font-bold text-indigo-900">
                {rule.cityId?.name}
              </p>
        </td>
             {/* ================================================= */}
        {/* PARENT SERVICE */}
        {/* ================================================= */}

        <td style={{
    color: "#14344A",
    background: "#ece16e88",
    border: "1px solid #D8E6F2",
    padding: "18px 20px",
    fontWeight: 600,
  }}>

          <span >
            {parent?.name ?? "-"}
          </span>

        </td>

        {/* ================================================= */}
        {/* SUB SERVICE */}
        {/* ================================================= */}

        <td style={{
    color: "#14344A",
    background: "#ece16e88",
    border: "1px solid #D8E6F2",
    padding: "18px 20px",
    fontWeight: 600,
  }}>

          <span >
            {child?.name ?? "-"}
          </span>

        </td>

       

        {/* ================================================= */}
        {/* REQUESTER PRICE */}
        {/* ================================================= */}

        <td style={{
    color: "#14344A",
    background: "#ece16e88",
    border: "1px solid #D8E6F2",
    padding: "18px 20px",
    fontWeight: 600,
  }} >

                     <span >
              ${rule.requesterPrice}
            </span>

        

        </td>

        {/* ================================================= */}
        {/* PROVIDER PRICE */}
        {/* ================================================= */}

        <td style={{
    color: "#14344A",
    background: "#ece16e88",
    border: "1px solid #D8E6F2",
    padding: "18px 20px",
    fontWeight: 600,
  }}>

            <span>
              ${rule.providerPrice}
            </span>

         

        </td>

      </tr>

    );

  })

)}

</tbody>
      {/* ========================================================= */}
      {/* FOOTER */}
      {/* ========================================================= */}

      <tfoot>

        <tr>

          <td
            colSpan={7}
            className="border-t border-indigo-200 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 px-8 py-6"
          >

            <div className="flex flex-col items-center justify-between gap-5 lg:flex-row">

              {/* Left */}
              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg">

                  <CheckCircle2 className="h-6 w-6" />

                </div>

                <div>

                  <p className="text-lg font-bold text-indigo-900">
                    Pricing Records Summary
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Showing
                    <span className="mx-2 font-bold text-indigo-700">
                      {filteredPricingRules.length}
                    </span>
                    of
                    <span className="mx-2 font-bold text-indigo-700">
                      {pricingRules.length}
                    </span>
                    pricing rules.
                  </p>

                </div>

              </div>

              {/* Right */}
              <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold tracking-wide text-white shadow-xl">

                Senior America Admin Panel

              </div>

            </div>

          </td>

        </tr>

      </tfoot>

    </table>

  </div>

</section>

  

  </div>

);

};

export default PricingRules;