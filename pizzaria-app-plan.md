# Pizzaria App (Quero Um Pedacinho)

## Goal
Criar um **app mobile nativo** (Expo/React Native) que complementa o sistema web existente (app.queroumpedacinho.com.br), oferecendo UX superior para clientes fazerem pedidos via celular, com suporte a Drive-Thru & Balcão com retirada por senha.

## Context
- App web existente em produção (Base44 + Supabase qtrypzzcjebvfcihiynt)
- Nosso projeto é **complementar** — foco no app mobile + admin web aprimorado
- Modelo: Pizzaria Express, venda por **fatia**, Pizzas Napolitanas
- Localização: Marabá/PA
- Categorias reais: Tradicional, Especial, Premium, Doce, Bebida

## Tasks
- [x] Task 1: Inicializar Monorepo (Turborepo + npm workspaces)
- [x] Task 2: Configurar Supabase CLI e schema inicial
- [x] Task 2.1: Conectar Supabase Cloud + RLS + Seed + Types
- [x] Task 3: Inicializar Next.js (Admin Web) em `apps/web`
- [x] Task 4: Inicializar Expo (Mobile App) em `apps/mobile`
- [x] Task 5: Shared package com tipagens e Supabase client
- [x] Task 5.1: Branding aplicado (cores #E74011/#FFDD00, slogans, categorias)
- [x] **Task 8: App Mobile — FOCO PRINCIPAL**
  - [x] 8.1: Setup navegação (Expo Router / React Navigation)
  - [x] 8.2: Tela do Cardápio (filtro por categoria, busca, imagens HD)
  - [x] 8.3: Adição simples na sacola (detalhes p/ próxima versão)
  - [x] 8.4: Carrinho + Resumo do pedido (Integrado ao Supabase)
  - [x] 8.5: Checkout (Balcão) + Geração de senha (Inserção via RLS p/ usuário anônimo)
  - [x] 8.6: Acompanhamento de pedido (Consulta por senha + Supabase Realtime via Channel)
  - [ ] 8.7: Programa de fidelidade (cashback)
- [ ] Task 7: Admin Web (Dashboard + Kanban) — secundário
- [ ] Task 6: Stripe Payments (Edge Functions)
- [ ] Task 9: Integração Realtime (Supabase Realtime)

## Done When
- [ ] App mobile funcional com fluxo: Cardápio → Carrinho → Pedido → Senha → Acompanhamento
- [ ] Admin web com Kanban de pedidos em tempo real
- [ ] Dados alinhados com cardápio real da pizzaria
