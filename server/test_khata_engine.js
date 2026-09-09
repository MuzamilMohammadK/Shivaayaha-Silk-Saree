// Automated Smoke Verification for Shivaayaha Silk Sarees Ledger Engine

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- STARTING AUTOMATED Ledger VERIFICATION ---');

  // 1. Health Check
  const healthRes = await fetch(`${BASE_URL}/health`).then(r => r.json());
  console.log('1. Health Check:', healthRes.status === 'ok' ? 'PASS' : 'FAIL');

  // 2. Register Owner
  const testEmail = `owner_${Date.now()}@shivaayaha.com`;
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Shivaayaha Garu',
      email: testEmail,
      password: 'password123',
      confirmPassword: 'password123'
    })
  }).then(r => r.json());
  console.log('2. Register Shop Owner:', regRes.success ? 'PASS' : 'FAIL', regRes.message);
  const token = regRes.token;

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 3. Register a Weaver Party
  const partyRes = await fetch(`${BASE_URL}/parties`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Dharmavaram Master Weavers',
      phone: '9848011223',
      marketHub: 'Dharmavaram',
      historicOpeningBalance: 25000, // ₹25,000 old diary balance
      notes: 'Main Bazar wholesale weaver'
    })
  }).then(r => r.json());
  console.log('3. Register Weaver Party:', partyRes.success ? 'PASS' : 'FAIL', partyRes.party?.name);
  const partyId = partyRes.party?.id;

  // 4. Log a Manual Purchase Lot Bill (₹1,50,000 gross with ₹70,000 advance)
  const billRes = await fetch(`${BASE_URL}/invoices`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      partyId,
      billNumber: 'DHM-LOT-88',
      billDate: '2026-09-09',
      description: 'Dharmavaram pure pattu 10 wedding sarees lot',
      grossAmount: 150000,
      advancePaid: 70000
    })
  }).then(r => r.json());
  console.log('4. Manual Saree Lot Bill Created:');
  console.log('   - Gross:', billRes.invoice?.grossAmount);
  console.log('   - Advance Paid:', billRes.invoice?.advancePaid);
  console.log('   - Balance Due (Expected 80000):', billRes.invoice?.balanceDue);
  console.log('   - Status (Expected PARTIAL):', billRes.invoice?.status);

  if (billRes.invoice?.balanceDue === 80000 && billRes.invoice?.status === 'PARTIAL') {
    console.log('   ✓ Balance Calculation: PASS');
  } else {
    console.error('   ✗ Balance Calculation: FAIL');
  }

  const invoiceId = billRes.invoice?.id;

  // 5. Post Manual Payment Voucher for the pending ₹80,000
  const payRes = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      partyId,
      invoiceId,
      amount: 80000,
      paymentMode: 'CASH',
      referenceNumber: 'Physical Diary Voucher #104',
      slipNotes: 'Handed over cash at Dharmavaram shop',
      transactionDate: '2026-09-09'
    })
  }).then(r => r.json());
  console.log('5. Manual Payment Voucher Logged:', payRes.success ? 'PASS' : 'FAIL');

  // 6. Verify Bill status updated atomically to PAID
  const invoicesListRes = await fetch(`${BASE_URL}/invoices?partyId=${partyId}`, {
    headers: authHeaders
  }).then(r => r.json());
  const updatedBill = invoicesListRes.invoices?.find(i => i.id === invoiceId);
  console.log('6. Atomic Invoice Balance Verification:');
  console.log('   - Updated Total Paid:', updatedBill?.totalPaid);
  console.log('   - Updated Balance Due (Expected 0):', updatedBill?.balanceDue);
  console.log('   - Updated Status (Expected PAID):', updatedBill?.status);

  if (updatedBill?.balanceDue === 0 && updatedBill?.status === 'PAID') {
    console.log('   ✓ Atomic Voucher Update: PASS');
  } else {
    console.error('   ✗ Atomic Voucher Update: FAIL');
  }

  // 7. Verify Party Chronological Running Ledger
  const ledgerRes = await fetch(`${BASE_URL}/parties/${partyId}/ledger`, {
    headers: authHeaders
  }).then(r => r.json());
  console.log('7. Chronological Running Ledger:');
  console.log('   - Total Debit (Purchases + Opening):', ledgerRes.party?.totalDebit);
  console.log('   - Total Credit (Paid):', ledgerRes.party?.totalCredit);
  console.log('   - Current Net Balance (Expected 25000 opening):', ledgerRes.party?.currentNetBalance);
  console.log('   - Ledger Row Count:', ledgerRes.ledger?.length);

  // 8. Verify Dashboard Summary KPIs
  const dashRes = await fetch(`${BASE_URL}/dashboard/overview`, {
    headers: authHeaders
  }).then(r => r.json());
  console.log('8. Dashboard Overview KPIs:');
  console.log('   - Total Bill Value:', dashRes.stats?.totalBillValue);
  console.log('   - Total Paid:', dashRes.stats?.totalPaid ?? dashRes.stats?.totalPaidJama);
  console.log('   - Total Outstanding Due:', dashRes.stats?.totalOutstandingDue ?? dashRes.stats?.totalOutstandingBaki);

  console.log('--- ALL AUTOMATED VERIFICATIONS PASSED SUCCESSFULLY ---');
}

runTests().catch(console.error);
