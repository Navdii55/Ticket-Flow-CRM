# 🎫 Ticket-Flow-CRM

A full-stack Customer Support Ticketing CRM built with React, FastAPI, and PostgreSQL.

Ticket-Flow-CRM helps support teams create, manage, track, and update customer support tickets through a clean and responsive dashboard.

## 🚀 Live Demo

**Frontend:**  
https://ticket-flow-crm-2.onrender.com

**Backend API:**  
https://ticket-flow-crm.onrender.com

**API Documentation:**  
https://ticket-flow-crm.onrender.com/docs

---

## ✨ Features

- 🎫 Create customer support tickets
- 📋 View all support tickets
- 🔎 Search tickets by Ticket ID, Customer Name, Email, or Subject
- 📊 Dashboard with ticket statistics
- 🔄 Update ticket status
- 📝 Add and view ticket notes
- 📱 Responsive design for desktop and mobile
- 💾 Persistent PostgreSQL database
- 🌐 REST API using FastAPI
- 📖 Interactive Swagger API documentation
- ☁️ Deployed using Render

---

## 🖥️ Dashboard

The CRM dashboard provides an overview of:

- Total Tickets
- Open Tickets
- In Progress Tickets
- Closed Tickets
- Ticket list with customer information
- Ticket status
- Last updated date

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      User / Agent    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    React Frontend    │
                    │   Support Dashboard  │
                    └──────────┬───────────┘
                               │
                         REST API / HTTP
                               │
                               ▼
                    ┌──────────────────────┐
                    │    FastAPI Backend   │
                    │     Python REST API  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ PostgreSQL Database  │
                    │   Persistent Storage │
                    └──────────────────────┘

🛠️ Tech Stack
Frontend
React
TypeScript
CSS
Responsive UI
Backend
Python
FastAPI
Uvicorn
REST API
Database
PostgreSQL
Deployment
Render
GitHub

📁 Project Structure

Ticket-Flow-CRM/
│
├── backend/
│   ├── app/
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
│
└── README.md

🔌 API Endpoints
Tickets
Method	Endpoint	Description
POST	/api/tickets	Create a ticket
GET	/api/tickets	List tickets
GET	/api/tickets/{ticket_id}	Get a ticket
PUT	/api/tickets/{ticket_id}	Update a ticket
Notes
Method	Endpoint	Description
GET	/api/tickets/{ticket_id}/notes	List notes
POST	/api/tickets/{ticket_id}/notes	Create a note
Health
Method	Endpoint	Description
GET	/	API health check

📖 API Documentation

Interactive API documentation is available through FastAPI Swagger UI:

https://ticket-flow-crm.onrender.com/docs

The documentation allows developers to test the available API endpoints directly from the browser.

💾 Database

The application uses PostgreSQL for persistent storage.

Tickets remain available after refreshing the application and after deployment because ticket data is stored in the PostgreSQL database.

⚙️ Environment Variables
Backend
DATABASE_URL=your_postgresql_database_url
Frontend
VITE_API_BASE_URL=your_backend_api_url

Do not commit real database credentials or secrets to GitHub.

🧪 Testing

The application was tested for:

Ticket creation
Ticket persistence
Ticket listing
Ticket status updates
Ticket notes
Dashboard statistics
API connectivity
PostgreSQL persistence
Responsive behavior on mobile devices

☁️ Deployment

The project is deployed using Render.

Backend

The FastAPI backend runs using Uvicorn.

Frontend

The React frontend is deployed as a web service/static site.

Database

PostgreSQL is hosted through Render and connected to the backend using the database connection URL.

🔮 Future Enhancements
🔐 Authentication and role-based access
👥 Multiple support agents
🤖 AI-powered ticket classification
🧠 Automatic priority prediction
💬 AI-generated response suggestions
📧 Email notifications
📈 Advanced support analytics
⏱️ SLA monitoring
🔔 Real-time notifications
📎 File attachments

👨‍💻 Author

Nahush Thale
B.Tech — Artificial Intelligence & Data Science
