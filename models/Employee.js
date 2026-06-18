const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String },
  age: { type: Number },
  address: { type: String },
  position: { type: String, required: true },
  salary: { type: Number, required: true },
  startDate: { type: Date, required: true },
  salaryDate: { type: Number, default: 1, min: 1, max: 31 }, // day of month
  shift: { type: String, enum: ['morning', 'evening', 'night', 'flexible'], default: 'morning' },
  workingHours: { type: Number, default: 8 },
  status: { type: String, enum: ['active', 'inactive', 'on_leave'], default: 'active' },
  image: { type: String, default: '' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
