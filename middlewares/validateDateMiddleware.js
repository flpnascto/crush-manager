const validateDateMiddleware = (req, res, next) => {
  const { date } = req.body;

  if (!date) {
    return res.status(400)
      .json({ message: 'O campo "date" é obrigatório e "datedAt" e "rate" não podem ser vazios' });
  }

  next();
};

module.exports = validateDateMiddleware;
