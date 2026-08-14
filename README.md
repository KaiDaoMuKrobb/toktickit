# TokTickIT 

TokTickIT is an IT service desk application designed to handle requests for Account and Access, Hardware, Software, and Network support. The application provides an integrated, role-based ticketing system where Requesters, IT Staff, and Administrators can seamlessly manage and track support requests.

This project is built using a modern full-stack architecture:
- **Frontend:** React, Vite, TypeScript, and Bootstrap for a responsive and fast user interface.
- **Backend:** Node.js, Express, and TypeScript providing robust RESTful APIs.
- **Database & ORM:** PostgreSQL managed via Prisma for type-safe database queries and migrations.

---

## 📋 Prerequisites
Ensure you have the following installed on your machine before setting up the project:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for running the PostgreSQL database)
- [Git](https://git-scm.com/) (for version control)

---

## 🚀 Setup Instructions

### 1. Clone the Repository
Clone this project to your local machine and navigate into the project root:
```bash
git clone https://github.com/KaiDaoMuKrobb/toktickit.git
cd toktickit
```

### 2. Database Setup (Docker)
We use Docker to run the PostgreSQL database locally without needing complex installations.
Start the database container using the following command:
```bash
docker run --name toktickit-db -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin -e POSTGRES_DB=toktickit -p 5432:5432 -d postgres
```
*(This command starts a PostgreSQL database named `toktickit` running on port 5432 in the background)*

---

### 3. Backend Setup & Configuration
Navigate to the `server` directory and install all required Node.js dependencies:
```bash
cd server
npm install
```

**Environment Variables:**
Copy the example environment file to create your own configuration:
```bash
cp .env.example .env
```
Ensure that the `DATABASE_URL` in your newly created `.env` file matches your Docker PostgreSQL credentials. It should look like this:
`DATABASE_URL="postgresql://admin:admin@localhost:5432/toktickit?schema=public"`

**Database Migration & Seeding:**
Run Prisma to create the necessary tables and seed the database with the initial IT request categories (Account and Access, Hardware, Software, Network):
```bash
npx prisma migrate dev
npm run seed
```

**Start the Backend Server:**
Run the application in development mode (API runs on `http://localhost:3000`):
```bash
npm run dev
```

---

### 4. Frontend Setup & Configuration
Open a **new terminal window**, navigate to the `client` directory, and install dependencies:
```bash
cd client
npm install
```

**Environment Variables:**
Create the `.env` file to point to the local backend API:
```bash
cp .env.example .env
```
Ensure the API URL in `.env` is set correctly: `VITE_API_URL=http://localhost:3000`

**Start the Frontend Server:**
Run the React application (usually runs on `http://localhost:5173` or `5174`):
```bash
npm run dev
```

---

## 🧪 Testing
The application uses **Supertest** for backend API testing and **Vitest** for frontend React component testing.

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

## 📁 Project Structure
- `/client` - React frontend application using Vite.
- `/server` - Node.js and Express backend application.
- `/server/prisma` - Database schema definitions, migrations, and seed scripts.
- `/docs` - Laboratory documentation, AI use reflections, and peer review logs.