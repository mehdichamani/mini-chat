require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || '100') * 1024 * 1024;

// ─── Uploads Directory ────────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ─── In-Memory Store ──────────────────────────────────────────────────────────
// rooms[code] = { code, password, guestName, messages[], createdAt, active, guestSocketId, adminSocketId }
const rooms = {};
// adminSockets = Set of socket ids that are admin
const adminSockets = new Set();

// ─── Multer Config ────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uuidv4().slice(0, 8)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE }
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

// ─── Helper: generate short invite code ──────────────────────────────────────
function generateCode() {
  // ۶ رقم تصادفی (۱۰۰۰۰۰ تا ۹۹۹۹۹۹)
  return String(Math.floor(Math.random() * 900000) + 100000);
}
function generatePassword() {
  // رمز ۶ رقمی تصادفی
  return String(Math.floor(Math.random() * 900000) + 100000);
}

// ─── REST API ─────────────────────────────────────────────────────────────────

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true, token: 'admin-session' });
  }
  res.status(401).json({ success: false, message: 'رمز عبور اشتباه است' });
});

// Create new room (admin only)
app.post('/api/admin/create-room', (req, res) => {
  const { auth, password, guestName } = req.body;
  if (auth !== ADMIN_PASSWORD) return res.status(401).json({ success: false, message: 'دسترسی رد شد' });

  let code;
  do { code = generateCode(); } while (rooms[code]);

  const roomPassword = password || generatePassword();
  rooms[code] = {
    code,
    password: roomPassword,
    guestName: guestName || 'مهمان',
    messages: [],
    createdAt: new Date(),
    active: false,
    guestSocketId: null,
    adminSocketId: null
  };

  res.json({ success: true, code, password: roomPassword });
});

// Get all rooms (admin only)
app.get('/api/admin/rooms', (req, res) => {
  const auth = req.headers['x-admin-auth'];
  if (auth !== ADMIN_PASSWORD) return res.status(401).json({ success: false });

  const list = Object.values(rooms).map(r => ({
    code: r.code,
    guestName: r.guestName,
    active: r.active,
    createdAt: r.createdAt,
    messageCount: r.messages.length,
    lastMessage: r.messages[r.messages.length - 1] || null
  }));
  res.json({ success: true, rooms: list });
});

// Delete / close room
app.delete('/api/admin/room/:code', (req, res) => {
  const auth = req.headers['x-admin-auth'];
  if (auth !== ADMIN_PASSWORD) return res.status(401).json({ success: false });
  const { code } = req.params;
  if (!rooms[code]) return res.status(404).json({ success: false, message: 'اتاق یافت نشد' });

  // Notify guest
  if (rooms[code].guestSocketId) {
    io.to(rooms[code].guestSocketId).emit('room:closed', { message: 'این گفتگو توسط ادمین بسته شد.' });
  }
  delete rooms[code];
  res.json({ success: true });
});

// Get room messages (admin)
app.get('/api/admin/room/:code/messages', (req, res) => {
  const auth = req.headers['x-admin-auth'];
  if (auth !== ADMIN_PASSWORD) return res.status(401).json({ success: false });
  const room = rooms[req.params.code];
  if (!room) return res.status(404).json({ success: false });
  res.json({ success: true, messages: room.messages, guestName: room.guestName });
});

// Guest join
app.post('/api/guest/join', (req, res) => {
  const { code, password } = req.body;
  const room = rooms[code];
  if (!room) return res.status(404).json({ success: false, message: 'کد دعوت نامعتبر است' });
  if (room.password !== password) return res.status(401).json({ success: false, message: 'رمز عبور اشتباه است' });

  res.json({ success: true, guestName: room.guestName, code });
});

