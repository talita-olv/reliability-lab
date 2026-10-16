import {HEADERS,PRIORITIES,calculateRpn,priority,summary,matrixLevel,matrixRisk,parseCsv,exportCsv,normalizeRecord,validateRecord,isOverdue} from './core.mjs';
import {demoRecords} from './demo.mjs';
import {parseXlsx} from './xlsx.mjs';
import {SCORE_GUIDE,gradeDescription} from './scales.mjs';
import {openReport} from './report.mjs';

const $=id=>document.getElementById(id);
let records=demoRecords.map(x=>({...x}));
let editOriginalId=null;
let sourceLabel="Base fictícia de demonstração";
let toastTimer;
const priorityOrder=Object.fromEntries(PRIORITIES.map((p,i)=>[p,i]));
const classNameForPriority={'Crítica':'priority-critical','Alta':'priority-high','Média':'priority-medium','Baixa':'priority-low'};
const dateToday=()=>{
  const d=new Date();
  return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
};
const make=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=String(text);return node;};
function notify(message,error=false){const el=$('toast');el.textContent=message;el.classList.toggle('error',error);el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),4200);}
function filteredRows(){
  const q=$('searchInput').value.trim().toLocaleLowerCase('pt-BR');
  const p=$('priorityFilter').value;
  const status=$('statusFilter').value;
  const sort=$('sortSelect').value;
  let found=records.filter(row=>{
    if(q && ![row.id,row.sistema,row.ativo,row.modo_falha,row.causa,row.efeito].some(v=>String(v).toLocaleLowerCase('pt-BR').includes(q)))return false;
    return (!p || priority(row)===p) && (!status || row.status===status);
  });
  found.sort((a,b)=>{
    if(sort==='rpn') return calculateRpn(b)-calculateRpn(a) || a.id.localeCompare(b.id,'pt-BR');
    if(sort==='due') return (a.prazo||'9999-12-31').localeCompare(b.prazo||'9999-12-31') || a.id.localeCompare(b.id,'pt-BR');
    if(sort==='asset') return a.ativo.localeCompare(b.ativo,'pt-BR');
    return priorityOrder[priority(a)]-priorityOrder[priority(b)] || calculateRpn(b)-calculateRpn(a) || a.id.localeCompare(b.id,'pt-BR');
  });
  return found;
}
function showStats(rows){
  const s=summary(rows);
  $('kpiTotal').textContent=s.total;
  $('kpiCritical').textContent=s.counts['Crítica'];
  $('kpiRpn').textContent=Math.round(s.averageRpn);
  $('kpiOpen').textContent=s.open;
  $('priorityChart').replaceChildren();
  for(const p of PRIORITIES){
    const block=make('div','distribution-item');
    const head=make('div','bar-head');head.append(make('strong','',p),make('span','',`${s.counts[p]} registro${s.counts[p]!==1?'s':''} • ${s.total?Math.round(s.counts[p]/s.total*100):0}%`));
    const track=make('div','bar-track');
    const fill=make('div',`bar-fill ${classNameForPriority[p]}`);
    fill.style.width=`${s.total?s.counts[p]/s.total*100:0}%`;
    track.append(fill);block.append(head,track);$('priorityChart').append(block);
  }
  const insight=$('insightText');insight.replaceChildren();
  const strong=make('strong','',s.total?`${s.severe} registro(s) com S ≥ 9. `:'Nenhum registro para os filtros atuais. ');
  const note=make('span','',s.total?'Prioridade é um apoio à triagem, e não uma decisão automática. Analise o contexto e as barreiras de proteção.':'Remova alguns filtros ou restaure o conjunto demonstrativo.');
  insight.append(strong,note);
}
function showMatrix(rows){
  const counts=Array.from({length:5},()=>Array(5).fill(0));
  rows.forEach(r=>counts[5-matrixLevel(r.severidade)][matrixLevel(r.ocorrencia)-1]++);
  const matrix=$('riskMatrix');matrix.replaceChildren();
  for(let y=0;y<5;y++)for(let x=0;x<5;x++){
    // A matriz usa agrupamentos: níveis 5...1 para S e 1...5 para O.
    const label=matrixRisk((5-y)*2,(x+1)*2);
    const kind={'Crítica':'risk-critical','Alta':'risk-high','Média':'risk-medium','Baixa':'risk-low'}[label];
    const value=counts[y][x];
    const cell=make('div',`risk-cell ${kind}${value?'':' empty'}`,value||'·');
    cell.title=`Severidade nível ${5-y}; Ocorrência nível ${x+1}; ${value} registro(s)`;
    matrix.append(cell);
  }
}
function showTable(rows){
  const target=$('rows');target.replaceChildren();
  $('rowCount').textContent=`${rows.length} registro(s) exibido(s) de ${records.length}`;
  if(!rows.length){const tr=make('tr');const td=make('td','empty-row','Nenhum resultado. Ajuste os filtros ou importe um CSV.');td.colSpan=10;tr.append(td);target.append(tr);return;}
  const today=dateToday();
  for(const rec of rows){
    const tr=make('tr');
    const cellAsset=make('td');cellAsset.append(make('strong','',rec.ativo),make('small','',rec.sistema));tr.append(cellAsset);
    const failure=make('td');failure.append(make('div','failure',rec.modo_falha));tr.append(failure);
    for(const k of ['severidade','ocorrencia','deteccao'])tr.append(make('td','num',rec[k]));
    tr.append(make('td','num rpn',calculateRpn(rec)));
    const priorityTd=make('td');priorityTd.append(make('span',`priority-pill pill-${priority(rec)}`,priority(rec)));tr.append(priorityTd);
    const statusTd=make('td');statusTd.append(make('span','status-pill',rec.status));tr.append(statusTd);
    const dateTd=make('td',isOverdue(rec,today)?'overdue':'',rec.prazo?rec.prazo.split('-').reverse().join('/'):'—');
    if(isOverdue(rec,today))dateTd.title='Prazo vencido no horário local do navegador';
    tr.append(dateTd);
    const actions=make('td');const buttons=make('div','action-buttons');
    const edit=make('button','','Editar');edit.type='button';edit.setAttribute('aria-label',`Editar ${rec.id}`);edit.addEventListener('click',()=>openEdit(rec.id));
    const del=make('button','delete','Excluir');del.type='button';del.setAttribute('aria-label',`Excluir ${rec.id}`);del.addEventListener('click',()=>deleteRecord(rec.id));
    buttons.append(edit,del);actions.append(buttons);tr.append(actions);target.append(tr);
  }
}
function render(){const subset=filteredRows();showStats(subset);showMatrix(subset);showTable(subset);const label=$('sourceNotice');label.firstChild.textContent=`${sourceLabel} · ${records.length} registro(s) · Sem salvamento automático. `;}
function openNew(){
  editOriginalId=null;
  $('recordForm').reset();
  $('formError').hidden=true;
  $('dialogTitle').textContent='Novo modo de falha';
  const numbers=records.map(r=>Number(r.id.match(/\d+$/)?.[0]||0));
  const candidate=Math.max(0,...numbers)+1;
  $('recordForm').elements.namedItem('id').value=`F-${String(candidate).padStart(3,'0')}`;
  $('editDialog').showModal();updateScoreHints();
}
function openEdit(id){
  const rec=records.find(r=>r.id===id);if(!rec)return;
  editOriginalId=id;
  $('recordForm').reset();$('formError').hidden=true;
  $('dialogTitle').textContent=`Editar registro ${id}`;
  for(const key of HEADERS){const field=$('recordForm').elements.namedItem(key);if(field)field.value=rec[key];}
  $('editDialog').showModal();updateScoreHints();
}
function closeDialog(){$('editDialog').close();}
function deleteRecord(id){
  if(!confirm(`Excluir ${id} desta sessão? A exclusão não afeta nenhum servidor.`))return;
  records=records.filter(r=>r.id!==id);sourceLabel='Base alterada manualmente nesta sessão';render();notify(`Registro ${id} excluído da sessão.`);
}
function saveRecord(event){
  event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget));
  const errors=validateRecord(values);
  if(records.some(r=>r.id===values.id && r.id!==editOriginalId))errors.push('ID já utilizado por outro registro.');
  if(errors.length){$('formError').hidden=false;$('formError').textContent=errors.join(' | ');return;}
  const item=normalizeRecord(values);
  if(editOriginalId){const index=records.findIndex(r=>r.id===editOriginalId);if(index<0)return;records[index]=item;}
  else records.push(item);
  sourceLabel='Base alterada manualmente nesta sessão';
  closeDialog();render();notify(editOriginalId?'Registro atualizado.':'Novo modo de falha incluído.');
}
async function loadFile(event){
  const file=event.target.files?.[0];if(!file)return;
  try{
    if(file.size>2_000_000)throw new Error('Limite de importação: 2 MB.');
    const isExcel=/\.xlsx$/i.test(file.name);
    if(!isExcel && !/\.csv$/i.test(file.name))throw new Error('Formato não aceito. Importe .xlsx ou .csv.');
    const result=isExcel?await parseXlsx(file):{records:parseCsv(await file.text()),sheetName:'CSV'};
    const data=result.records;
    if(!data.length)throw new Error('O arquivo não contém registros.');
    if(data.length>1500)throw new Error('Limite de 1.500 registros por arquivo nesta demonstração.');
    const ids=new Set();
    const failures=[];
    for(let i=0;i<data.length;i++){
      const row=data[i],errors=validateRecord(row);
      if(ids.has(String(row.id)))errors.push('ID duplicado');ids.add(String(row.id));
      if(errors.length)failures.push(`Registro ${i+1} (${String(row.id||'sem ID')}): ${errors.join(', ')}`);
      if(failures.length>=4)break;
    }
    if(failures.length)throw new Error(`Importação rejeitada integralmente. ${failures.join(' | ')}`);
    if(!confirm(`Importar ${data.length} registro(s) da aba “${result.sheetName}”? A base atual será substituída. Exporte antes caso tenha alterações importantes.`))return;
    records=data.map(normalizeRecord);
    sourceLabel=`Arquivo importado: ${file.name} / ${result.sheetName} (dados não verificados)`;
    $('searchInput').value='';$('priorityFilter').value='';$('statusFilter').value='';
    render();notify(`Importação concluída: ${records.length} registro(s) carregado(s) localmente.`);
  }catch(e){notify(e.message||'Falha ao importar planilha.',true);}finally{event.target.value='';}
}
function saveCsv(){
  const contents=exportCsv(filteredRows());const blob=new Blob([contents],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='reliability_lab_fmea.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('CSV exportado com os registros filtrados.');
}
function restoreDemo(){if(!confirm('Restaurar os dados fictícios? As alterações não exportadas serão perdidas.'))return;records=demoRecords.map(r=>({...r}));sourceLabel='Base fictícia de demonstração';$('searchInput').value='';$('priorityFilter').value='';$('statusFilter').value='';$('sortSelect').value='priority';render();notify('Cenário de demonstração restaurado.');}

function updateScoreHints(){
  for(const key of ['severidade','ocorrencia','deteccao']){
    const field=$('recordForm').elements.namedItem(key);
    const description=$(`hint-${key}`);
    if(description)description.textContent=gradeDescription(key,field.value);
  }
}
function setupGuide(){
  const target=$('guideTables');
  for(const [key,data] of Object.entries(SCORE_GUIDE)){
    const section=make('section','grade-section');
    section.append(make('h3','',data.name+' — '+data.short),make('p','',data.note));
    const grid=make('div','grade-grid');
    data.descriptions.forEach((desc,i)=>{
      const row=make('div','grade-card');row.append(make('b','',i+1),make('span','',desc));grid.append(row);
    });
    section.append(grid);target.append(section);
    const hint=document.querySelector(`[data-score-hint="${key}"]`);
    if(hint)hint.id=`hint-${key}`;
  }
  $('guideBtn').addEventListener('click',()=>$('guideDialog').showModal());
  $('closeGuide').addEventListener('click',()=>$('guideDialog').close());
  $('doneGuide').addEventListener('click',()=>$('guideDialog').close());
  $('guideDialog').addEventListener('click',e=>{if(e.target===$('guideDialog'))$('guideDialog').close();});
  for(const key of ['severidade','ocorrencia','deteccao'])$('recordForm').elements.namedItem(key).addEventListener('input',updateScoreHints);
}
function makeReport(){
  try{
    openReport({records:filteredRows(),source:sourceLabel,filters:{search:$('searchInput').value,priority:$('priorityFilter').value,status:$('statusFilter').value}});
  }catch(e){notify(e.message||'Não foi possível abrir o relatório.',true);}
}
for(const id of ['searchInput','priorityFilter','statusFilter','sortSelect'])$(id).addEventListener(id==='searchInput'?'input':'change',render);
$('fileInput').addEventListener('change',loadFile);
$('exportBtn').addEventListener('click',saveCsv);
$('reportBtn').addEventListener('click',makeReport);
$('newBtn').addEventListener('click',openNew);
$('resetBtn').addEventListener('click',restoreDemo);
$('recordForm').addEventListener('submit',saveRecord);
$('cancelBtn').addEventListener('click',closeDialog);
$('closeDialog').addEventListener('click',closeDialog);
$('editDialog').addEventListener('click',event=>{if(event.target===$('editDialog'))closeDialog();});
setupGuide();
render();
