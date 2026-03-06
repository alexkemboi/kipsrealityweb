/**
 * Advanced input sanitization and security utilities for listing operations
 * Provides comprehensive protection against XSS, injection attacks, and data corruption
 */

/**
 * SQL injection prevention utilities
 */
export class SQLSanitizer {
    private static readonly SQL_INJECTION_PATTERNS = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
        /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
        /(--|\/\*|\*\/|;)/g,
        /(\b(CHAR|NCHAR|VARCHAR|NVARCHAR)\s*\()/gi,
        /(\b(CAST|CONVERT|SUBSTRING|ASCII|CHAR_LENGTH)\s*\()/gi
    ];

    /**
     * Detects potential SQL injection attempts
     */
    static containsSQLInjection(input: string): boolean {
        return this.SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
    }

    /**
     * Sanitizes input to prevent SQL injection
     */
    static sanitize(input: string): string {
        if (this.containsSQLInjection(input)) {
            throw new Error('Potential SQL injection detected');
        }
        return input.replace(/['"\\]/g, ''); // Remove quotes and backslashes
    }
}

/**
 * XSS prevention utilities
 */
export class XSSSanitizer {
    private static readonly XSS_PATTERNS = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
        /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
        /<link\b[^>]*>/gi,
        /<meta\b[^>]*>/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /on\w+\s*=/gi,
        /<\s*\/?\s*(script|iframe|object|embed|link|meta|form|input|button)\b[^>]*>/gi
    ];

    private static readonly ALLOWED_TAGS = [
        'p', 'br', 'strong', 'em', 'u', 'i', 'b', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
    ];

    /**
     * Detects potential XSS attempts
     */
    static containsXSS(input: string): boolean {
        return this.XSS_PATTERNS.some(pattern => pattern.test(input));
    }

    /**
     * Sanitizes HTML content to prevent XSS
     */
    static sanitizeHTML(input: string): string {
        let sanitized = input;

        // Remove dangerous patterns
        this.XSS_PATTERNS.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '');
        });

        // Remove all HTML tags except allowed ones
        sanitized = sanitized.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tagName) => {
            if (this.ALLOWED_TAGS.includes(tagName.toLowerCase())) {
                return `<${tagName.toLowerCase()}>`;
            }
            return '';
        });

        // Encode remaining angle brackets
        sanitized = sanitized.replace(/</g, '&lt;').replace(/>/g, '&gt;');

        return sanitized;
    }

    /**
     * Strips all HTML tags
     */
    static stripHTML(input: string): string {
        return input.replace(/<[^>]*>/g, '');
    }
}

/**
 * Path traversal prevention utilities
 */
export class PathSanitizer {
    public static readonly PATH_TRAVERSAL_PATTERNS = [
        /\.\./g,
        /\.\\/g,
        /\.\//g,
        /~\//g,
        /\\/g,
        /\/\//g
    ];

    /**
     * Detects path traversal attempts
     */
    static containsPathTraversal(input: string): boolean {
        return this.PATH_TRAVERSAL_PATTERNS.some(pattern => pattern.test(input));
    }

    /**
     * Sanitizes file paths
     */
    static sanitizePath(input: string): string {
        if (this.containsPathTraversal(input)) {
            throw new Error('Path traversal attempt detected');
        }
        
        // Remove dangerous characters and normalize
        return input
            .replace(/[^a-zA-Z0-9._-]/g, '')
            .substring(0, 255); // Limit length
    }
}

/**
 * Comprehensive input sanitizer
 */
export class ListingSanitizer {
    /**
     * Sanitizes text input with multiple security checks
     */
    static sanitizeText(input: string, options: {
        maxLength?: number;
        allowHTML?: boolean;
        strictMode?: boolean;
    } = {}): string {
        const {
            maxLength = 5000,
            allowHTML = false,
            strictMode = false
        } = options;

        if (typeof input !== 'string') {
            throw new Error('Input must be a string');
        }

        let sanitized = input.trim();

        // Length check
        if (sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength);
        }

        // Remove null bytes and control characters
        sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

        // SQL injection check
        if (SQLSanitizer.containsSQLInjection(sanitized)) {
            if (strictMode) {
                throw new Error('Potential SQL injection detected');
            }
            sanitized = SQLSanitizer.sanitize(sanitized);
        }

        // XSS prevention
        if (allowHTML) {
            if (XSSSanitizer.containsXSS(sanitized)) {
                if (strictMode) {
                    throw new Error('Potential XSS attack detected');
                }
                sanitized = XSSSanitizer.sanitizeHTML(sanitized);
            }
        } else {
            sanitized = XSSSanitizer.stripHTML(sanitized);
        }

        // Path traversal check
        if (PathSanitizer.containsPathTraversal(sanitized)) {
            if (strictMode) {
                throw new Error('Path traversal attempt detected');
            }
            // Remove path traversal patterns
            PathSanitizer.PATH_TRAVERSAL_PATTERNS.forEach(pattern => {
                sanitized = sanitized.replace(pattern, '');
            });
        }

