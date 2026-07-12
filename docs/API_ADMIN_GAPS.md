# API Admin Gaps

O backoffice da API agora cobre o essencial do admin:

- `GET /api/v2/admin/dashboard`
- `GET /api/v2/admin/users`
- `GET /api/v2/admin/payments`
- `GET /api/v2/admin/search`
- `GET /api/v2/admin/audit-logs`
- `GET /api/v2/admin/vehicles`
- `GET /api/v2/admin/driver-documents`
- aprovacoes unitarias e em lote para veiculos e documentos

O frontend ja foi ajustado para consumir esses endpoints. Os gaps reais que restam sao estes.

## Ainda Falta

### 1. Detalhe operacional de corridas

Hoje existe `GET /api/v2/admin/rides`, mas a rota ainda depende de `status` e retorna o documento bruto.

O ideal para o admin:

- permitir listar sem obrigar `status`
- suportar `page`, `limit`, `driverId`, `passengerId`, `dateFrom`, `dateTo`
- retornar `data: { rides, total, page, limit }`

### 2. Busca com destino navegavel

`GET /api/v2/admin/search` ja existe, mas o frontend ainda recebe resultados sem destino claro de navegacao para todas as entidades.

Seria melhor padronizar cada item com:

```json
{
  "id": "string",
  "type": "user|ride|vehicle|document",
  "title": "string",
  "subtitle": "string",
  "href": "/admin/..."
}
```

### 3. Rejeicao com motivo estruturado

As rotas de rejeicao aceitam `rejectionReason`, mas o frontend ainda nao trabalha com catalogo de motivos.

Seria util expor:

- lista padrao de motivos de rejeicao
- motivo salvo no retorno das filas

### 4. Moderacao em lote com retorno detalhado

As rotas batch retornam `count`, o que resolve o basico. Para operacao de suporte, seria melhor retornar:

- ids processados
- ids rejeitados por erro de validacao
- mensagens resumidas por item

### 5. Indicadores extras de dashboard

O dashboard principal ja funciona, mas ainda faltam indicadores para o portal ficar completo:

- corridas por status
- pagamentos pendentes/estornados
- tickets ou incidentes operacionais
- resumo por produto

### 6. Pagina dedicada de auditoria

`GET /api/v2/admin/audit-logs` ja existe e hoje alimenta um bloco em configuracoes. Se quisermos operacao real, vale criar suporte backend para:

- filtros por admin
- filtros por intervalo
- exportacao

## Prioridade Recomendada

1. Melhorar `GET /admin/rides` com paginacao e filtros.
2. Padronizar payload de `GET /admin/search` com `href`.
3. Estruturar rejeicao com motivo.
4. Expandir analytics do `GET /admin/dashboard`.
