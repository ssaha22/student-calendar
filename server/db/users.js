const { Pool } = require("pg");

const pool = new Pool();

async function createUser(user, id = null) {
  const { email, password } = user;
  let res;
  if (!id) {
    res = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
      [email, password]
    );
  } else {
    res = await pool.query(
      "INSERT INTO users (id, email, password) VALUES ($1, $2, $3) RETURNING *",
      [id, email, password]
    );
  }
  return res.rows[0];
}

async function findUserByID(id) {
  const res = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return res.rows[0];
}

async function findUserByEmail(email) {
  const res = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return res.rows[0];
}

async function updateUser(id, newUser) {
  const { email, password } = newUser;
  const res = await pool.query(
    "UPDATE users SET email = $1, password = $2 WHERE id = $3 RETURNING *",
    [email, password, id]
  );
  return res.rows[0];
}

async function deleteUser(id) {
  await pool.query("DELETE FROM users WHERE id = $1", [id]);
}

module.exports = {
  createUser,
  findUserByID,
  findUserByEmail,
  updateUser,
  deleteUser,
};
