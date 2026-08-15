# Kanban Frontend

SPA em React, TypeScript, Vite e shadcn/ui para consumir a API Kanban do workshop **Do Zero à Cloud**.

## Executar localmente

Requisitos: Node.js 20 ou superior e o backend em execução.

```bash
npm install
cp .env.example .env
npm run dev
```

Por padrão, o frontend usa `http://localhost:8090`. Para outra API, altere o `.env`:

```text
VITE_API_URL=https://seu-backend.up.railway.app
```

Informe apenas a origem, sem `/api/v1`; o cliente acrescenta esse prefixo automaticamente.

## Comandos

```bash
npm run dev       # servidor de desenvolvimento
npm run build     # build de produção em dist/
npm run start     # serve o build usando PORT ou a porta 4173
```

## Publicar no Railway

1. Crie um serviço a partir do seu repositório.
2. Defina o diretório raiz do serviço como `/projetos/kanban-frontend`.
3. Adicione `VITE_API_URL` com a URL pública do seu backend.
4. Publique o serviço. O `railway.toml` contém os comandos de build e inicialização.

Cada aluno publica seu próprio frontend e backend. A URL da API é incorporada durante o build, portanto uma alteração em `VITE_API_URL` exige novo deploy do frontend.
