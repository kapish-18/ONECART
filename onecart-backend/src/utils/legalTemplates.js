/**
 * Legal Templates for OneCart
 * Serves beautifully styled, responsive HTML pages with a modern layout.
 */

const baseStyle = `
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6;
    color: #1f2937;
    background-color: #f9fafb;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 800px;
    margin: 40px auto;
    padding: 32px;
    background-color: #ffffff;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    border: 1px solid #f3f4f6;
  }
  h1 {
    font-size: 2.25rem;
    font-weight: 800;
    color: #111827;
    margin-top: 0;
    margin-bottom: 8px;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 16px;
  }
  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    margin-top: 32px;
    margin-bottom: 16px;
  }
  p {
    margin-top: 0;
    margin-bottom: 16px;
  }
  ul, ol {
    margin-top: 0;
    margin-bottom: 20px;
    padding-left: 24px;
  }
  li {
    margin-bottom: 8px;
  }
  .meta {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 32px;
  }
  .nav-footer {
    margin-top: 48px;
    padding-top: 24px;
    border-top: 1px solid #e5e7eb;
    text-align: center;
    font-size: 0.875rem;
  }
  .nav-footer a {
    color: #4f46e5;
    text-decoration: none;
    margin: 0 10px;
    font-weight: 500;
  }
  .nav-footer a:hover {
    text-decoration: underline;
  }
  .highlight-box {
    background-color: #eef2ff;
    border-left: 4px solid #4f46e5;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 24px;
  }
  @media (max-width: 640px) {
    .container {
      margin: 16px;
      padding: 20px;
      border-radius: 12px;
    }
    h1 {
      font-size: 1.75rem;
    }
    h2 {
      font-size: 1.25rem;
    }
  }
`;

function renderLegalPage(title, lastUpdated, contentHtml) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | OneCart</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    ${baseStyle}
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <div class="meta">Last Updated: ${lastUpdated}</div>
    <main>
      ${contentHtml}
    </main>
    <div class="nav-footer">
      <a href="/terms">Terms & Conditions</a> |
      <a href="/privacy">Privacy Policy</a> |
      <a href="/refunds">Cancellation & Refund</a> |
      <a href="/shipping">Shipping & Delivery</a> |
      <a href="/contact">Contact Us</a>
    </div>
  </div>
