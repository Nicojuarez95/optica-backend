import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    console.log('No token provided');
    return res.sendStatus(401); // No hay token
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.log('Error verifying token:', err.message);
      return res.sendStatus(403); // Token inválido o expirado
    }

    console.log('Token is valid:', user);
    req.user = user;
    next();
  });
};

export default authenticateToken;
