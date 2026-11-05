import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const MilesManageScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
    <div style={{
        marginLeft: '260px',
        marginTop: '70px',
        padding: '30px',
        minHeight: 'calc(100vh - 70px)',
        background: '#f4f7fb',
        boxSizing: 'border-box',
      }} >
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          background: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}>
<div>
     <h2>Miles Management</h2>
      <p>This is the Miles Management screen.</p>
</div>
<div>
    <button
            type="button"
            onClick={() => navigate("/admin-config")}
            style={{ display: "inline-flex",
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
  cursor: "pointer",}}
          >
            <FaArrowLeft size={16} />
            Back 
          </button>
</div>
        </div>
     
    </div>
    </>
  );
};

export default MilesManageScreen;