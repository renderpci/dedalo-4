/*global get_label, page_globals, SHOW_DEBUG, DEDALO_CORE_URL*/
/*eslint no-undef: "error"*/



// imports
	import {event_manager} from '../../common/js/event_manager.js'
	import {data_manager} from '../../common/js/data_manager.js'
	import {instances, get_instance, delete_instance} from '../../common/js/instances.js'
	import {ui} from '../../common/js/ui.js'



/**
* COMMON
*/
export const common = function(){

	return true
};//end common



/**
* BUILD
* Generic agnostic build function created to maintain
* unity of calls.
* (!) For components, remember use always component_common.build()
* @return bool true
*/
common.prototype.build = async function () {

	const self = this

	// status update
		self.status = 'building'

	// permissions. calculate and set (used by section records later)
		self.permissions = self.context.permissions

	// status update
		self.status = 'builded'


	return true
};//end common.prototype.build



/**
* RENDER
* @param object options
*	render_level : level of deep that is rendered (full | content)
* @return promise
*	node first dom node stored in instance 'node' array
*/
common.prototype.render = async function (options={render_level:'full'}) {
	const t0 = performance.now()

	const self = this

	const render_level 	= options.render_level || 'full'
	let render_mode 	= self.mode

	// status update
		self.status = 'rendering'

	// self data verification before render
		//if (typeof self.data==="undefined") {
		//	console.warn("self.data is undefined !! Using default empty value for render");
		//	self.data = {
		//		value : []
		//	}
		//}
		//console.log("typeof self[render_mode]:",typeof self[render_mode], self.model);

	// render node. Method name is element node like 'edit' or 'list'
		if (typeof self[render_mode]!=='function') {
			console.warn(`Invalid function (render_mode: ${render_mode} ) using fallbact to LIST mode on ` +
						 'instance: ', self);
			render_mode = 'list'
		}
		const node = await self[render_mode]({
			render_level : render_level
		})

	// result_node render based in render_level
		const result_node = await (async () => {

			// render_level
			switch(render_level) {

				case 'content':
					// replace content_data node in each element dom node
						// const nodes_length = self.node.length
						// for (let i = 0; i < nodes_length; i++) {

						// 	const wrapper 				 = self.node[i]
						// 	const old_content_data_node  = wrapper.querySelector(":scope >.content_data")
						// 	const new_content_data_node  = (i===0) ? node : node.cloneNode(true)

						// 	if (typeof old_content_data_node==="undefined" || !old_content_data_node) {
						// 		console.warn("Invalid node found in render:", typeof old_content_data_node, old_content_data_node, self);
						// 	}
						// 	//console.log("typeof old_content_data_node:",typeof old_content_data_node, old_content_data_node);

						// 	wrapper.replaceChild(new_content_data_node, old_content_data_node)
						// }
						const nodes_length = self.node.length
						for (let i = nodes_length - 1; i >= 0; i--) {

							const wrapper = self.node[i]

							// old content_data node
								const old_content_data_node = self.model==='section' && self.mode==='list'
									? wrapper.querySelector(":scope >.list_body >.content_data")
									: wrapper.querySelector(":scope >.content_data")

								// const old_content_data_nodes = wrapper.querySelectorAll(":scope >.content_data")
								// const get_content_data_node = () => {
								// 	let result = null
								// 	for (let v = 0; v < old_content_data_nodes.length; v++) {
								// 		if (v===0) {
								// 			result = old_content_data_nodes[v]
								// 		}else{
								// 			old_content_data_nodes[v].remove()
								// 			console.warn("!!! Removed additional content_data noded:", v, self.model);
								// 		}
								// 	}
								// 	return result
								// }
								// const old_content_data_node = get_content_data_node()

								// warning if not found
									if (typeof old_content_data_node==="undefined" || !old_content_data_node) {
										console.warn("Invalid node found in render:", typeof old_content_data_node, old_content_data_node, self);
									}
								//console.log("typeof old_content_data_node:",typeof old_content_data_node, old_content_data_node);
								//console.log("-----------------old_node:", old_content_data_node, self.model);

							// new content data node (first is new rendered node, others are clones of it)
								// const new_content_data_node = (i===(nodes_length-1)) ? node : node.cloneNode(true) (!) Removed 25-03-2020
								// Note : In some context like dd-tiny, it is necessary to generate a fresh DOM node for each
								// component node like text_area in a time machine refresh scenario
								const new_content_data_node = (i===0)
									? node // use already calculated node
									: await self[render_mode]({render_level : render_level});

								// console.log("-----------------old_content_data_node:",old_content_data_node);
								// console.log("-----------------new_node:", new_content_data_node, self.model);

							// replace child from parent wrapper
								if (self.model==='section' && self.mode==='list') {
									const list_body = wrapper.querySelector(":scope >.list_body")
									list_body.replaceChild(new_content_data_node, old_content_data_node)
								}else{
									wrapper.replaceChild(new_content_data_node, old_content_data_node)
								}
						}

					return self.node[0]
					break;

				case 'full':
					// set
						self.node.push(node)

					return node
					break;
			}
		})()

	// status update
		self.status = 'rendered'

	// event publish
		event_manager.publish('render_'+self.id, result_node)
		event_manager.publish('render_instance', self)
	
	// debug
		if(SHOW_DEBUG===true) {
			const total = performance.now()-t0
			const msg = `__Time to render: model: ${self.model}, tipo: ${self.tipo}, section_tipo: ${self.section_tipo}, total (ms): `
			if (total>100) {
				console.warn(msg, total);
			}else{
				console.log(msg, total);
			}
		}

	return result_node
};//end render



