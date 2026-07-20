import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  DollarSign,
  Loader2,
  MapPin,
  RefreshCw,
  Save,
  Sparkles,
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
    <div  style={{
        marginLeft: "260px",
        marginTop: "70px",
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "30px",
      }} className="">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 text-indigo-600">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-semibold">Smart pricing</span>
          </div>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Pricing Management</h1>
          <p className="mt-1 text-slate-600">Set a price at state, city, parent-service, or service level.</p>
        </div>
        <button
          type="button"
          onClick={() => void loadData()}
          disabled={loading || saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
          <div className="mb-6 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">Location</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              State
              <select value={selectedStateId} onChange={handleStateChange} className="mt-2 w-full rounded-xl border border-slate-300 p-3 font-normal" aria-invalid={Boolean(errors.state)}>
                <option value="">Select state</option>
                {states.map((state) => <option key={state._id} value={state._id}>{state.name}</option>)}
              </select>
              {errors.state && <span className="mt-1 block text-xs text-red-600">{errors.state}</span>}
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              City <span className="font-normal text-slate-400">(optional)</span>
              <select value={selectedCityId} onChange={handleCityChange} disabled={!selectedStateId} className="mt-2 w-full rounded-xl border border-slate-300 p-3 font-normal disabled:cursor-not-allowed disabled:bg-slate-100">
                <option value="">All cities (state pricing)</option>
                {filteredCities.map((city) => <option key={city._id} value={city._id}>{city.name}</option>)}
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
          <div className="mb-6 flex items-center gap-3">
            <Wrench className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">Service pricing</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              Parent service <span className="font-normal text-slate-400">(optional)</span>
              <select value={selectedParentServiceId} onChange={handleParentChange} disabled={!selectedCityId} className="mt-2 w-full rounded-xl border border-slate-300 p-3 font-normal disabled:cursor-not-allowed disabled:bg-slate-100">
                <option value="">All services (city pricing)</option>
                {parentServices.map((service) => <option key={service._id} value={service._id}>{service.name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Child service <span className="font-normal text-slate-400">(optional)</span>
              <select value={selectedServiceId} onChange={handleServiceChange} disabled={!selectedParentServiceId} className="mt-2 w-full rounded-xl border border-slate-300 p-3 font-normal disabled:cursor-not-allowed disabled:bg-slate-100">
                <option value="">All child services (parent pricing)</option>
                {childServices.map((service) => <option key={service._id} value={service._id}>{service.name}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-6 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
            Applying <strong>{pricingLevel}</strong> pricing.
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              Requester price
              <div className="relative mt-2"><DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input type="number" min="0" step="0.01" value={requesterPrice} onChange={(event) => setRequesterPrice(event.target.value)} className="w-full rounded-xl border border-slate-300 py-3 pl-9 pr-3 font-normal" placeholder="Enter requester price" /></div>
              {errors.requesterPrice && <span className="mt-1 block text-xs text-red-600">{errors.requesterPrice}</span>}
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Provider price
              <div className="relative mt-2"><DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input type="number" min="0" step="0.01" value={providerPrice} onChange={(event) => setProviderPrice(event.target.value)} className="w-full rounded-xl border border-slate-300 py-3 pl-9 pr-3 font-normal" placeholder="Enter provider price" /></div>
              {errors.providerPrice && <span className="mt-1 block text-xs text-red-600">{errors.providerPrice}</span>}
            </label>
          </div>
          {status && <div className={`mt-6 rounded-xl p-4 text-sm ${status.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{status.text}</div>}
          <div className="mt-8 flex justify-end">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-6 py-3 font-bold text-white shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {saving ? "Updating…" : "Update pricing"}
            </button>
          </div>
        </section>
      </form>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 text-white"><Building2 className="h-5 w-5" /><h2 className="text-xl font-bold">Existing pricing rules</h2></div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm"><thead className="bg-slate-100 text-left text-slate-600"><tr><th className="px-5 py-4">State</th><th className="px-5 py-4">City</th><th className="px-5 py-4">Service</th><th className="px-5 py-4 text-right">Requester</th><th className="px-5 py-4 text-right">Provider</th></tr></thead>
            <tbody>{pricingRules.length === 0 ? <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">No pricing rules available.</td></tr> : pricingRules.map((rule) => <tr key={rule._id} className="border-t border-slate-100 hover:bg-slate-50"><td className="px-5 py-4">{getRuleLabel(rule, "stateId")}</td><td className="px-5 py-4">{getRuleLabel(rule, "cityId")}</td><td className="px-5 py-4">{getRuleLabel(rule, "serviceId")}</td><td className="px-5 py-4 text-right font-semibold text-emerald-600">${rule.requesterPrice}</td><td className="px-5 py-4 text-right font-semibold text-indigo-600">${rule.providerPrice}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
