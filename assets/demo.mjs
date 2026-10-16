// Cenário fictício, criado exclusivamente para demonstração do portfólio.
export const demoRecords=[
 ['F-001','Utilidades','Bomba centrífuga B-101','Vazamento no selo mecânico','Perda de contenção e parada parcial','Desgaste do selo',9,5,5,'PCM','Em andamento','2026-12-01','Revisar plano de inspeção e causas de falha'],
 ['F-002','Utilidades','Bomba centrífuga B-102','Cavitação recorrente','Redução de vazão e dano ao rotor','Sucção inadequada',8,5,4,'Engenharia','Aberta','2026-11-15','Revisar condições operacionais e NPSH'],
 ['F-003','Elétrica','Motor M-201','Sobreaquecimento','Parada do equipamento','Ventilação obstruída',8,6,5,'Elétrica','Aberta','2026-11-20','Inspecionar ventilação e regime de carga'],
 ['F-004','Elétrica','Painel P-01','Conexão frouxa','Risco de aquecimento localizado','Torque inadequado',10,3,4,'Elétrica','Em andamento','2026-10-30','Planejar inspeção com procedimento seguro'],
 ['F-005','Instrumentação','Sensor de pressão PT-12','Leitura instável','Controle inadequado do processo','Calibração fora de faixa',7,6,6,'Instrumentação','Aberta','2026-12-05','Conferir calibração e histórico de falhas'],
 ['F-006','Mecânica','Redutor R-18','Ruído anormal','Desgaste progressivo','Lubrificação insuficiente',7,5,5,'Mecânica','Em andamento','2026-10-01','Analisar lubrificante e realizar inspeção'],
 ['F-007','Mecânica','Ventilador V-09','Vibração elevada','Dano em mancais','Desbalanceamento',8,6,6,'Mecânica','Aberta','2026-11-03','Programar análise de vibração'],
 ['F-008','Utilidades','Compressor C-03','Pressão insuficiente','Perda de capacidade','Filtro saturado',6,4,3,'Operação','Concluída','2026-09-20','Troca de elemento filtrante executada'],
 ['F-009','Instrumentação','Transmissor FT-08','Perda de comunicação','Ausência de indicação','Falha no cabo de sinal',6,5,4,'Instrumentação','Aberta','2026-12-10','Avaliar conexões e proteção do cabo'],
 ['F-010','Elétrica','Inversor INV-04','Falha intermitente','Paradas não planejadas','Acúmulo de pó',7,4,6,'Elétrica','Em andamento','2026-11-21','Validar ventilação e plano de limpeza'],
 ['F-011','Mecânica','Transportador TC-02','Desalinhamento','Desgaste da correia','Tensão incorreta',5,4,4,'Mecânica','Concluída','2026-09-12','Ajuste de alinhamento documentado'],
 ['F-012','Utilidades','Válvula VL-27','Travamento parcial','Oscilação de vazão','Depósito de partículas',6,3,5,'PCM','Aberta','2026-12-19','Inspecionar conjunto e rever filtragem'],
 ['F-013','Elétrica','Disjuntor DJ-06','Atuação indevida','Interrupção de alimentação','Parametrização inadequada',9,3,7,'Engenharia','Aberta','2026-11-07','Validar estudo de proteção e seletividade'],
 ['F-014','Mecânica','Mancal MC-01','Aumento de temperatura','Vida útil reduzida','Lubrificação excessiva',5,5,4,'Mecânica','Concluída','2026-09-29','Corrigido procedimento de lubrificação'],
 ['F-015','Instrumentação','Chave LS-05','Não detecta nível','Intertravamento indisponível','Corrosão em contatos',9,4,6,'Instrumentação','Aberta','2026-10-18','Inspecionar circuito e testar intertravamento'],
 ['F-016','Utilidades','Bomba dosadora BD-3','Dosagem irregular','Desvio de qualidade','Válvula de retenção com desgaste',6,6,4,'Operação','Em andamento','2026-10-27','Programar inspeção da retenção']
].map(([id,sistema,ativo,modo_falha,efeito,causa,severidade,ocorrencia,deteccao,responsavel,status,prazo,acao])=>({id,sistema,ativo,modo_falha,efeito,causa,severidade,ocorrencia,deteccao,responsavel,status,prazo,acao}));
