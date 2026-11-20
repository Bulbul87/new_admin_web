
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   ShieldCheck,
//   ShieldAlert,
//   MapPin,
//   Search,
//   Save,
//   RotateCcw,
//   RefreshCw,
//   CheckCircle2,
//   Settings2,
//   Layers3,
// } from "lucide-react";
// import { toast } from "react-toastify";
// import {
//   getRegulationStates,
//   getStateRegulations,
//   saveStateRegulations,
// type  RegulationState,
//  type RegulationCategory,
//  type RegulationLicense,
// } from "../service/setregulationService";
// import { FaArrowLeft } from "react-icons/fa6";
// import { useNavigate } from "react-router-dom";
// import "./regulation.css";

// type RegulationType = "regulated" | "non-regulated";

// const Setregulatedcategories: React.FC = () => {
//     const navigate = useNavigate();
//   const [states, setStates] = useState<RegulationState[]>([]);
//   const [selectedState, setSelectedState] = useState("");
//   const [categories, setCategories] = useState<RegulationCategory[]>([]);
//   const [settings, setSettings] = useState<Record<string, RegulationType | null>>(
//     {}
//   );

//   const [search, setSearch] = useState("");
//   const [loadingStates, setLoadingStates] = useState(false);
//   const [loadingCategories, setLoadingCategories] = useState(false);
//   const [saving, setSaving] = useState(false);

//   const [savedSettings, setSavedSettings] = useState<
//     Record<string, RegulationType | null>
//   >({});

//   // ============================================
//   // LOAD STATES
//   // ============================================
//   useEffect(() => {
//     loadStates();
//   }, []);

//   const loadStates = async () => {
//     try {
//       setLoadingStates(true);

//      const response = await getRegulationStates();

// const rawStates = Array.isArray(response)
//   ? response
//   : response?.states || response?.data?.states || [];

// const normalized = rawStates.map((state: any) => ({
//   _id: state._id || state.id,
//   name: state.name || state.state_name || state.stateName,
//   code: state.code || state.stateCode,
// }));

// setStates(normalized);

// if (normalized.length > 0) {
//   setSelectedState(normalized[0]._id);
// }
//     } catch (error: any) {
//       toast.error(error.message || "Failed to load states");
//     } finally {
//       setLoadingStates(false);
//     }
//   };

//   // ============================================
//   // LOAD STATE CATEGORIES + REGULATIONS
//   // ============================================
//   useEffect(() => {
//     if (!selectedState) return;

//     loadStateRegulations(selectedState);
//   }, [selectedState]);

//   const loadStateRegulations = async (stateId: string) => {
//     try {
//       setLoadingCategories(true);
//       setCategories([]);
//       setSettings({});
//       setSavedSettings({});
//       setSearch("");

//      const response = await getStateRegulations(stateId);

// // api.ts already unwraps response.data
// const categoryList = response?.categories || [];

// const normalized: RegulationCategory[] = categoryList.map(
//   (category: any) => ({
//     categoryId: category.categoryId,
//     categoryName: category.categoryName,
//     category: category.category || null,
//     sortOrder: category.sortOrder ?? 0,
//     regulationType: category.regulationType || null,
//     configured: Boolean(category.configured),
//   })
// );

// setCategories(normalized);

// const initialSettings: Record<string, RegulationType | null> = {};

// normalized.forEach((category) => {
//   initialSettings[category.categoryId] = category.regulationType;
// });

// setSettings(initialSettings);
// setSavedSettings(initialSettings);}
//       catch (error: any) {
//       toast.error(error.message || "Failed to load service categories");
//     } finally {
//       setLoadingCategories(false);
//     }
//   };

//   // ============================================
//   // SET REGULATION STATUS
//   // ============================================
//   const handleStatusChange = (
//     categoryId: string,
//     value: RegulationType
//   ) => {
//     setSettings((previous) => ({
//       ...previous,
//       [categoryId]: value,
//     }));
//   };

//   // ============================================
//   // STATS
//   // ============================================
//   const regulatedCount = Object.values(settings).filter(
//     (value) => value === "regulated"
//   ).length;

//   const nonRegulatedCount = Object.values(settings).filter(
//     (value) => value === "non-regulated"
//   ).length;

//   const unconfiguredCount = categories.filter(
//     (category) => !settings[category.categoryId]
//   ).length;

//   const hasChanges = useMemo(() => {
//     return categories.some(
//       (category) =>
//         settings[category.categoryId] !== savedSettings[category.categoryId]
//     );
//   }, [categories, settings, savedSettings]);

//   const filteredCategories = useMemo(() => {
//     return categories.filter((category) =>
//       category.categoryName.toLowerCase().includes(search.toLowerCase())
//     );
//   }, [categories, search]);

//   // ============================================
//   // RESET
//   // ============================================
//   const handleReset = () => {
//     setSettings({ ...savedSettings });
//     toast.info("Changes have been reset");
//   };

