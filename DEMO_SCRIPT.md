# DataStraw Roster System - 3-5 Minute Video Walkthrough Script

> **Goal**: A structured, timed presentation to demonstrate the system to DataStraw hiring managers.  
> **Target Duration**: 3 minutes 30 seconds to 4 minutes.  
> **Tools**: Loom, OBS, or QuickTime screen recording with audio.

---

## ⏱️ Video Cue Sheet & Timestamps

| Timestamp | Section | Screen Action | Talking Points |
| :--- | :--- | :--- | :--- |
| **0:00 - 0:40** | **The Core Problem & Context** | Show app homepage (Executive KPI Bar). | Introduce yourself. Explain the 80% single-resource paradox in CX operations. |
| **0:40 - 1:20** | **Roster Generation & Company View** | Click "Generate Roster", show 32 employees x 30 days matrix. | Explain the constraint satisfaction algorithm, colors, and 960 generated slots. |
| **1:20 - 2:05** | **The 5 Stakeholder Views** | Switch to Pod View, Brand View, Process View, Employee View. | Highlight how each stakeholder (Pod Leads, Brand Ops, HR, individual staff) gets a tailored perspective. |
| **2:05 - 2:50** | **Conflict Detection & Audit Center** | Open the Conflict Drawer. Show sample explanations. | Explain why the system never silently produces invalid rosters; explain root causes and candidate pod backups. |
| **2:50 - 3:35** | **Section 3F: Dynamic Disruption Demo** | Click "Simulate Disruption (3F)", pick Rahul Sharma on Nov 6, trigger leave, click "Assign Cover". | The "wow factor": sudden sick leave creates a gap, system evaluates SLA, recommends pod peer Pooja Nair, 1-click resolve. |
| **3:35 - 4:00** | **Wrap-Up & Architecture** | Show GitHub repository and Section 8 in README. | Summarize MERN architecture, scalability answers, and conclude. |

---

## 🎙️ Word-for-Word Voiceover Script

### 1. Introduction & The Operational Problem (0:00 – 0:40)
> *"Hello everyone! My name is [Your Name], and this is my submission for DataStraw's Smart Roster Management System assessment.*
>
> *To solve this challenge, I didn't just build a digital calendar. I focused on the real-world operational problem: In a growing customer experience company, approximately 80% of brands are managed by a single dedicated employee handling all processes like Customer Support, Cart Conversions, and NDR.*
>
> *Clients expect 365-day coverage, but employees are legally and morally entitled to weekly offs and leaves. If a dedicated agent takes Sunday off, that brand faces zero coverage unless a cross-trained teammate from the same operational Pod steps in. Here is how my system solves that."*

---

### 2. Roster Generation & Company-Wide Matrix (0:40 – 1:20)
*(Action: Click the "Generate Roster" button in the header.)*

> *"Here in the Operations Command Center, I can select a month—let's take November 2026—and click 'Generate Roster'.*
>
> *In under 150 milliseconds, our constraint engine generates all 960 shift slots across our 32 employees. Looking at the Executive KPI bar, we instantly see our real-time Operational SLA Health score—currently at 92.5%.*
>
> *In the Company-Wide View, we see all 32 associates across all 30 days. Blue chips represent working primary shifts, slate chips are mandatory weekly offs respecting the 6-consecutive-day fatigue rule, amber chips are approved leaves, and purple chips with a star indicate smart cross-coverage backups where a pod teammate stepped in to protect client coverage."*

---

### 3. The 5 Stakeholder Perspectives (1:20 – 2:05)
*(Action: Click through the tabs: Pod-Wise $\rightarrow$ Brand-Wise $\rightarrow$ Process-Wise $\rightarrow$ Employee-Wise.)*

> *"The assessment requires supporting multiple stakeholders, so I built 5 dedicated views:*
>
> 1. *First, the **Pod-Wise View**: Grouped under our three Pod Leads—Sarah Jenkins in Pod Alpha, Vikram Malhotra in Pod Beta, and Ananya Roy in Pod Gamma. It highlights team capacity and internal backup usage.*
> 2. *Second, the **Brand-Wise View**: This is what the client and operations director care about. Each brand row displays its operating calendar—like 365-day or Mon-Sat—with green checkmarks for covered days, yellow for understaffed, and red for critical coverage gaps.*
> 3. *Third, the **Process-Wise View**: Shows daily staffing density across Customer Support, Abandoned Cart Conversions, and NDR.*
> 4. *And fourth, the **Employee-Wise View**: A personal timesheet card and monthly calendar showing individual shift commitments and time off."*

---

### 4. Conflict Detection & Explainability (2:05 – 2:50)
*(Action: Click the red "Conflicts" badge in the header to open the slide-over Conflict Drawer.)*

> *"Section 3D states that the system should never silently generate an invalid roster. When we open our Conflict Center, we see clear, human-readable diagnoses.*
>
> *For example, on November 1st, Brand AuraScents required Customer Support, but dedicated agent Neha Gupta was on mandatory weekly off. Instead of just a red error code, the system explains: 'Brand requires 1 staff, Neha Gupta is on mandatory weekly off. Zero staff currently present.'*
>
> *Even better, it immediately queries Pod Alpha and recommends available, CS-certified peers who have capacity to cover without exceeding legal working limits."*

---

### 5. Section 3F: Handling Live Operational Disruption (2:50 – 3:35)
*(Action: Click "Simulate Disruption (3F)", select Rahul Sharma on Nov 6, click "Simulate & Re-evaluate".)*

> *"Now let's demonstrate Section 3F: Handling changes after a roster is generated.*
>
> *Suppose Rahul Sharma—who manages all processes for SilkKnit Apparels—suddenly calls in sick with an emergency fever on Friday, November 6th. I click 'Simulate Disruption'.*
>
> *Immediately, the system updates: SilkKnit CS and NDR turn red on the Brand view. The Conflict Center flags the critical gap and scans Pod Alpha for replacements.*
>
> *Right here, it suggests Pooja Nair, who is CS-trained and available. I simply click 'Assign Cover'—and just like that, the shift updates to cross-coverage, the gap turns green, and our client SLA is protected!"*

---

### 6. Architecture & Conclusion (3:35 – 4:00)
*(Action: Briefly show the README.md with Section 8 questions on screen.)*

> *"Under the hood, this is built on a clean MERN architecture with an automated in-memory MongoDB fallback for zero-friction evaluation, plus an Export to CSV feature.*
>
> *In the repository README, I have documented comprehensive answers to all 8 thinking questions in Section 8—covering our relational data model, algorithmic trade-offs, and how this would scale to hundreds of brands using integer programming.*
>
> *Thank you for your time and for reviewing my submission!"*
