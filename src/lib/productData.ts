/**
 * Comprehensive Product Database for ZAMINAT
 * Contains technical specifications, sustainability metrics, use cases, and features
 * for all eco-products in the shop
 */

export interface ProductBadge {
  text: string;
  icon?: string;
}

export interface TechnicalSpec {
  label: string;
  value: string;
  unit?: string;
}

export interface SustainabilityMetric {
  label: string;
  value: string;
  description?: string;
}

export interface UseCase {
  title: string;
  description: string;
  icon: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: string;
}

export interface ProductDetailData {
  id: number;
  englishName: string;
  nameKey: string;
  descriptionKey: string;
  categoryKey: string;
  folderName: string; // Folder name in public/images/
  badges: ProductBadge[];
  overview: {
    title: string;
    description: string;
    specifications: string[];
  };
  technicalSpecs: TechnicalSpec[];
  sustainability: SustainabilityMetric[];
  useCases: UseCase[];
  features: Feature[];
  materialComposition: {
    recycledRubber?: number;
    recycledPlastic?: number;
    other?: string;
  };
}

/**
 * Product folder mapping based on englishName
 */
const PRODUCT_FOLDER_MAP: Record<string, string> = {
  'EPDM-free Tiles': 'EPDM-free-Tiles-page',
  'EPDM Rubber Ecotiles': 'epdm-tiles-page',
  'EcoBrick': 'eco-bricks-page',
  'Waste Bin': 'Waste-Bin-page',
  'Garden Planter': 'garden-planter-page',
  'Eco Bench': 'eco-bench-page',
  'ECOBIKE RACK': 'ECOBIKE-RACK-page',
  'ECOBUSSTOP': 'ECOBUSSTOP-page',
  'Playground Block (Art Tiles)': 'art-tiles-page',
  'Ecostreet Furniture': 'Ecostreet-Furniture-page',
};

/**
 * Complete product detail data
 */
