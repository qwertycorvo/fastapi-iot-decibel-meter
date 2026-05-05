import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import '../styles/reports.css';


const ReportForm = ({ addReport }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    reporter: '',
    description: '',
    location: '',
    datetime: '',
    plate: '',
    vehicleType: 'Motorcycle',
    attachments: [],
  });
  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  useEffect(() => {
    console.log('ReportForm mounted, showPopup:', showPopup);
    if (showPopup) {
      console.log('Rendering popup');
    }
    return () => {
      console.log('ReportForm unmounted');
    };
  }, [showPopup]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    setForm((prev) => ({ ...prev, attachments: files }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title) errs.title = 'Title is required';
    if (!form.reporter) errs.reporter = 'Reporter name is required';
    if (!form.description) errs.description = 'Description is required';
    if (!form.location) errs.location = 'Location is required';
    if (!form.datetime) errs.datetime = 'Date & Time is required';
    if (!form.plate) errs.plate = 'Vehicle plate number is required';
    if (!form.vehicleType) errs.vehicleType = 'Vehicle type is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const report = {
      title: form.title,
      reporter: form.reporter,
      description: form.description,
      location: form.location,
      datetime: form.datetime,
      plate: form.plate,
      vehicleType: form.vehicleType,
      attachments: JSON.stringify(form.attachments.map((f) => ({ name: f.name, type: f.type }))),
      status: 'PENDING',
    };
    addReport(report);
    setForm({
      title: '', reporter: '', description: '', location: '', datetime: '', plate: '', vehicleType: 'Motorcycle', attachments: [],
    });
    setErrors({});
    setShowPopup(true);
    // DO NOT navigate here
    console.log('handleSubmit: setShowPopup(true)');
  };

  return (
    <>
      {showPopup && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(30,41,59,0.35)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
          }} />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(34,197,94,0.98)',
            color: '#fff',
            padding: '2rem 3rem',
            borderRadius: '1.5rem',
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)',
            fontWeight: 600,
            fontSize: '1.25rem',
            letterSpacing: '0.03em',
            border: '2px solid #22c55e',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            zIndex: 10000,
          }}>
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#fff" fillOpacity=".15"/><path d="M7 13l3 3 7-7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span>Report Submitted</span>
            <button
              style={{
                marginTop: '1rem',
                padding: '0.5rem 2rem',
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: '0.75rem',
                background: '#fff',
                color: '#22c55e',
                border: '2px solid #22c55e',
                cursor: 'pointer',
                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
              }}
              onClick={() => {
                setShowPopup(false);
                navigate('/reports'); // Only navigate here
              }}
            >
              OK
            </button>
          </div>
        </div>,
        document.body
      )}
      <div className="report-form-container" style={{ position: 'relative' }}>
        <h2>Make a Report</h2>
        <form className="report-form" onSubmit={handleSubmit}>
          <label>Report Title *</label>
          <input name="title" value={form.title} onChange={handleChange} />
          {errors.title && <div className="error">{errors.title}</div>}

          <label>Reporter Name *</label>
          <input name="reporter" value={form.reporter} onChange={handleChange} />
          {errors.reporter && <div className="error">{errors.reporter}</div>}

          <label>Report Description *</label>
          <textarea name="description" value={form.description} onChange={handleChange} />
          {errors.description && <div className="error">{errors.description}</div>}

          <label>Location of Report *</label>
          <input name="location" value={form.location} onChange={handleChange} />
          {errors.location && <div className="error">{errors.location}</div>}

          <label>Date & Time *</label>
          <input name="datetime" type="datetime-local" value={form.datetime} onChange={handleChange} />
          {errors.datetime && <div className="error">{errors.datetime}</div>}

          <label>Vehicle Plate No. *</label>
          <input name="plate" value={form.plate} onChange={handleChange} />
          {errors.plate && <div className="error">{errors.plate}</div>}

          <label>Vehicle Type *</label>
          <select name="vehicleType" value={form.vehicleType} onChange={handleChange}>
            <option>Motorcycle</option>
            <option>Car</option>
          </select>
          {errors.vehicleType && <div className="error">{errors.vehicleType}</div>}

          <label>Additional Attachments (optional)</label>
          <input type="file" multiple onChange={handleFiles} />

          <button type="submit" className="btn-submit">Submit Report</button>
        </form>
      </div>
    </>
  );
};

export default ReportForm;
