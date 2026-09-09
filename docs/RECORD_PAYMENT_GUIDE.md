# Shivaayaha Silk Sarees — User Guide: Record Payment (Paid Voucher)

---

## 1. Overview
The **"Record Payment"** feature in **Shivaayaha Silk Sarees** is your digital manual voucher system (Khata / Paid Book). Because this application does not use automatic online payment gateways, **Record Payment** serves as the official bookkeeping record whenever you pay money to a weaver, supplier, or wholesale party.

Every time cash is handed over, a UPI payment is sent from your phone, a cheque is issued, or a bank transfer is executed, you log it here to keep your accounts accurate and up to date.

---

## 2. Primary Uses & Real-World Scenarios

### A. Paying Cash to Weavers on Delivery
- **Scenario:** A weaver from Dharmavaram or Kanchipuram delivers 10 pure silk sarees worth ₹80,000. You hand them ₹30,000 cash on the spot.
- **Use:** Record a ₹30,000 Cash payment. The weaver’s pending due automatically drops from ₹80,000 to ₹50,000.

### B. Recording UPI Payments with UTR Reference Numbers
- **Scenario:** You pay a weaver ₹25,000 via Google Pay, PhonePe, or Paytm from your personal mobile.
- **Use:** Select **Manual UPI**, enter ₹25,000, and type the 12-digit UPI UTR / Reference ID (e.g., `423985109283`). This gives you a clear digital audit trail if the weaver ever queries whether the payment arrived.

### C. Clearing a Specific Bill or Lot
- **Scenario:** You have 3 separate pending bills with one supplier, and you want to specifically pay off "Lot #BILL-104".
- **Use:** Select the weaver and pick **Lot #BILL-104** in the *"Link To Specific Bill / Lot"* dropdown. The system automatically populates the remaining due for that bill and marks it as **PAID** or **PARTIAL**.

### D. Making Lump-Sum / General Account Payments
- **Scenario:** A weaver has a cumulative balance of ₹1,50,000 across multiple orders. You send an ad-hoc payment of ₹50,000 without tying it to a single bill.
- **Use:** Leave the bill dropdown on **"General Account Balance"**. The payment reduces the weaver's overall outstanding due balance across your whole ledger.

### E. Issuing Cheques & Recording Bank Transfers
- **Scenario:** You issue a post-dated or account-payee cheque, or make an IMPS / NEFT transfer via net banking.
- **Use:** Select **Cheque** or **IMPS/NEFT**, and record the cheque number (e.g., `Chq #000412`) or NEFT reference for easy bank reconciliation.

### F. Linking Physical Paper Slips & Shop Diary Entries
- **Scenario:** Your shop accountant notes cash payouts in a physical diary or rough voucher pad.
- **Use:** Type the diary voucher number or notes (e.g., `Voucher #84 - Handed cash at Dharmavaram branch`) in the notes field so the physical and digital records match.

---

## 3. Step-by-Step Instructions: How to Record a Payment

1. **Open the Payment Window:**
   - Click the **"+ Record Payment"** button on the **Dashboard** or on the **Weavers / Parties** page.

2. **Select the Weaver / Party:**
   - Choose the party from the dropdown list.
   - The system immediately displays their **Current Pending Due** in amber so you know exactly what is owed.

3. **Link to a Bill / Lot (Optional):**
   - If paying for a specific purchase, choose that bill from the dropdown.
   - If paying towards their overall running ledger, leave it on *"General Account Balance"*.

4. **Enter Amount & Date:**
   - Enter the exact amount in Rupees (₹).
   - The transaction date defaults to today, but you can change it to backdate an earlier transaction.

5. **Select Payment Mode:**
   - **Cash:** For physical currency handed to the weaver or representative.
   - **Manual UPI:** For payments sent via PhonePe, Google Pay, BHIM, Paytm, etc.
   - **Cheque:** For bank cheques issued.
   - **IMPS/NEFT:** For direct online bank transfers.

6. **Add Reference & Notes:**
   - **Manual Ref / UTR / Cheque No.:** Hand-type the transaction reference, cheque number, or voucher number.
   - **Paper Slip Memo / Notes:** Optional note describing the context (e.g., *“Advance for upcoming wedding order”*).

7. **Save & Post:**
   - Click **"Post Manual Voucher (Paid)"**.
   - A success notification will appear, and all calculations update instantly.

---

## 4. What Happens Automatically After Recording a Payment?

1. **Party Net Due Balance Decreases:**
   - The weaver's net pending balance decreases immediately by the paid amount.

2. **Bill Status Auto-Updates:**
   - If linked to a bill, the bill's remaining due decreases.
   - If remaining due reaches ₹0, the bill status turns green: **PAID**.
   - If partially paid, it turns blue: **PARTIAL**.

3. **Dashboard Metrics Update:**
   - **Total Paid:** Increases by the payment amount.
   - **Total Outstanding Due:** Decreases by the payment amount.

4. **Permanent Ledger Entry Created:**
   - The entry appears in the **Transactions** history table with date, party name, mode, amount, and reference details.
   - The entry is included in the **Party Statement**, ready to download as a PDF or share directly via **WhatsApp**.

---

## 5. Summary of Fields & Terminology

| Field Name | Description | Example |
| :--- | :--- | :--- |
| **Weaver / Party** | The supplier or artisan receiving the money | *Kanchipuram Silk House* |
| **Current Pending Due** | Live amount you currently owe this party | *₹45,000* |
| **Link To Bill / Lot** | Ties the payment to a specific saree lot invoice | *Lot #LOT-2024-001* |
| **Payment Amount** | Amount paid in Rupees (₹) | *₹20,000* |
| **Payment Mode** | Mode of payment | *Cash, Manual UPI, Cheque, IMPS/NEFT* |
| **Ref / UTR / Cheque** | Hand-typed confirmation reference | *UTR-328904812390* |
| **Memo / Notes** | Physical slip or diary note | *Paid via PhonePe at counter* |
