# Guia do usuário — Reliability Lab

**Ferramenta demonstrativa de FMEA para Engenharia de Manutenção e Confiabilidade**

Não é preciso saber programar, usar IA ou criar conta para utilizar a demonstração online.

## Como abrir

Quando a ferramenta estiver publicada no GitHub Pages, abra no navegador o link disponibilizado pela autora. Prefira **Chrome ou Edge atualizado**. A demonstração abre com **16 casos fictícios**, que podem ser pesquisados, alterados e restaurados.

Para usar os arquivos baixados, a versão atual exige executar um servidor HTTP local — não basta clicar duas vezes no `index.html`. Usuários não técnicos devem preferir o link publicado.

## Para experimentar em 5 passos

1. **Veja a base fictícia.** Na parte superior estão quatro indicadores e uma matriz de risco; abaixo está a tabela de modos de falha.
2. **Entenda as notas.** Clique em `Consultar exemplos para cada nota (1–10)` para ler os significados ilustrativos de Severidade (S), Ocorrência (O) e Detecção (D).
3. **Edite um registro.** Na tabela escolha `Editar`, mude uma nota de 1 a 10 e salve. O RPN e as prioridades serão recalculados.
4. **Importe uma planilha.** Baixe o [modelo Excel](../exemplos/fmea_modelo.xlsx), preencha a aba `FMEA` e clique em `Importar Excel / CSV`. A importação substitui a base anterior depois de sua confirmação. Também funciona com [CSV](../exemplos/fmea_demo.csv).
5. **Salve o resultado.** Clique em `Exportar CSV` para conservar os registros. Para o relatório, clique em `Relatório PDF`, depois em `Imprimir / Salvar como PDF` e escolha `Salvar como PDF` no navegador.

## O que preencher na planilha

| Campo | Como preencher |
|---|---|
| id | Código único do registro, como `F-001` |
| sistema | Área ou sistema, como `Utilidades` |
| ativo | Equipamento avaliado, como `Bomba B-102` |
| modo_falha | Como a falha se manifesta, como `Cavitação` |
| efeito | Consequência técnica ou operacional esperada |
| causa | Hipótese ou mecanismo relacionado ao modo de falha |
| severidade | Nota inteira 1–10 para a consequência |
| ocorrencia | Nota inteira 1–10 para a tendência de ocorrência |
| deteccao | Nota inteira 1–10 para a dificuldade de detecção |
| responsavel | Pessoa ou equipe indicada para avaliar a ação |
| status | `Aberta`, `Em andamento` ou `Concluída` |
| prazo | Data no padrão `AAAA-MM-DD` ou célula de data reconhecida |
| acao | Ação sugerida, dependente de validação técnica |

A importação aceita até 1.500 registros e 2 MB. O Excel precisa estar no formato `.xlsx`; `.xls` e arquivos protegidos por senha não são aceitos. Se a planilha contiver erros, a importação inteira será recusada com aviso, sem substituir os registros já em uso.

## Entenda os resultados

- **RPN = S × O × D**. É um índice ilustrativo de priorização, não uma probabilidade de falha.
- **Prioridade Crítica:** S ≥ 9 ou RPN ≥ 300. **Alta:** S ≥ 7 ou RPN ≥ 180. **Média:** RPN ≥ 80. **Baixa:** demais casos.
- **Matriz 5×5:** usa S e O agrupados de 1 a 5. Sua cor não é idêntica à classificação por RPN, pois D não participa do mapa.
- **Ações em aberto:** soma registros com status `Aberta` ou `Em andamento`.
- **Relatório PDF:** considera os filtros e a ordenação ativos no momento da geração; um filtro aplicado pode ocultar registros.

## O que o sistema não faz

Não consulta o SAP automaticamente, não determina risco aceitável, não faz avaliação de segurança e não salva histórico. **Qualquer uso com equipamentos reais exige critérios formalizados, dados autorizados e revisão de profissionais habilitados.**

## Privacidade e guarda dos dados

O processamento é local no seu navegador; não há banco de dados do Reliability Lab. **Se fechar ou atualizar a página, as edições serão perdidas**; exporte para CSV antes de sair. Não utilize dados corporativos confidenciais em demonstrações públicas sem autorização. Dados importados não são automaticamente verificados.

## Perguntas frequentes

**Preciso instalar algo?** Se usar o link publicado, não. Basta um navegador atual.

**A ferramenta usa inteligência artificial?** Não. Ela aplica regras matemáticas explicitadas na metodologia.

**Onde fica o meu relatório?** Após clicar em `Imprimir / Salvar como PDF`, escolha o destino `Salvar como PDF` na caixa de impressão; o navegador solicitará a pasta para salvar.

**Os exemplos de notas são normas oficiais?** Não; são orientações didáticas e não substituem escalas aprovadas pela organização.
