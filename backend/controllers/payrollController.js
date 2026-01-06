const Payroll = require('../models/Payroll');
const {calculateStatutory, calculateAnnualTDS} = require('../utils/payrollCalculation');
const role = require('../middleware/role');
const { body, validationResult } = require('express-validator');
const errorHandler = require('../middleware/errorHandler');

exports.createPayroll = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.id !== req.body.employee) {
            return res.status(403).json({ message: 'Forbidden: You can only create payroll for yourself' });
        }
        const { employee, month, year, basicSalary, bonuses = 0, specialAllowance = 0, deductions = [] } = req.body;
        
        // --- Input Preparation (Fetch actual HRA/State/Tax Regime from Employee Model) ---
        // Assuming your employee model includes this data
        const employeeData = { 
            fixedHRA: 0.4 * basicSalary, 
            state: 'KA' // Placeholder
        }; 

        // 1. Calculate Gross Salary 
        const grossMonthlySalary = Number(basicSalary) + Number(employeeData.fixedHRA) + Number(specialAllowance) + Number(bonuses);

        // 2. Calculate Statutory Deductions using the imported function
        const { pf, esi, professionalTax, monthlyTDS } = calculateStatutory(
            Number(basicSalary), 
            grossMonthlySalary, 
            employeeData.state
        );
        
        // ... rest of your calculation and saving logic ...
        
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getPayrolls = async (req, res) => {
    try {
        let payrolls;
        if (req.user.role === 'admin') {
            payrolls = await Payroll.find().populate('employee');
        } else {
            // Find payrolls for the employee linked to this user
            payrolls = await Payroll.find().populate({
                path: 'employee',
                match: { user: req.user.id }
            });
            payrolls = payrolls.filter(p => p.employee);
        }
        res.json(payrolls);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getEmployeePayrolls = async (req, res) => {
    try {
        const { employeeId } = req.params;
        if (req.user.role !== 'admin' && req.user.id !== employeeId) {
            return res.status(403).json({ message: 'Forbidden: You can only view your own payroll' });
        }
        const payrolls = await Payroll.find({ employee: employeeId });
        res.json(payrolls);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updatePayroll = async (req, res) => {
    try {
        const { employee, month, year, basicSalary, bonuses = 0, specialAllowance = 0, deductions = [] } = req.body;

        // NOTE: employeeState and employeeFixedHRA should be fetched from your Employee Model
        const employeeFixedHRA = 0.4 * basicSalary; // Placeholder for actual fixed HRA
        const employeeState = 'KA'; // Placeholder for employee's state

        // 1. Calculate Gross Salary (Actual components paid)
        const grossMonthlySalary = Number(basicSalary) + Number(employeeFixedHRA) + Number(specialAllowance) + Number(bonuses);

        // 2. Calculate Statutory Deductions
        const { pf, esi, professionalTax, monthlyTDS } = calculateStatutory(
            Number(basicSalary), 
            grossMonthlySalary, 
            employeeState
        );

        // 3. Calculate Other Deductions (user input)
        const totalOtherDeductions = Array.isArray(deductions) 
            ? deductions.reduce((sum, d) => sum + Number(d.amount || 0), 0) 
            : 0;

        // 4. Calculate Total Deductions
        const totalDeductions = pf + esi + professionalTax + monthlyTDS + totalOtherDeductions;

        // 5. Calculate Net Salary
        // Net Salary = Gross Salary - Total Deductions
        const netSalary = grossMonthlySalary - totalDeductions;

        const payroll = new Payroll({
            employee, month, year, basicSalary, bonuses, deductions,
            // Saving calculated values for record-keeping
            hra: employeeFixedHRA, 
            specialAllowance, 
            pf, 
            esi, 
            professionalTax, 
            incomeTax: monthlyTDS, // Use the calculated TDS
            netSalary
        });

        await payroll.save();
        res.status(201).json(payroll);
    } catch (err) {
        // ... Error handling ...
        res.status(500).json({ message: err.message });
    }
};

// backend/controllers/payrollController.js
exports.deletePayroll = async (req, res) => {
    try {
      const payroll = await Payroll.findByIdAndDelete(req.params.id);
      if (!payroll) return res.status(404).json({ message: 'Payroll not found' });
      res.json({ message: 'Payroll deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

exports.createEmployee = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    // ...rest of your code...
}; 