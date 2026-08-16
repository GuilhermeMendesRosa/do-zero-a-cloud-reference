# Ementa — Dia 2

## Cloud e aplicações em produção

O desenvolvimento integral desta ementa está no
[conteúdo de referência do Dia 2](conteudo-referencia-dia-2-cloud.md).

## 1. Identificação

- **Workshop:** Do Zero à Cloud: construindo e publicando uma API com Spring Boot
- **Dia:** 2 — Fundamentos de cloud e publicação da aplicação
- **Horário:** 19h às 22h
- **Carga horária:** 3 horas, com intervalo de 15 minutos
- **Aula teórica:** 19h às 20h
- **Intervalo:** 20h às 20h15
- **Atividade prática:** 20h15 às 22h

## 2. Contexto

Uma aplicação em produção precisa lidar com problemas que normalmente não
aparecem no ambiente local: acesso público, variação de demanda,
configuração por ambiente, persistência de dados, falhas, segurança de
credenciais e diagnóstico de incidentes.

A aula apresenta os principais modelos de computação em nuvem e os serviços
que compõem uma aplicação web em produção. O projeto Kanban desenvolvido no
workshop funciona como fio condutor para relacionar esses conceitos a uma
arquitetura concreta.

AWS, Google Cloud e Microsoft Azure são utilizadas como referências para
comparar categorias de serviços. O Railway é apresentado como a plataforma
utilizada na atividade prática e como exemplo de PaaS que abstrai parte
significativa da operação da infraestrutura.

## 3. Objetivo geral

Compreender os principais conceitos, serviços e decisões envolvidos na
execução de uma aplicação web em cloud, reconhecendo como escolhas de
infraestrutura, nível de abstração, custo, segurança e esforço operacional
influenciam a arquitetura de um sistema em produção.

## 4. Objetivos de aprendizagem

Ao final do dia, espera-se que o participante seja capaz de:

- explicar o que é computação em nuvem e reconhecer suas principais
  características;
- diferenciar IaaS, PaaS, SaaS e o modelo serverless/FaaS;
- relacionar abstração, controle, flexibilidade, custo direto e esforço
  operacional;
- identificar quando máquinas virtuais, containers gerenciados, plataformas
  PaaS ou funções serverless podem ser escolhas adequadas;
- distinguir Dockerfile, imagem, registry e container;
- descrever o ciclo básico de empacotamento e execução de uma aplicação com
  Docker;
- reconhecer os papéis de bancos relacionais gerenciados, armazenamento de
  objetos e armazenamento efêmero;
- explicar regiões, zonas de disponibilidade e seu impacto em latência,
  disponibilidade e custo;
- diferenciar escalabilidade vertical e horizontal;
- explicar o papel de balanceadores de carga, autoscaling e health checks;
- reconhecer a importância de variáveis de ambiente, secrets, permissões,
  backups, logs, métricas e alertas;
- relacionar necessidades arquiteturais a serviços equivalentes em AWS,
  Google Cloud, Azure e Railway.

## 5. Ementa

Fundamentos de computação em nuvem. Recursos sob demanda, elasticidade,
serviços gerenciados e cobrança por uso. Regiões e zonas de disponibilidade.
Modelos IaaS, PaaS, SaaS e serverless/FaaS. Modelo de responsabilidade
compartilhada. Trade-offs entre controle, flexibilidade, custo direto e esforço
operacional. Execução de aplicações em máquinas virtuais, containers,
plataformas gerenciadas e funções serverless. Dockerfile, imagens, registries,
containers, portas, variáveis de ambiente, volumes e armazenamento efêmero.
Bancos de dados relacionais gerenciados, armazenamento de objetos, backups,
secrets e permissões. DNS, HTTPS e acesso público. Escalabilidade vertical e
horizontal, balanceamento de carga, autoscaling, aplicações stateless, health
checks e disponibilidade. Logs, métricas, alertas, deploy, versionamento e
rollback. Serviços equivalentes em AWS, Google Cloud, Microsoft Azure e
Railway. Aplicação prática com Spring Boot, Docker, PostgreSQL, GitHub e
Railway.

## 6. Conteúdo programático da aula teórica

### 6.1. Introdução à computação em nuvem

- diferenças entre executar uma aplicação localmente, em infraestrutura
  própria e em cloud;
