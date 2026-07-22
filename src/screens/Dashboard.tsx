

import React, { useEffect, useState } from "react";

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

import { useNavigate } from "react-router-dom";

// ==============================
// APIs
// ==============================

import {
  getAllUsers,
  getAllProviders,
  getAdminStats,
} from "../service/admin.service";

import { serviceApi } from "../service/serviceapi";

// ==============================
// CUSTOM TOOLTIP
// ==============================

const CustomTooltip = ({
  active,
  payload,
  label,
}: any) => {
  if (
    active &&
    payload &&
    payload.length
  ) {
    return (
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "10px 14px",
          boxShadow:
            "0 6px 20px rgba(0,0,0,0.12)",
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

  const [services, setServices] =
    useState<any[]>([]);

  const [providers, setProviders] =
    useState<any[]>([]);

  const [totalServices, setTotalServices] =
    useState(0);

  const [statsData, setStatsData] =
    useState<any>({
      users: { total: 0 },
      providers: {
        total: 0,
        verified: 0,
      },
      bookings: {
        total: 0,
        completed: 0,
      },
      revenue: { total: 0 },
    });

  const [loading, setLoading] =
    useState(true);

  // ==============================
  // FETCH DATA
  // ==============================

  useEffect(() => {
    const fetchDashboardData =
      async () => {
        try {
          setLoading(true);

          // USERS
          await getAllUsers();

          // PROVIDERS
          const providersData =
            await getAllProviders();

          // SERVICES
          const servicesData =
            await serviceApi.getAllServices({
              page: 1,
              limit: 1000,
            });

          // ADMIN STATS
          const statsRes: any =
            await getAdminStats();

          console.log(
            "ADMIN STATS 👉",
            statsRes
          );

          setStatsData(
            statsRes || {}
          );

          // PROVIDERS SAVE
          setProviders(
            providersData || []
          );

          // SERVICES
          setServices(
            servicesData?.services || []
          );

          setTotalServices(
            servicesData?.services
              ?.length || 0
          );

        } catch (error) {
          console.log(
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
    statsData?.providers
      ?.verified || 0;

  const unverifiedProviders =
    totalProviders -
    verifiedProviders;

  const totalBookings =
    statsData?.bookings?.total || 0;

  const completedBookings =
    statsData?.bookings
      ?.completed || 0;

  const totalRevenue =
    statsData?.revenue?.total || 0;

  // ==============================
  // SERVICES CATEGORY CHART
  // ==============================

  const categoryMap: any = {};

  services.forEach((service) => {
    const category =
      service.category || "Other";

    categoryMap[category] =
      (categoryMap[category] || 0) + 1;
  });

  const servicesChartData =
    Object.keys(categoryMap).map(
      (key) => ({
        category: key,
        count: categoryMap[key],
      })
    );

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
  // PROVIDERS BAR CHART
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
  // COLORS
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
      }}
    >
      {/* HEADER */}

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

      {/* TOP CARDS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 25,
          marginBottom: 35,
        }}
      >
        {/* USERS */}

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

        {/* PROVIDERS */}

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

        {/* SERVICES */}

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

        {/* REVENUE */}

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

      {/* SERVICE CHART FULL WIDTH */}

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

        <ResponsiveContainer
          width="100%"
          height="88%"
        >
          <BarChart
            data={servicesChartData}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
            />

            <XAxis dataKey="category" />

            <YAxis />

            <Tooltip
              content={<CustomTooltip />}
              cursor={false}
            />

            <Bar
              dataKey="count"
              fill="#34B7EA"
              radius={[10, 10, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* BOTTOM CHARTS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: 25,
        }}
      >
        {/* PIE CHART */}

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
                label={({ name, value }) =>
                  `${name}: ${value}`
                }
              >
                {pieData.map(
                  (entry, index) => (
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

        {/* VERIFIED / UNVERIFIED */}

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

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip
                content={<CustomTooltip />}
              />

              <Bar
                dataKey="count"
                fill="#14344A"
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;