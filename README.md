# gandalf

Oficina virtual open source — alternativa a Gather.town.
Los usuarios entran con nombre y avatar, se mueven por un mapa de oficina 2D y se ven entre sí en tiempo real.

## Requisitos previos

- [Node.js](https://nodejs.org/) (v18 o superior)
- npm

## Cómo ejecutar

Se necesitan **dos terminales**: una para el servidor y otra para el frontend.

### 1. Servidor (Socket.IO)

```bash
cd server
npm install
node index.js
```

El servidor arranca en **http://localhost:3001**.

### 2. Frontend (SvelteKit)

```bash
cd frontend
npm install
cp .env.example .env    # Crea el archivo de variables de entorno
npm run dev
```

El frontend arranca en **http://localhost:5173**.

### 3. Usar la app

1. Abre **http://localhost:5173/office** en el navegador
2. Escribe tu nombre y elige un color
3. Haz clic en **"Enter Office"**
4. Muévete con **WASD** o las **flechas del teclado**
5. Abre otra pestaña con otro nombre para ver el multijugador en tiempo real
