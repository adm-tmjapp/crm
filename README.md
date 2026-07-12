# TMJApp Site V2

Nova base institucional do TMJApp em `Next.js + TypeScript + Tailwind`, preparada para deploy estático em `S3 + CloudFront`.

## Stack

- Next.js com App Router
- TypeScript
- Tailwind CSS
- Export estático para deploy simples

## Scripts

- `npm run dev` inicia ambiente local em `http://localhost:3000`
- `npm run build` gera a saída estática em `out/`
- `npm run deploy` publica em S3 e invalida o CloudFront

## API

- desenvolvimento: `http://localhost:3000` com consumo em `/api/v2`
- producao: `http://api.tmjapp.com.br/api/v2`
- opcional: sobrescreva com `NEXT_PUBLIC_API_URL`

## Estrutura

- `src/app` páginas e layout base
- `src/components` componentes compartilhados
- `src/content` conteúdo estático e configuração das seções
- `docs/ARCHITECTURE.md` direção técnica para evoluir o projeto

## Deploy

O fluxo atual usa build estático, sync para bucket S3 e invalidação do CloudFront.