        return sanitized;
    }

    /**
     * Sanitizes numeric input
     */
    static sanitizeNumber(input: any, options: {
        min?: number;
        max?: number;
        decimals?: number;
        allowNegative?: boolean;
    } = {}): number | null {
        const {
            min = Number.MIN_SAFE_INTEGER,
            max = Number.MAX_SAFE_INTEGER,
            decimals = 2,
            allowNegative = true
        } = options;

        // Convert to number
        const num = Number(input);

        // Validation checks
        if (isNaN(num) || !isFinite(num)) {
            return null;
        }

        // Negative check
        if (!allowNegative && num < 0) {
            return null;
        }

        // Range check
        if (num < min || num > max) {
            return null;
        }

        // Round to specified decimal places
        const factor = Math.pow(10, decimals);
        return Math.round(num * factor) / factor;
    }

    /**
     * Sanitizes email addresses
     */
    static sanitizeEmail(input: string): string | null {
        if (typeof input !== 'string') {
            return null;
        }

        const sanitized = this.sanitizeText(input, { maxLength: 254, strictMode: true });
        
        // Basic email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        if (!emailRegex.test(sanitized)) {
            return null;
        }

        return sanitized.toLowerCase();
    }

    /**
     * Sanitizes phone numbers
     */
    static sanitizePhone(input: string): string | null {
        if (typeof input !== 'string') {
            return null;
        }

        // Remove all non-digit characters
        const digits = input.replace(/\D/g, '');
        
        // Validate length (10-15 digits for international numbers)
        if (digits.length < 10 || digits.length > 15) {
            return null;
        }

        return digits;
    }

    /**
     * Sanitizes URLs
     */
    static sanitizeURL(input: string): string | null {
        if (typeof input !== 'string') {
            return null;
        }

        const sanitized = this.sanitizeText(input, { maxLength: 2048, strictMode: true });
        
        try {
            const url = new URL(sanitized);
            
            // Only allow HTTP and HTTPS protocols
            if (!['http:', 'https:'].includes(url.protocol)) {
                return null;
            }

            return url.toString();
        } catch (error) {
            return null;
        }
    }

    /**
     * Sanitizes date inputs
     */
    static sanitizeDate(input: any): Date | null {
        if (input instanceof Date) {
            return isNaN(input.getTime()) ? null : input;
        }

        if (typeof input === 'string' || typeof input === 'number') {
            const date = new Date(input);
            return isNaN(date.getTime()) ? null : date;
        }

        return null;
    }

    /**
     * Sanitizes boolean inputs
     */
    static sanitizeBoolean(input: any): boolean {
        if (typeof input === 'boolean') {
            return input;
        }

        if (typeof input === 'string') {
            const lower = input.toLowerCase().trim();
            return ['true', '1', 'yes', 'on'].includes(lower);
        }

        if (typeof input === 'number') {
            return input !== 0;
        }

        return false;
    }

    /**
     * Sanitizes array inputs
     */
    static sanitizeArray(input: any, itemSanitizer: (item: any) => any): any[] {
        if (!Array.isArray(input)) {
            return [];
        }

        return input
            .map(item => {
                try {
                    return itemSanitizer(item);
                } catch (error) {
                    return null;
                }
            })
            .filter(item => item !== null);
    }

    /**
     * Comprehensive object sanitization
     */
    static sanitizeObject(input: any, schema: Record<string, (value: any) => any>): any {
        if (typeof input !== 'object' || input === null || Array.isArray(input)) {
            throw new Error('Input must be an object');
        }

        const sanitized: any = {};

        for (const [key, sanitizer] of Object.entries(schema)) {
            if (key in input) {
                try {
                    sanitized[key] = sanitizer(input[key]);
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    throw new Error(`Sanitization failed for field '${key}': ${message}`);
                }
            }
        }

        return sanitized;
    }
}

/**
 * Security audit utilities
 */
export class SecurityAuditor {
    /**
     * Performs comprehensive security audit on input data
     */
    static auditInput(input: any, context: {
        operation: string;
        userId: string;
        timestamp: Date;
    }): {
        passed: boolean;
        violations: string[];
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    } {
        const violations: string[] = [];
        let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

        // Check for common attack patterns
        const inputString = JSON.stringify(input);

        if (SQLSanitizer.containsSQLInjection(inputString)) {
            violations.push('Potential SQL injection detected');
            riskLevel = 'CRITICAL';
        }

        if (XSSSanitizer.containsXSS(inputString)) {
            violations.push('Potential XSS attack detected');
            riskLevel = riskLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH';
        }

        if (PathSanitizer.containsPathTraversal(inputString)) {
            violations.push('Path traversal attempt detected');
            riskLevel = riskLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH';
        }

        // Check for suspicious patterns
        if (inputString.length > 100000) {
            violations.push('Unusually large input detected');
            riskLevel = riskLevel === 'CRITICAL' ? 'CRITICAL' : 'MEDIUM';
        }

        if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(inputString)) {
            violations.push('Control characters detected');
            riskLevel = riskLevel === 'CRITICAL' ? 'CRITICAL' : 'MEDIUM';
        }

        return {
            passed: violations.length === 0,
            violations,
            riskLevel
        };
    }
}
