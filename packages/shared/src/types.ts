// ============================================
// Quero Um Pedacinho — Shared Types
// ============================================

export type OrderStatus =
    | 'novo_pedido'
    | 'preparando'
    | 'no_forno'
    | 'saiu_entrega'
    | 'entregue'
    | 'cancelado';

// Categories aligned with production app
export type ProductCategory =
    | 'tradicional'
    | 'especial'
    | 'premium'
    | 'doce'
    | 'cafeteria'
    | 'bebida';

// Pickup model: Drive-Thru & Balcão with password ticket
export type PickupMode = 'balcao' | 'drive_thru';

export interface User {
    id: string;
    full_name: string | null;
    phone: string | null;
    address: string | null;
    cashback_balance: number;
    is_admin: boolean;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: string;
    name: string;
    description: string | null;
    category: string;
    price: number;
    image_url: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Order {
    id: string;
    user_id: string;
    status: OrderStatus;
    total_amount: number;
    delivery_address: string;
    payment_method: string | null;
    stripe_payment_id: string | null;
    created_at: string;
    updated_at: string;
    ticket_code?: string; // ex: A001, B002
    pickup_mode?: PickupMode;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    created_at: string;
}

// Joined types for rich queries
export interface OrderWithItems extends Order {
    order_items: (OrderItem & { product: Product })[];
    user?: User;
}

// Cart types (client-side)
export interface CartItem {
    product: Product;
    quantity: number;
}

// Dashboard metrics
export interface DashboardMetrics {
    total_orders_today: number;
    revenue_today: number;
    orders_by_status: Record<OrderStatus, number>;
    top_products: { product: Product; total_sold: number }[];
}

// ============================================
// Brand Constants
// ============================================
export const BRAND = {
    name: 'Quero Um Pedacinho',
    shortName: 'Q. Pedacinho',
    tagline: 'Pizzaria Express',
    subtitle: 'Pizzas Napolitanas',
    subtitleLine: 'Feitas com amor e os melhores ingredientes',
    slogan: 'Aqui tem amor em fatias!',
    serviceMode: 'Drive-Thru & Balcão',
    phrases: {
        impact: 'Rápido, quente e impossível de comer um só',
        trigger: 'Bateu a fome?',
        positioning: 'O pedaço mais disputado da cidade',
        urgency: ['A primeira fornada já está saindo', 'Últimos pedaços da noite'],
    },
    location: {
        city: 'Marabá',
        state: 'PA',
        country: 'BR',
    },
    colors: {
        primary: '#E74011',      // Vermelho Alaranjado (real brand)
        primaryHover: '#D13A0E',
        secondary: '#FFDD00',    // Amarelo Vibrante
        secondaryHover: '#E6C700',
        cream: '#F3EDE4',        // Fundo creme (usado no app existente)
        dark: '#1A1A1A',
        darkCard: '#252525',
        light: '#FAFAFA',
        muted: '#9CA3AF',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
    },
} as const;

// Order status flow for Kanban
export const ORDER_STATUS_FLOW: { key: OrderStatus; label: string; emoji: string; color: string }[] = [
    { key: 'novo_pedido', label: 'Novo Pedido', emoji: '🔔', color: BRAND.colors.secondary },
    { key: 'preparando', label: 'Preparando', emoji: '👨‍🍳', color: '#F59E0B' },
    { key: 'no_forno', label: 'No Forno', emoji: '🔥', color: BRAND.colors.primary },
    { key: 'saiu_entrega', label: 'Pronto p/ Retirar', emoji: '✋', color: '#8B5CF6' },
    { key: 'entregue', label: 'Retirado', emoji: '✅', color: BRAND.colors.success },
    { key: 'cancelado', label: 'Cancelado', emoji: '❌', color: BRAND.colors.muted },
];

// Category display config (aligned with production app)
export const CATEGORY_CONFIG: Record<string, { label: string; emoji: string; order: number }> = {
    tradicional: { label: 'Tradicional', emoji: '🍕', order: 0 },
    especial: { label: 'Especial', emoji: '⭐', order: 1 },
    premium: { label: 'Premium', emoji: '👑', order: 2 },
    doce: { label: 'Doce', emoji: '🍫', order: 3 },
    cafeteria: { label: 'Cafeteria', emoji: '☕', order: 4 },
    bebida: { label: 'Bebidas', emoji: '🥤', order: 5 },
};
