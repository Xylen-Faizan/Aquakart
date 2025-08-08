import { supabase } from '@/lib/supabase';

export interface EcoAction {
  id: string;
  title: string;
  description: string;
  points: number;
  cooldown?: number; // hours until can be done again
  category: 'daily' | 'one-time' | 'referral' | 'purchase';
}

export interface EcoReward {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  discount: string;
  available: boolean;
  category: 'discount' | 'free-delivery' | 'upgrade' | 'environmental';
}

export interface EcoStats {
  totalPoints: number;
  level: number;
  pointsToNextLevel: number;
  totalCO2Saved: number; // in kg
  totalWaterSaved: number; // in liters
  totalPlasticSaved: number; // in kg
  streakDays: number;
  actionsCompleted: number;
  lastActionDate?: Date;
}

export interface UserEcoAction {
  id: string;
  userId: string;
  actionId: string;
  completedAt: Date;
  pointsEarned: number;
}

export interface UserEcoReward {
  id: string;
  userId: string;
  rewardId: string;
  claimedAt: Date;
  pointsSpent: number;
  isActive: boolean;
  expiresAt?: Date;
}

class EcoPointsService {
  private static instance: EcoPointsService;

  public static getInstance(): EcoPointsService {
    if (!EcoPointsService.instance) {
      EcoPointsService.instance = new EcoPointsService();
    }
    return EcoPointsService.instance;
  }

