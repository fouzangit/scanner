import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from '../utils/payrollUtils';

const PayrollCard = ({ payroll }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Generate individual elegant PDF Pay Slip
  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Color Palette
    const primaryColor = [15, 23, 42]; // Slate 900
    const secondaryColor = [79, 70, 229]; // Indigo 600
    const accentColor = [220, 38, 38]; // Red 600

    // Header styling
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('CLINICPULSE DENTAL CLINIC', 20, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Smart Attendance & Automated Payroll System', 20, 28);

    // Document Metadata
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('PAY SLIP', 150, 55);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 150, 62);
    doc.text(`Period: ${payroll.payroll_start_date} to ${payroll.payroll_end_date}`, 20, 55);

    // Divider Line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, 68, 190, 68);

    // Employee Details Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text('EMPLOYEE DETAILS', 20, 78);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Name: ${payroll.employee_name}`, 20, 86);
    doc.text(`Role: ${payroll.role.toUpperCase()}`, 20, 93);
    doc.text(`Shift: ${payroll.shift_type.toUpperCase()}`, 20, 100);

    // Calculation Summary Table
    const tableData = [
      ['Description', 'Value / Calculation', 'Amount'],
      ['Proportional Base Pay', `Based on range of days`, formatCurrency(payroll.finalSalary + payroll.totalDeductions)],
      ['Late / Early Deductions', `${payroll.totalLateMinutes} minutes accumulated penalty`, `-${formatCurrency(payroll.totalDeductions)}`],
      ['Working Days', `${payroll.totalWorkingDays} active present shifts`, '---']
    ];

    doc.autoTable({
      startY: 110,
      head: [tableData[0]],
      body: tableData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: primaryColor },
      styles: { fontSize: 10, cellPadding: 5 }
    });

    const finalY = doc.lastAutoTable.finalY + 15;

    // Total Net Salary Highlight Block
    doc.setFillColor(243, 244, 246);
    doc.rect(20, finalY, 170, 20, 'F');
    doc.setDrawColor(...secondaryColor);
    doc.setLineWidth(1);
    doc.rect(20, finalY, 170, 20, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('NET SALARY PAYOUT:', 30, finalY + 12);
    
    doc.setFontSize(16);
    doc.setTextColor(...secondaryColor);
    doc.text(formatCurrency(payroll.finalSalary), 130, finalY + 13);

    // Footer Signature
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('Authorized Signature', 150, finalY + 45);
    doc.line(140, finalY + 40, 185, finalY + 40);

    doc.save(`Payslip_${payroll.employee_name}_${payroll.payroll_start_date}.pdf`);
  };

  return (
    <>
      <div className="glass-card p-6 border-l-4 border-brand-500 hover:translate-x-1 transition-all">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h4 className="text-lg font-bold text-white">{payroll.employee_name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="badge bg-brand-500/10 text-brand-400 border border-brand-500/20">
                {payroll.role}
              </span>
              <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                • {payroll.shift_type} Shift
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Final Salary</p>
            <p className="text-2xl font-black text-white">{formatCurrency(payroll.finalSalary)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Working Days</p>
            <p className="text-lg font-bold">{payroll.totalWorkingDays}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Late Mins</p>
            <p className="text-lg font-bold text-amber-500">{payroll.totalLateMinutes}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Deductions</p>
            <p className="text-lg font-bold text-red-500">-{formatCurrency(payroll.totalDeductions)}</p>
          </div>
        </div>
        
        <div className="mt-6 flex gap-3">
          <button 
            onClick={() => setShowDetails(true)}
            className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold transition-all border border-white/5"
          >
            VIEW DETAILS
          </button>
          <button 
            onClick={generatePDF}
            className="flex-1 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-xs font-bold transition-all text-white shadow-glow shadow-brand-500/20"
          >
            DOWNLOAD PDF
          </button>
        </div>
      </div>

      {/* Details View Modal */}
      <AnimatePresence>
        {showDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetails(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative glass-card p-6 md:p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto border-white/10"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-white">{payroll.employee_name}</h3>
                  <p className="text-slate-500 text-xs uppercase tracking-widest font-black mt-1">
                    Shift Logs: {payroll.payroll_start_date} to {payroll.payroll_end_date}
                  </p>
                </div>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-xl text-slate-400 hover:text-white transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Stats row inside modal */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 mb-6 text-center">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black">Days Worked</p>
                  <p className="text-base md:text-lg font-bold text-white">{payroll.totalWorkingDays}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black">Late Minutes</p>
                  <p className="text-base md:text-lg font-bold text-amber-500">{payroll.totalLateMinutes}m</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black">Deductions</p>
                  <p className="text-base md:text-lg font-bold text-red-500">-{formatCurrency(payroll.totalDeductions)}</p>
                </div>
              </div>

              <h4 className="text-xs uppercase font-black tracking-widest text-slate-500 mb-3">Daily Attendance Breakdowns</h4>

              {(!payroll.records || payroll.records.length === 0) ? (
                <div className="py-12 text-center text-slate-500 opacity-60">
                  <span className="text-4xl mb-3 block">📂</span>
                  <p className="font-bold">No shifts recorded in this range</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6 md:mx-0">
                  <table className="w-full text-left border-collapse min-w-[500px] md:min-w-0">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-500 text-[10px] uppercase font-black tracking-wider">
                        <th className="py-3 px-4 md:px-6">Date</th>
                        <th className="py-3 px-4 md:px-6">Check In</th>
                        <th className="py-3 px-4 md:px-6">Check Out</th>
                        <th className="py-3 px-4 md:px-6 text-right">Lateness</th>
                        <th className="py-3 px-4 md:px-6 text-right">Deduction</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {payroll.records.map((rec, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-all">
                          <td className="py-3.5 px-4 md:px-6 font-bold text-white">{rec.date}</td>
                          <td className="py-3.5 px-4 md:px-6 text-slate-400">
                            {rec.check_in_time ? new Date(rec.check_in_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '---'}
                          </td>
                          <td className="py-3.5 px-4 md:px-6 text-slate-400">
                            {rec.check_out_time ? new Date(rec.check_out_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '---'}
                          </td>
                          <td className="py-3.5 px-4 md:px-6 text-right font-bold text-amber-500">
                            {rec.late_minutes > 0 ? `${rec.late_minutes}m` : '---'}
                          </td>
                          <td className="py-3.5 px-4 md:px-6 text-right font-bold text-red-500">
                            {rec.deduction_amount > 0 ? `-${formatCurrency(rec.deduction_amount)}` : '---'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PayrollCard;
