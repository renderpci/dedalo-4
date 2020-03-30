/*global get_label, page_globals, SHOW_DEBUG, DEDALO_CORE_URL*/
/*eslint no-undef: "error"*/



// imports
	import {ui} from '../../common/js/ui.js'
	import '../../../lib/iro/dist/iro.min.js';
	import {event_manager} from '../../common/js/event_manager.js'

export const vector_editor = function(){

	this.id
	// paper vars
	this.segment = this.path = this.movePath = this.handle = this.handle_sync = null;
	this.currentSegment = this.mode = this.type = null;
	this.active_layer = null

	return true
}//end component_image


/**
* INIT_TOOLS
*/
vector_editor.prototype.init_tools = function(self){

	// paper. Curent paper vars
		const project 	= self.current_paper.project
		const Layer   	= self.current_paper.Layer
		const Color   	= self.current_paper.Color
		const Tool    	= self.current_paper.Tool
		const Point   	= self.current_paper.Point
		const Size    	= self.current_paper.Size
		const Path    	= self.current_paper.Path
		const main 		= self.main_layer
	

	// rectangle 
		this.rectangle = new Tool();
		this.rectangle.onMouseDown = (event) => {
			// Reset vars
			this.segment = this.path = this.movePath = this.handle = this.handle_sync = null;
			//segment = path = movePath = handle = handle_sync = null;
			project.deselectAll();
		}
		this.rectangle.onMouseDrag = function(event){
			//console.log(project.activeLayer.name);
			//var rect = new Rectangle();
			const size = new Size ({
				width: event.point.x - event.downPoint.x,
				height: event.point.y - event.downPoint.y
			});

			const rectangle_path = new Path.Rectangle({
				point: event.downPoint,
				size: size,
				fillColor: project.activeLayer.fillColor,
				strokeColor: 'black'
			});

			// Remove this path on the next drag event:
			rectangle_path.removeOnDrag();
			self.update_draw_data()
		}

	// circle 
		this.circle = new Tool();
		this.circle.onMouseDown = (event) => {
			// Reset vars
			this.segment = this.path = this.movePath = this.handle = this.handle_sync = null;
			project.deselectAll();
		}
		this.circle.onMouseDrag = function(event){
			
			const a = new Point({
				x: event.downPoint.x - event.point.x,
				y: event.downPoint.y - event.point.y,
			})

			const circle_path = new Path.Circle({
				center 		: event.downPoint,
				radius 		: a.length,
				fillColor 	: project.activeLayer.fillColor,
				strokeColor : 'black'
			})
			//console.log((event.downPoint.x - event.point.x).length);

			// Remove this path on the next drag event:
			circle_path.removeOnDrag()
			self.update_draw_data()
		}

	// pointer 
		this.pointer = new Tool();
		this.pointer.onMouseDown = (event) => {
			// Reset vars
			this.segment = this.path = this.movePath = this.handle = this.handle_sync = null;

			//project.activeLayer.selected = false;
			const hitResult = project.hitTest(event.point, { fill: true, stroke: true, segments: true, tolerance: 5, handles: true });

			if(SHOW_DEBUG===true) {
				console.log("[init_tools] hitResult:",hitResult);
			}					
			if (hitResult) {
				this.path = hitResult.item
				switch(hitResult.type) {

					case ('fill'):
						project.deselectAll()
						this.path.layer.activate()
						this.active_layer = project.activeLayer
						this.set_color_picker()

						if (event.modifiers.shift) {
							hitResult.item.remove()
						}

						this.path.selected = true;
						this.movePath = hitResult.type == 'fill'
						break;

					case ('pixel'):
						project.deselectAll();
						project.activeLayer.selected = false;
						break;

					case ('segment'):
						project.deselectAll();
						
						this.path.fullySelected = true;
						this.segment = hitResult.segment;
						if (event.modifiers.shift) {
							hitResult.segment.remove();
						}
						if (event.modifiers.command) {
							if(this.segment.hasHandles()){
								hitResult.segment.clearHandles();
							}
							this.handle_sync	= hitResult.segment.handleIn;
							this.handleIn 		= hitResult.segment.handleIn;
							this.handleOut 		= hitResult.segment.handleOut;
							this.segment 		= "";
						}
						//segment = hitResult.segment
						break;

					case ('stroke'):
						project.deselectAll()
						// this.path.fullySelected = true;
						this.path.selected = true;
						this.movePath = 'fill'
						// const location = hitResult.location;
						// this.segment = this.path.insert(location.index +1, event.point);
						//path.smooth();
						break;

					case ('handle-in'):
						this.handle = hitResult.segment.handleIn;
						if (event.modifiers.command) {
							this.handle_sync = hitResult.segment.handleIn;
							this.handleIn = hitResult.segment.handleIn;
							this.handleOut = hitResult.segment.handleOut;
							//this.handle = "";
						}
						break;

					case ('handle-out'):
						this.handle = hitResult.segment.handleOut;
						if (event.modifiers.command) {
							this.handle_sync = hitResult.segment.handleOut;
							this.handleIn = hitResult.segment.handleOut;
							this.handleOut = hitResult.segment.handleIn;
							//this.handle = "";
						}
						break;

					default:
						console.log("Ignored hitResult.type :", hitResult.type)
						break;
				}//end switch							
				//console.log(hitResult.type);
			}				
			/*if (movePath)
			project.activeLayer.addChild(hitResult.item);*/
		}
		this.pointer.onMouseDrag = (event) => {
			if (this.handle){
				this.handle.x += event.delta.x;
				this.handle.y += event.delta.y;
			}
			if (this.handle_sync){
				this.handleIn.x += event.delta.x;
				this.handleIn.y += event.delta.y;
				this.handleOut.x -= event.delta.x;
				this.handleOut.y -= event.delta.y;
			}
			if (this.segment) {
				this.segment.point.x = event.point.x;
				this.segment.point.y = event.point.y;
			}
			if (this.movePath){
				this.path.position.x += event.delta.x;
				this.path.position.y += event.delta.y;
			}
			self.update_draw_data()
		}
		this.pointer.onKeyUp = (event) => {
			if (event.key==="backspace" || event.key==="delete"){
				//console.log(event.key);
				const seleccionados = project.selectedItems;
				//console.log(seleccionados);
				const sec_len = seleccionados.length
				for (let i = sec_len - 1; i >= 0; i--) {
					seleccionados[i].remove()
					this.segment = this.path = null;
				}
			}
		}

	// vector 
		this.vector = new Tool()
		this.vector.onMouseDown = (event) => {
			// Reset vars
			this.segment = this.path = this.movePath = this.handle = this.handle_sync = null;

			//project.activeLayer.selected = false;
			const hitResult = project.hitTest(event.point, { fill: true, stroke: true, segments: true, tolerance: 5, handles: true });

			if(SHOW_DEBUG===true) {
				console.log("[init_tools] hitResult:",hitResult);
			}					
			if (hitResult) {
				this.path = hitResult.item
				switch(hitResult.type) {

					case ('fill'):
						project.deselectAll()
						this.path.layer.activate()
						this.active_layer = project.activeLayer
						this.set_color_picker()
						
						if (event.modifiers.shift) {
							hitResult.item.remove()
						}

						this.path.selected 	= true;
						this.movePath = hitResult.type == 'fill'
						this.new_path 		= false
						break;

					case ('pixel'):
						project.deselectAll();

						if (!this.new_path) {
							this.new_path = new Path({
								strokeColor : 'black',
								fillColor : project.activeLayer.fillColor
							});
							this.new_path.fullySelected	= true;
							this.segment = this.new_path.add(event.point);
							// this.segment = event.point
						}else{
							this.new_path.fullySelected	= true;
							this.segment = this.new_path.add(event.point);
						}
						if (event.modifiers.command) {
							if(this.segment.hasHandles()){
								this.segment.clearHandles();
							}		
							this.handle_sync 	= this.segment.handleIn;
							this.handleIn 		= this.segment.handleIn;
							this.handleOut 		= this.segment.handleOut;
							this.segment.selected = true;
							this.segment 		= "";
						}

						break;
					case ('segment'):
						project.deselectAll();
						
						this.path.fullySelected = true;
						this.path.closed 		= true;
						this.new_path 			= false
						this.segment 			= hitResult.segment;
						if (event.modifiers.shift) {
							hitResult.segment.remove();
						}
						if (event.modifiers.command) {
							if(this.segment.hasHandles()){
								hitResult.segment.clearHandles();
							}
							this.handle_sync 	= hitResult.segment.handleIn;
							this.handleIn 		= hitResult.segment.handleIn;
							this.handleOut 		= hitResult.segment.handleOut;
							this.segment 		= "";
						}
						//segment = hitResult.segment
						break;

					case ('stroke'):
						this.path.fullySelected = true;
						const location	= hitResult.location;
						this.segment 	= this.path.insert(location.index +1, event.point);
						this.new_path 	= false
						//path.smooth();
						break;

					case ('handle-in'):
						this.handle = hitResult.segment.handleIn;
						if (event.modifiers.command) {
							this.handle_sync 	= hitResult.segment.handleIn;
							this.handleIn 		= hitResult.segment.handleIn;
							this.handleOut 		= hitResult.segment.handleOut;
							//this.handle = "";
						}
						break;

					case ('handle-out'):
						this.handle = hitResult.segment.handleOut;
						if (event.modifiers.command) {
							this.handle_sync 	= hitResult.segment.handleOut;
							this.handleIn 		= hitResult.segment.handleOut;
							this.handleOut 		= hitResult.segment.handleIn;
							//this.handle = "";
						}
						break;

					default:
						console.log("Ignored hitResult.type :", hitResult.type)
						break;
				}//end switch							
				//console.log(hitResult.type);
			}				
			/*if (movePath)
			project.activeLayer.addChild(hitResult.item);*/
		}

		this.vector.onMouseDrag = (event) => {
			if (this.handle){
				this.handle.x += event.delta.x;
				this.handle.y += event.delta.y;
			}
			if (this.handle_sync){
				this.handleIn.x += event.delta.x;
				this.handleIn.y += event.delta.y;
				this.handleOut.x -= event.delta.x;
				this.handleOut.y -= event.delta.y;
			}
			if (this.segment) {
				this.segment.point.x = event.point.x;
				this.segment.point.y = event.point.y;
				//path.smooth();
			}
			if (this.movePath){
				this.path.position.x += event.delta.x;
				this.path.position.y += event.delta.y;
			}
			self.update_draw_data()
		}

	// zoom 
		this.zoom = new Tool()
		this.zoom.onMouseDown = (event) => {
			// Reset vars
			this.segment = this.path = this.movePath = this.handle = this.handle_sync = null;
			project.deselectAll();
		}

		this.zoom.onMouseDrag = (event) => {
			//ratio of zoom
			const zoom_factor = 0.03
			// if the mouse is 0 get 1 else get the 1 or -1
			const y = Math.sign(event.delta.y) === 0 ? 1 : Math.sign(event.delta.y)
			// add to the zoom_fator to obtain the factor if y=1 get 1.03 else get 0.97
			const ratio = Math.abs(zoom_factor + y)
			// set the scale with the ratio and the mouse pointer
			// main.scale(ratio, new Point(event.point.x, event.point.y))
			project.view.scale(ratio, new Point(event.point.x, event.point.y))
		}

	// move 
		this.move = new Tool()
		this.move.onMouseDown = (event) => {
			// Reset vars
			this.segment = this.path = this.movePath = this.handle = this.handle_sync = null;
			project.deselectAll();
		}

		this.move.onMouseDrag = (event) => {
			//get the diference (delta) of the first click point and the current posistion of the mouse 
			const delta = event.downPoint.subtract(event.point)
			// scroll the view to the position
			project.view.scrollBy(delta)
		}


	return true
}//end init_tools


