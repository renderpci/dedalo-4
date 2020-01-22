/*global get_label, page_globals, SHOW_DEBUG, DEDALO_CORE_URL*/
/*eslint no-undef: "error"*/



// imports
	import {event_manager} from '../../common/js/event_manager.js'
	import {ui} from '../../common/js/ui.js'





/**
* Render_component
* Manage the components logic and appearance in client side
*/
export const render_component_json = function(options) {

	return true
}//end render_component_json



/**
* LIST
* Render node for use in list
* @return DOM node
*/
render_component_json.prototype.list = function() {

	const self = this

	// Options vars
		const data = self.data

	// wrapper
		const wrapper = ui.component.build_wrapper_list(self, {
			autoload : false
		})

	// Value as string
		const value_string = JSON.stringify(data.value)

	// Set value
		wrapper.textContent = value_string


	return wrapper
}//end list



/**
* EDIT
* Render node for use in edit
* @return DOM node
*/
render_component_json.prototype.edit = async function(options={render_level:'full'}) {

	const self = this


	// fix non value scenarios
		self.data.value = (!self.data.value || self.data.value.length<1) ? [null] : self.data.value


	const render_level 	= options.render_level

	// content_data
		const current_content_data = await get_content_data_edit(self)
		if (render_level==='content') {
			return current_content_data
		}

	// wrapper. ui build_edit returns component wrapper
		const wrapper = ui.component.build_wrapper_edit(self, {
			content_data : current_content_data
		})

	// add events
		//add_events(self, wrapper)


	return wrapper
}//end edit



/**
* ADD_EVENTS
*/
const add_events = function(self, wrapper) {

	// update value, subscription to the changes: if the dom input value was changed, observers dom elements will be changed own value with the observable value
		self.events_tokens.push(
			event_manager.subscribe('update_value_'+self.id, update_value)
		)
		function update_value (changed_data) {
			//console.log("-------------- - event update_value changed_data:", changed_data);
			// change the value of the current dom element
			const changed_node = wrapper.querySelector('input[data-key="'+changed_data.key+'"]')
			changed_node.value = changed_data.value
		}

	// change event, for every change the value in the imputs of the component
		wrapper.addEventListener('change', async (e) => {
			//e.stopPropagation()
			alert("Changed ! [under construction]");

			/*
			// update
			if (e.target.matches('input[type="text"].input_value')) {
				//console.log("++update e.target:",JSON.parse(JSON.stringify(e.target.dataset.key)));
				//console.log("++update e.target value:",JSON.parse(JSON.stringify(e.target.value)));

				// // is_unique check
				// if (self.context.properties.unique) {
				// 	// const result = await check_duplicates(self, e.target.value, false)
				// 	if (self.duplicates) {
				// 		e.target.classList.add("duplicated")

				// 		const message = ui.build_message("Warning. Duplicated value " + self.duplicates.section_id)
				// 		wrapper.appedChild(message)

				// 		return false
				// 	}
				// }

				const changed_data = Object.freeze({
					action	: 'update',
					key		: JSON.parse(e.target.dataset.key),
					value	: (e.target.value.length>0) ? e.target.value : null,
				})
				self.change_value({
					changed_data : changed_data,
					refresh 	 : false
				})
				.then((save_response)=>{
					// event to update the dom elements of the instance
					event_manager.publish('update_value_'+self.id, changed_data)
				})

				return true
			}
			*/

		}, false)





	return true
}//end add_events



/**
* get_CONTENT_DATA_EDIT
* @return DOM node content_data
*/
const get_content_data_edit = async function(self) {

	const value = self.data.value
	const mode 	= self.mode

	const fragment = new DocumentFragment()

	// inputs container
		const inputs_container = ui.create_dom_element({
			element_type	: 'ul',
			class_name 		: 'inputs_container',
			parent 			: fragment
		})

	// values (inputs)
		const inputs_value = value//(value.length<1) ? [''] : value
		const value_length = inputs_value.length
		for (let i = 0; i < value_length; i++) {
			get_input_element(i, inputs_value[i], inputs_container, self)
			break; // only one is used
		}

	// buttons container
		const buttons_container = ui.create_dom_element({
			element_type	: 'div',
			class_name 		: 'buttons_container',
			parent 			: fragment
		})

	// button close
		if(mode==='edit_in_list' && !ui.inside_tool(self)){
			const button_close = ui.create_dom_element({
				element_type	: 'span',
				class_name 		: 'button close',
				parent 			: buttons_container
			})
		}

	// content_data
		const content_data = document.createElement("div")
			  content_data.classList.add("content_data", self.type, "nowrap")
		content_data.appendChild(fragment)


	return content_data
}//end get_content_data_edit



/**
* GET_INPUT_ELEMENT
* @return dom element li
*/
const get_input_element = async (i, current_value, inputs_container, self) => {

	const mode = self.mode

	let validated = false

	// li
		const li = ui.create_dom_element({
			element_type : 'li',
			parent 		 : inputs_container
		})

	// button_save
		const button_save = ui.create_dom_element({
			element_type : 'button',
			class_name	 : 'button_save',
			text_content : "Save",
			parent 		 : li
		})
		button_save.addEventListener("click", function(e) {
			this.blur()
			if (validated!==true) {

				alert("Error. Trying so save invalid json value!");
				return false
			}

			const changed_data = Object.freeze({
				action	: 'update',
				key		: 0,
				value	: editor.get()
			})
			self.change_value({
				changed_data : changed_data,
				refresh 	 : false
			})
			.then((save_response)=>{
				// event to update the dom elements of the instance
				event_manager.publish('update_value_'+self.id, changed_data)
			})
		})

	// // editor_container
	// 	const editor_container = ui.create_dom_element({
	// 		element_type : 'div',
	// 		parent 		 : li
	// 	})

	// load
		await self.init_editor()

	// create the editor
		const editor_options = {
			mode	: 'code',
			modes	: ['code', 'form', 'text', 'tree', 'view'], // allowed modes
			onError	: function (err) {
				console.error("err:",err);
				alert(err.toString());
			},
			onValidationError : function() {
				validated = false
			},
			onValidate: function() {
				validated = true

		       //var json = editor.get();
		       // Update hidden text area value
		       //editor_text_area.value = editor.getText()

				// const json = editor.get();
				//      	console.log("json:",json);
				//      	//console.log("json editor.get():",editor.get());
				//      	console.log("text editor.getText():",editor.getText());

				// const changed_data = Object.freeze({
				// 	action	: 'update',
				// 	key		: 0,
				// 	value	: editor.get()
				// })
				// self.change_value({
				// 	changed_data : changed_data,
				// 	refresh 	 : false
				// })
				// .then((save_response)=>{
				// 	// event to update the dom elements of the instance
				// 	event_manager.publish('update_value_'+self.id, changed_data)
				// })

		    }
		}
		const editor = new JSONEditor(li, editor_options, current_value)


	return li
}//end get_input_element

