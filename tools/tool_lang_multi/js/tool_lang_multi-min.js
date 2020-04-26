import{data_manager}from"../../../common/js/data_manager.js";import{get_instance,delete_instance}from"../../../common/js/instances.js";import{common}from"../../../common/js/common.js";import{tool_common}from"../../../tool_common/js/tool_common.js";import{render_tool_lang_multi,add_component}from"./render_tool_lang_multi.js";export const tool_lang_multi=function(){return this.id,this.model,this.mode,this.node,this.ar_instances,this.status,this.events_tokens,this.type,this.source_lang,this.target_lang,this.langs,this.caller,!0};tool_lang_multi.prototype.render=common.prototype.render,tool_lang_multi.prototype.destroy=common.prototype.destroy,tool_lang_multi.prototype.edit=render_tool_lang_multi.prototype.edit,tool_lang_multi.prototype.init=async function(t){return this.trigger_url=DEDALO_TOOLS_URL+"/tool_lang_multi/trigger.tool_lang_multi.php",this.lang=t.lang,this.langs=page_globals.dedalo_projects_default_langs,this.source_lang=t.caller.lang,this.target_lang=null,tool_common.prototype.init.call(this,t)},tool_lang_multi.prototype.build=async function(t=!1){return tool_common.prototype.build.call(this,t)},tool_lang_multi.prototype.load_component=async function(t){const o=this,e=o.caller,n=JSON.parse(JSON.stringify(e.context));n.lang=t;const r=await get_instance({model:e.model,tipo:e.tipo,section_tipo:e.section_tipo,section_id:e.section_id,mode:"edit_in_list"===e.mode?"edit":e.mode,lang:t,section_lang:e.lang,type:e.type,context:n,data:{value:[]},datum:e.datum});r.caller=this,await r.build(!0);const i=o.ar_instances.find(t=>t===r);return r!==o.caller&&void 0===i&&o.ar_instances.push(r),r},tool_lang_multi.prototype.automatic_translation=async function(t,o,e,n){const r={url:this.trigger_url,mode:"automatic_translation",source_lang:o,target_lang:e,component_tipo:this.caller.tipo,section_id:this.caller.section_id,section_tipo:this.caller.section_tipo,translator:JSON.parse(t)},i=await fetch(this.trigger_url,{method:"POST",mode:"cors",cache:"no-cache",credentials:"same-origin",headers:{"Content-Type":"application/json"},redirect:"follow",referrer:"no-referrer",body:JSON.stringify(r)}).then((function(t){if(!t.ok)throw Error(t.statusText);return t})).then(t=>t.json()).catch(t=>(console.error("!!!!! REQUEST ERROR: ",t),{result:!1,msg:t.message,error:t})),l=!1===i.result?"error":"ok";ui.show_message(n,i.msg,l);const s=this.node[0].querySelector(".target_component_container");return add_component(this,s,e),!0===SHOW_DEBUG&&console.log("trigger_response:",i),i};