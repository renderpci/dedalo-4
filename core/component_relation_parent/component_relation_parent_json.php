<?php
// JSON data component controller



// component configuration vars
	$permissions		= $this->get_component_permissions();
	$modo				= $this->get_modo();
	$section_tipo 		= $this->section_tipo;
	$lang 				= $this->lang;
	$tipo 				= $this->get_tipo();
	$properties 		= $this->get_properties() ?? new stdClass();



// context
	$context = [];

	if($options->get_context===true && $permissions>0){
		switch ($options->context_type) {
			case 'simple':
				// Component structure context_simple (tipo, relations, properties, etc.)
				$context[] = $this->get_structure_context_simple($permissions);
				break;

			default:
				$add_request_config = true; // overwrite default false to force calculate

				// Component structure context (tipo, relations, properties, etc.)
					$current_context = $this->get_structure_context($permissions, $add_request_config);
					$current_context->config_context 	= $this->get_request_properties_parsed($tipo, $external=false, $section_tipo, $modo, null);
					// add records_mode to properties, if not already defined
					if (!isset($current_context->properties->source->records_mode)) {
						if (!property_exists($current_context, 'properties')) {
							$current_context->properties = new stdClass();
						}
						if (!property_exists($current_context->properties, 'source')) {
							$current_context->properties->source = new stdClass();
						}
						$current_context->properties->source->records_mode = 'list';
					}
					$context[] = $current_context;

				// subcontext from element layout_map items (from_parent_tipo, parent_grouper)
					$ar_subcontext = $this->get_ar_subcontext($tipo, $tipo);
					foreach ($ar_subcontext as $current_context) {
						$context[] = $current_context;
					}
				break;
		}
	}//end if($options->get_context===true)



// data
	$data = [];

	if($options->get_data===true && $permissions>0){

		$dato = $this->get_dato();

		if (!empty($dato)) {

			$value  	= $this->get_dato_paginated();
			$section_id	= $this->get_parent();
			$limit 		= ($modo==='list')
				? $this->pagination->limit ?? $properties->list_max_records ?? $this->max_records
				: $this->pagination->limit ?? $properties->max_records ?? $this->max_records;

			// data item
				$item = $this->get_data_item($value);
					$item->parent_tipo 			= $tipo;
					$item->parent_section_id 	= $section_id;
					// fix pagination vars
						$pagination = new stdClass();
							$pagination->total	= count($dato);
							$pagination->limit 	= $limit;
							$pagination->offset = $this->pagination->offset ?? 0;
					$item->pagination = $pagination;

				$data[] = $item;

			// subcontext data from layout_map items
				$ar_subdata = $this->get_ar_subdata($value);

			// subdata add
				foreach ($ar_subdata as $current_data) {
					$current_data->parent_tipo 			= $tipo;
					$current_data->parent_section_id 	= $section_id;
					$data[] = $current_data;
				}
		}//end if (!empty($dato))
	}//end if $options->get_data===true && $permissions>0



// JSON string
	return common::build_element_json_output($context, $data);
