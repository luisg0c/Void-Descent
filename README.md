# VOID DESCENT

> Roguelike top-down em tempo real onde cada morte recria o labirinto. Desça três andares de um abismo procedural, colete armas e destrua o Núcleo antes que o Void te consuma.

Projeto da disciplina **Introdução ao Desenvolvimento de Jogos** — iCEV / 2026.1.

## Pitch técnico

Tudo o que você vê e ouve é gerado por algoritmo em tempo de execução. Não há texturas desenhadas à mão, sprites importados, nem áudio gravado. O atlas de tiles é pintado em tempo de boot, a música nasce de um synth Sonant-X minimalista, os mapas saem de um gerador de salas com flood-fill, e os efeitos sonoros são sintetizados nota por nota.

Resultado: **o jogo todo (HTML + JS) pesa ~77KB**. O peso final do executável (~73MB) vem inteiramente do Electron, que empacota o Chromium para distribuir como `.exe` nativo, conforme exigido pelo GDD.

## Como jogar

| Tecla | Ação |
|-------|------|
| **W A S D** | Movimento |
| **Mouse** | Mira |
| **Clique esquerdo** | Atirar (ranged) ou cortar (melee) |
| **Espaço** | Dash com 0,2s de invencibilidade |
| **Q** | Usar poção de cura |
| **M** | Mute / unmute |
| **ESC** | Pausar / abrir menu |

Mate todos os inimigos da sala para destrancar as portas. Encontre a escada para descer. A cada andar, escolha um upgrade na loja gastando o score acumulado.

## Build e execução

```bash
# Rodar localmente em modo dev
npm install
npm start

# Gerar .exe para Windows (cross-compile aceita rodar no macOS)
npm run build:win
# saída: dist/VoidDescent-1.0.0.exe (~73MB, portable, sem instalador)
```

O `.exe` é não-assinado. O Windows SmartScreen vai exibir um aviso na primeira execução; clique em **"Mais informações" → "Executar mesmo assim"**.

## Stack

- **JavaScript puro** (sem frameworks)
- **WebGL** para renderização 3D com vertex lighting
- **Sonant-X** para síntese de áudio
- **Electron 32** para empacotamento

## Arquitetura

```
src/vd/
├── random.js     RNG determinístico (LCG seedado por andar)
├── sonantx.js    Engine de síntese de áudio
├── audio.js      SFX + música ambiente procedurais
├── renderer.js   Pipeline WebGL (shaders, atlas tinting, lights)
├── dungeon.js    Gerador procedural de salas e corredores
├── entities.js   Sistema de entidades (player, 4 inimigos, boss, projeteis)
├── terminal.js   HUD textual estilo terminal
└── game.js       Loop principal, state machine, HUD, shop, lock-and-clear
```

## Equipe

- Luis Gustavo Olímpio
- Lauan Matheus
- José Melquíades
- João Leonardi
