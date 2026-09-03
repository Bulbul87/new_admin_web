
import React, { useEffect, useMemo, useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import {
  FaUsers,
  FaUserTie,
  FaServicestack,
  FaDollarSign,
} from "react-icons/fa";

import {
  Layers3,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

// ==============================
// ADMIN APIs
// ==============================

import {
  getAllUsers,
  getAllProviders,
  getAdminStats,
} from "../service/admin.service";

// ==============================
// SERVICE API
// ==============================

import {
  serviceApi,
  type ServiceCatalogCategory,
} from "../service/service_catlog";

// ==============================
// CUSTOM TOOLTIP
// ==============================

const CustomTooltip = ({
  active,
  payload,
  label,
}: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "10px 14px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
          border: "1px solid #E5E7EB",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#14344A",
            fontWeight: 700,
          }}
        >
          {label}
        </p>

        <p
          style={{
            margin: "6px 0 0",
            color: "#34B7EA",
            fontWeight: 600,
          }}
        >
          Total: {payload[0].value}
        </p>
      </div>
    );
  }

  return null;
};

// ==============================
// DASHBOARD
// ==============================

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // ==============================
  // STATES
  // ==============================

  const [providers, setProviders] =
    useState<any[]>([]);

  const [services, setServices] =
    useState<ServiceCatalogCategory[]>([]);

  const [totalServices, setTotalServices] =
    useState(0);

  const [totalCategories, setTotalCategories] =
    useState(0);

  const [statsData, setStatsData] =
    useState<any>({
      users: {
        total: 0,
      },

      providers: {
        total: 0,
        verified: 0,
      },

      bookings: {
        total: 0,
        completed: 0,
      },

      revenue: {
        total: 0,
      },
    });

  const [loading, setLoading] =
    useState(true);

  // ==============================
  // FETCH DASHBOARD DATA
  // ==============================

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // ==========================
        // REQUESTERS
        // ==========================

        const usersData =
          await getAllUsers();

        console.log(
          "USERS API 👉",
          usersData
        );

        // ==========================
        // PROVIDERS
        // ==========================

        const providersData =
          await getAllProviders();

        console.log(
          "PROVIDERS API 👉",
          providersData
        );

        setProviders(
          providersData || []
        );

        // ==========================
        // SERVICE CATALOG
        // ==========================

        const catalogData =
          await serviceApi.getServiceCatalog({
            isActive: true,
          });

        console.log(
          "SERVICE CATALOG 👉",
          catalogData
        );

        const categories =
          catalogData?.categories || [];

        setServices(categories);

        // Total Categories
        setTotalCategories(
          catalogData?.totalCategories ||
            categories.length
        );

        // Total Services
        const calculatedTotalServices =
          categories.reduce(
            (total, category) =>
              total +
              (category.services?.length || 0),
            0
          );

        setTotalServices(
          catalogData?.totalServices ||
            calculatedTotalServices
        );

        // ==========================
        // ADMIN STATS
        // ==========================

        const statsRes: any =
          await getAdminStats();

        console.log(
          "ADMIN STATS 👉",
          statsRes
        );

        console.log(
          "USERS 👉",
          statsRes?.users
        );

        console.log(
          "PROVIDERS 👉",
          statsRes?.providers
        );

        console.log(
          "BOOKINGS 👉",
          statsRes?.bookings
        );

        console.log(
          "REVENUE 👉",
          statsRes?.revenue
        );

        setStatsData(
          statsRes || {}
        );
      } catch (error) {
        console.error(
          "Dashboard Error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ==============================
  // COUNTS
  // ==============================

  const totalUsers =
    statsData?.users?.total || 0;

  const totalProviders =
    statsData?.providers?.total || 0;

  const verifiedProviders =
    statsData?.providers?.verified || 0;

  const unverifiedProviders =
    Math.max(
      totalProviders -
        verifiedProviders,
      0
    );

  const totalBookings =
    statsData?.bookings?.total || 0;

  const completedBookings =
    statsData?.bookings?.completed || 0;

  const totalRevenue =
    statsData?.revenue?.total || 0;

  // ==============================
  // SERVICE CATEGORY CHART DATA
  // ==============================

  const servicesChartData = useMemo(() => {
    return services.map(
      (category) => ({
        category:
          category.categoryName,

        count:
          category.services?.length || 0,
      })
    );
  }, [services]);

  // ==============================
  // PIE CHART DATA
  // ==============================

  const pieData = [
    {
      name: "Verified Providers",
      value: verifiedProviders,
    },

    {
      name: "Bookings",
      value: totalBookings,
    },

    {
      name: "Completed Bookings",
      value: completedBookings,
    },
  ];

  // ==============================
  // PROVIDER BAR CHART DATA
  // ==============================

  const providerChartData = [
    {
      name: "Verified",
      count: verifiedProviders,
    },

    {
      name: "Unverified",
      count: unverifiedProviders,
    },
  ];

  // ==============================
  // PIE COLORS
  // ==============================

  const COLORS = [
    "#34B7EA",
    "#14344A",
    "#20c433",
  ];

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <div
        style={{
          marginLeft: "260px",
          marginTop: "70px",
          padding: "30px",
          fontSize: "20px",
          fontWeight: 600,
          color: "#14344A",
        }}
      >
        Loading Dashboard...
      </div>
    );
  }

  // ==============================
  // CARD STYLE
  // ==============================

  const cardStyle = {
    background: "#fff",

    borderRadius: 24,

    padding: 25,

    boxShadow:
      "0 8px 30px rgba(0,0,0,0.06)",

    position: "relative" as const,

    overflow: "hidden" as const,

    cursor: "pointer",

    transition: "0.3s",
  };

  // ==============================
  // UI
  // ==============================

  return (
    <div
      style={{
        marginLeft: "260px",

        marginTop: "70px",

        padding: "25px",

        minHeight: "100vh",

        background: "#F5F7FB",
      }}
    >
      {/* ========================================= */}
      {/* HEADER */}
      {/* ========================================= */}

      <div
        style={{
          marginBottom: 35,
        }}
      >
        <h1
          style={{
            margin: 0,

            color: "#14344A",

            fontWeight: 800,

            fontSize: 34,
          }}
        >
          Senioramerica Dashboard
        </h1>
      </div>

      {/* ========================================= */}
      {/* TOP CARDS */}
      {/* ========================================= */}

      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            "repeat(auto-fit, minmax(240px, 1fr))",

          gap: 25,

          marginBottom: 35,
        }}
      >
        {/* ========================================= */}
        {/* USERS */}
        {/* ========================================= */}

        <div
          style={cardStyle}
          onClick={() =>
            navigate("/users", {
              state: {
                activeTab: "requester",
              },
            })
          }
        >
          <div
            style={{
              width: 60,

              height: 60,

              borderRadius: 18,

              background:
                "linear-gradient(to right, #FFFF6D, #8FDAFA)",

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              marginBottom: 18,
            }}
          >
            <FaUsers
              size={28}
              color="#14344A"
            />
          </div>

          <h4
            style={{
              color: "#6b7280",
              marginBottom: 8,
            }}
          >
            Total Requesters
          </h4>

          <h1
            style={{
              margin: "8px 0",

              color: "#14344A",

              fontWeight: 800,

              fontSize: 42,
            }}
          >
            {totalUsers}
          </h1>
        </div>

        {/* ========================================= */}
        {/* PROVIDERS */}
        {/* ========================================= */}

        <div
          style={cardStyle}
          onClick={() =>
            navigate("/users", {
              state: {
                activeTab: "provider",
              },
            })
          }
        >
          <div
            style={{
              width: 60,

              height: 60,

              borderRadius: 18,

              background:
                "linear-gradient(to right, #14344A, #34B7EA)",

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              marginBottom: 18,
            }}
          >
            <FaUserTie
              size={28}
              color="#fff"
            />
          </div>

          <h4
            style={{
              color: "#6b7280",
              marginBottom: 8,
            }}
          >
            Total Providers
          </h4>

          <h1
            style={{
              margin: "8px 0",

              color: "#34B7EA",

              fontWeight: 800,

              fontSize: 42,
            }}
          >
            {totalProviders}
          </h1>
        </div>

        {/* ========================================= */}
        {/* SERVICES */}
        {/* ========================================= */}

        <div
          style={cardStyle}
          onClick={() =>
            navigate("/services")
          }
        >
          <div
            style={{
              width: 60,

              height: 60,

              borderRadius: 18,

              background:
                "linear-gradient(to right, #FFFF6D, #8FDAFA)",

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              marginBottom: 18,
            }}
          >
            <FaServicestack
              size={28}
              color="#14344A"
            />
          </div>

          <h4
            style={{
              color: "#6b7280",
              marginBottom: 8,
            }}
          >
            Total Services
          </h4>

          <h1
            style={{
              margin: "8px 0",

              color: "#14344A",

              fontWeight: 800,

              fontSize: 42,
            }}
          >
            {totalServices}
          </h1>
        </div>

        {/* ========================================= */}
        {/* CATEGORIES */}
        {/* ========================================= */}

        <div
          style={cardStyle}
          onClick={() =>
            navigate("/services")
          }
        >
          <div
            style={{
              width: 60,

              height: 60,

              borderRadius: 18,

              background:
                "linear-gradient(to right, #14344A, #34B7EA)",

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              marginBottom: 18,
            }}
          >
            <Layers3
              size={28}
              color="#fff"
            />
          </div>

          <h4
            style={{
              color: "#6b7280",
              marginBottom: 8,
            }}
          >
            Total Categories
          </h4>

          <h1
            style={{
              margin: "8px 0",

              color: "#14344A",

              fontWeight: 800,

              fontSize: 42,
            }}
          >
            {totalCategories}
          </h1>
        </div>

        {/* ========================================= */}
        {/* REVENUE */}
        {/* ========================================= */}

        <div
          style={{
            ...cardStyle,

            cursor: "default",
          }}
        >
          <div
            style={{
              width: 60,

              height: 60,

              borderRadius: 18,

              background:
                "linear-gradient(to right, #34B7EA, #8FDAFA)",

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              marginBottom: 18,
            }}
          >
            <FaDollarSign
              size={28}
              color="#fff"
            />
          </div>

          <h4
            style={{
              color: "#6b7280",
              marginBottom: 8,
            }}
          >
            Total Revenue
          </h4>

          <h1
            style={{
              margin: "8px 0",

              color: "#14344A",

              fontWeight: 800,

              fontSize: 32,
            }}
          >
            ${totalRevenue}
          </h1>
        </div>
      </div>

      {/* ========================================= */}
      {/* SERVICE CATEGORY CHART */}
      {/* ========================================= */}

      <div
        style={{
          ...cardStyle,

          height: 520,

          marginBottom: 30,

          cursor: "default",
        }}
      >
        <h2
          style={{
            marginBottom: 25,

            color: "#14344A",

            fontWeight: 700,
          }}
        >
          Service Categories Analytics
        </h2>

        {servicesChartData.length === 0 ? (
          <div
            style={{
              height: "85%",

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              color: "#64748B",

              fontWeight: 600,
            }}
          >
            No service category data found.
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="88%"
          >
            <BarChart
              data={servicesChartData}
              margin={{
                top: 10,
                right: 30,
                left: 10,
                bottom: 60,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
              />

              <XAxis
                dataKey="category"
                angle={-25}
                textAnchor="end"
                height={80}
                tick={{
                  fontSize: 13,
                  fill: "#14344A",
                }}
              />

              <YAxis
                allowDecimals={false}
                tick={{
                  fontSize: 13,
                  fill: "#14344A",
                }}
              />

              <Tooltip
                content={
                  <CustomTooltip />
                }
                cursor={false}
              />

              <Bar
                dataKey="count"
                fill="#34B7EA"
                radius={[
                  10,
                  10,
                  0,
                  0,
                ]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ========================================= */}
      {/* BOTTOM CHARTS */}
      {/* ========================================= */}

      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            "1fr 1fr",

          gap: 25,
        }}
      >
        {/* ========================================= */}
        {/* BOOKING PIE CHART */}
        {/* ========================================= */}

        <div
          style={{
            ...cardStyle,

            height: 500,

            cursor: "default",
          }}
        >
          <h2
            style={{
              marginBottom: 25,

              color: "#14344A",

              fontWeight: 700,
            }}
          >
            Booking Overview
          </h2>

          <ResponsiveContainer
            width="100%"
            height={380}
          >
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({
                  name,
                  value,
                }) =>
                  `${name}: ${value}`
                }
              >
                {pieData.map(
                  (
                    entry,
                    index
                  ) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        COLORS[
                          index %
                            COLORS.length
                        ]
                      }
                    />
                  )
                )}
              </Pie>

              <Tooltip />

              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* ========================================= */}
        {/* PROVIDER VERIFICATION */}
        {/* ========================================= */}

        <div
          style={{
            ...cardStyle,

            height: 500,

            cursor: "default",
          }}
        >
          <h2
            style={{
              marginBottom: 25,

              color: "#14344A",

              fontWeight: 700,
            }}
          >
            Providers Verification Status
          </h2>

          <ResponsiveContainer
            width="100%"
            height="85%"
          >
            <BarChart
              data={providerChartData}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
              />

              <XAxis
                dataKey="name"
              />

              <YAxis
                allowDecimals={false}
              />

              <Tooltip
                content={
                  <CustomTooltip />
                }
              />

              <Bar
                dataKey="count"
                fill="#14344A"
                radius={[
                  10,
                  10,
                  0,
                  0,
                ]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

