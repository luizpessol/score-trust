
# Score Trust - Análise de Risco em Tempo Real

## Visão Geral do Projeto

Este repositório contém a versão pública do frontend e SDK utilizados no MVP da plataforma Score Trust, com foco na verificação de identidade de usuários a partir de dados do navegador e device fingerprint. Essa solução é ideal para simulações, POCs e ambientes de demonstração.

Este projeto é uma aplicação web moderna e responsiva, construída com React, TailwindCSS e Framer Motion, que demonstra as capacidades do Score Trust através de uma interface intuitiva.

## Funcionalidades

### 1. Página Principal (Home)
Uma página moderna e visualmente atraente que apresenta o objetivo da empresa, destacando informações sobre segurança e anti-fraude com dados públicos e um design cyberpunk vibrante.

### 2. Página de Análise de Risco
Permite que os usuários insiram um endereço de e-mail para realizar uma análise de risco em tempo real. A análise considera fatores como:
*   **E-mail**
*   **Endereço IP**
*   **Timezone**
*   **Plataforma**
*   **User Agent**
*   **Hash do Dispositivo**

O resultado exibe um `score` e uma `ação sugerida` (`ALLOW`, `REVIEW`, `DENY`) com base nas seguintes regras:
*   **0 - 30**: ✅ `ALLOW`
*   **31 - 75**: ⚠️ `REVIEW`
*   **76 - 100**: 🚫 `DENY`

### 3. Dashboard
Um dashboard completo que se conecta à API do Score Trust (`https://api.score-trust.com/getRiskEvents`) para exibir estatísticas e eventos de risco. O dashboard mostra:
*   O número total de consultas.
*   A divisão das ações (`ALLOW`, `REVIEW`, `DENY`).
*   Gráficos e tabelas detalhadas dos eventos.

## Tecnologias Utilizadas

*   **Frontend**:
    *   [React](https://react.dev/) (v18.2.0) - Biblioteca JavaScript para construção de interfaces de usuário.
    *   [Vite](https://vitejs.dev/) - Ferramenta de build e servidor de desenvolvimento.
    *   [TailwindCSS](https://tailwindcss.com/) (v3.3.2) - Framework CSS utilitário para estilização rápida e responsiva.
    *   [Framer Motion](https://www.framer.com/motion/) (v10.16.4) - Biblioteca para animações e interações.
    *   [shadcn/ui](https://ui.shadcn.com/) - Componentes de UI reutilizáveis (construídos com Radix UI e estilizados com TailwindCSS).
    *   [Lucide React](https://lucide.dev/) (v0.292.0) - Biblioteca de ícones.
    *   [React Router DOM](https://reactrouter.com/en/main) (v6.16.0) - Para roteamento de páginas.
    *   [React Helmet](https://github.com/nfl/react-helmet) (v6.1.0) - Para gerenciamento de tags `<head>`.

*   **API Externa**:
    *   [Score Trust API](https://api.score-trust.com/) - Para análise de risco e eventos.

## Configuração do Projeto

Para rodar este projeto localmente, siga os passos abaixo:

### Pré-requisitos

*   Node.js (versão 20 ou superior)
*   npm (gerenciador de pacotes do Node.js)

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd score-trust
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

### Chaves de API

Este projeto utiliza a API do Score Trust. Você precisará de uma chave de API (`x-api-key`) para que as funcionalidades de análise e dashboard funcionem corretamente.

A chave de API utilizada no projeto é: `DTFu5bcCwjwtilrFuSCG6CDXAZ16wP45jnZpfFn1`. Certifique-se de que esta chave está configurada corretamente nos arquivos `src/pages/AnalyzePage.jsx` e `src/pages/DashboardPage.jsx`.

### Rodando o Projeto

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173` (ou outra porta disponível).

### Build para Produção

Para criar uma versão otimizada para produção:

```bash
npm run build
```

Os arquivos de build serão gerados na pasta `dist/`.

## Estrutura do Projeto

```
.
├── public/
├── src/
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── ui/
│   │       ├── button.jsx
│   │       ├── input.jsx
│   │       ├── toast.jsx
│   │       ├── toaster.jsx
│   │       └── use-toast.js
│   ├── lib/
│   │   └── utils.js
│   └── pages/
│       ├── AnalyzePage.jsx
│       ├── DashboardPage.jsx
│       └── HomePage.jsx
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
└── README.md
```

## Implantação

Este projeto pode ser facilmente implantado em plataformas de hospedagem como a Hostinger. Basta utilizar a funcionalidade de "Publish" ou "Deploy" da sua plataforma para colocar o site no ar.

## Contato

Para dúvidas ou sugestões, entre em contato.
