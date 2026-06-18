const express = require('express');
const router = express.Router();
const c = require('../controllers/invoiceController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.get('/', c.getInvoices);
router.get('/daily', c.getDailySales);
router.get('/analytics/monthly', c.getMonthlyAnalytics);
router.get('/:id', c.getInvoice);
router.post('/', c.createInvoice);
router.delete('/:id', adminOnly, c.deleteInvoice);

module.exports = router;
