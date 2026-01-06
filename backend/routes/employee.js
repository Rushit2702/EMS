const express = require('express');
const router = express.Router();
const { createEmployee, getEmployees, getEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { body } = require('express-validator');

// POST /api/employees  -> create a new employee (admin only)
router.post(
  '/',
  auth,
  role('admin'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('position').notEmpty().withMessage('Position is required'),
    body('department').notEmpty().withMessage('Department is required'),
    body('salary').isNumeric().withMessage('Salary must be a number')
  ],
  createEmployee
);

// GET /api/employees  -> list employees (admin only)
router.get('/', auth, role('admin'), getEmployees);

router.get('/:id', auth, (req, res, next) => {
  if (req.user.role === 'admin' || req.user.id === req.params.id) {
    return getEmployee(req, res, next);
  } else {
    return res.status(403).json({ message: 'Forbidden: You can only view your own profile' });
  }
});

router.put(
  '/:id',
  auth,
  role('admin'),
  [
    body('name').optional().notEmpty().withMessage('Name is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('position').optional().notEmpty().withMessage('Position is required'),
    body('department').optional().notEmpty().withMessage('Department is required'),
    body('salary').optional().isNumeric().withMessage('Salary must be a number')
  ],
  updateEmployee
);

router.delete('/:id', auth, role('admin'), deleteEmployee);

module.exports = router; 