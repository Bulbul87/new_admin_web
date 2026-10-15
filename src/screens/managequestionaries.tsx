import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import "./questionaries.css";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  AlignLeft,
  ArrowDown,
  ArrowUp,
  BookOpen,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
 ArrowLeft,
  CircleDot,
  CircleHelp,
  ClipboardList,
  Copy,
  Eye,
  FileText,
  Info,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ToggleLeft,
  Trash2,
  Type,
  X,
} from "lucide-react";

import { api } from "../service/api";

import {
  getCareNeedsTemplates,
  createCareNeedsTemplate,
  updateCareNeedsTemplate,
  deleteCareNeedsTemplate,
  type CareNeedsField,
  type CareNeedsFieldKind,
  type CareNeedsTemplate,
  type CareNeedsTemplatePayload,
} from "../service/questionaries.service";

// ==================== TYPES ====================

interface CatalogService {
  servId: string;
  name: string;
  description?: string;
}

interface CatalogCategory {
  _id?: string;
  categoryId: string;
  categoryName: string;
  services: CatalogService[];
}

interface TemplateForm {
  categoryId: string;
  serviceId: string;
  matchKeys: string;
  parentTitle: string;
  serviceTitle: string;
  serviceNote: string;
  intro: string;
  isActive: boolean;
  fields: CareNeedsField[];
}

type Notice = {
  type: "success" | "error";
  message: string;
} | null;

type EditorTab = "details" | "questions" | "preview";
type ViewTab = "overview" | "preview";
type SortKey = "default" | "name" | "questions" | "active";

interface ConfirmState {
  title: string;
  message: string;
  confirmLabel: string;
  tone: "danger" | "primary";
  onConfirm: () => void | Promise<void>;
}

const EMPTY_FORM: TemplateForm = {
  categoryId: "",
  serviceId: "",
  matchKeys: "",
  parentTitle: "",
  serviceTitle: "",
  serviceNote: "",
  intro: "",
  isActive: true,
  fields: [],
};

const FIELD_TYPES: {
  value: CareNeedsFieldKind;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "text",
    label: "Text input",
    description: "Short one-line answer",
    icon: <Type size={17} />,
  },
  {
    value: "checkbox",
    label: "Checkbox",
    description: "Pick one or more options",
    icon: <CheckSquare size={17} />,
  },
  {
    value: "radio",
    label: "Radio buttons",
    description: "Pick exactly one option",
    icon: <CircleDot size={17} />,
  },
  {
    value: "yesNo",
    label: "Yes / No",
    description: "Simple two-way choice",
    icon: <ToggleLeft size={17} />,
  },
  {
    value: "yesNoDontKnow",
    label: "Yes / No / Don't know",
    description: "Three-way choice",
    icon: <CircleHelp size={17} />,
  },
  {
    value: "address",
    label: "Address",
    description: "Street, city, state, ZIP",
    icon: <MapPin size={17} />,
  },
  {
    value: "milesSlider",
    label: "Miles slider",
    description: "Distance range",
    icon: <SlidersHorizontal size={17} />,
  },
  {
    value: "remarks",
    label: "Remarks / Long text",
    description: "Multi-line answer",
    icon: <AlignLeft size={17} />,
  },
];

const OPTION_TYPES: CareNeedsFieldKind[] = ["checkbox", "radio"];

const getTypeMeta = (kind: CareNeedsFieldKind) =>
  FIELD_TYPES.find((type) => type.value === kind);

// ==================== HELPERS ====================

const normalizeCatalog = (value: unknown): CatalogCategory[] => {
  if (Array.isArray(value)) {
    return value as CatalogCategory[];
  }

  if (value && typeof value === "object") {
    const object = value as {
      data?: unknown;
      categories?: unknown;
    };

    if (Array.isArray(object.data)) {
      return object.data as CatalogCategory[];
    }

    if (Array.isArray(object.categories)) {
      return object.categories as CatalogCategory[];
    }
  }

  return [];
};

const normalizeTemplates = (value: unknown): CareNeedsTemplate[] => {
  if (Array.isArray(value)) {
    return value as CareNeedsTemplate[];
  }

  if (value && typeof value === "object") {
    const object = value as {
      data?: unknown;
    };

    if (Array.isArray(object.data)) {
      return object.data as CareNeedsTemplate[];
    }
  }

  return [];
};

const createEmptyField = (
  kind: CareNeedsFieldKind = "text"
): CareNeedsField => ({
  id: "",
  kind,
  label: "",
  hint: "",
  placeholder: "",
  required: false,
  options: [],
  exclusiveOptions: [],
  columns: 1,
  minMiles: 0,
  maxMiles: 100,
  defaultMiles: 0,
  midMiles: 50,
});

const makeFieldId = (label: string, index: number): string => {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return slug || `question_${index + 1}`;
};

const effectiveFieldId = (field: CareNeedsField, index: number): string =>
  (field.id ?? "").trim() || makeFieldId(field.label ?? "", index);

const normalizeField = (field: CareNeedsField): CareNeedsField => ({
  ...field,
  options: field.options ?? [],
  exclusiveOptions: field.exclusiveOptions ?? [],
  required: field.required ?? false,
});

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};

const templateToPayload = (
  template: CareNeedsTemplate
): CareNeedsTemplatePayload => ({
  categoryId: template.categoryId,
  serviceId: template.serviceId,
  matchKeys: template.matchKeys ?? [],
  parentTitle: template.parentTitle ?? "",
  serviceTitle: template.serviceTitle ?? "",
  serviceNote: template.serviceNote ?? "",
  intro: template.intro ?? "",
  isActive: template.isActive ?? true,
  fields: (template.fields ?? []).map(normalizeField),
});

/** One issue (or null) per question — used for live hints and for save validation. */
const getFieldIssues = (fields: CareNeedsField[]): (string | null)[] => {
  const used = new Set<string>();

  return fields.map((field, index) => {
    const id = effectiveFieldId(field, index);
    let issue: string | null = null;

    if (!(field.label ?? "").trim()) {
      issue = "Add a question label.";
    } else if (used.has(id)) {
      issue = `ID "${id}" is already used by another question.`;
    } else if (
      OPTION_TYPES.includes(field.kind) &&
      !(field.options ?? []).some((option) => option.trim())
    ) {
      issue = "Add at least one option.";
    } else if (
      field.kind === "milesSlider" &&
      Number(field.minMiles ?? 0) > Number(field.maxMiles ?? 100)
    ) {
      issue = "Minimum miles cannot exceed maximum miles.";
    }

    used.add(id);
    return issue;
  });
};

const countRequired = (fields?: CareNeedsField[]): number =>
  (fields ?? []).filter((field) => field.required).length;

// ==================== MAIN COMPONENT ====================

