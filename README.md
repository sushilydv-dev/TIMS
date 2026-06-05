# TIMS
### 2.2 Component Stack Reference Matrix

| Layer | Selected Core Technology | Infrastructure Role |
| :--- | :--- | :--- |
| **Frontend Framework** | `Next.js 14+` (App Router) + `TypeScript` | Responsive UI rendering, layouts, and pre-routing protection |
| **Styling & UI Components**| `Tailwind CSS` / `Material UI` | Layout implementation |
| **Backend Engine** | `Node.js` + `Express.js` | REST API layer, authentication routing, and business logic execution |
| **ORM / Data Access** | `Prisma ORM` or `Sequelize` | Safe type queries and schematic migrations |
| **Primary Database** | `PostgreSQL` | Relational storage for users, transactions, and performance data |
| **Cache Store** | `Redis` | Session storage, blacklist validation, and performance lookups |
| **Object File Storage** | `AWS S3` or `Cloudinary` | Hosting source files, code ZIPs, PDFs, and binary attachments |
| **Real-Time Layer** | `Socket.IO` | Direct notifications and live coordination alerts |
| **Containerization** | `Docker` | Application packaging |
| **CI/CD Pipeline** | `GitHub Actions` | Automated compilation, validation checks, and cloud deployments |

### 2.3 Backend Layered Structural Execution
Requests received by the Node.js API flow down through strict structural layers to decouple business logic from transport and storage mechanics:
1.  **Routes Layer:** Receives public inbound client HTTP requests and directs them to specific entry paths.
2.  **Middleware Layer:** Decodes JSON Web Tokens (JWT), verifies Role-Based Access Controls (RBAC), and checks schemas using Zod or Joi validators.
3.  **Controller Layer:** Unpacks payload parameters from the request header/body and marshals them into cleaner service data structures.
4.  **Service Layer:** Executes core organizational business operations (e.g., cross-checking payment clearance before auto-generating a graduation certificate).
5.  **Repository Layer:** Interacts with database schemas via the ORM layer to fetch or save table updates.
6.  **Database Layer:** Persists modifications safely inside the relational PostgreSQL storage engine.

---

## 3. Detailed Relational Database Architecture

The schema leverages a relational design in PostgreSQL with UUID data keys to ensure high integration, data consistency, and clear data lineage.

              ┌───────────────┐
              │     Roles     │
              └───────┬───────┘
                      │ 1
                      │
                      │ Many
┌───────────────┐     ┌─┴─────────────┐     ┌───────────────┐
│   Trainers    │1   1│     Users     │1   1│   Students    │
└───────┬───────┘◄────┴───────────────┴────►┴───────┬───────┘
│ 1                                         │ 1
│                                           │
│ Many                                      ├─────────────────────────┐
┌───────▼───────┐                                   │ Many                    │ Many
│    Batches    │◄────────────────────────┐         ▼                         ▼
└───────┬───────┘ 1                       │ 1 ┌───────────────┐         ┌───────────────┐
│                                 ├───┤  Enrollments  │         │  Attendance   │
│ 1                               │   └───────────────┘         └───────────────┘
│                                 │ Many
│ Many                            │                                   ▲
┌───────▼───────┐                         │                                   │ Many
│   Syllabus    │                         │                                   │
└───────────────┘                         │                                   │
│                                   │ 1
┌───────────────┐                         │                           ┌───────┴───────┐
│    Courses    │◄────────────────────────┼──────────────────────────►│   Projects    │
└───────────────┘ 1                       │ 1                         └───────┬───────┘
│                                   │ 1
│                                   │
│ Many                              │ Many
┌───────▼───────┐                   ┌───────▼───────┐
│     Fees      │                   │  Submissions  │
└───────┬───────┘                   └───────────────┘
│ 1
│
│ Many
┌───────▼───────┐
│   Payments    │
└───────────────┘

### 3.1 Structural Data Dictionary (Table Schemas)

#### Users Table (`users`)
Tracks core identity, credentials, and basic state patterns across all system users.
* `id` (UUID, Primary Key): Unique row identifier.
* `name` (VARCHAR): User's full name.
* `email` (VARCHAR, Unique): Identity email address used for login authentication.
* `password` (TEXT): Encrypted password signature (hashed via `bcrypt`).
* `role_id` (UUID, Foreign Key): Links directly to the assigned role profile.
* `status` (BOOLEAN): Activity flag (`true` = Active, `false` = Suspended/Deactivated).
* `created_at` (TIMESTAMP): Baseline registration timestamp.

#### Roles Table (`roles`)
Defines the distinct access identities recognized by system logic.
* `id` (UUID, Primary Key): Unique row identifier.
* `role_name` (VARCHAR): System identifier (restricted to: `ADMIN`, `TRAINER`, `STUDENT`, `HR`).

#### Students Table (`students`)
Stores extended metadata specific to trainees and interns.
* `id` (UUID, Primary Key): Unique student profile row key.
* `user_id` (UUID, Foreign Key): One-to-one mapping back to core credentials in the `users` table.
* `student_code` (VARCHAR, Unique): Formatted alphanumeric structural ID (e.g., `STU-2026-001`).
* `phone` (VARCHAR): Main telephone contact.
* `address` (TEXT): Primary permanent address location data.
* `college_name` (VARCHAR, Optional): Sponsoring or originating academic institution.
* `qualification` (VARCHAR): Degree, track status, or technical background.
* `joining_date` (DATE): Formal administrative integration start date.
* `profile_image` (TEXT, Optional): Hosting URL pointing directly to object storage assets.

#### Trainers Table (`trainers`)
Tracks internal training staff resources and operational profiles.
* `id` (UUID, Primary Key): Unique trainer profile identifier.
* `user_id` (UUID, Foreign Key): One-to-one mapping back to core credentials in the `users` table.
* `specialization` (VARCHAR): Core technology focus areas (e.g., `MERN Stack`, `DevOps`).
* `experience_years` (INTEGER): Total industry track history.
* `salary` (DECIMAL): Internal processing reference tracking compensation base metrics.

