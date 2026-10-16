import test from 'node:test';
import assert from 'node:assert/strict';
import {gridToRecords} from '../assets/xlsx.mjs';
import {SCORE_GUIDE,gradeDescription} from '../assets/scales.mjs';
import {reportHtml,escapeHtml} from '../assets/report.mjs';
import {demoRecords} from '../assets/demo.mjs';
import {HEADERS} from '../assets/core.mjs';

test('planilha identifica cabeçalho mesmo em segunda linha e colunas fora de ordem',()=>{
 const head=[...HEADERS].reverse();
 const row=head.map(h=>String(demoRecords[0][h]));
 const data=gridToRecords([['Instruções para uso'],head,row]);
 assert.equal(data.length,1);
 assert.equal(data[0].ativo,'Bomba centrífuga B-101');
});
test('retorna null quando não reconhece layout do Excel',()=>assert.equal(gridToRecords([['Outro','layout']]),null));
test('guias têm dez notas específicas para cada fator S O D',()=>{
 assert.equal(Object.keys(SCORE_GUIDE).length,3);
 for(const [key,scale] of Object.entries(SCORE_GUIDE)){
  assert.equal(scale.descriptions.length,10);
  assert.equal(gradeDescription(key,1),scale.descriptions[0]);
  assert.equal(gradeDescription(key,10),scale.descriptions[9]);
 }
});
test('relatório inclui todas as ações e regras, com filtros declarados',()=>{
 const html=reportHtml({records:demoRecords,filters:{priority:'Alta'},source:'Exemplo',generatedAt:new Date('2026-10-15T12:00:00')});
 assert.match(html,/16 registro\(s\)/);
 assert.match(html,/Salvar como PDF/);
 assert.match(html,/S × O × D/);
 assert.match(html,/Prioridade: Alta/);
 for(const rec of demoRecords)assert.ok(html.includes(rec.acao));
 assert.equal((html.match(/class="item"/g)||[]).length,16);
});
test('texto arbitrário em modo de falha é escapado no PDF',()=>{
 const injection='<img src=x onerror=alert(1)>';
 const html=reportHtml({records:[{...demoRecords[0],modo_falha:injection,acao:'=1+2'}]});
 assert.ok(!html.includes(injection));
 assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
 assert.equal(escapeHtml('a&b'), 'a&amp;b');
});
test('PDF com lista vazia tem contadores zerados e aviso de seleção',()=>{
 const html=reportHtml({records:[]});
 assert.match(html,/Sem registros para os filtros selecionados/);
 assert.match(html,/0 registro\(s\)/);
});
