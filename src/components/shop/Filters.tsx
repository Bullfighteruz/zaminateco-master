/**
 * Filters Component
 * Advanced filtering system with category, material, price, and search
 * Real-time search with fuzzy matching
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, SlidersHorizontal } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';

export interface FilterState {
  category: string[];
  material: string[];
  priceRange: [number, number];
  search: string;
}

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FiltersProps {
  categories?: FilterOption[];
  materials?: FilterOption[];
  priceRange?: [number, number];
  onFilterChange?: (filters: FilterState) => void;
  className?: string;
}

export default function Filters({
  categories = [],
  materials = [],
  priceRange = [0, 10000000],
  onFilterChange,
  className
}: FiltersProps) {
  const { t } = useTranslation('shop');
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(priceRange[0]);
  const [priceMax, setPriceMax] = useState(priceRange[1]);

  const activeFilterCount = useMemo(() => {
    return selectedCategories.length + selectedMaterials.length + 
           (priceMin !== priceRange[0] || priceMax !== priceRange[1] ? 1 : 0) +
           (searchQuery.trim() ? 1 : 0);
  }, [selectedCategories, selectedMaterials, priceMin, priceMax, priceRange, searchQuery]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    onFilterChange?.({
      category: selectedCategories,
      material: selectedMaterials,
      priceRange: [priceMin, priceMax],
      search: value
    });
  }, [selectedCategories, selectedMaterials, priceMin, priceMax, onFilterChange]);

  const toggleCategory = useCallback((categoryId: string) => {
    setSelectedCategories(prev => {
      const updated = prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId];
      
      onFilterChange?.({
        category: updated,
        material: selectedMaterials,
        priceRange: [priceMin, priceMax],
        search: searchQuery
      });
      
      return updated;
    });
  }, [selectedMaterials, priceMin, priceMax, searchQuery, onFilterChange]);

  const toggleMaterial = useCallback((materialId: string) => {
    setSelectedMaterials(prev => {
      const updated = prev.includes(materialId)
        ? prev.filter(id => id !== materialId)
        : [...prev, materialId];
      
      onFilterChange?.({
        category: selectedCategories,
        material: updated,
        priceRange: [priceMin, priceMax],
        search: searchQuery
      });
      
      return updated;
    });
  }, [selectedCategories, priceMin, priceMax, searchQuery, onFilterChange]);

  const handlePriceChange = useCallback(() => {
    onFilterChange?.({
      category: selectedCategories,
      material: selectedMaterials,
      priceRange: [priceMin, priceMax],
      search: searchQuery
    });
  }, [selectedCategories, selectedMaterials, priceMin, priceMax, searchQuery, onFilterChange]);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedMaterials([]);
    setPriceMin(priceRange[0]);
    setPriceMax(priceRange[1]);
    onFilterChange?.({
      category: [],
      material: [],
      priceRange: priceRange,
      search: ''
    });
  }, [priceRange, onFilterChange]);

  return (
    <div className={cn("w-full", isMobile ? "space-y-2" : "space-y-4", className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className={cn("absolute top-1/2 transform -translate-y-1/2 text-gray-400", isMobile ? "left-2 h-4 w-4" : "left-3 h-5 w-5")} />
        <Input
          type="text"
          placeholder={t('filters.searchPlaceholder', { defaultValue: 'Search products...' })}
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className={cn("pr-10", isMobile ? "pl-8 h-9 text-sm" : "pl-10 h-12 text-base")}
          aria-label={t('filters.searchPlaceholder', { defaultValue: 'Search products...' })}
        />
        {searchQuery && (
          <button
            onClick={() => handleSearchChange('')}
            className={cn("absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600", isMobile ? "right-2" : "right-3")}
            aria-label={t('ariaLabels.clearSearch', { defaultValue: 'Clear search' })}
          >
            <X className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
          </button>
        )}
      </div>

      {/* Filter Toggle Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={cn("w-full justify-between", isMobile ? "h-9 text-sm" : "")}
        aria-expanded={isOpen}
        aria-controls="filters-panel"
      >
        <div className={cn("flex items-center", isMobile ? "gap-1.5" : "gap-2")}>
          <SlidersHorizontal className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
          <span>{t('filters.title', { defaultValue: 'Filters' })}</span>
          {activeFilterCount > 0 && (
            <Badge className={cn("bg-green-600 text-white", isMobile ? "ml-1 text-[10px] px-1 py-0" : "ml-2")}>
              {activeFilterCount}
            </Badge>
          )}
        </div>
        <Filter className={cn("transition-transform", isMobile ? "h-4 w-4" : "h-5 w-5", isOpen && "rotate-180")} />
      </Button>

      {/* Filters Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="filters-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className={cn("border border-gray-200 rounded-lg bg-white", isMobile ? "p-3 space-y-3" : "p-6 space-y-6")}>
              {/* Category Filters */}
              {categories.length > 0 && (
                <div>
                  <h3 className={cn("font-semibold text-gray-900", isMobile ? "text-xs mb-2" : "text-sm mb-3")}>
                    {t('filters.category', { defaultValue: 'Category' })}
                  </h3>
                  <div className={cn("flex flex-wrap", isMobile ? "gap-1.5" : "gap-2")}>
                    {categories.map((category) => (
                      <Badge
                        key={category.id}
                        variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-all",
                          isMobile ? "text-[10px] px-1.5 py-0.5" : "",
                          selectedCategories.includes(category.id)
                            ? "bg-green-600 text-white"
                            : "hover:bg-gray-100"
                        )}
                        onClick={() => toggleCategory(category.id)}
                        role="button"
                        tabIndex={0}
                        aria-pressed={selectedCategories.includes(category.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleCategory(category.id);
                          }
                        }}
                      >
                        {category.label}
                        {category.count !== undefined && (
                          <span className={cn("opacity-75", isMobile ? "ml-0.5" : "ml-1")}>
                            ({category.count})
                          </span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Material Filters */}
              {materials.length > 0 && (
                <div>
                  <h3 className={cn("font-semibold text-gray-900", isMobile ? "text-xs mb-2" : "text-sm mb-3")}>
                    {t('filters.material', { defaultValue: 'Material' })}
                  </h3>
                  <div className={cn("flex flex-wrap", isMobile ? "gap-1.5" : "gap-2")}>
                    {materials.map((material) => (
                      <Badge
                        key={material.id}
                        variant={selectedMaterials.includes(material.id) ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-all",
                          isMobile ? "text-[10px] px-1.5 py-0.5" : "",
                          selectedMaterials.includes(material.id)
                            ? "bg-green-600 text-white"
                            : "hover:bg-gray-100"
                        )}
                        onClick={() => toggleMaterial(material.id)}
                        role="button"
                        tabIndex={0}
                        aria-pressed={selectedMaterials.includes(material.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleMaterial(material.id);
                          }
                        }}
                      >
                        {material.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div>
                <h3 className={cn("font-semibold text-gray-900", isMobile ? "text-xs mb-2" : "text-sm mb-3")}>
                  {t('filters.priceRange', { defaultValue: 'Price Range (UZS)' })}
                </h3>
                <div className={cn("grid grid-cols-2", isMobile ? "gap-2" : "gap-4")}>
                  <div>
                    <label className={cn("text-gray-600 block", isMobile ? "text-[10px] mb-0.5" : "text-xs mb-1")}>
                      {t('filters.min', { defaultValue: 'Min' })}
                    </label>
                    <Input
                      type="number"
                      value={priceMin}
                      onChange={(e) => setPriceMin(Number(e.target.value))}
                      onBlur={handlePriceChange}
                      className={cn(isMobile ? "h-8 text-xs" : "h-10")}
                    />
                  </div>
                  <div>
                    <label className={cn("text-gray-600 block", isMobile ? "text-[10px] mb-0.5" : "text-xs mb-1")}>
                      {t('filters.max', { defaultValue: 'Max' })}
                    </label>
                    <Input
                      type="number"
                      value={priceMax}
                      onChange={(e) => setPriceMax(Number(e.target.value))}
                      onBlur={handlePriceChange}
                      className={cn(isMobile ? "h-8 text-xs" : "h-10")}
                    />
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  onClick={clearAllFilters}
                  className={cn("w-full text-red-600 hover:text-red-700 hover:bg-red-50", isMobile ? "h-8 text-xs" : "")}
                >
                  <X className={cn(isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2")} />
                  {t('filters.clearAll', { defaultValue: 'Clear All Filters' })}
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

