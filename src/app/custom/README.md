# Bespoke Custom Creation Atelier (`src/app/custom/`)

Claypresso enables customers to commission custom polymer clay accessories through a dedicated multi-step workflow.

> **"You have an idea. Show us. We'll make it in clay."**

---

## Routes

- `/custom`: Atelier landing page highlighting bespoke options (custom pet portraits, wedding favors, personalized bag charms, anniversary miniatures).
- `/custom/request`: Multi-step interactive commission intake form.
  - Step 1: Idea description, clay color preferences, and intended use.
  - Step 2: Reference photo upload with client-side thumbnail previews.
  - Step 3: Customer contact details and Indian delivery address.
- `/custom/request/success`: Confirmation page issuing the customer's unique reference code (`CLP-CUST-XXXX`).
- `/custom/orders/[reference]`: Public tracking status for the custom commission.
- `/custom/orders/[reference]/approve`: Formal price quote review and approval interface for the customer.

---

## Technical Flow

1. **Intake**: Customer submits request to `/api/custom/orders`. Images are uploaded via `/api/upload` (verified against binary magic bytes).
2. **Review**: Studio admin evaluates reference photos in `/admin/custom-orders` and sets custom quote amount (e.g. ₹850) and estimated completion timeline (~25 days).
3. **Approval**: Customer reviews the quote at `/custom/orders/[reference]/approve` and accepts.
4. **Sculpting Milestones**: Admin advances craft checkpoints (`SCULPTING` → `IN_KILN` → `GLAZING` → `PACKED`), visible to the customer on their tracking page.
