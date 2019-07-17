// import
	import {ui} from '../../common/js/ui.js'

/**
* Render_component
* Manages the component's logic and apperance in client side
*/
export const render_component_calculation = function(component) {

	this.component 			= component
	this.context 			= component.context
	this.data 				= component.data

	this.tipo 				= component.tipo
	this.section_tipo		= component.section_tipo
	this.section_id			= component.section_id
	this.mode 				= component.mode
	this.lang 				= component.lang
	this.section_lang 		= component.section_lang
	this.model 				= component.model
	this.id 				= component.id

}//end render_component_calculation



/**
* LIST
* Render node for use in list
* @return DOM node
*/
render_component_calculation.prototype.list = function(options) {

	const self = this

	// Options vars 
		const context 			= self.context
		const data 				= self.data
	
	// Value as string
		const value_string = Array.isArray(data.value) ? data.value.join(' | ') : data.value

	// Node create
		const node = common.create_dom_element({
			element_type	: "div",
			class_name		: self.model + '_list ' + self.tipo,
			text_content 	: value_string
		})

	// Debug
		//console.log("++ context", context);
		//console.log("++ data:", data);

	return node
}//end list



/**
* EDIT
* Render node for use in edit
* @return DOM node
*/
render_component_calculation.prototype.edit = function(options) {
	
	const self = this
	
	// Options vars 
		const context 			= self.context
		const data 				= self.data || []
		const value 			= data.value || []
		const label 			= context.label		
		const model 			= self.model
		const mode 				= 'edit'
		const tipo 				= context.tipo
		const section_id 		= data.section_id
		const id 				= self.id || 'id is not set'

	// wrapper 
		const wrapper = ui.component.build_wrapper({
			id 			: id,
			tipo 		: tipo,
			model 		: model,
			mode 		: mode,
			component 	: self.component
		})

	// label 
		const component_label = ui.component.build_label({			
			mode 	: mode,
			label 	: label,
			parent 	: wrapper
		})

	// content_data	
		const content_data = ui.component.build_content_data({		
			parent : wrapper
		})		

		const input = common.create_dom_element({
			element_type	: 'div',
			text_content 	: value, 
			parent 			: content_data
		})	

	return wrapper
}//end edit