/**
 * Pricing.tsx
 *
 * Pricing Management page.
 *
 * Flow:
 *  - User selects a State, then a City (filtered by the chosen state), then a Service.
 *  - Once all three are selected, the page checks whether a pricing rule already
 *    exists for that combination:
 *      - If it exists  -> prices are auto-filled and an "Update Pricing" button is shown.
 *      - If it doesn't -> inputs are empty and an "Add Pricing" button is shown.
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
  // Render
  // ---------------------------------------------------------------------
  if (isLoadingReferenceData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600" />
          <p className="text-sm text-slate-500">Loading pricing data…</p>
        </div>
      </div>
    );
  }

  if (referenceDataError) {
    return (
      <div className="mx-auto mt-10 max-w-lg rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-medium text-red-700">{referenceDataError}</p>
        <button
          type="button"
          onClick={loadReferenceData}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Pricing Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Select a state, city, and service to view or set pricing.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        noValidate
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* State */}
          <div>
            <label htmlFor="state" className="mb-1 block text-sm font-medium text-slate-700">
              State
            </label>
            <select
              id="state"
              value={selectedStateId}
              onChange={handleStateChange}
              className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 ${
                errors.state ? 'border-red-400' : 'border-slate-300'
              }`}
            >
              <option value="">Select state</option>
              {states.map((state) => (
                <option key={state._id} value={state._id}>
                  {state.name}
                </option>
              ))}
            </select>
            {errors.state && <p className="mt-1 text-xs text-red-600">{errors.state}</p>}
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="mb-1 block text-sm font-medium text-slate-700">
              City
            </label>
            <select
              id="city"
              value={selectedCityId}
              onChange={handleCityChange}
              disabled={!selectedStateId}
              className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
                errors.city ? 'border-red-400' : 'border-slate-300'
              }`}
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
            {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
          </div>

          {/* Service */}
          <div className="sm:col-span-2">
            <label htmlFor="service" className="mb-1 block text-sm font-medium text-slate-700">
              Service
            </label>
            <select
              id="service"
              value={selectedServiceId}
              onChange={handleServiceChange}
              className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 ${
                errors.service ? 'border-red-400' : 'border-slate-300'
              }`}
            >
              <option value="">Select service</option>
              {services.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.name}
                </option>
              ))}
            </select>
            {errors.service && <p className="mt-1 text-xs text-red-600">{errors.service}</p>}
          </div>

          {/* Requester Price */}
          <div>
            <label
              htmlFor="requesterPrice"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Requester Price
            </label>
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
              className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
                errors.requesterPrice ? 'border-red-400' : 'border-slate-300'
              }`}
            />
            {errors.requesterPrice && (
              <p className="mt-1 text-xs text-red-600">{errors.requesterPrice}</p>
            )}
          </div>

          {/* Provider Price */}
          <div>
            <label
              htmlFor="providerPrice"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Provider Price
            </label>
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
              className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
                errors.providerPrice ? 'border-red-400' : 'border-slate-300'
              }`}
            />
            {errors.providerPrice && (
              <p className="mt-1 text-xs text-red-600">{errors.providerPrice}</p>
            )}
          </div>
        </div>

        {canEditPricing && (
          <p className="mt-4 text-xs text-slate-500">
            {isEditMode
              ? 'Pricing already exists for this combination — update it below.'
              : 'No pricing found for this combination — add it below.'}
          </p>
        )}

        {statusMessage && (
          <div
            className={`mt-4 rounded-md px-4 py-2 text-sm ${
              statusMessage.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={!canEditPricing || isSubmitting}
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {isEditMode ? 'Update Pricing' : 'Add Pricing'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Pricing;