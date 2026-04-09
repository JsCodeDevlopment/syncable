# 📅 Histórico de Lançamentos (RELEASES)

Este documento registra todas as atualizações, melhorias e correções aplicadas ao sistema **Syncable**.

---

## 🚀 Próximas Versões (Planned)

- [ ] Estamos pensando...

---

## [v1.4.0] - 2026-04-09

### ✨ Faturamento e Cálculo de Valores (Billable Rates)

- 💰 **Cálculo Automático de Ganhos:**
  - O sistema agora calcula automaticamente o **Valor a Receber** com base no tempo líquido trabalhado e na taxa horária definida.
  - Dashboards de relatórios (privados e compartilhados) agora exibem cards de resumo financeiro.
- ⚙️ **Configuração de Taxa Horária:**
  - Nova seção em "General Settings" para definir o **Valor/Hora** e a **Moeda** de preferência.
- 🌍 **Suporte Multi-moeda:**
  - Formatação nativa para **BRL, USD, EUR e GBP**, adaptando símbolos e casas decimais automaticamente.
- 📄 **Exportação Financeira:**
  - Exportação CSV atualizada com linhas de resumo de faturamento.
  - Layout de impressão (PDF) profissionalizado com o sumário de "Total a Receber".

### 🛠️ Correções e Melhorias

- **Performance do Banco:** Implementada atualização automática de schema (soft migration) para garantir compatibilidade sem interrupções.
- **Fix (React):** Removido aviso de `key prop` em listas de entradas de relatórios compartilhados.

---

## [v1.3.0] - 2026-03-23

### ✨ Novidades e Recursos
- 🕒 **Ajuste de Ponto Retroativo (Entrada/Saída Atrasada):**
  - Botão **"Entrada atrasada?"** para ajustar o início da jornada caso o usuário esqueça de bater o ponto.
  - Opção de **"Saída atrasada?"** no modal de finalização do dia, permitindo informar o horário real de encerramento.
- ⚡ **Sincronização reativa:** O cronômetro e as métricas do dashboard agora refletem instantaneamente os ajustes de tempo realizados.

---

## [v1.2.0] - 2026-03-23

### ✨ Novidades e Melhorias

- 🖋️ **Sistema de Observações (Rich Text):** Implementação completa de Slate.js para anotações detalhadas em cada registro de ponto.
- 📂 **Mini-Reports Expansíveis:** Tabela de relatórios com linhas que se expandem para mostrar observações detalhadas sem prejudicar o layout.
- 📑 **Personalização de Identidade (Reports):** Opção de incluir **Nome** e **CPF/CNPJ** em visualizações web e exportações CSV/Excel.
- ⚙️ **Edição de Atividades:** Possibilidade de alterar retroativamente as observações dentro do modal de edição de registros.
- 📊 **Resumo de Reports:** Seção acima da tabela com indicadores consolidados (Total Trabalhado, Pausas e Sumário).

### 🛠️ Ajustes de UI/UX

- **Footer Profissional:** Redesign completo com 3 colunas, remoção de links inativos e placeholder.
- **Micro-interações:** Botões de "Description" e "Close" com feedback visual e sombras premium.
- **Assinatura de Marca:** Atualização do badge "Crafted by Jonatas Silva".

---

## [v1.1.0] - 2025-10-15

### ✨ Novidades

- **Modal Workflow (Reports):** Substituição de formulários estáticos por modal de exportação.
- **Link Externo com Expiração:** Geração de relatórios com tokens temporários e tokens criptografados.
- **Compatibilidade Excel:** Suporte nativo a UTF-8 BOM e separadores para Excel Master.

---

## [v1.0.0] - 2025-09-01

### ✨ Lançamento Oficial

- **Engine de Ponto:** Punch-in/out reativo com cronômetro em tempo real.
- **Insights de Produtividade:** Geração de gráficos Recharts iniciais.
- **Gestão de Intervalos:** Controle total de pausas dentro de uma mesma jornada.

---

Syncable Corporation - 2026
Precision, Privacy, and Performance.