#### Courses Table (`courses`)
Defines the programmatic training structures open for public enrollment.
* `id` (UUID, Primary Key): Course tracking row key.
* `title` (VARCHAR): Descriptive catalog name (e.g., `Full Stack Development`).
* `description` (TEXT): Full program syllabus details or outline summary texts.
* `duration_months` (INTEGER): Estimated length of the course program.
* `fees` (DECIMAL): Total standard monetary cost for catalog onboarding.
* `mode` (VARCHAR): Instruction method (restricted to: `Online`, `Offline`, `Hybrid`).
* `created_by` (UUID, Foreign Key): Identifies the Administrator who built the program.

#### Syllabus Table (`syllabus`)
Breaks courses down into sequentially structured topics.
* `id` (UUID, Primary Key): Step identifier key.
* `course_id` (UUID, Foreign Key): Maps back to the parent course structure.
* `topic_name` (VARCHAR): Title of the topic block.
* `description` (TEXT): Concepts and milestones included in the topic.
* `sequence_order` (INTEGER): Order index for structured learning delivery.

#### Batches Table (`batches`)
Tracks active instructional cohorts mapped to specific calendar runtimes.
* `id` (UUID, Primary Key): Cohort identifier key.
* `course_id` (UUID, Foreign Key): Links back to the structural target course.
* `trainer_id` (UUID, Foreign Key): Assigned educator managing group operations.
* `batch_name` (VARCHAR): Alphanumeric identification string (e.g., `MERN-2026-B1`).
* `start_date` (DATE): Formal cohort activation date.
* `end_date` (DATE): Expected completion milestone target.
* `capacity` (INTEGER): Maximum student registration threshold limit.
* `schedule_time` (VARCHAR): Alphanumeric tracking indicator for active timing groups (e.g., `09:00 AM - 11:00 AM`).

#### Enrollments Table (`enrollments`)
Tracks cohort matching links over time.
* `id` (UUID, Primary Key): Assignment link row key.
* `student_id` (UUID, Foreign Key): Associated student profile.
* `batch_id` (UUID, Foreign Key): Associated target batch.
* `enrollment_date` (DATE): Action logging date.
* `status` (VARCHAR): Registration state (e.g., `ACTIVE`, `COMPLETED`, `DROPPED`).

#### Attendance Table (`attendance`)
Tracks programmatic participation data points.
* `id` (UUID, Primary Key): Assessment row key.
* `student_id` (UUID, Foreign Key): Target student.
* `batch_id` (UUID, Foreign Key): Contextual validation cohort.
* `attendance_date` (DATE): Tracking date.
* `status` (VARCHAR): Tracking outcome (restricted to: `PRESENT`, `ABSENT`, `LEAVE`, `LATE`).
* `marked_by` (UUID, Foreign Key): Identity of the trainer locking the record status.

#### Projects Table (`projects`)
Tracks critical practical work targets or industrial tasks.
* `id` (UUID, Primary Key): Operational milestone project asset key.
* `course_id` (UUID, Foreign Key): High-level context path.
* `title` (VARCHAR): Project task name.
* `description` (TEXT): Detailed implementation instructions and parameters.
* `deadline` (DATE): Final submission target cut-off window.
* `assigned_by` (UUID, Foreign Key): Educator managing the project criteria.

#### Project Submissions Table (`project_submissions`)
Tracks trainee file uploads and evaluation feedback loops.
* `id` (UUID, Primary Key): Tracking reference key.
* `project_id` (UUID, Foreign Key): Maps back to the target project block.
* `student_id` (UUID, Foreign Key): Trainee uploader identity.
* `github_link` (TEXT, Optional): Code repository location URL.
* `file_url` (TEXT, Optional): S3 bucket storage path for artifacts (e.g., compilation ZIP files).
* `submitted_at` (TIMESTAMP): Exact network time capture log tracking deadline metrics.
* `marks` (INTEGER, Optional): Assigned performance score value.
* `feedback` (TEXT, Optional): Specific evaluation comments from the trainer.

#### Study Materials Table (`study_materials`)
Tracks static resources attached directly to structured courses.
* `id` (UUID, Primary Key): Material resource asset key.
* `course_id` (UUID, Foreign Key): Parent course route assignment tracking link.
* `title` (VARCHAR): Resource display name.
* `file_url` (TEXT): Storage asset download path.
* `material_type` (VARCHAR): Catalog flag indicator (e.g., `PDF`, `VIDEO`, `PPT`, `NOTES`).
* `uploaded_by` (UUID, Foreign Key): Identity of the authoring trainer.

#### Fees Table (`fees`)
Maintains accounting overview records for individual trainees.
* `id` (UUID, Primary Key): Account ledger reference key.
* `student_id` (UUID, Foreign Key): Trainee target record link.
* `total_amount` (DECIMAL): Formal balance due for catalog enrollment onboarding.
* `paid_amount` (DECIMAL): Aggregated sum of processing transactions captured.
* `due_amount` (DECIMAL): Active trailing liability balance (`total_amount` - `paid_amount`).
* `payment_status` (VARCHAR): General state (restricted to: `PAID`, `PARTIAL`, `PENDING`, `OVERDUE`).

#### Payments Table (`payments`)
Tracks individual financial ledger entries.
* `id` (UUID, Primary Key): Core receipt row reference key.
* `fee_id` (UUID, Foreign Key): Parent billing target link.
* `amount` (DECIMAL): Disbursed funds value.
* `payment_date` (DATE): Day the system logged the transaction.
* `payment_method` (VARCHAR): Processing mechanism used (e.g., `UPI`, `CARD`, `CASH`, `NET_BANKING`).
* `transaction_id` (VARCHAR): Gateway reference confirmation hash.

#### Certificates Table (`certificates`)
Tracks official completion verifications.
* `id` (UUID, Primary Key): Verification row reference key.
* `student_id` (UUID, Foreign Key): Graduate profile target record link.
* `certificate_no` (VARCHAR, Unique): Verifiable serial tracking sequence.
* `issue_date` (DATE): Formal administrative validation approval date.
* `certificate_url` (TEXT): Public secure hosting path to the generated PDF asset.

---

## 4. User Role Matrix & Functional Requirements

The system enforces strict structural isolation boundaries. Users interact with data models exclusively through their verified role token profiles.

