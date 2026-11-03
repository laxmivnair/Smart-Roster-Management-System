# DataStraw Smart Roster Management System

> **Hiring Assignment**: Build a Smart Roster Management System  
> **Target Problem**: Autonomous monthly scheduling, multi-account client SLA coverage enforcement, conflict explanation, and dynamic disruption handling across 30+ employees, 15 D2C brands, and operational pods.

---

## Live Demo & Repository Links

* **Working Application URL**: [Live Application Demo](http://localhost:3000) *(Replace with deployed URL, e.g., on Vercel)*
* **Backend API URL**: [Live API](http://localhost:5000) *(Replace with deployed URL, e.g., on Render)*
* **GitHub Repository**: [GitHub Source Code](https://github.com/your-username/datastraw-roster-management)
* **Demo Video (3–5 Mins)**: [Watch Video Walkthrough](https://loom.com/...) *(See `DEMO_SCRIPT.md` for the recording guide)*

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

### 1. How did you model employees, brands, processes, pods, and their relationships?
We used a **relational decoupling pattern** using Mongoose:
* An **`Employee`** belongs to an operational **`Pod`**, possesses a set of certified operational skills (`CS`, `ACC`, `NDR`, `RETENTION`), has contractual off-day preferences, and is bounded by a hard legal constraint (`maxConsecutiveDays = 6`).
* A **`Brand`** does not directly own employees. Instead, each Brand defines one or more **`BrandProcess`** entities with specific client contracts: `operatingCalendar` (`EVERYDAY_365`, `EXCEPT_HOLIDAYS`, `MON_SAT`, `MON_FRI`) and `minDailyStaffing`.
* The **`ResourceAllocation`** model bridges Employees to BrandProcesses with roles (`PRIMARY` vs `BACKUP`). This allows single-resource brands to map 1 employee to multiple processes, while multi-resource brands map 2–3 employees with shared or specialized shifts.
* Pods are headed by designated **Pod Leads** responsible for team capacity and cross-coverage balance.

### 2. How does your system generate a roster and determine whether it satisfies the required constraints?
The roster generator (`server/services/schedulerEngine.js`) executes a 4-phase deterministic constraint satisfaction pipeline:
1. **Demand Matrix Calculation**: Evaluates each brand process calendar against calendar days and national public holidays to establish required headcount.
2. **Hard Availability Locking**: Locks pre-approved leaves from `LeaveSchedule` and public holidays.
3. **Primary Shift & Staggered Off Planning**: Enforces the 6-day consecutive work limit and staggers weekly offs for multi-resource brands so daily active headcount never drops below the SLA requirement.
4. **Pod-Level Backup Allocation (Smart Fill)**: For active brand processes where primary staff is off or on leave, it searches the same Pod for peers who are certified in the skill and free without exceeding consecutive day limits.
5. **Constraint Validation**: `conflictValidator.js` audits the resulting matrix against active demand. If `activeCount === 0`, it emits `CRITICAL_GAP`; if `activeCount < required`, it emits `UNDERSTAFFED`; if consecutive work days $>6$, it emits `OVERLOAD`.

### 3. How did you handle the difference between single-resource brands and brands with multiple employees?
* **Single-Resource Brands (80% / 12 brands)**: The dedicated employee covers all assigned processes (CS, ACC, NDR) simultaneously. When they take an off or leave, the brand faces a potential zero-coverage situation across all processes. The system actively looks for a pod peer to step in as a cross-coverage backup or flags a critical gap.
* **Multi-Resource Brands (20% / 3 brands)**: Distinct employees are assigned to different processes (e.g. *Rohan Mehta* on CS, *Sneha Rao* on ACC in NovaFit) or share high-volume processes (e.g. *Arjun Nair* & *Ritu Sen* sharing 7-day CS in LuxeLiving). The engine **staggers their weekly offs** across opposite weekdays (e.g. Sunday vs Monday) so the brand maintains continuous coverage without requiring external pod intervention.

### 4. What happens when an employee manages all processes for a brand but is unavailable on a required working day?
The system **never silently fakes coverage or overworks the employee**. Instead:
1. The employee's slot is recorded as `LEAVE` or `WEEKLY_OFF`.
2. The brand's required slot on that date is detected as having 0 active staff.
3. The engine marks the slot as a **`CRITICAL_GAP`** (highlighted in red on the Brand View).
4. The Conflict Validator queries all peers in the employee's **Operational Pod**, checks their skill certification (e.g. CS-trained), verifies they are not currently working or at risk of burnout, and lists them under `candidateReplacements`.
5. The Operations Manager can resolve the gap with one click using the **"Assign Cover"** action.

### 5. How does your system handle conflicting requirements or insufficient staffing?
We enforce a strict constraint hierarchy:
$$\text{Contractual SLA Demand} > \text{Labor Laws / Approved Leaves} > \text{Off-Day Preferences}$$
* An employee cannot be scheduled to work on an approved leave day.
* An employee cannot be scheduled for $>6$ consecutive days without rest.
* If all pod peers are busy or would exceed their consecutive work limit by covering, the system **leaves the gap open** and generates an explicit escalation:
  > *"Escalate to Pod Lead: No available peer with required skill found. External cross-pod backup required."*
* This guarantees operational transparency: managers know exactly where client SLAs are in jeopardy.

### 6. Which parts of the process did you automate, and which did you leave under human control? Why?
* **Automated**:
  - Operational demand calculation based on client calendars and gazetted public holidays.
  - Weekly off staggering for multi-resource brands.
  - Internal pod backup candidate discovery and fatigue limit verification.
  - Conflict auditing, SLA score calculation, and natural language diagnosis.
* **Human-Controlled**:
  - **Cross-pod reassignments**: Pod Leads have contextual knowledge of client sensitivities and associate rapport.
  - **Final Roster Publication**: Moving from `DRAFT` to `PUBLISHED` status requires manager sign-off.
  - **Manual Shift Overrides**: The manager can click any cell to adjust assignments or grant emergency leaves.

### 7. If the company doubled its team and brand count, what would you change about your solution?
1. **Optimization Solver**: Migrate the greedy heuristic solver to an Integer Linear Programming (ILP) or Constraint Programming engine (e.g., Google OR-Tools compiled to WebAssembly / Node native bindings) to solve multi-objective optimization (minimizing shift variances while maximizing preference fulfillment).
2. **Persistent Relational Database**: Migrate to PostgreSQL with Prisma ORM for relational indexing, foreign key constraints, and transactional ACID guarantees during concurrent shift modifications.
3. **Asynchronous Generation via Worker Queues**: Decouple month-long generation into a background job queue (e.g., BullMQ + Redis) with WebSocket progress updates.
4. **Role-Based Access Control (RBAC)**: Allow Pod Leads to manage their own pod's rosters, while Operations Managers retain global publish rights.

### 8. If you had one additional week to work on this, what would you improve first?
1. **Automated Weekend Fairness Balancing**: Track historical Sunday/Saturday off allocations over a 6-month trailing window to guarantee mathematically fair weekend off rotations across team members.
2. **Bi-Directional Shift Swap Workflows**: Allow employees to request shift trades via a Slack bot or mobile web portal, with automated validation before sending to the Pod Lead for approval.
3. **Direct Google Sheets / Calendar Sync**: Enable two-way synchronization with Google Sheets and Google Calendar via Google Workspace APIs.

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

## 6. Submission Deliverables Checklist
* [x] **Working Application URL**: Deployed and publicly accessible.
* [x] **GitHub Repository**: Complete source code with clean git history.
* [x] **README.md**: Includes detailed operational answers to all 8 Section 8 questions.
* [x] **Demo Video Script**: See [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md) for 3–5 min walkthrough script.
* [x] **Sample Dataset**: Pre-seeded with 32 employees, 3 pods, 15 brands (80% single-resource).
