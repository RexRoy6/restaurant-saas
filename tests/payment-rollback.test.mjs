import test from "node:test";
import assert from "node:assert/strict";
import nextEnv from "@next/env";
import mysql from "mysql2/promise";
import { randomUUID } from "node:crypto";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

test("Rollback de pago ante error antes del commit", async () => {
  assert.equal(
    process.env.DB_NAME,
    "testingHospiHost",
    "SEGURIDAD: solo se permite testingHospiHost",
  );

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });

  const idempotencyKey = randomUUID();
  let transactionStarted = false;

  try {
    const [databaseRows] = await connection.query(
      "SELECT DATABASE() AS database_name",
    );

    assert.equal(
      databaseRows[0].database_name,
      "testingHospiHost",
    );

    await connection.beginTransaction();
    transactionStarted = true;

    await connection.execute(
      `INSERT INTO payments
       (company_id, check_id, amount_in_cents,
        payment_method, idempotency_key)
       VALUES (?, ?, ?, ?, ?)`,
      [2, 31, 100, "CASH", idempotencyKey],
    );

    // Simulamos un fallo después del INSERT.
    throw new Error("SIMULATED_DATABASE_FAILURE");
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback();
      transactionStarted = false;
    }

    assert.equal(
      error.message,
      "SIMULATED_DATABASE_FAILURE",
    );
  } finally {
    if (transactionStarted) {
      await connection.rollback();
    }
    await connection.end();
  }

  // Verificamos mediante una conexión nueva que no se guardó.
  const verification = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const [rows] = await verification.execute(
      `SELECT COUNT(*) AS total
       FROM payments
       WHERE idempotency_key = ?`,
      [idempotencyKey],
    );

    assert.equal(rows[0].total, 0);
  } finally {
    await verification.end();
  }
});