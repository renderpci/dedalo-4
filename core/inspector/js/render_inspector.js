// import
	import {ui} from '../../common/js/ui.js'
	import {data_manager, download_url} from '../../common/js/data_manager.js'
	import {event_manager} from '../../common/js/event_manager.js'



/**
* RENDER_inspector
* Manages the component's logic and apperance in client side
*/
export const render_inspector = function() {

	return true
};//end render_inspector



/**
* EDIT
* Render node for use in edit
* @return DOM node wrapper
*/
render_inspector.prototype.edit = async function(options) {

	const self = this

	// render_level
		const render_level = options.render_level || 'full'

	// content data
		const content_data = await get_content_data(self)
		if (render_level==='content') {
			return content_data
		}

	// label
		const label = ui.create_dom_element({
			element_type	: 'div',
			class_name		: 'label',
			inner_html		: 'Inspector'
		})

	// wrapper
		const wrapper = ui.create_dom_element({
			element_type	: 'div',
			class_name		: 'wrapper_inspector text_unselectable',
		})

	// add elements
		wrapper.appendChild(label)
		wrapper.appendChild(content_data)

	// events
		// add_events(wrapper, self)


	return wrapper
};//end edit



/**
* ADD_EVENTS
* Attach element generic events to wrapper
*/
const add_events = (wrapper, self) => {

	// mousedown
		wrapper.addEventListener("mousedown", function(e){
			e.stopPropagation()
			//e.preventDefault()
			// prevent buble event to container element
			return false
		})


	return true
};//end add_events



/**
* GET_CONTENT_DATA
* @return DOM node content_data
*/
const get_content_data = async function(self) {

	// content_data
		const content_data = ui.create_dom_element({
			element_type	: 'div',
			class_name		: 'content_data inspector_content_data',
		})

	// paginator container
		const paginator_container = ui.create_dom_element({
			element_type	: 'div',
			class_name		: 'paginator_container',
			parent 			: content_data
		})

	// buttons container
		const buttons_container = ui.create_dom_element({
			element_type	: 'div',
			class_name		: 'buttons_container',
			parent 			: content_data
		})

		// button_new . Call API to create new section and navigate to the new record
			const button_new = ui.create_dom_element({
				element_type	: 'button',
				class_name		: 'light add',
				inner_html		: get_label.nuevo || "New",
				parent			: buttons_container
			})
			button_new.addEventListener('click', async (e) => {
				e.stopPropagation()

				// data_manager. create
				const api_response = await data_manager.prototype.request({
					body : {
						action			: 'create',
						section_tipo	: self.section_tipo
					}
				})
				if (api_response.result && api_response.result>0) {
					// launch event 'user_navigation' that page is watching
					event_manager.publish('user_navigation', {
						source : {
							tipo		: self.caller.tipo,
							mode		: self.caller.mode,
							model		: self.caller.model,
							section_id	: api_response.result
						}
					})
				}
			})
			// buttons_container.appendChild(button_new)


	// project container
		const project_container = ui.create_dom_element({
			element_type	: 'div',
			class_name		: 'project_container',
			parent			: content_data
		})

	// data_link
		const data_link = ui.create_dom_element({
			element_type	: 'button',
			class_name		: 'light eye data_link',
			text_content	: 'View record data',
			parent			: content_data
		})
		data_link.addEventListener("click", (e)=>{
			e.preventDefault()
			// window.open( DEDALO_CORE_URL + '/json/' + self.section_tipo + '/' + self.section_id )
			window.open( DEDALO_CORE_URL + '/json/json_display.php?url_locator=' + self.section_tipo + '/' + self.section_id )
		})

	// tool register files.	dd1340
		const section_tipo = self.caller.tipo
		if (section_tipo==="dd1340") {
			const register_download = ui.create_dom_element({
				element_type	: 'button',
				class_name		: 'warning download register_download',
				text_content	: "Download register file",
				parent			: content_data
			})
			register_download.addEventListener("click", (e)=>{
				e.preventDefault()
				const url 		= DEDALO_CORE_URL + '/json/json_display.php?url_locator=' + self.section_tipo + '/' + self.section_id
				const file_name = "register.json"
				// download_url (import from data_manager) temporal link create and click
				if (confirm(`Donwload file: ${file_name} ?`)) {
					download_url(url, file_name)
				}
			})
		}


	return content_data
};//end get_content_data
