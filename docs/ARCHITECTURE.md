# TMJApp Site V2 Architecture

## Objetivo

Reconstruir o `tmjapp-site` com foco em:

- menos codigo estrutural
- manutencao simples
- SEO e performance
- deploy estatico em AWS

## Stack

- `Next.js` com `App Router`
- `TypeScript`
- `Tailwind CSS`
- deploy estatico em `S3 + CloudFront`

## Decisao de deploy

Foi mantido o fluxo ja existente de publicacao em AWS:

1. gerar saida estatica em `out/`
2. sincronizar com bucket S3
3. invalidar cache do CloudFront

Essa escolha reduz complexidade operacional e permite seguir com o site institucional sem depender de SSR neste momento.

## Estrutura recomendada

```text
src/
  app/
    (marketing)/
    contato/
    empresa/
    motoristas/
    layout.tsx
    page.tsx
    globals.css
  components/
    ui/
    sections/
    layout/
  content/
    navigation.ts
    home.ts
    faq.ts
  lib/
    analytics.ts
    seo.ts
    env.ts
docs/
  ARCHITECTURE.md
```

## Paginas previstas

- `/` home institucional
- `/empresa`
- `/motoristas`
- `/passageiros`
- `/contato`
- `/politica-de-privacidade`
- `/termos`

## Regras de implementacao

- conteudo institucional primeiro, integracoes depois
- componentes pequenos e sem abstracao prematura
- imagens otimizadas e estaticas sempre que possivel
- dados de marketing em `src/content`
- integracoes externas isoladas em `src/lib`

## Proximos passos

1. definir sitemap final
2. fechar identidade visual
3. construir design system minimo
4. implementar paginas prioritarias
5. plugar analytics, formulario e SEO detalhado
