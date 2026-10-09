const prefix='<!--bp-rich-v1-->';
const allowed=new Set(['P','DIV','BR','STRONG','B','EM','I','U','UL','OL','LI']);
export function cleanRich(html){
 const source=document.createElement('template');source.innerHTML=html;
 const output=document.createElement('div');
 function copy(node,parent){
  if(node.nodeType===Node.TEXT_NODE){parent.append(document.createTextNode(node.textContent));return}
  if(node.nodeType!==Node.ELEMENT_NODE)return;
  if(['SCRIPT','STYLE','IFRAME','OBJECT','SVG','MATH','TEMPLATE'].includes(node.tagName))return;
  const target=allowed.has(node.tagName)?document.createElement(node.tagName.toLowerCase()):parent;
  if(target!==parent)parent.append(target);
  [...node.childNodes].forEach(child=>copy(child,target));
 }
 [...source.content.childNodes].forEach(node=>copy(node,output));return output.innerHTML;
}
export function richHtml(value,options=false){
 const text=String(value||'');if(text.startsWith(prefix))return cleanRich(text.slice(prefix.length));
 const container=document.createElement(options?'ul':'div');
 text.split('\n').forEach(line=>{if(options&&!line.trim())return;const item=document.createElement(options?'li':'p');item.textContent=line||'\u00a0';container.append(item)});
 return container.innerHTML? (options?container.outerHTML:container.innerHTML):'';
}
export function serializeRich(editor){return prefix+cleanRich(editor.innerHTML)}
export function setupRichEditors(form){
 const editors={};
 for(const name of ['description','options']){
  const field=form.elements[name];field.hidden=true;
  const wrapper=document.createElement('div');wrapper.className='rich-editor-wrap';
  const toolbar=document.createElement('div');toolbar.className='rich-toolbar';toolbar.setAttribute('role','group');toolbar.setAttribute('aria-label','Tekstopmaak');
  const editor=document.createElement('div');editor.className='rich-editor';editor.contentEditable='true';editor.setAttribute('role','textbox');editor.setAttribute('aria-multiline','true');editor.setAttribute('aria-label',name==='description'?'Beschrijving':'Opties & uitrusting');
  for(const [command,label,title] of [['bold','Vet','Vet'],['italic','Cursief','Cursief'],['underline','Onderstrepen','Onderstrepen'],['insertUnorderedList','• Lijst','Opsomming'],['insertOrderedList','1. Lijst','Genummerde lijst'],['removeFormat','Wis opmaak','Opmaak verwijderen']]){
   const button=document.createElement('button');button.type='button';button.textContent=label;button.title=title;button.setAttribute('aria-label',title);
   button.addEventListener('mousedown',e=>e.preventDefault());button.onclick=()=>{editor.focus();document.execCommand(command,false,null)};toolbar.append(button);
  }
  editor.addEventListener('paste',e=>{e.preventDefault();document.execCommand('insertText',false,e.clipboardData.getData('text/plain'))});
  wrapper.append(toolbar,editor);field.parentElement.after(wrapper);editors[name]=editor;
 }
 return {load(car){for(const [name,editor] of Object.entries(editors))editor.innerHTML=richHtml(car[name],name==='options')},values(){return Object.fromEntries(Object.entries(editors).map(([name,editor])=>[name,serializeRich(editor)]))}};
}
