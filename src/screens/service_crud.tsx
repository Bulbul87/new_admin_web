import { toast } from 'react-toastify';
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Edit3,
  FolderPlus,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  serviceApi,
  type ServiceCatalogCategory,
  type ServiceCatalogItem,
} from "../service/service_catlog";

import "./service_crud.css";

// ============================================================
// TYPES
// ============================================================

type ModalType =
  | "create-category"
  | "edit-category"
  | "create-service"
  | "edit-service"
  | null;



interface CategoryForm {
  categoryId: string;
  categoryName: string;
  icon: string;
  isActive: boolean;
}

interface ServiceForm {
  serviceName: string;
  servId: string;
  description: string;
  icon: string;
  sortOrder: string;
  isActive: boolean;
  duration: string;
  progressTimeMinutes: string;
  minHours: string;
  maxHours: string;
}

// ============================================================
// DEFAULT FORMS
// ============================================================

const emptyCategoryForm: CategoryForm = {
  categoryId: "",
  categoryName: "",
  icon: "",
  isActive: true,

};

const emptyServiceForm: ServiceForm = {
  serviceName: "",
  servId: "",
  description: "",
  icon: "",
  sortOrder: "0",
  isActive: true,
  duration: "60",
  progressTimeMinutes: "60",
  minHours: "",
  maxHours: "",
};

// ============================================================
// HELPERS
// ============================================================

const getErrorMessage = (err: any, fallback: string) =>
  err?.response?.data?.message || err?.message || fallback;

const toOptionalNumber = (value: string): number | undefined => {
  if (value.trim() === "") return undefined;

  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};

const toRequiredNumber = (value: string, fallback = 0): number => {
  const number = Number(value);
  return value.trim() !== "" && Number.isFinite(number)
    ? number
    : fallback;
};

// ============================================================
// COMPONENT
// ============================================================

