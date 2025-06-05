import { describe, it, expect } from 'vitest';
import { sanitizeForXSS } from '../../utils/security';

describe('Security Utils', () => {
  describe('sanitizeForXSS', () => {
    it('should remove script tags', () => {
      const maliciousInput = '<script>alert("XSS attack!")</script>Hello World';
      const result = sanitizeForXSS(maliciousInput);
      
      expect(result).toBe('Hello World');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    it('should remove javascript: protocol', () => {
      const maliciousInput = 'javascript:alert("XSS")';
      const result = sanitizeForXSS(maliciousInput);
      
      expect(result).toBe('alert("XSS")');
      expect(result).not.toContain('javascript:');
    });

    it('should remove onload event handlers', () => {
      const maliciousInput = '<img onload="alert(\'XSS\')" src="image.jpg">Safe content';
      const result = sanitizeForXSS(maliciousInput);
      
      expect(result).toBe('<img  src="image.jpg">Safe content');
      expect(result).not.toContain('onload');
      expect(result).not.toContain('alert');
    });

    it('should remove eval functions', () => {
      const maliciousInput = 'eval("malicious code")Normal text';
      const result = sanitizeForXSS(maliciousInput);
      
      expect(result).toBe('"malicious code")Normal text');
      expect(result).not.toContain('eval(');
    });

    it('should handle empty and invalid inputs safely', () => {
      expect(sanitizeForXSS('')).toBe('');
      expect(sanitizeForXSS(null as any)).toBe('');
      expect(sanitizeForXSS(undefined as any)).toBe('');
      expect(sanitizeForXSS(123 as any)).toBe('');
    });

    it('should preserve safe content', () => {
      const safeInput = 'This is safe content with numbers 123 and symbols !@#$%';
      const result = sanitizeForXSS(safeInput);
      
      expect(result).toBe(safeInput);
    });
  });
}); 