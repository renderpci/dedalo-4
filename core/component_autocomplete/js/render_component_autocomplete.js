/*global get_label, page_globals, SHOW_DEBUG, DEDALO_CORE_URL*/
/*eslint no-undef: "error"*/



// imports
	import {event_manager} from '../../common/js/event_manager.js'
	import {data_manager} from '../../common/js/data_manager.js'
	import {get_instance, delete_instance} from '../../common/js/instances.js'
	import {ui} from '../../common/js/ui.js'
	import {service_autocomplete} from '../../services/service_autocomplete/js/service_autocomplete.js'



/**
* RENDER_COMPONENT_AUTOCOMPLETE
* Manages the component's logic and apperance in client side
*/
export const render_component_autocomplete = function() {

	return true
}//end render_component_autocomplete



/**
* LIST
* Render node for use in list
* @return DOM node wrapper
*/
render_component_autocomplete.prototype.list = async function() {

	const self = this

	const ar_section_record = await self.get_ar_instances()

	// wrapper
		const wrapper = ui.create_dom_element({
			element_type	: 'div',
			class_name		: self.model + '_list ' + self.tipo + ' breakdown'
		})


	// add all nodes
		const length = ar_section_record.length
		for (let i = 0; i < length; i++) {

			//const child_item = await ar_section_record[i].node
			const child_item = await ar_section_record[i].render()

			wrapper.appendChild(child_item)
		}

	// events
		// dblclick
			wrapper.addEventListener("dblclick", function(e){
				// e.stopPropagation()

				// change mode
				self.change_mode('edit_in_list', true)
			})


	return wrapper
}//end list



/**
* EDIT
* Render node for use in edit
* @return DOM node wrapper
*/
render_component_autocomplete.prototype.edit = async function(options={render_level:'full'}) {

	const self = this

	// render_level
		const render_level = options.render_level

	// reset service state autocomplete_active
		self.autocomplete_active = false

	// content_data
		const content_data = await get_content_data_edit(self)
		if (render_level==='content') {
			return content_data
		}

	// buttons
		const buttons = get_buttons(self)

	// top
		const top = get_top(self)

	// wrapper. ui build_edit returns component wrapper
		const wrapper =	ui.component.build_wrapper_edit(self, {
			content_data : content_data,
			buttons 	 : buttons,
			top 		 : top
		})

	// events
		add_events(self, wrapper)


	return wrapper
}//end edit



/**
* ADD_EVENTS
* @return bool
*/
const add_events = function(self, wrapper) {

	// add element, subscription to the events
	// show the add_value in the instance
		//self.events_tokens.push(
		//	event_manager.subscribe('add_element_'+self.id, add_element)
		//)
		//async function add_element(key) {
		//	self.refresh()
		//	// change the autocomplete service to false and desactive it.
		//
		//	//if(self.autocomplete_active===true){
		//	//	self.autocomplete.destroy()
		//	//	self.autocomplete_active = false
		//	//	self.autocomplete 		 = null
		//	//}
		//
		//	//self.refresh();
		//
		//	// inset the new section_record into the ar_section_record and build the node of the new locator
		//	//ar_section_record.push(current_section_record)
		//	//const inputs_container 	= wrapper.querySelector('.inputs_container')
		//	//input_element(current_section_record, inputs_container)
		//}

	// subscribe to 'update_dom': if the dom was changed by other dom elements the value will be changed
		//self.events_tokens.push(
		//	event_manager.subscribe('update_dom_'+self.id, (value) => {
		//		// change the value of the current dom element
		//	})
		//)

	// remove element, subscription to the events
		self.events_tokens.push(
			event_manager.subscribe('remove_element_'+self.id, remove_element)
		)
		async function remove_element(key) {
			//// Solucionar el paginado al borrar (!) :
			//const paginated_key = ar_section_record.find((item, index) => {
			//											if(item.paginated_key===removed_key){
			//												return index
			//											}
			//											})
			//ar_section_record.splice(paginated_key,1)
			//
			//// change all elements inside of content_data
			//const new_content_data = await render_content_data(ar_section_record)
			//// replace the content_data with the refresh dom elements (imputs, delete buttons, etc)
			//wrapper.childNodes[1].replaceWith(new_content_data)
		}

	// click
		wrapper.addEventListener("click", function(e){
			// e.stopPropagation()

			// ignore click on paginator
				//if (e.target.closest('.paginator')) {
				//	return false
				//}

			// remove
				if (e.target.matches('.button.remove')) {

					const changed_data = Object.freeze({
						action	: 'remove',
						key		: JSON.parse(e.target.dataset.key),
						value	: null
					})
					self.change_value({
						changed_data : changed_data,
						label 		 : e.target.previousElementSibling.textContent,
						refresh 	 : false
					})
					.then(async (api_response)=>{

						// service destroy. change the autocomplete service to false and desactive it.
							if(self.autocomplete_active===true){
								const destroyed = self.autocomplete.destroy()
								self.autocomplete_active = false
								self.autocomplete 		 = null
							}

						// update pagination offset
							self.update_pagination_values()

						// refresh
							self.refresh()

						// event to update the dom elements of the instance
							event_manager.publish('remove_element_'+self.id, e.target.dataset.key)
					})

					return true
				}


			// activate service. Enable the service_autocomplete when the user do click
				if(self.autocomplete_active===false){

					self.autocomplete = new service_autocomplete()
					self.autocomplete.init({
						caller	: self,
						wrapper : wrapper
					})
					self.autocomplete_active = true
					self.autocomplete.search_input.focus()

					return true
				}

		})//end click event


	return true
}//end add_events



