# TMJApp Site V2

Nova base institucional do TMJApp em `Next.js + TypeScript + Tailwind`, preparada para deploy estático no Firebase Hosting.

## Stack

- Next.js com App Router
- TypeScript
- Tailwind CSS
- Export estático para deploy simples

## Scripts

- `npm run dev` inicia ambiente local em `http://localhost:3000`
- `npm run build` gera a saída estática em `out/`
- `npm run deploy` publica no fluxo legado de S3/CloudFront

## API

- desenvolvimento: `http://localhost:3000` com consumo em `/api/v2`
- producao: `https://tmjapp-api-53m7i55c3q-rj.a.run.app/api/v2`
- opcional: sobrescreva com `NEXT_PUBLIC_API_URL`

## Deploy automatico

Todo push na branch `main` executa o workflow `.github/workflows/deploy-firebase-hosting.yml`.

O workflow faz:

- `npm ci`
- `npm run build`
- autenticacao por GitHub OIDC com Workload Identity Federation
- deploy do diretorio `out` no Firebase Hosting do site `tmj-apps`

Infra configurada no Google Cloud:

```text
workload identity provider: projects/812443835960/locations/global/workloadIdentityPools/github-actions/providers/github
service account: github-crm-hosting-deploy@tmj-apps.iam.gserviceaccount.com
```

O provider aceita apenas o repositorio `adm-tmjapp/crm` na branch `main`.

## Estrutura

- `src/app` páginas e layout base
- `src/components` componentes compartilhados
- `src/content` conteúdo estático e configuração das seções
- `docs/ARCHITECTURE.md` direção técnica para evoluir o projeto

## Deploy manual

O Firebase Hosting usa `firebase.json` com `public: "out"` e site `tmj-apps`.
