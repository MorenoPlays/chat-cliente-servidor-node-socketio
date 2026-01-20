# 🎮 AXOLO - Socket.IO Multiplayer Gaming

## 📡 Fluxo de Sincronização Resumido

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    AXOLO MULTIPLAYER - SOCKET.IO FLOW                        ║
╚══════════════════════════════════════════════════════════════════════════════╝

[FASE 1] LOGIN & LOBBY (Port 3000)
═════════════════════════════════════════════════════════════════════════════

Player 1                          Servidor                        Player 2
  │                                 │                               │
  ├──→ socket.connect()            │                               │
  │                            ←──→ (WebSocket)                     │
  │                                 │                               │
  ├──→ emit('user-online') ────────→ │                              │
  │                                 ├──→ Armazena em onlineUsers    │
  │                                 │                              ←──┤
  │                                 ├──→ emit('users-list')   →────→│
  │  [Dashboard - Vê outros jogadores]                              │
  │                                                    [Dashboard]    │
  │                                                                   │
  │  [Seleciona Player 2]                                             │
  ├──→ emit('create-game', {...}) ──→ │                              │
  │                                 ├──→ Cria room                   │
  │                                 ├──→ emit('game-invite') →─────→│
  │                                 │                       ┌────────┤
  │ [Sala de Espera]               │                       │ [Notificação]
  │  (Host)                        │                       │
  │                                 │  ←──────────────────┤
  │                                 │ emit('accept-invite')│
  │                                 ├──→ Adiciona à sala  │
  │                                 ├──→ emit('room-joined')→──────→│
  │                                 │                    [Sala de Espera]
  │  ←──→ emit('player-joined-room') ←──┘                  (Guest)
  │                                 │
  │  [Clica: "Iniciar Jogo"]       │
  ├──→ emit('start-game') ────────→ │
  │                                 ├──→ Status = 'playing'
  │                                 ├──→ emit('game-starting') →───→│
  │                                 │
  ├──→ navigate('/game')           │    ←──→ navigate('/game')
  │

[FASE 2] GAMEPLAY (Port 3001)
═════════════════════════════════════════════════════════════════════════════

Player 1                          Servidor                        Player 2
  │                                 │                               │
  ├──→ emit('join-room') ─────────→ │ ←──────────┐                 │
  │                                 │            │                 │
  │ [Game Carrega]                 │            └─ emit('join-room')
  │                                 ├──→ Cria estrutura de dados
  │ useSocket() conecta            │                               │
  │                                 ├──→ emit('existing-players') →→│
  │                                 │                    [Game Carrega]
  │  ←────────────────────────────→ │ ←─────────┐
  │ update-positions               │           └─ useSocket() conecta
  │   (50ms) ─────────────────────→│
  │     {pos, rot, anim, ...}      │ ────────→ {pos, rot, anim, ...}
  │                                 │
  │  ←───────────────────────────── ←────────────────┤
  │     update-positions (50ms)                      │
  │                                 ←─ [Update 20x/seg]
  │
  │ [Player 1 atira]               │
  ├──→ emit('player-shoot') ──────→ │ ←──────────┐
  │     {id, pos, dir}             │            │
  │                                 ├──→ emit('player-shot')
  │  ←────────────────────────────→ │ ───────────┐
  │     [Som de tiro remoto]         │           │
  │                                 └──────→ [Som de tiro]
  │
  │ [Bala colide com Player 2]     │
  │                                │
  ├──→ emit('player-hit') ────────→ │ ←──────────┐
  │     {targetId, damage}         │            │
  │                                 ├──→ target.health -= 25
  │                                 ├──→ emit('player-health-update')
  │                                 │ ────────────────────────→ [Vida 75]
  │                                 │
  │ [Player 1 mata Player 2]       │
  │                                │
  │                                 ├──→ target.health = 0
  │                                 ├──→ emit('player-killed')
  │  ←────────────────────────────→ │ ────────→ [Morre]
  │     {victimId, killerId}       │         [Respawn em 3s]
  │  [Score: 1 Kill]               │
  │                                 │ ←──┐ [Reparece]
  │                                 ├──→ emit('player-respawn')
  │                                 │ ────→ [Posição nova]
  │
  │ [Jogo continua...]            │      [Jogo continua...]
  │ emit('player-move') ──────────→ │ ────────→ Sincroniza movimento
  │    (continuamente)              │  (50ms)    (continuamente)
  │


