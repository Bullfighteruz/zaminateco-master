import { useState, useCallback, useEffect } from 'react';

// ---------- Types ----------
export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: number;
  likes: number;
  isLiked: boolean;
}

export interface SocialState {
  likes: Record<string, boolean>;
  likeCounts: Record<string, number>;
  comments: Record<string, Comment[]>;
  bookmarks: Record<string, boolean>;
}

const STORAGE_KEY = 'ecohub_social_state';

// ---------- Default seed comments ----------
const seedComments: Record<string, Comment[]> = {
  'community-1': [
    {
      id: 'seed-c1-1',
      author: 'Aziza Karimova',
      avatar: 'AK',
      text: 'This is incredible! Our mahalla needs something like this too 🌱',
      timestamp: Date.now() - 86400000 * 2,
      likes: 12,
      isLiked: false,
    },
    {
      id: 'seed-c1-2',
      author: 'Sardor Yusupov',
      avatar: 'SY',
      text: 'I was part of this cleanup! Best weekend ever 💪♻️',
      timestamp: Date.now() - 86400000,
      likes: 8,
      isLiked: false,
    },
    {
      id: 'seed-c1-3',
      author: 'Nigora Aliyeva',
      avatar: 'NA',
      text: 'The playground looks amazing now. My kids love it!',
      timestamp: Date.now() - 3600000 * 5,
      likes: 5,
      isLiked: false,
    },
  ],
  'community-2': [
    {
      id: 'seed-c2-1',
      author: 'Shakhlo Mirzo',
      avatar: 'SM',
      text: 'Teaching kids early is so important. Great initiative! 📚',
      timestamp: Date.now() - 86400000 * 3,
      likes: 15,
      isLiked: false,
    },
    {
      id: 'seed-c2-2',
      author: 'Dilshod Rakhmatov',
      avatar: 'DR',
      text: 'My daughter came home and taught us about recycling. Thank you Malika teacher! 🙏',
      timestamp: Date.now() - 86400000,
      likes: 22,
      isLiked: false,
    },
  ],
};

// ---------- Helpers ----------
function loadState(): SocialState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SocialState;
      // Merge seed comments for keys that don't exist yet
      const mergedComments = { ...parsed.comments };
      for (const key of Object.keys(seedComments)) {
        if (!mergedComments[key] || mergedComments[key].length === 0) {
          mergedComments[key] = seedComments[key];
        }
      }
      return { ...parsed, comments: mergedComments };
    }
  } catch {
    // ignore
  }
  return {
    likes: {},
    likeCounts: {},
    comments: { ...seedComments },
    bookmarks: {},
  };
}

function saveState(state: SocialState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded — silently fail
  }
}

// ---------- Time-ago formatter ----------
export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
}

// ---------- Hook ----------
export function useEcoSocial() {
  const [state, setState] = useState<SocialState>(loadState);

  // Persist on every change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // ---- Likes ----
  const isLiked = useCallback(
    (storyKey: string) => !!state.likes[storyKey],
    [state.likes]
  );

  const getLikeCount = useCallback(
    (storyKey: string, baseLikes: number) => {
      const extra = state.likeCounts[storyKey] ?? 0;
      return baseLikes + extra;
    },
    [state.likeCounts]
  );

  const toggleLike = useCallback((storyKey: string) => {
    setState((prev) => {
      const wasLiked = !!prev.likes[storyKey];
      const delta = wasLiked ? -1 : 1;
      return {
        ...prev,
        likes: { ...prev.likes, [storyKey]: !wasLiked },
        likeCounts: {
          ...prev.likeCounts,
          [storyKey]: (prev.likeCounts[storyKey] ?? 0) + delta,
        },
      };
    });
  }, []);

  const setLiked = useCallback((storyKey: string) => {
    setState((prev) => {
      if (prev.likes[storyKey]) return prev; // already liked
      return {
        ...prev,
        likes: { ...prev.likes, [storyKey]: true },
        likeCounts: {
          ...prev.likeCounts,
          [storyKey]: (prev.likeCounts[storyKey] ?? 0) + 1,
        },
      };
    });
  }, []);

  // ---- Bookmarks ----
  const isBookmarked = useCallback(
    (storyKey: string) => !!state.bookmarks[storyKey],
    [state.bookmarks]
  );

  const toggleBookmark = useCallback((storyKey: string): boolean => {
    let newVal = false;
    setState((prev) => {
      newVal = !prev.bookmarks[storyKey];
      return {
        ...prev,
        bookmarks: { ...prev.bookmarks, [storyKey]: newVal },
      };
    });
    return newVal;
  }, []);

  // ---- Comments ----
  const getComments = useCallback(
    (storyKey: string): Comment[] => state.comments[storyKey] || [],
    [state.comments]
  );

  const getCommentCount = useCallback(
    (storyKey: string, baseCount: number): number => {
      const stored = state.comments[storyKey];
      if (!stored) return baseCount;
      return stored.length;
    },
    [state.comments]
  );

  const addComment = useCallback((storyKey: string, text: string, author?: string) => {
    const newComment: Comment = {
      id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      author: author || 'You',
      avatar: (author || 'You').slice(0, 2).toUpperCase(),
      text,
      timestamp: Date.now(),
      likes: 0,
      isLiked: false,
    };
    setState((prev) => ({
      ...prev,
      comments: {
        ...prev.comments,
        [storyKey]: [...(prev.comments[storyKey] || []), newComment],
      },
    }));
  }, []);

  const toggleCommentLike = useCallback((storyKey: string, commentId: string) => {
    setState((prev) => {
      const comments = (prev.comments[storyKey] || []).map((c) => {
        if (c.id !== commentId) return c;
        const wasLiked = c.isLiked;
        return {
          ...c,
          isLiked: !wasLiked,
          likes: c.likes + (wasLiked ? -1 : 1),
        };
      });
      return { ...prev, comments: { ...prev.comments, [storyKey]: comments } };
    });
  }, []);

  return {
    // likes
    isLiked,
    getLikeCount,
    toggleLike,
    setLiked,
    // bookmarks
    isBookmarked,
    toggleBookmark,
    // comments
    getComments,
    getCommentCount,
    addComment,
    toggleCommentLike,
  };
}
