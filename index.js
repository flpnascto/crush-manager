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
const DATAFILE = './crush.json';

const SUCCESS = 200;
const PORT = '3000';

const apiData = async () => {
  const readData = await fs.readFile(DATAFILE)
    .then((data) => JSON.parse(data))
    .catch((error) => {
      throw new Error({ error, code: 404 });
    });

  return readData;
};

function notNullOrEmpty(value) {
  if (value === undefined || value === '') return true;
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

app.get('/crush/search', tokenMiddleware, rescue(async (req, res) => {
  const { q } = req.query;
  const artists = await apiData();

  if (q === undefined || q === '') {
    return res.status(200).json(artists);
  }
  const searchArtist = artists.filter((e) => (e.name).includes(q));

  res.status(200).json(searchArtist);
}));

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

      await fs.writeFile(DATAFILE, JSON.stringify(artists));

      res.status(201).json(newArtist);
    }),
  );

app.route('/crush/:id')
  .get(rescue(async (req, res) => {
    const artistId = req.params.id;
    const findAll = await apiData();
    const artist = findAll.find((e) => e.id === parseInt(artistId, 10));

    if (!artist) {
      res.status(404).json({ message: 'Crush não encontrado' });
    }
    res.json(artist);
  }))
  .put(
    tokenMiddleware,
    validateNameMiddleware,
    validateAgeMiddleware,
    validateDateMiddleware,
    validateDateAtMiddleware,
    validateRateMiddleware,
    rescue(async (req, res) => {
      const editArtist = req.body;
      const artistId = parseInt(req.params.id, 10);
      const artists = await apiData();
      const editedArtists = artists.filter((e) => e.id !== artistId);
      editArtist.id = artistId;
      editedArtists.push(editArtist);
      console.log('editedArtists : ', editedArtists);

      await fs.writeFile(DATAFILE, JSON.stringify(editedArtists));

      res.status(200).json(editArtist);
    }),
  )
  .delete(
    tokenMiddleware,
    rescue(async (req, res) => {
      const artistId = parseInt(req.params.id, 10);
      const artists = await apiData();
      if (!artists.some((e) => e.id === artistId)) {
        return res.status(404).json({ message: 'Crush não encontrado' });
      }

      const removeArtists = artists.filter((e) => e.id !== artistId);

      await fs.writeFile(DATAFILE, JSON.stringify(removeArtists));

      res.status(200).json({ message: 'Crush deletado com sucesso' });
    }),
  );

app.use((err, req, res) => {
  res.status(err.code).send(err.error);
});

app.listen(PORT, () => { console.log('Online'); });
