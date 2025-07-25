const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

router.post('/save', async (req, res) => {
  const {
    id, date, inTime, lunchOut, lunchIn, outTime,
    name, day, casualType, leaveType
  } = req.body;

  console.log("🔍 Incoming Attendance Data:", req.body);

  if (!id || !date) {
    return res.status(400).json({ error: 'ID and Date are required' });
  }

  try {
    let attendance = await Attendance.findOne({ id, date });

    if (attendance) {
      let updated = false;
      let message = '';

      // Safely update lunchOut only if it was not set before
      if (lunchOut && !attendance.lunchOut) {
        attendance.lunchOut = lunchOut;
        message = 'Lunch Out submitted';
        updated = true;
      }

      // Safely update lunchIn only if lunchOut exists and lunchIn is not set
      if (lunchIn && attendance.lunchOut && !attendance.lunchIn) {
        attendance.lunchIn = lunchIn;
        message = 'Lunch In submitted';
        updated = true;
      }

      // Optional: allow updating day/name/other non-time fields
      attendance.day = day || attendance.day;
      attendance.name = name || attendance.name;
      attendance.casualType = casualType || attendance.casualType;
      attendance.leaveType = leaveType || attendance.leaveType;

      // If this is a fresh In Time submission
      if (inTime && !attendance.inTime) {
        attendance.inTime = inTime;
        message = 'In Time submitted';
        updated = true;
      }

      // Update Out Time only if not already set
      if (outTime && !attendance.outTime) {
        attendance.outTime = outTime;
        message = 'Out Time submitted';
        updated = true;
      }

      if (updated) {
        await attendance.save();
        console.log('✅ Attendance updated:', attendance);
        res.json({ message });
      } else {
        res.status(409).json({ error: 'Already submitted' });
      }

    } else {
      // No existing doc, create a new one
      const newAttendance = new Attendance({
        id, name, date, day, inTime, lunchOut, lunchIn, outTime, casualType, leaveType
      });

      await newAttendance.save();
      console.log('✅ New attendance created:', newAttendance);
      res.json({ message: 'Attendance created successfully' });
    }

  } catch (err) {
    console.error("❌ Error saving attendance:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
