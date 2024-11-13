const verifyToken = (req, res, next) => {
    console.log('Session token:', req.session.token); // Debug log
  
    const token = req.session.token;
    if (!token) {
      return res.status(401).json("You are not authenticated!");
    }
  
    jwt.verify(token, process.env.SECRET, (err, data) => {
      if (err) {
        return res.status(403).json("Token is not valid!");
      }
      req.userId = data._id;
      next();
    });
  };
  