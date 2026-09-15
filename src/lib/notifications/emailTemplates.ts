/**
 * Claypresso Responsive Transactional Email Templates
 * Brand Palette:
 * Espresso: #3E2A1F | Warm Brown: #8D5A3C | Ivory: #FFF6EE | Cream: #FDFBF9
 */

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  items: Array<{
    name: string;
    variant?: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  shippingAddress: any;
  trackingNumber?: string;
  courier?: string;
  trackingUrl?: string;
}

interface CustomQuoteEmailData {
  referenceNumber: string;
  customerName: string;
  category: string;
  price: number;
  productionDays: number;
  notes?: string;
  expiryDate: string;
}

const EMAIL_BASE_STYLES = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #3E2A1F;
  background-color: #FFF6EE;
  margin: 0;
  padding: 24px;
`;

const CONTAINER_STYLES = `
  max-width: 600px;
  margin: 0 auto;
  background-color: #FFFFFF;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #E8DDD2;
  box-shadow: 0 4px 16px rgba(62, 42, 31, 0.06);
`;

const HEADER_STYLES = `
  background-color: #3E2A1F;
  color: #FFF6EE;
  padding: 32px 24px;
  text-align: center;
`;

const CONTENT_STYLES = `
  padding: 32px 24px;
`;

const FOOTER_STYLES = `
  background-color: #FDFBF9;
  padding: 20px 24px;
  text-align: center;
  font-size: 12px;
  color: #8D5A3C;
  border-top: 1px solid #E8DDD2;
`;

export function renderOrderConfirmationEmail(data: OrderEmailData): { html: string; text: string } {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #F0E8DF;">
          <strong>${item.name}</strong>
          ${item.variant ? `<br><span style="font-size: 12px; color: #736B63;">${item.variant}</span>` : ''}
        </td>
        <td style="padding: 10px 0; text-align: center; border-bottom: 1px solid #F0E8DF;">${item.quantity}</td>
        <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #F0E8DF; font-weight: 600;">₹${item.subtotal.toLocaleString('en-IN')}</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmed — ${data.orderNumber}</title>
      </head>
      <body style="${EMAIL_BASE_STYLES}">
        <div style="${CONTAINER_STYLES}">
          <div style="${HEADER_STYLES}">
            <h1 style="margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Claypresso</h1>
            <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Handcrafted Polymer Clay Treasures</p>
          </div>

          <div style="${CONTENT_STYLES}">
            <h2 style="margin: 0 0 12px; color: #3E2A1F; font-size: 20px;">Thank you for your order, ${data.customerName}!</h2>
            <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #5A4A3E;">
              We have received your order <strong style="color: #8D5A3C;">#${data.orderNumber}</strong>. Our studio is now lovingly preparing your handcrafted clay items.
            </p>

            <div style="background-color: #FDFBF9; border: 1px solid #E8DDD2; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                  <tr style="border-bottom: 2px solid #E8DDD2; color: #736B63; font-size: 12px; text-transform: uppercase;">
                    <th style="text-align: left; padding-bottom: 8px;">Item</th>
                    <th style="text-align: center; padding-bottom: 8px;">Qty</th>
                    <th style="text-align: right; padding-bottom: 8px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="margin-top: 16px; border-top: 1px solid #E8DDD2; padding-top: 12px; font-size: 13px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="color: #736B63;">Subtotal:</span>
                  <span>₹${data.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="color: #736B63;">Shipping:</span>
                  <span>${data.shippingFee === 0 ? '<strong style="color: #1E6F3D;">FREE</strong>' : `₹${data.shippingFee}`}</span>
                </div>
                ${
                  data.discount > 0
                    ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #1E6F3D;">
                  <span>Discount Applied:</span>
                  <span>-₹${data.discount.toLocaleString('en-IN')}</span>
                </div>`
                    : ''
                }
                <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 16px; font-weight: 700; color: #3E2A1F;">
                  <span>Total Paid:</span>
                  <span>₹${data.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <p style="margin: 0 0 8px; font-size: 13px; color: #736B63;">
              Estimated dispatch time: <strong>3-5 business days</strong> for handcrafting & curing + courier transit across India.
            </p>
          </div>

          <div style="${FOOTER_STYLES}">
            Claypresso Studio • Handcrafted with love in India<br>
            Questions? Reply directly to this email or reach us at hello@claypresso.com
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Claypresso Order Confirmation
Order #${data.orderNumber}
Customer: ${data.customerName}

Items:
${data.items.map((i) => `- ${i.name} (x${i.quantity}): ₹${i.subtotal}`).join('\n')}

Subtotal: ₹${data.subtotal}
Shipping: ₹${data.shippingFee}
Discount: ₹${data.discount}
Total: ₹${data.total}

Thank you for supporting our handcrafted studio!
hello@claypresso.com
  `.trim();

  return { html, text };
}

export function renderOrderShippedEmail(data: OrderEmailData): { html: string; text: string } {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Your Claypresso Order #${data.orderNumber} has Shipped!</title>
      </head>
      <body style="${EMAIL_BASE_STYLES}">
        <div style="${CONTAINER_STYLES}">
          <div style="${HEADER_STYLES}">
            <h1 style="margin: 0; font-size: 26px; font-weight: 700;">Claypresso</h1>
            <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Your package is on its way!</p>
          </div>

          <div style="${CONTENT_STYLES}">
            <h2 style="margin: 0 0 12px; color: #3E2A1F; font-size: 20px;">Great news, ${data.customerName}!</h2>
            <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #5A4A3E;">
              Your order <strong style="color: #8D5A3C;">#${data.orderNumber}</strong> has been packaged with care and handed over to our courier partner.
            </p>

            <div style="background-color: #FDFBF9; border: 1px solid #E8DDD2; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center;">
              <div style="font-size: 12px; color: #736B63; text-transform: uppercase; margin-bottom: 4px;">Courier Partner</div>
              <div style="font-size: 18px; font-weight: 700; color: #3E2A1F; margin-bottom: 12px;">${data.courier || 'India Post / DTDC'}</div>

              <div style="font-size: 12px; color: #736B63; text-transform: uppercase; margin-bottom: 4px;">Tracking Number</div>
              <div style="font-family: monospace; font-size: 18px; font-weight: 700; color: #8D5A3C; letter-spacing: 1px; margin-bottom: 16px;">
                ${data.trackingNumber || 'Tracking details will update shortly'}
              </div>

              ${
                data.trackingUrl
                  ? `
              <a href="${data.trackingUrl}" target="_blank" style="display: inline-block; background-color: #8D5A3C; color: #FFF; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">
                Track Consignment
              </a>`
                  : ''
              }
            </div>

            <p style="font-size: 13px; color: #736B63; margin: 0;">
              Standard courier delivery typically takes approximately 3 to 5 working days depending on your pin code.
            </p>
          </div>

          <div style="${FOOTER_STYLES}">
            Claypresso Studio • hello@claypresso.com
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Your Claypresso Order #${data.orderNumber} has Shipped!
Courier: ${data.courier || 'India Post / DTDC'}
Tracking Number: ${data.trackingNumber || 'Updating shortly'}
${data.trackingUrl ? `Track online: ${data.trackingUrl}` : ''}
  `.trim();

  return { html, text };
}

export function renderCustomQuoteEmail(data: CustomQuoteEmailData): { html: string; text: string } {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Your Claypresso Custom Quote is Ready! — ${data.referenceNumber}</title>
      </head>
      <body style="${EMAIL_BASE_STYLES}">
        <div style="${CONTAINER_STYLES}">
          <div style="${HEADER_STYLES}">
            <h1 style="margin: 0; font-size: 26px; font-weight: 700;">Claypresso</h1>
            <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Custom Handcrafted Creation</p>
          </div>

          <div style="${CONTENT_STYLES}">
            <h2 style="margin: 0 0 12px; color: #3E2A1F; font-size: 20px;">Hello ${data.customerName}!</h2>
            <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #5A4A3E;">
              Our studio artist has reviewed your custom commission inquiry <strong style="color: #8D5A3C;">${data.referenceNumber}</strong> (${data.category}) and prepared an exclusive estimate for you:
            </p>

            <div style="background-color: #FDFBF9; border: 1px solid #E8DDD2; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #E8DDD2; padding-bottom: 10px; margin-bottom: 10px;">
                <span style="color: #736B63;">Quoted Price:</span>
                <strong style="font-size: 18px; color: #3E2A1F;">₹${data.price.toLocaleString('en-IN')}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #E8DDD2; padding-bottom: 10px; margin-bottom: 10px;">
                <span style="color: #736B63;">Estimated Crafting Time:</span>
                <strong style="color: #3E2A1F;">${data.productionDays} days</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: #736B63;">Valid Until:</span>
                <span style="color: #8D5A3C; font-weight: 600;">${data.expiryDate}</span>
              </div>
              ${
                data.notes
                  ? `
              <div style="margin-top: 12px; font-size: 13px; color: #5A4A3E; background-color: #FFF; padding: 10px; border-radius: 6px; border: 1px solid #E8DDD2;">
                <strong>Artist Studio Notes:</strong><br>${data.notes}
              </div>`
                  : ''
              }
            </div>

            <p style="font-size: 14px; color: #5A4A3E;">
              To approve this quote and begin production, please reply directly or visit your Claypresso account.
            </p>
          </div>

          <div style="${FOOTER_STYLES}">
            Claypresso Studio • hello@claypresso.com
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Claypresso Custom Quote Ready
Request #${data.referenceNumber} (${data.category})
Price: ₹${data.price}
Crafting Time: ${data.productionDays} days
Valid Until: ${data.expiryDate}
Notes: ${data.notes || 'None'}
  `.trim();

  return { html, text };
}
