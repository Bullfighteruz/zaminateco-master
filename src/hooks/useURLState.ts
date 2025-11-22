/**
 * useURLState Hook
 * Syncs component state with URL query parameters
 * Enables shareable filters, deep linking, browser navigation
 * 
 * Industry standard: Used by Amazon, eBay, Airbnb
 */

import { useSearchParams, useLocation } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

export function useURLState() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  
  // Update URL without page reload
  const updateURL = useCallback((updates: Record<string, string | string[] | null | number>) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
          newParams.delete(key);
        } else if (Array.isArray(value)) {
          newParams.set(key, value.join(','));
        } else {
          newParams.set(key, String(value));
        }
      });
      
      return newParams;
    }, { replace: true }); // Use replace to avoid cluttering history
  }, [setSearchParams]);
  
  // Get URL value
  const getURLValue = useCallback((key: string): string | null => {
    return searchParams.get(key);
  }, [searchParams]);
  
  // Get URL array value (comma-separated)
  const getURLArray = useCallback((key: string): string[] => {
    const value = searchParams.get(key);
    return value ? value.split(',').filter(Boolean) : [];
  }, [searchParams]);
  
  // Get all URL params as object
  const getAllParams = useMemo(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);
  
  // Clear all URL params
  const clearURL = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);
  
  return { 
    updateURL, 
    getURLValue, 
    getURLArray, 
    getAllParams,
    clearURL,
    searchParams,
    location 
  };
}

