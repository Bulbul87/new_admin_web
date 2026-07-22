import { useEffect, useMemo, useState } from "react";

import {
  MapPin,
  Building2,
  Layers3,
  Map,
  ListTree,
} from "lucide-react";

import {
  getStates,
  getCitiesByState,
  getServiceCatalog,
  type StateType,
  type CityType,
  type ServiceCategory,
  type ServiceItem,
} from "../service/service_catlog";

const ServiceRequestForm = () => {
  // ==========================
  // STATES
  // ==========================

  const [states, setStates] = useState<StateType[]>([]);
  const [cities, setCities] = useState<CityType[]>([]);

  // Complete Service Catalog
  const [services, setServices] = useState<ServiceCategory[]>([]);

  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // Selected Category
  const [selectedCategory, setSelectedCategory] =
    useState("");

  // Selected Child Service
  const [selectedService, setSelectedService] =
    useState("");

  const [loading, setLoading] = useState(false);

  // ==========================
  // LOAD INITIAL DATA
  // ==========================

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [stateRes, catalogRes] =
        await Promise.all([
          getStates(),
          getServiceCatalog(),
        ]);

      setStates(stateRes || []);
      setServices(catalogRes || []);
    } catch (err) {
      console.log("Load Error :", err);
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // TOTAL SERVICES
  // ==========================

  const totalServices = useMemo(() => {
    return services.reduce(
      (total, category) =>
        total +
        (category.services?.length || 0),
      0
    );
  }, [services]);

  // ==========================
  // SELECTED CATEGORY
  // ==========================

  const selectedCategoryData =
    services.find(
      (category) =>
        category.categoryId ===
        selectedCategory
    );

  // ==========================
  // CHILD SERVICES
  // ==========================

  const childServices: ServiceItem[] =
    selectedCategoryData?.services || [];

  // ==========================
  // STATE CHANGE
  // ==========================

  const handleStateChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const id = e.target.value;

    setSelectedState(id);
    setSelectedCity("");

    setCities([]);

    if (!id) return;

    try {
      const cityData =
        await getCitiesByState(id);

      setCities(cityData);
    } catch (err) {
      console.log(err);
    }
  };

  // ==========================
  // CATEGORY CHANGE
  // ==========================

  const handleCategoryChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedCategory(e.target.value);

    // Reset child service
    setSelectedService("");
  };

  // ==========================
  // SERVICE CHANGE
  // ==========================

  const handleServiceChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedService(e.target.value);
  };

  // ==========================
  // LOADING
  // ==========================

  if (loading) {
    return (
      <div
        style={{
          marginLeft: "260px",
          marginTop: "90px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <h3>Loading...</h3>
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
      {/* ========================= */}
      {/* PAGE HEADER */}
      {/* ========================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30,
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <div>
          <h2
            style={{
              color: "#14344A",
              fontWeight: 700,
              fontSize: 34,
              marginBottom: 8,
            }}
          >
            Service Catalog
          </h2>

          <p
            style={{
              color: "#666",
              fontSize: 16,
            }}
          >
            Manage States, Cities & Service Categories
          </p>
        </div>

      </div> 
            {/* ============================== */}
      {/* SUMMARY CARDS */}
      {/* ============================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 25,
          marginBottom: 30,
        }}
      >

        {/* STATES */}

        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: 24,
            boxShadow: "0 4px 20px rgba(0,0,0,.06)",
          }}
        >
          <div
            style={{
              width: 55,
              height: 55,
              borderRadius: 16,
              background: "rgba(255,255,109,.35)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <Map size={28} color="#14344A" />
          </div>

          <p
            style={{
              color: "#777",
              marginBottom: 8,
            }}
          >
            Total States
          </p>

          <h2
            style={{
              color: "#14344A",
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            {states.length}
          </h2>
        </div>

        {/* CITIES */}

        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: 24,
            boxShadow: "0 4px 20px rgba(0,0,0,.06)",
          }}
        >
          <div
            style={{
              width: 55,
              height: 55,
              borderRadius: 16,
              background: "rgba(143,218,250,.25)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <Building2 size={28} color="#14344A" />
          </div>

          <p
            style={{
              color: "#777",
              marginBottom: 8,
            }}
          >
            Loaded Cities
          </p>

          <h2
            style={{
              color: "#14344A",
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            {cities.length}
          </h2>
        </div>

        {/* SERVICES */}

        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: 24,
            boxShadow: "0 4px 20px rgba(0,0,0,.06)",
          }}
        >
          <div
            style={{
              width: 55,
              height: 55,
              borderRadius: 16,
              background: "rgba(20,52,74,.08)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <Layers3 size={28} color="#14344A" />
          </div>

          <p
            style={{
              color: "#777",
              marginBottom: 8,
            }}
          >
            Total Services
          </p>

       <h2
  style={{
    color: "#14344A",
    fontSize: 34,
    fontWeight: 700,
  }}
>
  {totalServices}
</h2>
        </div>

      </div>

      {/* ============================== */}
      {/* LOCATION CARD */}
      {/* ============================== */}

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
              value={selectedState}
              onChange={handleStateChange}
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
              value={selectedCity}
              onChange={(e) =>
                setSelectedCity(e.target.value)
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

              {cities.map((city) => (
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
            {/* ============================== */}
      {/* SERVICE DETAILS */}
      {/* ============================== */}

      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: 30,
          boxShadow: "0 4px 20px rgba(0,0,0,.06)",
          marginBottom: 30,
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
          <ListTree size={24} color="#14344A" />

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
          {/* All Services */}

  {/* CATEGORY */}

  <div>
    <label
      style={{
        display: "block",
        marginBottom: 10,
        color: "#14344A",
        fontWeight: 600,
      }}
    >
      Category
    </label>

    <select
      value={selectedCategory}
      onChange={handleCategoryChange}
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
        Select Category
      </option>

      {services.map((category) => (
        <option
          key={category._id}
          value={category.categoryId}
        >
          {category.categoryName}
        </option>
      ))}
    </select>
  </div>

  {/* SERVICE */}

  <div>
    <label
      style={{
        display: "block",
        marginBottom: 10,
        color: "#14344A",
        fontWeight: 600,
      }}
    >
      Service
    </label>

    <select
      value={selectedService}
      onChange={handleServiceChange}
      disabled={!selectedCategory}
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
          key={service._id}
          value={service.servId}
        >
          {service.name}
        </option>
      ))}
    </select>
  </div>


          
        </div>
      </div>

      {/* ============================== */}
      {/* SELECTED DATA PREVIEW */}
      {/* ============================== */}

      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: 25,
          boxShadow: "0 4px 20px rgba(0,0,0,.06)",
          marginBottom: 30,
        }}
      >
        <h3
          style={{
            color: "#14344A",
            marginBottom: 20,
            fontWeight: 700,
          }}
        >
          Selected Information
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2,1fr)",
            gap: 18,
          }}
        >
          <div
            style={{
              background: "#F8FBFF",
              padding: 18,
              borderRadius: 16,
            }}
          >
            <strong>State</strong>

            <p style={{ marginTop: 8 }}>
              {states.find(
                (x) =>
                  x._id === selectedState
              )?.name || "-"}
            </p>
          </div>

          <div
            style={{
              background: "#F8FBFF",
              padding: 18,
              borderRadius: 16,
            }}
          >
            <strong>City</strong>

            <p style={{ marginTop: 8 }}>
              {cities.find(
                (x) =>
                  x._id === selectedCity
              )?.name || "-"}
            </p>
          </div>

          <div
            style={{
              background: "#F8FBFF",
              padding: 18,
              borderRadius: 16,
            }}
          >
            <strong> Service</strong>

            <p style={{ marginTop: 8 }}>
              {childServices.find(
  (x) =>
    x.servId === selectedService
)?.name || "-"}
            </p>
          </div>


<div
  style={{
    background: "#F8FBFF",
    padding: 18,
    borderRadius: 16,
  }}
>
  <strong>Category</strong>

  <p style={{ marginTop: 8 }}>
    {services.find(
      (x) =>
        x.categoryId === selectedCategory
    )?.categoryName || "-"}
  </p>
</div>
         
        </div>

        
      </div>
          </div>
  );
};

export default ServiceRequestForm;