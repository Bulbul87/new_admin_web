import { useEffect, useState } from "react";
import {
  MapPin,
 
  Layers3,
  
  Save,
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

export default function ServiceRequestForm() {
  const [states, setStates] = useState<StateType[]>([]);
  const [cities, setCities] = useState<CityType[]>([]);
  const [services, setServices] = useState<ServiceCatalog[]>([]);

  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [selectedService, setSelectedService] = useState("");
  const [selectedChildService, setSelectedChildService] = useState("");

  const [childServices, setChildServices] = useState<ChildService[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      const [stateData, serviceData] = await Promise.all([
        getStates(),
        getServiceCatalog(),
      ]);

      setStates(stateData);
      setServices(serviceData);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const stateId = e.target.value;

    setSelectedState(stateId);
    setSelectedCity("");
    setCities([]);

    if (!stateId) return;

    try {
      const data = await getCitiesByState(stateId);
      setCities(data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleServiceChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const id = e.target.value;

    setSelectedService(id);
    setSelectedChildService("");

    const selected = services.find((s) => s._id === id);

    if (selected?.children?.length) {
      setChildServices(selected.children);
    } else {
      setChildServices([]);
    }
  };

  const handleSubmit = () => {
    console.log({
      state: selectedState,
      city: selectedCity,
      service: selectedService,
      childService: selectedChildService,
    });
  };

  return (
    <div className="ml-[220px] mt-[70px] min-h-screen bg-slate-100 p-8">

      {/* Header */}

      <div className="mb-8">

        <h1 className="text-4xl font-bold text-slate-800">
          Service Catalog
        </h1>

        <p className="text-gray-500 mt-2">
          Manage service availability by state, city and category.
        </p>

      </div>

      {/* Summary */}

      <div className="grid grid-cols-3 gap-6 mb-8">

        <div className="bg-gradient-to-r from-yellow-200 to-cyan-100 rounded-2xl shadow p-6">

          <p className="text-gray-600">
            Total States
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {states.length}
          </h2>

        </div>

        <div className="bg-gradient-to-r from-yellow-200 to-cyan-100 rounded-2xl shadow p-6">

          <p className="text-gray-600">
            Cities Loaded
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {cities.length}
          </h2>

        </div>

        <div className="bg-gradient-to-r from-yellow-200 to-cyan-100 rounded-2xl shadow p-6">

          <p className="text-gray-600">
            Services
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {services.length}
          </h2>

        </div>

      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow p-12 text-center text-lg font-semibold">
          Loading...
        </div>
      ) : (        <>
          {/* ====================== */}
          {/* LOCATION DETAILS */}
          {/* ====================== */}

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">

            <div className="flex items-center gap-3 mb-6">
              <div className="bg-yellow-100 p-3 rounded-xl">
                <MapPin className="text-yellow-600" size={24} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Location Details
                </h2>

                <p className="text-gray-500">
                  Select state and city.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">

              {/* STATE */}

              <div>

                <label className="block mb-2 font-semibold text-slate-700">
                  State
                </label>

                <select
                  value={selectedState}
                  onChange={handleStateChange}
                  className="w-full rounded-xl border border-gray-300 bg-white p-4 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="">Select State</option>

                  {states.map((state) => (
                    <option key={state._id} value={state._id}>
                      {state.name}
                    </option>
                  ))}
                </select>

              </div>

              {/* CITY */}

              <div>

                <label className="block mb-2 font-semibold text-slate-700">
                  City
                </label>

                <select
                  value={selectedCity}
                  onChange={(e) =>
                    setSelectedCity(e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white p-4 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="">Select City</option>

                  {cities.map((city) => (
                    <option key={city._id} value={city._id}>
                      {city.name}
                    </option>
                  ))}

                </select>

              </div>

            </div>

          </div>

          {/* ====================== */}
          {/* SERVICE DETAILS */}
          {/* ====================== */}

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">

            <div className="flex items-center gap-3 mb-6">

              <div className="bg-cyan-100 p-3 rounded-xl">
                <Layers3
                  className="text-cyan-600"
                  size={24}
                />
              </div>

              <div>

                <h2 className="text-2xl font-bold text-slate-800">
                  Service Details
                </h2>

                <p className="text-gray-500">
                  Select parent and child service.
                </p>

              </div>

            </div>

            <div className="grid md:grid-cols-2 gap-6">

              {/* Parent */}

              <div>

                <label className="block mb-2 font-semibold text-slate-700">
                  Parent Service
                </label>

                <select
                  value={selectedService}
                  onChange={handleServiceChange}
                  className="w-full rounded-xl border border-gray-300 bg-white p-4 focus:outline-none focus:ring-2 focus:ring-cyan-400"
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

              {/* Child */}

              <div>

                <label className="block mb-2 font-semibold text-slate-700">
                  Child Service
                </label>

                <select
                  value={selectedChildService}
                  onChange={(e) =>
                    setSelectedChildService(e.target.value)
                  }
                  disabled={childServices.length === 0}
                  className="w-full rounded-xl border border-gray-300 bg-white p-4 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:bg-gray-100"
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

            {/* Button */}

            <div className="flex justify-end mt-10">

              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-cyan-400 hover:from-yellow-500 hover:to-cyan-500 text-slate-900 font-bold px-8 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Save size={20} />

                Save Selection

              </button>

            </div>

          </div>

        </>
      )}

    </div>
  );
}