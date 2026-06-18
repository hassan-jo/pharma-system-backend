const mongoose = require('mongoose');

const shipmentItemSchema = new mongoose.Schema({
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
  medicineName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitCost: { type: Number, required: true },
  total: { type: Number, required: true },
});

const shipmentSchema = new mongoose.Schema({
  shipmentNumber: { type: String, unique: true },
  supplier: { type: String, required: true },
  supplierContact: { type: String },
  orderDate: { type: Date, required: true, default: Date.now },
  expectedArrival: { type: Date, required: true },
  actualArrival: { type: Date },
  status: {
    type: String,
    enum: ['pending', 'shipped', 'delivered', 'delayed', 'cancelled'],
    default: 'pending'
  },
  items: [shipmentItemSchema],
  totalCost: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['paid', 'unpaid', 'partial'], default: 'unpaid' },
  notes: { type: String },
}, { timestamps: true });

shipmentSchema.pre('validate', async function(next) {
  if (!this.shipmentNumber) {
    const count = await mongoose.model('Shipment').countDocuments();
    this.shipmentNumber = `SHP-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Shipment', shipmentSchema);