/**
* REFRESH
* @return promise
*/
common.prototype.refresh = async function () {
	const t0 = performance.now()

	const self = this

	// destroy dependences only
		if (self.status==='rendered') {
			const destroyed = await self.destroy(false, true)
		}else{
			console.warn("/// destroyed fail with status:", self.model, self.status);
			return false
		}

	// debug
		if(SHOW_DEBUG===true) {
			console.group("Refresh "+self.model +" "+ (self.tipo ? self.tipo : '') );
			console.log("+ Time to destroy:", self.model, performance.now()-t0);
			var t1 = performance.now()
		}

	// build. Update the instance with new data
		//if (self.status==='destroyed') {
			try {
				const builded = await self.build(true)
			}catch(error){
				console.error("error on build:", error);
			}

		//}else{
		//	console.warn("/// build fail with status:", self.model, self.status);
		//	return false
		//}

	// debug
		if(SHOW_DEBUG===true) {
			console.log("+ Time to build:", self.model, performance.now()-t1);
			var t2 = performance.now()
		}

	// copy original ar_node
		//const ar_node 		 = self.node
		//const ar_node_length = ar_node.length

	// render
		if (self.status==='builded') {
			await self.render({render_level : 'content'})
		}else{
			console.warn("/// render fail with status:", self.model, self.status);
			return false
		}

	//node.classList.add("loading")
	//const isPromise = (val) => {
	//  return (
	//  	(val !== undefined && val !== null) &&
	//    typeof val.then==='function' &&
	//    typeof val.catch==='function'
	//  )
	//}

	// debug
		if(SHOW_DEBUG===true) {
			console.log("+ Time to render:", self.model, performance.now()-t2);
			// console.log("+ Time to full refresh:", self.model, performance.now()-t0);
			console.log("%c+ Time to full refresh:" +" "+ self.model + " " + (performance.now()-t0), "color:#d2f115");
			console.groupEnd();
		}


	return true
};//end refresh



/*
* DESTROY
* Delete all instances dependents of the section and all events that was created by the instances.
* but it not delete the own section instance.
* @return
*/
common.prototype.destroy = async function (delete_self=true, delete_dependences=false, remove_dom=false) {

	const self = this

	const result = {}

	// destroy all instances associated
		if(delete_dependences===true){

			const do_delete_dependences = async function() {

				const ar_instances_length = self.ar_instances.length

				if(SHOW_DEBUG===true) {
					if (ar_instances_length<1) {
						// console.warn("[common.destroy.delete_dependences] Ignored empty ar_instances as dependences ", self);
					}
				}

				// remove instances from self ar_instances
					//const ar_to_destroy = []
					for (let i = ar_instances_length - 1; i >= 0; i--) {

						if(self.ar_instances[i].destroyable===false){
							const destroyed_elements = self.ar_instances.splice(i, 1);
							continue;
						}
						// console.log("self.ar_instances:",JSON.parse(JSON.stringify(self.ar_instances[i])));
						// remove from array of instances of current element
						const destroyed_elements = self.ar_instances.splice(i, 1)

						// send instance to general destroy
						if (typeof destroyed_elements[0].destroy!=="undefined") {
							destroyed_elements[0].destroy(true, true, false) // No wait here, only launch destroy order
						}
					}

				// destroy all removed instances
					// const ar_to_destroy_length = ar_to_destroy.length
					// for (let k = ar_to_destroy_length - 1; k >= 0; k--) {
					// 	ar_to_destroy[k].destroy(true, true, false)
					// }

				const result = (self.ar_instances.length===0) ? true : false

				return result
			}

			result.delete_dependences = await do_delete_dependences()
		}


	// delete self instance
		if(delete_self===true){

			const do_delete_self = async function() {

				// get the events that the instance was created
					const events_tokens = self.events_tokens

				// delete the registred events
					const delete_events = events_tokens.map(current_token => event_manager.unsubscribe(current_token))

				// delete paginator
					if(self.paginator){
						// await self.paginator.destroy();
						delete self.paginator
					}

				// destroy services
					if (self.services) {
						const services_length = self.services.length
						for (let i = services_length - 1; i >= 0; i--) {
							console.log("removed services:", i, services_length);
							delete self.services[i]
						}
					}

				// remove_dom optional
					if (remove_dom===true) {
						const remove_nodes = async () => {
							const node_length = self.node.length
							//for (let i = 0, l = node_length; i < l; i++) {
							for (let i = node_length - 1; i >= 0; i--) {
								const current_node = self.node[i]
								current_node.remove()
							}
						}
						await remove_nodes()
					}

				// delete_instance
					const instance_options = {
						id				: self.id,
						model 			: self.model,
						tipo 			: self.tipo,
						section_tipo 	: self.section_tipo,
						section_id 		: self.section_id,
						mode 			: self.mode,
						lang 			: self.lang
					}
					// time machine case
					if (self.matrix_id) {
						instance_options.matrix_id = self.matrix_id
					}
					const result = await delete_instance(instance_options)

				return result
			}

			result.delete_self = await do_delete_self()
		}

	// status update
		self.status = 'destroyed'


	//console.log("self.ar_instances final:",JSON.parse(JSON.stringify(self.ar_instances)));
	return result
};//end destroy



/**
* CREATE_SOURCE
* @param object options
* @return object source
*/
export const create_source = function (self, action) {
	
	const source = { // source object
		typo			: "source",
		action			: action,
		model			: self.model,
		tipo			: self.tipo,
		section_tipo	: self.section_tipo,
		section_id		: self.section_id,
		mode			: (self.mode==='edit_in_list') ? 'edit' : self.mode,
		lang			: self.lang
	}

	// matrix_id optional (used in time machine mode)
		if (true===self.hasOwnProperty('matrix_id') && self.matrix_id) {
			source.matrix_id = self.matrix_id
		}

	return source
};//end create_source



