import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  Search,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileBadge,
  Layers,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  getLicenses,
  createLicense,
  updateLicense,
  deleteLicense,
} from "../service/licenseservice";
import type {
  License,
  LicensePayload,
  LicensePagination,
} from "../service/licenseservice";

import "./license.css";
import { FaArrowLeft } from "react-icons/fa";

const DEFAULT_PAGINATION: LicensePagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

const emptyForm = (): LicensePayload => ({
  name: "",
  code: "",
  description: "",
  status: true,
});

const LicenseManagement: React.FC = () => {
  const navigate = useNavigate();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [pagination, setPagination] =
    useState<LicensePagination>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);

  const [form, setForm] = useState<LicensePayload>(emptyForm());
  const [errors, setErrors] = useState<{ name?: string; code?: string }>({});

  const [actionId, setActionId] = useState<string | null>(null);

  // Guards against out-of-order responses
  const requestIdRef = useRef(0);

  const total = pagination.total;
  const totalPages = pagination.totalPages;

  // FETCH LICENSES
  const fetchLicenses = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);

      const response = await getLicenses({
        search: search.trim(),
        status: statusFilter,
        page,
        limit,
      });

      if (requestId !== requestIdRef.current) return;

      console.log("LICENSE RESPONSE:", response);

      const data: License[] = Array.isArray(response) ? response : [];

      setLicenses(data);

      // Temporary pagination fallback
      const total = data.length;
      const totalPages = Math.ceil(total / limit) || 1;

      setPagination({
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      });

    } catch (error: any) {
      if (requestId !== requestIdRef.current) return;

      console.error("LICENSE FETCH ERROR:", error);
      toast.error(error?.message || "Unable to fetch licenses");

    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [search, statusFilter, page, limit]);



  // FETCH ON SEARCH / FILTER / PAGE CHANGE
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLicenses();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchLicenses]);



  // RESET FORM
  const resetForm = () => {
    setForm(emptyForm());
    setErrors({});
    setEditingLicense(null);
  };

  // OPEN ADD MODAL
  const handleAdd = () => {
    resetForm();
    setModalOpen(true);
  };

  // OPEN EDIT MODAL
  const handleEdit = (license: License) => {
    setEditingLicense(license);

    setForm({
      name: license.name,
      code: license.code,
      description: license.description || "",
      status: license.status,
    });

    setErrors({});
    setModalOpen(true);
  };

  // FORM VALIDATION
  const validateForm = () => {
    const newErrors: typeof errors = {};
    const name = (form.name || "").trim();
    const code = (form.code || "").trim();

    if (!name) {
      newErrors.name = "License name is required";
    }

    if (!code) {
      newErrors.code = "License code is required";
    } else if (!/^[A-Z0-9_-]+$/i.test(code)) {
      newErrors.code = "Only letters, numbers, - and _ allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // INPUT HANDLER
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "code" ? value.toUpperCase() : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  // SAVE LICENSE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload: LicensePayload = {
      name: (form.name || "").trim(),
      code: (form.code || "").trim().toUpperCase(),
      description: (form.description || "").trim(),
      status: editingLicense ? !!form.status : true,
    };

    try {
      setSaving(true);

      if (editingLicense) {
        await updateLicense(editingLicense._id, payload);
        toast.success("License updated successfully");
      } else {
        await createLicense(payload);
        toast.success("License added successfully");
      }

      const wasCreating = !editingLicense;

      setModalOpen(false);
      resetForm();

      if (wasCreating && page !== 1) {
        setPage(1); // triggers refetch
      } else {
        fetchLicenses();
      }
    } catch (error: any) {
      const message: string = error?.message || "Unable to save license";

      // Surface duplicate-code errors on the field
      if (/code/i.test(message) && /(exist|duplicate|already|unique)/i.test(message)) {
        setErrors((prev) => ({ ...prev, code: message }));
      } else {
        toast.error(message);
      }
    } finally {
      setSaving(false);
    }
  };

  // ACTIVATE / DEACTIVATE (toggle via update)
  const handleStatusChange = async (license: License) => {
    const action = license.status ? "deactivate" : "activate";

    if (!window.confirm(`Are you sure you want to ${action} ${license.name}?`))
      return;

    try {
      setActionId(license._id);

      await updateLicense(license._id, { status: !license.status });

      toast.success(`License ${action}d successfully`);
      fetchLicenses();
    } catch (error: any) {
      toast.error(error?.message || "Unable to update status");
    } finally {
      setActionId(null);
    }
  };

  // DELETE (soft delete / deactivate via API)
  const handleDelete = async (license: License) => {
    if (
      !window.confirm(`Are you sure you want to deactivate ${license.name}?`)
    )
      return;

    try {
      setActionId(license._id);

      await deleteLicense(license._id);

      toast.success("License deactivated successfully");
      fetchLicenses();
    } catch (error: any) {
      toast.error(error?.message || "Unable to deactivate license");
    } finally {
      setActionId(null);
    }
  };

  // FILTER / SEARCH
  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const clearSearch = () => {
    setSearch("");
    setPage(1);
  };

  // SORT LICENSES ALPHABETICALLY (A-Z)
