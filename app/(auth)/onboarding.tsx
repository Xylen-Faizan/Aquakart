import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Droplets, Zap, Shield, Truck, ArrowRight } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  Extrapolate,
  SharedValue,
} from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows, commonStyles } from '@/src/design-system';
import Button from '@/components/ui/Button';

const { width } = Dimensions.get('window');

// --- DATA ---
interface OnboardingSlideData {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: readonly [string, string];
}

const onboardingSlides: OnboardingSlideData[] = [
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

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<OnboardingSlideData>);

// --- SLIDE COMPONENT ---
interface SlideProps {
  item: OnboardingSlideData;
  index: number;
  scrollX: SharedValue<number>;
}

const Slide: React.FC<SlideProps> = ({ item, index, scrollX }) => {
  const IconComponent = item.icon;

  const iconAnimatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const iconScale = interpolate(scrollX.value, inputRange, [0.5, 1, 0.5], Extrapolate.CLAMP);
    const iconOpacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolate.CLAMP);
    return {
      opacity: iconOpacity,
      transform: [{ scale: iconScale }],
    };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const titleTranslateY = interpolate(
      scrollX.value,
      inputRange,
      [50, 0, -50],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateY: titleTranslateY }],
    };
  });

  const descriptionAnimatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const descriptionTranslateY = interpolate(
      scrollX.value,
      inputRange,
      [100, 0, -100],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateY: descriptionTranslateY }],
    };
  });

  return (
    <View style={styles.slide}>
      {/* FIX: Assert the gradient array as `readonly` to match expected type */}
      <LinearGradient colors={item.gradient} style={styles.gradientBackground}>
        <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
          <IconComponent size={120} color={colors.white} />
        </Animated.View>
      </LinearGradient>
      <View style={styles.contentContainer}>
        <Animated.View style={titleAnimatedStyle}>
          <Text style={styles.title}>{item.title}</Text>
        </Animated.View>
        <Animated.View style={descriptionAnimatedStyle}>
          <Text style={styles.description}>{item.description}</Text>
        </Animated.View>
      </View>
    </View>
  );
};

// --- PAGINATION COMPONENT ---
interface PaginationProps {
  data: OnboardingSlideData[];
  scrollX: SharedValue<number>;
}

const Pagination: React.FC<PaginationProps> = ({ data, scrollX }) => {
  return (
    <View style={styles.paginationContainer}>
      {data.map((_, i) => {
        const animatedStyle = useAnimatedStyle(() => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = interpolate(scrollX.value, inputRange, [8, 24, 8], Extrapolate.CLAMP);
          const dotColor = interpolateColor(
            scrollX.value,
            inputRange,
            [colors.gray300, colors.primary, colors.gray300]
          );
          return {
            width: dotWidth,
            backgroundColor: dotColor,
          };
        });
        return <Animated.View key={`dot-${i}`} style={[styles.paginationDot, animatedStyle]} />;
      })}
    </View>
  );
};

// --- MAIN ONBOARDING COMPONENT ---
export default function Onboarding() {
  const flatListRef = useRef<FlatList<OnboardingSlideData>>(null);
  const router = useRouter();
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const getCurrentIndex = () => Math.round(scrollX.value / width);

  const handleNext = () => {
    const currentIndex = getCurrentIndex();
    if (currentIndex < onboardingSlides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      router.push('/(auth)/role-selection');
    }
  };

  const handleSkip = () => {
    router.push('/(auth)/role-selection');
  };

  const renderItem = ({ item, index }: ListRenderItemInfo<OnboardingSlideData>) => (
    <Slide item={item} index={index} scrollX={scrollX} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <AnimatedFlatList
        ref={flatListRef}
        data={onboardingSlides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={styles.flatList}
      />

      <Pagination data={onboardingSlides} scrollX={scrollX} />

      <View style={styles.navigationContainer}>
        <Button
          title="Next"
          onPress={handleNext}
          variant="primary"
          size="large"
          icon={<ArrowRight size={20} color={colors.white} />}
          style={styles.nextButton}
        />
      </View>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    position: 'absolute',
    top: 50,
    right: 0,
    zIndex: 10,
    paddingHorizontal: spacing.lg,
  },
  skipButton: {
    padding: spacing.sm,
  },
  skipText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  flatList: {
    flexGrow: 0,
    height: '75%', 
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
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
    width: '100%',
    height: '40%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius['3xl'],
    borderTopRightRadius: borderRadius['3xl'],
    padding: spacing.xl,
    justifyContent: 'center',
    ...shadows.xl,
    shadowColor: colors.shadowDark,
  },
  title: {
    ...commonStyles.text.h3,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...commonStyles.text.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.lg,
    gap: spacing.sm,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
  },
  navigationContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  nextButton: {
    width: '100%',
  },
});