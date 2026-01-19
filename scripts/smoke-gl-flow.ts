import { prisma } from "../src/lib/db";
import { financeActions } from "../src/lib/finance/actions";
import { journalService } from "../src/lib/finance/journal-service";
import type { AccountType } from "@prisma/client";

type AssertOpts = { label: string };
function assert(condition: unknown, opts: AssertOpts): asserts condition {
  if (!condition) {
    throw new Error(`ASSERT_FAIL: ${opts.label}`);
  }
}

function sumMoney(lines: Array<{ debit: any; credit: any }>) {
  const toNum = (v: any) => (typeof v?.toNumber === "function" ? v.toNumber() : Number(v || 0));
  const debit = lines.reduce((s, l) => s + toNum(l.debit), 0);
  const credit = lines.reduce((s, l) => s + toNum(l.credit), 0);
  return { debit, credit };
}

async function ensureAccount(entityId: string, code: string, name: string, type: AccountType) {
  await prisma.account.upsert({
    where: { entityId_code: { entityId, code } },
    update: {},
    create: { entityId, code, name, type, isSystem: true },
  });
}

function getArgValue(prefix: string) {
  const arg = process.argv.slice(2).find((a) => a.startsWith(prefix + "="));
  return arg ? arg.slice(prefix.length + 1) : undefined;
}

async function httpJson<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = json?.error || json?.message || res.statusText;
    throw new Error(`HTTP ${res.status} ${path}: ${msg}`);
  }

  return json as T;
}

async function cleanupSmokeData() {
  const orgs = await prisma.organization.findMany({
    where: {
      slug: { startsWith: "smoke-org-smoke-" },
    },
    select: { id: true, slug: true },
  });

  if (orgs.length === 0) {
    console.log("✅ Cleanup: no smoke orgs found (slug startsWith smoke-org-smoke-)");
    return;
  }

  for (const org of orgs) {
    console.log(`🧹 Cleanup: deleting org ${org.slug} (${org.id})`);

    const properties = await prisma.property.findMany({
      where: { organizationId: org.id },
      select: { id: true },
    });
    const propertyIds = properties.map((p) => p.id);

    const units = propertyIds.length
      ? await prisma.unit.findMany({ where: { propertyId: { in: propertyIds } }, select: { id: true } })
      : [];
    const unitIds = units.map((u) => u.id);

    const leases = propertyIds.length
      ? await prisma.lease.findMany({ where: { propertyId: { in: propertyIds } }, select: { id: true, applicationId: true } })
      : [];
    const leaseIds = leases.map((l) => l.id);
    const applicationIds = leases.map((l) => l.applicationId);

    const invoices = leaseIds.length
      ? await prisma.invoice.findMany({ where: { leaseId: { in: leaseIds } }, select: { id: true } })
      : [];
    const invoiceIds = invoices.map((i) => i.id);

    const payments = invoiceIds.length
      ? await prisma.payment.findMany({ where: { invoiceId: { in: invoiceIds } }, select: { id: true } })
      : [];
    const paymentIds = payments.map((p) => p.id);

    const entities = await prisma.financialEntity.findMany({ where: { organizationId: org.id }, select: { id: true } });
    const entityIds = entities.map((e) => e.id);

    const journalEntries = entityIds.length
      ? await prisma.journalEntry.findMany({ where: { entityId: { in: entityIds } }, select: { id: true } })
      : [];
    const journalEntryIds = journalEntries.map((e) => e.id);

    // Financial docs
    if (invoiceIds.length || paymentIds.length) {
      await prisma.receipt.deleteMany({
        where: {
          OR: [
            ...(invoiceIds.length ? [{ invoiceId: { in: invoiceIds } }] : []),
            ...(paymentIds.length ? [{ paymentId: { in: paymentIds } }] : []),
          ],
        },
      });

      await prisma.paymentReversal.deleteMany({
        where: {
          OR: [
            ...(invoiceIds.length ? [{ invoice_id: { in: invoiceIds } }] : []),
            ...(paymentIds.length ? [{ payment_id: { in: paymentIds } }] : []),
          ],
        },
      });
    }

    if (invoiceIds.length) {
      await prisma.payment.deleteMany({ where: { invoiceId: { in: invoiceIds } } });
      await prisma.invoiceItem.deleteMany({ where: { invoiceId: { in: invoiceIds } } });
      await prisma.invoice.deleteMany({ where: { id: { in: invoiceIds } } });
    }

    if (journalEntryIds.length) {
      await prisma.journalLine.deleteMany({ where: { journalEntryId: { in: journalEntryIds } } });
      await prisma.journalEntry.deleteMany({ where: { id: { in: journalEntryIds } } });
      await prisma.financialSnapshot.deleteMany({ where: { entityId: { in: entityIds } } });
    }

    if (leaseIds.length) {
      await prisma.lease.deleteMany({ where: { id: { in: leaseIds } } });
    }

    if (applicationIds.length) {
      await (prisma.tenantapplication as any).deleteMany({ where: { id: { in: applicationIds } } });
    }

    if (unitIds.length) {
      await prisma.unit.deleteMany({ where: { id: { in: unitIds } } });
    }

    if (propertyIds.length) {
      await prisma.property.deleteMany({ where: { id: { in: propertyIds } } });
    }

    if (entityIds.length) {
      await prisma.account.deleteMany({ where: { entityId: { in: entityIds } } });
      await prisma.financialEntity.deleteMany({ where: { id: { in: entityIds } } });
    }

    await prisma.organizationUser.deleteMany({ where: { organizationId: org.id } });
    await prisma.organization.delete({ where: { id: org.id } });
  }

  console.log("✅ Cleanup complete");
}