const sortedLicenses = [...licenses].sort((a, b) =>
  (a.name || "").localeCompare(b.name || "", undefined, {
    sensitivity: "base",
  })
);
  // STATS (current page only)
  const activeCount = licenses.filter((item) => item.status).length;
  const inactiveCount = licenses.filter((item) => !item.status).length;

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    resetForm();
  };

  const currentPage = pagination.page || page;
  const pageSize = pagination.limit || limit;
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, total);

  return (
    <div className="license-page">
      {/* PAGE HEADER */}
      <div className="license-header">
        <div className="license-header-left">
          <div className="license-header-icon">
            <Award size={27} />
          </div>

          <div>
            <div className="license-breadcrumb">
              Admin Panel <span>/</span> Management <span>/</span> Licenses
            </div>

            <h1>License Management</h1>

            <p>
              Manage caregiver license types and maintain your license master
              list.
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "3px" }}>
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
          <button className="license-add-btn" onClick={handleAdd}>
            <Plus size={19} />
            Add New License
          </button>
        </div>

      </div>

      {/* STATS */}
      <div className="license-stats">
        <div className="license-stat-card">
          <div className="license-stat-top">
            <div className="license-stat-icon blue">
              <Layers size={21} />
            </div>
            <span className="license-stat-label">Total Records</span>
          </div>
          <h2>{total}</h2>
          <p>All license types</p>
        </div>

        <div className="license-stat-card">
          <div className="license-stat-top">
            <div className="license-stat-icon green">
              <CheckCircle2 size={21} />
            </div>
            <span className="license-stat-label">Active</span>
          </div>
          <h2>{activeCount}</h2>
          <p>Active on current page</p>
        </div>

        <div className="license-stat-card">
          <div className="license-stat-top">
            <div className="license-stat-icon orange">
              <XCircle size={21} />
            </div>
            <span className="license-stat-label">Inactive</span>
          </div>
          <h2>{inactiveCount}</h2>
          <p>Inactive on current page</p>
        </div>

        <div className="license-stat-card">
          <div className="license-stat-top">
            <div className="license-stat-icon purple">
              <ShieldCheck size={21} />
            </div>
            <span className="license-stat-label">Master Records</span>
          </div>
          <h2>{total}</h2>
          <p>License master database</p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="license-content">
        <div className="license-content-heading">
          <div>
            <h2>
              <FileBadge size={21} />
              All Licenses
            </h2>
            <p>View, search and manage your license records.</p>
          </div>

          <button
            className="license-refresh-btn"
            onClick={() => fetchLicenses()}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "license-spin" : ""} />
            Refresh
          </button>


        </div>

        {/* FILTERS */}
        <div className="license-toolbar">
          <div className="license-search">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search by license name or code..."
              value={search}
              onChange={handleSearch}
            />
            {search && (
              <button type="button" onClick={clearSearch}>
                <X size={16} />
              </button>
            )}
          </div>

          <div className="license-filter">
            <Filter size={17} />
            <select value={statusFilter} onChange={handleStatusFilter}>
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="license-record-count">{total} Records</div>
        </div>

        {/* TABLE */}
        <div className="license-table-wrapper">
          <table className="license-table">
            <thead>
              <tr>
                <th>LICENSE INFORMATION</th>
                <th>LICENSE CODE</th>
                <th>DESCRIPTION</th>
                <th>STATUS</th>
                <th>CREATED DATE</th>
                <th className="license-action-heading">ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="license-loading">
                      <RefreshCw size={25} className="license-spin" />
                      <span>Loading licenses...</span>
                    </div>
                  </td>
                </tr>
              ) : licenses.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="license-empty">
                      <div className="license-empty-icon">
                        <FileBadge size={30} />
                      </div>
                      <h3>No Licenses Found</h3>
                      <p>
                        {search || statusFilter
                          ? "Try changing your search or filters."
                          : "Start by adding your first license type."}
                      </p>

                      {!search && !statusFilter && (
                        <button onClick={handleAdd}>
                          <Plus size={16} /> Add License
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
              sortedLicenses.map((license, index) => (
                  <tr key={license._id}>
                    <td>
                      <div className="license-name-cell">
                        <div className="license-row-icon">
                          <Award size={20} />
                        </div>

                        <div>
                          <strong>{license.name}</strong>
                          <span>
                            License #{(currentPage - 1) * pageSize + index + 1}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="license-code">{license.code}</span>
                    </td>

                    <td>
                      <div className="license-description">
                        {license.description || "—"}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`license-status ${license.status ? "active" : "inactive"
                          }`}
                      >
                        <span />
                        {license.status ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <div className="license-date">
                        <Clock size={14} />
                        {license.createdAt
                          ? new Date(license.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "2-digit",
                              year: "numeric",
                            }
                          )
                          : "—"}
                      </div>
                    </td>

                    <td>
                      <div className="license-actions">
                        <button
                          className="license-action edit"
                          title="Edit License"
                          onClick={() => handleEdit(license)}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className={`license-action ${license.status ? "deactivate" : "activate"
                            }`}
                          title={license.status ? "Deactivate" : "Activate"}
                          disabled={actionId === license._id}
                          onClick={() => handleStatusChange(license)}
                        >
                          {license.status ? (
                            <XCircle size={16} />
                          ) : (
                            <CheckCircle2 size={16} />
                          )}
                        </button>

                        {license.status && (
                          <button
                            className="license-action delete"
                            title="Deactivate License"
                            disabled={actionId === license._id}
                            onClick={() => handleDelete(license)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="license-pagination">
          <span>
            Showing{" "}
            <strong>
              {rangeStart} - {rangeEnd}
            </strong>{" "}
            of <strong>{total}</strong> licenses
          </span>

          <div className="license-pagination-controls">
            <button
              disabled={!pagination.hasPrevPage || loading}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              <ChevronLeft size={17} />
              Previous
            </button>

            <span className="license-page-number">
              {currentPage} / {Math.max(totalPages, 1)}
            </span>

            <button
              disabled={!pagination.hasNextPage || loading}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div
          className="license-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="license-modal">
            <div className="license-modal-header">
              <div className="license-modal-title">
                <div className="license-modal-icon">
                  {editingLicense ? <Pencil size={22} /> : <Plus size={22} />}
                </div>

                <div>
                  <h2>{editingLicense ? "Edit License" : "Add New License"}</h2>
                  <p>
                    {editingLicense
                      ? "Update license information below."
                      : "Enter details to create a new license type."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="license-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="license-modal-body">
                <div className="license-form-group">
                  <label>
                    License Name <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Advanced Home Health Aide"
                    value={form.name || ""}
                    onChange={handleChange}
                    maxLength={120}
                    className={errors.name ? "input-error" : ""}
                  />

                  {errors.name && (
                    <small className="license-error">
                      <AlertCircle size={13} />
                      {errors.name}
                    </small>
                  )}
                </div>

                <div className="license-form-group">
                  <label>
                    License Code <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="code"
                    placeholder="e.g. AHHA"
                    value={form.code || ""}
                    onChange={handleChange}
                    maxLength={20}
                    className={errors.code ? "input-error" : ""}
                  />

                  {errors.code && (
                    <small className="license-error">
                      <AlertCircle size={13} />
                      {errors.code}
                    </small>
                  )}

                  <small className="license-hint">
                    Unique short code for identifying the license.
                  </small>
                </div>

                <div className="license-form-group">
                  <label>Description</label>

                  <textarea
                    name="description"
                    placeholder="Enter license description..."
                    value={form.description || ""}
                    onChange={handleChange}
                    rows={4}
                    maxLength={500}
                  />
                  <small className="license-hint">
                    Optional information about this license.
                  </small>
                </div>

                {editingLicense && (
                  <div className="license-form-status">
                    <div>
                      <strong>License Status</strong>
                      <p>Control whether this license is active.</p>
                    </div>

                    <label className="license-toggle">
                      <input
                        type="checkbox"
                        checked={!!form.status}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            status: e.target.checked,
                          }))
                        }
                      />
                      <span className="license-toggle-slider" />
                    </label>
                  </div>
                )}

                {!editingLicense && (
                  <div className="license-info-note">
                    <ShieldCheck size={19} />
                    <span>
                      New licenses will be created with Active status.
                      State-wise requirements can be configured separately.
                    </span>
                  </div>
                )}
              </div>

              <div className="license-modal-footer">
                <button
                  type="button"
                  className="license-cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="license-save-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw size={17} className="license-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingLicense ? (
                        <Pencil size={17} />
                      ) : (
                        <Plus size={18} />
                      )}
                      {editingLicense ? "Update License" : "Create License"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LicenseManagement;