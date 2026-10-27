import { ArrowLeft } from "lucide-react";

import { useNavigate } from "react-router-dom";

const ProviderOnlineOfflineStatus = () => {
  const navigate = useNavigate();


  return (
    <div
      style={{
        marginLeft: "260px",
        marginTop: "70px",
        padding: "30px",
        minHeight: "calc(100vh - 70px)",
        background: "#f4f7fb",
        boxSizing: "border-box",
      }}
    >

           
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >

        <h1
          style={{
            color: "#14344A",
            fontSize: "26px",
            fontWeight: 700,
            margin: 0,
          }}
        >
          Caregiver Online/Offline Status
        </h1>


        <div className="d-flex gap-2">
  <button
            onClick={() => navigate("/users")}
             className="booking-back-btn "
          >
            <ArrowLeft size={17} />
            Back
          </button>
      
        </div>
      </div>

  
    </div>
  );
};

export default ProviderOnlineOfflineStatus;