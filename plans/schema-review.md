# Prisma Schema Review: Final Master Schema

## Executive Summary

The proposed "Final Master Schema" has **significant issues** that will cause migration failures and data loss if applied directly. The key problems are:

1. **Missing `@@map()` directives** on renamed models and enums
2. **Incompatible enum values** between current and proposed Region/PaymentMethod
3. **Missing relations** that exist in current schema
4. **New required fields** not present in current schema

---

## Critical Issues

### 1. Enum Consolidation - Region

| Aspect     | Current                                | Proposed            |
| ---------- | -------------------------------------- | ------------------- |
| Enum Names | `organizations_region`, `users_region` | `Region`            |
| Values     | KEN, USA, NG, SA, RW, UG, TZ           | USA, AFRICA, GLOBAL |
| Mapping    | None                                   | **Missing**         |

**Problem**: The proposed `Region` enum has completely different values. If applied:

- All existing KEN, NG, SA, RW, UG, TZ data will be lost
- Will create new `Region` table instead of using existing tables

**Fix Required**:

```prisma
enum Region {
  USA
  AFRICA
  GLOBAL
}
/// Add @@map to use existing tables - but values don't match!
/// Need migration script to map: KEN,NG,SA,RW,UG,TZ → AFRICA
```

---

### 2. Payment Cleanup - PaymentMethod

| Aspect     | Current          | Proposed                 |
| ---------- | ---------------- | ------------------------ |
| Enum Name  | `payment_method` | `PaymentMethod`          |
| Mapping    | None             | **Missing**              |
| New Values | -                | STRIPE, PAYSTACK, MANUAL |

**Problem**:

- No `@@map("payment_method")` on proposed enum
- Will create new `PaymentMethod` table instead of using existing

**Payment Model Changes**:

- Current has separate fields: `method` (payment_method), `processor` (payment_processor), `status` (payment_status), `type` (payment_type)
- Proposed consolidates to single `PaymentMethod` enum with more values
- **Breaking change**: All payment records will need migration

---

### 3. Model Naming - Missing @@map()

#### `utility` → `Utility`

```prisma
// Current (line 747)
model utility {
  @@map("utility")
}

// Proposed: model Utility { }  // MISSING @@map("utility")!
```

**Impact**: Will create new `Utilities` table, orphaning existing data.

#### `lease_utility` → `LeaseUtility`

```prisma
// Current (line 761)
model lease_utility {
  @@map("lease_utility")
}

// Proposed: model LeaseUtility { }  // MISSING @@map("lease_utility")!
```

**Impact**: Will create new `LeaseUtilities` table.

#### `utility_reading` → `UtilityReading`

```prisma
// Current (line 777)
model utility_reading {
  @@map("utility_reading")
}

// Proposed: model utility_reading { }  // Still lowercase but wrong!
```

**Note**: Proposed schema keeps this as lowercase - verify intentional.

---

### 4. Missing Relations

#### FinancialEntity → Invoice

```prisma
// Current (line 177-179)
model FinancialEntity {
  invoices       Invoice[]  // EXISTS
}

// Proposed: INVOICES RELATION MISSING!
```

#### Organization → FinancialEntity

```prisma
// Current (line 33)
model Organization {
  financialEntities FinancialEntity[]  // EXISTS
}

// Proposed: MISSING from Organization model!
```

#### Lease → invoices

```prisma
// Current - Lease has invoices relation
// Proposed: MISSING from Lease model!
```

---

### 5. New Required Fields (Breaking Changes)

#### Invoice Model

| Field             | Current    | Proposed |
| ----------------- | ---------- | -------- |
| financialEntityId | ❌ Missing | ✅ Added |
| arAccountId       | ❌ Missing | ✅ Added |
| revenueAccountId  | ❌ Missing | ✅ Added |

**Impact**: These are optional in proposed schema, so not breaking.

#### JournalEntry

| Field    | Current    | Proposed   |
| -------- | ---------- | ---------- |
| invoices | ✅ Present | ❌ Removed |

---

## Migration Strategy

### Step 1: Add @@map() Directives

```prisma
// Fix enum mappings
enum Region {
  USA       @map("USA")
  AFRICA    @map("AFRICA")
  GLOBAL    @map("GLOBAL")
}
/// Note: This still loses data - need migration script

enum PaymentMethod {
  // Current values + new ones
  CASH                      @map("CASH")
  CHECK                     @map("CHECK")
  // ... all current values
  STRIPE                    @map("STRIPE")
  PAYSTACK                  @map("PAYSTACK")
  MANUAL                    @map("MANUAL")
}

// Fix model mappings
model Utility {
  // ... fields
  @@map("utility")  // ADD THIS
}

model LeaseUtility {
  // ... fields
  @@map("lease_utility")  // ADD THIS
}
```

### Step 2: Data Migration Script (Before Schema Change)

```sql
-- Region migration
ALTER TABLE organizations ADD COLUMN region_temp VARCHAR(20);
UPDATE organizations SET region_temp =
  CASE region
    WHEN 'USA' THEN 'USA'
    WHEN 'KEN' THEN 'AFRICA'
    WHEN 'NG'  THEN 'AFRICA'
    WHEN 'SA'  THEN 'AFRICA'
    WHEN 'RW'  THEN 'AFRICA'
    WHEN 'UG'  THEN 'AFRICA'
    WHEN 'TZ'  THEN 'AFRICA'
    ELSE 'GLOBAL'
  END;
ALTER TABLE organizations DROP COLUMN region;
ALTER TABLE organizations ADD COLUMN region VARCHAR(20);
-- ... same for users table
```

### Step 3: Add Missing Relations

Add back to proposed schema:

```prisma
model FinancialEntity {
  // ... existing
  invoices Invoice[]  // ADD THIS
}

model Organization {
  // ... existing
  financialEntities FinancialEntity[]  // ADD THIS
}

model Lease {
  // ... existing
  invoices Invoice[]  // ADD THIS
}
```

---

## Summary Checklist

| Issue                                  | Severity    | Action Required                  |
| -------------------------------------- | ----------- | -------------------------------- |
| Region enum values incompatible        | 🔴 Critical | Migration script + enum redesign |
| PaymentMethod missing @@map            | 🔴 Critical | Add @@map("payment_method")      |
| Utility model missing @@map            | 🔴 Critical | Add @@map("utility")             |
| LeaseUtility missing @@map             | 🔴 Critical | Add @@map("lease_utility")       |
| Missing FinancialEntity.invoices       | 🟡 Medium   | Add relation                     |
| Missing Organization.financialEntities | 🟡 Medium   | Add relation                     |
| Missing Lease.invoices                 | 🟡 Medium   | Add relation                     |

---

## Recommendation

**Do not apply the proposed schema directly.** The changes require:

1. **Pre-migration data mapping** for Region enum values
2. **Add @@map() directives** to all renamed models/enums
3. **Add back missing relations** that exist in current schema
4. **Test in staging** before production deployment

A corrected schema file should be created that addresses all these issues before attempting any migration.
