// Avatar emoji to image path mapping
export const avatarEmojiToImage: { [key: string]: string } = {
  '👩‍🌾': '/images/Eco Farmer.png',
  '🌱': '/images/Green Sprout.png',
  '🌿': '/images/Leaf Guardian.png',
  '🌳': '/images/Tree Protector.png',
  '♻️': '/images/Recycling Hero.png',
  '🌍': '/images/Earth Guardian.png',
  '💧': '/images/Water Saver.png',
  '☀️': '/images/Solar Champion.png',
  '⚡': '/images/Energy Saver.png',
  '🔥': '/images/Climate Warrior.png',
  '🌟': '/images/Eco Star.png',
  '🔮': '/images/Future Visionary.png',
  '🦋': '/images/Nature Lover.png',
};

export const getAvatarImage = (emoji: string): string | undefined => {
  return avatarEmojiToImage[emoji];
};

