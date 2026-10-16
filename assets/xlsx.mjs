/** Leitor mínimo de XLSX OOXML via APIs nativas do navegador.
 * Sem rede, sem macros e sem avaliação de fórmulas. Compatível com XLSX (não XLS/XLSB).
 * Formatos não suportados falham explicitamente em vez de fazer leitura parcial.
 */
import {HEADERS} from './core.mjs';
const MAX_ENTRIES=1000;
const MAX_UNCOMPRESSED=24_000_000;
const MAX_FILE=2_000_000;
const decoder=new TextDecoder('utf-8', {fatal:false});
const uint16=(v,p)=>v.getUint16(p,true);
const uint32=(v,p)=>v.getUint32(p,true);
const element=(parent,local)=>Array.from(parent?.getElementsByTagName('*')||[]).find(x=>x.localName===local);
const elements=(parent,local)=>Array.from(parent?.getElementsByTagName('*')||[]).filter(x=>x.localName===local);
function assertXml(src,part){
  const xml=new DOMParser().parseFromString(src,'application/xml');
  if(xml.getElementsByTagName('parsererror').length)throw new Error(`Estrutura XML inválida em ${part}.`);
  return xml;
}
function safePath(path){
  const out=[];
  for(const part of path.replaceAll('\\','/').replace(/^\/+/, '').split('/')){
    if(part==='..'){if(!out.length)throw Error('Caminho interno inválido no Excel.');out.pop();}
    else if(part!=='.'&&part!=='')out.push(part);
  }
  return out.join('/');
}
function zipIndex(data){
  const view=new DataView(data);
  const bytes=new Uint8Array(data);
  let eocd=-1;
  for(let p=data.byteLength-22;p>=Math.max(0,data.byteLength-65_557);p--){
    if(uint32(view,p)===0x06054b50 && p+22+uint16(view,p+20)===data.byteLength){eocd=p;break;}
  }
  if(eocd<0)throw Error('Arquivo inválido: não foi possível ler a estrutura ZIP do XLSX.');
  const count=uint16(view,eocd+10),offset=uint32(view,eocd+16),size=uint32(view,eocd+12);
  if(count>MAX_ENTRIES||offset+size>data.byteLength||count===65535||offset===0xffffffff)throw Error('Planilha Excel muito complexa ou em formato não suportado.');
  const files=new Map();let cursor=offset,total=0;
  for(let n=0;n<count;n++){
    if(cursor+46>bytes.length||uint32(view,cursor)!==0x02014b50)throw Error('Índice ZIP inválido no Excel.');
    const flags=uint16(view,cursor+8),method=uint16(view,cursor+10);
    const compressed=uint32(view,cursor+20),sizeUnpacked=uint32(view,cursor+24);
    const nameSize=uint16(view,cursor+28),extra=uint16(view,cursor+30),comment=uint16(view,cursor+32),local=uint32(view,cursor+42);
    if(cursor+46+nameSize+extra+comment>bytes.length)throw Error('Índice ZIP incompleto.');
    const name=safePath(decoder.decode(bytes.subarray(cursor+46,cursor+46+nameSize)));
    if(flags&1)throw Error('Excel protegido por senha não é compatível com esta demonstração.');
    if(![0,8].includes(method)||compressed===0xffffffff||sizeUnpacked===0xffffffff||local===0xffffffff)throw Error('Compressão ou ZIP64 não suportado neste Excel.');
    total+=sizeUnpacked;
    if(total>MAX_UNCOMPRESSED)throw Error('Conteúdo interno do Excel ultrapassa o limite de segurança (24 MB).');
    if(local+30>bytes.length||uint32(view,local)!==0x04034b50)throw Error('Entrada ZIP inválida.');
    const start=local+30+uint16(view,local+26)+uint16(view,local+28);
    if(start+compressed>bytes.length)throw Error('Dados ZIP incompletos.');
    if(files.has(name))throw Error('Arquivo Excel contém entradas duplicadas.');
    files.set(name,{method,compressed,sizeUnpacked,start});
    cursor+=46+nameSize+extra+comment;
  }
  return {files,bytes};
}
async function unpack(index,path){
  const f=index.files.get(path);if(!f)return null;
  const compressed=index.bytes.subarray(f.start,f.start+f.compressed);
  let output;
  if(f.method===0){output=compressed;}
  else {
    if(typeof DecompressionStream==='undefined')throw Error('Seu navegador não suporta leitura local de Excel. Use Chrome ou Edge atualizado, ou importe CSV.');
    try {
      const stream=new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      output=new Uint8Array(await new Response(stream).arrayBuffer());
    }catch{throw Error('Não foi possível descompactar o Excel. Use Chrome/Edge atualizado ou CSV.');}
  }
  if(output.byteLength!==f.sizeUnpacked)throw Error('Conteúdo descompactado inconsistente no Excel.');
  return decoder.decode(output);
}
function colIndex(name){let n=0;for(const c of name.toUpperCase()){if(c<'A'||c>'Z')break;n=n*26+(c.charCodeAt(0)-64);}return n-1;}
function serialDate(serial,base1904){
  if(!Number.isFinite(serial)||serial<0||serial>2_958_465)throw Error('Data de Excel fora da faixa permitida.');
  const base=base1904?Date.UTC(1904,0,1):Date.UTC(1899,11,30);
  return new Date(base+Math.floor(serial)*86400000).toISOString().slice(0,10);
}
function dateStyles(styles){
  if(!styles)return new Set();
  const formats=new Map(elements(styles,'numFmt').map(e=>[Number(e.getAttribute('numFmtId')),e.getAttribute('formatCode')||'']));
  const xfs=element(styles,'cellXfs');
  const dateTypes=new Set([14,15,16,17,18,19,20,21,22,45,46,47]);
  const dateStyleIds=new Set();
  for(const [index,xf] of elements(xfs,'xf').entries()){
    const id=Number(xf.getAttribute('numFmtId'));
    const fmt=(formats.get(id)||'').replace(/"[^"]*"|\[[^\]]*\]|\\./g,'').toLowerCase();
    if(dateTypes.has(id)|| /(^|[^a-z])[dmyh](?=[dmyhs\/\-. :]|$)/.test(fmt))dateStyleIds.add(index);
  }
  return dateStyleIds;
}
function rowsFromXml(xml,shared,dateStyleIds,base1904){
  const result=[];
  const worksheetRows=elements(element(xml,'sheetData'),'row');
  if(worksheetRows.length>2_000)throw Error('A planilha ultrapassa o limite de linhas aceitas.');
  for(const row of worksheetRows){
    const vals=[];
    for(const cell of elements(row,'c')){
      const ref=cell.getAttribute('r')||'';
      const n=colIndex((ref.match(/^[A-Za-z]+/)||[''])[0]);
      if(n<0||n>150)continue;
      const t=cell.getAttribute('t')||'';
      let value='';
      if(t==='inlineStr')value=elements(element(cell,'is'),'t').map(x=>x.textContent).join('');
      else {
        value=element(cell,'v')?.textContent??'';
        if(t==='s'){
          const idx=Number(value);
          if(!Number.isInteger(idx)||idx<0||idx>=shared.length)throw Error('Referência inválida de texto compartilhado no Excel.');
          value=shared[idx];
        }else if(t==='d')value=String(value).slice(0,10);
        else if(t==='n'||t===''){
          const style=Number(cell.getAttribute('s')||0);
          if(dateStyleIds.has(style)&&value!=='')value=serialDate(Number(value),base1904);
        }
      }
      vals[n]=String(value);
    }
    if(vals.some(x=>x?.trim()))result.push(vals);
  }
  return result;
}
export function gridToRecords(grid){
  const headerRow=grid.findIndex(row=>{
    const labels=row.map(x=>String(x??'').trim().toLowerCase());
    return HEADERS.every(h=>labels.includes(h));
  });
  if(headerRow<0)return null;
  const names=grid[headerRow].map(x=>String(x??'').trim().toLowerCase());
  return grid.slice(headerRow+1).filter(row=>row.some(x=>String(x??'').trim())).map(row=>Object.fromEntries(HEADERS.map(h=>[h,row[names.indexOf(h)]??''])));
}
export async function parseXlsx(file){
  if(file.size>MAX_FILE)throw Error('Limite de importação: 2 MB.');
  const index=zipIndex(await file.arrayBuffer());
  const bookXml=await unpack(index,'xl/workbook.xml');
  if(!bookXml)throw Error('Arquivo XLSX não contém a estrutura esperada do Excel.');
  const book=assertXml(bookXml,'workbook.xml');
  const base1904=element(book,'workbookPr')?.getAttribute('date1904')==='1';
  const rels=await unpack(index,'xl/_rels/workbook.xml.rels');
  if(!rels)throw Error('Relações de abas ausentes no Excel.');
  const relMap=new Map(elements(assertXml(rels,'workbook.xml.rels'),'Relationship').map(rel=>[rel.getAttribute('Id'),rel.getAttribute('Target')]));
  const ss=await unpack(index,'xl/sharedStrings.xml');
  const shared=ss?elements(assertXml(ss,'sharedStrings.xml'),'si').map(si=>elements(si,'t').map(t=>t.textContent).join('')):[];
  const styleXml=await unpack(index,'xl/styles.xml');
  const ds=dateStyles(styleXml?assertXml(styleXml,'styles.xml'):null);
  for(const sheet of elements(book,'sheet')){
    const id=sheet.getAttribute('r:id')||sheet.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id');
    const target=relMap.get(id);if(!target)continue;
    const sheetPath=safePath(target.startsWith('/')?target:`xl/${target}`);
    if(!sheetPath.startsWith('xl/worksheets/'))continue;
    const src=await unpack(index,sheetPath);if(!src)continue;
    const grid=rowsFromXml(assertXml(src,sheetPath),shared,ds,base1904);
    const records=gridToRecords(grid);
    if(records)return {records,sheetName:sheet.getAttribute('name')||'Planilha'};
  }
  throw Error(`Nenhuma aba contém todas as colunas esperadas: ${HEADERS.join(', ')}.`);
}