- recursos computacionais sob demanda;
- elasticidade e provisionamento de recursos;
- serviços gerenciados;
- cobrança baseada em uso;
- regiões geográficas e zonas de disponibilidade;
- impacto da localização em latência, disponibilidade, residência de dados e
  custo.

### 6.2. Modelos de serviço e responsabilidade

- infraestrutura como serviço — IaaS;
- plataforma como serviço — PaaS;
- software como serviço — SaaS;
- funções como serviço e serverless — FaaS;
- responsabilidades do provedor e da equipe em cada modelo;
- responsabilidade compartilhada por infraestrutura, configuração,
  permissões, dados e aplicação;
- relação entre abstração, controle e esforço operacional.

Uma maior delegação da operação ao provedor tende a elevar o custo direto do
serviço e reduzir o trabalho necessário para manter infraestrutura, segurança,
atualizações e disponibilidade. Essa relação não é absoluta: o custo total
também inclui o tempo da equipe, os riscos operacionais e a complexidade que
deixa de ser administrada internamente.

```text
mais controle                                      mais abstração

IaaS/VM -> containers gerenciados -> PaaS -> FaaS/SaaS

mais operação pela equipe               mais operação pelo provedor
maior flexibilidade                        maior conveniência
menor custo direto, em geral        maior custo direto, em geral
```

### 6.3. Onde executar uma aplicação

- máquinas virtuais e controle do sistema operacional;
- containers como unidades padronizadas de execução;
- containers gerenciados;
- plataformas PaaS;
- funções serverless orientadas a eventos;
- APIs de longa duração e processos de curta duração;
- previsibilidade e variação da carga;
- requisitos de controle, portabilidade e isolamento;
- custo direto, custo operacional e dependência do provedor como critérios
  de escolha.

| Cenário | Alternativa comum |
|---|---|
| API simples, equipe pequena e baixo esforço operacional desejado | PaaS |
| Aplicação empacotada, com necessidade de portabilidade e escala | Container gerenciado |
| Necessidade de controlar sistema operacional, rede ou software instalado | Máquina virtual |
| Tarefa breve acionada por evento, fila ou agendamento | Serverless/FaaS |

### 6.4. Docker e entrega da aplicação

- diferenças de ambiente e dependências entre desenvolvimento e produção;
- Dockerfile como receita de construção;
- imagem como pacote versionado e imutável da aplicação;
- container como instância em execução de uma imagem;
- registry como repositório de imagens;
- portas e exposição da aplicação;
- configuração por variáveis de ambiente;
- volumes, persistência e armazenamento efêmero;
- containers descartáveis e reinicialização de instâncias;
- construção e execução do projeto a partir do GitHub e do Dockerfile.

```text
código-fonte
  -> Dockerfile
  -> build
  -> imagem
  -> registry ou plataforma
  -> container em execução
```

### 6.5. Dados, configurações e segurança

- banco de dados relacional gerenciado;
- separação entre aplicação e banco;
- armazenamento de objetos para arquivos;
- diferenças entre armazenamento de objetos, banco de dados e disco local;
- perda de dados mantidos apenas no sistema de arquivos efêmero de um
  container;
- configuração por ambiente;
- variáveis de ambiente e secrets;
- riscos de credenciais armazenadas no código ou no repositório;
- identidade, permissões e princípio do menor privilégio;
- backups, recuperação e disponibilidade dos dados.

### 6.6. Rede, escalabilidade e disponibilidade

- caminho de uma requisição da internet até a aplicação;
- DNS, domínio e HTTPS;
- limites de uma única instância;
- escalabilidade vertical por aumento de recursos;
- escalabilidade horizontal por adição de instâncias;
- balanceadores de carga;
- autoscaling baseado em demanda ou métricas;
- health checks e remoção de instâncias indisponíveis;
- aplicações stateless;
- dados, arquivos e sessões fora das instâncias;
- disponibilidade e tolerância a falhas em nível introdutório.

```text
internet
  -> DNS e HTTPS
  -> balanceador de carga
  -> API: instância 1 | instância 2 | instância 3
  -> banco de dados gerenciado

arquivos
  -> armazenamento de objetos
```

### 6.7. Operação e observabilidade

- logs para diagnóstico de problemas;
- métricas de disponibilidade, latência, erros e consumo de recursos;
- alertas e acompanhamento de falhas;
- health checks e endpoints de saúde;
- fluxo entre repositório, build e deploy;
- versões da aplicação;
- atualizações, falhas de deploy e rollback;
- segurança, custo e esforço operacional como critérios permanentes de
  decisão.

