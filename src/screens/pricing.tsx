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
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  ShieldCheck,
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
  getParentServices,
  getChildServices,
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
 const [selectedParentServiceId, setSelectedParentServiceId] =
useState<string>('');

const [selectedServiceId, setSelectedServiceId] =
useState<string>('');

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

  const parentServices = useMemo(
  () =>
    getParentServices(services),
  [services]
);


const childServices = useMemo(
  () =>
    getChildServices(
      services,
      selectedParentServiceId
    ),
  [
    services,
    selectedParentServiceId
  ]
);

const existingRule = useMemo(() => {
  if (!selectedStateId || !selectedCityId || !selectedServiceId) {
    return undefined;
  }

  return findMatchingRule(
    pricingRules,
    selectedStateId,
    selectedCityId,
    selectedServiceId
  );
}, [
  pricingRules,
  selectedStateId,
  selectedCityId,
  selectedServiceId,
]);

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
  const selectedParentServiceName = useMemo(
  () =>
    services.find(
      (s) => s._id === selectedParentServiceId
    )?.name,
  [
    services,
    selectedParentServiceId
  ]
);

  // ---------------------------------------------------------------------
  // Auto-fill prices when the matching rule (or selection) changes
  // ---------------------------------------------------------------------
 useEffect(() => {
  if (existingRule) {
    setRequesterPrice(String(existingRule.requesterPrice));
    setProviderPrice(String(existingRule.providerPrice));
  } else {
    setRequesterPrice("");
    setProviderPrice("");
  }
}, [existingRule]);

  // ---------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------
const handleStateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {

  const value = event.target.value;

  setSelectedStateId(value);

  setSelectedCityId('');

  setSelectedParentServiceId('');

  setSelectedServiceId('');

};

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCityId(event.target.value);
    setErrors((prev) => ({ ...prev, city: undefined }));
  };

  const handleParentServiceChange = (
 event: React.ChangeEvent<HTMLSelectElement>
) => {

 const value = event.target.value;

 setSelectedParentServiceId(value);

 setSelectedServiceId('');

 setErrors((prev)=>({
   ...prev,
   service: undefined
 }));

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
  // Shared field classes — premium enterprise styling
  // ---------------------------------------------------------------------
  const selectClasses = (hasError?: string, disabled?: boolean) =>
    `peer w-full appearance-none rounded-xl border bg-white py-3 pl-11 pr-9 text-[0.925rem] font-medium text-slate-800 shadow-sm outline-none
     transition-all duration-200 ease-out
     hover:border-slate-300 hover:shadow-md
     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10
     disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:shadow-none disabled:hover:shadow-none
     ${hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200'}`;

  const inputClasses = (hasError?: string, disabled?: boolean) =>
    `peer w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-[0.95rem] font-semibold tabular-nums text-slate-900 shadow-sm outline-none
     transition-all duration-200 ease-out
     hover:border-slate-300 hover:shadow-md
     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10
     disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:shadow-none disabled:hover:shadow-none
     ${hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200'}`;

  // ---------------------------------------------------------------------
  // Selection trail steps — a live readout of the cascading state → city →
  // service dependency that already drives the form logic above.
  // ---------------------------------------------------------------------
  const trailSteps = [
    { label: 'State', value: selectedStateName, done: Boolean(selectedStateId), icon: MapPin },
    { label: 'City', value: selectedCityName, done: Boolean(selectedCityId), icon: Building2 },
    { label: 'Service', value: selectedServiceName, done: Boolean(selectedServiceId), icon: Wrench },
  ];

  // ---------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------
  if (isLoadingReferenceData) {
    return (
      <div className="min-h-screen bg-slate-50 lg:pl-72">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-slate-200">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
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
        <div className="mx-auto mt-16 max-w-lg rounded-3xl border border-red-100 bg-white p-10 text-center shadow-xl shadow-slate-200/60">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
          <p className="text-base font-semibold text-slate-800">{referenceDataError}</p>
          <p className="mt-1 text-sm text-slate-500">Reference data couldn&apos;t be reached.</p>
          <button
            type="button"
            onClick={loadReferenceData}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg active:translate-y-0"
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
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
   

   
{/* Header */}
<div className="mb-8">
  <h1 className="text-5xl font-extrabold tracking-tight text-[#163A5F]">
    Pricing Management
  </h1>

  <p className="mt-2 text-lg text-slate-500">
    Manage pricing for States, Cities & Services
  </p>
</div>

       <div className="mb-8 grid gap-6 md:grid-cols-3">

  {/* States */}
  <div className="rounded-3xl bg-white p-7 shadow-sm">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-100">
          <MapPin className="h-8 w-8 text-[#163A5F]" />
      </div>

      <p className="text-xl text-slate-500">
          Selected State
      </p>

      <h2 className="mt-3 text-5xl font-bold text-[#163A5F]">
          {selectedStateName || "--"}
      </h2>
  </div>

  {/* City */}
  <div className="rounded-3xl bg-white p-7 shadow-sm">

      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100">
          <Building2 className="h-8 w-8 text-[#163A5F]" />
      </div>

      <p className="text-xl text-slate-500">
          Selected City
      </p>

      <h2 className="mt-3 text-5xl font-bold text-[#163A5F]">
          {selectedCityName || "--"}
      </h2>

  </div>

  {/* Service */}
  <div className="rounded-3xl bg-white p-7 shadow-sm">

      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200">
          <Wrench className="h-8 w-8 text-[#163A5F]" />
      </div>

      <p className="text-xl text-slate-500">
          Selected Service
      </p>

      <h2 className="mt-3 text-4xl font-bold text-[#163A5F] break-words">

  {
    selectedServiceName
      ? `${selectedParentServiceName} → ${selectedServiceName}`
      : "--"
  }

</h2>

  </div>

</div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-sm sm:p-9"
          noValidate
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* State */}
<div className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

  <label
    htmlFor="state"
    className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700"
  >
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
      <MapPin className="h-5 w-5 text-blue-600" />
    </span>

    Select State
  </label>


  <div className="relative">

    <select
      id="state"
      value={selectedStateId}
      onChange={handleStateChange}
      className={`
        w-full appearance-none rounded-xl border 
        bg-white px-4 py-3.5 pr-10
        text-sm font-semibold text-slate-800
        shadow-inner outline-none
        transition-all duration-300
        hover:border-blue-300
        focus:border-blue-500
        focus:ring-4 focus:ring-blue-500/10
        ${errors.state 
          ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" 
          : "border-slate-200"
        }
      `}
    >

      <option value="">
        Select your state
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


    <ChevronDown
      className="
        pointer-events-none 
        absolute right-4 top-1/2 
        h-5 w-5 
        -translate-y-1/2
        text-slate-400
      "
    />

  </div>


  {errors.state && (
    <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2">

      <AlertCircle className="h-4 w-4 text-red-500" />

      <p className="text-xs font-semibold text-red-600">
        {errors.state}
      </p>

    </div>
  )}

</div>

         {/* City */}
<div className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

  <label
    htmlFor="city"
    className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700"
  >
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
      <Building2 className="h-5 w-5 text-emerald-600" />
    </span>

    Select City
  </label>


  <div className="relative">

    <select
      id="city"
      value={selectedCityId}
      onChange={handleCityChange}
      disabled={!selectedStateId}
      className={`
        w-full appearance-none rounded-xl border
        bg-white px-4 py-3.5 pr-10
        text-sm font-semibold text-slate-800
        shadow-inner outline-none
        transition-all duration-300

        hover:border-emerald-300

        focus:border-emerald-500
        focus:ring-4 focus:ring-emerald-500/10

        disabled:cursor-not-allowed
        disabled:bg-slate-100
        disabled:text-slate-400

        ${
          errors.city
            ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
            : "border-slate-200"
        }
      `}
    >

      <option value="">
        {
          selectedStateId
            ? "Select your city"
            : "Select state first"
        }
      </option>


      {citiesForSelectedState.map((city) => (
        <option
          key={city._id}
          value={city._id}
        >
          {city.name}
        </option>
      ))}


    </select>


    <ChevronDown
      className="
        pointer-events-none
        absolute right-4 top-1/2
        h-5 w-5
        -translate-y-1/2
        text-slate-400
      "
    />


  </div>


  {errors.city && (
    <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2">

      <AlertCircle className="h-4 w-4 text-red-500" />

      <p className="text-xs font-semibold text-red-600">
        {errors.city}
      </p>

    </div>
  )}


</div>
{/* Service Selection */}
<div className="group sm:col-span-2 rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-indigo-50/40 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

  <label
    className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700"
  >

    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
      <Wrench className="h-5 w-5 text-indigo-600" />
    </span>

    Select Service

  </label>


  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">


    {/* Parent Service */}

    <div className="relative">

      <select
        value={selectedParentServiceId}
        onChange={handleParentServiceChange}

        className="
          w-full appearance-none rounded-xl border
          border-slate-200
          bg-white px-4 py-3.5 pr-12
          text-sm font-semibold text-slate-800
          shadow-inner outline-none
          hover:border-indigo-300
          focus:border-indigo-500
          focus:ring-4 focus:ring-indigo-500/10
        "
      >

        <option value="">
          Select Main Service
        </option>


        {parentServices.map((service)=>(

          <option
            key={service._id}
            value={service._id}
          >
            {service.name}
          </option>

        ))}


      </select>


      <ChevronDown
        className="
        pointer-events-none
        absolute right-4 top-1/2
        h-5 w-5
        -translate-y-1/2
        text-slate-400
        "
      />

    </div>




    {/* Child Service */}

    <div className="relative">

      <select

        id="service"

        value={selectedServiceId}

        onChange={handleServiceChange}

        disabled={!selectedParentServiceId}

        className="
          w-full appearance-none rounded-xl border
          border-slate-200
          bg-white px-4 py-3.5 pr-12
          text-sm font-semibold text-slate-800
          shadow-inner outline-none

          disabled:bg-slate-100
          disabled:text-slate-400

          hover:border-indigo-300
          focus:border-indigo-500
          focus:ring-4 focus:ring-indigo-500/10
        "

      >

        <option value="">
          {
            selectedParentServiceId
            ? "Select Sub Service"
            : "Select Main Service First"
          }
        </option>



        {childServices.map((service)=>(

          <option
            key={service._id}
            value={service._id}
          >

            {service.name}

          </option>

        ))}



      </select>



      <ChevronDown
        className="
        pointer-events-none
        absolute right-4 top-1/2
        h-5 w-5
        -translate-y-1/2
        text-slate-400
        "
      />

    </div>


  </div>



  {errors.service && (

    <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2">

      <AlertCircle className="h-4 w-4 text-red-500"/>

      <p className="text-xs font-semibold text-red-600">
        {errors.service}
      </p>

    </div>

  )}


</div>
          </div>

         {/* Divider */}
<div className="my-10 flex items-center gap-4">

  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-slate-200" />


  <div className="flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-5 py-2 shadow-sm">

    <DollarSign className="h-4 w-4 text-indigo-600" />

    <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-700">
      Pricing Configuration
    </span>

  </div>


  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-200 to-slate-200" />

</div>
         {/* Price Cards */}
<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">


  {/* Requester Price */}
  <div
    className={`
      group relative overflow-hidden rounded-3xl border p-6
      transition-all duration-300

      ${
        canEditPricing
          ? "border-indigo-100 bg-gradient-to-br from-white via-white to-indigo-50/40 hover:-translate-y-1 hover:shadow-xl"
          : "border-slate-200 bg-slate-50"
      }
    `}
  >


    {/* Top Glow */}
    <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-indigo-100/40 blur-2xl" />


    <div className="relative">


      {/* Header */}
      <div className="mb-5 flex items-center justify-between">


        <div className="flex items-center gap-3">


          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100">

            <DollarSign className="h-6 w-6 text-indigo-600" />

          </div>


          <div>

            <label
              htmlFor="requesterPrice"
              className="block text-base font-extrabold text-slate-800"
            >
              Requester Price
            </label>


            <p className="text-xs font-medium text-slate-400">
              Amount paid by customer
            </p>


          </div>


        </div>



        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
          Customer
        </span>


      </div>



      {/* Input */}
      <div className="relative">


        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
          $
        </span>


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
          className={`
            w-full rounded-2xl border
            bg-white py-4 pl-10 pr-4

            text-lg font-bold text-slate-900

            outline-none transition-all duration-300

            focus:border-indigo-500
            focus:ring-4 focus:ring-indigo-500/10

            disabled:cursor-not-allowed
            disabled:bg-slate-100

            ${
              errors.requesterPrice
                ? "border-red-400"
                : "border-slate-200"
            }
          `}
        />


      </div>



      {errors.requesterPrice && (

        <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2">

          <AlertCircle className="h-4 w-4 text-red-500" />

          <p className="text-xs font-semibold text-red-600">
            {errors.requesterPrice}
          </p>

        </div>

      )}


    </div>


  </div>





  {/* Provider Price */}
  <div
    className={`
      group relative overflow-hidden rounded-3xl border p-6
      transition-all duration-300

      ${
        canEditPricing
          ? "border-emerald-100 bg-gradient-to-br from-white via-white to-emerald-50/40 hover:-translate-y-1 hover:shadow-xl"
          : "border-slate-200 bg-slate-50"
      }
    `}
  >


    {/* Top Glow */}
    <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-emerald-100/40 blur-2xl" />



    <div className="relative">


      {/* Header */}
      <div className="mb-5 flex items-center justify-between">


        <div className="flex items-center gap-3">


          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">

            <DollarSign className="h-6 w-6 text-emerald-600" />

          </div>


          <div>

            <label
              htmlFor="providerPrice"
              className="block text-base font-extrabold text-slate-800"
            >
              Provider Price
            </label>


            <p className="text-xs font-medium text-slate-400">
              Amount earned by provider
            </p>


          </div>


        </div>



        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
          Provider
        </span>


      </div>



      {/* Input */}
      <div className="relative">


        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
          $
        </span>


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
          className={`
            w-full rounded-2xl border
            bg-white py-4 pl-10 pr-4

            text-lg font-bold text-slate-900

            outline-none transition-all duration-300

            focus:border-emerald-500
            focus:ring-4 focus:ring-emerald-500/10

            disabled:cursor-not-allowed
            disabled:bg-slate-100

            ${
              errors.providerPrice
                ? "border-red-400"
                : "border-slate-200"
            }
          `}
        />


      </div>



      {errors.providerPrice && (

        <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2">

          <AlertCircle className="h-4 w-4 text-red-500" />

          <p className="text-xs font-semibold text-red-600">
            {errors.providerPrice}
          </p>

        </div>

      )}



    </div>


  </div>


</div>

       {/* Status: Existing vs New Pricing */}
{canEditPricing && (
  <div
    className={`
      mt-8 overflow-hidden rounded-3xl border p-5 shadow-sm
      transition-all duration-300

      ${
        isEditMode
          ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-white"
          : "border-amber-200 bg-gradient-to-r from-amber-50 to-white"
      }
    `}
  >

    <div className="flex items-center gap-4">


      {/* Icon */}
      <div
        className={`
          flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl

          ${
            isEditMode
              ? "bg-emerald-100 text-emerald-600"
              : "bg-amber-100 text-amber-600"
          }
        `}
      >

        {isEditMode ? (
          <CheckCircle2 className="h-6 w-6" />
        ) : (
          <Sparkles className="h-6 w-6" />
        )}

      </div>



      {/* Content */}
      <div>


        <p className="text-sm font-semibold text-slate-700">

          {isEditMode ? (
            <>
              Existing pricing found
            </>
          ) : (
            <>
              New pricing configuration
            </>
          )}

        </p>



        <p className="mt-1 text-sm text-slate-500">


          {isEditMode ? (
            <>
              Update pricing for{" "}
              <span className="font-bold text-slate-900">
                {selectedServiceName}
              </span>
              {" · "}
              <span className="font-bold text-slate-900">
                {selectedCityName}, {selectedStateName}
              </span>
            </>
          ) : (
            <>
              Add pricing for{" "}
              <span className="font-bold text-slate-900">
                {selectedServiceName}
              </span>
              {" · "}
              <span className="font-bold text-slate-900">
                {selectedCityName}, {selectedStateName}
              </span>
            </>
          )}

        </p>


      </div>


    </div>


  </div>
)}





{/* Submit Status */}
{statusMessage && (

  <div
    className={`
      mt-5 flex items-center gap-3 rounded-2xl px-5 py-4
      text-sm font-semibold shadow-sm

      ${
        statusMessage.type === "success"
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-red-50 text-red-700 ring-1 ring-red-200"
      }
    `}
  >

    {statusMessage.type === "success" ? (
      <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
    ) : (
      <AlertCircle className="h-5 w-5 flex-shrink-0" />
    )}


    <span>
      {statusMessage.text}
    </span>


  </div>

)}






{/* Submit Area */}
<div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">


  {/* Security Info */}
  <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3">

    <ShieldCheck className="h-5 w-5 text-emerald-600" />

    <span className="text-xs font-semibold text-slate-500">

      Pricing updates apply instantly

    </span>

  </div>





 {/* Button */}
<div className="flex w-full justify-center">

  <button
    type="submit"
    disabled={!canEditPricing || isSubmitting}
    className="
      group relative overflow-hidden

      flex h-14
      min-w-[260px]

      items-center justify-center

      rounded-2xl

      bg-gradient-to-r
      from-[#FFF45C]
      via-[#C9F3B4]
      to-[#7ED8F7]

      px-10

      text-base
      font-extrabold

      text-[#163A5F]

      shadow-lg
      shadow-slate-300/50

      transition-all
      duration-300

      hover:-translate-y-1
      hover:shadow-xl

      focus:outline-none
      focus:ring-4
      focus:ring-[#7ED8F7]/40


      disabled:pointer-events-none
      disabled:bg-slate-300
      disabled:from-slate-300
      disabled:via-slate-300
      disabled:to-slate-300
      disabled:text-slate-500
      disabled:shadow-none
    "
  >

    {/* Shine */}
    <span
      className="
        absolute inset-0
        -translate-x-full

        bg-gradient-to-r
        from-transparent
        via-white/40
        to-transparent

        transition-transform
        duration-700

        group-hover:translate-x-full
      "
    />


    <span className="relative flex items-center gap-3">


      {isSubmitting ? (

        <Loader2 className="h-5 w-5 animate-spin" />

      ) : isEditMode ? (

        <RefreshCw className="h-5 w-5" />

      ) : (

        <PlusCircle className="h-5 w-5" />

      )}


      <span>
        {
          isSubmitting
            ? "Saving..."
            : isEditMode
            ? "Update Pricing"
            : "Add Pricing"
        }
      </span>


    </span>


  </button>

</div>





</div>
        </form>
      </div>
    </div>
  );
};

export default Pricing;