### 4.1 System Permissions Matrix

| Module | Super Admin | Trainer / Teacher | Student / Intern | HR / Coordinator |
| :--- | :--- | :--- | :--- | :--- |
| **User Access Control** | Full Control (CRUD) | None | Profile Update Only | Profile Update Only |
| **Student Enrollment** | Full Control (CRUD) | View Only | None | Registration/Upload |
| **Course & Syllabus** | Full Control (CRUD) | Upload Material/Syllabus| View Only | View Only |
| **Batch Scheduling** | Full Control (CRUD) | View Assigned Only | View Assigned Only | Schedule Management |
| **Attendance Tracking**| Full Control + Reports| Mark Daily + Bulk | View Personal Stats | View Only |
| **Project Assignment**| View Only | Full Control (Create/Score)| Upload/Submit Code | None |
| **Fees & Billing** | Full Control (Setup/Collect)| None | View Status | Track Installments |
| **Certificates** | Approve & Issue | None | View & Download PDF | None |
| **Reports & Analytics** | Full System Reports | Batch Performance Only | Personal Report Cards| View Registration Stats|

### 4.2 Comprehensive Module Breakdown

#### Module 1: Authentication & Authorization
* **AUTH-1:** Secure user login using email and password credentials.
* **AUTH-2:** Cryptographic signature verification via JWT (Access + Refresh Token flow).
* **AUTH-3:** Role-based dashboard redirection upon authentication.
* **AUTH-4:** Blacklisting of active JWTs in Redis upon user logout.
* **AUTH-5:** Secure password reset via time-restricted OTP or email confirmation tokens.

#### Module 2: Student Onboarding & Profiles
* **STUD-1:** Capture structural metadata (Full Name, Phone, Email, Address, College, Qualification, Emergency Contact).
* **STUD-2:** Auto-generation of structured, deterministic unique identification tracking labels (`student_code`).
* **STUD-3:** Safe processing and indexing of academic or identity validation document attachments to AWS S3.
* **STUD-4:** Administrative matching to target training programs and active cohorts.
* **STUD-5:** Soft deactivation toggles to instantly terminate access for drops or programmatic suspension.

#### Module 3: Course & Syllabus Architecture
* **COURSE-1:** Setup structural target outlines detailing runtime parameters, standard programmatic cost structures, and delivery models.
* **COURSE-2:** Topic-by-topic sequence indexing enabling incremental learning milestones.
* **COURSE-3:** Attachment of resource links (PDF guides, slide decks, video links) to specific syllabus topics.

#### Module 4: Batch Execution Controls
* **BATCH-1:** Create runtime training cohorts with explicit start/end tracking milestones and threshold capacities.
* **BATCH-2:** Assign educators to cohorts based on technology alignment and availability tracking.
* **BATCH-3:** Publish access links or physical classroom codes directly to assigned student dashboard modules.

#### Module 5: Attendance Verification System
* **ATT-1:** Grid interfaces enabling rapid single-click or bulk student attendance tracking.
* **ATT-2:** Automation loops aggregating participation metrics into monthly percentage scores.
* **ATT-3:** Locking of historic records past configured structural date thresholds to preserve data integrity.

#### Module 6: Practical Project Management
* **PROJ-1:** Tools for educators to publish target project parameters, text outlines, and structured delivery deadlines.
* **PROJ-2:** Trainee interfaces supporting secure artifact submissions (e.g., code ZIP uploads, direct GitHub repo URL strings).
* **PROJ-3:** Evaluation interfaces for educators to review code links, input alphanumeric marks, and write directional feedback.

#### Module 7: Accounting Ledger & Programmatic Reminders
* **FEES-1:** Setup multi-tier or installment-based programmatic payment tracking profiles upon enrollment.
* **FEES-2:** Financial receipts and transactional audit logging cross-linking back to specific configuration invoices.
* **FEES-3:** Automated notification dispatch tasks querying trailing due dates to issue payment updates across communication channels.

#### Module 8: Milestone Evaluation & Graduation Verification
* **CERT-1:** Logic validation rules verifying completion metrics (e.g., checking for 100% financial clearance and >=85% attendance) before enabling certification tracks.
* **CERT-2:** Automated PDF compilation engines generating personalized programmatic graduation certificates featuring secure validation serial numbers.

---

## 5. System User Stories (Agile Framework)

### 5.1 Module 1: Authentication & Security Boundaries
* **US-AUTH-001:** As an Admin, Trainer, or Student, I want to submit my email and password credentials securely so that I can access my designated system dashboard.
* **US-AUTH-002:** As a registered user, I want to request a secure password recovery link via my verified email address so that I can safely regain interface access if I forget my password.
* **US-AUTH-003:** As an application security officer, I want all user requests to be verified via hidden HTTP-only cookie tokens so that our communication is protected against Cross-Site Scripting (XSS) intercept risks.
* **US-AUTH-004:** As an Administrator, I want the system to restrict interface access based on active role permissions so that users can only interact with authorized modules.

### 5.2 Module 2: Dashboard Metrics & Operational Visibility
* **US-DASH-001:** As an Administrator, I want to view active operational totals (Total Students, Active Batches, Unassigned Trainers) at a glance so that I can evaluate day-to-day organizational capacity.
* **US-DASH-002:** As an Administrator, I want to see a live visual line chart tracking revenue collections against trailing aging defaults so that I can evaluate programmatic cash flow health.
* **US-TDASH-001:** As a Trainer, I want to see an organized list of my active daily training blocks and pending project submissions so that I can prioritize my teaching and grading tasks.
* **US-SDASH-001:** As a Student, I want to track my overall attendance percentages, current topic markers, and pending project deadlines via a clean interface card so that I can stay aligned with the course roadmap.

### 5.3 Module 3: Onboarding & Cohort Management
* **US-STUD-001:** As an HR Coordinator, I want to fill out a unified trainee profile form and attach academic validation assets so that a new student profile is securely created in the database.
* **US-STUD-002:** As an Administrator, I want the system to assign an immutable alphanumeric identifier tracking tag to each profile during creation so that tracking records stay accurate across internal data tables.
* **US-BATCH-001:** As an Administrator, I want to group students into an active training cohort and assign a designated trainer so that structural training schedules can proceed efficiently.

