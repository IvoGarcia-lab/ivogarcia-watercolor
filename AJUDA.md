# 📘 Guia de Estratégia: Next.js + Supabase na Hostinger

Este documento resume a arquitetura, o processo de deploy e os "truques" essenciais usados neste projeto ("IvoGarcia Arte") para garantir estabilidade e performance num alojamento partilhado (Hostinger) com base de dados externa (Supabase).

## 1. Stack Tecnológica
*   **Frontend/Framework:** Next.js 15 (App Router).
*   **Estilo:** Tailwind CSS (com variáveis CSS para temas Light/Dark).
*   **Backend/Dados:** Supabase (PostgreSQL, Auth, Storage).
*   **Animações:** WebGL nativo (para o fundo de tinta) e CSS Transitions.

---

## 2. Configuração do Deploy (Hostinger)

Ao criar um novo projeto "Web App" ou "VPS" na Hostinger para Next.js:

1.  **Definições de Compilação:**
    *   **Framework:** Next.js
    *   **Node Version:** 18.x ou 20.x (Recomendado 20.x)
    *   **Build Command:** `npm run build`
    *   **Output Directory:** `.next`
    *   **Root Directory:** `/` (raiz)

2.  **Variáveis de Ambiente (CRÍTICO):**
    São obrigatórias no painel da Hostinger para o site arrancar:
    *   `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto Supabase.
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave pública do Supabase.
    *   `NEXT_PUBLIC_AIML_API_KEY`: (Opcional) Para análise de IA.
    *   `CRON_SECRET`: Uma password forte para proteger o endpoint de manutenção (ex: `minha-chave-secreta-2026`).

---

## 3. A Estratégia "Anti-Hibernação" (Supabase Keep-Alive)

O projeto Supabase (Tier Grátis) "adormece" e desliga-se após 7 dias sem uso. Para evitar isto, implementámos um sistema automático.

### Passo A: O Endpoint (Backend)
Criámos uma rota API (`src/app/api/keep-alive/route.ts`) que faz uma leitura leve à base de dados.
*   **Segurança:** A rota exige um header `Authorization: Bearer <CRON_SECRET>`.
*   **Fallback:** Se a Hostinger falhar a ler a variável de ambiente (erro comum), o código tem um *fallback hardcoded* para garantir que funciona sempre.

### Passo B: O Trigger (GitHub Actions)
A Hostinger bloqueia serviços externos de cron (como cron-job.org) com Erro 403.
**Solução:** Usar **GitHub Actions**.

1.  Ficheiro: `.github/workflows/keep-alive.yml`.
2.  Configuração: Corre a cada 5 dias (`cron: '0 0 */5 * *'`).
3.  Segredo:
    *   No repositório GitHub -> Settings -> Secrets and variables -> Actions.
    *   Criar secret `CRON_SECRET` com o mesmo valor definido no código/Hostinger.

---

## 4. O "Wow Factor" (WebGL & UX)

Para diferenciar o projeto de templates genéricos:
*   **Fundo WebGL:** Em `src/components/WatercolorBackground.tsx`. Usa shaders GLSL para simular fluidos. É muito mais leve que vídeos e mais bonito que Canvas 2D.
*   **Lightbox Inteligente:** Esconde controlos após 5 segundos de inatividade para foco total na arte.
*   **Carrossel 3D:** Implementado com CSS `snap-type` para performance nativa sem bibliotecas pesadas.

## 5. Checklist para Novos Projetos
1.  [ ] Criar repo GitHub e ligar à Hostinger.
2.  [ ] Criar projeto Supabase.
3.  [ ] Copiar `.env` local para as Variáveis da Hostinger.
4.  [ ] **IMPORTANTE:** Definir `CRON_SECRET` na Hostinger E no GitHub Secrets.
5.  [ ] Fazer deploy.
6.  [ ] Testar manualmente o workflow "Keep Supabase Alive" no GitHub Actions.

---

*Copia este ficheiro para a raiz de futuros projetos para não te esqueceres da configuração!* 🚀
