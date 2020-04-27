/*global get_label, page_globals, SHOW_DEBUG, DEDALO_CORE_URL*/
/*eslint no-undef: "error"*/



// imports
	import {event_manager} from '../../common/js/event_manager.js'
	import {data_manager} from '../../common/js/data_manager.js'
	import {common} from '../../common/js/common.js'
	import {component_common} from '../../component_common/js/component_common.js'
	import {paginator} from '../../paginator/js/paginator.js'
	import {render_component_portal} from '../../component_portal/js/render_component_portal.js'



/**
* COMPONENT_PORTAL
*/
export const component_portal = function(){

	this.id

	// element properties declare
	this.model
	this.tipo
	this.section_tipo
	this.section_id
	this.mode
	this.lang

	this.section_lang

	this.datum
	this.context
	this.data
	this.parent
	this.node
	this.pagination

	this.modal

	this.autocomplete
	this.autocomplete_active

	return true
}//end component_portal



/**
* COMMON FUNCTIONS
* extend component functions from component common
*/
// prototypes assign
	// lifecycle
	// component_portal.prototype.init 				= component_common.prototype.init
	// component_portal.prototype.build 			= component_common.prototype.build
	component_portal.prototype.render				= common.prototype.render
	component_portal.prototype.refresh				= common.prototype.refresh
	component_portal.prototype.destroy				= common.prototype.destroy

	// change data
	component_portal.prototype.save 	 			= component_common.prototype.save
	// component_portal.prototype.load_data 		= component_common.prototype.load_data
	// component_portal.prototype.load_datum 		= component_common.prototype.load_datum
	// component_portal.prototype.get_value 		= component_common.prototype.get_value
	// component_portal.prototype.set_value 		= component_common.prototype.set_value
	component_portal.prototype.update_data_value	= component_common.prototype.update_data_value
	component_portal.prototype.update_datum			= component_common.prototype.update_datum
	component_portal.prototype.change_value			= component_common.prototype.change_value
	component_portal.prototype.get_ar_instances		= component_common.prototype.get_ar_instances

	// render
	component_portal.prototype.list					= render_component_portal.prototype.list
	component_portal.prototype.edit					= render_component_portal.prototype.edit
	component_portal.prototype.edit_in_list			= render_component_portal.prototype.edit
	component_portal.prototype.change_mode			= component_common.prototype.change_mode



/**
* INIT
*/
component_portal.prototype.init = async function(options) {
	
	const self = this

	// autocomplete. set default values of service autocomplete
		self.autocomplete 		= null
		self.autocomplete_active= false

	// call the generic commom tool init
		const common_init = component_common.prototype.init.call(this, options);

	// events subscribe
		self.events_tokens.push(
			// user click over list record
			event_manager.subscribe('initiator_link_' + self.id, async (locator)=>{

				// add locator selected
					const result = await self.add_value(locator)
					if (result===false) {
						alert("Value already exists!");
						return
					}
				// modal close
					if (self.modal) {
						self.modal.close()
					}
			})
		)


	return common_init
}//end init



/**
* BUILD
* @param object value (locator)
* @return bool
*/
component_portal.prototype.build  = async function(autoload=false){
	const t0 = performance.now()

	const self = this

	// status update
		self.status = 'building'

	// load data if not yet received as an option
		if (autoload===true) {

			const current_data_manager 	= new data_manager()
			const api_response 			= await current_data_manager.section_load_data(self.sqo_context.show)
			
			// Update the self.data into the datum and self instance
			self.update_datum(api_response)
		}

	// pagination safe defaults
		self.pagination.total 	= self.pagination.total  || 0
		self.pagination.offset 	= self.pagination.offset || 0
		self.pagination.limit 	= self.pagination.limit  || self.context.properties.max_records || 3

	// sqo update filter_by_locators
		if(self.pagination.total>self.pagination.limit){

			const show 	= self.sqo_context.show
			const sqo 	= show.find(item => item.typo==='sqo')

			const data_value = self.data.value

			sqo.filter_by_locators = data_value
		}//end if(self.pagination.total>self.pagination.limit)

	// paginator
		if (!self.paginator) {
			// create new
			const current_paginator = new paginator()
			current_paginator.init({
				caller : self
			})
			await current_paginator.build()
			self.paginator = current_paginator

			self.events_tokens.push(
				event_manager.subscribe('paginator_goto_'+current_paginator.id , async (offset) => {
					self.pagination.offset = offset
					self.refresh()
				})
			)//end events push

		}else{
			// refresh existing
			self.paginator.offset = self.pagination.offset
			self.paginator.total  = self.pagination.total
			self.paginator.refresh()
		}

	// autocomplete destroy. change the autocomplete service to false and desactive it.
		if(self.autocomplete && self.autocomplete_active===true){
			self.autocomplete.destroy()
			self.autocomplete_active = false
			self.autocomplete 		 = null			
		}

	// permissions. calculate and set (used by section records later)
		self.permissions = self.context.permissions

	// debug
		if(SHOW_DEBUG===true) {
			console.log("__Time to build", self.model, " ms:", performance.now()-t0);
			//console.log("component_portal self +++++++++++ :",self);
			//console.log("========= build self.pagination.total:",self.pagination.total);
		}

	// status update
		self.status = 'builded'

	
	return true
}//end component_portal.prototype.build



