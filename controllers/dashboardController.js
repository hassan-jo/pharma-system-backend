const Medicine = require('../models/Medicine');
const Invoice = require('../models/Invoice');
const Employee = require('../models/Employee');
const Shipment = require('../models/Shipment');

exports.getStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0,0,0,0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDays = new Date(); thirtyDays.setDate(thirtyDays.getDate() + 30);

    const [
      totalMedicines,
      lowStockMeds,
      expiringSoon,
      todayInvoices,
      monthlyRevenue,
      totalEmployees,
      activeEmployees,
      upcomingShipments,
      recentInvoices
    ] = await Promise.all([
      Medicine.countDocuments({ isActive: true }),
      Medicine.find({ isActive: true }),
      Medicine.countDocuments({ isActive: true, expiryDate: { $lte: thirtyDays } }),
      Invoice.aggregate([
        { $match: { createdAt: { $gte: startOfDay }, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ]),
      Invoice.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Employee.countDocuments(),
      Employee.countDocuments({ status: 'active' }),
      Shipment.countDocuments({ status: { $in: ['pending', 'shipped'] } }),
      Invoice.find({ status: 'paid' }).sort('-createdAt').limit(5).populate('createdBy', 'name')
    ]);

    const allMeds = await Medicine.find({ isActive: true });
    const lowStock = allMeds.filter(m => m.quantity <= m.minStockLevel).length;

    // Monthly revenue for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyChart = await Invoice.aggregate([
      { $match: { status: 'paid', createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Top selling medicines
    const topSelling = await Invoice.aggregate([
      { $match: { status: 'paid' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.medicineName', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: '$items.total' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        totalMedicines,
        lowStockMedicines: lowStock,
        expiringSoon,
        dailySales: { total: todayInvoices[0]?.total || 0, count: todayInvoices[0]?.count || 0 },
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        totalEmployees,
        activeEmployees,
        upcomingShipments,
        recentInvoices,
        monthlyChart,
        topSelling,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
