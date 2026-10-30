export function isSamePayment(existing, attempt) {
  return (
    existing.checkId === attempt.checkId &&
    existing.amountInCents === attempt.amountInCents &&
    existing.paymentMethod === attempt.paymentMethod
  );
}