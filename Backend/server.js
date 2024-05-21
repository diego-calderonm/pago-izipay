require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3003;

app.use(bodyParser.json());
app.use(cors());

const API_USER = '44749292';
const API_PASSWORD = 'testpassword_vMgD0pZKovkO1Ou7fxitH90WAM11x2O0vi8AwodRA8xwF';

app.post('/api/createPayment', (req, res) => {
  const { amount, currency, customer, orderId } = req.body;

  const headers = {
    'Authorization': `Basic ${Buffer.from(`${API_USER}:${API_PASSWORD}`).toString('base64')}`,
    'Content-Type': 'application/json'
  };

  axios.post('https://api.micuentaweb.pe/api-payment/V4/Charge/CreatePayment', {
    amount,
    currency,
    customer,
    orderId,
  }, { headers })
  .then(response => {
    console.log('API response:', response.data);
    const formToken = response.data.answer?.formToken;
    if (!formToken) {
      throw new Error('Form Token no encontrado en la respuesta de la API');
    }
    res.json({ formToken });
  })
  .catch(error => {
    console.error("Error al obtener el formToken:", error.response ? error.response.data : error.message);
    res.status(500).send("Error al obtener el formToken");
  });
});

app.post('/validatePayment', (req, res) => {
  const answer = req.body;
  const hash = req.body.hash;
  const answerHash = require('crypto-js/hmac-sha256')(JSON.stringify(answer), 'Gq3snkXEnxABXNKrnqRFqWU17AERYJgU8hSGTvoWnJHlh').toString();

  if (hash === answerHash) {
    res.status(200).send('Valid Payment');
  } else {
    res.status(500).send('Payment hash mismatch');
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

