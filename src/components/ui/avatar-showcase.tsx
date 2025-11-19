import React from 'react';
import { EnhancedAvatar } from './enhanced-avatar';

export const AvatarShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Enhanced Avatar Component</h1>
          <p className="text-xl text-gray-300">Interactive, animated, and customizable user avatars</p>
        </div>

        {/* Size variations */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-white mb-8 text-center">Size Variations</h2>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="text-center">
              <EnhancedAvatar size="sm" emoji="🌱" />
              <p className="text-white mt-2 text-sm">Small</p>
            </div>
            <div className="text-center">
              <EnhancedAvatar size="md" emoji="🌿" />
              <p className="text-white mt-2 text-sm">Medium</p>
            </div>
            <div className="text-center">
              <EnhancedAvatar size="lg" emoji="🌳" />
              <p className="text-white mt-2 text-sm">Large</p>
            </div>
            <div className="text-center">
              <EnhancedAvatar size="xl" emoji="🌲" />
              <p className="text-white mt-2 text-sm">Extra Large</p>
            </div>
          </div>
        </div>

        {/* Color variations */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-white mb-8 text-center">Color Themes</h2>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="text-center">
              <EnhancedAvatar glowColor="yellow" emoji="☀️" />
              <p className="text-white mt-2 text-sm">Sunny Yellow</p>
            </div>
            <div className="text-center">
              <EnhancedAvatar glowColor="green" emoji="🌍" />
              <p className="text-white mt-2 text-sm">Eco Green</p>
            </div>
            <div className="text-center">
              <EnhancedAvatar glowColor="blue" emoji="💧" />
              <p className="text-white mt-2 text-sm">Ocean Blue</p>
            </div>
            <div className="text-center">
              <EnhancedAvatar glowColor="purple" emoji="🔮" />
              <p className="text-white mt-2 text-sm">Mystic Purple</p>
            </div>
            <div className="text-center">
              <EnhancedAvatar glowColor="red" emoji="🔥" />
              <p className="text-white mt-2 text-sm">Fire Red</p>
            </div>
          </div>
        </div>

        {/* Interactive examples */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-white mb-8 text-center">Interactive Examples</h2>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="text-center">
              <EnhancedAvatar 
                emoji="👩‍🌾" 
                onClick={() => alert('Farmer clicked!')}
                glowColor="green"
              />
              <p className="text-white mt-2 text-sm">Clickable Farmer</p>
            </div>
            <div className="text-center">
              <EnhancedAvatar 
                emoji="♻️" 
                showCrown={false}
                onClick={() => alert('Recycler clicked!')}
                glowColor="blue"
              />
              <p className="text-white mt-2 text-sm">No Crown</p>
            </div>
            <div className="text-center">
              <EnhancedAvatar 
                emoji="🌟" 
                size="lg"
                onClick={() => alert('Star clicked!')}
                glowColor="yellow"
              />
              <p className="text-white mt-2 text-sm">Achievement Star</p>
            </div>
          </div>
        </div>

        {/* Original vs Enhanced comparison */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-white mb-8 text-center">Original vs Enhanced</h2>
          <div className="flex items-center justify-center gap-16 flex-wrap">
            <div className="text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-md opacity-50" style={{transform: 'scale(1.004)'}}></div>
                <span className="flex shrink-0 overflow-hidden rounded-full h-14 w-14 sm:h-16 sm:w-16 lg:h-20 lg:w-20 border-2 sm:border-4 border-white/30 relative z-10 shadow-xl">
                  <span className="flex h-full w-full items-center justify-center rounded-full bg-muted text-xl sm:text-2xl lg:text-3xl bg-gradient-to-br from-white/20 to-white/10 text-white backdrop-blur-sm">👩‍🌾</span>
                </span>
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 rounded-full p-1 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-crown h-3 w-3 sm:h-4 sm:w-4">
                    <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"></path>
                    <path d="M5 21h14"></path>
                  </svg>
                </div>
              </div>
              <p className="text-white text-sm">Original</p>
            </div>
            
            <div className="text-center">
              <EnhancedAvatar 
                emoji="👩‍🌾" 
                size="lg"
                glowColor="yellow"
                onClick={() => alert('Enhanced avatar clicked!')}
              />
              <p className="text-white mt-2 text-sm">Enhanced</p>
            </div>
          </div>
          
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Improvements Made:</h3>
            <ul className="text-gray-300 space-y-2 text-sm">
              <li>✨ Added hover animations and scale effects</li>
              <li>🎨 Multiple color themes with gradient variations</li>
              <li>📱 Better responsive design with size options</li>
              <li>♿ Improved accessibility with keyboard navigation</li>
              <li>🔧 Reusable React component with TypeScript</li>
              <li>✨ Added sparkle effects and enhanced glow</li>
              <li>🎯 Click handlers and interactive states</li>
              <li>🌟 Layered glow effects for depth</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarShowcase;