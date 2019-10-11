<?php
/*
* CLASS COMPONENT_NUMBER
*
*
*/
class component_number extends component_common {



	/**
	* GET_DATO
	*/
	public function get_dato() {

		$dato = parent::get_dato();

		$format_dato = [];
		foreach ((array)$dato as $key => $value) {
			$format_dato[] = $this->set_format_form_type($value);
		}

		return (array)$format_dato;
	}//end get_dato



	/**
	* SET_DATO
	*/
	public function set_dato($dato) {

		$safe_dato=array();
		foreach ((array)$dato as $key => $value) {
			if (is_null($value) || $value==='') {
				$safe_dato[] = null;
			}elseif (is_numeric($value)) {
				$safe_dato[] = $this->set_format_form_type($value);
			}else{
				trigger_error("Invalid value! [component_number.set_dato] value: ".json_encode($value));
			}
		}

		parent::set_dato( $safe_dato );
	}//end set_dato



	/**
	* GET_VALOR
	* Returns int or float number as string formatted
	* @return string $valor
	*/
	public function get_valor($index='all') {

		$valor ='';

		$dato = $this->get_dato();

		if(empty($dato)) {
			return (string)$valor;
		}

		if ($index==='all') {
			$ar = array();
			foreach ($dato as $key => $value) {
				$value = component_number::number_to_string($value);
				if (!empty($value)) {
					$ar[] = $value;
				}
			}
			if (count($ar)>0) {
				$valor = implode(',',$ar);
			}
		}else{
			$index = (int)$index;
			$valor = isset($dato[$index]) ? $dato[$index] : null;
		}

		return (string)$valor;

	}//end get_valor



	/*
	* SET_FORMAT_FORM_TYPE
	* Format the dato into the standard format or the propiedades format of the current intance of the component
	*/
	public function set_format_form_type( $dato_value ) {

		if($dato_value===null || empty($dato_value)){
			return $dato_value;
		}

		$propiedades = $this->get_propiedades();
		if(empty($propiedades->type)){
			return (float)$dato_value;
		}else{
			foreach ($propiedades->type as $key => $value) {

				switch ($key) {

					case 'int':
						if($value===0 || empty($value)){
							return (int)$dato_value;
						}
						if ( strpos($dato_value, '-')===0 )  {
							$dato_value = '-'.substr($dato_value,1,$value);
							$dato_value = (int)$dato_value;
						}else{
							$dato_value = (int)substr($dato_value,0,$value);
						}
						break;

					default:
						$dato_value = (float)round($dato_value,$value);
						break;
				}

			}//end foreach ($propiedades->type as $key => $value)
		}//end if(empty($propiedades->type))

		return $dato_value;
	}//end set_format_form_type



	/*
	* NUMBER_TO_STRING
	* Format the dato into the standard format or the propiedades format of the current intance of the component
	*/
	public function number_to_string( $dato_value ) {

		if($dato_value===null || empty($dato_value)){
			return $dato_value;
		}

		$propiedades = $this->get_propiedades();
		if(empty($propiedades->type)){
			return (string)$dato_value;
		}else{
			foreach ($propiedades->type as $key => $value) {

				switch ($key) {
					case 'int':
						if($value === 0 || empty($value)){
							return (string)$dato_value;
						}
						if ( strpos($dato_value, '-')===0 )  {
							$dato_value = '-'.substr($dato_value,1,$value);
							$dato_value = (string)$dato_value;

						}else{
							$dato_value = (string)substr($dato_value,0,$value);
						}
						break;

					default:
						$dato_value = number_format($dato_value,$value,'.','');
						break;
				}

			}//end foreach ($propiedades->type as $key => $value)
		}//end if(empty($propiedades->type))

		return $dato_value;
	}//end number_to_string



	/**
	* RENDER_LIST_VALUE
	* Overwrite for non default behaviour
	* Receive value from section list and return proper value to show in list
	* Sometimes is the same value (eg. component_input_text), sometimes is calculated (e.g component_portal)
	* @param string $value
	* @param string $tipo
	* @param int $parent
	* @param string $modo
	* @param string $lang
	* @param string $section_tipo
	* @param int $section_id
	*
	* @return string $list_value
	*/
	public static function render_list_value($value, $tipo, $parent, $modo, $lang, $section_tipo, $section_id, $current_locator=null, $caller_component_tipo=null) {


		$component 	= component_common::get_instance(__CLASS__,
													 $tipo,
												 	 $parent,
												 	 $modo,
													 DEDALO_DATA_NOLAN,
												 	 $section_tipo);

		# Use already query calculated values for speed
		#$dato = json_handler::decode($value);
		#$component->set_dato($dato);

		$component->set_identificador_unico($component->get_identificador_unico().'_'.$section_id.'_'.$caller_component_tipo); // Set unic id for build search_options_session_key used in sessions

		$value = $component->get_html();
		#$value = $component->get_valor();


		return $value;
	}//end render_list_value



