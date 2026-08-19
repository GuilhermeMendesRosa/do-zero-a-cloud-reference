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
npm run preview   # pré-visualiza o build localmente
```

## Publicar no Railway

1. Crie um serviço a partir do seu repositório.
2. Defina o diretório raiz do serviço como `/projetos/kanban-frontend`.
3. Em **Config File Path**, informe `/projetos/kanban-frontend/railway.toml`.
4. Adicione `VITE_API_URL` com a URL pública do backend. Se o serviço do backend se chamar `backend`, use uma referência:

   ```text
   VITE_API_URL=https://${{backend.RAILWAY_PUBLIC_DOMAIN}}
   ```

5. Publique o serviço. O Railway detectará o `Dockerfile`, construirá o frontend e executará o Caddy na porta fornecida pela plataforma.

O container lê `VITE_API_URL` quando inicia. A mesma imagem pode, portanto, ser usada com backends diferentes sem um novo build. Na ausência da variável, o frontend utiliza `http://localhost:8090`.

`VITE_API_URL` é exposta ao navegador e deve conter somente a origem pública da API, sem credenciais e sem `/api/v1`. O cliente acrescenta esse prefixo automaticamente.
