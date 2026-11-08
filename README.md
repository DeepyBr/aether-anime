# Aether Anime (Powered by Otakulogia Engine)

Uma plataforma web moderna de streaming e catálogo de animes inspirada nas funcionalidades do **Otakulogia.com**, com identidade visual Cyberpunk Neon / Synthwave baseada no **Aether-App** (paleta Ciano Neon `#00f0ff`, Magenta Elétrico `#ff007f`, Obsidian Dark `#070611` e efeitos de iluminação e bordas duplas glow).

---

## 🚀 Funcionalidades Recriadas do Otakulogia

1. **Catálogo & Gêneros Completos (Mais de 4.350 Animes)**:
   - Integração com a API GraphQL do Otakulogia com paginação profunda (`offset`).
   - Barra de filtros alfabéticos (A - Z e 0-9).
   - Filtros dinâmicos por **Tipo de Áudio** (Dublado PT-BR, Legendado).
   - Filtros por formato (Animes, Donghuas Chineses, Filmes).
   - Botão **"Carregar Mais Animes (+36)"** contínuo.

2. **Banner Carrossel Hero Interativo**:
   - Destaques semanais em alta resolução.
   - Informações de temporada, áudio, ano e sinopse completa.
   - Botões de reprodução instantânea e adicionar à Minha Lista.

3. **Player de Vídeo Cyberpunk Avançado (Otimizado para Mobile e Desktop)**:
   - Controles customizados neon (Play/Pause, busca suave, retroceder/avançar 10s, controle de volume, fullscreen, picture-in-picture).
   - Suporte a gestos no celular (toque duplo para avançar/retroceder 10s).
   - Abas táteis mobile ("Episódios" e "Comentários").
   - Velocidade de reprodução (0.75x até 2.0x).
   - Proxy de streaming com headers `Range` e bypass de CORS nativo.
   - Transição automática ("Auto Próximo Episódio").

4. **100% Livre & Sem Restrições**:
   - Sem bloqueios de VIP, sem telas de paywall e resolução Full HD 1080p liberada para todos.

5. **Minha Lista & Histórico Inteligente ("Continuar Assistindo")**:
   - Salvamento automático do progresso de reprodução no segundo exato.
   - Barra de porcentagem assistida e indicador de episódio concluído.

6. **Quiz Otaku Interativo (`/quiz`)**:
   - Minigame de perguntas e respostas com contagem de pontos, sequência (combos), curiosidades e ranking final.

---

## ☁️ Deploy no Netlify

O projeto já está 100% pré-configurado para o **Netlify**:

### Arquivos de Configuração Netlify Inclusos:
- `netlify.toml`:
  - `publish = "dist"`
  - `command = "npm run build"`
  - Proxy Edge CDN para `/api/graphql` com headers `Origin` e `Referer`
  - Redirecionamento SPA fallback `/* -> /index.html 200`
  - Headers de segurança e cache
- `netlify/functions/`:
  - `video-proxy.mjs` (Streaming proxy serverless com suporte a Range & CORS)
  - `comments.mjs` (Comentários dos episódios)
  - `ratings.mjs` (Avaliações 1-5 estrelas)
  - `health.mjs` (Health check)
  - `graphql.mjs` (Fallback GraphQL)
- `public/_redirects` e `public/_headers`

### Como Publicar no Netlify:

#### Opção 1: Via GitHub (Recomendada)
1. Suba este repositório para o seu GitHub.
2. No painel do Netlify, clique em **"Add new site" -> "Import an existing project"**.
3. Selecione o repositório. O Netlify detectará automaticamente o arquivo `netlify.toml` com comando `npm run build` e pasta `dist`.
4. Clique em **"Deploy Site"**!

#### Opção 2: Via Terminal (Netlify CLI)
No diretório do projeto, execute:
```bash
npx netlify deploy --prod
```
Siga as instruções na tela para autenticar e escolher o site.

---

## 💻 Como Rodar Localmente

```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend Proxy**: [http://localhost:4000](http://localhost:4000)
