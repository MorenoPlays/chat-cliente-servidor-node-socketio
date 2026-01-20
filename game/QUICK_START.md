# ⚡ QUICK START - Jogar Multiplayer

## 1️⃣ Iniciar o Servidor

```bash
cd server
npm install
npm run dev
```

✅ Deve aparecer: `🚀 Servidor Socket.IO rodando na porta 3001`

---

## 2️⃣ Iniciar o Cliente

```bash
npm run dev
```

✅ Deve abrir em `http://localhost:5173`

---

## 3️⃣ Jogar com Múltiplos Jogadores

### **Abrir 2 Abas do Navegador:**
1. Aba 1: `http://localhost:5173` (Jogador 1)
2. Aba 2: `http://localhost:5173` (Jogador 2)

### **Em Cada Aba:**
1. **Login** com uma conta diferente
2. **Go to Dashboard**
3. **Selecionar o outro jogador** e clicar "Criar Jogo"

### **No Convite:**
- Jogador 2 recebe notificação
- Clica "Aceitar"
- Entra na Sala de Espera

### **Iniciar Jogo:**
- Jogador 1 (host) clica "Iniciar Jogo"
- **Ambos entram no `/game`**

---

## 4️⃣ Controles in-Game

```
W/A/S/D       - Mover
Mouse Move    - Rotação
Click Esq     - Atirar
```

---

## 5️⃣ Ver Status

**Canto Superior Direito da Tela:**
```
Players: 2
Ping: 45ms
Kills: 0
Deaths: 0
Health: 100/100
```

✅ Se aparecer = Conectado com sucesso!
❌ Se não aparecer = Socket não conectou (ver Troubleshooting)

---

## 🔴 Erro Comum: "Socket não conecta"

### **Solução:**
```bash
# 1. Verificar se servidor está rodando
cd server && npm run dev

# 2. Verificar porta 3001 (matá-la se necessário)
lsof -i :3001  # Ver processos na porta
kill -9 XXXXXX # Matar processo

# 3. Tentar novamente
npm run dev
```

---

## 📊 Exemplo de Gameplay

```
Jogador 1 (Host)          Jogador 2 (Guest)
═══════════════════════   ═══════════════════

[Dashboard]               [Dashboard]
   │                         │
   └─ Cria Sala ───────────  │
      "Convida Player2"       │
                              │
                    [Notificação]
                         │
                         └─ Aceita
                              │
                    [Sala de Espera]
   [Sala de Espera]           │
        │                     │
        └─ "Iniciar Jogo" ───→│
                              │
   [Game] ←────────────── [Game]
     │                       │
     │ emit: player-move ────→│ recv: update-positions
     │ emit: player-shoot ───→│
     │ emit: player-hit ─────→│
     │                        │
     ←──── emit: player-move ─│
     ←──── on: player-killed─│
     │                        │
   [Score: 1 Kill]   [Score: 0 Kills]
```

---

## 🎯 Checklist

- [ ] Servidor rodando em porta 3001
- [ ] Cliente rodando em porta 5173
- [ ] 2 abas diferentes com 2 contas
- [ ] Criar jogo e aceitar convite
- [ ] Iniciar jogo
- [ ] Ver outros jogadores no mapa
- [ ] Conseguir atirar/matar
- [ ] Ver "Ping: Xms" no debug panel

✅ Se tudo checked = Multiplayer funcionando perfeitamente!

---

**Divirta-se! 🎮🔫**

