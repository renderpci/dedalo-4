<?php

/**
* DD_API
* Manage API RESP data with Dédalo
*
*/
class dd_api {


	// Version. Important!
		static $version = "1.0.0";  // 05-06-2019

	// ar_dd_objects . store current ar_dd_objects received in context to allwo external acces (portals, etc.)
		static $ar_dd_objects;
	


	/**
	* 
	* CREATE
	* @return array $result
	*/
	function create($json_data) {

		global $start_time;

		$response = new stdClass();
			$response->result 	= false;
			$response->msg 		= 'Error. Request failed ['.__FUNCTION__.']';

		# set vars
		$vars = array('section_tipo');
			foreach($vars as $name) {
				$$name = common::setVarData($name, $json_data);
				# DATA VERIFY
				# if ($name==='max_records' || $name==='offset') continue; # Skip non mandatory
				if (empty($$name)) {
					$response->msg = 'Trigger Error: ('.__FUNCTION__.') Empty '.$name.' (is mandatory)';
					return $response;
				}
			}

		# FIX SECTION TIPO
		define('SECTION_TIPO', $section_tipo);
		
		$section = section::get_instance( NULL, $section_tipo );

		# Section save returns the section_id created
		$section_id = $section->Save();


		# Update search_query_object full_count property
		$search_options = section_records::get_search_options($section_tipo);
		if (isset($search_options->search_query_object)) {
			$search_options->search_query_object->full_count = true; // Force re-count records
		}

		
		$response->result 	= $section_id;
		$response->msg 		= 'Ok. Request done ['.__FUNCTION__.']';

		# Debug
		if(SHOW_DEBUG===true) {
			$debug = new stdClass();
				$debug->exec_time	= exec_time_unit($start_time,'ms')." ms";
				foreach($vars as $name) {
					$debug->{$name} = $$name;
				}

			$response->debug = $debug;
		}
		
		return (object)$response;
	}//end create



	/**
	* 
	* READ
	* @return array $result
	*/
	static function read($json_data) {
		global $start_time;

		session_write_close();

		$response = new stdClass();
			$response->result 	= false;
			$response->msg 		= 'Error. Request failed ['.__FUNCTION__.']';

		$context = $json_data->context;

		
		$json_rows = self::build_json_rows($context);
		
		$result = $json_rows;
		
		
		$response->result 		= $result;
		$response->msg 	  		= 'Ok. Request done';

		# Debug
			if(SHOW_DEBUG===true) {
				$debug = new stdClass();
					$debug->exec_time	= exec_time_unit($start_time,'ms')." ms";

				$response->debug = $debug;
			}


		return (object)$response;
	}//end read



	/**
	* 
	* UPDATE
	* @return array $result
	*/
	static function update($json_data) {
		global $start_time;

		session_write_close();
		// create the default update response
		$response = new stdClass();
			$response->result 	= false;
			$response->msg 		= 'Error. Request failed ['.__FUNCTION__.']';

		// get the context and data sended
		$context 	= $json_data->context;
		$data 		= $json_data->data;
		//get the type of the dd_object that is calling to update
		$context_type = $context->type;
		// switch the type (component, section)
		switch ($context_type) {
			case 'component':
				// get the component information
					$model 			= $context->model;
					$tipo 			= $context->tipo;
					$section_tipo 	= $context->section_tipo;
					$section_id 	= $data->section_id;
					$lang 			= $context->lang;
					$value 			= $data->value;
					// build the component
					$component = component_common::get_instance( $model,
																 $tipo,
																 $section_id,
																 'list',
																 $lang,
																 $section_tipo);
				// get the component permisions
					$permissions = $component->get_component_permissions();
				// check if the user can update the component 
					if($permissions < 2) return $response;

				// set the data sended to the component
					$component->set_dato($value);
				// save the new data to the component
					$result = $component->Save();
				break;
			
			default:
				# code...
				break;
		}
		// if the proces is correct we return the $result to the client, for component is the section_id
		$response->result 		= $result;
		$response->msg 	  		= 'Ok. Request done';

		# Debug
			if(SHOW_DEBUG===true) {
				$debug = new stdClass();
					$debug->exec_time	= exec_time_unit($start_time,'ms')." ms";

				$response->debug = $debug;
			}


		return (object)$response;
	}//end update


	
	/**
	* 
	* DELETE
	* @return array $result
	*/
	function delete($json_data) {
	}//end delete