/**
* LOAD_STYLE
* @param object self
*/
common.prototype.load_style = function (src) {

	const js_promise = new Promise(function(resolve, reject) {

		// check already loaded
			const links 	= document.getElementsByTagName("link");
			const links_len = links.length
			for (let i = links_len - 1; i >= 0; i--) {
				if(links[i].getAttribute('href')===src) {
					resolve(src)
					return
				}
			}

		// DOM tag
			const element 	  = document.createElement("link")
				  element.rel = "stylesheet"

			//element.onload  = resolve(element)
			//element.onerror = reject(src)
			element.onload = function() {
				resolve(src);
			};
			element.onerror = function() {
				reject(src);
			};

			element.href = src

			document.getElementsByTagName("head")[0].appendChild(element)
	})

	if(SHOW_DEBUG===true) {
		//js_promise.then((response)=>{
		//	console.log("++ Loaded style: ", response)
		//})
	}

	return js_promise
};//end load_style



/**
* LOAD_SCRIPT
* @param object self
*//**/
common.prototype.load_script = async function(src) {

	const js_promise = new Promise(function(resolve, reject) {

		// check already loaded
			const scripts 	  = document.getElementsByTagName("script");
			const scripts_len = scripts.length
			for (let i = scripts_len - 1; i >= 0; i--) {
				if(scripts[i].getAttribute('src')===src) {
					resolve(src)
					return
				}
			}

		// DOM tag
			const element = document.createElement("script")
			element.setAttribute("defer", "defer");

			//element.onload  = resolve(element)
			//element.onerror = reject(src)
			element.onload = function() {
				resolve(src);
			};
			element.onerror = function() {
				reject(src);
			};

			element.src = src

			document.head.appendChild(element)
	})

	if(SHOW_DEBUG===true) {
		//js_promise.then((response)=>{
		//	console.log("++ Loaded script: ", response)
		//})
	}

	return js_promise
};//end load_script



/**
* GET_COLUMNS
* Resolve the paths into the rqo_config with all dependencies (portal into portals, portals into sections, etc) 
* and create the columns to be render by the section or portals
* @return array ar_columns the the speific columns to render into the list, with inverse path format.
*/
common.prototype.get_columns = async function(){

	const self = this

	const full_ddo_map = []

	// // get ddo_map from the dd_request.show, self can be a section or component_portal, and both has dd_request
	const ddo_map = self.rqo_config.show.ddo_map

	// get the sub elements with the ddo_map, the method is recursive,
	// it get only the items that don't has relations and is possible get values (component_input_text, component_text_area, compomnent_select, etc )
	const sub_ddo_map = get_sub_ddo_map(self.datum, self.tipo, ddo_map, [])
	full_ddo_map.push(...sub_ddo_map)

	const ar_columns = get_ar_inverted_paths(full_ddo_map)

	return ar_columns
};//end get_columns


/**
* GET_AR_INVERTED_PATHS
* Resolve the unique and isolated paths into the ddo_map with all dependencies (portal into portals, portals into sections, etc) 
* get the path in inverse format, the last in the chain will be the first object [0]
* @return array ar_inverted_paths the the speific paths, with inverse path format.
*/
const get_ar_inverted_paths = function(full_ddo_map){

	// get the parents for the column, creating the inverse path 
	// (from the last component to the main parent, the column will be with the data of the first item of the column)
	function get_parents(ddo_map, current_ddo) {
		const ar_parents = []
		const parent = ddo_map.find(item => item.tipo === current_ddo.parent)
		if (parent) {
			ar_parents.push(parent)
			ar_parents.push(...get_parents(ddo_map, parent))
		}
		return ar_parents
	}

	// every ddo will be checked if it is a component_portal or if is the last component in the chain
	// set the valid_ddo array with only the valid ddo that will be used.
		const ar_inverted_paths = []
		const ddo_length = full_ddo_map.length
		for (let i = 0; i < ddo_length; i++) {
			const current_ddo = full_ddo_map[i]
			// check if the current ddo has children asociated, it's necesary identify the last ddo in the path chain, the last ddo create the column
			// all parents has the link and data to get the data of the last ddo.
			// interview -> people to study -> name
			// «name» will be the column, «interview» and «people under study» has the locator to get the data.
			const current_ar_valid_ddo = full_ddo_map.filter(item => item.parent === current_ddo.tipo)
			if(current_ar_valid_ddo.length !== 0) continue
			const column = []

			// get the path with inverse order
			// people to study -> interview
			const parents = get_parents(full_ddo_map, current_ddo)

			// join all with the inverse format
			// name -> people to study -> interview
			column.push(current_ddo,...parents)
			ar_inverted_paths.push(column)
		}

	return ar_inverted_paths
}// end get_ar_inverted_paths

