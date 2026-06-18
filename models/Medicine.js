const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  scientificName: { type: String, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  barcode: { type: String, unique: true, sparse: true },
  price: { type: Number, required: true, min: 0 },
  purchasePrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  minStockLevel: { type: Number, default: 10 },
  expiryDate: { type: Date, required: true },
  supplier: { type: String, trim: true },
  description: { type: String },
  image: { type: String, default: '' },
  status: { type: String, enum: ['available', 'out_of_stock', 'discontinued'], default: 'available' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Auto update status based on quantity
medicineSchema.pre('save', function(next) {
  if (this.quantity === 0) this.status = 'out_of_stock';
  else if (this.quantity > 0) this.status = 'available';
  next();
});

medicineSchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.minStockLevel && this.quantity > 0;
});

medicineSchema.virtual('isExpired').get(function() {
  return new Date(this.expiryDate) < new Date();
});

medicineSchema.virtual('isExpiringSoon').get(function() {
  const thirtyDays = new Date();
  thirtyDays.setDate(thirtyDays.getDate() + 30);
  return new Date(this.expiryDate) <= thirtyDays && new Date(this.expiryDate) >= new Date();
});

medicineSchema.set('toJSON', { virtuals: true });
medicineSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Medicine', medicineSchema);
