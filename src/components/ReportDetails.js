import React from 'react';
import '../styles/reports.css';
import ReportUpdate from './ReportUpdate';

// Tailwind CSS badge rendering helper
export function getStatusBadge(status) {
  const base =
    'inline-block rounded-full px-3 py-1 text-sm font-semibold border align-middle whitespace-nowrap';
  if (!status) return null;
  const s = status.trim().toLowerCase().replace(/_/g, ' ');
  let label = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  if (s === 'pending')
    return <span className={base + ' bg-yellow-50 text-yellow-800 border-yellow-300'}>Pending</span>;
  if (s === 'action taken')
    return <span className={base + ' bg-green-50 text-green-800 border-green-300'}>Action Taken</span>;
  if (s === 'dismissed')
    return <span className={base + ' bg-red-50 text-red-800 border-red-300'}>Dismissed</span>;
  // fallback for unknown statuses, always show a badge
  return <span className={base + ' bg-gray-100 text-gray-700 border-gray-300'}>{label}</span>;
}

const ReportDetails = ({ report, onUpdate, currentUser }) => {
  if (!report) return <div style={{ padding: '1rem' }}>No report selected</div>;

  let attachments = [];
  try {
    attachments = typeof report.attachments === 'string' ? JSON.parse(report.attachments) : (report.attachments || []);
  } catch (e) {
    console.error("Failed to parse attachments", e);
  }

  return (
    <div className="report-details">
      <h2>{report.title}</h2>
      <br></br>
      <p><strong>Reporter:</strong> {report.reporter}</p>
      <br></br>
      <p><strong>Published:</strong> {report.publishedDate}</p>
      <br></br>
      <p><strong>Vehicle Type:</strong> {report.vehicleType}</p>
      <br></br>
      <p><strong>Plate No.:</strong> {report.plate}</p>
      <br></br>
      <p><strong>Location:</strong> {report.location}</p>
      <br></br>
      <p><strong>Date & Time:</strong> {report.datetime}</p>
      <br></br>
      <p><strong>Description:</strong></p>
      <p>{report.description}</p>
      <br></br>
      {/* Status badge uses Tailwind CSS for styling */}
      <p><strong>Status:</strong> {getStatusBadge(report.status)}</p>

      {attachments && attachments.length > 0 && (
        <div className="attachments">
          <br></br>
          <h4><strong>Attachments: {attachments.length}</strong></h4>
          <ul>
            {attachments.map((a, idx) => (
              <li key={idx}>
                {a.name} ({a.type})
              </li>
            ))}
          </ul>
        </div>
      )}
      <ReportUpdate report={report} onUpdate={onUpdate} currentUser={currentUser} />
    </div>
  );
};

export default ReportDetails;