/**
* GET_SUB_DDO_MAP
* @param datum self instance_caller datum (section, component_portal) with all contex and data of the caller. In the recursion
* @param caller_tipo tipo from section or portal that call to get the sub_ddo_map
* @param ddo_map the requested tipos
* @param sub_ddo used for create the f_path of the compomnent, f_path is used to get the full path
* @return array ar_ddo with all ddo in all portals and sections config_rqo that has dependency of the caller.
*/
const get_sub_ddo_map = function(datum, caller_tipo, ddo_map, sub_ddo){
	
	const ar_ddo = []

	// get the valid ddo_map, only the last ddo in the path will be rendered.
		// function get_last_children(ddo_map, current_ddo) {
		// 	const ar_children = []
		// 	const children = ddo_map.filter(item => item.parent === current_ddo.tipo)
			
		// 	if(children.length === 0){
		// 		current_ddo.caller_tipo = caller_tipo
		// 		ar_children.push(current_ddo)
		// 	}else{
		// 		for (let i = 0; i < children.length; i++) {
		// 			const valid_child = get_last_children(ddo_map, children[i])[0]
		// 			ar_children.push(valid_child)
		// 		}
		// 	}
			
		// 	return ar_children;
		// }	

	// every ddo will be checked if it is a component_portal or if is the last component in the chain
	// set the valid_ddo array with only the valid ddo that will be used.
		// const ar_valid_ddo = []
		// const ddo_length = ddo_map.length
		// for (let i = 0; i < ddo_length; i++) {
		// 	const current_ddo = ddo_map[i]
		// 	if(current_ddo.parent !== caller_tipo) continue;
		// 	const current_ar_valid_ddo = get_last_children(ddo_map, current_ddo)
		// 	for (let j = 0; j < current_ar_valid_ddo.length; j++) {
		// 		ar_valid_ddo.push(current_ar_valid_ddo[j])
		// 	}
		// }
		for (let i = 0; i < ddo_map.length; i++) {
			const current_ddo = ddo_map[i]
			if(current_ddo.parent !== caller_tipo) continue;
			const current_context = datum.context.find(item => item.tipo===current_ddo.tipo) //&& item.section_tipo===current_ddo.section_tipo

			// rqo_config
			const rqo_config	= current_context.request_config
				? current_context.request_config.find(el => el.api_engine==='dedalo')
				: null
		
			// if (!current_context) {
			// 	console.warn("Ignored not found ddo: [current_tipo, self.datum.context]", current_context.tipo, datum.context);
			// 	continue
			// }
			ar_ddo.push(current_ddo)

			if(rqo_config && rqo_config.show && rqo_config.show.ddo_map){
				const current_ddo_map = rqo_config.show.ddo_map
				const sub_ddo_map = get_sub_ddo_map(datum, current_ddo.tipo, current_ddo_map, [])
				ar_ddo.push(...sub_ddo_map)
			}
		}

		
			// console.log("current_ddo:",current_ddo);
	return ar_ddo
};//end build_request_show





/**
* LOAD_TOOL
* @param tool_object options
* @param self instance_caller
* @return object tool
*/
// common.prototype.load_tool = async function(self, tool_object){

	// 	const tool_instance = await get_instance({
	// 		model 			: tool_object.name,
	// 		tipo 			: self.tipo,
	// 		section_tipo 	: self.section_tipo,
	// 		section_id 		: self.section_id,
	// 		mode 			: self.mode,
	// 		lang 			: self.lang,
	// 		caller 			: self,
	// 		tool_object		: tool_object
	// 	})

	// 	// destroy if already loaded (toggle tool)
	// 		if (tool_instance.status && tool_instance.status!=='init') {

	// 			tool_instance.destroy(true, true, true)

	// 			return false
	// 		}

	// 	await tool_instance.build(true)
	// 	tool_instance.render()

	// 	return tool_instance
// };//end load_tool



/**
* BUILD_RQO
*/
common.prototype.build_rqo_DES = async function(dd_request_type, request_config, action){

	const self = this

	// create a new one

	switch (dd_request_type) {

		case 'show':	
			return rqo

		case 'search':
			return build_request_search(self, request_config, action)

		case 'select':
			return build_request_select(self, request_config, action)
			break;
	}
};//end build_rqo



/**
* BUILD_RQO_SHOW
* @return object rqo
*/
common.prototype.build_rqo_show = async function(rqo_config, action){
		
	const self = this

	// sessionStorage check if already exists
		const current_data_manager	= new data_manager()

	// local_db_data. get value if exists
		const saved_rqo = await current_data_manager.get_local_db_data(self.id, 'rqo')
		if(saved_rqo){

			// update saved offset if is different from received config
				if (rqo_config.sqo && typeof rqo_config.sqo.offset!=='undefined' && saved_rqo.sqo.offset!==rqo_config.sqo.offset) {					
					saved_rqo.sqo.offset = rqo_config.sqo.offset
					current_data_manager.set_local_db_data(saved_rqo, 'rqo') // save updated object
					console.warn("updated offset in saved_rqo:", saved_rqo);
				}

			console.warn("returning saved_rqo:", saved_rqo);
			return saved_rqo
		}

	// build new one with source of the instance caller (self)
		const source = create_source(self, action);

	// SQO
	// set the sqo_config into a checked variable
		const sqo_config = rqo_config.show && rqo_config.show.sqo_config
			? rqo_config.show.sqo_config
			: {}

	// get the ar_sections
		const ar_sections = rqo_config.sqo && rqo_config.sqo.section_tipo
			? rqo_config.sqo.section_tipo.map(el=>el.tipo)
			: ( sqo_config.section_tipo)
					? sqo_config.section_tipo.map(el=>el.tipo)
					: [self.section_tipo]


		const sqo = rqo_config.sqo
			? JSON.parse(JSON.stringify(rqo_config.sqo))
			: {}

	sqo.section_tipo = ar_sections
	
	// Get the limit, offset, full count, and filter by locators. 
	// When these options comes with the sqo it passed to the final sqo, if not, it get the show.sqo_config parameters
	// and finally if the rqo_config don't has sqo or sqo_config, set the default parameter to each.
		sqo.limit = sqo.limit
			? sqo.limit
			: (sqo_config.limit)
				? sqo_config.limit
				: self.mode === 'edit'
					? 1
					: 10

		sqo.offset = sqo.offset
			? sqo.offset
			: (sqo_config.offset)
				? sqo_config.offset
				: 0

		sqo.full_count = sqo.full_count
			? sqo.full_count
			: (sqo_config.full_count)
				? sqo_config.full_count
				: false

		sqo.filter_by_locators = sqo.filter_by_locators
			? sqo.filter_by_locators
			: (sqo_config.filter_by_locators)
				? sqo_config.filter_by_locators
				: null

	//build the rqo
		const rqo = {
			id		: self.id,
			action	: 'read',
			source	: source,
			sqo 	: sqo,
		}


	// local_db_data save	
		current_data_manager.set_local_db_data(rqo, 'rqo')


	return rqo
}//end build_rqo_show