## 7. Distribuição sugerida da aula teórica

| Duração | Conteúdo |
|---:|---|
| 5 min | O que é cloud, regiões e zonas de disponibilidade |
| 8 min | IaaS, PaaS, SaaS, FaaS e responsabilidade compartilhada |
| 8 min | VM, container gerenciado, PaaS e serverless: quando usar cada opção |
| 10 min | Dockerfile, imagem, registry, container e armazenamento efêmero |
| 8 min | Banco, objetos, configurações, secrets, permissões e backups |
| 9 min | DNS, HTTPS, escala, balanceamento, autoscaling e health checks |
| 7 min | Logs, métricas, alertas, deploy e rollback |
| 5 min | Comparação entre provedores e síntese aplicada ao Kanban |

Os serviços dos provedores são apresentados junto aos problemas que resolvem,
e não como um catálogo isolado. O objetivo é permitir que o participante
reconheça categorias, compreenda os principais trade-offs e saiba formular uma
decisão inicial. A configuração detalhada dos serviços fica fora do escopo da
exposição teórica.

## 8. Relação entre conceitos e provedores

| Necessidade | AWS | Google Cloud | Microsoft Azure | Railway |
|---|---|---|---|---|
| Máquina virtual | EC2 | Compute Engine | Virtual Machines | Não é o foco da plataforma |
| Container gerenciado | ECS com Fargate | Cloud Run | Container Apps | Service com Dockerfile |
| Plataforma para deploy simplificado | App Runner ou Elastic Beanstalk | App Engine | App Service | Service |
| Banco relacional gerenciado | RDS | Cloud SQL | Azure Database for PostgreSQL ou Azure SQL Database | Serviço externo |
| PostgreSQL provisionado na plataforma | — | — | — | Template PostgreSQL não gerenciado |
| Armazenamento de objetos | S3 | Cloud Storage | Blob Storage | Storage Buckets compatíveis com S3 |
| Funções serverless | Lambda | Cloud Run functions | Azure Functions | Não é o foco da plataforma |
| Logs, métricas e alertas | CloudWatch | Cloud Logging e Cloud Monitoring | Azure Monitor | Runtime Logs e métricas |
| Identidade e permissões | IAM | IAM | Microsoft Entra ID e Azure RBAC | Permissões do projeto |
| Balanceamento de carga | Elastic Load Balancing | Cloud Load Balancing | Azure Load Balancer e Application Gateway | Gerenciado pela plataforma |

Os nomes dos produtos variam, mas as necessidades arquiteturais permanecem:
executar código, persistir dados, armazenar objetos, controlar acesso,
distribuir tráfego e observar o sistema.

## 9. Atividade prática

Após o intervalo, os participantes publicarão a aplicação Kanban desenvolvida
no primeiro dia. A atividade percorre o seguinte fluxo:

```text
GitHub
  -> build do Dockerfile
  -> container da API no Railway
  -> PostgreSQL em serviço separado
  -> domínio público e HTTPS
  -> frontend publicado
  -> aplicação acessível pela internet
```

O roteiro prático contempla:

1. criar um projeto no Railway a partir do repositório do grupo;
2. publicar o backend utilizando o Dockerfile;
3. acompanhar os logs de build e de execução;
4. adicionar uma instância PostgreSQL ao projeto;
5. configurar profiles, porta, conexão com o banco e demais variáveis;
6. gerar o domínio público da API;
7. verificar o health check, o Swagger e os endpoints;
8. publicar o frontend e configurar a URL da API;
9. validar o fluxo completo entre frontend, backend e banco;
10. observar no Railway os componentes estudados na exposição teórica.

Para simplificar a prática, o Railway abstrai o encaminhamento do tráfego, TLS
e a política de reinicialização do serviço. Quando existem múltiplas réplicas,
a plataforma também distribui as requisições entre elas. Esses mecanismos são
relacionados aos conceitos da aula, mas não precisam ser configurados
manualmente pelos participantes.

## 10. Resultado esperado

Ao término do segundo dia, o participante deverá compreender as principais
decisões envolvidas na execução de uma aplicação em cloud e reconhecer como
computação, dados, rede, segurança, escala e observabilidade se relacionam.
Cada grupo deverá ter publicado o frontend, a API Spring Boot e o banco
PostgreSQL, obtendo um fluxo funcional acessível publicamente.

```text
frontend público -> API pública -> PostgreSQL no Railway
```