async function runDirect() {
  const runId = `smoke-${Date.now()}`;
  const prefix = `SMOKE-${runId}`;

  console.log(`\n🧪 GL Smoke Flow (direct): ${prefix}`);

  // 0) Create a dedicated Organization + Financial Entity
  const org = await prisma.organization.create({
    data: {
      name: `Smoke Test Org ${runId}`,
      slug: `smoke-org-${runId}`,
      isActive: true,
    },
  });
  console.log(`✅ Organization: ${org.id}`);

  const entity = await prisma.financialEntity.create({
    data: {
      organizationId: org.id,
      name: `Smoke Entity ${runId}`,
    },
  });
  console.log(`✅ FinancialEntity: ${entity.id}`);

  // 1) Ensure minimal COA
  await ensureAccount(entity.id, "1000", "Cash - Operating Account", "ASSET" as AccountType);
  await ensureAccount(entity.id, "1100", "Accounts Receivable", "ASSET" as AccountType);
  await ensureAccount(entity.id, "4000", "Rental Income", "INCOME" as AccountType);
  console.log("✅ Chart of accounts ensured (1000/1100/4000)");

  // 2) Create property/unit + approved tenant application + lease
  const property = await prisma.property.create({
    data: {
      organizationId: org.id,
      name: `Smoke Property ${runId}`,
      city: "Test City",
      address: "123 Smoke St",
    },
  });

  const unit = await prisma.unit.create({
    data: {
      propertyId: property.id,
      unitNumber: "SMK-101",
      rentAmount: 1000,
    },
  });

  const application = await (prisma.tenantapplication as any).create({
    data: {
      fullName: `Smoke Tenant ${runId}`,
      email: `smoke+${runId}@example.com`,
      phone: "1234567890",
      dob: new Date("1990-01-01"),
      status: "APPROVED",
      propertyId: property.id,
      unitId: unit.id,
      leaseType: "Residential",
      occupancyType: "Family",
      moveInDate: new Date(),
      leaseDuration: "12 Months",
      consent: true,
    },
  });

  const lease = await prisma.lease.create({
    data: {
      applicationId: application.id,
      propertyId: property.id,
      unitId: unit.id,
      startDate: new Date(),
      endDate: new Date(new Date().getFullYear() + 1, 0, 1),
      rentAmount: 1000,
      leaseStatus: "ACTIVE",
    },
  });
  console.log(`✅ Lease created: ${lease.id}`);

  // 3) Invoice -> GL (JournalEntry + JournalLines)
  const invoiceAmount = 1000;
  const invoice = await prisma.invoice.create({
    data: {
      leaseId: lease.id,
      type: "RENT",
      totalAmount: invoiceAmount,
      dueDate: new Date(),
      status: "PENDING",
      postingStatus: "PENDING",
    },
  });

  console.log(`🚀 Posting invoice to GL: ${invoice.id}`);
  await financeActions.postInvoiceToGL(invoice.id);

  const postedInvoice = await prisma.invoice.findUnique({
    where: { id: invoice.id },
    include: {
      journalEntry: {
        include: {
          lines: {
            include: { account: true },
          },
        },
      },
    },
  });

  assert(postedInvoice, { label: "invoice exists after posting" });
  assert(postedInvoice.postingStatus === "POSTED", { label: "invoice.postingStatus === POSTED" });
  assert(postedInvoice.journalEntry, { label: "invoice has journalEntry" });

  const invLines = postedInvoice.journalEntry.lines;
  const invTotals = sumMoney(invLines);
  assert(Math.abs(invTotals.debit - invoiceAmount) < 0.0001, { label: "invoice journal total debit == invoice amount" });
  assert(Math.abs(invTotals.credit - invoiceAmount) < 0.0001, { label: "invoice journal total credit == invoice amount" });

  const invHasAR = invLines.some((l) => l.account.code === "1100" && Number(l.debit) > 0);
  const invHasIncome = invLines.some((l) => l.account.code === "4000" && Number(l.credit) > 0);
  assert(invHasAR, { label: "invoice journal has DR 1100" });
  assert(invHasIncome, { label: "invoice journal has CR 4000" });
  console.log("✅ Invoice posting created balanced journalEntry + journalLines");

  // 4) Payment -> GL (JournalEntry + JournalLines)
  const paymentAmount = 500;
  const payment = await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      amount: paymentAmount,
      method: "CASH",
      reference: `${prefix}-PAY`,
      postingStatus: "PENDING",
    },
  });

  console.log(`🚀 Posting payment to GL: ${payment.id}`);
  await financeActions.postPaymentToGL(payment.id);

  const postedPayment = await prisma.payment.findUnique({
    where: { id: payment.id },
    include: {
      journalEntry: {
        include: {
          lines: {
            include: { account: true },
          },
        },
      },
    },
  });

  assert(postedPayment, { label: "payment exists after posting" });
  assert(postedPayment.postingStatus === "POSTED", { label: "payment.postingStatus === POSTED" });
  assert(postedPayment.journalEntry, { label: "payment has journalEntry" });

  const payLines = postedPayment.journalEntry.lines;
  const payTotals = sumMoney(payLines);
  assert(Math.abs(payTotals.debit - paymentAmount) < 0.0001, { label: "payment journal total debit == payment amount" });
  assert(Math.abs(payTotals.credit - paymentAmount) < 0.0001, { label: "payment journal total credit == payment amount" });

  const payHasCash = payLines.some((l) => l.account.code === "1000" && Number(l.debit) > 0);
  const payHasAR = payLines.some((l) => l.account.code === "1100" && Number(l.credit) > 0);
  assert(payHasCash, { label: "payment journal has DR 1000" });
  assert(payHasAR, { label: "payment journal has CR 1100" });
  console.log("✅ Payment posting created balanced journalEntry + journalLines");

  // 5) Manual journal input (directly via journalService.post)
  const manualAmount = 123.45;
  console.log("🚀 Posting manual journal entry (journal input test)...");
  const manualEntry = await journalService.post({
    organizationId: org.id,
    date: new Date(),
    reference: `${prefix}-MANUAL`,
    description: "Smoke manual journal entry",
    lines: [
      { accountCode: "1000", debit: manualAmount, credit: 0, propertyId: property.id },
      { accountCode: "4000", debit: 0, credit: manualAmount, propertyId: property.id },
    ],
  });

  const loadedManualEntry = await prisma.journalEntry.findUnique({
    where: { id: manualEntry.id },
    include: { lines: { include: { account: true } } },
  });

  assert(loadedManualEntry, { label: "manual journalEntry exists" });
  assert(loadedManualEntry.lines.length === 2, { label: "manual journalEntry has 2 lines" });

  const manualTotals = sumMoney(loadedManualEntry.lines);
  assert(Math.abs(manualTotals.debit - manualAmount) < 0.0001, { label: "manual entry total debit == manual amount" });
  assert(Math.abs(manualTotals.credit - manualAmount) < 0.0001, { label: "manual entry total credit == manual amount" });
  console.log("✅ Manual journal input created balanced journal entry + lines");

  // 6) Expected balances (restricted to THIS run's journal entries)
  const journalEntryIds = [
    postedInvoice.journalEntry!.id,
    postedPayment.journalEntry!.id,
    manualEntry.id,
  ];

  const entries = await prisma.journalEntry.findMany({
    where: {
      entityId: entity.id,
      id: { in: journalEntryIds },
    },
    include: {
      lines: {
        include: {
          account: true,
        },
      },
    },
  });

  const byCode = new Map<string, { debit: number; credit: number }>();
  for (const e of entries) {
    for (const l of e.lines) {
      const code = l.account.code;
      const cur = byCode.get(code) || { debit: 0, credit: 0 };
      cur.debit += Number(l.debit);
      cur.credit += Number(l.credit);
      byCode.set(code, cur);
    }
  }

  const cash = byCode.get("1000") || { debit: 0, credit: 0 };
  const ar = byCode.get("1100") || { debit: 0, credit: 0 };
  const income = byCode.get("4000") || { debit: 0, credit: 0 };

  const cashBal = cash.debit - cash.credit;
  const arBal = ar.debit - ar.credit;
  const incomeBal = income.credit - income.debit;

  const expectedCash = paymentAmount + manualAmount;
  const expectedAR = invoiceAmount - paymentAmount;
  const expectedIncome = invoiceAmount + manualAmount;

  console.log("\n📊 Expected balances (this run only):");
  console.log(`- Cash (1000): ${cashBal} (expected ${expectedCash})`);
  console.log(`- AR (1100):   ${arBal} (expected ${expectedAR})`);
  console.log(`- Income(4000):${incomeBal} (expected ${expectedIncome})`);

  assert(Math.abs(cashBal - expectedCash) < 0.0001, { label: "cash balance matches expected" });
  assert(Math.abs(arBal - expectedAR) < 0.0001, { label: "AR balance matches expected" });
  assert(Math.abs(incomeBal - expectedIncome) < 0.0001, { label: "income balance matches expected" });

  console.log("\n🎉 SUCCESS: direct smoke flow validated.");
}

