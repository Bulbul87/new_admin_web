import { useEffect, useState } from "react";

import {
  MapPin,
  Building2,
  Layers3,
  Save,
  Map,
  ListTree,
} from "lucide-react";

import {
  getStates,
  getCitiesByState,
  getServiceCatalog,
  type StateType,
  type CityType,
  type ChildService,
  type ServiceCatalog,
} from "../service/service_catlog";

const ServiceRequestForm = () => {
  const [states, setStates] = useState<StateType[]>([]);
  const [cities, setCities] = useState<CityType[]>([]);
  const [services, setServices] = useState<ServiceCatalog[]>([]);

  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [selectedService, setSelectedService] = useState("");
  const [selectedChildService, setSelectedChildService] =
    useState("");

  const [childServices, setChildServices] =
    useState<ChildService[]>([]);

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

      const [stateRes, serviceRes] = await Promise.all([
        getStates(),
        getServiceCatalog(),
      ]);

      setStates(stateRes);
      setServices(serviceRes);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

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
      const data = await getCitiesByState(id);

      setCities(data);
    } catch (err) {
      console.log(err);
    }
  };

  // ==========================
  // SERVICE CHANGE
  // ==========================

  const handleServiceChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const id = e.target.value;

    setSelectedService(id);
    setSelectedChildService("");

    const parent = services.find(
      (item) => item._id === id
    );

    if (parent?.children?.length) {
      setChildServices(parent.children);
    } else {
      setChildServices([]);
    }
  };

  // ==========================
  // SUBMIT
  // ==========================

  const handleSubmit = () => {
    console.log({
      state: selectedState,
      city: selectedCity,
      service: selectedService,
      childService: selectedChildService,
    });
  };

  // ==========================
  // UI
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

        <button
          onClick={handleSubmit}
          style={{
            border: "none",
            background:
              "linear-gradient(to right,#FFFF6D,#8FDAFA)",
            color: "#14344A",
            padding: "14px 24px",
            borderRadius: 14,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow:
              "0 6px 20px rgba(0,0,0,.08)",
          }}
        >
          <Save size={18} />
          Save Selection
        </button>
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
            Parent Services
          </p>

          <h2
            style={{
              color: "#14344A",
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            {services.length}
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
          {/* Parent Service */}

          <div>
            <label
              style={{
                display: "block",
                marginBottom: 10,
                color: "#14344A",
                fontWeight: 600,
              }}
            >
              Parent Service
            </label>

            <select
              value={selectedService}
              onChange={handleServiceChange}
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

              {services.map((service) => (
                <option
                  key={service._id}
                  value={service._id}
                >
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          {/* Child Service */}

          <div>
            <label
              style={{
                display: "block",
                marginBottom: 10,
                color: "#14344A",
                fontWeight: 600,
              }}
            >
              Child Service
            </label>

            <select
              value={selectedChildService}
              onChange={(e) =>
                setSelectedChildService(
                  e.target.value
                )
              }
              disabled={
                childServices.length === 0
              }
              style={{
                width: "100%",
                padding: 16,
                borderRadius: 14,
                border: "1px solid #ddd",
                outline: "none",
                fontSize: 15,
                background:
                  childServices.length === 0
                    ? "#f3f4f6"
                    : "#fff",
              }}
            >
              <option value="">
                Select Child Service
              </option>

              {childServices.map((child) => (
                <option
                  key={child._id}
                  value={child._id}
                >
                  {child.name}
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
            <strong>Parent Service</strong>

            <p style={{ marginTop: 8 }}>
              {services.find(
                (x) =>
                  x._id ===
                  selectedService
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
            <strong>Child Service</strong>

            <p style={{ marginTop: 8 }}>
              {childServices.find(
                (x) =>
                  x._id ===
                  selectedChildService
              )?.name || "-"}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 30,
          }}
        >
          <button
            onClick={handleSubmit}
            style={{
              border: "none",
              background:
                "linear-gradient(to right,#FFFF6D,#8FDAFA)",
              color: "#14344A",
              padding: "14px 26px",
              borderRadius: 14,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 10,
              boxShadow:
                "0 6px 20px rgba(0,0,0,.08)",
            }}
          >
            <Save size={18} />

            Save Selection
          </button>
        </div>
      </div>
          </div>
  );
};

export default ServiceRequestForm;