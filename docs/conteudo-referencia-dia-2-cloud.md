# Conteúdo de referência — Dia 2

## Cloud e aplicações em produção

Este documento desenvolve o conteúdo da
[ementa do segundo dia](ementa-dia-2-cloud.md). Ele foi pensado como material de
estudo e como fonte para a criação dos slides do workshop **Do Zero à Cloud**.

O texto é deliberadamente mais profundo do que a exposição de 60 minutos. Na
aula, o objetivo é apresentar um modelo mental confiável: quais problemas
aparecem quando uma aplicação vai para produção, quais categorias de serviço
podem resolvê-los e quais responsabilidades permanecem com a equipe.

As referências priorizam normas, documentação oficial, guias de arquitetura e
materiais mantidos pelos próprios projetos e provedores. Os nomes comerciais
são exemplos atuais de categorias arquiteturais; produtos mudam, mas as
necessidades de executar código, persistir dados, controlar acesso, distribuir
tráfego e observar o sistema permanecem.

---

## 1. O que é computação em nuvem

Computação em nuvem não significa apenas “usar o computador de outra pessoa”.
Essa frase ajuda a lembrar que existe infraestrutura física, mas omite as
características que tornam a cloud diferente de simplesmente alugar um servidor.

A definição de referência do
[NIST SP 800-145](https://csrc.nist.gov/pubs/sp/800/145/final) descreve cloud
como um modelo de acesso sob demanda, pela rede, a um conjunto compartilhado de
recursos configuráveis que podem ser provisionados e liberados rapidamente.

O NIST identifica cinco características essenciais:

1. **autosserviço sob demanda:** o consumidor provisiona recursos sem depender
   de atendimento manual do provedor;
2. **amplo acesso pela rede:** os recursos são acessíveis por mecanismos
   padronizados;
3. **pool compartilhado de recursos:** capacidade física é agrupada e alocada
   dinamicamente entre consumidores;
4. **elasticidade rápida:** recursos podem crescer ou diminuir conforme a
   necessidade;
5. **serviço mensurado:** uso pode ser medido, controlado e cobrado.

Essas características explicam por que “cloud” é mais que localização. Uma VM
em um datacenter remoto pode ser apenas hospedagem tradicional se não houver
provisionamento rápido, medição e elasticidade.

### 1.1. A cloud continua sendo física

Por trás de consoles e APIs existem:

- datacenters;
- servidores;
- processadores e memória;
- discos e sistemas de armazenamento;
- switches, roteadores e links;
- energia, refrigeração e segurança física;
- equipes e sistemas que operam toda essa infraestrutura.

A diferença é a camada de abstração. O consumidor pede “uma VM com 2 CPUs”,
“um banco PostgreSQL” ou “execute esta função”, enquanto o provedor decide como
atender a solicitação usando sua infraestrutura.

### 1.2. Elasticidade não é o mesmo que escalabilidade

**Escalabilidade** é a capacidade de aumentar ou reduzir capacidade.
**Elasticidade** é a adaptação dessa capacidade à demanda, frequentemente de
forma automática e dinâmica.

Uma aplicação pode ser escalável, mas não elástica: a equipe consegue adicionar
uma instância manualmente, porém a capacidade não acompanha a carga sozinha.

### 1.3. Cloud não é automaticamente barata

Cloud troca investimento antecipado em infraestrutura por consumo de serviços.
Isso reduz barreiras de entrada e permite experimentar rapidamente, mas não
garante menor custo em todos os cenários.

O custo total inclui:

- recursos computacionais;
- armazenamento;
- tráfego de saída;
- serviços adicionais;
- licenças e suporte;
- horas da equipe;
- disponibilidade exigida;
- riscos e incidentes;
- complexidade que a equipe passa a operar.

O guia de gestão financeira do
[AWS Cloud Adoption Framework](https://docs.aws.amazon.com/whitepapers/latest/aws-caf-governance-perspective/cloud-financial-management.html)
inclui trabalho, licenças, recursos compartilhados, risco e valor produzido na
análise financeira. Comparar somente a mensalidade de uma VM com a de uma PaaS
produz uma visão incompleta.

---

## 2. Regiões, zonas e domínios de falha

Provedores organizam a infraestrutura em localidades. A nomenclatura exata
varia, mas dois conceitos aparecem com frequência.

### 2.1. Região

Uma região é uma área geográfica na qual o provedor oferece serviços. Recursos
regionais são criados em uma região escolhida pelo consumidor.

A escolha afeta:

- latência até os usuários;
- serviços disponíveis;
- preço;
- requisitos legais e residência de dados;
- comunicação com outros sistemas;
- estratégia de recuperação de desastre.

Para usuários majoritariamente no Brasil, uma região próxima pode reduzir
latência, mas custo e disponibilidade de serviços também precisam ser avaliados.

### 2.2. Zona de disponibilidade

Uma região costuma conter localidades isoladas chamadas zonas de
disponibilidade. O objetivo é criar domínios de falha separados dentro de uma
mesma região.

A documentação de
[regiões e zonas da AWS](https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions-availability-zones.html)
explica que as zonas possuem infraestrutura física independente e conexão de
baixa latência entre si. Executar tudo em uma única zona mantém um ponto de
falha: se a zona ficar indisponível, todas as réplicas daquele local podem ser
afetadas.

~~~text
Região
├── Zona A: aplicação 1
├── Zona B: aplicação 2
└── Zona C: banco secundário
~~~

Distribuir componentes entre zonas melhora disponibilidade, mas adiciona custo
e não acontece automaticamente em todo produto.

### 2.3. Alta disponibilidade não é multirregião

Uma arquitetura com múltiplas zonas resiste a parte das falhas locais. Uma
arquitetura multirregião busca resistir a falhas regionais, mas exige decisões
mais difíceis:

- replicação de dados;
- roteamento global;
- consistência;
- recuperação e failover;
- custo duplicado;
- testes de desastre.

Para o Kanban do workshop, uma única região é suficiente. O objetivo é
compreender que escolher uma região não torna o sistema automaticamente
redundante.

---

## 3. IaaS, PaaS, SaaS e serverless

O [NIST SP 800-145](https://csrc.nist.gov/pubs/sp/800/145/final) define três
modelos clássicos: IaaS, PaaS e SaaS. Eles descrevem até onde vai a capacidade
entregue pelo provedor e quanto o consumidor ainda administra.

### 3.1. IaaS — Infrastructure as a Service

Em IaaS, o provedor entrega recursos básicos como computação, rede e
armazenamento. A equipe controla sistema operacional, runtime e aplicação.

Exemplo: criar uma VM no EC2, Compute Engine ou Azure Virtual Machines.

A equipe normalmente continua responsável por:

- escolher e atualizar o sistema operacional;
- aplicar patches;
- instalar Java e outros runtimes;
- configurar firewall e rede;
- configurar deploy;
- monitorar recursos;
- reiniciar ou substituir máquinas;
- planejar backup e disponibilidade.

IaaS oferece controle, mas cobra esse controle em trabalho operacional.

### 3.2. PaaS — Platform as a Service

Em PaaS, a equipe entrega código ou uma imagem e a plataforma administra grande
parte da infraestrutura e do runtime.

Exemplos incluem Railway, Azure App Service, Google App Engine e AWS App Runner.
O [Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/overview),
por exemplo, hospeda aplicações e APIs sem exigir administração direta da
infraestrutura subjacente.

A equipe ainda é responsável por:

- código e regras de negócio;
- dependências;
- configuração da aplicação;
- dados;
- permissões;
- observabilidade da aplicação;
- capacidade e plano contratados;
- comportamento diante de falhas.

PaaS não remove responsabilidade; muda seu nível.

### 3.3. SaaS — Software as a Service

Em SaaS, o provedor oferece a aplicação pronta. O consumidor utiliza e configura
o produto, mas não implanta seu próprio backend.

Exemplos típicos:

- Gmail;
- GitHub;
- Notion;
- ferramentas de CRM;
- plataformas de videoconferência.

O foco deixa de ser operar software e passa a ser administrar usuários, dados,
configurações e integração.

### 3.4. FaaS e serverless

Serverless não significa ausência de servidores. Significa que o consumidor não
administra os servidores e trabalha com uma unidade de execução mais abstrata.

Em FaaS, código é organizado como funções chamadas por eventos. O provedor
provisiona capacidade, executa e escala. A descrição da
[AWS Lambda](https://docs.aws.amazon.com/lambda/latest/api/Welcome.html) inclui
manutenção do sistema, provisionamento e escala automática como
responsabilidades do serviço.

Casos comuns:

- processar um arquivo após upload;
- reagir a uma mensagem;
- executar tarefa agendada;
- transformar dados;
- atender um webhook;
- executar uma operação curta e independente.

Limitações e trade-offs:

- tempo máximo de execução;
- inicialização a frio em alguns cenários;
- modelo de programação orientado a eventos;
- estado local descartável;
- observabilidade distribuída;
- limites específicos do provedor;
- custo que depende do padrão de chamadas.

A CNCF descreve serverless como execução e escala guiadas pela demanda, sem
administração de servidores; veja o
[material introdutório da CNCF](https://www.cncf.io/blog/2018/02/14/cncf-takes-first-step-towards-serverless-computing/).

### 3.5. Um contínuo de abstração

~~~text
mais controle                                      mais abstração

VM/IaaS -> container gerenciado -> PaaS -> FaaS -> SaaS

mais operação pela equipe               mais operação pelo provedor
maior flexibilidade                        maior conveniência
menor custo direto, em geral        maior custo direto, em geral
~~~

Essa última linha é uma tendência, não uma lei. Um serviço gerenciado pode ter
preço unitário maior e custo total menor porque reduz trabalho, risco e tempo
até a entrega.

A pergunta madura não é apenas “qual produto custa menos?”, mas:

> O custo adicional de delegar esta responsabilidade é menor ou maior que o
> custo de a equipe operá-la com a confiabilidade necessária?

### 3.6. Responsabilidade compartilhada

O provedor protege e opera determinadas camadas; o consumidor continua
responsável pelo uso correto do serviço.

| Camada | VM/IaaS | PaaS | SaaS |
|---|---|---|---|
| Datacenter e hardware | Provedor | Provedor | Provedor |
| Virtualização | Provedor | Provedor | Provedor |
| Sistema operacional | Equipe | Provedor | Provedor |
| Runtime | Equipe | Em grande parte, provedor | Provedor |
| Código da aplicação | Equipe | Equipe | Provedor |
| Configuração e acessos | Equipe | Equipe | Equipe |
| Dados e seu uso | Equipe | Equipe | Equipe |

Mesmo em SaaS, conceder acesso administrativo a todos continua sendo uma falha
do consumidor. Mesmo em PaaS, colocar uma senha no repositório continua sendo
uma falha da equipe.

---

## 4. Como escolher onde executar a aplicação

Escolher compute é escolher um conjunto de responsabilidades. O
[guia de decisão de compute do Azure](https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/technology-choices-overview)
compara opções por tipo de carga, habilidades da equipe, escala e esforço
operacional.

### 4.1. Máquina virtual

Escolha uma VM quando houver necessidade real de:

- controlar o sistema operacional;
- instalar software específico;
- usar configuração de rede incomum;
- executar aplicação legada;
- manter compatibilidade com ambiente existente;
- controlar detalhadamente capacidade e isolamento.

Uma API Spring Boot pode rodar em VM, mas a equipe precisa construir a
plataforma ao redor dela.

~~~text
VM
├── sistema operacional e patches
├── Java
├── processo da aplicação
├── proxy/TLS
├── logs
├── monitoramento
└── estratégia de deploy
~~~

### 4.2. Container gerenciado

Um serviço de containers gerenciados recebe uma imagem e administra parte da
execução. Exemplos: ECS com Fargate, Google Cloud Run e Azure Container Apps.

É adequado quando:

- a aplicação já possui Dockerfile;
- portabilidade do pacote importa;
- é necessário controlar runtime e dependências;
- a equipe não quer operar máquinas ou cluster;
- escala horizontal é desejada;
- a carga é compatível com containers descartáveis.

O [Cloud Run](https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run)
é um exemplo de plataforma que executa código ou containers sem exigir gestão
de cluster e inclui escala e revisões.

### 4.3. PaaS

PaaS é uma escolha forte para:

- equipes pequenas;
- APIs web convencionais;
- protótipos e produtos em estágio inicial;
- prazo curto;
- pouca necessidade de infraestrutura personalizada.

O risco é depender de limites e convenções da plataforma. Essa dependência pode
ser aceitável. Portabilidade possui custo e nem todo sistema precisa otimizar
uma migração hipotética.

### 4.4. FaaS

FaaS é especialmente adequado para trabalho:

- acionado por evento;
- curto;
- independente;
- intermitente;
- capaz de tolerar reinicialização e repetição;
- sem dependência de estado local.

Transformar uma API web inteira em dezenas de funções não é automaticamente
melhor. Granularidade, latência, observabilidade e limites da plataforma
precisam justificar a mudança.

### 4.5. Comparação de decisão

| Critério | VM | Container gerenciado | PaaS | FaaS |
|---|---|---|---|---|
| Controle | Alto | Médio/alto | Médio/baixo | Baixo |
| Operação própria | Alta | Média | Baixa | Muito baixa |
| Portabilidade | Média | Alta no pacote | Varia | Varia |
| Escala automática | Configurada pela equipe | Frequentemente integrada | Frequentemente integrada | Intrínseca ao modelo |
| Melhor encaixe | Legado e requisitos específicos | APIs containerizadas | Web apps convencionais | Eventos e tarefas curtas |

Não existe vencedor universal. A escolha depende da carga, equipe, orçamento,
risco e horizonte do produto.

---

## 5. Docker: do código ao container

Docker padroniza como uma aplicação e suas dependências são empacotadas e
executadas.

~~~text
código
  -> Dockerfile
  -> build
  -> imagem
  -> registry ou plataforma
  -> container em execução
~~~

### 5.1. Container não é máquina virtual

Uma VM virtualiza uma máquina completa e executa seu próprio sistema
operacional. Um container é, de forma simplificada, um processo isolado que
compartilha o kernel do host.

| Aspecto | VM | Container |
|---|---|---|
| Unidade | Máquina virtual | Processo isolado |
| Sistema operacional | Guest próprio | Compartilha kernel do host |
| Inicialização | Geralmente mais lenta | Geralmente mais rápida |
| Imagem | Inclui sistema completo | Inclui aplicação, runtime e arquivos necessários |
| Isolamento | Mais forte por padrão | Isolamento por recursos do sistema |

Container não é uma fronteira absoluta de segurança. Imagens, permissões,
usuário do processo e atualizações continuam importantes.

### 5.2. Dockerfile

Um Dockerfile é um documento de instruções usado para construir uma imagem,
conforme a [referência oficial](https://docs.docker.com/reference/dockerfile).

Instruções frequentes:

| Instrução | Papel |
|---|---|
| **FROM** | define imagem base e inicia um estágio |
| **WORKDIR** | define diretório de trabalho |
| **COPY** | copia arquivos para a imagem |
| **RUN** | executa comando durante o build |
| **USER** | define usuário de execução |
| **EXPOSE** | documenta a porta esperada |
| **ENTRYPOINT** | define o executável principal |

**EXPOSE** não publica a porta por si só. A plataforma precisa encaminhar
tráfego e a aplicação precisa escutar na porta correta.

### 5.3. Imagem

Uma imagem é um pacote padronizado com arquivos, binários, bibliotecas e
configuração necessária para iniciar um container. A
[documentação de imagens do Docker](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/)
destaca duas propriedades:

- imagens são imutáveis; uma alteração gera nova imagem;
- imagens são compostas por camadas.

Camadas permitem reaproveitar partes do build. Se dependências não mudaram,
uma reconstrução pode reutilizar cache.

### 5.4. Container

Container é uma instância em execução da imagem. Vários containers podem nascer
da mesma imagem:

~~~text
imagem kanban:v1
├── container A
├── container B
└── container C
~~~

Cada container tem processo e camada gravável próprios. Alterar um container
não altera a imagem original.

### 5.5. Registry

Registry armazena e distribui imagens. Docker Hub, Amazon ECR, Google Artifact
Registry e Azure Container Registry são exemplos.

O fluxo explícito é:

~~~text
docker build -> tag -> push -> pull -> run
~~~

A documentação de
[build, tag e publicação](https://docs.docker.com/get-started/docker-concepts/building-images/build-tag-and-publish-an-image/)
detalha esse ciclo. Em plataformas como Railway, a imagem pode ser construída e
mantida internamente sem um push manual do participante.

### 5.6. Armazenamento efêmero

Arquivos gravados na camada do container pertencem àquela instância. Quando o
container é destruído, esses dados não devem ser considerados duráveis. A
[documentação de storage do Docker](https://docs.docker.com/engine/storage)
separa a camada gravável do container de volumes e outros mounts persistentes.

Consequências:

- não colocar banco de produção dentro do mesmo container da API;
- não guardar uploads apenas em diretório local;
- não depender de arquivo criado manualmente dentro da instância;
- usar banco, object storage ou volume conforme a natureza do dado.

### 5.7. Build multi-stage

Build multi-stage usa mais de uma instrução **FROM**. Um estágio contém
ferramentas de compilação; outro recebe apenas o artefato necessário em
produção. Isso reduz tamanho e superfície de ataque. Veja
[Multi-stage builds](https://docs.docker.com/get-started/docker-concepts/building-images/multi-stage-builds/).

### 5.8. Leitura do Dockerfile do Kanban

O backend usa dois estágios:

~~~dockerfile
FROM eclipse-temurin:17-jdk AS build

WORKDIR /workspace

COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -q -DskipTests dependency:go-offline

COPY src src
RUN ./mvnw -q -DskipTests package && cp target/kanban-backend-*.jar app.jar

FROM eclipse-temurin:17-jre

RUN useradd --system --uid 1001 spring
USER spring

COPY --from=build --chown=spring:spring /workspace/app.jar /app.jar

EXPOSE 8090
ENTRYPOINT ["java", "-jar", "/app.jar"]
~~~

Leitura linha a linha:

1. o estágio **build** possui JDK e ferramentas para compilar;
2. wrapper e pom são copiados antes do código para favorecer cache das
   dependências;
3. o Maven gera o JAR;
4. o segundo estágio usa somente JRE;
5. a aplicação roda como usuário sem privilégios de root;
6. somente o JAR passa do estágio de build para o runtime;
7. a porta 8090 é documentada;
8. o processo principal é Java.

O Dockerfile não contém credenciais nem URL do banco. Esses valores pertencem
ao ambiente de execução.

---

## 6. Configuração, variáveis e secrets

O mesmo artefato deve poder rodar em ambientes diferentes. O que muda é a
configuração.

~~~text
mesma imagem
├── ambiente local: banco localhost
├── homologação: banco de teste
└── produção: banco de produção
~~~

A metodologia
[Twelve-Factor App](https://www.12factor.net/) recomenda separar configuração
do código, manter processos stateless e distinguir build, release e run. O
[Spring Boot](https://docs.spring.io/spring-boot/reference/features/external-config.html)
suporta propriedades, YAML, argumentos e variáveis de ambiente como fontes
externas.

### 6.1. Configuração do projeto

O backend contém:

~~~properties
server.port=${PORT:8090}

spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/kanban}
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD:postgres}
~~~

À esquerda está a propriedade Spring. Dentro de cada expressão está a variável
do ambiente e, depois dos dois-pontos, o valor local padrão.

Isso permite:

- executar localmente sem preencher todas as variáveis;
- usar a porta fornecida pela plataforma;
- apontar a mesma imagem para outro banco;
- evitar recompilar para cada ambiente.

### 6.2. Variável não é automaticamente secret

Variáveis de ambiente são um canal de configuração. Valores sensíveis exigem
controles adicionais:

- acesso limitado ao painel e à API;
- ocultação na interface;
- não registrar valores em logs;
- rotação;
- auditoria;
- escopo mínimo.

No Railway, variáveis podem ser seladas, e referências podem consumir valores
de outro serviço; veja
[Using Variables](https://docs.railway.com/variables).

### 6.3. Menor privilégio

Uma identidade deve possuir apenas as permissões necessárias durante o tempo
necessário. As
[boas práticas do AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/best-practices.html)
reforçam o princípio de menor privilégio.

Exemplos:

- API acessa apenas seu banco;
- frontend não recebe senha do banco;
- desenvolvedor não usa credencial administrativa na aplicação;
- serviço de leitura não recebe permissão de exclusão;
- segredo de produção não é reutilizado localmente.

---

## 7. Dados em produção

### 7.1. Banco fora da aplicação

Quando a API escala horizontalmente, todas as instâncias precisam observar o
mesmo estado persistente:

~~~text
API 1 ─┐
API 2 ─┼──> PostgreSQL
API 3 ─┘
~~~

Instalar um PostgreSQL dentro de cada container da API criaria bancos
independentes e descartáveis. Banco e aplicação têm ciclos de vida diferentes
e devem ser implantados separadamente.

### 7.2. Banco gerenciado

Um banco gerenciado pode assumir tarefas como:

- provisionamento;
- patches;
- backups automatizados;
- replicação;
- failover;
- monitoramento integrado.

Isso não elimina decisões de schema, índices, consultas, retenção, acesso e
restauração. A documentação do
[Amazon RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html)
mostra backups automatizados e recuperação dentro da janela configurada; a
configuração continua sendo escolha do consumidor.

### 7.3. A nuance do PostgreSQL no Railway

O template PostgreSQL do Railway cria rapidamente um serviço com volume e
variáveis de conexão. Porém, a
[documentação atual do Railway](https://docs.railway.com/databases/postgresql)
o classifica como **não gerenciado**: backups, recuperação, tuning, segurança,
monitoramento e manutenção continuam sob responsabilidade do usuário.

Portanto:

- “provisionado pela plataforma” não significa necessariamente “gerenciado”;
- conveniência inicial não determina a responsabilidade operacional;
- para o workshop, o template é suficiente;
- para produção real, requisitos de backup e recuperação precisam ser
  projetados explicitamente.

### 7.4. Armazenamento de objetos

Object storage guarda objetos identificados por chave em buckets. É adequado
para:

- imagens;
- anexos;
- vídeos;
- backups;
- arquivos estáticos;
- grandes objetos que não precisam de consultas relacionais.

O [Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/) é o exemplo
mais conhecido. Seus equivalentes incluem Cloud Storage e Azure Blob Storage.

Object storage não substitui banco relacional:

| Necessidade | Banco relacional | Object storage |
|---|---|---|
| Consultar entidades e relações | Adequado | Inadequado |
| Transações e constraints | Adequado | Limitado/não é o foco |
| Guardar arquivo grande | Possível, nem sempre ideal | Adequado |
| Acesso por chave/URL | Possível | Natural |

### 7.5. Backup, alta disponibilidade e durabilidade

São conceitos diferentes:

- **backup:** cópia recuperável de um estado anterior;
- **alta disponibilidade:** continuar atendendo apesar de determinadas falhas;
- **durabilidade:** probabilidade de o dado permanecer intacto;
- **replicação:** manter cópias sincronizadas;
- **recuperação de desastre:** restaurar o serviço após evento grave.

Replicação não substitui backup: uma exclusão acidental pode ser replicada.
Backup não garante disponibilidade imediata: restaurar pode levar tempo.

Dois objetivos ajudam a discutir recuperação:

- **RPO:** quanto dado a organização aceita perder;
- **RTO:** quanto tempo aceita ficar sem o serviço.

Backup que nunca foi restaurado é apenas uma esperança. Testes de recuperação
fazem parte da estratégia.

---

## 8. Rede: como a requisição chega à aplicação

Uma URL pública esconde várias etapas:

~~~text
usuário
  -> DNS
  -> conexão HTTPS
  -> edge/proxy/balanceador
  -> instância saudável da API
  -> banco
~~~

### 8.1. DNS

DNS relaciona nomes, como **api.exemplo.com**, a informações necessárias para
encontrar o serviço. Ele desacopla o endereço usado pelo cliente da
infraestrutura concreta.

Trocar instâncias não deveria exigir que o usuário conheça novos endereços IP.
O domínio permanece; a infraestrutura atrás dele muda.

### 8.2. HTTPS e TLS

HTTPS utiliza TLS para proteger a comunicação e autenticar o servidor por meio
de certificado. Isso reduz risco de leitura e alteração do tráfego em trânsito.

TLS não corrige uma aplicação vulnerável e não autoriza usuários. Ele protege o
canal.

O Railway oferece domínios públicos e provisionamento automático de certificado,
conforme sua documentação de
[Public Networking](https://docs.railway.com/public-networking).

### 8.3. Balanceador de carga

Um balanceador recebe tráfego e o distribui entre destinos:

~~~text
                    ┌── API 1
cliente -> balanceador ── API 2
                    └── API 3
~~~

O
[Application Load Balancer da AWS](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html)
pode distribuir tráfego entre VMs, containers e IPs e usa health checks para
avaliar destinos.

Além de distribuir, um balanceador pode:

- terminar TLS;
- rotear por host ou caminho;
- retirar destinos não saudáveis;
- centralizar o ponto público;
- apoiar atualizações graduais.

### 8.4. Health check

Health check responde se uma instância pode receber tráfego. Uma resposta
superficial “o processo está vivo” pode não detectar que o banco está
inacessível.

É útil distinguir:

- **liveness:** o processo está vivo ou precisa ser reiniciado?;
- **readiness:** está pronto para receber tráfego?;
- **startup:** já terminou a inicialização?

O Spring Boot Actuator expõe informações de saúde; veja o
[endpoint health](https://docs.spring.io/spring-boot/api/rest/actuator/health.html).
O projeto oferece:

~~~text
GET /actuator/health
~~~

No Railway, o health check configurado participa da ativação de um novo deploy,
mas a documentação esclarece que ele não funciona como monitoramento contínuo
depois da ativação; veja
[Railway Healthchecks](https://docs.railway.com/deployments/healthchecks).

---

## 9. Escalabilidade e disponibilidade

### 9.1. Escala vertical

Escalar verticalmente significa dar mais capacidade a uma unidade:

~~~text
2 CPU / 4 GB -> 4 CPU / 8 GB -> 8 CPU / 16 GB
~~~

Vantagens:

- simplicidade;
- pouca mudança na aplicação;
- útil para bancos e sistemas não distribuídos.

Limitações:

- existe teto;
- instância maior pode custar desproporcionalmente;
- permanece uma única unidade de falha;
- mudança pode exigir reinício.

### 9.2. Escala horizontal

Escalar horizontalmente significa adicionar instâncias:

~~~text
1 instância -> 2 instâncias -> 5 instâncias
~~~

Vantagens:

- capacidade incremental;
- possibilidade de tolerar falha de uma instância;
- redução de capacidade quando a demanda cai.

Custos:

- balanceamento;
- concorrência;
- coordenação;
- observabilidade agregada;
- estado precisa ser compartilhado externamente.

### 9.3. Stateless

Uma aplicação stateless não depende da memória ou do disco de uma instância
específica para atender a próxima requisição. Isso não significa “sem dados”;
significa que o estado durável está fora do processo.

~~~text
requisição A -> API 1 -> banco compartilhado
requisição B -> API 2 -> banco compartilhado
~~~

O [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_mitigate_interaction_failure_stateless.html)
relaciona statelessness à substituição de servidores e à escala horizontal.

### 9.4. Autoscaling

Autoscaling ajusta a quantidade ou capacidade de instâncias conforme sinais:

- CPU;
- memória;
- requisições por segundo;
- latência;
- tamanho de fila;
- agenda;
- métrica de negócio.

É necessário configurar:

- mínimo e máximo;
- limiar;
- janela de avaliação;
- velocidade de crescimento;
- velocidade de redução;
- tempo de inicialização.

Autoscaling não corrige código lento nem banco saturado. Ele pode multiplicar
requisições contra o gargalo e piorar a situação.

### 9.5. Disponibilidade como propriedade da arquitetura

Executar duas instâncias na mesma zona protege contra falha de processo, mas não
contra falha da zona. Executar API em várias zonas com banco em uma única
instância ainda mantém o banco como ponto único de falha.

Pergunte sempre:

1. qual falha queremos tolerar?;
2. que componente ainda é único?;
3. como a falha é detectada?;
4. como o tráfego muda?;
5. como os dados são recuperados?;
6. isso foi testado?

---

## 10. Observabilidade e operação

Publicar é o início da operação. Depois do deploy, a equipe precisa responder:

- o serviço está funcionando?;
- usuários estão recebendo erros?;
- ficou mais lento?;
- qual versão está ativa?;
- onde a requisição falhou?;
- a capacidade está perto do limite?

### 10.1. Logs

Logs registram eventos discretos:

~~~text
2026-08-16T22:10:03Z INFO  request completed status=200 duration_ms=42
2026-08-16T22:10:05Z ERROR database connection failed
~~~

Boas práticas:

- timestamp;
- nível;
- serviço e ambiente;
- identificador de correlação;
- mensagem útil;
- contexto estruturado;
- nunca registrar senhas, tokens ou dados sensíveis desnecessários.

Em containers, é comum escrever em stdout/stderr e deixar a plataforma coletar.

### 10.2. Métricas

Métricas agregam valores ao longo do tempo:

- taxa de requisições;
- taxa de erros;
- latência;
- CPU e memória;
- conexões do banco;
- fila pendente.

O capítulo
[Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
do Google SRE apresenta quatro sinais úteis: latência, tráfego, erros e
saturação.

### 10.3. Traces

Um trace acompanha o caminho de uma operação por componentes. É especialmente
útil quando a requisição atravessa frontend, API, banco e integrações.

O
[Observability Primer do OpenTelemetry](https://opentelemetry.io/docs/concepts/observability-primer/)
descreve logs, métricas e traces como sinais complementares.

### 10.4. Monitoramento e alerta

Monitorar é coletar e visualizar. Alertar é notificar quando uma condição exige
ação.

Um bom alerta:

- representa impacto real ou risco iminente;
- possui responsável;
- contém contexto;
- permite uma ação;
- evita ruído repetitivo.

Saúde não é observabilidade. Um endpoint pode responder 200 enquanto 20% dos
usuários recebem erro em um fluxo específico.

---

## 11. Build, release, deploy e rollback

### 11.1. Etapas diferentes

~~~text
commit
  -> build
  -> testes
  -> imagem/artefato
  -> configuração da release
  -> deploy
  -> health check
  -> tráfego
~~~

- **build:** transforma código em artefato;
- **release:** combina artefato e configuração;
- **deploy:** coloca a release no ambiente;
- **run:** mantém os processos em execução.

Separar essas etapas permite reproduzir e auditar o que foi publicado.

### 11.2. Imutabilidade

O mesmo artefato aprovado deve avançar entre ambientes. Recompilar de forma
diferente em produção reduz a confiança de que o que foi testado é o que está
rodando.

Tags como **latest** são convenientes, mas um digest ou identificador de versão
é mais preciso para saber exatamente qual imagem foi executada.

### 11.3. Estratégias de atualização

- **recreate:** para versão antiga e inicia nova;
- **rolling:** substitui instâncias gradualmente;
- **blue/green:** mantém dois ambientes e troca o tráfego;
- **canary:** envia pequena parte do tráfego à nova versão.

Quanto mais sofisticada a estratégia, mais recursos e observabilidade são
necessários.

### 11.4. Rollback

Rollback volta código e configuração para versão conhecida. Entretanto, banco
de dados exige cuidado: uma migration destrutiva pode impedir retorno do código.

Para o workshop, **hibernate.ddl-auto=update** simplifica a criação do schema.
Em produção, ferramentas de migration e mudanças compatíveis entre versões são
preferíveis.

O Railway registra deployments e permite ações de rollback conforme retenção
do plano; veja a
[referência de deployments](https://docs.railway.com/deployments/reference).

---

## 12. Serviços e equivalências

As equivalências abaixo são conceituais, não identidades perfeitas. Produtos
diferem em limites, preço, integração e responsabilidade.

| Necessidade | AWS | Google Cloud | Microsoft Azure | Railway |
|---|---|---|---|---|
| VM | EC2 | Compute Engine | Virtual Machines | Não é o foco |
| Container gerenciado | ECS + Fargate | Cloud Run | Container Apps | Service com Dockerfile |
| PaaS web | App Runner/Elastic Beanstalk | App Engine | App Service | Service |
| Banco relacional gerenciado | RDS | Cloud SQL | Azure Database for PostgreSQL/Azure SQL | Conectar serviço externo |
| PostgreSQL provisionado na plataforma | — | — | — | Template PostgreSQL não gerenciado |
| Object storage | S3 | Cloud Storage | Blob Storage | Storage Buckets |
| Funções | Lambda | Cloud Run functions | Azure Functions | Não é o foco principal |
| Logs e métricas | CloudWatch | Cloud Logging/Monitoring | Azure Monitor | Observability/Runtime Logs |
| Identidade | IAM | Cloud IAM | Entra ID e Azure RBAC | Permissões de projeto |
| Balanceamento | Elastic Load Balancing | Cloud Load Balancing | Load Balancer/Application Gateway | Abstraído no serviço |

### 12.1. EC2

EC2 entrega máquinas virtuais. É compute de baixo nível relativo: a AWS opera
hardware e virtualização; o consumidor administra o sistema e a aplicação.

Use quando o controle da VM for uma necessidade, não apenas por familiaridade.

### 12.2. RDS

RDS entrega bancos relacionais gerenciados. Ele reduz trabalho de
provisionamento, backup e disponibilidade, conforme configuração escolhida.

Banco gerenciado ainda exige modelagem, índices, consultas, permissões, limites
de conexão e testes de restauração.

### 12.3. S3

S3 é object storage. O conceito fundamental é bucket + chave + objeto e
metadados. É adequado para arquivos, não para substituir tabelas relacionais.

### 12.4. Lambda

Lambda executa funções em resposta a chamadas e eventos. É adequado para
unidades curtas e stateless; não é automaticamente o melhor lugar para toda
API.

### 12.5. CloudWatch

CloudWatch reúne sinais e recursos de monitoramento no ecossistema AWS. Ele
exemplifica a categoria de observabilidade, assim como Cloud
Logging/Monitoring e Azure Monitor.

### 12.6. Por que Railway parece mais simples

No workshop, Railway concentra várias responsabilidades:

- conecta ao GitHub;
- detecta ou usa o Dockerfile;
- constrói imagem;
- executa container;
- fornece domínio;
- provisiona TLS;
- disponibiliza logs;
- injeta variáveis;
- oferece rede privada entre serviços;
- permite política de reinicialização.

Essa conveniência exemplifica PaaS. Ela reduz o número de recursos que o
participante configura diretamente. Não significa que segurança, backup,
capacidade e comportamento da aplicação deixem de importar.

A documentação de
[deployments do Railway](https://docs.railway.com/deployments/reference)
descreve o ciclo de build, imagem, execução e health check.

---

## 13. Arquitetura do Kanban no Railway

### 13.1. Visão dos componentes

~~~text
Navegador
  -> Frontend Railway
  -> API Spring Boot em container
  -> PostgreSQL em serviço separado
~~~

No projeto Railway:

~~~text
Projeto do grupo
├── frontend
├── backend
└── Postgres
~~~

O backend é construído pelo Dockerfile. O frontend usa a configuração presente
em **railway.toml**. O Postgres é provisionado a partir do template do Railway.

### 13.2. Variáveis do backend

Configuração coerente com o **application.properties** atual:

~~~text
DB_URL=jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
JPA_DDL_AUTO=update
~~~

O Railway fornece **PORT**. A aplicação usa:

~~~properties
server.port=${PORT:8090}
~~~

Referenciar variáveis mantém os valores sincronizados entre serviços. A
[referência de variáveis do Railway](https://docs.railway.com/variables/reference)
documenta a sintaxe.

### 13.3. Health check

O caminho sugerido para o backend é:

~~~text
/actuator/health
~~~

Antes de ativar a nova versão, a plataforma pode aguardar resposta HTTP 200.
Isso evita direcionar tráfego imediatamente a um processo que ainda inicializa.

### 13.4. Frontend

O frontend precisa conhecer a origem pública da API no build:

~~~text
VITE_API_URL=https://dominio-publico-do-backend
~~~

Variáveis com prefixo **VITE_** são incorporadas ao bundle do frontend. Elas
não são secrets: qualquer valor enviado ao navegador pode ser inspecionado pelo
usuário.

### 13.5. Rede pública e privada

- navegador para frontend e API: rede pública e HTTPS;
- backend para PostgreSQL: preferencialmente rede privada do projeto;
- banco não precisa ser exposto ao navegador;
- frontend nunca recebe credenciais do banco.

### 13.6. O que observar durante a prática

Cada ação prática corresponde a um conceito:

| Ação | Conceito |
|---|---|
| Conectar GitHub | origem da release |
| Ler Dockerfile | empacotamento |
| Acompanhar build | criação do artefato |
| Configurar variáveis | separação entre código e ambiente |
| Adicionar Postgres | backing service e persistência |
| Gerar domínio | entrada pública e DNS |
| Acessar HTTPS | TLS gerenciado |
| Ver logs | observabilidade |
| Testar health | prontidão do deploy |
| Alterar e republicar | ciclo de release |

---

## 14. Armadilhas frequentes

### “Está em cloud, então está altamente disponível”

Não necessariamente. Uma VM em uma zona continua sendo uma única instância.

### “Tenho duas réplicas, então os dados estão protegidos”

Réplicas da API não protegem o banco. Replicação do banco também não substitui
backup.

### “Docker guarda o ambiente inteiro para sempre”

A imagem é reproduzível; a camada gravável do container é descartável.

### “EXPOSE publica a aplicação”

EXPOSE documenta uma porta. Publicação exige encaminhamento da plataforma e
processo escutando corretamente.

### “Variável de ambiente é sempre segura”

Ela separa configuração do código, mas ainda precisa de controle de acesso,
ocultação, rotação e cuidado com logs.

### “Serverless não usa servidor”

O servidor existe; a administração foi transferida ao provedor.

### “Mais gerenciado sempre custa mais”

O preço direto tende a crescer com conveniência, mas o custo total pode cair
quando trabalho e risco operacional são considerados.

### “Health check substitui monitoramento”

Health check responde uma pergunta estreita. Monitoramento acompanha
comportamento e impacto ao longo do tempo.

### “Railway PostgreSQL é equivalente ao RDS em responsabilidade”

Não. O template facilita provisionamento, mas a documentação do Railway o
classifica como não gerenciado.

---

## 15. Síntese para o participante

### O que deve ficar claro ao final

1. Cloud é um modelo de acesso elástico e mensurado a recursos, não apenas um
   servidor remoto.
2. Região e zona representam localização e domínio de falha.
3. IaaS, PaaS, SaaS e FaaS transferem responsabilidades em graus diferentes.
4. Mais abstração tende a reduzir operação própria, mas pode elevar custo
   direto e dependência do provedor.
5. Custo total inclui recursos, pessoas, risco, disponibilidade e tempo.
6. VM, container, PaaS e função resolvem perfis diferentes de carga.
7. Dockerfile constrói imagem; container executa imagem; registry distribui
   imagem.
8. Containers devem ser tratados como descartáveis.
9. Banco, uploads e estado durável ficam fora das instâncias da API.
10. Configuração varia por ambiente; secrets não pertencem ao repositório.
11. Escala horizontal depende de balanceamento e aplicação stateless.
12. Autoscaling reage a sinais, mas não corrige gargalos arquiteturais.
13. Alta disponibilidade, backup e recuperação são propriedades diferentes.
14. Logs, métricas e traces respondem perguntas complementares.
15. Deploy seguro precisa de versão, health check, observação e possibilidade
    de rollback.
16. Serviços com nomes diferentes exercem papéis arquiteturais semelhantes.

### Perguntas de revisão

1. Quais características distinguem cloud de simples hospedagem?
2. Qual é a diferença entre região e zona de disponibilidade?
3. Que responsabilidades permanecem com a equipe em uma PaaS?
4. Quando uma VM pode ser melhor que uma PaaS?
5. Quando uma função serverless é uma boa escolha?
6. Qual é a diferença entre imagem e container?
7. Por que o Dockerfile do Kanban possui dois estágios?
8. Por que EXPOSE 8090 não obriga a plataforma a usar essa porta?
9. Por que uploads não devem ficar na camada gravável do container?
10. Qual é a diferença entre banco provisionado e banco gerenciado?
11. Por que duas réplicas da API precisam compartilhar um banco externo?
12. Qual é a diferença entre escala vertical e horizontal?
13. Por que uma aplicação stateless escala horizontalmente com mais facilidade?
14. Que problema o balanceador resolve?
15. Qual é a diferença entre health check e monitoramento?
16. Como logs, métricas e traces se complementam?
17. Por que rollback de código pode ser afetado por migrations?
18. Como avaliar se o custo de uma PaaS compensa?

---

## 16. Glossário

| Termo | Definição resumida |
|---|---|
| Cloud | Modelo de acesso sob demanda a recursos compartilhados e mensurados |
| Região | Área geográfica que hospeda recursos de cloud |
| Zona de disponibilidade | Domínio de falha isolado dentro de uma região |
| IaaS | Infraestrutura entregue como serviço |
| PaaS | Plataforma gerenciada para executar aplicações |
| SaaS | Aplicação pronta consumida como serviço |
| FaaS | Execução de funções acionadas por chamadas ou eventos |
| Serverless | Modelo no qual a gestão dos servidores é abstraída |
| VM | Máquina virtual com sistema operacional próprio |
| Dockerfile | Receita de construção de uma imagem |
| Imagem | Pacote imutável usado para iniciar containers |
| Container | Instância isolada em execução de uma imagem |
| Registry | Repositório e distribuidor de imagens |
| Volume | Armazenamento com ciclo de vida separado do container |
| Efêmero | Que pode desaparecer com a substituição da instância |
| Object storage | Armazenamento de objetos identificados por chave |
| Secret | Valor sensível usado por aplicação ou infraestrutura |
| IAM | Gestão de identidades, papéis e permissões |
| TLS | Protocolo que protege comunicação em trânsito |
| DNS | Sistema que resolve nomes para informações de localização de serviços |
| Load balancer | Componente que distribui tráfego entre destinos |
| Health check | Verificação automatizada da capacidade de uma instância |
| Stateless | Sem dependência de estado local entre requisições |
| Escala vertical | Aumento dos recursos de uma instância |
| Escala horizontal | Aumento do número de instâncias |
| Autoscaling | Ajuste automático de capacidade |
| Alta disponibilidade | Capacidade de continuar atendendo diante de falhas definidas |
| RPO | Perda máxima de dados aceitável |
| RTO | Tempo máximo aceitável para recuperação |
| Observabilidade | Capacidade de entender o estado interno pelas saídas do sistema |
| Rollback | Retorno a uma versão anterior |

---

## 17. Referências

### Fundamentos de cloud

- NIST. [SP 800-145 — The NIST Definition of Cloud Computing](https://csrc.nist.gov/pubs/sp/800/145/final).
- NIST. [Evaluation of Cloud Computing Services Based on NIST SP 800-145](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.500-322.pdf).
- CNCF. [Introduction to serverless computing](https://www.cncf.io/blog/2018/02/14/cncf-takes-first-step-towards-serverless-computing/).
- AWS. [Regions and Availability Zones](https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions-availability-zones.html).
- AWS. [Cloud Financial Management](https://docs.aws.amazon.com/whitepapers/latest/aws-caf-governance-perspective/cloud-financial-management.html).

### Escolha de compute e serviços

- AWS. [Overview of Compute Services](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/compute-services.html).
- AWS. [AWS Lambda](https://docs.aws.amazon.com/lambda/latest/api/Welcome.html).
- Google Cloud. [Cloud products and services](https://cloud.google.com/solutions).
- Google Cloud. [What is Cloud Run](https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run).
- Google Cloud. [Cloud Run functions](https://cloud.google.com/functions).
- Microsoft. [Choose an Azure compute service](https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/technology-choices-overview).
- Microsoft. [Azure App Service overview](https://learn.microsoft.com/en-us/azure/app-service/overview).
- Microsoft. [Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/).

### Docker e aplicações cloud-native

- Docker. [Docker concepts](https://docs.docker.com/get-started/docker-concepts/).
- Docker. [Dockerfile reference](https://docs.docker.com/reference/dockerfile).
- Docker. [What is an image?](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/).
- Docker. [Build, tag and publish an image](https://docs.docker.com/get-started/docker-concepts/building-images/build-tag-and-publish-an-image/).
- Docker. [Multi-stage builds](https://docs.docker.com/get-started/docker-concepts/building-images/multi-stage-builds/).
- Docker. [Storage](https://docs.docker.com/engine/storage).
- Open Container Initiative. [OCI Image Specification](https://specs.opencontainers.org/image-spec/).
- The Twelve-Factor App. [The Twelve Factors](https://www.12factor.net/).

### Dados, segurança e confiabilidade

- AWS. [Amazon S3 User Guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/).
- AWS. [Amazon RDS automated backups](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html).
- AWS. [Amazon RDS Multi-AZ](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html).
- AWS. [Secrets Manager best practices](https://docs.aws.amazon.com/secretsmanager/latest/userguide/best-practices.html).
- AWS. [Make systems stateless where possible](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_mitigate_interaction_failure_stateless.html).
- AWS. [Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html).

### Spring Boot e observabilidade

- Spring. [Externalized Configuration](https://docs.spring.io/spring-boot/reference/features/external-config.html).
- Spring. [Actuator Health API](https://docs.spring.io/spring-boot/api/rest/actuator/health.html).
- OpenTelemetry. [Observability Primer](https://opentelemetry.io/docs/concepts/observability-primer/).
- Google. [Monitoring Distributed Systems — Site Reliability Engineering](https://sre.google/sre-book/monitoring-distributed-systems/).

### Railway

- Railway. [Dockerfiles](https://docs.railway.com/builds/dockerfiles).
- Railway. [Deployments](https://docs.railway.com/deployments/reference).
- Railway. [Healthchecks](https://docs.railway.com/deployments/healthchecks).
- Railway. [Scaling](https://docs.railway.com/deployments/scaling).
- Railway. [Restart Policy](https://docs.railway.com/deployments/restart-policy).
- Railway. [Variables](https://docs.railway.com/variables).
- Railway. [Public Networking](https://docs.railway.com/public-networking).
- Railway. [PostgreSQL](https://docs.railway.com/databases/postgresql).
- Railway. [Data and Storage](https://docs.railway.com/data-storage).
