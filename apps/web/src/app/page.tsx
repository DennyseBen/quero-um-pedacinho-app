'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { BRAND, CATEGORY_CONFIG, ORDER_STATUS_FLOW } from '@pedacinho/shared';
import type { Product, CartItem, ProductCategory } from '@pedacinho/shared';

type Tab = 'menu' | 'cart' | 'orders';

function formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getCategoryEmoji(category: string): string {
    return CATEGORY_CONFIG[category]?.emoji ?? '🍕';
}

function getProductBgColor(category: string): string {
    const map: Record<string, string> = {
        tradicional: '#FFF3ED',
        especial: '#FFFBEB',
        premium: '#F5F3FF',
        doce: '#FFF0F6',
        cafeteria: '#F0F9FF',
        bebida: '#F0FDF4',
    };
    return map[category] ?? '#F3EDE4';
}

interface ProductCardProps {
    product: Product;
    cartQty: number;
    onAdd: (product: Product) => void;
    onUpdateQty: (id: string, qty: number) => void;
}

function ProductCard({ product, cartQty, onAdd, onUpdateQty }: ProductCardProps) {
    const bgColor = getProductBgColor(product.category);
    const emoji = getCategoryEmoji(product.category);

    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all duration-200 flex flex-col">
            <div
                className="flex items-center justify-center py-6 text-5xl"
                style={{ backgroundColor: bgColor }}
            >
                {emoji}
            </div>
            <div className="p-3 flex flex-col flex-1">
                <p className="font-semibold text-gray-900 text-sm leading-tight mb-1">{product.name}</p>
                {product.description && (
                    <p className="text-xs text-gray-500 leading-snug line-clamp-2 flex-1 mb-2">
                        {product.description}
                    </p>
                )}
                <div className="flex items-center justify-between mt-auto pt-1">
                    <span className="font-display font-bold text-brand-primary text-sm">
                        {formatCurrency(product.price)}
                    </span>
                    {cartQty > 0 ? (
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => onUpdateQty(product.id, cartQty - 1)}
                                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-base transition-colors"
                            >
                                −
                            </button>
                            <span className="font-semibold text-sm w-5 text-center text-gray-900">{cartQty}</span>
                            <button
                                onClick={() => onAdd(product)}
                                className="w-7 h-7 rounded-lg bg-brand-primary hover:bg-brand-primary-hover flex items-center justify-center text-white font-bold text-base transition-colors"
                            >
                                +
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => onAdd(product)}
                            className="w-8 h-8 rounded-xl bg-brand-primary hover:bg-brand-primary-hover flex items-center justify-center text-white font-bold text-xl shadow-sm transition-all active:scale-95"
                        >
                            +
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

interface CartPanelProps {
    cart: CartItem[];
    cartTotal: number;
    placing: boolean;
    onUpdateQty: (id: string, qty: number) => void;
    onCheckout: () => void;
}

function CartPanel({ cart, cartTotal, placing, onUpdateQty, onCheckout }: CartPanelProps) {
    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="text-6xl mb-4">🛒</div>
                <p className="font-display font-bold text-gray-800 text-xl mb-1">Sua sacola está vazia</p>
                <p className="text-gray-500 text-sm">Adicione itens do cardápio para fazer seu pedido</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {cart.map((item) => (
                    <div key={item.product.id} className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                            style={{ backgroundColor: getProductBgColor(item.product.category) }}
                        >
                            {getCategoryEmoji(item.product.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{item.product.name}</p>
                            <p className="text-brand-primary font-bold text-sm">{formatCurrency(item.product.price)}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                                onClick={() => onUpdateQty(item.product.id, item.quantity - 1)}
                                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold transition-colors"
                            >
                                −
                            </button>
                            <span className="font-semibold text-sm w-5 text-center">{item.quantity}</span>
                            <button
                                onClick={() => onUpdateQty(item.product.id, item.quantity + 1)}
                                className="w-7 h-7 rounded-lg bg-brand-primary hover:bg-brand-primary-hover flex items-center justify-center text-white font-bold transition-colors"
                            >
                                +
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t border-gray-100 bg-white px-4 py-4 space-y-3">
                <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                    <span>Taxa de retirada</span>
                    <span className="text-green-600 font-semibold">Grátis</span>
                </div>
                <div className="flex justify-between font-display font-bold text-lg border-t border-gray-100 pt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-brand-primary">{formatCurrency(cartTotal)}</span>
                </div>
                <button
                    onClick={onCheckout}
                    disabled={placing}
                    className="w-full bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-60 text-white font-display font-bold py-4 rounded-2xl shadow-glow-primary transition-all active:scale-95 flex items-center justify-center gap-2 text-base"
                >
                    {placing ? (
                        <>
                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Confirmando...
                        </>
                    ) : (
                        'Confirmar Pedido →'
                    )}
                </button>
                <p className="text-center text-xs text-gray-500">🏪 Retire no balcão ou drive-thru</p>
            </div>
        </div>
    );
}

interface OrdersPanelProps {
    order: Record<string, unknown> | null;
    ticketInput: string;
    searching: boolean;
    onTicketChange: (v: string) => void;
    onSearch: (code: string) => void;
}

function OrdersPanel({ order, ticketInput, searching, onTicketChange, onSearch }: OrdersPanelProps) {
    const currentStatusIndex = order
        ? ORDER_STATUS_FLOW.findIndex((s) => s.key === order.status)
        : -1;

    return (
        <div className="flex flex-col gap-4 px-4 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <p className="text-blue-800 text-sm font-medium">
                    💡 Ao confirmar seu pedido você recebe uma senha. Use-a para acompanhar o status em tempo real.
                </p>
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={ticketInput}
                    onChange={(e) => onTicketChange(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && onSearch(ticketInput)}
                    placeholder="Sua senha (ex: A123)"
                    className="flex-1 bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
                <button
                    onClick={() => onSearch(ticketInput)}
                    disabled={searching || !ticketInput.trim()}
                    className="bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 text-white font-bold px-5 py-3 rounded-2xl transition-all"
                >
                    {searching ? (
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        '🔍'
                    )}
                </button>
            </div>

            {order && (
                <div className="bg-[#1A1A1A] rounded-3xl p-5 animate-scale-in">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-400 text-xs uppercase tracking-widest mb-0.5">Senha do pedido</p>
                            <p className="font-display font-black text-4xl text-white tracking-wider">
                                {order.ticket_code as string}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="fire-pulse text-2xl">🔥</span>
                            <span className="text-gray-400 text-xs">
                                {formatCurrency(order.total_amount as number)}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {ORDER_STATUS_FLOW.filter((s) => s.key !== 'cancelado').map((step, idx) => {
                            const isCompleted = idx < currentStatusIndex;
                            const isCurrent = idx === currentStatusIndex;

                            return (
                                <div key={step.key} className="flex items-center gap-3">
                                    <div
                                        className={`w-9 h-9 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0 transition-all ${
                                            isCurrent
                                                ? 'bg-white ring-2 ring-brand-secondary scale-110'
                                                : isCompleted
                                                ? 'bg-brand-primary'
                                                : 'bg-[#333]'
                                        }`}
                                    >
                                        {isCurrent ? (
                                            <span>{step.emoji}</span>
                                        ) : isCompleted ? (
                                            <span className="text-white text-sm">✓</span>
                                        ) : (
                                            <span className="opacity-40">{step.emoji}</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p
                                                className={`font-semibold text-sm ${
                                                    isCurrent
                                                        ? 'text-white'
                                                        : isCompleted
                                                        ? 'text-gray-400 line-through'
                                                        : 'text-gray-600'
                                                }`}
                                            >
                                                {step.label}
                                            </p>
                                            {isCurrent && (
                                                <span className="bg-brand-secondary text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                    AGORA
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {order.status === 'cancelado' && (
                            <div className="bg-red-900/30 border border-red-700 rounded-xl p-3 text-center">
                                <p className="text-red-400 font-semibold text-sm">❌ Pedido cancelado</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-gray-500 text-xs text-center">
                            Atualizando em tempo real ·{' '}
                            {new Date(order.created_at as string).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CustomerApp() {
    const [tab, setTab] = useState<Tab>('menu');
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [category, setCategory] = useState<ProductCategory | 'ALL'>('ALL');
    const [search, setSearch] = useState('');
    const [ticketInput, setTicketInput] = useState('');
    const [order, setOrder] = useState<Record<string, unknown> | null>(null);
    const [searching, setSearching] = useState(false);
    const [placing, setPlacing] = useState(false);

    const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
    const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

    useEffect(() => {
        supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('category')
            .then(({ data }) => {
                if (data) setProducts(data as Product[]);
            });
    }, []);

    useEffect(() => {
        if (!order?.id) return;
        const ch = supabase
            .channel(`order-${order.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `id=eq.${order.id}`,
                },
                (payload) => {
                    setOrder((prev) =>
                        prev ? { ...prev, ...payload.new } : (payload.new as Record<string, unknown>)
                    );
                }
            )
            .subscribe();
        return () => {
            supabase.removeChannel(ch);
        };
    }, [order?.id]);

    const filtered = useMemo(
        () =>
            products.filter((p) => {
                const catOk = category === 'ALL' || p.category === category;
                const q = search.toLowerCase();
                const searchOk =
                    !q ||
                    p.name.toLowerCase().includes(q) ||
                    (p.description?.toLowerCase().includes(q) ?? false);
                return catOk && searchOk;
            }),
        [products, category, search]
    );

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const ex = prev.find((i) => i.product.id === product.id);
            return ex
                ? prev.map((i) =>
                      i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
                  )
                : [...prev, { product, quantity: 1 }];
        });
    };

    const updateQty = (id: string, qty: number) => {
        if (qty <= 0) setCart((prev) => prev.filter((i) => i.product.id !== id));
        else setCart((prev) => prev.map((i) => (i.product.id === id ? { ...i, quantity: qty } : i)));
    };

    const checkout = async () => {
        if (!cart.length || placing) return;
        setPlacing(true);
        try {
            const ticket_code = `A${Math.floor(100 + Math.random() * 900)}`;
            const { data: newOrder, error } = await supabase
                .from('orders')
                .insert({
                    total_amount: cartTotal,
                    ticket_code,
                    pickup_mode: 'balcao',
                    payment_method: 'na_retirada',
                    status: 'novo_pedido',
                })
                .select()
                .single();
            if (error) throw error;
            await supabase.from('order_items').insert(
                cart.map((i) => ({
                    order_id: newOrder.id,
                    product_id: i.product.id,
                    quantity: i.quantity,
                    price_at_time: i.product.price,
                }))
            );
            setCart([]);
            setOrder(newOrder);
            setTicketInput(ticket_code);
            setTab('orders');
        } catch (e: unknown) {
            alert('Erro ao confirmar: ' + (e as Error).message);
        } finally {
            setPlacing(false);
        }
    };

    const searchOrder = async (code: string) => {
        if (!code.trim()) return;
        setSearching(true);
        const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('ticket_code', code.trim().toUpperCase())
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        setOrder((data as Record<string, unknown>) || null);
        if (!data) alert('Pedido não encontrado. Verifique a senha e tente novamente.');
        setSearching(false);
    };

    const categories = Object.entries(CATEGORY_CONFIG).sort((a, b) => a[1].order - b[1].order);

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#F3EDE4' }}>
            {/* ─── MOBILE LAYOUT (< lg) ─── */}
            <div className="lg:hidden flex flex-col h-screen relative">
                {/* Header */}
                <header className="bg-brand-primary px-4 pt-5 pb-3 flex-shrink-0">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h1 className="font-display font-black text-white text-lg leading-tight">{BRAND.name}</h1>
                            <p className="text-white/80 text-xs">{BRAND.tagline} · {BRAND.serviceMode}</p>
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-sm" />
                    </div>
                    {tab === 'menu' && (
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar pizzas, bebidas..."
                                className="w-full bg-white/95 text-gray-800 placeholder-gray-400 rounded-2xl pl-9 pr-4 py-2.5 text-sm focus:outline-none"
                            />
                        </div>
                    )}
                </header>

                {/* Category chips */}
                {tab === 'menu' && (
                    <div className="flex-shrink-0 bg-white border-b border-gray-100 px-3 py-2">
                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                            <button
                                onClick={() => setCategory('ALL')}
                                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                    category === 'ALL'
                                        ? 'bg-brand-primary text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                🍽️ Todos
                            </button>
                            {categories.map(([key, cfg]) => (
                                <button
                                    key={key}
                                    onClick={() => setCategory(key as ProductCategory)}
                                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                        category === key
                                            ? 'bg-brand-primary text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {cfg.emoji} {cfg.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tab content */}
                <main className="flex-1 overflow-y-auto">
                    {tab === 'menu' && (
                        <div className="grid grid-cols-2 gap-3 p-3">
                            {products.length === 0 && (
                                <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center">
                                    <div className="text-5xl mb-3">🍕</div>
                                    <p className="text-gray-500 text-sm">Carregando cardápio...</p>
                                </div>
                            )}
                            {filtered.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    cartQty={cart.find((i) => i.product.id === product.id)?.quantity ?? 0}
                                    onAdd={addToCart}
                                    onUpdateQty={updateQty}
                                />
                            ))}
                            {filtered.length === 0 && products.length > 0 && (
                                <div className="col-span-2 text-center py-12 text-gray-400">
                                    <div className="text-4xl mb-2">🔎</div>
                                    <p className="text-sm">Nenhum produto encontrado</p>
                                </div>
                            )}
                        </div>
                    )}

                    {tab === 'cart' && (
                        <CartPanel
                            cart={cart}
                            cartTotal={cartTotal}
                            placing={placing}
                            onUpdateQty={updateQty}
                            onCheckout={checkout}
                        />
                    )}

                    {tab === 'orders' && (
                        <OrdersPanel
                            order={order}
                            ticketInput={ticketInput}
                            searching={searching}
                            onTicketChange={setTicketInput}
                            onSearch={searchOrder}
                        />
                    )}
                </main>

                {/* Floating cart button */}
                {tab === 'menu' && cartCount > 0 && (
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 animate-slide-up pointer-events-none">
                        <button
                            onClick={() => setTab('cart')}
                            className="pointer-events-auto bg-brand-primary text-white font-display font-bold px-8 py-3.5 rounded-full shadow-glow-primary flex items-center gap-3 text-sm"
                        >
                            <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-xs font-black">
                                {cartCount}
                            </span>
                            Ver sacola
                            <span className="opacity-80">{formatCurrency(cartTotal)}</span>
                        </button>
                    </div>
                )}

                {/* Bottom navigation */}
                <nav className="flex-shrink-0 bg-white border-t border-gray-200 flex items-stretch">
                    <button
                        onClick={() => setTab('menu')}
                        className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors ${
                            tab === 'menu' ? 'text-brand-primary' : 'text-gray-400'
                        }`}
                    >
                        <span className="text-xl">🍕</span>
                        <span className="text-[10px] font-semibold">Cardápio</span>
                    </button>
                    <button
                        onClick={() => setTab('cart')}
                        className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors relative ${
                            tab === 'cart' ? 'text-brand-primary' : 'text-gray-400'
                        }`}
                    >
                        <span className="text-xl">🛒</span>
                        <span className="text-[10px] font-semibold">Sacola</span>
                        {cartCount > 0 && (
                            <span className="absolute top-2 right-[calc(50%-18px)] bg-brand-primary text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                                {cartCount > 9 ? '9+' : cartCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setTab('orders')}
                        className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors ${
                            tab === 'orders' ? 'text-brand-primary' : 'text-gray-400'
                        }`}
                    >
                        <span className="text-xl">📋</span>
                        <span className="text-[10px] font-semibold">Pedidos</span>
                    </button>
                </nav>
            </div>

            {/* ─── DESKTOP LAYOUT (≥ lg) ─── */}
            <div className="hidden lg:block min-h-screen">
                {/* Sticky header */}
                <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
                        <div className="flex items-center gap-3 flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                            <div>
                                <h1 className="font-display font-black text-gray-900 text-lg leading-none">
                                    {BRAND.name}
                                </h1>
                                <p className="text-gray-500 text-xs">{BRAND.tagline}</p>
                            </div>
                        </div>
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar pizzas, bebidas..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                                />
                            </div>
                        </div>
                        <nav className="flex items-center gap-1 ml-auto">
                            <button
                                onClick={() => setTab('menu')}
                                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                                    tab === 'menu'
                                        ? 'bg-brand-primary text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                🍕 Cardápio
                            </button>
                            <button
                                onClick={() => setTab('orders')}
                                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                                    tab === 'orders'
                                        ? 'bg-brand-primary text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                📋 Pedidos
                            </button>
                        </nav>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto px-6 py-6">
                    {tab === 'menu' && (
                        <div className="flex gap-6">
                            {/* Left: menu */}
                            <div className="flex-1 min-w-0">
                                {/* Category chips */}
                                <div className="flex gap-2 flex-wrap mb-6">
                                    <button
                                        onClick={() => setCategory('ALL')}
                                        className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                                            category === 'ALL'
                                                ? 'bg-brand-primary text-white shadow-sm'
                                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                    >
                                        🍽️ Todos
                                    </button>
                                    {categories.map(([key, cfg]) => (
                                        <button
                                            key={key}
                                            onClick={() => setCategory(key as ProductCategory)}
                                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                                                category === key
                                                    ? 'bg-brand-primary text-white shadow-sm'
                                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                        >
                                            {cfg.emoji} {cfg.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Product grid */}
                                {products.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-24">
                                        <div className="text-6xl mb-4">🍕</div>
                                        <p className="text-gray-500">Carregando cardápio...</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-4">
                                        {filtered.map((product) => (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                                cartQty={
                                                    cart.find((i) => i.product.id === product.id)?.quantity ?? 0
                                                }
                                                onAdd={addToCart}
                                                onUpdateQty={updateQty}
                                            />
                                        ))}
                                        {filtered.length === 0 && (
                                            <div className="col-span-3 text-center py-16 text-gray-400">
                                                <div className="text-5xl mb-3">🔎</div>
                                                <p>Nenhum produto encontrado</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Right: sticky cart sidebar */}
                            <div className="flex-shrink-0 w-80">
                                <div className="sticky top-24 bg-white rounded-3xl shadow-card overflow-hidden">
                                    <div className="bg-brand-primary px-5 py-4 flex items-center justify-between">
                                        <h2 className="font-display font-bold text-white text-lg">Sua Sacola</h2>
                                        {cartCount > 0 && (
                                            <span className="bg-white/20 text-white text-xs font-black px-2.5 py-1 rounded-full">
                                                {cartCount} {cartCount === 1 ? 'item' : 'itens'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="max-h-[60vh] overflow-y-auto">
                                        <CartPanel
                                            cart={cart}
                                            cartTotal={cartTotal}
                                            placing={placing}
                                            onUpdateQty={updateQty}
                                            onCheckout={checkout}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'orders' && (
                        <div className="max-w-xl mx-auto">
                            <h2 className="font-display font-bold text-gray-900 text-2xl mb-6">
                                Acompanhar Pedido
                            </h2>
                            <OrdersPanel
                                order={order}
                                ticketInput={ticketInput}
                                searching={searching}
                                onTicketChange={setTicketInput}
                                onSearch={searchOrder}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
