import { useWindowDimensions } from 'react-native';
import { SPACING } from '../theme';

export const BP = { sm: 640, lg: 1024 };

export function useBreakpoint() {
    const { width } = useWindowDimensions();
    const isMobile = width < BP.sm;
    const isDesktop = width >= BP.lg;
    const cols = isMobile ? 2 : isDesktop ? 4 : 3;
    const containerWidth = isDesktop ? Math.min(width, 1200) : width;
    const cardWidth = (containerWidth - SPACING.md * (cols + 1)) / cols;

    return {
        width,
        isMobile,
        isDesktop,
        isTablet: !isMobile && !isDesktop,
        cols,
        cardWidth,
        containerWidth,
        contentStyle: {
            flex: 1,
            maxWidth: isDesktop ? 1200 : undefined,
            width: '100%' as const,
            alignSelf: 'center' as const,
        },
    };
}
