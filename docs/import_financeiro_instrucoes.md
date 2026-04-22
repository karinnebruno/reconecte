# Importação do relatório financeiro

## Situação do arquivo

O arquivo `relatorio-extrato.xls` está em formato binário legado (.xls antigo) que o Python não consegue ler de forma estruturada. Consegui extrair os dados parcialmente e identifiquei a estrutura:

**Categorias de saída encontradas no arquivo:**
- Google Ads
- Meta Ads
- iCloud
- Hospedagem Site
- Contabilidade
- DARF
- INSS
- OpenAI
- Kommo
- PsicoManager
- Ensaio IA
- Bot conversa
- Mentoria de Tráfego
- Cartão de Crédito
- Secretária (remuneração)

**Categorias de entrada:**
- Sessões (por paciente)
- Cobrança Avulsa

## Como importar o histórico financeiro

### Opção 1 (recomendada) — Exportar CSV direto do PsicoManager

No PsicoManager, exporte o extrato como **CSV** (não XLS). Depois me envie o CSV e importo automaticamente.

### Opção 2 — Abrir no Excel/Numbers e salvar como XLSX

1. Abra `relatorio-extrato.xls` no Excel ou Numbers
2. Salve como `.xlsx`
3. Substitua o arquivo aqui e me avise — leio e gero o SQL automaticamente

### Opção 3 — Lançar manualmente no dashboard

Use `/dashboard/financeiro` para lançar os dados históricos manualmente. O export CSV do próprio dashboard facilita conferências futuras.

## O que já foi identificado no arquivo

Período: **março/2025 → abril/2026**

Despesas recorrentes mensais identificadas (valores aproximados):
- Google Ads: ~R$ 3.043,04/mês
- Meta Ads: ~R$ 976,97/mês
- OpenAI: ~R$ 120,18
- Kommo: ~R$ 238,62
- PsicoManager: ~R$ 12,99
- iCloud: ~R$ 14,90
- Hospedagem Site: ~R$ 54,00
- Contabilidade: ~R$ 160,00