/**
* BUILD_RQO_SHOW
* @return object rqo
*/
common.prototype.build_rqo_search = async function(rqo_config, action){
		
	const self = this

	// build new one with source of the instance caller (self)
		const source	= create_source(self, action);

	// get the operator to use into the filter free
		const operator	= rqo_config.search && rqo_config.search.sqo_config && rqo_config.search.sqo_config.operator
			? rqo_config.search.sqo_config.operator 
			: '$or'
		
	// SQO
	// set the sqo_config into a checked variable, get the sqo_config for search or show
		const sqo_config = rqo_config.search && rqo_config.search.sqo_config
			? rqo_config.search.sqo_config
			: rqo_config.show && rqo_config.show.sqo_config
				? rqo_config.show.sqo_config
				: {}


	// get the ar_sections
		const ar_sections = rqo_config.sqo && rqo_config.sqo.section_tipo
			? rqo_config.sqo.section_tipo.map(el=>el.tipo)
			: ( sqo_config.section_tipo)
					? sqo_config.section_tipo.map(el=>el.tipo)
					: [self.section_tipo]
		

	// limit and offset
	// check if limit and offset exist in choose, if not get from search.sqo_config, if not, get from show.sqo_config else fixed value
		const limit	= rqo_config.choose && rqo_config.choose.sqo_config && rqo_config.choose.sqo_config.limit
			? rqo_config.choose.sqo_config.limit
			: (sqo_config.limit)
				? sqo_config.limit
				: 10
		const offset = rqo_config.choose && rqo_config.choose.sqo_config && rqo_config.choose.sqo_config.offset
			? rqo_config.choose.sqo_config.offset
			: (sqo_config.offset)
				? qo_config.offset
				: 0

	// new sqo_search
	const sqo = {
		section_tipo			: ar_sections,
		filter					: {[operator]:[]},
		offset					: offset,
		limit					: limit,
		full_count				: false,
		allow_sub_select_by_id	: true
	}


	// FILTER_FREE 
	// the filter will be used to set the q with all paths to use to search.
		const filter_free			= {}
			  filter_free[operator] = []

		// create the paths for use into filter_free
		// get the ddo_map to use for the paths in search or show or create new one with the caller
			const search_ddo_map = rqo_config.search && rqo_config.search.ddo_map
				? rqo_config.search.ddo_map
				: rqo_config.show && rqo_config.show.ddo_map
					? rqo_config.show.ddo_map
					: [{
						section_tipo	: self.section_tipo,
						component_tipo	: self.tipo,
						model			: self.model,
						mode 			: 'list'
					}]


			if (search_ddo_map) {
				// get the sub elements with the ddo_map, the method is recursive,
				// it get only the items that don't has relations and is possible get values (component_input_text, component_text_area, compomnent_select, etc )
				const ar_paths = get_ar_inverted_paths(search_ddo_map)
				// change the order of the paths to correct order for sqo and set all ddo to 'list' mode
				const paths_length = ar_paths.length
				for (let i = 0; i < paths_length; i++) {
					const current_path = ar_paths[i]
					const current_path_length = current_path.length
					// reverse path and set the list
					const new_path = []
					for (let j = current_path_length - 1; j >= 0; j--) {
						const current_ddo = JSON.parse(JSON.stringify(current_path[j]))
						current_ddo.mode = 'list' // enable lang fallback value
						if(Array.isArray(current_ddo.section_tipo)){
							current_ddo.section_tipo = current_ddo.section_tipo[0]
						}
						current_ddo.component_tipo = current_ddo.tipo
						new_path.push(current_ddo)
					}
					//add the path to the filter_free with the operator
					filter_free[operator].push({
						q		: '',
						path	: new_path
					})
				}
			}


	// fixed_filter
	const fixed_filter	= rqo_config.sqo && rqo_config.sqo.fixed_filter
		? rqo_config.sqo.fixed_filter
		: false


	// filter_by_list if exists
	const filter_by_list = rqo_config.sqo && rqo_config.sqo.filter_by_list
		? rqo_config.sqo.filter_by_list
		: false


	//value_with_parents
	const value_with_parents = sqo_config.value_with_parents
		? sqo_config.value_with_parents
		: false

	//divisor
	const divisor = sqo_config.divisor
		? sqo_config.divisor
		: ', '

	// optional configuration to use when the serach will be builded
		const sqo_options = {
			filter_free			: filter_free,
			fixed_filter		: fixed_filter,
			filter_by_list		: filter_by_list,
			operator 			: operator,
		}

	// DDO_MAP
	// get the ddo_map to show the components, if is set choose get it, if not get the search.ddo_map if not get the show.ddo_map
		const ddo_map = rqo_config.choose && rqo_config.choose.ddo_map
			? rqo_config.choose.ddo_map
			: search_ddo_map

		// get the sub elements with the ddo_map, the method is recursive,
		// it get only the items that don't has relations and is possible get values (component_input_text, component_text_area, compomnent_select, etc )
		const columns = get_ar_inverted_paths(ddo_map)

		//build the rqo
		const rqo = {
			id			: self.id,
			action		: 'read',
			source		: source,
			show		: {
				ddo_map				: ddo_map,
				value_with_parents	: value_with_parents,
				divisor				: divisor,
				columns 			: columns
			},
			sqo			: sqo,
			sqo_options	: sqo_options
		}

	return rqo
}//end build_rqo_search



