import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BRAND, ORDER_STATUS_FLOW } from '@pedacinho/shared';
import { supabase } from '../../src/lib/supabase';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../../src/theme';
import { useBreakpoint } from '../../src/lib/responsive';

export default function OrdersScreen() {
    const [ticketCode, setTicketCode] = useState('');
    const [currentOrder, setCurrentOrder] = useState<Record<string, any> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { contentStyle } = useBreakpoint();

    async function handleSearch() {
        if (!ticketCode.trim()) {
            Alert.alert('Atenção', 'Digite a senha do seu pedido');
            return;
        }

        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('ticket_code', ticketCode.trim().toUpperCase())
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    Alert.alert('Não encontrado', 'Pedido não encontrado para a senha informada. Só valem pedidos criados hoje.');
                    setCurrentOrder(null);
                } else {
                    throw error;
                }
            } else {
                setCurrentOrder(data);
            }
        } catch (error: any) {
            console.error('Error fetching order', error);
            Alert.alert('Erro', 'Não foi possível buscar o pedido.');
        } finally {
            setIsLoading(false);
        }
    }

    // Real-time status sync
    useEffect(() => {
        if (!currentOrder?.id) return;

        const channel = supabase
            .channel(`order_${currentOrder.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `id=eq.${currentOrder.id}`,
                },
                (payload) => {
                    setCurrentOrder((prev) => prev ? { ...prev, ...payload.new } : payload.new);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentOrder?.id]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={contentStyle}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Meu Pedido</Text>
            </View>

            {/* Search by ticket */}
            <View style={styles.ticketCard}>
                <View style={styles.ticketIcon}>
                    <Ionicons name="receipt-outline" size={28} color={COLORS.primary} />
                </View>
                <Text style={styles.ticketTitle}>Consultar Pedido</Text>
                {currentOrder ? (
                    <Text style={styles.ticketSubtitle}>
                        Acompanhando pedido: <Text style={{ fontWeight: 'bold', color: COLORS.primary }}>{currentOrder.ticket_code}</Text>
                    </Text>
                ) : (
                    <Text style={styles.ticketSubtitle}>
                        Insira a senha do seu pedido para acompanhar o status
                    </Text>
                )}

                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.ticketInput}
                        placeholder="EX: A001"
                        placeholderTextColor={COLORS.textMuted}
                        value={ticketCode}
                        onChangeText={(text) => setTicketCode(text.toUpperCase())}
                        autoCapitalize="characters"
                        maxLength={6}
                        editable={!isLoading}
                    />
                    <TouchableOpacity
                        style={[styles.searchButton, isLoading && { opacity: 0.7 }]}
                        onPress={handleSearch}
                        activeOpacity={0.8}
                        disabled={isLoading}
                    >
                        <Ionicons name={isLoading ? "hourglass-outline" : "search"} size={20} color={COLORS.textOnPrimary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Status flow legend */}
            <View style={styles.statusSection}>
                <Text style={styles.statusTitle}>
                    {currentOrder ? 'Status Atual' : 'Etapas do pedido'}
                </Text>

                {(() => {
                    const visibleStatuses = ORDER_STATUS_FLOW.filter(s => s.key !== 'cancelado');
                    const currentStatusIndex = currentOrder
                        ? ORDER_STATUS_FLOW.findIndex(s => s.key === currentOrder.status)
                        : -1;
                    return visibleStatuses.map((status, index) => {
                        const isPast = currentOrder ? index <= currentStatusIndex : false;
                        const isCurrent = currentOrder ? index === currentStatusIndex : false;
                        return (
                            <View key={status.key} style={[styles.statusRow, isCurrent && styles.statusRowCurrent]}>
                                <View style={[styles.statusDot, { backgroundColor: isPast ? status.color : COLORS.cardBorder }]} />
                                {index < visibleStatuses.length - 1 && (
                                    <View style={[styles.statusLine, { backgroundColor: isPast ? status.color : COLORS.cardBorder }]} />
                                )}
                                <View style={styles.statusInfo}>
                                    <Text style={[styles.statusEmoji, !isPast && !currentOrder && { opacity: 1 }, currentOrder && !isPast && { opacity: 0.3 }]}>{status.emoji}</Text>
                                    <Text style={[styles.statusLabel, currentOrder && !isPast && { color: COLORS.textMuted }]}>
                                        {status.label}
                                    </Text>
                                </View>
                                {isCurrent && (
                                    <View style={styles.currentBadge}>
                                        <Text style={styles.currentBadgeText}>Agora</Text>
                                    </View>
                                )}
                            </View>
                        );
                    });
                })()}
            </View>

            {/* Bottom info */}
            <View style={styles.infoCard}>
                <Ionicons name="information-circle-outline" size={20} color={COLORS.info} />
                <Text style={styles.infoText}>
                    Ao confirmar um pedido, você receberá uma senha para acompanhar e retirar no balcão ou drive-thru.
                </Text>
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
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
    },
    headerTitle: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: '800',
        color: COLORS.text,
    },

    // Ticket card
    ticketCard: {
        marginHorizontal: SPACING.md,
        padding: SPACING.lg,
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        alignItems: 'center',
        gap: SPACING.sm,
        ...SHADOWS.md,
    },
    ticketIcon: {
        width: 56,
        height: 56,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    ticketTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '700',
        color: COLORS.text,
    },
    ticketSubtitle: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.md,
    },
    inputRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        width: '100%',
    },
    ticketInput: {
        flex: 1,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm + 2,
        backgroundColor: COLORS.background,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        fontSize: FONT_SIZE.lg,
        fontWeight: '700',
        color: COLORS.text,
        textAlign: 'center',
        letterSpacing: 4,
    },
    searchButton: {
        width: 44,
        height: 44,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.sm,
    },

    // Status legend
    statusSection: {
        marginHorizontal: SPACING.md,
        marginTop: SPACING.xl,
        padding: SPACING.lg,
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        ...SHADOWS.sm,
    },
    statusTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
        position: 'relative',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: BORDER_RADIUS.md,
    },
    statusRowCurrent: {
        backgroundColor: '#FFFBEB', // very light yellow
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: BORDER_RADIUS.full,
        marginRight: SPACING.md,
    },
    statusLine: {
        position: 'absolute',
        left: 5,
        top: 16,
        width: 2,
        height: SPACING.xl,
        backgroundColor: COLORS.cardBorder,
    },
    statusInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    statusEmoji: {
        fontSize: 16,
    },
    statusLabel: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: COLORS.text,
    },
    currentBadge: {
        marginLeft: 'auto',
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    currentBadgeText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '700',
        color: COLORS.text,
    },

    // Info card
    infoCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginHorizontal: SPACING.md,
        marginTop: SPACING.lg,
        padding: SPACING.md,
        backgroundColor: '#EFF6FF',
        borderRadius: BORDER_RADIUS.md,
        gap: SPACING.sm,
    },
    infoText: {
        flex: 1,
        fontSize: FONT_SIZE.sm,
        color: COLORS.info,
        lineHeight: 18,
    },
});
