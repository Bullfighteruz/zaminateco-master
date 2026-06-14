export const getCollectionPoints = (t: (key: string) => string) => [
  {
    id: 1,
    name: t('tashkentCentralPark'),
    type: 'mixed',
    collected: '1250.5',
    status: 'active',
    distance: '2.3',
    emoji: '🗂️',
    image: '/images/park.webp'
  },
  {
    id: 2,
    name: t('chilonzorMahalla'),
    type: 'plastic',
    collected: '890.2',
    status: 'active',
    distance: '2.3',
    emoji: '♻️',
    image: '/images/compost_13285420.webp'
  },
  {
    id: 3,
    name: t('yunusobodDistrict'),
    type: 'tires',
    collected: '456.8',
    status: 'active',
    distance: '2.3',
    emoji: '🛞',
    image: '/images/ECOBUSSTOP.webp'
  }
];