/**
* BUILD_REQUEST_SHOW
* @return array dd_request
*/
const build_request_show_OLD = function(self, request_config, action){

	const dd_request = []

	// source . auto create
		const source = create_source(self, action);
		dd_request.push(source)

	// empty request_config cases
		if(!request_config) {
			return dd_request;
		}

	// // direct request ddo if exists
		// 	const ar_requested_ddo = request_config.filter(item => item.typo==='ddo')
		// 	if (ar_requested_ddo.length>0) {
		// 		for (let i = 0; i < ar_requested_ddo.length; i++) {
		// 			dd_request.push(ar_requested_ddo[i])
		// 		}
		// 	}

	// sqo. add request sqo if exists
		const request_sqo = request_config.find(item => item.typo==='sqo')
		if (request_sqo) {
			dd_request.push(request_sqo)
		}

	// rqo. If don't has rqo, return the source only
		const rqo = request_config.filter(item => item.typo==='rqo')
		if(rqo.length < 1){
			return dd_request;
		}

	// ddo. get the global request_ddo storage, ddo_storage is the centralized storage for all ddo in section
		// const request_ddo_object	= self.datum.context.find(item => item.typo==='request_ddo')
		// const all_request_ddo		= request_ddo_object.value
		const all_request_ddo = self.datum
			? (self.datum.context ? self.datum.context : [])
			: []

		const rqo_length				= rqo.length
		const all_request_ddo_length	= all_request_ddo.length
		const ar_sections				= []
		const request_ddo				= []

		if(self.model==='section'){

			// rqo loop
				for (let i = 0; i < rqo_length; i++) {

					const current_rqo	= rqo[i]
					const sections		= current_rqo.section_tipo
					const show			= current_rqo.show

					// get sections
						ar_sections.push(...sections)

					// value_with_parents
						if(show.value_with_parents){
							dd_request.push({
								typo	: 'value_with_parents',
								value	: show.value_with_parents
							})
						}

					// divisor
						if(show.divisor){
							dd_request.push({
								typo	: 'divisor',
								value	: show.divisor
							})
						}
				}

			// all_request_ddo loop
				for (let i = 0; i < all_request_ddo_length; i++) {

					const ddo = all_request_ddo[i]
					// if(ddo.tipo === self.tipo && ddo.section_tipo === self.section_tipo && self.model==='section') continue
					ddo.config_type = 'show'
					request_ddo.push( ddo )
				}

		}else{

			//set the context of the component in the request_ddo
			request_ddo.push(self.context)
			for (let i = 0; i < rqo_length; i++) {

				const current_rqo		= rqo[i]
				const operator			= current_rqo.show.sqo_config.operator || '$and'
				const sections			= current_rqo.section_tipo

				const sections_length	= sections.length
				// show
				const show				= current_rqo.show
				const ddo_map			= show.ddo_map
				const ddo_map_length	= ddo_map.length
				//get sections
				for (let j = 0; j < sections_length; j++) {
					ar_sections.push(sections[j])
					// get the fpath array
					for (let k = 0; k < ddo_map_length; k++) {

						const f_path = typeof ddo_map[k].tipo!=='undefined'
							? ['self', ddo_map[k].tipo]
							: typeof ddo_map[k].f_path!=='undefined'
								? ddo_map[k].f_path
								: ['self', ddo_map[k]]
						const f_path_length = f_path.length

						// get the current item of the fpath
						for (let l = 0; l < f_path_length; l++) {
							const item = f_path[l]==='self'
								? sections[j]
								: f_path[l]
							const exist = request_ddo.find(ddo => ddo.tipo===item && ddo.section_tipo===sections[j])

							if(!exist){
								const ddo = all_request_ddo.find(ddo => ddo.tipo===item && ddo.section_tipo===sections[j])

								if(ddo){
									ddo.config_type = 'show'
									request_ddo.push(ddo)
								}
							}
						}
					}
				}

				//value_with_parents
				if(show.value_with_parents){
					dd_request.push({
						typo : 'value_with_parents',
						value : show.value_with_parents
					})
				}

				//divisor
				if(show.divisor){
					dd_request.push({
						typo : 'divisor',
						value : show.divisor
					})
				}
			}
		}//end 	if(self.model==='section')

		// set the selected ddos into new request_ddo for do the call with the selection
		dd_request.push({
			typo : 'request_ddo',
			value : request_ddo
		})

	// first rqo show
		const first_rqo_show = rqo[0].show

	// get the limit and offset
		const limit	= (first_rqo_show.sqo_config.limit)
			? first_rqo_show.sqo_config.limit
			: 10
		const offset = (first_rqo_show.sqo_config.offset)
			? first_rqo_show.sqo_config.offset
			: 0

	// sqo
		const sqo = {
			typo				: 'sqo',
			section_tipo		: ar_sections,
			filter				: null,
			limit				: limit,
			offset				: offset,
			select				: [],
			full_count			: false,
			filter_by_locators	: null
		}
		dd_request.push(sqo)

		//add the full rqo to the dd_request
		dd_request.push(rqo[0])

	// debug
		if(SHOW_DEBUG===true) {
			// console.log("// dd_request [build_request_show]", dd_request);
		}


	return dd_request
};//end build_request_show



