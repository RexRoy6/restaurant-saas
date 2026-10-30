import test from "node:test";
import assert from "node:assert/strict";
import { isSamePayment } from "../src/modules/orders/utils/isSamePayment.mjs";

const existing = {
  checkId: 10,
  amountInCents: 2500,
  paymentMethod: "CASH",
};

test("Acepta un reintento con los mismos datos", () => {
  assert.equal(isSamePayment(existing, { ...existing }), true);
});

test("Rechaza un importe diferente", () => {
  assert.equal(
    isSamePayment(existing, { ...existing, amountInCents: 3000 }),
    false,
  );
});

test("Rechaza un método diferente", () => {
  assert.equal(
    isSamePayment(existing, { ...existing, paymentMethod: "CARD" }),
    false,
  );
});

test("Rechaza una cuenta diferente", () => {
  assert.equal(
    isSamePayment(existing, { ...existing, checkId: 11 }),
    false,
  );
});