# Eco Points Database Setup Guide

## Overview
The Eco Points feature requires three database tables to be created in your Supabase database. The app is currently configured to work with default values when these tables don't exist, but for full functionality, you'll need to create them.

## Required Tables

### 1. user_eco_stats
Stores user eco points and environmental impact statistics.

### 2. user_eco_actions  
Tracks completed eco-friendly actions by users.

### 3. user_eco_rewards
Tracks claimed eco rewards by users.

## Setup Instructions

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the SQL from the migration file: `supabase/migrations/20250731163002_create_eco_points_tables.sql`
4. Run the SQL to create all tables and policies

### Option 2: Using Supabase CLI

1. Make sure you have the Supabase CLI installed
2. Run the migration:
   ```bash
   npx supabase db push
   ```

### Option 3: Manual Table Creation

If you prefer to create tables manually, run these SQL commands in your Supabase SQL Editor:

```sql
-- Create user_eco_stats table
CREATE TABLE IF NOT EXISTS user_eco_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create user_eco_actions table
CREATE TABLE IF NOT EXISTS user_eco_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_id VARCHAR(50) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  points_earned INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_eco_rewards table
CREATE TABLE IF NOT EXISTS user_eco_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reward_id VARCHAR(50) NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  points_spent INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_eco_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_eco_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_eco_rewards ENABLE ROW LEVEL SECURITY;

-- Create policies (see migration file for complete policy setup)
```

## Current Status

✅ **App is working**: The app currently works with default values when tables don't exist  
✅ **Error handling**: All database errors are gracefully handled  
✅ **User experience**: Users can see the Eco Points section without database errors  

## Next Steps

1. **Set up database tables** using one of the options above
2. **Test the feature** by completing eco actions
3. **Monitor usage** through the Supabase dashboard

## Features Available

- ✅ Eco Points display in Account screen
- ✅ Environmental impact tracking
- ✅ Level progression system
- ✅ Streak tracking
- ✅ Action completion (when tables exist)
- ✅ Reward claiming (when tables exist)

## Troubleshooting

If you encounter any issues:

1. Check that all three tables exist in your database
2. Verify Row Level Security policies are in place
3. Ensure your Supabase connection is working
4. Check the app logs for any specific error messages

The app will continue to work with default values even if the database setup is incomplete. 