/** Ancoragens orientativas, NÃO calibradas para ativos reais ou derivadas de norma. */
export const SCORE_GUIDE={
  severidade:{name:'Severidade (S)',short:'Gravidade da consequência', note:'Considere o pior efeito plausível da falha, incluindo segurança, ambiente, disponibilidade e qualidade. Notas exemplificativas não substituem critérios corporativos.', descriptions:[
    'Efeito desprezível, sem impacto perceptível.',
    'Desvio muito leve, sem interrupção.',
    'Efeito leve e facilmente contornável.',
    'Perda localizada pequena de desempenho.',
    'Degradação moderada, com intervenção simples.',
    'Perda relevante de desempenho ou disponibilidade.',
    'Parada parcial importante ou consequência operacional alta.',
    'Parada significativa ou consequência grave controlável.',
    'Consequência muito grave; exige avaliação especializada.',
    'Consequência extrema potencial: tratar em processo formal de risco.'
  ]},
  ocorrencia:{name:'Ocorrência (O)',short:'Tendência de acontecer', note:'Use histórico de falhas e exposição quando disponíveis. Sem histórico, a nota é apenas uma hipótese qualitativa e deve ser registrada como tal.', descriptions:[
    'Extremamente improvável nas condições avaliadas.',
    'Muito rara; sem tendência identificada.',
    'Rara, com pouca evidência de recorrência.',
    'Pouco frequente nas condições atuais.',
    'Eventual, observada ocasionalmente.',
    'Recorrência moderada no contexto analisado.',
    'Repetição relativamente frequente.',
    'Reincidência elevada, com histórico consistente.',
    'Muito frequente, falha repetitiva persistente.',
    'Quase certa ou continuamente observada neste contexto.'
  ]},
  deteccao:{name:'Detecção (D)',short:'Dificuldade de antecipar o efeito',note:'Nota alta significa detecção pior. Avalie controles existentes e sua efetividade demonstrada; o monitoramento não é garantia de prevenção.',descriptions:[
    'Controles robustos detectam quase certamente a condição antes do efeito.',
    'Detecção muito provável, com evidências disponíveis.',
    'Boa capacidade de detecção antecipada.',
    'Detecção provável, com limitações pequenas.',
    'Detecção razoável, porém não assegurada.',
    'Controles parciais ou inspeções esporádicas.',
    'Baixa confiabilidade de detecção antecipada.',
    'Muito difícil detectar antes do efeito.',
    'Detecção remota ou sem controles efetivos comprovados.',
    'Não há meio eficaz conhecido de detectar antecipadamente.'
  ]}
};
export function gradeDescription(type,value){const n=Number(value);return SCORE_GUIDE[type]?.descriptions[n-1]||'Selecione uma nota inteira de 1 a 10.';}