async function runHttp() {
  const runId = `smoke-${Date.now()}`;
  const prefix = `SMOKE-${runId}`;

  const baseUrl = getArgValue("--base-url") || process.env.SMOKE_BASE_URL || "http://localhost:3000";

  console.log(`\n🧪 GL Smoke Flow (HTTP): ${prefix}`);
  console.log(`🌐 Base URL: ${baseUrl}`);

  // Setup prerequisites via DB (there are no API endpoints for these in this repo)
  const org = await prisma.organization.create({
    data: {
      name: `Smoke Test Org ${runId}`,
      slug: `smoke-org-${runId}`,
      isActive: true,
    },
  });
  const entity = await prisma.financialEntity.create({
    data: {
      organizationId: org.id,
      name: `Smoke Entity ${runId}`,
    },
  });
  await ensureAccount(entity.id, "1000", "Cash - Operating Account", "ASSET" as AccountType);
  await ensureAccount(entity.id, "1100", "Accounts Receivable", "ASSET" as AccountType);
  await ensureAccount(entity.id, "4000", "Rental Income", "INCOME" as AccountType);

  const property = await prisma.property.create({
    data: {
      organizationId: org.id,
      name: `Smoke Property ${runId}`,
      city: "Test City",
      address: "123 Smoke St",
    },
  });

  const unit = await prisma.unit.create({
    data: {
      propertyId: property.id,
      unitNumber: "SMK-101",
      rentAmount: 1000,
    },
  });

  // 1) Tenant application (HTTP) + approve (HTTP)
  const applicationResp = await httpJson<any>(baseUrl, "/api/tenant-application", {
    method: "POST",
    body: JSON.stringify({
      fullName: `Smoke Tenant ${runId}`,
      email: `smoke+${runId}@example.com`,
      phone: "1234567890",
      dob: "1990-01-01",
      leaseType: "Residential",
      occupancyType: "Family",
      moveInDate: new Date().toISOString(),
      leaseDuration: "12 Months",
      consent: true,
      unitId: unit.id,
    }),
  });

  const application = applicationResp?.application;
  assert(application?.id, { label: "tenant application created via HTTP" });

  await httpJson<any>(baseUrl, `/api/tenant-application/${application.id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "APPROVED" }),
  });

  // 2) Lease (HTTP)
  const lease = await httpJson<any>(baseUrl, "/api/lease", {
    method: "POST",
    body: JSON.stringify({
      applicationId: application.id,
      tenantId: null,
      propertyId: property.id,
      unitId: unit.id,
      startDate: new Date().toISOString(),
      endDate: new Date(new Date().getFullYear() + 1, 0, 1).toISOString(),
      rentAmount: 1000,
      leaseTerm: "12 Months",
      paymentFrequency: "MONTHLY",
      paymentDueDay: 1,
      tenantPaysElectric: true,
      tenantPaysWater: true,
      tenantPaysTrash: true,
      tenantPaysInternet: false,
    }),
  });
  assert(lease?.id, { label: "lease created via HTTP" });

  // 3) Invoice creation + invoice-to-GL posting (HTTP)
  const invoiceAmount = 1000;
  const invoice = await httpJson<any>(baseUrl, "/api/invoices/manual", {
    method: "POST",
    body: JSON.stringify({
      lease_id: lease.id,
      type: "RENT",
      amount: invoiceAmount,
      dueDate: new Date().toISOString(),
    }),
  });
  assert(invoice?.id, { label: "invoice created via HTTP" });

  const hydratedInvoice = await httpJson<any>(baseUrl, `/api/invoices/${invoice.id}`, {
    method: "GET",
  });

  assert(hydratedInvoice?.postingStatus === "POSTED", { label: "invoice postingStatus is POSTED" });
  assert(hydratedInvoice?.journalEntryId, { label: "invoice has journalEntryId" });

  // 4) Payment creation + payment-to-GL posting (HTTP)
  const paymentAmount = 500;
  const paymentResp = await httpJson<any>(baseUrl, `/api/invoices/${invoice.id}/payments`, {
    method: "POST",
    body: JSON.stringify({
      amount: paymentAmount,
      method: "CASH",
      reference: `${prefix}-PAY`,
    }),
  });

  const payment = paymentResp?.payment;
  assert(payment?.id, { label: "payment created via HTTP" });
  assert(payment?.postingStatus === "POSTED", { label: "payment postingStatus is POSTED" });
  assert(payment?.journalEntryId, { label: "payment has journalEntryId" });

  // 5) Manual journal input (HTTP) via /api/finance/journal
  const manualAmount = 123.45;
  const manualResp = await httpJson<any>(baseUrl, "/api/finance/journal", {
    method: "POST",
    body: JSON.stringify({
      organizationId: org.id,
      date: new Date().toISOString(),
      reference: `${prefix}-MANUAL`,
      description: "Smoke manual journal entry",
      lines: [
        { accountCode: "1000", debit: manualAmount, credit: 0, propertyId: property.id },
        { accountCode: "4000", debit: 0, credit: manualAmount, propertyId: property.id },
      ],
    }),
  });

  const manualEntry = manualResp?.data;
  assert(manualEntry?.id, { label: "manual journal entry created via HTTP" });

  // 6) Validate journal entries/lines via /api/finance/journal (HTTP)
  const getEntry = async (entryId: string) => {
    const resp = await httpJson<any>(baseUrl, `/api/finance/journal?organizationId=${org.id}&entryId=${entryId}&limit=1`, {
      method: "GET",
    });
    const entry = resp?.data?.[0];
    assert(entry?.id, { label: `journalEntry ${entryId} fetch via HTTP` });
    return entry;
  };

  const invEntry = await getEntry(hydratedInvoice.journalEntryId);
  const invTotals = sumMoney(invEntry.lines || []);
  assert(Math.abs(invTotals.debit - invoiceAmount) < 0.0001, { label: "HTTP invoice journal total debit == invoice amount" });
  assert(Math.abs(invTotals.credit - invoiceAmount) < 0.0001, { label: "HTTP invoice journal total credit == invoice amount" });
  assert(invEntry.lines.some((l: any) => l.account.code === "1100" && Number(l.debit) > 0), { label: "HTTP invoice journal has DR 1100" });
  assert(invEntry.lines.some((l: any) => l.account.code === "4000" && Number(l.credit) > 0), { label: "HTTP invoice journal has CR 4000" });

  const payEntry = await getEntry(payment.journalEntryId);
  const payTotals = sumMoney(payEntry.lines || []);
  assert(Math.abs(payTotals.debit - paymentAmount) < 0.0001, { label: "HTTP payment journal total debit == payment amount" });
  assert(Math.abs(payTotals.credit - paymentAmount) < 0.0001, { label: "HTTP payment journal total credit == payment amount" });
  assert(payEntry.lines.some((l: any) => l.account.code === "1000" && Number(l.debit) > 0), { label: "HTTP payment journal has DR 1000" });
  assert(payEntry.lines.some((l: any) => l.account.code === "1100" && Number(l.credit) > 0), { label: "HTTP payment journal has CR 1100" });

  const manualEntryLoaded = await getEntry(manualEntry.id);
  const manualTotals = sumMoney(manualEntryLoaded.lines || []);
  assert(Math.abs(manualTotals.debit - manualAmount) < 0.0001, { label: "HTTP manual entry total debit == manual amount" });
  assert(Math.abs(manualTotals.credit - manualAmount) < 0.0001, { label: "HTTP manual entry total credit == manual amount" });

  // 7) Validate balances via /api/finance/ledger (HTTP)
  const ledgerResp = await httpJson<any>(baseUrl, `/api/finance/ledger?organizationId=${org.id}`, { method: "GET" });
  const ledger = ledgerResp?.data || [];

  const findBal = (code: string) => {
    const row = ledger.find((a: any) => a.code === code);
    assert(row, { label: `ledger contains account ${code}` });
    return Number(row.balance);
  };

  const cashBal = findBal("1000");
  const arBal = findBal("1100");
  const incomeBal = findBal("4000");

  const expectedCash = paymentAmount + manualAmount;
  const expectedAR = invoiceAmount - paymentAmount;
  const expectedIncome = invoiceAmount + manualAmount;

  console.log("\n📊 Expected balances (HTTP flow):");
  console.log(`- Cash (1000): ${cashBal} (expected ${expectedCash})`);
  console.log(`- AR (1100):   ${arBal} (expected ${expectedAR})`);
  console.log(`- Income(4000):${incomeBal} (expected ${expectedIncome})`);

  assert(Math.abs(cashBal - expectedCash) < 0.0001, { label: "HTTP cash balance matches expected" });
  assert(Math.abs(arBal - expectedAR) < 0.0001, { label: "HTTP AR balance matches expected" });
  assert(Math.abs(incomeBal - expectedIncome) < 0.0001, { label: "HTTP income balance matches expected" });

  console.log("\n🎉 SUCCESS: HTTP smoke flow validated.");
}

async function main() {
  const args = process.argv.slice(2);
  const cleanup = args.includes("--cleanup");
  const http = args.includes("--http");

  if (cleanup) {
    await cleanupSmokeData();
    return;
  }

  if (http) {
    await runHttp();
    return;
  }

  await runDirect();
}

main()
  .catch((e) => {
    console.error("\n❌ SMOKE TEST FAILED:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
