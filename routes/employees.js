const express = require('express');
const router = express.Router();
const c = require('../controllers/employeeController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.get('/stats', c.getStats);
router.get('/', c.getEmployees);
router.get('/:id', c.getEmployee);
router.post('/', adminOnly, c.createEmployee);
router.put('/:id', adminOnly, c.updateEmployee);
router.delete('/:id', adminOnly, c.deleteEmployee);

module.exports = router;
