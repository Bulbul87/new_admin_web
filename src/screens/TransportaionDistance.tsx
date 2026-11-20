
import React, { useEffect, useMemo, useState } from "react";
import {
    MapPin,
    Route,
    Search,
    RefreshCw,
    Save,
    Pencil,
    CheckCircle2,
    Settings2,
    Navigation,
    ArrowLeftRight,
} from "lucide-react";
import { toast } from "react-toastify";
import "./SetTransportationDistance.css";
import { useNavigate } from "react-router-dom";
import {
    getAllStateDistances,
    createStateDistance,
    updateStateDistance,
    type TransportationState,
} from "../service/transportationservice";
import { FaArrowLeft } from "react-icons/fa6";

const TransportationDistance: React.FC = () => {
    const navigate = useNavigate();
    const [records, setRecords] = useState<TransportationState[]>([]);
    const [selectedState, setSelectedState] = useState("");
    const [distance1, setDistance1] = useState("");
    const [distance2, setDistance2] = useState("");
    const [d1_hours, setd1hours] = useState("");
    const [d2_hours, setd2hours] = useState("");
    const [price_permiles, setprice] = useState("");
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);

            const response = await getAllStateDistances();

            const list = Array.isArray(response)
                ? response
                : response?.states || response?.data || [];

            setRecords(list);
        } catch (error: any) {
            toast.error(
                error?.message || "Failed to load transportation distances"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const selectedRecord = records.find(
        (record) => record.stateId === selectedState
    );

    const isConfigured = !!selectedRecord?.configured;

    const resetForm = () => {
        setSelectedState("");
        setDistance1("");
        setDistance2("");
        setd1hours("");
        setd2hours("");
        setprice("");
    };

    const handleStateChange = (stateId: string) => {
        setSelectedState(stateId);

        const record = records.find((item) => item.stateId === stateId);

        setDistance1(
            record?.configured && record.distance1 != null
                ? String(record.distance1)
                : ""
        );

        setDistance2(
            record?.configured && record.distance2 != null
                ? String(record.distance2)
                : ""
        );
         setd1hours(
            record?.configured && record.d1_hours != null
                ? String(record.d1_hours)
                : ""
        );
         setd2hours(
            record?.configured && record.d2_hours != null
                ? String(record.d2_hours)
                : ""
        );
         setprice(
            record?.configured && record.price_permiles != null
                ? String(record.price_permiles)
                : ""
        );
    };

    const handleSave = async () => {
        if (!selectedState) {
            toast.warning("Please select a state");
            return;
        }

        if (distance1.trim() === "" || distance2.trim() === ""||d1_hours.trim() === "" || d2_hours.trim() === "" || price_permiles.trim()==="") {
            toast.warning("Please enter both distances");
            return;
        }

        const d1 = Number(distance1);
        const d2 = Number(distance2);
        const H1 = Number(d1_hours);
        const H2 = Number(d2_hours);
         const Pricemiles = Number(price_permiles);
   
        if (
            !Number.isFinite(d1) ||
      !Number.isFinite(d2) ||
      !Number.isFinite(H1) ||
      !Number.isFinite(H2) ||
      !Number.isFinite(Pricemiles) ||
      d1 < 0 ||
      d2 < 0 ||
      H1 < 0 ||
      H2 < 0 ||
      Pricemiles < 0
        ) {
            toast.error("Enter valid non-negative distances");
            return;
        }

        try {
            setSaving(true);

            const payload = { distance1: d1, distance2: d2 ,d1_hours: H1, d2_hours: H2,price_permiles: Pricemiles  };

            if (isConfigured) {
                await updateStateDistance(selectedState, payload);
                toast.success("Transportation distances updated successfully");
            } else {
                await createStateDistance({
                    stateId: selectedState,
                    ...payload,
                });
                toast.success("Transportation distances added successfully");
            }

            await loadData();
        } catch (error: any) {
            toast.error(
                error?.message || "Failed to save transportation distances"
            );
        } finally {
            setSaving(false);
        }
    };

    const filteredRecords = useMemo(() => {
        const query = search.toLowerCase().trim();

        if (!query) return records;

        return records.filter(
            (item) =>
                item.stateName?.toLowerCase().includes(query) ||
                item.stateCode?.toLowerCase().includes(query)
        );
    }, [records, search]);

    const configuredCount = records.filter(
        (record) => record.configured
    ).length;

    const pendingCount = records.length - configuredCount;

    return (
        <div className="transport-distance-page">
            {/* Header */}
            <div className="transport-distance-header">
                <div className="transport-distance-header-content">
                    <div className="transport-distance-heading">
                        <div className="transport-distance-icon">
                            <Route size={25} />
                        </div>

                        <div>
                            <h1>Transportation Distance Settings</h1>
                            <p>
                                Manage state-wise transportation distance configurations
                            </p>
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            className="transport-refresh-btn"
                            onClick={loadData}
                            disabled={loading}
                        >
                            <RefreshCw size={17} className={loading ? "spin-icon" : ""} />
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
            </div>

            {/* Statistics */}
            <div className="transport-stats-grid">
                <div className="transport-stat-card">
                    <div className="transport-stat-icon total">
                        <MapPin size={21} />
                    </div>
                    <div>
                        <span>Total States</span>
                        <h2>{records.length}</h2>
                    </div>
                </div>

                <div className="transport-stat-card">
                    <div className="transport-stat-icon configured">
                        <CheckCircle2 size={21} />
                    </div>
                    <div>
                        <span>Configured</span>
                        <h2>{configuredCount}</h2>
                    </div>
                </div>

                <div className="transport-stat-card">
                    <div className="transport-stat-icon pending">
                        <Settings2Icon />
                    </div>
                    <div>
                        <span>Not Configured</span>
                        <h2>{pendingCount}</h2>
                    </div>
                </div>
            </div>

            {/* Configuration Form */}
            <div className="transport-config-card">
                <div className="transport-card-heading">
                    <div className="transport-card-heading-icon">
                        <Navigation size={20} />
                    </div>
                    <div>
                        <h2>Configure State Distances</h2>
                        <p>Select a state and set both transportation distances</p>
                    </div>
                </div>

                <div className="transport-form-grid">
                    <div className="transport-field">
                        <label>Select State <span>*</span></label>
                        <select
                            value={selectedState}
                            onChange={(e) => handleStateChange(e.target.value)}
                        >
                            <option value="">Choose a state</option>
                            {records.map((state) => (
                                <option key={state.stateId} value={state.stateId}>
                                    {state.stateName}
                                    {state.stateCode ? ` (${state.stateCode})` : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="transport-field">
                        <label>Distance 1 <span>*</span></label>
                        <div className="transport-input-wrap">
                            <ArrowLeftRight size={18} />
                            <input
                                type="number"
                                min="0"
                                step="any"
                                placeholder="Enter distance 1"
                                value={distance1}
                                onChange={(e) => setDistance1(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="transport-field">
                        <label>Distance 2 <span>*</span></label>
                        <div className="transport-input-wrap">
                            <ArrowLeftRight size={18} />
                            <input
                                type="number"
                                min="0"
                                step="any"
                                placeholder="Enter distance 2"
                                value={distance2}
                                onChange={(e) => setDistance2(e.target.value)}
                            />
                        </div>
                    </div>

                      <div className="transport-field">
                        <label>Hours 1 <span>*</span></label>
                        <div className="transport-input-wrap">
                            <ArrowLeftRight size={18} />
                            <input
                                type="number"
                                min="0"
                                step="any"
                                placeholder="Enter hours 1"
                                value={d1_hours}
                                onChange={(e) => setd1hours(e.target.value)}
                            />
                        </div>
                    </div>


                      <div className="transport-field">
                        <label>Hours 2 <span>*</span></label>
                        <div className="transport-input-wrap">
                            <ArrowLeftRight size={18} />
                            <input
                                type="number"
                                min="0"
                                step="any"
                                placeholder="Enter hours 2"
                                value={d2_hours}
                                onChange={(e) => setd2hours(e.target.value)}
                            />
                        </div>
                    </div>

                      <div className="transport-field">
                        <label>price per miles <span>*</span></label>
                        <div className="transport-input-wrap">
                            <ArrowLeftRight size={18} />
                            <input
                                type="number"
                                min="0"
                                step="any"
                                placeholder="Enter price per miles"
                                value={price_permiles}
                                onChange={(e) => setprice(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {selectedState && (
                    <div className={`transport-state-notice ${isConfigured ? "existing" : "new"}`}>
                        {isConfigured ? (
                            <>
                                <CheckCircle2 size={17} />
                                Existing configuration found. Updating will replace the current
                                distances for this state.
                            </>
                        ) : (
                            <>
                                <Settings2Icon />
                                No distance configuration exists for this state yet.
                            </>
                        )}
                    </div>
                )}

                <div className="transport-form-actions">
                    <button
                        className="transport-reset-btn"
                        onClick={resetForm}
                        disabled={saving}
                    >
                        Reset
                    </button>

                    <button
                        className="transport-save-btn"
                        onClick={handleSave}
                        disabled={saving || !selectedState}
                    >
                        {saving ? (
                            <>
                                <RefreshCw size={17} className="spin-icon" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={17} />
                                {isConfigured ? "Update Distances" : "Add Distances"}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* State Records Table */}
            <div className="transport-table-card">
                <div className="transport-table-header">
                    <div>
                        <h2>State Distance Records</h2>
                        <p>View and edit transportation distance settings by state</p>
                    </div>

                    <div className="transport-search">
                        <Search size={17} />
                        <input
                            type="text"
                            placeholder="Search state..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="transport-table-scroll">
                    <table className="transport-table">
                        <thead>
                            <tr>
                                <th>STATE</th>
                                <th>DISTANCE 1</th>
                                <th>DISTANCE 2</th>
                                 <th>HOURS 1</th>
                                <th>HOURS 2</th>
                                  <th>PRICE PER MILES</th>
                                <th>STATUS</th>
                                <th>LAST UPDATED</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="transport-empty">
                                        <RefreshCw size={20} className="spin-icon" />
                                        <span>Loading state records...</span>
                                    </td>
                                </tr>
                            ) : filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="transport-empty">
                                        No states found
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((record) => (
                                    <tr key={record.stateId}>
                                        <td>
                                            <div className="transport-state-cell">
                                                <div className="transport-state-avatar">
                                                    {record.stateCode
                                                        ? record.stateCode.slice(0, 2).toUpperCase()
                                                        : record.stateName.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <strong>{record.stateName}</strong>
                                                    {record.stateCode && (
                                                        <small>{record.stateCode}</small>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            {record.configured ? record.distance1 : "—"}
                                        </td>

                                        <td>
                                            {record.configured ? record.distance2 : "—"}
                                        </td>
                                         <td>
                                            {record.configured ? record.d1_hours : "—"}
                                        </td>
                                         <td>
                                            {record.configured ? record.d2_hours : "—"}
                                        </td>
                                          <td>
                                            {record.configured ? record.price_permiles : "—"}
                                        </td>

                                        <td>
                                            <span
                                                className={`transport-status ${record.configured ? "active" : "inactive"
                                                    }`}
                                            >
                                                <span className="transport-status-dot" />
                                                {record.configured
                                                    ? "Configured"
                                                    : "Not Configured"}
                                            </span>
                                        </td>

                                        <td>
                                            {record.updatedAt
                                                ? new Date(record.updatedAt).toLocaleDateString()
                                                : "—"}
                                        </td>

                                        <td>
                                            <button
                                                className="transport-edit-btn"
                                                onClick={() => {
                                                    handleStateChange(record.stateId);
                                                    window.scrollTo({
                                                        top: 0,
                                                        behavior: "smooth",
                                                    });
                                                }}
                                                title="Edit distances"
                                            >
                                                <Pencil size={16} />
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="transport-table-footer">
                    Showing {filteredRecords.length} of {records.length} states
                </div>
            </div>
        </div>
    );
};

// Small reusable icon
const Settings2Icon = () => <Settings2 size={18} />;

export default TransportationDistance;
