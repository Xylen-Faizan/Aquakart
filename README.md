# AquaKart - Modern Water Delivery App

A modern, clean, and user-engaging water delivery app built with React Native, Expo, Supabase, and Razorpay. Inspired by Blinkit/Zepto-style apps with a unique aqua-blue theme.

## 🎨 Design System

### Color Palette
- **Primary**: `#00bfff` (Aqua Blue)
- **Secondary**: `#20b2aa` (Teal)
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Orange)
- **Error**: `#ef4444` (Red)
- **Info**: `#3b82f6` (Blue)

### Typography
- **Font Family**: SF Pro Display (iOS) / Roboto (Android)
- **Font Weights**: Regular (400), Medium (500), Semibold (600), Bold (700), Extrabold (800)
- **Font Sizes**: xs (12), sm (14), base (16), lg (18), xl (20), 2xl (24), 3xl (30), 4xl (36), 5xl (48)

### Spacing
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px
- **3xl**: 64px

### Border Radius
- **sm**: 4px
- **md**: 8px
- **lg**: 12px
- **xl**: 16px
- **2xl**: 20px
- **3xl**: 24px
- **full**: 9999px

## 🧩 UI Components

### Button Component
```tsx
import Button from '@/components/ui/Button';

<Button
  title="Click Me"
  onPress={() => {}}
  variant="primary" // primary | secondary | outline | ghost
  size="medium" // small | medium | large
  disabled={false}
  loading={false}
  icon={<Icon />}
/>
```

### Input Component
```tsx
import Input from '@/components/ui/Input';

<Input
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  error="Invalid email"
  secureTextEntry={false}
  keyboardType="email-address"
/>
```

### Card Component
```tsx
import Card from '@/components/ui/Card';

<Card
  variant="default" // default | elevated | outlined
  padding="medium" // none | small | medium | large
>
  <Text>Card content</Text>
</Card>
```

## 📱 Key Screens

### 1. Onboarding Screen
- **Location**: `app/(auth)/onboarding.tsx`
- **Features**:
  - Water-themed graphics with gradients
  - Smooth pagination
  - Skip functionality
  - Modern animations

### 2. Role Selection Screen
- **Location**: `app/(auth)/role-selection.tsx`
- **Features**:
  - Customer vs Vendor selection
  - Feature highlights
  - Modern card design
  - Gradient backgrounds

### 3. Login Screen
- **Location**: `app/(auth)/login.tsx`
- **Features**:
  - Email/Phone toggle
  - Social login options
  - Modern form design
  - Role-based routing

### 4. Customer Home Screen
- **Location**: `app/(customer)/index.tsx`
- **Features**:
  - Location-based delivery
  - Quick reorder section
  - Product categories
  - Real-time cart
  - Subscription banner
  - Voice search integration

### 5. Vendor Dashboard
- **Location**: `app/(vendor)/index.tsx`
- **Features**:
  - Online/Offline toggle
  - Real-time stats
  - Order management
  - Inventory alerts
  - Quick actions

## 🎯 Key Features

### Customer Features
- **Fast Delivery**: 10-15 minute delivery guarantee
- **Real-time Tracking**: Live order tracking with maps
- **Multiple Payment Options**: Razorpay integration (Cards, UPI, COD)
- **Subscription Plans**: Eco-friendly subscription options
- **Voice Search**: Hands-free product search
- **Quick Reorder**: One-tap reordering
- **Favorites**: Save favorite products and vendors

### Vendor Features
- **Order Management**: Accept/Reject orders
- **Real-time Analytics**: Daily/weekly/monthly earnings
- **Inventory Management**: Stock alerts and management
- **Live Tracking**: Customer location tracking
- **Performance Metrics**: Ratings and delivery times

## 🛠 Technical Stack

- **Frontend**: React Native + Expo
- **Backend**: Supabase
- **Payment**: Razorpay
- **Maps**: React Native Maps
- **Icons**: Lucide React Native
- **Navigation**: Expo Router
- **State Management**: React Hooks
- **Styling**: StyleSheet + Design System

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- React Native development environment

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd project

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Setup
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## 📁 Project Structure

```
project/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   ├── (customer)/        # Customer screens
│   └── (vendor)/          # Vendor screens
├── components/            # Reusable components
│   ├── ui/               # UI components (Button, Input, Card)
│   └── ...               # Feature components
├── src/
│   ├── design-system.ts  # Design system configuration
│   └── services/         # API services
├── assets/               # Images, fonts, etc.
└── lib/                  # Utility libraries
```

## 🎨 Design Principles

### 1. Consistency
- All components follow the same design system
- Consistent spacing, typography, and colors
- Unified interaction patterns

### 2. Accessibility
- High contrast ratios
- Readable font sizes
- Touch-friendly button sizes
- Screen reader support

### 3. Performance
- Optimized images and assets
- Efficient component rendering
- Smooth animations
- Fast loading times

### 4. User Experience
- Intuitive navigation
- Clear visual hierarchy
- Responsive design
- Error handling

## 🔧 Customization

### Adding New Colors
```tsx
// In src/design-system.ts
export const colors = {
  // ... existing colors
  custom: '#your-color',
};
```

### Creating New Components
```tsx
// In components/ui/NewComponent.tsx
import { colors, typography, spacing } from '@/src/design-system';

export default function NewComponent() {
  return (
    <View style={styles.container}>
      {/* Component content */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    // ... other styles
  },
});
```

## 📱 Platform Support

- **iOS**: iOS 13.0+
- **Android**: Android 6.0+ (API level 23+)
- **Web**: Modern browsers (Chrome, Firefox, Safari, Edge)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Follow the design system guidelines
5. Test on multiple devices
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Design inspiration from Blinkit and Zepto
- Icons from Lucide React Native
- UI components built with modern React Native patterns
- Community contributions and feedback

---

**AquaKart** - Pure water, pure life. 💧 