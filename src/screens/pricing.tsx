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
  getCities,
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
  ServiceItem,
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

const Pricing: React.FC = () => {
  // =====================================================
  // Master Data
  // =====================================================

  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [categories, setCategories] =
  useState<ServiceCatalogItem[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);

  // =====================================================
  // Loading
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] =
    useState<StatusMessage | null>(null);

  // =====================================================
  // Selected Values
  // =====================================================

  const [selectedStateId, setSelectedStateId] =
    useState("");

  const [selectedCityId, setSelectedCityId] =
    useState("");

  const [selectedCategoryId, setSelectedCategoryId] =
    useState("");

  const [selectedServiceId, setSelectedServiceId] =
    useState("");

  // =====================================================
  // Pricing
  // =====================================================

  const [requesterPrice, setRequesterPrice] =
    useState("");

  const [providerPrice, setProviderPrice] =
    useState("");

  const [errors, setErrors] =
    useState<FormErrors>({});

  // =====================================================
  // Load Master Data
  // =====================================================

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        statesData,
        citiesData,
        categoriesData,
        pricingData,
      ] = await Promise.all([
        getStates(),
        getCities(),
        getServiceCatalog(),
        getPricingRules(),
      ]);

      setStates(statesData);
      setCities(citiesData);
     setCategories(
  categoriesData.map((cat) => ({
    _id: cat._id,
    categoryId: cat.categoryId,
    categoryName: cat.categoryName,
    sortOrder: cat.sortOrder,
    isActive: cat.isActive,
    services: cat.services || [],
  }))
);
      setPricingRules(pricingData);
