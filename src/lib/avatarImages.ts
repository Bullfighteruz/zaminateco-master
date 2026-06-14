// Avatar emoji to image path mapping
export const avatarEmojiToImage: { [key: string]: string } = {
  '👩‍🌾': '/images/Eco Farmer.webp',
  '🌱': '/images/Green Sprout.webp',
  '🌿': '/images/Leaf Guardian.webp',
  '🌳': '/images/Tree Protector.webp',
  '♻️': '/images/Recycling Hero.webp',
  '🌍': '/images/Earth Guardian.webp',
  '💧': '/images/Water Saver.webp',
  '☀️': '/images/Solar Champion.webp',
  '⚡': '/images/Energy Saver.webp',
  '🔥': '/images/Climate Warrior.webp',
  '🌟': '/images/Eco Star.webp',
  '🔮': '/images/Future Visionary.webp',
  '🦋': '/images/Nature Lover.webp',
};

export const getAvatarImage = (emoji: string): string | undefined => {
  return avatarEmojiToImage[emoji];
};

