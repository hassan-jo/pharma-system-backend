const express = require('express');
const router = express.Router();
const c = require('../controllers/medicineController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.get('/', c.getMedicines);
router.get('/low-stock', c.getLowStock);
router.get('/expiring', c.getExpiring);
router.get('/:id', c.getMedicine);
router.post('/', adminOnly, c.createMedicine);
router.put('/:id', adminOnly, c.updateMedicine);
router.delete('/:id', adminOnly, c.deleteMedicine);

module.exports = router;
