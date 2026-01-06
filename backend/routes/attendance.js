const express = require('express');
const router = express.Router();
const { markAttendance, getAttendance, getEmployeeAttendance, updateAttendance, deleteAttendance } = require('../controllers/attendanceController');
const auth = require('../middleware/auth');

router.post('/', auth, (req, res, next) => {
  if (req.user.role === 'admin' || req.user.id === req.body.employee) {
    return markAttendance(req, res, next);
  } else {
    return res.status(403).json({ message: 'Forbidden: You can only mark your own attendance' });
  }
});

router.get('/', auth, getAttendance);
router.get('/employee/:employeeId', auth, (req, res, next) => {
  if (req.user.role === 'admin' || req.user.id === req.params.employeeId) {
    return getEmployeeAttendance(req, res, next);
  } else {
    return res.status(403).json({ message: 'Forbidden: You can only view your own attendance' });
  }
});
router.put('/:id', auth, updateAttendance);
router.delete('/:id', auth, deleteAttendance);

module.exports = router; 