const validateAgeMiddleware = (req, res, next) => {
  const { age } = req.body;
  console.log(age);

  if (!age || age === '') {
    return res.status(400).json({ message: 'O campo "age" é obrigatório' });
  }

  if (parseInt(age, 10) <= 18) {
    return res.status(400).json({ message: 'O crush deve ser maior de idade' });
  }

  next();
};

module.exports = validateAgeMiddleware;