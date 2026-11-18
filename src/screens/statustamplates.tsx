
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Smartphone,
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Layers,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  LayoutTemplate,
  X,
  Copy,
  Filter,
  Zap,
  ShieldCheck,
  Activity,
  Save,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-toastify";
import "./status.css";

import {
 type ServiceStatusTemplate,
  type TemplateApp,
  type TemplatePayload,
  type StatusMeta,
  getTemplateMeta,
  getTemplates,
  createTemplate,
  updateTemplate,
  toggleTemplateActive,
  deleteTemplate,
} from "../service/statustamplatesService";
import { FaArrowLeft } from "react-icons/fa6";

type AppTab = "provider" | "requestor";
type VariableTarget = "message" | "subMessage" | "pushBody";

const emptyForm: TemplatePayload = {
  key: "",
  event: "",
  app: "provider",
  title: "",
  message: "",
  subMessage: "",
  buttonLabel: "",
  openScreen: "",
  priority: 30,
  sendPush: false,
  showBanner: true,
  isActive: true,
  pushTitle: "",
  pushBody: "",
  description: "",
};

const normalizeList = (value: any): any[] => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.templates)) return value.templates;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return normalizeList(value.data);
  return [];
};

const getEventKey = (event: any) =>
  typeof event === "string" ? event : event?.key || event?.event || "";

const getEventLabel = (event: any) =>
  typeof event === "string"
    ? event
    : event?.label || event?.name || event?.key || event?.event || "";

const getScreenOptions = (meta: any, app: TemplateApp): any[] => {
  const screens = meta?.openScreens;

  if (Array.isArray(screens)) {
    return screens.filter((item: any) => {
      if (typeof item === "string") return true;
      return !item?.app || item.app === app;
    });
  }

  if (screens && typeof screens === "object") {
    const list = screens[app] || screens[app.toLowerCase()] || [];
    return Array.isArray(list) ? list : [];
  }

  return [];
};

const optionValue = (item: any) =>
  typeof item === "string"
    ? item
    : item?.key || item?.value || item?.name || "";

const optionLabel = (item: any) =>
  typeof item === "string"
    ? item
    : item?.label || item?.title || item?.name || item?.key || item?.value || "";

const variableName = (item: any) =>
  typeof item === "string"
    ? item.replace(/[{}]/g, "")
    : item?.name || item?.key || item?.variable || "";

const displayDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
};

const makeKey = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_.-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

