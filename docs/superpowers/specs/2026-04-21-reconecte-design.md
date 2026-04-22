# Reconecte — Design Spec
**Data:** 2026-04-21
**Produto:** App de trilhas terapêuticas para casais e indivíduos
**Gestora/Terapeuta:** Karinne Bruno (neuropsicóloga e terapeuta de casais)

---

## 1. Visão Geral

Reconecte é um Progressive Web App (PWA) que oferece trilhas de aprendizado terapêutico para pessoas que querem melhorar seus relacionamentos. O produto principal são as trilhas gratuitas (com algumas premium no futuro). O produto secundário é o agendamento de sessões de orientação individual com a terapeuta, cobrado separadamente via Stripe.

---

## 2. Personas

| Persona | Descrição |
|---|---|
| **Usuário** | Pessoa (individual) com dificuldades no relacionamento. Pode vincular conta ao parceiro(a) opcionalmente. |
| **Gestora** | Karinne — acesso admin completo: gerencia trilhas, agenda, mensagens e visualiza dados. |

---

## 3. Stack Técnica

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Animações | Framer Motion |
| Backend/Auth | Supabase (Auth, Postgres, Storage, Realtime) |
| Pagamento | Stripe (sessões de orientação) |
| Agenda | Google Calendar API via OAuth |
| Deploy | Vercel (frontend) + Supabase Cloud |
| PWA | next-pwa — instalável na tela inicial do celular |

---

## 4. Design Language

**Paleta (Manual de Marca oficial):**
| Token | Nome | Hex |
|---|---|---|
| `color-black` | Preto Profundo | #0D0D14 |
| `color-black-blue` | Preto Azulado | #1A1A2E |
| `color-lilac` | Lilás | #A78BCC |
| `color-white-ice` | Branco Gelo | #F9F8FC |
| `color-lilac-light` | Lilás Claro | #D4BBEE |
| `color-lilac-dark` | Lilás Escuro | #6B4FA0 |
| `color-gray` | Cinza | #7A7A8C |
| `color-lavender` | Lavanda Suave | #F2EFF8 |
| `color-white` | Branco | #FFFFFF |

**Tipografia (Manual de Marca oficial):**
- Títulos/Display: **Cormorant Garamond** (serif) — Light 56px display, Medium 32px títulos
- Corpo/Interface: **Lato** (sans-serif) — Light 13px subtítulos, Regular 15px corpo, Regular 13px botões

**Estilo:** Minimalista elegante. Linhas suaves, formas circulares, ornamentos delicados.
Inspirado em Duolingo (gamificação/trilhas) e Fabulous (bem-estar/hábitos).
**Elementos pretos:** Header, cards de destaque (agendamento), contrastes.
**Animações:** Transições suaves, feedback visual em progresso e conquistas.
**Tom de voz:** Acolhedor, científico e transformador. Linguagem clara, primeira pessoa, sem jargões.

---

## 5. Fluxo Principal do Usuário Novo

```
Landing Page
    ↓
Quiz de diagnóstico (3 perguntas sobre a situação atual)
    ↓
Tela de resultado: "Sua trilha terapêutica foi traçada"
(trilha recomendada + breve descrição, salva em sessão do browser)
    ↓
CTA: "Quero começar minha jornada" → Cadastro / Login
    ↓
Home com trilha já ativa (associada automaticamente ao cadastro)
```

---

## 6. Telas & Funcionalidades

### 6.1 Área Pública (sem login)

- **Landing page:** Apresentação do produto, benefícios, CTA para iniciar o quiz
- **Quiz de diagnóstico:** 3 perguntas (situação atual, maior desafio, objetivo)
- **Resultado do quiz:** Trilha recomendada + botão para criar conta

### 6.2 Área do Usuário (autenticado)

#### Home / Dashboard
- Saudação personalizada
- Trilha ativa com barra de progresso (módulo e lição atual)
- Desafio do dia vinculado à trilha ativa
- Streak (dias consecutivos de atividade)
- Card discreto de CTA: "Agendar sessão de orientação"

#### Trilhas de Aprendizado
- Lista de trilhas disponíveis (gratuitas + premium bloqueadas)
- Cada trilha: ícone, título, número de módulos/lições, barra de progresso
- Estrutura: Trilha → Módulos → Lições
- Tipos de lição: texto + imagem, quiz (múltipla escolha), exercício prático
- Conteúdo JSON flexível por tipo de lição

#### Lição Individual
- Conteúdo da lição (texto, quiz ou exercício)
- Navegação anterior/próximo
- Marcação de conclusão
- Animação de celebração ao completar módulo

#### Agendar Sessão de Orientação
- Calendário com horários disponíveis (via Google Calendar API)
- Seleção de data/hora
- Checkout Stripe
- Confirmação por email

#### Registro de Humor (Diário)
- Acessível pela Home com um toque discreto ("Como você está hoje?")
- Usuário seleciona um emoji de humor (5 opções: muito mal → muito bem)
- Campo opcional de texto livre: "O que aconteceu hoje?"
- Histórico em calendário: cada dia colorido pelo humor registrado
- A gestora pode visualizar o histórico de humor dos usuários no painel admin (com consentimento)

#### Mensagens
- Chat em tempo real com a gestora (Supabase Realtime)
- Lista de conversas

#### Perfil
- Dados pessoais
- Vínculo com parceiro(a): gerar link de convite / aceitar convite (opcional, não obrigatório)
- Preferências de notificação

