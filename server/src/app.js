import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './api/v1/authRoutes.js';
import examRoutes from './api/v1/examRoutes.js';
import submissionRoutes from './api/v1/submissionRoutes.js';
import Submission from './models/Submission.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

connectDB();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/exams', examRoutes);
app.use('/api/v1/submissions', submissionRoutes);

app.get('/', (req, res) => res.send('API is running...'));

io.on('connection', (socket) => {
  console.log('Socket.IO: A user connected:', socket.id);

  socket.on('join-exam-room', ({ submissionId }) => {
    socket.join(submissionId);
    console.log(`Socket ${socket.id} joined room for submission ${submissionId}`);
  });

  socket.on('proctoring-violation', async ({ submissionId, type }) => {
    try {
      const violation = {
        type: type,
        timestamp: new Date(),
        severity: 'medium',
      };
      
      await Submission.findByIdAndUpdate(
        submissionId,
        { $push: { proctoringViolations: violation } }
      );
      
      io.to(submissionId).emit('violation-detected', violation);
      console.log(`Violation logged for submission ${submissionId}: ${type}`);
    } catch (error) {
      console.error("Error logging violation:", error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket.IO: User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));