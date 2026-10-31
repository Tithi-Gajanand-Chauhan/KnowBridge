# 🌉 KnowBridge Backend

KnowBridge is an AI-powered shared memory platform for software development teams. It stores critical technical decisions, constraints, solutions, and reasoning so teams can retrieve them whenever needed in future sessions.

This is the beginner-friendly Node.js and Express REST API backend for the project.

---

## 📁 Project Structure

```text
knowbridge-backend/
├── config/
│   └── db.js                 # MongoDB Atlas connection setup
├── controllers/
│   └── memoryController.js   # Logic for CRUD operations
├── models/
│   └── Memory.js             # Mongoose schema and model definition
├── routes/
│   └── memoryRoutes.js       # Express routes for /api/memories
├── .env                      # Environment variables (secret credentials)
├── .env.example              # Template for environment variables
├── .gitignore                # Files excluded from git tracking
├── package.json              # Project scripts and dependencies
├── README.md                 # Project documentation
└── server.js                 # Express server entry point
```

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (cloud database)
- **ODM:** Mongoose
- **Configuration:** dotenv (for environment variables)
- **Middleware:** cors (Cross-Origin Resource Sharing)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
1. Make sure you have a `.env` file in the root folder (a `.env.example` file is provided for reference).
2. Open `.env` and configure your credentials:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/knowbridge?retryWrites=true&w=majority
```

> **How to get your MongoDB Atlas connection string:**
> 1. Log in to [MongoDB Atlas](https://www.mongodb.com/atlas).
> 2. Go to **Database** -> Click **Connect** on your cluster.
> 3. Select **Drivers** (Node.js).
> 4. Copy the connection string and replace `<username>` and `<password>` with your database user credentials.
> 5. Ensure your IP address is whitelisted under **Network Access** (you can click **Allow Access from Anywhere** `0.0.0.0/0` during hackathons).

### 3. Start the Server
- **Development mode (with auto-reload on file change):**
  ```bash
  npm run dev
  ```
- **Production mode:**
  ```bash
  npm start
  ```

Once started, the server runs at:
```text
http://localhost:5000
```

---

## 📡 API Endpoints

Base URL: `http://localhost:5000`

### Health Check
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Check if the backend server is running |

### Memories
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/memories` | Add a new memory |
| `GET` | `/api/memories` | Get all memories |
| `GET` | `/api/memories/:id` | Get a specific memory by its MongoDB ID |
| `PUT` | `/api/memories/:id` | Update an existing memory by ID |
| `DELETE` | `/api/memories/:id` | Delete a memory by ID |

---

## 🧪 Sample Requests & Responses

### 1. Create a Memory (`POST /api/memories`)
**Request Body (JSON):**
```json
{
  "content": "We chose PostgreSQL over MongoDB for user auth due to relational ACID transactions.",
  "type": "decision",
  "source": "Architecture Review Meeting",
  "status": "active"
}
```
**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Memory created successfully!",
  "data": {
    "_id": "6724a1b8e1f0a2001e3b8a10",
    "content": "We chose PostgreSQL over MongoDB for user auth due to relational ACID transactions.",
    "type": "decision",
    "source": "Architecture Review Meeting",
    "status": "active",
    "createdAt": "2026-10-31T06:20:00.000Z",
    "updatedAt": "2026-10-31T06:20:00.000Z"
  }
}
```

### 2. Get All Memories (`GET /api/memories`)
**Response (`200 OK`):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "6724a1b8e1f0a2001e3b8a10",
      "content": "We chose PostgreSQL over MongoDB for user auth due to relational ACID transactions.",
      "type": "decision",
      "source": "Architecture Review Meeting",
      "status": "active",
      "createdAt": "2026-10-31T06:20:00.000Z",
      "updatedAt": "2026-10-31T06:20:00.000Z"
    }
  ]
}
```

### 3. Get One Memory by ID (`GET /api/memories/:id`)
**Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "_id": "6724a1b8e1f0a2001e3b8a10",
    "content": "We chose PostgreSQL over MongoDB for user auth due to relational ACID transactions.",
    "type": "decision",
    "source": "Architecture Review Meeting",
    "status": "active",
    "createdAt": "2026-10-31T06:20:00.000Z",
    "updatedAt": "2026-10-31T06:20:00.000Z"
  }
}
```

### 4. Update a Memory (`PUT /api/memories/:id`)
**Request Body (JSON):**
```json
{
  "status": "archived"
}
```
**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Memory updated successfully!",
  "data": {
    "_id": "6724a1b8e1f0a2001e3b8a10",
    "content": "We chose PostgreSQL over MongoDB for user auth due to relational ACID transactions.",
    "type": "decision",
    "source": "Architecture Review Meeting",
    "status": "archived",
    "createdAt": "2026-10-31T06:20:00.000Z",
    "updatedAt": "2026-10-31T06:25:00.000Z"
  }
}
```

### 5. Delete a Memory (`DELETE /api/memories/:id`)
**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Memory deleted successfully!"
}
```
