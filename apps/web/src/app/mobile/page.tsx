'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import {
    BRAND,
    CATEGORY_CONFIG,
    Product,
    ORDER_STATUS_FLOW,
    ProductCategory,
    CartItem
} from '@pedacinho/shared';

// UI Components
interface TabProps {
    active: boolean;
    label: string;
    emoji: string;
    onClick: () => void;
}

const TabButton = ({ active, label, emoji, onClick }: TabProps) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${active ? 'text-brand-primary' : 'text-gray-500'}`}
    >
        <span className="text-xl mb-0.5">{emoji}</span>
        <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
    </button>
);

export default function MobilePreview() {
    const [activeTab, setActiveTab] = useState<'menu' | 'cart' | 'orders'>('menu');
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<ProductCategory | 'ALL'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // Orders logic
    const [ticketSearch, setTicketSearch] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [currentOrder, setCurrentOrder] = useState<any | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    // Stats
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    useEffect(() => {
        async function fetchProducts() {
            const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
            if (data) setProducts(data as Product[]);
        }
        fetchProducts();
    }, []);

    // Real-time subscription for orders
    useEffect(() => {
        if (!currentOrder?.id) return;

        const channel = supabase
            .channel(`order-${currentOrder.id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `id=eq.${currentOrder.id}`
            }, (payload) => {
                setCurrentOrder(payload.new);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel).catch(() => { }); };
    }, [currentOrder?.id]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesCategory = activeCategory === 'ALL' || p.category === activeCategory;
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [products, activeCategory, searchQuery]);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        try {
            const ticket_code = `M${Math.floor(100 + Math.random() * 900)}`;

            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    total_amount: cartTotal,
                    ticket_code,
                    pickup_mode: 'balcao',
                    payment_method: 'na_retirada',
                    status: 'novo_pedido'
                })
                .select()
                .single();

            if (orderError) throw orderError;

            const orderItems = cart.map(item => ({
                order_id: order.id,
                product_id: item.product.id,
                quantity: item.quantity,
                price_at_time: item.product.price
            }));

            const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
            if (itemsError) throw itemsError;

            alert(`Pedido Realizado! Senha: ${ticket_code}`);
            setCart([]);
            setTicketSearch(ticket_code);
            handleSearchOrder(ticket_code);
            setActiveTab('orders');

        } catch (err: unknown) {
            const error = err as Error;
            alert('Erro ao finalizar: ' + error.message);
        }
    };

    const handleSearchOrder = async (code: string) => {
        setIsSearching(true);
        const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('ticket_code', code.toUpperCase())
            .gt('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (data) {
            setCurrentOrder(data);
        } else {
            alert('Pedido não encontrado para hoje.');
        }
        setIsSearching(false);
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-[#F3EDE4] text-[#1A1A1A]">
            {/* Container Mobile emulado */}
            <div className="w-full max-w-[450px] min-h-screen bg-[#F3EDE4] shadow-2xl relative flex flex-col">

                {/* Header */}
                <header className="bg-brand-primary p-4 pb-8 flex flex-col gap-4 rounded-b-[40px] shadow-lg sticky top-0 z-40">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-2xl shadow-sm rotate-3">
                                <span className="text-2xl">🍕</span>
                            </div>
                            <div className="text-white">
                                <h1 className="font-display font-bold text-lg leading-tight">{BRAND.name}</h1>
                                <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">{BRAND.tagline}</p>
                            </div>
                        </div>
                        <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                            <span className="text-sm">🔔</span>
                        </div>
                    </div>

                    {activeTab === 'menu' && (
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="O que vamos pedir hoje?"
                                className="w-full h-12 bg-white rounded-2xl px-5 text-sm font-medium shadow-sm focus:outline-none placeholder:text-gray-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <span className="absolute right-4 top-3.5 text-gray-400 font-bold">🔍</span>
                        </div>
                    )}
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto px-4 pt-6 pb-24">

                    {/* MENU TAB */}
                    {activeTab === 'menu' && (
                        <div className="animate-fade-in">
                            {/* Categories */}
                            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 mb-4">
                                <button
                                    onClick={() => setActiveCategory('ALL')}
                                    className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${activeCategory === 'ALL' ? 'bg-brand-primary text-white shadow-glow-primary' : 'bg-white text-gray-500 border border-[#F0E8DC]'}`}
                                >
                                    TUDO 🔥
                                </button>
                                {Object.entries(CATEGORY_CONFIG).map(([key, cat]) => (
                                    <button
                                        key={key}
                                        onClick={() => setActiveCategory(key as ProductCategory)}
                                        className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${activeCategory === key ? 'bg-brand-primary text-white shadow-glow-primary' : 'bg-white text-gray-500 border border-[#F0E8DC]'}`}
                                    >
                                        <span>{cat.emoji}</span>
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            {/* Products Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {filteredProducts.map(product => (
                                    <div key={product.id} className="bg-white rounded-[24px] p-3 border border-[#F0E8DC] shadow-sm flex flex-col group overflow-hidden active:scale-95 transition-transform">
                                        <div className="w-full aspect-square bg-[#FFF9F0] rounded-2xl mb-3 items-center justify-center flex text-4xl relative overflow-hidden">
                                            <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            {CATEGORY_CONFIG[product.category as ProductCategory]?.emoji || '🍕'}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-[13px] leading-tight mb-1 line-clamp-1">{product.name}</h4>
                                            <p className="text-[10px] text-gray-400 line-clamp-2 mb-2 leading-relaxed">{product.description}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="font-bold text-brand-primary text-[14px]">R$ {product.price.toFixed(2)}</span>
                                            <button
                                                onClick={() => addToCart(product)}
                                                className="bg-brand-primary w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-lg active:bg-brand-primary-hover"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CART TAB */}
                    {activeTab === 'cart' && (
                        <div className="animate-fade-in flex flex-col h-full">
                            <h3 className="font-display font-bold text-2xl mb-6">Minha Sacola 🛍️</h3>

                            {cart.length === 0 ? (
                                <div className="bg-white rounded-3xl p-8 border border-[#F0E8DC] items-center justify-center flex flex-col text-center opacity-60 mt-10">
                                    <span className="text-5xl mb-4">🛒</span>
                                    <p className="font-bold text-gray-400">Sua sacola está vazia.</p>
                                    <button onClick={() => setActiveTab('menu')} className="mt-4 text-brand-primary font-bold text-sm">Explorar o Cardápio →</button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col gap-3 mb-6">
                                        {cart.map(item => (
                                            <div key={item.product.id} className="bg-white p-4 rounded-2xl border border-[#F0E8DC] flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#FFF9F0] rounded-xl flex items-center justify-center text-xl">
                                                    {CATEGORY_CONFIG[item.product.category as ProductCategory]?.emoji || '🍕'}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-sm">{item.product.name}</p>
                                                    <p className="text-xs text-brand-primary font-bold">R$ {item.product.price.toFixed(2)}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-gray-400">x{item.quantity}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-white rounded-3xl p-6 border border-[#F0E8DC] shadow-sm mt-auto">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-400 text-sm font-medium">Subtotal</span>
                                            <span className="font-bold">R$ {cartTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-6">
                                            <span className="text-gray-400 text-sm font-medium">Taxa de entrega</span>
                                            <span className="text-emerald-500 font-bold text-xs uppercase">Grátis</span>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-[#F0E8DC] pt-4 mb-6">
                                            <span className="font-bold text-lg">Total</span>
                                            <span className="font-display font-bold text-2xl text-brand-primary">R$ {cartTotal.toFixed(2)}</span>
                                        </div>

                                        <button
                                            onClick={handleCheckout}
                                            className="w-full bg-brand-primary py-4 rounded-2xl text-white font-bold text-lg shadow-glow-primary active:bg-brand-primary-hover"
                                        >
                                            Finalizar Pedido
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ORDERS TAB */}
                    {activeTab === 'orders' && (
                        <div className="animate-fade-in">
                            <h3 className="font-display font-bold text-2xl mb-6">Meus Pedidos 📋</h3>

                            {/* Search Bar */}
                            <div className="bg-white p-2 rounded-3xl border border-[#F0E8DC] flex items-center gap-2 mb-8 pr-1">
                                <input
                                    type="text"
                                    placeholder="Digite sua senha (Ex: A001)"
                                    className="flex-1 h-12 px-4 text-sm font-bold uppercase focus:outline-none placeholder:lowercase"
                                    value={ticketSearch}
                                    onChange={(e) => setTicketSearch(e.target.value)}
                                />
                                <button
                                    onClick={() => handleSearchOrder(ticketSearch)}
                                    disabled={isSearching}
                                    className="bg-[#1A1A1A] px-6 h-11 rounded-2xl text-white font-bold text-sm active:opacity-80 disabled:opacity-50"
                                >
                                    {isSearching ? '...' : 'BUSCAR'}
                                </button>
                            </div>

                            {currentOrder ? (
                                <div className="bg-[#1A1A1A] rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
                                    <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-brand-primary opacity-20 blur-[50px] rounded-full" />

                                    <div className="flex items-center justify-between mb-8 relative z-10">
                                        <div>
                                            <p className="text-brand-secondary text-[10px] font-bold tracking-widest uppercase mb-1">Status do Pedido</p>
                                            <h4 className="text-3xl font-display font-black tracking-tight">{currentOrder.ticket_code}</h4>
                                        </div>
                                        <div className="bg-brand-primary p-3 rounded-2xl shadow-glow-primary fire-pulse">
                                            <span className="text-2xl">🔥</span>
                                        </div>
                                    </div>

                                    {/* Steps */}
                                    <div className="flex flex-col gap-6 relative z-10">
                                        {ORDER_STATUS_FLOW.map((status, index) => {
                                            const statuses = ORDER_STATUS_FLOW.map(s => s.key);
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            const currentStatus = currentOrder.status as any;
                                            const currentIndex = statuses.indexOf(currentStatus);
                                            const isCompleted = index < currentIndex;
                                            const isCurrent = index === currentIndex;

                                            return (
                                                <div key={status.key} className="flex items-center gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isCompleted ? 'bg-brand-primary border-brand-primary' :
                                                                isCurrent ? 'bg-white border-white scale-110 shadow-lg' :
                                                                    'bg-transparent border-[#333]'
                                                            }`}>
                                                            {isCompleted ? <span className="text-white text-xs font-bold">✓</span> :
                                                                isCurrent ? <span className="text-[#1A1A1A] text-xs font-bold">{index + 1}</span> :
                                                                    <span className="text-[#333] text-xs leading-none font-bold">{index + 1}</span>}
                                                        </div>
                                                        {index < ORDER_STATUS_FLOW.length - 1 && (
                                                            <div className={`w-0.5 h-10 mt-1 ${isCompleted ? 'bg-brand-primary' : 'bg-[#333]'}`} />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm font-bold ${isCurrent ? 'text-white' : isCompleted ? 'text-brand-primary opacity-80' : 'text-gray-600'}`}>
                                                            {status.label}
                                                            {isCurrent && <span className="ml-2 bg-brand-secondary text-[#1A1A1A] text-[8px] font-black px-1.5 py-0.5 rounded-md align-middle">AGORA</span>}
                                                        </p>
                                                        {isCurrent && <p className="text-[10px] text-gray-400 mt-1">Seu pedido está {status.label.toLowerCase()}...</p>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-3xl p-8 border border-[#F0E8DC] items-center justify-center flex flex-col text-center opacity-60">
                                    <span className="text-5xl mb-4">🕵️</span>
                                    <p className="font-bold text-gray-400 leading-tight">Busque pelo código impresso no seu ticket ou tela de confirmação.</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>

                {/* Navigation Bar */}
                <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F0E8DC] flex items-center justify-around h-20 px-4 rounded-t-[32px] shadow-[0_-8px_32px_rgba(0,0,0,0.05)] z-50 max-w-[450px] mx-auto">
                    <TabButton active={activeTab === 'menu'} label="Cardápio" emoji="🍕" onClick={() => setActiveTab('menu')} />
                    <div className="relative flex justify-center items-center flex-1">
                        <button
                            onClick={() => setActiveTab('cart')}
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg absolute -top-10 border-4 border-[#F3EDE4] ${activeTab === 'cart' ? 'bg-[#1A1A1A] -translate-y-2' : 'bg-brand-primary'}`}
                        >
                            <span className="text-2xl">🛍️</span>
                            {cartCount > 0 && (
                                <div className="absolute -top-1 -right-1 bg-[#1A1A1A] border-2 border-[#F3EDE4] min-w-[20px] h-[20px] rounded-full flex items-center justify-center px-1">
                                    <span className="text-white text-[9px] font-black">{cartCount}</span>
                                </div>
                            )}
                        </button>
                    </div>
                    <TabButton active={activeTab === 'orders'} label="Pedidos" emoji="📋" onClick={() => setActiveTab('orders')} />
                </nav>

                <div className="h-24 shrink-0" />
            </div>
        </div>
    );
}
