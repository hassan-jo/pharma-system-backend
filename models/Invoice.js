const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  medicineName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true },
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true, required: true },
  customer: { type: String, default: 'Walk-in Customer' },
  customerPhone: { type: String },
  items: [invoiceItemSchema],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'card', 'insurance', 'transfer'], default: 'cash' },
  status: { type: String, enum: ['paid', 'pending', 'cancelled'], default: 'paid' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
  isArchived: { type: Boolean, default: false },
  archivedAt: { type: Date },
}, { timestamps: true });

// Auto generate invoice number
invoiceSchema.pre('validate', async function(next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