### 6.3 Área da Gestora (admin)

- **Dashboard:** métricas (usuários ativos, agendamentos, receita)
- **Trilhas:** criar, editar, reordenar módulos e lições; publicar/despublicar
- **Agenda:** definir disponibilidade no Google Calendar, visualizar agendamentos
- **Mensagens:** inbox com todos os usuários
- **Usuários:** lista, status, vínculo de casais

---

## 7. Modelo de Dados (Supabase Postgres)

```sql
users
  id uuid PK
  nome text
  email text
  avatar_url text
  partner_id uuid FK → users.id (nullable)
  created_at timestamptz

tracks
  id uuid PK
  titulo text
  descricao text
  icone text
  ordem int
  is_premium boolean
  is_published boolean
  created_at timestamptz

modules
  id uuid PK
  track_id uuid FK → tracks.id
  titulo text
  ordem int

lessons
  id uuid PK
  module_id uuid FK → modules.id
  tipo text  -- 'texto' | 'quiz' | 'exercicio'
  conteudo jsonb
  -- tipo='texto':    { "blocos": [{ "tipo": "paragrafo"|"imagem"|"destaque", "valor": "..." }] }
  -- tipo='quiz':     { "pergunta": "...", "opcoes": ["a","b","c"], "resposta_correta": 0, "explicacao": "..." }
  -- tipo='exercicio':{ "instrucao": "...", "reflexao": "...", "campo_resposta": true|false }
  ordem int

user_progress
  id uuid PK
  user_id uuid FK → users.id
  lesson_id uuid FK → lessons.id
  completed_at timestamptz

streaks
  user_id uuid PK FK → users.id
  current_streak int
  last_activity_date date

daily_challenges
  id uuid PK
  track_id uuid FK → tracks.id
  texto text
  data date
  -- O desafio exibido na Home é o daily_challenge cuja track_id corresponde
  -- à trilha ativa do usuário (primeira trilha com progresso incompleto).
  -- Se não houver desafio para a data atual, exibe o mais recente da trilha.

mood_entries
  id uuid PK
  user_id uuid FK → users.id
  humor int  -- 1 (muito mal) a 5 (muito bem)
  emoji text -- '😢' | '😔' | '😐' | '🙂' | '😄'
  nota text  -- texto livre opcional
  data date
  created_at timestamptz

appointments
  id uuid PK
  user_id uuid FK → users.id
  data_hora timestamptz
  status text  -- 'pending' | 'confirmed' | 'cancelled'
  stripe_payment_id text
  google_event_id text
  created_at timestamptz

messages
  id uuid PK
  sender_id uuid FK → users.id
  receiver_id uuid FK → users.id
  conteudo text
  lida boolean
  created_at timestamptz
```

---

## 8. Integrações

### Google Calendar
- OAuth da gestora para conectar sua agenda
- Leitura de disponibilidade (slots livres)
- Criação de evento ao confirmar agendamento (com link de videochamada opcional)

### Stripe
- Checkout para sessão de orientação (produto único, preço fixo definido pela gestora)
- Webhook para confirmar pagamento e atualizar status do agendamento

### PWA
- `manifest.json` com nome, ícones, cores do tema
- Service worker para cache offline das trilhas
- Instrução de instalação exibida na primeira visita mobile ("Adicionar à tela inicial")

---

## 9. Permissões

| Recurso | Usuário | Gestora |
|---|---|---|
| Ver trilhas públicas | ✅ | ✅ |
| Fazer lições | ✅ | ✅ |
| Ver trilhas premium | ❌ (futuro: assinar) | ✅ |
| Agendar sessão | ✅ | — |
| Enviar mensagem | ✅ | ✅ |
| Criar/editar trilhas | ❌ | ✅ |
| Ver painel admin | ❌ | ✅ |
| Definir disponibilidade | ❌ | ✅ |

Controle via Supabase Row Level Security (RLS) + campo `role` no perfil do usuário.

---

## 10. Notificações

- **Push (PWA):** lembrete diário para fazer o desafio do dia, alerta de mensagem nova
- **In-app:** badge no ícone de mensagens, confirmação de agendamento
- **Email:** confirmação de cadastro, confirmação de agendamento + recibo Stripe

---

## 11. Milestones de Desenvolvimento

| # | Milestone | Escopo | Estimativa |
|---|---|---|---|
| M1 | Fundação | Setup Next.js + Supabase + Tailwind + PWA, design system, banco de dados, deploy Vercel | ~3 dias |
| M2 | Onboarding & Auth | Landing page, quiz, tela de resultado, cadastro/login, redirecionamento com trilha pré-selecionada | ~2 dias |
| M3 | Trilhas & Humor | Tela de trilhas, módulos, lições, progresso, streak, desafio diário, vínculo de casal, registro de humor (diário de emojis + histórico em calendário) | ~4 dias |
| M4 | Agendamento & Pagamento | Google Calendar integration, seleção de horário, checkout Stripe, confirmação email | ~3 dias |
| M5 | Chat & Notificações | Mensagens Supabase Realtime, push notifications PWA, notificações in-app | ~2 dias |
| M6 | Painel Admin | Dashboard métricas, gerenciamento de trilhas, inbox, gerenciamento de agenda | ~2 dias |
| M7 | Polish & PWA | Animações Framer Motion, instrução instalação mobile, testes, responsividade | ~1 dia |

**Total estimado: ~17 dias**
