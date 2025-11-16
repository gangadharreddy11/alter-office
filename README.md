# 📊 Alter Office – Website Analytics Backend (Node.js + PostgreSQL)

## 🚀 Overview
Alter Office is a scalable backend analytics platform designed to collect website and mobile app events such as visits, clicks, device details, referrers, and user metrics.  
This system allows clients to register their apps, generate API keys, submit analytics events, and retrieve aggregated reports.

The backend is fully containerized, optimized for high-traffic ingestion, and deployed on **Render**.

---

## 🛠️ Features Implemented

### 🔐 **API Key Management**
- Register apps and generate API keys  
- Google Authentication for onboarding  
- Retrieve active API keys  
- Revoke or regenerate API keys  
- Header-based API key validation middleware  

### 📩 **Event Data Collection**
- Collect events such as:
  - Clicks  
  - Page visits  
  - Referrer info  
  - Device metadata  
- High-volume ingestion support  
- Data validation & sanitization  

### 📈 **Analytics & Reporting Endpoints**
- Event-summary aggregation  
- User statistics endpoint  
- Device-based and time-based insights  
- Redis caching ready (optional extension)

### 🧪 **Additional Backend Features**
- Fully documented with Swagger  
- Modular folder structure (controllers, routes, services)  
- Includes rate limiting, error handling, and logging  
- PostgreSQL for relational storage  


---

## 🌐 Deployment URLs (Live)

### 🔗 **Google Auth Endpoint**
https://alter-office-qj21.onrender.com/api/auth/google

### 📘 **API Documentation (Swagger UI)**
https://alter-office-qj21.onrender.com/api-docs

Both links are **live** and accessible for testing.

---


## ⚙️ Instructions to Run the Project (Local Setup)

### **1️⃣ Clone the Repository**
```bash
https://github.com/gangadharreddy11/alter-office.git
2️⃣ Install Dependencies
npm install


3️⃣ Ensure PostgreSQL Is Installed
Start PostgreSQL and confirm it with:
psql --version

4️⃣ Create the Database

CREATE DATABASE alteroffice;

5️⃣ Environment Configuration
Create a .env file in the root directory:
PORT=3000

# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=alteroffice

# Google Auth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT Secret
JWT_SECRET=your_jwt_secret
6️⃣ Run Database Migrations
node migrate.js

7️⃣ Start Server Using Nodemon (Development Mode)
nodemon app.js
8️⃣ Or Use NPM Script
npm start
9️⃣ Project Runs On

http://localhost:3000

🧪 API Endpoints (Summary)
Authentication
Method	Endpoint	Description
GET	/api/auth/google	Google OAuth onboarding
API Key Management
Method	Endpoint	Description
POST	/api/auth/register	Register app & generate API key
GET	/api/auth/api-key	Retrieve API key
POST	/api/auth/revoke	Revoke API key
Event Collection
Method	Endpoint	Description
POST	/api/analytics/collect	Submit analytics event
Analytics
Method	Endpoint	Description
GET	/api/analytics/event-summary	Aggregated event summary
GET	/api/analytics/user-stats	User-based analytics
💡 Challenges Faced & Solutions
1. PostgreSQL Not Recognized

Issue: 'psql' is not recognized
Solution: Added PostgreSQL bin folder to the System PATH.

2. Migration Errors

Issue: Database connection failed.
Solution: Corrected DB port (5432) & updated .env configuration.

3. Render Deployment Crashes

Issue: Missing environment variables on Render.
Solution: Added all .env keys manually in Render dashboard.

4. CORS & Header Validation Issues

Issue: API-Key header not detected.
Solution: Added a robust CORS configuration & custom middleware for API key validation.

5. Folder Structure Confusion

Issue: Incorrect module paths caused app crashes.
Solution: Standardized project structure across controllers, services, routes.

🧰 Tech Stack

Node.js

Express.js

PostgreSQL

Sequelize / Knex (based on implementation)

Swagger Documentation

Google OAuth

JWT Authentication

Nodemon

Render Deployment


🙌 Thank You!


