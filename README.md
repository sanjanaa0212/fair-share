# EduOrganize

## author: @sanjanaa0212

---

---

## 📝 Todo Breakdown (Onboarding + Roles Setup)

### **Phase 1 — Org Signup & Access Control Setup**

1. **Org Signup / Contact Flow**
   - [x] Create a **“Contact Us / Add Your Org” page** (basic form → persists org request in DB).
   - [x] As super admin (you), manually approve & create organization entry in DB.
   - [x] Generate **credentials** (temporary admin login) for that org.
     - [x] create org
     - [x] create admin for that org
     - [x] delete org

2. **DB Updates**
   - [x] `Organization` model (id, name, email, contact info).
   - [x] `User` model links to `organizationId`.
   - [ ] `Department`, `Class`, `Subject` later link to `organizationId`.

---

### **Phase 2 — Admin Onboarding**

1. **Admin Onboarding Flow (UI + API)**
   - [ ] After login → redirect to **Onboarding Wizard**.
   - [ ] Step 1: Org info (name, email, address, contact). Save → PATCH `/org/:id`.
   - [ ] Step 2: Bulk import users (teachers, students) via CSV.
     - [ ] Backend API → CSV upload endpoint → validate rows → persist valid users → return errors for invalid rows.
     - [ ] Mark users as “pending” until they log in.

2. **Magic Link Setup**
   - [ ] Generate unique magic link per org + role.
   - [ ] Store token in DB (`MagicLink` model with `role`, `expiresAt`, `organizationId`).
   - [ ] Magic link resolves to signup form → pre-validates against imported CSV list.
   - [ ] If valid, create user account and link to org.

---

### **Phase 3 — Teacher Onboarding**

1. **Teacher Signup via Magic Link**
   - [ ] Form fields: name, email, phone, dob, gender, password (or OTP login if you want simpler).
   - [ ] Validate: check if teacher exists in org’s CSV import.
   - [ ] On success → activate teacher account, assign to org.

2. **Teacher Setup**
   - [ ] Teacher can:
     - Import students via CSV to their class.
     - Generate student magic links (for joining class).
     - Add subjects / chapters / topics (manual or CSV import).

---

### **Phase 4 — Student Onboarding**

1. **Student Signup via Magic Link**
   - [ ] Form fields: name, email, phone, dob, gender.
   - [ ] Validate against org CSV list.
   - [ ] On success → student account activated, added to class.

2. **Student Initial Setup**
   - [ ] Redirect to student dashboard (timetable, assignments, doubts).
   - [ ] Offline sync indicators (optional at this stage).

---

### **Phase 5 — Role-Based Views**

- [ ] Setup **RBAC (role-based access control)** middleware:
  - Super Admin → manage orgs.
  - Admin → manage teachers/students/departments/classes.
  - Teacher → manage subjects/assignments/materials.
  - Student → view classes/materials/submit assignments.

- [ ] Configure frontend layouts:
  - Mobile → bottom nav bar.
  - Desktop → SaaS sidebar layout.
  - Shared pages but content differs by role.

---

## 🔑 Key Technical Todos

- [ ] **DB Models Needed**: `Organization`, `MagicLink`, `Department`, `User` (extended with orgId & role).
- [ ] **CSV Parser** (frontend preview + backend validation).
- [ ] **Magic Link Generator + Validator**.
- [ ] **Auth Guard** → only imported users + valid link can activate.
- [ ] **Onboarding Wizard Component** (multi-step, saves progress).

---

👉 Suggestion for your sprint weekends:

- **Weekend 1** → Org + User models, super admin onboarding, basic auth.
- **Weekend 2** → Admin onboarding wizard, CSV import (API + UI).
- **Weekend 3** → Magic link generator + signup flows (teachers/students).
- **Weekend 4** → Role-based layouts + dashboards bootstrapped.

---

# future list

---

# students

1. Streak tracker for students in dashboard
2. Attendance tracker with location based

# Teacher

1. add graph of progress in dashboard