/**
* ADD_VALUE
* @param object value (locator)
* @return bool
*/
component_portal.prototype.add_value = async function(value) {

	const self = this

	// check if value lready exists
		// const current_value = self.data.value
		// const exists 		= current_value.find(item => item.section_tipo===value.section_tipo && item.section_id===value.section_id)
		// if (typeof exists!=="undefined") {
		// 	console.log("[add_value] Value already exists !");
		// 	return false
		// }

	// update pagination total
		// self.pagination.total = self.data.value ? self.data.value.length : 0

	const key = self.pagination.total || 0

	const changed_data = Object.freeze({
		action	: 'insert',
		key		: key,
		value	: value
	})

	if(SHOW_DEBUG===true) {
		console.log("==== add_value - value - changed_data:", value, changed_data);
	}

	// des
		// const js_promise = self.change_value({
		// 	changed_data : changed_data,
		// 	refresh 	 : false
		// })
		// .then(async (api_response)=>{

		// 	// destroy. change the portal service to false and desactive it.
		// 		if(self.portal_active===true){
		// 			self.portal.destroy()
		// 			self.portal_active = false
		// 			self.portal 		 = null
		// 		}

		// 	// update pagination offset and total
		// 		self.update_pagination_values()
		// 		await self.paginator.build()

		// 	// refresh
		// 		self.refresh()

		// 	return true
		// })

	// change_value
		const api_response = await self.change_value({
			changed_data : changed_data,
			refresh 	 : false
		})

	// update pagination offset
		self.update_pagination_values()

	// refresh self component
		self.refresh()


	return true
}//end add_value



/**
* UPDATE_PAGINATION_VALUES
*/
component_portal.prototype.update_pagination_values = function() {

	const self = this

	// update pagination offset and total
		const last_offset 	= self.get_last_offset()
		//const current_total = self.pagination.total

	// self pagination update
		self.pagination.offset 	= last_offset
		//self.pagination.total = current_total

	// // paginator object update
	// 	self.paginator.offset 	= last_offset
	// 	self.paginator.total 	= current_total

	return true
}//end update_pagination_values



/**
* GET_LAST_OFFSET
*/
component_portal.prototype.get_last_offset = function() {
	//console.log("[get_last_offset] self:",self);

	const self = this

	const total = self.pagination.total
	const limit = self.pagination.limit

	const _calculate = () => {

		if (total>0 && limit>0) {

			const total_pages = Math.ceil(total / limit)

			return parseInt( limit * (total_pages -1) )

		}else{

			return 0
		}
	}
	const offset_last = _calculate()

	if(SHOW_DEBUG===true) {
		console.log("====get_last_offset offset_last:",offset_last, "total",total, "limit",limit);
	}

	return offset_last
}//end get_last_offset



/**
* REMOVE_VALUE
* @param object value (locator)
* @return bool
*//*
component_portal.prototype.remove_value = async function(target) {

	const self = this

	// user confirmation prevents remove accidentally
		if (!confirm(`Sure to remove value: ${target.previousElementSibling.textContent} ?`)) return false

	const key = parseInt(target.dataset.key)

	// update_data_value.
		const changed_data = {
			action	: 'remove',
			key		: key,
			value	: null
		}

	// update the data in the instance previous to save
		self.update_data_value(changed_data)
		self.data.changed_data = changed_data

	// rebuild and save the component
		const js_promise = self.save(self.data.changed_data).then(async api_response => {

			// update offset
				//self.pagination.offset = get_last_offset(self)

			// update total
				//self.pagination.total--;

			// refresh self
				self.refresh()

			// publish event (refresh all identical components)
				//event_manager.publish('remove_element_'+self.id, key)

		})

	return js_promise
}//end remove_value
*/