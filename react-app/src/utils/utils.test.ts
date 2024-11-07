// utils.test.ts
import { describe, it, expect } from 'vitest';
import { cn } from './utils'; // Adjust the import according to your file structure

describe('cn function', () => {
  it('should return a single class name', () => {
    expect(cn('bg-red-500')).toBe('bg-red-500');
  });

  it('should concatenate multiple class names', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  it('should ignore falsy values', () => {
    expect(cn('bg-red-500', false, 'text-white', null)).toBe('bg-red-500 text-white');
  });

  it('should handle conditional classes', () => {
    const condition = true;
    expect(cn('bg-red-500', condition && 'text-white')).toBe('bg-red-500 text-white');
    expect(cn('bg-red-500', !condition && 'text-white')).toBe('bg-red-500'); // Should not include 'text-white'
  });

  it('should merge conflicting Tailwind classes', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500'); // tailwind-merge should resolve this
    expect(cn('bg-red-500', 'bg-red-500/50')).toBe('bg-red-500/50'); // should keep the more specific class
  });

  it('should handle arrays of class names', () => {
    expect(cn(['bg-red-500', 'text-white'])).toBe('bg-red-500 text-white');
  });

  it('should handle empty inputs', () => {
    expect(cn()).toBe('');
  });

  it('should handle complex combinations', () => {
    const conditionA = true;
    const conditionB = false;
    expect(cn('bg-red-500', conditionA && 'text-white', conditionB && 'text-black')).toBe('bg-red-500 text-white');
    expect(cn('bg-green-500', null, 'bg-blue-500')).toBe('bg-blue-500'); // Tailwind merge should resolve this
  });
});
