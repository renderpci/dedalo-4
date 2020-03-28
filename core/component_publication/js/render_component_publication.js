/*global get_label, page_globals, SHOW_DEBUG, DEDALO_CORE_URL*/
/*eslint no-undef: "error"*/



// imports
	import {event_manager} from '../../common/js/event_manager.js'
	import {ui} from '../../common/js/ui.js'



/**
* Render_component
* Manage the components logic and appearance in client side
*/
export const render_component_publication = function() {

	return true
}//end render_component_publication



/**
* LIST
* Render node for use in list
* @return DOM node
*/
render_component_publication.prototype.list = async function() {

	const self = this

	// Options vars
		const context 	= self.context
		const data 		= self.data

	// wrapper
		const wrapper = ui.component.build_wrapper_list(self, {
			autoload : true
		})

	// Value as string
		const value_string = data.value //'component_publication not finish yet!'

	// Set value
		wrapper.textContent = value_string

	return wrapper
}//end list



/**
* EDIT
* Render node for use in edit
* @return DOM node wrapper
*/
render_component_publication.prototype.edit = async function(options={render_level : 'full'}) {

	const self = this

	// render_level
		const render_level = options.render_level

	const value		= self.data.value
	const datalist 	= self.data.datalist || []

	// content_data
		const content_data = await get_content_data_edit(self)
		if (render_level==='content') {
			return content_data
		}

	// buttons
		const buttons = get_buttons(self)

	// wrapper. ui build_edit returns component wrapper
		const wrapper = ui.component.build_wrapper_edit(self, {
			content_data : content_data,
			buttons 	 : buttons
		})

	// add events
		add_events(self, wrapper)


	return wrapper
}//end edit



/**
* ADD_EVENTS
*/
const add_events = function(self, wrapper) {
	// events delegated

	// change
		wrapper.addEventListener("change", e => {
			// e.stopPropagation()

			if (e.target.matches('input[type="checkbox"]')) {

				// selected_node. fix selected node
				self.selected_node = wrapper

				const input 		 = e.target
				const checked 		 = input.checked
				const changed_value = (checked===true) ? self.data.datalist.filter(item => item.section_id==1)[0].value : self.data.datalist.filter(item => item.section_id==2)[0].value

				const changed_data = Object.freeze({
					action  : 'update',
					key 	: 0,
					value 	: changed_value,
				})
				self.change_value({
					changed_data : changed_data,
					//label 		 : e.target.nextElementSibling.textContent,
					refresh 	 : false
				})
				.then((api_response)=>{
					//self.selected_key = e.target.dataset.key
					// event to update the dom elements of the instance
					//event_manager.publish('update_value_'+self.id, self)
				})

				return true
			}
		},false)

	// click event
		wrapper.addEventListener("click", e => {
			// e.stopPropagation()

			// change_mode
				if (e.target.matches('.button.close')) {
					//change mode
					self.change_mode('list', true)

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

	return true
}//end add_events



/**
* get_CONTENT_DATA_EDIT
* @return DOM node content_data
*/
const get_content_data_edit = async function(self) {

	// Options vars
	const mode 			= self.mode
	const value 		= self.data.value || []
	const is_inside_tool= self.is_inside_tool

	const fragment = new DocumentFragment()

	// inputs_container
		const inputs_container = ui.create_dom_element({
			element_type	: 'ul',
			class_name 		: 'inputs_container',
			parent 			: fragment
		})

	// build values
		const inputs_value = (value.length<1) ? [""] : value
		const value_length = inputs_value.length
		for (let i = 0; i < value_length; i++) {
			input_element(i, inputs_value[i], inputs_container, self)
		}

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

	// button close
		if(mode==='edit_in_list' && !is_inside_tool){
			const button_close = ui.create_dom_element({
				element_type	: 'span',
				class_name 		: 'button close',
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
* INPUT_ELEMENT
* @return dom element li
*/
const input_element = (i, current_value, inputs_container, self) => {

	const input_id = self.id + "_" + new Date().getUTCMilliseconds()

	// li
		const li = ui.create_dom_element({
			element_type : 'li',
			parent 		 : inputs_container
		})

	// div_switcher
		const div_switcher = ui.create_dom_element({
			element_type	: 'div',
			class_name 		: 'switcher_publication text_unselectable',
			parent 			: li
		})

	// input checkbox
		const input = ui.create_dom_element({
			element_type	: 'input',
			type 			: 'checkbox',
			class_name 		: 'ios-toggle',
			id 				: input_id,
			dataset 	 	: { key : i },
			value 			: JSON.stringify(current_value),
			parent 			: div_switcher
		})

		if (current_value.section_id==1) {
			input.setAttribute("checked", true)
		}

	// switch_label
		const switch_label = ui.create_dom_element({
			element_type	: 'label',
			class_name 		: 'checkbox-label',
			parent 			: div_switcher
		})
		switch_label.setAttribute("for",input_id)

	return li
}//end input_element


