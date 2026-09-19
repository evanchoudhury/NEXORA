const { query, pool } = require('../config/insforge');
const bcrypt = require('bcryptjs');

async function fixPasswords() {
  const hash = await bcrypt.hash('Password@123', 10);
  console.log('Target hash generated:', hash);
  const res = await query('UPDATE users SET password_hash = $1', [hash]);
  console.log('Updated users count:', res.rowCount);
  await pool.end();
}

fixPasswords().catch(err => {
  console.error(err);
  process.exit(1);
});
