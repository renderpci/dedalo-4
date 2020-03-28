/*global get_label, page_globals, SHOW_DEBUG, DEDALO_CORE_URL*/
/*eslint no-undef: "error"*/



// imports
	import {event_manager} from '../../common/js/event_manager.js'
	import {common} from '../../common/js/common.js'
	import {component_common} from '../../component_common/js/component_common.js'
	import {render_component_image} from '../../component_image/js/render_component_image.js'
	import {vector_editor} from '../../component_image/js/vector_editor.js'


export const component_image = function(){

	this.id

	// element properties declare
	this.model
	this.tipo
	this.section_tipo
	this.section_id
	this.mode
	this.lang

	this.section_lang
	this.context
	this.data
	this.parent
	this.node

	this.tools

	this.file_name
	this.file_dir


	return true
}//end component_image



/**
* COMMON FUNCTIONS
* extend component functions from component common
*/
// prototypes assign
	// lifecycle
	component_image.prototype.init 	 			= component_common.prototype.init
	component_image.prototype.build 	 		= component_common.prototype.build
	component_image.prototype.render 			= common.prototype.render
	component_image.prototype.refresh 			= common.prototype.refresh
	component_image.prototype.destroy 	 		= common.prototype.destroy

	// change data
	component_image.prototype.save 	 			= component_common.prototype.save
	component_image.prototype.update_data_value	= component_common.prototype.update_data_value
	component_image.prototype.update_datum 		= component_common.prototype.update_datum
	component_image.prototype.change_value 		= component_common.prototype.change_value

	// render
	component_image.prototype.list 				= render_component_image.prototype.list
	component_image.prototype.edit 				= render_component_image.prototype.edit




/**
* INIT
*/
component_image.prototype.init = async function(options) {

	const self = this

	// editor init vars
		self.ar_tag_loaded 			= []
		self.vector_tools_loaded 	= false
		self.current_paper 			= null

		self.vector_editor 			= null

	// call the generic commom tool init
		const common_init = component_common.prototype.init.call(this, options);

	// set the self specific libraries and variables not defined by the generic init
		// load dependences js/css
			const load_promises = []

			const lib_js_file = DEDALO_ROOT_WEB + '/lib/paper/dist/paper-full.min.js'
			load_promises.push( common.prototype.load_script(lib_js_file) )


			await Promise.all(load_promises).then(async function(response){
			})

	return common_init
}//end init



/**
* GET_DATA_TAG
* Send the data_tag to the text_area when it need create a new tag
*/
component_image.prototype.get_data_tag = function(){

	const data_tag = {
		type 	: 'draw',
		tag_id 	: null,
		state 	: 'n',
		label 	: '',
		data 	: ''
	}

	return data_tag
}


// /**
// * BUILD
// */
// component_image.prototype.build = async function(autoload=false) {

// 	const self = this

// 	// call generic component commom build
// 		const common_build = component_common.prototype.build.call(this, autoload);

// 	// fix useful vars
// 		// self.allowed_extensions 	= self.context.allowed_extensions
// 		// self.default_target_quality = self.context.default_target_quality


// 	return common_build
// }//end build_custom