export const PRODUCT_DETAIL_DATA: Record<string, ProductDetailData> = {
  'EPDM-free Tiles': {
    id: 1,
    englishName: 'EPDM-free Tiles',
    nameKey: 'products.epdmFreeTiles.name',
    descriptionKey: 'products.epdmFreeTiles.description',
    categoryKey: 'products.epdmFreeTiles.category',
    folderName: 'EPDM-free-Tiles-page',
    badges: [
      { text: '90% Recycled Material' },
      { text: 'Heat Resistant +70°C' },
      { text: 'Frost Resistant -30°C' },
      { text: 'UV-Stabilized' },
      { text: 'Non-toxic / Low VOC' },
    ],
    overview: {
      title: 'UZ Rubber S1 — Two-Layer Shock-Absorbing Rubber Tile',
      description: 'High-performance rubber tiles made from recycled materials, perfect for sports facilities, waterfront areas, and technical rooms. Features excellent shock absorption and durability.',
      specifications: [
        'Size: 500×500 mm',
        'Thickness: 20–40 mm',
        'Base: SBR crumb 1–3 mm (65–70%) + PU binder',
        'Top layer: EPDM-free composite 0.5–1.5 mm',
        'Standards: EN 1177 compliant, HIC safe',
        'Climate: +70°C heat, −30°C cold',
      ],
    },
    technicalSpecs: [
      { label: 'Size', value: '500×500', unit: 'mm' },
      { label: 'Thickness', value: '20–40', unit: 'mm' },
      { label: 'Weight', value: '8–12', unit: 'kg/m²' },
      { label: 'Density', value: '800–1200', unit: 'kg/m³' },
      { label: 'Base Material', value: 'SBR crumb 1–3 mm (65–70%) + PU binder' },
      { label: 'Top Layer', value: 'EPDM-free composite 0.5–1.5 mm' },
      { label: 'Compressive Strength', value: '>0.5', unit: 'MPa' },
      { label: 'Shore Hardness', value: '45–55', unit: 'A' },
      { label: 'Water Absorption', value: '<3', unit: '%' },
      { label: 'UV Rating', value: 'Class 5–6' },
      { label: 'Temperature Range', value: '-30°C to +70°C' },
      { label: 'Lifespan', value: '15–20', unit: 'years' },
      { label: 'Manufacturing', value: 'Hot press composite mix' },
      { label: 'Standards', value: 'EN 1177, HIC safe' },
    ],
    sustainability: [
      { label: 'Recycled Rubber', value: '70%', description: 'From waste tires' },
      { label: 'Recycled Plastic', value: '20%', description: 'HDPE/PP waste' },
      { label: 'CO2 Reduction', value: '65%', description: 'vs virgin materials' },
      { label: 'Waste Diverted', value: '2.5', unit: 'kg/m²', description: 'From landfill' },
      { label: 'Social Impact', value: 'Community mahalla projects supported' },
    ],
    useCases: [
      { title: 'Sports Facilities', description: 'Indoor and outdoor sports courts, gyms', icon: '⚽' },
      { title: 'Waterfront Areas', description: 'Pool decks, spa areas, wet zones', icon: '🏊' },
      { title: 'Production Rooms', description: 'Technical rooms, workshops', icon: '🏭' },
      { title: 'Playgrounds', description: 'Safe surface for children play areas', icon: '🛝' },
    ],
    features: [
      { title: 'Shock Absorption', description: 'Excellent impact resistance for safety', icon: '🛡️' },
      { title: 'Anti-slip', description: 'High friction surface prevents accidents', icon: '🚶' },
      { title: 'UV-Stable', description: 'Does not fade or degrade in sunlight', icon: '☀️' },
      { title: 'Chemical Resistant', description: 'Withstands cleaning agents and chemicals', icon: '🧪' },
      { title: 'Non-toxic', description: 'Low VOC, safe for indoor use', icon: '✅' },
      { title: 'Durable', description: '15–20 years lifespan without maintenance', icon: '⏱️' },
    ],
    materialComposition: {
      recycledRubber: 70,
      recycledPlastic: 20,
      other: 'PU binder, additives 10%',
    },
  },
  'EPDM Rubber Ecotiles': {
    id: 2,
    englishName: 'EPDM Rubber Ecotiles',
    nameKey: 'products.epdmRubberEcotiles.name',
    descriptionKey: 'products.epdmRubberEcotiles.description',
    categoryKey: 'products.epdmRubberEcotiles.category',
    folderName: 'epdm-tiles-page',
    badges: [
      { text: '95% Recycled Material' },
      { text: 'Heat Resistant +90°C' },
      { text: 'Frost Resistant -30°C' },
      { text: 'UV-Stabilized' },
      { text: 'EN 1177 Certified' },
    ],
    overview: {
      title: 'EPDM Rubber Ecotiles — Premium Playground Safety Tiles',
      description: 'Maximum safety playground tiles with superior shock absorption. Ideal for jogging paths, walking trails, and high-traffic recreational areas.',
      specifications: [
        'Size: 500×500 mm, 1000×1000 mm',
        'Thickness: 30–50 mm',
        'Base: SBR crumb 1–3 mm (70–75%) + PU binder',
        'Top layer: EPDM 2–4 mm + aliphatic PU',
        'Standards: EN 1177, HIC <1000, Critical fall height up to 3m',
        'Climate: +90°C heat, −30°C cold',
      ],
    },
    technicalSpecs: [
      { label: 'Size', value: '500×500, 1000×1000', unit: 'mm' },
      { label: 'Thickness', value: '30–50', unit: 'mm' },
      { label: 'Weight', value: '12–18', unit: 'kg/m²' },
      { label: 'Density', value: '900–1300', unit: 'kg/m³' },
      { label: 'Base Material', value: 'SBR crumb 1–3 mm (70–75%) + PU binder' },
      { label: 'Top Layer', value: 'EPDM 2–4 mm + aliphatic PU' },
      { label: 'Shore Hardness', value: '40–50', unit: 'A' },
      { label: 'HIC Value', value: '<1000', description: 'Head Injury Criterion' },
      { label: 'Critical Fall Height', value: 'Up to 3', unit: 'm' },
      { label: 'Water Absorption', value: '<2', unit: '%' },
      { label: 'UV Rating', value: 'Class 6' },
      { label: 'Temperature Range', value: '-30°C to +90°C' },
      { label: 'Lifespan', value: '20+', unit: 'years' },
      { label: 'Standards', value: 'EN 1177 certified' },
    ],
    sustainability: [
      { label: 'Recycled Rubber', value: '75%', description: 'From waste tires' },
      { label: 'Recycled Plastic', value: '20%', description: 'HDPE/PP waste' },
      { label: 'CO2 Reduction', value: '70%', description: 'vs virgin materials' },
      { label: 'Waste Diverted', value: '3.2', unit: 'kg/m²', description: 'From landfill' },
      { label: 'Social Impact', value: 'EcoKids playground projects supported' },
    ],
    useCases: [
      { title: 'Playgrounds', description: 'Maximum safety for children play areas', icon: '🛝' },
      { title: 'Jogging Paths', description: 'Soft surface for running tracks', icon: '🏃' },
      { title: 'Walking Trails', description: 'Comfortable paths in parks and gardens', icon: '🚶' },
      { title: 'Sports Zones', description: 'Outdoor fitness and activity areas', icon: '⚽' },
    ],
    features: [
      { title: 'Maximum Shock Absorption', description: 'EN 1177 certified safety standards', icon: '🛡️' },
      { title: 'Anti-slip', description: 'High grip surface in all weather', icon: '🚶' },
      { title: 'UV-Stable', description: 'Colorfast for 20+ years', icon: '☀️' },
      { title: 'Weatherproof', description: 'Withstands extreme temperatures', icon: '🌡️' },
      { title: 'Non-toxic', description: 'Safe for children, low VOC', icon: '✅' },
      { title: 'Maintenance Free', description: 'No special care required', icon: '🔧' },
    ],
    materialComposition: {
      recycledRubber: 75,
      recycledPlastic: 20,
      other: 'EPDM granules, PU binder 5%',
    },
  },
  'EcoBrick': {
    id: 3,
    englishName: 'EcoBrick',
    nameKey: 'products.ecoBrick.name',
    descriptionKey: 'products.ecoBrick.description',
    categoryKey: 'products.ecoBrick.category',
    folderName: 'eco-bricks-page',
    badges: [
      { text: '100% Recycled Material' },
      { text: 'Weatherproof' },
      { text: 'Lightweight' },
      { text: 'Modular Design' },
    ],
    overview: {
      title: 'EcoBrick — Building Blocks from Recycled Plastic and Rubber',
      description: 'Durable modular building blocks made entirely from recycled materials. Perfect for construction projects, garden walls, and creative installations.',
      specifications: [
        'Size: 200×100×100 mm (standard)',
        'Material: Recycled HDPE/PP (70%) + Rubber (30%)',
        'Weight: 0.8–1.2 kg per brick',
        'Density: 850–1000 kg/m³',
        'Compressive strength: >5 MPa',
        'Temperature range: -40°C to +80°C',
      ],
    },
    technicalSpecs: [
      { label: 'Standard Size', value: '200×100×100', unit: 'mm' },
      { label: 'Weight', value: '0.8–1.2', unit: 'kg/piece' },
      { label: 'Density', value: '850–1000', unit: 'kg/m³' },
      { label: 'Material', value: 'HDPE/PP (70%) + Rubber (30%)' },
      { label: 'Compressive Strength', value: '>5', unit: 'MPa' },
      { label: 'Water Absorption', value: '<1', unit: '%' },
      { label: 'Temperature Range', value: '-40°C to +80°C' },
      { label: 'UV Rating', value: 'Class 5' },
      { label: 'Lifespan', value: '30+', unit: 'years' },
      { label: 'Manufacturing', value: 'Extrusion molding' },
    ],
    sustainability: [
      { label: 'Recycled Plastic', value: '70%', description: 'HDPE/PP waste' },
      { label: 'Recycled Rubber', value: '30%', description: 'From waste tires' },
      { label: 'CO2 Reduction', value: '80%', description: 'vs traditional bricks' },
      { label: 'Waste Diverted', value: '0.9', unit: 'kg/piece', description: 'From landfill' },
    ],
    useCases: [
      { title: 'Garden Walls', description: 'Decorative and functional garden structures', icon: '🌳' },
      { title: 'Construction', description: 'Modular building blocks for small structures', icon: '🏗️' },
      { title: 'Creative Installations', description: 'Art installations and design elements', icon: '🎨' },
      { title: 'Retaining Walls', description: 'Lightweight retaining wall solutions', icon: '🧱' },
    ],
    features: [
      { title: '100% Recycled', description: 'Made entirely from waste materials', icon: '♻️' },
      { title: 'Weatherproof', description: 'Resistant to weather and moisture', icon: '🌧️' },
      { title: 'Lightweight', description: 'Easy to transport and install', icon: '📦' },
      { title: 'Modular', description: 'Interlocking design for easy assembly', icon: '🔗' },
      { title: 'Durable', description: '30+ years lifespan', icon: '⏱️' },
      { title: 'Non-porous', description: 'Does not absorb water or rot', icon: '💧' },
    ],
    materialComposition: {
      recycledPlastic: 70,
      recycledRubber: 30,
    },
  },
  'Waste Bin': {
    id: 4,
    englishName: 'Waste Bin',
    nameKey: 'products.wasteBin.name',
    descriptionKey: 'products.wasteBin.description',
    categoryKey: 'products.wasteBin.category',
    folderName: 'Waste-Bin-page',
    badges: [
      { text: '100% Recycled Material' },
      { text: 'Weatherproof' },
      { text: 'UV-Resistant' },
      { text: 'Easy to Clean' },
    ],
    overview: {
      title: 'Waste Bin — Recycling Bins from Recycled Plastic',
      description: 'Durable waste collection bins made from recycled HDPE. Perfect for public spaces, parks, streets, and communities to help collect more recyclable waste.',
      specifications: [
        'Capacity: 60–120 liters',
        'Material: Recycled HDPE',
        'Weight: 8–15 kg',
        'Lid: Hinged or removable',
        'Lock: Optional lockable version',
        'Color: Customizable (green, blue, gray)',
      ],
    },
    technicalSpecs: [
      { label: 'Capacity', value: '60–120', unit: 'liters' },
      { label: 'Weight', value: '8–15', unit: 'kg' },
      { label: 'Material', value: '100% Recycled HDPE' },
      { label: 'Wall Thickness', value: '4–6', unit: 'mm' },
      { label: 'Dimensions', value: '400×400×800', unit: 'mm (approx)' },
      { label: 'UV Rating', value: 'Class 5' },
      { label: 'Temperature Range', value: '-30°C to +70°C' },
      { label: 'Lifespan', value: '15–20', unit: 'years' },
      { label: 'Manufacturing', value: 'Rotational molding' },
    ],
    sustainability: [
      { label: 'Recycled Plastic', value: '100%', description: 'HDPE from waste' },
      { label: 'CO2 Reduction', value: '75%', description: 'vs virgin HDPE' },
      { label: 'Waste Diverted', value: '8–15', unit: 'kg/piece', description: 'From landfill' },
      { label: 'Recyclable', value: '100%', description: 'Can be recycled again' },
    ],
    useCases: [
      { title: 'Public Spaces', description: 'Parks, squares, streets', icon: '🏛️' },
      { title: 'Communities', description: 'Mahalla collection points', icon: '🏘️' },
      { title: 'Schools', description: 'Educational institutions', icon: '🏫' },
      { title: 'Events', description: 'Temporary waste collection', icon: '🎪' },
    ],
    features: [
      { title: 'Weatherproof', description: 'Resistant to all weather conditions', icon: '🌧️' },
      { title: 'UV-Resistant', description: 'Does not fade or degrade', icon: '☀️' },
      { title: 'Easy to Clean', description: 'Smooth surface, easy maintenance', icon: '🧹' },
      { title: 'Durable', description: 'Long-lasting in public spaces', icon: '⏱️' },
      { title: 'Lightweight', description: 'Easy to move and install', icon: '📦' },
      { title: 'Customizable', description: 'Various sizes and colors available', icon: '🎨' },
    ],
    materialComposition: {
      recycledPlastic: 100,
    },
  },
  'Garden Planter': {
    id: 5,
    englishName: 'Garden Planter',
    nameKey: 'products.gardenPlanter.name',
    descriptionKey: 'products.gardenPlanter.description',
    categoryKey: 'products.gardenPlanter.category',
    folderName: 'garden-planter-page',
    badges: [
      { text: '100% Recycled Material' },
      { text: 'Weatherproof' },
      { text: 'Drainage System' },
      { text: 'Lightweight' },
    ],
    overview: {
      title: 'Garden Planter — Planters from Recycled Rubber and Plastic',
      description: 'Beautiful and durable planters for your garden made from rubber waste. Perfect for flowers, herbs, and small trees with built-in drainage system.',
      specifications: [
        'Sizes: 30L, 50L, 100L capacity',
        'Material: Recycled rubber + HDPE',
        'Weight: 3–8 kg (depending on size)',
        'Drainage: Built-in drainage holes',
        'Color: Natural rubber color or customizable',
        'Shape: Round, square, rectangular options',
      ],
    },
    technicalSpecs: [
      { label: 'Capacity', value: '30, 50, 100', unit: 'liters' },
      { label: 'Weight', value: '3–8', unit: 'kg' },
      { label: 'Material', value: 'Recycled rubber (60%) + HDPE (40%)' },
      { label: 'Wall Thickness', value: '5–8', unit: 'mm' },
      { label: 'UV Rating', value: 'Class 5' },
      { label: 'Temperature Range', value: '-20°C to +70°C' },
      { label: 'Drainage', value: 'Built-in holes' },
      { label: 'Lifespan', value: '20+', unit: 'years' },
    ],
    sustainability: [
      { label: 'Recycled Rubber', value: '60%', description: 'From waste tires' },
      { label: 'Recycled Plastic', value: '40%', description: 'HDPE waste' },
      { label: 'CO2 Reduction', value: '70%', description: 'vs virgin materials' },
      { label: 'Waste Diverted', value: '3–8', unit: 'kg/piece', description: 'From landfill' },
    ],
    useCases: [
      { title: 'Home Gardens', description: 'Beautiful planters for home use', icon: '🏠' },
      { title: 'Balconies', description: 'Lightweight options for balconies', icon: '🏢' },
      { title: 'Public Spaces', description: 'Parks and community gardens', icon: '🌳' },
      { title: 'Restaurants', description: 'Outdoor dining area decoration', icon: '🍽️' },
    ],
    features: [
      { title: 'Weatherproof', description: 'Resistant to weather and moisture', icon: '🌧️' },
      { title: 'Drainage System', description: 'Built-in holes for proper drainage', icon: '💧' },
      { title: 'Lightweight', description: 'Easy to move and rearrange', icon: '📦' },
      { title: 'Durable', description: 'Long-lasting in outdoor conditions', icon: '⏱️' },
      { title: 'Eco-friendly', description: '100% recycled materials', icon: '♻️' },
      { title: 'Natural Look', description: 'Beautiful natural rubber finish', icon: '🌿' },
    ],
    materialComposition: {
      recycledRubber: 60,
      recycledPlastic: 40,
    },
  },
  'Eco Bench': {
    id: 6,
    englishName: 'Eco Bench',
    nameKey: 'products.ecoBench.name',
    descriptionKey: 'products.ecoBench.description',
    categoryKey: 'products.ecoBench.category',
    folderName: 'eco-bench-page',
    badges: [
      { text: '100% Recycled Material' },
      { text: 'Weatherproof' },
      { text: 'UV-Resistant' },
      { text: 'Maintenance Free' },
    ],
    overview: {
      title: 'Eco Bench — Comfortable Outdoor Bench from Plastic Waste',
      description: 'Durable and comfortable outdoor bench made entirely from recycled plastic waste. Perfect for parks, bus stops, gardens, and public spaces.',
      specifications: [
        'Length: 1200–1800 mm',
        'Material: Recycled HDPE (100%)',
        'Weight: 25–35 kg',
        'Seats: 2–3 person capacity',
        'Color: Natural HDPE color or customizable',
        'Installation: Ground-mounted or free-standing',
      ],
    },
    technicalSpecs: [
      { label: 'Length', value: '1200–1800', unit: 'mm' },
      { label: 'Width', value: '400–500', unit: 'mm' },
      { label: 'Height', value: '450', unit: 'mm' },
      { label: 'Weight', value: '25–35', unit: 'kg' },
      { label: 'Material', value: '100% Recycled HDPE' },
      { label: 'UV Rating', value: 'Class 6' },
      { label: 'Temperature Range', value: '-30°C to +70°C' },
      { label: 'Load Capacity', value: '250', unit: 'kg' },
      { label: 'Lifespan', value: '20+', unit: 'years' },
      { label: 'Manufacturing', value: 'Extrusion molding' },
    ],
    sustainability: [
      { label: 'Recycled Plastic', value: '100%', description: 'HDPE from waste' },
      { label: 'CO2 Reduction', value: '80%', description: 'vs virgin materials' },
      { label: 'Waste Diverted', value: '25–35', unit: 'kg/piece', description: 'From landfill' },
      { label: 'Recyclable', value: '100%', description: 'Can be recycled again' },
    ],
    useCases: [
      { title: 'Parks', description: 'Comfortable seating in public parks', icon: '🌳' },
      { title: 'Bus Stops', description: 'Durable seating at transit points', icon: '🚌' },
      { title: 'Gardens', description: 'Garden and landscape seating', icon: '🌿' },
      { title: 'Schoolyards', description: 'Safe seating for educational institutions', icon: '🏫' },
    ],
    features: [
      { title: 'Weatherproof', description: 'Resistant to all weather conditions', icon: '🌧️' },
      { title: 'Maintenance Free', description: 'No painting or special care needed', icon: '🔧' },
      { title: 'Comfortable', description: 'Ergonomic design for comfort', icon: '🪑' },
      { title: 'Durable', description: '20+ years lifespan', icon: '⏱️' },
      { title: 'UV-Resistant', description: 'Does not fade or crack', icon: '☀️' },
      { title: 'Easy Installation', description: 'Quick ground mounting or free-standing', icon: '🔨' },
    ],
    materialComposition: {
      recycledPlastic: 100,
    },
  },
  'ECOBIKE RACK': {
    id: 7,
    englishName: 'ECOBIKE RACK',
    nameKey: 'products.ecobikeRack.name',
    descriptionKey: 'products.ecobikeRack.description',
    categoryKey: 'products.ecobikeRack.category',
    folderName: 'ECOBIKE-RACK-page',
    badges: [
      { text: '100% Recycled Material' },
      { text: 'Weatherproof' },
      { text: 'Secure Design' },
      { text: 'Modular' },
    ],
    overview: {
      title: 'ECOBIKE RACK — Bicycle Parking Solution from Recycled Materials',
      description: 'Secure and durable bicycle parking rack made from recycled HDPE and steel. Perfect for public spaces, schools, offices, and residential areas.',
      specifications: [
        'Capacity: 6–12 bicycles per unit',
        'Material: Recycled HDPE + Steel frame',
        'Weight: 45–65 kg',
        'Installation: Ground-mounted',
        'Lock: Integrated lock support',
        'Design: Wave or grid pattern',
      ],
    },
    technicalSpecs: [
      { label: 'Capacity', value: '6–12', unit: 'bicycles/unit' },
      { label: 'Weight', value: '45–65', unit: 'kg' },
      { label: 'Material', value: 'Recycled HDPE (80%) + Steel (20%)' },
      { label: 'Dimensions', value: '2400×600×1200', unit: 'mm (approx)' },
      { label: 'UV Rating', value: 'Class 6' },
      { label: 'Temperature Range', value: '-30°C to +70°C' },
      { label: 'Lifespan', value: '25+', unit: 'years' },
      { label: 'Manufacturing', value: 'Extrusion + welding' },
    ],
    sustainability: [
      { label: 'Recycled Plastic', value: '80%', description: 'HDPE from waste' },
      { label: 'Recycled Steel', value: '20%', description: 'From scrap metal' },
      { label: 'CO2 Reduction', value: '70%', description: 'vs virgin materials' },
      { label: 'Waste Diverted', value: '45–65', unit: 'kg/piece', description: 'From landfill' },
    ],
    useCases: [
      { title: 'Public Spaces', description: 'Parks, squares, transit hubs', icon: '🏛️' },
      { title: 'Schools', description: 'Student bicycle parking', icon: '🏫' },
      { title: 'Offices', description: 'Employee bicycle storage', icon: '🏢' },
      { title: 'Residential', description: 'Apartment building bike storage', icon: '🏘️' },
    ],
    features: [
      { title: 'Secure Design', description: 'Integrated lock support for safety', icon: '🔒' },
      { title: 'Weatherproof', description: 'Resistant to all weather conditions', icon: '🌧️' },
      { title: 'Modular', description: 'Expandable and customizable', icon: '🔗' },
      { title: 'Durable', description: '25+ years lifespan', icon: '⏱️' },
      { title: 'Easy Installation', description: 'Quick ground mounting', icon: '🔨' },
      { title: 'Maintenance Free', description: 'No painting or special care', icon: '🔧' },
    ],
    materialComposition: {
      recycledPlastic: 80,
      other: 'Recycled steel 20%',
    },
  },
  'ECOBUSSTOP': {
    id: 8,
    englishName: 'ECOBUSSTOP',
    nameKey: 'products.ecobusStop.name',
    descriptionKey: 'products.ecobusStop.description',
    categoryKey: 'products.ecobusStop.category',
    folderName: 'ECOBUSSTOP-page',
    badges: [
      { text: '100% Recycled Material' },
      { text: 'Complete Infrastructure' },
      { text: 'Weatherproof' },
      { text: 'Customizable' },
    ],
    overview: {
      title: 'ECOBUSSTOP — Complete Bus Stop Infrastructure from Recycled Materials',
      description: 'Complete bus stop solution including shelter, seating, and signage made from recycled plastic and rubber. Perfect for urban transit systems.',
      specifications: [
        'Components: Shelter, bench, signage, waste bin',
        'Material: Recycled HDPE + Rubber',
        'Weight: 200–300 kg',
        'Capacity: 8–12 person seating',
        'Roof: UV-protected HDPE panels',
        'Installation: Foundation-mounted',
      ],
    },
    technicalSpecs: [
      { label: 'Length', value: '3000–4000', unit: 'mm' },
      { label: 'Width', value: '1500–2000', unit: 'mm' },
      { label: 'Height', value: '2500–3000', unit: 'mm' },
      { label: 'Weight', value: '200–300', unit: 'kg' },
      { label: 'Material', value: 'Recycled HDPE (70%) + Rubber (30%)' },
      { label: 'Seating Capacity', value: '8–12', unit: 'persons' },
      { label: 'UV Rating', value: 'Class 6' },
      { label: 'Temperature Range', value: '-30°C to +70°C' },
      { label: 'Lifespan', value: '25+', unit: 'years' },
      { label: 'Manufacturing', value: 'Extrusion + composite molding' },
    ],
    sustainability: [
      { label: 'Recycled Plastic', value: '70%', description: 'HDPE from waste' },
      { label: 'Recycled Rubber', value: '30%', description: 'From waste tires' },
      { label: 'CO2 Reduction', value: '75%', description: 'vs virgin materials' },
      { label: 'Waste Diverted', value: '200–300', unit: 'kg/piece', description: 'From landfill' },
      { label: 'Social Impact', value: 'Community transit infrastructure' },
    ],
    useCases: [
      { title: 'Urban Transit', description: 'City bus stop infrastructure', icon: '🚌' },
      { title: 'Suburban Routes', description: 'Suburban bus stop solutions', icon: '🏘️' },
      { title: 'School Routes', description: 'Student bus stop facilities', icon: '🏫' },
      { title: 'Rural Areas', description: 'Rural transit point infrastructure', icon: '🌾' },
    ],
    features: [
      { title: 'Complete Solution', description: 'All-in-one bus stop infrastructure', icon: '🏗️' },
      { title: 'Weatherproof', description: 'Shelter from sun, rain, and wind', icon: '🌧️' },
      { title: 'Durable', description: '25+ years lifespan', icon: '⏱️' },
      { title: 'Customizable', description: 'Various sizes and configurations', icon: '🎨' },
      { title: 'Low Maintenance', description: 'Minimal care required', icon: '🔧' },
      { title: 'Eco-friendly', description: '100% recycled materials', icon: '♻️' },
    ],
    materialComposition: {
      recycledPlastic: 70,
      recycledRubber: 30,
    },
  },
  'Playground Block (Art Tiles)': {
    id: 9,
    englishName: 'Playground Block (Art Tiles)',
    nameKey: 'products.playgroundBlock.name',
    descriptionKey: 'products.playgroundBlock.description',
    categoryKey: 'products.playgroundBlock.category',
    folderName: 'art-tiles-page',
    badges: [
      { text: '90% Recycled Material' },
      { text: 'Creative Designs' },
      { text: 'Safe for Kids' },
      { text: 'UV-Stable' },
    ],
    overview: {
      title: 'Playground Block (Art Tiles) — Creative Playground Equipment',
      description: 'Safe and colorful playground blocks with artistic designs made from recycled materials. Perfect for creating engaging and educational play spaces for children.',
      specifications: [
        'Size: Various (300×300 to 1000×1000 mm)',
        'Thickness: 30–50 mm',
        'Material: SBR + EPDM composite',
        'Designs: Customizable patterns and colors',
        'Safe fall height: Up to 2.5m',
        'Standards: EN 1177 compliant',
      ],
    },
    technicalSpecs: [
      { label: 'Size', value: '300×300 to 1000×1000', unit: 'mm' },
      { label: 'Thickness', value: '30–50', unit: 'mm' },
      { label: 'Material', value: 'SBR (65%) + EPDM (25%) + PU binder (10%)' },
      { label: 'Weight', value: '10–20', unit: 'kg/m²' },
      { label: 'Shore Hardness', value: '40–50', unit: 'A' },
      { label: 'HIC Value', value: '<1000' },
      { label: 'Critical Fall Height', value: 'Up to 2.5', unit: 'm' },
      { label: 'UV Rating', value: 'Class 6' },
      { label: 'Temperature Range', value: '-30°C to +70°C' },
      { label: 'Lifespan', value: '15–20', unit: 'years' },
      { label: 'Standards', value: 'EN 1177 certified' },
    ],
    sustainability: [
      { label: 'Recycled Rubber', value: '65%', description: 'From waste tires' },
      { label: 'Recycled Plastic', value: '25%', description: 'HDPE/PP waste' },
      { label: 'CO2 Reduction', value: '65%', description: 'vs virgin materials' },
      { label: 'Waste Diverted', value: '10–20', unit: 'kg/m²', description: 'From landfill' },
      { label: 'Social Impact', value: 'EcoKids educational play projects' },
    ],
    useCases: [
      { title: 'Playgrounds', description: 'Creative play areas for children', icon: '🛝' },
      { title: 'Schools', description: 'Educational play installations', icon: '🏫' },
      { title: 'Kindergartens', description: 'Safe play surfaces for toddlers', icon: '👶' },
      { title: 'Parks', description: 'Public play spaces', icon: '🌳' },
    ],
    features: [
      { title: 'Creative Designs', description: 'Customizable patterns and colors', icon: '🎨' },
      { title: 'Safe for Kids', description: 'EN 1177 certified safety standards', icon: '🛡️' },
      { title: 'Educational', description: 'Engaging learning through play', icon: '📚' },
      { title: 'UV-Stable', description: 'Colorfast for many years', icon: '☀️' },
      { title: 'Shock Absorbing', description: 'Protects children from falls', icon: '🛡️' },
      { title: 'Easy Installation', description: 'Modular design for quick setup', icon: '🔨' },
    ],
    materialComposition: {
      recycledRubber: 65,
      recycledPlastic: 25,
      other: 'EPDM granules, PU binder 10%',
    },
  },
  'Ecostreet Furniture': {
    id: 10,
    englishName: 'Ecostreet Furniture',
    nameKey: 'products.ecostreetFurniture.name',
    descriptionKey: 'products.ecostreetFurniture.description',
    categoryKey: 'products.ecostreetFurniture.category',
    folderName: 'Ecostreet-Furniture-page',
    badges: [
      { text: '100% Recycled Material' },
      { text: 'Customizable' },
      { text: 'Weatherproof' },
      { text: 'Modular Design' },
    ],
    overview: {
      title: 'Ecostreet Furniture — Custom Street Furniture Solutions',
      description: 'Customizable street furniture solutions including tables, chairs, planters, and more from recycled materials. Perfect for urban spaces, plazas, and public areas.',
      specifications: [
        'Components: Tables, chairs, planters, barriers',
        'Material: Recycled HDPE + Rubber',
        'Customizable sizes and designs',
        'Color options available',
        'Modular system for flexible layouts',
        'Installation: Various mounting options',
      ],
    },
    technicalSpecs: [
      { label: 'Material', value: 'Recycled HDPE (70%) + Rubber (30%)' },
      { label: 'UV Rating', value: 'Class 6' },
      { label: 'Temperature Range', value: '-30°C to +70°C' },
      { label: 'Lifespan', value: '20+', unit: 'years' },
      { label: 'Manufacturing', value: 'Extrusion + molding' },
      { label: 'Customization', value: 'Sizes, colors, designs' },
    ],
    sustainability: [
      { label: 'Recycled Plastic', value: '70%', description: 'HDPE from waste' },
      { label: 'Recycled Rubber', value: '30%', description: 'From waste tires' },
      { label: 'CO2 Reduction', value: '75%', description: 'vs virgin materials' },
      { label: 'Waste Diverted', value: 'Variable', description: 'Depends on product' },
    ],
    useCases: [
      { title: 'Urban Spaces', description: 'Plazas, squares, pedestrian zones', icon: '🏛️' },
      { title: 'Parks', description: 'Recreational furniture for parks', icon: '🌳' },
      { title: 'Outdoor Dining', description: 'Restaurant and cafe outdoor areas', icon: '🍽️' },
      { title: 'Events', description: 'Temporary furniture for events', icon: '🎪' },
    ],
    features: [
      { title: 'Customizable', description: 'Tailored to specific needs', icon: '🎨' },
      { title: 'Modular', description: 'Flexible system for various layouts', icon: '🔗' },
      { title: 'Weatherproof', description: 'Durable in all conditions', icon: '🌧️' },
      { title: 'Maintenance Free', description: 'No special care required', icon: '🔧' },
      { title: 'Eco-friendly', description: '100% recycled materials', icon: '♻️' },
      { title: 'Durable', description: '20+ years lifespan', icon: '⏱️' },
    ],
    materialComposition: {
      recycledPlastic: 70,
      recycledRubber: 30,
    },
  },
};

/**
 * Get product detail data by product ID or English name
 */
export function getProductDetailData(idOrName: number | string): ProductDetailData | null {
  if (typeof idOrName === 'number') {
    const product = Object.values(PRODUCT_DETAIL_DATA).find(p => p.id === idOrName);
    return product || null;
  }
  return PRODUCT_DETAIL_DATA[idOrName] || null;
}

/**
 * Get product folder name
 */
export function getProductFolderName(englishName: string): string {
  return PRODUCT_FOLDER_MAP[englishName] || '';
}

