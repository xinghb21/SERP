const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const searchRouter = require('./routes/search');
const chatRouter = require('./routes/chat');
const trackRouter = require('./routes/track');
const gazeRouter = require('./routes/gaze');
const taskSeqRouter = require('./routes/taskSeq');

app.use('/api/search', searchRouter);
app.use('/api/chat', chatRouter);
app.use('/api/track', trackRouter);
app.use('/api/gaze', gazeRouter);
app.use('/api/task-sequence', taskSeqRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