  // Get user's eco points and stats
  async getUserEcoStats(userId: string): Promise<EcoStats> {
    try {
      const { data, error } = await supabase
        .from('user_eco_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching eco stats:', error);
        // Check if it's a table not found error
        if (error.code === '42P01') {
          console.log('Eco stats table not found, using default stats');
          return this.getDefaultStats();
        }
        // Return default stats if user doesn't have any
        return this.getDefaultStats();
      }

      return {
        totalPoints: data.total_points || 0,
        level: data.level || 1,
        pointsToNextLevel: data.points_to_next_level || 500,
        totalCO2Saved: data.total_co2_saved || 0,
        totalWaterSaved: data.total_water_saved || 0,
        totalPlasticSaved: data.total_plastic_saved || 0,
        streakDays: data.streak_days || 0,
        actionsCompleted: data.actions_completed || 0,
        lastActionDate: data.last_action_date ? new Date(data.last_action_date) : undefined,
      };
    } catch (error) {
      console.error('Error in getUserEcoStats:', error);
      return this.getDefaultStats();
    }
  }

  // Complete an eco action and earn points
  async completeEcoAction(userId: string, actionId: string): Promise<{ success: boolean; pointsEarned: number; message: string }> {
    try {
      // Check if tables exist first
      try {
        await supabase.from('user_eco_stats').select('count').limit(1);
      } catch (error: any) {
        if (error.code === '42P01') {
          return {
            success: false,
            pointsEarned: 0,
            message: 'Eco Points feature is not yet configured. Please contact support.',
          };
        }
      }

      // Check if action can be completed (cooldown, etc.)
      const canComplete = await this.canCompleteAction(userId, actionId);
      if (!canComplete.allowed) {
        return {
          success: false,
          pointsEarned: 0,
          message: canComplete.reason || 'Action cannot be completed',
        };
      }

      // Get action details
      const action = await this.getEcoAction(actionId);
      if (!action) {
        return {
          success: false,
          pointsEarned: 0,
          message: 'Action not found',
        };
      }

      // Record the action completion
      const { error: actionError } = await supabase
        .from('user_eco_actions')
        .insert({
          user_id: userId,
          action_id: actionId,
          completed_at: new Date().toISOString(),
          points_earned: action.points,
        });

      if (actionError) {
        console.error('Error recording action:', actionError);
        return {
          success: false,
          pointsEarned: 0,
          message: 'Failed to record action',
        };
      }

      // Update user stats
      const stats = await this.getUserEcoStats(userId);
      const newStats = this.calculateNewStats(stats, action);
      
      const { error: statsError } = await supabase
        .from('user_eco_stats')
        .upsert({
          user_id: userId,
          total_points: newStats.totalPoints,
          level: newStats.level,
          points_to_next_level: newStats.pointsToNextLevel,
          total_co2_saved: newStats.totalCO2Saved,
          total_water_saved: newStats.totalWaterSaved,
          total_plastic_saved: newStats.totalPlasticSaved,
          streak_days: newStats.streakDays,
          actions_completed: newStats.actionsCompleted,
          last_action_date: new Date().toISOString(),
        });

      if (statsError) {
        console.error('Error updating stats:', statsError);
        return {
          success: false,
          pointsEarned: 0,
          message: 'Failed to update stats',
        };
      }

      return {
        success: true,
        pointsEarned: action.points,
        message: `Successfully earned ${action.points} eco points!`,
      };
    } catch (error) {
      console.error('Error in completeEcoAction:', error);
      return {
        success: false,
        pointsEarned: 0,
        message: 'An error occurred while completing the action',
      };
    }
  }

  // Claim an eco reward
  async claimEcoReward(userId: string, rewardId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if tables exist first
      try {
        await supabase.from('user_eco_stats').select('count').limit(1);
      } catch (error: any) {
        if (error.code === '42P01') {
          return {
            success: false,
            message: 'Eco Points feature is not yet configured. Please contact support.',
          };
        }
      }

      // Check if user has enough points
      const stats = await this.getUserEcoStats(userId);
      const reward = await this.getEcoReward(rewardId);
      
      if (!reward) {
        return {
          success: false,
          message: 'Reward not found',
        };
      }

      if (!reward.available) {
        return {
          success: false,
          message: 'Reward is not available',
        };
      }

      if (stats.totalPoints < reward.pointsRequired) {
        return {
          success: false,
          message: `You need ${reward.pointsRequired - stats.totalPoints} more points to claim this reward`,
        };
      }

      // Record the reward claim
      const { error: rewardError } = await supabase
        .from('user_eco_rewards')
        .insert({
          user_id: userId,
          reward_id: rewardId,
          claimed_at: new Date().toISOString(),
          points_spent: reward.pointsRequired,
          is_active: true,
          expires_at: this.calculateRewardExpiry(reward),
        });

      if (rewardError) {
        console.error('Error recording reward:', rewardError);
        return {
          success: false,
          message: 'Failed to claim reward',
        };
      }

      // Update user stats (deduct points)
      const newStats = {
        ...stats,
        totalPoints: stats.totalPoints - reward.pointsRequired,
      };

      const { error: statsError } = await supabase
        .from('user_eco_stats')
        .upsert({
          user_id: userId,
          total_points: newStats.totalPoints,
          level: newStats.level,
          points_to_next_level: newStats.pointsToNextLevel,
          total_co2_saved: newStats.totalCO2Saved,
          total_water_saved: newStats.totalWaterSaved,
          total_plastic_saved: newStats.totalPlasticSaved,
          streak_days: newStats.streakDays,
          actions_completed: newStats.actionsCompleted,
        });

      if (statsError) {
        console.error('Error updating stats:', statsError);
        return {
          success: false,
          message: 'Failed to update stats',
        };
      }

      return {
        success: true,
        message: `Successfully claimed "${reward.title}"!`,
      };
    } catch (error) {
      console.error('Error in claimEcoReward:', error);
      return {
        success: false,
        message: 'An error occurred while claiming the reward',
      };
    }
  }

  // Get available eco actions
  async getAvailableEcoActions(): Promise<EcoAction[]> {
    // In a real app, this would fetch from database
    // For now, return static data
    return [
      {
        id: '1',
        title: 'Use Reusable Bottle',
        description: 'Bring your own water bottle instead of buying plastic bottles',
        points: 50,
        cooldown: 24,
        category: 'daily',
      },
      {
        id: '2',
        title: 'Choose Subscription',
        description: 'Opt for water subscription to reduce single-use packaging',
        points: 100,
        category: 'one-time',
      },
      {
        id: '3',
        title: 'Eco-friendly Delivery',
        description: 'Select paper packaging over plastic when available',
        points: 25,
        category: 'purchase',
      },
      {
        id: '4',
        title: 'Refer Friends',
        description: 'Invite friends to join AquaKart and earn bonus points',
        points: 200,
        category: 'referral',
      },
      {
        id: '5',
        title: 'Complete Order',
        description: 'Successfully complete a water delivery order',
        points: 30,
        cooldown: 12,
        category: 'purchase',
      },
      {
        id: '6',
        title: 'Rate Service',
        description: 'Rate your delivery experience and provide feedback',
        points: 20,
        cooldown: 48,
        category: 'daily',
      },
    ];
  }

  // Get available eco rewards
  async getAvailableEcoRewards(): Promise<EcoReward[]> {
    // In a real app, this would fetch from database
    // For now, return static data
    return [
      {
        id: '1',
        title: '10% Off Next Order',
        description: 'Get 10% discount on your next water delivery',
        pointsRequired: 500,
        discount: '10% OFF',
        available: true,
        category: 'discount',
      },
      {
        id: '2',
        title: 'Free Delivery',
        description: 'Free delivery on orders above ₹200',
        pointsRequired: 1000,
        discount: 'FREE DELIVERY',
        available: true,
        category: 'free-delivery',
      },
      {
        id: '3',
        title: 'Premium Water Upgrade',
        description: 'Upgrade to premium mineral water for free',
        pointsRequired: 1500,
        discount: 'PREMIUM UPGRADE',
        available: false,
        category: 'upgrade',
      },
      {
        id: '4',
        title: 'Tree Planting Certificate',
        description: 'We\'ll plant a tree in your name for environmental impact',
        pointsRequired: 2000,
        discount: 'PLANT A TREE',
        available: true,
        category: 'environmental',
      },
    ];
  }

  // Get user's completed actions
  async getUserCompletedActions(userId: string): Promise<UserEcoAction[]> {
    try {
      const { data, error } = await supabase
        .from('user_eco_actions')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching completed actions:', error);
        // Check if it's a table not found error
        if (error.code === '42P01') {
          console.log('Eco actions table not found, returning empty array');
          return [];
        }
        return [];
      }

      return data.map(action => ({
        id: action.id,
        userId: action.user_id,
        actionId: action.action_id,
        completedAt: new Date(action.completed_at),
        pointsEarned: action.points_earned,
      }));
    } catch (error) {
      console.error('Error in getUserCompletedActions:', error);
      return [];
    }
  }

  // Get user's claimed rewards
  async getUserClaimedRewards(userId: string): Promise<UserEcoReward[]> {
    try {
      const { data, error } = await supabase
        .from('user_eco_rewards')
        .select('*')
        .eq('user_id', userId)
        .order('claimed_at', { ascending: false });

      if (error) {
        console.error('Error fetching claimed rewards:', error);
        // Check if it's a table not found error
        if (error.code === '42P01') {
          console.log('Eco rewards table not found, returning empty array');
          return [];
        }
        return [];
      }

      return data.map(reward => ({
        id: reward.id,
        userId: reward.user_id,
        rewardId: reward.reward_id,
        claimedAt: new Date(reward.claimed_at),
        pointsSpent: reward.points_spent,
        isActive: reward.is_active,
        expiresAt: reward.expires_at ? new Date(reward.expires_at) : undefined,
      }));
    } catch (error) {
      console.error('Error in getUserClaimedRewards:', error);
      return [];
    }
  }

  // Check if user can complete an action (cooldown, etc.)
  private async canCompleteAction(userId: string, actionId: string): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const action = await this.getEcoAction(actionId);
      if (!action) {
        return { allowed: false, reason: 'Action not found' };
      }

      // For one-time actions, check if already completed
      if (action.category === 'one-time') {
        try {
          const { data, error } = await supabase
            .from('user_eco_actions')
            .select('id')
            .eq('user_id', userId)
            .eq('action_id', actionId)
            .single();

          if (error && error.code === '42P01') {
            // Table doesn't exist, allow the action
            return { allowed: true };
          }

          if (data) {
            return { allowed: false, reason: 'This action has already been completed' };
          }
        } catch (error: any) {
          if (error.code === '42P01') {
            // Table doesn't exist, allow the action
            return { allowed: true };
          }
        }
      }

      // For actions with cooldown, check last completion time
      if (action.cooldown) {
        try {
          const { data, error } = await supabase
            .from('user_eco_actions')
            .select('completed_at')
            .eq('user_id', userId)
            .eq('action_id', actionId)
            .order('completed_at', { ascending: false })
            .limit(1)
            .single();

          if (error && error.code === '42P01') {
            // Table doesn't exist, allow the action
            return { allowed: true };
          }

        if (data) {
          const lastCompletion = new Date(data.completed_at);
          const hoursSinceLastCompletion = (Date.now() - lastCompletion.getTime()) / (1000 * 60 * 60);
          
          if (hoursSinceLastCompletion < action.cooldown) {
            const remainingHours = Math.ceil(action.cooldown - hoursSinceLastCompletion);
            return { 
              allowed: false, 
              reason: `You can complete this action again in ${remainingHours} hours` 
            };
          }
        }
        } catch (error: any) {
          if (error.code === '42P01') {
            // Table doesn't exist, allow the action
            return { allowed: true };
          }
        }
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error in canCompleteAction:', error);
      return { allowed: false, reason: 'Error checking action availability' };
    }
  }

  // Get eco action by ID
  private async getEcoAction(actionId: string): Promise<EcoAction | null> {
    const actions = await this.getAvailableEcoActions();
    return actions.find(action => action.id === actionId) || null;
  }

  // Get eco reward by ID
  private async getEcoReward(rewardId: string): Promise<EcoReward | null> {
    const rewards = await this.getAvailableEcoRewards();
    return rewards.find(reward => reward.id === rewardId) || null;
  }

  // Calculate new stats after completing an action
  private calculateNewStats(currentStats: EcoStats, action: EcoAction): EcoStats {
    const newTotalPoints = currentStats.totalPoints + action.points;
    const newLevel = Math.floor(newTotalPoints / 500) + 1;
    const newPointsToNextLevel = 500 - (newTotalPoints % 500);
    
    // Calculate environmental impact based on action
    let co2Saved = currentStats.totalCO2Saved;
    let waterSaved = currentStats.totalWaterSaved;
    let plasticSaved = currentStats.totalPlasticSaved;

    switch (action.id) {
      case '1': // Use Reusable Bottle
        plasticSaved += 0.1; // 100g of plastic saved
        co2Saved += 0.2; // 200g CO2 saved
        break;
      case '2': // Choose Subscription
        plasticSaved += 2.0; // 2kg of plastic saved
        co2Saved += 5.0; // 5kg CO2 saved
        break;
      case '3': // Eco-friendly Delivery
        plasticSaved += 0.5; // 500g of plastic saved
        break;
      case '5': // Complete Order
        waterSaved += 20; // 20L water delivered
        break;
    }

    // Calculate streak
    const today = new Date();
    const lastActionDate = currentStats.lastActionDate;
    let newStreakDays = currentStats.streakDays;

    if (lastActionDate) {
      const daysDiff = Math.floor((today.getTime() - lastActionDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        newStreakDays += 1;
      } else if (daysDiff > 1) {
        newStreakDays = 1;
      }
    } else {
      newStreakDays = 1;
    }

    return {
      ...currentStats,
      totalPoints: newTotalPoints,
      level: newLevel,
      pointsToNextLevel: newPointsToNextLevel,
      totalCO2Saved: co2Saved,
      totalWaterSaved: waterSaved,
      totalPlasticSaved: plasticSaved,
      streakDays: newStreakDays,
      actionsCompleted: currentStats.actionsCompleted + 1,
      lastActionDate: today,
    };
  }

  // Calculate reward expiry date
  private calculateRewardExpiry(reward: EcoReward): Date | undefined {
    switch (reward.category) {
      case 'discount':
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      case 'free-delivery':
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      case 'upgrade':
        return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      case 'environmental':
        return undefined; // No expiry
      default:
        return undefined;
    }
  }

  // Get default stats for new users
  private getDefaultStats(): EcoStats {
    return {
      totalPoints: 0,
      level: 1,
      pointsToNextLevel: 500,
      totalCO2Saved: 0,
      totalWaterSaved: 0,
      totalPlasticSaved: 0,
      streakDays: 0,
      actionsCompleted: 0,
    };
  }
}

export default EcoPointsService.getInstance(); 