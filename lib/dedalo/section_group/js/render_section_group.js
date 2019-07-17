// imports
	//import event_manager from '../../page/js/page.js'
	//import {ui} from '../../common/js/ui.js'



/**
* RENDER_SECTION_GROUP
* Manages the component's logic and apperance in client side
*/
export const render_section_group = function() {


}//end render_section_group



/**
* EDIT
* Render node for use in edit
* @return DOM node
*/
render_section_group.prototype.edit = function(ar_section_record) {
	
	const self = this

	// wrapper
		const wrapper = common.create_dom_element({
			element_type	: 'div',
			id 				: self.id,
			class_name		: self.model + ' ' + self.tipo + ' ' + self.mode + ' sgc_edit'
		})

	// header
		const header = common.create_dom_element({
			element_type	: 'div',
			class_name		: 'label',
			parent 			: wrapper,
			text_content 	: "Section group " + self.tipo
		})
		.addEventListener("click", () => {
			console.log("click this.node.children[1]:",this.node.children[1]);
			this.node.children[1].classList.toggle('hide');
		}, false)

	// body
		const body = common.create_dom_element({
			element_type	: 'div',
			class_name		: 'body',
			parent 			: wrapper
		})
	
	return wrapper
}//end edit



/**
* LIST
* Render node for use in list
* @return DOM node
*/
render_section_group.prototype.list = render_section_group.prototype.edit

