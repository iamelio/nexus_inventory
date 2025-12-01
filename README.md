# Nexus Inventory Management System (NIMS)

A modern, full-stack inventory management system built for SMEs.

## Features

- **Authentication**: Role-based access control (Admin/Staff)
- **Inventory Management**: Full CRUD operations for products
- **Sales Processing**: Transaction recording with stock validation
- **Dashboard**: Real-time low-stock alerts and sales reporting
- **Premium UI**: Modern glassmorphism design with Tailwind CSS

## Tech Stack

### Backend

- Node.js + Express
- SQLite (file-based database)
- bcrypt for password hashing

### Frontend

- React + Vite
- Tailwind CSS v4
- Axios for API calls
- React Router for navigation

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone git@github.com:iamelio/nexus_inventory.git
   cd nexus_inventory
   ```

2. **Backend Setup**

   ```bash
   cd server
   npm install
   node server.js
   ```

   The server will run on `http://localhost:5001`

3. **Frontend Setup**
   ```bash
   cd client
   npm install
   cp .env.example .env
   npm run dev
   ```
   The app will run on `http://localhost:5173`

### Environment Variables

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5001
```

For production, update this to your backend URL.

## Default Credentials

- **Admin**: `admin` / `admin123`
- **Staff**: `staff` / `staff123`

Or create a new account via the Sign Up page.

## Project Structure

```
nexus/
├── client/              # React frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── config.js    # API URL configuration
│   │   ├── Login.jsx
│   │   ├── SignUp.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Inventory.jsx
│   │   └── Sales.jsx
│   └── ...
└── server/              # Node.js backend
    ├── server.js        # Express app & routes
    ├── database.js      # SQLite setup
    └── ...
```

## API Endpoints

- `POST /api/login` - User authentication
- `POST /api/register` - User registration
- `GET /api/products` - List all products
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `POST /api/sales` - Record sale (Staff)
- `GET /api/dashboard/low-stock` - Get low-stock items
- `GET /api/dashboard/stats` - Get dashboard statistics

## Deployment

### Deploying to Render (or similar platforms)

**Backend:**

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node

**Frontend:**

1. Create a new Static Site on Render
2. Set the following:
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
3. Add environment variable:
   - `VITE_API_URL` = Your backend URL (e.g., `https://your-backend.onrender.com`)

**Important Notes:**

- SQLite native modules are rebuilt during deployment via the build script
- Make sure `.env` files are excluded from git (already configured in `.gitignore`)
- Database file (`nexus.db`) will be created automatically on first run

## License

MIT
