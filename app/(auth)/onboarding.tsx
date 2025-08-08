import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Droplets, Zap, Shield, Truck, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius, shadows, commonStyles } from '@/src/design-system';
import Button from '@/components/ui/Button';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: string[];
}

const onboardingSlides: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Pure Water, Pure Life',
    description: 'Get premium quality water delivered to your doorstep in just 10-15 minutes',
    icon: Droplets,
    gradient: ['#00bfff', '#0099cc'],
  },
  {
    id: 2,
    title: 'Lightning Fast Delivery',
    description: 'Our network of verified vendors ensures super-fast delivery across the city',
    icon: Zap,
    gradient: ['#20b2aa', '#1e8a8a'],
  },
  {
    id: 3,
    title: 'Safe & Secure',
    description: 'Every drop is tested and every vendor is verified for your safety',
    icon: Shield,
    gradient: ['#10b981', '#059669'],
  },
  {
    id: 4,
    title: 'Track Your Order',
    description: 'Real-time tracking lets you know exactly when your water will arrive',
    icon: Truck,
    gradient: ['#3b82f6', '#2563eb'],
  },
];

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const handleNext = () => {
    if (currentIndex < onboardingSlides.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      router.push('/(auth)/role-selection');
    }
  };

  const handleSkip = () => {
    router.push('/(auth)/role-selection');
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
    }
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    const IconComponent = item.icon;
    
    return (
      <View style={styles.slide}>
        <LinearGradient
          colors={item.gradient}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.iconContainer}>
            <IconComponent size={120} color={colors.white} />
          </View>
        </LinearGradient>
        
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {onboardingSlides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={onboardingSlides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        style={styles.flatList}
      />

      {/* Pagination */}
      {renderPagination()}

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        {currentIndex > 0 && (
          <TouchableOpacity onPress={handlePrevious} style={styles.navButton}>
            <ArrowLeft size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
        
        <View style={styles.navSpacer} />
        
        <Button
          title={currentIndex === onboardingSlides.length - 1 ? "Get Started" : "Next"}
          onPress={handleNext}
          variant="primary"
          size="large"
          icon={currentIndex === onboardingSlides.length - 1 ? undefined : <ArrowRight size={20} color={colors.white} />}
          style={styles.nextButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  skipButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  skipText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.medium,
  },
  flatList: {
    flex: 1,
  },
  slide: {
    width,
    height: height * 0.7,
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  contentContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius['3xl'],
    borderTopRightRadius: borderRadius['3xl'],
    padding: spacing.xl,
    ...shadows.xl,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontFamily: typography.fontFamily.bold,
  },
  description: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.lg,
    fontFamily: typography.fontFamily.regular,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray300,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  navSpacer: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
    maxWidth: 200,
  },
}); 