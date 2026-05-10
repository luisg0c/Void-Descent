# VOID DESCENT

> Roguelike top-down em tempo real com geração 100% procedural. JavaScript puro com renderização WebGL, empacotado como `.exe` portátil via Electron.

iCEV — Introdução ao Desenvolvimento de Jogos — 2026.1

---

## ▶ Download da build

**[⬇ Baixar VoidDescent-1.0.0.exe (73 MB)](https://github.com/luisg0c/Void-Descent/releases/download/v1.0.0/VoidDescent-1.0.0.exe)**

Executável portátil para Windows x64. Sem instalação. Na primeira execução, o Windows SmartScreen vai exibir "O Windows protegeu seu PC" — clicar em **Mais informações → Executar mesmo assim**.

Também disponível em [Releases](https://github.com/luisg0c/Void-Descent/releases/tag/v1.0.0) (com SHA-256 para verificação) e como cópia no repositório em [`dist/VoidDescent-1.0.0.exe`](dist/VoidDescent-1.0.0.exe).

---

## Para avaliação

Três artefatos cobrem toda a entrega:

1. **Executável Windows**: link acima ou em [Releases](https://github.com/luisg0c/Void-Descent/releases/tag/v1.0.0).

2. **Game Design Document**: [`docs/GDD_VoidDescent.pdf`](docs/GDD_VoidDescent.pdf).
   Conceito, mecânicas, game loop micro/macro, narrativa, level design, estética, planejamento técnico, histórico de revisões.

3. **Documentação técnica**: [`docs/main.pdf`](docs/main.pdf) (37 páginas).
   Arquitetura, diagramas UML (component, class, state, activity, sequence, deployment), decisões técnicas, aprendizados, mudanças de escopo em relação ao GDD, considerações finais.

## Equipe

- Luis Gustavo Olímpio
- Lauan Matheus
- José Melquíades
- João Leonardi

## Pitch técnico

Texturas, geometria, mapas, áudio e comportamento de inimigos são gerados por algoritmo em tempo de execução. Não há nenhum asset importado. O código fonte completo ocupa 77 KB; o `.exe` pesa 73 MB porque empacota o Chromium do Electron, conforme especificado no GDD.

## Controles

| Tecla | Ação |
|-------|------|
| W A S D | Movimento |
| Mouse | Mira |
| Clique esquerdo | Atacar (ranged ou melee, conforme arma equipada) |
| Espaço | Dash com 0,2 s de invencibilidade, cooldown 1,5 s |
| Q | Usar poção do slot de consumível |
| M | Mute / unmute |
| ESC | Pausar e retomar |

Mate todos os inimigos da sala para destrancar as portas. Encontre a escada para descer. Escolha um upgrade na loja entre andares.

## Build a partir do código fonte

Pré-requisitos: Node.js 24+ e npm 11+.

```bash
npm install
npm start                 # roda em modo de desenvolvimento via Electron
npm run build:win         # gera dist/VoidDescent-1.0.0.exe (cross-compile macOS para Windows funciona)
```

## Estrutura do repositório

```
/
├── README.md                                este arquivo
├── index.html                                entry point HTML
├── main.js                                   entry point Electron
├── package.json, package-lock.json           dependências e config de build
│
├── src/vd/                                   código fonte do jogo (8 arquivos JS)
│   ├── random.js, sonantx.js                 RNG determinístico e sintetizador
│   ├── renderer.js                           pipeline WebGL com tinting de atlas
│   ├── dungeon.js                            gerador procedural de salas e corredores
│   ├── audio.js, terminal.js                 áudio sintetizado e overlay textual
│   ├── entities.js                           player, 4 tipos de inimigos, boss, projéteis
│   └── game.js                               state machine, HUD, shop, lock-and-clear
│
├── dist/
│   └── VoidDescent-1.0.0.exe                 executável final portátil
│
└── docs/
    ├── GDD_VoidDescent.pdf, .tex             game design document
    ├── main.pdf                              documentação técnica (35 páginas)
    ├── main.tex, chapters/                   fonte LaTeX da documentação técnica
    ├── diagrams/                             9 diagramas UML (.puml + .png)
    └── Makefile                              make pdf para recompilar
```

## Stack tecnológico

JavaScript puro, sem frameworks. WebGL 1.0 com shaders próprios. Sonant-X (port JavaScript do sintetizador Sonant). Electron 32 + electron-builder 25 para empacotamento.
