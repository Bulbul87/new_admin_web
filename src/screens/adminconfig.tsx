
import React, { useEffect, useState } from 'react';
import { FaShieldAlt, FaLock } from 'react-icons/fa';
// import { api } from '../service/api'; 
import { testapi } from '../service/testapi'; 
interface AgeSettings {
  registrationMinAge: number;
  requestorBookingMinAge: number;
  selfCareMinAge: number;
}

const DEFAULT_SETTINGS: AgeSettings = {
  registrationMinAge: 18,
  requestorBookingMinAge: 18,
  selfCareMinAge: 55,
};

const Adminconfigscreen: React.FC = () => {
  const [settings, setSettings] = useState<AgeSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Load age settings from backend
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await testapi.get<AgeSettings>('/age');

      setSettings({
        registrationMinAge: Number(response.registrationMinAge),
        requestorBookingMinAge: Number(response.requestorBookingMinAge),
        selfCareMinAge: Number(response.selfCareMinAge),
      });
    } catch (err) {
      console.error('Failed to fetch age settings:', err);
      setError(
        err instanceof Error ? err.message : 'Unable to load age settings.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field: keyof AgeSettings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value === '' ? 0 : Number(value),
    }));
    setMessage('');
    setError('');
  };

  // Save settings
  const handleSave = async () => {
    const values = Object.values(settings);

    if (values.some((value) => !Number.isInteger(value) || value < 1 || value > 120)) {
      setError('Please enter a valid age between 1 and 120.');
      setMessage('');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');

      const response = await testapi.put<AgeSettings>(
        '/age',
        settings
      );

      setSettings({
        registrationMinAge: Number(response.registrationMinAge),
        requestorBookingMinAge: Number(response.requestorBookingMinAge),
        selfCareMinAge: Number(response.selfCareMinAge),
      });

      setMessage('Age settings saved successfully.');
    } catch (err) {
      console.error('Failed to save age settings:', err);
      setError(
        err instanceof Error ? err.message : 'Unable to save age settings.'
      );
    } finally {
      setSaving(false);
    }
  };

  // Reset settings to backend defaults
  const handleReset = async () => {
    try {
      setResetting(true);
      setError('');
      setMessage('');

      const response = await testapi.delete<AgeSettings>('/age');

      setSettings({
        registrationMinAge: Number(response.registrationMinAge),
        requestorBookingMinAge: Number(response.requestorBookingMinAge),
        selfCareMinAge: Number(response.selfCareMinAge),
      });

      setMessage('Age settings reset successfully.');
    } catch (err) {
      console.error('Failed to reset age settings:', err);
      setError(
        err instanceof Error ? err.message : 'Unable to reset age settings.'
      );
    } finally {
      setResetting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px 15px',
    border: '1px solid #d7e0e8',
    borderRadius: '10px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    background: '#fff',
    color: '#14344A',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#263e50',
  };

  return (
    <div
      style={{
        marginLeft: '260px',
        marginTop: '70px',
        padding: '30px',
        minHeight: 'calc(100vh - 70px)',
        background: '#f4f7fb',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
        }}
      >
        <div style={{ marginBottom: '28px' }}>
          <h2
            style={{
              color: '#14344A',
              fontSize: '26px',
              fontWeight: 700,
              margin: '0 0 8px',
            }}
          >
            Admin Configuration
          </h2>
          <p style={{ color: '#6b7c8d', margin: 0, fontSize: '14px' }}>
            Manage registration and service eligibility age settings.
          </p>
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: '18px',
            padding: '28px',
            boxShadow: '0 8px 30px rgba(20, 52, 74, 0.07)',
            border: '1px solid #e8eef3',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '25px',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #14344A, #3185b5)',
                color: '#fff',
                fontSize: '20px',
              }}
            >
              <FaShieldAlt />
            </div>

            <div>
              <h3
                style={{
                  margin: 0,
                  color: '#14344A',
                  fontSize: '19px',
                  fontWeight: 700,
                }}
              >
                Age Configuration
              </h3>
              <p style={{ margin: '5px 0 0', color: '#82909c', fontSize: '13px' }}>
                Set minimum age requirements
              </p>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '35px 0', textAlign: 'center', color: '#607789' }}>
              Loading age settings...
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '22px',
                }}
              >
                <div>
                  <label style={labelStyle}>Registration Minimum Age</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={settings.registrationMinAge}
                    onChange={(e) =>
                      handleChange('registrationMinAge', e.target.value)
                    }
                    style={inputStyle}
                  />
                  <small style={{ color: '#83919c', display: 'block', marginTop: '7px' }}>
                    Minimum age required for registration
                  </small>
                </div>

                <div>
                  <label style={labelStyle}>Requestor Booking Minimum Age</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={settings.requestorBookingMinAge}
                    onChange={(e) =>
                      handleChange('requestorBookingMinAge', e.target.value)
                    }
                    style={inputStyle}
                  />
                  <small style={{ color: '#83919c', display: 'block', marginTop: '7px' }}>
                    Minimum age required to book a service
                  </small>
                </div>

                <div>
                  <label style={labelStyle}>Self Care Minimum Age</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={settings.selfCareMinAge}
                    onChange={(e) =>
                      handleChange('selfCareMinAge', e.target.value)
                    }
                    style={inputStyle}
                  />
                  <small style={{ color: '#83919c', display: 'block', marginTop: '7px' }}>
                    Minimum age required for self-care eligibility
                  </small>
                </div>
              </div>

              {message && (
                <div
                  role="status"
                  style={{
                    marginTop: '22px',
                    padding: '12px 15px',
                    borderRadius: '9px',
                    background: '#eaf8ef',
                    color: '#247443',
                    fontSize: '14px',
                  }}
                >
                  {message}
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  style={{
                    marginTop: '22px',
                    padding: '12px 15px',
                    borderRadius: '9px',
                    background: '#fff0f0',
                    color: '#bd3030',
                    fontSize: '14px',
                  }}
                >
                  {error}
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginTop: '28px',
                  paddingTop: '22px',
                  borderTop: '1px solid #edf1f4',
                }}
              >
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || resetting}
                  style={{
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 25px',
                    background: 'linear-gradient(100deg, #14344A, #287eac)',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: saving || resetting ? 'not-allowed' : 'pointer',
                    opacity: saving || resetting ? 0.65 : 1,
                  }}
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={saving || resetting}
                  style={{
                    border: '1px solid #d5dfe7',
                    borderRadius: '10px',
                    padding: '12px 22px',
                    background: '#fff',
                    color: '#38566b',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: saving || resetting ? 'not-allowed' : 'pointer',
                    opacity: saving || resetting ? 0.65 : 1,
                  }}
                >
                  {resetting ? 'Resetting...' : 'Reset to Default'}
                </button>
              </div>
            </>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            marginTop: '20px',
            padding: '16px 18px',
            borderRadius: '12px',
            background: '#eaf2f8',
            color: '#426176',
            fontSize: '13px',
            lineHeight: 1.6,
          }}
        >
          <FaLock style={{ marginTop: '3px', flexShrink: 0 }} />
          <span>
            These settings control age validation in the application. Changes
            will take effect only if the backend validation APIs read the
            updated values from the database.
          </span>
        </div>
      </div>
    </div>
  );
};

export default Adminconfigscreen;

