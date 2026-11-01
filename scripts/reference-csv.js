/** Minimal RFC 4180 reader for the checked-in UTF-8 reference indexes. */
export function readCsv(text){
 const rows=[];let row=[],value='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){value+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(value);value='';}else if(c==='\n'&&!quoted){row.push(value.replace(/\r$/,''));rows.push(row);row=[];value='';}else value+=c;}
 if(row.length||value){row.push(value);rows.push(row);}const header=rows.shift();return rows.map(r=>Object.fromEntries(header.map((key,i)=>[key,r[i]])));
}
