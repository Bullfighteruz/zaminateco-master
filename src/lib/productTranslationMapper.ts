/**
 * Product Translation Mapper
 * Maps product English names to translation keys for product detail pages
 */

import { useTranslation } from 'react-i18next';
import { ProductDetailData } from './productData';

/**
 * Map English product names to translation keys
 */
export const PRODUCT_TRANSLATION_KEY_MAP: Record<string, string> = {
  'EPDM-free Tiles': 'epdmFreeTiles',
  'EPDM Rubber Ecotiles': 'epdmRubberEcotiles',
  'EcoBrick': 'ecoBrick',
  'Waste Bin': 'wasteBin',
  'Garden Planter': 'gardenPlanter',
  'Eco Bench': 'ecoBench',
  'ECOBIKE RACK': 'ecobikeRack',
  'ECOBUSSTOP': 'ecobusStop',
  'Playground Block (Art Tiles)': 'playgroundBlock',
  'Ecostreet Furniture': 'ecostreetFurniture',
};

/**
 * Get translation key for a product
 */
export function getProductTranslationKey(englishName: string): string {
  return PRODUCT_TRANSLATION_KEY_MAP[englishName] || englishName.toLowerCase().replace(/\s+/g, '');
}

/**
 * Hook to get translated product details
 */
export function useProductTranslations(productDetail: ProductDetailData | null) {
  const { t } = useTranslation('shop');
  
  if (!productDetail) {
    return {
      badges: [],
      overview: { title: '', description: '', specifications: [] },
      technicalSpecs: [],
      sustainability: [],
      useCases: [],
      features: [],
    };
  }
  
  const productKey = getProductTranslationKey(productDetail.englishName);
  const basePath = `productDetails.${productKey}`;
  
  // Get translated badges
  const badges = productDetail.badges.map((badge, index) => {
    // Try to find translation key for badge text
    const badgeKey = Object.keys(productDetail.badges).find((key, i) => i === index);
    const translationKey = `${basePath}.badges.${badgeKey || index}`;
    const translated = t(`${translationKey}`, { defaultValue: badge.text });
    return { ...badge, text: translated };
  });
  
  // Get translated overview
  const overview = {
    title: t(`${basePath}.overview.title`, { defaultValue: productDetail.overview.title }),
    description: t(`${basePath}.overview.description`, { defaultValue: productDetail.overview.description }),
    specifications: productDetail.overview.specifications.map((spec, index) => {
      return t(`${basePath}.overview.specs.${index}`, { defaultValue: spec });
    }),
  };
  
  // Get translated technical specs
  const technicalSpecs = productDetail.technicalSpecs.map((spec) => {
    const labelKey = `${basePath}.technicalSpecs.${spec.label.toLowerCase().replace(/\s+/g, '')}`;
    return {
      ...spec,
      label: t(labelKey, { defaultValue: spec.label }),
      description: spec.description ? t(`${basePath}.sustainability.${spec.description.toLowerCase().replace(/\s+/g, '')}`, { defaultValue: spec.description }) : undefined,
    };
  });
  
  // Get translated sustainability metrics
  const sustainability = productDetail.sustainability.map((metric) => {
    const labelKey = `${basePath}.sustainability.${metric.label.toLowerCase().replace(/\s+/g, '')}`;
    const descKey = metric.description ? `${basePath}.sustainability.${metric.description.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')}` : '';
    return {
      ...metric,
      label: t(labelKey, { defaultValue: metric.label }),
      description: metric.description ? t(descKey, { defaultValue: metric.description }) : undefined,
    };
  });
  
  // Get translated use cases
  const useCases = productDetail.useCases.map((useCase, index) => {
    const keys = Object.keys(productDetail.useCases || {});
    const useCaseKey = keys[index] || index.toString();
    const titleKey = `${basePath}.useCases.${useCaseKey}.title`;
    const descKey = `${basePath}.useCases.${useCaseKey}.description`;
    return {
      ...useCase,
      title: t(titleKey, { defaultValue: useCase.title }),
      description: t(descKey, { defaultValue: useCase.description }),
    };
  });
  
  // Get translated features
  const features = productDetail.features.map((feature, index) => {
    const keys = Object.keys(productDetail.features || {});
    const featureKey = keys[index] || index.toString();
    const titleKey = `${basePath}.features.${featureKey}.title`;
    const descKey = `${basePath}.features.${featureKey}.description`;
    return {
      ...feature,
      title: t(titleKey, { defaultValue: feature.title }),
      description: t(descKey, { defaultValue: feature.description }),
    };
  });
  
  return {
    badges,
    overview,
    technicalSpecs,
    sustainability,
    useCases,
    features,
  };
}

