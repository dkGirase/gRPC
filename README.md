# gRPC Microservices Demo 🚀

A complete microservices-based application using **gRPC**, **Node.js**, **Prisma**, **PostgreSQL**, an **Express API Gateway**, and a **React frontend**.

This project demonstrates communication between multiple services using gRPC and exposes a REST API gateway for frontend interaction.

---

## 📂 Project Structure

grpc-micro-demo/
│
├── frontend/ # React UI (Vite + React)
├── gateway/ # Express API Gateway
├── post-service/ # Post microservice (gRPC + Prisma)
└── user-service/ # User microservice (gRPC + Prisma)

## ⚙️ Technology Stack

### Backend
- Node.js (ES Modules)
- gRPC (@grpc/grpc-js)
- Prisma ORM
- PostgreSQL
- Express.js (API Gateway)

### Frontend
- React (Vite)
- Fetch API
- Lucide Icons

---

## 🔁 Architecture Overview

Frontend (React)
|
↓ HTTP REST
Gateway (Express)
|
↓ gRPC
┌───────────────┐ ┌───────────────┐
│ User Service │ │ Post Service │
│ (Port 50051) │ │ (Port 50052) │
└───────────────┘ └───────────────┘
|
↓
PostgreSQL

## ✅ Features

### 👤 User Service
- Create user
- Get user by ID
- Update user
- Delete user
- List all users

### 📝 Post Service
- Create post
- Get post by ID
- Update post
- Delete post
- List all posts

### 🌐 API Gateway
- Converts REST calls into gRPC calls
- Routes requests to correct service

### 🖥 Frontend
- Create / update users
- Create / update posts
- View lists dynamically
- UI built using React & CSS animations

---

## ▶ How to Run the Project (Local Setup)

### 1️⃣ Install dependencies

Run inside each folder:

```bash
cd frontend && npm install
cd ../gateway && npm install
cd ../post-service && npm install
cd ../user-service && npm install
2️⃣ Setup Database (PostgreSQL)
Make sure PostgreSQL is running.

Create .env files inside:

post-service

user-service

Example .env:

env

DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
Run migrations:

npm run prisma:migrate
3️⃣ Start Services (Order is important)
Start User Service
cd user-service
npm run dev

Start Post Service
cd post-service
npm run dev

Start Gateway
cd gateway
npm run dev

Start Frontend
cd frontend
npm run dev

4️⃣ Access Application
Frontend runs at:
http://localhost:5173
API Gateway runs at:

http://localhost:4000
🧪 API Endpoints (Gateway)
User APIs

GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
Post APIs

GET    /api/posts
GET    /api/posts/:id
POST   /api/posts
PUT    /api/posts/:id
DELETE /api/posts/:id

📦 gRPC Ports
Service	Port
User Service	50051
Post Service	50052
Gateway	4000
Frontend	5173

🧰 Development Mode (Optional)
Start with auto reload:

bash
Copy code
npm run dev
Available for:

gateway

user-service

post-service

📝 Future Improvements
Authentication & JWT

Pagination

Docker Compose

gRPC TLS

Validation middleware

CI/CD Pipeline

Unit Testing

👨‍💻 Author
Dnyanendra Girase


---

