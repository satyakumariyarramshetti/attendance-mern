const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  id: String,
  name: String,
  date: String,
  day: String,
  inTime: String,
  lunchId: String,
  lunchDate: String,
  lunchIn: String,
  lunchOut: String,
  outId: String,
  outDate: String,
  outTime: String,
  casualType: String,
  leaveType: String
});
AttendanceSchema.index({ id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
