/*global get_label, page_globals, SHOW_DEBUG, DEDALO_CORE_URL*/
/*eslint no-undef: "error"*/



// import
	import {event_manager} from '../../common/js/event_manager.js'
	import {ui} from '../../common/js/ui.js'



/**
* Render_component
* Manage the components logic and appearance in client side
*/
export const render_component_check_box = function() {

	return true
}//end render_component_check_box



/**
* LIST
* Render node for use in list
* @return DOM node
*/
render_component_check_box.prototype.list = async function() {

	const self = this

	// Options vars
		const context 	= self.context
		const data 		= self.data
		const value 	= data.value || []


	// wrapper
		const wrapper = ui.component.build_wrapper_list(self, {
			autoload : true
		})

	// Value as string
		const value_string = value.join(self.divisor)

	// Set value
		wrapper.textContent = value_string


	return wrapper
}//end list



/**
* EDIT

* Render node for use in edit
* @return DOM node
*/
render_component_check_box.prototype.edit = async function(options={render_level : 'full'}) {

	const self = this

	// fix non value scenarios
		self.data.value = (self.data.value.length<1) ? [null] : self.data.value

	// render_level
		const render_level = options.render_level || 'full'

	// sort vars
		const value		= self.data.value || []
		const datalist 	= self.data.datalist || []

	// content_data
		const content_data = await get_content_data_edit(self)
		if (render_level==='content') {
			return content_data
		}

	// buttons
		const buttons = get_buttons(self)

	// ui build_edit returns component wrapper
		const wrapper = ui.component.build_wrapper_edit(self, {
			content_data : content_data,
			buttons 	 : buttons
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

	// events delegated
	// update value, subscription to the changes: if the dom input value was changed, observers dom elements will be changed own value with the observable value
		self.events_tokens.push(
			event_manager.subscribe('update_value_'+self.id, update_value)
		)
		function update_value (component) {
			// change the value of the current dom element
			const changed_data = component.data.changed_data
			const changed_node = wrapper.querySelector('input[data-key="'+component.selected_key+'"]')
			changed_node.checked = (changed_data.value === null) ? false : true
		}

	// add button element, subscription to the events
		self.events_tokens.push(
			event_manager.subscribe('edit_element_'+self.id, edit_element)
		)
		function edit_element(component) {
			// change the value of the current dom element
			//const changed_data = component.data.changed_data
			//const inputs_container = wrapper.querySelector('.inputs_container')
			//input_element(changed_data.key, changed_data.value, inputs_container)
		}

	// remove button element, subscription to the events
		self.events_tokens.push(
			event_manager.subscribe('reset_element_'+self.id, reset_element)
		)
		async function reset_element(instance) {
			// change all elements inside of content_data
			const new_content_data = await content_data_edit(instance)
			// replace the content_data with the refresh dom elements (imputs, delete buttons, etc)
			wrapper.childNodes[1].replaceWith(new_content_data)
		}

	// change event, for every change the value in the imputs of the component
		wrapper.addEventListener('change', (e) => {
			// e.stopPropagation()

			// update / remove
				if (e.target.matches('input[type="checkbox"]')) {

					const action 		= (e.target.checked===true) ? 'insert' : 'remove'
					const parsed_value 	= JSON.parse(e.target.value)
					const changed_key 	= self.get_changed_key(action, parsed_value)
					const changed_value = (action==='insert') ? parsed_value : null

					const changed_data = Object.freeze({
						action  : action,
						key 	: changed_key,
						value 	: changed_value,
					})
					self.change_value({
						changed_data : changed_data,
						//label 		 : e.target.nextElementSibling.textContent,
						refresh 	 : false
					})
					.then((api_response)=>{
						self.selected_key = e.target.dataset.key
						// event to update the dom elements of the instance
						event_manager.publish('update_value_'+self.id, self)
					})

					return true
				}

		}, false)

	// click event
		wrapper.addEventListener("click", e => {
			// e.stopPropagation()

			// remove all
				if (e.target.matches('.button.reset')) {

					if (self.data.value.length===0) {
						return true
					}

					const changed_data = Object.freeze({
						action  : 'remove',
						key 	: false,
						value 	: null
					})
					self.change_value({
						changed_data : changed_data,
						label  		 : 'All',
						refresh 	 : true
					})
					.then((api_response)=>{
						// rebuild and save the component
						// event_manager.publish('reset_element_'+self.id, self)
						// event_manager.publish('save_component_'+self.id, self)
					})

					return true
				}

			// edit target section
				if (e.target.matches('.button.edit')) {

					// rebuild_nodes. event to render the component again
					event_manager.publish('edit_element_'+self.id, self)

					return true
				}

		})

	// focus event
		wrapper.addEventListener("focus", e => {
			// e.stopPropagation()

			// selected_node. fix selected node
			self.selected_node = wrapper

			if (e.target.matches('input[type="checkbox"]')) {
			 	event_manager.publish('active_component', self)

			 	return true
			}
		},true)

}

/**
* SEARCH
* Render node for use in search
* @return DOM node wrapper
*/
render_component_check_box.prototype.search = async function() {

	const self = this

	// fix non value scenarios
		self.data.value = (self.data.value.length<1) ? [null] : self.data.value

	const content_data = await get_content_data_search(self)

	// ui build_edit returns component wrapper
		const wrapper = ui.component.build_wrapper_edit(self, {
			content_data : content_data
		})

	// id
		wrapper.id = self.id

	// Events

		// change event, for every change the value in the imputs of the component
			wrapper.addEventListener('change', (e) => {
				e.stopPropagation()

				// input_value. The standard input for the value of the component
				if (e.target.matches('input[type="text"].input_value')) {
					//get the input node that has changed
					const input = e.target
					//the dataset.key has the index of correspondence self.data.value index
					const i 	= input.dataset.key
					// set the selected node for change the css
					self.selected_node = wrapper
					// set the changed_data for replace it in the instance data
					// update_data_value. key is the posistion in the data array, the value is the new value
					const value = (input.value.length>0) ? input.value : null
					// set the changed_data for update the component data and send it to the server for change when save
					const changed_data = {
						action	: 'update',
						key	  	: i,
						value 	: value
					}
					// update the data in the instance previous to save
					self.update_data_value(changed_data)
					// set the change_data to the instance
					self.data.changed_data = changed_data
					// event to update the dom elements of the instance
					event_manager.publish('change_search_element', self)
					return true
				}

				// q_operator. get the input value of the q_operator
				// q_operator: is a separate operator used with components that is impossible mark the operator in the input_value,
				// like; radio_button, check_box, date, autocomplete, etc
				if (e.target.matches('input[type="text"].q_operator')) {
					//get the input node that has changed
					const input = e.target
					// set the changed_data for replace it in the instance data
					// update_data_value. key is the posistion in the data array, the value is the new value
					const value = (input.value.length>0) ? input.value : null
					// update the data in the instance previous to save
					self.data.q_operator = value
					// event to update the dom elements of the instance
					event_manager.publish('change_search_element', self)
					return true
				}
			}, false)



	return wrapper
}//end search

/**
* GET_CONTENT_DATA_EDIT
* @return
*/
const get_content_data_edit = async function(self) {

	const value 		= self.data.value
	const datalist		= self.data.datalist
	const mode 			= self.mode
	const is_inside_tool= self.is_inside_tool

	const fragment = new DocumentFragment()

	// inputs
		const inputs_container = ui.create_dom_element({
			element_type	: 'ul',
			class_name 		: 'inputs_container',
			parent 			: fragment
		})

		// build options
		const datalist_length 	= datalist.length
		for (let i = 0; i < datalist_length; i++) {
			get_input_element_edit(i, datalist[i], inputs_container, self)
		}

	// buttons
		const buttons_container = ui.create_dom_element({
			element_type	: 'div',
			class_name 		: 'buttons_container',
			parent 			: fragment
		})

	// content_data
		const content_data = ui.component.build_content_data(self, {
			autoload : true
		})
		
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

	// button edit
		if((mode==='edit' || mode==='edit_in_list') && !is_inside_tool){
			ui.create_dom_element({
				element_type	: 'span',
				class_name 		: 'button edit',
				parent 			: fragment
			})
		}

	// button reset
		if(mode==='edit' || mode==='edit_in_list'){// && !is_inside_tool){
			ui.create_dom_element({
				element_type	: 'span',
				class_name 		: 'button reset',
				parent 			: fragment
			})
		}

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
* GET_INPUT_ELEMENT_EDIT
* @return dom element li
*/
const get_input_element_edit = (i, current_value, inputs_container, self) => {

	const value  		 = self.data.value || []
	const value_length   = value.length
	const datalist_item  = current_value
	const datalist_value = datalist_item.value
	const label 		 = datalist_item.label
	const section_id	 = datalist_item.section_id

	// create li
		const li = ui.create_dom_element({
			element_type	: 'li',
			parent 			: inputs_container
		})

	// input checkbox
		const option = ui.create_dom_element({
			element_type	: 'input',
			type 			: 'checkbox',
			id 				: self.id +"_"+ i,
			dataset 	 	: { key : i },
			value 			: JSON.stringify(datalist_value),
			parent 			: li
		})
		// checked option set on match
		for (let j = 0; j < value_length; j++) {
			if (value[j] && datalist_value &&
				value[j].section_id===datalist_value.section_id &&
				value[j].section_tipo===datalist_value.section_tipo
				) {
					option.checked = 'checked'
			}
		}

	// label
		const label_string = (SHOW_DEBUG===true) ? label + " [" + section_id + "]" : label
		const option_label = ui.create_dom_element({
			element_type	: 'label',
			text_content 	: label_string,
			parent 			: li
		})
		option_label.setAttribute("for", self.id +"_"+ i)


	return li
}//end get_input_element_edit



/**
* GET_CONTENT_DATA_SEARCH
* @return DOM node content_data
*/
const get_content_data_search = async function(self) {

	const value 		= self.data.value
	const mode 			= self.mode
	const datalist 		= self.data.datalist

	const fragment 			= new DocumentFragment()
	const is_inside_tool 	= ui.inside_tool(self)

	// values (inputs)
		const value_compare = value.length>0 ? value[0] : null
		const length = datalist.length
		for (let i = 0; i < value_length; i++) {
			get_input_element_search(i, datalist[i], fragment, self)
		}

	// content_data
		const content_data = ui.component.build_content_data(self, {
			autoload : true
		})
		
		content_data.classList.add("nowrap")
		content_data.appendChild(fragment)


	return content_data
}//end get_content_data_search



/**
* GET_INPUT_ELEMENT_SEARCH
* @return dom element input
*/
const get_input_element_search = (i, current_value, inputs_container, self) => {

	const datalist_item  	= current_value
	const datalist_value 	= datalist_item.value

	// q operator (search only)
		const q_operator = self.data.q_operator
		const input_q_operator = ui.create_dom_element({
			element_type 	: 'input',
			type 		 	: 'text',
			value 		 	: q_operator,
			class_name 		: 'q_operator',
			parent 		 	: inputs_container
		})

	// // input field
	// 	const input = ui.create_dom_element({
	// 		element_type 	: 'input',
	// 		type 		 	: 'text',
	// 		class_name 		: 'input_value',
	// 		dataset 	 	: { key : i },
	// 		value 		 	: current_value,
	// 		parent 		 	: inputs_container
	// 	})

			// input checkbox
		const option = ui.create_dom_element({
			element_type	: 'input',
			type 			: 'checkbox',
			id 				: self.id +"_"+ i,
			dataset 	 	: { key : i },
			value 			: JSON.stringify(datalist_value),
			name 			: self.id,
			parent 			: inputs_container
		})


	return input
}//end get_input_element_search