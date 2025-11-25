/**
 * Lightweight loading component for faster perceived performance
 * Minimal rendering to avoid blocking navigation
 */
export default function LightweightLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin" />
        <div className="text-sm text-gray-600">Loading...</div>
      </div>
    </div>
  );
}

