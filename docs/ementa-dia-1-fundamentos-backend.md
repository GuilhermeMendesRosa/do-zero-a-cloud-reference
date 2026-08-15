# Ementa — Dia 1

## Fundamentos de desenvolvimento backend

O desenvolvimento integral desta ementa está no
[conteúdo de referência do Dia 1](conteudo-referencia-dia-1-backend.md).

## 1. Identificação

- **Workshop:** Do Zero à Cloud: construindo e publicando uma API com Spring Boot
- **Dia:** 1 — Fundamentos de desenvolvimento backend e implementação local
- **Horário:** 19h às 22h
- **Carga horária:** 3 horas, com intervalo de 15 minutos
- **Aula teórica:** 19h às 20h
- **Intervalo:** 20h às 20h15
- **Atividade prática:** 20h15 às 22h

## 2. Contexto

A aula oferece uma introdução abrangente ao desenvolvimento backend. Parte dos
fundamentos necessários para compreender uma aplicação web e apresenta também
arquiteturas, padrões e desafios encontrados em sistemas de maior escala.

Os conceitos são tratados de maneira independente de framework. O ecossistema
Java é utilizado para exemplificá-los, e o Spring Boot é empregado no bloco
prático como uma implementação concreta. Considera-se que os participantes já
tiveram contato prévio com Java e com os fundamentos de Spring Boot.

## 3. Objetivo geral

Compreender o papel de um backend, o fluxo de processamento de uma requisição e
as principais responsabilidades, decisões arquiteturais e preocupações de
qualidade envolvidas no desenvolvimento de sistemas backend, reconhecendo
também os problemas que motivam arquiteturas distribuídas e padrões de
integração.

## 4. Objetivos de aprendizagem

Ao final do dia, espera-se que o participante seja capaz de:

- explicar o papel do backend em uma arquitetura cliente-servidor;
- descrever o caminho de uma requisição entre cliente, aplicação e banco de
  dados;
- reconhecer os principais elementos de HTTP, JSON e APIs REST;
- identificar responsabilidades relacionadas a regras de negócio,
  persistência, validação, segurança e integração;
- compreender a separação de responsabilidades em uma aplicação backend;
- diferenciar testes manuais, unitários, de integração, de contrato e ponta a
  ponta;
- explicar a finalidade de CORS e distingui-lo de mecanismos de autenticação e
  autorização;
- comparar monólitos, monólitos modulares e microsserviços em nível
  introdutório;
- reconhecer os problemas tratados por cache, mensageria e arquiteturas
  orientadas a eventos;
- explicar, em nível conceitual, idempotência, consistência eventual, Outbox
  Pattern e Saga Pattern;
- relacionar os conceitos apresentados a soluções e ferramentas do ecossistema
  Java.

## 5. Ementa

Fundamentos de sistemas backend. Arquitetura cliente-servidor e
responsabilidades do backend. Processamento de regras de negócio, persistência
e integração entre sistemas. Comunicação por HTTP, representação de dados com
JSON e construção de APIs REST. Recursos, endpoints, contratos e comunicação
síncrona e assíncrona. Organização interna, separação de responsabilidades,
entidades, DTOs, validação e tratamento de erros. Estado, bancos de dados,
transações e consistência. Princípios básicos de segurança, autenticação,
autorização e CORS. Fundamentos de testes automatizados. Monólitos, monólitos
modulares e microsserviços. Cache, mensageria e arquitetura orientada a eventos.
Idempotência, entrega de mensagens, consistência eventual, Outbox Pattern e Saga
Pattern. Introdução a preocupações de observabilidade, disponibilidade,
escalabilidade e desempenho. Exemplos no ecossistema Java e aplicação prática
com Spring Boot.

## 6. Conteúdo programático da aula teórica

### 6.1. O que existe em um backend

- arquitetura cliente-servidor;
- papel de frontend, backend e banco de dados;
- processamento de regras de negócio;
- persistência e recuperação de dados;
- validação e segurança;
- integrações com outros sistemas;
- atendimento de múltiplos clientes;
- backend para além de APIs REST: tarefas agendadas, filas, eventos e
  processamento em segundo plano.

### 6.2. HTTP, JSON e APIs

- modelo de requisição e resposta;
- métodos, códigos de status, headers e body;
- JSON, serialização e desserialização;
- APIs, recursos, endpoints e contratos;
- parâmetros de rota e de consulta;
- princípios de REST;
- operações CRUD;
- comunicação síncrona e assíncrona.

### 6.3. Organização, regras de negócio e dados

- separação de responsabilidades;
- entrada, aplicação de regras e acesso a dados;
- arquitetura em camadas como uma possível organização;
- controllers, services e repositories como exemplo;
- entidades e DTOs;
- coesão e baixo acoplamento;
- dados em memória e dados persistentes;
- bancos relacionais e não relacionais;
- transações e consistência;
- SQL e mapeamento objeto-relacional.

