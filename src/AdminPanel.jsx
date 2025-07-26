import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

const AdminPanel = () => {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('admin-auth');
    if (!isAuthenticated) {
      navigate('/admin-login');
    }
  }, [navigate]);

  useEffect(() => {
    fetch('http://localhost:5000/api/attendance/all')
      .then(res => res.json())
      .then(data => setRecords(data))
      .catch(err => console.error('Failed to fetch', err));
  }, []);

  // Group records by ID
  const groupedRecords = records.reduce((acc, record) => {
    if (!acc[record.id]) {
      acc[record.id] = [];
    }
    acc[record.id].push(record);
    return acc;
  }, {});

  const filteredGroupedRecords = Object.entries(groupedRecords).filter(
    ([id, entries]) =>
      id.includes(searchTerm) ||
      entries.some(entry =>
        entry.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return (
    <div className="container admin-container mt-4">
      <h2 className="admin-title">Admin Attendance Panel</h2>

      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search by ID or Name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="table-responsive">
        <table className="table table-bordered admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Date</th>
              <th>Day</th>
              <th>In Time</th>
              <th>Lunch Out</th>
              <th>Lunch In</th>
              <th>Out Time</th>
              <th>Leave Type</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroupedRecords.map(([id, records]) =>
              records.map((record, idx) => (
                <tr key={`${id}-${idx}`}>
                  <td>{record.id}</td>
                  <td>{record.name}</td>
                  <td>{record.date}</td>
                  <td>{record.day}</td>
                  <td>{record.inTime}</td>
                  <td>{record.lunchOut}</td>
                  <td>{record.lunchIn}</td>
                  <td>{record.outTime}</td>
                  <td>{record.leaveType}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => {
          localStorage.removeItem('admin-auth');
          window.location.href = '/admin-login';
        }}
        className="btn btn-danger mb-3"
      >
        Logout
      </button>
    </div>
  );
};

export default AdminPanel;
