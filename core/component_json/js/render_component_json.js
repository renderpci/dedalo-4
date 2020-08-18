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
}; //end render_component_json


/**
* MINI
* Render node to be used by service autocomplete or any datalist
* @return DOM node
*/
render_component_json.prototype.mini = function() {

	const self = this

	// Options vars
		const data = self.data

	// wrapper
		const wrapper = ui.component.build_wrapper_mini(self)

	// Set value
		if(self.section_tipo==='dd542'){
			// activity section case
			const value_len = data.value.length
			const node = []
			for (let i = 0; i < value_len; i++) {
				const value_map = new Map(Object.entries(data.value[i]))
				for (let [key, value] of value_map) {
					node.push(key+ ": " +value)
				}
			}
			// wrapper.innerHTML = node.join('<br>')
			wrapper.insertAdjacentHTML('afterbegin', node.join('<br>'));
		}else{

			// Value as string
			const list_show_key = typeof self.context.properties!=="undefined"
				? self.context.properties.list_show_key
				: 'msg'
			const value_string = (typeof data.value[0][list_show_key]!=='undefined')
					? data.value[0][list_show_key]
					: JSON.stringify(data.value).substring(0,100)+" ..."
			wrapper.textContent = value_string
		}

	return wrapper
}; //end mini



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

	// Set value
		if(self.section_tipo==='dd542'){
			// activity section case
			const value_len = data.value.length
			const node = []
			for (let i = 0; i < value_len; i++) {
				const value_map = new Map(Object.entries(data.value[i]))
				for (let [key, value] of value_map) {
					node.push(key+ ": " +value)
				}
			}
			// wrapper.innerHTML = node.join('<br>')
			wrapper.insertAdjacentHTML('afterbegin', node.join('<br>'));
			wrapper.addEventListener('click', async (e) => {
				e.stopPropagation()
				wrapper.classList.toggle('show_full')
			})
		}else{

			// Value as string
			const list_show_key = typeof self.context.properties!=="undefined"
				? self.context.properties.list_show_key
				: 'msg'
			const value_string = (typeof data.value[0][list_show_key]!=='undefined')
					? data.value[0][list_show_key]
					: JSON.stringify(data.value).substring(0,100)+" ..."
			wrapper.textContent = value_string
		}


	return wrapper
}; //end list



/**
* EDIT
* Render node for use in edit
* @return DOM node
*/
render_component_json.prototype.edit = async function(options={render_level:'full'}) {

	const self = this

	// fix non value scenarios
		self.data.value = (!self.data.value || self.data.value.length<1) ? [null] : self.data.value

	// render_level
		const render_level = options.render_level

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

	// fix
		self.wrapper = wrapper

	// add events
		//add_events(self, wrapper)


	return wrapper
}; //end edit



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
}; //end add_events



/**
* GET_CONTENT_DATA_EDIT
* @return DOM node content_data
*/
const get_content_data_edit = async function(self) {

	const value 		= self.data.value
	const mode 			= self.mode
	const is_inside_tool= self.is_inside_tool

	const fragment = new DocumentFragment()

	// inputs container
		const inputs_container = ui.create_dom_element({
			element_type	: 'ul',
			class_name 		: 'inputs_container',
			parent 			: fragment
		})

	// values (inputs)
		const inputs_value = value
		const value_length = inputs_value.length
		if (value_length>1) {
			console.warn("More than one value in component_json is not allowed at now. Ignored next values. N values: ",value_length);
		}
		for (let i = 0; i < value_length; i++) {
			get_input_element(i, inputs_value[i], inputs_container, self)
			// const li = await get_input_element(i, inputs_value[i], inputs_container, self)
			// inputs_container.appendChild(li)
			break; // only one is used for the time being
		}

	// content_data
		const content_data = ui.component.build_content_data(self)
			  content_data.classList.add("nowrap")
			  content_data.appendChild(fragment)


	return content_data
}; //end get_content_data_edit



/**
* GET_BUTTONS
* @param object instance
* @return DOM node buttons_container
*/
const get_buttons = (self) => {

	const is_inside_tool= self.is_inside_tool
	const mode 			= self.mode

	const fragment = new DocumentFragment()

	// button_fullscreen
		const button_fullscreen = ui.create_dom_element({
			element_type : 'span',
			class_name	 : 'button full_screen',
			parent 		 : fragment
		})
		button_fullscreen.addEventListener("click", function(e) {
			// li.classList.toggle("fullscreen")
			self.wrapper.classList.toggle("fullscreen")
		})

	// button_download . Force automatic download of component data value
		const button_download = ui.create_dom_element({
			element_type : 'span',
			class_name	 : 'button download',
			title 		 : "Download data",
			parent 		 : fragment
		})
		button_download.addEventListener("click", function(e) {
			const export_obj  = self.data.value[0]
			const export_name = self.id
			download_object_as_json(export_obj, export_name)
		})

	// buttons tools
		if (!is_inside_tool) {
			ui.add_tools(self, fragment)
		}

	// buttons container
		const buttons_container = ui.component.build_buttons_container(self)
		buttons_container.appendChild(fragment)


	return buttons_container
}; //end get_buttons



