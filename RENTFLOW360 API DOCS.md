Rentflow360 Vision and Values guide Document  
for  
![][image1]

**RentFlow360**  
**Washington, United States of America**  
Rentflow360 API DOCUMENTATION  
**Version:** 0.0.1  
**Date:** 06TH NOVEMBER 2025

**1\.** **Api Name**

Api description

**1.1** **Work Unit Detail**

| Job Code: L002 | Source System: LeasePac | Target System: CRMNEXT |
| :------------- | :---------------------- | :--------------------- |

| Objective:           |     |
| :------------------- | :-- |
| **Periodicity:**     |     |
| **Interface:**       |     |
| **URL:**             |     |
| **Method Name:**     |     |
| **Input Type:**      |     |
| **Output Type:**     |     |
| **Expected Output:** |     |
| **Macro Logic:**     |     |
| **Watch-outs:**      |     |
| **Performance:**     |     |

**1.2** **Request Body Parameters**

| S.No | FieldName | Api Tag Name | DataType | Remarks |
| :--: | :-------- | :----------- | :------- | :------ |
|  1   |           |              |          |         |
|  2   |           |              |          |         |
|  3   |           |              |          |         |
|  4   |           |              |          |         |

**1.3** **Response Fields**

| S.No | FieldName | Api Tag Name | DataType | Remarks |
| :--: | :-------- | :----------- | :------- | :------ |
|  1   |           |              |          |         |
|  2   |           |              |          |         |
|  3   |           |              |          |         |
|  4   |           |              |          |         |

**1.4** **Request \- Response Sample**

            	 **1.5**   **Error Handling**

**Handled Response:**

    	  **Un-Handled Response:**

**1.6** **Sample Postman Simulation**

