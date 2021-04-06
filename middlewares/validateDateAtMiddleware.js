const validateDateAtMiddleware = (req, res, next) => {
  const { date } = req.body;
  const dateFormat = /^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d$/;

  if (!date.datedAt || date.datedAt === '') {
    return res.status(400)
      .json({ message: 'O campo "date" é obrigatório e "datedAt" e "rate" não podem ser vazios' });
  }

  if (!date.datedAt.match(dateFormat)) {
    return res.status(400).json({ message: 'O campo "datedAt" deve ter o formato "dd/mm/aaaa"' });
  }

  next();
};

module.exports = validateDateAtMiddleware;