console.log("States Data =", statesData);
console.log("Cities Data =", citiesData);
console.log("Categories Data =", categoriesData);
console.log("Pricing Data =", pricingData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load pricing."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);
  // =====================================================
// Filtered Cities
// =====================================================
const filteredCities = useMemo(() => {
  console.log("cities =", cities);
  console.log("isArray =", Array.isArray(cities));

  if (!Array.isArray(cities)) {
    return [];
  }

  return cities.filter((city) => {
    console.log(city);
    return getStateIdFromCity(city) === selectedStateId;
  });
}, [cities, selectedStateId]);

// =====================================================
// Selected Category
// =====================================================

const selectedCategory = useMemo(() => {
  return (
    categories.find(
      (category) => category._id === selectedCategoryId
    ) ?? null
  );
}, [categories, selectedCategoryId]);

// =====================================================
// Services of Selected Category
// =====================================================

const filteredServices: ServiceItem[] = useMemo(() => {
  return selectedCategory?.services ?? [];
}, [selectedCategory]);

// =====================================================
// Load Existing Pricing
// =====================================================

const loadExistingPricing = useCallback(
  (rules = pricingRules) => {
    // NOTE: `item.categoryId` / `item.serviceId` on a PricingRule are plain
    // business code strings (e.g. "S1" / "S1A"), not Mongo `_id`s — so we
    // resolve the selected category/service to their business codes first,
    // the same way handleSubmit does for the update payload.
    const resolvedCategoryId = selectedCategory?.categoryId;

    const resolvedServiceId = filteredServices.find(
      (service) => service._id === selectedServiceId
    )?.servId;

    // Narrow down to rules for the selected state (and city, if chosen).
    let candidates = rules.filter(
      (item) => item.stateId?._id === selectedStateId
    );

    if (selectedCityId) {
      candidates = candidates.filter(
        (item) => item.cityId?._id === selectedCityId
      );
    }

    if (selectedServiceId && resolvedServiceId) {
      // Most specific level: exact service match.
      candidates = candidates.filter(
        (item) => item.serviceId === resolvedServiceId
      );
    } else if (selectedCategoryId && resolvedCategoryId) {
      candidates = candidates.filter(
        (item) => item.categoryId === resolvedCategoryId
      );
    }

    // When only a broader level is selected (state, city, or category),
    // `candidates` can contain many rows spanning every city/category/
    // service under it. The price that was actually set *at that broader
    // level* is whichever price the majority of those rows share — any
    // individual city/category/service that was later overridden with a
    // different price will just be a minority within the group, so it's
    // correctly ignored here instead of leaking into the broader view.
    let rule: PricingRule | undefined;

    if (candidates.length <= 1) {
      rule = candidates[0];
    } else {
      const counts = new Map<
        string,
        { rule: PricingRule; count: number }
      >();

      candidates.forEach((item) => {
        const key = `${item.requesterPrice}_${item.providerPrice}`;
        const existing = counts.get(key);

        if (existing) {
          existing.count += 1;
        } else {
          counts.set(key, { rule: item, count: 1 });
        }
      });

      let best: { rule: PricingRule; count: number } | undefined;

      counts.forEach((entry) => {
        if (!best || entry.count > best.count) {
          best = entry;
        }
      });

      rule = best?.rule;
    }

    setRequesterPrice(
      rule ? String(rule.requesterPrice) : ""
    );

    setProviderPrice(
      rule ? String(rule.providerPrice) : ""
    );
  },
  [
    pricingRules,
    filteredServices,
    selectedCategory,
    selectedStateId,
    selectedCityId,
    selectedCategoryId,
    selectedServiceId,
  ]
);

// =====================================================
// Auto Load Pricing
// =====================================================

useEffect(() => {
  loadExistingPricing();
}, [loadExistingPricing]);

// =====================================================
// Pricing Level
// =====================================================

const pricingLevel =
  !selectedCityId
    ? "State"
    : !selectedCategoryId
    ? "City"
    : !selectedServiceId
    ? "Category"
    : "Service";

    // =====================================================
// Clear Messages
// =====================================================

const clearMessages = () => {
  setErrors({});
  setStatus(null);
};

// =====================================================
// State Change
// =====================================================

const handleStateChange = (
  event: React.ChangeEvent<HTMLSelectElement>
) => {
  setSelectedStateId(event.target.value);

  setSelectedCityId("");
  setSelectedCategoryId("");
  setSelectedServiceId("");

  clearMessages();
};

// =====================================================
// City Change
// =====================================================

const handleCityChange = (
  event: React.ChangeEvent<HTMLSelectElement>
) => {
  setSelectedCityId(event.target.value);

  setSelectedCategoryId("");
  setSelectedServiceId("");

  clearMessages();
};

// =====================================================
// Category Change
// =====================================================

const handleCategoryChange = (
  event: React.ChangeEvent<HTMLSelectElement>
) => {
  setSelectedCategoryId(event.target.value);

  // Reset Service
  setSelectedServiceId("");

  clearMessages();
};

// =====================================================
// Service Change
// =====================================================

const handleServiceChange = (
  event: React.ChangeEvent<HTMLSelectElement>
) => {
  setSelectedServiceId(event.target.value);

  clearMessages();
};

// =====================================================
// Submit
// =====================================================

const handleSubmit = async (
  event: React.FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

  const nextErrors: FormErrors = {};

  const requester = Number(requesterPrice);
  const provider = Number(providerPrice);

  if (!selectedStateId) {
    nextErrors.state = "Please select a state.";
  }

  if (
    requesterPrice === "" ||
    !Number.isFinite(requester) ||
    requester < 0
  ) {
    nextErrors.requesterPrice =
      "Enter a valid requester price.";
  }

  if (
    providerPrice === "" ||
    !Number.isFinite(provider) ||
    provider < 0
  ) {
    nextErrors.providerPrice =
      "Enter a valid provider price.";
  }

  setErrors(nextErrors);
  setStatus(null);

  if (Object.keys(nextErrors).length) {
    return;
  }

  setSaving(true);

  try {
    // NOTE: selectedCategoryId / selectedServiceId hold Mongo `_id` values
    // (used for local lookups/rendering), but the backend expects the
    // business-level `categoryId` / `servId` fields. Resolve them here
    // before building the payload, otherwise the API returns
    // "Category not found".
    const resolvedCategoryId = selectedCategory?.categoryId;

    const resolvedServiceId = filteredServices.find(
      (service) => service._id === selectedServiceId
    )?.servId;

    const payload = buildPricingPayload({
      stateId: selectedStateId,
      cityId: selectedCityId || undefined,
      categoryId: selectedCategoryId ? resolvedCategoryId : undefined,
      serviceId: selectedServiceId ? resolvedServiceId : undefined,
      requesterPrice: requester,
      providerPrice: provider,
    });

    const response = await updatePricing(payload);

    setStatus({
      type: "success",
      text:
        response.message ||
        "Pricing updated successfully.",
    });

    const updatedRules = await getPricingRules();

    setPricingRules(updatedRules);

    loadExistingPricing(updatedRules);
  } catch (err) {
    setStatus({
      type: "error",
      text:
        err instanceof Error
          ? err.message
          : "Unable to update pricing.",
    });
  } finally {
    setSaving(false);
  }
};

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
         {/* ===================================================== */}
{/* Location Details */}
{/* ===================================================== */}

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
    {/* State */}

    <div>
      <label
        style={{
          fontWeight: 600,
          color: "#14344A",
          display: "block",
          marginBottom: 10,
        }}
      >
        State
      </label>

      <select
        value={selectedStateId}
        onChange={handleStateChange}
        style={{
          width: "100%",
          padding: 16,
          borderRadius: 14,
          border: "1px solid #ddd",
          fontSize: 15,
        }}
      >
        <option value="">Select State</option>

        {states.map((state) => (
          <option
            key={state._id}
            value={state._id}
          >
            {state.name}
          </option>
        ))}
      </select>

      {errors.state && (
        <span
          style={{
            color: "red",
            fontSize: 13,
          }}
        >
          {errors.state}
        </span>
      )}
    </div>

    {/* City */}

    <div>
      <label
        style={{
          fontWeight: 600,
          color: "#14344A",
          display: "block",
          marginBottom: 10,
        }}
      >
        City
      </label>

      <select
        value={selectedCityId}
        onChange={handleCityChange}
        disabled={!selectedStateId}
        style={{
          width: "100%",
          padding: 16,
          borderRadius: 14,
          border: "1px solid #ddd",
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

{/* ===================================================== */}
{/* Service Details */}
{/* ===================================================== */}

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

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 25,
    }}
  >
    {/* Category */}

    <div>
      <label
        style={{
          fontWeight: 600,
          color: "#14344A",
          display: "block",
          marginBottom: 10,
        }}
      >
        Service Category
      </label>

      <select
        value={selectedCategoryId}
        onChange={handleCategoryChange}
        disabled={!selectedCityId}
        style={{
          width: "100%",
          padding: 16,
          borderRadius: 14,
          border: "1px solid #ddd",
          fontSize: 15,
        }}
      >
        <option value="">
          Select Category
        </option>

        {categories.map((category) => (
          <option
            key={category._id}
            value={category._id}
          >
            {category.categoryName}
          </option>
        ))}
      </select>
    </div>

    {/* Service */}

    <div>
      <label
        style={{
          fontWeight: 600,
          color: "#14344A",
          display: "block",
          marginBottom: 10,
        }}
      >
        Service
      </label>

      <select
        value={selectedServiceId}
        onChange={handleServiceChange}
        disabled={!selectedCategoryId}
        style={{
          width: "100%",
          padding: 16,
          borderRadius: 14,
          border: "1px solid #ddd",
          fontSize: 15,
        }}
      >
        <option value="">
          Select Service
        </option>

        {filteredServices.map((service) => (
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



       {/* ===================================================== */}
{/* Pricing Details */}
{/* ===================================================== */}

<section>
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

    {/* Current Level */}

    <div
      style={{
        marginBottom: 25,
        padding: 15,
        borderRadius: 12,
        background: "#F5F8FC",
        color: "#14344A",
        fontWeight: 600,
      }}
    >
      Current Pricing Level : <strong>{pricingLevel}</strong>
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 25,
      }}
    >
      {/* Requester */}

      <div>
        <label
          style={{
            display: "block",
            fontWeight: 600,
            color: "#14344A",
            marginBottom: 10,
          }}
        >
          Requester Price
        </label>

        <div
          style={{
            position: "relative",
          }}
        >
          <DollarSign
            style={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              width: 18,
              height: 18,
              color: "#14344A",
            }}
          />

          <input
            type="number"
            min="0"
            step="0.01"
            value={requesterPrice}
            onChange={(e) =>
              setRequesterPrice(e.target.value)
            }
            placeholder="Requester Price"
            style={{
              width: "100%",
              padding: "16px 16px 16px 48px",
              borderRadius: 14,
              border: "1px solid #ddd",
              fontSize: 15,
              boxSizing: "border-box",
            }}
          />
        </div>

        {errors.requesterPrice && (
          <span
            style={{
              color: "red",
              fontSize: 13,
            }}
          >
            {errors.requesterPrice}
          </span>
        )}
      </div>

      {/* Provider */}

      <div>
        <label
          style={{
            display: "block",
            fontWeight: 600,
            color: "#14344A",
            marginBottom: 10,
          }}
        >
          Provider Price
        </label>

        <div
          style={{
            position: "relative",
          }}
        >
          <DollarSign
            style={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              width: 18,
              height: 18,
              color: "#14344A",
            }}
          />

          <input
            type="number"
            min="0"
            step="0.01"
            value={providerPrice}
            onChange={(e) =>
              setProviderPrice(e.target.value)
            }
            placeholder="Provider Price"
            style={{
              width: "100%",
              padding: "16px 16px 16px 48px",
              borderRadius: 14,
              border: "1px solid #ddd",
              fontSize: 15,
              boxSizing: "border-box",
            }}
          />
        </div>

        {errors.providerPrice && (
          <span
            style={{
              color: "red",
              fontSize: 13,
            }}
          >
            {errors.providerPrice}
          </span>
        )}
      </div>
    </div>

    {/* Status */}

    {status && (
      <div
        style={{
          marginTop: 25,
          padding: 16,
          borderRadius: 12,
          background:
            status.type === "success"
              ? "#ECFDF3"
              : "#FEF2F2",
          color:
            status.type === "success"
              ? "#067647"
              : "#B42318",
          fontWeight: 500,
        }}
      >
        {status.text}
      </div>
    )}

    {/* Button */}

    <div
      style={{
        marginTop: 35,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <button
        type="submit"
        disabled={saving}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          border: "none",
          padding: "14px 28px",
          borderRadius: 14,
          cursor: "pointer",
          background:
            "linear-gradient(to right,#FFFF6D,#8FDAFA)",
          color: "#14344A",
          fontWeight: 700,
          fontSize: 15,
          boxShadow:
            "0 8px 20px rgba(0,0,0,.08)",
        }}
      >
        {saving ? (
          <>
            <Loader2
              className="animate-spin"
              size={18}
            />
            Updating...
          </>
        ) : (
          <>
            <Save size={18} />
            Update Pricing
          </>
        )}
      </button>
    </div>
  </div>
</section>

</form>

</div>
);
};

export default Pricing;