### 5.4 Module 4: Educational Workflows & Practical Delivery
* **US-ATT-001:** As a Trainer, I want to access a structured grid list of my active cohort students to mark daily participation metrics (Present, Absent, Late, Leave) so that tracking updates publish directly to student profiles.
* **US-PROJ-001:** As a Trainer, I want to publish a detailed project assignment outlining technical goals and submission deadlines so that all students in the cohort receive immediate dashboard alerts.
* **US-PROJ-002:** As a Student, I want to paste my public GitHub code repository URL directly into a submission form before the deadline expires so that my trainer can evaluate my practical code performance.
* **US-MAT-001:** As a Trainer, I want to upload resource slide decks or documentation files directly to specific syllabus topics so that students can access targeted self-study guides.

### 5.5 Module 5: Administrative Control & Certification
* **US-FEES-001:** As an Administrator, I want to log a student's partial installment payment and immediately print an itemized transaction receipt so that financial ledger logs stay balanced.
* **US-CERT-001:** As an Administrator, I want the system to check a student's completion metrics against graduation rules before unlocking certificate generation so that programmatic quality standards are maintained.
* **US-CERT-002:** As a Student, I want to download a high-resolution PDF version of my graduation certificate directly from my dashboard so that I can showcase my credentials on professional networks.

---

## 6. Comprehensive Project Development Roadmap

┌───────────────────────────────────────────────────────────────┐
│  Phase 1: Sprint 1-2 (Core MVP Foundation)                    │
│  - Identity Schema Migrations & Auth Pipeline (JWT/Redis)     │
│  - Global Navigation Core Shell Layouts                        │
└───────────────────────────────┬───────────────────────────────┘
│
▼
┌───────────────────────────────────────────────────────────────┐
│  Phase 2: Sprint 3-4 (Core Module Implementation)             │
│  - CRUD Onboarding Pipelines (Students/Trainers/Courses)      │
│  - Cohort Assignment Matrix Logic & Grid UI Controls          │
└───────────────────────────────┬───────────────────────────────┘
│
▼
┌───────────────────────────────────────────────────────────────┐
│  Phase 3: Sprint 5-6 (Operational Integration)                 │
│  - Bulk Attendance Management Tools & S3 Upload Engines       │
│  - Ledger Engines & Automated Communication Triggers          │
└───────────────────────────────┬───────────────────────────────┘
│
▼
┌───────────────────────────────────────────────────────────────┐
│  Phase 4: Sprint 7-8 (Advanced Services & Launch)             │
│  - Analytical Dashboards, Chart Engines & PDF Auto-Compiler   │
│  - End-to-End Security Validation, Load Testing & Cloud Launch│
└───────────────────────────────────────────────────────────────┘

The system implementation is organized into four distinct two-week engineering cycles, building toward an initial production deployment over an 8-to-10 week timeline.

### 6.1 Phase 1: Authentication Engine & System Shell Layouts (Sprint 1 - 2)
* **Database Infrastructure:** Set up PostgreSQL table structures, define primary relations, configure indexes on search vectors, and run baseline schema migrations via the ORM.
* **Security Foundation:** Build the backend authentication router, implement secure hashing via `bcrypt`, write token validation handlers (Access + Refresh Token lifecycles), and configure Redis caching for active session blacklisting.
* **UI System Framework:** Establish the main Next.js App Router workspace, configure global state stores (Zustand or Redux Toolkit), set up Tailwind layout definitions, and build protected route interceptors.

### 6.2 Phase 2: Profiles, Catalog Management & Cohort Mapping (Sprint 3 - 4)
* **Profile Management:** Build operational data access layers and UI entry forms for Student and Trainer registration modules, including secure identification tracking generation tasks.
* **Course Catalog Design:** Build administrative CRUD interfaces to manage course configurations, cost definitions, and topic-by-topic sequence mappings.
* **Cohort Mapping Matrix:** Build the allocation engine enabling managers to map trainers to batches and assign trainee arrays into specific scheduling groups.

### 6.3 Phase 3: Attendance, Submissions & Accounting Ledgers (Sprint 5 - 6)
* **Attendance Tracking:** Build bulk grid evaluation tools enabling educators to quickly record daily participation metrics with automatic real-time summary calculations.
* **Practical Workspace Integrations:** Set up AWS S3 secure upload bridges handling multipart binary file transmissions (ZIP files, documentation PDFs), and build assignment submission status trackers.
* **Financial Accounting Engine:** Implement ledger tracking tables to process incoming installment transactions, generate dynamic billing receipts, and execute background checking logic to trigger automated overdue reminders.

### 6.4 Phase 4: Analytical Dashboards, PDF Auto-Compilation & Deployment (Sprint 7 - 8)
* **Reporting & Analytics Dashboard:** Integrate chart components (e.g., Recharts or Chart.js) to build high-level interactive visual tracking widgets monitoring attendance histories, revenue collections, and performance data.
* **Certification Compiler Engine:** Build automated server-side PDF generation workers that pull graduate details, verify completion requirements, and compile official downloadable graduation credentials.
* **Production Deployment Optimization:** Execute security hardening reviews (CORS headers, rate-limiting rules, SQL-injection checks), set up Docker orchestration layers, configure GitHub Actions pipelines, and launch to target cloud host platforms (AWS or DigitalOcean).
\"\"\"

# Define file path
file_path = "TIMS_Documentation.md"

# Write the contents into the markdown file
with open(file_path, "w", encoding="utf-8") as file:
    file.write(markdown_content)

print(f"File successfully created at: {os.path.abspath(file_path)}")


                   ┌─────────────────────────┐
                   │       Cloudflare        │
                   │   (DNS, CDN, WAF, SSL)  │
                   └────────────┬────────────┘
                                │
                ┌───────────────┴───────────────┐
                ▼                               ▼
   ┌────────────────────────┐       ┌────────────────────────┐
   │    Frontend Server     │       │     Backend Server     │
   │   Next.js App Router   │       │  Node.js / Express.js  │
   └────────────────────────┘       └───────────┬────────────┘
                                                │ (REST APIs)
                                                ▼
                         ┌──────────────────────┴──────────────────────┐
                         ▼                      ▼                      ▼
             ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
             │    PostgreSQL DB     │ │     Redis Cache      │ │  AWS S3 Cloud Storage│
             │ (Prisma / Sequelize) │ │  (Session/Blacklist) │ │ (ZIPs, PDFs, Media)  │
             └──────────────────────┘ └──────────────────────┘ └──────────────────────┘

