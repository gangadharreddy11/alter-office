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
git clone <your-repo-url>
cd alter-office
