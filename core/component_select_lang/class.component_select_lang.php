<?php
#require_once(dirname(dirname(__FILE__)).'/component_filter/class.component_filter.php');
/*
* CLASS COMPONENT_SELECT_LANG
*
*
*/
class component_select_lang extends component_relation_common {



	# Overwrite __construct var lang passed in this component
	protected $lang = DEDALO_DATA_NOLAN;

	protected $relation_type = DEDALO_RELATION_TYPE_LINK;

	# test_equal_properties is used to verify duplicates when add locators
	#public $test_equal_properties = array('section_tipo','section_id','type','from_component_tipo');



	function __construct($tipo=null, $parent=null, $modo='edit', $lang=DEDALO_DATA_NOLAN, $section_tipo=null) {

		# Force always DEDALO_DATA_NOLAN
		$lang = $this->lang;

		# Build the componente normally
		parent::__construct($tipo, $parent, $modo, $lang, $section_tipo);

		if(SHOW_DEBUG) {
			$traducible = $this->RecordObj_dd->get_traducible();
			if ($traducible==='si') {
				#throw new Exception("Error Processing Request. Wrong component lang definition. This component $tipo (".get_class().") is not 'traducible'. Please fix this ASAP", 1);
				trigger_error("Error Processing Request. Wrong component lang definition. This component $tipo (".get_class().") is not 'traducible'. Please fix this ASAP");
			}
		}
	}//end __construct



	/**
	* GET_VALOR
	* Get value . default is get dato . overwrite in every different specific component
	* @return string | null $valor
	*/
	public function get_valor($lang=DEDALO_DATA_LANG) {

		$dato = $this->get_dato();
		if (empty($dato)) {
			return null;
		}

		// Test dato format (b4 changed to object)
			if(SHOW_DEBUG) {
				foreach ($dato as $key => $current_locator) {
					if (!is_object($current_locator)) {
						if(SHOW_DEBUG) {
							dump($dato," dato");
						}
						trigger_error(__METHOD__." Wrong dato format. OLD format dato in $this->label $this->tipo .Expected object locator, but received: ".gettype($current_locator) .' : '. print_r($current_locator,true) );
						return $valor;
					}
				}
			}

		# Always run ar_all_project_select_langs
		# $ar_all_project_select_langs = $this->get_ar_all_project_select_langs( $lang );
		$ar_all_project_select_langs = common::get_ar_all_langs_resolved(DEDALO_DATA_LANG);
		foreach ((array)$ar_all_project_select_langs as $lang_code => $lang_name ) {

			$locator = lang::get_lang_locator_from_code( $lang_code );
			if (locator::in_array_locator( $locator, (array)$dato, $ar_properties=array('section_id','section_tipo') )) {
				$valor = $lang_name;
				break;
			}
		}


		return $valor;
	}//end get_valor



	/**
	* BUILD_SEARCH_COMPARISON_OPERATORS
	* Note: Override in every specific component
	* @param array $comparison_operators . Like array('=','!=')
	* @return object stdClass $search_comparison_operators
	*/
	public function build_search_comparison_operators( $comparison_operators=array('=','!=') ) {

		return (object)parent::build_search_comparison_operators($comparison_operators);
	}//end build_search_comparison_operators



	// DES
		// /**
		// * GET_SEARCH_QUERY
		// * Build search query for current component . Overwrite for different needs in other components
		// * (is static to enable direct call from section_records without construct component)
		// * Params
		// * @param string $json_field . JSON container column Like 'dato'
		// * @param string $search_tipo . Component tipo Like 'dd421'
		// * @param string $tipo_de_dato_search . Component dato container Like 'dato' or 'valor'
		// * @param string $current_lang . Component dato lang container Like 'lg-spa' or 'lg-nolan'
		// * @param string $search_value . Value received from search form request Like 'paco'
		// * @param string $comparison_operator . SQL comparison operator Like 'ILIKE'
		// *
		// * @see class.section_records.php get_rows_data filter_by_search
		// * @return string $search_query . POSTGRE SQL query (like 'datos#>'{components, oh21, dato, lg-nolan}' ILIKE '%paco%' )
		// */
		// public static function get_search_query( $json_field, $search_tipo, $tipo_de_dato_search, $current_lang, $search_value, $comparison_operator='=') {
		// 	$search_query='';
		// 	if ( empty($search_value) ) {
		// 		return $search_query;
		// 	}
		// 	$json_field = 'a.'.$json_field; // Add 'a.' for mandatory table alias search

