# SysTrans ROI Calculator

## Current State
Single-page SysTrans website with hero, services, about, stats, contact, FAQ, and team sections. Backend stores contact form submissions. Admin panel at `/admin` shows contact submissions table with Internet Identity login.

## Requested Changes (Diff)

### Add
- ROI Calculator section on homepage, placed right after the hero section
- Calculator inputs: Monthly Revenue (R), Staff Hours on Manual Tasks/month (H), Estimated Lost/Abandoned Leads/month (L), Avg Hourly Wage (₹), Average Order Value (₹)
- Live calculation: Time Recovery = H × Hourly Wage; Revenue Recovery = L × AOV; Total Monthly Gain = Time Recovery + Revenue Recovery
- Result display: show each component and the total prominently
- "Get My Full Audit Report" CTA button that opens a lead capture form (name, email, phone number)
- Backend `submitROILead` function to store: name, email, phone, calculator inputs (R, H, L, wage, aov), computed result, timestamp
- New `getROILeads` query (admin-only) in backend
- Admin panel: add a second tab "ROI Leads" showing a table of submitted leads (name, email, phone, total gain, date)

### Modify
- `src/backend/main.mo`: add ROILead type, submitROILead function, getROILeads admin query
- `src/frontend/src/backend.d.ts`: add ROILead type and new backend methods
- `src/frontend/src/AdminPanel.tsx`: add tabs (Contact Submissions | ROI Leads)
- `src/frontend/src/App.tsx`: add ROI Calculator section after hero

### Remove
- Nothing removed

## Implementation Plan
1. Extend backend with ROILead type and submitROILead / getROILeads methods
2. Update backend.d.ts to reflect new types/methods
3. Add ROI Calculator component in App.tsx after hero section (SysTrans dark/blue theme)
4. Update AdminPanel.tsx to show tabbed view: Contact Submissions and ROI Leads
