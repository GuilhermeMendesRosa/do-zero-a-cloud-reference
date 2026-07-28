# Do Zero à Cloud

## Construindo e publicando uma API com Spring Boot

## Proposta

Workshop prático dividido em duas aulas:

1. fundamentos de backend e desenvolvimento local de uma API;
2. fundamentos de cloud e publicação da aplicação.

A narrativa principal é:

```text
Aula 1: funciona no meu computador
Aula 2: funciona publicamente na nuvem
```

Ao final, cada dupla ou trio deverá ter um frontend, uma API Spring Boot e um
banco PostgreSQL publicados no Railway.

## Tecnologias

- Java 21;
- Spring Boot;
- Spring Web;
- Spring Data JPA;
- Bean Validation;
- H2 para desenvolvimento local;
- PostgreSQL no ambiente de cloud;
- Swagger/OpenAPI;
- Docker;
- GitHub;
- Railway;
- frontend fornecido pelo instrutor.

## Organização do projeto

O instrutor fornecerá um projeto base contendo:

- frontend funcional;
- casca do backend;
- entidades e repositories, conforme o tempo disponível;
- configuração do H2;
- profiles local e cloud;
- Swagger;
- CORS;
- Dockerfile;
- alguns endpoints ou testes de exemplo.

Estrutura sugerida:

```text
udesc-backend-workshop/
├── backend/
├── frontend/
├── docs/
└── README.md
```

Cada grupo deverá fazer um fork e depois clonar o próprio repositório. O fork é
importante porque o Railway publicará o código diretamente do GitHub do grupo.

## Projeto prático

O domínio será um Kanban composto por:

- `Board`: quadro;
- `Column`: coluna;
- `Task`: tarefa.

O projeto é inspirado no desafio técnico da Ottimizza, mas seu escopo será
reduzido para caber nas duas aulas.

### Escopo obrigatório

- criar e listar quadros;
- criar e listar colunas;
- criar e listar tarefas;
- atualizar uma tarefa;
- validar dados básicos;
- retornar `404` para recursos inexistentes;
- testar a API pelo Swagger;
- integrar o frontend à API.

### Extensões

- atualizações e exclusões restantes;
- ordenação;
- testes adicionais;
- migrations com Flyway;
- autenticação.

## Arquitetura

### Ambiente local

```text
Frontend local → API Spring Boot → H2
```

### Ambiente de cloud

```text
Frontend Railway → API Railway → PostgreSQL Railway
```

Cada grupo terá três serviços no mesmo projeto Railway:

```text
Projeto do grupo
├── frontend
├── backend
└── postgres
```

## Aula 1 — Do zero à API

### Primeira metade: fundamentos de backend

Conteúdo:

- papel do backend;
- HTTP, JSON e API REST;
- métodos e status HTTP;
- estrutura de uma aplicação Spring Boot;
- fluxo `Controller → Service → Repository`;
- entidades, DTOs e relacionamentos;
- validação e tratamento de erros;
- H2;
- Swagger.

Os exemplos apresentados devem usar o mesmo domínio Kanban que será
implementado na prática.

### Segunda metade: implementação

Roteiro:

1. fazer fork e clonar o projeto;
2. executar backend e frontend;
3. abrir o Swagger;
4. implementar os endpoints obrigatórios;
5. testar a API;
6. conectar o frontend ao backend local;
7. fazer commit e push.

### Resultado esperado

```text
Frontend local → API local → H2
```

O grupo deverá terminar a aula com pelo menos um fluxo completo funcionando no
frontend.

## Aula 2 — Da API à cloud

### Primeira metade: fundamentos de cloud

Conteúdo:

- o que significa colocar uma aplicação na nuvem;
- servidor, região e disponibilidade;
- diferenças entre IaaS, PaaS e SaaS;
- visão geral de serviços AWS;
- EC2, S3, RDS, ECS, Lambda e CloudWatch;
- Dockerfile, imagem e container;
- variáveis de ambiente e secrets;
- logs e health checks;
- armazenamento efêmero;
- banco de dados externo;
- Railway como plataforma de deploy.

Uma comparação conceitual pode ser utilizada:

