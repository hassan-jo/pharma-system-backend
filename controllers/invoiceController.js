const Invoice = require('../models/Invoice');
const Medicine = require('../models/Medicine');

exports.getInvoices = async (req, res) => {
  try {
    const { search, startDate, endDate, page = 1, limit = 20, status } = req.query;
    const query = {};
    if (search) query.$or = [
      { invoiceNumber: { $regex: search, $options: 'i' } },
      { customer: { $regex: search, $options: 'i' } }
    ];
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .populate('createdBy', 'name email')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, data: invoices, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('createdBy', 'name email');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const { items, customer, customerPhone, discount, tax, paymentMethod, notes } = req.body;

    // Validate and build items
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const medicine = await Medicine.findById(item.medicine);
      if (!medicine) return res.status(400).json({ success: false, message: `Medicine not found: ${item.medicine}` });
      if (medicine.quantity < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${medicine.name}` });
      }
      const itemTotal = medicine.price * item.quantity;
      subtotal += itemTotal;
      processedItems.push({
        medicine: medicine._id,
        medicineName: medicine.name,
        quantity: item.quantity,
        unitPrice: medicine.price,
        total: itemTotal,
      });

      // Deduct stock
      medicine.quantity -= item.quantity;
      await medicine.save();
    }

    const discountAmt = (subtotal * (discount || 0)) / 100;
    const taxAmt = ((subtotal - discountAmt) * (tax || 0)) / 100;
    const total = subtotal - discountAmt + taxAmt;

    const invoice = await Invoice.create({
      customer: customer || 'Walk-in Customer',
      customerPhone,
      items: processedItems,
      subtotal,
      discount: discount || 0,
      tax: tax || 0,
      total,
      paymentMethod: paymentMethod || 'cash',
      createdBy: req.user._id,
      notes,
    });

    res.status(201).json({ success: true, data: invoice });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getMonthlyAnalytics = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const monthly = await Invoice.aggregate([
      {
        $match: {
          status: 'paid',
          createdAt: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$total' },
          count: { $sum: 1 },
          avgOrder: { $avg: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const months = Array.from({ length: 12 }, (_, i) => {
      const found = monthly.find(m => m._id === i + 1);
      return { month: i + 1, revenue: found?.revenue || 0, count: found?.count || 0, avgOrder: found?.avgOrder || 0 };
    });

    res.json({ success: true, data: months });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDailySales = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const invoices = await Invoice.find({
      createdAt: { $gte: today, $lt: tomorrow },
      status: 'paid'
    }).populate('createdBy', 'name');

    const total = invoices.reduce((sum, inv) => sum + inv.total, 0);
    res.json({ success: true, data: invoices, total, count: invoices.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