	/**
	* BUILD_JSON_ROWS
	* @return object $result
	*/
	private static function build_json_rows($ar_context) {
		$start_time=microtime(1);

		
		// default result
			$result = new stdClass();
				$result->context = [];
				$result->data 	 = [];

		
		// ar_dd_objects . Array of all dd objects in requested context
			$ar_dd_objects = array_filter($ar_context, function($item) {
				 if($item->typo==='ddo') return $item;
			});
			// set as static to allow external access
			dd_api::$ar_dd_objects = $ar_dd_objects;

		
		// context
			$context = [];
			/**/
			// filter by section
			$ar_sections_dd_objects = array_filter($ar_dd_objects, function($item) {
				 if($item->model==='section') return $item;
			});		
			foreach ($ar_sections_dd_objects as $section_dd_object) {
				
				$current_section = $section_dd_object->section_tipo;

				// dd_objects of current section
					$ar_current_section_dd_objects = array_filter($ar_dd_objects, function($item) use($current_section) {
						 if($item->section_tipo===$current_section) return $item;
					});

				// Iterate dd_object from context					
					foreach ((array)$ar_current_section_dd_objects as $dd_object) {

						$dd_object = is_array($dd_object) ? (object)$dd_object : $dd_object;
	
						$tipo 			= $dd_object->tipo;
						$section_tipo 	= $dd_object->section_tipo;						
						$mode 			= $dd_object->mode ?? 'list';
										
						$RecordObj_dd 	= new RecordObj_dd($tipo);
						$default_lang 	= ($RecordObj_dd->get_traducible()==='si') ? DEDALO_DATA_LANG : DEDALO_DATA_NOLAN;
						$lang 			= $dd_object->lang ?? $default_lang;

						$model			= RecordObj_dd::get_modelo_name_by_tipo($tipo,true);

						switch (true) {

							case ($model==='section'):
								// section
									$current_section = section::get_instance(null, $tipo, $mode, $cache=true);

								// ar_section_dd_objects (ar_layout_map)
									#$ar_section_dd_objects = array_filter($ar_dd_objects, function($item) use($tipo){
									#	 if($item->parent===$tipo ) return $item;
									#});										
									#if (!empty($ar_section_dd_objects)) {
									#	// inject custom layout_map
									#	$current_section->layout_map = $ar_section_dd_objects;
									#}

								// section json
									$get_json_options = new stdClass();
										$get_json_options->get_context 	= true;
										$get_json_options->get_data 	= false;
									$section_json = $current_section->get_json($get_json_options);

								// context add 
									$context = array_merge($context, $section_json->context);
								break;
							
							default:
								# not defined modelfro context / data								
								debug_log(__METHOD__." 1. Ignored model '$model' - tipo: $tipo ".to_string(), logger::WARNING);
								break;
						}// end switch (true)
						
					}// end foreach ((array)$ar_current_section_dd_objects as $dd_object)

			}// end foreach ($ar_sections_dd_objects as $section_dd_object)

			// smart remove data duplicates (!)
				// $data = section::smart_remove_data_duplicates($data);
			$context_exec_time	= exec_time_unit($start_time,'ms')." ms";
		
	
		// data
			$data = [];
			/**/
			$data_start_time=microtime(1);
			$ar_search_query_object = array_filter($ar_context, function($item){
				 if($item->typo==='sqo') return $item;
			});			
			foreach ($ar_search_query_object as $current_sqo) {

				// search
					$search_development2 = new search_development2($current_sqo);
					$rows_data 			 = $search_development2->search();

				// generated the self section_data
					foreach ($current_sqo->section_tipo as $current_section_tipo) {
					
						$section_data = new stdClass();
							$section_data->tipo 		= $current_section_tipo;
							$section_data->section_tipo = $current_section_tipo;							
							$section_data->value 		= array_map(function($item) use($current_section_tipo){
								if ($item->section_tipo===$current_section_tipo) {
									return $item->section_id;
								}
							}, $rows_data->ar_records);						

						$data[] = $section_data;
					}

				// Iterate records
					$i=0; foreach ($rows_data->ar_records as $record) {

						$section_id   	= $record->section_id;
						$section_tipo 	= $record->section_tipo;
						$datos			= json_decode($record->datos);
						
						if (!isset($section_dd_object)) {
							$section_dd_object = array_reduce($ar_dd_objects, function($carry, $item){
								if($item->model==='section' && $item->section_tipo===$section_tipo) return $item;
								return $carry;
							});
						}
						$mode = $section_dd_object->mode;

						// Inject known dato to avoid re connect to database
							$section = section::get_instance($section_id, $section_tipo, $mode, $cache=true);
							$section->set_dato($datos);
							$section->set_bl_loaded_matrix_data(true);
						
						// Iterate dd_object for colums ( PASADO A LA SECCIÓN ! ) 

						
						// get section json
							$get_json_options = new stdClass();
								$get_json_options->get_context 	= false;
								$get_json_options->get_data 	= true;
							$section_json = $section->get_json($get_json_options);
						
						// data add
							$data = array_merge($data, $section_json->data);

					$i++; }//end iterate records

				// store search_query_object
					$context[] = $current_sqo;
			
			}//end foreach ($ar_search_query_object as $current_sqo)
			// smart remove data duplicates (!)
				$data = self::smart_remove_data_duplicates($data);

			$data_exec_time	= exec_time_unit($data_start_time,'ms')." ms";
			

		// Set result object
			$result->context = $context;
			$result->data 	 = $data;

		
		// Debug
			if(SHOW_DEBUG===true) {
				$debug = new stdClass();
					$debug->context_exec_time 	= $context_exec_time;
					$debug->data_exec_time 		= $data_exec_time;
					$debug->exec_time			= exec_time_unit($start_time,'ms')." ms";
				$result->debug = $debug;	
			}			
	

		return $result;
	}//end build_json_rows



	/**
	* SMART_REMOVE_DATA_DUPLICATES
	* @param array $data
	* @return array $clean_data
	*/
	private static function smart_remove_data_duplicates($data) {
		
		$clean_data = [];
		foreach ($data as $key => $value_obj) {			
			#if (!in_array($value_obj, $clean_data, false)) {
			#	$clean_data[] = $value_obj;
			#}
			$found = array_filter($clean_data, function($item) use($value_obj){
				if (
					isset($item->section_tipo) && isset($value_obj->section_tipo) && $item->section_tipo===$value_obj->section_tipo &&
					isset($item->section_id) && isset($value_obj->section_id) && $item->section_id===$value_obj->section_id && 
					isset($item->tipo) && isset($value_obj->tipo) && $item->tipo===$value_obj->tipo && 
					isset($item->from_component_tipo) && isset($value_obj->from_component_tipo) && $item->from_component_tipo===$value_obj->from_component_tipo
				){
					return $item;
				}
			});
			
			if (empty($found)) {
				$clean_data[] = $value_obj;
			}
		}

		#$clean_data = array_unique($data, SORT_REGULAR);
		#$clean_data = array_values($clean_data);

		return $clean_data;
	}//end smart_remove_data_duplicates



}//end web_data