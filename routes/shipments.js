const express = require('express');
const router = express.Router();
const c = require('../controllers/shipmentController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.get('/upcoming', c.getUpcoming);
router.get('/', c.getShipments);
router.get('/:id', c.getShipment);
router.post('/', adminOnly, c.createShipment);
router.put('/:id', adminOnly, c.updateShipment);
router.delete('/:id', adminOnly, c.deleteShipment);

module.exports = router;
