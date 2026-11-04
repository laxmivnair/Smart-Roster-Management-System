# DataStraw Smart Roster Management System

> **Hiring Assignment**: Build a Smart Roster Management System  
> **Target Problem**: Autonomous monthly scheduling, multi-account client SLA coverage enforcement, conflict explanation, and dynamic disruption handling across 30+ employees, 15 D2C brands, and operational pods.

---

## Live Demo & Repository Links

* **Working Application URL**: [Live Application Demo](http://localhost:3000)  https://smart-roster-management-system.vercel.app/
* **Backend API URL**: [Live API](http://localhost:5000)   https://smart-roster-management-system-sh0z.onrender.com
* **GitHub Repository**: (https://github.com/laxmivnair/Smart-Roster-Management-System)
* **Demo Video (3–5 Mins)**: https://drive.google.com/file/d/1EF9u1xF0UtvH2zxpwtw9N3JXI-cUJtCx/view?usp=sharing

---

## 1. System Architecture

The application is architected as a clean full-stack MERN solution (MongoDB, Express, React, Node.js) with decoupled domain services:

```
datastraw-roster/
├── server/
│   ├── config/db.js               # Hybrid DB connector (Atlas, Local, & embedded memory fallback)
│   ├── models/                    # Strict Mongoose Schemas
│   │   ├── Pod.js                 # Operational Pods (Pod Lead, Code, Description)
│   │   ├── Employee.js            # 32 Staff (Skills, Roles, Default Offs, Max 6-day work limit)
│   │   ├── Brand.js               # 15 D2C Brands (80% Single-Resource, 20% Multi-Resource)
│   │   ├── BrandProcess.js        # Operating Calendars (365d, Mon-Sat, etc., min staff)
│   │   ├── ResourceAllocation.js  # Primary & Backup bindings
│   │   ├── LeaveSchedule.js       # Pre-approved planned leaves & comp-offs
│   │   └── Roster.js              # Monthly schedule matrix, SLA metrics, diagnosed conflicts
│   ├── services/
│   │   ├── schedulerEngine.js     # 4-stage deterministic constraint satisfaction algorithm
│   │   └── conflictValidator.js   # Audit engine: Root-cause explanations & pod candidate finder
│   ├── controllers/               # REST API Handlers (generate, cell edit, 3F simulation)
│   ├── routes/                    # API Routes (/api/roster/*)
│   └── seed/seedData.js           # 32-employee seed dataset script
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx         # KPI Bar, SLA Health progress, 1-Click seed reset
    │   │   ├── ViewSelector.jsx   # Tab navigator for 5 stakeholder views
    │   │   ├── EditCellModal.jsx  # Interactive cell edit with live re-validation
    │   │   ├── SimulateLeaveModal.jsx # Section 3F: Disruption simulator
    │   │   ├── ConflictDrawer.jsx # Slide-over audit drawer with 1-click backup assign
    │   │   └── views/             # 5 Stakeholder Views
    │   │       ├── CompanyView.jsx    # Full 32-staff x 30-day interactive matrix
    │   │       ├── PodView.jsx        # Grouped by Pod Leads & team capacity
    │   │       ├── BrandView.jsx      # Client SLA compliance matrix (Green/Red/Yellow)
    │   │       ├── ProcessView.jsx    # Staffing density for CS, ACC, NDR, Retention
    │   │       └── EmployeeView.jsx   # Personal timesheet & monthly calendar card
    │   └── utils/csvExport.js     # Client-side spreadsheet export
```

---

## 2. Core Operational Capabilities

### A. The 80% Single-Resource Dilemma
In CX operations, ~80% of D2C brands are managed by a single dedicated employee handling all processes (CS, ACC, NDR). However, clients demand **365-day coverage**, while labor regulations guarantee employees **weekly offs** and leaves. 
* **Our Solution**: Rather than silently forcing employees into illegal 30-day work streaks, our engine schedules legal weekly offs, scans the employee's **Operational Pod** for available cross-trained peers, and assigns backups. If no peer is legally free, the system explicitly flags a `CRITICAL_GAP` with an actionable diagnosis.

### B. The 5 Dedicated Stakeholder Views (Section 3E)
1. **Company-Wide View**: Full 32-employee $\times$ 30-day matrix with sticky employee column, live search, and color-coded status chips.
2. **Pod-Wise View**: Grouped under Pod Leads (*Sarah Jenkins*, *Vikram Malhotra*, *Ananya Roy*) showing pod load balancing and internal cross-coverage usage.
3. **Brand-Wise View**: Client SLA checklist showing daily status: 🟩 Fully Covered, 🟥 Critical Gap (0 staff), 🟨 Understaffed, ⬜ Closed.
4. **Process-Wise View**: Daily staffing numbers across Customer Support (CS), Abandoned Cart Conversions (ACC), Non-Delivery Reports (NDR), and Retention.
5. **Employee-Wise View**: Individual timesheet card with personal monthly calendar, working shifts count, offs, and assigned brands.

### C. Live Disruption Handling (Section 3F)
* Click **"Simulate Disruption (3F)"** to mark an employee as suddenly sick on a single-resource brand.
* The system evaluates client SLA impact in $<100\text{ms}$, updates the SLA Health Bar, flags the brand gap, and opens the **Conflict Resolution Center** offering eligible pod peers with a **"1-Click Assign Cover"** button.

---

## 3. Section 8: Tell Us How You Think

1. How did you model employees, brands, processes, pods, and their relationships?

I avoided the common mistake of tightly coupling an employee directly to a brand. In real customer operations, staff need to cover for each other, and brands have different operating rules for different channels (e.g., Customer Support might run 7 days a week, while Delivery management only runs Monday to Friday).

I decoupled the data into five core models:

Pod: Represents the operational unit (e.g., Pod Alpha - Fashion) headed by a single Pod Lead.
Employee: Belongs to a Pod, holds specific certified skill tags (CS, ACC, NDR, RETENTION), has preferred off-days, and carries a hard fatigue limit of 6 maximum consecutive working days.
Brand: Assigned to a Pod and categorized as either SINGLE_RESOURCE (~80%) or MULTI_RESOURCE (~20%).
BrandProcess: Represents the actual client SLA contract. It defines the operating schedule (365 Days, Mon-Sat, etc.) and the minimum daily staff required.
ResourceAllocation: The join model that bridges an employee to a brand process, with a role tag (PRIMARY vs BACKUP).

This relational structure allows a single dedicated employee to handle all 3 processes for a small brand, while allowing 2–3 employees to share high-volume processes on larger brands.


2. How does your system generate a roster and determine whether it satisfies the required constraints?

The generator runs as a 4-phase deterministic pipeline in schedulerEngine.js:

Demand Matrix Calculation: It walks through all 30 days of the month, checking each brand process's calendar rules against national holidays (like Diwali) to calculate the exact headcount needed on each date.
Hard Availability Locking: Approved leaves from LeaveSchedule and public holidays are locked first. These are non-negotiable.
Primary Scheduling & Staggered Offs: Primary shifts are scheduled while enforcing that no employee works more than 6 days in a row without a rest day. For multi-resource brands, weekly offs are staggered so the brand never loses baseline coverage.
Pod-Level Smart Fill: When a single-resource brand has an open gap due to the employee's weekly off, the engine scans the same Pod for an available peer who has the matching skill tag and won't exceed consecutive day limits by covering.

Once generated, a separate conflictValidator.js engine audits the entire matrix. If an operating day has 0 staff, it emits CRITICAL_GAP; if it has fewer staff than required, it emits UNDERSTAFFED; if anyone worked 7+ days straight, it flags OVERLOAD. It calculates a real-time SLA percentage: 
(
Covered Shifts
/
Required Shifts
)
×
100
(Covered Shifts/Required Shifts)×100.



3. How did you handle the difference between single-resource brands and brands with multiple employees?

This was the most critical problem in the entire assessment:

For Single-Resource Brands (80%): One dedicated person handles all processes. When they work, the whole brand is covered. But when they take their mandatory weekly off, the entire brand faces a complete coverage blackout. I treated their off-days as potential coverage holes. The algorithm searches for a qualified peer within the same Pod to cover as a secondary backup. If no peer is free, the system explicitly leaves the gap open and flags it in red, rather than faking coverage or forcing the agent into overwork.
For Multi-Resource Brands (20%): Two or three employees share the brand. Here, the challenge is coordination. For example, in LuxeLiving, both Arjun and Ritu handle Customer Support. Instead of letting both take Sunday off, the engine staggers their rest days (Arjun takes Sunday, Ritu takes Monday). This ensures the brand maintains continuous 7-day client coverage internally without needing outside help from the pod.


4. What happens when an employee manages all processes for a brand but is unavailable on a required working day?

The system never hides the problem or silently overworks the employee.

The employee's slot is set to LEAVE or WEEKLY_OFF.
The brand's active processes on that date register 0 working staff.
The audit engine immediately marks the day as a CRITICAL_GAP (shown as a red badge on the Brand View and reflected in a lower SLA Health score).
Instead of stopping at an error message, the Conflict Engine scans the employee's Pod for peers who:
Have the required skill tag (e.g. CS-certified).
Are not already working another shift that day.
Will not exceed their 6-consecutive-day limit by stepping in.
It presents these candidates in the Conflict Resolution Center with a green 'Assign Cover' button, allowing the operations manager to resolve the gap with one click.


5. How does your system handle conflicting requirements or insufficient staffing?

I implemented a strict constraint hierarchy:
Client Contract (SLA Demand)
≥
Labor Laws / Approved Leaves
>
Off-Day Preferences
Client Contract (SLA Demand)≥Labor Laws / Approved Leaves>Off-Day Preferences

Hard constraints: An approved leave is non-negotiable. An employee cannot work 7 consecutive days without a rest day.
Soft constraints: Preferred off days (e.g. preferring Sunday over Wednesday) can be adjusted to protect client coverage.

If staffing is mathematically insufficient (for example, every single NDR-certified associate in Pod Alpha is already working), the system refuses to invent a solution. It flags the gap and produces an explicit escalation:
'Escalate to Pod Alpha Lead: No available peer with NDR skill found. External cross-pod backup required.'
In operations, an honest red alert is infinitely better than a system that silently generates an invalid schedule.


6. Which parts of the process did you automate, and which did you leave under human control? Why?
What I automated:
The tedious mathematical calculations: evaluating brand operating calendars against public holidays.
Weekly off staggering across multi-resource team members.
Fatigue monitoring (counting consecutive days).
Pod-level candidate discovery and root-cause conflict diagnostics.
What I left under human control:
Cross-pod reassignments: Pod Leads know agent personalities, client sensitivities, and real-time fatigue better than code can.
Final Roster Publication: The transition from DRAFT to PUBLISHED requires manager sign-off.
Manual Overrides: Managers can click any shift cell to manually approve comp-offs or swap shifts.
Why: 100% automation in team scheduling leads to employee frustration and rigid edge-case failures. The algorithm should handle 95% of the scheduling math and present clear options, while managers retain final operational authority.


7. If the company doubled its team and brand count, what would you change about your solution?

If we scaled from 32 to 64+ employees and 30+ brands:

Algorithmic Solver: The greedy heuristic currently solves in under 150ms, which is great for 32 people. At scale, I would replace it with an Integer Linear Programming (ILP) solver (such as Google OR-Tools) to optimize multi-variable trade-offs (e.g. minimizing shift variance across all workers).
Database & Transactions: I would migrate from MongoDB to PostgreSQL with Prisma. Shift swaps and multi-brand allocations benefit from relational foreign keys and ACID transactions to prevent race conditions during concurrent edits.
Background Job Queues: Heavy monthly generation would move to an asynchronous background worker using BullMQ + Redis, updating the frontend via WebSockets.
Role-Based Permissions (RBAC): Pod Leads would draft and approve their own pod's schedule, while the Operations Director would hold global publish rights.


8. If you had one additional week to work on this, what would you improve first?

Three specific additions:

Historical Weekend Fairness Tracking: Track Saturday/Sunday off distributions over a rolling 3-to-6 month window to mathematically guarantee that weekend shifts rotate fairly among associates.
Bi-directional Slack / WhatsApp Shift Swaps: Enable associates to request shift trades via a Slack bot; the bot would validate constraints in real-time and ping the Pod Lead for 1-click approval.
Google Workspace Sync: Direct two-way integration with Google Sheets and Google Calendar via API, so associates have their shifts synced directly to their mobile calendar.
---

## 4. Quickstart: Run Locally in 2 Minutes

### Prerequisites
* Node.js v18+ and npm installed.
* *(Optional)* MongoDB running locally or a MongoDB Atlas URI. *(If no MongoDB is running, the app automatically falls back to an embedded in-memory MongoDB database with zero configuration needed!)*

### Setup & Run
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/datastraw-roster-management.git
   cd datastraw-roster-management
   ```

2. **Start Backend Server**:
   ```bash
   cd server
   npm install
   npm run seed    # Seeds 32 employees, 15 brands, 3 pods
   npm start       # Starts API server on http://localhost:5000
   ```

3. **Start Frontend Client** (in a separate terminal):
   ```bash
   cd client
   npm install
   npm run dev     # Starts Vite dev server on http://localhost:3000
   ```

4. Open your browser at **`http://localhost:3000`**.

---

## 5. Deployment Instructions

### Deploy Backend to Render / Railway:
1. Connect your GitHub repository to Render or Railway.
2. Root Directory: `server`.
3. Build Command: `npm install`.
4. Start Command: `npm start`.
5. Environment Variables:
   - `PORT`: `5000`
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `NODE_ENV`: `production`

### Deploy Frontend to Vercel:
1. Connect your repository to Vercel.
2. Root Directory: `client`.
3. Framework Preset: `Vite`.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Environment Variables:
   - `VITE_API_URL`: Your deployed backend URL.

---

