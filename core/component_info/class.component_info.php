<?php

include_once( dirname(dirname(__FILE__)). '/widgets/widget_common/class.widget_common.php' );

/*
* CLASS COMPONENT_INFO
*
*
*/
class component_info extends component_common {



	/**
	* GET_DATO
	* @return
	*/
	public function get_dato() {

		$properties			= $this->get_propiedades();
		// get the widgets defined in the ontology
		$widgets = isset($properties->widgets) ? $properties->widgets : null;
		if (empty($widgets) || !is_array($widgets)) {
			debug_log(__METHOD__." Empty defined widgets for $component_name : $label [$tipo] ".to_string($widgets), logger::WARNING);
			return null;
		}
		// the component info dato will be the all widgets data
		$dato = [];
		// every widget will be created and calculate your own data
		foreach ($widgets as $widget_obj) {

			$widget_options = new stdClass();
				$widget_options->section_tipo		= $this->get_section_tipo();
				$widget_options->section_id 		= $this->get_section_id();
				$widget_options->lang 				= DEDALO_DATA_LANG;
				// $widget_options->component_info 	= $this;
				$widget_options->widget_name 		= $widget_obj->widget_name;
				$widget_options->path 				= $widget_obj->path;
				$widget_options->data_source 		= $widget_obj->data_source;

			// instance the current widget
			$widget = widget_common::get_instance($widget_options);

			// Widget data
			$widget_value = new stdClass();
				$widget_value->name 	= $widget_obj->widget_name;
				$widget_value->value 	= $widget->get_dato();
			$dato[] = $widget_value;
		}//end foreach ($widgets as $widget)

		// set the component info dato with the result
		$this->dato = $dato;

		return $dato;
	}//end get_dato



	/**
	* GET_VALOR
	* @return string $valor
	*/
	public function get_valor( $widget_lang=DEDALO_DATA_LANG ) {

		$this->widget_lang = $widget_lang;

		$valor = $this->get_html();
		$valor = strip_tags($valor);

		return $valor;
	}//end get_valor



	/**
	* GET_VALOR_EXPORT
	* Return component value sended to export data
	* @return string $valor
	*/
	public function get_valor_export( $valor=null, $lang=DEDALO_DATA_LANG, $quotes, $add_id ) {

		#if (empty($valor)) {

			#$this->set_modo('export');

			$this->widget_lang = $lang;
			$this->widget_mode = 'export';

			$valor = $this->get_html();
			#$valor = strip_tags($valor);
		#}

		return to_string($valor);
	}//end get_valor_export



}//end component_info
