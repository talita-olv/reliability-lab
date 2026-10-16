import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateRpn,priority,matrixLevel,matrixRisk,summary,parseCsv,exportCsv,safeCsvCell,validateRecord,normalizeRecord,isOverdue,HEADERS} from '../assets/core.mjs';
import {demoRecords} from '../assets/demo.mjs';

test('RPN multiplica severidade, ocorrência e detecção',()=>assert.equal(calculateRpn({severidade:9,ocorrencia:5,deteccao:5}),225));
test('valores fora da escala geram erro',()=>{
  assert.throws(()=>calculateRpn({severidade:0,ocorrencia:5,deteccao:5}),RangeError);
  assert.throws(()=>calculateRpn({severidade:8.5,ocorrencia:5,deteccao:5}),RangeError);
});
test('severidade >= 9 prioriza caso independentemente do RPN',()=>assert.equal(priority({severidade:9,ocorrencia:1,deteccao:1}),'Crítica'));
test('limiares de RPN demonstrativos são aplicados',()=>{
  assert.equal(priority({severidade:6,ocorrencia:10,deteccao:5}),'Crítica');
  assert.equal(priority({severidade:6,ocorrencia:6,deteccao:5}),'Alta');
  assert.equal(priority({severidade:5,ocorrencia:4,deteccao:4}),'Média');
  assert.equal(priority({severidade:2,ocorrencia:2,deteccao:3}),'Baixa');
});
test('faixa de severidade 7 também eleva prioridade',()=>assert.equal(priority({severidade:7,ocorrencia:1,deteccao:1}),'Alta'));
test('matriz visual converte de 1-10 para 1-5',()=>{assert.equal(matrixLevel(1),1);assert.equal(matrixLevel(2),1);assert.equal(matrixLevel(9),5);assert.equal(matrixLevel(10),5);assert.equal(matrixRisk(10,10),'Crítica');});
test('resumo vazio não divide por zero',()=>{const s=summary([]);assert.equal(s.averageRpn,0);assert.equal(s.open,0);});
test('registros de demonstração válidos e IDs únicos',()=>{
  assert.equal(new Set(demoRecords.map(r=>r.id)).size,demoRecords.length);
  for(const r of demoRecords)assert.deepEqual(validateRecord(r),[]);
});
test('CSV exportado faz ida e volta sem perdas',()=>{
  const parsed=parseCsv(exportCsv(demoRecords));
  assert.equal(parsed.length,demoRecords.length);
  assert.deepEqual(parsed.map(normalizeRecord),demoRecords);
});
test('parser CSV suporta separador vírgula e campos entre aspas',()=>{
  const row=Object.fromEntries(HEADERS.map(h=>[h,'']));Object.assign(row,demoRecords[0],{modo_falha:'Eixo, desbalanceado',efeito:'Com "ruído" e vibração'});
  const csv=HEADERS.join(',')+'\n'+HEADERS.map(k=>'"'+String(row[k]).replaceAll('"','""')+'"').join(',');
  assert.equal(parseCsv(csv)[0].efeito,'Com "ruído" e vibração');
});
test('parser CSV suporta quebra de linha entre aspas',()=>{
  const csv=exportCsv([{...demoRecords[0],efeito:'Falha\nem operação'}]);
  assert.equal(parseCsv(csv)[0].efeito,'Falha\nem operação');
});
test('parser rejeita colunas ausentes e aspas sem fechamento',()=>{
  assert.throws(()=>parseCsv('id;sistema\nF-1;teste'),/Colunas ausentes/);
  assert.throws(()=>parseCsv('id;campo\n"aberto;teste'),/aspas não fechadas/);
});
test('exportação protege início de fórmula em células CSV',()=>{
  for(const s of ['=1+2','+SUM(A1:A2)','-3+4','@SUM(1)'])assert.ok(safeCsvCell(s).includes("'"+s));
});
test('prazo atrasado apenas para ações não concluídas',()=>{
  assert.equal(isOverdue({...demoRecords[0],status:'Aberta',prazo:'2026-01-01'},'2026-10-15'),true);
  assert.equal(isOverdue({...demoRecords[0],status:'Concluída',prazo:'2026-01-01'},'2026-10-15'),false);
});
test('valida data real e limites de escala',()=>{
  assert.match(validateRecord({...demoRecords[0],prazo:'2026-02-30'}).join(),/data inválida/);
  assert.match(validateRecord({...demoRecords[0],ocorrencia:11}).join(),/ocorrencia/);
});
