const express = require('express');
const router = express.Router();
const c = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.get('/', c.getCategories);
router.post('/', adminOnly, c.createCategory);
router.put('/:id', adminOnly, c.updateCategory);
router.delete('/:id', adminOnly, c.deleteCategory);

module.exports = router;
