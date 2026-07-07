# Azure DevOps Tooltips

Extensão de navegador (Manifest V3) que automatiza tarefas repetitivas do dia a dia de quem trabalha com Azure DevOps: hoje, propagação de Area/Iteration Path entre work items; em desenvolvimento, criação automatizada de Pull Requests (incluindo repositórios vinculados como submodules/packages), monitoramento de aprovações/comentários e customização completa de status/templates.

Roda inteiramente no navegador, sem backend próprio — fala diretamente com a REST API do Azure DevOps usando um Personal Access Token fornecido pelo próprio usuário.

## Funcionalidades atuais

A extensão abre como um **side panel** (não mais um popup), com estas abas:

- **Tasks** — configuração do token de acesso pessoal e da organização do Azure DevOps.
- **Configurações** — seleção de projeto/time e escolha de quais membros do time podem ser marcados como revisores de PR.
- **Repositórios** — cadastro do(s) repositório(s) principal(is) e dos repositórios vinculados a eles (submodules/packages).
- **UpdateTasks** — propaga Area Path e Iteration Path de uma Story/Bug para todas as suas Tasks filhas.

## Roadmap (em desenvolvimento)

- Popup automático ao mudar o status de um work item, para escolher revisores, marcar como Draft e criar o(s) Pull Request(s) (principal + vinculados) de uma vez.
- Descrição e título de PR gerados a partir de um template customizável, com lista de commits e referência cruzada entre PR principal e PRs vinculados.
- Status de work item totalmente customizáveis (gatilho de criação de PR, status pós-aprovação).
- Aba de Monitoramento: som ao aprovar um PR, notificação de desktop em novos comentários, e transição automática de status do work item.

## Instalação (modo desenvolvedor)

1. Abra `chrome://extensions` no navegador.
2. Ative o "Modo do desenvolvedor".
3. Clique em "Carregar sem compactação" e selecione a pasta raiz deste projeto.
4. Clique no ícone da extensão para abrir o side panel e configurar o token de acesso na aba Tasks.

## Estrutura do projeto

```
background/        Service worker (abre o side panel, futura orquestração de monitoramento)
common/            Módulos compartilhados (acesso a chrome.storage.local)
panel/             UI do side panel (HTML/CSS/JS)
scripts/
  html/            Fragmentos HTML de cada aba do painel
  js/
    controller/    Liga eventos de UI aos models de cada aba
    model/          Acesso à API do Azure DevOps e a chrome.storage.local
    view/           Manipulação direta do DOM de cada aba
content.js          Content script injetado nas páginas do Azure DevOps
manifest.json       Configuração da extensão (Manifest V3)
```

## Permissões necessárias

- `storage` — guardar token, configurações e cadastro de repositórios/revisores localmente.
- `sidePanel` — exibir a UI como painel lateral.
- `activeTab` / `webRequest` — interação com a aba ativa do Azure DevOps.
- Acesso de host a `dev.azure.com` e `*.visualstudio.com`.

Nenhum dado é enviado a servidores de terceiros — todas as chamadas de API vão diretamente do navegador do usuário para o Azure DevOps.
