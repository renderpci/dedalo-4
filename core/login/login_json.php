<?php
// JSON data controller



// configuration vars
	$tipo				= $this->get_tipo();
	$permissions		= 1;
	$modo				= $this->get_modo();



// context
	$context = [];

	if($options->get_context===true){

		// Component structure context (tipo, relations, properties, etc.)
			$context[] = $this->get_structure_context($permissions, $add_rqo=false);

	}//end if($options->get_context===true)



// data
	$data = [];

	if($options->get_data===true && $permissions>0){

		$value = new stdClass();
			$value->dedalo_application_langs = (array)unserialize(DEDALO_APPLICATION_LANGS);

		// data item
			$item  = $this->get_data_item($value);

		$data[] = $item;

	}// end if $permissions > 0



// JSON string
	return common::build_element_json_output($context, $data);
