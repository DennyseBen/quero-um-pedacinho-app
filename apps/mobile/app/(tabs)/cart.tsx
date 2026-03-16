import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../src/contexts/CartContext';
import { supabase } from '../../src/lib/supabase';
import { BRAND } from '@pedacinho/shared';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../../src/theme';
import { formatPrice } from '../../src/lib/utils';
import { useBreakpoint } from '../../src/lib/responsive';

export default function CartScreen() {
    const { items, updateQuantity, clearCart, total, itemCount } = useCart();
    const { contentStyle } = useBreakpoint();

    function handleClearCart() {
        Alert.alert('Limpar sacola', 'Deseja remover todos os itens?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Limpar', style: 'destructive', onPress: clearCart },
        ]);
    }

    async function handleCheckout() {
        if (items.length === 0) return;

        Alert.alert(
            '🍕 Confirmar Pedido',
            `Total: ${formatPrice(total)}\n\nDeseja confirmar seu pedido para retirada no balcão?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            const ticketCode = `A${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`;

                            // Create order
                            const { data: order, error: orderError } = await supabase
                                .from('orders')
                                .insert({
                                    total_amount: total,
                                    ticket_code: ticketCode,
                                    pickup_mode: 'balcao',
                                    delivery_address: 'Retirada no Balcão',
                                    payment_method: 'na_retirada'
                                    // user_id is now optional
                                })
                                .select()
                                .single();

                            if (orderError) throw orderError;

                            // Create order items
                            const orderItems = items.map(item => ({
                                order_id: order.id,
                                product_id: item.product.id,
                                quantity: item.quantity,
                                unit_price: item.product.price
                            }));

                            const { error: itemsError } = await supabase
                                .from('order_items')
                                .insert(orderItems);

                            if (itemsError) throw itemsError;

                            Alert.alert(
                                '✅ Pedido Confirmado!',
                                `Sua senha de retirada é:\n\n${ticketCode}\n\nAguarde o preparo e retire no balcão.\n\nVocê pode acompanhar na aba "Pedidos".`,
                                [{ text: 'OK', onPress: clearCart }]
                            );
                        } catch (error: any) {
                            console.error('Error creating order:', error);
                            Alert.alert('Erro', `Não foi possível confirmar o pedido: ${error.message}`);
                        }
                    },
                },
            ]
        );
    }

    if (items.length === 0) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={contentStyle}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Sacola</Text>
                    </View>
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="bag-outline" size={64} color={COLORS.textMuted} />
                        </View>
                        <Text style={styles.emptyTitle}>Sacola vazia</Text>
                        <Text style={styles.emptySubtitle}>
                            Adicione itens do cardápio para começar seu pedido
                        </Text>
                        <Text style={styles.emptyQuote}>"{BRAND.phrases.trigger}"</Text>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={contentStyle}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Sacola</Text>
                <TouchableOpacity onPress={handleClearCart}>
                    <Text style={styles.clearText}>Limpar</Text>
                </TouchableOpacity>
            </View>

            {/* Items list */}
            <FlatList
                data={items}
                keyExtractor={(item) => item.product.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={styles.cartItem}>
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.product.name}</Text>
                            <Text style={styles.itemPrice}>
                                {formatPrice(item.product.price)} / un
                            </Text>
                        </View>

                        {/* Quantity controls */}
                        <View style={styles.quantityContainer}>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                            >
                                <Ionicons
                                    name={item.quantity === 1 ? 'trash-outline' : 'remove'}
                                    size={16}
                                    color={item.quantity === 1 ? COLORS.danger : COLORS.text}
                                />
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{item.quantity}</Text>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                            >
                                <Ionicons name="add" size={16} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.itemTotal}>
                            {formatPrice(item.product.price * item.quantity)}
                        </Text>
                    </View>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total ({itemCount} {itemCount === 1 ? 'item' : 'itens'})</Text>
                    <Text style={styles.totalPrice}>{formatPrice(total)}</Text>
                </View>

                <View style={styles.pickupInfo}>
                    <Ionicons name="storefront-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.pickupText}>Retirada no Balcão · Drive-Thru</Text>
                </View>

                <TouchableOpacity
                    style={styles.checkoutButton}
                    onPress={handleCheckout}
                    activeOpacity={0.8}
                >
                    <Ionicons name="checkmark-circle" size={22} color={COLORS.textOnPrimary} />
                    <Text style={styles.checkoutText}>Confirmar Pedido</Text>
                </TouchableOpacity>
            </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
    },
    headerTitle: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: '800',
        color: COLORS.text,
    },
    clearText: {
        fontSize: FONT_SIZE.md,
        color: COLORS.danger,
        fontWeight: '600',
    },
    listContent: {
        paddingHorizontal: SPACING.md,
    },

    // Cart Item
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        gap: SPACING.sm,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: FONT_SIZE.md,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 2,
    },
    itemPrice: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textMuted,
    },

    // Quantity
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        gap: SPACING.sm,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    quantityButton: {
        width: 28,
        height: 28,
        borderRadius: BORDER_RADIUS.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        fontSize: FONT_SIZE.md,
        fontWeight: '700',
        color: COLORS.text,
        minWidth: 20,
        textAlign: 'center',
    },

    itemTotal: {
        fontSize: FONT_SIZE.md,
        fontWeight: '800',
        color: COLORS.primary,
        minWidth: 70,
        textAlign: 'right',
    },

    separator: {
        height: 1,
        backgroundColor: COLORS.cardBorder,
    },

    // Footer
    footer: {
        padding: SPACING.md,
        backgroundColor: COLORS.card,
        borderTopWidth: 1,
        borderTopColor: COLORS.cardBorder,
        gap: SPACING.md,
        ...SHADOWS.lg,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    totalPrice: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: '900',
        color: COLORS.text,
    },
    pickupInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    pickupText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    checkoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.full,
        ...SHADOWS.md,
    },
    checkoutText: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '700',
        color: COLORS.textOnPrimary,
    },

    // Empty state
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
        gap: SPACING.md,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    emptyTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '700',
        color: COLORS.text,
    },
    emptySubtitle: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    emptyQuote: {
        fontSize: FONT_SIZE.md,
        color: COLORS.primary,
        fontWeight: '600',
        fontStyle: 'italic',
        marginTop: SPACING.md,
    },
});