const StatusTemplates: React.FC = () => {
    const navigate = useNavigate();
  const [templates, setTemplates] = useState<ServiceStatusTemplate[]>([]);
  const [meta, setMeta] = useState<StatusMeta>({
    events: [],
    apps: [],
    openScreens: {},
    variables: [],
  });

  const [activeApp, setActiveApp] = useState<AppTab>("provider");
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<ServiceStatusTemplate | null>(null);

  const [form, setForm] = useState<TemplatePayload>(emptyForm);
  const [variableTarget, setVariableTarget] =
    useState<VariableTarget>("message");

  // ============================
  // LOAD META
  // ============================
  const loadMeta = async () => {
    const response = await getTemplateMeta();

    const data =
      response?.meta ||
      response?.data?.meta ||
      response?.data ||
      response;

    setMeta({
      events: Array.isArray(data?.events) ? data.events : [],
      apps: Array.isArray(data?.apps)
        ? data.apps
        : ["provider", "requestor"],
      openScreens: data?.openScreens || {},
      variables: Array.isArray(data?.variables)
        ? data.variables
        : [],
    });
  };

  // ============================
  // LOAD TEMPLATES
  // ============================
  const loadTemplates = async (app: AppTab = activeApp) => {
    const response = await getTemplates({
      app,
      event: eventFilter || undefined,
    });

    const list = normalizeList(response);

    setTemplates(list);
  };

  // ============================
  // INITIAL / REFRESH LOAD
  // ============================
  const loadAll = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      await loadMeta();
      await loadTemplates(activeApp);
    } catch (error: any) {
      console.error("Service Status Templates load error:", error);
      toast.error(
        error?.message || "Failed to load service status templates"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload list when app/event changes
  useEffect(() => {
    if (!loading) {
      loadTemplates(activeApp).catch((error: any) => {
        toast.error(error?.message || "Failed to load templates");
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeApp, eventFilter]);

  // ============================
  // STATS
  // ============================
  const stats = useMemo(() => {
    const total = templates.length;
    const active = templates.filter((item) => item.isActive).length;
    const inactive = total - active;
    const defaults = templates.filter((item) => item.isDefault).length;
    const pushEnabled = templates.filter(
      (item) => item.sendPush
    ).length;

    return { total, active, inactive, defaults, pushEnabled };
  }, [templates]);

  // ============================
  // FILTERS
  // ============================
  const filteredTemplates = useMemo(() => {
    const query = search.toLowerCase().trim();

    return templates.filter((item) => {
      const matchesSearch =
        !query ||
        item.title?.toLowerCase().includes(query) ||
        item.message?.toLowerCase().includes(query) ||
        item.key?.toLowerCase().includes(query) ||
        item.event?.toLowerCase().includes(query) ||
        item.openScreen?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.isActive) ||
        (statusFilter === "inactive" && !item.isActive) ||
        (statusFilter === "default" && item.isDefault) ||
        (statusFilter === "custom" && !item.isDefault);

      return matchesSearch && matchesStatus;
    });
  }, [templates, search, statusFilter]);

  // ============================
  // FORM HELPERS
  // ============================
  const setField = <K extends keyof TemplatePayload>(
    field: K,
    value: TemplatePayload[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetEditor = () => {
    setEditingTemplate(null);
    setForm({ ...emptyForm, app: activeApp });
    setVariableTarget("message");
    setModalOpen(false);
  };

  const openCreateModal = () => {
    setEditingTemplate(null);
    setForm({ ...emptyForm, app: activeApp });
    setVariableTarget("message");
    setModalOpen(true);
  };

  const openEditModal = (item: ServiceStatusTemplate) => {
    setEditingTemplate(item);

    setForm({
      key: item.key || "",
      event: item.event || "",
      app: item.app || activeApp,
      title: item.title || "",
      message: item.message || "",
      subMessage: item.subMessage || "",
      buttonLabel: item.buttonLabel || "",
      openScreen: item.openScreen || "",
      priority: Number(item.priority ?? 30),
      sendPush: !!item.sendPush,
      showBanner: !!item.showBanner,
      isActive: !!item.isActive,
      pushTitle: item.pushTitle || "",
      pushBody: item.pushBody || "",
      description: item.description || "",
    });

    setVariableTarget("message");
    setModalOpen(true);
  };

  const insertVariable = (name: string) => {
    const token = `{{${name}}}`;

    setForm((prev) => ({
      ...prev,
      [variableTarget]: `${prev[variableTarget] || ""}${token}`,
    }));
  };

  const handleAppChange = (app: AppTab) => {
    setActiveApp(app);
    setEventFilter("");
    setStatusFilter("all");
    setSearch("");
  };

  // ============================
  // VALIDATION
  // ============================
  const validateForm = () => {
    if (!form.key.trim()) {
      toast.warning("Template key is required");
      return false;
    }

    if (!/^[a-z0-9_.-]+$/.test(form.key)) {
      toast.warning(
        "Key may contain lowercase letters, numbers, underscore, dot and hyphen only"
      );
      return false;
    }

    if (!form.event) {
      toast.warning("Please select an event");
      return false;
    }

    if (!form.title.trim()) {
      toast.warning("Title is required");
      return false;
    }

    if (form.title.length > 80) {
      toast.warning("Title cannot exceed 80 characters");
      return false;
    }

    if (!form.message.trim()) {
      toast.warning("Message is required");
      return false;
    }

    if (form.message.length > 200) {
      toast.warning("Message cannot exceed 200 characters");
      return false;
    }

    if ((form.subMessage || "").length > 200) {
      toast.warning("Sub message cannot exceed 200 characters");
      return false;
    }

    if ((form.buttonLabel || "").length > 40) {
      toast.warning("Button label cannot exceed 40 characters");
      return false;
    }

    if (!form.openScreen) {
      toast.warning("Please select an open screen");
      return false;
    }

    const priority = Number(form.priority);

    if (
      !Number.isInteger(priority) ||
      priority < 0 ||
      priority > 1000
    ) {
      toast.warning("Priority must be an integer between 0 and 1000");
      return false;
    }

    if ((form.pushTitle || "").length > 80) {
      toast.warning("Push title is too long");
      return false;
    }

    if ((form.pushBody || "").length > 200) {
      toast.warning("Push body cannot exceed 200 characters");
      return false;
    }

    return true;
  };

  // ============================
  // SAVE TEMPLATE
  // ============================
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload: TemplatePayload = {
        ...form,
        app: activeApp,
        priority: Number(form.priority),
        key: form.key.trim(),
        title: form.title.trim(),
        message: form.message.trim(),
        subMessage: (form.subMessage || "").trim(),
        buttonLabel: (form.buttonLabel || "").trim(),
        pushTitle: (form.pushTitle || "").trim(),
        pushBody: (form.pushBody || "").trim(),
        description: (form.description || "").trim(),
      };

      if (editingTemplate) {
        await updateTemplate(editingTemplate._id, payload);
        toast.success("Template updated successfully");
      } else {
        await createTemplate(payload);
        toast.success("Template created successfully");
      }

      resetEditor();
      await loadTemplates(activeApp);
    } catch (error: any) {
      console.error("Template save error:", error);
      toast.error(error?.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  // ============================
  // TOGGLE ACTIVE
  // ============================
  const handleToggle = async (item: ServiceStatusTemplate) => {
    try {
      setActionId(item._id);

      await toggleTemplateActive(item._id, !item.isActive);

      toast.success(
        item.isActive
          ? "Template deactivated"
          : "Template activated"
      );

      await loadTemplates(activeApp);
    } catch (error: any) {
      toast.error(error?.message || "Failed to change template status");
    } finally {
      setActionId(null);
    }
  };

  // ============================
  // DELETE CUSTOM TEMPLATE
  // ============================
  const handleDelete = async (item: ServiceStatusTemplate) => {
    if (item.isDefault) {
      toast.info("Default templates cannot be deleted. Deactivate them instead.");
      return;
    }

    const confirmed = window.confirm(
      `Delete custom template "${item.key}"?\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setActionId(item._id);
      await deleteTemplate(item._id);
      toast.success("Custom template deleted successfully");
      await loadTemplates(activeApp);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete template");
    } finally {
      setActionId(null);
    }
  };

  // ============================
  // COPY KEY
  // ============================
  const copyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      toast.success("Template key copied");
    } catch {
      toast.error("Unable to copy template key");
    }
  };

  const eventOptions = meta.events || [];
  const screenOptions = getScreenOptions(meta, activeApp);

  // ============================
  // UI
  // ============================
  return (
    <div className="sst-page">
      {/* HERO HEADER */}
      <div className="sst-hero">
        <div className="sst-hero-content">
          <div className="sst-hero-left">
            <div className="sst-hero-icon">
              <LayoutTemplate size={25} />
            </div>

            <div>
              <h1>Service Status Templates</h1>
              <p>
                Manage status cards, in-app banners and push notifications
                for Care Giver and Requestor apps.
              </p>
            </div>
          </div>

          <div className="sst-hero-actions">
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
            <button
              className="sst-btn sst-btn-light"
              onClick={() => loadAll(true)}
              disabled={refreshing}
            >
              <RefreshCw
                size={16}
                className={refreshing ? "sst-spin" : ""}
              />
              Refresh
            </button>


            <button
              className="sst-btn sst-btn-primary"
              onClick={openCreateModal}
            >
              <Plus size={17} />
              Create Template
            </button>
          </div>
        </div>

        <div className="sst-hero-bottom">
          <div className="sst-hero-feature">
            <Zap size={15} />
            <span>Dynamic template controls</span>
          </div>
          <div className="sst-hero-feature">
            <Bell size={15} />
            <span>Push notification management</span>
          </div>
          <div className="sst-hero-feature">
            <ShieldCheck size={15} />
            <span>Default template protection</span>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="sst-stats-grid">
        <div className="sst-stat-card">
          <div className="sst-stat-icon sst-stat-blue">
            <Layers size={20} />
          </div>
          <div>
            <span>Total Templates</span>
            <h2>{loading ? "—" : stats.total}</h2>
          </div>
        </div>

        <div className="sst-stat-card">
          <div className="sst-stat-icon sst-stat-green">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span>Active Templates</span>
            <h2>{loading ? "—" : stats.active}</h2>
          </div>
        </div>

        <div className="sst-stat-card">
          <div className="sst-stat-icon sst-stat-orange">
            <AlertCircle size={20} />
          </div>
          <div>
            <span>Inactive Templates</span>
            <h2>{loading ? "—" : stats.inactive}</h2>
          </div>
        </div>

        <div className="sst-stat-card">
          <div className="sst-stat-icon sst-stat-purple">
            <Send size={20} />
          </div>
          <div>
            <span>Push Enabled</span>
            <h2>{loading ? "—" : stats.pushEnabled}</h2>
          </div>
        </div>
      </div>

      {/* APP SELECTOR */}
      <div className="sst-app-switcher">
        <button
          className={`sst-app-tab ${
            activeApp === "provider" ? "active" : ""
          }`}
          onClick={() => handleAppChange("provider")}
        >
          <Smartphone size={18} />
          <span>Care Giver App</span>
          <small>
            {activeApp === "provider" ? templates.length : ""}
          </small>
        </button>

        <button
          className={`sst-app-tab ${
            activeApp === "requestor" ? "active" : ""
          }`}
          onClick={() => handleAppChange("requestor")}
        >
          <Smartphone size={18} />
          <span>Requestor App</span>
          <small>
            {activeApp === "requestor" ? templates.length : ""}
          </small>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="sst-filter-card">
        <div className="sst-filter-title">
          <div>
            <h2>Template Library</h2>
            <p>
              Browse and manage {activeApp} service status templates
            </p>
          </div>
          <div className="sst-result-count">
            {filteredTemplates.length} results
          </div>
        </div>

        <div className="sst-filter-controls">
          <div className="sst-search-box">
            <Search size={17} />
            <input
              placeholder="Search title, key, message or event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} title="Clear search">
                <X size={15} />
              </button>
            )}
          </div>

          <div className="sst-select-wrap">
            <Filter size={15} />
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
            >
              <option value="">All Events</option>
              {eventOptions.map((event: any) => (
                <option
                  key={getEventKey(event)}
                  value={getEventKey(event)}
                >
                  {getEventLabel(event)}
                </option>
              ))}
            </select>
            <ChevronDown size={14} />
          </div>

          <div className="sst-select-wrap">
            <Activity size={15} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Templates</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="default">Default Templates</option>
              <option value="custom">Custom Templates</option>
            </select>
            <ChevronDown size={14} />
          </div>
        </div>
      </div>

      {/* TEMPLATE LIST */}
      <div className="sst-template-list">
        {loading ? (
          <div className="sst-loading">
            <RefreshCw size={24} className="sst-spin" />
            <span>Loading service status templates...</span>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="sst-empty">
            <div className="sst-empty-icon">
              <LayoutTemplate size={30} />
            </div>
            <h3>No templates found</h3>
            <p>
              Try changing filters or create a new template for this app.
            </p>
            <button
              className="sst-btn sst-btn-primary"
              onClick={openCreateModal}
            >
              <Plus size={16} />
              Create Template
            </button>
          </div>
        ) : (
          filteredTemplates.map((item) => (
            <div
              className={`sst-template-card ${
                !item.isActive ? "sst-template-inactive" : ""
              }`}
              key={item._id}
            >
              <div className="sst-template-card-top">
                <div className="sst-template-title-area">
                  <div
                    className={`sst-template-icon ${
                      item.isActive ? "active" : "inactive"
                    }`}
                  >
                    {item.sendPush ? (
                      <Bell size={18} />
                    ) : (
                      <MessageSquare size={18} />
                    )}
                  </div>

                  <div className="sst-template-heading">
                    <div className="sst-template-title-line">
                      <h3>{item.title || "Untitled Template"}</h3>

                      {item.isDefault ? (
                        <span className="sst-badge sst-badge-default">
                          <ShieldCheck size={12} />
                          Default
                        </span>
                      ) : (
                        <span className="sst-badge sst-badge-custom">
                          Custom
                        </span>
                      )}

                      <span
                        className={`sst-badge ${
                          item.isActive
                            ? "sst-badge-active"
                            : "sst-badge-inactive"
                        }`}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="sst-template-key">
                      <span>{item.key}</span>
                      <button
                        onClick={() => copyKey(item.key)}
                        title="Copy template key"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="sst-template-actions">
                  <button
                    className="sst-icon-btn sst-edit-btn"
                    title="Edit template"
                    onClick={() => openEditModal(item)}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    className={`sst-icon-btn ${
                      item.isActive
                        ? "sst-disable-btn"
                        : "sst-enable-btn"
                    }`}
                    title={item.isActive ? "Deactivate" : "Activate"}
                    disabled={actionId === item._id}
                    onClick={() => handleToggle(item)}
                  >
                    {actionId === item._id ? (
                      <RefreshCw size={16} className="sst-spin" />
                    ) : item.isActive ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>

                  {!item.isDefault && (
                    <button
                      className="sst-icon-btn sst-delete-btn"
                      title="Delete custom template"
                      disabled={actionId === item._id}
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="sst-template-event-row">
                <span className="sst-event-pill">
                  <Zap size={12} />
                  {item.event}
                </span>
                <span className="sst-screen-pill">
                  <Smartphone size={12} />
                  {item.openScreen}
                </span>
                <span className="sst-priority-pill">
                  Priority: {item.priority}
                </span>
              </div>

              <div className="sst-preview">
                <div className="sst-preview-label">
                  <span className="sst-preview-dot" />
                  CARD PREVIEW
                </div>

                <div className="sst-preview-card">
                  <div className="sst-preview-card-header">
                    <span className="sst-preview-card-title">
                      {item.title}
                    </span>
                    <span className="sst-preview-counter">
                      Priority {item.priority}
                    </span>
                  </div>

                  <p className="sst-preview-message">{item.message}</p>

                  {item.subMessage && (
                    <p className="sst-preview-submessage">
                      {item.subMessage}
                    </p>
                  )}

                  {item.buttonLabel && (
                    <span className="sst-preview-button">
                      {item.buttonLabel}
                    </span>
                  )}
                </div>
              </div>

              <div className="sst-template-footer">
                <div className="sst-template-flags">
                  <span
                    className={`sst-flag ${
                      item.showBanner ? "flag-on" : "flag-off"
                    }`}
                  >
                    {item.showBanner ? (
                      <Eye size={13} />
                    ) : (
                      <EyeOff size={13} />
                    )}
                    {item.showBanner ? "Banner Visible" : "History Only"}
                  </span>

                  <span
                    className={`sst-flag ${
                      item.sendPush ? "flag-on" : "flag-off"
                    }`}
                  >
                    <Bell size={13} />
                    {item.sendPush ? "Push Enabled" : "Push Disabled"}
                  </span>
                </div>

                <div className="sst-updated">
                  Updated {displayDate(item.updatedAt)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div
          className="sst-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) resetEditor();
          }}
        >
          <div className="sst-modal">
            <div className="sst-modal-header">
              <div className="sst-modal-heading">
                <div className="sst-modal-icon">
                  {editingTemplate ? (
                    <Pencil size={20} />
                  ) : (
                    <Plus size={20} />
                  )}
                </div>
                <div>
                  <h2>
                    {editingTemplate ? "Edit Template" : "Create Template"}
                  </h2>
                  <p>
                    Configure service status card and notification content
                  </p>
                </div>
              </div>

              <button
                className="sst-modal-close"
                onClick={resetEditor}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            <div className="sst-modal-body">
              {/* Basic Information */}
              <div className="sst-form-section">
                <div className="sst-section-heading">
                  <span className="sst-section-number">01</span>
                  <div>
                    <h3>Basic Information</h3>
                    <p>Identify the template and event</p>
                  </div>
                </div>

                <div className="sst-form-grid">
                  <div className="sst-form-field">
                    <label>App <span>*</span></label>
                    <select
                      value={form.app}
                      disabled={!!editingTemplate}
                      onChange={(e) => {
                        const app = e.target.value as TemplateApp;
                        setField("app", app);
                        setField("event", "");
                        setField("openScreen", "");
                      }}
                    >
                      <option value="provider">Provider</option>
                      <option value="requestor">Requestor</option>
                    </select>
                  </div>

                  <div className="sst-form-field">
                    <label>Event <span>*</span></label>
                    <select
                      value={form.event}
                      onChange={(e) => setField("event", e.target.value)}
                    >
                      <option value="">Select Event</option>
                      {meta.events.map((event: any) => {
                        const key = getEventKey(event);
                        return (
                          <option key={key} value={key}>
                            {getEventLabel(event)}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="sst-form-field sst-field-full">
                    <label>Template Key <span>*</span></label>
                    <input
                      value={form.key}
                      disabled={!!editingTemplate}
                      maxLength={100}
                      placeholder="e.g. provider.visit_arrived_extra"
                      onChange={(e) =>
                        setField("key", makeKey(e.target.value))
                      }
                    />
                    <small>
                      Lowercase letters, numbers, underscore, dot and hyphen.
                      {editingTemplate && " Key cannot be changed after creation."}
                    </small>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="sst-form-section">
                <div className="sst-section-heading">
                  <span className="sst-section-number">02</span>
                  <div>
                    <h3>Floating Card Content</h3>
                    <p>Text shown inside the application status card</p>
                  </div>
                </div>

                <div className="sst-form-grid">
                  <div className="sst-form-field">
                    <label>Card Title <span>*</span></label>
                    <input
                      maxLength={80}
                      value={form.title}
                      placeholder="e.g. Active Visit"
                      onChange={(e) => setField("title", e.target.value)}
                    />
                    <div className="sst-char-count">{form.title.length}/80</div>
                  </div>

                  <div className="sst-form-field">
                    <label>Button Label</label>
                    <input
                      maxLength={40}
                      value={form.buttonLabel}
                      placeholder="Optional action button"
                      onChange={(e) =>
                        setField("buttonLabel", e.target.value)
                      }
                    />
                    <div className="sst-char-count">
                      {(form.buttonLabel || "").length}/40
                    </div>
                  </div>

                  <div className="sst-form-field sst-field-full">
                    <label>Main Message <span>*</span></label>
                    <textarea
                      rows={3}
                      maxLength={200}
                      value={form.message}
                      placeholder="Enter the main status message..."
                      onChange={(e) => setField("message", e.target.value)}
                    />
                    <div className="sst-char-count">{form.message.length}/200</div>
                  </div>

                  <div className="sst-form-field sst-field-full">
                    <label>Sub Message</label>
                    <textarea
                      rows={2}
                      maxLength={200}
                      value={form.subMessage}
                      placeholder="Optional secondary message..."
                      onChange={(e) =>
                        setField("subMessage", e.target.value)
                      }
                    />
                    <div className="sst-char-count">
                      {(form.subMessage || "").length}/200
                    </div>
                  </div>

                  <div className="sst-form-field">
                    <label>Open Screen <span>*</span></label>
                    <select
                      value={form.openScreen}
                      onChange={(e) =>
                        setField("openScreen", e.target.value)
                      }
                    >
                      <option value="">Select screen</option>
                      {screenOptions.map((screen: any) => (
                        <option
                          key={optionValue(screen)}
                          value={optionValue(screen)}
                        >
                          {optionLabel(screen)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sst-form-field">
                    <label>Priority (0–1000) <span>*</span></label>
                    <input
                      type="number"
                      min={0}
                      max={1000}
                      step={1}
                      value={form.priority}
                      onChange={(e) =>
                        setField(
                          "priority",
                          e.target.value === "" ? 0 : Number(e.target.value)
                        )
                      }
                    />
                    <small>Lower priority number appears earlier.</small>
                  </div>
                </div>
              </div>

              {/* Variables */}
              <div className="sst-form-section">
                <div className="sst-section-heading">
                  <span className="sst-section-number">03</span>
                  <div>
                    <h3>Dynamic Variables</h3>
                    <p>Click a variable to insert it into the selected field</p>
                  </div>
                </div>

                <div className="sst-variable-insert-toolbar">
                  <label>Insert into</label>
                  <select
                    value={variableTarget}
                    onChange={(e) =>
                      setVariableTarget(e.target.value as VariableTarget)
                    }
                  >
                    <option value="message">Main Message</option>
                    <option value="subMessage">Sub Message</option>
                    <option value="pushBody">Push Body</option>
                  </select>
                </div>

                <div className="sst-variables-list">
                  {meta.variables.length === 0 ? (
                    <span className="sst-no-variables">
                      No variables returned by meta API.
                    </span>
                  ) : (
                    meta.variables.map((variable: any, index: number) => {
                      const name = variableName(variable);
                      if (!name) return null;

                      return (
                        <button
                          key={`${name}-${index}`}
                          type="button"
                          className="sst-variable-chip"
                          onClick={() => insertVariable(name)}
                          title={`Insert {{${name}}}`}
                        >
                          <Plus size={12} />
                          {`{{${name}}}`}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Push Settings */}
              <div className="sst-form-section">
                <div className="sst-section-heading">
                  <span className="sst-section-number">04</span>
                  <div>
                    <h3>Push Notification</h3>
                    <p>Configure phone push notification content</p>
                  </div>
                </div>

                <div className="sst-toggle-row">
                  <div className="sst-toggle-info">
                    <div className="sst-toggle-icon">
                      <Bell size={17} />
                    </div>
                    <div>
                      <strong>Send Push Notification</strong>
                      <span>Send a push notification when this template triggers</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.sendPush}
                    className={`sst-switch ${form.sendPush ? "on" : ""}`}
                    onClick={() => setField("sendPush", !form.sendPush)}
                  >
                    <span />
                  </button>
                </div>

                {form.sendPush && (
                  <div className="sst-form-grid sst-push-fields">
                    <div className="sst-form-field">
                      <label>Push Title</label>
                      <input
                        value={form.pushTitle}
                        maxLength={80}
                        placeholder="Defaults to card title"
                        onChange={(e) =>
                          setField("pushTitle", e.target.value)
                        }
                      />
                    </div>

                    <div className="sst-form-field sst-field-full">
                      <label>Push Body</label>
                      <textarea
                        rows={3}
                        maxLength={200}
                        value={form.pushBody}
                        placeholder="Defaults to card message"
                        onChange={(e) =>
                          setField("pushBody", e.target.value)
                        }
                      />
                      <div className="sst-char-count">
                        {(form.pushBody || "").length}/200
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Visibility */}
              <div className="sst-form-section">
                <div className="sst-section-heading">
                  <span className="sst-section-number">05</span>
                  <div>
                    <h3>Template Behavior</h3>
                    <p>Control card visibility and template activation</p>
                  </div>
                </div>

                <div className="sst-behavior-grid">
                  <div className="sst-toggle-row">
                    <div className="sst-toggle-info">
                      <div className="sst-toggle-icon">
                        <Eye size={17} />
                      </div>
                      <div>
                        <strong>Show Floating Banner</strong>
                        <span>
                          When off, status is saved in history only
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.showBanner}
                      className={`sst-switch ${
                        form.showBanner ? "on" : ""
                      }`}
                      onClick={() =>
                        setField("showBanner", !form.showBanner)
                      }
                    >
                      <span />
                    </button>
                  </div>

                  <div className="sst-toggle-row">
                    <div className="sst-toggle-info">
                      <div className="sst-toggle-icon">
                        <Activity size={17} />
                      </div>
                      <div>
                        <strong>Template Active</strong>
                        <span>Inactive templates will not trigger</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.isActive}
                      className={`sst-switch ${
                        form.isActive ? "on" : ""
                      }`}
                      onClick={() => setField("isActive", !form.isActive)}
                    >
                      <span />
                    </button>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="sst-form-section">
                <div className="sst-section-heading">
                  <span className="sst-section-number">06</span>
                  <div>
                    <h3>Admin Notes</h3>
                    <p>Internal description for administrators only</p>
                  </div>
                </div>

                <div className="sst-form-field">
                  <label>Description</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    placeholder="Add internal notes about this template..."
                    onChange={(e) =>
                      setField("description", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="sst-modal-preview-section">
                <div className="sst-section-heading">
                  <span className="sst-section-number">↗</span>
                  <div>
                    <h3>Live Preview</h3>
                    <p>Approximate preview of the floating status card</p>
                  </div>
                </div>

                <div className="sst-preview-card sst-modal-preview">
                  <div className="sst-preview-card-header">
                    <span className="sst-preview-card-title">
                      {form.title || "Card Title"}
                    </span>
                    <span className="sst-preview-counter">
                      Priority {form.priority}
                    </span>
                  </div>

                  <p className="sst-preview-message">
                    {form.message || "Your status message will appear here."}
                  </p>

                  {form.subMessage && (
                    <p className="sst-preview-submessage">
                      {form.subMessage}
                    </p>
                  )}

                  {form.buttonLabel && (
                    <span className="sst-preview-button">
                      {form.buttonLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="sst-modal-footer">
              <button
                className="sst-btn sst-btn-cancel"
                onClick={resetEditor}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="sst-btn sst-btn-primary sst-save-template"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <RefreshCw size={16} className="sst-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {editingTemplate ? "Update Template" : "Create Template"}
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

export default StatusTemplates;


