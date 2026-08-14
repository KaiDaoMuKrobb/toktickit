# TokTickIT 🚀

Welcome to **TokTickIT**, a comprehensive IT service desk application designed to streamline requests for Account and Access, Hardware, Software, and Network support. The platform provides an integrated, role-based ticketing system where Requesters, IT Staff, and Administrators can seamlessly manage, track, and resolve support tickets.

---

## 🛠 Technology Stack

This project is built from the ground up using a modern, scalable full-stack architecture:

### Frontend
- **React 18** - UI Library for building component-driven interfaces.
- **Vite** - Lightning-fast frontend tooling and bundler.
- **TypeScript** - Strongly typed programming language.
- **Bootstrap 5** - CSS framework for responsive layout and styling.

### Backend
- **Node.js & Express** - Fast, unopinionated web framework for Node.js.
- **TypeScript** - For type-safe backend RESTful APIs.

### Database & ORM
- **PostgreSQL** - Powerful, open-source object-relational database.
- **Prisma ORM** - Next-generation Node.js and TypeScript ORM for safe database queries and migrations.

---

## 📋 Prerequisites

Ensure you have the following installed on your machine before setting up the project:
1. [Node.js](https://nodejs.org/) (v18 or higher recommended)
2. [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Required for running the PostgreSQL database locally)
3. [Git](https://git-scm.com/) (For version control)

---

## 🚀 Complete Setup Instructions

Follow these steps exactly to get the application running on your local machine.

### 1. Clone the Repository
Clone this project to your local machine and navigate into the project root:
```bash
git clone https://github.com/KaiDaoMuKrobb/toktickit.git
cd toktickit
```

### 2. Database Initialization (Docker)
We use Docker to run the PostgreSQL database locally. This prevents you from having to manually install and configure a local SQL server.
Start the database container using the following command:
```bash
docker run --name toktickit-db -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin -e POSTGRES_DB=toktickit -p 5432:5432 -d postgres
```
*(Note: Keep Docker Desktop running in the background. The database is now accessible on `localhost:5432`)*

---

### 3. Backend Setup & Configuration
Navigate to the `server` directory and install all required Node.js dependencies:
```bash
cd server
npm install
```

**Environment Variables:**
You must configure the environment variables so the server knows how to connect to the database.
```bash
cp .env.example .env
```
Open the newly created `server/.env` file and ensure the `DATABASE_URL` matches your Docker PostgreSQL credentials:
```env
DATABASE_URL="postgresql://admin:admin@localhost:5432/toktickit?schema=public"
```

**Database Migration & Seeding:**
Run Prisma migrations to create the necessary tables in your database, and then run the seed script to populate the initial IT request categories:
```bash
npx prisma migrate dev --name init
npm run seed
```

**Start the Backend Server:**
Run the application in development mode:
```bash
npm run dev
```
*The API is now running at `http://localhost:3000`*

---

### 4. Frontend Setup & Configuration
Open a **new terminal window**, navigate to the `client` directory, and install dependencies:
```bash
cd client
npm install
```

**Environment Variables:**
Create the `.env` file to point the React app to your local backend API:
```bash
cp .env.example .env
```
Ensure the API URL inside `client/.env` is set correctly:
```env
VITE_API_URL=http://localhost:3000
```

**Start the Frontend Server:**
Start the Vite development server:
```bash
npm run dev
```
*The React application is now running at `http://localhost:5173` (or `5174` depending on port availability). Click the link in the terminal to view the app in your browser.*

---

## 📖 Available API Endpoints

The backend currently exposes the following RESTful endpoints:

### `GET /api/health`
- **Description:** Checks if the backend server is running and responsive.
- **Response (200 OK):**
  ```json
  {
    "status": "ok",
    "service": "TokTickIT API"
  }
  ```

### `GET /api/categories`
- **Description:** Retrieves the list of seeded IT request categories from the PostgreSQL database, ordered by ID.
- **Response (200 OK):**
  ```json
  [
    { "id": 1, "name": "Account and Access" },
    { "id": 2, "name": "Hardware" },
    { "id": 3, "name": "Software" },
    { "id": 4, "name": "Network" }
  ]
  ```

---

## 🗄️ Database Management (Prisma Studio)
You can visually interact with the PostgreSQL database using Prisma Studio.
Open a terminal in the `server` directory and run:
```bash
npx prisma studio
```
This will open a web interface at `http://localhost:5555` where you can view, add, or edit data in your database tables.

---

## 🧪 Testing

The application is fully covered by automated tests to ensure reliability. We use **Supertest** for backend integration testing and **Vitest** for frontend React component behavior testing.

**Run Backend Tests:**
```bash
cd server
npm run test
```

**Run Frontend Tests:**
```bash
cd client
npm run test
```

---

## 📁 Project Directory Structure
```text
toktickit/
├── client/                 # React frontend application (Vite + TypeScript)
│   ├── src/                # React components and API integration
│   └── tests/              # Frontend unit tests (Vitest)
├── server/                 # Node.js + Express backend application
│   ├── prisma/             # Database schema, migrations, and seed scripts
│   ├── src/                # Express controllers and routes
│   └── tests/              # Backend integration tests (Supertest)
├── docs/                   # Laboratory documentation and PDF exports
│   └── lab-01/             # AI use reflections, peer review logs, and test evidence
├── .gitignore              # Ignored files (node_modules, .env, dist, etc.)
└── README.md               # You are here!
```

---
*Developed for CPE 334: Introduction to Software Engineering in the Age of AI Agents.*