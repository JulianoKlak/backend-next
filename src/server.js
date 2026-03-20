require('dotenv').config();

const pool = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);

  pool.query('SELECT 1 AS db_ok')
    .then(([rows]) => {
      console.log('[DB] Conexao com MariaDB OK:', rows[0]);
    })
    .catch((error) => {
      console.error('[DB] Falha ao conectar no MariaDB:', error.message);
    });
});