/**
* RENDER_TOOLS_BUTTONS
*/
vector_editor.prototype.render_tools_buttons = function(self){

	// Tool buttons. Show
	const main 		= self.main_layer
	const view 		= self.current_paper.view
	const buttons_container = self.vector_editor_tools
		buttons_container.classList.remove("hide")

	// vector editor tools
		const buttons = []

			// pointer
				const pointer = ui.create_dom_element({
					element_type	: 'div',
					class_name 		: 'button tool pointer',
					parent 			: buttons_container
				})
				pointer.addEventListener("mouseup", (e) =>{
					this.pointer.activate()
					activate_status(pointer)
				})
				buttons.push(pointer)

			// rectangle
				const rectangle = ui.create_dom_element({
					element_type	: 'div',
					class_name 		: 'button tool rectangle',
					parent 			: buttons_container
				})
				rectangle.addEventListener("mouseup", (e) =>{
					this.rectangle.activate()
					activate_status(rectangle)
				})
				buttons.push(rectangle)
			
			// circle
				const circle = ui.create_dom_element({
					element_type	: 'div',
					class_name 		: 'button tool circle',
					parent 			: buttons_container
				})
				circle.addEventListener("mouseup", (e) =>{
					this.circle.activate()
					activate_status(circle)
				})
				buttons.push(circle)
			
			// vector
				const vector = ui.create_dom_element({
					element_type	: 'div',
					class_name 		: 'button tool vector',
					parent 			: buttons_container
				})
				vector.addEventListener("mouseup", (e) =>{
					this.vector.activate()
					activate_status(vector)
				})
				buttons.push(vector)

			// full_screen
				// const full_screen = ui.create_dom_element({
				// 	element_type	: 'div',
				// 	class_name 		: 'button tool full_screen',
				// 	parent 			: buttons_container
				// })
				// full_screen.addEventListener("mouseup", (e) =>{

				// 	event_manager.publish('full_screen_'+self.id, full_screen)

				// 	// self.current_paper.view.setScaling(1)

				// 	// //add / remove the class fullscreen
				// 	// self.node[0].classList.toggle('fullscreen')

				// 	// const x = self.node[0].clientWidth
				// 	// const y = self.node[0].clientHeight

				// 	// //reset the window and the canvas
				// 	// // window.dispatchEvent(new Event('resize'));
				// 	// // self.current_paper.project.view.update();

				// 	// const ratio = y / self.current_paper.project.view.size._height
				// 	// self.current_paper.view.setScaling(ratio)


				// 	// self.current_paper.project.view.setViewSize(x,y)

				// 	//////////

				// 	// const center_y = self.current_paper.view.viewSize._height /2
				// 	// const center_x = self.current_paper.view.viewSize._width /2
				// 	// self.current_paper.view.setCenter(center_x, center_y)

				// 	// self.current_paper.view.scale(ratio,new self.current_paper.Point(center_x, center_y))

					
				// 	// self.current_paper.project.view.setViewSize(x,y)
				// 		// const center_y = self.current_paper.view.viewSize._height /2
				// 		// const center_x = self.current_paper.view.viewSize._width /2
				// 		// self.current_paper.view.setCenter(center_x, center_y)

				

				// 	// const ar_layers = self.current_paper.project.layers
				// 	// const ar_layers_len = ar_layers.length
				// 	// for (let i = ar_layers_len - 1; i >= 0; i--) {				
				// 	// 	const curent_layer = ar_layers[i]
				// 	// }

				// 	// self.current_paper.view.setScaling(1)
				// 		// const center_y = self.current_paper.view.viewSize._height /2
				// 		// const center_x = self.current_paper.view.viewSize._width /2
				// 		// self.current_paper.view.setCenter(center_x, center_y)



				// 		// 		//reset the window and the canvas
				// 		// 		 window.dispatchEvent(new Event('resize'));
				// 		// 		//change the status of the tool
				// 				// activate_status(full_screen)
				// 		// 		//reset the window and the canvas (twice, paper error)
				// 					// window.dispatchEvent(new Event('resize'));
				// 		// 			self.current_paper.project.view.viewSize.update();

				// 		// 		// if(!self.node[0].classList.contains('fullscreen')){
				// 		// 			//reset the button state
				// 		// 			activate_status()
				// 		// 			self.current_paper.view.setScaling(1)
				// 		// 			//set the center of the view
				// 		// 			const center_y = self.current_paper.view.viewSize._height /2
				// 		// 			const center_x = self.current_paper.view.viewSize._width /2
				// 		// 			self.current_paper.view.setCenter(center_x, center_y)
									
				// 		// // console.log("raster.parent:",self.current_paper.project.layers['raster_image'].setScaling(1));


				// 		// 			const height  		= self.current_paper.view.size._height
				// 		// 			const image_height 	= self.current_paper.project.raster.height
				// 		// 			const ratio 		= height / image_height

				// 		// 		// }
					
				// })
				// buttons.push(full_screen)

			// zoom
				const zoom = ui.create_dom_element({
					element_type	: 'div',
					class_name 		: 'button tool zoom',
					parent 			: buttons_container
				})
				zoom.addEventListener("mouseup", (e) =>{
					this.zoom.activate()
					activate_status(zoom)
				})
				zoom.addEventListener("dblclick", (e) =>{
						// const ratio = view.height / main.height
						self.current_paper.view.setScaling(1)
						// main.setPosition(view.center)
						// main.fitBounds(view.bounds);
						// main.setScaling(1)
						// main.setPosition(view.center)
					//set the view ratio to 1
						// self.current_paper.view.setScaling(1)
					//set the center of the view
						// const center_y = self.current_paper.view.size._height /2
						// const center_x = self.current_paper.view.size._width /2
						// self.current_paper.project.view.setCenter(center_x,center_y)

					

					// // get the ratio diference from original view ratio and curren view ratio
					// const ratio = self.current_paper.view.size._height / self.current_paper.view.viewSize._height
					// // get the delta center from current position to original center position
					const center_y =  self.current_paper.view.center.y -(self.current_paper.view.viewSize._height /2)
					const center_x =  self.current_paper.view.center.x -(self.current_paper.view.viewSize._width /2)

					// self.current_paper.view.scale(ratio)
					self.current_paper.view.translate(center_x, center_y)

				})

				// zoom.addEventListener('wheel', (e) =>{
				
				// })
				buttons.push(zoom)
			
			// move
				const move = ui.create_dom_element({
					element_type	: 'div',
					class_name 		: 'button tool move',
					parent 			: buttons_container
				})
				move.addEventListener("mouseup", (e) =>{
					this.move.activate()
					activate_status(move)
				})
				move.addEventListener("dblclick", (e) =>{
					//set the center of the view
					// main.setPosition(view.center)


					// const center_y = self.current_paper.view.size._height /2
					// const center_x = self.current_paper.view.size._width /2
					// self.current_paper.project.view.setCenter(center_x,center_y)

					// get the delta center from current position to original center position
					const delta_y =  self.current_paper.view.center.y -(self.current_paper.view.viewSize._height /2)
					const delta_x =  self.current_paper.view.center.x -(self.current_paper.view.viewSize._width /2)

					self.current_paper.view.translate(delta_x, delta_y)
				})
				buttons.push(move)

			// save
				const save = ui.create_dom_element({
					element_type	: 'div',
					class_name 		: 'button tool save',
					parent 			: buttons_container
				})
				save.addEventListener("mouseup", (e) =>{
					// save all data layers
					self.change_value({
						changed_data : self.data.changed_data,
						refresh 	 : false
					})
					.then((save_response)=>{
						// event to update the dom elements of the instance
						event_manager.publish('update_value_'+self.id, self.data.changed_data)
					})

					activate_status(save)
				})
				buttons.push(save)

			// color_picker
				this.button_color_picker = ui.create_dom_element({
					element_type	: 'div',
					class_name 		: 'button tool button_color_picker',
					parent 			: buttons_container
				})

					const color_wheel_contaniner = ui.create_dom_element({
						element_type	: 'div',
						class_name 		: 'hide color_wheel_contaniner',
						parent 			: buttons_container
					})

					this.color_picker = new iro.ColorPicker(color_wheel_contaniner, {
							// Set the size of the color picker
							width: 160,
							// Set the initial color to paper project color
							color: "#f00",
							// color wheel will not fade to black when the lightness decreases.
							wheelLightness: false,
							transparency: true,
							layout: [
								{
									component: iro.ui.Wheel, //can be iro.ui.Box
									options: {
										sliderShape: 'circle'
									}
								},
								{
									component: iro.ui.Slider,
									options: {
										sliderType: 'value' // can also be 'saturation', 'value', 'alpha' or 'kelvin'
									}
								},
								{
									component: iro.ui.Slider,
									options: {
										sliderType: 'alpha'
									}
								},
							]
						})
				this.button_color_picker.addEventListener("mouseup", (e) =>{
					color_wheel_contaniner.classList.toggle('hide')
				})
				// color:change event callback
				// color:change callbacks receive the current color and a changes object
				const color_selected = (color, changes) =>{
					this.active_layer.fillColor = color.hex8String;
					this.button_color_picker.style.backgroundColor = color.hexString
					self.update_draw_data()
				}

				// listen to a color picker's color:change event
				this.color_picker.on('color:change', color_selected);


		//change the buttons status: active, desactive
		const activate_status = (button) =>{
			const buttons_lenght = buttons.length
			for (let i = 0; i < buttons_lenght; i++) {
				const current_buton = buttons[i]
				current_buton.classList.remove('vector_tool_active')
			}
			button ? button.classList.add('vector_tool_active') : null
		}

		// first load activate pointer
			this.pointer.activate()
			activate_status(pointer)
}//end render_tools_buttons


