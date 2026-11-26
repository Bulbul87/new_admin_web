
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Save,
  RefreshCw,
  UserRound,
  Mail,
  ShieldCheck,
  Layers,
  BriefcaseBusiness,
  AlertCircle,
  LoaderCircle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  getCaregiverServiceCategories,
  updateCaregiverServiceCategories,
  type CaregiverServiceCategory,
} from "../service/caregiverservice";

import "../screens/CaregiverService.css";
import "./CaregiverServiceModal.css";

interface CaregiverServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  caregiverId: string;
  caregiverName: string;
  caregiverEmail?: string;
  publicCaregiverId?: string;
}

const CaregiverServiceModal: React.FC<CaregiverServiceModalProps> = ({
  isOpen,
  onClose,
  caregiverId,
  caregiverName,
  caregiverEmail,
  publicCaregiverId,
}) => {
  const [categories, setCategories] = useState<CaregiverServiceCategory[]>([]);
  const [savedCategories, setSavedCategories] = useState<CaregiverServiceCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

 
  // ==============================
  // LOAD CATEGORIES FOR SELECTED CAREGIVER
  // ==============================

  const fetchCategories = useCallback(
    async (id: string) => {
      if (!id) {
        console.error("Caregiver ID missing");

        setCategories([]);
        setSavedCategories([]);
        setExpandedCategories([]);

        return;
      }

      try {
        setLoadingCategories(true);

        setCategories([]);
        setSavedCategories([]);
        setExpandedCategories([]);

        console.log("Loading categories for caregiver ID:", id);

        const response: any =
          await getCaregiverServiceCategories(id);

        console.log("RAW CAREGIVER CATEGORY RESPONSE:", response);

        // Handle different API response structures
        let actualData: any =
          response?.data?.data ??
          response?.data ??
          response;

        // Normalize response into an array
        let categoryList: CaregiverServiceCategory[] = [];

        if (Array.isArray(actualData)) {
          categoryList = actualData;
        } else if (actualData?.categoryId) {
          categoryList = [actualData];
        } else if (Array.isArray(actualData?.categories)) {
          categoryList = actualData.categories;
        } else if (Array.isArray(actualData?.data)) {
          categoryList = actualData.data;
        }

        // Remove invalid category entries
        categoryList = categoryList.filter(
          (category: any) =>
            category &&
            category.categoryId
        );

        console.log("FINAL CATEGORY LIST:", categoryList);
        console.log("TOTAL CATEGORIES:", categoryList.length);

        setCategories(categoryList);

        setSavedCategories(
          JSON.parse(JSON.stringify(categoryList))
        );

        // Expand first category automatically
        if (categoryList.length > 0) {
          setExpandedCategories([
            categoryList[0].categoryId,
          ]);
        }
      } catch (error: any) {
        console.error(
          "Fetch caregiver categories error:",
          error
        );

        setCategories([]);
        setSavedCategories([]);
        setExpandedCategories([]);

        toast.error(
          error?.message ||
          "Failed to load service categories"
        );
      } finally {
        setLoadingCategories(false);
      }
    },
    []
  );

  // ==============================
  // LOAD WHEN MODAL OPENS
  // ==============================

  useEffect(() => {
    if (isOpen && caregiverId) {
      fetchCategories(caregiverId);
    } else {
      setCategories([]);
      setSavedCategories([]);
      setExpandedCategories([]);
    }
  }, [isOpen, caregiverId, fetchCategories]);


  

  // DIRTY CHECK
  const hasChanges = useMemo(() => {
    if (categories.length !== savedCategories.length) return true;

    return categories.some((category) => {
      const saved = savedCategories.find(
        (item) => item.categoryId === category.categoryId
      );

      return !saved || saved.isActive !== category.isActive;
    });
  }, [categories, savedCategories]);

  // CATEGORY TOGGLE
  const handleCategoryToggle = (categoryId: string) => {
    setCategories((previous) =>
      previous.map((category) => {
        if (category.categoryId !== categoryId) return category;

        if (!category.globalIsActive) return category;

        return {
          ...category,
          isActive: !category.isActive,
        };
      })
    );
  };

  // EXPAND / COLLAPSE
  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories((previous) =>
      previous.includes(categoryId)
        ? previous.filter((id) => id !== categoryId)
        : [...previous, categoryId]
    );
  };

  // SAVE
  const handleSave = async () => {
    if (!caregiverId) {
      toast.error("Caregiver ID is missing");
      return;
    }

    if (!hasChanges) {
      toast.info("No changes to save");
      return;
    }

    try {
      setSaving(true);

      const payload = categories.map((category) => ({
        categoryId: category.categoryId,
        isActive: category.isActive,
      }));

      await updateCaregiverServiceCategories(caregiverId, payload);

      setSavedCategories(JSON.parse(JSON.stringify(categories)));

      toast.success(
        "Caregiver service categories updated successfully!"
      );
    } catch (error: any) {
      console.error("Save caregiver categories error:", error);
      toast.error(
        error?.message || "Failed to update caregiver services"
      );
    } finally {
      setSaving(false);
    }
  };

  // SUMMARY
  const activeCount = categories.filter(
    (category) => category.isActive && category.globalIsActive
  ).length;

  const inactiveCount = categories.length - activeCount;

  const totalServices = categories.reduce(
    (total, category) =>
      total + (category.services?.length || 0),
    0
  );

  const availableServices = categories.reduce((total, category) => {
    if (!category.isActive || !category.globalIsActive) return total;

    return (
      total +
      (category.services || []).filter(
        (service) => service.globalIsActive
      ).length
    );
  }, 0);

  if (!isOpen) return null;

  return (
    <div
      className="csm-overlay"
      onClick={() => {
        if (!saving) onClose();
      }}
    >
      <div
        className="csm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="csm-title"
        onClick={(event) => event.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="csm-header">
          <div className="csm-heading">
            <div className="csm-heading-icon">
              <BriefcaseBusiness size={22} />
            </div>

            <div>
              <h2 id="csm-title">Caregiver Category Activation</h2>
              <p>
                Manage service categories for this particular caregiver.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="csm-close"
            onClick={onClose}
            disabled={saving}
            aria-label="Close modal"
          >
            <X size={21} />
          </button>
        </div>

        <div className="csm-body">
          {/* CAREGIVER DETAILS - NO SELECTION REQUIRED */}
          <div className="cs-selection-card csm-profile-card">
            <div className="cs-section-title">
              <div className="cs-title-icon">
                <UserRound size={19} />
              </div>

              <div>
                <h2>Caregiver Information</h2>
                <p>
                  Categories will be managed for this caregiver only.
                </p>
              </div>
            </div>

            <div className="cs-caregiver-details">
              <div className="cs-detail-item">
                <div className="cs-detail-icon">
                  <UserRound size={18} />
                </div>
                <div>
                  <span>Caregiver Name</span>
                  <strong>{caregiverName || "N/A"}</strong>
                </div>
              </div>

              <div className="cs-detail-item">
                <div className="cs-detail-icon">
                  <Mail size={18} />
                </div>
                <div>
                  <span>Email Address</span>
                  <strong>{caregiverEmail || "Not available"}</strong>
                </div>
              </div>

              <div className="cs-detail-item">
                <div className="cs-detail-icon">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <span>Public Caregiver ID</span>
                  <strong>{publicCaregiverId || "Not available"}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* LOADING */}
          {loadingCategories && (
            <div className="cs-loading-card">
              <LoaderCircle size={30} className="cs-spinning" />
              <p>Loading caregiver service categories...</p>
            </div>
          )}

          {/* SUMMARY */}
          {!loadingCategories && categories.length > 0 && (
            <div className="cs-stats-grid">
              <div className="cs-stat-card">
                <div className="cs-stat-icon blue">
                  <Layers size={20} />
                </div>
                <div>
                  <span>Total Categories</span>
                  <strong>{categories.length}</strong>
                </div>
              </div>

              <div className="cs-stat-card">
                <div className="cs-stat-icon green">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <span>Active Categories</span>
                  <strong>{activeCount}</strong>
                </div>
              </div>

              <div className="cs-stat-card">
                <div className="cs-stat-icon red">
                  <XCircle size={20} />
                </div>
                <div>
                  <span>Inactive Categories</span>
                  <strong>{inactiveCount}</strong>
                </div>
              </div>

              <div className="cs-stat-card">
                <div className="cs-stat-icon purple">
                  <BriefcaseBusiness size={20} />
                </div>
                <div>
                  <span>Available Services</span>
                  <strong>{availableServices}/{totalServices}</strong>
                </div>
              </div>
            </div>
          )}

          {/* CATEGORY HEADER */}
          <div className="cs-list-header">
            <div>
              <h2>Service Categories</h2>
              <p>
                Enable or disable categories for this caregiver.
              </p>
            </div>

            <div className="cs-list-actions">
              {hasChanges && (
                <span className="cs-unsaved-label">
                  <AlertCircle size={15} />
                  Unsaved changes
                </span>
              )}

              <button
                type="button"
                className="cs-refresh-btn"
               onClick={() => fetchCategories(caregiverId)}
                disabled={loadingCategories || saving}
              >
                <RefreshCw
                  size={16}
                  className={loadingCategories ? "cs-spinning" : ""}
                />
                Refresh
              </button>

              <button
                type="button"
                className="cs-save-btn"
                onClick={handleSave}
                disabled={
                  saving ||
                  loadingCategories ||
                  !hasChanges ||
                  categories.length === 0
                }
              >
                {saving ? (
                  <>
                    <LoaderCircle size={17} className="cs-spinning" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* EMPTY STATE */}
          {!loadingCategories && categories.length === 0 && (
            <div className="cs-empty-card">
              <div className="cs-empty-icon">
                <Layers size={30} />
              </div>
              <h3>No Service Categories Found</h3>
              <p>
                No categories are currently available in the Service Catalog.
              </p>
            </div>
          )}

       
{/* CATEGORY LIST */}

{!loadingCategories && categories.length > 0 && (
  <div className="csm-category-list">
    {categories.map((category) => {
      const isExpanded = expandedCategories.includes(
        category.categoryId
      );

      const categoryAvailable =
        category.globalIsActive && category.isActive;

      const services = category.services || [];

      return (
        <div
          className={`cs-category-card ${
            !categoryAvailable ? "cs-category-disabled" : ""
          }`}
          key={category.categoryId}
        >
          {/* CATEGORY HEADER */}
          <div className="cs-category-header">
            <button
              type="button"
              className="cs-category-expand"
              onClick={() =>
                toggleExpanded(category.categoryId)
              }
            >
              <div className="cs-category-icon">
                <Layers size={20} />
              </div>

              <div className="cs-category-info">
                <h3>{category.categoryName || "Unnamed Category"}</h3>

                <div className="cs-category-meta">
                  <span>{services.length} Sub-services</span>
                  <span className="cs-meta-dot">•</span>
                  <span>ID: {category.categoryId}</span>
                </div>
              </div>

              <ChevronDown
                size={19}
                className={
                  isExpanded
                    ? "cs-chevron expanded"
                    : "cs-chevron"
                }
              />
            </button>

            <div className="cs-category-control">
              <span
                className={`cs-status ${
                  categoryAvailable ? "active" : "inactive"
                }`}
              >
                {categoryAvailable ? "Active" : "Inactive"}
              </span>

              <label
                className={`cs-toggle ${
                  !category.globalIsActive ? "toggle-disabled" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!category.isActive}
                  disabled={!category.globalIsActive || saving}
                  onChange={() =>
                    handleCategoryToggle(category.categoryId)
                  }
                />

                <span className="cs-toggle-slider" />
              </label>
            </div>
          </div>

          {/* GLOBAL INACTIVE NOTICE */}
          {!category.globalIsActive && (
            <div className="cs-global-notice">
              <AlertCircle size={15} />
              This category is inactive in the global Service Catalog.
              It cannot be enabled here.
            </div>
          )}

          {/* CAREGIVER INACTIVE NOTICE */}
          {category.globalIsActive && !category.isActive && (
            <div className="cs-inactive-notice">
              This category is disabled for this caregiver.
              All its sub-services are unavailable.
            </div>
          )}

          {/* SUB-SERVICES */}
          {isExpanded && (
            <div className="cs-services-container">
              <div className="cs-services-heading">
                <span>Sub-service Name</span>
                <span>Global Status</span>
                <span>Availability</span>
              </div>

              {services.length === 0 ? (
                <div className="cs-no-services">
                  No sub-services available in this category.
                </div>
              ) : (
                services.map((service) => {
                  const isAvailable =
                    category.globalIsActive &&
                    category.isActive &&
                    service.globalIsActive;

                  return (
                    <div
                      className="cs-service-row"
                      key={service._id || service.servId}
                    >
                      <div className="cs-service-name">
                        <div className="cs-service-dot" />

                        <div>
                          <strong>{service.name}</strong>

                          {service.description && (
                            <small>{service.description}</small>
                          )}

                          <small className="cs-service-id">
                            ID: {service.servId}
                          </small>
                        </div>
                      </div>

                      <div>
                        <span
                          className={`cs-mini-status ${
                            service.globalIsActive
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          {service.globalIsActive
                            ? "Globally Active"
                            : "Globally Inactive"}
                        </span>
                      </div>

                      <div>
                        <span
                          className={`cs-mini-status ${
                            isAvailable ? "active" : "inactive"
                          }`}
                        >
                          {isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      );
    })}
  </div>
)}

{/* EMPTY STATE */}
{!loadingCategories && categories.length === 0 && (
  <div className="cs-empty-card">
    <div className="cs-empty-icon">
      <Layers size={30} />
    </div>

    <h3>No Service Categories Found</h3>

    <p>
      No categories are currently available for this caregiver.
    </p>
  </div>
)}

        </div>

      
      </div>
    </div>
  );
};

export default CaregiverServiceModal;