/**
* GET_INPUT_ELEMENT
* @return dom element li
*/
const get_input_element = async (i, current_value, inputs_container, self) => {

	const mode = self.mode

	let validated = false
	let editor


	// li
		const li = ui.create_dom_element({
			element_type	: 'li',
			parent			: inputs_container
		})

	// button_save
		const button_save = ui.create_dom_element({
			element_type : 'button',
			class_name	 : 'primary save button_save',
			text_content : "Save",
			parent 		 : li
		})
		button_save.addEventListener("click", function(e) {
			e.stopPropagation()

			const current_value = editor.get()

			// check json format and validate
				if (validated!==true) {
					// styles as error
						self.node.map(item => {
							item.classList.add("error")
						})
					alert("Error: component_json. Trying so save non validated json value!");
					return false
				}

			// check data has really changed. If not, stop save
				const db_value 	= typeof self.data.value[0]!=="undefined" ? self.data.value[0] : null
				const changed 	= JSON.stringify(db_value)!==JSON.stringify(current_value)
				if (!changed) {
					console.log("No changes are detected. Stop save");
					return false
				}

			// save sequence
				const changed_data = Object.freeze({
					action	: 'update',
					key		: 0,
					value	: current_value
				})
				self.change_value({
					changed_data : changed_data,
					refresh 	 : false
				})
				.then((save_response)=>{
					// event to update the dom elements of the instance
					event_manager.publish('update_value_'+self.id, changed_data)

					on_change(self, editor)
				})
		})

	// load editor files (js/css)
	await self.load_editor_files()
	// .then(()=>{
	// setTimeout(()=>{



		// editor_options
			const editor_options = {
				mode	 : 'code',
				modes	 : ['code', 'form', 'text', 'tree', 'view'], // allowed modes
				// maxLines : 100, // Infinity,
				onError	 : function (err) {
					console.error("err:",err);
					alert(err.toString());
				},
				onValidationError : function() {
					validated = false
				},
				onChange : function(json) {
					if (editor) {
						on_change(self, editor)
					}else{
						console.error("Error. editor is not available!:");
					}
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
			    },
			    onBlur: function() {
				    // 	console.log('content changed:', this);
				    // 	alert("content changed");
			    }
			}

		// create a new instace of the editor when DOM element is ready
			// event_manager.when_in_dom(li, function(){
			// 	console.log("container in DOM:",li);
			// })

			editor = new JSONEditor(li, editor_options, current_value)

			// append current editor
			self.editors.push(editor)
	// })
	// }, 2000)

	// blur event
			// const ace_editor = editor.aceEditor
			// ace_editor.on("blur", function(e){
			// 	e.stopPropagation()
			//
			// 	const db_value 		= typeof self.data.value[0]!=="undefined" ? self.data.value[0] : null
			// 	const edited_value 	= editor.get()
			// 	const changed 		= JSON.stringify(db_value)!==JSON.stringify(edited_value)
			// 	if (!changed) {
			// 		return false
			// 	}
			//
			// 	if (confirm("Save json data changes?")) {
			// 		button_save.click()
			// 	}
			// })


	return li
}; //end get_input_element



/**
* ON_CHANGE
*/
const on_change = function(self, editor) {

	const editor_wrapper	= editor.frame
	const button_save		= editor_wrapper.previousElementSibling
	const db_value			= typeof self.data.value[0]!=="undefined" ? self.data.value[0] : null

	button_save.classList.add("warning")
	editor_wrapper.classList.add("isDirty")

	try {
		const edited_value 	= editor.get()
	}catch(e){
		// console.log("e:",e);
		editor_wrapper.classList.add("isDirty")

	}

	if (typeof edited_value!=="undefined") {

		const changed = JSON.stringify(db_value)!==JSON.stringify(edited_value)
		if (changed) {
			editor_wrapper.classList.add("isDirty")
			button_save.classList.add("warning")
		}else{
			if (editor_wrapper.classList.contains("isDirty")) {
				editor_wrapper.classList.remove("isDirty")
				button_save.classList.remove("warning")
			}
		}
	}

	return true
}; //end on_change



/**
* DOWNLOAD_OBJECT_AS_JSON
* Force automatic download of component data value
*/
const download_object_as_json = function(export_obj, export_name){

    const data_str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(export_obj,undefined,2));

    const download_anchor_node = document.createElement('a');
    	  download_anchor_node.setAttribute("href",     data_str);
    	  download_anchor_node.setAttribute("download", export_name + ".json");

    document.body.appendChild(download_anchor_node); // required for firefox

    download_anchor_node.click();
    download_anchor_node.remove();

    return true
}; //end download_object_as_json
