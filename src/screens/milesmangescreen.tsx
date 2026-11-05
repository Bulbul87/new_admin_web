

import React, { useEffect, useMemo, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
    MapPin,
    Search,
    RefreshCw,
    Save,
    Edit3,
    CheckCircle2,
    Gauge,
    Map,
    Settings2,
    X,
} from "lucide-react";

import { toast } from "react-toastify";

import {
    getStateMiles,
    setStateMiles,
    type StateMiles,
} from "../service/statemiles.service";

import "./stateMiles.css";

const MilesManageScreen: React.FC = () => {
    const navigate = useNavigate();
    const [states, setStates] = useState<StateMiles[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);

    const [milesValues, setMilesValues] = useState<
        Record<string, string>
    >({});

    // ===================================
    // FETCH STATES
    // ===================================

    const fetchStates = async () => {
        try {
            setLoading(true);

            const response = await getStateMiles();

            if (response.success) {
                setStates(response.data);

                const values: Record<string, string> = {};

                response.data.forEach((state) => {
                    values[state.stateId] = String(state.miles ?? 0);
                });

                setMilesValues(values);
            } else {
                toast.error(response.message || "Failed to load states");
            }
        } catch (error: any) {
            console.error("Fetch state miles error:", error);

            toast.error(
                error.response?.data?.message ||
                "Unable to fetch state miles"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStates();
    }, []);

    // ===================================
    // SEARCH
    // ===================================

    const filteredStates = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        if (!keyword) return states;

        return states.filter(
            (state) =>
                state.name.toLowerCase().includes(keyword) ||
                state.code.toLowerCase().includes(keyword) ||
                state.stateId.toLowerCase().includes(keyword)
        );
    }, [states, search]);

    // ===================================
    // MILES INPUT
    // ===================================

    const handleMilesChange = (
        stateId: string,
        value: string
    ) => {
        if (value === "" || /^\d*\.?\d*$/.test(value)) {
            setMilesValues((prev) => ({
                ...prev,
                [stateId]: value,
            }));
        }
    };

    // ===================================
    // EDIT
    // ===================================

    const handleEdit = (state: StateMiles) => {
        setEditingId(state.stateId);

        setMilesValues((prev) => ({
            ...prev,
            [state.stateId]: String(state.miles ?? 0),
        }));
    };

    // ===================================
    // CANCEL EDIT
    // ===================================

    const handleCancel = (state: StateMiles) => {
        setEditingId(null);

        setMilesValues((prev) => ({
            ...prev,
            [state.stateId]: String(state.miles ?? 0),
        }));
    };

    // ===================================
    // ADD / UPDATE MILES
    // ===================================

    const handleSave = async (state: StateMiles) => {
        const value = milesValues[state.stateId];

        if (value === undefined || value.trim() === "") {
            toast.error("Please enter miles");
            return;
        }

        const miles = Number(value);

        if (!Number.isFinite(miles) || miles < 0) {
            toast.error("Please enter valid miles");
            return;
        }

        try {
            setSavingId(state.stateId);

            const response = await setStateMiles(
                state.stateId,
                miles
            );

            if (response.success) {
                toast.success(
                    response.message || "Miles saved successfully!"
                );

                setEditingId(null);

                // Refresh latest database records
                await fetchStates();
            } else {
                toast.error(response.message || "Unable to save miles");
            }
        } catch (error: any) {
            console.error("Save state miles error:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to save state miles"
            );
        } finally {
            setSavingId(null);
        }
    };

    // ===================================
    // STATS
    // ===================================

    const configuredStates = states.filter(
        (state) => state.milesRecord !== null
    ).length;

    const pendingStates = states.length - configuredStates;

    const totalMiles = states.reduce(
        (total, state) => total + (Number(state.miles) || 0),
        0
    );

    // ===================================
    // UI
    // ===================================

    return (
        <div className="state-miles-page">

            <div className="sm-header">
                <div >
                    <h2>State Miles Management</h2>

                    <p>
                        Configure and manage miles individually for each state.
                    </p>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <button
                        className="sm-refresh-btn"
                        onClick={fetchStates}
                        disabled={loading}
                    >
                        <RefreshCw size={17} />
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

            {/* STATS */}

            <div className="sm-stats-grid">

                <div className="sm-stat-card">
                    <div className="sm-stat-icon blue">
                        <Map size={22} />
                    </div>

                    <div>
                        <span>Total States</span>
                        <h3>{states.length}</h3>
                    </div>
                </div>

                <div className="sm-stat-card">
                    <div className="sm-stat-icon green">
                        <CheckCircle2 size={22} />
                    </div>

                    <div>
                        <span>Configured States</span>
                        <h3>{configuredStates}</h3>
                    </div>
                </div>

                <div className="sm-stat-card">
                    <div className="sm-stat-icon orange">
                        <Settings2 size={22} />
                    </div>

                    <div>
                        <span>Pending States</span>
                        <h3>{pendingStates}</h3>
                    </div>
                </div>

                <div className="sm-stat-card">
                    <div className="sm-stat-icon purple">
                        <Gauge size={22} />
                    </div>

                    <div>
                        <span>Total Configured Miles</span>
                        <h3>{totalMiles.toLocaleString("en-US")}</h3>
                    </div>
                </div>

            </div>

            {/* MAIN CARD */}

            <div className="sm-main-card">

                <div className="sm-card-header">

                    <div>
                        <h3>State Configuration</h3>

                        <p>
                            Add or update miles using the respective State ID.
                        </p>
                    </div>

                    <div className="sm-search">
                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search state, code or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        {search && (
                            <button onClick={() => setSearch("")}>
                                <X size={16} />
                            </button>
                        )}
                    </div>

                </div>

                {/* TABLE */}

                <div className="sm-table-wrapper">

                    <table className="sm-table">

                        <thead>
                            <tr>
                                <th>#</th>
                                <th>STATE NAME</th>
                                <th>STATE CODE</th>
                                <th>STATE ID</th>
                                <th>MILES</th>
                                <th>STATUS</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>

                        <tbody>

                            {loading ? (

                                <tr>
                                    <td colSpan={7}>
                                        <div className="sm-loading">
                                            <RefreshCw className="sm-spin" size={24} />
                                            <span>Loading states...</span>
                                        </div>
                                    </td>
                                </tr>

                            ) : filteredStates.length === 0 ? (

                                <tr>
                                    <td colSpan={7}>
                                        <div className="sm-empty">
                                            <MapPin size={35} />
                                            <h4>No states found</h4>
                                            <p>Try searching with another keyword.</p>
                                        </div>
                                    </td>
                                </tr>

                            ) : (

                                filteredStates.map((state, index) => {
                                    const isEditing =
                                        editingId === state.stateId;

                                    const isSaving =
                                        savingId === state.stateId;

                                    const isConfigured =
                                        state.milesRecord !== null;

                                    return (
                                        <tr key={state.stateId}>

                                            <td>
                                                {index + 1}
                                            </td>

                                            <td>
                                                <div className="sm-state-name">
                                                    <div className="sm-state-icon">
                                                        <MapPin size={17} />
                                                    </div>

                                                    <strong>{state.name}</strong>
                                                </div>
                                            </td>

                                            <td>
                                                <span className="sm-code">
                                                    {state.code}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="sm-id">
                                                    {state.stateId}
                                                </span>
                                            </td>

                                            <td>
                                                {isEditing ? (

                                                    <div className="sm-input-wrapper">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="any"
                                                            value={
                                                                milesValues[state.stateId] ?? ""
                                                            }
                                                            onChange={(e) =>
                                                                handleMilesChange(
                                                                    state.stateId,
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Enter miles"
                                                            autoFocus
                                                        />

                                                        <span>Miles</span>
                                                    </div>

                                                ) : (

                                                    <strong className="sm-mile-value">
                                                        {state.miles.toLocaleString("en-US")}
                                                        <small> mi</small>
                                                    </strong>

                                                )}
                                            </td>

                                            <td>
                                                {isConfigured ? (
                                                    <span className="sm-status configured">
                                                        <CheckCircle2 size={14} />
                                                        Configured
                                                    </span>
                                                ) : (
                                                    <span className="sm-status pending">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>

                                            <td>
                                                <div className="sm-actions">

                                                    {isEditing ? (

                                                        <>
                                                            <button
                                                                className="sm-save-btn"
                                                                onClick={() => handleSave(state)}
                                                                disabled={isSaving}
                                                            >
                                                                {isSaving ? (
                                                                    <RefreshCw
                                                                        size={15}
                                                                        className="sm-spin"
                                                                    />
                                                                ) : (
                                                                    <Save size={15} />
                                                                )}

                                                                {isSaving ? "Saving" : "Save"}
                                                            </button>

                                                            <button
                                                                className="sm-cancel-btn"
                                                                onClick={() => handleCancel(state)}
                                                                disabled={isSaving}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>

                                                    ) : (

                                                        <button
                                                            className="sm-edit-btn"
                                                            onClick={() => handleEdit(state)}
                                                        >
                                                            <Edit3 size={15} />

                                                            {isConfigured ? "Edit" : "Add Miles"}
                                                        </button>

                                                    )}

                                                </div>
                                            </td>

                                        </tr>
                                    );
                                })

                            )}

                        </tbody>

                    </table>

                </div>

                {/* FOOTER */}

                <div className="sm-table-footer">
                    <span>
                        Showing <strong>{filteredStates.length}</strong> of{" "}
                        <strong>{states.length}</strong> states
                    </span>

                    <span>
                        <CheckCircle2 size={15} />
                        Changes are saved to database
                    </span>
                </div>

            </div>

        </div>
    );
};

export default MilesManageScreen;