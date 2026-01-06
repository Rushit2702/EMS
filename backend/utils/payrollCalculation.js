// backend/utils/payrollCalculations.js

// --- (Add constants and other utility functions here) ---

// Placeholder for the complex TDS calculation logic
function calculateAnnualTDS(basicSalary, annualGrossSalary) {
    // NOTE: This logic is heavily simplified for demonstration.
    // In production, this must implement the full tax slab system (New/Old Regime).

    const STANDARD_DEDUCTION = 75000;
    let annualTaxableIncome = annualGrossSalary - STANDARD_DEDUCTION;
    let tax = 0;

    // Example calculation for income over 15L (New Regime)
    if (annualTaxableIncome > 1500000) {
        tax += (annualTaxableIncome - 1500000) * 0.30;
        annualTaxableIncome = 1500000; 
    }
    // ... continue with other tax slabs ...

    if (annualTaxableIncome > 700000) {
        // Since we are just setting up, return a predictable placeholder tax amount
        // for high income, or a zero for low income, until the full logic is implemented.
        tax = 140000; // Example: Assuming 140000 annual tax for 15L gross income
    }
    
    // Add 4% Cess
    tax = tax * 1.04;
    
    return Math.round(tax);
}


function calculateStatutory(basicSalary, grossMonthlySalary, employeeState) {
    // 1. PF (12% of Basic)
    const pf = Math.round(0.12 * basicSalary);

    // 2. ESI (0.75% of Gross, only if Gross <= 21000)
    const ESI_LIMIT = 21000;
    let esi = 0;
    if (grossMonthlySalary <= ESI_LIMIT) {
        esi = Math.round(0.0075 * grossMonthlySalary);
    }

    // 3. Professional Tax (PT)
    let professionalTax = 0;
    const PT_STATES = ['KA', 'MH', 'TS'];
    if (PT_STATES.includes(employeeState)) {
        professionalTax = 208.33;
    }
    
    // 4. TDS Calculation
    const annualTDS = calculateAnnualTDS(basicSalary, grossMonthlySalary * 12); 
    const monthlyTDS = Math.round(annualTDS / 12);
    
    return { pf, esi, professionalTax, monthlyTDS };
}

module.exports = { 
    calculateAnnualTDS,
    calculateStatutory // Export the main helper function
};