	/**
	* RESOLVE_QUERY_OBJECT_SQL
	* @return object $query_object
	*/
	public static function resolve_query_object_sql($query_object) {

		$q = is_array($query_object->q) ? reset($query_object->q) : $query_object->q;

		#$q = $query_object->q;
		#if (isset($query_object->type) && $query_object->type==='jsonb') {
		#	$q = json_decode($q);
		#}

    	# Always set fixed values
		$query_object->type = 'number';


		$query_object->component_path[] = 'lg-nolan';

		# Always without unaccent
		$query_object->unaccent = false;

		$between_separator  = '...';
		//$sequence_separator = ',';

		#$q_operator = isset($query_object->q_operator) ? $query_object->q_operator : null;

        switch (true) {

        	# BETWEEN
			case (strpos($q, $between_separator)!==false):
				// Transform "12...25" to "12 AND 25"
				$ar_parts 	= explode($between_separator, $q);
				$first_val  = !empty($ar_parts[0]) ? intval($ar_parts[0]) : 0;
				$second_val = !empty($ar_parts[1]) ? intval($ar_parts[1]) : $first_val;

				$query_object_one = clone $query_object;
					$query_object_one->operator = '>=';
					$query_object_one->q_parsed	= '\''.$first_val.'\'';

				$query_object_two = clone $query_object;
					$query_object_two->operator = '<=';
					$query_object_two->q_parsed	= '\''.$second_val.'\'';

				// Return an array instead object
				#$query_object = [$query_object_one,$query_object_two];

				// Group in a new "AND"
				$current_op = '$and';
				$new_query_object = new stdClass();
					$new_query_object->{$current_op} = [$query_object_one,$query_object_two];

				$query_object = $new_query_object;
				break;
        	# SEQUENCE
			/*case (strpos($q, $sequence_separator)!==false):
				// Transform "12,25,36" to "(12 OR 25 OR 36)"
				$ar_parts 	= explode($sequence_separator, $q);
				$ar_result  = [];
				foreach ($ar_parts as $key => $value) {
					$value = (int)$value;
					if ($value<1) continue;
					$query_object_current = clone $query_object;
						$query_object_current->operator = '=';
						$query_object_current->q_parsed	= '\''.$value.'\'';
					$ar_result[] = $query_object_current;
				}
				// Return an subquery instead object
				$cop = '$or';
				$new_object = new stdClass();
					$new_object->{$cop} = $ar_result;
				$query_object = $new_object;
				break;
				*/
			# BIGGER OR EQUAL THAN
			case (substr($q, 0, 2)==='>='):
				$operator = '>=';
				$q_clean  = str_replace($operator, '', $q);
				$query_object->operator = $operator;
    			$query_object->q_parsed	= '\''.$q_clean.'\'';
				break;
			# SMALLER OR EQUAL THAN
			case (substr($q, 0, 2)==='<='):
				$operator = '<=';
				$q_clean  = str_replace($operator, '', $q);
				$query_object->operator = $operator;
    			$query_object->q_parsed	= '\''.$q_clean.'\'';
				break;
			# BIGGER THAN
			case (substr($q, 0, 1)==='>'):
				$operator = '>';
				$q_clean  = str_replace($operator, '', $q);
				$query_object->operator = $operator;
    			$query_object->q_parsed	= '\''.$q_clean.'\'';
				break;
			# SMALLER THAN
			case (substr($q, 0, 1)==='<'):
				$operator = '<';
				$q_clean  = str_replace($operator, '', $q);
				$query_object->operator = $operator;
    			$query_object->q_parsed	= '\''.$q_clean.'\'';
				break;
			// EQUAL DEFAULT
			default:
				$operator = '=';
				$q_clean  = str_replace('+', '', $q);
				$query_object->operator = '@>';
				$query_object->q_parsed	= '\''.$q_clean.'\'';
				break;
		}//end switch (true) {


        return $query_object;
	}//end resolve_query_object_sql



	/**
	* SEARCH_OPERATORS_INFO
	* Return valid operators for search in current component
	* @return array $ar_operators
	*/
	public function search_operators_info() {

		$ar_operators = [
			'...' 	=> 'entre',
			#',' 	=> 'secuencia',
			'>=' 	=> 'mayor_o_igual_que',
			'<='	=> 'menor_o_igual_que',
			'>' 	=> 'mayor_que',
			'<'		=> 'menor_que',
			#'=' 	=> 'igual'
		];

		return $ar_operators;
	}//end search_operators_info



	/**
	* GET_DIFFUSION_VALUE
	* Calculate current component diffsuion value for target field (usually a mysql field)
	* Used for diffusion_mysql to unify components diffusion value call
	* @return string $diffusion_value
	*
	* @see class.diffusion_mysql.php
	*/
	public function get_diffusion_value( $lang ) {

		$dato 			 = parent::get_dato();
		$diffusion_value = $dato;

		return $diffusion_value;
	}//end get_diffusion_value

	/**
	* GET_STRUCTURE_BUTTONS
	* @return
	*/
	public function get_structure_buttons($permissions=null) {


		return [];
	}//end get_structure_buttons

}//end component_number
?>
