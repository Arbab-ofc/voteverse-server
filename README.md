# VoteVerse Server v2

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Admin-FFCA28?logo=firebase&logoColor=black)

> VoteVerse Server v2 (second version) powers the API, authentication, elections, and real-time voting updates.

## What this API does

- Auth (JWT, cookies) + OTP email verification
- Google sign-in via Firebase Admin
- Election, candidate, vote, and voter log management
- Admin and public routes
- Real-time Socket.IO rooms for elections
- Health check endpoint for uptime monitoring

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- JWT + bcrypt
- Nodemailer
- Firebase Admin

## Getting Started

```bash
npm install
npm run dev
```

## Environment Variables

Create `server/.env`:

```
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
CLIENT_URL=http://localhost:5173
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## API Base

`/api/v2`

## Routes

- `/users`
- `/elections`
- `/candidates`
- `/votes`
- `/voter-logs`
- `/contact`
- `/admin`
- `/public`

## Realtime (Socket.IO)

- Clients can join election rooms: `join-election` with `electionId`
- Broadcast room format: `election:{electionId}`

## Project Structure

```
server/
  config/
  controllers/
  middleware/
  models/
  routes/
  utils/
  index.js
  socket.js
```

## Scripts

```
npm run dev
npm start
```

## Health Check

- `GET /health` returns `{"status":"ok"}`
