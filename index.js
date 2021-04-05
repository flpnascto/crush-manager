const express = require('express');
const bodyParser = require('body-parser');
const rescue = require('express-rescue');
const fs = require('fs').promises;
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());

const SUCCESS = 200;
const PORT = '3000';

const apiData = async () => {
  const readData = await fs.readFile('./crush.json')
    .then((data) => JSON.parse(data))
    .catch((error) => {
      throw new Error({ error, code: 404 });
    });

  return readData;
};

function notNullOrEmpty(value) {
  if (!value || value === '') return true;
  return false;
}

function validateEmail(email) {
  const mailFormat = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}\b/g;

  if (notNullOrEmpty(email)) {
    throw new Error('O campo "email" é obrigatório');
  }

  if (!email.match(mailFormat)) {
    throw new Error('O "email" deve ter o formato "email@email.com"');
  }
}

function validadePassword(password) {
  if (notNullOrEmpty(password)) {
    throw new Error('O campo "password" é obrigatório');
  }

  if (password.toString().length < 6) {
    throw new Error('A "senha" deve ter pelo menos 6 caracteres');
  }
}

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(SUCCESS).send();
});

app.get('/crush', rescue(async (req, res) => {
  const findAll = await apiData();
  res.json(findAll);
}));

app.get('/crush/:id', rescue(async (req, res) => {
  const artistId = req.params.id;
  const findAll = await apiData();
  const artist = findAll.find((e) => e.id === parseInt(artistId, 10));

  if (!artist) {
    res.status(404).json({ message: 'Crush não encontrado' });
  }
  res.json(artist);
}));

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  try {
    validateEmail(email);
    validadePassword(password);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }

  const token = crypto.randomBytes(8).toString('hex');

  res.json({ token });
});

app.use((err, req, res) => {
  res.status(err.code).send(err.error);
});

app.listen(PORT, () => { console.log('Online'); });
