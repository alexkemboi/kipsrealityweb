/**
 * Unit tests for listing validation and security measures
 * Tests input validation, role-based permissions, data sanitization, and rate limiting
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { 
    ListingValidationService, 
    UserRole, 
    ListingPermission,
    CreateListingSchema,
    UpdateListingSchema,
    BulkOperationSchema,
    StatusUpdateSchema
} from '@/lib/listing-validation';
import { 
    ListingSanitizer, 
    XSSSanitizer, 
    SQLSanitizer, 
    PathSanitizer,
    SecurityAuditor 
} from '@/lib/listing-sanitizer';
import { getSecurityPolicy, requiresAuth, getRequiredRole } from '@/lib/listing-security-config';

describe('Listing Validation Service', () => {
    let validationService: ListingValidationService;

    beforeEach(() => {
        validationService = ListingValidationService.getInstance();
    });

    describe('Input Validation', () => {
        it('should validate valid listing creation data', () => {
            const validData = {
                title: 'Beautiful 2BR Apartment',
                description: 'A lovely apartment with great amenities and city views.',
                price: 1500,
                availabilityDate: new Date('2024-03-01'),
                expirationDate: new Date('2024-12-31')
            };

            const result = validationService.validateCreateListing(validData);
            
            expect(result.isValid).toBe(true);
            expect(result.sanitizedData).toBeDefined();
            expect(result.errors).toBeUndefined();
        });

        it('should reject listing with invalid title', () => {
            const invalidData = {
                title: '', // Empty title
                description: 'A lovely apartment with great amenities.',
                price: 1500
            };

            const result = validationService.validateCreateListing(invalidData);
            
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('title: Title is required');
        });

        it('should reject listing with invalid price', () => {
            const invalidData = {
                title: 'Valid Title',
                description: 'A lovely apartment with great amenities.',
                price: -100 // Negative price
            };

            const result = validationService.validateCreateListing(invalidData);
            
            expect(result.isValid).toBe(false);
            expect(result.errors?.some(error => error.includes('Price must be greater than 0'))).toBe(true);
        });

        it('should reject listing with past availability date', () => {
            const invalidData = {
                title: 'Valid Title',
                description: 'A lovely apartment with great amenities.',
                price: 1500,
                availabilityDate: new Date('2020-01-01') // Past date
            };

            const result = validationService.validateCreateListing(invalidData);
            
            expect(result.isValid).toBe(false);
            expect(result.errors?.some(error => error.includes('Availability date cannot be in the past'))).toBe(true);
        });

        it('should validate bulk operation data', () => {
            const validBulkData = {
                unitIds: ['unit-1', 'unit-2', 'unit-3'],
                action: 'LIST',
                reason: 'Making units available for rent'
            };

            const result = validationService.validateBulkOperation(validBulkData);
            
            expect(result.isValid).toBe(true);
            expect(result.sanitizedData?.unitIds).toHaveLength(3);
            expect(result.sanitizedData?.action).toBe('LIST');
        });

        it('should reject bulk operation with too many units', () => {
            const invalidBulkData = {
                unitIds: Array.from({ length: 60 }, (_, i) => `unit-${i}`), // Too many units
                action: 'LIST'
            };

            const result = validationService.validateBulkOperation(invalidBulkData);
            
            expect(result.isValid).toBe(false);
            expect(result.errors?.some(error => error.includes('Cannot process more than 50 units'))).toBe(true);
        });
    });

    describe('Permission Validation', () => {
        it('should grant property manager create listing permission', () => {
            const hasPermission = validationService.hasPermission(
                UserRole.PROPERTY_MANAGER, 
                ListingPermission.CREATE_LISTING
            );
            
            expect(hasPermission).toBe(true);
        });

        it('should deny tenant create listing permission', () => {
            const hasPermission = validationService.hasPermission(
                UserRole.TENANT, 
                ListingPermission.CREATE_LISTING
            );
            
            expect(hasPermission).toBe(false);
        });

        it('should grant admin all permissions', () => {
            const permissions = Object.values(ListingPermission);
            
            permissions.forEach(permission => {
                const hasPermission = validationService.hasPermission(UserRole.ADMIN, permission);
                expect(hasPermission).toBe(true);
            });
        });

        it('should validate operation permissions correctly', () => {
            const createResult = validationService.validatePermissions(UserRole.PROPERTY_MANAGER, 'create');
            expect(createResult.hasPermission).toBe(true);

            const deleteResult = validationService.validatePermissions(UserRole.TENANT, 'delete');
            expect(deleteResult.hasPermission).toBe(false);
            expect(deleteResult.error).toContain('Insufficient permissions');
        });
    });

    describe('Rate Limiting', () => {
        it('should allow requests within rate limit', () => {
            const userId = 'test-user-1';
            const operation = 'create';

            const result = validationService.checkRateLimit(userId, operation);
            
            expect(result.allowed).toBe(true);
            expect(result.remainingRequests).toBeDefined();
        });

        it('should block requests exceeding rate limit', () => {
            const userId = 'test-user-2';
            const operation = 'create';

            // Exhaust rate limit
            for (let i = 0; i < 15; i++) {
                validationService.checkRateLimit(userId, operation);
            }

            const result = validationService.checkRateLimit(userId, operation);
            
            expect(result.allowed).toBe(false);
            expect(result.resetTime).toBeDefined();
        });
    });
});

describe('Data Sanitization', () => {
    describe('XSS Prevention', () => {
        it('should detect XSS attempts', () => {
            const xssAttempts = [
                '<script>alert("xss")</script>',
                '<iframe src="javascript:alert(1)"></iframe>',
                '<img onerror="alert(1)" src="x">',
                'javascript:alert(1)'
            ];

            xssAttempts.forEach(attempt => {
                expect(XSSSanitizer.containsXSS(attempt)).toBe(true);
            });
        });

        it('should sanitize HTML content', () => {
            const maliciousHTML = '<script>alert("xss")</script><p>Safe content</p>';
            const sanitized = XSSSanitizer.sanitizeHTML(maliciousHTML);
            
            expect(sanitized).not.toContain('<script>');
            expect(sanitized).toContain('Safe content');
        });

        it('should strip all HTML tags when requested', () => {
            const htmlContent = '<p>Hello <strong>world</strong></p>';
            const stripped = XSSSanitizer.stripHTML(htmlContent);
            
            expect(stripped).toBe('Hello world');
        });
    });

    describe('SQL Injection Prevention', () => {
        it('should detect SQL injection attempts', () => {
            const sqlAttempts = [
                "'; DROP TABLE users; --",
                "1' OR '1'='1",
                "UNION SELECT * FROM passwords",
                "'; EXEC xp_cmdshell('dir'); --"
            ];

            sqlAttempts.forEach(attempt => {
                expect(SQLSanitizer.containsSQLInjection(attempt)).toBe(true);
            });
        });

        it('should sanitize SQL injection attempts', () => {
            const maliciousInput = "test'; DROP TABLE users; --";
            const sanitized = SQLSanitizer.sanitize(maliciousInput);
            
            expect(sanitized).not.toContain("'");
            expect(sanitized).not.toContain(';');
            expect(sanitized).not.toContain('--');
        });
    });

    describe('Path Traversal Prevention', () => {
        it('should detect path traversal attempts', () => {
            const pathAttempts = [
                '../../../etc/passwd',
                '..\\..\\windows\\system32',
                '~/../../secret',
                '//..//etc/shadow'
            ];

            pathAttempts.forEach(attempt => {
                expect(PathSanitizer.containsPathTraversal(attempt)).toBe(true);
            });
        });

        it('should sanitize file paths', () => {
            const maliciousPath = '../../../etc/passwd';
            
            expect(() => {
                PathSanitizer.sanitizePath(maliciousPath);
            }).toThrow('Path traversal attempt detected');
        });
    });

    describe('Comprehensive Sanitization', () => {
        it('should sanitize text input comprehensively', () => {
            const maliciousInput = '<script>alert("xss")</script>Test content with "quotes"';
            const sanitized = ListingSanitizer.sanitizeText(maliciousInput);
            
            expect(sanitized).not.toContain('<script>');
            expect(sanitized).toContain('Test content');
        });

        it('should sanitize numeric input', () => {
            expect(ListingSanitizer.sanitizeNumber('123.456', { decimals: 2 })).toBe(123.46);
            expect(ListingSanitizer.sanitizeNumber('invalid')).toBeNull();
            expect(ListingSanitizer.sanitizeNumber(-100, { allowNegative: false })).toBeNull();
        });

        it('should sanitize email addresses', () => {
            expect(ListingSanitizer.sanitizeEmail('test@example.com')).toBe('test@example.com');
            expect(ListingSanitizer.sanitizeEmail('INVALID_EMAIL')).toBeNull();
            expect(ListingSanitizer.sanitizeEmail('test@<script>alert(1)</script>.com')).toBeNull();
        });

        it('should sanitize URLs', () => {
            expect(ListingSanitizer.sanitizeURL('https://example.com')).toBe('https://example.com/');
            expect(ListingSanitizer.sanitizeURL('javascript:alert(1)')).toBeNull();
            expect(ListingSanitizer.sanitizeURL('ftp://example.com')).toBeNull();
        });

        it('should sanitize arrays', () => {
            const input = ['valid', '<script>alert(1)</script>', 'also valid'];
            const sanitized = ListingSanitizer.sanitizeArray(input, (item) => 
                ListingSanitizer.sanitizeText(item)
            );
            
            expect(sanitized).toHaveLength(3);
            expect(sanitized[1]).not.toContain('<script>');
        });
    });
});

describe('Security Auditing', () => {
    it('should audit input for security violations', () => {
        const maliciousInput = {
            title: '<script>alert("xss")</script>',
            description: "'; DROP TABLE users; --",
            price: 1500
        };

        const audit = SecurityAuditor.auditInput(maliciousInput, {
            operation: 'create',
            userId: 'test-user',
            timestamp: new Date()
        });

        expect(audit.passed).toBe(false);
        expect(audit.violations).toContain('Potential XSS attack detected');
        expect(audit.violations).toContain('Potential SQL injection detected');
        expect(audit.riskLevel).toBe('CRITICAL');
    });

    it('should pass audit for clean input', () => {
        const cleanInput = {
            title: 'Beautiful Apartment',
            description: 'A lovely place to live',
            price: 1500
        };

        const audit = SecurityAuditor.auditInput(cleanInput, {
            operation: 'create',
            userId: 'test-user',
            timestamp: new Date()
        });

        expect(audit.passed).toBe(true);
        expect(audit.violations).toHaveLength(0);
        expect(audit.riskLevel).toBe('LOW');
    });
});

describe('Security Configuration', () => {
    it('should return correct security policy for operations', () => {
        const createPolicy = getSecurityPolicy('listing:create');
        expect(createPolicy?.requireAuth).toBe(true);
        expect(createPolicy?.requiredRole).toBe(UserRole.PROPERTY_MANAGER);

        const viewPolicy = getSecurityPolicy('listing:view');
        expect(viewPolicy?.requireAuth).toBe(false);
    });

    it('should check authentication requirements correctly', () => {
        expect(requiresAuth('listing:create')).toBe(true);
        expect(requiresAuth('listing:view')).toBe(false);
        expect(requiresAuth('nonexistent:operation')).toBe(true); // Default to requiring auth
    });

    it('should return correct required roles', () => {
        expect(getRequiredRole('listing:create')).toBe(UserRole.PROPERTY_MANAGER);
        expect(getRequiredRole('listing:view')).toBeNull();
    });
});

describe('Schema Validation', () => {
    it('should validate create listing schema', () => {
        const validData = {
            title: 'Test Listing',
            description: 'A test listing description that meets minimum length requirements.',
            price: 1500,
            availabilityDate: new Date('2024-06-01')
        };

        const result = CreateListingSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should validate update listing schema', () => {
        const validData = {
            title: 'Updated Title',
            price: 1600
        };

        const result = UpdateListingSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should validate bulk operation schema', () => {
        const validData = {
            unitIds: ['unit-1', 'unit-2'],
            action: 'LIST',
            reason: 'Making units available'
        };

        const result = BulkOperationSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should validate status update schema', () => {
        const validData = {
            status: 'ACTIVE',
            reason: 'Activating listing'
        };

        const result = StatusUpdateSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });
});