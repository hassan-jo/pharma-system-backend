const Medicine = require('../models/Medicine');

exports.getMedicines = async (req, res) => {
  try {
    const { search, category, status, sort, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { scientificName: { $regex: search, $options: 'i' } },
      { barcode: { $regex: search, $options: 'i' } }
    ];
    if (category) query.category = category;
    if (status) query.status = status;

    const sortMap = { name: 'name', quantity: '-quantity', expiry: 'expiryDate', price: '-price' };
    const sortField = sortMap[sort] || '-createdAt';

    const total = await Medicine.countDocuments(query);
    const medicines = await Medicine.find(query)
      .populate('category', 'name color')
      .sort(sortField)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, data: medicines, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMedicine = async (req, res) => {
  try {
    const med = await Medicine.findById(req.params.id).populate('category', 'name color');
    if (!med) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, data: med });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createMedicine = async (req, res) => {
  try {
    const med = await Medicine.create(req.body);
    const populated = await med.populate('category', 'name color');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateMedicine = async (req, res) => {
  try {
    const med = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('category', 'name color');
    if (!med) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, data: med });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteMedicine = async (req, res) => {
  try {
    const med = await Medicine.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!med) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, message: 'Medicine deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getLowStock = async (req, res) => {
  try {
    const medicines = await Medicine.find({ isActive: true }).populate('category', 'name');
    const lowStock = medicines.filter(m => m.quantity <= m.minStockLevel);
    res.json({ success: true, data: lowStock });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getExpiring = async (req, res) => {
  try {
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    const medicines = await Medicine.find({
      isActive: true,
      expiryDate: { $lte: thirtyDays }
    }).populate('category', 'name');
    res.json({ success: true, data: medicines });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
