import React, { useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BRAND, CATEGORY_CONFIG, Product } from '@pedacinho/shared';
import { supabase } from '../../src/lib/supabase';
import { useCart } from '../../src/contexts/CartContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../../src/theme';
import { formatPrice } from '../../src/lib/utils';
import { useBreakpoint } from '../../src/lib/responsive';

export default function MenuScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('todas');
    const [searchQuery, setSearchQuery] = useState('');
    const { addItem, itemCount } = useCart();
    const { cols, cardWidth, contentStyle } = useBreakpoint();

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('category', { ascending: true });

        if (!error && data) {
            setProducts(data as Product[]);
        }
        setLoading(false);
    }

    const categories = useMemo(() => {
        const cats = [...new Set(products.map((p) => p.category))];
        return cats.sort((a, b) => {
            const configA = CATEGORY_CONFIG[a];
            const configB = CATEGORY_CONFIG[b];
            return (configA?.order ?? 99) - (configB?.order ?? 99);
        });
    }, [products]);

    const filteredProducts = useMemo(() => {
        let result = products;
        if (selectedCategory !== 'todas') {
            result = result.filter((p) => p.category === selectedCategory);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    (p.description && p.description.toLowerCase().includes(q))
            );
        }
        return result;
    }, [products, selectedCategory, searchQuery]);

    function renderHeader() {
        return (
            <View>
                {/* Brand Header */}
                <View style={styles.brandHeader}>
                    <View style={styles.brandLogo}>
                        <Text style={styles.brandLogoText}>🍕</Text>
                    </View>
                    <View style={styles.brandInfo}>
                        <Text style={styles.brandName}>{BRAND.shortName}</Text>
                        <Text style={styles.brandService}>{BRAND.serviceMode}</Text>
                    </View>
                    {itemCount > 0 && (
                        <View style={styles.cartBadgeContainer}>
                            <Ionicons name="bag" size={24} color={COLORS.primary} />
                            <View style={styles.cartBadge}>
                                <Text style={styles.cartBadgeText}>{itemCount}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <Text style={styles.heroTitle}>
                        Pizzas <Text style={styles.heroTitleAccent}>Napolitanas</Text>
                    </Text>
                    <Text style={styles.heroSubtitle}>{BRAND.subtitleLine}</Text>
                </View>

                {/* Search Bar (Easyrest pattern: pill-shaped) */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={18} color={COLORS.textMuted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar pizza..."
                        placeholderTextColor={COLORS.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Category Tabs (Easyrest pattern: horizontal scroll with images) */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryScroll}
                    contentContainerStyle={styles.categoryContent}
                >
                    <TouchableOpacity
                        style={[
                            styles.categoryChip,
                            selectedCategory === 'todas' && styles.categoryChipActive,
                        ]}
                        onPress={() => setSelectedCategory('todas')}
                    >
                        <Text
                            style={[
                                styles.categoryChipText,
                                selectedCategory === 'todas' && styles.categoryChipTextActive,
                            ]}
                        >
                            Todas
                        </Text>
                    </TouchableOpacity>
                    {categories.map((cat) => {
                        const config = CATEGORY_CONFIG[cat];
                        const isActive = selectedCategory === cat;
                        return (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                                onPress={() => setSelectedCategory(cat)}
                            >
                                <Text style={styles.categoryEmoji}>{config?.emoji || '🍽️'}</Text>
                                <Text
                                    style={[
                                        styles.categoryChipText,
                                        isActive && styles.categoryChipTextActive,
                                    ]}
                                >
                                    {config?.label || cat}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Results count */}
                <View style={styles.resultsHeader}>
                    <Text style={styles.resultsCount}>
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'itens'}
                    </Text>
                </View>
            </View>
        );
    }

    function renderProductCard({ item, cardWidth: cw }: { item: Product; cardWidth: number }) {
        const config = CATEGORY_CONFIG[item.category];

        return (
            <TouchableOpacity style={[styles.productCard, { width: cw }]} activeOpacity={0.85}>
                {/* Image placeholder or actual image */}
                <View style={styles.productImageContainer}>
                    {item.image_url ? (
                        <Image source={{ uri: item.image_url }} style={styles.productImage} />
                    ) : (
                        <View style={styles.productImagePlaceholder}>
                            <Text style={styles.productImagePlaceholderText}>
                                {config?.emoji || '🍕'}
                            </Text>
                        </View>
                    )}
                    {/* Category badge */}
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>
                            {config?.label || item.category}
                        </Text>
                    </View>
                </View>

                {/* Info */}
                <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.productDescription} numberOfLines={2}>
                        {item.description}
                    </Text>

                    {/* Price + Add button */}
                    <View style={styles.productFooter}>
                        <View>
                            <Text style={styles.priceLabel}>a partir de</Text>
                            <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => addItem(item)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="add" size={20} color={COLORS.textOnPrimary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Carregando cardápio...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={contentStyle}>
                <FlatList
                    key={cols}
                    data={filteredProducts}
                    keyExtractor={(item) => item.id}
                    numColumns={cols}
                    columnWrapperStyle={styles.row}
                    renderItem={({ item }) => renderProductCard({ item, cardWidth })}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyEmoji}>🔍</Text>
                            <Text style={styles.emptyText}>Nenhum item encontrado</Text>
                        </View>
                    }
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        gap: SPACING.md,
    },
    loadingText: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textSecondary,
    },
    listContent: {
        paddingBottom: SPACING.xxl,
    },

    // Brand Header
    brandHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    brandLogo: {
        width: 44,
        height: 44,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandLogoText: {
        fontSize: 24,
    },
    brandInfo: {
        flex: 1,
        marginLeft: SPACING.sm,
    },
    brandName: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '800',
        color: COLORS.text,
    },
    brandService: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    cartBadgeContainer: {
        position: 'relative',
        padding: SPACING.xs,
    },
    cartBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.full,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.textOnPrimary,
    },

    // Hero
    heroSection: {
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.md,
    },
    heroTitle: {
        fontSize: FONT_SIZE.hero,
        fontWeight: '900',
        color: COLORS.text,
        letterSpacing: -1,
    },
    heroTitleAccent: {
        color: COLORS.primary,
    },
    heroSubtitle: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
    },

    // Search (pill-shaped like Easyrest)
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.md,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm + 2,
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        ...SHADOWS.sm,
    },
    searchInput: {
        flex: 1,
        marginLeft: SPACING.sm,
        fontSize: FONT_SIZE.md,
        color: COLORS.text,
    },

    // Categories (horizontal chips)
    categoryScroll: {
        marginBottom: SPACING.sm,
    },
    categoryContent: {
        paddingHorizontal: SPACING.md,
        gap: SPACING.sm,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1.5,
        borderColor: COLORS.cardBorder,
        gap: SPACING.xs,
    },
    categoryChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    categoryChipText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    categoryChipTextActive: {
        color: COLORS.textOnPrimary,
    },
    categoryEmoji: {
        fontSize: 14,
    },

    // Results
    resultsHeader: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    resultsCount: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textMuted,
        fontWeight: '500',
    },

    // Product grid
    row: {
        paddingHorizontal: SPACING.md,
        gap: SPACING.md,
        marginBottom: SPACING.md,
    },

    // Product Card (width set dynamically via inline style)
    productCard: {
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        ...SHADOWS.md,
    },
    productImageContainer: {
        width: '100%',
        aspectRatio: 1.4,
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    productImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    productImagePlaceholderText: {
        fontSize: 48,
    },
    categoryBadge: {
        position: 'absolute',
        top: SPACING.sm,
        left: SPACING.sm,
        backgroundColor: 'rgba(255, 221, 0, 0.9)',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    categoryBadgeText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '700',
        color: COLORS.text,
    },

    // Product info
    productInfo: {
        padding: SPACING.sm,
    },
    productName: {
        fontSize: FONT_SIZE.md,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 2,
    },
    productDescription: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textMuted,
        lineHeight: 16,
        marginBottom: SPACING.sm,
    },
    productFooter: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    priceLabel: {
        fontSize: 9,
        color: COLORS.textMuted,
        fontWeight: '500',
    },
    productPrice: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '800',
        color: COLORS.primary,
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.sm,
    },

    // Empty state
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: SPACING.xxl * 2,
        gap: SPACING.md,
    },
    emptyEmoji: {
        fontSize: 48,
    },
    emptyText: {
        fontSize: FONT_SIZE.lg,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
});