// CANVAS : INIT
component_image.prototype.init_canvas = function(canvas_node, img) {

	const self = this

	const li = canvas_node.parentNode
		console.log("li:",li.clientWidth, li.clientHeight);

	// canvas
		// resize
			canvas_node.setAttribute("resize", true)
		//size
			const img_height	= img.naturalHeight
			const img_width		= img.naturalWidth
			//get the current resized canvas size
			const canvas_w		= canvas_node.clientWidth
			const canvas_h		= canvas_node.clientHeight
			// fixed height for the image
			const view_height	= 1200
			const ratio 		= view_height / img_height
			const view_width	= ratio * img_width
			// canvas_node.width 	= 500
			// canvas_node.height 	= 400
		// hidpi. Avoid double size on canvas
			// canvas_node.setAttribute("hidpi","off")

		// canvas -> active
			const context = canvas_node.getContext("2d");
			const ratio_canvas = 432 / img_height
			canvas_node.height = 432
			canvas_node.width  = ratio_canvas * img_width
				console.log("ratio:",ratio,"img_height",img_height);
			// return

	// paper
		self.current_paper = new paper.PaperScope()
		self.current_paper.setup(canvas_node);

	// create the main layer
		self.main_layer	= new self.current_paper.Group();
			self.main_layer.name = 'main';
			// self.main_layer.activate();
			 
			// console.log("self.main_layer.matrix:",self.main_layer.matrix);
			// set the main layer to the center of the view,
			// all other items and layers has reference to the main posistion and scale
			self.main_layer.position = self.current_paper.view.center

	// self.main_layer.setPosition(self.current_paper.view.center)
	// create the raster layer
		const raster_layer	= new self.current_paper.Layer();
			raster_layer.name = 'raster';
			raster_layer.activate();
			raster_layer.position = self.main_layer.position

	// create the image in the rater layer
		const raster = new self.current_paper.Raster({
			source		: img.src,
			position	: raster_layer.position
		});

		// raster.bounds.width 	= self.current_paper.view.bounds.width;
		// raster.bounds.height = self.current_paper.view.bounds.height;
		// raster.applyMatrix = true
		// scale the image to fixed heigth: 1024
		
		raster.scale(ratio)
		console.log("raster.scaling:",raster.scaling);

	// append the raster layer to the main layer
		self.main_layer.addChild(raster_layer)
		// self.main_layer.activate();


		// const rect = new self.current_paper.Path.Rectangle(0, 0, ratio*img_width , view_height);

	// scale main layer
	// get the ratio for the scale the main layer to fit to canvas view heigth
		const ratio_layer = canvas_h / view_height
		self.main_layer.scale(ratio_layer, self.current_paper.view.center)

	// subscription to the image quality change event
		self.events_tokens.push(
			event_manager.subscribe('image_quality_change_'+self.id,  img_quality_change)
		)
		function img_quality_change (img_src) {
			// change the value of the current raster element
			raster.source = img_src
			raster.onLoad = function(e) {
				// raster.layer.setScaling(1)
				const new_image_height 	= raster.height//raster.bounds.height
				const ratio 			= view_height / new_image_height
				raster.setScaling(ratio)
					console.log("raster.scaling:",raster.scaling);
				 raster.layer.setScaling(ratio_layer)
			}
		}
		// subscription to the full_sreen change event
		self.events_tokens.push(
			event_manager.subscribe('full_screen_'+self.id,  full_screen_change)
		)
		function full_screen_change (button) {
			// change the value of the current raster element
				self.current_paper.view.setScaling(1)
				// get the current size of the paper view
				// const paper_w = self.current_paper.view.size._width
				// const paper_h = self.current_paper.view.size._height
				// if the image loaded is wide get the paper width else get the paper hight
				// const paper_reference = img_width > img_height ? paper_w : paper_h

				//add / remove class fullscreen to wrap. The component will resize
				self.node[0].classList.toggle('fullscreen')
				//get the current resized canvas size
				const canvas_w = canvas_node.clientWidth
				const canvas_y = canvas_node.clientHeight

				//set the paper view size to the canvas size
				self.current_paper.project.view.setViewSize(canvas_w, canvas_y)

				

				
				//reset the window and the canvas
				// window.dispatchEvent(new Event('resize'));
				// self.current_paper.project.view.update();
				// self.current_paper.view.setScaling(1)
				// self.main_layer.setPosition(self.current_paper.view.center)

				// self.main_layer.fitBounds(self.current_paper.project.view.bounds);

				//get the current resized canvas size
				// const canvas_w = canvas_node.clientWidth
				// const canvas_y = canvas_node.clientHeight
				// // if the image loaded is wide get the canvas width else get the canvas hight
				// const canvas_reference = img_width > img_height ? canvas_w : canvas_y

				//get the scale ratio, when remove the fullscreen the ratio of image will be 1 (original ratio)
				// const ratio = self.node[0].classList.contains('fullscreen') ? canvas_reference / paper_reference : 1
				//set the paper view size to the canvas size
				// self.current_paper.project.view.setViewSize(canvas_w, canvas_y)
				//scaling the paper view		
				// self.current_paper.view.setScaling(ratio)
				//set the center of the view
				// const center_y = self.current_paper.view.size._height /2
				// const center_x = self.current_paper.view.size._width /2
					
				// self.current_paper.project.view.setCenter(center_x, center_y)

				// self.main_layer.scale(2, self.current_paper.view.center)
		}


	return true
}//end init_canvas


/**
* LOAD_VECTOR_EDITOR
*/
component_image.prototype.load_vector_editor = async function(options) {

	const self = this
	// convert the tag dataset to 'real' object for manage it
	const tag = JSON.parse(JSON.stringify(options.tag.dataset))


	// MODE : Only allow mode 'tool_transcription'
	//if(page_globals.modo!=='tool_transcription') return null;

	if (self.vector_tools_loaded===false){

		self.vector_editor = new vector_editor
		self.vector_editor.init_tools(self)
		self.vector_editor.render_tools_buttons(self)

		self.vector_tools_loaded = true
	}

	/*
	*ATENTION THE NAME OF THE TAG (1) CHANGE INTO (1_LAYER) FOR COMPATIBILITY WITH PAPER LAYER NAME
	*WHEN SAVE THE LAYER TAG IT IS REMOVE TO ORIGINAL TAG NAME OF DÉDALO. "draw-n-1-data"
	*BUT THE LAYER NAME ALWAYS ARE "1_layer"
	*/

	// call the generic commom tool init with the tag
		self.ar_tag_loaded.push(tag)
		const data 	 	= tag.data.replace(/'/g, '"')
		const layer_id 	= tag.tag_id +'_layer';
		self.vector_editor.load_layer(self, data, layer_id)


}// load_vector_editor


/**
* UPDATE_DRAW_DATA
*/
component_image.prototype.update_draw_data = function() {

	const self = this



	const project 		= self.current_paper.project
		// console.log("project.activeLayer.exportJSON():",project.exportJSON());
		// console.log("project.activeLayer.exportJSON():",project.exportSVG({embedImages:false}));

	const tag_id 		= project.activeLayer.name.replace('_layer','')
	const current_tag	= self.ar_tag_loaded.find((item) => item.tag_id === tag_id)

	const data 				= project.activeLayer.exportJSON()
	const current_draw_data = data.replace(/"/g, '\'');
	current_tag.dataset 	= {data:current_draw_data}
	current_tag.save 		= false

	return true
}//end update_draw_data



/**
* SAVE_DRAW_DATA
*/
component_image.prototype.save_draw_data = function() {

	const self = this

	const ar_tag		= self.ar_tag_loaded
	const ar_tag_len	= ar_tag.length 

	for (let i = ar_tag_len- 1; i >= 0; i--) {
		const current_tag = ar_tag[i]
		// UPDATE_TAG
		event_manager.publish('draw_change_tag' +'_'+ self.tipo, current_tag)
		if(i === 0){
			current_tag.save = true
			event_manager.publish('draw_change_tag' +'_'+ self.tipo, current_tag)
		}
			console.log("tag_data:",current_tag); 
	}

	
	return true
};//end save_draw_data

