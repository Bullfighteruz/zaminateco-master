import React from 'react';
/**
 * Emoji to Image Path Mapping
 * Maps emojis to their corresponding PNG image files in the public/images folder
 * All paths are relative to the public folder for deployment compatibility
 */

export const emojiToImageMap: Record<string, string> = {
  // Collection Points
  '🗂️': '/images/compost_13285420.png', // Mixed waste
  '♻️': '/images/Plastic Recycling.png', // Plastic/Recycling
  '🛞': '/images/Plastic Recycling.png', // Tires
  
  // Events
  '🎓': '/images/book_649180.png', // Education
  '🌳': '/images/plant-a-tree_6675353.png', // Planting
  '🏞️': '/images/forest_10089053.png', // Cleanup
  '🚶‍♀️': '/images/community_16119903.png', // Awareness
  '📊': '/images/eco_points_7986841.png', // Waste audit
  
  // Navigation/Actions
  '📍': '/images/location_5174778.png', // Map/Collection Points
  '🗳️': '/images/vote_15269306.png', // Vote
  '📅': '/images/event.png', // Events/Actions
  '🛒': '/images/eco-bag_10158203.png', // Shop
  
  // Partners/Team/Contact
  '🤝': '/images/partners_7967044.png', // Partners
  '👥': '/images/meet-the-team_15916616.png', // Team
  '📞': '/images/contact-us.png', // Contact
  
  // Shop Products
  '🏗️': '/images/art-tiles.png', // Construction
  '🛝': '/images/Eco Bench.png', // Playground
  '🧱': '/images/EcoBrick.png', // Bricks
  '🗑️': '/images/Waste Bin.png', // Waste Bin
  '🪴': '/images/Garden Planter.png', // Planter
  '🪑': '/images/Eco Bench.png', // Bench
  '🚲': '/images/ECOBIKE RACK.png', // Bike Rack
  '🚌': '/images/ECOBUSSTOP.png', // Bus Stop
  '🎨': '/images/art-tiles.png', // Art Tiles
  '🏙️': '/images/green-city_5994274.png', // City
  
  // Stories
  '🎉': '/images/community_16119903.png', // Celebration
  '🏫': '/images/school.png', // School
  '🎤': '/images/community_16119903.png', // Event
  
  // Profile/Avatars (keeping emojis for avatars as they're user-selectable)
  // These will remain as emojis since they're part of the avatar system
  
  // Rewards
  '🎁': "/images/Children's Souvenirs.png", // Gift
  '🏠': '/images/Home Decor Set.png', // Home
  '📚': '/images/Eco Education Kit.png', // Education Kit
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