/**
* GET_CONTENT_DATA_EDIT
* @return DOM node content_data
*/
const get_content_data_edit = async function(self) {

	const ar_section_record = await self.get_ar_instances()
	const is_inside_tool 	= self.is_inside_tool

	const fragment = new DocumentFragment()

	// inputs contaniner
		const inputs_container = ui.create_dom_element({
			element_type	: 'ul',
			class_name 		: 'inputs_container'
		})

	// build values (add all nodes from the rendered_section_record)
		const length = ar_section_record.length
		for (let i = 0; i < length; i++) {
			const current_section_record =  ar_section_record[i]
			if (!current_section_record) {
				console.log("current_section_record:",current_section_record);
			}
			await input_element(current_section_record, inputs_container)
			//const section_record_node = await ar_section_record[i].render()
		}
		fragment.appendChild(inputs_container)

	// content_data
		const content_data = ui.component.build_content_data(self)
			  content_data.classList.add("nowrap")
			  content_data.appendChild(fragment)


	return content_data
}//end get_content_data_edit



/**
* GET_BUTTONS
* @param object instance
* @return DOM node buttons_container
*/
const get_buttons = (self) => {

	const is_inside_tool= self.is_inside_tool
	const mode 			= self.mode

	const fragment = new DocumentFragment()

	// buttons tools
		if (!is_inside_tool) {
			ui.add_tools(self, fragment)
		}

	// buttons container
		const buttons_container = ui.component.build_buttons_container(self)
		buttons_container.appendChild(fragment)


	return buttons_container
}//end get_buttons



