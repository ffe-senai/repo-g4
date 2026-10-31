# 🏭 SMART 4.0 – Módulo G4: Rastreabilidade & QR Code

Módulo do **Grupo 4** da Estação SMART 4.0. É o inspetor de qualidade da esteira: acompanha as peças que passam, registra cada uma no histórico e mostra se foi **aprovada** ou **rejeitada**. Funciona como um **remote de Module Federation**, carregado pelo App Shell do Grupo 1.

---

## 📚 Objetivo do Projeto

* Registrar uma nova linha no histórico **sempre que o código da peça mudar** (ex.: `PECA-8831`)
* Classificar a peça pela **qualidade**: etiqueta **verde (APROVADA)** se for **≥ 80%** e **vermelha (REJEITADA)** se for **< 80%**
* Evitar duplicatas: a mesma peça parada na esteira não é registrada várias vezes seguidas
* Manter o histórico **ordenado por data/hora** (mais recentes primeiro)

---

## 🗺️ Funcionalidades

* 📡 **Telemetria da esteira:** escuta o evento global `smart40:telemetria` (`detail.ultimaPecaLida`)
* 📷 **Leitor de câmera QR:** o conteúdo do QR é o ID da peça (para teste sem a máquina)
* ⌨️ **Entrada manual:** ID, qualidade (%) e lote, com prévia do resultado
* 🚦 **Indicador de inspeção:** painel grande com a última peça, a qualidade e o resultado
* 📋 **Tabela de histórico:** hora, ID, lote, origem, qualidade e etiqueta colorida
* 🔌 **Conexão e máquina:** aviso de emergência, alarme ou falha de segurança

---

## 📡 Dados e Eventos

* **Telemetria global:** `window` → `smart40:telemetria` com `detail.ultimaPecaLida`
  * ID da peça: `idPeca` (ou `id`)
  * Qualidade: `qualidade` (0 a 100)
  * Opcionais: `lote`, `timestamp`
* **Barramento (Module Federation):** consome `traceability.piece-scanned`, `connection.state` e `machine.telemetry`
* **Publica:** `traceability.piece-scanned` (contrato v0.1.0) com `result` calculado e `quality` extra, a cada leitura local

> ⚠️ Projeto em modo **simulação**. Nenhum comando é enviado ao CLP, ao robô ou à planta física.

---

## 🛠️ Tecnologias Utilizadas

* **React 19**
* **Vite**
* **Module Federation** (`@module-federation/vite`)
* **html5-qrcode** (leitura de QR pela câmera)
* **CSS puro**, escopado em `.g4` para não afetar o Shell

---

## 🌐 Como Rodar o Projeto

Requisito: **Node.js 20.19+**

```bash
npm install
npm run dev
```

> 🔗 http://localhost:8083

> ⚠️ A câmera só funciona em `localhost` ou em **HTTPS**.

Para testar a telemetria sem a máquina, cole no console do navegador:

```js
window.dispatchEvent(new CustomEvent('smart40:telemetria', {
  detail: { ultimaPecaLida: { idPeca: 'PECA-8831', qualidade: 92 } },
}));
```

---

## 🧩 Integração com o App Shell

No Vite do host:

```js
remotes: {
  smart40_g4: {
    type: 'module',
    name: 'smart40_g4',
    entry: 'http://localhost:8083/remoteEntry.js',
  },
},
shared: {
  react: { singleton: true },
  'react-dom': { singleton: true },
},
```

Uso no Shell:

```jsx
const Traceability = lazy(() => import('smart40_g4/Traceability'));

<Traceability bus={bus} />
```

`bus` é opcional: `{ subscribe(handler) => unsubscribe, publish(event) }`. Sem ele, o módulo roda sozinho.

---

## ☁️ Deploy

Hospedado na **Vercel** (o `vercel.json` libera CORS para o `remoteEntry.js`). Em produção, o `entry` do host passa a ser:

```
https://SEU-PROJETO.vercel.app/remoteEntry.js
```

---

## 📁 Estrutura

```
rastreabilidade-qrcode/
├── src/
│   ├── Traceability.jsx        # componente exposto ao Shell
│   ├── components/             # CameraReader, ManualForm, HistoryTable, ...
│   ├── hooks/useTraceability.js
│   ├── bus.js                  # barramento local (modo standalone)
│   ├── events.js               # regra de qualidade e montagem dos eventos
│   ├── contract/               # contrato-smart40-v0_1.ts
│   ├── traceability.css
│   └── main.jsx                # entrada standalone
├── vercel.json
├── vite.config.js
└── index.html
```

---

## 🎓 Contexto Acadêmico

Projeto em equipe da **Estação SMART 4.0**, dividido em módulos por grupo (App Shell, IHM, Robô UR, Rastreabilidade e Expedição). Este repositório é o módulo do **Grupo 4**.

---

## 🚀 Status do Projeto

🟡 Em desenvolvimento
