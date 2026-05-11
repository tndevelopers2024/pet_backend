require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/pets', require('./modules/pets/pets.routes'));
app.use('/api/boarding', require('./modules/boarding/boarding.routes'));
app.use('/api/grooming', require('./modules/grooming/grooming.routes'));
app.use('/api/packages', require('./modules/packages/packages.routes'));
app.use('/api/slots', require('./modules/slots/slots.routes'));
app.use('/api/admin', require('./modules/admin/admin.routes'));
app.use('/api/notifications', require('./modules/notifications/notifications.routes'));

app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
if (require.main === module) {
  const { connectDB } = require('./db/connection');
  connectDB().then(() => app.listen(PORT, () => console.log(`API running on port ${PORT}`)));
}

module.exports = app;
