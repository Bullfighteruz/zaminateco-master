import React from 'react';
/**
 * Emoji to Image Path Mapping
 * Maps emojis to their corresponding PNG image files in the public/images folder
 * All paths are relative to the public folder for deployment compatibility
 */

export const emojiToImageMap: Record<string, string> = {
  // Collection Points
  '🗂️': '/images/compost_13285420.webp', // Mixed waste
  '♻️': '/images/Plastic Recycling.webp', // Plastic/Recycling
  '🛞': '/images/Plastic Recycling.webp', // Tires
  
  // Events
  '🎓': '/images/book_649180.webp', // Education
  '🌳': '/images/plant-a-tree_6675353.webp', // Planting
  '🏞️': '/images/forest_10089053.webp', // Cleanup
  '🚶‍♀️': '/images/community_16119903.webp', // Awareness
  '📊': '/images/eco_points_7986841.webp', // Waste audit
  
  // Navigation/Actions
  '📍': '/images/location_5174778.webp', // Map/Collection Points
  '🗳️': '/images/vote_15269306.webp', // Vote
  '📅': '/images/event.webp', // Events/Actions
  '🛒': '/images/eco-bag_10158203.webp', // Shop
  
  // Partners/Team/Contact
  '🤝': '/images/partners_7967044.webp', // Partners
  '👥': '/images/meet-the-team_15916616.webp', // Team
  '📞': '/images/contact-us.webp', // Contact
  
  // Shop Products
  '🏗️': '/images/art-tiles.webp', // Construction
  '🛝': '/images/Eco Bench.webp', // Playground
  '🧱': '/images/EcoBrick.webp', // Bricks
  '🗑️': '/images/Waste Bin.webp', // Waste Bin
  '🪴': '/images/Garden Planter.webp', // Planter
  '🪑': '/images/Eco Bench.webp', // Bench
  '🚲': '/images/ECOBIKE RACK.webp', // Bike Rack
  '🚌': '/images/ECOBUSSTOP.webp', // Bus Stop
  '🎨': '/images/art-tiles.webp', // Art Tiles
  '🏙️': '/images/green-city_5994274.webp', // City
  
  // Stories
  '🎉': '/images/community_16119903.webp', // Celebration
  '🏫': '/images/school.webp', // School
  '🎤': '/images/community_16119903.webp', // Event
  
  // Profile/Avatars (keeping emojis for avatars as they're user-selectable)
  // These will remain as emojis since they're part of the avatar system
  
  // Rewards
  '🎁': "/images/Children's Souvenirs.webp", // Gift
  '🏠': '/images/Home Decor Set.webp', // Home
  '📚': '/images/Eco Education Kit.webp', // Education Kit
};

/**
 * Get image path for an emoji
 * Returns the image path if mapping exists, otherwise returns the emoji
 */
export function getImageForEmoji(emoji: string): string {
  return emojiToImageMap[emoji] || emoji;
}

/**
 * Check if an emoji has an image mapping
 */
export function hasImageMapping(emoji: string): boolean {
  return emoji in emojiToImageMap;
}

/**
 * Image component for emoji replacement
 */
export function EmojiImage({ 
  emoji, 
  alt, 
  className = '',
  size = 24 
}: { 
  emoji: string; 
  alt?: string; 
  className?: string;
  size?: number;
}) {
  const imagePath = getImageForEmoji(emoji);
  const hasMapping = hasImageMapping(emoji);
  
  if (!hasMapping) {
    // Return emoji if no mapping exists (e.g., for avatars)
    return <span className={className} aria-label={alt}>{emoji}</span>;
  }
  
  return (
    <img 
      src={imagePath} 
      alt={alt || emoji} 
      className={className}
      style={{ width: size, height: size, objectFit: 'contain' }}
      loading="lazy"
    />
  );
}