| Conceito | AWS | Railway |
|---|---|---|
| Execução da API | EC2/ECS | Service |
| Banco relacional | RDS | PostgreSQL |
| Logs | CloudWatch | Runtime Logs |
| Configurações e secrets | Parameter Store/Secrets Manager | Variables |
| URL pública | Load Balancer/API Gateway | Generate Domain |

### Segunda metade: publicação

Roteiro:

1. criar ou acessar a conta Railway com GitHub;
2. criar um projeto;
3. publicar o backend pelo repositório;
4. acompanhar os logs do build do Dockerfile;
5. gerar o domínio público da API;
6. testar `/actuator/health` e o Swagger;
7. adicionar PostgreSQL;
8. configurar as variáveis do Spring;
9. publicar o frontend;
10. gerar o domínio do frontend;
11. apontar o frontend para a API;
12. validar a aplicação completa.

### Resultado esperado

```text
Frontend público → API pública → PostgreSQL
```

Cada grupo deverá terminar com URLs públicas para frontend e backend.

## Configuração de ambientes

Localmente, a aplicação utilizará H2. No Railway, utilizará PostgreSQL por meio
do profile `cloud`.

Variáveis esperadas no Railway:

```text
SPRING_PROFILES_ACTIVE=cloud
SPRING_DATASOURCE_URL=jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}
SPRING_DATASOURCE_USERNAME=${{Postgres.PGUSER}}
SPRING_DATASOURCE_PASSWORD=${{Postgres.PGPASSWORD}}
```

O backend também deverá respeitar a porta fornecida pelo ambiente:

```properties
server.port=${PORT:8080}
```

## Frontend

O frontend deverá permitir que cada grupo informe a URL de sua API:

```text
URL da API:
[ https://backend-grupo.up.railway.app ]

[ Conectar ]
```

A URL pode ser armazenada no `localStorage`. Isso evita configurar uma variável
de build e republicar o frontend sempre que a URL mudar.

O backend deverá aceitar o domínio do frontend em sua configuração de CORS.

## Estratégia de segurança contra atrasos

O workshop terá resultados intermediários:

1. API local funcionando;
2. frontend local conectado;
3. API publicada com H2;
4. PostgreSQL conectado;
5. frontend publicado.

Se houver problema com PostgreSQL, o grupo ainda poderá demonstrar a API
publicada com H2. Se houver problema com o frontend, poderá demonstrar a API
pelo Swagger.

## Preparação necessária

Antes do workshop, o instrutor deverá:

- confirmar a duração das aulas e o número de alunos;
- definir duplas ou trios;
- concluir o projeto base;
- preparar uma solução de referência;
- testar o fluxo completo com uma conta nova;
- validar o Railway na rede da universidade;
- confirmar Java, Git e Node.js nos computadores;
- preparar um roteiro visual de deploy;
- verificar as condições atuais do trial gratuito;
- manter uma aplicação de demonstração publicada.

Os alunos deverão possuir uma conta GitHub ativa. É recomendável que essa conta
seja criada antes da primeira aula.

## Principais riscos

- tempo gasto criando contas;
- bloqueio de GitHub ou Railway na rede;
- build Maven demorado;
- erro de CORS;
- configuração incorreta da porta;
- falha na conexão com PostgreSQL;
- escopo de endpoints grande demais.

Esses riscos devem ser reduzidos com um ensaio no laboratório, um starter bem
preparado e checkpoints durante as atividades.

## Decisões ainda abertas

- duração exata de cada aula;
- quantidade de alunos e tamanho dos grupos;
- framework do frontend;
- contrato final da API;
- quanto do backend será entregue pronto;
- uso obrigatório ou opcional do PostgreSQL;
- formato de avaliação.

## Referências

- [Railway: Spring Boot](https://docs.railway.com/guides/spring-boot)
- [Railway: PostgreSQL](https://docs.railway.com/databases/postgresql)
- [Railway: trial gratuito](https://docs.railway.com/pricing/free-trial)
- [Railway: static hosting](https://docs.railway.com/guides/static-hosting)
- [AWS: serviços de cloud](https://aws.amazon.com/products/)

