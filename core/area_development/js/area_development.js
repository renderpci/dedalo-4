// imports
	import {common} from '../../common/js/common.js'
	import {area_common} from '../../common/js/area_common.js'
	import {data_manager} from '../../common/js/data_manager.js'
	import {render_area_development} from './render_area_development.js'



/**
* AREA_DEVELOPMENT
*/
export const area_development = function() {

	this.id

	// element properties declare
	this.model
	this.type
	this.tipo
	this.mode
	this.lang

	this.datum
	this.context
	this.data

	this.widgets

	this.node
	this.status

	return true
}//end area_development



/**
* COMMON FUNCTIONS
* extend component functions from component common
*/
// prototypes assign
	area_development.prototype.init 		= area_common.prototype.init
	area_development.prototype.build 		= area_common.prototype.build
	area_development.prototype.render 		= common.prototype.render
	area_development.prototype.refresh 		= common.prototype.refresh
	area_development.prototype.destroy 		= common.prototype.destroy
	area_development.prototype.edit 		= render_area_development.prototype.edit
	area_development.prototype.list 		= render_area_development.prototype.list



/**
* INIT_JSON_EDITOR
*/
area_development.prototype.init_json_editor = async function(widget_object) {

	const self = this

	const editor_id 	 = widget_object.editor_id
	const trigger 		 = widget_object.trigger
	const body_response  = widget_object.body_response
	const print_response = widget_object.print_response


	// load dependences js/css
		const load_promises = []

		const lib_css_file = DEDALO_ROOT_WEB + '/lib/jsoneditor/dist/jsoneditor.min.css'
		load_promises.push( common.prototype.load_style(lib_css_file) )

		// const lib_js_file = DEDALO_ROOT_WEB + '/lib/jsoneditor/dist/jsoneditor.min.js'
		// load_promises.push( common.prototype.load_script(lib_js_file) )
		const load_promise = import('../../../lib/jsoneditor/dist/jsoneditor.min.js') // used minified version for now
		load_promises.push( load_promise )

		const load_all = await Promise.all(load_promises).then(async function(response){
			//console.log("JSONEditor:",response);
		})

	const editor_text_area = document.getElementById(editor_id)
		  // Hide real data container
		  editor_text_area.style.display = "none"

	const result_div = document.getElementById("convert_search_object_to_sql_query_response")

	// create the editor
	const container = document.getElementById(editor_id + '_container')
	const options   = {
			mode: 'code',
			modes: ['code', 'form', 'text', 'tree', 'view'], // allowed modes
			onError: function (err) {
			  alert(err.toString());
			},
			onChange: async function () {

				//setTimeout(async function(){

					const editor_text = editor.getText()

					if (editor_text.length<3) return

					// data_manager
					const api_response = await data_manager.prototype.request({
						body : {
							dd_api		: trigger.dd_api,
							action 		: trigger.action,
							options 	: editor_text
						}
					})
					console.log("api_response:",api_response);

					print_response(body_response, api_response)

					return api_response

				//}, 650)
		    }
		}
	const editor_value = null; //'{"id":"temp","filter":[{"$and":[{"$or":[{"q":"{\"section_id\":\"4\",\"section_tipo\":\"numisdata300\",\"component_tipo\":\"numisdata309\"}","lang":"all","path":[{"name":"Catálogo","modelo":"component_select","section_tipo":"numisdata3","component_tipo":"numisdata309"}]},{"q":"{\"section_id\":\"2\",\"section_tipo\":\"numisdata300\",\"component_tipo\":\"numisdata309\"}","lang":"all","path":[{"name":"Catálogo","modelo":"component_select","section_tipo":"numisdata3","component_tipo":"numisdata309"}]}]},{"q":"1932","lang":"all","path":[{"name":"Número Catálogo","modelo":"component_input_text","section_tipo":"numisdata3","component_tipo":"numisdata27"}]}]}],"select":[{"path":[{"name":"Catálogo","modelo":"component_select","section_tipo":"numisdata3","component_tipo":"numisdata309"},{"name":"Catálogo","modelo":"component_input_text","section_tipo":"numisdata300","component_tipo":"numisdata303"}]},{"path":[{"name":"Número Catálogo","modelo":"component_input_text","section_tipo":"numisdata3","component_tipo":"numisdata27"}]},{"path":[{"name":"Ceca","modelo":"component_autocomplete","section_tipo":"numisdata3","component_tipo":"numisdata30"},{"name":"Ceca","modelo":"component_input_text","section_tipo":"numisdata6","component_tipo":"numisdata16"}]},{"path":[{"name":"Autoridad","modelo":"component_autocomplete","section_tipo":"numisdata3","component_tipo":"numisdata29"},{"name":"Apellidos","modelo":"component_input_text","section_tipo":"numisdata22","component_tipo":"rsc86"}]},{"path":[{"name":"Denominación","modelo":"component_autocomplete","section_tipo":"numisdata3","component_tipo":"numisdata34"},{"name":"Denominación","modelo":"component_input_text","section_tipo":"numisdata33","component_tipo":"numisdata97"}]}],"limit":50,"offset":0}'
	const editor 	   = new JSONEditor(container, options, editor_value)


	return editor
}//end init_json_editor

