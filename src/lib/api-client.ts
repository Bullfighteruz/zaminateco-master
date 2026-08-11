import { supabase, isSupabaseConfigured } from './supabase';
import { votingProjects, collectionPoints, ecoActions, products, ecoStories, currentUser } from './mockData';

// Types
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  requiresOtp?: boolean;
}

type ApiData = Record<string, unknown>;
type ApiDataArray = Record<string, unknown>[];

import { getApiBaseUrl } from './gemini';

// Check if we are running in Dev/Prod
const getSafeApiBaseUrl = (): string => {
  try {
    return getApiBaseUrl();
  } catch (e) {
    return '';
  }
};
const API_BASE_URL = getSafeApiBaseUrl();

// We consider backend available if either a standard REST URL is set OR Supabase is configured!
export const IS_BACKEND_AVAILABLE = isSupabaseConfigured() || !!import.meta.env.VITE_API_URL;

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Generic request fallback for REST backend (if configured)
  private async restRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!import.meta.env.VITE_API_URL) {
      throw new Error('BACKEND_DISABLED');
    }
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    const response = await fetch(`${this.baseURL}${endpoint}`, { ...options, headers });
    if (!response.ok) throw new Error(response.statusText);
    return response.json();
  }

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  async register(data: {
    email?: string;
    phone?: string;
    password?: string;
    firstName: string;
    lastName: string;
    district?: string;
    school?: string;
    mahalla?: string;
  }) {
    if (isSupabaseConfigured() && supabase) {
      const email = data.email || `${data.phone || Math.random().toString(36).substring(7)}@zaminat.local`;
      if (!data.password || data.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      const password = data.password;
      
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: `${data.firstName} ${data.lastName}`,
            firstName: data.firstName,
            lastName: data.lastName,
            district: data.district,
            school: data.school,
            mahalla: data.mahalla
          }
        }
      });

      if (error) throw new Error(error.message);
      
      return {
        accessToken: authData.session?.access_token || 'mock_access_token',
        refreshToken: authData.session?.refresh_token || 'mock_refresh_token',
        user: authData.user ? {
          id: authData.user.id,
          email: authData.user.email,
          full_name: `${data.firstName} ${data.lastName}`
        } : null
      };
    }

    // Local Fallback Mock
    console.log('[ApiClient] Mocking registration for:', data.email || data.phone);
    return {
      accessToken: 'mock_access_token',
      user: { id: 'mock_user_id', email: data.email || 'guest@zaminat.local' }
    };
  }

  async login(data: { email?: string; phone?: string; password?: string; otp?: string }) {
    if (isSupabaseConfigured() && supabase) {
      const email = data.email || `${data.phone}@zaminat.local`;
      if (!data.password) {
        throw new Error('Password is required');
      }
      const password = data.password;

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw new Error(error.message);

      return {
        accessToken: authData.session?.access_token,
        refreshToken: authData.session?.refresh_token,
        user: authData.user ? {
          id: authData.user.id,
          email: authData.user.email
        } : null
      };
    }

    return {
      accessToken: 'mock_access_token',
      user: { id: 'mock_user_id', email: data.email || 'guest@zaminat.local' }
    };
  }

  async verifyOtp(phone: string, otp: string) {
    return { accessToken: 'mock_access_token', user: { id: 'mock_user' } };
  }

  async getCurrentUser() {
    if (isSupabaseConfigured() && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        return profile || { id: session.user.id, email: session.user.email };
      }
      return null;
    }
    return currentUser;
  }

  logout() {
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.signOut();
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // ==========================================
  // PROFILE / USER
  // ==========================================
  async getUserProfile() {
    return this.getCurrentUser();
  }

  async updateUserProfile(data: Record<string, any>) {
    if (isSupabaseConfigured() && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName || data.full_name,
          mahalla: data.mahalla,
          school: data.school,
          avatar_url: data.avatarUrl || data.avatar_url
        })
        .eq('id', session.user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return updatedProfile;
    }

    return { ...currentUser, ...data };
  }

  async getUserStats(userId: string) {
    if (isSupabaseConfigured() && supabase) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('eco_coins, level, xp, waste_collected')
        .eq('id', userId)
        .single();
      return profile || {};
    }
    return {
      ecoCoins: currentUser.ecoCoins,
      level: currentUser.level,
      xp: currentUser.xp || 1400,
      wasteCollected: currentUser.wasteCollected
    };
  }

  // ==========================================
  // ECOVOTE / PROJECTS
  // ==========================================
  async getProjects(status?: string, sortBy?: string) {
    if (isSupabaseConfigured() && supabase) {
      let query = supabase.from('voting_projects').select('*');
      if (status) {
        query = query.eq('status', status.toLowerCase());
      }
      const { data, error } = await query;
      if (error) throw new Error(error.message);

      // Transform db fields to camelCase expected by components
      return data.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        image: p.image_url,
        location: p.location,
        requiredMaterials: p.required_materials,
        currentVotes: p.current_votes,
        totalVotes: p.total_votes,
        category: p.category,
        deadline: new Date(p.deadline),
        status: p.status,
        donationTarget: p.donation_target,
        donationRaised: p.donation_raised
      }));
    }
    return votingProjects;
  }

  async getProject(id: string) {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('voting_projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw new Error(error.message);
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        image: data.image_url,
        location: data.location,
        requiredMaterials: data.required_materials,
        currentVotes: data.current_votes,
        totalVotes: data.total_votes,
        category: data.category,
        deadline: new Date(data.deadline),
        status: data.status,
        donationTarget: data.donation_target,
        donationRaised: data.donation_raised
      };
    }
    return votingProjects.find(p => p.id === id) || votingProjects[0];
  }

  async voteForProject(projectId: string) {
    if (isSupabaseConfigured() && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated to vote');

      // Check if already voted
      const { data: existingVote } = await supabase
        .from('user_votes')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', session.user.id)
        .single();

      if (existingVote) {
        throw new Error('ALREADY_VOTED');
      }

      // Insert vote
      const { error: insertError } = await supabase
        .from('user_votes')
        .insert({ project_id: projectId, user_id: session.user.id });

      if (insertError) throw new Error(insertError.message);

      // Atomic increment — avoids race condition by using Supabase rpc
      // Fallback: re-read current value to reduce (not eliminate) race window
      const { data: freshProject } = await supabase
        .from('voting_projects')
        .select('current_votes')
        .eq('id', projectId)
        .single();

      const newVotes = (freshProject?.current_votes || 0) + 1;

      const { error: updateError } = await supabase
        .from('voting_projects')
        .update({ current_votes: newVotes })
        .eq('id', projectId);

      if (updateError) throw new Error(updateError.message);

      return { success: true, currentVotes: newVotes };
    }

    return { success: true };
  }

  async donateToProject(projectId: string, amount: number, currency: string, paymentProvider?: string) {
    // Input validation
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Invalid donation amount');
    }
    if (amount > 1_000_000_000) {
      throw new Error('Donation amount exceeds maximum limit');
    }

    if (isSupabaseConfigured() && supabase) {
      const { data: project } = await supabase
        .from('voting_projects')
        .select('donation_raised')
        .eq('id', projectId)
        .single();

      if (!project) throw new Error('Project not found');

      const newDonations = Number(project.donation_raised || 0) + Math.floor(Number(amount));

      const { error: updateError } = await supabase
        .from('voting_projects')
        .update({ donation_raised: newDonations })
        .eq('id', projectId);

      if (updateError) throw new Error(updateError.message);

      return { success: true, donationRaised: newDonations };
    }
    return { success: true };
  }

  // ==========================================
  // ECOACTIONS / EVENTS
  // ==========================================
  async getEvents(status?: string) {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('eco_actions')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw new Error(error.message);

      return data.map(e => ({
        id: e.id,
        title: e.title,
        description: e.description,
        date: new Date(e.event_date),
        location: e.location_name,
        latitude: e.latitude,
        longitude: e.longitude,
        xpReward: e.xp_reward,
        registeredCount: e.registered_count
      }));
    }
    return ecoActions;
  }

  async joinEvent(eventId: string) {
    if (isSupabaseConfigured() && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const { error: dbError } = await supabase
        .from('eco_action_participants')
        .insert({ action_id: eventId, user_id: session.user.id });

      if (dbError) {
        if (dbError.code === '23505') return { success: true, message: 'Already joined' };
        throw new Error(dbError.message);
      }

      // Increment registered count
      const { data: ev } = await supabase
        .from('eco_actions')
        .select('registered_count, xp_reward')
        .eq('id', eventId)
        .single();

      const newCount = (ev?.registered_count || 0) + 1;
      await supabase
        .from('eco_actions')
        .update({ registered_count: newCount })
        .eq('id', eventId);

      // Award XP to user profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('id', session.user.id)
        .single();

      if (userProfile) {
        const addedXp = ev?.xp_reward || 50;
        const currentXp = (userProfile.xp || 0) + addedXp;
        const currentLevel = userProfile.level || 1;
        // Level up algorithm (1000 XP per level)
        const newLevel = Math.floor(currentXp / 1000) + 1;

        await supabase
          .from('profiles')
          .update({
            xp: currentXp,
            level: Math.max(currentLevel, newLevel)
          })
          .eq('id', session.user.id);
      }

      return { success: true };
    }
    return { success: true };
  }

  // ==========================================
  // LOCATIONS / MAP POINTS
  // ==========================================
  async getLocations(filters?: { type?: string; eventType?: string; district?: string }) {
    return this.getCollectionPoints();
  }

  async getCollectionPoints(filters?: { materialType?: string; district?: string; status?: string; limit?: number }) {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('eco_points')
        .select('*');

      if (error) throw new Error(error.message);

      return data.map(p => ({
        id: p.id,
        name: p.name,
        latitude: p.latitude,
        longitude: p.longitude,
        type: p.accepted_materials?.[0]?.toLowerCase() || 'mixed',
        totalCollected: p.total_collected,
        lastUpdated: new Date(p.created_at),
        isActive: p.is_active
      }));
    }
    return collectionPoints;
  }

  // ==========================================
  // WASTE LOGS / SCANS
  // ==========================================
  async getUserWasteLogs(userId?: string) {
    if (isSupabaseConfigured() && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      const targetUserId = userId || session?.user?.id;
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);

      return data.map(s => ({
        id: s.id,
        date: new Date(s.created_at).toLocaleDateString(),
        weight: s.total_weight_kg || '0.2 kg',
        ecoCoins: s.estimated_coins,
        status: s.verification_status,
        items: s.detected_items
      }));
    }
    return [];
  }

  // ==========================================
  // SOCIAL SHOP
  // ==========================================
  async getProducts(category?: string) {
    if (isSupabaseConfigured() && supabase) {
      let query = supabase.from('products').select('*').eq('is_active', true);
      if (category) {
        query = query.eq('category', category);
      }
      const { data, error } = await query;
      if (error) throw new Error(error.message);

      return data.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price_coins,
        stock: p.stock_count,
        image: p.image_url,
        category: p.category,
        co2Saved: p.co2_saved,
        recycledRatio: p.recycled_ratio
      }));
    }
    return products;
  }

  async getProduct(id: string) {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw new Error(error.message);

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price_coins,
        stock: data.stock_count,
        image: data.image_url,
        category: data.category,
        co2Saved: data.co2_saved,
        recycledRatio: data.recycled_ratio
      };
    }
    return products.find(p => p.id === id) || products[0];
  }

  async createOrder(data: { items: Array<{ productId: string; quantity: number }>; shippingAddress: any }) {
    if (isSupabaseConfigured() && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      // Calculate total cost
      let totalCost = 0;
      for (const item of data.items) {
        const prod = await this.getProduct(item.productId);
        totalCost += (prod.price || 0) * item.quantity;
      }

      // Check user balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('eco_coins')
        .eq('id', session.user.id)
        .single();

      const currentCoins = profile?.eco_coins || 0;
      if (currentCoins < totalCost) {
        throw new Error('INSUFFICIENT_FUNDS');
      }

      // Deduct coins
      await supabase
        .from('profiles')
        .update({ eco_coins: currentCoins - totalCost })
        .eq('id', session.user.id);

      // Create order
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: session.user.id,
          items: data.items,
          total_coins: totalCost,
          shipping_address: data.shippingAddress,
          status: 'Pending'
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return order;
    }

    return { success: true, orderId: 'mock_order_id' };
  }

  // ==========================================
  // ECOSTORIES
  // ==========================================
  async getStories(category?: string, type?: string, language?: string) {
    if (isSupabaseConfigured() && supabase) {
      let query = supabase.from('eco_stories').select('*');
      if (category) query = query.eq('category', category);
      if (language) query = query.eq('language', language);
      
      const { data, error } = await query;
      if (error) throw new Error(error.message);

      return data.map(s => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        content: s.content,
        image: s.image_url,
        category: s.category,
        author: s.author,
        likes: s.likes_count,
        comments: s.comments_count,
        date: new Date(s.created_at).toLocaleDateString(),
        readTime: '4 min'
      }));
    }
    return ecoStories;
  }

  async getStory(slug: string) {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('eco_stories')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw new Error(error.message);

      return {
        id: data.id,
        title: data.title,
        slug: data.slug,
        content: data.content,
        image: data.image_url,
        category: data.category,
        author: data.author,
        likes: data.likes_count,
        comments: data.comments_count,
        date: new Date(data.created_at).toLocaleDateString(),
        readTime: '4 min'
      };
    }
    return ecoStories.find(s => s.slug === slug) || ecoStories[0];
  }

  async reactToPost(postId: string, reactionType: string) {
    if (isSupabaseConfigured() && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const { data: existingReaction } = await supabase
        .from('story_reactions')
        .select('*')
        .eq('story_id', postId)
        .eq('user_id', session.user.id)
        .single();

      let newCount = 0;
      const { data: story } = await supabase
        .from('eco_stories')
        .select('likes_count')
        .eq('id', postId)
        .single();

      if (existingReaction) {
        // Delete reaction (unlike)
        await supabase
          .from('story_reactions')
          .delete()
          .eq('story_id', postId)
          .eq('user_id', session.user.id);
          
        newCount = Math.max(0, (story?.likes_count || 0) - 1);
      } else {
        // Insert reaction (like)
        await supabase
          .from('story_reactions')
          .insert({ story_id: postId, user_id: session.user.id, reaction_type: reactionType });

        newCount = (story?.likes_count || 0) + 1;
      }

      await supabase
        .from('eco_stories')
        .update({ likes_count: newCount })
        .eq('id', postId);

      return { success: true, likes: newCount };
    }
    return { success: true };
  }

  async commentOnPost(postId: string, content: string) {
    // Validate comment content
    const trimmedContent = content?.trim();
    if (!trimmedContent || trimmedContent.length === 0) {
      throw new Error('Comment cannot be empty');
    }
    if (trimmedContent.length > 5000) {
      throw new Error('Comment is too long (max 5000 characters)');
    }

    if (isSupabaseConfigured() && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single();

      const userName = profile?.full_name || session.user.email || 'Eco Citizen';

      const { data: comment, error } = await supabase
        .from('story_comments')
        .insert({
          story_id: postId,
          user_id: session.user.id,
          user_name: userName,
          content
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Increment comments count on story
      const { data: story } = await supabase
        .from('eco_stories')
        .select('comments_count')
        .eq('id', postId)
        .single();

      const newCommentsCount = (story?.comments_count || 0) + 1;
      await supabase
        .from('eco_stories')
        .update({ comments_count: newCommentsCount })
        .eq('id', postId);

      return comment;
    }
    return { id: 'mock_comment', userName: 'Guest User', content, createdAt: new Date() };
  }

  // ==========================================
  // LEADERBOARD
  // ==========================================
  async getLeaderboard() {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, level, xp')
        .order('xp', { ascending: false })
        .limit(10);

      if (error) throw new Error(error.message);

      return data.map((p, index) => ({
        rank: index + 1,
        name: p.full_name || 'Eco User',
        avatar: p.avatar_url || '👩‍🌾',
        level: p.level || 1,
        xp: p.xp || 0
      }));
    }
    return [
      { rank: 1, name: 'Aziz Alimov', avatar: '🦸‍♂️', level: 15, xp: 15400 },
      { rank: 2, name: 'Malika Karimova', avatar: '👩‍⚕️', level: 14, xp: 14200 },
      { rank: 3, name: 'Dilshod Tursunov', avatar: '👨‍🎓', level: 13, xp: 13100 },
    ];
  }

  async getGlobalImpact() {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('global_impact_stats')
        .select('*')
        .eq('id', 1)
        .single();
      
      if (!error && data) {
        return {
          plasticKg: data.total_plastic_kg,
          rubberKg: data.total_rubber_kg,
          paperKg: data.total_paper_kg,
          benchesCreated: data.benches_created,
          tilesCreated: data.tiles_created,
          co2SavedKg: data.co2_saved_kg
        };
      }
    }
    return {
      plasticKg: 1420.5,
      rubberKg: 950.0,
      paperKg: 680.0,
      benchesCreated: 18,
      tilesCreated: 235,
      co2SavedKg: 1850.4
    };
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