</body>
</html>
  `;
}

export const getPrivacyPolicy = () => {
  const content = `
    <div class="highlight-box">
      <strong>Important Notice for Users:</strong> OneCart processes personal data in accordance with the Indian Digital Personal Data Protection (DPDP) Act, 2023. By logging into the app using your VIT student email, you grant consent to collect and process your basic details to coordinate and deliver orders within the VIT campus.
    </div>

    <p>OneCart ("we," "us," or "our") values your privacy. This Privacy Policy outlines the types of information we collect, how we use it, and your rights regarding your data. OneCart is a campus-only, student-run MVP application restricted to VIT University students and delivery partners.</p>

    <h2>1. Data We Collect</h2>
    <p>To provide our services, we collect minimal data essential to the app's functionality:</p>
    <ul>
      <li><strong>Email Address:</strong> We collect your academic email address (restricted to @vitstudent.ac.in domains) to verify your identity and campus status via OTP.</li>
      <li><strong>Profile Information:</strong> Name, role selection (User, Delivery Partner, Admin), and default hostel block name.</li>
      <li><strong>Order Details:</strong> Items requested, outlets chosen, total amounts, delivery status, and handoff instructions.</li>
      <li><strong>Push Notification Tokens:</strong> Token identifiers to send you real-time updates when a delivery partner accepts or arrives with your order.</li>
      <li><strong>Delivery Partner Data:</strong> Outstanding earnings, delivery logs, and payment QR codes or UPI IDs to settle outstanding balances.</li>
      <li><strong>Transaction Data:</strong> Razorpay payment order and transaction IDs. We do <strong>not</strong> collect or store credit card numbers, CVVs, or netbanking passwords (these are processed securely by Razorpay).</li>
    </ul>

    <h2>2. Purpose of Processing Data</h2>
    <p>We process your data for the following legitimate purposes:</p>
    <ul>
      <li>To authenticate you and verify student eligibility.</li>
      <li>To calculate dynamic delivery fees and aggregate multiple food orders in a single check-out.</li>
      <li>To communicate order status changes via Push Notifications and OTP transaction verification.</li>
      <li>To verify payment status through Razorpay.</li>
      <li>To settle outstanding delivery fees and cash fronted by student delivery partners.</li>
    </ul>

    <h2>3. Third-Party Service Providers</h2>
    <p>We share limited information with external service providers to make the app work:</p>
    <ul>
      <li><strong>MongoDB Atlas:</strong> Secure cloud storage for application data.</li>
      <li><strong>Razorpay:</strong> Secure payment gateway processing (only payment IDs and billing amount are shared).</li>
      <li><strong>Brevo:</strong> Direct transactional email API used to send verification OTPs.</li>
      <li><strong>Expo & Firebase Cloud Messaging (FCM):</strong> Push notification delivery.</li>
    </ul>

    <h2>4. Consent and User Rights</h2>
    <p>Under the DPDP Act 2023, you have the following rights:</p>
    <ul>
      <li><strong>Right to Access:</strong> You can view your current account details directly in the app.</li>
      <li><strong>Right to Correct/Erase:</strong> You can request correction or deletion of your personal data at any time by contacting our support email.</li>
      <li><strong>Withdrawal of Consent:</strong> You may request account deletion, which will cease all data processing. Some transaction logs may be retained as required under financial guidelines.</li>
    </ul>

    <h2>5. Contact Us</h2>
    <p>If you have any questions or wish to exercise your data rights, please contact our support email at <strong>onecart.vit@gmail.com</strong>.</p>
  `;
  return renderLegalPage("Privacy Policy", "July 13, 2026", content);
};

export const getTermsAndConditions = () => {
  const content = `
    <div class="highlight-box">
      <strong>VIT Campus Restriction:</strong> This application is developed and operated solely as a student MVP project on the VIT University campus. Access is restricted to active students using a valid @vitstudent.ac.in email address.
    </div>

    <p>Welcome to OneCart. By accessing or using our mobile applications, backend services, or admin panel, you agree to comply with and be bound by the following Terms and Conditions. Please read them carefully.</p>

    <h2>1. Account Eligibility and Verification</h2>
    <ul>
      <li>You must be an active student or resident at VIT University to use this application.</li>
      <li>Access requires a valid academic email address ending in <code>@vitstudent.ac.in</code>. Verification is done via a one-time passcode (OTP) sent to your inbox.</li>
      <li>You are responsible for keeping your device secure and ensuring nobody else places orders from your account.</li>
    </ul>

    <h2>2. Ordering and Payment Flow</h2>
    <ul>
      <li><strong>Pricing Model:</strong> The app aggregates items from up to two campus outlets. The delivery fee is calculated dynamically based on item counts and peak hour surcharges.</li>
      <li><strong>Cash Fronting & Settlement:</strong> Because prices at outlets change, our delivery partners will front the cash at the outlet and input the final bill amount in the app. Users are contractually obligated to pay the final amount (Food Cost + Delivery Fee) immediately via Razorpay once the partner updates the order.</li>
      <li><strong>Abandonment & Non-Payment:</strong> If you place an order and a delivery partner purchases the food, you **must** complete the payment. Refusing to pay for food that has already been purchased violates campus community rules and may result in immediate account suspension and escalation to campus authorities.</li>
    </ul>

    <h2>3. Role of OneCart as an Intermediary</h2>
    <p>OneCart is a technology platform connecting campus buyers with independent student delivery partners. OneCart is not a food preparation outlet, food seller, or vendor. We hold no liability for:</p>
    <ul>
      <li>The quality, hygiene, or preparation time of the food prepared by third-party campus outlets.</li>
      <li>Accidental preparation errors or missing items, though you should notify support so we can try to help you resolve it.</li>
    </ul>

    <h2>4. Code of Conduct</h2>
    <p>Users and delivery partners must behave respectfully. Harassment, verbal abuse, or intentional delays in delivering/paying will lead to permanent bans from the platform.</p>

    <h2>5. Termination</h2>
    <p>We reserve the right to suspend or terminate accounts that violate these terms, generate suspicious activities, or fail to pay outstanding bills.</p>

    <h2>6. Governing Law</h2>
    <p>These terms are governed by the laws of India, under the jurisdiction of Vellore, Tamil Nadu.</p>
  `;
  return renderLegalPage("Terms & Conditions", "July 13, 2026", content);
};

export const getCancellationAndRefund = () => {
  const content = `
    <p>Our Cancellation and Refund Policy outlines the terms under which orders can be cancelled and how refunds are handled.</p>

    <h2>1. Order Cancellations</h2>
    <ul>
      <li><strong>User-Initiated Cancellation (Before Acceptance):</strong> You may cancel an order free of charge at any time while the status is <code>CREATED</code> (before any delivery partner accepts it). Since no payment has been made yet, no refund is needed.</li>
      <li><strong>User-Initiated Cancellation (After Acceptance):</strong> Once a delivery partner accepts your order (status changes to <code>ASSIGNED</code>), cancellation is <strong>strictly prohibited</strong>. This is because the partner has committed their time to your order and may have already purchased the food at the outlet.</li>
      <li><strong>Automatic Cancellations:</strong> If no delivery partner accepts your order within 5 minutes of placement, the system will automatically cancel it to avoid indefinite waits.</li>
    </ul>

    <h2>2. Out of Stock and Store Closures</h2>
    <p>If a delivery partner arrives at the outlet and finds that your requested items are out of stock, or if the outlet is closed, the order will be cancelled. If you have already paid, a full refund will be initiated immediately.</p>

    <h2>3. Refund Processing</h2>
    <ul>
      <li>All eligible refunds are processed back to the original payment source through our payment processor, Razorpay.</li>
      <li>Once initiated, refunds typically take <strong>5 to 7 working days</strong> to reflect in your bank account, depending on your bank's processing cycles.</li>
      <li>We do not offer cash refunds. All transactions must be traced through the digital payment history.</li>
    </ul>

    <h2>4. Delivery Issues & Disputes</h2>
    <p>If your order is marked as delivered but you did not receive it, or if there is a severe dispute regarding the delivery, please contact us at <strong>onecart.vit@gmail.com</strong> with your order ID within 1 hour of the delivery window. We will investigate and process partial or full refunds where delivery failure is verified.</p>
  `;
  return renderLegalPage("Cancellation & Refund Policy", "July 13, 2026", content);
};

export const getShippingAndDelivery = () => {
  const content = `
    <p>OneCart provides hyper-local food delivery services exclusively on the VIT University campus. This policy describes how shipping and deliveries are fulfilled.</p>

    <h2>1. Delivery Coverage Area</h2>
    <ul>
      <li>Our operations are strictly limited to the boundaries of the <strong>Vite University (VIT), Vellore Campus</strong>.</li>
      <li>We deliver specifically to the designated hostel gates or blocks (e.g., Men's Hostel Blocks A-Y, Ladies' Hostel Blocks A-G) as selected in the app. We do <strong>not</strong> deliver to off-campus locations.</li>
    </ul>

    <h2>2. Delivery Process</h2>
    <ul>
      <li>Once a delivery partner accepts an order, they proceed to the campus outlets to pick up the food.</li>
      <li>After pickup, they will update the food amount, enabling your payment sheet.</li>
      <li>Once payment is confirmed, they will transport the order to your designated hostel block.</li>
      <li>The delivery partner will mark the status as <code>ARRIVED</code> when they reach the gate/reception of your hostel block. You will receive a push notification with their arrival details and note.</li>
      <li>Handoff must happen at the block entrance. Delivery partners are not permitted to enter individual hostel rooms.</li>
    </ul>

    <h2>3. Estimated Delivery Times</h2>
    <ul>
      <li>Typical delivery times range from <strong>20 to 45 minutes</strong> from the time the order is accepted.</li>
      <li>Delivery times are estimates and may vary due to preparation delays at campus food outlets, high order volume, or weather conditions.</li>
    </ul>

    <h2>4. Delivery Fees</h2>
    <p>Delivery fees are calculated based on the number of items and outlets ordered from:</p>
    <ul>
      <li>Single Outlet: ₹29 (1-2 items) up to ₹49 (5+ items)</li>
      <li>Two Outlets: ₹39 (1-2 items) up to ₹59 (5+ items)</li>
      <li>A Peak Hour surcharge of ₹10 may be added when active, which goes directly to supporting delivery partner efforts.</li>
    </ul>
  `;
  return renderLegalPage("Shipping & Delivery Policy", "July 13, 2026", content);
};

export const getContactUs = () => {
  const content = `
    <p>For support, billing inquiries, or general questions regarding OneCart, please reach out to us using the contact details below:</p>

    <div style="background-color: #f3f4f6; padding: 24px; border-radius: 8px; margin-top: 24px;">
      <h3 style="margin-top: 0; color: #111827;">Contact Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #4b5563; width: 140px;">App Name:</td>
          <td style="padding: 8px 0; color: #1f2937;">OneCart</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #4b5563;">Developer:</td>
          <td style="padding: 8px 0; color: #1f2937;">Kapish</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #4b5563;">Affiliation:</td>
          <td style="padding: 8px 0; color: #1f2937;">Vellore Institute of Technology (VIT), Vellore</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #4b5563;">Support Email:</td>
          <td style="padding: 8px 0; color: #1f2937;"><a href="mailto:onecart.vit@gmail.com" style="color: #4f46e5; text-decoration: none;">onecart.vit@gmail.com</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #4b5563; vertical-align: top;">Address:</td>
          <td style="padding: 8px 0; color: #1f2937; line-height: 1.5;">
            Vellore Institute of Technology (VIT),<br>
            Tiruvalam Road, Katpadi,<br>
            Vellore, Tamil Nadu 632014,<br>
            India.
          </td>
        </tr>
      </table>
    </div>

    <p style="margin-top: 32px; font-size: 0.875rem; color: #6b7280; text-align: center;">We aim to respond to all email inquiries within 24 to 48 hours.</p>
  `;
  return renderLegalPage("Contact Us", "July 13, 2026", content);
};
