# ExamForge — Intelligent Examination Timetable Generator Using Graph Coloring

> **Discrete Mathematics College Examination Scheduling & Vacant Classroom Allocation System**

🌐 **Live Public Website:** [https://prathamesh-salunke.github.io/ExamForge/](https://prathamesh-salunke.github.io/ExamForge/)

[![Live Deployment](https://img.shields.io/badge/Live%20Demo-Online-success?style=flat&logo=github)](https://prathamesh-salunke.github.io/ExamForge/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Tests](https://img.shields.io/badge/tests-18%20passed-emerald.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-ES2020-blue.svg)]()
[![React](https://img.shields.io/badge/React-19-61dafb.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

---

## 🏛️ Practical College Scenario

"Our college needs to conduct examinations for multiple subjects. Some classrooms may already be occupied, while other classrooms are vacant. **ExamForge** helps college administration identify examination clashes, generate a valid collision-free timetable using **Graph Vertex Coloring**, and identify suitable vacant classrooms with sufficient seating capacity for each examination."

ExamForge provides rigorous, transparent answers to core academic scheduling challenges:

1. **Which examinations can happen simultaneously?** — Any pair of examinations that share zero students (independent vertices in the conflict graph $G$).
2. **Which examinations must be scheduled at different times?** — Examinations that share at least one registered student (connected by an edge in $G$).
3. **Which classrooms are vacant during a selected time slot?** — Evaluated using strict half-open interval overlap $[S_1, E_1) \cap [S_2, E_2) \neq \emptyset$.
4. **Which vacant classrooms have enough seating capacity?** — Verified with $\text{Room Capacity} \ge \text{Registered Students}$.
5. **Can an examination be allocated without double-booking?** — Yes, automatic Best-Fit room allocation prevents room overlap.
6. **What is the final timetable?** — A printable, exportable Master Timetable grid and calendar view.
7. **Why was a particular slot assigned?** — A deterministic step-by-step algorithm trace details which neighbor conflicts dictated the time slot.

---

## 📐 Discrete Mathematics Foundation

### 1. Conflict Graph $G = (V, E)$
- **Vertices ($V$):** Each examination / course represents a vertex $v \in V$.
- **Edges ($E$):** An undirected edge $(u, v) \in E$ exists if and only if:
  $$\text{Students}(u) \cap \text{Students}(v) \neq \emptyset$$
- **Coloring ($c: V \to \{0, 1, \dots, k-1\}$):** Each distinct integer color corresponds to a distinct **Examination Time Slot**.
- **Fundamental Rule:** Adjacent vertices must receive distinct colors:
  $$\forall (u, v) \in E \implies c(u) \neq c(v)$$

### 2. Implemented Graph Coloring Algorithms
ExamForge allows switching between two classical graph coloring algorithms:

#### A. Welsh-Powell Greedy Algorithm
1. Order all examination vertices by descending degree: $d(v_1) \ge d(v_2) \ge \dots \ge d(v_n)$.
2. Iteratively assign each vertex the lowest non-negative integer color not taken by any of its colored neighbors.

#### B. Daniel Brélaz's DSATUR Algorithm (Degree of Saturation)
1. Calculate saturation degree $\rho(v)$ for all uncolored vertices (number of distinct colors used by already-colored neighbors).
2. Dynamically select the vertex with maximum $\rho(v)$.
3. Break ties using highest degree in the uncolored subgraph, then total degree.
4. Assign the lowest available color not present in its neighborhood.
5. Repeat until all vertices are colored.

> **Theoretical Bound:** By Brooks' Theorem, $\chi(G) \le \Delta(G) + 1$, where $\Delta(G)$ is the maximum degree of the conflict graph.

---

## 🔍 Vacant Classroom Allocation Engine

The **Find Vacant Classrooms** module is designed for real-world college room scheduling:

- **Interval Collision Formula:** Two examinations on the same date with windows $[S_{req}, E_{req})$ and $[S_{exist}, E_{exist})$ overlap if and only if:
  $$S_{req} < E_{exist} \quad \land \quad E_{req} > S_{exist}$$
- **Capacity Suitability:**
  - **Suitable & Vacant:** The room is unoccupied for the entire duration AND has $\text{Capacity} \ge \text{Students}$.
  - **Vacant (Capacity Shortfall):** The room is free, but seat capacity is insufficient (shows exact shortage).
  - **Occupied / Clashing:** Identifies the conflicting examination code, title, and overlapping hours.
- **Multi-Room Support:** If an examination's enrollment exceeds the single largest room, ExamForge partitions seating across suitable adjacent venues without double-booking.

---

## 🎨 Design System

The application strictly implements the required clean, modern visual identity:

- **Sky Blue (`#438DFF`):** Primary branding, active buttons, focus indicators.
- **White (`#FFFFFF`):** High-readability surfaces, crisp cards, modal dialogues.
- **Soft Purple (`#A78BFA`):** Graph coloring accents, discrete mathematics badges.
- **Pale Blue (`#EAF4FF`):** Gentle background tints and secondary highlights.
- **Dark Navy (`#0F172A`):** High-contrast, readable typography.
- **Soft Green (`#10B981` / `#D1FAE5`):** Conflict-free verification and room availability status.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4, Plus Jakarta Sans typography
- **Icons:** Lucide React
- **Export Engine:** SheetJS (`xlsx`) for real Excel (`.xlsx`) and CSV downloads
- **Testing:** Vitest (18 unit and integration tests passing)
- **Data Persistence:** LocalStorage state syncing with 1-click college scenario demo reset

---

## 🚀 Quick Start & Local Development

### Prerequisites
- Node.js (v18 or higher, tested on v24.22)
- npm (v9 or higher, tested on v11.20)

### 1. Clone the repository
```bash
git clone https://github.com/Prathamesh-Salunke/ExamForge.git
cd ExamForge
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run unit tests
```bash
npm test
```

### 4. Start the development server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 5. Production build
```bash
npm run build
npm run preview
```

---

## 📊 Export Formats

ExamForge exports authentic application data directly to:
- **Master Examination Timetable** (`.xlsx` & `.csv`)
- **Classroom Allocation Matrix** (`.xlsx` & `.csv`)
- **Vacant Classrooms Availability Report** (`.xlsx` & `.csv`)
- **Discrete Math Student Conflict Edge Analysis** (`.xlsx` & `.csv`)

---

## 👤 Author & Academic Project

- **Author:** Prathamesh Salunke
- **Repository:** [https://github.com/Prathamesh-Salunke/ExamForge](https://github.com/Prathamesh-Salunke/ExamForge)
- **License:** MIT License
