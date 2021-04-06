const express = require('express');
const bodyParser = require('body-parser');
const rescue = require('express-rescue');
const fs = require('fs').promises;
const crypto = require('crypto');
const tokenMiddleware = require('./middlewares/tokenMiddleware');
const validateNameMiddleware = require('./middlewares/validateNameMiddleware');
const validateAgeMiddleware = require('./middlewares/validateAgeMiddleware');
const validateDateMiddleware = require('./middlewares/validateDateMiddleware');
const validateDateAtMiddleware = require('./middlewares/validateDateAtMiddleware');
const validateRateMiddleware = require('./middlewares/validateRateMiddleware');

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

app.route('/crush')
  .get(rescue(async (req, res) => {
    const findAll = await apiData();
    res.json(findAll);
  }))
  .post(
    tokenMiddleware,
    validateNameMiddleware,
    validateAgeMiddleware,
    validateDateMiddleware,
    validateDateAtMiddleware,
    validateRateMiddleware,
    rescue(async (req, res) => {
      const newArtist = req.body;
      const artists = await apiData();

      let idValue = 1;
      artists.forEach((e) => {
        if (e.id === idValue) {
          idValue += 1;
        }
      });

      newArtist.id = idValue;

      artists.push(newArtist);

      await fs.writeFile('./crush.json', JSON.stringify(artists));

      res.status(201).json(newArtist);
    }),
  );

app.get('/crush/:id', rescue(async (req, res) => {
  const artistId = req.params.id;
  const findAll = await apiData();
  const artist = findAll.find((e) => e.id === parseInt(artistId, 10));

  if (!artist) {
    res.status(404).json({ message: 'Crush não encontrado' });
  }
  res.json(artist);
}));

app.use((err, req, res) => {
  res.status(err.code).send(err.error);
});

app.listen(PORT, () => { console.log('Online'); });
