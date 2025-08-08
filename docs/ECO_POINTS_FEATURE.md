# Eco Points Feature - AquaKart Water Delivery App

## 🌱 Overview

The Eco Points feature is a gamified sustainability system designed to encourage environmentally conscious behavior among AquaKart users. It rewards customers for making eco-friendly choices and helps track their environmental impact.

## 🎯 Key Objectives

1. **Encourage Sustainable Behavior**: Motivate users to make environmentally friendly choices
2. **Track Environmental Impact**: Quantify the positive impact of user actions
3. **Increase User Engagement**: Gamify the water delivery experience
4. **Build Brand Loyalty**: Create a community of environmentally conscious users
5. **Drive Business Growth**: Increase subscription adoption and referrals

## 🏗️ Architecture

### Core Components

1. **Eco Points Integration** (`app/(customer)/account.tsx`)
   - Integrated section within the Account screen
   - Toggle display for viewing points, stats, and environmental impact
   - Seamless integration with account management

2. **Eco Points Service** (`src/services/eco-points.ts`)
   - Handles all eco points business logic
   - Manages user stats and actions
   - Processes rewards and cooldowns

3. **Eco Points Badge** (`components/EcoPointsBadge.tsx`)
   - Reusable component for displaying points
   - Can be integrated into headers and other screens

4. **Database Tables** (Supabase)
   - `user_eco_stats`: User statistics and points
   - `user_eco_actions`: Completed actions history
   - `user_eco_rewards`: Claimed rewards history

## 📊 Features

### 1. Points System
- **Earning Points**: Users earn points for completing eco-friendly actions
- **Level System**: Users progress through levels (500 points per level)
- **Streak Tracking**: Daily action streaks for bonus engagement
- **Environmental Impact**: Real-time calculation of CO₂, water, and plastic saved

### 2. Eco Actions
Users can earn points by completing various actions:

| Action | Points | Cooldown | Category | Environmental Impact |
|--------|--------|----------|----------|---------------------|
| Use Reusable Bottle | 50 | 24h | Daily | 100g plastic, 200g CO₂ saved |
| Choose Subscription | 100 | One-time | One-time | 2kg plastic, 5kg CO₂ saved |
| Eco-friendly Delivery | 25 | Per order | Purchase | 500g plastic saved |
| Refer Friends | 200 | Unlimited | Referral | Community growth |
| Complete Order | 30 | 12h | Purchase | 20L water delivered |
| Rate Service | 20 | 48h | Daily | Feedback improvement |

### 3. Rewards System
Users can redeem points for various rewards:

| Reward | Points Required | Category | Expiry |
|--------|----------------|----------|---------|
| 10% Off Next Order | 500 | Discount | 30 days |
| Free Delivery | 1000 | Free Delivery | 7 days |
| Premium Water Upgrade | 1500 | Upgrade | 24 hours |
| Tree Planting Certificate | 2000 | Environmental | No expiry |

### 4. Environmental Impact Tracking
- **CO₂ Saved**: Carbon dioxide emissions avoided
- **Water Saved**: Liters of water delivered sustainably
- **Plastic Saved**: Kilograms of plastic waste prevented

## 🔧 Implementation Details

### Database Schema

```sql
-- User eco statistics
CREATE TABLE user_eco_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  points_to_next_level INTEGER DEFAULT 500,
  total_co2_saved DECIMAL(10,2) DEFAULT 0,
  total_water_saved DECIMAL(10,2) DEFAULT 0,
  total_plastic_saved DECIMAL(10,2) DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  actions_completed INTEGER DEFAULT 0,
  last_action_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User completed actions
CREATE TABLE user_eco_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_id VARCHAR(50) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  points_earned INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User claimed rewards
CREATE TABLE user_eco_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id VARCHAR(50) NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  points_spent INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Service Methods

```typescript
// Core service methods
class EcoPointsService {
  // Get user's eco stats
  async getUserEcoStats(userId: string): Promise<EcoStats>
  
  // Complete an eco action
  async completeEcoAction(userId: string, actionId: string): Promise<Result>
  
  // Claim a reward
  async claimEcoReward(userId: string, rewardId: string): Promise<Result>
  
  // Get available actions
  async getAvailableEcoActions(): Promise<EcoAction[]>
  
