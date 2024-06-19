import app from './app';
require('@dotenvx/dotenvx').config();

const port = process.env.PORT || 8888;
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});