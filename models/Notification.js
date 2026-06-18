const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['low_stock', 'expiry', 'shipment', 'salary', 'invoice', 'system'], default: 'system' },
  severity: { type: String, enum: ['info', 'warning', 'error', 'success'], default: 'info' },
  isRead: { type: Boolean, default: false },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
  relatedModel: { type: String },
  targetRole: { type: String, enum: ['admin', 'employee', 'all'], default: 'all' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
