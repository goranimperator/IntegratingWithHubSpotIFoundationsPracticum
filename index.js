require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();

app.set('view engine', 'pug');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const OBJECT_TYPE = process.env.CUSTOM_OBJECT_TYPE;
const PROPERTIES = ['name', 'bio', 'game'];

const hubspot = axios.create({
  baseURL: 'https://api.hubapi.com',
  headers: {
    Authorization: `Bearer ${process.env.PRIVATE_APP_ACCESS}`,
    'Content-Type': 'application/json'
  }
});

app.get('/', async (req, res) => {
  try {
    const records = [];
    let after;
    do {
      const response = await hubspot.get(`/crm/v3/objects/${OBJECT_TYPE}`, {
        params: { limit: 100, properties: PROPERTIES.join(','), after }
      });
      records.push(...response.data.results);
      after = response.data.paging?.next?.after;
    } while (after);
    res.render('homepage', { title: 'Custom Objects | HubSpot Integration', records });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Could not fetch records');
  }
});

app.get('/update-cobj', (req, res) => {
  res.render('updates', { title: 'Update Custom Object Form | HubSpot Integration' });
});

app.post('/update-cobj', async (req, res) => {
  const { name, bio, game } = req.body;
  try {
    await hubspot.post(`/crm/v3/objects/${OBJECT_TYPE}`, {
      properties: { name, bio, game, goran: name }
    });
    res.redirect('/');
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Could not create record');
  }
});

app.listen(3000, () => console.log('Listening on http://localhost:3000'));
