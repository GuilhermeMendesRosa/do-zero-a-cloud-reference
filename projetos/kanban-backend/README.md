# Kanban Backend

API REST em Java 17 e Spring Boot 4 para gerenciar quadros Kanban, colunas e
tarefas. A implementação segue o contrato do desafio da Ottimizza.

## Requisitos

- Java 17;
- PostgreSQL 14 ou superior;
- banco local `kanban` acessível pela aplicação.


As credenciais podem ser substituídas por variáveis de ambiente:

```text
DB_URL=jdbc:postgresql://localhost:5432/kanban
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

## Executar

```bash
./mvnw spring-boot:run
```

Depois da inicialização:

- API: `http://localhost:8090/api/v1`;
- Swagger UI: `http://localhost:8090/swagger-ui.html`;
- OpenAPI JSON: `http://localhost:8090/v3/api-docs`;
- health check: `http://localhost:8090/actuator/health`.

## Testar

```bash
./mvnw test
```

Os testes dos services usam JUnit e Mockito e não dependem de um banco em
execução.

## Endpoints

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/v1/board` | Lista quadros |
| `POST` | `/api/v1/board` | Cria um quadro |
| `PUT` | `/api/v1/board/{boardId}` | Atualiza um quadro |
| `DELETE` | `/api/v1/board/{boardId}` | Exclui um quadro |
| `GET` | `/api/v1/column/from/{boardId}` | Lista colunas do quadro |
| `POST` | `/api/v1/column` | Cria uma coluna |
| `PUT` | `/api/v1/column/{columnId}` | Atualiza uma coluna |
| `DELETE` | `/api/v1/column/{columnId}` | Exclui uma coluna |
| `GET` | `/api/v1/task/from/{columnId}` | Lista tarefas da coluna |
| `POST` | `/api/v1/task/from/{columnId}` | Cria uma tarefa |
| `PUT` | `/api/v1/task/{taskId}` | Atualiza uma tarefa |
| `DELETE` | `/api/v1/task/{taskId}` | Exclui uma tarefa |

## Railway

Variáveis esperadas no serviço do backend:

```text
SPRING_DATASOURCE_URL=jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}
SPRING_DATASOURCE_USERNAME=${{Postgres.PGUSER}}
SPRING_DATASOURCE_PASSWORD=${{Postgres.PGPASSWORD}}
```

O Railway fornece `PORT` automaticamente. O `Dockerfile` já respeita essa
configuração por meio da propriedade `server.port`. Durante o workshop, a API
aceita requisições de qualquer origem nos endpoints `/api/**`.