[DADOS SINCRONIZADOS]
═════════════════════════════════════════════════════════════════════════════

UPDATE-POSITIONS (50ms = 20 FPS):
┌─────────────────────────────────────────────────────────────────┐
│ Player 1:                                                       │
│   - position: {x: 10.5, y: 1.2, z: 5.3}                        │
│   - rotation: {x: 0, y: 1.57, z: 0}                            │
│   - animation: 'Run'                                            │
│   - health: 100                                                 │
│   - kills: 2, deaths: 1                                         │
│                                                                 │
│ Player 2:                                                       │
│   - position: {x: -8.2, y: 1.2, z: 12.1}                       │
│   - rotation: {x: 0, y: 3.14, z: 0}                            │
│   - animation: 'Idle'                                           │
│   - health: 75                                                  │
│   - kills: 1, deaths: 2                                         │
└─────────────────────────────────────────────────────────────────┘

PLAYER-SHOT (Instantâneo):
┌─────────────────────────────────────────────────────────────────┐
│ {                                                               │
│   id: 'bullet-123',                                             │
│   playerId: 'socket-1',                                         │
│   playerName: 'Player1',                                        │
│   position: [10.5, 1.8, 5.3],                                   │
│   direction: [0.8, 0, 0.6],                                     │
│   timestamp: 1234567890000                                      │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘

PLAYER-HIT (Instantâneo):
┌─────────────────────────────────────────────────────────────────┐
│ {                                                               │
│   targetId: 'socket-2',                                         │
│   damage: 25,                                                   │
│   shooterId: 'socket-1'                                         │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘

PLAYER-KILLED (Instantâneo):
┌─────────────────────────────────────────────────────────────────┐
│ {                                                               │
│   victimId: 'socket-2',                                         │
│   victimName: 'Player2',                                        │
│   killerId: 'socket-1',                                         │
│   killerName: 'Player1'                                         │
│ }                                                               │
│ → Respawn em 3 segundos                                         │
│ → Player2 reaparece em posição aleatória                        │
└─────────────────────────────────────────────────────────────────┘


[PERFORMANCE]
═════════════════════════════════════════════════════════════════════════════

Taxa de Sincronização:
  Posições: 50ms (20 FPS) = 20 updates por segundo
  Tiros: Instantâneo (1-10ms)
  Dano: Instantâneo (1-10ms)
  Morte: Instantâneo (1-10ms)

Largura de Banda:
  1 jogador: ~1 KB/s
  2 jogadores: ~2 KB/s
  4 jogadores: ~4 KB/s

Latência Esperada:
  Localhost: 5-20ms
  Mesma rede: 10-50ms
  Internet: 100-300ms
  5G: 20-100ms

Frame Rate:
  Sincronização: 20 FPS
  Renderização: 60 FPS (React-Three Fiber)
  Resultado: Movimento suave com interpolação


[TROUBLESHOOTING]
═════════════════════════════════════════════════════════════════════════════

❌ "Socket não conecta"
   └─ Verificar se servidor está rodando: npm run dev (pasta server/)

❌ "Outro jogador não aparece"
   └─ Verificar se estão na mesma sala (roomId no sessionStorage)

❌ "Não consigo atirar"
   └─ Verificar console para erros de Socket.emit

❌ "Outro jogador congela"
   └─ Latência alta - Ping > 200ms significa conexão ruim

✅ "Tudo funciona!"
   └─ Debug panel mostra: Players: 2, Ping: Xms, Kills, Deaths, Health


[ARQUIVOS MODIFICADOS]
═════════════════════════════════════════════════════════════════════════════

✅ server/index.js
   - Loop de sincronização (50ms)
   - Handlers de jogo

✅ src/hooks/useSocket.js
   - Sincronização de posições
   - Funções: emitMove(), emitShoot(), emitHit()

✅ src/components/Experience.jsx
   - useSocket() integration
   - Renderizar jogadores remotos
   - Debug panel

✅ src/components/CharacterController.jsx
   - Enviar movimento
   - Receber posição remota
   - Enviar dano

✅ src/pages/Game.tsx + GameLobby.tsx
   - Armazenar roomId


[DOCUMENTAÇÃO]
═════════════════════════════════════════════════════════════════════════════

📄 QUICK_START.md .................... Como começar em 5 passos
📄 SOCKET_IMPLEMENTATION.md .......... Explicação técnica
📄 MULTIPLAYER_GUIDE.md ............. Guia + troubleshooting
📄 ARCHITECTURE.md .................. Diagramas detalhados
📄 IMPLEMENTATION_SUMMARY.md ........ Resumo executivo
📄 README_SOCKET.md ................. Este arquivo


═════════════════════════════════════════════════════════════════════════════
                      🎮 READY TO PLAY MULTIPLAYER! 🎮
═════════════════════════════════════════════════════════════════════════════
```

---

## 🚀 Quick Commands

```bash
# Iniciar servidor
cd server && npm run dev

# Iniciar cliente (em outro terminal)
npm run dev

# Abrir 2 abas no navegador
Aba 1: http://localhost:5173
Aba 2: http://localhost:5173

# Ver logs do servidor
[Terminal 1 - já rodando npm run dev]

# Ver logs do cliente
F12 (DevTools) → Console → Ver logs com ✅/❌/💀/🎯
```

---

## ✨ O Que Acontece em Tempo Real

```
T=0ms    Player 1 clica para atirar
         └─→ socket.emit('player-shoot', bulletData)

T=1-5ms  Servidor recebe e faz broadcast
         └─→ socket.to(roomId).emit('player-shot', bulletData)

T=6-15ms Player 2 recebe no cliente
         └─→ Renderiza bala remota

T=20ms   Colisão detectada (física)
         └─→ socket.emit('player-hit', {targetId, damage})

T=21-30ms Servidor aplica dano
         └─→ socket.to(roomId).emit('player-health-update')

T=31-40ms Ambos recebem atualização
         └─→ Barra de vida atualiza em tempo real

T=41-50ms Se morte:
         └─→ socket.to(roomId).emit('player-killed', {victim, killer})
         └─→ Respawn em 3 segundos
         └─→ socket.to(roomId).emit('player-respawn', newPosition)
```

---

## 🎯 Tipos de Mensagens

```
╔════════════════════════════════════════════════════════════════╗
║              SOCKET.IO MESSAGE TYPES                           ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║ BROADCAST (Para todos na sala):                               ║
║  • update-positions (50ms)                                     ║
║  • player-shot (tiro remoto)                                   ║
║  • player-health-update (vida)                                 ║
║  • player-killed (morte)                                       ║
║  • player-respawn (reaparição)                                 ║
║  • player-joined (novo jogador)                                ║
║  • player-left (saiu)                                          ║
║                                                                ║
║ TARGETED (Para jogador específico):                            ║
║  • game-invite (convite)                                       ║
║  • room-joined (entrou na sala)                                ║
║  • existing-players (lista inicial)                            ║
║                                                                ║
║ EMITTED (De cliente para servidor):                            ║
║  • player-move (posição)                                       ║
║  • player-shoot (tiro)                                         ║
║  • player-hit (dano)                                           ║
║  • join-room (entrar)                                          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

**Pronto para jogar multiplayer online! 🎮✨**