### 2.2 Component Stack Reference Matrix

| Layer | Selected Core Technology | Infrastructure Role |
| :--- | :--- | :--- |
| **Frontend Framework** | `Next.js 14+` (App Router) + `TypeScript` | Responsive UI rendering, layouts, and pre-routing protection |
| **Styling & UI Components**| `Tailwind CSS` / `Material UI` | Layout implementation |
| **Backend Engine** | `Node.js` + `Express.js` | REST API layer, authentication routing, and business logic execution |
| **ORM / Data Access** | `Prisma ORM` or `Sequelize` | Safe type queries and schematic migrations |
| **Primary Database** | `PostgreSQL` | Relational storage for users, transactions, and performance data |
| **Cache Store** | `Redis` | Session storage, blacklist validation, and performance lookups |
| **Object File Storage** | `AWS S3` or `Cloudinary` | Hosting source files, code ZIPs, PDFs, and binary attachments |
| **Real-Time Layer** | `Socket.IO` | Direct notifications and live coordination alerts |
| **Containerization** | `Docker` | Application packaging |
| **CI/CD Pipeline** | `GitHub Actions` | Automated compilation, validation checks, and cloud deployments |

### 2.3 Backend Layered Structural Execution
Requests received by the Node.js API flow down through strict structural layers to decouple business logic from transport and storage mechanics:
1.  **Routes Layer:** Receives public inbound client HTTP requests and directs them to specific entry paths.
2.  **Middleware Layer:** Decodes JSON Web Tokens (JWT), verifies Role-Based Access Controls (RBAC), and checks schemas using Zod or Joi validators.
3.  **Controller Layer:** Unpacks payload parameters from the request header/body and marshals them into cleaner service data structures.
4.  **Service Layer:** Executes core organizational business operations (e.g., cross-checking payment clearance before auto-generating a graduation certificate).
5.  **Repository Layer:** Interacts with database schemas via the ORM layer to fetch or save table updates.
6.  **Database Layer:** Persists modifications safely inside the relational PostgreSQL storage engine.""")

markdown_sections.append("""## 3. Detailed Relational Database Architecture

The schema leverages a relational design in PostgreSQL with UUID data keys to ensure high integration, data consistency, and clear data lineage.

              ┌───────────────┐
              │     Roles     │
              └───────┬───────┘
                      │ 1
                      │
                      │ Many
┌───────────────┐     ┌─┴─────────────┐     ┌───────────────┐
│   Trainers    │1   1│     Users     │1   1│   Students    │
└───────┬───────┘◄────┴───────────────┴────►┴───────┬───────┘
│ 1                                         │ 1
│                                           │
│ Many                                      ├─────────────────────────┐
┌───────▼───────┐                                   │ Many                    │ Many
│    Batches    │◄────────────────────────┐         ▼                         ▼
└───────┬───────┘ 1                       │ 1 ┌───────────────┐         ┌───────────────┐
│                                 ├───┤  Enrollments  │         │  Attendance   │
│ 1                               │   └───────────────┘         └───────────────┘
│                                 │ Many
│ Many                            │                                   ▲
┌───────▼───────┐                         │                                   │ Many
│   Syllabus    │                         │                                   │
└───────────────┘                         │                                   │
│                                   │ 1
┌───────────────┐                         │                           ┌───────┴───────┐
│    Courses    │◄────────────────────────┼──────────────────────────►│   Projects    │
└───────────────┘ 1                       │ 1                         └───────┬───────┘
│                                   │ 1
│                                   │
│ Many                              │ Many
┌───────▼───────┐                   ┌───────▼───────┐
│     Fees      │                   │  Submissions  │
└───────┬───────┘                   └───────────────┘
│ 1
│
│ Many
┌───────▼───────┐
│   Payments    │
└───────────────┘

### 3.1 Structural Data Dictionary (Table Schemas)

#### Users Table (`users`)
Tracks core identity, credentials, and basic state patterns across all system users.
* `id` (UUID, Primary Key): Unique row identifier.
* `name` (VARCHAR): User's full name.
* `email` (VARCHAR, Unique): Identity email address used for login authentication.
* `password` (TEXT): Encrypted password signature (hashed via `bcrypt`).
* `role_id` (UUID, Foreign Key): Links directly to the assigned role profile.
* `status` (BOOLEAN): Activity flag (`true` = Active, `false` = Suspended/Deactivated).
* `created_at` (TIMESTAMP): Baseline registration timestamp.

#### Roles Table (`roles`)
Defines the distinct access identities recognized by system logic.
* `id` (UUID, Primary Key): Unique row identifier.
* `role_name` (VARCHAR): System identifier (restricted to: `ADMIN`, `TRAINER`, `STUDENT`, `HR`).

#### Students Table (`students`)
Stores extended metadata specific to trainees and interns.
* `id` (UUID, Primary Key): Unique student profile row key.
* `user_id` (UUID, Foreign Key): One-to-one mapping back to core credentials in the `users` table.
* `student_code` (VARCHAR, Unique): Formatted alphanumeric structural ID (e.g., `STU-2026-001`).
* `phone` (VARCHAR): Main telephone contact.
* `address` (TEXT): Primary permanent address location data.
* `college_name` (VARCHAR, Optional): Sponsoring or originating academic institution.
* `qualification` (VARCHAR): Degree, track status, or technical background.
* `joining_date` (DATE): Formal administrative integration start date.
* `profile_image` (TEXT, Optional): Hosting URL pointing directly to object storage assets.