/**
* SET_COLOR_PICKER
* get the color of the current active layer to set to the color picker and the button color picker
* @return 
*/
vector_editor.prototype.set_color_picker = function(){

		const color = this.active_layer.fillColor.toCSS()
		this.button_color_picker.style.backgroundColor = color
		this.color_picker.color.rgbaString = color
}// end set_color_picker


/**
* LOAD_LAYER
* get the layers loaded and show into window
* @return 
*/		
vector_editor.prototype.load_layer = function(self, layer) {

	// curent paper vars
	const project 	= self.current_paper.project
	const Layer   	= self.current_paper.Layer
	const Color   	= self.current_paper.Color
	const main 		= self.main_layer

	const layer_id		= layer.layer_id
	const layer_data	= layer.layer_data
	const layer_name	= 'layer_' +layer_id

	
	//layer import
		if ( layer_data.indexOf('Layer')!=-1 ) {
			const main_len = main.children.length
			for (let i = main_len - 1; i >= 0; i--) {
				if (main.children[i].name===layer_name){
					main.children[i].remove();
						console.log("-> layer delete: ", layer_name);
				}
			}

			const current_layer = project.importJSON(layer_data)

			current_layer.fillColor = layer.layer_color;
			main.addChild(current_layer)
			current_layer.activate();
			
		}else{
			let create_new_current_layer = true
			// Verificamos si el nombre del layer existe
			const main_len = main.children.length
			for (let i = main_len - 1; i >= 0; i--) {					
				if (main.children[i].name === layer_name){
					const current_layer 	= main.children[i];
					main.addChild(current_layer)
					current_layer.activate();
					create_new_current_layer = false;
					console.log("-> using existing current_layer: ", current_layer.name);
					break;
				}
			}//end for
			if (create_new_current_layer === true) {
				const current_layer 	= new Layer()
					current_layer.name 	= layer_name
					// set the id of Dédalo data
					current_layer.data.layer_id 		= layer_id
					// set the user layer name to default layer_name (layer_2)
					current_layer.data.user_layer_name 	= layer_name
				const color = new Color({
					hue: 360 * Math.random(),
					saturation: 1,
					brightness: 1,
					alpha: 0.3,
				});
					current_layer.fillColor = color
				main.addChild(current_layer)
				current_layer.activate();
				console.log("-> create new layer: " , current_layer);	
			}

		};// end else

		this.active_layer = project.activeLayer

		project.view.draw();
		project.deselectAll();
		project.options.handleSize = 8;
		this.set_color_picker()
	
	return true
}//end load_layer


