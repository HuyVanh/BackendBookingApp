// middleware/authorize.js
module.exports = (requiredRole) => {
    return (req, res, next) => {
      const user = req.user; 
  
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      if (user.role !== requiredRole) {
        return res.status(403).json({ message: 'Forbidden: You do not have the required permissions' });
      }
  
      next();
    };
  };
  