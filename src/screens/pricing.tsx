

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  MapPin,
  Building2,
  Wrench,
  DollarSign,
  PlusCircle,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react';
import type {
  StateOption,
  CityOption,
  ServiceCatalogItem,
  PricingRule,
} from '../service/pricingService';

import {
  getStates,
  getCities,
  getServiceCatalog,
  getPricingRules,
  createPricingRule,
  updatePricingRule,
  findMatchingRule,
  getStateIdFromCity,
} from '../service/pricingService';

interface FormErrors {
  state?: string;
  city?: string;
  service?: string;
  requesterPrice?: string;
  providerPrice?: string;
}

interface StatusMessage {
  type: 'success' | 'error';
  text: string;
}

const Pricing: React.FC = () => {
  // ---------------------------------------------------------------------
  // Reference data
  // ---------------------------------------------------------------------
  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [services, setServices] = useState<ServiceCatalogItem[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);

  const [isLoadingReferenceData, setIsLoadingReferenceData] = useState<boolean>(true);
  const [referenceDataError, setReferenceDataError] = useState<string | null>(null);

  // ---------------------------------------------------------------------
  // Selection state
  // ---------------------------------------------------------------------
  const [selectedStateId, setSelectedStateId] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');

  // ---------------------------------------------------------------------
  // Form state
  // ---------------------------------------------------------------------
  const [requesterPrice, setRequesterPrice] = useState<string>('');
  const [providerPrice, setProviderPrice] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);

  // ---------------------------------------------------------------------
  // Load reference data (states, cities, services, existing pricing rules)
  // ---------------------------------------------------------------------
  const loadReferenceData = useCallback(async () => {
    setIsLoadingReferenceData(true);
    setReferenceDataError(null);
    try {
      const [statesData, citiesData, servicesData, rulesData] = await Promise.all([
        getStates(),
        getCities(),
        getServiceCatalog(),
        getPricingRules(),
      ]);
      setStates(statesData);
      setCities(citiesData);
      setServices(servicesData);
      setPricingRules(rulesData);
    } catch (err) {
      setReferenceDataError(
        err instanceof Error ? err.message : 'Failed to load pricing data. Please try again.'
      );
    } finally {
      setIsLoadingReferenceData(false);
    }
  }, []);

  useEffect(() => {
    loadReferenceData();
  }, [loadReferenceData]);

  // ---------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------
  const citiesForSelectedState = useMemo(
    () => cities.filter((city) => getStateIdFromCity(city) === selectedStateId),
    [cities, selectedStateId]
  );

  const existingRule = useMemo(() => {
    if (!selectedStateId || !selectedCityId || !selectedServiceId) return undefined;
    return findMatchingRule(pricingRules, selectedStateId, selectedCityId, selectedServiceId);
  }, [pricingRules, selectedStateId, selectedCityId, selectedServiceId]);

  const isEditMode = Boolean(existingRule);
  const canEditPricing = Boolean(selectedStateId && selectedCityId && selectedServiceId);

  const selectedStateName = useMemo(
    () => states.find((s) => s._id === selectedStateId)?.name,
    [states, selectedStateId]
  );
  const selectedCityName = useMemo(
    () => cities.find((c) => c._id === selectedCityId)?.name,
    [cities, selectedCityId]
  );
  const selectedServiceName = useMemo(
    () => services.find((s) => s._id === selectedServiceId)?.name,
    [services, selectedServiceId]
  );

  // ---------------------------------------------------------------------
  // Auto-fill prices when the matching rule (or selection) changes
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (existingRule) {
      setRequesterPrice(String(existingRule.requesterPrice));
      setProviderPrice(String(existingRule.providerPrice));
    } else {
      setRequesterPrice('');
      setProviderPrice('');
    }
    setErrors((prev) => ({ ...prev, requesterPrice: undefined, providerPrice: undefined }));
    setStatusMessage(null);
  }, [existingRule]);

  // ---------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------
  const handleStateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedStateId(value);
    setSelectedCityId('');
    setSelectedServiceId('');
    setErrors((prev) => ({ ...prev, state: undefined }));
  };

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCityId(event.target.value);
    setErrors((prev) => ({ ...prev, city: undefined }));
  };

  const handleServiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedServiceId(event.target.value);
    setErrors((prev) => ({ ...prev, service: undefined }));
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!selectedStateId) nextErrors.state = 'Select a state.';
    if (!selectedCityId) nextErrors.city = 'Select a city.';
    if (!selectedServiceId) nextErrors.service = 'Select a service.';

    const requesterValue = Number(requesterPrice);
    const providerValue = Number(providerPrice);

    if (!requesterPrice.trim()) {
      nextErrors.requesterPrice = 'Requester price is required.';
    } else if (Number.isNaN(requesterValue) || requesterValue < 0) {
      nextErrors.requesterPrice = 'Enter a valid, non-negative number.';
    }

    if (!providerPrice.trim()) {
      nextErrors.providerPrice = 'Provider price is required.';
    } else if (Number.isNaN(providerValue) || providerValue < 0) {
      nextErrors.providerPrice = 'Enter a valid, non-negative number.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatusMessage(null);

    if (!validate()) return;

    const payload = {
      stateId: selectedStateId,
      cityId: selectedCityId,
      serviceId: selectedServiceId,
      requesterPrice: Number(requesterPrice),
      providerPrice: Number(providerPrice),
    };

    setIsSubmitting(true);
    try {
      if (isEditMode && existingRule) {
        const updated = await updatePricingRule(existingRule._id, payload);
        setPricingRules((prev) =>
          prev.map((rule) => (rule._id === updated._id ? updated : rule))
        );
        setStatusMessage({ type: 'success', text: 'Pricing updated successfully.' });
      } else {
        const created = await createPricingRule(payload);
        setPricingRules((prev) => [...prev, created]);
        setStatusMessage({ type: 'success', text: 'Pricing added successfully.' });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Something went wrong while saving pricing. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------
  // Shared field classes
  // ---------------------------------------------------------------------
  const selectClasses = (hasError?: string, disabled?: boolean) =>
    `w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 shadow-sm transition
     focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500
     disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400
     ${hasError ? 'border-red-400' : 'border-slate-200'}`;

  const inputClasses = (hasError?: string, disabled?: boolean) =>
    `w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 shadow-sm transition
     focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500
     disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400
     ${hasError ? 'border-red-400' : 'border-slate-200'}`;

  // ---------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------
  if (isLoadingReferenceData) {
    return (
      <div className="min-h-screen bg-slate-50 lg:pl-72">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-9 w-9 animate-spin text-teal-600" />
            <p className="text-sm font-medium text-slate-500">Loading pricing data…</p>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // Error state
  // ---------------------------------------------------------------------
  if (referenceDataError) {
    return (
      <div className="min-h-screen bg-slate-50 lg:pl-72">
        <div className="mx-auto mt-16 max-w-lg rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
          <p className="font-semibold text-red-700">{referenceDataError}</p>
          <button
            type="button"
            onClick={loadReferenceData}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------
  return (
    <div style={{
        marginLeft: "260px",
        marginTop: "70px",
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "30px",
      }}>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-10">
        {/* Header banner — matches the app's yellow -> mint -> sky gradient */}
        <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-200 via-emerald-200 to-sky-200 px-6 py-8 shadow-sm sm:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900 text-yellow-300 shadow-md">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Pricing Management</h1>
              <p className="mt-1 text-sm text-slate-700">
                Select a state, city, and service to view or set pricing.
              </p>
            </div>
          </div>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          noValidate
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* State */}
            <div>
              <label htmlFor="state" className="mb-1.5 block text-sm font-semibold text-slate-700">
                State
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  id="state"
                  value={selectedStateId}
                  onChange={handleStateChange}
                  className={selectClasses(errors.state)}
                >
                  <option value="">Select state</option>
                  {states.map((state) => (
                    <option key={state._id} value={state._id}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.state && (
                <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" /> {errors.state}
                </p>
              )}
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="mb-1.5 block text-sm font-semibold text-slate-700">
                City
              </label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  id="city"
                  value={selectedCityId}
                  onChange={handleCityChange}
                  disabled={!selectedStateId}
                  className={selectClasses(errors.city, !selectedStateId)}
                >
                  <option value="">
                    {selectedStateId ? 'Select city' : 'Select a state first'}
                  </option>
                  {citiesForSelectedState.map((city) => (
                    <option key={city._id} value={city._id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.city && (
                <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" /> {errors.city}
                </p>
              )}
            </div>

            {/* Service */}
            <div className="sm:col-span-2">
              <label htmlFor="service" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Service
              </label>
              <div className="relative">
                <Wrench className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  id="service"
                  value={selectedServiceId}
                  onChange={handleServiceChange}
                  className={selectClasses(errors.service)}
                >
                  <option value="">Select service</option>
                  {services.map((service) => (
                    <option key={service._id} value={service._id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.service && (
                <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" /> {errors.service}
                </p>
              )}
            </div>

            {/* Requester Price */}
            <div>
              <label
                htmlFor="requesterPrice"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Requester Price
              </label>
              <div className="relative">
                <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="requesterPrice"
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={requesterPrice}
                  onChange={(e) => setRequesterPrice(e.target.value)}
                  disabled={!canEditPricing}
                  placeholder="0.00"
                  className={inputClasses(errors.requesterPrice, !canEditPricing)}
                />
              </div>
              {errors.requesterPrice && (
                <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" /> {errors.requesterPrice}
                </p>
              )}
            </div>

            {/* Provider Price */}
            <div>
              <label
                htmlFor="providerPrice"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Provider Price
              </label>
              <div className="relative">
                <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="providerPrice"
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={providerPrice}
                  onChange={(e) => setProviderPrice(e.target.value)}
                  disabled={!canEditPricing}
                  placeholder="0.00"
                  className={inputClasses(errors.providerPrice, !canEditPricing)}
                />
              </div>
              {errors.providerPrice && (
                <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" /> {errors.providerPrice}
                </p>
              )}
            </div>
          </div>

          {/* Status: existing vs new combination */}
          {canEditPricing && (
            <div
              className={`mt-5 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
                isEditMode
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              {isEditMode ? (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              ) : (
                <Sparkles className="h-4 w-4 flex-shrink-0" />
              )}
              <span>
                {isEditMode ? (
                  <>
                    Existing pricing found for{' '}
                    <strong>
                      {selectedServiceName} · {selectedCityName}, {selectedStateName}
                    </strong>{' '}
                    — update it below.
                  </>
                ) : (
                  <>
                    No pricing yet for{' '}
                    <strong>
                      {selectedServiceName} · {selectedCityName}, {selectedStateName}
                    </strong>{' '}
                    — add it below.
                  </>
                )}
              </span>
            </div>
          )}

          {/* Submit status */}
          {statusMessage && (
            <div
              className={`mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
              )}
              {statusMessage.text}
            </div>
          )}

          {/* Submit button */}
          <div className="mt-7 flex justify-end">
            <button
              type="submit"
              disabled={!canEditPricing || isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-yellow-300 shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEditMode ? (
                <RefreshCw className="h-4 w-4" />
              ) : (
                <PlusCircle className="h-4 w-4" />
              )}
              {isEditMode ? 'Update Pricing' : 'Add Pricing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Pricing;