// File upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'فایلی آپلود نشد' });

  const fileUrl = `/uploads/${req.file.filename}`;
  const isImage = req.file.mimetype.startsWith('image/');
  const isVideo = req.file.mimetype.startsWith('video/');
  const isAudio = req.file.mimetype.startsWith('audio/');

  let fileType = 'file';
  if (isImage) fileType = 'image';
  else if (isVideo) fileType = 'video';
  else if (isAudio) fileType = 'audio';

  res.json({
    success: true,
    url: fileUrl,
    name: req.file.originalname,
    size: req.file.size,
    type: fileType,
    mimetype: req.file.mimetype
  });
});

// Upload error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: `حداکثر سایز فایل ${process.env.MAX_FILE_SIZE_MB || 10} مگابایت است` });
    }
  }
  if (err) return res.status(400).json({ success: false, message: err.message });
  next();
});

// SPA fallback pages
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/chat', (req, res) => res.sendFile(path.join(__dirname, 'public', 'chat.html')));

// ─── Socket.io ────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  // ── Admin join ──
  socket.on('admin:join', ({ auth }) => {
    if (auth !== ADMIN_PASSWORD) {
      socket.emit('error:auth', { message: 'دسترسی رد شد' });
      return;
    }
    adminSockets.add(socket.id);
    socket.join('admin-room');

    // Send current rooms state
    const roomList = Object.values(rooms).map(r => ({
      code: r.code,
      guestName: r.guestName,
      active: r.active,
      createdAt: r.createdAt,
      messageCount: r.messages.length,
      lastMessage: r.messages[r.messages.length - 1] || null
    }));
    socket.emit('admin:rooms', roomList);
  });

  // ── Guest join ──
  socket.on('guest:join', ({ code, password }) => {
    const room = rooms[code];
    if (!room || room.password !== password) {
      socket.emit('error:auth', { message: 'کد یا رمز نامعتبر' });
      return;
    }
    room.guestSocketId = socket.id;
    room.active = true;
    socket.join(`room:${code}`);

    // Send history to guest
    socket.emit('guest:joined', { guestName: room.guestName, messages: room.messages });

    // Notify admin
    io.to('admin-room').emit('room:active', {
      code,
      guestName: room.guestName,
      active: true
    });
  });

  // ── Admin open room ──
  socket.on('admin:open-room', ({ auth, code }) => {
    if (auth !== ADMIN_PASSWORD) return;
    const room = rooms[code];
    if (!room) return;
    room.adminSocketId = socket.id;
    socket.join(`room:${code}`);
    socket.emit('admin:room-history', { code, guestName: room.guestName, messages: room.messages });
  });

  // ── Send message ──
  socket.on('message:send', ({ code, text, file, sender }) => {
    const room = rooms[code];
    if (!room) return;

    // Validate sender
    const isAdmin = sender === 'admin' && adminSockets.has(socket.id);
    const isGuest = sender === 'guest' && room.guestSocketId === socket.id;
    if (!isAdmin && !isGuest) return;

    const msg = {
      id: uuidv4(),
      sender,
      text: text || null,
      file: file || null,
      timestamp: new Date().toISOString()
    };
    room.messages.push(msg);

    // Broadcast to everyone in the room
    io.to(`room:${code}`).emit('message:new', { code, message: msg });

    // Update admin sidebar last message
    io.to('admin-room').emit('room:updated', {
      code,
      lastMessage: msg,
      messageCount: room.messages.length
    });
  });

  // ── Typing indicator ──
  socket.on('typing', ({ code, sender, isTyping }) => {
    socket.to(`room:${code}`).emit('typing', { code, sender, isTyping });
  });

  // ── Disconnect ──
  socket.on('disconnect', () => {
    adminSockets.delete(socket.id);

    // Check if any guest disconnected
    for (const code in rooms) {
      const room = rooms[code];
      if (room.guestSocketId === socket.id) {
        room.guestSocketId = null;
        room.active = false;
        io.to('admin-room').emit('room:active', { code, guestName: room.guestName, active: false });
        break;
      }
    }
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\n🚀 Mini Chat Server running at http://localhost:${PORT}`);
  console.log(`   Admin panel: http://localhost:${PORT}/admin`);
  console.log(`   Admin password: ${ADMIN_PASSWORD}\n`);
});
