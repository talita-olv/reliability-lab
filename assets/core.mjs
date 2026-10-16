/** Núcleo determinístico de FMEA de demonstração; não representa uma norma. */
export const HEADERS = ['id','sistema','ativo','modo_falha','efeito','causa','severidade','ocorrencia','deteccao','responsavel','status','prazo','acao'];
export const STATUS = ['Aberta','Em andamento','Concluída'];
const integer = value => Number.isInteger(Number(value)) && String(value).trim() !== '';

export function validateRecord(input) {
  const errors=[];
  const textFields = ['id','sistema','ativo','modo_falha'];
  for(const key of textFields) if(!String(input[key]??'').trim()) errors.push(`Campo obrigatório: ${key}`);
  for(const key of ['severidade','ocorrencia','deteccao']) {
    const val = Number(input[key]);
    if(!integer(input[key]) || val < 1 || val > 10) errors.push(`${key}: informe inteiro de 1 a 10`);
  }
  if(!STATUS.includes(String(input.status??''))) errors.push('status inválido');
  if(input.prazo && !/^\d{4}-\d{2}-\d{2}$/.test(input.prazo)) errors.push('prazo: formato AAAA-MM-DD');
  if(input.prazo && /^\d{4}-\d{2}-\d{2}$/.test(input.prazo)) {
    const d = new Date(`${input.prazo}T12:00:00Z`);
    if (Number.isNaN(d.valueOf()) || d.toISOString().slice(0,10) !== input.prazo) errors.push('prazo: data inválida');
  }
  for(const key of HEADERS) if(String(input[key]??'').length>450) errors.push(`${key}: máximo de 450 caracteres`);
  return errors;
}

export function normalizeRecord(item) {
  const record={};
  for (const key of HEADERS) record[key] = ['severidade','ocorrencia','deteccao'].includes(key)
    ? Number(item[key]) : String(item[key]??'').trim();
  return record;
}

export function calculateRpn({severidade,ocorrencia,deteccao}) {
  const a=[severidade,ocorrencia,deteccao].map(Number);
  if(a.some(n=>!Number.isInteger(n) || n<1 || n>10)) throw new RangeError('S, O e D devem ser inteiros de 1 a 10');
  return a[0]*a[1]*a[2];
}

// Regras demonstrativas, configuráveis por equipe em aplicação real.
export function priority(item) {
  const rpn=calculateRpn(item);
  if(Number(item.severidade)>=9 || rpn>=300) return 'Crítica';
  if(Number(item.severidade)>=7 || rpn>=180) return 'Alta';
  if(rpn>=80) return 'Média';
  return 'Baixa';
}
export const PRIORITIES = ['Crítica','Alta','Média','Baixa'];
export function matrixLevel(value) {
  const v=Number(value);
  if(!Number.isInteger(v)||v<1||v>10) throw new RangeError('Escala 1–10 esperada');
  return Math.ceil(v/2);
}
export function matrixRisk(s,o) {
  const p=matrixLevel(s)*matrixLevel(o);
  return p>=16?'Crítica':p>=10?'Alta':p>=6?'Média':'Baixa';
}
export function summary(records) {
  const counts=Object.fromEntries(PRIORITIES.map(p=>[p,0]));
  let total=0, sum=0, severe=0, open=0;
  for(const rec of records) {
    const rpn=calculateRpn(rec); sum+=rpn;total++;
    counts[priority(rec)]++;
    if(Number(rec.severidade)>=9) severe++;
    if(rec.status!=='Concluída') open++;
  }
  return {total, averageRpn:total?sum/total:0, counts, severe, open};
}
export function parseCsv(csv, delimiter) {
  const src=String(csv??'').replace(/^\uFEFF/,'');
  const firstLine=src.split(/\r?\n/,1)[0] ?? '';
  const delim=delimiter || (countUnquoted(firstLine,';')>=countUnquoted(firstLine,',')?';':',');
  let rows=[], row=[], cell='', quoted=false, started=false;
  for(let i=0;i<src.length;i++) {
    const c=src[i];
    if(c==='"') {
      if(quoted && src[i+1]==='"') {cell+='"';i++;}
      else if(quoted) quoted=false;
      else if(!cell.trim()) quoted=true;
      else cell+='"';
      started=true;
    } else if(!quoted && c===delim) {row.push(cell);cell='';started=true;}
    else if(!quoted && (c==='\r'||c==='\n')) {
      if(c==='\r'&&src[i+1]==='\n') i++;
      row.push(cell); if(row.some(x=>x.trim())||started) rows.push(row);
      row=[];cell='';started=false;
    } else {cell+=c;started=true;}
  }
  if(quoted) throw new Error('CSV contém aspas não fechadas.');
  if(started||cell||row.length){row.push(cell);rows.push(row);}
  if(!rows.length) return [];
  const names=rows.shift().map((h)=>h.trim().toLowerCase());
  const absent=HEADERS.filter(key=>!names.includes(key));
  if(absent.length) throw new Error('Colunas ausentes: '+absent.join(', '));
  return rows.filter(r=>r.some(v=>String(v).trim())).map(r=>
    Object.fromEntries(HEADERS.map(h=>[h,r[names.indexOf(h)]??'']))
  );
}
function countUnquoted(s,delimiter) {let n=0, quoted=false;for(let i=0;i<s.length;i++){if(s[i]==='"'){if(quoted&&s[i+1]==='"'){i++;}else quoted=!quoted;}else if(!quoted && s[i]===delimiter)n++;}return n;}

export function safeCsvCell(value) {
  const raw=String(value??'');
  const protectedValue = /^[\s\u0000-\u001F]*[=+@\-]/.test(raw)?`'${raw}`:raw;
  return '"'+protectedValue.replaceAll('"','""')+'"';
}
export function exportCsv(rows) {
  const header=HEADERS.join(';');
  return '\uFEFF'+header+'\r\n'+rows.map(rec=>HEADERS.map(key=>safeCsvCell(rec[key])).join(';')).join('\r\n')+(rows.length?'\r\n':'');
}
export function isOverdue(item,today) {return Boolean(item.prazo && item.prazo<today && item.status!=='Concluída');}