1. [**Tenant Application APIs**](https://claude.ai/chat/eea563a7-1531-4ddd-bb33-2d853d5d6946#1-tenant-application-apis)
2. [**Utilities APIs**](https://claude.ai/chat/eea563a7-1531-4ddd-bb33-2d853d5d6946#2-utilities-apis)
3. [**Utility Readings APIs**](https://claude.ai/chat/eea563a7-1531-4ddd-bb33-2d853d5d6946#3-utility-readings-apis)
4. [**Receipt APIs**](https://claude.ai/chat/eea563a7-1531-4ddd-bb33-2d853d5d6946#4-receipt-apis)
5. [**Payment APIs**](https://claude.ai/chat/eea563a7-1531-4ddd-bb33-2d853d5d6946#5-payment-apis)
6. [**Lease Utilities APIs**](https://claude.ai/chat/eea563a7-1531-4ddd-bb33-2d853d5d6946#6-lease-utilities-apis)
7. [**Lease APIs**](https://claude.ai/chat/eea563a7-1531-4ddd-bb33-2d853d5d6946#7-lease-apis)
8. [**Lease Signing APIs**](https://claude.ai/chat/eea563a7-1531-4ddd-bb33-2d853d5d6946#8-lease-signing-apis)
9. [**Tenant Invite APIs**](https://claude.ai/chat/eea563a7-1531-4ddd-bb33-2d853d5d6946#9-tenant-invite-apis)
10. [**Tenant Management APIs**](https://claude.ai/chat/eea563a7-1531-4ddd-bb33-2d853d5d6946#10-tenant-management-apis)
11. **Maintenance APIs**
12. **Vendor APIs**

---

- ## **1\. TENANT APPLICATION APIs**

- ***

- ### **1.1 Create Tenant Application**

- **API Name: Create Tenant Application**
- **API Description: Creates a new tenant rental application with comprehensive validation and property/unit association.**

- #### **1.1.1 Work Unit Detail**

| Field           | Value                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------------- |
| Job Code        | TA001-CREATE                                                                                        |
| Source System   | Property Management System                                                                          |
| Target System   | Database (Prisma/PostgreSQL)                                                                        |
| Objective       | Create tenant application for rental property                                                       |
| Periodicity     | On-demand                                                                                           |
| Interface       | REST API                                                                                            |
| URL             | /api/tenant-application                                                                             |
| Method Name     | POST                                                                                                |
| Input Type      | JSON                                                                                                |
| Output Type     | JSON                                                                                                |
| Expected Output | Application object with relations                                                                   |
| Macro Logic     | Validates required fields, associates with unit/property, creates tenant application record         |
| Watch-outs      | Requires valid unitId, propertyId is derived from unit, validates user existence if userId provided |
| Performance     | Standard CRUD operation with database relations                                                     |

- #### **1.1.2 Request Body Parameters**

| S.No | Field Name         | API Tag Name       | Data Type     | Remarks                                  |
| ---- | ------------------ | :----------------- | :------------ | ---------------------------------------- |
| 1    | fullName           | fullName           | String        | Required \- Applicant's full name        |
| 2    | email              | email              | String        | Required \- Contact email                |
| 3    | phone              | phone              | String        | Required \- Contact phone                |
| 4    | dob                | dob                | Date/String   | Required \- Date of birth (ISO format)   |
| 5    | ssn                | ssn                | String        | Optional \- Social Security Number       |
| 6    | address            | address            | String        | Optional \- Current address              |
| 7    | employerName       | employerName       | String        | Optional \- Current employer             |
| 8    | jobTitle           | jobTitle           | String        | Optional \- Job position                 |
| 9    | monthlyIncome      | monthlyIncome      | Number/String | Optional \- Monthly income amount        |
| 10   | employmentDuration | employmentDuration | String        | Optional \- Length of employment         |
| 11   | leaseType          | leaseType          | String        | Required \- Type of lease requested      |
| 12   | occupancyType      | occupancyType      | String        | Required \- Type of occupancy            |
| 13   | moveInDate         | moveInDate         | Date/String   | Required \- Desired move-in date         |
| 14   | leaseDuration      | leaseDuration      | String        | Required \- Desired lease duration       |
| 15   | occupants          | occupants          | Number/String | Optional \- Number of occupants          |
| 16   | pets               | pets               | String        | Optional \- Pet information              |
| 17   | landlordName       | landlordName       | String        | Optional \- Previous landlord name       |
| 18   | landlordContact    | landlordContact    | String        | Optional \- Previous landlord contact    |
| 19   | reasonForMoving    | reasonForMoving    | String        | Optional \- Reason for relocation        |
| 20   | referenceName      | referenceName      | String        | Optional \- Reference contact name       |
| 21   | referenceContact   | referenceContact   | String        | Optional \- Reference contact info       |
| 22   | consent            | consent            | Boolean       | Required \- Terms agreement              |
| 23   | unitId             | unitId             | String        | Required \- ID of unit being applied for |
| 24   | userId             | userId             | String        | Optional \- ID of registered user        |

- #### **1.1.3 Response Fields**

| S.No | Field Name            | API Tag Name          | Data Type | Remarks                               |
| :--- | --------------------- | --------------------- | --------- | ------------------------------------- |
| 1    | success               | success               | Boolean   | Operation status                      |
| 2    | application           | application           | Object    | Created application details           |
| 3    | application.id        | application.id        | String    | Unique application ID                 |
| 4    | application.status    | application.status    | String    | Application status (default: PENDING) |
| 5    | application.property  | application.property  | Object    | Associated property details           |
| 6    | application.unit      | application.unit      | Object    | Associated unit details               |
| 7    | application.user      | application.user      | Object    | Associated user (if provided)         |
| 8    | application.createdAt | application.createdAt | DateTime  | Creation timestamp                    |
|      |                       |                       |           |                                       |
|      |                       |                       |           |                                       |

- #### **1.1.4 Request-Response Sample**

- **POST Request:**
- **POST /api/tenant-application**
- **Content-Type: application/json**
-
- **{**
- **"fullName": "John Doe",**
- **"email": "john.doe@example.com",**
- **"phone": "+1234567890",**
- **"dob": "1990-05-15",**
- **"ssn": "123-45-6789",**
- **"address": "123 Main St, City",**
- **"employerName": "Tech Corp",**
- **"jobTitle": "Software Engineer",**
- **"monthlyIncome": "5000",**
- **"employmentDuration": "3 years",**
- **"leaseType": "FIXED_TERM",**
- **"occupancyType": "RESIDENTIAL",**
- **"moveInDate": "2025-01-01",**
- **"leaseDuration": "12 months",**
- **"occupants": 2,**
- **"pets": "1 cat",**
- **"consent": true,**
- **"unitId": "unit_abc123",**
- **"userId": "user_xyz789"**
- **}**
- **Success Response (201):**
- **{**
- **"success": true,**
- **"application": {**
-     **"id": "app\_123456",**
-     **"fullName": "John Doe",**
-     **"email": "john.doe@example.com",**
-     **"phone": "+1234567890",**
-     **"status": "PENDING",**
-     **"property": {**
-       **"id": "prop\_abc",**
-       **"name": "Sunset Apartments"**
-     **},**
-     **"unit": {**
-       **"id": "unit\_abc123",**
-       **"unitNumber": "101"**
-     **},**
-     **"createdAt": "2025-11-19T10:30:00Z"**
- **}**
- **}**

- #### **1.1.5 Error Handling**

- **Handled Response:**
- **400 Bad Request: Missing required fields**
- **{**
- **"error": "Mmissing required fields: fullName, email, phone"**
- **}**
- **400 Bad Request: Invalid unitId**
- **{**
- **"error": "Unit not found",**
- **"unitId": "invalid_unit_id"**
- **}**
- **Un-Handled Response:**
- **500 Internal Server Error: Database connection issues, unexpected errors**
- **{**
- **"error": "Internal server error",**
- **"details": "Database connection failed"**
- **}**
- ***

- ### **1.2 List Tenant Applications**

- **API Name: List Tenant Applications**
- **API Description: Retrieves all tenant applications with optional filtering by property.**

- #### **1.2.1 Work Unit Detail**

| Field           | Value                                                                       |
| --------------- | --------------------------------------------------------------------------- |
| Job Code        | TA001-LIST                                                                  |
| Source System   | Property Management System                                                  |
| Target System   | Database (Prisma/PostgreSQL)                                                |
| Objective       | Retrieve list of tenant applications                                        |
| Periodicity     | On-demand                                                                   |
| Interface       | REST API                                                                    |
| URL             | /api/tenant-application                                                     |
| Method Name     | GET                                                                         |
| Input Type      | Query Parameters                                                            |
| Output Type     | JSON                                                                        |
| Expected Output | Array of application objects with relations                                 |
| Macro Logic     | Retrieves applications with optional property filter, includes related data |
| Watch-outs      | Requires authentication, filters by user's organization                     |
| Performance     | List query with relations                                                   |

- #### **1.2.2 Request Query Parameters**

| S.No | Field Name | API TagName | Data Type | Remarks                                 |
| :--- | :--------- | :---------- | :-------- | --------------------------------------- |
| 1    | propertyId | propertyId  | String    | Optional \- Filter by specific property |

- #### **1.2.3 Response Fields**

| S.No | Field Name | API Tag Name | Data Type | Remarks                     |
| :--- | :--------- | :----------- | :-------- | --------------------------- |
| 1    | Array      | \-           | Array     | List of application objects |
| 2    | id         | id           | String    | Application ID              |
| 3    | fullName   | fullName     | String    | Applicant name              |
| 4    | email      | email        | String    | Contact email               |
| 5    | status     | status       | String    | Application status          |
| 6    | property   | property     | Object    | Associated property         |
| 7    | unit       | unit         | Object    | Associated unit             |
| 8    | createdAt  | createdAt    | DateTime  | Creation timestamp          |

- #### **1.2.4 Request-Response Sample**

- **GET Request:**
- **GET /api/tenant-application?propertyId=prop_abc**
- **Authorization: Bearer {token}**
- **Success Response (200):**
- **\[**
- **{**
-     **"id": "app\_123456",**
-     **"fullName": "John Doe",**
-     **"email": "john.doe@example.com",**
-     **"status": "PENDING",**
-     **"property": {**
-       **"id": "prop\_abc",**
-       **"name": "Sunset Apartments"**
-     **},**
-     **"unit": {**
-       **"id": "unit\_abc123",**
-       **"unitNumber": "101"**
-     **},**
-     **"createdAt": "2025-11-19T10:30:00Z"**
- **}**
- **\]**

- #### **1.2.5 Error Handling**

- **Handled Response:**
- **401 Unauthorized: User not authenticated**
- **{**
- **"error": "Unauthorized"**
- **}**
- **Un-Handled Response:**
- **500 Internal Server Error**
- **{**
- **"error": "Internal server error",**
- **"details": "Database connection failed"**
- **}**
- ***

- ### **1.3 Get Single Tenant Application**

- **API Name: Get Single Tenant Application**
- **API Description: Retrieves detailed information for a specific tenant application by ID.**

- #### **1.3.1 Work Unit Detail**

| Field           | Value                                         |
| --------------- | --------------------------------------------- |
| Job Code        | TA002-GET                                     |
| Source System   | Property Management System                    |
| Target System   | Database (Prisma/PostgreSQL)                  |
| Objective       | Retrieve single application details           |
| Periodicity     | On-demand                                     |
| Interface       | REST API                                      |
| URL             | /api/tenant-application/\[id\]                |
| Method Name     | GET                                           |
| Input Type      | Path Parameter                                |
| Output Type     | JSON                                          |
| Expected Output | Single application object with full relations |
| Macro Logic     | Retrieves by ID with all related data         |
| Watch-outs      | Application ID must exist                     |
| Performance     | Single record retrieval                       |

- #### **1.3.2 Request Path Parameters**

| S.No | Field Name | API Tag Name | Data Type | Remarks                    |
| :--- | :--------- | :----------- | :-------- | -------------------------- |
| 1    | id         | id           | String    | Required \- Application ID |

- #### **1.3.3 Response Fields**

| S.No | Field Name | API Tag Name | Data Type | Remarks                     |
| :--- | :--------- | :----------- | :-------- | --------------------------- |
| 1    | id         | id           | String    | Application ID              |
| 2    | fullName   | fullName     | String    | Applicant name              |
| 3    | email      | email        | String    | Contact email               |
| 4    | phone      | phone        | String    | Contact phone               |
| 5    | status     | status       | String    | Application status          |
| 6    | property   | property     | Object    | Associated property         |
| 7    | unit       | unit         | Object    | Associated unit             |
| 8    | user       | user         | Object    | Associated user (if exists) |
| 9    | All fields | \-           | Various   | Complete application data   |

- #### **1.3.4 Request-Response Sample**

- **GET Request:**
- **GET /api/tenant-application/app_123456**
- **Authorization: Bearer {token}**
- **Success Response (200):**
- **{**
- **"id": "app_123456",**
- **"fullName": "John Doe",**
- **"email": "john.doe@example.com",**
- **"phone": "+1234567890",**
- **"status": "PENDING",**
- **"property": {**
-     **"id": "prop\_abc",**
-     **"name": "Sunset Apartments"**
- **},**
- **"unit": {**
-     **"id": "unit\_abc123",**
-     **"unitNumber": "101"**
- **},**
- **"dob": "1990-05-15",**
- **"employerName": "Tech Corp",**
- **"monthlyIncome": "5000",**
- **"createdAt": "2025-11-19T10:30:00Z"**
- **}**

- #### **1.3.5 Error Handling**

- **Handled Response:**
- **404 Not Found: Application not found**
- **{**
- **"error": "Application not found"**
- **}**
- **Un-Handled Response:**
- **500 Internal Server Error**
- ***

- ### **1.4 Update Tenant Application Status**

- **API Name: Update Tenant Application Status**
- **API Description: Updates the status of a tenant application (PENDING, APPROVED, REJECTED, UNDER_REVIEW).**

- #### **1.4.1 Work Unit Detail**

| Field           | Value                                             |
| --------------- | ------------------------------------------------- |
| Job Code        | TA002-UPDATE                                      |
| Source System   | Property Management System                        |
| Target System   | Database (Prisma/PostgreSQL)                      |
| Objective       | Update application status                         |
| Periodicity     | On-demand                                         |
| Interface       | REST API                                          |
| URL             | /api/tenant-application/\[id\]                    |
| Method Name     | PATCH                                             |
| Input Type      | JSON                                              |
| Output Type     | JSON                                              |
| Expected Output | Updated application object                        |
| Macro Logic     | Validates status enum, updates application record |
| Watch-outs      | Status must be valid enum value                   |
| Performance     | Single record update                              |

- #### **1.4.2 Request Body Parameters**

| S.No | Field Name | API TagName | Data Type | Remarks                                                       |
| :--- | :--------- | :---------- | :-------- | ------------------------------------------------------------- |
| 1    | status     | status      | String    | Required \- One of: PENDING, APPROVED, REJECTED, UNDER_REVIEW |

- #### **1.4.3 Response Fields**

| S.No | Field Name | API Tag Name | Data Type | Remarks             |
| ---- | :--------- | :----------- | :-------- | ------------------- |
| 1    | id         | id           | String    | Application ID      |
| 2    | status     | status       | String    | Updated status      |
| 3    | fullName   | fullName     | String    | Applicant name      |
| 4    | email      | email        | String    | Contact email       |
| 5    | property   | property     | Object    | Associated property |
| 6    | unit       | unit         | Object    | Associated unit     |
| 7    | user       | user         | Object    | Associated user     |

- #### **1.4.4 Request-Response Sample**

- **PATCH Request:**
- **PATCH /api/tenant-application/app_123456**
- **Content-Type: application/json**
-
- **{**
- **"status": "APPROVED"**
- **}**
- **Success Response (200):**
- **{**
- **"id": "app_123456",**
- **"status": "APPROVED",**
- **"fullName": "John Doe",**
- **"email": "john.doe@example.com",**
- **"property": {**
-     **"id": "prop\_abc",**
-     **"name": "Sunset Apartments"**
- **},**
- **"unit": {**
-     **"id": "unit\_abc123",**
-     **"unitNumber": "101"**
- **}**
- **}**

- #### **1.4.5 Error Handling**

- **Handled Response:**
- **400 Bad Request: Invalid status**
- **{**
- **"error": "Invalid status. Must be PENDING, APPROVED, REJECTED, UNDER_REVIEW"**
- **}**
- **404 Not Found: Application not found**
- **{**
- **"error": "Application not found"**
- **}**
- **Un-Handled Response:**
- **500 Internal Server Error**
- ***

- ### **1.5 Delete Tenant Application**

- **API Name: Delete Tenant Application**
- **API Description: Deletes a specific tenant application by ID.**

- #### **1.5.1 Work Unit Detail**

| Field           | Value                                     |
| --------------- | ----------------------------------------- |
| Job Code        | TA002-DELETE                              |
| Source System   | Property Management System                |
| Target System   | Database (Prisma/PostgreSQL)              |
| Objective       | Delete application record                 |
| Periodicity     | On-demand                                 |
| Interface       | REST API                                  |
| URL             | /api/tenant-application/\[id\]            |
| Method Name     | DELETE                                    |
| Input Type      | Path Parameter                            |
| Output Type     | JSON                                      |
| Expected Output | Success message                           |
| Macro Logic     | Soft or hard delete of application record |
| Watch-outs      | Application ID must exist                 |
| Performance     | Single record deletion                    |

- #### **1.5.2 Request Path Parameters**

| S.No | Field Name | API TagName | Data Type | Remarks                              |
| :--- | :--------- | :---------- | :-------- | ------------------------------------ |
| 1    | id         | id          | String    | Required \- Application ID to delete |

- #### **1.5.3 Response Fields**

| S.No | Field Name | API Tag Name | Data Type | Remarks         |
| :--- | :--------- | :----------- | :-------- | --------------- |
| 1    | message    | message      | String    | Success message |

- #### **1.5.4 Request-Response Sample**

- **DELETE Request:**
- **DELETE /api/tenant-application/app_123456**
- **Authorization: Bearer {token}**
- **Success Response (200):**
- **{**
- **"message": "Application deleted successfully"**
- **}**

- #### **1.5.5 Error Handling**

- **Handled Response:**
- **404 Not Found: Application not found**
- **{**
- **"error": "Application not found"**
- **}**
- **Un-Handled Response:**
- **500 Internal Server Error**
- ***

- ## **2\. UTILITIES APIs**

- ***

- ### **2.1 Create Utility**

- **API Name: Create Utility Configuration**
- **API Description: Creates a new utility type (water, electricity, etc.) with fixed or metered pricing model.**

- #### **2.1.1 Work Unit Detail**

| Field           | Value                                                                            |
| --------------- | -------------------------------------------------------------------------------- |
| Job Code        | UT001-CREATE                                                                     |
| Source System   | Property Management System                                                       |
| Target System   | Database (Prisma/PostgreSQL)                                                     |
| Objective       | Create utility configuration                                                     |
| Periodicity     | On-demand                                                                        |
| Interface       | REST API                                                                         |
| URL             | /api/utilities                                                                   |
| Method Name     | POST                                                                             |
| Input Type      | JSON                                                                             |
| Output Type     | JSON                                                                             |
| Expected Output | Utility object with pricing configuration                                        |
| Macro Logic     | Validates pricing model (FIXED requires fixedAmount, METERED requires unitPrice) |
| Watch-outs      | Type must be FIXED or METERED, appropriate pricing field required                |
| Performance     | Standard CRUD operation                                                          |

- #### **2.1.2 Request Body Parameters**

| S.No | Field Name  | API Tag Name | Data Type | Remarks                                        |
| :--- | :---------- | :----------- | :-------- | ---------------------------------------------- |
| 1    | name        | name         | String    | Required \- Utility name (e.g., "Electricity") |
| 2    | type        | type         | String    | Required \- "FIXED" or "METERED"               |
| 3    | unitPrice   | unitPrice    | Number    | Required if type=METERED \- Price per unit     |
| 4    | fixedAmount | fixedAmount  | Number    | Required if type=FIXED \- Fixed monthly amount |

- #### **2.1.3 Response Fields**

| S.No | Field Name       | API Tag Name     | Data Type | Remarks                     |
| :--- | ---------------- | :--------------- | :-------- | --------------------------- |
| 1    | success          | success          | Boolean   | Operation status            |
| 2    | data             | data             | Object    | Utility object              |
| 3    | data.id          | data.id          | String    | Unique utility ID           |
| 4    | data.name        | data.name        | String    | Utility name                |
| 5    | data.type        | data.type        | String    | FIXED or METERED            |
| 6    | data.unitPrice   | data.unitPrice   | Number    | Price per unit (if metered) |
| 7    | data.fixedAmount | data.fixedAmount | Number    | Fixed amount (if fixed)     |

- #### **2.1.4 Request-Response Sample**

- **POST Request:**
- **POST /api/utilities**
- **Content-Type: application/json**
-
- **{**
- **"name": "Electricity",**
- **"type": "METERED",**
- **"unitPrice": 0.15**
- **}**
- **Success Response (200):**
- **{**
- **"success": true,**
- **"data": {**
-     **"id": "util\_elec123",**
-     **"name": "Electricity",**
-     **"type": "METERED",**
-     **"unitPrice": 0.15,**
-     **"fixedAmount": null**
- **}**
- **}**

- #### **2.1.5 Error Handling**

- **Handled Response:**
- **400 Bad Request: Invalid type or missing pricing**
- **{**
- **"success": false,**
- **"error": "unitPrice is required for METERED utilities"**
- **}**
- **Un-Handled Response:**
- **500 Internal Server Error**
- ***

- ### **2.2 List All Utilities**

- **API Name: List All Utilities**
- **API Description: Retrieves all configured utility types.**

- #### **2.2.1 Work Unit Detail**

| Field           | Value                                    |
| --------------- | ---------------------------------------- |
| Job Code        | UT001-LIST                               |
| Source System   | Property Management System               |
| Target System   | Database (Prisma/PostgreSQL)             |
| Objective       | Retrieve all utility configurations      |
| Periodicity     | On-demand                                |
| Interface       | REST API                                 |
| URL             | /api/utilities                           |
| Method Name     | GET                                      |
| Input Type      | None                                     |
| Output Type     | JSON                                     |
| Expected Output | Array of utility objects                 |
| Macro Logic     | Retrieves all utilities for organization |
| Watch-outs      | None                                     |
| Performance     | List query                               |

- #### **2.2.2 Request Parameters**

- **No request parameters required.**

- #### **2.2.3 Response Fields**

| S.No | Field Name           | API Tag Name         | Data Type | Remarks                     |
| :--- | -------------------- | :------------------- | :-------- | --------------------------- |
| 1    | success              | success              | Boolean   | Operation status            |
| 2    | data                 | data                 | Array     | Array of utility objects    |
| 3    | data\[\].id          | data\[\].id          | String    | Utility ID                  |
| 4    | data\[\].name        | data\[\].name        | String    | Utility name                |
| 5    | data\[\].type        | data\[\].type        | String    | FIXED or METERED            |
| 6    | data\[\].unitPrice   | data\[\].unitPrice   | Number    | Price per unit (if metered) |
| 7    | data\[\].fixedAmount | data\[\].fixedAmount | Number    | Fixed amount (if fixed)     |

- #### **2.2.4 Request-Response Sample**

- **GET Request:**
- **GET /api/utilities**
- **Authorization: Bearer {token}**
- **Success Response (200):**
- **{**
- **"success": true,**
- **"data": \[**
-     **{**
-       **"id": "util\_elec123",**
-       **"name": "Electricity",**
-       **"type": "METERED",**
-       **"unitPrice": 0.15,**
-       **"fixedAmount": null**
-     **},**
-     **{**
-       **"id": "util\_water456",**
-       **"name": "Water",**
-       **"type": "FIXED",**
-       **"unitPrice": null,**
-       **"fixedAmount": 50.00**
-     **}**
- **\]**
- **}**

- #### **2.2.5 Error Handling**

- **Un-Handled Response:**
- **500 Internal Server Error**
- ***

- ### **2.3 Get Single Utility**

- **API Name: Get Single Utility**
- **API Description: Retrieves a specific utility configuration by ID.**

- #### **2.3.1 Work Unit Detail**

| Field           | Value                                 |
| --------------- | ------------------------------------- |
| Job Code        | UT001-GET                             |
| Source System   | Property Management System            |
| Target System   | Database (Prisma/PostgreSQL)          |
| Objective       | Retrieve single utility configuration |
| Periodicity     | On-demand                             |
| Interface       | REST API                              |
| URL             | /api/utilities/\[id\]                 |
| Method Name     | GET                                   |
| Input Type      | Path Parameter                        |
| Output Type     | JSON                                  |
| Expected Output | Single utility object                 |
| Macro Logic     | Retrieves by ID                       |
| Watch-outs      | Utility ID must exist                 |
| Performance     | Single record retrieval               |

- #### **2.3.2 Request Path Parameters**

| S.No | Field Name | API TagName | Data Type | Remarks                |
| :--- | :--------- | :---------- | :-------- | ---------------------- |
| 1    | id         | id          | String    | Required \- Utility ID |

- #### **2.3.3 Response Fields**

| S.No | Field Name       | API Tag Name     | Data Type | Remarks          |
| :--- | :--------------- | :--------------- | :-------- | ---------------- |
| 1    | success          | success          | Boolean   | Operation status |
| 2    | data             | data             | Object    | Utility object   |
| 3    | data.id          | data.id          | String    | Utility ID       |
| 4    | data.name        | data.name        | String    | Utility name     |
| 5    | data.type        | data.type        | String    | FIXED or METERED |
| 6    | data.unitPrice   | data.unitPrice   | Number    | Price per unit   |
| 7    | data.fixedAmount | data.fixedAmount | Number    | Fixed amount     |

- #### **2.3.4 Request-Response Sample**

- **GET Request:**
- **GET /api/utilities/util_elec123**
- **Authorization: Bearer {token}**
- **Success Response (200):**
- **{**
- **"success": true,**
- **"data": {**
-     **"id": "util\_elec123",**
-     **"name": "Electricity",**
-     **"type": "METERED",**
-     **"unitPrice": 0.15,**
-     **"fixedAmount": null**
- **}**
- **}**

- #### **2.3.5 Error Handling**

- **Handled Response:**
- **404 Not Found: Utility not found**
- **{**
- **"success": false,**
- **"error": "Utility not found"**
- **}**
- **Un-Handled Response:**
- **500 Internal Server Error**
- ***

- ### **2.4 Update Utility**

- **API Name: Update Utility Configuration**
- **API Description: Updates an existing utility configuration.**

- #### **2.4.1 Work Unit Detail**

| Field           | Value                                       |
| --------------- | ------------------------------------------- |
| Job Code        | UT001-UPDATE                                |
| Source System   | Property Management System                  |
| Target System   | Database (Prisma/PostgreSQL)                |
| Objective       | Update utility configuration                |
| Periodicity     | On-demand                                   |
| Interface       | REST API                                    |
| URL             | /api/utilities/\[id\]                       |
| Method Name     | PUT                                         |
| Input Type      | JSON                                        |
| Output Type     | JSON                                        |
| Expected Output | Updated utility object                      |
| Macro Logic     | Validates and updates utility configuration |
| Watch-outs      | Type and pricing validation applies         |
| Performance     | Single record update                        |

- #### **2.4.2 Request Body Parameters**

| S.No | Field Name  | API TagName | Data Type | Remarks                                        |
| :--- | :---------- | :---------- | :-------- | ---------------------------------------------- |
| 1    | name        | name        | String    | Required \- Utility name                       |
| 2    | type        | type        | String    | Required \- "FIXED" or "METERED"               |
| 3    | unitPrice   | unitPrice   | Number    | Required if type=METERED \- Price per unit     |
| 4    | fixedAmount | fixedAmount | Number    | Required if type=FIXED \- Fixed monthly amount |

- #### **2.4.3 Response Fields**

| S.No | Field Name       | API Tag Name     | Data Type | Remarks                |
| :--- | ---------------- | :--------------- | :-------- | ---------------------- |
| 1    | success          | success          | Boolean   | Operation status       |
| 2    | data             | data             | Object    | Updated utility object |
| 3    | data.id          | data.id          | String    | Utility ID             |
| 4    | data.name        | data.name        | String    | Utility name           |
| 5    | data.type        | data.type        | String    | FIXED or METERED       |
| 6    | data.unitPrice   | data.unitPrice   | Number    | Price per unit         |
| 7    | data.fixedAmount | data.fixedAmount | Number    | Fixed amount           |

- #### **2.4.4 Request-Response Sample**

- **PUT Request:**
- **PUT /api/utilities/util_elec123**
- **Content-Type: application/json**
-
- **{**
- **"name": "Electricity",**
- **"type": "METERED",**
- **"unitPrice": 0.18**
- **}**
- **Success Response (200):**
- **{**
- **"success": true,**
- **"data": {**
-     **"id": "util\_elec123",**
-     **"name": "Electricity",**
-     **"type": "METERED",**
-     **"unitPrice": 0.18,**
-     **"fixedAmount": null**
- **}**
- **}**

- #### **2.4.5 Error Handling**

- **Handled Response:**
- **400 Bad Request: Invalid pricing**
- **{**
- **"success": false,**
- **"error": "unitPrice is required for METERED utilities"**
- **}**
- **404 Not Found: Utility not found**
- **{**
- **"success": false,**
- **"error": "Utility not found"**
- **}**
- **Un-Handled Response:**
- **500 Internal Server Error**
- ***

- ### **2.5 Delete Utility**

- **API Name: Delete Utility**
- **API Description: Deletes a utility configuration.**

- #### **2.5.1 Work Unit Detail**

| Field           | Value                               |
| --------------- | ----------------------------------- |
| Job Code        | UT001-DELETE                        |
| Source System   | Property Management System          |
| Target System   | Database (Prisma/PostgreSQL)        |
| Objective       | Delete utility configuration        |
| Periodicity     | On-demand                           |
| Interface       | REST API                            |
| URL             | /api/utilities/\[id\]               |
| Method Name     | DELETE                              |
| Input Type      | Path Parameter                      |
| Output Type     | JSON                                |
| Expected Output | Success message                     |
| Macro Logic     | Deletes utility record              |
| Watch-outs      | Cannot delete if assigned to leases |
| Performance     | Single record deletion              |

- #### **2.5.2 Request Path Parameters**

| S.No | Field Name | API Tag Name | Data Type | Remarks                          |
| :--- | :--------- | :----------- | :-------- | -------------------------------- |
| 1    | id         | id           | String    | Required \- Utility ID to delete |

- #### **2.5.3 Response Fields**

| S.No | Field Name | API Tag Name | Data Type | Remarks         |
| :--- | :--------- | :----------- | :-------- | --------------- |
| 1    | message    | message      | String    | Success message |

- #### **2.5.4 Request-Response Sample**

- **DELETE Request:**
- **DELETE /api/utilities/util_elec123**
- **Authorization: Bearer {token}**
- **Success Response (200):**
- **{**
- **"message": "Utility deleted successfully"**
- **}**

- #### **2.5.5 Error Handling**

- **Handled Response:**
- **404 Not Found: Utility not found**
- **{**
- **"success": false,**
- **"error": "Utility not found"**
- **}**
- **Un-Handled Response:**
- **500 Internal Server Error**

---

## **3\. Utility Readings APIs**

### 3.1 Utility Readings Management

API Name: Utility Meter Readings

API Description: Records and tracks utility consumption readings for metered utilities, automatically calculating charges based on consumption

**3.1.1 Work Unit Detail**

- **GET method**

| Field           | Value                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------- |
| Job Code        | UR001                                                                                              |
| Source System   | Property Management System                                                                         |
| Target System   | Database (Prisma/PostgreSQL)                                                                       |
| Objective       | Retrieve meter readings and compute usage charges                                                  |
| Periodicity     | On-demand (typically monthly)                                                                      |
| Interface       | REST API                                                                                           |
| URL             | http://Localhost:3000/api/utility-readings/\[id\]                                                  |
| Method Name     | GET                                                                                                |
| Input Type      | JSON                                                                                               |
| Output Type     | JSON                                                                                               |
| Expected Output | Reading object with calculated amount                                                              |
| Macro Logic     | Calculates consumption from previous reading, multiplies by unit price, prevents negative readings |
| Watch-outs      | New reading must be \>= previous reading, requires valid lease_utility_id                          |
| Performance     | Requires previous reading lookup for calculation 2                                                 |

- **POST method**

| Field           | Value                                                                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Job Code        | UR001                                                                                                                                                               |
| Source System   | Property Management System                                                                                                                                          |
| Target System   | Database (Prisma/PostgreSQL)                                                                                                                                        |
| Objective       | Record a new meter reading and calculate associated charge                                                                                                          |
| Periodicity     | On-demand (typically monthly)                                                                                                                                       |
| Interface       | REST API                                                                                                                                                            |
| URL             | http://Localhost:3000/api/utility-readings                                                                                                                          |
| Method Name     | POST                                                                                                                                                                |
| Input Type      | JSON                                                                                                                                                                |
| Output Type     | JSON                                                                                                                                                                |
| Expected Output | Reading object with calculated amount                                                                                                                               |
| Macro Logic     | Validates new reading against previous reading. Calculates consumption difference and multiplies by unit price. Ensures no negative or invalid readings are stored. |
| Watch-outs      | New reading must be ≥ previous reading. Requires valid `lease_utility_id`. Reading date defaults to current timestamp if not provided.                              |
| Performance     | Requires previous reading lookup for calculation                                                                                                                    |

####

####

#### **3.1.2 Request Body Parameters (POST)**

| S.No | Field Name       | API Tag Name     | Data Type   | Remarks                                    |
| ---- | ---------------- | ---------------- | ----------- | ------------------------------------------ |
| 1    | lease_utility_id | lease_utility_id | String      | Required \- ID of lease utility assignment |
| 2    | reading_value    | reading_value    | Number      | Required \- Current meter reading          |
| 3    | readingDate      | readingDate      | Date/String | Optional \- Reading date (defaults to now) |

#### **3.1.3 Response Fields**

| S.No | Field Name               | API Tag Name             | Data Type    | Remarks                           |
| ---- | ------------------------ | ------------------------ | ------------ | --------------------------------- |
| 1    | success                  | success                  | Boolean      | Operation status                  |
| 2    | data                     | data                     | Object/Array | Reading object(s)                 |
| 3    | data.id                  | data.id                  | String       | Unique reading ID                 |
| 4    | data.reading_value       | data.reading_value       | Number       | Meter reading value               |
| 5    | data.amount              | data.amount              | Number       | Calculated charge amount          |
| 6    | data.readingDate         | data.readingDate         | DateTime     | Reading date                      |
| 7    | data.lease_utility       | data.lease_utility       | Object       | Associated lease utility          |
| 8    | data.lease_utility.Lease | data.lease_utility.Lease | Object       | Lease with tenant, unit, property |

#### **3.1.4 Request-Response Sample**

**POST Request:**

{

"lease_utility_id": "lu_abc123",

"reading_value": 1500,

"readingDate": "2025-11-15"

}

**POST Response (200):**

{

"success": true,

"data": {

    "id": "reading\_xyz789",

    "reading\_value": 1500,

    "amount": 75.00,

    "readingDate": "2025-11-15T00:00:00Z",

    "lease\_utility\_id": "lu\_abc123"

}

}

**GET Response (200):**

{

"success": true,

"data": \[

    {

      "id": "reading\_xyz789",

      "reading\_value": 1500,

      "amount": 75.00,

      "readingDate": "2025-11-15T00:00:00Z",

      "lease\_utility": {

        "id": "lu\_abc123",

        "utility": {

          "id": "util\_elec123",

          "name": "Electricity",

          "unitPrice": 0.15

        },

        "Lease": {

          "id": "lease\_def456",

          "tenantName": "John Doe",

          "unitNumber": "101",

          "propertyName": "Sunset Apartments"

        }

      }

    }

\]

}

#### **3.1.5 Error Handling**

**Handled Response:**

**400 Bad Request: Invalid reading value**  
 { "success": false, "error": "Reading must be greater than previous reading"}

-

**404 Not Found: Lease utility not found**  
 { "success": false, "error": "Lease utility not found"}

-

**Un-Handled Response:**

- 500 Internal Server Error

---

## **4\. Receipt APIs**

### 4.1 Receipt Generation and Retrieval

API Name: Payment Receipt Management

API Description: Generates and retrieves receipts for payment transactions.

#### **4.1.1 Work Unit Detail**

- **GET Method**

| Field           | Value                                                                      |
| --------------- | -------------------------------------------------------------------------- |
| Job Code        | RC001                                                                      |
| Source System   | Property Management System                                                 |
| Target System   | Database (Prisma/PostgreSQL)                                               |
| Objective       | Retrieve receipts for payments and details                                 |
| Periodicity     | On-demand (per payment)                                                    |
| Interface       | REST API                                                                   |
| URL             | http://Localhost:3000/api/receipt/\[id\]                                   |
| Method Name     | GET                                                                        |
| Input Type      | JSON                                                                       |
| Output Type     | JSON                                                                       |
| Expected Output | Receipt object with unique receipt number                                  |
| Macro Logic     | Retrieves receipt details by ID. Ensure uniqueness of receipt per payment. |
| Watch-outs      | One receipt per payment, receipt number format: RCT-{timestamp}-{random}   |
| Performance     | Simple record creation with uniqueness check                               |

####

- **POST Method**

| Field           | Value                                                                                                                                                                |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Job Code        | RC001                                                                                                                                                                |
| Source System   | Property Management System                                                                                                                                           |
| Target System   | Database (Prisma/PostgreSQL)                                                                                                                                         |
| Objective       | Create new receipt                                                                                                                                                   |
| Periodicity     | On-demand (per payment)                                                                                                                                              |
| Interface       | REST API                                                                                                                                                             |
| URL             | http://Localhost:3000/api/receipt/                                                                                                                                   |
| Method Name     | POST                                                                                                                                                                 |
| Input Type      | JSON                                                                                                                                                                 |
| Output Type     | JSON                                                                                                                                                                 |
| Expected Output | Receipt object with unique receipt number                                                                                                                            |
| Macro Logic     | Generates unique receipt number and prevents duplicate receipts per payment                                                                                          |
| Watch-outs      | Duplicate receipts for the same payment are not allowed. The receipt number must follow the defined format. Payment must exist and be valid before receipt creation. |
| Performance     | Fast operation since only one receipt is generated per payment.                                                                                                      |

####

#### **4.1.2 Request Body Parameters (POST)**

| S.No  | Field Name    | API Tag Name  | Data Type  | Remarks                                               |
| ----- | ------------- | ------------- | ---------- | ----------------------------------------------------- |
| **1** | **paymentId** | **paymentId** | **String** | **Required \- ID of payment to generate receipt for** |

#### **4.1.3 Response Fields**

| S.No | Field Name      | API Tag Name    | Data Type | Remarks                         |
| ---- | --------------- | --------------- | --------- | ------------------------------- |
| 1    | id              | id              | String    | Unique receipt ID               |
| 2    | receiptNo       | receiptNo       | String    | Unique receipt number           |
| 3    | payment_id      | payment_id      | String    | Associated payment ID           |
| 4    | invoice_id      | invoice_id      | String    | Associated invoice ID           |
| 5    | issuedOn        | issuedOn        | DateTime  | Receipt issue date              |
| 6    | payment         | payment         | Object    | Payment details (GET only)      |
| 7    | payment.invoice | payment.invoice | Object    | Invoice details with lease info |

#### **4.1.4 Request-Response Sample**

**POST Request:**

{

"paymentId": "pay_abc123"

}

**POST Response (200):**

{

"id": "rcpt_xyz789",

"receiptNo": "RCT-1732012345678-A1B2C3D4E",

"payment_id": "pay_abc123",

"invoice_id": "inv_def456",

"issuedOn": "2025-11-19T10:30:00Z"

}

**GET Response (200):**

{

"id": "rcpt_xyz789",

"receiptNo": "RCT-1732012345678-A1B2C3D4E",

"payment_id": "pay_abc123",

"invoice_id": "inv_def456",

"issuedOn": "2025-11-19T10:30:00Z",

"payment": {

    "id": "pay\_abc123",

    "amount": 1500.00,

    "method": "BANK",

    "paidOn": "2025-11-19T10:00:00Z",

    "invoice": {

      "id": "inv\_def456",

      "amount": 1500.00,

      "Lease": {

        "id": "lease\_ghi789",

        "property": {

          "name": "Sunset Apartments"

        },

        "unit": {

          "unitNumber": "101"

        },

        "tenant": {

          "firstName": "John",

          "lastName": "Doe"

        }

      }

    }

}

}

#### **4.1.5 Error Handling**

**Handled Response:**

**404 Not Found: Payment not found**  
 { "error": "Payment not found"}

-

**404 Not Found: Receipt not found**  
 { "error": "Receipt not found"}

-

**Un-Handled Response:**

- **500 Internal Server Error**

---

## **5\. Payment APIs**

### 5.1 Payment Management

API Name: Payment Processing and History

API Description: Handles payment recording against invoices with automatic status updates and balance calculations.

#### **5.1.1 Work Unit Detail**

- **GET Method**

| Field           | Value                                                                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Job Code        | PM001                                                                                                                                                       |
| Source System   | Property Management System                                                                                                                                  |
| Target System   | Database (Prisma/PostgreSQL)                                                                                                                                |
| Objective       | Record payments, update invoice status, track payment history                                                                                               |
| Periodicity     | On-demand (per transaction)                                                                                                                                 |
| Interface       | REST API                                                                                                                                                    |
| URL             | http://localhost:3000/api/payments                                                                                                                          |
| Method Name     | GET                                                                                                                                                         |
| Input Type      | JSON                                                                                                                                                        |
| Output Type     | JSON                                                                                                                                                        |
| Expected Output | Payment object with updated invoice status                                                                                                                  |
| Macro Logic     | Fetches all payments linked to the given invoice ID. Calculates remaining balance. Updates invoice status (`PENDING`, `OVERDUE`, `PAID`) based on payments. |
| Watch-outs      | Invoice ID must be valid. Returned status depends on cumulative payments. Supports partial payments — the invoice may remain `PENDING` until fully paid.    |
| Performance     | Requires balance calculation from existing payments. Query optimized for invoice/payment relationship.                                                      |

####

####

- **POST Method**

| Field           | Value                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------- |
| Job Code        | PM001                                                                                             |
| Source System   | Property Management System                                                                        |
| Target System   | Database (Prisma/PostgreSQL)                                                                      |
| Objective       | Record payments, update invoice status, track payment history                                     |
| Periodicity     | On-demand (per transaction)                                                                       |
| Interface       | REST API                                                                                          |
| URL             | http://localhost:3000/api/invoices/\[id\]/payments                                                |
| Method Name     | POST                                                                                              |
| Input Type      | JSON                                                                                              |
| Output Type     | JSON                                                                                              |
| Expected Output | Payment object with updated invoice status                                                        |
| Macro Logic     | Validates payment amount against remaining balance, updates invoice status (PENDING/OVERDUE/PAID) |
| Watch-outs      | Payment cannot exceed remaining balance and supports partial payments                             |
| Performance     | Requires balance calculation from existing payments.                                              |

####

####

#### **5.1.2 Request Body Parameters (POST)**

| S.No | Field Name | API Tag Name | Data Type | Remarks                                      |
| ---- | ---------- | ------------ | --------- | -------------------------------------------- |
| 1    | amount     | amount       | Number    | Required \- Payment amount (must be \> 0\)   |
| 2    | method     | method       | String    | Required \- One of: CASH, BANK, CREDIT_CARD  |
| 3    | reference  | reference    | String    | Optional \- Payment reference/transaction ID |

#### **5.1.3 Response Fields**

| S.No | Field Name     | API Tag Name   | Data Type | Remarks                      |
| ---- | -------------- | -------------- | --------- | ---------------------------- |
| 1    | success        | success        | Boolean   | Operation status             |
| 2    | payment        | payment        | Object    | Created payment object       |
| 3    | payment.id     | payment.id     | String    | Unique payment ID            |
| 4    | payment.amount | payment.amount | Number    | Payment amount               |
| 5    | payment.method | payment.method | String    | Payment method               |
| 6    | payment.paidOn | payment.paidOn | DateTime  | Payment timestamp            |
| 7    | status         | status         | String    | Updated invoice status       |
| 8    | totalPaid      | totalPaid      | Number    | Total amount paid on invoice |
| 9    | remaining      | remaining      | Number    | Remaining balance            |

#### **5.1.4 Request-Response Sample**

**POST Request:**

{

"amount": 750.00,

"method": "BANK",

"reference": "TXN123456789"

}

**POST Response (200):**

{

"success": true,

"payment": {

    "id": "pay\_abc123",

    "invoice\_id": "inv\_def456",

    "amount": 750.00,

    "method": "BANK",

    "reference": "TXN123456789",

    "paidOn": "2025-11-19T10:30:00Z"

},

"status": "PENDING",

"totalPaid": 750.00,

"remaining": 750.00

}

**GET Response (200):**

\[

{

    "id": "pay\_abc123",

    "amount": 750.00,

    "method": "BANK",

    "paidOn": "2025-11-19T10:30:00Z",

    "invoice": {

      "id": "inv\_def456",

      "amount": 1500.00,

      "Lease": {

        "property": {

          "name": "Sunset Apartments"

        },

        "unit": {

          "unitNumber": "101"

        }

      }

    }

}

\]

#### **5.1.5 Error Handling**

**Handled Response:**

**400 Bad Request: Invalid amount**  
 { "error": "Invalid payment amount"}

-

**400 Bad Request: Exceeds balance**  
 { "error": "Payment amount (1000) exceeds remaining balance (750)"}

-

**401 Unauthorized: User not authenticated**  
 { "error": "Unauthorized"}

-

**Un-Handled Response:**

- **500 Internal Server Error**

---

## **6\. Lease Utilities APIs**

### 6.1 Lease Utility Assignment

API Name: Lease-Utility Association Management

API Description: Manages the assignment of utilities to specific leases, tracking tenant responsibility.

#### **6.1.1 Work Unit Detail**

- **GET Method**

| Field           | Value                                                                                        |
| --------------- | -------------------------------------------------------------------------------------------- |
| Job Code        | LU001                                                                                        |
| Source System   | Property Management System                                                                   |
| Target System   | Database (Prisma/PostgreSQL)                                                                 |
| Objective       | Retrieve all lease-utility assignments for all leases                                        |
| Periodicity     | On-demand (per lease setup)                                                                  |
| Interface       | REST API                                                                                     |
| URL             | http://localhost:3000/api/lease-utilities & http://localhost:3000/api/lease-utilities/\[id\] |
| Method Name     | GET                                                                                          |
| Input Type      | JSON                                                                                         |
| Output Type     | JSON                                                                                         |
| Expected Output | Lease-utility assignment object                                                              |
| Macro Logic     | Fetches all utilities assigned across leases. Ensures no duplicate assignments are returned. |
| Watch-outs      | Cannot assign same utility to lease twice, validates lease and utility existence             |
| Performance     | Standard read operation with relationship validation                                         |

####

- **POST Method**

| Field           | Value                                                                            |
| --------------- | -------------------------------------------------------------------------------- |
| Job Code        | LU001                                                                            |
| Source System   | Property Management System                                                       |
| Target System   | Database (Prisma/PostgreSQL)                                                     |
| Objective       | Create a new lease-utility assignment                                            |
| Periodicity     | On-demand (per lease setup)                                                      |
| Interface       | REST API                                                                         |
| URL             | http://localhost:3000/api/lease-utilities                                        |
| Method Name     | POST                                                                             |
| Input Type      | JSON                                                                             |
| Output Type     | JSON                                                                             |
| Expected Output | Lease-utility assignment object                                                  |
| Macro Logic     | Associates utility with lease, prevents duplicate assignments                    |
| Watch-outs      | Cannot assign same utility to lease twice; validates lease and utility existence |
| Performance     | Standard create operation with relationship validation                           |

####

- **PUT Method**

| Field           | Value                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| Job Code        | LU001                                                                                                       |
| Source System   | Property Management System                                                                                  |
| Target System   | Database (Prisma/PostgreSQL)                                                                                |
| Objective       | Update an existing lease-utility assignment, including tenant responsibility flags                          |
| Periodicity     | On-demand (per lease setup)                                                                                 |
| Interface       | REST API                                                                                                    |
| URL             | http://localhost:3000/api/lease-utilities/\[id\]                                                            |
| Method Name     | PUT                                                                                                         |
| Input Type      | JSON                                                                                                        |
| Output Type     | JSON                                                                                                        |
| Expected Output | Updated lease utility assignment object                                                                     |
| Macro Logic     | Updates assignment details without duplicating records validates lease and utility existence before updates |
| Watch-outs      | Cannot re-assign same utility to the same lease, ID must be valid                                           |
| Performance     | Standard update operation with relationship validation                                                      |

####

####

- **DELETE Method**

| Field           | Value                                                                    |
| --------------- | ------------------------------------------------------------------------ |
| Job Code        | LU001                                                                    |
| Source System   | Property Management System                                               |
| Target System   | Database (Prisma/PostgreSQL)                                             |
| Objective       | Remove lease-utility assignment                                          |
| Periodicity     | On-demand (per lease setup)                                              |
| Interface       | REST API                                                                 |
| URL             | http://localhost:3000/api/lease-utilities/\[id\]                         |
| Method Name     | DELETE                                                                   |
| Input Type      | JSON                                                                     |
| Output Type     | JSON                                                                     |
| Expected Output | Confirmation of deletion                                                 |
| Macro Logic     | Deletes utility assignment record                                        |
| Watch-outs      | ID must be valid cannot delete if assignment is linked to active billing |
| Performance     | Standard delete operation with relationship validation                   |

####

#### **6.1.2 Request Body Parameters (POST)**

| S.No | Field Name            | API Tag Name          | Data Type | Remarks                   |
| ---- | --------------------- | --------------------- | --------- | ------------------------- |
| 1    | lease_id              | lease_id              | String    | Required \- ID of lease   |
| 2    | utility_id            | utility_id            | String    | Required \- ID of utility |
| 3    | is_tenant_responsible | is_tenant_responsible | Boolean   | Optional \- Default true  |

#### **6.1.3 Response Fields**

| S.No | Field Name                 | API Tag Name               | Data Type    | Remarks                                        |
| ---- | -------------------------- | -------------------------- | ------------ | ---------------------------------------------- |
| 1    | success                    | success                    | Boolean      | Operation status                               |
| 2    | data                       | data                       | Object/Array | Assignment object(s)                           |
| 3    | data.id                    | data.id                    | String       | Unique assignment ID                           |
| 4    | data.lease_id              | data.lease_id              | String       | Associated lease ID                            |
| 5    | data.utility_id            | data.utility_id            | String       | Associated utility ID                          |
| 6    | data.is_tenant_responsible | data.is_tenant_responsible | Boolean      | Tenant payment responsibility                  |
| 7    | data.Lease                 | data.Lease                 | Object       | Full lease details with tenant, unit, property |
| 8    | data.utility               | data.utility               | Object       | Utility details                                |

#### **6.1.4 Request-Response Sample**

**POST Request:**

{

"lease_id": "lease_abc123",

"utility_id": "util_elec456",

"is_tenant_responsible": true

}

**POST Response (200):**

{

"success": true,

"data": {

    "id": "lu\_xyz789",

    "lease\_id": "lease\_abc123",

    "utility\_id": "util\_elec456",

    "is\_tenant\_responsible": true,

    "Lease": {

      "id": "lease\_abc123",

      "tenant": {

        "firstName": "John",

        "lastName": "Doe"

      },

      "unit": {

        "unitNumber": "101"

      },

      "property": {

        "name": "Sunset Apartments"

      }

    },

    "utility": {

      "id": "util\_elec456",

      "name": "Electricity",

      "type": "METERED",

      "unitPrice": 0.15

    }

}

}

#### **6.1.5 Error Handling**

**Handled Response:**

**400 Bad Request: Missing required fields**  
 { "success": false, "error": "lease_id and utility_id are required"}

-

**400 Bad Request: Duplicate assignment**  
 { "success": false, "error": "Utility already assigned to this lease"}

-

**404 Not Found: Lease utility not found**  
 { "success": false, "error": "Lease utility not found"}

-

**Un-Handled Response:**

- **500 Internal Server Error**

---

## **7\. Lease APIs**

### 7.1 Lease Management

API Name: Lease Contract Management

API Description: Comprehensive lease management including creation, retrieval, updates, and financial tracking.

#### **7.1.1 Work Unit Detail**

- **GET Method**

| Field           | Value                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------- |
| Job Code        | LS001                                                                                         |
| Source System   | Property Management System                                                                    |
| Target System   | Database (Prisma/PostgreSQL)                                                                  |
| Objective       | Retrieve details of a specific lease contract, including financial summaries and relations.   |
| Periodicity     | On-demand                                                                                     |
| Interface       | REST API                                                                                      |
| URL             | http://localhost:3000/api/lease & http://localhost:3000/api/lease/\[id\]                      |
| Method Name     | GET                                                                                           |
| Input Type      | JSON                                                                                          |
| Output Type     | JSON                                                                                          |
| Expected Output | Lease object with financial summary and relations                                             |
| Macro Logic     | Fetches lease details by ID                                                                   |
| Watch-outs      | Lease ID must be valid Application must be APPROVED Calculates balance from invoices/payments |
| Performance     | Complex queries with multiple relations and calculations                                      |

####

####

- **POST Method**

| Field           | Value                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Job Code        | LS001                                                                                                                                 |
| Source System   | Property Management System                                                                                                            |
| Target System   | Database (Prisma/PostgreSQL)                                                                                                          |
| Objective       | Create a new lease contract from an approved application and generate financial summaries.                                            |
| Periodicity     | On-demand                                                                                                                             |
| Interface       | REST API                                                                                                                              |
| URL             | http://localhost:3000/api/lease                                                                                                       |
| Method Name     | POST                                                                                                                                  |
| Input Type      | JSON                                                                                                                                  |
| Output Type     | JSON                                                                                                                                  |
| Expected Output | Lease object with financial summary and relations                                                                                     |
| Macro Logic     | Creates lease from approved application, calculates financial summaries, prevents duplicate leases                                    |
| Watch-outs      | Application must be APPROVED before lease creation Prevents duplicate lease per application Calculates balance from invoices/payments |
| Performance     | Complex queries with multiple relations and calculations                                                                              |

####

- **PATCH Method**

| Field           | Value                                                                                                |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| Job Code        | LS001                                                                                                |
| Source System   | Property Management System                                                                           |
| Target System   | Database (Prisma/PostgreSQL)                                                                         |
| Objective       | Update details of an existing lease contract                                                         |
| Periodicity     | On-demand                                                                                            |
| Interface       | REST API                                                                                             |
| URL             | http://localhost:3000/api/lease/\[id\]                                                               |
| Method Name     | PATCH                                                                                                |
| Input Type      | JSON                                                                                                 |
| Output Type     | JSON                                                                                                 |
| Expected Output | Updated lease object                                                                                 |
| Macro Logic     | Updates lease details without duplicating records Validates application and lease existence          |
| Watch-outs      | Cannot patch a lease linked to an non-approved application, Prevents duplicate lease per application |
| Performance     | Complex queries with multiple relations and calculations                                             |

####

#### **7.1.2 Request Body Parameters (POST)**

| S.No | Field Name               | API Tag Name             | Data Type   | Remarks                              |
| ---- | ------------------------ | ------------------------ | ----------- | ------------------------------------ |
| 1    | applicationId            | applicationId            | String      | Required \- Must be APPROVED status  |
| 2    | tenantId                 | tenantId                 | String      | Optional \- Tenant user ID           |
| 3    | propertyId               | propertyId               | String      | Required \- Property ID              |
| 4    | unitId                   | unitId                   | String      | Required \- Unit ID                  |
| 5    | startDate                | startDate                | Date/String | Required \- Lease start date         |
| 6    | endDate                  | endDate                  | Date/String | Required \- Lease end date           |
| 7    | rentAmount               | rentAmount               | Number      | Required \- Monthly rent             |
| 8    | securityDeposit          | securityDeposit          | Number      | Optional \- Security deposit amount  |
| 9    | leaseTerm                | leaseTerm                | String      | Required \- Term description         |
| 10   | paymentDueDay            | paymentDueDay            | Number      | Required \- Day of month rent is due |
| 11   | paymentFrequency         | paymentFrequency         | String      | Required \- Payment schedule         |
| 12   | lateFeeFlat              | lateFeeFlat              | Number      | Optional \- Flat late fee            |
| 13   | lateFeeDaily             | lateFeeDaily             | Number      | Optional \- Daily late fee           |
| 14   | gracePeriodDays          | gracePeriodDays          | Number      | Optional \- Grace period days        |
| 15   | landlordResponsibilities | landlordResponsibilities | String      | Optional \- Landlord duties          |
| 16   | tenantResponsibilities   | tenantResponsibilities   | String      | Optional \- Tenant duties            |
| 17   | tenantPaysElectric       | tenantPaysElectric       | Boolean     | Optional \- Utility responsibility   |
| 18   | tenantPaysWater          | tenantPaysWater          | Boolean     | Optional \- Utility responsibility   |
| 19   | tenantPaysTrash          | tenantPaysTrash          | Boolean     | Optional \- Utility responsibility   |
| 20   | tenantPaysInternet       | tenantPaysInternet       | Boolean     | Optional \- Utility responsibility   |
| 21   | usageType                | usageType                | String      | Optional \- Usage type               |
| 22   | earlyTerminationFee      | earlyTerminationFee      | Number      | Optional \- Early termination fee    |
| 23   | terminationNoticeDays    | terminationNoticeDays    | Number      | Optional \- Notice period            |

#### **7.1.3 Response Fields**

| S.No | Field Name                     | API Tag Name                   | Data Type | Remarks                                   |
| ---- | ------------------------------ | ------------------------------ | --------- | ----------------------------------------- |
| 1    | id                             | id                             | String    | Unique lease ID                           |
| 2    | applicationId                  | applicationId                  | String    | Source application ID                     |
| 3    | tenantId                       | tenantId                       | String    | Tenant user ID                            |
| 4    | propertyId                     | propertyId                     | String    | Property ID                               |
| 5    | unitId                         | unitId                         | String    | Unit ID                                   |
| 6    | startDate                      | startDate                      | DateTime  | Lease start date                          |
| 7    | endDate                        | endDate                        | DateTime  | Lease end date                            |
| 8    | rentAmount                     | rentAmount                     | Number    | Monthly rent amount                       |
| 9    | leaseStatus                    | leaseStatus                    | String    | DRAFT, SIGNED, ACTIVE, etc.               |
| 10   | tenant                         | tenant                         | Object    | Tenant user details                       |
| 11   | property                       | property                       | Object    | Property details with building/house info |
| 12   | unit                           | unit                           | Object    | Unit details                              |
| 13   | invoice                        | invoice                        | Array     | Associated invoices with payments         |
| 14   | financialSummary               | financialSummary               | Object    | Calculated financial data                 |
| 15   | financialSummary.totalInvoiced | financialSummary.totalInvoiced | Number    | Sum of all invoices                       |
| 16   | financialSummary.totalPaid     | financialSummary.totalPaid     | Number    | Sum of all payments                       |
| 17   | financialSummary.balance       | financialSummary.balance       | Number    | Outstanding balance                       |
| 18   | buildingName                   | buildingName                   | String    | Building name (apartments)                |
| 19   | houseName                      | houseName                      | String    | House name (houses)                       |

#### **7.1.4 Request-Response Sample**

**POST Request:**

{

"applicationId": "app_abc123",

"tenantId": "user_tenant456",

"propertyId": "prop_def789",

"unitId": "unit_ghi012",

"startDate": "2025-12-01",

"endDate": "2026-11-30",

"rentAmount": 1500.00,

"securityDeposit": 1500.00,

"leaseTerm": "12 months",

"paymentDueDay": 1,

"paymentFrequency": "MONTHLY",

"lateFeeFlat": 50.00,

"gracePeriodDays": 5,

"tenantPaysElectric": true,

"tenantPaysWater": false

}

**POST Response (201):**

{

"id": "lease_xyz789",

"applicationId": "app_abc123",

"tenantId": "user_tenant456",

"propertyId": "prop_def789",

"unitId": "unit_ghi012",

"startDate": "2025-12-01T00:00:00Z",

"endDate": "2026-11-30T00:00:00Z",

"rentAmount": 1500.00,

"securityDeposit": 1500.00,

"leaseStatus": "DRAFT",

"tenant": {

    "id": "user\_tenant456",

    "firstName": "John",

    "lastName": "Doe",

    "email": "john.doe@example.com"

},

"property": {

    "id": "prop\_def789",

    "name": "Sunset Apartments"

},

"unit": {

    "id": "unit\_ghi012",

    "unitNumber": "101"

}

}

**GET Response with Financial Summary (200):**

{

"id": "lease_xyz789",

"startDate": "2025-12-01T00:00:00Z",

"endDate": "2026-11-30T00:00:00Z",

"rentAmount": 1500.00,

"leaseStatus": "ACTIVE",

"tenant": {

    "id": "user\_tenant456",

    "firstName": "John",

    "lastName": "Doe"

},

"property": {

    "id": "prop\_def789",

    "name": "Sunset Apartments"

},

"unit": {

    "id": "unit\_ghi012",

    "unitNumber": "101"

},

"buildingName": "Sunset Apartments",

"financialSummary": {

    "totalInvoiced": 4500.00,

    "totalPaid": 3000.00,

    "balance": 1500.00

},

"invoice": \[

    {

      "id": "inv\_001",

      "amount": 1500.00,

      "status": "PAID",

      "payment": \[

        {

          "id": "pay\_001",

          "amount": 1500.00

        }

      \]

    }

\]

**}**

#### **7.1.5 Error Handling**

**Handled Response:**

**400 Bad Request: Missing required fields**  
 { "error": "Missing required fields"}

-

**400 Bad Request: Application not approved**  
 { "error": "Application must be approved before creating a lease"**}**

-

**404 Not Found: Application not found**  
 { "error": "Application not found"}

-

**409 Conflict: Duplicate lease**  
 { "error": "Lease already exists for this application"}

-

**Un-Handled Response:**

- **500 Internal Server Error**

---

## **8\. Lease Signing APIs**

### 8.1 Digital Lease Signing

API Name: Lease E-Signature Management

API Description: Handles digital signing of lease agreements by both landlord and tenant with token-based authentication for tenants.

#### **8.1.1 Work Unit Detail**

- Post Method

| Field           | Value                                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------- |
| Job Code        | LS002                                                                                                          |
| Source System   | Property Management System                                                                                     |
| Target System   | Database (Prisma/PostgreSQL)                                                                                   |
| Objective       | Enable digital lease signing with role-based authentication                                                    |
| Periodicity     | On-demand (per lease activation)                                                                               |
| Interface       | REST API                                                                                                       |
| URL             | http://localhost:3000/api/lease/\[id\]/sign/\[role\]                                                           |
| Method Name     | POST                                                                                                           |
| Input Type      | JSON (token for tenant, auth for landlord)                                                                     |
| Output Type     | JSON                                                                                                           |
| Expected Output | Updated lease with signature timestamps                                                                        |
| Macro Logic     | Tenant signs via invite token, landlord signs via authentication, updates leaseStatus to SIGNED when both sign |
| Watch-outs      | Role must be "tenant" or "landlord", prevents duplicate signatures, validates token for tenant                 |
| Performance     | Single update with authentication checks                                                                       |

#### **8.1.2 Request Body Parameters**

| S.No | Field Name | API Tag Name | Data Type | Remarks                                  |
| ---- | ---------- | ------------ | --------- | ---------------------------------------- |
| 1    | token      | token        | String    | Required for tenant role \- Invite token |
| 2    | role       | role         | String    | Path parameter \- "tenant" or "landlord" |

#### **8.1.3 Response Fields**

| S.No | Field Name             | API Tag Name           | Data Type | Remarks                          |
| ---- | ---------------------- | ---------------------- | --------- | -------------------------------- |
| 1    | message                | message                | String    | Success message                  |
| 2    | lease                  | lease                  | Object    | Updated lease object             |
| 3    | lease.id               | lease.id               | String    | Lease ID                         |
| 4    | lease.tenantSignedAt   | lease.tenantSignedAt   | DateTime  | Tenant signature timestamp       |
| 5    | lease.landlordSignedAt | lease.landlordSignedAt | DateTime  | Landlord signature timestamp     |
| 6    | lease.leaseStatus      | lease.leaseStatus      | String    | Updated status (DRAFT or SIGNED) |
| 7    | lease.tenant           | lease.tenant           | Object    | Tenant details                   |
| 8    | lease.property         | lease.property         | Object    | Property details                 |
| 9    | lease.unit             | lease.unit             | Object    | Unit details                     |

#### **8.1.4 Request-Response Sample**

**Tenant Sign Request:**

{

"token": "invite_token_abc123xyz789"

}

**Tenant Sign Response (200):**

{

"message": "Lease signed by tenant",

"lease": {

    "id": "lease\_xyz789",

    "tenantSignedAt": "2025-11-19T10:30:00Z",

    "landlordSignedAt": null,

    "leaseStatus": "DRAFT",

    "tenant": {

      "id": "user\_tenant456",

      "firstName": "John",

      "lastName": "Doe"

    },

    "property": {

      "id": "prop\_def789",

      "name": "Sunset Apartments"

    },

    "unit": {

      "id": "unit\_ghi012",

      "unitNumber": "101"

    }

}

}

**Landlord Sign Request:**

**POST /api/lease/lease_xyz789/sign/landlord**

**Headers: Authorization: Bearer {auth_token}**

**Landlord Sign Response (200):**

{

"message": "Lease signed by landlord",

"lease": {

    "id": "lease\_xyz789",

    "tenantSignedAt": "2025-11-19T10:30:00Z",

    "landlordSignedAt": "2025-11-19T11:00:00Z",

    "leaseStatus": "SIGNED",

    "tenant": {

      "id": "user\_tenant456",

      "firstName": "John",

      "lastName": "Doe"

    },

    "property": {

      "id": "prop\_def789",

      "name": "Sunset Apartments"

    },

    "unit": {

      "id": "unit\_ghi012",

      "unitNumber": "101"

    }

}

}

#### **8.1.5 Error Handling**

**Handled Response:**

**400 Bad Request: Missing token (tenant)**  
 { "error": "Missing invite token for tenant signing"}

-

**400 Bad Request: Invalid role**  
 { "error": "Invalid role: 'manager'. Must be 'tenant' or 'landlord'"}

-

**401 Unauthorized: Not authenticated (landlord)**  
 { "error": "Authentication required for landlord signing"}

-

**403 Forbidden: Invalid token**  
 { "error": "Invalid invite token"}

-

**403 Forbidden: Token mismatch**  
 { "error": "Invite token does not match this lease"}

-

**403 Forbidden: Unauthorized landlord**  
 { "error": "You are not authorized to sign this lease"}

-

**404 Not Found: Lease not found**  
 { "error": "Lease not found"}

-

**Un-Handled Response:**

- **500 Internal Server Error**

---

## **9\. Tenant Invite APIs**

### 9.1 Tenant Invitation Management

API Name: Tenant Onboarding Invitation System

API Description: Creates tenant user accounts, generates secure invite tokens, and manages tenant onboarding process.

#### **9.1.1 Work Unit Detail**

- **GET method**

| Field           | Value                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------ |
| Job Code        | TI001                                                                                                              |
| Source System   | Property Management System                                                                                         |
| Target System   | Database (Prisma/PostgreSQL)                                                                                       |
| Objective       | Retrieve details of a specific tenant invitation, including secure token and user information.                     |
| Periodicity     | On-demand (per tenant invitation)                                                                                  |
| Interface       | REST API                                                                                                           |
| URL             | http://localhost:300/api/auth/invites/tenant                                                                       |
| Method Name     | GET                                                                                                                |
| Input Type      | JSON                                                                                                               |
| Output Type     | JSON                                                                                                               |
| Expected Output | Invite object with secure token and user details                                                                   |
| Macro Logic     | Fetches tenant invites details Validates token expiry Returns associated lease and user information                |
| Watch-outs      | Email must be unique requires PROPERTY_MANAGER and SYSTEM_ADMIN roles, Expired tokens should return status EXPIRED |
| Performance     | Read operation with validation checks for token expiry and user association                                        |

####

- **POST method**

| Field           | Value                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------- |
| Job Code        | TI001                                                                                       |
| Source System   | Property Management System                                                                  |
| Target System   | Database (Prisma/PostgreSQL)                                                                |
| Objective       | Invite tenants, create inactive accounts, generate secure onboarding links                  |
| Periodicity     | On-demand (per tenant invitation)                                                           |
| Interface       | REST API                                                                                    |
| URL             | http://localhost:3000/api/auth/invites/tenant                                               |
| Method Name     | POST                                                                                        |
| Input Type      | JSON                                                                                        |
| Output Type     | JSON                                                                                        |
| Expected Output | Invite object with secure token and user details                                            |
| Macro Logic     | Creates inactive user, generates 32-byte token, associates with lease, sends invite link    |
| Watch-outs      | Email must be unique requires PROPERTY_MANAGER or SYSTEM_ADMIN role token expires in 7 days |
| Performance     | Multiple database operations (user, org user, invite creation)                              |

####

####

#### **9.1.2 Request Body Parameters (POST)**

| S.No | Field Name | API Tag Name | Data Type | Remarks                           |
| ---- | ---------- | ------------ | --------- | --------------------------------- |
| 1    | email      | email        | String    | Required \- Tenant email (unique) |
| 2    | firstName  | firstName    | String    | Required \- Tenant first name     |
| 3    | lastName   | lastName     | String    | Optional \- Tenant last name      |
| 4    | phone      | phone        | String    | Optional \- Contact phone         |
| 5    | leaseId    | leaseId      | String    | Required \- Associated lease ID   |

#### **9.1.3 Response Fields**

| S.No | Field Name       | API Tag Name     | Data Type | Remarks                    |
| ---- | ---------------- | ---------------- | --------- | -------------------------- |
| 1    | success          | success          | Boolean   | Operation status           |
| 2    | message          | message          | String    | Success message            |
| 3    | tenant           | tenant           | Object    | Created tenant details     |
| 4    | tenant.id        | tenant.id        | String    | User ID                    |
| 5    | tenant.token     | tenant.token     | String    | Secure invite token        |
| 6    | tenant.email     | tenant.email     | String    | Tenant email               |
| 7    | tenant.firstName | tenant.firstName | String    | Tenant first name          |
| 8    | tenant.lastName  | tenant.lastName  | String    | Tenant last name           |
| 9    | tenant.accepted  | tenant.accepted  | Boolean   | Invite acceptance status   |
| 10   | tenant.lease     | tenant.lease     | Object    | Associated lease details   |
| 11   | inviteLink       | inviteLink       | String    | Full invite URL (dev only) |

#### **9.1.4 Request-Response Sample**

**POST Request:**

{

"email": "john.doe@example.com",

"firstName": "John",

"lastName": "Doe",

"phone": "+1234567890",

"leaseId": "lease_abc123"

}

**POST Response (200):**

{

"success": true,

"message": "Tenant invited successfully",

"tenant": {

    "id": "user\_xyz789",

    "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",

    "email": "john.doe@example.com",

    "firstName": "John",

    "lastName": "Doe",

    "phone": "+1234567890",

    "accepted": false,

    "createdAt": "2025-11-19T10:30:00Z",

    "lease": {

      "id": "lease\_abc123",

      "startDate": "2025-12-01T00:00:00Z",

      "endDate": "2026-11-30T00:00:00Z",

      "rentAmount": 1500.00,

      "unit": {

        "id": "unit\_def456",

        "unitNumber": "101"

      }

    }

},

"inviteLink": "https://yourdomain.com/invite/tenant/accept?token=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6\&email=john.doe@example.com\&leaseId=lease\_abc123"

}

**GET Response (200):**

{

"invites": \[

    {

      "id": "invite\_001",

      "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",

      "email": "john.doe@example.com",

      "accepted": false,

      "createdAt": "2025-11-19T10:30:00Z",

      "firstName": "John",

      "lastName": "Doe",

      "phone": "+1234567890",

      "status": "INACTIVE",

      "leaseId": "lease\_abc123",

      "lease": {

        "id": "lease\_abc123",

        "startDate": "2025-12-01T00:00:00Z",

        "endDate": "2026-11-30T00:00:00Z",

        "rentAmount": 1500.00,

        "unit": {

          "id": "unit\_def456",

          "unitNumber": "101"

        }

      }

    }

\]

}

#### **9.1.5 Error Handling**

**Handled Response:**

**400 Bad Request: Missing required fields**  
 { "error": "Email, first name, and leaseId are required"}

-

**401 Unauthorized: Not authenticated**  
 { "error": "Unauthorized"}

-

**403 Forbidden: Insufficient permissions**  
 { "error": "Only property managers or admins can invite tenants"}

-

**404 Not Found: Lease not found**  
 { "error": "Lease not found"}

-

**409 Conflict: Email already exists**  
 { "error": "A user with this email already exists"}

-

**Un-Handled Response:**

- **500 Internal Server Error**

---

### **9.2 Accept Tenant Invite**

API Name: Tenant Invite Acceptance & Account Activation

API Description: Allows invited tenants to accept invitations, set passwords, and activate their accounts.

#### **9.2.1 Work Unit Detail**

| Field           | Value                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------- |
| Job Code        | TI002                                                                                             |
| Source System   | Property Management System                                                                        |
| Target System   | Database (Prisma/PostgreSQL)                                                                      |
| Objective       | Activate tenant account, set password, link to lease                                              |
| Periodicity     | On-demand (per tenant acceptance)                                                                 |
| Interface       | REST API                                                                                          |
| URL             | /api/invite/tenant/accept                                                                         |
| Method Name     | POST                                                                                              |
| Input Type      | JSON                                                                                              |
| Output Type     | JSON                                                                                              |
| Expected Output | Success message with user details                                                                 |
| Macro Logic     | Validates token, activates user, hashes password, links to lease, marks invite as accepted        |
| Watch-outs      | Token must be valid and not expired, prevents duplicate acceptance, updates user status to ACTIVE |
| Performance     | Multiple updates (user, invite, lease) in transaction                                             |

#### **9.2.2 Request Body Parameters**

| S.No | Field Name  | API Tag Name | Data Type | Remarks                        |
| ---- | ----------- | ------------ | --------- | ------------------------------ |
| 1    | email       | email        | String    | Required \- Tenant email       |
| 2    | token       | token        | String    | Required \- Invite token       |
| 3    | password    | password     | String    | Required \- New password       |
| 4    | firstName   | firstName    | String    | Required \- First name         |
| 5    | lastName    | lastName     | String    | Optional \- Last name          |
| 6    | phone       | phone        | String    | Optional \- Phone number       |
| 7    | companyName | companyName  | String    | Optional \- For vendor invites |
| 8    | serviceType | serviceType  | String    | Optional \- For vendor invites |

#### **9.2.3 Response Fields**

| S.No | Field Name     | API Tag Name   | Data Type | Remarks                |
| ---- | -------------- | -------------- | --------- | ---------------------- |
| 1    | success        | success        | Boolean   | Operation status       |
| 2    | message        | message        | String    | Success message        |
| 3    | user           | user           | Object    | Activated user details |
| 4    | user.id        | user.id        | String    | User ID                |
| 5    | user.email     | user.email     | String    | User email             |
| 6    | user.firstName | user.firstName | String    | First name             |
| 7    | user.lastName  | user.lastName  | String    | Last name              |
| 8    | user.phone     | user.phone     | String    | Phone number           |

#### **9.2.4 Request-Response Sample**

**POST Request:**

{

"email": "john.doe@example.com",

"token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",

"password": "SecureP@ssw0rd\!",

"firstName": "John",

"lastName": "Doe",

"phone": "+1234567890"

}

**POST Response (200):**

{

"success": true,

"message": "Invite accepted. Tenant account created and linked to lease.",

"user": {

    "id": "user\_xyz789",

    "email": "john.doe@example.com",

    "firstName": "John",

    "lastName": "Doe",

    "phone": "+1234567890"

}

}

#### **9.2.5 Error Handling**

**Handled Response:**

**400 Bad Request: Missing required fields**  
 { "error": "Email, token, password, and first name are required"}

-

**400 Bad Request: Invalid token**  
 { "error": "Invalid or expired invite"}

-

**400 Bad Request: Email** mismatch  
 { "error": "Invite email does not match"}

-

**400 Bad Request: Already accepted**  
 { "error": "Invite already used"}

-

**400 Bad Request: Expired**  
 { "error": "Invite has expired"}

-

**Un-Handled Response:**

- **500 Internal Server Error**

---

## **10\. Tenant Management APIs**

### 10.1 Tenant Listing with Financial Summary

API Name: Tenant Portfolio Management

API Description: Retrieves comprehensive tenant information including lease details and financial summaries.

#### **10.1.1 Work Unit Detail**

| Field           | Value                                                                        |
| --------------- | ---------------------------------------------------------------------------- |
| Job Code        | TM001                                                                        |
| Source System   | Property Management System                                                   |
| Target System   | Database (Prisma/PostgreSQL)                                                 |
| Objective       | List all tenants with lease and financial information                        |
| Periodicity     | On-demand                                                                    |
| Interface       | REST API                                                                     |
| URL             | http://localhost:3000/api/tenants                                            |
| Method Name     | GET                                                                          |
| Input Type      | None                                                                         |
| Output Type     | JSON                                                                         |
| Expected Output | Array of tenant objects with financial summaries                             |
| Macro Logic     | Joins leases with tenants, calculates total invoiced/paid/balance per tenant |
| Watch-outs      | Includes all leases, financial calculations from invoices and payments       |
| Performance     | Complex query with multiple relations and aggregations                       |

#### **10.1.2 Request Parameters**

**No request body required for GET operation.**

#### **10.1.3 Response Fields**

| S.No   | Field Name                                  | API Tag Name                                | Data Type    | Remarks                    |
| ------ | ------------------------------------------- | ------------------------------------------- | ------------ | -------------------------- |
| **1**  | **success**                                 | **success**                                 | **Boolean**  | **Operation status**       |
| **2**  | **data**                                    | **data**                                    | **Array**    | **Array of lease objects** |
| **3**  | **data\[\].id**                             | **data\[\].id**                             | **String**   | **Lease ID**               |
| **4**  | **data\[\].startDate**                      | **data\[\].startDate**                      | **DateTime** | **Lease start date**       |
| **5**  | **data\[\].endDate**                        | **data\[\].endDate**                        | **DateTime** | **Lease end date**         |
| **6**  | **data\[\].rentAmount**                     | **data\[\].rentAmount**                     | **Number**   | **Monthly rent**           |
| **7**  | **data\[\].leaseStatus**                    | **data\[\].leaseStatus**                    | **String**   | **Lease status**           |
| **8**  | **data\[\].tenant**                         | **data\[\].tenant**                         | **Object**   | **Tenant information**     |
| **9**  | **data\[\].tenant.id**                      | **data\[\].tenant.id**                      | **String**   | **Tenant user ID**         |
| **10** | **data\[\].tenant.name**                    | **data\[\].tenant.name**                    | **String**   | **Full name**              |
| **11** | **data\[\].tenant.email**                   | **data\[\].tenant.email**                   | **String**   | **Email address**          |
| **12** | **data\[\].property**                       | **data\[\].property**                       | **Object**   | **Property details**       |
| **13** | **data\[\].unit**                           | **data\[\].unit**                           | **Object**   | **Unit details**           |
| **14** | **data\[\].financialSummary**               | **data\[\].financialSummary**               | **Object**   | **Calculated financials**  |
| **15** | **data\[\].financialSummary.totalInvoiced** | **data\[\].financialSummary.totalInvoiced** | **Number**   | **Total invoiced amount**  |
| **16** | **data\[\].financialSummary.totalPaid**     | **data\[\].financialSummary.totalPaid**     | **Number**   | **Total paid amount**      |
| **17** | **data\[\].financialSummary.balance**       | **data\[\].financialSummary.balance**       | **Number**   | **Outstanding balance**    |

#### **10.1.4 Request-Response Sample**

**GET Request:**

**GET /api/tenants**

**GET Response (200):**

{

"success": true,

"data": \[

    {

      "id": "lease\_abc123",

      "startDate": "2025-12-01T00:00:00Z",

      "endDate": "2026-11-30T00:00:00Z",

      "rentAmount": 1500.00,

      "securityDeposit": 1500.00,

      "leaseStatus": "ACTIVE",

      "tenant": {

        "id": "user\_tenant456",

        "name": "John Doe",

        "email": "john.doe@example.com",

        "phone": "+1234567890"

      },

      "property": {

        "id": "prop\_def789",

        "name": "Sunset Apartments"

      },

      "unit": {

        "id": "unit\_ghi012",

        "unitNumber": "101"

      },

      "financialSummary": {

        "totalInvoiced": 4500.00,

        "totalPaid": 3000.00,

        "balance": 1500.00

      }

    },

    {

      "id": "lease\_xyz789",

      "startDate": "2025-11-01T00:00:00Z",

      "endDate": "2026-10-31T00:00:00Z",

      "rentAmount": 1200.00,

      "securityDeposit": 1200.00,

      "leaseStatus": "ACTIVE",

      "tenant": {

        "id": "user\_tenant789",

        "name": "Jane Smith",

        "email": "jane.smith@example.com",

        "phone": "+1987654321"

      },

      "property": {

        "id": "prop\_abc456",

        "name": "Downtown Lofts"

      },

      "unit": {

        "id": "unit\_def789",

        "unitNumber": "205"

      },

      "financialSummary": {

        "totalInvoiced": 3600.00,

        "totalPaid": 3600.00,

        "balance": 0.00

      }

    }

\]

}

#### **10.1.5 Error Handling**

**Handled Response:**

- **No specific error responses for GET operation**

**Un-Handled Response:**

**500 Internal Server Error**  
 { "success": false, "error": "Failed to fetch tenants"}

-

---

## **11\.** **Maintenance API**

The Maintenance API provides endpoints to **retrieve** and **create** maintenance requests for properties under a specific organization.  
 It supports two main operations:

- GET – Fetch all maintenance requests for an organization.

- POST – Create a new maintenance request.

#### **11.1.1** **Work Unit Detail**

- GET Method

| Job Code: L002 | SourceSystem: Rentflow360 | Target System: Rentflow360 |
| :------------- | :------------------------ | :------------------------- |

| Objective:           | To manage maintenance requests by fetching records tied to specific organizations, properties, and units                                                                                    |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Periodicity:**     | On-demand (triggered by user or system request)                                                                                                                                             |
| **Interface:**       | REST API                                                                                                                                                                                    |
| **URL:**             | http://localhost:3000/api/maintenance                                                                                                                                                       |
| **Method Name:**     | GET                                                                                                                                                                                         |
| **Input Type:**      | Get query parameter                                                                                                                                                                         |
| **Output Type:**     | JSON                                                                                                                                                                                        |
| **Expected Output:** | Returns maintenance request data                                                                                                                                                            |
| **Macro Logic:**     | Validate organization ID, query maintenance requests, include related property/unit/user info, return list.                                                                                 |
| **Watch-outs:**      | Missing organizationId returns 400 error. \- Invalid priority or category returns 400 error. \- User not associated with organization returns 403\. \- Missing database table returns 503\. |
| **Performance:**     | Depends on database query performance                                                                                                                                                       |

####

- #### **POST Method**

| Job Code: L002 | SourceSystem: Rentflow360 | Target System: Rentflow360 |
| :------------- | :------------------------ | :------------------------- |

| Objective:           | Create a new maintenance request.                                                                                                                                                            |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Periodicity:**     | On-demand (triggered by user or system request)                                                                                                                                              |
| **Interface:**       | REST API                                                                                                                                                                                     |
| **URL:**             | http://localhost:3000/api/maintenance                                                                                                                                                        |
| **Method Name:**     | POST                                                                                                                                                                                         |
| **Input Type:**      | JSON                                                                                                                                                                                         |
| **Output Type:**     | JSON                                                                                                                                                                                         |
| **Expected Output:** | Returns maintenance request data or confirmation of a newly created request.                                                                                                                 |
| **Macro Logic:**     | Validate fields, check user-organization link validate priority and category enums insert record into database, and return created record.                                                   |
| **Watch-outs:**      | Missing organization Id returns 400 error. \- Invalid priority or category returns 400 error. \- User not associated with organization returns 403\. \- Missing database table returns 503\. |
| **Performance:**     | Depends on database query performance                                                                                                                                                        |

####

#### **11.1.2** **Request Body Parameters**

| S.No | FieldName       | Api Tag Name   | DataType                                    | Remarks                                                                |
| :--: | :-------------- | :------------- | :------------------------------------------ | :--------------------------------------------------------------------- |
|  1   | Organization ID | organizationId | string                                      | Required – identifies the organization.                                |
|  2   | Property ID     | propertyId     | string                                      | Required – identifies the property where maintenance is requested      |
|  3   | Unit ID         | unitId         | string                                      | Required – identifies the unit within the property                     |
|  4   | User ID         | userid         | string                                      | Required – user creating the request; must belong to the organization. |
|  5   | Title           | title          | string                                      | Required – short summary of the maintenance request.                   |
|  6   | Description     | description    | String                                      | Required – detailed explanation of the maintenance issue.              |
|  7   | Priority        | priority       | Enum (LOW, NORMAL, HIGH, URGENT             | Optional – request urgency level.                                      |
|  8   | Category        | category       | Enum (EMERGENCY, URGENT, ROUTINE, STANDARD) | Optional – request classification.                                     |

#### **11.1.3** **Response Fields**

| S.No | FieldName    | Api Tag Name | DataType | Remarks                                                  |
| :--: | :----------- | :----------- | :------- | :------------------------------------------------------- |
|  1   | Request ID   | id           | string   | Unique identifier of the maintenance request.            |
|  2   | Title        | title        | string   | Maintenance request title.                               |
|  3   | Description  | description  | string   | Maintenance request details.                             |
|  4   | Property     | property     | Object   | Includes property ID, name, address, and city.           |
|  5   | Unit         | unit         | object   | includes unit ID, unit number, and name.                 |
|  6   | Created At   | createdAt    | DateTime | Timestamp when request was created.                      |
|  7   | Requested By | requestedBy  | Object   | includes user’s first name, last name, and email         |
|  8   | Priority     | priority     | string   | Priority level (LOW, NORMAL,HIGH,URGENT).                |
|  9   | Category     | category     | String   | Request category (EMERGENCY, URGENT, ROUTINE, STANDARD). |

#### **11.1.4** **Request \- Response Sample**

**GET REQUEST** \-\> GET /api/maintenance?organizationId=org_123

**GET RESPONSE \-\>**

\[

{

    "id": "req\_001",

    "title": "Leaking Faucet",

    "description": "The kitchen faucet is leaking.",

    "priority": "NORMAL",

    "category": "ROUTINE",

    "property": {

      "id": "prop\_001",

      "name": "Sunrise Apartments",

      "address": "123 Main St",

      "city": "New York"

    },

    "unit": {

      "id": "unit\_101",

      "unitNumber": "101"

    },

    "requestedBy": {

      "user": {

        "firstName": "Jane",

        "lastName": "Doe",

        "email": "jane.doe@example.com"

      }

    },

    "createdAt": "2025-11-12T10:15:00.000Z"

}

\]

**POST REQUEST \-\>**

{

"organizationId": "org_123",

"propertyId": "prop_001",

"unitId": "unit_101",

"userId": "user_456",

"title": "Air conditioner not cooling",

"description": "The AC in the living room is blowing warm air.",

"priority": "HIGH",

"category": "URGENT"

}

**POST RESPONSE \-\>**

{

"id": "req_002",

"organizationId": "org_123",

"propertyId": "prop_001",

"unitId": "unit_101",

"requestedById": "orgUser_456",

"title": "Air conditioner not cooling",

"description": "The AC in the living room is blowing warm air.",

"priority": "HIGH",

"category": "URGENT",

"createdAt": "2025-11-12T10:30:00.000Z"

}

#### **11.1.5** **Error Handling**

**Handled Response:**

| Type                     | Condition                       | Response                                                                                                   | Http status |
| :----------------------- | :------------------------------ | :--------------------------------------------------------------------------------------------------------- | :---------- |
| Handled Response         | Missing organizationId          | { "error": "organizationId is required" }                                                                  | 400         |
|                          | Missing required POST fields    | { "error": "Missing required fields" }                                                                     | 400         |
|                          | Invalid priority/category       | { "error": "Invalid priority value: MEDIUM" }                                                              | 400         |
|                          | User not in organisation        | { "error": "User is not associated with the organization" }                                                | 403         |
|                          | Missing table in Db             | { "error": "Maintenance requests feature not yet available" }                                              | 503         |
| **Un-Handled Response:** | Unexpected server or DB failure | { "error": "Failed to fetch maintenance requests" } or { "error": "Failed to create maintenance request" } | 500         |

#### **11.1.6** **Sample Postman Simulation**

GET Simulation

Method: GET

URL: {{baseUrl}}/api/maintenance?organizationId=org_123

Headers: Content-Type: application/json

Response: Returns list of maintenance requests.

POST Simulation

Method: POST

URL: {{baseUrl}}/api/maintenance

Headers: Content-Type: application/json

Body (raw JSON):

{

"organizationId": "org_123",

"propertyId": "prop_001",

"unitId": "unit_101",

"userId": "user_456",

"title": "Broken window latch",

"description": "Window latch in bedroom is jammed.",

"priority": "NORMAL",

"category": "ROUTINE"

}

## **11.2** **Maintenance Assignment API**

**API Name:** Assign Maintenance Request to Vendor

**API Description:** Assigns an existing maintenance request to a vendor, provided the request is still _OPEN_ and currently _unassigned_. Only users with the roles **PROPERTY_MANAGER** or **SYSTEM_ADMIN** are authorized to perform the assignment.

#### **11.2.1** **Work Unit Detail**

| Job Code: L002 | SourceSystem: Rentflow360 | Target System: Rentflow360 |
| :------------- | :------------------------ | :------------------------- |

| Objective:           | To securely assign an open maintenance request to a vendor within the same organization, preventing double-assignments using conditional updates                                                                                                                                                                                                                                                                   |
| :------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Periodicity:**     | On-demand (triggered by user action)                                                                                                                                                                                                                                                                                                                                                                               |
| **Interface:**       | REST API                                                                                                                                                                                                                                                                                                                                                                                                           |
| **URL:**             | /api/maintenance/{requestId}/assign                                                                                                                                                                                                                                                                                                                                                                                |
| **Method Name:**     | POST                                                                                                                                                                                                                                                                                                                                                                                                               |
| **Input Type:**      | JSON request body \+ path parameter \+ auth cookie token                                                                                                                                                                                                                                                                                                                                                           |
| **Output Type:**     | JSON response                                                                                                                                                                                                                                                                                                                                                                                                      |
| **Expected Output:** | \-Success confirmation and the updated maintenance request record\-Or standardized error responses (400, 401, 403, 404, 409, 500\)                                                                                                                                                                                                                                                                                 |
| **Macro Logic:**     | Read authentication token from cookies.Verify role (must be PROPERTY_MANAGER or SYSTEM_ADMIN).Extract requestId from URL path.Extract vendorId from body.Validate vendor exists and belongs to same organization.Perform **conditional update** to avoid race conditions Request must be OPEN Must not already be assigned If update successful → return updated maintenance request. If not, return 409 conflict. |
| **Watch-outs:**      | \-Uses updateMany to prevent race conditions. \-Vendor must belong to the same organization as the logged-in user \-Role-based authorization required                                                                                                                                                                                                                                                              |
| **Performance:**     | Lightweight database operations                                                                                                                                                                                                                                                                                                                                                                                    |

#### **11.2.2** **Request Body Parameters**

| S.No | FieldName | Api Tag Name | DataType      | Remarks                                           |
| :--: | :-------- | :----------- | :------------ | :------------------------------------------------ |
|  1   | Vendor ID | vendorId     | string (UUID) | Required; vendor must exist in same organization. |
|  2   | ID        | id           | string(UUID)  | Maintenance Request ID to be assigned             |
|  3   | token     |              | String        | Must contain a valid access token                 |

#### **11.2.3** **Response Fields**

| S.No | FieldName                | Api Tag Name | DataType | Remarks                                                               |
| :--: | :----------------------- | :----------- | :------- | :-------------------------------------------------------------------- |
|  1   | Success flag             | success      | boolean  | Always true in success.                                               |
|  2   | Maintenance Request Data | data         | Object   | Full updated record (includes property, unit, vendor, requester info. |

#### **11.2.4** **Request \- Response Sample**

POST Request

POST /api/maintenance/37d5a7f9-cec8-486b-ab8c-733d45d773d0/assign

       **Body:**

{

"vendorId": “VendorId_123"

}

POST Response (200)

{

"success": true,

"data": {

    "id": "37d5a-id",

    "organizationId": "999-id",

    "assigned\_vendor\_id": "4d-Id",

    "assigned\_at": "2025-11-18T10:22:14.221Z",

    "property": { "id": "...", "name": "..." },

    "unit": { "id": "...", "unitNumber": "..." },

    "requestedBy": {

      "user": { "firstName": "Larvene", "lastName": "Thomas" }

    },

    "vendors": {

      "user": { "firstName": "Mike", "lastName": "McLusky" }

    }

}

}

#### **11.2.5** **Error Handling**

**Handled Response:**

| Type                     | Condition                            | Response                                                                 | Http status |
| :----------------------- | :----------------------------------- | :----------------------------------------------------------------------- | :---------- |
| Unauthorized             | Missing/invalid token                | { "success": false, "error": "Unauthorized" }                            | 401         |
| Forbidden                | Role not allowed                     | { "success": false, "error": "Forbidden" }                               | 403         |
| Validation               | vendorId missing                     | { "success": false, "error": "vendorId is required" }                    | 400         |
| Not Found                | Vendor not in organization           | { "success": false, "error": "Vendor not found in your organization" }   | 404         |
| Conflict                 | Request not open or already assigned | { "success": false, "error": "Request is not open or already assigned" } | 409         |
| **Un-Handled Response:** | Internal Server Error                | { "success": false, "error": "Some server error message" }               | 500         |

## **12.1 Vendors APIs**

**API Name:** Vendors  
**API Description:** Provides vendor listing and vendor creation services for organizations. Supports filtering by organization, service type, and active status.

#### **12.1.2 Work Unit Detail**

- **GET method**

| Field           | Value                                                                                                                                                            |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Job Code        | VM001                                                                                                                                                            |
| Source System   | Property Management System                                                                                                                                       |
| Target System   | Database (Prisma/PostgreSQL)                                                                                                                                     |
| Objective       | Fetch vendors for an organization                                                                                                                                |
| Periodicity     | On-demand                                                                                                                                                        |
| Interface       | REST API                                                                                                                                                         |
| URL             | http://localhost:3000/api/vendors                                                                                                                                |
| Method Name     | GET                                                                                                                                                              |
| Input Type      | Get query Params                                                                                                                                                 |
| Output Type     | JSON                                                                                                                                                             |
| Expected Output | Array of vendor objects with user and organization details                                                                                                       |
| Macro Logic     | Filters vendors by optional parameters; includes user & organization info.                                                                                       |
| Watch-outs      | Duplicate vendor restriction per user & organization Optional filters must be handled carefully (isActive boolean parsing) Service type may be a free-text field |
| Performance     | Query is indexed by organizationId; includes relational joins.                                                                                                   |

- #### **POST method**

| Field           | Value                                                                                                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Job Code        | VM001                                                                                                                                                                  |
| Source System   | Property Management System                                                                                                                                             |
| Target System   | Database (Prisma/PostgreSQL)                                                                                                                                           |
| Objective       | Filter and register vendors for an organization                                                                                                                        |
| Periodicity     | On-demand                                                                                                                                                              |
| Interface       | REST API                                                                                                                                                               |
| URL             | http://localhost:3000/api/vendors                                                                                                                                      |
| Method Name     | POST                                                                                                                                                                   |
| Input Type      | JSON Body (POST)                                                                                                                                                       |
| Output Type     | JSON                                                                                                                                                                   |
| Expected Output | Array of vendor objects with user and organization details                                                                                                             |
| Macro Logic     | Validates input and ensures vendor uniqueness creates vendor record.                                                                                                   |
| Watch-outs      | Duplicate vendor restriction per user & organization \- Optional filters must be handled carefully (isActive boolean parsing) \- Service type may be a free-text field |
| Performance     | Query is indexed by organizationId; includes relational joins.                                                                                                         |

**12.1.2 Request Body Parameters**

**12.1.1 Get Request Body Parameters**

| S.No | FieldName       | Api Tag Name   | DataType                          | Remarks         |
| :--: | :-------------- | :------------- | :-------------------------------- | :-------------- |
|  1   | Organization Id | organisationId | String                            | Optional filter |
|  2   | Service Type    | servicetype    | String                            | Optional filter |
|  3   | Active Status   | isActive       | Boolean (true or false as string) | Optional filter |

**12.1.2 Post Request Body Parameters**

| S.No | FieldName       | Api Tag Name   | DataType | Remarks  |
| :--: | :-------------- | :------------- | :------- | :------- |
|  1   | Organization Id | organisationId | String   | Required |
|  2   | User Id         | userId         | String   | Required |
|  3   | Company Name    | companyName    | String   | Required |
|  4   | Service Type    | serviceType    | String   | Required |
|  6   | Phone           | phone          | String   | Optional |
|  7   | Email           | email          | String   | Optional |

#### **12.1.3 Response Fields**

| S.No   | Field Name               | API Tag Name       | Data Type    | Remarks                                |
| ------ | ------------------------ | ------------------ | ------------ | -------------------------------------- |
| **1**  | **Vendor Id**            | **id**             | **String**   | **Unique vendor identifier**           |
| **2**  | **Organization Id**      | **organizationId** | **String**   | **Owning organization**                |
| **3**  | **User Id**              | **userid**         | **String**   | **Linked User**                        |
| **4**  | **Company Name**         | **companyName**    | **String**   | **Vendor business name**               |
| **5**  | **Service Type**         | **servicetype**    | **String**   | **Eg, Plumbing**                       |
| **6**  | **Phone**                | **phone**          | **String**   | **Contact number**                     |
| **7**  | **Email**                | **email**          | **String**   | **Vendor email**                       |
| **8**  | **Active Status**        | **isActive**       | **Boolean**  | **Vendor status**                      |
| **9**  | **Created At**           | **createdAT**      | **DateTime** | **Record Creation Timestamp**          |
| **10** | **updatedAt**            | **updateAt**       | **DateTime** | **Last update timestamp**              |
| **11** | **User Details**         | **user**           | **Object**   | **Includes firstName, lastName email** |
| **12** | **Organization Details** | **organization**   | **Object**   | **Includes id and name**               |

#### **12.1.4 Request-Response Sample**

GET Request

**GET** /api/vendors?organizationId=orgId

GET Response (200)

\[

{

    "id": "932-id",

    "organizationId": "999-is",

    "userId": "a9c-id",

    "companyName": "Thomas Eagan",

    "serviceType": "General Services",

    "phone": "Thomaseagan@gmail.com",

    "email": "thomaseagan@gmail.com",

    "isActive": true,

    "createdAt": "2025-11-18T12:42:52.413Z",

    "updatedAt": "2025-11-18T12:42:52.413Z",

    "user": {

      "firstName": "Thomas",

      "lastName": "Eagan",

      "email": "thomaseagan@gmail.com"

    },

    "organization": {

      "id": "99-id,

      "name": "leslie's Company"

    }

}

\]

---

POST Request

{

"organizationId": "999-id",

"userId": "2e4-id",

"companyName": "Landscaping Pros",

"serviceType": "Landscaping",

"phone": "+254 712 345 678",

"email": "support@landscapingpros.com"

}

POST Response (201)

{

"id": "e1a-id",

"organizationId": "999-id",

"userId": "2e4-id",

"companyName": "Landscaping Pros",

"serviceType": "Landscaping",

"phone": "+254 712 345 678",

"email": "support@landscapingpros.com",

"isActive": true,

"createdAt": "2025-11-19T09:15:22.000Z",

"updatedAt": "2025-11-19T09:15:22.000Z"

}

#### **12.1.5 Error Handling**

**Handled Response:**

| Type                     | Condition                                 | Response                                                               | Http status |
| :----------------------- | :---------------------------------------- | :--------------------------------------------------------------------- | :---------- |
| Handled Response         | Missing required POST field               | { "error": "Missing required fields" }                                 | 400         |
|                          | Duplicate vendor                          | { "error": "Vendor already exists for this user in the organization" } | 409         |
|                          | General fetch failure                     | { "error": "Failed to fetch vendor data" }                             | 500         |
|                          | Create Vendor Failure                     | { "error": "Failed to create vendor" }                                 | 500         |
| **Un-Handled Response:** | Internal server error during vendor fetch | { "error": "Failed to fetch vendor data" }                             | 500         |

## **12.2 Single Vendor Retrieval API**

## **12.2.1 Fetch Vendor by User & Organization**

**API Name:** Vendor Detail Lookup  
**API Description:** Retrieves a single vendor record for the specified userId and organizationId.

#### **12.2.2 Work Unit Detail**

| Field           | Value                                                                                                    |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| Job Code        | VM001                                                                                                    |
| Source System   | Property Management System                                                                               |
| Target System   | Database (Prisma/PostgreSQL)                                                                             |
| Objective       | List, filter, and register vendors for an organization                                                   |
| Periodicity     | On-demand                                                                                                |
| Interface       | REST API                                                                                                 |
| URL             | /api/vendor                                                                                              |
| Method Name     | GET                                                                                                      |
| Input Type      | Query Parameters                                                                                         |
| Output Type     | JSON                                                                                                     |
| Expected Output | Single vendor object matching the criteria                                                               |
| Macro Logic     | Validate params → search vendor by userId & organizationId → return result or errors                     |
| Watch-outs      | \-Both parameters required \- No relational includes in this endpoint \- Returns 404 if vendor not found |
| Performance     | Single-row lookup using indexed fields                                                                   |

**12.2.2 Request Body Parameters**

**Get Request Body Parameters**

| S.No | FieldName       | Api Tag Name   | DataType | Remarks  |
| :--: | :-------------- | :------------- | :------- | :------- |
|  1   | Organization ID | organisationId | String   | Required |
|  2   | User ID         | userId         | String   | Required |

#### **12.2.3 Response Fields**

| S.No   | Field Name          | API Tag Name       | Data Type    | Remarks                       |
| ------ | ------------------- | ------------------ | ------------ | ----------------------------- |
| **1**  | **Vendor Id**       | **id**             | **String**   | **Unique vendor identifier**  |
| **2**  | **Organization Id** | **organizationId** | **String**   | **Owning organization**       |
| **3**  | **User Id**         | **userid**         | **String**   | **Linked User**               |
| **4**  | **Company Name**    | **companyName**    | **String**   | **Vendor business name**      |
| **5**  | **Service Type**    | **servicetype**    | **String**   | **Eg, Plumbing**              |
| **6**  | **Phone**           | **phone**          | **String**   | **Contact number**            |
| **7**  | **Email**           | **email**          | **String**   | **Vendor email**              |
| **8**  | **Active Status**   | **isActive**       | **Boolean**  | **Vendor status**             |
| **9**  | **Created At**      | **createdAT**      | **DateTime** | **Record Creation Timestamp** |
| **10** | **updatedAt**       | **updateAt**       | **DateTime** | **Last update timestamp**     |

####

#### **12.2.4 Request-Response Sample**

GET Request

GET /api/vendor?organizationId=999baab5-a755-4e00-a58e-7d5789be7445\&userId=2e4ae432-84a9-4196-ba88-4d63b96fc2b5

GET Response (200)

{

"id": "37d9-id",

"organizationId": "999-id",

"userId": "2e4=id",

"companyName": "N/A",

"serviceType": "Landscaping",

"phone": "+254 742 594 202",

"email": "larvenethomas@gmail.com",

"isActive": true,

"createdAt": "2025-11-12T02:53:25.577Z",

"updatedAt": "2025-11-12T02:53:25.577Z"

}

#### **12.2.5 Error Handling**

**Handled Response:**

| Type                     | Condition                        | Response                                        | Http status |
| :----------------------- | :------------------------------- | :---------------------------------------------- | :---------- |
| Handled Response         | Missing userId or organizationId | { "error": "Missing userId or organizationId" } | 400         |
|                          | Vendor not found                 | { "error": "Vendor not found" }                 | 404         |
| **Un-Handled Response:** | Internal server error            | { "error": "Unknown server error" }             | 500         |

## **13\. Property APIs**

### 13.1 Lease Management

API Name: Property Management

API Description: Comprehensive property management including creation, retrieval, updates, and deleting.

#### **13.1.1 Work Unit Detail**

- **GET method**

| Field           | Value                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------------- |
| Job Code        | PM001                                                                                               |
| Source System   | Property Management System                                                                          |
| Target System   | Database (Prisma/PostgreSQL)                                                                        |
| Objective       | Fetch property with ID                                                                              |
| Periodicity     | On-demand                                                                                           |
| Interface       | REST API                                                                                            |
| URL             | & http://localhost:3000/api/propertymanager/${id}                                                   |
| Method Name     | GET                                                                                                 |
| Input Type      | JSON                                                                                                |
| Output Type     | JSON                                                                                                |
| Expected Output | Property object with unit summary and relations                                                     |
| Macro Logic     | Queries the DB to get property details Checks property existence Returns formatted property details |
| Watch-outs      | Application must be APPROVED prevents duplicate lease per application                               |
| Performance     | Complex queries with multiple relations and                                                         |

####

####

- #### **POST method**

####

| Field           | Value                                                                                                             |
| --------------- | ----------------------------------------------------------------------------------------------------------------- |
| Job Code        | PM001                                                                                                             |
| Source System   | Property Management System                                                                                        |
| Target System   | Database (Prisma/PostgreSQL)                                                                                      |
| Objective       | Create and manage property                                                                                        |
| Periodicity     | On-demand                                                                                                         |
| Interface       | REST API                                                                                                          |
| URL             | http://localhost:3000/api/propertymanager & http://localhost:3000/api/propertymanager/${id}                       |
| Method Name     | POST                                                                                                              |
| Input Type      | JSON                                                                                                              |
| Output Type     | JSON                                                                                                              |
| Expected Output | Property object with unit summary and relations                                                                   |
| Macro Logic     | Creates property , from approved application, calculates financial summaries, prevents duplicate leases           |
| Watch-outs      | Application must be APPROVED, prevents duplicate lease per application, calculates balance from invoices/payments |
| Performance     | Complex queries with multiple relations and calculations                                                          |

####

- **PATCH method**

####

| Field           | Value                                                                                                             |
| --------------- | ----------------------------------------------------------------------------------------------------------------- |
| Job Code        | PM001                                                                                                             |
| Source System   | Property Management System                                                                                        |
| Target System   | Database (Prisma/PostgreSQL)                                                                                      |
| Objective       | Create and manage property                                                                                        |
| Periodicity     | On-demand                                                                                                         |
| Interface       | REST API                                                                                                          |
| URL             | http://localhost:3000/api/propertymanager & http://localhost:3000/api/propertymanager/${id}                       |
| Method Name     | PATCH                                                                                                             |
| Input Type      | JSON                                                                                                              |
| Output Type     | JSON                                                                                                              |
| Expected Output | Property object with unit summary and relations                                                                   |
| Macro Logic     | Creates property , from approved application, calculates financial summaries, prevents duplicate leases           |
| Watch-outs      | Application must be APPROVED, prevents duplicate lease per application, calculates balance from invoices/payments |
| Performance     | Complex queries with multiple relations and calculations                                                          |

####

- **DELETE method**

####

| Field           | Value                                                                                                             |
| --------------- | ----------------------------------------------------------------------------------------------------------------- |
| Job Code        | PM001                                                                                                             |
| Source System   | Property Management System                                                                                        |
| Target System   | Database (Prisma/PostgreSQL)                                                                                      |
| Objective       | Create and manage property                                                                                        |
| Periodicity     | On-demand                                                                                                         |
| Interface       | REST API                                                                                                          |
| URL             | http://localhost:3000/api/propertymanager & http://localhost:3000/api/propertymanager/${id}                       |
| Method Name     | DELETE                                                                                                            |
| Input Type      | JSON                                                                                                              |
| Output Type     | JSON                                                                                                              |
| Expected Output | Property object with unit summary and relations                                                                   |
| Macro Logic     | Creates property , from approved application, calculates financial summaries, prevents duplicate leases           |
| Watch-outs      | Application must be APPROVED, prevents duplicate lease per application, calculates balance from invoices/payments |
| Performance     | Complex queries with multiple relations and calculations                                                          |

####

#### **13.1.2 Request Body Parameters (POST)**

####

| S.No | Field Name          | API Tag Name                   | Data Type        | Remarks                                                                 |
| ---- | ------------------- | ------------------------------ | ---------------- | ----------------------------------------------------------------------- |
| 1    | Listing ID          | listingId                      | String / Null    | Optional — External listing reference                                   |
| 2    | Manager ID          | managerId                      | String           | Required — Must be a valid organizationUser ID                          |
| 3    | Property Name       | name                           | String           | Required — Name of the property                                         |
| 4    | Property Type ID    | propertyTypeId                 | String           | Required — Must match an existing propertyType (e.g., apartment, house) |
| 5    | Location ID         | locationId                     | String / Null    | Optional — FK to location entity                                        |
| 6    | Country             | country                        | String           | Required                                                                |
| 6    | City                | city                           | String           | Required                                                                |
| 7    | Zip code            | zipCode                        | String           | Required                                                                |
| 7    | Address             | address                        | String           | Required                                                                |
| 8    | Amenities           | amenities                      | Array of Strings | Optional list of amenities (\["Pool","Parking"\])                       |
| 9    | Furnished Status    | isFurnished                    | Boolean          | Optional — Default false if not supplied                                |
| 10   | Availability Status | availabilityStatus             | String           | Optional — e.g., "AVAILABLE", "OCCUPIED"                                |
| 11   | Property Details    | propertyDetails                | Object           | Required depending on property type                                     |
| 11a  | Building Name       | propertyDetails.buildingName   | String           | Apartment only — Optional                                               |
| 11b  | Total Floors        | propertyDetails.totalFloors    | Number           | Apartment only — Optional                                               |
| 11c  | Total Units         | propertyDetails.totalUnits     | Number           | Apartment only — Used to autogenerate units                             |
| 11d  | House Name          | propertyDetails.houseName      | String           | House only — Optional                                                   |
| 11e  | Number of Floors    | propertyDetails.numberOfFloors | Number           | House only — Optional                                                   |
| 11f  | Bedrooms            | propertyDetails.bedrooms       | Number           | House only — Optional                                                   |
| 11g  | Bathrooms           | propertyDetails.bathrooms      | Number           | House only — Optional                                                   |
| 11h  | Size                | propertyDetails.size           | Number           | House only — Optional                                                   |
| 11i  | Total Units         | propertyDetails.totalUnits     | Number           | House — Required to generate units (defaults to 1 if missing)           |

####

####

####

#### **13.1.3 Response Body Parameters (POST)**

| S.No | Field Name          | API Field Name     | Data Type        | Remarks                             |
| ---- | ------------------- | ------------------ | ---------------- | ----------------------------------- |
| 1    | Property ID         | id                 | String           | Auto-generated UUID                 |
| 2    | Listing ID          | listingId          | String / Null    | Optional external reference         |
| 3    | Manager ID          | managerId          | String           | FK → organizationUser               |
| 4    | Organization ID     | organizationId     | String           | Derived from manager’s organization |
| 5    | Name                | name               | String           | Property name                       |
| 6    | Property Type ID    | propertyTypeId     | String           | FK → propertyType                   |
| 7    | Location ID         | locationId         | String / Null    | Optional                            |
| 8    | City                | city               | String / Null    | Optional                            |
| 9    | Address             | address            | String / Null    | Optional                            |
| 10   | Amenities           | amenities          | Array of Strings | Optional list of amenities          |
| 11   | Furnished Status    | isFurnished        | Boolean          | Indicates if property is furnished  |
| 12   | Availability Status | availabilityStatus | String           | e.g., "AVAILABLE", "OCCUPIED"       |
| 13   | Created Timestamp   | createdAt          | DateTime String  | ISO timestamp                       |
| 14   | Updated Timestamp   | updatedAt          | DateTime String  | ISO timestamp                       |

####

#### **13.1.4 Response Body Parameters (GET) \- Property**

####

| S.No  | Field Name        | API Tag Name | Data Type   | Description                                      |
| ----- | ----------------- | ------------ | ----------- | ------------------------------------------------ |
| **1** | Property ID       | id           | String      | Unique identifier of the property                |
| **2** | Property Name     | name         | String      | Name of the property                             |
| **3** | Property Location | location     | String      | Physical address or general area                 |
| **4** | Description       | description  | String      | Optional property description                    |
| **5** | Created Date      | createdAt    | Date/String | ISO timestamp when the property was created      |
| **6** | Updated Date      | updatedAt    | Date/String | ISO timestamp when the property was last updated |

####

#### **13.1.5 Response Body Parameters (GET) \- Units**

| S.No | Field Name        | API Tag Name                 | Data Type | Description                          |
| ---- | ----------------- | ---------------------------- | --------- | ------------------------------------ |
| 1    | Total Units       | unitSummary.totalUnits       | Number    | Total units assigned to the property |
| 2    | Occupied Units    | unitSummary.occupiedUnits    | Number    | Units currently occupied             |
| 3    | Vacant Units      | unitSummary.vacantUnits      | Number    | Units available/vacant               |
| 4    | Maintenance Units | unitSummary.maintenanceUnits | Number    | Units marked for maintenance         |

#### **13.1.6 Unit Object Fields**

| Field        | API Tag Name | Type           | Description                        |
| ------------ | ------------ | -------------- | ---------------------------------- |
| Unit ID      | id           | String         | Unique ID of the unit              |
| Unit Number  | unitNumber   | String         | Unit label (e.g., "A1", "3B")      |
| Unit Type    | type         | String         | e.g., "1 Bedroom", "Studio"        |
| Rent Amount  | rentAmount   | Number         | Base monthly rent                  |
| Status       | status       | String         | VACANT, OCCUPIED, or MAINTENANCE   |
| Tenant       | tenant       | Object or null | Current tenant if unit is occupied |
| Active Lease | activeLease  | Object or null | Current lease details              |

#### **13.1.4 Request-Response Sample**

**POST Request:**

**1)Apartment complex type**

{

"listingId": "LIST123",

"managerId": "orguser_55",

"name": "Sunset Apartments",

"propertyTypeId": "ptype_apartment",

"locationId": "loc_21",

"city": "Nairobi",

"address": "Waiyaki Way",

"amenities": \["Pool", "Security"\],

"isFurnished": false,

"availabilityStatus": "AVAILABLE",

"propertyDetails": {

    "buildingName": "Block A",

    "totalFloors": 10,

    "totalUnits": 40

}

}

**2)House detail structure**

{

"listingId": "LIST789",

"managerId": "orguser_89",

"name": "Green Villa",

"propertyTypeId": "ptype_house",

"locationId": "loc_11",

"city": "Nakuru",

"address": "Section 58",

"amenities": \["Parking"\],

"isFurnished": true,

"availabilityStatus": "OCCUPIED",

"propertyDetails": {

    "houseName": "Villa 12A",

    "numberOfFloors": 2,

    "bedrooms": 4,

    "bathrooms": 3,

    "size": 2400,

    "totalUnits": 2

}

}

**POST Response (201):**

{

"message": "Property created successfully",

"property": {

    "id": "string",

    "listingId": "string | null",

    "managerId": "string",

    "organizationId": "string",

    "name": "string",

    "propertyTypeId": "string",

    "locationId": "string | null",

    "city": "string | null",

    "address": "string | null",

    "amenities": \[ "string" \],

    "isFurnished": true,

    "availabilityStatus": "AVAILABLE|UNAVAILABLE",

    "createdAt": "2025-01-01T00:00:00.000Z",

    "updatedAt": "2025-01-01T00:00:00.000Z"

}

}

**GET Response with Property details (200):**

\[

{

    "id": "string",

    "name": "Sunset Apartments",

    "city": "Nairobi",

    "address": "Waiyaki Way",

    "type": "Apartment",

    "isFurnished": false,

    "availabilityStatus": "AVAILABLE",

    "details": {

      "id": "string",

      "buildingName": "Block A",

      "totalFloors": 10,

      "totalUnits": 40

    },

    "totalUnits": 40,

    "manager": {

      "id": "string",

      "email": "manager@example.com",

      "firstName": "Sly",

      "lastName": "John",

      "role": "PROPERTY\_MANAGER"

    },

    "organization": {

      "id": "string",

      "name": "Real Estate Ltd",

      "slug": "real-estate-ltd"

    },

    "createdAt": "2025-01-01T00:00:00.000Z"

}

\]

**PUT Response (200 — Property Updated)**

{

"message": "Property updated successfully",

"property": {

    "id": "prop\_123",

    "listingId": null,

    "managerId": "orguser\_55",

    "organizationId": "org\_88",

    "propertyTypeId": "ptype\_apartment",

    "locationId": "loc\_44",

    "name": "Greenview Residency",

    "city": "Nairobi",

    "address": "Kilimani",

    "isFurnished": false,

    "availabilityStatus": "AVAILABLE",

    "createdAt": "2024-11-01T08:00:00.000Z",

    "updatedAt": "2024-11-02T10:30:00.000Z"

}

}

#### **13.1.5 Error Handling**

**Handled Response:**

**400 — Missing Required Data**  
{

"error": "Manager ID is required"

}

{

"error": "Invalid propertyTypeId"

}

### **401 — Unauthorized** {

### "error": "Unauthorized"

### }

**404 — Property Not Found**  
{

"error": "Property not found"

}

### **500 — Server Error**

{

"error": "Failed to create property",

"details": "error message"

}

## **14\. Invoice APIs**

API Name: Invoice Management

API Description: Comprehensive invoice management including creation and retrieval.

| Field           | Value                                                                                                                                                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Job Code        | INV001                                                                                                                                                                                                                                      |
| Source System   | Property Management System                                                                                                                                                                                                                  |
| Target System   | Database (Prisma/PostgreSQL)                                                                                                                                                                                                                |
| Objective       | Create, manage, and retrieve invoices for leases (rent and utilities)                                                                                                                                                                       |
| Periodicity     | On-demand                                                                                                                                                                                                                                   |
| Interface       | REST API                                                                                                                                                                                                                                    |
| URL             | /api/invoices /api/invoices/${id} /api/invoices/utilities/:leaseId /api/tenants/:tenantId/invoices                                                                                                                                          |
| Method Name     | POST, GET                                                                                                                                                                                                                                   |
| Input Type      | JSON                                                                                                                                                                                                                                        |
| Output Type     | JSON                                                                                                                                                                                                                                        |
| Expected Output | Invoice object with lease, tenant, property, unit, utilities, and financial summary details. For grouped endpoints, invoices are grouped by lease and due date.                                                                             |
| Macro Logic     | \- Generate invoices for rent or utilities- Auto-calculate amounts (rent from lease, utilities from fixed/metered rates)- Include payments for balance calculation- Group invoices by lease and due date if needed                          |
| Watch-outs      | \- Lease must exist and be active- For utility invoices, ensure utilities are linked to the lease- Correctly calculate due dates based on paymentFrequency and paymentDueDay- Handle multiple statuses (PENDING, OVERDUE) for GET filtering |

#### **14.1.2 Response Body Parameters (POST)**

| S.No | Field Name    | API Tag Name | Type                    | Description                                                          |
| ---- | ------------- | ------------ | ----------------------- | -------------------------------------------------------------------- |
| 1    | Invoice ID    | id           | String                  | Unique identifier for the created invoice                            |
| 2    | Lease ID      | lease_id     | String                  | ID of the lease associated with this invoice                         |
| 3    | Type          | type         | String (RENT / UTILITY) | Type of invoice                                                      |
| 4    | Amount        | amount       | Number                  | Total amount for the invoice                                         |
| 5    | Due Date      | dueDate      | String (ISO date)       | Invoice due date                                                     |
| 6    | Status        | status       | String (PENDING)        | Default status on creation                                           |
| 7    | Created At    | createdAt    | String (ISO date)       | Timestamp of invoice creation                                        |
| 8    | Updated At    | updatedAt    | String (ISO date)       | Timestamp of last update                                             |
| 9    | Invoice Items | InvoiceItem  | Array of Objects        | List of individual items (for utility invoices or manual breakdowns) |

####

#### **14.1.2 Request Body Parameters (POST)**

| S.No | Field Name    | API Tag Name | Data Type               | Required                         | Remarks                                                                 |
| ---- | ------------- | ------------ | ----------------------- | -------------------------------- | ----------------------------------------------------------------------- |
| 1    | Lease ID      | lease_id     | String                  | Yes                              | ID of the lease to generate invoice for                                 |
| 2    | Type          | type         | String (RENT / UTILITY) | Yes                              | Type of invoice: RENT or UTILITY                                        |
| 3    | Amount        | amount       | Number                  | Required for manual invoice only | Amount to charge for this invoice                                       |
| 4    | Due Date      | dueDate      | Date/String             | Required for manual invoice only | Invoice due date                                                        |
| 5    | Invoice Items | InvoiceItem  | Array                   | Optional                         | For utility invoices, list of utility items with description and amount |

#### **14.1.3 Response Body Parameters (GET)**

| S.No | Field Name    | API Tag Name | Type                            | Description                                             |
| ---- | ------------- | ------------ | ------------------------------- | ------------------------------------------------------- |
| 1    | Invoice ID    | id           | String                          | Unique invoice ID                                       |
| 2    | Lease ID      | lease_id     | String                          | ID of the lease associated with the invoice             |
| 3    | Type          | type         | String (RENT / UTILITY)         | Type of invoice                                         |
| 4    | Amount        | amount       | Number                          | Total invoice amount                                    |
| 5    | Due Date      | dueDate      | String (ISO date)               | Invoice due date                                        |
| 6    | Status        | status       | String (PENDING, PAID, OVERDUE) | Current invoice status                                  |
| 7    | Created At    | createdAt    | String (ISO date)               | Timestamp of invoice creation                           |
| 8    | Updated At    | updatedAt    | String (ISO date)               | Timestamp of last update                                |
| 9    | Invoice Items | InvoiceItem  | Array                           | List of individual items for utility or manual invoices |

#### **14.2.1 Request Body Parameters (POST)**

**Automatic Invoice Generation**

{  
 "lease_id": "lease_12345",  
 "type": "RENT"  
}

**Manual Invoice Generation**

{  
 "lease_id": "lease_12345",  
 "type": "UTILITY",  
 "amount": 1500,  
 "dueDate": "2025-12-31T00:00:00.000Z"  
}

#### **14.2.2 Successful Response (201 Created)**

{  
 "id": "inv_98765",  
 "lease_id": "lease_12345",  
 "type": "RENT",  
 "amount": 5000,  
 "dueDate": "2025-12-05T00:00:00.000Z",  
 "status": "PENDING",  
 "createdAt": "2025-11-24T12:00:00.000Z",  
 "updatedAt": "2025-11-24T12:00:00.000Z",  
 "InvoiceItem": \[  
 {  
 "id": "item_001",  
 "description": "Water",  
 "amount": 200  
 },  
 {  
 "id": "item_002",  
 "description": "Electricity",  
 "amount": 300  
 }  
 \],  
 "Lease": {  
 "id": "lease_12345",  
 "tenant": {  
 "firstName": "John",  
 "lastName": "Doe",  
 "email": "john.doe@example.com"  
 },  
 "property": {  
 "id": "prop_001",  
 "name": "Sunset Apartments",  
 "address": "123 Main St, Nairobi",  
 "buildingName": "Sunset Block A"  
 },  
 "unit": {  
 "id": "unit_101",  
 "unitNumber": "101"  
 },  
 "lease_utility": \[  
 {  
 "id": "util_001",  
 "name": "Water",  
 "type": "METERED",  
 "fixedAmount": 0,  
 "unitPrice": 50,  
 "isTenantResponsible": true,  
 "lastReading": 20  
 }  
 \]  
 },  
 "financialSummary": {  
 "totalPaid": 0,  
 "balance": 5000,  
 "isPaid": false,  
 "isOverdue": false  
 },  
 "buildingName": "Sunset Block A"  
}

#### **14.2.3 Response Body Parameters (GET)**

\[  
 {  
 "lease_id": "lease_12345",  
 "date": "2025-12-05",  
 "totalAmount": 5000,  
 "totalPaid": 0,  
 "tenant": {  
 "firstName": "John",  
 "lastName": "Doe",  
 "email": "john.doe@example.com"  
 },  
 "property": {  
 "id": "prop_001",  
 "name": "Sunset Apartments",  
 "address": "123 Main St, Nairobi"  
 },  
 "unit": {  
 "id": "unit_101",  
 "unitNumber": "101"  
 },  
 "invoices": \[  
 {  
 "id": "inv_98765",  
 "lease_id": "lease_12345",  
 "type": "RENT",  
 "amount": 5000,  
 "dueDate": "2025-12-05T00:00:00.000Z",  
 "status": "PENDING",  
 "InvoiceItem": \[  
 {  
 "id": "item_001",  
 "description": "Water",  
 "amount": 200  
 },  
 {  
 "id": "item_002",  
 "description": "Electricity",  
 "amount": 300  
 }  
 \],  
 "financialSummary": {  
 "totalPaid": 0,  
 "balance": 5000,  
 "isPaid": false,  
 "isOverdue": false  
 },  
 "buildingName": "Sunset Block A"  
 }  
 \]  
 }  
\]

#### **14.2.4. 400 — Missing Required Data**

{  
 "error": "lease_id and type are required"  
}

#### **14.2.5. 401 — Unauthorized**

{  
 "error": "Unauthorized"  
}

#### **14.2.6. 404 — Resource Not Found**

####

{  
 "error": "Lease not found"  
}

#### **14.2.7. 500 — Server Error**

#### **{**

#### **"error": "Failed to generate utility invoice",**

#### **"details": "Database connection error"**

#### **}**

## 15. Authentication & Security APIs

### 15.1 User Registration (Enhanced)

**API Name:** Transactional User Registration  
**Endpoint:** `/api/auth/register`  
**Method:** `POST`

Creates a new user and conditionally creates an organization within a single
atomic transaction. Triggers an email verification workflow.

#### Work Unit Detail

| Field        | Value                     |
| ------------ | ------------------------- |
| Job Code     | AUTH001                   |
| Source       | Frontend (Web)            |
| Target       | Prisma DB + Email Service |
| Interface    | REST                      |
| Input        | JSON                      |
| Output       | JSON (201 Created)        |
| Side Effects | Verification email sent   |

---

**Watch-outs: Ensure id is a valid integer; handle non-existent service.**  
 **Performance: Fast; single DB query**

---

### **1.2 Request Body Parameters**

**None (ID passed as URL parameter)**

---

### **1.3 Response Fields**

| S.No  | FieldName       | Api Tag Name    | DataType    | Remarks                          |
| ----- | --------------- | --------------- | ----------- | -------------------------------- |
| **1** | **id**          | **id**          | **integer** | **Service ID**                   |
| **2** | **name**        | **name**        | **string**  | **Name of the service**          |
| **3** | **description** | **description** | **string**  | **Description of the service**   |
| **4** | **categories**  | **categories**  | **object**  | **Related category information** |

---

### **1.4 Request \- Response Sample**

**Request:**

**GET /api/services/1**

**Response:**

**{**  
 **"id": 1,**  
 **"name": "Recycling Pickup",**  
 **"description": "Pickup service for recyclable waste",**  
 **"categories": {**  
 **"id": 2,**  
 **"name": "Waste Management"**  
 **}**  
**}**

---

### **1.5 Error Handling**

**Handled Response:**

- **404 Service not found**

- **500 Database error**

**Un-Handled Response:**

- **Invalid ID format**

---

### **1.6 Sample Postman Simulation**

- **Method: GET**

- **URL: http://localhost:3000/api/services/1**

- **Headers: Content-Type: application/json**

---

# **2\. Update Service**

**API Name: Update Service**  
 **API Description: Updates an existing service record by ID.**

### **1.1 Work Unit Detail**

- **Job Code: SVC002**

- **Source System: property management system**

- **Target System: Database**

**Objective: Update service attributes using provided data.**  
 **Periodicity: On-demand**  
 **Interface: REST API**  
 **URL: /api/services/\[id\]**  
 **Method Name: PUT**  
 **Input Type: JSON Body**  
 **Output Type: JSON**  
 **Expected Output: Updated service object**  
 **Macro Logic: Update service fields in DB; return updated service.**  
 **Watch-outs: Ensure id exists; validate all input fields.**  
 **Performance: Fast; single DB update query**

---

### **1.2 Request Body Parameters**

| S.No  | FieldName       | Api Tag Name    | DataType    | Remarks                   |
| ----- | --------------- | --------------- | ----------- | ------------------------- |
| **1** | **category_id** | **category_id** | **integer** | **Service category ID**   |
| **2** | **name**        | **name**        | **string**  | **Name of the service**   |
| **3** | **description** | **description** | **string**  | **Service description**   |
| **4** | **features**    | **features**    | **string**  | **Optional features**     |
| **5** | **impact**      | **impact**      | **string**  | **Optional impact info**  |
| **6** | **icon**        | **icon**        | **string**  | **URL or icon reference** |

---

### **1.3 Response Fields**

| S.No  | FieldName       | Api Tag Name    | DataType    | Remarks                 |
| ----- | --------------- | --------------- | ----------- | ----------------------- |
| **1** | **id**          | **id**          | **integer** | **Service ID**          |
| **2** | **category_id** | **category_id** | **integer** | **Updated category ID** |
| **3** | **name**        | **name**        | **string**  | **Updated name**        |
| **4** | **description** | **description** | **string**  | **Updated description** |

---

### **1.4 Request \- Response Sample**

**Request:**

**PUT /api/services/1**  
**{**  
 **"category_id": 2,**  
 **"name": "Recycling Pickup Updated",**  
 **"description": "Updated pickup service",**  
 **"features": "Fast, Reliable",**  
 **"impact": "High",**  
 **"icon": "icon.png"**  
**}**

**Response:**

**{**  
 **"id": 1,**  
 **"category_id": 2,**  
 **"name": "Recycling Pickup Updated",**  
 **"description": "Updated pickup service"**  
**}**

---

### **1.5 Error Handling**

**Handled Response:**

- **404 Service not found**

- **500 Database error**

**Un-Handled Response:**

- **Invalid JSON body**

---

### **1.6 Sample Postman Simulation**

- **Method: PUT**

- **URL: http://localhost:3000/api/services/1**

- **Body: JSON**

- **Headers: Content-Type: application/json**

---

# **3\. Delete Service**

**API Name: Delete Service**  
 **API Description: Deletes a service record by ID.**

### **1.1 Work Unit Detail**

- **Job Code: SVC003**

- **Source System: property management system**

- **Target System: Database**

**Objective: Remove a service from the database.**  
 **Periodicity: On-demand**  
 **Interface: REST API**  
 **URL: /api/services/\[id\]**  
 **Method Name: DELETE**  
 **Input Type: URL parameter (id)**  
 **Output Type: JSON**  
 **Expected Output: Success message**  
 **Macro Logic: Delete service from DB; handle non-existent IDs**  
 **Watch-outs: Ensure ID exists; handle DB errors**  
 **Performance: Fast; single DB delete query**

---

### **1.2 Request Body Parameters**

**None**

---

### **1.3 Response Fields**

| S.No  | FieldName   | Api Tag Name | DataType   | Remarks              |
| ----- | ----------- | ------------ | ---------- | -------------------- |
| **1** | **message** | **message**  | **string** | **Success or error** |

---

### **1.4 Request \- Response Sample**

**Request:**

**DELETE /api/services/1**

**Response:**

**{**  
 **"message": "Service deleted successfully"**  
**}**

---

### **1.5 Error Handling**

**Handled Response:**

- **404 Service not found**

- **500 Database error**

**Un-Handled Response:**

- **Invalid ID format**

---

### **1.6 Sample Postman Simulation**

- **Method: DELETE**

- **URL: http://localhost:3000/api/services/1**

- **Headers: Content-Type: application/json**

---

# **4\. Get All Services / Filter by Category**

**API Name: Get All Services**  
 **API Description: Retrieves all services or filters by category ID.**

### **1.1 Work Unit Detail**

- **Job Code: SVC004**

- **Source System: property management system**

- **Target System: Database**

**Objective: Fetch all services or those belonging to a specific category.**  
 **Periodicity: On-demand**  
 **Interface: REST API**  
 **URL: /api/services?category_id=2**  
 **Method Name: GET**  
 **Input Type: Query parameter (category_id)**  
 **Output Type: JSON array of services**  
 **Expected Output: List of service objects**  
 **Macro Logic: Return all services; filter by category_id if provided**  
 **Watch-outs: Validate category_id if present**  
 **Performance: Fast; single DB query**

---

### **1.2 Request Body Parameters**

**None**

---

### **1.3 Response Fields**

| S.No  | FieldName       | Api Tag Name    | DataType    | Remarks                 |
| ----- | --------------- | --------------- | ----------- | ----------------------- |
| **1** | **id**          | **id**          | **integer** | **Service ID**          |
| **2** | **category_id** | **category_id** | **integer** | **Category ID**         |
| **3** | **name**        | **name**        | **string**  | **Service name**        |
| **4** | **description** | **description** | **string**  | **Service description** |

---

### **1.4 Request \- Response Sample**

**Request:**

**GET /api/services**  
**GET /api/services?category_id=2**

**Response:**

**\[**  
 **{**  
 **"id": 1,**  
 **"category_id": 2,**  
 **"name": "Recycling Pickup",**  
 **"description": "Pickup service for recyclable waste"**  
 **},**  
 **{**  
 **"id": 2,**  
 **"category_id": 2,**  
 **"name": "E-Waste Collection",**  
 **"description": "Electronic waste collection"**  
 **}**  
**\]**

---

### **1.5 Error Handling**

**Handled Response:**

- **500 Database error**

**Un-Handled Response:**

- **Invalid query parameter**

---

### **1.6 Sample Postman Simulation**

- **Method: GET**

- **URL: http://localhost:3000/api/services or ?category_id=2**

- **Headers: Content-Type: application/json**

# **1\. Get Plan by ID**

**API Name: Get Plan by ID**  
 **API Description: Retrieves a single plan and its associated features using the plan ID.**

### **1.1 Work Unit Detail**

- **Job Code: PLAN001**

- **Source System: property management system**

- **Target System: Database (Prisma/Plan Table)**

**Objective: Fetch a plan by ID along with all connected features.**  
 **Periodicity: On-demand**  
 **Interface: REST API**  
 **URL: /api/plan/\[id\]**  
 **Method Name: GET**  
 **Input Type: URL parameter (id)**  
 **Output Type: JSON**  
 **Expected Output: Plan object with features**  
 **Macro Logic: Retrieve plan from database; return 404 if not found; include related features.**  
 **Watch-outs: Ensure id is a valid number; handle non-existent plan.**  
 **Performance: Fast; single DB query**

---

### **1.2 Request Body Parameters**

**None (ID passed as URL parameter)**

---

### **1.3 Response Fields**

| S.No  | FieldName        | Api Tag Name     | DataType    | Remarks                         |
| ----- | ---------------- | ---------------- | ----------- | ------------------------------- |
| **1** | **id**           | **id**           | **integer** | **Plan ID**                     |
| **2** | **name**         | **name**         | **string**  | **Name of the plan**            |
| **3** | **badge**        | **badge**        | **string**  | **Plan badge or label**         |
| **4** | **monthlyPrice** | **monthlyPrice** | **number**  | **Monthly cost**                |
| **5** | **yearlyPrice**  | **yearlyPrice**  | **number**  | **Yearly cost**                 |
| **6** | **description**  | **description**  | **string**  | **Description of the plan**     |
| **7** | **gradient**     | **gradient**     | **string**  | **Visual gradient color**       |
| **8** | **features**     | **features**     | **array**   | **Array of connected features** |

---

### **1.4 Request \- Response Sample**

**Request:**

**GET /api/plan/1**

**Response:**

**{**  
 **"id": 1,**  
 **"name": "Premium Plan",**  
 **"badge": "Best Value",**  
 **"monthlyPrice": 1000,**  
 **"yearlyPrice": 10000,**  
 **"description": "Full access plan",**  
 **"gradient": "linear-gradient(...)",**  
 **"features": \[**  
 **{ "id": 1, "title": "Feature A", "description": "Description A" },**  
 **{ "id": 2, "title": "Feature B", "description": "Description B" }**  
 **\]**  
**}**

---

### **1.5 Error Handling**

**Handled Response:**

- **400 Invalid plan ID**

- **404 Plan not found**

- **500 Database error**

**Un-Handled Response:**

- **Non-numeric ID in URL**

---

### **1.6 Sample Postman Simulation**

- **Method: GET**

- **URL: http://localhost:3000/api/plan/1**

- **Headers: Content-Type: application/json**

---

# **2\. Update Plan**

**API Name: Update Plan**  
 **API Description: Updates a plan and manages its features (connect existing, replace connections).**

### **1.1 Work Unit Detail**

- **Job Code: PLAN002**

- **Source System: property management system**

- **Target System: Database**

**Objective: Update plan attributes and feature associations.**  
 **Periodicity: On-demand**  
 **Interface: REST API**  
 **URL: /api/plan/\[id\]**  
 **Method Name: PUT**  
 **Input Type: JSON Body**  
 **Output Type: JSON**  
 **Expected Output: Updated plan object with features**  
 **Macro Logic: Update plan fields; replace feature connections with new featureIds**  
 **Watch-outs: Validate ID; validate numeric pricing; ensure feature IDs exist**  
 **Performance: Fast; single DB update**

---

### **1.2 Request Body Parameters**

| S.No  | FieldName        | Api Tag Name     | DataType   | Remarks                                      |
| ----- | ---------------- | ---------------- | ---------- | -------------------------------------------- |
| **1** | **name**         | **name**         | **string** | **Plan name**                                |
| **2** | **badge**        | **badge**        | **string** | **Plan badge**                               |
| **3** | **monthlyPrice** | **monthlyPrice** | **number** | **Monthly price**                            |
| **4** | **yearlyPrice**  | **yearlyPrice**  | **number** | **Yearly price**                             |
| **5** | **description**  | **description**  | **string** | **Plan description**                         |
| **6** | **gradient**     | **gradient**     | **string** | **Gradient for UI**                          |
| **7** | **featureIds**   | **featureIds**   | **array**  | **IDs of features to connect (replace all)** |

---

### **1.3 Response Fields**

**Same as GET Plan by ID**

---

### **1.4 Request \- Response Sample**

**Request:**

**PUT /api/plan/1**  
**{**  
 **"name": "Updated Plan",**  
 **"badge": "Popular",**  
 **"monthlyPrice": 1200,**  
 **"yearlyPrice": 12000,**  
 **"description": "Updated plan description",**  
 **"gradient": "linear-gradient(...)",**  
 **"featureIds": \[1,3,4\]**  
**}**

**Response:**

**{**  
 **"id": 1,**  
 **"name": "Updated Plan",**  
 **"badge": "Popular",**  
 **"monthlyPrice": 1200,**  
 **"yearlyPrice": 12000,**  
 **"description": "Updated plan description",**  
 **"gradient": "linear-gradient(...)",**  
 **"features": \[**  
 **{ "id": 1, "title": "Feature A" },**  
 **{ "id": 3, "title": "Feature C" },**  
 **{ "id": 4, "title": "Feature D" }**  
 **\]**  
**}**

---

### **1.5 Error Handling**

- **400 Invalid plan ID**

- **500 Database error**

### **1.6 Sample Postman Simulation**

- **Method: PUT**

- **URL: http://localhost:3000/api/plan/1**

- **Body: JSON**

- **Headers: Content-Type: application/json**

---

# **3\. Delete Plan**

**API Name: Delete Plan**  
 **API Description: Deletes a plan and its feature connections (cascading delete if set).**

### **1.1 Work Unit Detail**

- **Job Code: PLAN003**

- **Source System: property management system**

- **Target System: Database**

**Objective: Remove a plan and associated feature links.**  
 **Periodicity: On-demand**  
 **Interface: REST API**  
 **URL: /api/plan/\[id\]**  
 **Method Name: DELETE**  
 **Input Type: URL parameter (id)**  
 **Output Type: JSON**  
 **Expected Output: Success message**  
 **Macro Logic: Delete plan; cascade features if DB relation is set to cascade**  
 **Watch-outs: Validate ID exists**  
 **Performance: Fast**

---

### **1.2 Request Body Parameters**

**None**

### **1.3 Response Fields**

| S.No  | FieldName   | Api Tag Name | DataType   | Remarks              |
| ----- | ----------- | ------------ | ---------- | -------------------- |
| **1** | **message** | **message**  | **string** | **Success or error** |

---

### **1.4 Request \- Response Sample**

**Request:**

**DELETE /api/plan/1**

**Response:**

**{**  
 **"message": "Plan and its features deleted successfully"**  
**}**

---

### **1.5 Error Handling**

- **400 Invalid plan ID**

- **500 Database error**

### **1.6 Sample Postman Simulation**

- **Method: DELETE**

- **URL: http://localhost:3000/api/plan/1**

---

# **4\. Get All Plans**

**API Name: Get All Plans**  
 **API Description: Retrieves all plans with associated features.**

### **1.1 Work Unit Detail**

- **Job Code: PLAN004**

- **Source System: property management system**

- **Target System: Database**

**Objective: Fetch all plans or plans filtered by criteria in future extension.**  
 **Periodicity: On-demand**  
 **Interface: REST API**  
 **URL: /api/plan**  
 **Method Name: GET**  
 **Input Type: None**  
 **Output Type: JSON array**  
 **Expected Output: List of plan objects**  
 **Macro Logic: Query all plans including features**  
 **Watch-outs: Handle empty table**  
 **Performance: Fast; single DB query**

---

### **1.2 Request Body Parameters**

**None**

### **1.3 Response Fields**

**Same as GET Plan by ID**

### **1.4 Request \- Response Sample**

**Request:**

**GET /api/plan**

**Response:**

**\[**  
 **{**  
 **"id": 1,**  
 **"name": "Basic Plan",**  
 **"badge": "Starter",**  
 **"monthlyPrice": 500,**  
 **"yearlyPrice": 5000,**  
 **"description": "Basic plan",**  
 **"gradient": "linear-gradient(...)",**  
 **"features": \[{ "id": 1, "title": "Feature A" }\]**  
 **},**  
 **{**  
 **"id": 2,**  
 **"name": "Premium Plan",**  
 **"badge": "Popular",**  
 **"monthlyPrice": 1000,**  
 **"yearlyPrice": 10000,**  
 **"description": "Premium access",**  
 **"gradient": "linear-gradient(...)",**  
 **"features": \[{ "id": 2, "title": "Feature B" }\]**  
 **}**  
**\]**

---

### **1.5 Error Handling**

- **500 Database error**

### **1.6 Sample Postman Simulation**

- **Method: GET**

- **URL: http://localhost:3000/api/plan**

---

# **5\. Create Plan**

**API Name: Create Plan**  
 **API Description: Creates a new plan and optionally connects or creates features.**

### **1.1 Work Unit Detail**

- **Job Code: PLAN005**

- **Source System: property management system**

- **Target System: Database**

**Objective: Add a new plan with features**  
 **Periodicity: On-demand**  
 **Interface: REST API**  
 **URL: /api/plan**  
 **Method Name: POST**  
 **Input Type: JSON Body**  
 **Output Type: JSON**  
 **Expected Output: Created plan with features**  
 **Macro Logic: Create plan, connect existing features, create new features**  
 **Watch-outs: Validate numeric fields; ensure features exist if connecting**  
 **Performance: Fast**

---

### **1.2 Request Body Parameters**

| S.No  | FieldName        | Api Tag Name     | DataType   | Remarks                                          |
| ----- | ---------------- | ---------------- | ---------- | ------------------------------------------------ |
| **1** | **name**         | **name**         | **string** | **Plan name**                                    |
| **2** | **badge**        | **badge**        | **string** | **Plan badge**                                   |
| **3** | **monthlyPrice** | **monthlyPrice** | **number** | **Monthly price**                                |
| **4** | **yearlyPrice**  | **yearlyPrice**  | **number** | **Yearly price**                                 |
| **5** | **description**  | **description**  | **string** | **Plan description**                             |
| **6** | **gradient**     | **gradient**     | **string** | **Gradient UI element**                          |
| **7** | **featureIds**   | **featureIds**   | **array**  | **Connect existing features**                    |
| **8** | **newFeatures**  | **newFeatures**  | **array**  | **Create new features \[{title, description}\]** |

---

### **1.3 Response Fields**

**Same as GET Plan by ID**

### **1.4 Request \- Response Sample**

**Request:**

**POST /api/plan**  
**{**  
 **"name": "New Plan",**  
 **"badge": "Starter",**  
 **"monthlyPrice": 600,**  
 **"yearlyPrice": 6000,**  
 **"description": "Entry level plan",**  
 **"gradient": "linear-gradient(...)",**  
 **"featureIds": \[1\],**  
 **"newFeatures": \[{ "title": "Feature C", "description": "Extra feature" }\]**  
**}**

**Response:**

**{**  
 **"id": 3,**  
 **"name": "New Plan",**  
 **"badge": "Starter",**  
 **"monthlyPrice": 600,**  
 **"yearlyPrice": 6000,**  
 **"description": "Entry level plan",**  
 **"gradient": "linear-gradient(...)",**  
 **"features": \[**  
 **{ "id": 1, "title": "Feature A" },**  
 **{ "id": 3, "title": "Feature C", "description": "Extra feature" }**  
 **\]**  
**}**

---

### **1.5 Error Handling**

- **500 Database error**

### **1.6 Sample Postman Simulation**

- **Method: POST**

- **URL: http://localhost:3000/api/plan**

- **Body: JSON**

- **Headers: Content-Type: application/json**

# **1\. Get All Policies**

**API Name: Get All Policies**  
 **API Description: Retrieves all policies along with their associated sections.**

### **1.1 Work Unit Detail**

- **Job Code: POL001**

- **Source System: property management system**

- **Target System: Database (Prisma/Policy Table)**

**Objective: Fetch all policies including related sections.**  
 **Periodicity: On-demand**  
 **Interface: REST API**  
 **URL: /api/policy**  
 **Method Name: GET**  
 **Input Type: None**  
 **Output Type: JSON array**  
 **Expected Output: Array of policy objects with sections**  
 **Macro Logic: Query all policies with their associated sections**  
 **Watch-outs: Handle empty table gracefully**  
 **Performance: Fast; single DB query**

---

### **1.2 Request Body Parameters**

**None**

---

### **1.3 Response Fields**

| S.No   | FieldName                    | Api Tag Name                 | DataType     | Remarks                      |
| ------ | ---------------------------- | ---------------------------- | ------------ | ---------------------------- |
| **1**  | **id**                       | **id**                       | **integer**  | **Policy ID**                |
| **2**  | **title**                    | **title**                    | **string**   | **Policy title**             |
| **3**  | **companyName**              | **companyName**              | **string**   | **Company name associated**  |
| **4**  | **contactEmail**             | **contactEmail**             | **string**   | **Contact email**            |
| **5**  | **privacyEmail**             | **privacyEmail**             | **string**   | **Privacy email**            |
| **6**  | **website**                  | **website**                  | **string**   | **Optional company website** |
| **7**  | **mailingAddress**           | **mailingAddress**           | **string**   | **Optional mailing address** |
| **8**  | **responseTime**             | **responseTime**             | **string**   | **Response time policy**     |
| **9**  | **inactiveAccountThreshold** | **inactiveAccountThreshold** | **number**   | **Threshold in days**        |
| **10** | **updatedAt**                | **updatedAt**                | **datetime** | **Last updated timestamp**   |
| **11** | **Section**                  | **Section**                  | **array**    | **Associated sections**      |

---

### **1.4 Request \- Response Sample**

**Request:**

**GET /api/policy**

**Response:**

**\[**  
 **{**  
 **"id": 1,**  
 **"title": "Privacy Policy",**  
 **"companyName": "WasteLink Ltd",**  
 **"contactEmail": "contact@wastelink.com",**  
 **"privacyEmail": "privacy@wastelink.com",**  
 **"website": "https://wastelink.com",**  
 **"mailingAddress": "123 Nairobi St",**  
 **"responseTime": "48 hours",**  
 **"inactiveAccountThreshold": 90,**  
 **"updatedAt": "2025-11-25T20:00:00.000Z",**  
 **"Section": \[**  
 **{ "id": 1, "title": "Introduction" },**  
 **{ "id": 2, "title": "Data Handling" }**  
 **\]**  
 **}**  
**\]**

---

### **1.5 Error Handling**

- **500 Database error**

---

### **1.6 Sample Postman Simulation**

- **Method: GET**

- **URL: http://localhost:3000/api/policy**

---

# **2\. Get Policy by ID**

**API Name: Get Policy by ID**  
 **API Description: Retrieves a single policy and its sections using policy ID.**

### **1.1 Work Unit Detail**

- **Job Code: POL002**

- **Source System: property management system**

- **Target System: Database**

**Objective: Fetch a specific policy by ID with associated sections.**  
 **Periodicity: On-demand**  
 **Interface: REST API**  
 **URL: /api/policy/\[id\]**  
 **Method Name: GET**  
 **Input Type: URL parameter (id)**  
 **Output Type: JSON**  
 **Expected Output: Single policy object**  
 **Macro Logic: Retrieve policy; return 404 if not found**  
 **Watch-outs: Ensure numeric ID**  
 **Performance: Fast**

---

### **1.2 Request Body Parameters**

**None**

---

### **1.3 Response Fields**

**Same as GET All Policies (for a single policy)**

---

### **1.4 Request \- Response Sample**

**Request:**

**GET /api/policy/1**

**Response:**

**{**  
 **"id": 1,**  
 **"title": "Privacy Policy",**  
 **"companyName": "WasteLink Ltd",**  
 **"contactEmail": "contact@wastelink.com",**  
 **"privacyEmail": "privacy@wastelink.com",**  
 **"website": "https://wastelink.com",**  
 **"mailingAddress": "123 Nairobi St",**  
 **"responseTime": "48 hours",**  
 **"inactiveAccountThreshold": 90,**  
 **"updatedAt": "2025-11-25T20:00:00.000Z",**  
 **"Section": \[**  
 **{ "id": 1, "title": "Introduction" },**  
 **{ "id": 2, "title": "Data Handling" }**  
 **\]**  
**}**

---

### **1.5 Error Handling**

- **404 Policy not found**

- **500 Database error**

---

### **1.6 Sample Postman Simulation**

- **Method: GET**

- **URL: http://localhost:3000/api/policy/1**

---

# **3\. Create Policy**

**API Name: Create Policy**  
 **API Description: Creates a new policy.**

### **1.1 Work Unit Detail**

- **Job Code: POL003**

- **Source System: property management system**

- **Target System: Database**

**Objective: Add a new policy record**  
 **Periodicity: On-demand**  
 **Interface: REST API**  
 **URL: /api/policy**  
 **Method Name: POST**  
 **Input Type: JSON Body**  
 **Output Type: JSON**  
 **Expected Output: Created policy object**  
 **Macro Logic: Validate required fields; insert into DB**  
 **Watch-outs: Required fields: title, companyName, contactEmail, privacyEmail**  
 **Performance: Fast**

---

### **1.2 Request Body Parameters**

| S.No  | FieldName                    | Api Tag Name                 | DataType   | Remarks                      |
| ----- | ---------------------------- | ---------------------------- | ---------- | ---------------------------- |
| **1** | **title**                    | **title**                    | **string** | **Policy title (required)**  |
| **2** | **companyName**              | **companyName**              | **string** | **Company name (required)**  |
| **3** | **contactEmail**             | **contactEmail**             | **string** | **Contact email (required)** |
| **4** | **privacyEmail**             | **privacyEmail**             | **string** | **Privacy email (required)** |
| **5** | **website**                  | **website**                  | **string** | **Optional**                 |
| **6** | **mailingAddress**           | **mailingAddress**           | **string** | **Optional**                 |
| **7** | **responseTime**             | **responseTime**             | **string** | **Optional**                 |
| **8** | **inactiveAccountThreshold** | **inactiveAccountThreshold** | **number** | **Optional**                 |

---

### **1.3 Response Fields**

**Same as GET Policy by ID**

---

### **1.4 Request \- Response Sample**

**Request:**

**POST /api/policy**  
**{**  
 **"title": "Privacy Policy",**  
 **"companyName": "WasteLink Ltd",**  
 **"contactEmail": "contact@wastelink.com",**  
 **"privacyEmail": "privacy@wastelink.com",**  
 **"website": "https://wastelink.com",**  
 **"mailingAddress": "123 Nairobi St",**  
 **"responseTime": "48 hours",**  
 **"inactiveAccountThreshold": 90**  
**}**

**Response:**

**{**  
 **"id": 1,**  
 **"title": "Privacy Policy",**  
 **"companyName": "WasteLink Ltd",**  
 **"contactEmail": "contact@wastelink.com",**  
 **"privacyEmail": "privacy@wastelink.com",**  
 **"website": "https://wastelink.com",**  
 **"mailingAddress": "123 Nairobi St",**  
 **"responseTime": "48 hours",**  
 **"inactiveAccountThreshold": 90,**  
 **"updatedAt": "2025-11-25T20:00:00.000Z"**  
**}**

---

### **1.5 Error Handling**

- **400 Missing required fields**

- **500 Database error**

---

### **1.6 Sample Postman Simulation**

- **Method: POST**

- **URL: http://localhost:3000/api/policy**

- **Body: JSON**

---

# **4\. Update Policy**

**API Name: Update Policy**  
 **API Description: Updates an existing policy by ID.**

### **1.1 Work Unit Detail**

- **Job Code: POL004**

- **Source System: property management system**

- **Target System: Database**

**Objective: Modify a policy record**  
 **Periodicity: On-demand**  
 **Interface: REST API**  
 **URL: /api/policy/\[id\]**  
 **Method Name: PUT**  
 **Input Type: JSON Body**  
 **Output Type: JSON**  
 **Expected Output: Updated policy object**  
 **Macro Logic: Update policy fields in DB**  
 **Watch-outs: Ensure numeric ID; all fields optional**  
 **Performance: Fast**

---

### **1.2 Request Body Parameters**

**Any policy field to update (title, companyName, contactEmail, privacyEmail, website, mailingAddress, responseTime, inactiveAccountThreshold)**

---

### **1.3 Response Fields**

**Same as GET Policy by ID**

---

### **1.4 Request \- Response Sample**

**Request:**

**PUT /api/policy/1**  
**{**  
 **"title": "Updated Privacy Policy",**  
 **"contactEmail": "newcontact@wastelink.com"**  
**}**

**Response:**

**{**  
 **"id": 1,**  
 **"title": "Updated Privacy Policy",**  
 **"companyName": "WasteLink Ltd",**  
 **"contactEmail": "newcontact@wastelink.com",**  
 **"privacyEmail": "privacy@wastelink.com",**  
 **"website": "https://wastelink.com",**  
 **"mailingAddress": "123 Nairobi St",**  
 **"responseTime": "48 hours",**  
 **"inactiveAccountThreshold": 90,**  
 **"updatedAt": "2025-11-25T20:30:00.000Z"**  
**}**

---

### **1.5 Error Handling**

- **500 Database error**

---

### **1.6 Sample Postman Simulation**

- **Method: PUT**

- **URL: http://localhost:3000/api/policy/1**

- **Body: JSON**

---

# **5\. Delete Policy**

**API Name: Delete Policy**  
 **API Description: Deletes a policy and all associated sections.**

### **1.1 Work Unit Detail**

- **Job Code: POL005**

- **Source System: property management system**

- **Target System: Database**

**Objective: Remove policy and all linked sections**  
 **Periodicity: On-demand**  
 **Interface: REST API**  
 **URL: /api/policy/\[id\]**  
 **Method Name: DELETE**  
 **Input Type: URL parameter (id)**  
 **Output Type: JSON**  
 **Expected Output: Success message**  
 **Macro Logic: Delete sections first, then policy**  
 **Watch-outs: Ensure valid ID**  
 **Performance: Fast**

---

### **1.2 Request Body Parameters**

**None**

---

### **1.3 Response Fields**

| S.No  | FieldName   | Api Tag Name | DataType   | Remarks              |
| ----- | ----------- | ------------ | ---------- | -------------------- |
| **1** | **message** | **message**  | **string** | **Success or error** |

---

### **1.4 Request \- Response Sample**

**Request:**

**DELETE /api/policy/1**

**Response:**

**{**  
 **"message": "Policy and its sections deleted successfully"**  
**}**

---

### **1.5 Error Handling**

- **400 Invalid policy ID**

- **500 Database error**

---

### **1.6 Sample Postman Simulation**

- **Method: DELETE**

- **URL: http://localhost:3000/api/policy/1**

# **1\. Get All Sections**

#### **API Name: Get All Sections** **API Description: Retrieves all sections along with their associated policies.**

### **1.1 Work Unit Detail**

- #### **Job Code: SEC001**

- #### **Source System: property management system**

- #### **Target System: Database (Prisma/Section Table)**

#### **Objective: Fetch all sections including the related policy.** **Periodicity: On-demand** **Interface: REST API** **URL: /api/section** **Method Name: GET** **Input Type: None** **Output Type: JSON array** **Expected Output: Array of section objects with policies** **Macro Logic: Query all sections with their associated policy** **Watch-outs: Handle empty table gracefully** **Performance: Fast**

#### ---

### **1.2 Request Body Parameters**

#### **None**

#### ---

### **1.3 Response Fields**

| S.No  | FieldName     | Api Tag Name  | DataType     | Remarks                         |
| ----- | ------------- | ------------- | ------------ | ------------------------------- |
| **1** | **id**        | **id**        | **integer**  | **Section ID**                  |
| **2** | **key**       | **key**       | **string**   | **Unique key slug for section** |
| **3** | **title**     | **title**     | **string**   | **Section title**               |
| **4** | **intro**     | **intro**     | **string**   | **Optional introduction**       |
| **5** | **content**   | **content**   | **string**   | **Section content**             |
| **6** | **order**     | **order**     | **integer**  | **Optional ordering index**     |
| **7** | **updatedAt** | **updatedAt** | **datetime** | **Last updated timestamp**      |
| **8** | **policyId**  | **policyId**  | **integer**  | **Associated policy ID**        |
| **9** | **Policy**    | **Policy**    | **object**   | **Linked policy**               |

#### ---

### **1.4 Request \- Response Sample**

#### **Request:**

#### **GET /api/section**

####

#### **Response:**

#### **\[**

#### **{**

#### **"id": 1,**

#### **"key": "introduction",**

#### **"title": "Introduction",**

#### **"intro": "Overview of privacy policy",**

#### **"content": "Full content here...",**

#### **"order": 1,**

#### **"updatedAt": "2025-11-25T20:00:00.000Z",**

#### **"policyId": 1,**

#### **"Policy": {**

#### **"id": 1,**

#### **"title": "Privacy Policy"**

#### **}**

#### **}**

#### **\]**

####

#### ---

### **1.5 Error Handling**

- #### **500 Database error**

#### ---

### **1.6 Sample Postman Simulation**

- #### **Method: GET**

- #### **URL: http://localhost:3000/api/section**

#### ---

# **2\. Get Section by ID**

#### **API Name: Get Section by ID** **API Description: Retrieves a single section by ID.**

### **1.1 Work Unit Detail**

- #### **Job Code: SEC002**

- #### **Source System: property management system**

- #### **Target System: Database**

#### **Objective: Fetch a specific section by ID** **Periodicity: On-demand** **Interface: REST API** **URL: /api/section/\[id\]** **Method Name: GET** **Input Type: URL parameter (id)** **Output Type: JSON** **Expected Output: Single section object** **Macro Logic: Retrieve section; return 404 if not found** **Watch-outs: Ensure numeric ID** **Performance: Fast**

#### ---

### **1.2 Request Body Parameters**

#### **None**

#### ---

### **1.3 Response Fields**

#### **Same as GET All Sections (for a single section)**

#### ---

### **1.4 Request \- Response Sample**

#### **Request:**

#### **GET /api/section/1**

####

#### **Response:**

#### **{**

#### **"id": 1,**

#### **"key": "introduction",**

#### **"title": "Introduction",**

#### **"intro": "Overview of privacy policy",**

#### **"content": "Full content here...",**

#### **"order": 1,**

#### **"updatedAt": "2025-11-25T20:00:00.000Z",**

#### **"policyId": 1**

#### **}**

####

#### ---

### **1.5 Error Handling**

- #### **404 Section not found**

- #### **500 Database error**

#### ---

### **1.6 Sample Postman Simulation**

- #### **Method: GET**

- #### **URL: http://localhost:3000/api/section/1**

#### ---

# **3\. Create Section**

#### **API Name: Create Section** **API Description: Creates a new section under a policy.**

### **1.1 Work Unit Detail**

- #### **Job Code: SEC003**

- #### **Source System: property management system**

- #### **Target System: Database**

#### **Objective: Add a new section** **Periodicity: On-demand** **Interface: REST API** **URL: /api/section** **Method Name: POST** **Input Type: JSON Body** **Output Type: JSON** **Expected Output: Created section object** **Macro Logic: Validate required fields; insert into DB** **Watch-outs: Required fields: title, policyId** **Performance: Fast**

#### ---

### **1.2 Request Body Parameters**

| S.No  | FieldName    | Api Tag Name | DataType    | Remarks                                 |
| ----- | ------------ | ------------ | ----------- | --------------------------------------- |
| **1** | **key**      | **key**      | **string**  | **Optional; auto-generated if missing** |
| **2** | **title**    | **title**    | **string**  | **Required**                            |
| **3** | **intro**    | **intro**    | **string**  | **Optional**                            |
| **4** | **content**  | **content**  | **string**  | **Optional**                            |
| **5** | **order**    | **order**    | **integer** | **Optional**                            |
| **6** | **policyId** | **policyId** | **integer** | **Required; associated policy ID**      |

#### ---

### **1.3 Response Fields**

#### **Same as GET Section by ID**

#### ---

### **1.4 Request \- Response Sample**

#### **Request:**

#### **POST /api/section**

#### **{**

#### **"title": "Data Handling",**

#### **"intro": "How we handle user data",**

#### **"content": "Full section content",**

#### **"order": 2,**

#### **"policyId": 1**

#### **}**

####

#### **Response:**

#### **{**

#### **"id": 2,**

#### **"key": "data-handling",**

#### **"title": "Data Handling",**

#### **"intro": "How we handle user data",**

#### **"content": "Full section content",**

#### **"order": 2,**

#### **"updatedAt": "2025-11-25T20:10:00.000Z",**

#### **"policyId": 1**

#### **}**

####

#### ---

### **1.5 Error Handling**

- #### **400 Missing required fields**

- #### **500 Database error**

#### ---

### **1.6 Sample Postman Simulation**

- #### **Method: POST**

- #### **URL: http://localhost:3000/api/section**

#### ---

# **4\. Update Section**

#### **API Name: Update Section** **API Description: Updates an existing section by ID.**

### **1.1 Work Unit Detail**

- #### **Job Code: SEC004**

- #### **Source System: property management system**

- #### **Target System: Database**

#### **Objective: Modify a section record** **Periodicity: On-demand** **Interface: REST API** **URL: /api/section/\[id\]** **Method Name: PUT** **Input Type: JSON Body** **Output Type: JSON** **Expected Output: Updated section object** **Macro Logic: Update section fields in DB** **Watch-outs: Ensure numeric ID; all fields optional** **Performance: Fast**

#### ---

### **1.2 Request Body Parameters**

#### **Any section field (key, title, intro, content, order, policyId)**

#### ---

### **1.3 Response Fields**

#### **Same as GET Section by ID**

#### ---

### **1.4 Request \- Response Sample**

#### **Request:**

#### **PUT /api/section/2**

#### **{**

#### **"title": "Updated Data Handling"**

#### **}**

####

#### **Response:**

#### **{**

#### **"id": 2,**

#### **"key": "data-handling",**

#### **"title": "Updated Data Handling",**

#### **"intro": "How we handle user data",**

#### **"content": "Full section content",**

#### **"order": 2,**

#### **"updatedAt": "2025-11-25T20:15:00.000Z",**

#### **"policyId": 1**

#### **}**

####

#### ---

### **1.5 Error Handling**

- #### **500 Database error**

#### ---

### **1.6 Sample Postman Simulation**

- #### **Method: PUT**

- #### **URL: http://localhost:3000/api/section/2**

#### ---

# **5\. Delete Section**

#### **API Name: Delete Section** **API Description: Deletes a section by ID.**

### **1.1 Work Unit Detail**

- #### **Job Code: SEC005**

- #### **Source System: property management system**

- #### **Target System: Database**

#### **Objective: Remove section record** **Periodicity: On-demand** **Interface: REST API** **URL: /api/section/\[id\]** **Method Name: DELETE** **Input Type: URL parameter (id)** **Output Type: JSON** **Expected Output: Success message** **Macro Logic: Delete section in DB** **Watch-outs: Ensure valid ID** **Performance: Fast**

#### ---

### **1.2 Request Body Parameters**

#### **None**

#### ---

### **1.3 Response Fields**

| S.No  | FieldName   | Api Tag Name | DataType   | Remarks              |
| ----- | ----------- | ------------ | ---------- | -------------------- |
| **1** | **message** | **message**  | **string** | **Success or error** |

#### ---

### **1.4 Request \- Response Sample**

#### **Request:**

#### **DELETE /api/section/2**

####

#### **Response:**

#### **{**

#### **"message": "Section deleted"**

#### **}**

####

#### ---

### **1.5 Error Handling**

- #### **500 Database error**

#### ---

### **1.6 Sample Postman Simulation**

- #### **Method: DELETE**

- #### **URL: http://localhost:3000/api/section/2**

# **1\. Get All Hero Sections**

#### **API Name: Get All Hero Sections** **API Description: Retrieves all hero sections, optionally filtered by page.**

### **1.1 Work Unit Detail**

- #### **Job Code: HERO001**

- #### **Source System: property management system**

- #### **Target System: Database (Prisma/HeroSection Table)**

#### **Objective: Fetch all hero sections; optionally filter by page.** **Periodicity: On-demand** **Interface: REST API** **URL: /api/hero** **Method Name: GET** **Input Type: Query parameter page (optional)** **Output Type: JSON array** **Expected Output: Array of hero section objects** **Macro Logic: Query all hero sections; apply page filter if present** **Watch-outs: Validate page parameter** **Performance: Fast**

#### ---

### **1.2 Request Body Parameters**

#### **None**

#### ---

### **1.3 Response Fields**

| S.No   | FieldName       | Api Tag Name    | DataType     | Remarks                    |
| ------ | --------------- | --------------- | ------------ | -------------------------- |
| **1**  | **id**          | **id**          | **integer**  | **Hero section ID**        |
| **2**  | **page**        | **page**        | **string**   | **Page name**              |
| **3**  | **title**       | **title**       | **string**   | **Hero title**             |
| **4**  | **subtitle**    | **subtitle**    | **string**   | **Optional subtitle**      |
| **5**  | **description** | **description** | **string**   | **Optional description**   |
| **6**  | **buttonText**  | **buttonText**  | **string**   | **Optional button text**   |
| **7**  | **buttonUrl**   | **buttonUrl**   | **string**   | **Optional button URL**    |
| **8**  | **imageUrl**    | **imageUrl**    | **string**   | **Hero image URL**         |
| **9**  | **iconUrl**     | **iconUrl**     | **string**   | **Optional icon URL**      |
| **10** | **searchBar**   | **searchBar**   | **boolean**  | **Show search bar?**       |
| **11** | **gradient**    | **gradient**    | **string**   | **Background gradient**    |
| **12** | **layout**      | **layout**      | **string**   | **Layout type**            |
| **13** | **updatedAt**   | **updatedAt**   | **datetime** | **Last updated timestamp** |

#### ---

### **1.4 Request \- Response Sample**

#### **Request:**

#### **GET /api/hero?page=home**

####

#### **Response:**

#### **\[**

#### **{**

#### **"id": 1,**

#### **"page": "home",**

#### **"title": "Welcome to WasteLink",**

#### **"subtitle": "Recycle smarter",**

#### **"description": "Join Kenya’s circular economy",**

#### **"buttonText": "Get Started",**

#### **"buttonUrl": "/signup",**

#### **"imageUrl": "https://example.com/hero.png",**

#### **"iconUrl": "https://example.com/icon.png",**

#### **"searchBar": true,**

#### **"gradient": "linear-gradient(...)",**

#### **"layout": "standard",**

#### **"updatedAt": "2025-11-25T20:20:00.000Z"**

#### **}**

#### **\]**

####

#### ---

### **1.5 Error Handling**

- #### **500 Database error**

#### ---

### **1.6 Sample Postman Simulation**

- #### **Method: GET**

- #### **URL: http://localhost:3000/api/hero?page=home**

#### ---

# **2\. Get Hero Section by ID**

#### **API Name: Get Hero Section by ID** **API Description: Retrieves a single hero section by ID.**

### **1.1 Work Unit Detail**

- #### **Job Code: HERO002**

- #### **Source System: property management system**

- #### **Target System: Database**

#### **Objective: Fetch a specific hero section by ID** **Periodicity: On-demand** **Interface: REST API** **URL: /api/hero/\[id\]** **Method Name: GET** **Input Type: URL parameter (id)** **Output Type: JSON** **Expected Output: Hero section object** **Macro Logic: Retrieve hero section; return 404 if not found** **Watch-outs: Ensure numeric ID** **Performance: Fast**

#### ---

### **1.2 Request Body Parameters**

#### **None**

#### ---

### **1.3 Response Fields**

#### **Same as GET All Hero Sections (single object)**

#### ---

### **1.4 Request \- Response Sample**

#### **Request:**

#### **GET /api/hero/1**

####

#### **Response:**

#### **{**

#### **"id": 1,**

#### **"page": "home",**

#### **"title": "Welcome to WasteLink",**

#### **"subtitle": "Recycle smarter",**

#### **"description": "Join Kenya’s circular economy",**

#### **"buttonText": "Get Started",**

#### **"buttonUrl": "/signup",**

#### **"imageUrl": "https://example.com/hero.png",**

#### **"iconUrl": "https://example.com/icon.png",**

#### **"searchBar": true,**

#### **"gradient": "linear-gradient(...)",**

#### **"layout": "standard",**

#### **"updatedAt": "2025-11-25T20:20:00.000Z"**

#### **}**

####

#### ---

### **1.5 Error Handling**

- #### **404 Hero section not found**

- #### **500 Database error**

#### ---

### **1.6 Sample Postman Simulation**

- #### **Method: GET**

- #### **URL: http://localhost:3000/api/hero/1**

#### ---

# **3\. Create Hero Section**

#### **API Name: Create Hero Section** **API Description: Creates a new hero section.**

### **1.1 Work Unit Detail**

- #### **Job Code: HERO003**

- #### **Source System: property management system**

- #### **Target System: Database**

#### **Objective: Add a new hero section** **Periodicity: On-demand** **Interface: REST API** **URL: /api/hero** **Method Name: POST** **Input Type: JSON Body** **Output Type: JSON** **Expected Output: Created hero section object** **Macro Logic: Insert hero section record in DB** **Watch-outs: title, page, and imageUrl recommended** **Performance: Fast**

#### ---

### **1.2 Request Body Parameters**

| S.No   | FieldName       | Api Tag Name    | DataType    | Remarks                      |
| ------ | --------------- | --------------- | ----------- | ---------------------------- |
| **1**  | **page**        | **page**        | **string**  | **Required**                 |
| **2**  | **title**       | **title**       | **string**  | **Required**                 |
| **3**  | **subtitle**    | **subtitle**    | **string**  | **Optional**                 |
| **4**  | **description** | **description** | **string**  | **Optional**                 |
| **5**  | **buttonText**  | **buttonText**  | **string**  | **Optional**                 |
| **6**  | **buttonUrl**   | **buttonUrl**   | **string**  | **Optional**                 |
| **7**  | **imageUrl**    | **imageUrl**    | **string**  | **Required**                 |
| **8**  | **iconUrl**     | **iconUrl**     | **string**  | **Optional**                 |
| **9**  | **searchBar**   | **searchBar**   | **boolean** | **Optional; defaults false** |
| **10** | **gradient**    | **gradient**    | **string**  | **Optional**                 |
| **11** | **layout**      | **layout**      | **string**  | **Optional**                 |

#### ---

### **1.3 Response Fields**

#### **Same as GET Hero Section by ID**

#### ---

### **1.4 Request \- Response Sample**

#### **Request:**

#### **POST /api/hero**

#### **{**

#### **"page": "home",**

#### **"title": "New Hero Section",**

#### **"subtitle": "Recycle better",**

#### **"description": "Start recycling today",**

#### **"buttonText": "Join Now",**

#### **"buttonUrl": "/signup",**

#### **"imageUrl": "https://example.com/newhero.png",**

#### **"iconUrl": "https://example.com/icon.png",**

#### **"searchBar": true,**

#### **"gradient": "linear-gradient(...)",**

#### **"layout": "standard"**

#### **}**

####

#### **Response:**

#### **{**

#### **"id": 2,**

#### **"page": "home",**

#### **"title": "New Hero Section",**

#### **"subtitle": "Recycle better",**

#### **"description": "Start recycling today",**

#### **"buttonText": "Join Now",**

#### **"buttonUrl": "/signup",**

#### **"imageUrl": "https://example.com/newhero.png",**

#### **"iconUrl": "https://example.com/icon.png",**

#### **"searchBar": true,**

#### **"gradient": "linear-gradient(...)",**

#### **"layout": "standard",**

#### **"updatedAt": "2025-11-25T20:25:00.000Z"**

#### **}**

####

#### ---

# **4\. Update Hero Section**

#### **API Name: Update Hero Section** **API Description: Updates an existing hero section by ID.**

### **1.1 Work Unit Detail**

- #### **Job Code: HERO004**

- #### **Source System: property management system**

- #### **Target System: Database**

#### **Objective: Modify hero section fields** **Periodicity: On-demand** **Interface: REST API** **URL: /api/hero/\[id\]** **Method Name: PUT** **Input Type: JSON Body** **Output Type: JSON** **Expected Output: Updated hero section object** **Macro Logic: Update record in DB** **Watch-outs: Ensure numeric ID; all fields optional** **Performance: Fast**

#### ---

### **1.2 Request Body Parameters**

#### **Any hero section field (title, subtitle, description, buttonText, buttonUrl, imageUrl, iconUrl, searchBar, gradient, layout)**

#### ---

### **1.3 Response Fields**

#### **Same as GET Hero Section by ID**

#### ---

### **1.4 Request \- Response Sample**

#### **Request:**

#### **PUT /api/hero/2**

#### **{**

#### **"title": "Updated Hero Section"**

#### **}**

####

#### **Response:**

#### **{**

#### **"id": 2,**

#### **"page": "home",**

#### **"title": "Updated Hero Section",**

#### **"subtitle": "Recycle better",**

#### **"description": "Start recycling today",**

#### **"buttonText": "Join Now",**

#### **"buttonUrl": "/signup",**

#### **"imageUrl": "https://example.com/newhero.png",**

#### **"iconUrl": "https://example.com/icon.png",**

#### **"searchBar": true,**

#### **"gradient": "linear-gradient(...)",**

#### **"layout": "standard",**

#### **"updatedAt": "2025-11-25T20:30:00.000Z"**

#### **}**

####

#### ---

# **5\. Delete Hero Section**

#### **API Name: Delete Hero Section** **API Description: Deletes a hero section by ID.**

### **1.1 Work Unit Detail**

- #### **Job Code: HERO005**

- #### **Source System: property management system**

- #### **Target System: Database**

#### **Objective: Remove hero section** **Periodicity: On-demand** **Interface: REST API** **URL: /api/hero/\[id\]** **Method Name: DELETE** **Input Type: URL parameter (id)** **Output Type: JSON** **Expected Output: Success message** **Macro Logic: Delete hero section in DB** **Watch-outs: Ensure valid ID** **Performance: Fast**

#### ---

### **1.2 Request Body Parameters**

#### **None**

#### ---

### **1.3 Response Fields**

| S.No  | FieldName   | Api Tag Name | DataType   | Remarks             |
| ----- | ----------- | ------------ | ---------- | ------------------- |
| **1** | **message** | **message**  | **string** | **Success message** |

#### ---

### **1.4 Request \- Response Sample**

#### **Request:**

#### **DELETE /api/hero/2**

####

#### **Response:**

#### **{**

#### **"message": "Hero section deleted successfully"**

#### **}**

####

#### ---

### **1.5 Error Handling**

- #### **500 Database error**

#### ---

### **1.6 Sample Postman Simulation**

- #### **Method: DELETE**

- #### **URL: http://localhost:3000/api/hero/2**

# **1\. Get All Features**

#### **API Name: Get All Features** **API Description: Retrieves all features; optionally limits the number of results returned.**

### **1.1 Work Unit Detail**

- #### **Job Code: FEATURE001**

- #### **Source System: property management system**

- #### **Target System: Database (Prisma/Feature Table)**

#### **Objective: Fetch all features, optionally filtered by limit.** **Periodicity: On-demand** **Interface: REST API** **URL: /api/feature** **Method Name: GET** **Input Type: Query parameter limit (optional)** **Output Type: JSON array** **Expected Output: Array of feature objects, including connected plans** **Macro Logic: Query all features; slice by limit if provided** **Watch-outs: limit must be numeric** **Performance: Fast**

#### ---

### **1.2 Request Body Parameters**

#### **None**

#### ---

### **1.3 Response Fields**

| S.No  | FieldName       | Api Tag Name    | DataType    | Remarks                              |
| ----- | --------------- | --------------- | ----------- | ------------------------------------ |
| **1** | **id**          | **id**          | **integer** | **Feature ID**                       |
| **2** | **title**       | **title**       | **string**  | **Feature title**                    |
| **3** | **description** | **description** | **string**  | **Optional description**             |
| **4** | **plans**       | **plans**       | **array**   | **Connected plans (id, name, etc.)** |

#### ---

### **1.4 Request \- Response Sample**

#### **Request:**

#### **GET /api/feature?limit=5**

####

#### **Response:**

#### **\[**

#### **{**

#### **"id": 1,**

#### **"title": "Premium Support",**

#### **"description": "24/7 customer support",**

#### **"plans": \[**

#### **{ "id": 2, "name": "Gold Plan" }**

#### **\]**

#### **}**

#### **\]**

####

#### ---

### **1.5 Error Handling**

- #### **500 Database error**

#### ---

### **1.6 Sample Postman Simulation**

- #### **Method: GET**

- #### **URL: http://localhost:3000/api/feature?limit=5**

#### ---

# **2\. Get Feature by ID**

#### **API Name: Get Feature by ID** **API Description: Retrieves a single feature by its ID.**

### **1.1 Work Unit Detail**

- #### **Job Code: FEATURE002**

- #### **Source System: property management system**

- #### **Target System: Database**

#### **Objective: Fetch a specific feature** **Periodicity: On-demand** **Interface: REST API** **URL: /api/feature/\[id\]** **Method Name: GET** **Input Type: URL parameter (id)** **Output Type: JSON object** **Expected Output: Feature object with connected plans** **Macro Logic: Retrieve feature by ID** **Watch-outs: Ensure numeric ID** **Performance: Fast**

#### ---

### **1.2 Request Body Parameters**

#### **None**

#### ---

### **1.3 Response Fields**

#### **Same as Get All Features (single object)**

#### ---

### **1.4 Request \- Response Sample**

#### **Request:**

#### **GET /api/feature/1**

####

#### **Response:**

#### **{**

#### **"id": 1,**

#### **"title": "Premium Support",**

#### **"description": "24/7 customer support",**

#### **"plans": \[**

#### **{ "id": 2, "name": "Gold Plan" }**

#### **\]**

#### **}**

####

#### ---

### **1.5 Error Handling**

- #### **404 Feature not found**

- #### **400 Invalid feature ID**

- #### **500 Database error**

#### ---

### **1.6 Sample Postman Simulation**

- #### **Method: GET**

- #### **URL: http://localhost:3000/api/feature/1**

#### ---

# **3\. Create Feature**

#### **API Name: Create Feature** **API Description: Creates a new feature and optionally associates it with a plan.**

### **1.1 Work Unit Detail**

- #### **Job Code: FEATURE003**

- #### **Source System: property management system**

- #### **Target System: Database**

#### **Objective: Add a new feature** **Periodicity: On-demand** **Interface: REST API** **URL: /api/feature** **Method Name: POST** **Input Type: JSON Body** **Output Type: JSON object** **Expected Output: Created feature object** **Macro Logic: Insert new feature; connect to plan if planId provided** **Watch-outs: Validate numeric planId** **Performance: Fast**

#### ---

### **1.2 Request Body Parameters**

| S.No  | FieldName       | Api Tag Name    | DataType    | Remarks                                |
| ----- | --------------- | --------------- | ----------- | -------------------------------------- |
| **1** | **title**       | **title**       | **string**  | **Required**                           |
| **2** | **description** | **description** | **string**  | **Optional**                           |
| **3** | **planId**      | **planId**      | **integer** | **Optional; connects feature to plan** |

#### ---

### **1.3 Response Fields**

#### **Same as Get Feature by ID**

#### ---

### **1.4 Request \- Response Sample**

#### **Request:**

#### **POST /api/feature**

#### **{**

#### **"title": "Advanced Analytics",**

#### **"description": "Insights for recycling trends",**

#### **"planId": 1**

#### **}**

####

#### **Response:**

#### **{**

#### **"id": 5,**

#### **"title": "Advanced Analytics",**

#### **"description": "Insights for recycling trends",**

#### **"plans": \[**

#### **{ "id": 1, "name": "Basic Plan" }**

#### **\]**

#### **}**

####

#### ---

### **1.5 Error Handling**

- #### **500 Database error**

#### ---

### **1.6 Sample Postman Simulation**

- #### **Method: POST**

- #### **URL: http://localhost:3000/api/feature**

#### ---

# **4\. Update Feature**

#### **API Name: Update Feature** **API Description: Updates an existing feature by ID and optionally changes its associated plan.**

### **1.1 Work Unit Detail**

- #### **Job Code: FEATURE004**

- #### **Source System: property management system**

- #### **Target System: Database**

#### **Objective: Update a feature** **Periodicity: On-demand** **Interface: REST API** **URL: /api/feature/\[id\]** **Method Name: PUT** **Input Type: JSON Body** **Output Type: JSON object** **Expected Output: Updated feature object** **Macro Logic: Update DB record; optionally replace plan association** **Watch-outs: Numeric ID; optional fields** **Performance: Fast**

#### ---

### **1.2 Request Body Parameters**

| S.No  | FieldName       | Api Tag Name    | DataType    | Remarks                                         |
| ----- | --------------- | --------------- | ----------- | ----------------------------------------------- |
| **1** | **title**       | **title**       | **string**  | **Optional**                                    |
| **2** | **description** | **description** | **string**  | **Optional**                                    |
| **3** | **planId**      | **planId**      | **integer** | **Optional; replaces current plan association** |

#### ---

### **1.3 Response Fields**

#### **Same as Get Feature by ID**

#### ---

### **1.4 Request \- Response Sample**

#### **Request:**

#### **PUT /api/feature/5**

#### **{**

#### **"title": "Premium Analytics",**

#### **"planId": 2**

#### **}**

####

#### **Response:**

#### **{**

#### **"id": 5,**

#### **"title": "Premium Analytics",**

#### **"description": "Insights for recycling trends",**

#### **"plans": \[**

#### **{ "id": 2, "name": "Gold Plan" }**

#### **\]**

#### **}**

####

#### ---

### **1.5 Error Handling**

- #### **400 Invalid feature ID**

- #### **404 Feature not found**

- #### **500 Database error**

#### ---

### **1.6 Sample Postman Simulation**

- #### **Method: PUT**

- #### **URL: http://localhost:3000/api/feature/5**

#### ---

# **5\. Delete Feature**

#### **API Name: Delete Feature** **API Description: Deletes a feature by ID.**

### **1.1 Work Unit Detail**

- #### **Job Code: FEATURE005**

- #### **Source System: property management system**

- #### **Target System: Database**

#### **Objective: Remove a feature** **Periodicity: On-demand** **Interface: REST API** **URL: /api/feature/\[id\]** **Method Name: DELETE** **Input Type: URL parameter (id)** **Output Type: JSON** **Expected Output: Success message** **Macro Logic: Delete feature in DB** **Watch-outs: Ensure numeric ID** **Performance: Fast**

#### ---

### **1.2 Request Body Parameters**

#### **None**

#### ---

### **1.3 Response Fields**

| S.No  | FieldName   | Api Tag Name | DataType   | Remarks             |
| ----- | ----------- | ------------ | ---------- | ------------------- |
| **1** | **message** | **message**  | **string** | **Success message** |

#### ---

### **1.4 Request \- Response Sample**

#### **Request:**

#### **DELETE /api/feature/5**

####

#### **Response:**

#### **{**

#### **"message": "Feature deleted successfully"**

#### **}**

####

#### ---

### **1.5 Error Handling**

- #### **400 Invalid feature ID**

- #### **500 Database error**

####

#### **1 Get All CTAs**

#### **API Name: Get All CTAs** **API Description: Retrieves all CTA (Call To Action) entries, ordered by creation date descending.**

### **1.1 Work Unit Detail**

- #### **Job Code: CTA001**

- #### **Source System: property management system**

- #### **Target System: Database (Prisma/cTA Table)**

#### **Objective: Fetch all CTA entries** **Periodicity: On-demand** **Interface: REST API** **URL: /api/cta** **Method Name: GET** **Input Type: None** **Output Type: JSON array** **Expected Output: Array of CTA objects** **Macro Logic: Query all CTAs from the database, order by createdAt descending** **Watch-outs: None** **Performance: Fast**

#### ---

### **1.2 Request Body Parameters**

#### **None**

#### ---

### **1.3 Response Fields**

| S.No  | FieldName      | Api Tag Name   | DataType    | Remarks                      |
| ----- | -------------- | -------------- | ----------- | ---------------------------- |
| **1** | **id**         | **id**         | **integer** | **CTA ID**                   |
| **2** | **page**       | **page**       | **string**  | **Page where CTA appears**   |
| **3** | **title**      | **title**      | **string**  | **CTA title**                |
| **4** | **subtitle**   | **subtitle**   | **string**  | **Optional subtitle**        |
| **5** | **buttonText** | **buttonText** | **string**  | **Text displayed on button** |
| **6** | **buttonUrl**  | **buttonUrl**  | **string**  | **URL button points to**     |
| **7** | **gradient**   | **gradient**   | **string**  | **Gradient style for CTA**   |
| **8** | **updatedAt**  | **updatedAt**  | **string**  | **Timestamp of last update** |

#### ---

### **1.4 Request \- Response Sample**

#### **Request:**

#### **GET /api/cta**

####

#### **Response:**

#### **\[**

#### **{**

#### **"id": 1,**

#### **"page": "home",**

#### **"title": "Join Recycling",**

#### **"subtitle": "Start today",**

#### **"buttonText": "Sign Up",**

#### **"buttonUrl": "/signup",**

#### **"gradient": "linear-gradient(to right, \#00f, \#0ff)",**

#### **"updatedAt": "2025-11-25T18:30:00Z"**

#### **}**

#### **\]**

####

#### ---

### **1.5 Error Handling**

- #### **500 Database error**

#### ---

### **1.6 Sample Postman Simulation**

- #### **Method: GET**

- #### **URL: http://localhost:3000/api/cta**

#### ---

# **2\. Get CTA by ID**

#### **API Name: Get CTA by ID** **API Description: Retrieves a single CTA entry by its ID.**

### **1.1 Work Unit Detail**

- #### **Job Code: CTA002**

- #### **Source System: property management system**

- #### **Target System: Database**

#### **Objective: Fetch a specific CTA entry** **Periodicity: On-demand** **Interface: REST API** **URL: /api/cta/\[id\]** **Method Name: GET** **Input Type: URL parameter (id)** **Output Type: JSON object** **Expected Output: CTA object** **Macro Logic: Retrieve CTA by ID** **Watch-outs: Ensure numeric ID** **Performance: Fast**

#### ---

### **1.2 Request Body Parameters**

#### **None**

#### ---

### **1.3 Response Fields**

#### **Same as Get All CTAs (single object)**

#### ---

### **1.4 Request \- Response Sample**

#### **Request:**

#### **GET /api/cta/1**

####

#### **Response:**

#### **{**

#### **"id": 1,**

#### **"page": "home",**

#### **"title": "Join Recycling",**

#### **"subtitle": "Start today",**

#### **"buttonText": "Sign Up",**

#### **"buttonUrl": "/signup",**

#### **"gradient": "linear-gradient(to right, \#00f, \#0ff)",**

#### **"updatedAt": "2025-11-25T18:30:00Z"**

#### **}**

####

#### ---

### **1.5 Error Handling**

- #### **404 CTA not found**

- #### **500 Database error**

#### ---

### **1.6 Sample Postman Simulation**

- #### **Method: GET**

- #### **URL: http://localhost:3000/api/cta/1**

#### ---

# **3\. Create CTA**

#### **API Name: Create CTA** **API Description: Creates a new CTA entry.**

### **1.1 Work Unit Detail**

- #### **Job Code: CTA003**

- #### **Source System: property management system**

- #### **Target System: Database**

#### **Objective: Add a new CTA entry** **Periodicity: On-demand** **Interface: REST API** **URL: /api/cta** **Method Name: POST** **Input Type: JSON Body** **Output Type: JSON object** **Expected Output: Created CTA object** **Macro Logic: Insert new CTA into database** **Watch-outs: Required fields: page, title** **Performance: Fast**

#### ---

### **1.2 Request Body Parameters**

| S.No  | FieldName      | Api Tag Name   | DataType   | Remarks      |
| ----- | -------------- | -------------- | ---------- | ------------ |
| **1** | **page**       | **page**       | **string** | **Required** |
| **2** | **title**      | **title**      | **string** | **Required** |
| **3** | **subtitle**   | **subtitle**   | **string** | **Optional** |
| **4** | **buttonText** | **buttonText** | **string** | **Optional** |
| **5** | **buttonUrl**  | **buttonUrl**  | **string** | **Optional** |
| **6** | **gradient**   | **gradient**   | **string** | **Optional** |

#### ---

### **1.3 Response Fields**

#### **Same as Get All CTAs (single object)**

#### ---

### **1.4 Request \- Response Sample**

#### **Request:**

#### **POST /api/cta**

#### **{**

#### **"page": "home",**

#### **"title": "Join Recycling",**

#### **"subtitle": "Start today",**

#### **"buttonText": "Sign Up",**

#### **"buttonUrl": "/signup",**

#### **"gradient": "linear-gradient(to right, \#00f, \#0ff)"**

#### **}**

####

#### **Response:**

#### **{**

#### **"id": 2,**

#### **"page": "home",**

#### **"title": "Join Recycling",**

#### **"subtitle": "Start today",**

#### **"buttonText": "Sign Up",**

#### **"buttonUrl": "/signup",**

#### **"gradient": "linear-gradient(to right, \#00f, \#0ff)",**

#### **"updatedAt": "2025-11-25T18:45:00Z"**

#### **}**

####

#### ---

### **1.5 Error Handling**

- #### **400 Missing required fields**

- #### **500 Database error**

#### ---

### **1.6 Sample Postman Simulation**

- #### **Method: POST**

- #### **URL: http://localhost:3000/api/cta**

#### ---

# **4\. Update CTA**

#### **API Name: Update CTA** **API Description: Updates an existing CTA entry by ID.**

### **1.1 Work Unit Detail**

- #### **Job Code: CTA004**

- #### **Source System: property management system**

- #### **Target System: Database**

#### **Objective: Update a CTA entry** **Periodicity: On-demand** **Interface: REST API** **URL: /api/cta/\[id\]** **Method Name: PUT** **Input Type: JSON Body** **Output Type: JSON object** **Expected Output: Updated CTA object** **Macro Logic: Update DB record by ID** **Watch-outs: Numeric ID required** **Performance: Fast**

#### ---

### **1.2 Request Body Parameters**

| S.No  | FieldName      | Api Tag Name   | DataType   | Remarks      |
| ----- | -------------- | -------------- | ---------- | ------------ |
| **1** | **page**       | **page**       | **string** | **Optional** |
| **2** | **title**      | **title**      | **string** | **Optional** |
| **3** | **subtitle**   | **subtitle**   | **string** | **Optional** |
| **4** | **buttonText** | **buttonText** | **string** | **Optional** |
| **5** | **buttonUrl**  | **buttonUrl**  | **string** | **Optional** |
| **6** | **gradient**   | **gradient**   | **string** | **Optional** |

#### ---

### **1.3 Response Fields**

#### **Same as Get All CTAs (single object)**

#### ---

### **1.4 Request \- Response Sample**

#### **Request:**

#### **PUT /api/cta/2**

#### **{**

#### **"title": "Start Recycling Today",**

#### **"buttonText": "Register Now"**

#### **}**

####

#### **Response:**

#### **{**

#### **"id": 2,**

#### **"page": "home",**

#### **"title": "Start Recycling Today",**

#### **"subtitle": "Start today",**

#### **"buttonText": "Register Now",**

#### **"buttonUrl": "/signup",**

#### **"gradient": "linear-gradient(to right, \#00f, \#0ff)",**

#### **"updatedAt": "2025-11-25T18:50:00Z"**

#### **}**

####

#### ---

### **1.5 Error Handling**

- #### **500 Database error**

#### ---

### **1.6 Sample Postman Simulation**

- #### **Method: PUT**

- #### **URL: http://localhost:3000/api/cta/2**

#### ---

# **5\. Delete CTA**

#### **API Name: Delete CTA** **API Description: Deletes a CTA entry by ID.**

### **1.1 Work Unit Detail**

- #### **Job Code: CTA005**

- #### **Source System: property management system**

- #### **Target System: Database**

#### **Objective: Remove a CTA entry** **Periodicity: On-demand** **Interface: REST API** **URL: /api/cta/\[id\]** **Method Name: DELETE** **Input Type: URL parameter (id)** **Output Type: JSON** **Expected Output: Success message** **Macro Logic: Delete CTA in DB** **Watch-outs: Ensure numeric ID** **Performance: Fast**

#### ---

### **1.2 Request Body Parameters**

#### **None**

#### ---

### **1.3 Response Fields**

| S.No  | FieldName   | Api Tag Name | DataType   | Remarks             |
| ----- | ----------- | ------------ | ---------- | ------------------- |
| **1** | **message** | **message**  | **string** | **Success message** |

#### ---

### **1.4 Request \- Response Sample**

#### **Request:**

#### **DELETE /api/cta/2**

####

#### **Response:**

#### **{**

#### **"message": "CTA deleted successfully"**

#### **}**

####

#### ---

### **1.5 Error Handling**

- #### **500 Database error**

####

[image1]: data:image/png;base64,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
