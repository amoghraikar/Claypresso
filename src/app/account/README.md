# Customer Account Routes (`src/app/account/`)

Optional customer membership and account management experience.

---

## Routes

- `/account`: Customer account dashboard showing recent orders, shipping addresses, and saved wishlist.
- `/account/login`: Email and password authentication form issuing the `claypresso_token` cookie.
- `/account/register`: New customer onboarding form.
- `/account/orders`: Full historical list of past customer purchases with individual receipts.
- `/account/orders/[orderId]`: Detailed view of an individual past order.

---

## Architecture Note

Guest checkout remains the default and primary checkout mechanism for Claypresso. Creating an account is completely optional and offered as a convenience for repeat collectors.
