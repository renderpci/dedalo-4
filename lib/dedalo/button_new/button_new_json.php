<?php
// JSON data component controller


// component configuration vars
	$tipo 				= $this->get_tipo();	
	$section_tipo 		= $this->get_section_tipo();
	$permissions		= common::get_permissions($section_tipo, $tipo); 	
	$modo				= $this->get_modo();


// context
	$context = [];

		// Component structure context (tipo, relations, properties, etc.)
			$context[] = $this->get_structure_context($permissions);

// data
	$data = [];


// JSON string
	return common::build_element_json_output($context, $data);