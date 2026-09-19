const { z } = require('zod');
const { query } = require('../config/db');

const getBlockchainTxSchema = z.object({
  transactionHash: z.string().min(10).describe('EVM transaction hash starting with 0x')
});

const getBlockchainTransaction = async (args) => {
  const { transactionHash } = getBlockchainTxSchema.parse(args);
  const sql = `
    SELECT bt.*, o.order_number, o.total_amount, u.email as user_email
    FROM blockchain_transactions bt
    LEFT JOIN orders o ON bt.order_id = o.id
    LEFT JOIN users u ON bt.user_id = u.id
    WHERE bt.transaction_hash = $1
  `;
  const res = await query(sql, [transactionHash.trim().toLowerCase()]);
  if (res.rows.length === 0) throw new Error(`Blockchain transaction ${transactionHash} not found in verified registry.`);
  return res.rows[0];
};

module.exports = {
  getBlockchainTxSchema,
  getBlockchainTransaction
};
