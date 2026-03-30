# C-Tracker

C-Tracker is a full-stack career tracking project with a React frontend and a Node.js/Express backend.

## Project Structure

- `frontend/` - React + Vite client application
- `backend/` - Express API server

## Tech Stack

- Frontend: React, Vite, React Router
- Backend: Node.js, Express, MongoDB, Mongoose

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

## Environment Variables

Create a `.env` file inside `backend/` for your local secrets and configuration. This repository is configured to keep `.env` files out of Git.

## Security

- `.env` files are ignored
- `node_modules` folders are ignored
- build output folders are ignored
