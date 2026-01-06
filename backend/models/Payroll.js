const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    month: { type: Number, required: true, min: 1, max: 12 }, // Added min/max validation
    year: { type: Number, required: true },
    
    // --- Earnings ---
    basicSalary: { type: Number, required: true },
    hra: { type: Number, default: 0 },
    specialAllowance: { type: Number, default: 0 },
    bonuses: { type: Number, default: 0 },
    grossSalary: { type: Number, required: true }, // New calculated field
    
    // --- Statutory Deductions ---
    pf: { type: Number, default: 0 },
    esi: { type: Number, default: 0 },
    professionalTax: { type: Number, default: 0 },
    incomeTax: { type: Number, default: 0 },
    
    // --- Other Deductions ---
    deductions: [{ 
        amount: { type: Number, required: true }, 
        reason: { type: String, required: true } 
    }],
    totalDeductions: { type: Number, required: true }, // New calculated field

    // --- Final Pay ---
    netSalary: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Payroll', payrollSchema);