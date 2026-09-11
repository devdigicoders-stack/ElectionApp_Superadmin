import React, { useState, useEffect, useRef } from 'react';
import {
  Receipt, Plus, Eye, RefreshCw, ArrowUpCircle,
  Clock, PauseCircle, PlayCircle, XCircle, AlertCircle,
  IndianRupee, Activity, TrendingUp, X, Loader2, FileText, Printer
} from 'lucide-react';
import subscriptionsService from '../services/subscriptions.service';
import plansService from '../services/plans.service';
import tenantsService from '../services/tenants.service';
import apiClient from '../services/apiClient';

const PAYMENT_METHODS = ['bank_transfer', 'upi', 'card', 'net_banking', 'manual_cash', 'cheque', 'free_trial', 'other'];

function StatusBadge({ status }) {
  const map = {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    trialing: 'bg-blue-100 text-blue-700 border-blue-200',
    expired: 'bg-gray-100 text-gray-600 border-gray-200',
    canceled: 'bg-red-100 text-red-700 border-red-200',
    paused: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    past_due: 'bg-orange-100 text-orange-700 border-orange-200',
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${map[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {status?.toUpperCase()}
    </span>
  );
}

function fmt(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN');
}

/** Convert number to Indian-English words */
function numberToWords(num) {
  if (!num || isNaN(num)) return 'Zero';
  const a = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const b = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  function words(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n/10)] + (n%10 ? ' ' + a[n%10] : '');
    if (n < 1000) return a[Math.floor(n/100)] + ' Hundred' + (n%100 ? ' ' + words(n%100) : '');
    if (n < 100000) return words(Math.floor(n/1000)) + ' Thousand' + (n%1000 ? ' ' + words(n%1000) : '');
    if (n < 10000000) return words(Math.floor(n/100000)) + ' Lakh' + (n%100000 ? ' ' + words(n%100000) : '');
    return words(Math.floor(n/10000000)) + ' Crore' + (n%10000000 ? ' ' + words(n%10000000) : '');
  }
  const [rupees, paise] = num.toFixed(2).split('.');
  let result = words(parseInt(rupees)) + ' Rupees';
  if (parseInt(paise) > 0) result += ' and ' + words(parseInt(paise)) + ' Paise';
  return result + ' Only';
}