const ServiceCrudScreen: React.FC = () => {
  const navigate = useNavigate();

  // DATA
  const [categories, setCategories] = useState<ServiceCatalogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // UI STATE
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] =
    useState<Record<string, boolean>>({});
  const [modal, setModal] = useState<ModalType>(null);

  const [selectedCategory, setSelectedCategory] =
    useState<ServiceCatalogCategory | null>(null);
  const [selectedService, setSelectedService] =
    useState<ServiceCatalogItem | null>(null);

  // FORMS
  const [categoryForm, setCategoryForm] =
    useState<CategoryForm>({ ...emptyCategoryForm });
  const [serviceForm, setServiceForm] =
    useState<ServiceForm>({ ...emptyServiceForm });

  // ACTION STATE
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================================
  // LOAD CATALOG
  // ==========================================================

  const loadCategories = useCallback(async (showRefresh = false) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await serviceApi.getServiceCatalog();
      const list = response.categories || [];

      setCategories(list);

      setExpandedCategories((previous) => {
        const expanded: Record<string, boolean> = {};

        list.forEach((category) => {
          expanded[category._id] =
            previous[category._id] ?? true;
        });

        return expanded;
      });
    } catch (err: any) {
      console.error("Failed to load service catalog:", err);
      toast.error(getErrorMessage(err, "Failed to load service catalog."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  // ==========================================================
  // SEARCH
  // ==========================================================

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return categories;

    return categories
      .map((category) => {
        const categoryMatches =
          category.categoryName?.toLowerCase().includes(query) ||
          category.categoryId?.toLowerCase().includes(query) 
         
        const matchingServices = (category.services || []).filter(
          (service) =>
            service.name?.toLowerCase().includes(query) ||
            service.servId?.toLowerCase().includes(query) ||
            service.description?.toLowerCase().includes(query)
        );

        if (categoryMatches) return category;

        if (matchingServices.length > 0) {
          return { ...category, services: matchingServices };
        }

        return null;
      })
      .filter(Boolean) as ServiceCatalogCategory[];
  }, [categories, search]);

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const totalServices = useMemo(
    () =>
      categories.reduce(
        (total, category) =>
          total + (category.services?.length || 0),
        0
      ),
    [categories]
  );

  const activeCategories = useMemo(
    () =>
      categories.filter((category) => category.isActive !== false)
        .length,
    [categories]
  );

  const activeServices = useMemo(
    () =>
      categories.reduce(
        (total, category) =>
          total +
          (category.services || []).filter(
            (service) => service.isActive !== false
          ).length,
        0
      ),
    [categories]
  );

  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  const closeModal = () => {
    if (saving) return;

    setModal(null);
    setSelectedCategory(null);
    setSelectedService(null);
    setCategoryForm({ ...emptyCategoryForm });
    setServiceForm({ ...emptyServiceForm });
    setError("");
  };

  // ==========================================================
  // CATEGORY MODAL
  // ==========================================================

  const openCreateCategory = () => {
    setSelectedCategory(null);
    setCategoryForm({ ...emptyCategoryForm });
    setError("");
    setModal("create-category");
  };

  const openEditCategory = (category: ServiceCatalogCategory) => {
    setSelectedCategory(category);

    setCategoryForm({
      categoryId: category.categoryId || "",
      categoryName: category.categoryName || "",
      icon: category.icon || "",
      isActive: category.isActive !== false,
  
    });

    setError("");
    setModal("edit-category");
  };

  // ==========================================================
  // CATEGORY PAYLOAD
  // ==========================================================

 const getCategoryPayload = () => ({
  categoryId: categoryForm.categoryId.trim(),
  categoryName: categoryForm.categoryName.trim(),
  icon: categoryForm.icon.trim() || undefined,
  isActive: categoryForm.isActive,
});
  // ==========================================================
  // CREATE CATEGORY
  // ==========================================================

  const handleCreateCategory = async () => {
    if (!categoryForm.categoryName.trim()) {
      setError("Category name is required.");
      return;
    }
    if (!categoryForm.categoryId.trim()) {
  setError("Category ID is required.");
  return;
}

    try {
      setSaving(true);
      setError("");

      await serviceApi.createServiceCategory(getCategoryPayload());

      setModal(null);
     toast.success("Category created successfully.");
      await loadCategories();

      window.setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Create category error:", err);
      toast.error(getErrorMessage(err, "Failed to create category."));
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // UPDATE CATEGORY
  // ==========================================================

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;

    if (!categoryForm.categoryName.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await serviceApi.updateServiceCategory(
        selectedCategory._id,
        getCategoryPayload()
      );

      setModal(null);
        toast.success("Category updated successfully.");
      await loadCategories();

      window.setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Update category error:", err);
      toast.error(getErrorMessage(err, "Failed to update category."));
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // DELETE CATEGORY
  // ==========================================================

  const handleDeleteCategory = async (
    category: ServiceCatalogCategory
  ) => {
    const count = category.services?.length || 0;

    const message =
      count > 0
        ? `This category contains ${count} service(s). Are you sure you want to delete it?`
        : "Are you sure you want to delete this category?";

    if (!window.confirm(message)) return;

    try {
      setDeleting(true);
      setError("");

      await serviceApi.deleteServiceCategory(category._id);

        toast.success("Category deleted successfully.");
      await loadCategories();

      window.setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Delete category error:", err);
      toast.error(getErrorMessage(err, "Failed to delete category."));
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================================
  // SERVICE MODAL
  // ==========================================================

  const openCreateService = (category: ServiceCatalogCategory) => {
    setSelectedCategory(category);
    setSelectedService(null);
    setServiceForm({ ...emptyServiceForm });
    setError("");
    setModal("create-service");

    setExpandedCategories((previous) => ({
      ...previous,
      [category._id]: true,
    }));
  };

  const openEditService = (
    category: ServiceCatalogCategory,
    service: ServiceCatalogItem
  ) => {
    setSelectedCategory(category);
    setSelectedService(service);

    setServiceForm({
      serviceName: service.name || "",
      servId: service.servId || "",
      description: service.description || "",
      icon: service.icon || "",
      sortOrder: String(service.sortOrder ?? 0),
      isActive: service.isActive !== false,
      duration: String(service.duration ?? 60),
      progressTimeMinutes: String(
        service.progressTimeMinutes ?? 60
      ),
      minHours: String(service.minHours ?? ""),
      maxHours: String(service.maxHours ?? ""),
    });

    setError("");
    setModal("edit-service");
  };

  // ==========================================================
  // SERVICE PAYLOAD
  // ==========================================================

 const getServicePayload = () => ({
  servId: serviceForm.servId.trim(),
  name: serviceForm.serviceName.trim(),
  description: serviceForm.description.trim() || undefined,
  icon: serviceForm.icon.trim() || undefined,
  sortOrder: toRequiredNumber(serviceForm.sortOrder),
  isActive: serviceForm.isActive,
  duration: toRequiredNumber(serviceForm.duration, 60),
  progressTimeMinutes: toRequiredNumber(
    serviceForm.progressTimeMinutes,
    60
  ),
  minHours: toOptionalNumber(serviceForm.minHours),
  maxHours: toOptionalNumber(serviceForm.maxHours),
});

  // ==========================================================
  // SERVICE VALIDATION
  // ==========================================================

  const validateServiceForm = () => {
    if (!serviceForm.serviceName.trim()) {
      setError("Service name is required.");
      return false;
    }
    if (!serviceForm.servId.trim()) {
  setError("Service ID is required.");
  return false;
}

    if (
      Number(serviceForm.sortOrder) < 0 ||
      Number(serviceForm.duration) <= 0 ||
      Number(serviceForm.progressTimeMinutes) < 0 ||
      (serviceForm.minHours.trim() !== "" &&
        Number(serviceForm.minHours) < 0) ||
      (serviceForm.maxHours.trim() !== "" &&
        Number(serviceForm.maxHours) < 0)
    ) {
      setError("Please enter valid service values.");
      return false;
    }

    if (
      serviceForm.minHours.trim() !== "" &&
      serviceForm.maxHours.trim() !== "" &&
      Number(serviceForm.minHours) > Number(serviceForm.maxHours)
    ) {
      setError("Minimum hours cannot exceed maximum hours.");
      return false;
    }

    return true;
  };

  // ==========================================================
  // CREATE SERVICE
  // ==========================================================

  const handleCreateService = async () => {
    if (!selectedCategory || !validateServiceForm()) return;

    try {
      setSaving(true);
      setError("");

      await serviceApi.addServiceToCategory(
        selectedCategory._id,
         getServicePayload()
      );

      setModal(null);
        toast.success("Service added successfully.");
      await loadCategories();

      window.setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Create service error:", err);
      toast.error(getErrorMessage(err, "Failed to add service."));
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // UPDATE SERVICE
  // ==========================================================

  const handleUpdateService = async () => {
    if (!selectedCategory || !selectedService) return;

    if (!selectedService._id) {
      setError("Service ID is missing.");
      return;
    }

    if (!validateServiceForm()) return;

    try {
      setSaving(true);
      setError("");

      await serviceApi.updateServiceInCategory(
        selectedCategory._id,
        selectedService._id,
        getServicePayload()
      );

      setModal(null);
        toast.success("Service updated successfully.");
      await loadCategories();

      window.setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Update service error:", err);
      toast.error(getErrorMessage(err, "Failed to update service."));
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // DELETE SERVICE
  // ==========================================================

  const handleDeleteService = async (
    category: ServiceCatalogCategory,
    service: ServiceCatalogItem
  ) => {
    if (!service._id) {
      setError("Service ID is missing.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${service.name}"?`)) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await serviceApi.deleteServiceFromCategory(
        category._id,
        service._id
      );

        toast.success("Service deleted successfully.");
      await loadCategories();

      window.setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Delete service error:", err);
      toast.error(getErrorMessage(err, "Failed to delete service."));
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================================
  // EXPAND / COLLAPSE
  // ==========================================================

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((previous) => ({
      ...previous,
      [categoryId]: !previous[categoryId],
    }));
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="service-crud-page">
      {/* HEADER */}
      <div className="service-crud-header">
        <div>
          <button
            type="button"
            onClick={() => navigate("/services")}
            className="booking-back-btn"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="service-crud-title-row">
            <div className="service-crud-title-icon">
              <FolderPlus size={22} />
            </div>

            <div>
              <h1
                style={{
                  color: "#14344A",
                  fontSize: "34px",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                Service Catalog
              </h1>
              <p>Manage service categories and services available to customers.</p>
            </div>
          </div>
        </div>

        <div className="service-crud-header-actions">
          <button
            type="button"
            className="service-btn service-btn-secondary"
            onClick={() => void loadCategories(true)}
            disabled={loading || refreshing}
          >
            {refreshing ? (
              <Loader2 size={17} className="spin" />
            ) : (
              <RefreshCw size={17} />
            )}
            Refresh
          </button>

          <button
            type="button"
            className="service-btn service-btn-primary"
            onClick={openCreateCategory}
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>
      </div>

      {/* ALERTS */}
      {error && !modal && (
        <div className="service-alert service-alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} aria-label="Close error">
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="service-alert service-alert-success">
          <Check size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* STATS */}
      <div className="service-stats-grid">
        <div className="service-stat-card">
          <div className="service-stat-content">
            <span className="service-stat-label">Total Categories</span>
            <strong>{categories.length}</strong>
          </div>
          <div className="service-stat-icon"><FolderPlus size={21} /></div>
        </div>

        <div className="service-stat-card">
          <div className="service-stat-content">
            <span className="service-stat-label">Active Categories</span>
            <strong>{activeCategories}</strong>
          </div>
          <div className="service-stat-icon"><Check size={21} /></div>
        </div>

        <div className="service-stat-card">
          <div className="service-stat-content">
            <span className="service-stat-label">Total Services</span>
            <strong>{totalServices}</strong>
          </div>
          <div className="service-stat-icon"><Plus size={21} /></div>
        </div>

        <div className="service-stat-card">
          <div className="service-stat-content">
            <span className="service-stat-label">Active Services</span>
            <strong>{activeServices}</strong>
          </div>
          <div className="service-stat-icon"><Check size={21} /></div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="service-toolbar">
        <div className="service-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search categories, services or service ID..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} aria-label="Clear search">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* CATALOG */}
      {loading ? (
        <div className="service-loading">
          <Loader2 size={30} className="spin" />
          <span>Loading service catalog...</span>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="service-empty">
          <div className="service-empty-icon"><FolderPlus size={28} /></div>
          <h3>{search ? "No matching services found" : "No service categories found"}</h3>
          <p>
            {search
              ? "Try a different search term."
              : "Create your first service category to get started."}
          </p>
          {!search && (
            <button
              type="button"
              className="service-btn service-btn-primary"
              onClick={openCreateCategory}
            >
              <Plus size={18} />
              Add Category
            </button>
          )}
        </div>
      ) : (
        <div className="service-category-list">
          {filteredCategories.map((category) => {
            const expanded = expandedCategories[category._id] ?? true;
            const services = category.services || [];

            return (
              <div className="service-category-card" key={category._id}>
                {/* CATEGORY HEADER */}
                <div className="service-category-header">
                  <button
                    type="button"
                    className="service-expand-btn"
                    onClick={() => toggleCategory(category._id)}
                    aria-label={expanded ? "Collapse category" : "Expand category"}
                  >
                    {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>

                  <div className="service-category-icon">
                    {category.categoryId || "—"}
                  </div>

                  <div className="service-category-info">
                    <div className="service-category-name-row">
                      <h2>{category.categoryName}</h2>
                     
                        
                    </div>

                    <div className="service-category-meta">
                      <span>{services.length} service{services.length === 1 ? "" : "s"}</span>
                      
                     
                     
                    </div>
                  </div>

                  <div className="service-category-actions">
                    <button
                      type="button"
                      className="service-icon-btn"
                      title="Edit category"
                      onClick={() => openEditCategory(category)}
                    >
                      <Edit3 size={17} />
                    </button>

                    <button
                      type="button"
                      className="service-icon-btn service-icon-danger"
                      title="Delete category"
                      onClick={() => void handleDeleteCategory(category)}
                      disabled={deleting}
                    >
                      {deleting ? <Loader2 size={17} className="spin" /> : <Trash2 size={17} />}
                    </button>

                    <button
                      type="button"
                      className="service-btn service-btn-small service-btn-primary"
                      onClick={() => openCreateService(category)}
                    >
                      <Plus size={16} />
                      Add Service
                    </button>
                  </div>
                </div>

                {/* SERVICES */}
                {expanded && (
                  <div className="service-category-body">
                    {services.length === 0 ? (
                      <div className="service-no-services">
                        <span>No services in this category.</span>
                        <button type="button" onClick={() => openCreateService(category)}>
                          Add first service
                        </button>
                      </div>
                    ) : (
                      <div className="service-table-wrapper">
                        <table className="service-table">
                          <thead>
                            <tr>
                              <th>Service</th>
                              <th style={{textAlign:"center"}}>Service ID</th>
                              <th>Description</th>
                              <th style={{textAlign:"center"}}>Duration</th>
                              <th style={{textAlign:"center"}}>MinHours</th>
                               <th style={{textAlign:"center"}}>MaxHours</th>
                              <th>Status</th>
                              <th className="service-actions-column">Actions</th>
                            </tr>
                          </thead>

                          <tbody>
                            {services.map((service) => (
                              <tr key={service._id || service.servId}>
                                <td>
                                  <div className="service-name-cell">
                                    <div>
                                      <strong>{service.name}</strong>
                                    </div>
                                  </div>
                                </td>

                                <td style={{textAlign:"center"}}>
                                  <span className="service-id">{service.servId || "—"}</span>
                                </td>

                                <td>
                                  <div className="service-description">
                                    {service.description || "No description"}
                                  </div>
                                </td>

                                <td style={{textAlign:"center"}}>{service.duration ?? "—"} min</td>

                                <td style={{textAlign:"center"}}>
                                  {service.minHours ?? "—"} 
                                </td>
                                 <td style={{textAlign:"center"}}>
                                {service.maxHours ?? "—"}
                                </td>


                                <td>
                                  <span className={`service-status ${service.isActive === false ? "inactive" : "active"}`}>
                                    <span />
                                    {service.isActive === false ? "Inactive" : "Active"}
                                  </span>
                                </td>

                                <td>
                                  <div className="service-row-actions">
                                    <button
                                      type="button"
                                      className="service-icon-btn"
                                      title="Edit service"
                                      onClick={() => openEditService(category, service)}
                                    >
                                      <Edit3 size={16} />
                                    </button>

                                    <button
                                      type="button"
                                      className="service-icon-btn service-icon-danger"
                                      title="Delete service"
                                      onClick={() => void handleDeleteService(category, service)}
                                      disabled={deleting}
                                    >
                                      {deleting ? (
                                        <Loader2 size={16} className="spin" />
                                      ) : (
                                        <Trash2 size={16} />
                                      )}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {modal && (
        <div
          className="service-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="service-modal">
            <div className="service-modal-header">
              <div>
                <h2>
                  {modal === "create-category" && "Create Category"}
                  {modal === "edit-category" && "Edit Category"}
                  {modal === "create-service" && "Add Service"}
                  {modal === "edit-service" && "Edit Service"}
                </h2>
                <p>
                  {modal.includes("category")
                    ? "Configure the service category details."
                    : `Manage service under ${selectedCategory?.categoryName || "category"}.`}
                </p>
              </div>

              <button
                type="button"
                className="service-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="service-modal-error">
                <AlertCircle size={17} />
                <span>{error}</span>
              </div>
            )}

            {/* CATEGORY FORM */}
            {(modal === "create-category" || modal === "edit-category") && (
              <div className="service-form">
                <div className="service-form-field">
                  <label>Category Name <span>*</span></label>
                  <input
                    type="text"
                    value={categoryForm.categoryName}
                    placeholder="e.g. Home Care"
                    onChange={(event) =>
                      setCategoryForm((previous) => ({
                        ...previous,
                        categoryName: event.target.value,
                      }))
                    }
                    autoFocus
                  />
                </div>

                <div className="service-form-grid">
                  <div className="service-form-field">
                    <label>Category ID</label>
                    <input
                      type="text"
                      value={categoryForm.categoryId}
                      placeholder="e.g. CAT001"
                      onChange={(event) =>
                        setCategoryForm((previous) => ({
                          ...previous,
                          categoryId: event.target.value,
                        }))
                      }
                    />
                  </div>

                 
                </div>

                <div className="service-form-grid">
                 

                  <div className="service-form-field">
                    <label>Icon</label>
                    <input
                      type="text"
                      value={categoryForm.icon}
                      placeholder="Icon key"
                      onChange={(event) =>
                        setCategoryForm((previous) => ({
                          ...previous,
                          icon: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

               

               
             

                <label className="service-toggle-field">
                  <input
                    type="checkbox"
                    checked={categoryForm.isActive}
                    onChange={(event) =>
                      setCategoryForm((previous) => ({
                        ...previous,
                        isActive: event.target.checked,
                      }))
                    }
                  />
                  <span className="service-toggle-ui" />
                  <span>
                    <strong>Active category</strong>
                    <small>Category will be available in the catalog.</small>
                  </span>
                </label>
              </div>
            )}

            {/* SERVICE FORM */}
            {(modal === "create-service" || modal === "edit-service") && (
              <div className="service-form">
                <div className="service-parent-info">
                  <span>Category</span>
                  <strong>{selectedCategory?.categoryName || "—"}</strong>
                </div>

                <div className="service-form-field">
                  <label>Service Name <span>*</span></label>
                  <input
                    type="text"
                    value={serviceForm.serviceName}
                    placeholder="e.g. Personal Care"
                    onChange={(event) =>
                      setServiceForm((previous) => ({
                        ...previous,
                        serviceName: event.target.value,
                      }))
                    }
                    autoFocus
                  />
                </div>

                <div className="service-form-grid">
                  <div className="service-form-field">
                    <label>Service ID</label>
                    <input
                      type="text"
                      value={serviceForm.servId}
                      placeholder="e.g. S1A"
                      onChange={(event) =>
                        setServiceForm((previous) => ({
                          ...previous,
                          servId: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="service-form-field">
                    <label>Icon</label>
                    <input
                      type="text"
                      value={serviceForm.icon}
                      placeholder="Icon key"
                      onChange={(event) =>
                        setServiceForm((previous) => ({
                          ...previous,
                          icon: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="service-form-grid">
                  <div className="service-form-field">
                    <label>Sort Order</label>
                    <input
                      type="number"
                      min="0"
                      value={serviceForm.sortOrder}
                      onChange={(event) =>
                        setServiceForm((previous) => ({
                          ...previous,
                          sortOrder: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="service-form-field">
                    <label>Duration (Minutes)</label>
                    <input
                      type="number"
                      min="1"
                      value={serviceForm.duration}
                      onChange={(event) =>
                        setServiceForm((previous) => ({
                          ...previous,
                          duration: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="service-form-grid">
                  <div className="service-form-field">
                    <label>Progress Time (Minutes)</label>
                    <input
                      type="number"
                      min="0"
                      value={serviceForm.progressTimeMinutes}
                      onChange={(event) =>
                        setServiceForm((previous) => ({
                          ...previous,
                          progressTimeMinutes: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="service-form-field">
                    <label>Minimum Hours</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={serviceForm.minHours}
                      placeholder="e.g. 2"
                      onChange={(event) =>
                        setServiceForm((previous) => ({
                          ...previous,
                          minHours: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="service-form-field">
                  <label>Maximum Hours</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={serviceForm.maxHours}
                    placeholder="e.g. 8"
                    onChange={(event) =>
                      setServiceForm((previous) => ({
                        ...previous,
                        maxHours: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="service-form-field">
                  <label>Description</label>
                  <textarea
                    value={serviceForm.description}
                    placeholder="Enter service description..."
                    rows={4}
                    onChange={(event) =>
                      setServiceForm((previous) => ({
                        ...previous,
                        description: event.target.value,
                      }))
                    }
                  />
                </div>

                <label className="service-toggle-field">
                  <input
                    type="checkbox"
                    checked={serviceForm.isActive}
                    onChange={(event) =>
                      setServiceForm((previous) => ({
                        ...previous,
                        isActive: event.target.checked,
                      }))
                    }
                  />
                  <span className="service-toggle-ui" />
                  <span>
                    <strong>Active service</strong>
                    <small>Service will be available for booking.</small>
                  </span>
                </label>
              </div>
            )}

            {/* MODAL FOOTER */}
            <div className="service-modal-footer">
              <button
                type="button"
                className="service-btn service-btn-secondary"
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="service-btn service-btn-primary"
                disabled={saving}
                onClick={() => {
                  if (modal === "create-category") void handleCreateCategory();
                  if (modal === "edit-category") void handleUpdateCategory();
                  if (modal === "create-service") void handleCreateService();
                  if (modal === "edit-service") void handleUpdateService();
                }}
              >
                {saving ? (
                  <>
                    <Loader2 size={17} className="spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={17} />
                    {modal === "create-category" || modal === "create-service"
                      ? "Create"
                      : "Save Changes"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCrudScreen;
