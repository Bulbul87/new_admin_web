
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    RefreshCw,
    Save,
    UserRound,
    Mail,
    ShieldCheck,
    ChevronDown,
    CheckCircle2,
    XCircle,
    Layers,
    BriefcaseBusiness,
    AlertCircle,
    LoaderCircle,
} from "lucide-react";
import { toast } from "react-toastify";

import {
    getCaregivers,
    getCaregiverServiceCategories,
    updateCaregiverServiceCategories,
    type Caregiver,
    type CaregiverServiceCategory,
} from "../service/caregiverservice";

import "./CaregiverService.css";
import { FaArrowLeft } from "react-icons/fa";

const CaregiverService: React.FC = () => {
    const navigate = useNavigate();
    const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
    const [selectedCaregiverId, setSelectedCaregiverId] = useState("");

    const [categories, setCategories] = useState<
        CaregiverServiceCategory[]
    >([]);

    const [savedCategories, setSavedCategories] = useState<
        CaregiverServiceCategory[]
    >([]);

    const [caregiverSearch, setCaregiverSearch] = useState("");

    const [loadingCaregivers, setLoadingCaregivers] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [saving, setSaving] = useState(false);

    const [expandedCategories, setExpandedCategories] = useState<
        string[]
    >([]);

    // ==============================
    // CAREGIVER HELPERS
    // ==============================

    const getCaregiverName = (caregiver: Caregiver) => {
        return [
            caregiver.firstName,
            caregiver.middleName,
            caregiver.lastName,
        ]
            .filter(Boolean)
            .join(" ")
            .trim() || "Unnamed Caregiver";
    };

    const getPublicCaregiverId = (caregiver?: Caregiver) => {
        return (
            caregiver?.providerInfo?.publicProviderId ||
            ""
        );
    };

    const selectedCaregiver = useMemo(
        () =>
            caregivers.find(
                (item) => item._id === selectedCaregiverId
            ),
        [caregivers, selectedCaregiverId]
    );

    const filteredCaregivers = useMemo(() => {
        const search = caregiverSearch.trim().toLowerCase();

        if (!search) return caregivers;

        return caregivers.filter((caregiver) => {
            const name = getCaregiverName(caregiver).toLowerCase();
            const email = (caregiver.email || "").toLowerCase();
            const publicId = getPublicCaregiverId(caregiver).toLowerCase();

            return (
                name.includes(search) ||
                email.includes(search) ||
                publicId.includes(search)
            );
        });
    }, [caregivers, caregiverSearch]);

    // ==============================
    // DIRTY CHECK
    // ==============================

    const hasChanges = useMemo(() => {
        if (categories.length !== savedCategories.length) {
            return true;
        }

        return categories.some((category) => {
            const saved = savedCategories.find(
                (item) => item.categoryId === category.categoryId
            );

            return !saved || saved.isActive !== category.isActive;
        });
    }, [categories, savedCategories]);

    // ==============================
    // LOAD CAREGIVERS
    // ==============================

    const fetchCaregivers = useCallback(async () => {
        try {
            setLoadingCaregivers(true);

            const response = await getCaregivers();

            setCaregivers(response || []);
        } catch (error: any) {
            console.error("Fetch caregivers error:", error);
            toast.error(
                error?.message || "Failed to load caregivers"
            );
        } finally {
            setLoadingCaregivers(false);
        }
    }, []);

    useEffect(() => {
        fetchCaregivers();
    }, [fetchCaregivers]);

    // ==============================
    // LOAD CAREGIVER CATEGORIES
    // ==============================

    const fetchCategories = useCallback(
        async (caregiverId: string) => {
            if (!caregiverId) {
                setCategories([]);
                setSavedCategories([]);
                return;
            }

            try {
                setLoadingCategories(true);

                setCategories([]);
                setSavedCategories([]);
                setExpandedCategories([]);

                const response: any =
                    await getCaregiverServiceCategories(caregiverId);

                // api.ts returns response.data directly.
                // This supports both array and wrapped API responses.
                const categoryList: CaregiverServiceCategory[] =
                    Array.isArray(response)
                        ? response
                        : Array.isArray(response?.data)
                            ? response.data
                            : [];

                setCategories(categoryList);
                setSavedCategories(
                    JSON.parse(JSON.stringify(categoryList))
                );

                // Expand first category by default
                if (categoryList.length > 0) {
                    setExpandedCategories([
                        categoryList[0].categoryId,
                    ]);
                }
            } catch (error: any) {
                console.error("Fetch categories error:", error);
                toast.error(
                    error?.message || "Failed to load service categories"
                );
            } finally {
                setLoadingCategories(false);
            }
        },
        []
    );

    useEffect(() => {
        if (selectedCaregiverId) {
            fetchCategories(selectedCaregiverId);
        } else {
            setCategories([]);
            setSavedCategories([]);
        }
    }, [selectedCaregiverId, fetchCategories]);

    // ==============================
    // CATEGORY TOGGLE
    // ==============================

    const handleCategoryToggle = (categoryId: string) => {
        setCategories((previous) =>
            previous.map((category) => {
                if (category.categoryId !== categoryId) {
                    return category;
                }

                // A globally inactive category cannot be enabled
                // for an individual caregiver.
                if (!category.globalIsActive) {
                    return category;
                }

                return {
                    ...category,
                    isActive: !category.isActive,
                };
            })
        );
    };

    // ==============================
    // EXPAND / COLLAPSE
    // ==============================

    const toggleExpanded = (categoryId: string) => {
        setExpandedCategories((previous) =>
            previous.includes(categoryId)
                ? previous.filter((id) => id !== categoryId)
                : [...previous, categoryId]
        );
    };

    // ==============================
    // SAVE CHANGES
    // ==============================

    const handleSave = async () => {
        if (!selectedCaregiverId) {
            toast.error("Please select a caregiver first");
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

            await updateCaregiverServiceCategories(
                selectedCaregiverId,
                payload
            );

            setSavedCategories(
                JSON.parse(JSON.stringify(categories))
            );

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

    // ==============================
    // REFRESH
    // ==============================

    const handleRefresh = () => {
        if (selectedCaregiverId) {
            fetchCategories(selectedCaregiverId);
        } else {
            fetchCaregivers();
        }
    };

    // ==============================
    // SUMMARY
    // ==============================

    const activeCount = categories.filter(
        (category) =>
            category.isActive && category.globalIsActive
    ).length;

    const inactiveCount = categories.length - activeCount;

    const totalServices = categories.reduce(
        (total, category) =>
            total + (category.services?.length || 0),
        0
    );

    const availableServices = categories.reduce(
        (total, category) => {
            if (!category.isActive || !category.globalIsActive) {
                return total;
            }

            return (
                total +
                (category.services || []).filter(
                    (service) => service.globalIsActive
                ).length
            );
        },
        0
    );

    return (
        <div className="caregiver-service-page">
            {/* PAGE HEADER */}
            <div className="caregiver-service-header">
                <div className="caregiver-service-heading">
                    <div className="caregiver-service-heading-icon">
                        <BriefcaseBusiness size={23} />
                    </div>

                    <div>
                        <h1>Caregiver Service Management</h1>
                        <p>
                            Manage service categories and availability
                            individually for each caregiver.
                        </p>
                    </div>
                </div>
                <div className="d-flex gap-2">
                    <button
                        type="button"
                        className="cs-refresh-btn"
                        onClick={handleRefresh}
                        disabled={loadingCategories || loadingCaregivers}
                    >
                        <RefreshCw
                            size={16}
                            className={
                                loadingCategories || loadingCaregivers
                                    ? "cs-spinning"
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

            {/* CAREGIVER SELECTION */}
            <div className="cs-selection-card">
                <div className="cs-section-title">
                    <div className="cs-title-icon">
                        <UserRound size={19} />
                    </div>

                    <div>
                        <h2>Select Caregiver</h2>
                        <p>
                            Choose a caregiver to manage their services.
                        </p>
                    </div>
                </div>

                <div className="cs-selection-grid">
                    <div className="cs-field">
                        <label htmlFor="caregiverSearch">
                            Search Caregiver
                        </label>

                        <div className="cs-search-wrapper">
                            <Search size={17} />

                            <input
                                id="caregiverSearch"
                                type="text"
                                placeholder="Search by name, email or ID..."
                                value={caregiverSearch}
                                onChange={(event) =>
                                    setCaregiverSearch(event.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="cs-field">
                        <label htmlFor="caregiverSelect">
                            Caregiver Name
                        </label>

                        <div className="cs-select-wrapper">
                            <select
                                id="caregiverSelect"
                                value={selectedCaregiverId}
                                onChange={(event) =>
                                    setSelectedCaregiverId(event.target.value)
                                }
                                disabled={loadingCaregivers}
                            >
                                <option value="">
                                    {loadingCaregivers
                                        ? "Loading caregivers..."
                                        : "Select Caregiver"}
                                </option>

                                {filteredCaregivers.map((caregiver) => (
                                    <option
                                        key={caregiver._id}
                                        value={caregiver._id}
                                    >
                                        {getCaregiverName(caregiver)}
                                    </option>
                                ))}
                            </select>

                            <ChevronDown size={17} />
                        </div>

                        {!loadingCaregivers &&
                            caregivers.length === 0 && (
                                <small className="cs-field-error">
                                    No caregivers found.
                                </small>
                            )}

                        {!loadingCaregivers &&
                            caregivers.length > 0 &&
                            filteredCaregivers.length === 0 && (
                                <small className="cs-field-error">
                                    No matching caregiver found.
                                </small>
                            )}
                    </div>
                </div>

                {/* CAREGIVER DETAILS */}
                {selectedCaregiver && (
                    <div className="cs-caregiver-details">
                        <div className="cs-detail-item">
                            <div className="cs-detail-icon">
                                <UserRound size={18} />
                            </div>

                            <div>
                                <span>Caregiver Name</span>
                                <strong>
                                    {getCaregiverName(selectedCaregiver)}
                                </strong>
                            </div>
                        </div>

                        <div className="cs-detail-item">
                            <div className="cs-detail-icon">
                                <Mail size={18} />
                            </div>

                            <div>
                                <span>Email Address</span>
                                <strong>
                                    {selectedCaregiver.email || "Not available"}
                                </strong>
                            </div>
                        </div>

                        <div className="cs-detail-item">
                            <div className="cs-detail-icon">
                                <ShieldCheck size={18} />
                            </div>

                            <div>
                                <span>Public Caregiver ID</span>
                                <strong>
                                    {getPublicCaregiverId(selectedCaregiver) ||
                                        "Not available"}
                                </strong>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* CATEGORY SECTION */}
            {selectedCaregiverId && (
                <>
                    {/* SUMMARY CARDS */}
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
                                    <strong>
                                        {availableServices}/{totalServices}
                                    </strong>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SERVICE LIST HEADER */}
                    <div className="cs-list-header">
                        <div>
                            <h2>Service Categories</h2>
                            <p>
                                Enable or disable categories for this caregiver.
                                Changes will not affect other caregivers.
                            </p>
                        </div>

                        <div className="cs-list-actions">
                            {hasChanges && (
                                <span className="cs-unsaved-label">
                                    <AlertCircle size={15} />
                                    Unsaved changes
                                </span>
                            )}

                        </div>
                    </div>

                    {/* LOADING */}
                    {loadingCategories && (
                        <div className="cs-loading-card">
                            <LoaderCircle
                                size={30}
                                className="cs-spinning"
                            />
                            <p>Loading caregiver service categories...</p>
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
                                No categories are currently available in the
                                Service Catalog.
                            </p>
                        </div>
                    )}

                    {/* CATEGORY LIST */}
                    {!loadingCategories &&
                        categories.map((category) => {
                            const isExpanded =
                                expandedCategories.includes(category.categoryId);

                            const categoryAvailable =
                                category.globalIsActive && category.isActive;

                            const services = category.services || [];

                            return (
                                <div
                                    className={`cs-category-card ${!categoryAvailable
                                        ? "cs-category-disabled"
                                        : ""
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
                                                <h3>{category.categoryName}</h3>

                                                <div className="cs-category-meta">
                                                    <span>
                                                        {services.length} Sub-services
                                                    </span>

                                                    <span className="cs-meta-dot">•</span>

                                                    <span>
                                                        ID: {category.categoryId}
                                                    </span>
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
                                                className={`cs-status ${categoryAvailable
                                                    ? "active"
                                                    : "inactive"
                                                    }`}
                                            >
                                                {categoryAvailable
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>

                                            <label
                                                className={`cs-toggle ${!category.globalIsActive
                                                    ? "toggle-disabled"
                                                    : ""
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={category.isActive}
                                                    disabled={!category.globalIsActive}
                                                    onChange={() =>
                                                        handleCategoryToggle(
                                                            category.categoryId
                                                        )
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
                                            This category is inactive in the global
                                            Service Catalog. It cannot be enabled here.
                                        </div>
                                    )}

                                    {/* CAREGIVER INACTIVE NOTICE */}
                                    {category.globalIsActive &&
                                        !category.isActive && (
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
                                                            key={
                                                                service._id || service.servId
                                                            }
                                                        >
                                                            <div className="cs-service-name">
                                                                <div className="cs-service-dot" />

                                                                <div>
                                                                    <strong>{service.name}</strong>

                                                                    {service.description && (
                                                                        <small>
                                                                            {service.description}
                                                                        </small>
                                                                    )}

                                                                    <small className="cs-service-id">
                                                                        ID: {service.servId}
                                                                    </small>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <span
                                                                    className={`cs-mini-status ${service.globalIsActive
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
                                                                    className={`cs-mini-status ${isAvailable
                                                                        ? "active"
                                                                        : "inactive"
                                                                        }`}
                                                                >
                                                                    {isAvailable
                                                                        ? "Available"
                                                                        : "Unavailable"}
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

                    {/* BOTTOM SAVE */}
                    {!loadingCategories && categories.length > 0 && (
                        <div className="cs-bottom-save">
                            <span>
                                {hasChanges
                                    ? "You have unsaved changes."
                                    : "All changes are saved."}
                            </span>

                            <button
                                type="button"
                                className="cs-save-btn"
                                onClick={handleSave}
                                disabled={saving || !hasChanges}
                            >
                                {saving ? (
                                    <>
                                        <LoaderCircle
                                            size={17}
                                            className="cs-spinning"
                                        />
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
                    )}
                </>
            )}

            {/* INITIAL EMPTY STATE */}
            {!selectedCaregiverId && !loadingCaregivers && (
                <div className="cs-empty-card cs-select-empty">
                    <div className="cs-empty-icon">
                        <UserRound size={30} />
                    </div>

                    <h3>Select a Caregiver</h3>
                    <p>
                        Select a caregiver from the dropdown above to view
                        and manage their service categories.
                    </p>
                </div>
            )}
        </div>
    );
};

export default CaregiverService;
