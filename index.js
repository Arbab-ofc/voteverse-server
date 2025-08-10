import express from 'express';
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




dotenv.config();
const app = express();


app.use(
  cors({
    origin: "http://localhost:5173",  
    credentials: true                 
  })
);
app.use(express.json());
app.use(cookieParser());


app.get('/', (req, res) => {
  res.send('VoteVerse API is running...');
});
app.use('/api/users', UserRouter);
app.use('/api/elections', ElectionRouter);
app.use('/api/votes', VoteRouter);
app.use('/api/candidates', CandidateRouter);
app.use('/api/voter-logs', VoterLogRouter);
app.use('/api/contact', ContactRouter);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
  connectDB();
});