//   const handleSave = async () => {
//   if (!selectedState) {
//     toast.warning("Please select a state");
//     return;
//   }

//   const unconfigured = categories.filter(
//     (category) => !settings[category.categoryId]
//   );

//   if (unconfigured.length > 0) {
//     toast.warning("Please set regulation for all categories before saving");
//     return;
//   }

//   try {
//     setSaving(true);

//     const regulations = categories.map((category) => ({
//       categoryId: category.categoryId,
//       regulationType: settings[category.categoryId] as RegulationType,
     
//     }));

//     await saveStateRegulations(selectedState, regulations );

//     setSavedSettings({ ...settings });

//     toast.success("State regulation settings saved successfully!");
//   } catch (error: any) {
//     toast.error(error.message || "Failed to save settings");
//   } finally {
//     setSaving(false);
//   }
// };

//   const currentState = states.find((state) => state._id === selectedState);

//   return (
//     <div className="regulation-page"  style={{
//         marginLeft: "260px",
//         marginTop: "70px",
//         minHeight: "100vh",
//         background: "#F5F7FB",
//         padding: "30px",
//       }}>
//       {/* PAGE HEADER */}
//       <div className="regulation-header">
//         <div className="regulation-header-left">
//           <div className="regulation-header-icon">
//             <ShieldCheck size={26} />
//           </div>

//           <div>
//             <h1>Set Regulation Service</h1>
//             <p>
//               Configure regulated and non-regulated service categories for
//               each state.
//             </p>
//           </div>
//         </div>
// <div className="regulation-header-right">
//  <button
//           className="regulation-refresh-btn"
//           onClick={() => selectedState && loadStateRegulations(selectedState)}
//           disabled={loadingCategories || !selectedState}
//         >
//           <RefreshCw
//             size={16}
//             className={loadingCategories ? "regulation-spin" : ""}
//           />
//           Refresh
//         </button>
//          <button
//                           type="button"
//                           onClick={() => navigate("/admin-config")}
//                           style={{
//                               display: "inline-flex",
//                               alignItems: "center",
//                               justifyContent: "center",
//                               gap: 7,
//                               border: `1px solid #E3EAF2`,
//                               borderRadius: 10,
//                               padding: "10px 14px",
//                               background: "#FFFFFF",
//                               color: "#14344A",
//                               fontWeight: 600,
//                               fontSize: 13,
//                               cursor: "pointer",
//                           }}
//                       >
//                           <FaArrowLeft size={16} />
//                           Back
//                       </button>
// </div>
       
//       </div>

//       {/* STATE SELECTOR */}
//       <div className="regulation-state-card">
//         <div className="regulation-state-label">
//           <MapPin size={18} />
//           <span>Select State</span>
//         </div>

//         <div className="regulation-state-select-wrap">
//           <select
//             value={selectedState}
//             onChange={(e) => setSelectedState(e.target.value)}
//             disabled={loadingStates}
//           >
//             <option value="">
//               {loadingStates ? "Loading states..." : "Choose a state"}
//             </option>

//             {states.map((state) => (
//               <option key={state._id} value={state._id}>
//                 {state.name}
//                 {state.code ? ` (${state.code})` : ""}
//               </option>
//             ))}
//           </select>

//           <MapPin className="regulation-select-icon" size={18} />
//         </div>

//         {currentState && (
//           <div className="regulation-selected-state">
//             Currently configuring services for{" "}
//             <strong>{currentState.name}</strong>
//           </div>
//         )}
//       </div>

//       {/* STATS */}
//       <div className="regulation-stats-grid">
//         <div className="regulation-stat-card regulation-stat-total">
//           <div className="regulation-stat-icon">
//             <Layers3 size={20} />
//           </div>
//           <div className="regulation-stat-info">
//             <span>Total Categories</span>
//             <h2>{categories.length}</h2>
//           </div>
//         </div>

//         <div className="regulation-stat-card regulation-stat-regulated">
//           <div className="regulation-stat-icon">
//             <ShieldCheck size={20} />
//           </div>
//           <div className="regulation-stat-info">
//             <span>Regulated</span>
//             <h2>{regulatedCount}</h2>
//           </div>
//         </div>

//         <div className="regulation-stat-card regulation-stat-nonregulated">
//           <div className="regulation-stat-icon">
//             <ShieldAlert size={20} />
//           </div>
//           <div className="regulation-stat-info">
//             <span>Non-Regulated</span>
//             <h2>{nonRegulatedCount}</h2>
//           </div>
//         </div>

//         <div className="regulation-stat-card regulation-stat-pending">
//           <div className="regulation-stat-icon">
//             <Settings2Icon />
//           </div>
//           <div className="regulation-stat-info">
//             <span>Not Configured</span>
//             <h2>{unconfiguredCount}</h2>
//           </div>
//         </div>
//       </div>

//       {/* CATEGORY SECTION */}
//       <div className="regulation-content-card">
//         <div className="regulation-content-top">
//           <div>
//             <h2>Service Categories</h2>
//             <p>
//               Set regulation type separately for each category in the selected
//               state.
//             </p>
//           </div>