/** Full GST Tax Invoice Modal */
function GstInvoiceModal({ sub, onClose }) {
  const printRef = useRef();
  if (!sub) return null;

  const s = sub;
  const isInterState = s.isInterState || false;
  const taxRate = s.taxRate ?? 18;
  const amountPaid = s.amountPaid || 0;

  // Compute from stored fields or recalculate fallback
  const taxableAmount = s.taxableAmount || Math.round((amountPaid / (1 + taxRate / 100)) * 100) / 100;
  const totalTax = Math.round((amountPaid - taxableAmount) * 100) / 100;
  const cgst = isInterState ? 0 : (s.cgst ?? Math.round((totalTax / 2) * 100) / 100);
  const sgst = isInterState ? 0 : (s.sgst ?? Math.round((totalTax / 2) * 100) / 100);
  const igst = isInterState ? (s.igst ?? totalTax) : 0;
  const totalAmount = s.totalAmount || amountPaid;

  const invoiceDate = s.createdAt ? new Date(s.createdAt) : new Date();
  const sacCode = s.sacCode || '998313';
  const planName = s.planId?.name || 'Subscription Plan';
  const tenantName = s.tenantId?.name || 'Client';
  const tenantSlug = s.tenantId?.slug || '';
  const clientGstin = s.clientGstin || 'Unregistered';
  const clientState = s.clientState || '—';
  const clientAddress = s.clientAddress || '—';
  const invoiceType = s.invoiceType || 'tax_invoice';

  const invoiceTypeLabel = {
    tax_invoice: 'TAX INVOICE',
    proforma: 'PROFORMA INVOICE',
    credit_note: 'CREDIT NOTE',
  }[invoiceType] || 'TAX INVOICE';

  function handlePrint() {
    const w = window.open('', '_blank', 'width=900,height=700');
    w.document.write(`<!DOCTYPE html><html><head>
      <title>${s.invoiceNumber} - Tax Invoice</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Inter',sans-serif; font-size:13px; color:#111; background:#fff; }
        .page { width:210mm; min-height:297mm; margin:0 auto; padding:16mm 14mm; }
        .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #4f46e5; padding-bottom:12px; margin-bottom:16px; }
        .brand { font-size:22px; font-weight:800; color:#4f46e5; letter-spacing:-0.5px; }
        .brand-sub { font-size:11px; color:#6b7280; margin-top:2px; }
        .invoice-title { text-align:right; }
        .invoice-title h2 { font-size:18px; font-weight:800; color:#111; }
        .invoice-title .inv-num { font-size:13px; color:#6b7280; margin-top:4px; }
        .invoice-title .inv-date { font-size:12px; color:#6b7280; }
        .parties { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:20px; }
        .party-box { background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:12px 14px; }
        .party-label { font-size:10px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px; }
        .party-name { font-size:15px; font-weight:700; color:#111; margin-bottom:3px; }
        .party-detail { font-size:11px; color:#6b7280; line-height:1.6; }
        .party-gstin { font-size:11px; font-weight:600; color:#374151; margin-top:4px; }
        table { width:100%; border-collapse:collapse; margin-bottom:0; }
        thead tr { background:#4f46e5; color:#fff; }
        thead th { padding:9px 10px; text-align:left; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.3px; }
        tbody tr { border-bottom:1px solid #f3f4f6; }
        tbody td { padding:10px 10px; font-size:12px; color:#374151; }
        .tax-table { margin-top:16px; }
        .tax-table td { padding:7px 10px; }
        .total-row td { background:#f0f9ff; font-weight:700; font-size:13px; }
        .grand-total-row td { background:#4f46e5; color:#fff; font-weight:800; font-size:14px; }
        .words-box { margin-top:12px; background:#fefce8; border:1px solid #fde68a; border-radius:6px; padding:10px 14px; font-size:12px; color:#78350f; }
        .footer { margin-top:auto; padding-top:20px; border-top:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:flex-end; }
        .seal { text-align:right; }
        .seal-line { margin-top:48px; border-top:1px solid #374151; padding-top:4px; font-size:11px; color:#374151; }
        .badge { display:inline-block; background:#dcfce7; color:#166534; border:1px solid #bbf7d0; border-radius:4px; font-size:10px; font-weight:700; padding:2px 8px; margin-bottom:8px; }
        .sac-note { font-size:10px; color:#9ca3af; margin-top:8px; }
        @media print { .page { padding:10mm; } }
      </style>
    </head><body><div class="page">
      <div class="header">
        <div>
          <div class="brand">🗳️ Madiyayu Platform</div>
          <div class="brand-sub">Political Engagement SaaS</div>
          <div class="brand-sub" style="margin-top:6px">GSTIN: 27AABCU9603R1ZX</div>
          <div class="brand-sub">SAC Code: ${sacCode} | HSN: IT Software Services</div>
          <div class="brand-sub">State: Maharashtra (27) | support@madiyayu.com</div>
        </div>
        <div class="invoice-title">
          <div class="badge">${invoiceTypeLabel}</div>
          <div class="inv-num">${s.invoiceNumber}</div>
          <div class="inv-date">Date: ${invoiceDate.toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })}</div>
          <div class="inv-date" style="margin-top:4px">Period: ${fmt(s.startDate)} — ${fmt(s.endDate)}</div>
        </div>
      </div>

      <div class="parties">
        <div class="party-box">
          <div class="party-label">Bill From (Supplier)</div>
          <div class="party-name">Madiyayu Technologies Pvt. Ltd.</div>
          <div class="party-detail">123, Business Hub, BKC, Mumbai — 400051<br/>Maharashtra, India</div>
          <div class="party-gstin">GSTIN: 27AABCU9603R1ZX</div>
        </div>
        <div class="party-box">
          <div class="party-label">Bill To (Recipient)</div>
          <div class="party-name">${tenantName}</div>
          <div class="party-detail">${clientAddress.replace(/\n/g,'<br/>')}<br/>State: ${clientState}</div>
          <div class="party-gstin">GSTIN: ${clientGstin}</div>
          <div class="party-detail" style="margin-top:4px">Client ID: ${tenantSlug}</div>
        </div>
      </div>

      <table>
        <thead><tr>
          <th style="width:40px">#</th>
          <th>Description of Service</th>
          <th>SAC</th>
          <th>Billing Cycle</th>
          <th style="text-align:right">Taxable Amt (₹)</th>
        </tr></thead>
        <tbody><tr>
          <td>1</td>
          <td><strong>${planName}</strong><br/><span style="font-size:11px;color:#6b7280">SaaS Subscription — Political Engagement Platform</span></td>
          <td>${sacCode}</td>
          <td>${s.billingCycle}</td>
          <td style="text-align:right"><strong>${taxableAmount.toLocaleString('en-IN', { minimumFractionDigits:2 })}</strong></td>
        </tr></tbody>
      </table>

      <table class="tax-table">
        <tbody>
          <tr><td style="color:#6b7280">Taxable Amount</td><td></td><td style="text-align:right">₹${taxableAmount.toLocaleString('en-IN',{minimumFractionDigits:2})}</td></tr>
          ${isInterState
            ? `<tr><td>IGST @ ${taxRate}%</td><td style="color:#6b7280">(Inter-State Supply)</td><td style="text-align:right">₹${igst.toLocaleString('en-IN',{minimumFractionDigits:2})}</td></tr>`
            : `<tr><td>CGST @ ${taxRate/2}%</td><td style="color:#6b7280">(Intra-State Supply)</td><td style="text-align:right">₹${cgst.toLocaleString('en-IN',{minimumFractionDigits:2})}</td></tr>
               <tr><td>SGST @ ${taxRate/2}%</td><td style="color:#6b7280">(Intra-State Supply)</td><td style="text-align:right">₹${sgst.toLocaleString('en-IN',{minimumFractionDigits:2})}</td></tr>`
          }
          <tr class="grand-total-row"><td colspan="2"><strong>GRAND TOTAL (INR)</strong></td><td style="text-align:right"><strong>₹${totalAmount.toLocaleString('en-IN',{minimumFractionDigits:2})}</strong></td></tr>
        </tbody>
      </table>

      <div class="words-box">
        <strong>Amount in Words:</strong> ${numberToWords(totalAmount)}
      </div>

      <div class="sac-note">SAC ${sacCode}: Software-related services including development, implementation, customisation, upgrade, and maintenance of IT Software.</div>

      <div class="footer">
        <div>
          <div style="font-size:11px;color:#6b7280">Payment Method: ${s.paymentMethod || '—'}</div>
          <div style="font-size:11px;color:#6b7280">Transaction Ref: ${s.paymentReference || '—'}</div>
          ${s.notes ? `<div style="font-size:11px;color:#6b7280;margin-top:4px">Notes: ${s.notes}</div>` : ''}
          <div style="margin-top:12px;font-size:10px;color:#9ca3af">This is a computer-generated invoice and does not require a physical signature.</div>
        </div>
        <div class="seal">
          <div style="font-size:11px;color:#6b7280">For Madiyayu Technologies Pvt. Ltd.</div>
          <div class="seal-line">Authorised Signatory</div>
        </div>
      </div>
    </div></body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); }, 500);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-indigo-600 rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-white" />
            <div>
              <h3 className="text-base font-bold text-white">{invoiceTypeLabel}</h3>
              <p className="text-xs text-indigo-200">{s.invoiceNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1.5 bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs px-3 py-2 rounded-lg transition-colors">
              <Printer className="w-4 h-4" /> Print / Download
            </button>
            <button onClick={onClose} className="text-indigo-200 hover:text-white p-1 rounded-md">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5" ref={printRef}>
          {/* Parties */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-2">Bill From</p>
              <p className="font-bold text-gray-900 text-sm">Madiyayu Technologies Pvt. Ltd.</p>
              <p className="text-xs text-gray-500 mt-1">123, Business Hub, BKC, Mumbai</p>
              <p className="text-xs text-gray-500">Maharashtra, India — 400051</p>
              <p className="text-xs font-semibold text-gray-700 mt-2">GSTIN: 27AABCU9603R1ZX</p>
              <p className="text-xs text-gray-500">SAC: {sacCode}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Bill To</p>
              <p className="font-bold text-gray-900 text-sm">{tenantName}</p>
              <p className="text-xs text-gray-500 mt-1">{clientAddress || '—'}</p>
              <p className="text-xs text-gray-500">{clientState}</p>
              <p className="text-xs font-semibold text-gray-700 mt-2">GSTIN: {clientGstin}</p>
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="grid grid-cols-3 gap-3">
            {[['Invoice No.', s.invoiceNumber], ['Invoice Date', invoiceDate.toLocaleDateString('en-IN')], ['Supply Type', isInterState ? 'Inter-State (IGST)' : 'Intra-State (CGST+SGST)'],
              ['Period Start', fmt(s.startDate)], ['Period End', fmt(s.endDate)], ['Payment Method', s.paymentMethod || '—']].map(([k,v]) => (
              <div key={k} className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{k}</p>
                <p className="text-xs font-semibold text-gray-800">{v}</p>
              </div>
            ))}
          </div>

          {/* Service Line */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-800 text-white grid grid-cols-12 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Service Description</div>
              <div className="col-span-2">SAC Code</div>
              <div className="col-span-2">Cycle</div>
              <div className="col-span-2 text-right">Taxable (₹)</div>
            </div>
            <div className="grid grid-cols-12 px-4 py-3.5 text-sm border-t border-gray-100">
              <div className="col-span-1 text-gray-400">1</div>
              <div className="col-span-5">
                <p className="font-bold text-gray-900">{planName}</p>
                <p className="text-xs text-gray-400 mt-0.5">Political SaaS Subscription</p>
              </div>
              <div className="col-span-2 text-xs text-gray-600 font-mono">{sacCode}</div>
              <div className="col-span-2 text-xs text-gray-600">{s.billingCycle}</div>
              <div className="col-span-2 text-right font-bold text-gray-900">₹{taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          {/* Tax Breakdown */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-2.5 text-[10px] font-bold uppercase text-gray-500 tracking-wider border-b border-gray-200">GST Breakdown</div>
            <div className="divide-y divide-gray-100">
              <div className="flex justify-between px-4 py-2.5 text-sm">
                <span className="text-gray-500">Taxable Amount</span>
                <span className="font-semibold text-gray-800">₹{taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {isInterState ? (
                <div className="flex justify-between px-4 py-2.5 text-sm">
                  <span className="text-gray-500">IGST @ {taxRate}% <span className="text-xs text-gray-400">(Inter-State)</span></span>
                  <span className="font-semibold text-orange-700">₹{igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between px-4 py-2.5 text-sm">
                    <span className="text-gray-500">CGST @ {taxRate / 2}% <span className="text-xs text-gray-400">(Central)</span></span>
                    <span className="font-semibold text-blue-700">₹{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2.5 text-sm">
                    <span className="text-gray-500">SGST @ {taxRate / 2}% <span className="text-xs text-gray-400">(State)</span></span>
                    <span className="font-semibold text-purple-700">₹{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between px-4 py-3 bg-indigo-600 text-white">
                <span className="font-bold text-sm">GRAND TOTAL (INR)</span>
                <span className="font-extrabold text-lg">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Amount in Words */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
            <p className="text-[10px] font-bold text-yellow-700 uppercase tracking-wider mb-1">Amount in Words</p>
            <p className="text-sm font-semibold text-yellow-900">{numberToWords(totalAmount)}</p>
          </div>

          {/* Payment + Notes */}
          {(s.paymentReference || s.notes) && (
            <div className="grid grid-cols-2 gap-3">
              {s.paymentReference && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Transaction Ref</p>
                  <p className="text-xs font-mono font-semibold text-gray-800">{s.paymentReference}</p>
                </div>
              )}
              {s.notes && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Notes</p>
                  <p className="text-xs text-gray-700">{s.notes}</p>
                </div>
              )}
            </div>
          )}

          <p className="text-center text-[10px] text-gray-400 pt-2">This is a computer-generated invoice. SAC {sacCode}: IT Software Subscription Services.</p>
        </div>
      </div>
    </div>
  );
}

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Chandigarh',
  'Dadra & Nagar Haveli','Daman & Diu','Lakshadweep','Puducherry','Andaman & Nicobar',
];

/** Reusable GST fields block for Create / Renew forms */
function GstFormSection({ form, setForm, accentColor = 'indigo' }) {
  const r = accentColor;
  return (
    <div className="bg-indigo-50/60 border border-indigo-200/70 rounded-xl p-3.5 space-y-3">
      <p className="text-[10px] font-black text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
        <FileText className="w-3 h-3" /> GST / Tax Invoice Details (SRS Sec 46.2)
      </p>

      {/* GSTIN + State */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Client GSTIN <span className="font-normal text-gray-400">(optional)</span></label>
          <input
            type="text"
            maxLength={15}
            value={form.clientGstin || ''}
            onChange={e => setForm(f => ({ ...f, clientGstin: e.target.value.toUpperCase() }))}
            placeholder="27AABCU9603R1ZX"
            className={`w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-${r}-500`}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Client State</label>
          <select
            value={form.clientState || ''}
            onChange={e => setForm(f => ({ ...f, clientState: e.target.value }))}
            className={`w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-${r}-500`}
          >
            <option value="">-- State chuno --</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Client Billing Address</label>
        <textarea
          rows={2}
          value={form.clientAddress || ''}
          onChange={e => setForm(f => ({ ...f, clientAddress: e.target.value }))}
          placeholder="Full billing address (shown on invoice)"
          className={`w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white resize-none focus:outline-none focus:ring-2 focus:ring-${r}-500`}
        />
      </div>

      {/* GST Rate + Inter-State */}
      <div className="grid grid-cols-2 gap-3 items-end">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">GST Rate (%)</label>
          <select
            value={form.taxRate ?? 18}
            onChange={e => setForm(f => ({ ...f, taxRate: Number(e.target.value) }))}
            className={`w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-${r}-500`}
          >
            <option value={0}>0% (Exempt)</option>
            <option value={5}>5% GST</option>
            <option value={12}>12% GST</option>
            <option value={18}>18% GST (Default)</option>
            <option value={28}>28% GST</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer pb-0.5">
          <input
            type="checkbox"
            checked={form.isInterState || false}
            onChange={e => setForm(f => ({ ...f, isInterState: e.target.checked }))}
            className={`rounded text-${r}-600`}
          />
          <span>
            <span className="font-semibold">Inter-State Supply</span>
            <br />
            <span className="text-[10px] text-gray-400">{form.isInterState ? 'IGST will apply' : 'CGST + SGST will apply'}</span>
          </span>
        </label>
      </div>

      {/* Live GST preview */}
      {(form.amountPaid || 0) > 0 && (
        <div className="bg-white border border-indigo-100 rounded-lg px-3 py-2 text-[10px] text-gray-600 space-y-0.5">
          <p className="font-bold text-indigo-700 mb-1">Live GST Preview</p>
          {(() => {
            const gross = Number(form.amountPaid) || 0;
            const rate = (form.taxRate ?? 18) / 100;
            const taxable = Math.round((gross / (1 + rate)) * 100) / 100;
            const tax = Math.round((gross - taxable) * 100) / 100;
            const half = Math.round((tax / 2) * 100) / 100;
            return (
              <>
                <div className="flex justify-between"><span>Taxable Amount:</span><span className="font-semibold">₹{taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                {form.isInterState
                  ? <div className="flex justify-between"><span>IGST @ {form.taxRate ?? 18}%:</span><span className="font-semibold text-orange-600">₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                  : <>
                      <div className="flex justify-between"><span>CGST @ {(form.taxRate ?? 18) / 2}%:</span><span className="font-semibold text-blue-600">₹{half.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                      <div className="flex justify-between"><span>SGST @ {(form.taxRate ?? 18) / 2}%:</span><span className="font-semibold text-purple-600">₹{half.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                    </>
                }
                <div className="flex justify-between border-t border-indigo-100 mt-1 pt-1 font-bold text-indigo-800"><span>Grand Total:</span><span>₹{gross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default function Subscriptions() {
  const [subs, setSubs] = useState([]);
  const [stats, setStats] = useState(null);
  const [expiring, setExpiring] = useState([]);
  const [tenantSubs, setTenantSubs] = useState([]);         // GET /subscriptions/tenant/:id
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [plans, setPlans] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTenantSubs, setLoadingTenantSubs] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [modal, setModal] = useState({ open: false, type: null, sub: null });
  const [subDetail, setSubDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [form, setForm] = useState({});
  const [invoiceSub, setInvoiceSub] = useState(null);

  const emptyCreateForm = {
    tenantId: '', planId: '', isTrial: false, durationMonths: 12,
    amountPaid: 0, paymentMethod: 'bank_transfer', paymentReference: '', notes: '',
    // GST defaults
    taxRate: 18, isInterState: false, clientGstin: '', clientState: '', clientAddress: '',
    invoiceType: 'tax_invoice',
  };

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      setLoading(true);
      const [subsData, statsData, expiringData, plansData, tenantsData, dashData] = await Promise.all([
        subscriptionsService.getAll(),
        subscriptionsService.getStats(),
        subscriptionsService.getExpiringSoon(15),
        plansService.getAll(),
        tenantsService.getAll(),
        apiClient.get('/super-admin/dashboard/stats').then(r => r.data?.data || r.data),
      ]);
      setSubs(subsData?.data || subsData || []);
      setStats(statsData);
      setExpiring(expiringData || []);
      setPlans(plansData || []);
      setTenants(tenantsData || []);
      setRecentInvoices(dashData?.recentInvoices || []);
    } catch {
      setError('Data load nahi hua.');
    } finally {
      setLoading(false);
    }
  }

  async function openModal(type, sub = null) {
    setError('');
    setSubDetail(null);
    setModal({ open: true, type, sub });
    if (type === 'VIEW' && sub?._id) {
      // GET /super-admin/subscriptions/:id — fresh full detail
      setLoadingDetail(true);
      try {
        const data = await subscriptionsService.getOne(sub._id);
        setSubDetail(data);
      } catch {
        setSubDetail(sub); // fallback to table data
      } finally {
        setLoadingDetail(false);
      }
    } else if (type === 'CREATE') {
      setForm(emptyCreateForm);
    } else if (type === 'RENEW') {
      // Pre-fill GST fields from existing subscription or tenant profile
      const tenant = tenants.find(t => t._id === sub?.tenantId?._id || t._id === sub?.tenantId);
      setForm({
        durationMonths: 12,
        amountPaid: sub?.planId?.price || 0,
        paymentMethod: 'bank_transfer',
        paymentReference: '',
        notes: '',
        taxRate: sub?.taxRate ?? 18,
        isInterState: sub?.isInterState ?? false,
        clientGstin: sub?.clientGstin || tenant?.gstin || '',
        clientState: sub?.clientState || tenant?.billingState || '',
        clientAddress: sub?.clientAddress || tenant?.billingAddress || '',
      });
    } else if (type === 'UPGRADE') {
      setForm({ newPlanId: '', durationMonths: 12, amountPaid: 0, paymentMethod: 'bank_transfer', notes: '' });
    } else if (type === 'EXTEND') {
      setForm({ additionalDays: 7, notes: '' });
    } else if (type === 'CANCEL') {
      setForm({ reason: '', immediate: true });
    } else if (type === 'PAUSE') {
      setForm({ reason: '' });
    }
  }

  function closeModal() {
    setModal({ open: false, type: null, sub: null });
    setError('');
    setSubDetail(null);
  }

  // GET /super-admin/subscriptions/tenant/:tenantId
  async function loadTenantSubs(tenantId) {
    if (!tenantId) { setTenantSubs([]); return; }
    try {
      setLoadingTenantSubs(true);
      const data = await subscriptionsService.getByTenant(tenantId);
      setTenantSubs(data || []);
    } catch {
      setTenantSubs([]);
    } finally {
      setLoadingTenantSubs(false);
    }
  }

  function handleTenantFilter(e) {
    const id = e.target.value;
    setSelectedTenantId(id);
    setActiveTab('tenant');
    loadTenantSubs(id);
  }

  async function handleConfirm() {
    try {
      setSaving(true);
      const id = modal.sub?._id;
      if (modal.type === 'CREATE') await subscriptionsService.create(form);
      else if (modal.type === 'RENEW') await subscriptionsService.renew(id, form);
      else if (modal.type === 'UPGRADE') await subscriptionsService.upgrade(id, form);
      else if (modal.type === 'EXTEND') await subscriptionsService.extendTrial(id, form);
      else if (modal.type === 'CANCEL') await subscriptionsService.cancel(id, form);
      else if (modal.type === 'PAUSE') await subscriptionsService.pause(id, form);
      else if (modal.type === 'RESUME') await subscriptionsService.resume(id);
      await loadAll();
      closeModal();
    } catch (e) {
      setError(e?.response?.data?.message || 'Action failed');
    } finally {
      setSaving(false);
    }
  }

  const displaySubs =
    activeTab === 'expiring' ? expiring :
      activeTab === 'tenant' ? tenantSubs :
        subs;

  return (
    <div className="w-full font-sans space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-indigo-600" /> Client Subscriptions
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage billing, renewals, and client packages.</p>
        </div>
        <button onClick={() => openModal('CREATE')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
          <Plus className="w-5 h-5" /> New Subscription
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active', value: stats.active, icon: Activity, color: 'emerald' },
            { label: 'Expiring (15d)', value: stats.expiringIn15Days, icon: Clock, color: 'orange' },
            { label: 'Revenue', value: `₹${(stats.totalRevenueCollected || 0).toLocaleString()}`, icon: IndianRupee, color: 'indigo' },
            { label: 'Trialing', value: stats.trialing, icon: TrendingUp, color: 'blue' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 bg-${color}-50 rounded-full flex items-center justify-center shrink-0`}>
                <Icon className={`w-6 h-6 text-${color}-600`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">{label}</p>
                <h3 className="text-2xl font-black text-gray-900">{value}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-wrap items-center border-b border-gray-200 gap-0">
          {[['all', 'All Subscriptions'], ['expiring', 'Expiring Soon'], ['tenant', 'By Tenant']].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
          {/* Tenant filter dropdown — GET /subscriptions/tenant/:tenantId */}
          {activeTab === 'tenant' && (
            <div className="ml-auto px-4 py-2">
              <select
                value={selectedTenantId}
                onChange={handleTenantFilter}
                className="text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Tenant choose karo --</option>
                {tenants.map(t => (
                  <option key={t._id} value={t._id}>{t.name} ({t.slug})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading || (activeTab === 'tenant' && loadingTenantSubs) ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Client', 'Plan', 'Status', 'Start', 'End', 'Amount', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displaySubs.map((sub) => (
                  <tr key={sub._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-gray-900">{sub.tenantId?.name || sub.tenantId}</div>
                      <div className="text-xs text-gray-400 font-mono">{sub.invoiceNumber}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-800">{sub.planId?.name || '—'}</div>
                      <div className="text-xs text-gray-500">{sub.billingCycle}</div>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={sub.status} /></td>
                    <td className="px-5 py-4 whitespace-nowrap text-gray-600">{fmt(sub.startDate)}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-gray-600">{fmt(sub.endDate)}</td>
                    <td className="px-5 py-4 whitespace-nowrap font-semibold text-gray-800">₹{(sub.amountPaid || 0).toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openModal('VIEW', sub)} title="View" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => setInvoiceSub(sub)} title="GST Invoice" className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"><FileText className="w-4 h-4" /></button>
                        <button onClick={() => openModal('RENEW', sub)} title="Renew" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><RefreshCw className="w-4 h-4" /></button>
                        <button onClick={() => openModal('UPGRADE', sub)} title="Upgrade" className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"><ArrowUpCircle className="w-4 h-4" /></button>
                        <button onClick={() => openModal('EXTEND', sub)} title="Extend Trial" className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg"><Clock className="w-4 h-4" /></button>
                        {sub.status === 'paused'
                          ? <button onClick={() => openModal('RESUME', sub)} title="Resume" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><PlayCircle className="w-4 h-4" /></button>
                          : <button onClick={() => openModal('PAUSE', sub)} title="Pause" className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg"><PauseCircle className="w-4 h-4" /></button>
                        }
                        <button onClick={() => openModal('CANCEL', sub)} title="Cancel" className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><XCircle className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {displaySubs.length === 0 && (
                  <tr><td colSpan={7} className="py-16 text-center text-gray-400">Koi subscription nahi mili</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 shrink-0">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {modal.type === 'CREATE' && <><Plus className="w-5 h-5 text-indigo-600" />New Subscription</>}
                {modal.type === 'VIEW' && <><Eye className="w-5 h-5 text-blue-600" />Details</>}
                {modal.type === 'RENEW' && <><RefreshCw className="w-5 h-5 text-emerald-600" />Renew</>}
                {modal.type === 'UPGRADE' && <><ArrowUpCircle className="w-5 h-5 text-indigo-600" />Upgrade Plan</>}
                {modal.type === 'EXTEND' && <><Clock className="w-5 h-5 text-purple-600" />Extend Trial</>}
                {modal.type === 'PAUSE' && <><PauseCircle className="w-5 h-5 text-yellow-600" />Pause</>}
                {modal.type === 'RESUME' && <><PlayCircle className="w-5 h-5 text-emerald-600" />Resume</>}
                {modal.type === 'CANCEL' && <><AlertCircle className="w-5 h-5 text-red-600" />Cancel</>}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 p-1 rounded-md"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

              {/* VIEW — GET /super-admin/subscriptions/:id */}
              {modal.type === 'VIEW' && (
                <div className="space-y-3">
                  {loadingDetail ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                  ) : (() => {
                    const s = subDetail || modal.sub;
                    return (
                      <>
                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border">
                          <div>
                            <p className="font-bold text-gray-900">{s.tenantId?.name || s.tenantId}</p>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">{s.invoiceNumber}</p>
                          </div>
                          <StatusBadge status={s.status} />
                        </div>
                        {[
                          ['Plan', s.planId?.name],
                          ['Billing Cycle', s.billingCycle],
                          ['Amount Paid', `₹${(s.amountPaid || 0).toLocaleString()}`],
                          ['Payment Method', s.paymentMethod],
                          ['Payment Ref', s.paymentReference || '—'],
                          ['Start Date', fmt(s.startDate)],
                          ['End Date', fmt(s.endDate)],
                          ['Trial Ends', s.trialEndsAt ? fmt(s.trialEndsAt) : null],
                          ['Cancelled At', s.cancelledAt ? fmt(s.cancelledAt) : null],
                          ['Cancel Reason', s.cancelReason || null],
                          ['Paused At', s.pausedAt ? fmt(s.pausedAt) : null],
                          ['Notes', s.notes || null],
                          ['Auto Renew', s.autoRenew ? 'Yes' : 'No'],
                          ['Created At', s.createdAt ? fmt(s.createdAt) : null],
                        ].filter(([, v]) => v != null && v !== '').map(([k, v]) => (
                          <div key={k} className="flex justify-between text-sm py-2 border-b border-gray-100">
                            <span className="text-gray-500">{k}</span>
                            <span className="font-semibold text-gray-800">{v}</span>
                          </div>
                        ))}
                        {/* Timeline */}
                        {s.timeline?.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Timeline ({s.timeline.length} events)</p>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {[...s.timeline].reverse().map((t, i) => (
                                <div key={i} className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs">
                                  <span className="font-bold text-indigo-700 uppercase mr-2">{t.action}</span>
                                  <span className="text-gray-500">{t.note}</span>
                                  <div className="text-gray-400 mt-0.5">{t.timestamp ? fmt(t.timestamp) : ''} • {t.performedBy}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {/* CREATE */}
              {modal.type === 'CREATE' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tenant</label>
                    <select
                      value={form.tenantId}
                      onChange={e => {
                        const tId = e.target.value;
                        const selTenant = tenants.find(t => t._id === tId);
                        setForm(f => ({
                          ...f,
                          tenantId: tId,
                          clientGstin: selTenant?.gstin || f.clientGstin || '',
                          clientState: selTenant?.billingState || f.clientState || '',
                          clientAddress: selTenant?.billingAddress || f.clientAddress || '',
                        }));
                      }}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Select Tenant --</option>
                      {tenants.map(t => <option key={t._id} value={t._id}>{t.name} ({t.slug})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Plan</label>
                    <select value={form.planId} onChange={e => setForm(f => ({ ...f, planId: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">-- Select Plan --</option>
                      {plans.map(p => <option key={p._id} value={p._id}>{p.name} (₹{p.price})</option>)}
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={form.isTrial} onChange={e => setForm(f => ({ ...f, isTrial: e.target.checked }))} className="rounded" />
                    Trial ke roop mein
                  </label>
                  {form.isTrial ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Trial Days</label>
                      <input type="number" value={form.trialDays || 14} onChange={e => setForm(f => ({ ...f, trialDays: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (Months)</label>
                        <input type="number" value={form.durationMonths} onChange={e => setForm(f => ({ ...f, durationMonths: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (₹)</label>
                        <input type="number" value={form.amountPaid} onChange={e => setForm(f => ({ ...f, amountPaid: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Method</label>
                    <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Reference</label>
                    <input type="text" value={form.paymentReference} onChange={e => setForm(f => ({ ...f, paymentReference: e.target.value }))} placeholder="UTR / Transaction ID" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  {/* GST Invoice Details */}
                  <GstFormSection form={form} setForm={setForm} accentColor="indigo" />
                </div>
              )}

              {/* RENEW */}
              {modal.type === 'RENEW' && (
                <div className="space-y-4">
                  <div className="bg-emerald-50 p-3 rounded-lg text-sm text-emerald-800 border border-emerald-100">
                    Renewing: <span className="font-bold">{modal.sub?.tenantId?.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (Months)</label>
                      <input type="number" value={form.durationMonths} onChange={e => setForm(f => ({ ...f, durationMonths: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (₹)</label>
                      <input type="number" value={form.amountPaid} onChange={e => setForm(f => ({ ...f, amountPaid: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Method</label>
                    <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Reference</label>
                    <input type="text" value={form.paymentReference} onChange={e => setForm(f => ({ ...f, paymentReference: e.target.value }))} placeholder="UTR / Transaction ID" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  {/* GST Invoice Details — pre-filled from previous subscription */}
                  <GstFormSection form={form} setForm={setForm} accentColor="emerald" />
                </div>
              )}

              {/* UPGRADE */}
              {modal.type === 'UPGRADE' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">New Plan</label>
                    <select value={form.newPlanId} onChange={e => setForm(f => ({ ...f, newPlanId: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">-- Select New Plan --</option>
                      {plans.map(p => <option key={p._id} value={p._id}>{p.name} (₹{p.price})</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (Months)</label>
                      <input type="number" value={form.durationMonths} onChange={e => setForm(f => ({ ...f, durationMonths: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (₹)</label>
                      <input type="number" value={form.amountPaid} onChange={e => setForm(f => ({ ...f, amountPaid: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                </div>
              )}

              {/* EXTEND TRIAL */}
              {modal.type === 'EXTEND' && (
                <div className="space-y-4">
                  <div className="bg-purple-50 p-3 rounded-lg text-sm text-purple-800 border border-purple-100">
                    Trial extend karo: <span className="font-bold">{modal.sub?.tenantId?.name}</span>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Extra Days</label>
                    <input type="number" value={form.additionalDays} onChange={e => setForm(f => ({ ...f, additionalDays: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                    <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>
              )}

              {/* PAUSE */}
              {modal.type === 'PAUSE' && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800 border border-yellow-100">
                    <span className="font-bold">{modal.sub?.tenantId?.name}</span> ka subscription pause hoga. Access band ho jayega.
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Reason</label>
                    <input type="text" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                  </div>
                </div>
              )}

              {/* RESUME */}
              {modal.type === 'RESUME' && (
                <div className="text-center py-4">
                  <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-emerald-100 mb-4">
                    <PlayCircle className="h-7 w-7 text-emerald-600" />
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold">{modal.sub?.tenantId?.name}</span> ka subscription resume hoga aur access wapas milega.
                  </p>
                </div>
              )}

              {/* CANCEL */}
              {modal.type === 'CANCEL' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-3">
                      <XCircle className="h-7 w-7 text-red-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      <span className="font-bold">{modal.sub?.tenantId?.name}</span> ka subscription cancel hoga.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Reason (required)</label>
                    <input type="text" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Cancellation reason..." />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={form.immediate} onChange={e => setForm(f => ({ ...f, immediate: e.target.checked }))} className="rounded" />
                    Turant suspend karo
                  </label>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors">
                {modal.type === 'VIEW' ? 'Close' : 'Cancel'}
              </button>
              {/* VIEW modal: Invoice + Edit buttons */}
              {modal.type === 'VIEW' && (
                <button
                  onClick={() => { closeModal(); setInvoiceSub(subDetail || modal.sub); }}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4" /> Generate Invoice
                </button>
              )}
              {modal.type !== 'VIEW' && (
                <button onClick={handleConfirm} disabled={saving}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60 ${modal.type === 'CANCEL' ? 'bg-red-600 hover:bg-red-700' : modal.type === 'PAUSE' ? 'bg-yellow-600 hover:bg-yellow-700' : modal.type === 'RESUME' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {modal.type === 'CANCEL' ? 'Cancel Subscription' : modal.type === 'PAUSE' ? 'Pause' : modal.type === 'RESUME' ? 'Resume' : 'Confirm'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* GST Invoice Modal */}
      {invoiceSub && <GstInvoiceModal sub={invoiceSub} onClose={() => setInvoiceSub(null)} />}
    </div>
  );
}
