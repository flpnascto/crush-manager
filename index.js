const express = require('express');
const bodyParser = require('body-parser');
const rescue = require('express-rescue');
const fs = require('fs').promises;

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

app.use((err, req, res) => {
  res.status(err.code).send(err.error);
});

app.listen(PORT, () => { console.log('Online'); });
