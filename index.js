import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/dbConnector.js';
import cookieParser from 'cookie-parser';
import UserRouter from './routes/userRoutes.js'
import ElectionRouter from './routes/electionRoutes.js';
import VoteRouter from './routes/voteRoutes.js';
import CandidateRouter from './routes/candidateRoutes.js';
import VoterLogRouter from './routes/voterLogRoutes.js';
import ContactRouter from './routes/contactRoutes.js';
import AdminRouter from './routes/adminRoutes.js';
import { initLogger } from './utils/logger.js';
import { initSocket } from './socket.js';


dotenv.config();
initLogger();
const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://voteverse-client.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173"
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.send('VoteVerse API is running...');
});
app.use('/api/v2/users', UserRouter);
app.use('/api/v2/elections', ElectionRouter);
app.use('/api/v2/votes', VoteRouter);
app.use('/api/v2/candidates', CandidateRouter);
app.use('/api/v2/voter-logs', VoterLogRouter);
app.use('/api/v2/contact', ContactRouter);
app.use('/api/v2/admin', AdminRouter);



const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);
const io = initSocket(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

io.on("connection", (socket) => {
  socket.on("join-election", (electionId) => {
    if (electionId) {
      socket.join(`election:${electionId}`);
    }
  });
});

const server = async()=>{
  try{
    await connectDB();
    httpServer.listen(PORT, () => {
      console.log(`server is running at port ${PORT}`);
    });
  }
  catch(error){
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
}
server();
