const express = require('express');
const router = express.Router();
const { createPayroll, getPayrolls, getEmployeePayrolls, updatePayroll, deletePayroll } = require('../controllers/payrollController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.post('/', auth, role('admin'), createPayroll);
router.get('/', auth, getPayrolls);
router.get('/employee/:employeeId', auth, (req, res, next) => {
  if (req.user.role === 'admin' || req.user.id === req.params.employeeId) {
    return getEmployeePayrolls(req, res, next);
  } else {
    return res.status(403).json({ message: 'Forbidden: You can only view your own payroll' });
  }
});
router.put('/:id', auth, role('admin'), updatePayroll);
router.delete('/:id', auth, role('admin'), deletePayroll);

module.exports = router; 