#### Trainers Table (`trainers`)
Tracks internal training staff resources and operational profiles.
* `id` (UUID, Primary Key): Unique trainer profile identifier.
* `user_id` (UUID, Foreign Key): One-to-one mapping back to core credentials in the `users` table.
* `specialization` (VARCHAR): Core technology focus areas (e.g., `MERN Stack`, `DevOps`).
* `experience_years` (INTEGER): Total industry track history.
* `salary` (DECIMAL): Internal processing reference tracking compensation base metrics.

#### Courses Table (`courses`)
Defines the programmatic training structures open for public enrollment.
* `id` (UUID, Primary Key): Course tracking row key.
* `title` (VARCHAR): Descriptive catalog name (e.g., `Full Stack Development`).
* `description` (TEXT): Full program syllabus details or outline summary texts.
* `duration_months` (INTEGER): Estimated length of the course program.
* `fees` (DECIMAL): Total standard monetary cost for catalog onboarding.
* `mode` (VARCHAR): Instruction method (restricted to: `Online`, `Offline`, `Hybrid`).
* `created_by` (UUID, Foreign Key): Identifies the Administrator who built the program.

#### Syllabus Table (`syllabus`)
Breaks courses down into sequentially structured topics.
* `id` (UUID, Primary Key): Step identifier key.
* `course_id` (UUID, Foreign Key): Maps back to the parent course structure.
* `topic_name` (VARCHAR): Title of the topic block.
* `description` (TEXT): Concepts and milestones included in the topic.
* `sequence_order` (INTEGER): Order index for structured learning delivery.

#### Batches Table (`batches`)
Tracks active instructional cohorts mapped to specific calendar runtimes.
* `id` (UUID, Primary Key): Cohort identifier key.
* `course_id` (UUID, Foreign Key): Links back to the structural target course.
* `trainer_id` (UUID, Foreign Key): Assigned educator managing group operations.
* `batch_name` (VARCHAR): Alphanumeric identification string (e.g., `MERN-2026-B1`).
* `start_date` (DATE): Formal cohort activation date.
* `end_date` (DATE): Expected completion milestone target.
* `capacity` (INTEGER): Maximum student registration threshold limit.
* `schedule_time` (VARCHAR): Alphanumeric tracking indicator for active timing groups (e.g., `09:00 AM - 11:00 AM`).

#### Enrollments Table (`enrollments`)
Tracks cohort matching links over time.
* `id` (UUID, Primary Key): Assignment link row key.
* `student_id` (UUID, Foreign Key): Associated student profile.
* `batch_id` (UUID, Foreign Key): Associated target batch.
* `enrollment_date` (DATE): Action logging date.
* `status` (VARCHAR): Registration state (e.g., `ACTIVE`, `COMPLETED`, `DROPPED`).

#### Attendance Table (`attendance`)
Tracks programmatic participation data points.
* `id` (UUID, Primary Key): Assessment row key.
* `student_id` (UUID, Foreign Key): Target student.
* `batch_id` (UUID, Foreign Key): Contextual validation cohort.
* `attendance_date` (DATE): Tracking date.
* `status` (VARCHAR): Tracking outcome (restricted to: `PRESENT`, `ABSENT`, `LEAVE`, `LATE`).
* `marked_by` (UUID, Foreign Key): Identity of the trainer locking the record status.

#### Projects Table (`projects`)
Tracks critical practical work targets or industrial tasks.
* `id` (UUID, Primary Key): Operational milestone project asset key.
* `course_id` (UUID, Foreign Key): High-level context path.
* `title` (VARCHAR): Project task name.
* `description` (TEXT): Detailed implementation instructions and parameters.
* `deadline` (DATE): Final submission target cut-off window.
* `assigned_by` (UUID, Foreign Key): Educator managing the project criteria.

#### Project Submissions Table (`project_submissions`)
Tracks trainee file uploads and evaluation feedback loops.
* `id` (UUID, Primary Key): Tracking reference key.
* `project_id` (UUID, Foreign Key): Maps back to the target project block.
* `student_id` (UUID, Foreign Key): Trainee uploader identity.
* `github_link` (TEXT, Optional): Code repository location URL.
* `file_url` (TEXT, Optional): S3 bucket storage path for artifacts (e.g., compilation ZIP files).
* `submitted_at` (TIMESTAMP): Exact network time capture log tracking deadline metrics.
* `marks` (INTEGER, Optional): Assigned performance score value.
* `feedback` (TEXT, Optional): Specific evaluation comments from the trainer.

#### Study Materials Table (`study_materials`)
Tracks static resources attached directly to structured courses.
* `id` (UUID, Primary Key): Material resource asset key.
* `course_id` (UUID, Foreign Key): Parent course route assignment tracking link.
* `title` (VARCHAR): Resource display name.
* `file_url` (TEXT): Storage asset download path.
* `material_type` (VARCHAR): Catalog flag indicator (e.g., `PDF`, `VIDEO`, `PPT`, `NOTES`).
* `uploaded_by` (UUID, Foreign Key): Identity of the authoring trainer.

#### Fees Table (`fees`)
Maintains accounting overview records for individual trainees.
* `id` (UUID, Primary Key): Account ledger reference key.
* `student_id` (UUID, Foreign Key): Trainee target record link.
* `total_amount` (DECIMAL): Formal balance due for catalog enrollment onboarding.
* `paid_amount` (DECIMAL): Aggregated sum of processing transactions captured.
* `due_amount` (DECIMAL): Active trailing liability balance (`total_amount` - `paid_amount`).
* `payment_status` (VARCHAR): General state (restricted to: `PAID`, `PARTIAL`, `PENDING`, `OVERDUE`).

#### Payments Table (`payments`)
Tracks individual financial ledger entries.
* `id` (UUID, Primary Key): Core receipt row reference key.
* `fee_id` (UUID, Foreign Key): Parent billing target link.
* `amount` (DECIMAL): Disbursed funds value.
* `payment_date` (DATE): Day the system logged the transaction.
* `payment_method` (VARCHAR): Processing mechanism used (e.g., `UPI`, `CARD`, `CASH`, `NET_BANKING`).
* `transaction_id` (VARCHAR): Gateway reference confirmation hash.

