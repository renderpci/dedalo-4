<?php
// JSON data component controller



// component configuration vars
	$permissions		= $this->get_component_permissions();
	$modo				= $this->get_modo();



// context
	$context = [];

	if($options->get_context===true){
		switch ($options->context_type) {
			case 'simple':
				// Component structure context_simple (tipo, relations, properties, etc.)
				$context[] = $this->get_structure_context_simple($permissions);
				break;
			
			default:
				$context[] = $this->get_structure_context($permissions);
				break;
		}
	}//end if($options->get_context===true)



// data
	$data = [];

	if($options->get_data===true && $permissions>0){

		// Value
		switch ($modo) {
			case 'list':
				$value = $this->get_valor(null,'array');
				break;			
			case 'edit':
			default:
				$value = $this->get_dato();
				$datalist = $this->get_datalist();
				break;
		}

		// data item
		$item  = $this->get_data_item($value);

		// datalist
		if (isset($datalist)) {
			$item->datalist = $datalist;
		}

		$data[] = $item;

	}//end if($options->get_data===true && $permissions>0)



// JSON string
	return common::build_element_json_output($context, $data);