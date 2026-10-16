# Metodologia, premissas e limites do Reliability Lab

## 1. Objetivo

Este laboratório apresenta um **exercício de FMEA com dados fictícios**, mostrando o potencial de uma interface digital para apoiar revisão, filtros, organização e comunicação de análises de confiabilidade. As regras abaixo são **escolhas de demonstração** e não se aplicam automaticamente a qualquer instalação.

## 2. Escalas adotadas

Todos os registros recebem três notas inteiras de **1 a 10**:

- **Severidade (S)**: magnitude ilustrativa da consequência de um modo de falha.
- **Ocorrência (O)**: frequência/probabilidade qualitativa ilustrativa.
- **Detecção (D)**: dificuldade ilustrativa de detectar/prevenir o modo de falha antes do efeito; valor maior representa detecção menos favorável.

**RPN = S × O × D.** O resultado está entre **1 e 1.000**. Não é probabilidade nem frequência real; não contém base histórica por si só. Esses escores não foram calibrados, revisados ou aprovados por especialistas em instalações reais.

## 3. Regras de prioridade utilizadas na demonstração

O sistema avalia os critérios em ordem:

1. **Crítica**, se S ≥ 9 ou RPN ≥ 300.
2. **Alta**, se S ≥ 7 ou RPN ≥ 180.
3. **Média**, se RPN ≥ 80.
4. **Baixa**, nos demais casos.

O gatilho por severidade evita que casos de consequência severa recebam classificação automaticamente baixa apenas pelo produto S × O × D. Mesmo assim, a simples combinação acima **não é** validação completa de risco ou de prioridade de ação (AP). Uma análise formal exige critérios por tipo de ativo, consequência, requisitos legais e outras barreiras.

## 4. Matriz 5 × 5

Para caber numa matriz simples, cada escala de 1–10 é convertida em nível de 1–5 usando `ceil(nota / 2)`. O eixo vertical é severidade e o horizontal é ocorrência. As cores são calculadas pelo produto dos níveis 1–5:

- Baixo: produto 1 a 5.
- Moderado: 6 a 9.
- Alto: 10 a 15.
- Crítico: 16 a 25.

Essa matriz **não considera D** e deve ser interpretada separadamente dos níveis FMEA. Células exibem quantidade de registros; o mapa é um apoio visual e não uma certificação de aceitabilidade do risco.

## 5. Dados e indicadores

- Todos os 16 registros foram inventados para este portfólio.
- O RPN médio é uma média aritmética simples, apresentada apenas como resumo exploratório. Não é um indicador consolidado de risco operacional e é sensível a mudanças na composição dos registros.
- "Ações em aberto" agrega status **Aberta** e **Em andamento**.
- "Vencido" indica prazo anterior à data local do navegador e status diferente de **Concluída**. Datas de demonstração não representam compromissos reais.
- Indicadores, distribuição e matriz acompanham os filtros visíveis.

## 6. Importação, exportação e limitações

O CSV e o Excel `.xlsx` devem apresentar todos os campos previstos no layout; colunas adicionais são ignoradas. No Excel, a aplicação procura a primeira aba que contenha todos os nomes esperados no cabeçalho, sem exigir que esteja na linha 1. Não há leitura de arquivos `.xls` antigos, arquivos com senha, macros, fórmulas sem valores armazenados, tabelas externas ou consultas conectadas. Campos necessários:

`id;sistema;ativo;modo_falha;efeito;causa;severidade;ocorrencia;deteccao;responsavel;status;prazo;acao`

- `id`, `sistema`, `ativo` e `modo_falha` não podem ficar vazios.
- `severidade`, `ocorrencia`, `deteccao` devem ser inteiros de 1 a 10.
- `status`: `Aberta`, `Em andamento`, `Concluída`.
- `prazo` opcional em `AAAA-MM-DD`, com validação de data real.
- Máximo de **2 MB** ou **1.500 registros** por importação. No XLSX há também limite total de descompressão de **24 MB**.
- O conteúdo é lido no próprio navegador, sem envio das planilhas ao servidor. O formato XLSX necessita navegador com descompressão `deflate-raw` nativa.
- Ao importar, uma confirmação avisa que a base atual será **substituída**. As alterações não são salvas automaticamente.
- A data do Excel pode ser lida como valor de data ou como texto em padrão `AAAA-MM-DD`, desde que a formatação de data seja reconhecida. Recomenda-se o modelo fornecido, com prazo em texto ISO.
- Dados inválidos causam rejeição do arquivo inteiro, para evitar decisão com amostra parcial.
- Não há salvamento automático; use a exportação antes de fechar a página.
- Texto importado é renderizado sem execução de HTML. A exportação inclui proteção básica contra fórmulas em células de planilhas, mas não substitui validação de conteúdo e controles de segurança da organização.

## 7. Guia de atribuição de notas e relatório PDF

As 30 descrições do guia representam **ancoragens educacionais**, criadas para facilitar a compreensão das notas 1–10 de S, O e D. Elas não são escalas validadas. Para uso industrial real, estabelecer faixas quantitativas de ocorrência e limiares de consequência conforme o contexto de operação, histórico e avaliação multidisciplinar.

O botão **Relatório PDF** usa uma página de impressão local do navegador. Ele inclui a data, origem dos dados, filtros, contagens, regras demonstrativas e registros/ações correspondentes à seleção atual. **Para obter PDF**, escolher “Imprimir / Salvar como PDF” e depois o destino “Salvar como PDF” na caixa de impressão. Serviços de impressão ou sincronização escolhidos pelo usuário podem ter suas próprias políticas de armazenamento.

## 8. O que este laboratório não faz

Não realiza FMEA certificada ou validada para ativos reais; não calcula MTBF/MTTR, criticidade financeira, consequências ambientais reais, barreiras de segurança, FTA, LOPA, SIL, risco quantitativo, probabilidade de falha física ou priorização automatizada aprovada. Não se deve usar este painel para tomada de decisão sobre segurança, manutenção crítica ou compliance sem avaliação técnica específica e governança apropriada.

## 9. Como adaptar responsavelmente

Para uso real, seria necessário envolver engenharia de confiabilidade, operação, manutenção e segurança, padronizar escalas e consequência por ativo, definir governança para decisão de risco e ações, validar critérios com normas aplicáveis, incorporar rastreabilidade/auditoria, revisão por pares, controle de acesso, histórico de dados e homologação por ambiente.
