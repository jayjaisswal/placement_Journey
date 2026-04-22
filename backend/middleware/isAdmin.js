const isAdmin = (req, res, next) => {
  const token = req.headers['x-admin-token'];
  if (!process.env.ADMIN_TOKEN) {
    console.warn('WARNING: ADMIN_TOKEN env variable is not set. Using insecure default.');
  }
  const adminToken = process.env.ADMIN_TOKEN || 'admin123';

  if (!token || token !== adminToken) {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  next();
};

module.exports = isAdmin;
