# Syncable - Gestão de Ponto & Payroll Dashboard

![](https://img.shields.io/badge/Versão-2.0.0-black?style=for-the-badge)

Plataforma moderna, intuitiva e responsiva desenvolvida para profissionais e empresas que buscam simplicidade e precisão no controle de jornada. O **Syncable** elimina a burocracia do registro de ponto, oferecendo uma experiência focada no que realmente importa: seu tempo.

<h1 align="center">
  <img alt="Banner do Syncable" title="#Banner" style="object-fit: cover; width: 100%; max-height: 520px" src="public/preview.webp" />
</h1>

---

## 🚀 Funcionalidades que facilitam sua Jornada

O Syncable foi desenhado para ser seu aliado no dia a dia. Confira como a plataforma simplifica sua gestão:

### 1. ⏱️ Controle de Tempo Inteligente

- **Registro em um Clique:** Bata o ponto de entrada, pausa ou saída instantaneamente.
- **Cronômetro em Tempo Real:** Acompanhe exatamente quanto tempo você já trabalhou no dia.
- **🕒 Entrada/Saída Atrasada:** Esqueceu de bater o ponto? Sem problemas. Ajuste seu horário de início ou fim retroativamente com facilidade.
- **Pausas Flexíveis:** Gestão completa de intervalos para garantir que seu descanso seja computado corretamente.

### 2. 📊 Insights e Métricas Claras

- **Dashboard Visual:** Entenda sua produtividade através de cards intuitivos (Total Trabalhado, Tempo de Pausa, Horas Restantes).
- **Gráficos Dinâmicos:** Visualize seu desempenho semanal e mensal de forma gráfica e elegante.
- **Status Instantâneo:** Saiba se você está "Em Atividade", "Em Pausa" ou se sua jornada já foi concluída.

### 3. 📄 Relatórios Profissionais em Segundos

- **Geração Intuitiva:** Esqueça formulários complexos. Use nosso fluxo guiado para criar relatórios diários, semanais ou mensais.
- **Relatórios por Projeto:** Filtre suas jornadas por um cliente ou projeto específico para uma visão detalhada de ganhos e horas.
- **📄 Exportação PDF Premium:** Gere documentos de nível executivo com a nova engine baseada em `@react-pdf/renderer`, com layout de alta fidelidade e branding integrado.
- **Personalização Total:** Escolha incluir seu **Nome Profissional** e **Documento (CPF/CNPJ)** e decida se quer exibir os ganhos estimados ou apenas as horas trabalhadas.
- **Exportação Master:** Gere arquivos **CSV/Excel** que agora incluem a coluna de **Projeto**, formatados perfeitamente para qualquer software de planilha.

### 4. 🖋️ Anotações e Detalhamento

- **Observações com Formatação:** Adicione notas detalhadas sobre suas tarefas usando um editor de texto rico (negrito, listas, etc.).
- **Edição Retroativa:** Precisa atualizar o que fez? Você pode editar suas observações mesmo após finalizar o dia.
- **Visão Expandida:** Revise suas atividades passadas em uma tabela organizada que esconde detalhes para manter o foco, mas os revela em um clique.

### 5. 🔗 Compartilhamento Seguro

- **Links Blindados:** Compartilhe seus relatórios através de links protegidos por tokens únicos.
- **Controle de Expiração:** Defina por quanto tempo o link ficará ativo (1 dia, 1 semana, etc.).
- **Privacidade Total:** Escolha se quem recebe o link pode ver seus gráficos de performance ou apenas as horas brutas.

### 6. 🛡️ Segurança Enterprise e Privacidade

- **Criptografia com Bcrypt:** Suas senhas são protegidas pelo padrão de mercado **Bcrypt**, com salting dinâmico e migração automática de dados antigos.
- **Sessões Blindadas:** Gerenciamento de sessões via database com tokens UUID, garantindo que sua conta nunca seja comprometida.
- **Isolamento de Dados:** Cada consulta ao banco é estritamente vinculada ao seu ID único, garantindo que ninguém mais veja suas horas.

### 7. 💰 Faturamento e Cálculo de Valores

- **Faturamento por Projeto:** Configure valores por hora e moedas diferentes para cada cliente. O sistema faz a matemática de forma independente.
- **Taxa Global de Perfil:** Defina sua taxa padrão que servirá como fallback automático para projetos sem valores configurados.
- **Cálculo Automático (Payroll):** Saiba exatamente quanto receber ao final de cada período baseado no trabalho líquido e pausas, respeitando taxas específicas.
- **Suporte Multi-moeda:** Defina moedas entre **BRL, USD, EUR ou GBP** com formatação regional automática por projeto.
- **Cards Financeiros:** Visualize o total a receber em destaque nos seus dashboards e relatórios, sempre respeitando a moeda do projeto filtrado.

---

## 🛠️ Tecnologias

<div align="center">
  <img src="https://img.shields.io/badge/Next.js_15-000?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Bcrypt.js-black?style=for-the-badge&logo=auth0&logoColor=white" />
  <img src="https://img.shields.io/badge/React_PDF-FF4B4B?style=for-the-badge&logo=adobeacrobatreader&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/shadcn/ui-000?style=for-the-badge&logo=shadcnui&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL_(Neon)-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Recharts-22b5bf?style=for-the-badge&logo=recharts&logoColor=white" />
  <img src="https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel-000?style=for-the-badge&logo=vercel&logoColor=white" />
</div>

---

## 📅 Histórico de Versões

Confira todas as melhorias e novos recursos em nosso log oficial:
👉 **[Ver Histórico Completo em RELEASES.md](./RELEASES.md)**

---

## 👨‍💻 Time e Desenvolvimento

<div align="center">
  <img src="https://avatars.githubusercontent.com/u/100796752?s=400&u=ae99bd456c6b274cd934d85a374a44340140e222&v=4" width="100" style="border-radius: 50%" />
  <br>
  <strong>Jonatas Silva</strong>
  <br>
  Senior Software Engineer / CTO & Tech Lead at <a href="https://pokernetic.com/">PokerNetic</a>
</div>

---

## 📄 Licença

Este projeto é privado e de uso restrito da **Syncable Corporation**.

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/JsCodeDevlopment">Jonatas Silva</a></sub>
</div>