#### Certificates Table (`certificates`)
Tracks official completion verifications.
* `id` (UUID, Primary Key): Verification row reference key.
* `student_id` (UUID, Foreign Key): Graduate profile target record link.
* `certificate_no` (VARCHAR, Unique): Verifiable serial tracking sequence.
* `issue_date` (DATE): Formal administrative validation approval date.
* `certificate_url` (TEXT): Public secure hosting path to the generated PDF asset.""")

markdown_sections.append("""## 4. User Role Matrix & Functional Requirements

The system enforces strict structural isolation boundaries. Users interact with data models exclusively through their verified role token profiles.

### 4.1 System Permissions Matrix

| Module | Super Admin | Trainer / Teacher | Student / Intern | HR / Coordinator |
| :--- | :--- | :--- | :--- | :--- |
| **User Access Control** | Full Control (CRUD) | None | Profile Update Only | Profile Update Only |
| **Student Enrollment** | Full Control (CRUD) | View Only | None | Registration/Upload |
| **Course & Syllabus** | Full Control (CRUD) | Upload Material/Syllabus| View Only | View Only |
| **Batch Scheduling** | Full Control (CRUD) | View Assigned Only | View Assigned Only | Schedule Management |
| **Attendance Tracking**| Full Control + Reports| Mark Daily + Bulk | View Personal Stats | View Only |
| **Project Assignment**| View Only | Full Control (Create/Score)| Upload/Submit Code | None |
| **Fees & Billing** | Full Control (Setup/Collect)| None | View Status | Track Installments |
| **Certificates** | Approve & Issue | None | View & Download PDF | None |
| **Reports & Analytics** | Full System Reports | Batch Performance Only | Personal Report Cards| View Registration Stats|

### 4.2 Comprehensive Module Breakdown

#### Module 1: Authentication & Authorization
* **AUTH-1:** Secure user login using email and password credentials.
* **AUTH-2:** Cryptographic signature verification via JWT (Access + Refresh Token flow).
* **AUTH-3:** Role-based dashboard redirection upon authentication.
* **AUTH-4:** Blacklisting of active JWTs in Redis upon user logout.
* **AUTH-5:** Secure password reset via time-restricted OTP or email confirmation tokens.

#### Module 2: Student Onboarding & Profiles
* **STUD-1:** Capture structural metadata (Full Name, Phone, Email, Address, College, Qualification, Emergency Contact).
* **STUD-2:** Auto-generation of structured, deterministic unique identification tracking labels (`student_code`).
* **STUD-3:** Safe processing and indexing of academic or identity validation document attachments to AWS S3.
* **STUD-4:** Administrative matching to target training programs and active cohorts.
* **STUD-5:** Soft deactivation toggles to instantly terminate access for drops or programmatic suspension.

#### Module 3: Course & Syllabus Architecture
* **COURSE-1:** Setup structural target outlines detailing runtime parameters, standard programmatic cost structures, and delivery models.
* **COURSE-2:** Topic-by-topic sequence indexing enabling incremental learning milestones.
* **COURSE-3:** Attachment of resource links (PDF guides, slide decks, video links) to specific syllabus topics.

#### Module 4: Batch Execution Controls
* **BATCH-1:** Create runtime training cohorts with explicit start/end tracking milestones and threshold capacities.
* **BATCH-2:** Assign educators to cohorts based on technology alignment and availability tracking.
* **BATCH-3:** Publish access links or physical classroom codes directly to assigned student dashboard modules.

#### Module 5: Attendance Verification System
* **ATT-1:** Grid interfaces enabling rapid single-click or bulk student attendance tracking.
* **ATT-2:** Automation loops aggregating participation metrics into monthly percentage scores.
* **ATT-3:** Locking of historic records past configured structural date thresholds to preserve data integrity.

#### Module 6: Practical Project Management
* **PROJ-1:** Tools for educators to publish target project parameters, text outlines, and structured delivery deadlines.
* **PROJ-2:** Trainee interfaces supporting secure artifact submissions (e.g., code ZIP uploads, direct GitHub repo URL strings).
* **PROJ-3:** Evaluation interfaces for educators to review code links, input alphanumeric marks, and write directional feedback.

#### Module 7: Accounting Ledger & Programmatic Reminders
* **FEES-1:** Setup multi-tier or installment-based programmatic payment tracking profiles upon enrollment.
* **FEES-2:** Financial receipts and transactional audit logging cross-linking back to specific configuration invoices.
* **FEES-3:** Automated notification dispatch tasks querying trailing due dates to issue payment updates across communication channels.

#### Module 8: Milestone Evaluation & Graduation Verification
* **CERT-1:** Logic validation rules verifying completion metrics (e.g., checking for 100% financial clearance and >=85% attendance) before enabling certification tracks.
* **CERT-2:** Automated PDF compilation engines generating personalized programmatic graduation certificates featuring secure validation serial numbers.""")

markdown_sections.append("""## 5. System User Stories (Agile Framework)

### 5.1 Module 1: Authentication & Security Boundaries
* **US-AUTH-001:** As an Admin, Trainer, or Student, I want to submit my email and password credentials securely so that I can access my designated system dashboard.
* **US-AUTH-002:** As a registered user, I want to request a secure password recovery link via my verified email address so that I can safely regain interface access if I forget my password.
* **US-AUTH-003:** As an application security officer, I want all user requests to be verified via hidden HTTP-only cookie tokens so that our communication is protected against Cross-Site Scripting (XSS) intercept risks.
* **US-AUTH-004:** As an Administrator, I want the system to restrict interface access based on active role permissions so that users can only interact with authorized modules.

### 5.2 Module 2: Dashboard Metrics & Operational Visibility
* **US-DASH-001:** As an Administrator, I want to view active operational totals (Total Students, Active Batches, Unassigned Trainers) at a glance so that I can evaluate day-to-day organizational capacity.
* **US-DASH-002:** As an Administrator, I want to see a live visual line chart tracking revenue collections against trailing aging defaults so that I can evaluate programmatic cash flow health.
* **US-TDASH-001:** As a Trainer, I want to see an organized list of my active daily training blocks and pending project submissions so that I can prioritize my teaching and grading tasks.
* **US-SDASH-001:** As a Student, I want to track my overall attendance percentages, current topic markers, and pending project deadlines via a clean interface card so that I can stay aligned with the course roadmap.