/**
* BUILD_REQUEST_SEARCH
* @return array dd_request
*/
const build_request_search = function(self, request_config, action){

	const dd_request	= []
	const ar_sections	= []

	const rqo = request_config.filter(item => item.typo==='rqo')

	// get the global request_ddo storage, ddo_storage is the centralized storage for all ddo in section.
	// const all_request_ddo	= self.datum.context.find(item => item.typo==='request_ddo').value
	const all_request_ddo	= self.datum.context

	const rqo_length	= rqo.length
	// const operator	= self.context.properties.source.operator || '$and'
	const request_ddo 		= []

	for (let i = 0; i < rqo_length; i++) {

		const current_rqo		= rqo[i]
		const operator			= current_rqo.search.sqo_config.operator || '$and'
		const sections			= current_rqo.section_tipo
		const sections_length	= sections.length
		const sqo_search		= []

		// source . auto create
			const source = create_source(self, action)
			sqo_search.push(source)


		const fixed_filter	= current_rqo.fixed_filter
		const filter_free	= {}
			  filter_free[operator] = []

		// type add
		sqo_search.push({
			typo	: 'search_engine',
			value	: current_rqo.search_engine
		})

		// search
		const search			= current_rqo.search
		const ddo_map			= search.ddo_map
		const ddo_map_length	= ddo_map.length

		//get sections
		for (let j = 0; j < sections_length; j++) {
			const section_ddo = all_request_ddo.find(ddo => ddo.tipo===sections[j]  && ddo.section_tipo===sections[j])
			request_ddo.push(section_ddo)

			// get the fpath array
			for (let k = 0; k < ddo_map_length; k++) {

				const f_path		= typeof ddo_map[k].f_path!=='undefined' ? ddo_map[k].f_path :  ['self', ddo_map[k]]
				const f_path_length	= f_path.length
				const ar_paths		= []

				// get the current item of the fpath
				for (let l = 0; l < f_path_length; l++) {
					if(l % 2 !== 0){

						const item = f_path[l]
						const section_tipo = (f_path[l-1]==='self')
							? sections[j]
							: f_path[l-1]

						const ddo = all_request_ddo.find(ddo => ddo.tipo===item  && ddo.section_tipo===section_tipo )
						if (ddo) {
							ddo.mode = 'list' // enable lang fallback value
							request_ddo.push(ddo)
							const path = {
								section_tipo	: section_tipo,
								component_tipo	: item,
								modelo			: ddo.model
							}
							ar_paths.push(path)
						}
					}
				}

				filter_free[operator].push({
					q		: '',
					path	: ar_paths
				})
			}
		}
		// fixed_filter
		if (fixed_filter) {
			sqo_search.push({
				typo : 'fixed_filter',
				value : fixed_filter
			})
		}

		// filter_free
		if (filter_free) {
			sqo_search.push({
				typo 		: 'filter_free',
				value 		: filter_free,
				operator 	: operator
			})
		}

		// filter_by_list if exists
		const filter_by_list = current_rqo.filter_by_list
		if (filter_by_list) {
			sqo_search.push({
				typo : 'filter_by_list',
				value : filter_by_list
			})
		}

		// limit and offset
			// check if limit and offset exist in select
			const limit	= current_rqo.select && current_rqo.select.sqo_config && current_rqo.select.sqo_config.limit
				? current_rqo.select.sqo_config.limit
				: (search.sqo_config.limit)
					? search.sqo_config.limit
					: current_rqo.show.sqo_config.limit
			const offset = current_rqo.select && current_rqo.select.sqo_config && current_rqo.select.sqo_config.offset
				? current_rqo.select.sqo_config.offset
				: search.sqo_config.offset

		// sqo_search
		sqo_search.push({
			typo			: 'sqo',
			section_tipo	: sections,
			filter			: {[operator]:[]},
			offset			: offset || 0,
			limit			: limit || 10,
			select			: [],
			full_count		: false
		})

		// if(current_rqo.select){
		// 	const select = self.build_rqo('select', request_config, 'get_data')
		// 	const ddo_select = select.filter(item => item.typo === 'ddo')
		// 	sqo_search.push(...ddo_select)
		// 	console.log("ddo_select", sqo_search);
		// }

		//value_with_parents
		if(search.value_with_parents){
			sqo_search.push({
				typo : 'value_with_parents',
				value : search.value_with_parents
			})
		}

		//divisor
		if(search.divisor){
			sqo_search.push({
				typo : 'divisor',
				value : search.divisor
			})
		}

		// set the selected ddos into new request_ddo for do the call with the selection
		sqo_search.push({
			typo : 'request_ddo',
			value : request_ddo
		})


		// add group
		dd_request.push(sqo_search)
	}//end for (let i = 0; i < length; i++)


	return dd_request
};//end build_request_search