/**
* GET_TOP
* @param object instance
* @return DOM node buttons_container
*/
const get_top = function(self) {

	const is_inside_tool= self.is_inside_tool
	const mode 			= self.mode

	if (mode!=='edit') {
		return null;
	}

	const show 						 = self.sqo_context.show
	const target_section_tipo 		 = show.filter(item => item.model==='section')
	const target_section_tipo_lenght = target_section_tipo.length
	// sort by label
	target_section_tipo.sort((a, b) => (a.label > b.label) ? 1 : -1)

	const fragment = new DocumentFragment()

	// top container
		const top = ui.create_dom_element({
			element_type	: 'div',
			class_name 		: 'top',
			parent 			: fragment
		})
		top.addEventListener("click", function(e){
			e.stopPropagation()
		})

	// select_section
		const select_section = ui.create_dom_element({
			element_type	: 'select',
			class_name 		: 'select_section' + (target_section_tipo_lenght===1 ? ' mono' : ''),
			parent 			: top
		})

		// options
			for (let i = 0; i < target_section_tipo_lenght; i++) {
				const item = target_section_tipo[i]
				ui.create_dom_element({
					element_type	: 'option',
					value 			: item.tipo,
					inner_html 		: item.label + " [" + item.tipo + "]",
					parent 			: select_section
				})
			}

	// button_add
		const button_add = ui.create_dom_element({
			element_type	: 'span',
			class_name 		: 'button add',
			parent 			: top
		})
		button_add.addEventListener("click", async function(e){
			e.stopPropagation()
			console.log("select_section.value:",select_section.value);

			// data_manager. create new record
				const api_response = await data_manager.prototype.request({
					body : {
						action 		: 'create',
						section_tipo: select_section.value
					}
				})
				// add value to current data
				if (api_response.result && api_response.result>0) {

					const value = {
						section_tipo : select_section.value,
						section_id 	 : api_response.result
					}
					self.add_value(value)
				}else{
					console.error("Error on api_response on try to create new row:", api_response);
				}
		})



	// button_find
		const button_find = ui.create_dom_element({
			element_type	: 'span',
			class_name 		: 'button find',
			parent 			: top
		})
		button_find.addEventListener("click", async function(e){
			e.stopPropagation()

			const section_tipo  = select_section.value
			const section_label = select_section.options[select_section.selectedIndex].innerHTML;


			const current_data_manager 	= new data_manager()

			// const source = {
			// 	typo 		 : 'source',
			// 	tipo 		 : section_tipo,
			// 	section_tipo : section_tipo,
			// 	section_id 	 : null,
			// 	model 		 : 'section',
			// 	lang 		 : page_globals.dedalo_data_lang,
			// 	pagination 	 : {
			// 		total  : 0,
			// 		offset : 0,
			// 		limit  : 10
			// 	}
			// }
			// const element_context_call 	= await current_data_manager.get_element_context(source)
			// const element_context 		= element_context_call.result

			// // section instance (regular section)
			// 	const section_instance = await get_instance({
			// 		model 			: "section",
			// 		tipo 			: source.section_tipo,
			// 		section_tipo 	: source.section_tipo,
			// 		section_id 		: null,
			// 		mode 			: "list",
			// 		lang 			: source.lang,
			// 		section_lang 	: source.lang,
			// 		type 			: "section",
			// 		// sqo_context 	: {
			// 		// 	show : show
			// 		// }
			// 		context 		: element_context
			// 	})
			// 	await section_instance.build(true)
			// 		console.log("section_instance:",section_instance);


			// section. create target section page element and instance
				if (!self.find_section_options) {
					const options 		= {
						model 			: 'section',
						type 			: 'section',
						tipo  			: section_tipo,
						section_tipo  	: section_tipo,
						section_id 		: null,
						mode 			: 'list',
						lang 			: page_globals.dedalo_data_lang
					}
					const page_element_call = await current_data_manager.get_page_element(options)
					const page_element 		= page_element_call.result
						  // page_element.id_variant = 'ID_VARIANT_PORTAL'

					self.find_section_options = page_element
				}
					  // console.log("++++++++++++++++++++++ page_element:",page_element);

				const find_section = await get_instance(self.find_section_options)
				await find_section.build(true)
				const find_section_wrapper = await find_section.render()

			// modal container
				const header = ui.create_dom_element({
					element_type	: 'div',
					text_content 	: section_label
				})
				const modal_container = ui.attach_to_modal(find_section, find_section_wrapper, header, 'big')
		})





	return top
}//end get_top



/**
* INPUT_ELEMENT
* @return dom element li
*/
const input_element = async function(current_section_record, inputs_container){

	const key = current_section_record.paginated_key

	// li
		const li = ui.create_dom_element({
			element_type : 'li',
			dataset 	 : { key : key },
			parent 		 : inputs_container
		})

	// input field
		const section_record_node = await current_section_record.render()
		li.appendChild(section_record_node)

	// button remove
		const button_remove = ui.create_dom_element({
			element_type	: 'span',
			class_name 		: 'button remove',
			dataset			: { key : key },
			parent 			: li
		})


	return li
}//end input_element