//           <div className="regulation-search-box">
//             <Search size={17} />
//             <input
//               type="text"
//               placeholder="Search categories..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>
//         </div>

//         {loadingCategories ? (
//           <div className="regulation-loading">
//             <RefreshCw size={24} className="regulation-spin" />
//             <span>Loading service categories...</span>
//           </div>
//         ) : !selectedState ? (
//           <div className="regulation-empty">
//             <MapPin size={30} />
//             <h3>Select a state</h3>
//             <p>Select a state above to manage its regulation settings.</p>
//           </div>
//         ) : filteredCategories.length === 0 ? (
//           <div className="regulation-empty">
//             <Layers3 size={30} />
//             <h3>No categories found</h3>
//             <p>There are no service categories matching your search.</p>
//           </div>
//         ) : (
//           <div className="regulation-category-list">
//             {filteredCategories.map((category, index) => {
//               const currentStatus = settings[category.categoryId];

//               return (
//                 <div
//                   className="regulation-category-row"
//                   key={category.categoryId}
//                 >
//                   <div className="regulation-category-left">
//                     <div className="regulation-category-number">
//                       {String(index + 1).padStart(2, "0")}
//                     </div>

//                     <div className="regulation-category-details">
//                       <h3>{category.categoryName}</h3>
//                       <span>
//                         {category.category || "Service Category"}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="regulation-category-right">
//                     <div className="regulation-status-toggle">
//                       <button
//                         className={`regulation-status-option regulated ${
//                           currentStatus === "regulated" ? "active" : ""
//                         }`}
//                         onClick={() =>
//                           handleStatusChange(category.categoryId, "regulated")
//                         }
//                       >
//                         <ShieldCheck size={15} />
//                         Regulated
//                       </button>

//                       <button
//                         className={`regulation-status-option non-regulated ${
//                           currentStatus === "non-regulated" ? "active" : ""
//                         }`}
//                         onClick={() =>
//                           handleStatusChange(category.categoryId, "non-regulated")
//                         }
//                       >
//                         <ShieldAlert size={15} />
//                         Non-Regulated
//                       </button>
//                     </div>

//                     {!currentStatus && (
//                       <span className="regulation-unconfigured-label">
//                         Not configured
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         {/* FOOTER ACTIONS */}
//         <div className="regulation-footer">
//           <div className="regulation-footer-info">
//             {hasChanges ? (
//               <span className="regulation-unsaved">
//                 <span className="regulation-unsaved-dot" />
//                 Unsaved changes
//               </span>
//             ) : (
//               <span className="regulation-saved">
//                 <CheckCircle2 size={15} />
//                 All changes saved
//               </span>
//             )}
//           </div>

//           <div className="regulation-footer-actions">
//             <button
//               className="regulation-reset-btn"
//               onClick={handleReset}
//               disabled={!hasChanges || saving}
//             >
//               <RotateCcw size={16} />
//               Reset
//             </button>

//             <button
//               className="regulation-save-btn"
//               onClick={handleSave}
//               disabled={!hasChanges || saving || loadingCategories}
//             >
//               {saving ? (
//                 <>
//                   <RefreshCw size={16} className="regulation-spin" />
//                   Saving...
//                 </>
//               ) : (
//                 <>
//                   <Save size={16} />
//                   Save Changes
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const Settings2Icon = () => <Settings2 size={20} />;

// export default Setregulatedcategories



import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getRegulationStates,
  getStateRegulations,
  getRegulationLicenses,
  saveStateRegulations,
  type RegulationState,
  type RegulationCategory,
  type RegulationLicense,
  type RegulationSaveItem,
} from "../service/setregulationService";

import { toast } from "react-toastify";
import {
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Layers3,
  Search,
  RefreshCw,
  RotateCcw,
  Save,
  CheckCircle2,
  Settings2,
  FileCheck,
  FileText,
  Check,
  X,
  BadgeCheck,
} from "lucide-react";

import { FaArrowLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import "./regulation.css";

type RegulationType = "regulated" | "non-regulated";

interface LicenseSetting {
  selected: boolean;
  isRequired: boolean;
}

const DEFAULT_LICENSE_SETTING: LicenseSetting = {
  selected: false,
  isRequired: false,
};

const Setregulatedcategories: React.FC = () => {
  const navigate = useNavigate();

  // ============================================
  // STATES
  // ============================================

  const [states, setStates] = useState<RegulationState[]>([]);
  const [selectedState, setSelectedState] = useState("");

  // ============================================
  // CATEGORY STATES
  // ============================================

  const [categories, setCategories] = useState<RegulationCategory[]>([]);

  const [settings, setSettings] = useState<
    Record<string, RegulationType | null>
  >({});

  const [savedSettings, setSavedSettings] = useState<
    Record<string, RegulationType | null>
  >({});

  // ============================================
  // LICENSE STATES
  // ============================================

  const [licenses, setLicenses] = useState<RegulationLicense[]>([]);

  const [licenseSettings, setLicenseSettings] = useState<
    Record<string, LicenseSetting>
  >({});

  const [savedLicenseSettings, setSavedLicenseSettings] = useState<
    Record<string, LicenseSetting>
  >({});

  // ============================================
  // UI STATES
  // ============================================

  const [search, setSearch] = useState("");
  const [licenseSearch, setLicenseSearch] = useState("");

  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingLicenses, setLoadingLicenses] = useState(false);
  const [saving, setSaving] = useState(false);

  const requestIdRef = useRef(0);

  // ============================================
  // RESPONSE HELPERS
  // ============================================

  const getResponseData = (response: any) => {
    return response?.data?.data ?? response?.data ?? response;
  };

  const getArray = (response: any): any[] => {
    const data = getResponseData(response);

    if (Array.isArray(data)) return data;

    if (Array.isArray(data?.licenses)) return data.licenses;
    if (Array.isArray(data?.states)) return data.states;
    if (Array.isArray(data?.data)) return data.data;

    return [];
  };

  // ============================================
  // LOAD STATES
  // ============================================

  const loadStates = useCallback(async () => {
    try {
      setLoadingStates(true);

      const response = await getRegulationStates();
      const rawStates = getArray(response);

      const normalized: RegulationState[] = rawStates
        .map((state: any) => ({
          _id: state._id || state.id,
          name: state.name || state.state_name || state.stateName,
          code: state.code || state.stateCode,
        }))
        .filter((state: RegulationState) => state._id && state.name);

      setStates(normalized);

      if (normalized.length > 0) {
        setSelectedState((previous) => previous || normalized[0]._id);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load states");
    } finally {
      setLoadingStates(false);
    }
  }, []);

  useEffect(() => {
    loadStates();
  }, [loadStates]);

  // ============================================
  // LOAD STATE CATEGORIES + LICENSE SETTINGS
  // ============================================

  const loadStateRegulations = useCallback(async (stateId: string) => {
    const requestId = ++requestIdRef.current;

    try {
      setLoadingCategories(true);
      setLoadingLicenses(true);

      setCategories([]);
      setSettings({});
      setSavedSettings({});

      setLicenses([]);
      setLicenseSettings({});
      setSavedLicenseSettings({});

      setSearch("");
      setLicenseSearch("");

      // Fetch category settings, license master and state license settings.
      const [regulationResponse, licenseResponse] = await Promise.all([
        getStateRegulations(stateId),
        getRegulationLicenses(),
      ]);

      if (requestId !== requestIdRef.current) return;

      const regulationData = getResponseData(regulationResponse);
      const rawCategories = regulationData?.categories || [];

      // ==========================================
      // NORMALIZE CATEGORIES
      // ==========================================

      const normalizedCategories: RegulationCategory[] =
        rawCategories.map((category: any) => ({
          categoryId: category.categoryId,
          categoryName: category.categoryName,
          category: category.category || null,
          sortOrder: category.sortOrder ?? 0,
          regulationType: category.regulationType || null,
          licenses: [],
          configured: Boolean(category.configured),
        }));

      const initialCategorySettings: Record<
        string,
        RegulationType | null
      > = {};

      normalizedCategories.forEach((category) => {
        initialCategorySettings[category.categoryId] =
          category.regulationType;
      });

      setCategories(normalizedCategories);
      setSettings(initialCategorySettings);
      setSavedSettings({ ...initialCategorySettings });

      // ==========================================
      // NORMALIZE LICENSE MASTER
      // ==========================================

      const rawLicenses = getArray(licenseResponse);

      const normalizedLicenses: RegulationLicense[] = rawLicenses
        .filter((license: any) => license.status !== false)
        .map((license: any) => ({
          _id: license._id || license.id,
          name: license.name,
          code: license.code,
          description: license.description || "",
          status: license.status !== false,
        }))
        .filter((license: RegulationLicense) => license._id);

      setLicenses(normalizedLicenses);

      // ==========================================
      // RESTORE STATE-WISE SAVED LICENSES
      // ==========================================

      // Expected GET response:
      // data.stateLicenses = [
      //   { licenseId: { _id, name, code }, isRequired: true }
      // ]

      const savedLicenseList =
        regulationData?.stateLicenses ||
        regulationData?.selectedLicenses ||
        [];

      const initialLicenseSettings: Record<string, LicenseSetting> = {};

      // Default: every license is unselected.
      normalizedLicenses.forEach((license) => {
        initialLicenseSettings[license._id] = {
          selected: false,
          isRequired: false,
        };
      });

      // Restore only the selected licenses of this state.
      savedLicenseList.forEach((item: any) => {
        const licenseId =
          typeof item.licenseId === "object"
            ? item.licenseId?._id
            : item.licenseId;

        if (!licenseId || !initialLicenseSettings[licenseId]) return;

        initialLicenseSettings[licenseId] = {
          selected: true,
          isRequired: Boolean(item.isRequired),
        };
      });

      // Also support GET responses where licenses contain selected flags.
      if (Array.isArray(regulationData?.licenses)) {
        regulationData.licenses.forEach((item: any) => {
          const licenseId = item._id || item.licenseId?._id;

          if (
            licenseId &&
            initialLicenseSettings[licenseId] &&
            item.selected
          ) {
            initialLicenseSettings[licenseId] = {
              selected: true,
              isRequired: Boolean(item.isRequired),
            };
          }
        });
      }

      setLicenseSettings(initialLicenseSettings);
      setSavedLicenseSettings(
        JSON.parse(JSON.stringify(initialLicenseSettings))
      );
    } catch (error: any) {
      if (requestId === requestIdRef.current) {
        toast.error(error.message || "Failed to load state settings");
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoadingCategories(false);
        setLoadingLicenses(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!selectedState) return;

    loadStateRegulations(selectedState);
  }, [selectedState, loadStateRegulations]);

  // ============================================
  // CATEGORY STATUS CHANGE
  // ============================================

  const handleStatusChange = (
    categoryId: string,
    value: RegulationType
  ) => {
    setSettings((previous) => ({
      ...previous,
      [categoryId]: value,
    }));
  };

  // ============================================
  // LICENSE SELECT / UNSELECT
  // ============================================

  const handleLicenseSelect = (
    licenseId: string,
    checked: boolean
  ) => {
    setLicenseSettings((previous) => ({
      ...previous,
      [licenseId]: {
        selected: checked,
        isRequired: checked
          ? previous[licenseId]?.isRequired ?? false
          : false,
      },
    }));
  };

  // ============================================
  // LICENSE REQUIRED / OPTIONAL
  // ============================================

  const handleLicenseRequired = (
    licenseId: string,
    isRequired: boolean
  ) => {
    setLicenseSettings((previous) => ({
      ...previous,
      [licenseId]: {
        selected: true,
        isRequired,
      },
    }));
  };

  // ============================================
  // CATEGORY STATS
  // ============================================

  const regulatedCount = Object.values(settings).filter(
    (value) => value === "regulated"
  ).length;

  const nonRegulatedCount = Object.values(settings).filter(
    (value) => value === "non-regulated"
  ).length;

  const unconfiguredCount = categories.filter(
    (category) => !settings[category.categoryId]
  ).length;

  // ============================================
  // LICENSE STATS
  // ============================================

  const selectedLicenseCount = Object.values(licenseSettings).filter(
    (item) => item.selected
  ).length;

  const requiredLicenseCount = Object.values(licenseSettings).filter(
    (item) => item.selected && item.isRequired
  ).length;

  const optionalLicenseCount = Object.values(licenseSettings).filter(
    (item) => item.selected && !item.isRequired
  ).length;

  // ============================================
  // CHANGE DETECTION
  // ============================================

  const hasCategoryChanges = useMemo(() => {
    return categories.some(
      (category) =>
        settings[category.categoryId] !==
        savedSettings[category.categoryId]
    );
  }, [categories, settings, savedSettings]);

  const hasLicenseChanges = useMemo(() => {
    return licenses.some((license) => {
      const current =
        licenseSettings[license._id] || DEFAULT_LICENSE_SETTING;

      const saved =
        savedLicenseSettings[license._id] || DEFAULT_LICENSE_SETTING;

      return (
        current.selected !== saved.selected ||
        current.isRequired !== saved.isRequired
      );
    });
  }, [licenses, licenseSettings, savedLicenseSettings]);

  const hasChanges = hasCategoryChanges || hasLicenseChanges;

  // ============================================
  // SEARCH
  // ============================================

  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.categoryName
        .toLowerCase()
        .includes(search.toLowerCase().trim())
    );
  }, [categories, search]);

  const filteredLicenses = useMemo(() => {
    const query = licenseSearch.toLowerCase().trim();

    return licenses.filter(
      (license) =>
        license.name.toLowerCase().includes(query) ||
        license.code.toLowerCase().includes(query) ||
        (license.description || "").toLowerCase().includes(query)
    );
  }, [licenses, licenseSearch]);

  // ============================================
  // RESET BOTH CONFIGURATIONS
  // ============================================

  const handleReset = () => {
    setSettings({ ...savedSettings });

    setLicenseSettings(
      JSON.parse(JSON.stringify(savedLicenseSettings))
    );

    toast.info("All changes have been reset");
  };

  // ============================================
  // SAVE CATEGORY + STATE LICENSE SETTINGS
  // ============================================

  const handleSave = async () => {
    if (!selectedState) {
      toast.warning("Please select a state");
      return;
    }

    // Keep existing category validation.
    const unconfigured = categories.filter(
      (category) => !settings[category.categoryId]
    );

    if (unconfigured.length > 0) {
      toast.warning(
        "Please set regulation for all categories before saving"
      );
      return;
    }

    try {
      setSaving(true);

      // Existing category payload.
      const regulations: RegulationSaveItem[] = categories.map(
        (category) => ({
          categoryId: category.categoryId,
          regulationType: settings[
            category.categoryId
          ] as RegulationType,
        })
      );

      // New state-wise license payload.
      // Only selected licenses will be saved.
      const selectedLicenses = licenses
        .filter(
          (license) => licenseSettings[license._id]?.selected
        )
        .map((license) => ({
          licenseId: license._id,
          isRequired: Boolean(
            licenseSettings[license._id]?.isRequired
          ),
        }));

      // One API call saves both sections.
      await saveStateRegulations(
        selectedState,
        regulations,
        selectedLicenses
      );

      // Update saved snapshots only after successful API response.
      setSavedSettings({ ...settings });

      setSavedLicenseSettings(
        JSON.parse(JSON.stringify(licenseSettings))
      );

      toast.success(
        "Category regulations and state licenses saved successfully!"
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // CURRENT STATE
  // ============================================

  const currentState = states.find(
    (state) => state._id === selectedState
  );

  // ============================================
  // REFRESH
  // ============================================

  const handleRefresh = () => {
    if (selectedState) {
      loadStateRegulations(selectedState);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div
      className="regulation-page"
      style={{
        marginLeft: "260px",
        marginTop: "70px",
        minHeight: "100vh",
        background: "#F5F7FB",
        padding: "30px",
      }}
    >
      {/* PAGE HEADER */}

      <div className="regulation-header">
        <div className="regulation-header-left">
          <div className="regulation-header-icon">
            <ShieldCheck size={26} />
          </div>

          <div>
            <h1>Set Regulation Service</h1>
            <p>
              Configure state-wise service regulations and license
              requirements.
            </p>
          </div>
        </div>

        <div className="regulation-header-right">
          <button
            className="regulation-refresh-btn"
            onClick={handleRefresh}
            disabled={
              loadingCategories ||
              loadingLicenses ||
              !selectedState
            }
          >
            <RefreshCw
              size={16}
              className={
                loadingCategories || loadingLicenses
                  ? "regulation-spin"
                  : ""
              }
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin-config")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              border: "1px solid #E3EAF2",
              borderRadius: 10,
              padding: "10px 14px",
              background: "#FFFFFF",
              color: "#14344A",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            <FaArrowLeft size={16} />
            Back
          </button>
        </div>
      </div>

      {/* STATE SELECTOR */}

      <div className="regulation-state-card">
        <div className="regulation-state-label">
          <MapPin size={18} />
          <span>Select State</span>
        </div>

        <div className="regulation-state-select-wrap">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            disabled={loadingStates || saving}
          >
            <option value="">
              {loadingStates ? "Loading states..." : "Choose a state"}
            </option>

            {states.map((state) => (
              <option key={state._id} value={state._id}>
                {state.name}
                {state.code ? ` (${state.code})` : ""}
              </option>
            ))}
          </select>

          <MapPin className="regulation-select-icon" size={18} />
        </div>

        {currentState && (
          <div className="regulation-selected-state">
            Currently configuring services and licenses for{" "}
            <strong>{currentState.name}</strong>
          </div>
        )}
      </div>

      {/* CATEGORY STATS */}

      <div className="regulation-stats-grid">
        <div className="regulation-stat-card regulation-stat-total">
          <div className="regulation-stat-icon">
            <Layers3 size={20} />
          </div>

          <div className="regulation-stat-info">
            <span>Total Categories</span>
            <h2>{categories.length}</h2>
          </div>
        </div>

        <div className="regulation-stat-card regulation-stat-regulated">
          <div className="regulation-stat-icon">
            <ShieldCheck size={20} />
          </div>

          <div className="regulation-stat-info">
            <span>Regulated</span>
            <h2>{regulatedCount}</h2>
          </div>
        </div>

        <div className="regulation-stat-card regulation-stat-nonregulated">
          <div className="regulation-stat-icon">
            <ShieldAlert size={20} />
          </div>

          <div className="regulation-stat-info">
            <span>Non-Regulated</span>
            <h2>{nonRegulatedCount}</h2>
          </div>
        </div>

        <div className="regulation-stat-card regulation-stat-pending">
          <div className="regulation-stat-icon">
            <Settings2 size={20} />
          </div>

          <div className="regulation-stat-info">
            <span>Not Configured</span>
            <h2>{unconfiguredCount}</h2>
          </div>
        </div>
      </div>

      {/* ========================================
          CATEGORY SECTION
      ======================================== */}

      <div className="regulation-content-card">
        <div className="regulation-content-top">
          <div>
            <h2>Service Categories</h2>
            <p>
              Set regulation type separately for each category in the
              selected state.
            </p>
          </div>

          <div className="regulation-search-box">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loadingCategories ? (
          <div className="regulation-loading">
            <RefreshCw size={24} className="regulation-spin" />
            <span>Loading service categories...</span>
          </div>
        ) : !selectedState ? (
          <div className="regulation-empty">
            <MapPin size={30} />
            <h3>Select a state</h3>
            <p>
              Select a state above to manage its regulation settings.
            </p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="regulation-empty">
            <Layers3 size={30} />
            <h3>No categories found</h3>
            <p>
              There are no service categories matching your search.
            </p>
          </div>
        ) : (
          <div className="regulation-category-list">
            {filteredCategories.map((category, index) => {
              const currentStatus = settings[category.categoryId];

              return (
                <div
                  className="regulation-category-row"
                  key={category.categoryId}
                >
                  <div className="regulation-category-left">
                    <div className="regulation-category-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="regulation-category-details">
                      <h3>{category.categoryName}</h3>

                      <span>
                        {category.category || "Service Category"}
                      </span>
                    </div>
                  </div>

                  <div className="regulation-category-right">
                    <div className="regulation-status-toggle">
                      <button
                        type="button"
                        className={`regulation-status-option regulated ${
                          currentStatus === "regulated" ? "active" : ""
                        }`}
                        onClick={() =>
                          handleStatusChange(
                            category.categoryId,
                            "regulated"
                          )
                        }
                        disabled={saving}
                      >
                        <ShieldCheck size={15} />
                        Regulated
                      </button>

                      <button
                        type="button"
                        className={`regulation-status-option non-regulated ${
                          currentStatus === "non-regulated"
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          handleStatusChange(
                            category.categoryId,
                            "non-regulated"
                          )
                        }
                        disabled={saving}
                      >
                        <ShieldAlert size={15} />
                        Non-Regulated
                      </button>
                    </div>

                    {!currentStatus && (
                      <span className="regulation-unconfigured-label">
                        Not configured
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================
          STATE-WISE LICENSE SECTION
      ======================================== */}

      <div
        className="regulation-content-card"
        style={{ marginTop: 24 }}
      >
        <div className="regulation-content-top">
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <FileCheck size={23} color="#14344A" />

              <h2>State-wise License Configuration</h2>
            </div>

            <p>
              Select licenses applicable to the selected state and
              configure whether each license is required or optional.
            </p>
          </div>

          <div className="regulation-search-box">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search licenses..."
              value={licenseSearch}
              onChange={(e) => setLicenseSearch(e.target.value)}
            />
          </div>
        </div>

        {/* LICENSE STATS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 14,
            margin: "10px 0 22px",
          }}
        >
          {[
            {
              label: "Total Licenses",
              value: licenses.length,
              color: "#14344A",
              icon: <FileText size={19} />,
            },
            {
              label: "Selected",
              value: selectedLicenseCount,
              color: "#16845B",
              icon: <CheckCircle2 size={19} />,
            },
            {
              label: "Required",
              value: requiredLicenseCount,
              color: "#2563EB",
              icon: <BadgeCheck size={19} />,
            },
            {
              label: "Optional",
              value: optionalLicenseCount,
              color: "#B7791F",
              icon: <FileCheck size={19} />,
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: "#F8FAFD",
                border: "1px solid #E7EDF4",
                borderRadius: 12,
                padding: "15px 17px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ color: item.color }}>{item.icon}</div>

              <div>
                <div
                  style={{
                    color: "#718096",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </div>

                <div
                  style={{
                    color: "#14344A",
                    fontSize: 22,
                    fontWeight: 750,
                    marginTop: 3,
                  }}
                >
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* LICENSE LOADING */}

        {loadingLicenses ? (
          <div className="regulation-loading">
            <RefreshCw size={24} className="regulation-spin" />
            <span>Loading license master...</span>
          </div>
        ) : !selectedState ? (
          <div className="regulation-empty">
            <MapPin size={30} />
            <h3>Select a state</h3>
            <p>Select a state to configure its licenses.</p>
          </div>
        ) : filteredLicenses.length === 0 ? (
          <div className="regulation-empty">
            <FileCheck size={30} />
            <h3>No licenses found</h3>
            <p>
              {licenses.length === 0
                ? "No active licenses are available in License Master."
                : "No licenses match your search."}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 14,
            }}
          >
            {filteredLicenses.map((license) => {
              const current =
                licenseSettings[license._id] || DEFAULT_LICENSE_SETTING;

              return (
                <div
                  key={license._id}
                  style={{
                    background: current.selected ? "#F5FAFF" : "#FFFFFF",
                    border: current.selected
                      ? "1px solid #8DBDE8"
                      : "1px solid #E5EAF0",
                    borderRadius: 13,
                    padding: 17,
                    transition: "all 0.2s ease",
                    boxShadow: current.selected
                      ? "0 3px 12px rgba(20,52,74,0.06)"
                      : "none",
                  }}
                >
                  {/* LICENSE HEADER */}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 11,
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          width: 37,
                          height: 37,
                          minWidth: 37,
                          borderRadius: 10,
                          background: current.selected
                            ? "#DCEEFF"
                            : "#F0F3F7",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#14344A",
                        }}
                      >
                        <FileCheck size={19} />
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <h3
                          style={{
                            margin: "2px 0 5px",
                            color: "#14344A",
                            fontSize: 14,
                            fontWeight: 700,
                          }}
                        >
                          {license.name}
                        </h3>

                        <span
                          style={{
                            fontSize: 11,
                            color: "#718096",
                            background: "#EDF2F7",
                            padding: "3px 7px",
                            borderRadius: 5,
                            fontWeight: 600,
                          }}
                        >
                          {license.code}
                        </span>
                      </div>
                    </div>

                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        cursor: saving ? "not-allowed" : "pointer",
                        fontSize: 12,
                        fontWeight: 650,
                        color: current.selected ? "#16845B" : "#718096",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={current.selected}
                        onChange={(e) =>
                          handleLicenseSelect(
                            license._id,
                            e.target.checked
                          )
                        }
                        disabled={saving}
                        style={{
                          width: 16,
                          height: 16,
                          accentColor: "#16845B",
                          cursor: "pointer",
                        }}
                      />

                      Select
                    </label>
                  </div>

                  {/* DESCRIPTION */}

                  <p
                    style={{
                      color: "#718096",
                      fontSize: 12,
                      lineHeight: 1.6,
                      minHeight: 38,
                      margin: "13px 0",
                    }}
                  >
                    {license.description || "No description available."}
                  </p>

                  {/* REQUIRED / OPTIONAL */}

                  <div
                    style={{
                      borderTop: "1px solid #E8EDF3",
                      paddingTop: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#14344A",
                          fontWeight: 650,
                        }}
                      >
                        License Requirement
                      </div>

                      <div
                        style={{
                          fontSize: 11,
                          color: "#8A94A3",
                          marginTop: 3,
                        }}
                      >
                        {current.selected
                          ? "Choose required or optional"
                          : "Select license to configure"}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleLicenseRequired(license._id, true)
                        }
                        disabled={!current.selected || saving}
                        style={{
                          border: current.isRequired
                            ? "1px solid #16845B"
                            : "1px solid #DDE5ED",
                          background: current.isRequired
                            ? "#E5F7EF"
                            : "#FFFFFF",
                          color: current.isRequired
                            ? "#16845B"
                            : "#8491A2",
                          borderRadius: 7,
                          padding: "7px 10px",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: current.selected
                            ? "pointer"
                            : "not-allowed",
                          opacity: current.selected ? 1 : 0.5,
                        }}
                      >
                        <Check size={12} style={{ marginRight: 3 }} />
                        Required
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleLicenseRequired(license._id, false)
                        }
                        disabled={!current.selected || saving}
                        style={{
                          border: current.selected && !current.isRequired
                            ? "1px solid #D69A32"
                            : "1px solid #DDE5ED",
                          background:
                            current.selected && !current.isRequired
                              ? "#FFF7E6"
                              : "#FFFFFF",
                          color:
                            current.selected && !current.isRequired
                              ? "#B7791F"
                              : "#8491A2",
                          borderRadius: 7,
                          padding: "7px 10px",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: current.selected
                            ? "pointer"
                            : "not-allowed",
                          opacity: current.selected ? 1 : 0.5,
                        }}
                      >
                        <X size={12} style={{ marginRight: 3 }} />
                        Optional
                      </button>
                    </div>
                  </div>

                  {/* STATUS */}

                  {current.selected && (
                    <div
                      style={{
                        marginTop: 11,
                        padding: "7px 9px",
                        borderRadius: 7,
                        background: current.isRequired
                          ? "#E8F7EF"
                          : "#FFF6E5",
                        color: current.isRequired
                          ? "#16845B"
                          : "#B7791F",
                        fontSize: 11,
                        fontWeight: 650,
                      }}
                    >
                      {current.isRequired
                        ? "✓ Selected · Required"
                        : "✓ Selected · Optional"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================
          COMMON SAVE / RESET FOOTER
      ======================================== */}

      <div
        className="regulation-content-card"
        style={{ marginTop: 20 }}
      >
        <div className="regulation-footer">
          <div className="regulation-footer-info">
            {hasChanges ? (
              <span className="regulation-unsaved">
                <span className="regulation-unsaved-dot" />
                Unsaved changes in category or license settings
              </span>
            ) : (
              <span className="regulation-saved">
                <CheckCircle2 size={15} />
                All changes saved
              </span>
            )}
          </div>

          <div className="regulation-footer-actions">
            <button
              type="button"
              className="regulation-reset-btn"
              onClick={handleReset}
              disabled={!hasChanges || saving}
            >
              <RotateCcw size={16} />
              Reset
            </button>

            <button
              type="button"
              className="regulation-save-btn"
              onClick={handleSave}
              disabled={
                !hasChanges ||
                saving ||
                loadingCategories ||
                loadingLicenses ||
                !selectedState
              }
            >
              {saving ? (
                <>
                  <RefreshCw
                    size={16}
                    className="regulation-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setregulatedcategories;