  // Get available rewards
  async getAvailableEcoRewards(): Promise<EcoReward[]>
}
```

## 🎨 UI/UX Design

### Design Principles
- **Green Theme**: Uses success colors and leaf icons
- **Progress Visualization**: Progress bars and level indicators
- **Gamification Elements**: Badges, streaks, and achievements
- **Environmental Focus**: Clear impact metrics and sustainability messaging

### Key Screens

1. **Eco Points Dashboard**
   - Large points display with level progress
   - Environmental impact cards
   - Action and reward lists

2. **Action Completion**
   - Confirmation dialogs
   - Success animations
   - Points earned notifications

3. **Reward Redemption**
   - Available/unavailable states
   - Points requirement display
   - Claim confirmation

## 🚀 Integration Points

### 1. Customer Home Screen
- Eco points badge in header
- Quick access to eco points screen
- Subscription banner highlighting eco benefits

### 2. Account Screen
- Eco points option in menu
- Direct navigation to eco points

### 3. Order Flow
- Automatic points for completed orders
- Eco-friendly packaging options
- Subscription recommendations

### 4. Referral System
- Bonus points for successful referrals
- Environmental impact of growing community

## 📈 Business Impact

### User Engagement
- **Daily Active Users**: Increased through daily actions
- **Session Duration**: Longer engagement with gamification
- **Retention**: Higher retention through rewards and streaks

### Environmental Impact
- **Plastic Reduction**: Tracked reduction in single-use plastics
- **Carbon Footprint**: Measured CO₂ savings
- **Water Conservation**: Sustainable water delivery metrics

### Revenue Growth
- **Subscription Adoption**: Incentivized through eco points
- **Order Frequency**: Increased through rewards
- **Customer Lifetime Value**: Higher through engagement

## 🔮 Future Enhancements

### 1. Advanced Gamification
- **Achievements**: Badges for milestones
- **Leaderboards**: Community competition
- **Challenges**: Time-limited events

### 2. Social Features
- **Friend Connections**: Share eco progress
- **Community Challenges**: Group sustainability goals
- **Social Sharing**: Environmental impact posts

### 3. Advanced Analytics
- **Impact Reports**: Detailed environmental metrics
- **Trend Analysis**: User behavior patterns
- **Predictive Modeling**: Future impact projections

### 4. Partner Integrations
- **Environmental Organizations**: Tree planting partnerships
- **Carbon Offset Programs**: Verified carbon credits
- **Sustainability Certifications**: Third-party validations

## 🛠️ Technical Considerations

### Performance
- **Caching**: Cache user stats for quick access
- **Batch Updates**: Efficient database operations
- **Real-time Updates**: Live points and stats updates

### Security
- **Action Validation**: Prevent point farming
- **Rate Limiting**: Control action completion frequency
- **Data Integrity**: Ensure accurate point calculations

### Scalability
- **Database Indexing**: Optimize queries for large datasets
- **Service Architecture**: Microservices for eco points
- **CDN Integration**: Fast asset delivery

## 📋 Testing Strategy

### Unit Tests
- Service method validation
- Point calculation accuracy
- Cooldown logic verification

### Integration Tests
- Database operations
- API endpoint functionality
- User flow validation

### User Acceptance Tests
- Action completion flows
- Reward redemption processes
- Environmental impact calculations

## 📚 Documentation

### For Developers
- API documentation
- Database schema
- Service architecture

### For Users
- How to earn points
- Available rewards
- Environmental impact explanation

### For Business
- ROI calculations
- Environmental metrics
- User engagement analytics

## 🎯 Success Metrics

### User Engagement
- **Daily Active Users**: Target 40% increase
- **Points Earned**: Average 100 points per user per month
- **Rewards Claimed**: 60% of users claim at least one reward

### Environmental Impact
- **Plastic Saved**: Target 1 ton per month
- **CO₂ Saved**: Target 5 tons per month
- **Water Delivered**: Track sustainable delivery volume

### Business Metrics
- **Subscription Growth**: 25% increase in eco subscriptions
- **Order Frequency**: 30% increase in repeat orders
- **Customer Satisfaction**: 4.5+ star rating for eco features

---

**Eco Points Feature** - Making sustainability rewarding and measurable for AquaKart users. 🌱💧 