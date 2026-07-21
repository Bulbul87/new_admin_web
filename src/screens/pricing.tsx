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
  getChildServices,
  getCities,
  getParentServices,
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
  StateOption,
} from "../service/pricingService";

interface FormErrors {
  state?: string;
  requesterPrice?: string;
  providerPrice?: string;
}

interface StatusMessage {
  type: "success" | "error";
  text: string;
}

const getRuleLabel = (rule: PricingRule, key: "stateId" | "cityId" | "serviceId") =>
  rule[key]?.name ?? "All";

const Pricing: React.FC = () => {
  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [services, setServices] = useState<ServiceCatalogItem[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusMessage | null>(null);

  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedParentServiceId, setSelectedParentServiceId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [requesterPrice, setRequesterPrice] = useState("");
  const [providerPrice, setProviderPrice] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [statesData, citiesData, servicesData, pricingData] = await Promise.all([
        getStates(),
        getCities(),
        getServiceCatalog(),
        getPricingRules(),
      ]);
      console.log("Pricing Loaded", pricingData);
      setStates(statesData);
      setCities(citiesData);
      setServices(servicesData);
      setPricingRules(pricingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load pricing data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadData]);



  const filteredCities = useMemo(
    () => cities.filter((city) => getStateIdFromCity(city) === selectedStateId),
    [cities, selectedStateId],
  );
  const parentServices = useMemo(() => getParentServices(services), [services]);
  const childServices = useMemo(
    () =>
      selectedParentServiceId
        ? getChildServices(services, selectedParentServiceId)
        : [],
    [services, selectedParentServiceId],
  );
  const loadExistingPricing = useCallback((rules = pricingRules) => {
    let matchingRules: PricingRule[] = [];

    if (selectedServiceId) {
      matchingRules = rules.filter(
        (rule) =>
          rule.stateId?._id === selectedStateId &&
          rule.cityId?._id === selectedCityId &&
          rule.serviceId?._id === selectedServiceId,
      );
    } else if (selectedParentServiceId) {
      const childServiceIds = new Set(childServices.map((service) => service._id));
      matchingRules = rules.filter(
        (rule) =>
          rule.stateId?._id === selectedStateId &&
          rule.cityId?._id === selectedCityId &&
          childServiceIds.has(rule.serviceId?._id),
      );
    } else if (selectedCityId) {
      matchingRules = rules.filter(
        (rule) =>
          rule.stateId?._id === selectedStateId &&
          rule.cityId?._id === selectedCityId,
      );
    } else if (selectedStateId) {
      matchingRules = rules.filter(
        (rule) => rule.stateId?._id === selectedStateId,
      );
    }

    const [rule] = matchingRules;
    setRequesterPrice(rule ? String(rule.requesterPrice) : "");
    setProviderPrice(rule ? String(rule.providerPrice) : "");
  }, [
    childServices,
    pricingRules,
    selectedCityId,
    selectedParentServiceId,
    selectedServiceId,
    selectedStateId,
  ]);

  useEffect(() => {
    loadExistingPricing();
  }, [loadExistingPricing]);

  const pricingLevel = !selectedCityId
    ? "State"
    : !selectedParentServiceId
      ? "City"
      : !selectedServiceId
        ? "Parent service"
        : "Individual service";

  const clearMessages = () => {
    setErrors({});
    setStatus(null);
  };

  const handleStateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    console.log("Selected State =", event.target.value);
    setSelectedStateId(event.target.value);
    setSelectedCityId("");
    setSelectedParentServiceId("");
    setSelectedServiceId("");

    clearMessages();
  };

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCityId(event.target.value);
    setSelectedParentServiceId("");
    setSelectedServiceId("");

    clearMessages();
  };

  const handleParentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedParentServiceId(event.target.value);
    setSelectedServiceId("");

    clearMessages();
  };

  const handleServiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedServiceId(event.target.value);
    clearMessages();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    const requester = Number(requesterPrice);
    const provider = Number(providerPrice);

    if (!selectedStateId) nextErrors.state = "Please select a state.";
    if (requesterPrice === "" || !Number.isFinite(requester) || requester < 0) {
      nextErrors.requesterPrice = "Enter a valid requester price.";
    }
    if (providerPrice === "" || !Number.isFinite(provider) || provider < 0) {
      nextErrors.providerPrice = "Enter a valid provider price.";
    }
    setErrors(nextErrors);
    setStatus(null);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      const payload = buildPricingPayload({
        stateId: selectedStateId,
        cityId: selectedCityId || undefined,
        parentServiceId: selectedParentServiceId || undefined,
        serviceId: selectedServiceId || undefined,
        requesterPrice: requester,
        providerPrice: provider,
      });
      const response = await updatePricing(payload);
      setStatus({ type: "success", text: response.message || "Pricing updated successfully." });
      const refreshedPricingRules = await getPricingRules();
      setPricingRules(refreshedPricingRules);
      loadExistingPricing(refreshedPricingRules);
    } catch (err) {
      setStatus({
        type: "error",
        text: err instanceof Error ? err.message : "Unable to update pricing.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center text-slate-600">
        <Loader2 className="mr-3 h-6 w-6 animate-spin" /> Loading pricing data…
      </div>
    );
  }

  return (
    <div style={{
      marginLeft: "260px",
      marginTop: "70px",
      minHeight: "100vh",
      background: "#f5f7fb",
      padding: "30px",
    }} className="">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>

          <h1 className="mt-1  text-center" style={{
            color: "#14344A",
            fontWeight: 700,
            marginBottom: 10,
            alignItems: "center",
          }}>Pricing Management</h1>

        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 20,
            marginBottom:20,
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
              background: "linear-gradient(to right, #FFFF6D, #8FDAFA)",
              color: "#14344A",
              fontWeight: 700,
              padding: "14px 24px",
              borderRadius: 14,
              boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
              transition: "0.3s",
              cursor: "pointer",
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div style={{
          background: "#fff",
          borderRadius: 24,
          padding: 30,
          marginBottom: 30,
          boxShadow: "0 4px 20px rgba(0,0,0,.06)",
        }}>
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
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 25,
          }} >
            <div>
              <label style={{
                fontWeight: 600,
                color: "#14344A",
                marginBottom: 10,
                display: "block",
              }}>
                State
                <select value={selectedStateId} onChange={handleStateChange} aria-invalid={Boolean(errors.state)}
                  style={{
                    width: "100%",
                    padding: 16,
                    borderRadius: 14,
                    border: "1px solid #ddd",
                    outline: "none",
                    fontSize: 15,
                  }}>
                  <option value="">Select state</option>
                  {states.map((state) => <option key={state._id} value={state._id}>{state.name}</option>)}
                </select>
                {errors.state && <span >{errors.state}</span>}
              </label>
            </div>
            <div>
              <label style={{
                fontWeight: 600,
                color: "#14344A",
                marginBottom: 10,
                display: "block",
              }}>
                City
                <select value={selectedCityId} onChange={handleCityChange} disabled={!selectedStateId} style={{
                  width: "100%",
                  padding: 16,
                  borderRadius: 14,
                  border: "1px solid #ddd",
                  outline: "none",
                  fontSize: 15,
                }} >
                  <option value="">Select city</option>
                  {filteredCities.map((city) => <option key={city._id} value={city._id}>{city.name}</option>)}
                </select>
              </label>
            </div>

          </div>
        </div>

        <div style={{
          background: "#fff",
          borderRadius: 24,
          padding: 30,
          marginBottom: 30,
          boxShadow: "0 4px 20px rgba(0,0,0,.06)",
        }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 25,
            }}
          >
            <Wrench size={24} color="#14344A" />


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
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 25,
          }} >
            <div>
              <label style={{
                fontWeight: 600,
                color: "#14344A",
                marginBottom: 10,
                display: "block",
              }} >
                Service Category
                <select value={selectedParentServiceId} onChange={handleParentChange} disabled={!selectedCityId} style={{
                  width: "100%",
                  padding: 16,
                  borderRadius: 14,
                  border: "1px solid #ddd",
                  outline: "none",
                  fontSize: 15,
                }} >
                  <option value="">Select service category</option>
                  {parentServices.map((service) => <option key={service._id} value={service._id}>{service.name}</option>)}
                </select>
              </label>
            </div>
            <div>



              <label style={{
                fontWeight: 600,
                color: "#14344A",
                marginBottom: 10,
                display: "block",
              }} >
                Service
                <select value={selectedServiceId} onChange={handleServiceChange} disabled={!selectedParentServiceId} style={{
                  width: "100%",
                  padding: 16,
                  borderRadius: 14,
                  border: "1px solid #ddd",
                  outline: "none",
                  fontSize: 15,
                }} >
                  <option value="">Select service</option>
                  {childServices.map((service) => <option key={service._id} value={service._id}>{service.name}</option>)}
                </select>
              </label>

            </div>

          </div>
        </div>



        {/* input fields  */}

        <section>


          <div style={{
            background: "#fff",
            borderRadius: 24,
            padding: 30,
            marginBottom: 30,
            boxShadow: "0 4px 20px rgba(0,0,0,.06)",
          }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 25,
              }}
            >
              <DollarSign size={24} color="#14344A" />


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
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 25,
            }} >
              <div>


                <label style={{
                  fontWeight: 600,
                  color: "#14344A",
                  marginBottom: 10,
                  display: "block",
                }} >
                  Requester price
                  <div style={{
                    position: "relative",
                    marginTop: 8,
                  }}>
                    <DollarSign style={{
                      position: "absolute",
                      left: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color:"#14344A",
                      width: 18,
                      height: 18,
                      pointerEvents: "none",
                    }} />
                    <input type="number" min="0" step="0.01" value={requesterPrice} onChange={(event) => setRequesterPrice(event.target.value)} style={{
                      width: "100%",
                      padding: "16px 16px 16px 48px",
                      borderRadius: 14,
                      border: "1px solid #ddd",
                      outline: "none",
                      fontSize: 15,
                      boxSizing: "border-box",
                    }} placeholder="Enter requester price" /></div>
                  {errors.requesterPrice && <span className="mt-1 block text-xs text-red-600">{errors.requesterPrice}</span>}
                </label>
              </div>

              <div>
                <label style={{
                  fontWeight: 600,
                  color: "#14344A",
                  marginBottom: 10,
                  display: "block",
                }} >
                  Provider price
                  <div
                    style={{
                      position: "relative",
                      marginTop: 8,
                    }}
                  >
                    <DollarSign
                      style={{
                        position: "absolute",
                        left: 16,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color:"#14344A",
                        width: 18,
                        height: 18,
                        pointerEvents: "none",
                      }}
                    />

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={providerPrice}
                      onChange={(event) => setProviderPrice(event.target.value)}
                      placeholder="Enter provider price"
                      style={{
                        width: "100%",
                        padding: "16px 16px 16px 48px",
                        borderRadius: 14,
                        border: "1px solid #ddd",
                        outline: "none",
                        fontSize: 15,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  {errors.providerPrice && <span className="mt-1 block text-xs text-red-600">{errors.providerPrice}</span>}
                </label>
              </div>

            </div>

            {status && <div className={`mt-6 rounded-xl p-4 text-sm ${status.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{status.text}</div>}
            <div className="mt-8 flex justify-end">
              <button type="submit" disabled={saving} style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",

                border: "none",
                background: "linear-gradient(to right, #FFFF6D, #8FDAFA)",
                color: "#14344A",
                fontWeight: 700,
                padding: "14px 24px",
                borderRadius: 14,
                boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                transition: "0.3s",
                cursor: "pointer",
              }}>
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                {saving ? "Updating…" : "Update pricing"}
              </button>
            </div>
          </div>



        </section>
      </form>


    </div>
  );
};

export default Pricing;