/**
* BUILD_REQUEST_SELECT
* @return array dd_request
*/
const build_request_select = function(self, request_config, action){

	const dd_request = []

	// source . auto create
		const source = create_source(self, action);
		dd_request.push(source)

	// empty request_config cases
		if(!request_config) {
			return dd_request;
		}

	// // direct request ddo if exists
	// 	const ar_requested_ddo = request_config.filter(item => item.typo==='ddo')
	// 	if (ar_requested_ddo.length>0) {
	// 		for (let i = 0; i < ar_requested_ddo.length; i++) {
	// 			dd_request.push(ar_requested_ddo[i])
	// 		}
	// 	}

	// direct request sqo if exists
		const request_sqo = request_config.find(item => item.typo==='sqo')
		if (request_sqo) {
			dd_request.push(request_sqo)
		}

	// rqo. If don't has rqo, return the source only
		const rqo = request_config.filter(item => item.typo==='rqo')
		if(rqo.length < 1){
			return dd_request;
		}

	// ddo. get the global request_ddo storage, ddo_storage is the centralized storage for all ddo in section
		// const request_ddo_object	= self.datum.context.find(item => item.typo==='request_ddo')
		// const all_request_ddo			= request_ddo_object.value
		const all_request_ddo		= self.datum.context

		const request_ddo 			= []
		// const instance_ddo 			= self.context
		// 		instance_ddo.config_type = 'show'
		// request_ddo.push(instance_ddo)

		const rqo_length	= rqo.length
		const ar_sections	= []
		for (let i = 0; i < rqo_length; i++) {

			const current_rqo		= rqo[i]
			const sections			= current_rqo.section_tipo

			const sections_length	= sections.length
			// select
			const select			= current_rqo.select
			const ddo_map			= select.ddo_map

			const ddo_map_length	= ddo_map.length
			//get sections
			for (let j = 0; j < sections_length; j++) {
				ar_sections.push(sections[j])
				// get the fpath array
				for (let k = 0; k < ddo_map_length; k++) {

					const f_path = typeof ddo_map[k].f_path!=='undefined' ? ddo_map[k].f_path : ['self', ddo_map[k]]
					const f_path_length = f_path.length

					// get the current item of the fpath
					for (let l = 0; l < f_path_length; l++) {
						const item = f_path[l]==='self'
							? sections[j]
							: f_path[l]
						const exist = request_ddo.find(ddo => ddo.tipo===item  && ddo.section_tipo===sections[j])

						if(!exist){
							const ddo = all_request_ddo.find(ddo => ddo.tipo===item  && ddo.section_tipo===sections[j])

							if(ddo){
								ddo.config_type = 'show'
								const select_ddo = JSON.parse(JSON.stringify(ddo))
								select_ddo.parent = sections[j]
								request_ddo.push(select_ddo)
							}
						}
					}
				}
			}
			//value_with_parents
			if(select.value_with_parents){
				dd_request.push({
					typo : 'value_with_parents',
					value : select.value_with_parents
				})
			}

			//divisor
			if(select.divisor){
				dd_request.push({
					typo : 'divisor',
					value : select.divisor
				})
			}
		}

		// set the selected ddos into new request_ddo for do the call with the selection
		dd_request.push({
			typo : 'request_ddo',
			value : request_ddo
		})

	return dd_request
};//end build_request_show




/**
* LOAD_DATA_DEBUG
* @return
*/
export const load_data_debug = async function(self, load_data_promise, rqo_show_original) {

	if(SHOW_DEBUG===false) {
		return false
	}

	if (self.model!=="section" && self.model!=="area" && self.model.indexOf("area_")===-1) {
		return false
	}

	const response		= await load_data_promise
	const dd_request	= self.dd_request

	// console.log("----> load_data_debug request dd_request_show_original "+self.model +" "+self.tipo+ ":", dd_request_show_original);
	// console.log(">>>>>>>>>>>>>> response:",response);
	// console.trace()

	// load_data_promise
	if (response.result===false) {
		console.error("API EXCEPTION:",response.msg);
		return false
	}
	console.log("["+self.model+".load_data_debug] on render event response:",response, " API TIME: "+response.debug.exec_time)
	// console.log("["+self.model+".load_data_debug] context:",response.result.context)
	// console.log("["+self.model+".load_data_debug] data:",response.result.data)

	const debug = document.getElementById("debug")
	// debug.classList.add("hide")

	// clean
		while (debug.firstChild) {
			debug.removeChild(debug.firstChild)
		}

	// request to api
		// const sqo = dd_request_show_original.find(el => el.typo==='sqo') || null 
		const sqo = rqo_show_original.sqo
		const request_pre = ui.create_dom_element({
			element_type	: 'pre',
			text_content	: "dd_request sended to api: \n\n" + JSON.stringify(rqo_show_original, null, "  ") + "\n\n\n\n" + "dd_request new builded: \n\n" + JSON.stringify(dd_request, null, "  "),
			parent			: debug
		})


	// context
		const context_pre = ui.create_dom_element({
			element_type	: 'pre',
			text_content	: "context: " + JSON.stringify(response.result.context, null, "  "),
			parent			: debug
		})

	// data
		const data_pre = ui.create_dom_element({
			element_type	: 'pre',
			text_content	: "data: " + JSON.stringify(response.result.data, null, "  "),
			parent			: debug
		})

	// const time_info = "" +
	// 	"Total time: " + response.debug.exec_time +
	// 	"<br>Context exec_time: " + response.result.debug.context_exec_time +
	// 	"<br>Data exec_time: " + response.result.debug.data_exec_time  + "<br>"

	// const time_info_pre = ui.create_dom_element({
	// 	element_type : "pre",
	// 	class_name   : "total_time",
	// 	id   		 : "total_time",
	// 	inner_html   : time_info,
	// 	parent 		 : debug
	// })

	// show
		// event_manager.subscribe('render_'+self.id, function(node){
		// 	//console.log("node:",node);
		// 	debug.classList.remove("hide")
		// })
		debug.classList.remove("hide")


	return true
};//end load_data_debug



/**
* LOAD_DATA_FROM_DATUM
* Get and set current element data from current datum (used on build components and sections)
* when not already loaded data is vailable (injected on init for example)
* @return mixed self.data
*/
common.prototype.load_data_from_datum = function() {

	const self = this

	// load data from datum (use on build only)
		if (!self.data) {
			self.data = self.datum
				? self.datum.filter(el => el.tipo===self.tipo && el.section_tipo===self.section_tipo && el.section_id==self.section_id)
				: {
					tipo			: self.tipo,
					section_tipo	: self.section_tipo,
					section_id		: self.section_id,
					value			: [],
					fallback_value	: [""]
				  }
		}

	return self.data
};//end load_data_from_datum


