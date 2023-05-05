const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/api/hello', (req, res) => {
  res.send({ message: 'Hello World' });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