### 6.4. Validação, erros, segurança e CORS

- validação de entradas e invariantes de negócio;
- erros do cliente e erros do servidor;
- respostas de erro consistentes;
- autenticação e autorização;
- proteção de dados e informações sensíveis;
- política de mesma origem dos navegadores;
- definição de origem por protocolo, host e porta;
- CORS, headers de permissão e requisições de preflight;
- limites de CORS como mecanismo de segurança.

### 6.5. Testes automatizados

- teste manual e teste automatizado;
- testes unitários, de integração, de contrato e ponta a ponta;
- pirâmide de testes;
- isolamento de dependências e mocks;
- padrão Arrange, Act, Assert;
- testes de comportamento e de regras de negócio;
- exemplos com JUnit, Mockito e ferramentas de teste de APIs Java.

### 6.6. Evolução arquitetural

- monólitos;
- monólitos modulares;
- microsserviços;
- implantação, escalabilidade e autonomia de componentes;
- custos da distribuição: rede, operação, observabilidade e consistência;
- critérios e trade-offs na escolha de uma arquitetura.

### 6.7. Mensageria e arquitetura orientada a eventos

- produtores, consumidores e brokers;
- filas e tópicos;
- comandos e eventos;
- desacoplamento temporal;
- processamento assíncrono;
- retries e dead-letter queues;
- possibilidade de mensagens duplicadas;
- entrega de mensagens e idempotência;
- exemplos de tecnologias utilizadas por aplicações Java.

### 6.8. Cache

- redução de latência e carga;
- caches locais e distribuídos;
- estratégia cache-aside;
- tempo de vida de entradas;
- invalidação;
- dados desatualizados e consistência;
- exemplos como Caffeine e Redis.

### 6.9. Consistência em sistemas distribuídos

- limites de transações locais;
- consistência forte e consistência eventual;
- falha entre a alteração de dados e a publicação de eventos;
- Outbox Pattern;
- duplicidade e consumidores idempotentes;
- processos de negócio distribuídos;
- Saga Pattern;
- ações compensatórias;
- orquestração e coreografia.

## 7. Distribuição sugerida da aula teórica

| Duração | Conteúdo |
|---:|---|
| 5 min | O que existe em um backend |
| 11 min | HTTP, JSON, APIs e ciclo de uma requisição |
| 10 min | Regras de negócio, organização, dados e transações |
| 7 min | Validação, erros, segurança, CORS e testes automatizados |
| 7 min | Monólitos, monólitos modulares e microsserviços |
| 8 min | Mensageria e arquitetura orientada a eventos |
| 4 min | Cache |
| 6 min | Consistência distribuída, idempotência, Outbox e Saga |
| 2 min | Síntese e conexão com a atividade prática |

A primeira parte da exposição apresenta os fundamentos necessários para a
atividade prática. A segunda oferece um mapa do horizonte da área. Nos tópicos
avançados, o objetivo é reconhecer o problema, a motivação e os trade-offs de
cada solução, e não ensinar sua implementação completa.

## 8. Relação com o ecossistema Java

Java funciona como lente para exemplos ao longo da exposição:

| Conceito | Exemplos no ecossistema Java |
|---|---|
| Aplicação web e API | Java e Spring Boot |
| Contratos de entrada e saída | Classes, records e Jackson |
| Validação | Jakarta Bean Validation |
| Persistência | JDBC, JPA, Hibernate e Spring Data JPA |
| Tratamento de erros | Exceções e respostas HTTP padronizadas |
| Testes | JUnit, Mockito e MockMvc |
| Cache | Caffeine e Redis |
| Mensageria | Kafka, RabbitMQ, Spring Kafka e Spring AMQP |

As ferramentas são apresentadas como implementações possíveis dos conceitos,
sem limitar a ementa a um framework específico.

## 9. Atividade prática

Após o intervalo, os participantes aplicarão uma parte dos fundamentos na API
Kanban fornecida para o workshop. O objetivo é percorrer um fluxo vertical:

```text
cliente
  -> requisição HTTP
  -> entrada e validação
  -> regra de negócio
  -> persistência
  -> resposta HTTP
  -> cliente
```

A prática utiliza Java, Spring Boot, PostgreSQL e o frontend fornecido. O foco é
consolidar HTTP, contratos, separação de responsabilidades, persistência,
validação, erros, CORS e testes. Os tópicos avançados apresentados na aula
teórica compõem o horizonte de aprendizagem e não precisam ser implementados no
projeto do primeiro dia.

## 10. Resultado esperado

Ao término do primeiro dia, o participante deverá possuir uma visão integrada
do desenvolvimento backend, reconhecer desafios que aparecem com o crescimento
de sistemas e ter implementado um fluxo funcional entre cliente, API Java e
banco de dados no ambiente local.