const Questionaries: React.FC = () => {
  const navigate =useNavigate();
  const [templates, setTemplates] = useState<CareNeedsTemplate[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [catalogError, setCatalogError] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortKey>("default");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTab, setEditorTab] = useState<EditorTab>("details");
  const [expanded, setExpanded] = useState<number | null>(null);

  const [viewTemplate, setViewTemplate] =
    useState<CareNeedsTemplate | null>(null);
  const [viewTab, setViewTab] = useState<ViewTab>("overview");

  const [editingTemplate, setEditingTemplate] =
    useState<CareNeedsTemplate | null>(null);

  const [form, setForm] = useState<TemplateForm>(EMPTY_FORM);
  const initialFormRef = useRef<string>(JSON.stringify(EMPTY_FORM));

  const [notice, setNotice] = useState<Notice>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  const showNotice = useCallback(
    (type: "success" | "error", message: string) => {
      setNotice({ type, message });
    },
    []
  );

  // Auto-dismiss toast
  useEffect(() => {
    if (!notice) return;

    const timer = window.setTimeout(
      () => setNotice(null),
      notice.type === "success" ? 4000 : 7000
    );

    return () => window.clearTimeout(timer);
  }, [notice]);

  // ==================== FETCH DATA ====================

  const fetchTemplates = useCallback(async () => {
    setLoading(true);

    try {
      const result = await getCareNeedsTemplates();
      setTemplates(normalizeTemplates(result));
    } catch (error) {
      showNotice("error", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [showNotice]);

  const fetchCatalog = useCallback(async () => {
    try {
      // Backend service catalog endpoint.
      const result = await api.get<unknown>("/service-catalog");
      setCategories(normalizeCatalog(result));
      setCatalogError(false);
    } catch (error) {
      console.error("Failed to fetch service catalog:", error);
      setCatalogError(true);
      showNotice(
        "error",
        "Service catalog could not be loaded. Please check the catalog API endpoint."
      );
    }
  }, [showNotice]);

  useEffect(() => {
    void fetchTemplates();
    void fetchCatalog();
  }, [fetchTemplates, fetchCatalog]);

  // ==================== FILTERING & SORTING ====================

  const categoryOptions = useMemo(() => {
    const list = categories.map((category) => ({
      id: category.categoryId,
      name: category.categoryName,
    }));

    templates.forEach((template) => {
      if (
        template.categoryId &&
        !list.some((item) => item.id === template.categoryId)
      ) {
        list.push({
          id: template.categoryId,
          name: template.categoryName || template.categoryId,
        });
      }
    });

    return list;
  }, [categories, templates]);

  const filteredTemplates = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = templates.filter((template) => {
      const matchesSearch =
        !query ||
        [
          template.categoryName,
          template.serviceName,
          template.parentTitle,
          template.serviceTitle,
          template.serviceNote,
          ...(template.matchKeys ?? []),
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        );

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && template.isActive) ||
        (statusFilter === "inactive" && !template.isActive);

      const matchesCategory =
        categoryFilter === "all" ||
        template.categoryId === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    if (sortBy === "default") return result;

    return [...result].sort((a, b) => {
      if (sortBy === "name") {
        return (a.serviceName ?? "").localeCompare(b.serviceName ?? "");
      }

      if (sortBy === "questions") {
        return (b.fields?.length ?? 0) - (a.fields?.length ?? 0);
      }

      return Number(Boolean(b.isActive)) - Number(Boolean(a.isActive));
    });
  }, [templates, search, statusFilter, categoryFilter, sortBy]);

  const activeCount = templates.filter(
    (template) => template.isActive
  ).length;

  const inactiveCount = templates.length - activeCount;

  const questionCount = templates.reduce(
    (total, template) => total + (template.fields?.length ?? 0),
    0
  );

  const hasFilters =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    categoryFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
  };

  // ==================== FORM HELPERS ====================

  const updateForm = <K extends keyof TemplateForm>(
    key: K,
    value: TemplateForm[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const selectedCategory = categories.find(
    (category) => category.categoryId === form.categoryId
  );

  const selectedServices = selectedCategory?.services ?? [];

  const fieldIssues = useMemo(
    () => getFieldIssues(form.fields),
    [form.fields]
  );

  const issueCount = fieldIssues.filter(Boolean).length;

  const isDirty =
    editorOpen && JSON.stringify(form) !== initialFormRef.current;

  const beginEditor = (
    template: CareNeedsTemplate | null,
    nextForm: TemplateForm
  ) => {
    setEditingTemplate(template);
    setForm(nextForm);
    initialFormRef.current = JSON.stringify(nextForm);
    setEditorTab("details");
    setExpanded(null);
    setNotice(null);
    setEditorOpen(true);
  };

  const openCreateModal = () => {
    const firstCategory = categories[0];
    const firstService = firstCategory?.services?.[0];

    beginEditor(null, {
      ...EMPTY_FORM,
      categoryId: firstCategory?.categoryId ?? "",
      serviceId: firstService?.servId ?? "",
      // Titles follow the selected category / service automatically.
      parentTitle: firstCategory?.categoryName ?? "",
      serviceTitle: firstService?.name ?? "",
    });
  };

  const templateToForm = (template: CareNeedsTemplate): TemplateForm => ({
    categoryId: template.categoryId ?? "",
    serviceId: template.serviceId ?? "",
    matchKeys: (template.matchKeys ?? []).join(", "),
    parentTitle: template.parentTitle ?? "",
    serviceTitle: template.serviceTitle ?? "",
    serviceNote: template.serviceNote ?? "",
    intro: template.intro ?? "",
    isActive: template.isActive ?? true,
    fields: (template.fields ?? []).map(normalizeField),
  });

  const openEditModal = (template: CareNeedsTemplate) => {
    beginEditor(template, templateToForm(template));
  };

  /** Creates a new template pre-filled from an existing one. */
  const openDuplicateModal = (template: CareNeedsTemplate) => {
    const base = templateToForm(template);

    beginEditor(null, {
      ...base,
      serviceTitle: base.serviceTitle
        ? `${base.serviceTitle} (copy)`
        : base.serviceTitle,
      fields: base.fields.map((field) => {
        const clone = { ...field } as CareNeedsField & { _id?: string };
        delete clone._id;
        return clone;
      }),
    });

    showNotice(
      "success",
      "Copy created. Choose the service it belongs to, then save."
    );
  };

  const forceCloseEditor = () => {
    setEditorOpen(false);
    setEditingTemplate(null);
    setForm(EMPTY_FORM);
    setExpanded(null);
  };

  const requestCloseEditor = () => {
    if (saving) return;

    if (isDirty) {
      setConfirm({
        title: "Discard your changes?",
        message:
          "You have unsaved changes in this questionnaire. If you close now, they will be lost.",
        confirmLabel: "Discard changes",
        tone: "danger",
        onConfirm: forceCloseEditor,
      });
      return;
    }

    forceCloseEditor();
  };

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find(
      (item) => item.categoryId === categoryId
    );

    const firstService = category?.services?.[0];

    setForm((previous) => ({
      ...previous,
      categoryId,
      serviceId: firstService?.servId ?? "",
      // Parent title = category name, service title = first service name.
      parentTitle: category ? category.categoryName : previous.parentTitle,
      serviceTitle: category
        ? firstService?.name ?? ""
        : previous.serviceTitle,
    }));
  };

  const handleServiceChange = (serviceId: string) => {
    const service = selectedServices.find(
      (item) => item.servId === serviceId
    );

    setForm((previous) => ({
      ...previous,
      serviceId,
      // Service title = selected service name.
      serviceTitle: service ? service.name : previous.serviceTitle,
    }));
  };

  // ==================== QUESTION BUILDER ====================

  const addQuestion = (kind: CareNeedsFieldKind = "text") => {
    const newIndex = form.fields.length;

    setForm((previous) => ({
      ...previous,
      fields: [...previous.fields, createEmptyField(kind)],
    }));

    setEditorTab("questions");
    setExpanded(newIndex);
  };

  const updateQuestion = (
    index: number,
    changes: Partial<CareNeedsField>
  ) => {
    setForm((previous) => ({
      ...previous,
      fields: previous.fields.map((field, fieldIndex) =>
        fieldIndex === index ? { ...field, ...changes } : field
      ),
    }));
  };

  const performRemoveQuestion = (index: number) => {
    setForm((previous) => ({
      ...previous,
      fields: previous.fields.filter(
        (_, fieldIndex) => fieldIndex !== index
      ),
    }));
    setExpanded(null);
  };

  const removeQuestion = (index: number) => {
    const field = form.fields[index];

    // Nothing typed yet — no need to ask.
    if (!field?.label?.trim()) {
      performRemoveQuestion(index);
      return;
    }

    setConfirm({
      title: "Remove this question?",
      message: `"${field.label}" will be removed from the template. The change applies when you save.`,
      confirmLabel: "Remove question",
      tone: "danger",
      onConfirm: () => performRemoveQuestion(index),
    });
  };

  const duplicateQuestion = (index: number) => {
    setForm((previous) => {
      const source = previous.fields[index];
      if (!source) return previous;

      const clone = {
        ...source,
        id: "",
        label: source.label ? `${source.label} (copy)` : "",
        options: [...(source.options ?? [])],
        exclusiveOptions: [...(source.exclusiveOptions ?? [])],
      } as CareNeedsField & { _id?: string };
      delete clone._id;

      const fields = [...previous.fields];
      fields.splice(index + 1, 0, clone);
      return { ...previous, fields };
    });

    setExpanded(index + 1);
  };

  const moveQuestion = (index: number, direction: -1 | 1) => {
    const target = index + direction;

    if (target < 0 || target >= form.fields.length) return;

    setForm((previous) => {
      const fields = [...previous.fields];
      [fields[index], fields[target]] = [fields[target], fields[index]];
      return { ...previous, fields };
    });

    // Keep the moved question open and in view.
    setExpanded((current) => (current === index ? target : current));
  };

  // Scroll the opened question into view.
  useEffect(() => {
    if (expanded === null || editorTab !== "questions") return;

    const timer = window.setTimeout(() => {
      document
        .getElementById(`qa-question-${expanded}`)
        ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 60);

    return () => window.clearTimeout(timer);
  }, [expanded, editorTab]);

  // ==================== SAVE TEMPLATE ====================

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.categoryId || !form.serviceId) {
      setEditorTab("details");
      showNotice(
        "error",
        "Please select a service category and subservice."
      );
      return;
    }

    if (!form.parentTitle.trim() || !form.serviceTitle.trim()) {
      setEditorTab("details");
      showNotice(
        "error",
        "Parent title and service title are required."
      );
      return;
    }

    const firstIssueIndex = fieldIssues.findIndex(Boolean);

    if (firstIssueIndex !== -1) {
      setEditorTab("questions");
      setExpanded(firstIssueIndex);
      showNotice(
        "error",
        `Question ${firstIssueIndex + 1}: ${fieldIssues[firstIssueIndex]}`
      );
      return;
    }

    const payload: CareNeedsTemplatePayload = {
      categoryId: form.categoryId,
      serviceId: form.serviceId,
      matchKeys: form.matchKeys
        .split(",")
        .map((key) => key.trim())
        .filter(Boolean),
      parentTitle: form.parentTitle.trim(),
      serviceTitle: form.serviceTitle.trim(),
      serviceNote: form.serviceNote.trim(),
      intro: form.intro.trim(),
      isActive: form.isActive,
      fields: form.fields.map((field, index) => ({
        ...field,
        id: field.id.trim() || makeFieldId(field.label, index),
        label: field.label.trim(),
        hint: field.hint?.trim() ?? "",
        placeholder: field.placeholder?.trim() ?? "",
        options: (field.options ?? [])
          .map((option) => option.trim())
          .filter(Boolean),
        exclusiveOptions: (field.exclusiveOptions ?? [])
          .map((option) => option.trim())
          .filter(Boolean),
      })),
    };

    setSaving(true);

    try {
      if (editingTemplate) {
        await updateCareNeedsTemplate(editingTemplate._id, payload);

        showNotice("success", "Questionnaire updated successfully.");
      } else {
        await createCareNeedsTemplate(payload);

        showNotice("success", "Questionnaire created successfully.");
      }

      forceCloseEditor();

      await fetchTemplates();
    } catch (error) {
      showNotice("error", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  // ==================== DELETE TEMPLATE ====================

  const performDelete = async (template: CareNeedsTemplate) => {
    setDeletingId(template._id);

    try {
      await deleteCareNeedsTemplate(template._id);

      setTemplates((previous) =>
        previous.filter((item) => item._id !== template._id)
      );

      if (viewTemplate?._id === template._id) {
        setViewTemplate(null);
      }

      showNotice("success", "Questionnaire deleted successfully.");
    } catch (error) {
      showNotice("error", getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  const handleDelete = (template: CareNeedsTemplate) => {
    setConfirm({
      title: `Delete "${template.serviceTitle || template.serviceName}"?`,
      message:
        "This questionnaire will be deleted permanently. This action cannot be undone.",
      confirmLabel: "Delete questionnaire",
      tone: "danger",
      onConfirm: () => performDelete(template),
    });
  };

  // ==================== QUICK STATUS TOGGLE ====================

  const handleToggleStatus = async (template: CareNeedsTemplate) => {
    const nextActive = !template.isActive;

    setTogglingId(template._id);

    try {
      await updateCareNeedsTemplate(template._id, {
        ...templateToPayload(template),
        isActive: nextActive,
      });

      setTemplates((previous) =>
        previous.map((item) =>
          item._id === template._id
            ? { ...item, isActive: nextActive }
            : item
        )
      );

      setViewTemplate((current) =>
        current && current._id === template._id
          ? { ...current, isActive: nextActive }
          : current
      );

      showNotice(
        "success",
        nextActive
          ? "Questionnaire activated."
          : "Questionnaire deactivated."
      );
    } catch (error) {
      showNotice("error", getErrorMessage(error));
    } finally {
      setTogglingId(null);
    }
  };

  // ==================== VIEW DETAILS ====================

  const openViewModal = (template: CareNeedsTemplate) => {
    setViewTab("overview");
    setViewTemplate(template);
  };

  // ==================== KEYBOARD & SCROLL LOCK ====================

  const escapeRef = useRef<() => void>(() => undefined);

  escapeRef.current = () => {
    if (confirm) {
      setConfirm(null);
      return;
    }

    if (editorOpen) {
      requestCloseEditor();
      return;
    }

    if (viewTemplate) {
      setViewTemplate(null);
    }
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") escapeRef.current();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const locked = editorOpen || Boolean(viewTemplate) || Boolean(confirm);
    const previous = document.body.style.overflow;

    if (locked) document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [editorOpen, viewTemplate, confirm]);

  // ==================== UI ====================

  const statusSegments: { key: string; label: string; count: number }[] = [
    { key: "all", label: "All", count: templates.length },
    { key: "active", label: "Active", count: activeCount },
    { key: "inactive", label: "Inactive", count: inactiveCount },
  ];

  return (
    <div className="questionaries-page">
      <div className="qa-container">
        {/* PAGE HEADER */}

        <header className="qa-header">
          <div>
              <button
            onClick={() => navigate("/services")}
              className="booking-back-btn "
            
          >
            <ArrowLeft size={17} />
            Back 
          </button>

            <h1 className="qa-title">Care Needs Questionaries</h1>

           
          </div>

          <div className="qa-header-actions">
            <button
              type="button"
              onClick={() => {
                void fetchTemplates();
                void fetchCatalog();
              }}
              disabled={loading}
              className="qa-btn qa-btn--ghost"
            >
              <RefreshCw
                size={16}
                className={loading ? "qa-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="qa-btn qa-btn--primary"
            >
              <Plus size={17} />
              New questionnaire
            </button>
          </div>
        </header>

        {/* CATALOG WARNING */}

        {catalogError && (
          <div className="qa-banner" role="alert">
            <AlertTriangle size={19} />
            <p>
              The service catalog could not be loaded, so you can't create
              or edit questionnaires yet.
            </p>
            <button
              type="button"
              className="qa-btn qa-btn--soft qa-btn--sm"
              onClick={() => void fetchCatalog()}
            >
              Try again
            </button>
          </div>
        )}

        {/* SUMMARY CARDS (click to filter) */}

        <section className="qa-stats" aria-label="Summary">
          <StatCard
            icon={<ClipboardList size={20} />}
            label="Total templates"
            value={templates.length}
            hint="Show all"
            tone="sky"
            selected={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
          />

          <StatCard
            icon={<CheckCircle2 size={20} />}
            label="Active"
            value={activeCount}
            hint="Filter active only"
            tone="green"
            selected={statusFilter === "active"}
            onClick={() => setStatusFilter("active")}
          />

          <StatCard
            icon={<Activity size={20} />}
            label="Inactive"
            value={inactiveCount}
            hint="Filter inactive only"
            tone="amber"
            selected={statusFilter === "inactive"}
            onClick={() => setStatusFilter("inactive")}
          />

          <StatCard
            icon={<CircleHelp size={20} />}
            label="Total questions"
            value={questionCount}
            hint="Across all templates"
            tone="violet"
          />
        </section>

        {/* LIBRARY PANEL */}

        <section className="qa-panel">
          <div className="qa-panel__head">
            <div>
              <h2>Questionnaire library</h2>
              <p>
                Select a row to see details. Use the switch to turn a
                questionnaire on or off.
              </p>
            </div>

            <span className="qa-count">
              {filteredTemplates.length} of {templates.length}
            </span>
          </div>

          <div className="qa-toolbar">
            <div className="qa-search">
              <Search size={17} />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by service, title or keyword"
                aria-label="Search questionnaires"
              />
              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="qa-select">
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                aria-label="Filter by category"
              >
                <option value="all">All categories</option>
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} />
            </div>

            <div className="qa-select">
              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value as SortKey)
                }
                aria-label="Sort questionnaires"
              >
                <option value="default">Sort: Default</option>
                <option value="name">Sort: Service A–Z</option>
                <option value="questions">Sort: Most questions</option>
                <option value="active">Sort: Active first</option>
              </select>
              <ChevronDown size={15} />
            </div>

            <div className="qa-segment" role="tablist" aria-label="Status">
              {statusSegments.map((segment) => (
                <button
                  key={segment.key}
                  type="button"
                  role="tab"
                  aria-selected={statusFilter === segment.key}
                  className={statusFilter === segment.key ? "is-on" : ""}
                  onClick={() => setStatusFilter(segment.key)}
                >
                  {segment.label}
                  <span>{segment.count}</span>
                </button>
              ))}
            </div>

            {hasFilters && (
              <button
                type="button"
                className="qa-link"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}
          </div>

          {/* TABLE */}

          <div className="qa-table-wrap">
            <table className="qa-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Questionnaire</th>
                  <th>Questions</th>
                  <th>Status</th>
                  <th className="qa-th-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="qa-skel-row">
                      <td colSpan={5}>
                        <div className="qa-skeleton" />
                      </td>
                    </tr>
                  ))
                ) : filteredTemplates.length === 0 ? (
                  <tr className="qa-empty-row">
                    <td colSpan={5}>
                      <div className="qa-empty">
                        <div className="qa-empty__icon">
                          <FileText size={26} />
                        </div>

                        <h3>
                          {templates.length === 0
                            ? "No questionnaires yet"
                            : "Nothing matches your filters"}
                        </h3>

                        <p>
                          {templates.length === 0
                            ? "Create your first questionnaire to start collecting care needs from requesters."
                            : "Try a different search term, or clear the filters to see everything."}
                        </p>

                        {templates.length === 0 ? (
                          <button
                            type="button"
                            onClick={openCreateModal}
                            className="qa-btn qa-btn--primary"
                          >
                            <Plus size={16} />
                            Create questionnaire
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={clearFilters}
                            className="qa-btn qa-btn--ghost"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTemplates.map((template) => {
                    const required = countRequired(template.fields);

                    return (
                      <tr
                        key={template._id}
                        className="qa-row"
                        onClick={() => openViewModal(template)}
                      >
                        <td data-label="Service">
                          <div className="qa-service">
                            <div className="qa-service__icon">
                              <BookOpen size={18} />
                            </div>

                            <div>
                              <p className="qa-strong">
                                {template.serviceName || "Unnamed service"}
                              </p>
                              <p className="qa-muted">
                                {template.categoryName || "Uncategorized"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td data-label="Questionnaire">
                          <p className="qa-strong qa-clamp">
                            {template.serviceTitle ||
                              "Untitled questionnaire"}
                          </p>
                          <p className="qa-muted qa-clamp">
                            {template.parentTitle || "No parent title"}
                          </p>
                        </td>

                        <td data-label="Questions">
                          <span className="qa-pill">
                            <CircleHelp size={14} />
                            {template.fields?.length ?? 0}
                          </span>
                          {required > 0 && (
                            <span className="qa-muted qa-inline-note">
                              {required} required
                            </span>
                          )}
                        </td>

                        <td data-label="Status">
                          <div
                            className="qa-status-cell"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Switch
                              checked={Boolean(template.isActive)}
                              busy={togglingId === template._id}
                              label={`${
                                template.isActive ? "Deactivate" : "Activate"
                              } ${template.serviceTitle || "questionnaire"}`}
                              onChange={() =>
                                void handleToggleStatus(template)
                              }
                            />
                            <span
                              className={
                                template.isActive
                                  ? "qa-status qa-status--on"
                                  : "qa-status"
                              }
                            >
                              {template.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </td>

                        <td className="qa-td-actions">
                          <div
                            className="qa-actions"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <IconButton
                              title="View details"
                              onClick={() => openViewModal(template)}
                            >
                              <Eye size={17} />
                            </IconButton>

                            <IconButton
                              title="Edit questionnaire"
                              onClick={() => openEditModal(template)}
                            >
                              <Pencil size={17} />
                            </IconButton>

                            <IconButton
                              title="Duplicate as new"
                              onClick={() => openDuplicateModal(template)}
                            >
                              <Copy size={17} />
                            </IconButton>

                            <IconButton
                              title="Delete questionnaire"
                              tone="danger"
                              disabled={deletingId === template._id}
                              onClick={() => handleDelete(template)}
                            >
                              {deletingId === template._id ? (
                                <Loader2 size={17} className="qa-spin" />
                              ) : (
                                <Trash2 size={17} />
                              )}
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="qa-panel__foot">
            <span>
              Showing {filteredTemplates.length} of {templates.length}{" "}
              templates
            </span>
            <span>Changes are saved directly to the backend.</span>
          </div>
        </section>
      </div>

      {/* ==================== CREATE / EDIT DRAWER ==================== */}

      {editorOpen && (
        <div
          className="qa-overlay qa-overlay--drawer"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) requestCloseEditor();
          }}
        >
          <div
            className="qa-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={
              editingTemplate ? "Edit questionnaire" : "Create questionnaire"
            }
          >
            <div className="qa-sheet__head">
              <div className="qa-sheet__title">
                <div className="qa-sheet__icon">
                  {editingTemplate ? (
                    <Pencil size={20} />
                  ) : (
                    <Plus size={21} />
                  )}
                </div>

                <div>
                  <h2>
                    {editingTemplate
                      ? "Edit questionnaire"
                      : "Create questionnaire"}
                  </h2>
                  <p>
                    {form.serviceTitle.trim() ||
                      "Set the service, add questions, then preview."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={requestCloseEditor}
                disabled={saving}
                aria-label="Close editor"
                className="qa-icon-btn"
              >
                <X size={20} />
              </button>
            </div>

            <div className="qa-tabs" role="tablist">
              <TabButton
                active={editorTab === "details"}
                onClick={() => setEditorTab("details")}
              >
                Details
              </TabButton>
              <TabButton
                active={editorTab === "questions"}
                onClick={() => setEditorTab("questions")}
                count={form.fields.length}
                warn={issueCount > 0}
              >
                Questions
              </TabButton>
              <TabButton
                active={editorTab === "preview"}
                onClick={() => setEditorTab("preview")}
              >
                Preview
              </TabButton>
            </div>

            <form
              onSubmit={handleSave}
              className="qa-form"
              onKeyDown={(event) => {
                // Stop Enter in single-line inputs from saving by accident.
                if (
                  event.key === "Enter" &&
                  (event.target as HTMLElement).tagName === "INPUT"
                ) {
                  event.preventDefault();
                }
              }}
            >
              <div className="qa-sheet__body">
                {/* ---------- DETAILS TAB ---------- */}

                {editorTab === "details" && (
                  <div className="qa-stack">
                    <div className="qa-card">
                      <div className="qa-card__head">
                        <h3>Which service is this for?</h3>
                        <p>
                          Requesters will see these questions when they
                          pick this service.
                        </p>
                      </div>

                      {categories.length === 0 ? (
                        <div className="qa-banner qa-banner--inline">
                          <AlertTriangle size={18} />
                          <p>
                            Service categories could not be loaded. Check
                            the service catalog endpoint before creating a
                            template.
                          </p>
                          <button
                            type="button"
                            onClick={() => void fetchCatalog()}
                            className="qa-btn qa-btn--soft qa-btn--sm"
                          >
                            Retry
                          </button>
                        </div>
                      ) : (
                        <div className="qa-grid-2">
                          <FormField label="Service category" required>
                            <div className="qa-select qa-select--field">
                              <select
                                value={form.categoryId}
                                onChange={(event) =>
                                  handleCategoryChange(event.target.value)
                                }
                                required
                                className="qa-input"
                              >
                                <option value="">Select category</option>
                                {categories.map((category) => (
                                  <option
                                    key={category.categoryId}
                                    value={category.categoryId}
                                  >
                                    {category.categoryName}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown size={15} />
                            </div>
                          </FormField>

                          <FormField
                            label="Subservice"
                            required
                            hint={
                              form.categoryId && !selectedServices.length
                                ? "This category has no subservices yet."
                                : undefined
                            }
                          >
                            <div className="qa-select qa-select--field">
                              <select
                                value={form.serviceId}
                                onChange={(event) =>
                                  handleServiceChange(event.target.value)
                                }
                                required
                                disabled={!selectedServices.length}
                                className="qa-input"
                              >
                                <option value="">Select subservice</option>
                                {selectedServices.map((service) => (
                                  <option
                                    key={service.servId}
                                    value={service.servId}
                                  >
                                    {service.name}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown size={15} />
                            </div>
                          </FormField>
                        </div>
                      )}
                    </div>

                    <div className="qa-card">
                      <div className="qa-card__head">
                        <h3>Titles and wording</h3>
                        <p>What requesters read at the top of the form.</p>
                      </div>

                      <div className="qa-grid-2">
                        <FormField
                          label="Parent title"
                          required
                          hint="Fills automatically from the category. You can still edit it."
                        >
                          <input
                            value={form.parentTitle}
                            onChange={(event) =>
                              updateForm("parentTitle", event.target.value)
                            }
                            placeholder="e.g. Care Needs Assessment"
                            required
                            className="qa-input"
                          />
                        </FormField>

                        <FormField
                          label="Service title"
                          required
                          hint="Fills automatically from the subservice. You can still edit it."
                        >
                          <input
                            value={form.serviceTitle}
                            onChange={(event) =>
                              updateForm("serviceTitle", event.target.value)
                            }
                            placeholder="e.g. Personal Care Questions"
                            required
                            className="qa-input"
                          />
                        </FormField>

                        <FormField
                          label="Introduction"
                          hint="Optional. Explains what the requester should provide."
                        >
                          <textarea
                            rows={3}
                            value={form.intro}
                            onChange={(event) =>
                              updateForm("intro", event.target.value)
                            }
                            placeholder="Tell us a little about the care you need..."
                            className="qa-input"
                          />
                        </FormField>

                        <FormField
                          label="Service note"
                          hint="Optional. A short note shown with the service."
                        >
                          <textarea
                            rows={3}
                            value={form.serviceNote}
                            onChange={(event) =>
                              updateForm("serviceNote", event.target.value)
                            }
                            placeholder="Add a short note..."
                            className="qa-input"
                          />
                        </FormField>
                      </div>
                    </div>

                    <div className="qa-card">
                      <div className="qa-card__head">
                        <h3>Matching and visibility</h3>
                        <p>Control when this questionnaire is used.</p>
                      </div>

                      <FormField
                        label="Match keys"
                        hint="Comma-separated keywords used to match this questionnaire."
                      >
                        <input
                          value={form.matchKeys}
                          onChange={(event) =>
                            updateForm("matchKeys", event.target.value)
                          }
                          placeholder="e.g. personal care, bathing, grooming"
                          className="qa-input"
                        />
                      </FormField>

                      {form.matchKeys.trim() && (
                        <div className="qa-keychips">
                          {form.matchKeys
                            .split(",")
                            .map((key) => key.trim())
                            .filter(Boolean)
                            .map((key, index) => (
                              <span key={`${key}-${index}`}>{key}</span>
                            ))}
                        </div>
                      )}

                      <label className="qa-toggle-row">
                        <div>
                          <p className="qa-strong">Questionnaire status</p>
                          <p className="qa-muted">
                            Only active questionnaires are returned by the
                            active-template endpoint.
                          </p>
                        </div>

                        <span className="qa-toggle-row__control">
                          <span
                            className={
                              form.isActive
                                ? "qa-status qa-status--on"
                                : "qa-status"
                            }
                          >
                            {form.isActive ? "Active" : "Inactive"}
                          </span>
                          <Switch
                            checked={form.isActive}
                            label="Toggle questionnaire status"
                            onChange={() =>
                              updateForm("isActive", !form.isActive)
                            }
                          />
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* ---------- QUESTIONS TAB ---------- */}

                {editorTab === "questions" && (
                  <div className="qa-stack">
                    <div className="qa-qtoolbar">
                      <p>
                        <strong>{form.fields.length}</strong> question
                        {form.fields.length === 1 ? "" : "s"}
                        {form.fields.length > 0 && (
                          <>
                            {" "}
                            · {countRequired(form.fields)} required
                          </>
                        )}
                      </p>

                      {form.fields.length > 0 && (
                        <button
                          type="button"
                          className="qa-link"
                          onClick={() =>
                            setExpanded(expanded === null ? 0 : null)
                          }
                        >
                          {expanded === null
                            ? "Open first question"
                            : "Collapse all"}
                        </button>
                      )}
                    </div>

                    {form.fields.length === 0 ? (
                      <div className="qa-empty qa-empty--dashed">
                        <div className="qa-empty__icon">
                          <CircleHelp size={26} />
                        </div>
                        <h3>No questions yet</h3>
                        <p>
                          Pick a question type to add your first question.
                        </p>
                        <AddQuestionBar onAdd={addQuestion} />
                      </div>
                    ) : (
                      <>
                        <div className="qa-qlist">
                          {form.fields.map((field, index) => (
                            <QuestionCard
                              key={`${field._id ?? "new"}-${index}`}
                              field={field}
                              index={index}
                              total={form.fields.length}
                              open={expanded === index}
                              issue={fieldIssues[index]}
                              onToggle={() =>
                                setExpanded(expanded === index ? null : index)
                              }
                              onChange={(changes) =>
                                updateQuestion(index, changes)
                              }
                              onMove={(direction) =>
                                moveQuestion(index, direction)
                              }
                              onDuplicate={() => duplicateQuestion(index)}
                              onRemove={() => removeQuestion(index)}
                            />
                          ))}
                        </div>

                        <div className="qa-addwrap">
                          <p>Add another question</p>
                          <AddQuestionBar onAdd={addQuestion} />
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ---------- PREVIEW TAB ---------- */}

                {editorTab === "preview" && (
                  <div className="qa-stack">
                    <div className="qa-hintbar">
                      <Info size={16} />
                      <p>
                        This is how requesters will see the questionnaire.
                        You can try the inputs — nothing is saved.
                      </p>
                    </div>

                    <QuestionnairePreview
                      scope="editor"
                      parentTitle={form.parentTitle}
                      serviceTitle={form.serviceTitle}
                      serviceNote={form.serviceNote}
                      intro={form.intro}
                      fields={form.fields}
                    />
                  </div>
                )}
              </div>

              {/* FORM FOOTER */}

              <div className="qa-sheet__foot">
                <div className="qa-foot-status">
                  {issueCount > 0 ? (
                    <button
                      type="button"
                      className="qa-foot-issue"
                      onClick={() => {
                        setEditorTab("questions");
                        setExpanded(fieldIssues.findIndex(Boolean));
                      }}
                    >
                      <AlertCircle size={15} />
                      {issueCount} question{issueCount === 1 ? "" : "s"} need
                      attention
                    </button>
                  ) : (
                    <span>
                      {form.fields.length} question
                      {form.fields.length === 1 ? "" : "s"} configured
                    </span>
                  )}

                  {isDirty && (
                    <span className="qa-dirty">
                      <i /> Unsaved changes
                    </span>
                  )}
                </div>

                <div className="qa-foot-actions">
                  <button
                    type="button"
                    onClick={requestCloseEditor}
                    disabled={saving}
                    className="qa-btn qa-btn--ghost"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving || categories.length === 0}
                    className="qa-btn qa-btn--primary"
                  >
                    {saving ? (
                      <Loader2 size={17} className="qa-spin" />
                    ) : (
                      <Check size={17} />
                    )}
                    {saving
                      ? "Saving..."
                      : editingTemplate
                        ? "Save changes"
                        : "Create questionnaire"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== VIEW DETAILS MODAL ==================== */}

      {viewTemplate && (
        <div
          className="qa-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setViewTemplate(null);
          }}
        >
          <div
            className="qa-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Questionnaire details"
          >
            <div className="qa-modal__hero">
              <div className="qa-modal__hero-main">
                <div className="qa-modal__hero-icon">
                  <FileText size={22} />
                </div>
                <div>
                  <p className="qa-modal__eyebrow">Questionnaire details</p>
                  <h2>
                    {viewTemplate.serviceTitle || "Untitled questionnaire"}
                  </h2>
                  <p className="qa-modal__sub">
                    {viewTemplate.categoryName} / {viewTemplate.serviceName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewTemplate(null)}
                aria-label="Close details"
                className="qa-icon-btn qa-icon-btn--light"
              >
                <X size={20} />
              </button>
            </div>

            <div className="qa-tabs qa-tabs--modal" role="tablist">
              <TabButton
                active={viewTab === "overview"}
                onClick={() => setViewTab("overview")}
                count={viewTemplate.fields?.length ?? 0}
              >
                Overview
              </TabButton>
              <TabButton
                active={viewTab === "preview"}
                onClick={() => setViewTab("preview")}
              >
                Requester preview
              </TabButton>
            </div>

            <div className="qa-sheet__body">
              {viewTab === "overview" ? (
                <div className="qa-stack">
                  <div className="qa-view-status">
                    <div className="qa-status-cell">
                      <Switch
                        checked={Boolean(viewTemplate.isActive)}
                        busy={togglingId === viewTemplate._id}
                        label="Toggle questionnaire status"
                        onChange={() =>
                          void handleToggleStatus(viewTemplate)
                        }
                      />
                      <span
                        className={
                          viewTemplate.isActive
                            ? "qa-status qa-status--on"
                            : "qa-status"
                        }
                      >
                        {viewTemplate.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <span className="qa-count">
                      {viewTemplate.fields?.length ?? 0} questions ·{" "}
                      {countRequired(viewTemplate.fields)} required
                    </span>
                  </div>

                  <div className="qa-grid-2">
                    <InfoItem
                      label="Parent title"
                      value={viewTemplate.parentTitle}
                    />
                    <InfoItem
                      label="Service title"
                      value={viewTemplate.serviceTitle}
                    />
                    <InfoItem
                      label="Service note"
                      value={viewTemplate.serviceNote}
                    />
                    <InfoItem
                      label="Introduction"
                      value={viewTemplate.intro}
                    />
                  </div>

                  <InfoItem
                    label="Match keys"
                    value={(viewTemplate.matchKeys ?? []).join(", ")}
                  />

                  <div>
                    <h3 className="qa-section-title">
                      Questions and answer settings
                    </h3>

                    {!viewTemplate.fields?.length ? (
                      <div className="qa-empty qa-empty--dashed">
                        <p>No questions configured.</p>
                      </div>
                    ) : (
                      <div className="qa-vlist">
                        {viewTemplate.fields.map((field, index) => (
                          <div
                            key={field._id ?? field.id}
                            className="qa-vitem"
                          >
                            <span className="qa-qnum">{index + 1}</span>

                            <div className="qa-vitem__body">
                              <div className="qa-vitem__top">
                                <h4>{field.label}</h4>
                                {field.required && (
                                  <span className="qa-badge qa-badge--required">
                                    Required
                                  </span>
                                )}
                                <span className="qa-badge">
                                  {getTypeMeta(field.kind)?.icon}
                                  {getTypeMeta(field.kind)?.label ??
                                    field.kind}
                                </span>
                              </div>

                              <p className="qa-muted">ID: {field.id}</p>

                              {field.hint && (
                                <p className="qa-vitem__hint">{field.hint}</p>
                              )}

                              {field.placeholder && (
                                <p className="qa-muted">
                                  Placeholder: {field.placeholder}
                                </p>
                              )}

                              {!!field.options?.length && (
                                <div className="qa-keychips">
                                  {field.options
                                    .filter(Boolean)
                                    .map((option, optionIndex) => (
                                      <span key={`${option}-${optionIndex}`}>
                                        {option}
                                      </span>
                                    ))}
                                </div>
                              )}

                              {field.kind === "milesSlider" && (
                                <p className="qa-muted">
                                  Range: {field.minMiles ?? 0}–
                                  {field.maxMiles ?? 100} miles · Default:{" "}
                                  {field.defaultMiles ?? 0}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <QuestionnairePreview
                  scope="view"
                  parentTitle={viewTemplate.parentTitle ?? ""}
                  serviceTitle={viewTemplate.serviceTitle ?? ""}
                  serviceNote={viewTemplate.serviceNote ?? ""}
                  intro={viewTemplate.intro ?? ""}
                  fields={viewTemplate.fields ?? []}
                />
              )}
            </div>

            <div className="qa-sheet__foot qa-sheet__foot--end">
              <button
                type="button"
                onClick={() => handleDelete(viewTemplate)}
                disabled={deletingId === viewTemplate._id}
                className="qa-btn qa-btn--danger"
              >
                <Trash2 size={16} />
                Delete
              </button>

              <div className="qa-foot-actions">
                <button
                  type="button"
                  onClick={() => {
                    const template = viewTemplate;
                    setViewTemplate(null);
                    openDuplicateModal(template);
                  }}
                  className="qa-btn qa-btn--ghost"
                >
                  <Copy size={16} />
                  Duplicate
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const template = viewTemplate;
                    setViewTemplate(null);
                    openEditModal(template);
                  }}
                  className="qa-btn qa-btn--primary"
                >
                  <Pencil size={16} />
                  Edit questionnaire
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CONFIRM DIALOG ==================== */}

      {confirm && (
        <div
          className="qa-overlay qa-overlay--top"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setConfirm(null);
          }}
        >
          <div
            className="qa-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-label={confirm.title}
          >
            <div
              className={`qa-dialog__icon ${
                confirm.tone === "danger" ? "is-danger" : ""
              }`}
            >
              <AlertTriangle size={22} />
            </div>

            <h3>{confirm.title}</h3>
            <p>{confirm.message}</p>

            <div className="qa-dialog__actions">
              <button
                type="button"
                className="qa-btn qa-btn--ghost"
                onClick={() => setConfirm(null)}
              >
                Keep editing
              </button>

              <button
                type="button"
                className={`qa-btn ${
                  confirm.tone === "danger"
                    ? "qa-btn--danger-solid"
                    : "qa-btn--primary"
                }`}
                onClick={() => {
                  const run = confirm.onConfirm;
                  setConfirm(null);
                  void run();
                }}
              >
                {confirm.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TOAST ==================== */}

      {notice && (
        <div
          className={`qa-toast qa-toast--${notice.type}`}
          role={notice.type === "error" ? "alert" : "status"}
        >
          {notice.type === "success" ? (
            <CheckCircle2 size={19} />
          ) : (
            <AlertCircle size={19} />
          )}

          <p>{notice.message}</p>

          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

// ==================== QUESTION CARD ====================

interface QuestionCardProps {
  field: CareNeedsField;
  index: number;
  total: number;
  open: boolean;
  issue: string | null;
  onToggle: () => void;
  onChange: (changes: Partial<CareNeedsField>) => void;
  onMove: (direction: -1 | 1) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  field,
  index,
  total,
  open,
  issue,
  onToggle,
  onChange,
  onMove,
  onDuplicate,
  onRemove,
}) => {
  const meta = getTypeMeta(field.kind);
  const optionCount = (field.options ?? []).filter(Boolean).length;
  const autoId = makeFieldId(field.label ?? "", index);

  const handleKindChange = (kind: CareNeedsFieldKind) => {
    if (kind === field.kind) return;

    // Keep options when switching between checkbox and radio.
    const keepOptions =
      OPTION_TYPES.includes(kind) && OPTION_TYPES.includes(field.kind);

    onChange({
      kind,
      options: keepOptions ? field.options ?? [] : [],
      exclusiveOptions:
        kind === "checkbox" && keepOptions
          ? field.exclusiveOptions ?? []
          : [],
    });
  };

  return (
    <div
      id={`qa-question-${index}`}
      className={`qa-qcard ${open ? "is-open" : ""} ${
        issue ? "has-issue" : ""
      }`}
    >
      <div className="qa-qhead">
        <button
          type="button"
          className="qa-qhead__main"
          onClick={onToggle}
          aria-expanded={open}
        >
          <span className="qa-qnum">{index + 1}</span>

          <span className="qa-qhead__text">
            <span className="qa-qtitle">
              {field.label || `Untitled question ${index + 1}`}
            </span>
            <span className="qa-qmeta">
              <span className="qa-badge">
                {meta?.icon}
                {meta?.label ?? field.kind}
              </span>
              {field.required && (
                <span className="qa-badge qa-badge--required">
                  Required
                </span>
              )}
              {OPTION_TYPES.includes(field.kind) && (
                <span className="qa-muted">
                  {optionCount} option{optionCount === 1 ? "" : "s"}
                </span>
              )}
              {issue && (
                <span className="qa-issue">
                  <AlertCircle size={13} />
                  {issue}
                </span>
              )}
            </span>
          </span>

          <ChevronDown size={18} className="qa-qhead__chevron" />
        </button>

        <div className="qa-qhead__actions">
          <IconButton
            title="Move up"
            disabled={index === 0}
            onClick={() => onMove(-1)}
          >
            <ArrowUp size={16} />
          </IconButton>
          <IconButton
            title="Move down"
            disabled={index === total - 1}
            onClick={() => onMove(1)}
          >
            <ArrowDown size={16} />
          </IconButton>
          <IconButton title="Duplicate question" onClick={onDuplicate}>
            <Copy size={16} />
          </IconButton>
          <IconButton
            title="Remove question"
            tone="danger"
            onClick={onRemove}
          >
            <Trash2 size={16} />
          </IconButton>
        </div>
      </div>

      {open && (
        <div className="qa-qbody">
          <FormField label="Question label" required>
            <input
              value={field.label}
              onChange={(event) => onChange({ label: event.target.value })}
              placeholder="Enter the question shown to the requester"
              className="qa-input"
              autoFocus={!field.label}
            />
          </FormField>

          <div className="qa-field">
            <span className="qa-label">Answer type</span>
            <div className="qa-typegrid" role="radiogroup">
              {FIELD_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  role="radio"
                  aria-checked={field.kind === type.value}
                  className={`qa-typebtn ${
                    field.kind === type.value ? "is-on" : ""
                  }`}
                  onClick={() => handleKindChange(type.value)}
                >
                  {type.icon}
                  <span>
                    <strong>{type.label}</strong>
                    <small>{type.description}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {OPTION_TYPES.includes(field.kind) && (
            <>
              <FormField
                as="div"
                label="Options"
                required
                hint="Type an option and press Enter. You can paste a list (one per line)."
              >
                <ChipInput
                  values={field.options ?? []}
                  onChange={(options) => onChange({ options })}
                  placeholder="e.g. Bathing"
                />
              </FormField>

              {field.kind === "checkbox" && (
                <FormField
                  as="div"
                  label="Exclusive options"
                  hint="Optional. Choosing one of these clears the others — e.g. “None of the above”."
                >
                  <ChipInput
                    values={field.exclusiveOptions ?? []}
                    onChange={(exclusiveOptions) =>
                      onChange({ exclusiveOptions })
                    }
                    placeholder="e.g. None of the above"
                  />
                </FormField>
              )}
            </>
          )}

          {field.kind === "radio" && (
            <FormField
              label="Columns"
              hint="How many columns the options are shown in."
            >
              <input
                type="number"
                min={1}
                max={4}
                value={field.columns ?? 1}
                onChange={(event) =>
                  onChange({ columns: Number(event.target.value) })
                }
                className="qa-input qa-input--short"
              />
            </FormField>
          )}

          {field.kind === "milesSlider" && (
            <div className="qa-grid-4">
              <FormField label="Minimum miles">
                <input
                  type="number"
                  min={0}
                  value={field.minMiles ?? 0}
                  onChange={(event) =>
                    onChange({ minMiles: Number(event.target.value) })
                  }
                  className="qa-input"
                />
              </FormField>

              <FormField label="Middle miles">
                <input
                  type="number"
                  min={field.minMiles ?? 0}
                  max={field.maxMiles ?? 100}
                  value={field.midMiles ?? 50}
                  onChange={(event) =>
                    onChange({ midMiles: Number(event.target.value) })
                  }
                  className="qa-input"
                />
              </FormField>

              <FormField label="Maximum miles">
                <input
                  type="number"
                  min={0}
                  value={field.maxMiles ?? 100}
                  onChange={(event) =>
                    onChange({ maxMiles: Number(event.target.value) })
                  }
                  className="qa-input"
                />
              </FormField>

              <FormField label="Default miles">
                <input
                  type="number"
                  min={field.minMiles ?? 0}
                  max={field.maxMiles ?? 100}
                  value={field.defaultMiles ?? 0}
                  onChange={(event) =>
                    onChange({ defaultMiles: Number(event.target.value) })
                  }
                  className="qa-input"
                />
              </FormField>
            </div>
          )}

          <div className="qa-grid-2">
            <FormField label="Placeholder">
              <input
                value={field.placeholder ?? ""}
                onChange={(event) =>
                  onChange({ placeholder: event.target.value })
                }
                placeholder="Text shown inside the empty input"
                className="qa-input"
              />
            </FormField>

            <FormField label="Hint / help text">
              <input
                value={field.hint ?? ""}
                onChange={(event) => onChange({ hint: event.target.value })}
                placeholder="Optional helper text under the question"
                className="qa-input"
              />
            </FormField>
          </div>

          <div className="qa-qfoot">
            <label className="qa-check">
              <input
                type="checkbox"
                checked={Boolean(field.required)}
                onChange={(event) =>
                  onChange({ required: event.target.checked })
                }
              />
              <span>
                <strong>Required question</strong>
                <small>The requester must answer this question.</small>
              </span>
            </label>

            <FormField
              label="Question ID"
              hint={
                field.id.trim()
                  ? "Used to store the answer."
                  : "Auto-generated from the label if left empty."
              }
            >
              <input
                value={field.id}
                onChange={(event) => onChange({ id: event.target.value })}
                placeholder={autoId}
                className="qa-input qa-input--mono"
              />
            </FormField>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== ADD QUESTION BAR ====================

const AddQuestionBar: React.FC<{
  onAdd: (kind: CareNeedsFieldKind) => void;
}> = ({ onAdd }) => (
  <div className="qa-addbar">
    {FIELD_TYPES.map((type) => (
      <button
        key={type.value}
        type="button"
        onClick={() => onAdd(type.value)}
        title={type.description}
      >
        {type.icon}
        {type.label}
      </button>
    ))}
  </div>
);

// ==================== PREVIEW ====================

const PreviewField: React.FC<{
  field: CareNeedsField;
  name: string;
}> = ({ field, name }) => {
  const options = (field.options ?? []).filter((option) => option.trim());
  const exclusive = (field.exclusiveOptions ?? []).filter((option) =>
    option.trim()
  );

  const [selected, setSelected] = useState<string[]>([]);
  const [choice, setChoice] = useState("");
  const [miles, setMiles] = useState<number>(Number(field.defaultMiles ?? 0));

  const toggleCheckbox = (option: string) => {
    setSelected((current) => {
      const isOn = current.includes(option);

      if (exclusive.includes(option)) {
        return isOn ? [] : [option];
      }

      const withoutExclusive = current.filter(
        (item) => !exclusive.includes(item)
      );

      return isOn
        ? withoutExclusive.filter((item) => item !== option)
        : [...withoutExclusive, option];
    });
  };

  switch (field.kind) {
    case "text":
      return (
        <input
          className="qa-input"
          placeholder={field.placeholder || "Your answer"}
        />
      );

    case "remarks":
      return (
        <textarea
          rows={4}
          className="qa-input"
          placeholder={field.placeholder || "Write your remarks here"}
        />
      );

    case "address":
      return (
        <div className="qa-pv-address">
          <input
            className="qa-input"
            placeholder={field.placeholder || "Street address"}
          />
          <input className="qa-input" placeholder="City" />
          <input className="qa-input" placeholder="State" />
          <input className="qa-input" placeholder="ZIP code" />
        </div>
      );

    case "checkbox":
      return options.length + exclusive.length === 0 ? (
        <p className="qa-muted">No options added yet.</p>
      ) : (
        <div className="qa-pv-options">
          {[...options, ...exclusive].map((option) => (
            <label key={option} className="qa-pv-opt">
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggleCheckbox(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      );

    case "radio":
      return options.length === 0 ? (
        <p className="qa-muted">No options added yet.</p>
      ) : (
        <div
          className="qa-pv-options"
          style={{
            gridTemplateColumns: `repeat(${Math.min(
              4,
              Math.max(1, Number(field.columns ?? 1))
            )}, minmax(0, 1fr))`,
          }}
        >
          {options.map((option) => (
            <label key={option} className="qa-pv-opt">
              <input
                type="radio"
                name={name}
                checked={choice === option}
                onChange={() => setChoice(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      );

    case "yesNo":
    case "yesNoDontKnow": {
      const choices =
        field.kind === "yesNo"
          ? ["Yes", "No"]
          : ["Yes", "No", "Don't know"];

      return (
        <div className="qa-pv-yn">
          {choices.map((item) => (
            <button
              key={item}
              type="button"
              className={choice === item ? "is-on" : ""}
              onClick={() => setChoice(item)}
            >
              {item}
            </button>
          ))}
        </div>
      );
    }

    case "milesSlider": {
      const min = Number(field.minMiles ?? 0);
      const max = Number(field.maxMiles ?? 100);

      return (
        <div className="qa-pv-range">
          <div className="qa-pv-range__value">{miles} miles</div>
          <input
            type="range"
            min={min}
            max={Math.max(min, max)}
            value={Math.min(Math.max(miles, min), Math.max(min, max))}
            onChange={(event) => setMiles(Number(event.target.value))}
          />
          <div className="qa-pv-range__scale">
            <span>{min}</span>
            <span>{field.midMiles ?? 50}</span>
            <span>{max}</span>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
};

const QuestionnairePreview: React.FC<{
  scope: string;
  parentTitle: string;
  serviceTitle: string;
  serviceNote: string;
  intro: string;
  fields: CareNeedsField[];
}> = ({ scope, parentTitle, serviceTitle, serviceNote, intro, fields }) => (
  <div className="qa-preview">
    <div className="qa-preview__head">
      {parentTitle.trim() && (
        <p className="qa-preview__parent">{parentTitle}</p>
      )}
      <h3>{serviceTitle.trim() || "Questionnaire title"}</h3>
      {intro.trim() && <p className="qa-preview__intro">{intro}</p>}
      {serviceNote.trim() && (
        <div className="qa-preview__note">
          <Info size={15} />
          <p>{serviceNote}</p>
        </div>
      )}
    </div>

    {fields.length === 0 ? (
      <div className="qa-empty">
        <p>Add questions to see them here.</p>
      </div>
    ) : (
      <div className="qa-preview__list">
        {fields.map((field, index) => {
          const key = [
            index,
            field.kind,
            field.minMiles,
            field.maxMiles,
            field.defaultMiles,
          ].join("-");

          return (
            <div key={key} className="qa-pv-field">
              <p className="qa-pv-label">
                {field.label || `Untitled question ${index + 1}`}
                {field.required && <span className="qa-req"> *</span>}
              </p>
              {field.hint && <p className="qa-pv-hint">{field.hint}</p>}
              <PreviewField
                field={field}
                name={`pv-${scope}-${index}`}
              />
            </div>
          );
        })}
      </div>
    )}
  </div>
);

// ==================== REUSABLE UI COMPONENTS ====================

const ChipInput: React.FC<{
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}> = ({ values, onChange, placeholder }) => {
  const [draft, setDraft] = useState("");

  const addMany = (raw: string) => {
    const incoming = raw
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!incoming.length) return;

    const next = [...values];

    incoming.forEach((item) => {
      if (!next.some((value) => value.toLowerCase() === item.toLowerCase())) {
        next.push(item);
      }
    });

    onChange(next);
  };

  const commit = () => {
    addMany(draft);
    setDraft("");
  };

  return (
    <div
      className="qa-chipbox"
      onClick={(event) =>
        (
          event.currentTarget.querySelector("input") as HTMLInputElement | null
        )?.focus()
      }
    >
      {values.map((value, index) => (
        <span key={`${value}-${index}`} className="qa-chip">
          {value}
          <button
            type="button"
            aria-label={`Remove ${value}`}
            onClick={(event) => {
              event.stopPropagation();
              onChange(values.filter((_, i) => i !== index));
            }}
          >
            <X size={13} />
          </button>
        </span>
      ))}

      <input
        value={draft}
        placeholder={values.length ? "Add another..." : placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          } else if (event.key === "Backspace" && !draft && values.length) {
            onChange(values.slice(0, -1));
          }
        }}
        onBlur={commit}
        onPaste={(event) => {
          const text = event.clipboardData.getData("text");

          if (text.includes("\n")) {
            event.preventDefault();
            addMany(text);
          }
        }}
      />
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  hint: string;
  tone: "sky" | "green" | "amber" | "violet";
  selected?: boolean;
  onClick?: () => void;
}> = ({ icon, label, value, hint, tone, selected = false, onClick }) => {
  const content = (
    <>
      <span className={`qa-stat__icon qa-tone-${tone}`}>{icon}</span>
      <span className="qa-stat__body">
        <span className="qa-stat__label">{label}</span>
        <span className="qa-stat__value">{value}</span>
        <span className="qa-stat__hint">{hint}</span>
      </span>
    </>
  );

  if (!onClick) {
    return <div className="qa-stat qa-stat--static">{content}</div>;
  }

  return (
    <button
      type="button"
      className={`qa-stat ${selected ? "is-active" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      {content}
    </button>
  );
};

const Switch: React.FC<{
  checked: boolean;
  onChange: () => void;
  label: string;
  busy?: boolean;
}> = ({ checked, onChange, label, busy = false }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    title={label}
    disabled={busy}
    onClick={onChange}
    className={`qa-switch ${checked ? "is-on" : ""}`}
  >
    <span className="qa-switch__thumb">
      {busy && <Loader2 size={11} className="qa-spin" />}
    </span>
  </button>
);

const IconButton: React.FC<{
  title: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: "default" | "danger";
  children: React.ReactNode;
}> = ({ title, onClick, disabled = false, tone = "default", children }) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    disabled={disabled}
    onClick={onClick}
    className={`qa-icon-btn ${tone === "danger" ? "qa-icon-btn--danger" : ""}`}
  >
    {children}
  </button>
);

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  count?: number;
  warn?: boolean;
  children: React.ReactNode;
}> = ({ active, onClick, count, warn = false, children }) => (
  <button
    type="button"
    role="tab"
    aria-selected={active}
    className={`qa-tab ${active ? "is-on" : ""}`}
    onClick={onClick}
  >
    {children}
    {count !== undefined && (
      <span className={`qa-tab__count ${warn ? "is-warn" : ""}`}>
        {count}
      </span>
    )}
  </button>
);

const FormField: React.FC<{
  label: string;
  required?: boolean;
  hint?: string;
  as?: "label" | "div";
  children: React.ReactNode;
}> = ({ label, required = false, hint, as = "label", children }) => {
  const Tag = as;

  return (
    <Tag className="qa-field">
      <span className="qa-label">
        {label}
        {required && <span className="qa-req"> *</span>}
      </span>
      {children}
      {hint && <span className="qa-help">{hint}</span>}
    </Tag>
  );
};

const InfoItem: React.FC<{
  label: string;
  value?: string | null;
}> = ({ label, value }) => (
  <div className="qa-info">
    <p className="qa-info__label">{label}</p>
    <p className="qa-info__value">{value?.trim() || "—"}</p>
  </div>
);

export default Questionaries;