### 5.3 Module 3: Onboarding & Cohort Management
* **US-STUD-001:** As an HR Coordinator, I want to fill out a unified trainee profile form and attach academic validation assets so that a new student profile is securely created in the database.
* **US-STUD-002:** As an Administrator, I want the system to assign an immutable alphanumeric identifier tracking tag to each profile during creation so that tracking records stay accurate across internal data tables.
* **US-BATCH-001:** As an Administrator, I want to group students into an active training cohort and assign a designated trainer so that structural training schedules can proceed efficiently.

### 5.4 Module 4: Educational Workflows & Practical Delivery
* **US-ATT-001:** As a Trainer, I want to access a structured grid list of my active cohort students to mark daily participation metrics (Present, Absent, Late, Leave) so that tracking updates publish directly to student profiles.
* **US-PROJ-001:** As a Trainer, I want to publish a detailed project assignment outlining technical goals and submission deadlines so that all students in the cohort receive immediate dashboard alerts.
* **US-PROJ-002:** As a Student, I want to paste my public GitHub code repository URL directly into a submission form before the deadline expires so that my trainer can evaluate my practical code performance.
* **US-MAT-001:** As a Trainer, I want to upload resource slide decks or documentation files directly to specific syllabus topics so that students can access targeted self-study guides.

### 5.5 Module 5: Administrative Control & Certification
* **US-FEES-001:** As an Administrator, I want to log a student's partial installment payment and immediately print an itemized transaction receipt so that financial ledger logs stay balanced.
* **US-CERT-001:** As an Administrator, I want the system to check a student's completion metrics against graduation rules before unlocking certificate generation so that programmatic quality standards are maintained.
* **US-CERT-002:** As a Student, I want to download a high-resolution PDF version of my graduation certificate directly from my dashboard so that I can showcase my credentials on professional networks.""")

markdown_sections.append("""## 6. Comprehensive Project Development Roadmap

┌───────────────────────────────────────────────────────────────┐
│  Phase 1: Sprint 1-2 (Core MVP Foundation)                    │
│  - Identity Schema Migrations & Auth Pipeline (JWT/Redis)     │
│  - Global Navigation Core Shell Layouts                        │
└───────────────────────────────┬───────────────────────────────┘
│
▼
┌───────────────────────────────────────────────────────────────┐
│  Phase 2: Sprint 3-4 (Core Module Implementation)             │
│  - CRUD Onboarding Pipelines (Students/Trainers/Courses)      │
│  - Cohort Assignment Matrix Logic & Grid UI Controls          │
└───────────────────────────────┬───────────────────────────────┘
│
▼
┌───────────────────────────────────────────────────────────────┐
│  Phase 3: Sprint 5-6 (Operational Integration)                 │
│  - Bulk Attendance Management Tools & S3 Upload Engines       │
│  - Ledger Engines & Automated Communication Triggers          │
└───────────────────────────────┬───────────────────────────────┘
│
▼
┌───────────────────────────────────────────────────────────────┐
│  Phase 4: Sprint 7-8 (Advanced Services & Launch)             │
│  - Analytical Dashboards, Chart Engines & PDF Auto-Compiler   │
│  - End-to-End Security Validation, Load Testing & Cloud Launch│
└───────────────────────────────────────────────────────────────┘

The system implementation is organized into four distinct two-week engineering cycles, building toward an initial production deployment over an 8-to-10 week timeline.

### 6.1 Phase 1: Authentication Engine & System Shell Layouts (Sprint 1 - 2)
* **Database Infrastructure:** Set up PostgreSQL table structures, define primary relations, configure indexes on search vectors, and run baseline schema migrations via the ORM.
* **Security Foundation:** Build the backend authentication router, implement secure hashing via `bcrypt`, write token validation handlers (Access + Refresh Token lifecycles), and configure Redis caching for active session blacklisting.
* **UI System Framework:** Establish the main Next.js App Router workspace, configure global state stores (Zustand or Redux Toolkit), set up Tailwind layout definitions, and build protected route interceptors.

### 6.2 Phase 2: Profiles, Catalog Management & Cohort Mapping (Sprint 3 - 4)
* **Profile Management:** Build operational data access layers and UI entry forms for Student and Trainer registration modules, including secure identification tracking generation tasks.
* **Course Catalog Design:** Build administrative CRUD interfaces to manage course configurations, cost definitions, and topic-by-topic sequence mappings.
* **Cohort Mapping Matrix:** Build the allocation engine enabling managers to map trainers to batches and assign trainee arrays into specific scheduling groups.

### 6.3 Phase 3: Attendance, Submissions & Accounting Ledgers (Sprint 5 - 6)
* **Attendance Tracking:** Build bulk grid evaluation tools enabling educators to quickly record daily participation metrics with automatic real-time summary calculations.
* **Practical Workspace Integrations:** Set up AWS S3 secure upload bridges handling multipart binary file transmissions (ZIP files, documentation PDFs), and build assignment submission status trackers.
* **Financial Accounting Engine:** Implement ledger tracking tables to process incoming installment transactions, generate dynamic billing receipts, and execute background checking logic to trigger automated overdue reminders.

### 6.4 Phase 4: Analytical Dashboards, PDF Auto-Compilation & Deployment (Sprint 7 - 8)
* **Reporting & Analytics Dashboard:** Integrate chart components (e.g., Recharts or Chart.js) to build high-level interactive visual tracking widgets monitoring attendance histories, revenue collections, and performance data.
* **Certification Compiler Engine:** Build automated server-side PDF generation workers that pull graduate details, verify completion requirements, and compile official downloadable graduation credentials.
* **Production Deployment Optimization:** Execute security hardening reviews (CORS headers, rate-limiting rules, SQL-injection checks), set up Docker orchestration layers, configure GitHub Actions pipelines, and launch to camp hosts (AWS or DigitalOcean).""")

# Join sections and write to file safely
full_markdown_text = "\n\n".join(markdown_sections)

file_path = "README.md"
with open(file_path, "w", encoding="utf-8") as f:
    f.write(full_markdown_text)

print("Markdown generated successfully.")