		// 	switch (true) {
		// 		case $comparison_operator=='=':
		// 			$search_query = " $json_field#>'{components, $search_tipo, $tipo_de_dato_search, ". $current_lang ."}' @> '[$search_value]'::jsonb ";
		// 			break;
		// 		case $comparison_operator=='!=':
		// 			$search_query = " ($json_field#>'{components, $search_tipo, $tipo_de_dato_search, ". $current_lang ."}' @> '[$search_value]'::jsonb)=FALSE ";
		// 			break;
		// 	}

		// 	if(SHOW_DEBUG) {
		// 		$search_query = " -- filter_by_search $search_tipo ". get_called_class() ." \n".$search_query;
		// 		#dump($search_query, " search_query for search_value: ".to_string($search_value)); #return '';
		// 	}
		// 	return $search_query;
		// }//end get_search_query



	/**
	* GET_RELATED_COMPONENT_TEXT_AREA
	* @return string $tipo | null
	*/
	public function get_related_component_text_area() {

		$tipo = null;
		$related_terms = common::get_ar_related_by_model('component_text_area', $this->tipo);
			#dump($related_terms, ' related_terms ++ '.to_string());

		switch (true) {
			case count($related_terms)==1 :
				$tipo = reset($related_terms);
				break;
			case count($related_terms)>1 :
				debug_log(__METHOD__." More than one related component_text_area are found. Please fix this ASAP ".to_string(), logger::ERROR);
				break;
			default:
				break;
		}

		return $tipo;
	}//end get_related_component_text_area



	/**
	* UPDATE_DATO_VERSION
	* @param string $update_version
	* 	like '4.0.11'
	* @param string | array $dato_unchanged
	* @return object $response
	*/
	public static function update_dato_version($request_options) {

		$options = new stdClass();
			$options->update_version 	= null;
			$options->dato_unchanged 	= null;
			$options->reference_id 		= null;
			$options->tipo 				= null;
			$options->section_id 		= null;
			$options->section_tipo 		= null;
			$options->context 			= 'update_component_dato';
			foreach ($request_options as $key => $value) {if (property_exists($options, $key)) $options->$key = $value;}

			$update_version = $options->update_version;
			$dato_unchanged = $options->dato_unchanged;
			$reference_id 	= $options->reference_id;


		$update_version = implode(".", $update_version);
		#dump($dato_unchanged, ' dato_unchanged ++ -- '.to_string($update_version)); #die();

		switch ($update_version) {

			case '4.0.12':
				$new_dato = $dato_unchanged;
				$data_changed=false;
				if( empty($dato_unchanged) && !is_array($dato_unchanged) ) {

					$new_dato = array();	// Empty array default
					$data_changed=true;

				}else if(!empty($dato_unchanged) && !is_array($dato_unchanged)) {

					$new_dato = array();
					$current_locator = locator::lang_to_locator($dato_unchanged);
					debug_log(__METHOD__." dato_unchanged: $dato_unchanged - current_locator: ".to_string($current_locator), logger::DEBUG);
					if (is_object($current_locator)) {
						# add_object_to_dato is safe for duplicates and object types
						$new_dato = component_common::add_object_to_dato( $current_locator, $new_dato );
						$data_changed=true;
					}else{
						# Something is wrong
						dump($dato_unchanged, ' dato_unchanged ++ [Error en convert lang to locator] '.to_string());
						debug_log(__METHOD__." Error en convert lang to locator . lang dato_unchanged: ".to_string($dato_unchanged), logger::DEBUG);
					}
				}

				# Compatibility old dedalo instalations
				if ($data_changed) {
					$response = new stdClass();
						$response->result =1;
						$response->new_dato = $new_dato;
						$response->msg = "[$reference_id] Dato is changed from ".to_string($dato_unchanged)." to ".to_string($new_dato).".<br />";

					return $response;
				}else{
					$response = new stdClass();
						$response->result = 2;
						$response->msg = "[$reference_id] Current dato don't need update.<br />";	// to_string($dato_unchanged)."

					return $response;
				}
				break;

			default:
				# code...
				break;
		}
	}//end update_dato_version



	/**
	* GET_DIFFUSION_VALUE
	* Overwrite component common method
	* Calculate current component diffsuion value for target field (usually a mysql field)
	* Used for diffusion_mysql to unify components diffusion value call
	* @return string $diffusion_value
	*
	* @see class.diffusion_mysql.php
	*/
	public function get_diffusion_value( $lang=null ) {

		$valor = $this->get_valor( $lang ); # Importante!: Pasar lang como parámetro para indicar en la resolución del get_ar_list_of_values el lenguaje deseado
		$valor = preg_replace("/<\/?mark>/", "", $valor); # Remove untranslated string tags
		$diffusion_value = $valor;


		return (string)$diffusion_value;
	}//end get_diffusion_value



}//end class
