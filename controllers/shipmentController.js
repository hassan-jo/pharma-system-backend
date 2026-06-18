const Shipment = require('../models/Shipment');

exports.getShipments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.$or = [
      { supplier: { $regex: search, $options: 'i' } },
      { shipmentNumber: { $regex: search, $options: 'i' } }
    ];
    const total = await Shipment.countDocuments(query);
    const shipments = await Shipment.find(query).sort('-createdAt').skip((page - 1) * limit).limit(parseInt(limit));
    res.json({ success: true, data: shipments, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getShipment = async (req, res) => {
  try {
    const s = await Shipment.findById(req.params.id);
    if (!s) return res.status(404).json({ success: false, message: 'Shipment not found' });
    res.json({ success: true, data: s });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createShipment = async (req, res) => {
  try {
    const s = await Shipment.create(req.body);
    res.status(201).json({ success: true, data: s });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateShipment = async (req, res) => {
  try {
    const s = await Shipment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!s) return res.status(404).json({ success: false, message: 'Shipment not found' });
    res.json({ success: true, data: s });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteShipment = async (req, res) => {
  try {
    await Shipment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Shipment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUpcoming = async (req, res) => {
  try {
    const upcoming = await Shipment.find({
      status: { $in: ['pending', 'shipped'] },
      expectedArrival: { $gte: new Date() }
    }).sort('expectedArrival').limit(5);
    res.json({ success: true, data: upcoming });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
