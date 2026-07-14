import { useEffect, useState } from "react";

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

  useEffect(() => {
    loadStates();
    loadServices();
  }, []);

  const loadStates = async () => {
    try {
      const data = await getStates();
      setStates(data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadServices = async () => {
    try {
      const data = await getServiceCatalog();
      setServices(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleStateChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const stateId = e.target.value;

    setSelectedState(stateId);
    setSelectedCity("");

    try {
      const data = await getCitiesByState(stateId);
      setCities(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleServiceChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const id = e.target.value;

    setSelectedService(id);
    setSelectedChildService("");

    const service = services.find((item) => item._id === id);

    if (service && service.children.length > 0) {
      setChildServices(service.children);
    } else {
      setChildServices([]);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white shadow rounded-lg p-6">

      <h1 className="text-2xl font-bold mb-6">
        Service Request Form
      </h1>

      {/* State */}

      <div className="mb-4">
        <label className="block mb-2 font-medium">
          State
        </label>

        <select
          value={selectedState}
          onChange={handleStateChange}
          className="w-full border rounded-lg p-3"
        >
          <option value="">Select State</option>

          {states.map((state) => (
            <option key={state._id} value={state._id}>
              {state.name}
            </option>
          ))}
        </select>
      </div>

      {/* City */}

      {cities.length > 0 && (
        <div className="mb-4">
          <label className="block mb-2 font-medium">
            City
          </label>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full border rounded-lg p-3"
          >
            <option value="">Select City</option>

            {cities.map((city) => (
              <option key={city._id} value={city._id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Parent Service */}

      <div className="mb-4">
        <label className="block mb-2 font-medium">
          Service
        </label>

        <select
          value={selectedService}
          onChange={handleServiceChange}
          className="w-full border rounded-lg p-3"
        >
          <option value="">Select Service</option>

          {services.map((service) => (
            <option key={service._id} value={service._id}>
              {service.name}
            </option>
          ))}
        </select>
      </div>

      {/* Child Service */}

      {childServices.length > 0 && (
        <div className="mb-4">
          <label className="block mb-2 font-medium">
            Sub Service
          </label>

          <select
            value={selectedChildService}
            onChange={(e) => setSelectedChildService(e.target.value)}
            className="w-full border rounded-lg p-3"
          >
            <option value="">Select Sub Service</option>

            {childServices.map((child) => (
              <option key={child._id} value={child._id}>
                {child.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <button className="mt-4 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700">
        Submit
      </button>

    </div>
  );
}