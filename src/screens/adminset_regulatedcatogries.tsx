
import React, { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Search,
  Save,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  Settings2,
  Layers3,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getRegulationStates,
  getStateRegulations,
  saveStateRegulations,
type  RegulationState,
 type RegulationCategory,
} from "../service/setregulationService";
import { FaArrowLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import "./regulation.css";

type RegulationType = "regulated" | "non-regulated";

const Setregulatedcategories: React.FC = () => {
    const navigate = useNavigate();
  const [states, setStates] = useState<RegulationState[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [categories, setCategories] = useState<RegulationCategory[]>([]);
  const [settings, setSettings] = useState<Record<string, RegulationType | null>>(
    {}
  );

  const [search, setSearch] = useState("");
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [saving, setSaving] = useState(false);

  const [savedSettings, setSavedSettings] = useState<
    Record<string, RegulationType | null>
  >({});

  // ============================================
  // LOAD STATES
  // ============================================
  useEffect(() => {
    loadStates();
  }, []);

  const loadStates = async () => {
    try {
      setLoadingStates(true);

     const response = await getRegulationStates();

const rawStates = Array.isArray(response)
  ? response
  : response?.states || response?.data?.states || [];

const normalized = rawStates.map((state: any) => ({
  _id: state._id || state.id,
  name: state.name || state.state_name || state.stateName,
  code: state.code || state.stateCode,
}));

setStates(normalized);

if (normalized.length > 0) {
  setSelectedState(normalized[0]._id);
}
    } catch (error: any) {
      toast.error(error.message || "Failed to load states");
    } finally {
      setLoadingStates(false);
    }
  };

  // ============================================
  // LOAD STATE CATEGORIES + REGULATIONS
  // ============================================
  useEffect(() => {
    if (!selectedState) return;

    loadStateRegulations(selectedState);
  }, [selectedState]);

  const loadStateRegulations = async (stateId: string) => {
    try {
      setLoadingCategories(true);
      setCategories([]);
      setSettings({});
      setSavedSettings({});
      setSearch("");

     const response = await getStateRegulations(stateId);

// api.ts already unwraps response.data
const categoryList = response?.categories || [];

const normalized: RegulationCategory[] = categoryList.map(
  (category: any) => ({
    categoryId: category.categoryId,
    categoryName: category.categoryName,
    category: category.category || null,
    sortOrder: category.sortOrder ?? 0,
    regulationType: category.regulationType || null,
    configured: Boolean(category.configured),
  })
);

setCategories(normalized);

const initialSettings: Record<string, RegulationType | null> = {};

normalized.forEach((category) => {
  initialSettings[category.categoryId] = category.regulationType;
});

setSettings(initialSettings);
setSavedSettings(initialSettings);}
      catch (error: any) {
      toast.error(error.message || "Failed to load service categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  // ============================================
  // SET REGULATION STATUS
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
  // STATS
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

  const hasChanges = useMemo(() => {
    return categories.some(
      (category) =>
        settings[category.categoryId] !== savedSettings[category.categoryId]
    );
  }, [categories, settings, savedSettings]);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.categoryName.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  // ============================================
  // RESET
  // ============================================
  const handleReset = () => {
    setSettings({ ...savedSettings });
    toast.info("Changes have been reset");
  };

  const handleSave = async () => {
  if (!selectedState) {
    toast.warning("Please select a state");
    return;
  }

  const unconfigured = categories.filter(
    (category) => !settings[category.categoryId]
  );

  if (unconfigured.length > 0) {
    toast.warning("Please set regulation for all categories before saving");
    return;
  }

  try {
    setSaving(true);

    const regulations = categories.map((category) => ({
      categoryId: category.categoryId,
      regulationType: settings[category.categoryId] as RegulationType,
    }));

    await saveStateRegulations(selectedState, regulations);

    setSavedSettings({ ...settings });

    toast.success("State regulation settings saved successfully!");
  } catch (error: any) {
    toast.error(error.message || "Failed to save settings");
  } finally {
    setSaving(false);
  }
};

  const currentState = states.find((state) => state._id === selectedState);

  return (
    <div className="regulation-page"  style={{
        marginLeft: "260px",
        marginTop: "70px",
        minHeight: "100vh",
        background: "#F5F7FB",
        padding: "30px",
      }}>
      {/* PAGE HEADER */}
      <div className="regulation-header">
        <div className="regulation-header-left">
          <div className="regulation-header-icon">
            <ShieldCheck size={26} />
          </div>

          <div>
            <h1>Set Regulation Service</h1>
            <p>
              Configure regulated and non-regulated service categories for
              each state.
            </p>
          </div>
        </div>
<div className="regulation-header-right">
 <button
          className="regulation-refresh-btn"
          onClick={() => selectedState && loadStateRegulations(selectedState)}
          disabled={loadingCategories || !selectedState}
        >
          <RefreshCw
            size={16}
            className={loadingCategories ? "regulation-spin" : ""}
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
                              border: `1px solid #E3EAF2`,
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
            disabled={loadingStates}
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
            Currently configuring services for{" "}
            <strong>{currentState.name}</strong>
          </div>
        )}
      </div>

      {/* STATS */}
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
            <Settings2Icon />
          </div>
          <div className="regulation-stat-info">
            <span>Not Configured</span>
            <h2>{unconfiguredCount}</h2>
          </div>
        </div>
      </div>

      {/* CATEGORY SECTION */}
      <div className="regulation-content-card">
        <div className="regulation-content-top">
          <div>
            <h2>Service Categories</h2>
            <p>
              Set regulation type separately for each category in the selected
              state.
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
            <p>Select a state above to manage its regulation settings.</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="regulation-empty">
            <Layers3 size={30} />
            <h3>No categories found</h3>
            <p>There are no service categories matching your search.</p>
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
                        className={`regulation-status-option regulated ${
                          currentStatus === "regulated" ? "active" : ""
                        }`}
                        onClick={() =>
                          handleStatusChange(category.categoryId, "regulated")
                        }
                      >
                        <ShieldCheck size={15} />
                        Regulated
                      </button>

                      <button
                        className={`regulation-status-option non-regulated ${
                          currentStatus === "non-regulated" ? "active" : ""
                        }`}
                        onClick={() =>
                          handleStatusChange(category.categoryId, "non-regulated")
                        }
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

        {/* FOOTER ACTIONS */}
        <div className="regulation-footer">
          <div className="regulation-footer-info">
            {hasChanges ? (
              <span className="regulation-unsaved">
                <span className="regulation-unsaved-dot" />
                Unsaved changes
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
              className="regulation-reset-btn"
              onClick={handleReset}
              disabled={!hasChanges || saving}
            >
              <RotateCcw size={16} />
              Reset
            </button>

            <button
              className="regulation-save-btn"
              onClick={handleSave}
              disabled={!hasChanges || saving || loadingCategories}
            >
              {saving ? (
                <>
                  <RefreshCw size={16} className="regulation-spin" />
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

const Settings2Icon = () => <Settings2 size={20} />;

export default Setregulatedcategories
