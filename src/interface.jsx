import React, { useState, useEffect } from 'react';
import './interface.css';

const userData = {
  "101": "Arjun Kumar",
  "102": "Sana Reddy",
  "103": "Vikram Das"
};

const AttendanceSystem = () => {
 const [formData, setFormData] = useState({
  id: '',
  name: '',
  date: '',
  day: '',
  inTime: '',
  lunchIn: '',
  lunchOut: '',
  outTime: '',
  casualType: '',
  leaveType: ''
});


  const [lunchSubmitEnabled, setLunchSubmitEnabled] = useState(false);
  const [timeDifferenceWarning, setTimeDifferenceWarning] = useState('');
  const [message, setMessage] = useState('');
  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const getCurrentTime = () => {
  const now = new Date();
  return now.toTimeString().slice(0, 5); // "HH:MM"
};


  const getCurrentDay = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { weekday: 'long' });
  };

 const handleChange = async (e) => {
  const { id, value } = e.target;

  // Leave Type logic (used in Out Time form)
  if (id === 'leaveType') {
    setFormData(prev => ({ ...prev, leaveType: value }));
    return;
  }

  // ID logic (used across all forms)
  if (id === 'id') {
    const name = userData[value] || ''; // auto-name from ID if mapping exists
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });

    // Fill shared fields
    setFormData(prev => ({
      ...prev,
      id: value,
      name,
      date: formattedDate,
      day: currentDay,
      inTime: prev.inTime || getCurrentTime()
    }));

    // Fetch existing attendance if any (affects Lunch and Out Time forms)
    try {
      const res = await fetch('http://localhost:5000/api/attendance/getByIdDate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: value, date: formattedDate })
      });

      if (res.ok) {
        const data = await res.json();

        // Update formData with backend values (if they exist)
        setFormData(prev => ({
          ...prev,
          name: data.name || prev.name,
          inTime: data.inTime || prev.inTime,
          lunchOut: data.lunchOut || '',
          lunchIn: data.lunchIn || '',
          outTime: data.outTime || ''
        }));

        // LUNCH form logic
        if (!data.lunchOut) {
          setLunchSubmitEnabled(true); // Allow Lunch Out
          setMessage('');
        } else if (!data.lunchIn) {
          setLunchSubmitEnabled(true); // Allow Lunch In
          setMessage('');
        } else {
          setLunchSubmitEnabled(false); // Both submitted
          setMessage('🥗 Lunch In & Out already submitted.');
        }

        // OUT TIME form logic (optional: could disable based on lunch status)
        if (data.lunchOut && data.lunchIn && !data.outTime) {
          // Ready to allow outTime
          // You can also set button enabling logic here
        }

      } else {
        // No existing doc: new entry
        setLunchSubmitEnabled(true);
        setMessage('');
      }
    } catch (err) {
      console.error('🔴 Error fetching attendance:', err);
    }

    return;
  }

  // Default for all other inputs
  setFormData(prev => ({ ...prev, [id]: value }));
};


  useEffect(() => {
    if (formData.outTime) {
      const [hour] = formData.outTime.split(':').map(Number);
      if (hour >= 18) {
        setFormData(prev => ({
          ...prev,
          casualType: 'Casual Type',
          leaveType: 'Casual'
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          casualType: '',
          leaveType: ''
        }));
      }
    }
  }, [formData.outTime]);

  useEffect(() => {
    if (formData.inTime && formData.outTime) {
      const [inHour, inMin] = formData.inTime.split(':').map(Number);
      const [outHour, outMin] = formData.outTime.split(':').map(Number);
      const diff = (outHour * 60 + outMin) - (inHour * 60 + inMin);
      if (diff > 30) {
        setTimeDifferenceWarning('⚠️ Time difference between In and Out is more than 30 minutes.');
      } else {
        setTimeDifferenceWarning('');
      }
    }
  }, [formData.inTime, formData.outTime]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('http://localhost:5000/api/attendance/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message || 'Submitted successfully!');
    } else {
      alert(result.error || 'Submission failed!');
    }
  } catch (err) {
    console.error(err);
    alert('Failed to submit.');
  }
};


  const handleLunchSubmit = async (e) => {
  e.preventDefault();

  console.log("Submitting formData:", formData);

  if (!formData.id || !formData.date) {
    alert("Please enter ID and Date before submitting.");
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/attendance/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: formData.id,
        name: formData.name,
        date: formData.date,
        day: formData.day,
        lunchOut: formData.lunchOut || '', // send blank if not filled
        lunchIn: formData.lunchIn || ''
      })
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message || 'Lunch submitted!');
      // Reset lunch fields only (if needed)
      setFormData(prev => ({
        ...prev,
        lunchOut: '',
        lunchIn: ''
      }));
      setLunchSubmitEnabled(false);
      setMessage(result.message || '');
    } else {
     alert(result.error || 'Submission failed.');
    }

  } catch (err) {
    console.error('🔴 Submission error:', err);
    alert('Lunch submission failed.');
  }
};



  return (
    <div className="main-wrapper">
      <header className="d-flex align-items-center justify-content-between px-4 py-3 bg-white shadow-sm">
        <img src="company-logo.png" alt="Company Logo" className="company-logo" style={{ height: '50px' }} />
        <h1 className="text-center flex-grow-1 m-0">Attendance System</h1>
      </header>

      <div className="container py-5">
        <div className="row">
          {/* In Time */}
          <div className="col-md-4 mb-4">
            <div className="card p-3 h-100">
              <h5 className="card-title">Intime Details</h5>
              <form>
                <input type="text" id="id" className="form-control mb-2" placeholder="ID" value={formData.id} onChange={handleChange} />
                <input type="text" className="form-control mb-2" value={formData.name} readOnly placeholder="Name" />
                <input type="date" className="form-control mb-2" value={formData.date} readOnly />
                <input type="text" className="form-control mb-2" value={formData.day} readOnly placeholder="Day" />
                <input type="time" className="form-control mb-2" value={formData.inTime} onClick={() => {
                const now = new Date();
                const formattedTime = now.toTimeString().slice(0, 5); // "HH:MM"
                setFormData(prev => ({ ...prev, inTime: formattedTime }));
                 }}readOnly />
                <button className="btn btn-primary btn-block" onClick={handleSubmit}>Submit</button>
              </form>
            </div>
          </div>

          {/* Lunch */}
          <div className="col-md-4 mb-4">
            <div className="card p-3 h-100">
              <h5 className="card-title">Lunch Details</h5>
              <form onSubmit={(e) => {
              e.preventDefault();
              handleLunchSubmit(e); // or handleSubmit
              }}>
               <input
              type="text"
              id="id"
              className="form-control mb-2"
              placeholder="ID"
              value={formData.id}
              onChange={handleChange}/>
             <input type="date" className="form-control mb-2" value={formData.date} readOnly />
             <input  type="time" id="lunchOut" className="form-control mb-2" value={formData.lunchOut}
           onClick={() => {
           const now = new Date();
           const formattedTime = now.toTimeString().slice(0, 5); // "HH:MM"
           setFormData(prev => ({ ...prev, lunchOut: formattedTime }));
           }}/>
          <input type="time" id="lunchIn" className="form-control mb-2"  value={formData.lunchIn}
         onClick={() => {
        const now = new Date();
        const formattedTime = now.toTimeString().slice(0, 5); // "HH:MM"
        setFormData(prev => ({ ...prev, lunchIn: formattedTime }));
        }}
        />
                {timeDifferenceWarning && <div className="alert alert-warning mt-2">{timeDifferenceWarning}</div>}
                <button className="btn btn-primary btn-block"  disabled={!lunchSubmitEnabled}>Submit</button>
              </form>
            </div>
          </div>

          {/* Out Time */}
          <div className="col-md-4 mb-4">
            <div className="card p-3 h-100">
              <h5 className="card-title">Out Time Details</h5>
            <form onSubmit={(e) => {
            e.preventDefault();
           handleSubmit(e);
           }}>
  <input
    type="text"
    id="id"
    className="form-control mb-2"
    placeholder="ID"
    value={formData.id}
    onChange={handleChange}
  />
  <input
    type="date"
    className="form-control mb-2"
    value={formData.date}
    readOnly
  />
  <input  type="time" id="outTime" className="form-control mb-2" value={formData.outTime}
           onClick={() => {
           const now = new Date();
           const formattedTime = now.toTimeString().slice(0, 5); // "HH:MM"
           setFormData(prev => ({ ...prev, outTime: formattedTime }));
           }}/>
  <select
    id="leaveType"
    className="form-control mb-2"
    value={formData.leaveType}
    onChange={handleChange}
  >
    <option disabled value="">Select permission</option>
    <option value="Personal">Personal</option>
    <option value="Health">Health</option>
    <option value="Emergency">Emergency</option>
    <option value="Office">Office Work</option>
    <option value="Tom">Tom</option>
    <option value="Call">Call</option>
    <option value="Food">Food/Curry</option>
    <option value="Casual">Casual</option>
  </select>
  <button type="submit" className="btn btn-primary btn-block">Submit</button>
</form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSystem;
