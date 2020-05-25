<?php
/*
* CLASS COMPONENT_SVG
* Manage specific component input text logic
* Common components properties and method are inherited of component_common class that are inherited from common class
*/
class component_svg extends component_media_common {


	public $quality;

	/**
	* GET VALOR
	* LIST:
	* GET VALUE . DEFAULT IS GET DATO . OVERWRITE IN EVERY DIFFERENT SPECIFIC COMPONENT
	*/
	public function get_valor() {

		return $this->get_svg_id() .'.'. DEDALO_SVG_EXTENSION;
	}//end get_valor



	/**
	* GET_VALOR_EXPORT
	* Return component value sended to export data
	* @return string $valor_export
	*/
	public function get_valor_export( $valor=null, $lang=DEDALO_DATA_LANG, $quotes=null, $add_id=null ) {

		if (empty($valor)) {
			$dato = $this->get_dato();				// Get dato from DB
		}else{
			$this->set_dato( json_decode($valor) );	// Use parsed json string as dato
		}

		$valor = $this->get_url(true);

		return $valor;
	}//end get_valor_export



	/**
	* GET_ID
	* Alias of get_svg_id
	*/
	public function get_id() {

		return $this->get_svg_id();
	}//end get_id



	/**
	* GET SVG ID
	* Por defecto se construye con el tipo del component_image actual y el número de orden, ej. 'dd20_rsc750_1'
	* Se puede sobreescribir en propiedades con json ej. {"svg_id":"dd851"} y se leerá del contenido del componente referenciado
	*/
	public function get_svg_id() {

		# Already calculed id
		if(isset($this->svg_id)) return $this->svg_id;

		# Default value
		$svg_id = $this->tipo.'_'.$this->section_tipo.'_'.$this->parent;


		# CASE REFERENCED NAME : If isset propiedades "svg_id" overwrite name with field ddx content
		$propiedades = $this->get_propiedades();
		if (isset($propiedades->svg_id)) {

			$component_tipo 	= $propiedades->svg_id;
			$component_modelo 	= RecordObj_dd::get_modelo_name_by_tipo($component_tipo, true);
			$component 			= component_common::get_instance($component_modelo,
																 $component_tipo,
																 $this->parent,
																 'edit',
																 DEDALO_DATA_NOLAN,
																 $this->section_tipo);
			$dato = trim($component->get_valor(0));
			if(!empty($dato) && strlen($dato)>0) {
				$svg_id = $dato;
			}
		}

		# Fix value
		$this->svg_id = $svg_id;


		return $svg_id;
	}//end get_svg_id



	/**
	* GET_INITIAL_MEDIA_PATH
	*/
	public function get_initial_media_path() {

		$component_tipo = $this->tipo;
		$parent_section = section::get_instance($this->parent,$this->section_tipo);
		$propiedades 	= $parent_section->get_propiedades();
			#dump($propiedades," propiedades component_tipo:$component_tipo");
			#dump($propiedades->initial_media_path->$component_tipo," ");

		if (isset($propiedades->initial_media_path->$component_tipo)) {
			$this->initial_media_path = $propiedades->initial_media_path->$component_tipo;
			# Add / at begin if not exits
			if ( substr($this->initial_media_path, 0, 1) != '/' ) {
				$this->initial_media_path = '/'.$this->initial_media_path;
			}
		}else{
			$this->initial_media_path = false;
		}

		return $this->initial_media_path;
	}//end get_initial_media_path



	/**
	* GET_ADITIONAL_PATH
	* Calculate image aditional path from 'propiedades' json config.
	*/
	public function get_aditional_path() {

		# Already resolved
		if(isset($this->aditional_path)) return $this->aditional_path;

		$aditional_path = false;
		$svg_id 		= $this->get_svg_id();
		$parent 		= $this->get_parent();
		$section_tipo 	= $this->get_section_tipo();

		$propiedades = $this->get_propiedades();
		if (isset($propiedades->aditional_path) && !empty($parent) ) {

			$component_tipo 	= $propiedades->aditional_path;
			$component_modelo 	= RecordObj_dd::get_modelo_name_by_tipo($component_tipo,true);
			$component 			= component_common::get_instance($component_modelo,
																 $component_tipo,
																 $parent,
																 'edit',
																 DEDALO_DATA_NOLAN,
																 $section_tipo);
			$dato = trim($component->get_valor(0));

			# Add / at begin if not exits
			if ( substr($dato, 0, 1)!=='/' ) {
				$dato = '/'.$dato;
			}
			# Remove / at end if exists
			if ( substr($dato, -1)==='/' ) {
				$dato = substr($dato, 0, -1);
			}

			# User defined aditional_path path
			$aditional_path = $dato;

			# Auto filled aditional_path path
			# If the user not enter component dato, dato is filled by auto value when propiedades->max_items_folder is defined
			if(empty($dato) && isset($propiedades->max_items_folder)) {

				$max_items_folder  = $propiedades->max_items_folder;
				$parent_section_id = $parent;

				$aditional_path = '/'.$max_items_folder*(floor($parent_section_id / $max_items_folder));

				# Final dato must be an array to saved into component_input_text
				$final_dato = array( $aditional_path );
				$component->set_dato( $final_dato );
				$component->Save();
			}

		}else if(isset($propiedades->max_items_folder)) {

			$max_items_folder  = $propiedades->max_items_folder;
			$parent_section_id = $parent;

			$aditional_path = '/'.$max_items_folder*(floor($parent_section_id / $max_items_folder));

		}//end if (isset($propiedades->aditional_path) && !empty($parent) )

		# Fix
		$this->aditional_path = $aditional_path;

		return $aditional_path;
	}//end get_aditional_path



	/**
	* GET_FILE_NAME
	* @return string $file_name
	*/
	public function get_file_name() {

		$file_name = $this->tipo .'_'. $this->section_tipo .'_'. $this->parent;

		return $file_name;
	}//end get_file_name



	/**
	* GET QUALITY
	*/
	public function get_quality() {
		if(!isset($this->quality))	return DEDALO_SVG_QUALITY_DEFAULT;

		return $this->quality;
	}



	/**
	* GET_FILE_PATH
	* @return string $file_path
	*/
	public function get_file_path() {

		if(!$this->quality) {
			$this->quality = $this->get_quality();
		}

		$aditional_path = $this->get_aditional_path();

		$file_name 	= $this->get_svg_id() .'.'. DEDALO_SVG_EXTENSION;
		$file_path 	= DEDALO_MEDIA_PATH . DEDALO_SVG_FOLDER . '/' . $this->quality . $aditional_path . '/' . $file_name;

		return $file_path;
	}//end get_file_path


	/**
	* GET_FILE_CONTENT
	* @return
	*/
	public function get_file_content() {

		$file_path 		= $this->get_file_path();
		$file_content	= file_get_contents($file_path);

		return $file_content;
	}//end get_file_content



	/**
	* GET_TARGET_DIR
	* @return
	*/
	public function get_target_dir() {

		if(!$this->quality) {
			$this->quality = $this->get_quality();
		}

		$aditional_path 	= $this->get_aditional_path();
		$initial_media_path = $this->get_initial_media_path();

		$target_dir = DEDALO_MEDIA_PATH . DEDALO_SVG_FOLDER . $this->initial_media_path. '/' . $this->quality . $aditional_path . '/';

		return $target_dir;
	}//end get_target_dir



	/**
	* GET_DEFAULT_SVG_URL
	* @return string $url
	*/
	public static function get_default_svg_url() {
		$url = DEDALO_CORE_URL . '/themes/default/upload.svg';

		return $url;
	}//end get_default_svg_url



	// /**
	// * GET_URL
	// * @return string $url
	// * @param bool $absolute
	// *	Return relative o absolute url. Default false (relative)
	// */
	// public function get_url($absolute=false) {

	// 	$aditional_path = $this->get_aditional_path();

	// 	$file_name 	= $this->get_svg_id() .'.'. DEDALO_SVG_EXTENSION;
	// 	$url 		= DEDALO_MEDIA_URL .''. DEDALO_SVG_FOLDER . $aditional_path . '/' . $file_name;

	// 	# ABSOLUTE (Default false)
	// 	if ($absolute) {
	// 		$url = DEDALO_PROTOCOL . DEDALO_HOST . $url;
	// 	}

	// 	return $url;
	// }//end get_url



	/**
	* GET_IMAGE_URL
	* Get image url for current quality
	* @param string | bool $quality
	*	optional default (bool)false
	* @param bool $test_file
	*	Check if file exists. If not use 0.jpg as output. Default true
	* @param bool $absolute
	*	Return relative o absolute url. Default false (relative)
	*/
	public function get_url($quality=false, $test_file=true, $absolute=false, $default_add=true) {

		// quality fallback to default
			if(!$quality) $quality = $this->get_quality();

		// image id
			$image_id 	= $this->get_svg_id();

		// url
			$aditional_path 	= $this->get_aditional_path();
			$initial_media_path = $this->get_initial_media_path();
			$file_name 			= $image_id .'.'. DEDALO_SVG_EXTENSION;
			$image_url 			= DEDALO_MEDIA_URL . DEDALO_SVG_FOLDER . $initial_media_path . '/' . $quality . $aditional_path . '/' . $file_name;

		// File exists test : If not, show '0' dedalo image logo
			if($test_file===true) {
				$file = $this->get_file_path();

				if(!file_exists($file)) {
					if ($default_add===false) {
						return false;
					}
					$image_url = DEDALO_CORE_URL . '/themes/default/icons/dedalo_icon_grey.svg';
				}
			}

		// Absolute (Default false)
			if ($absolute===true) {
				$image_url = DEDALO_PROTOCOL . DEDALO_HOST . $image_url;
			}

		return $image_url;
	}//end get_image_url



	/**
	* GET_URL_FROM_LOCATOR
	* @return string $url
	*/
	public static function get_url_from_locator($locator) {

		$modelo_name 	= RecordObj_dd::get_modelo_name_by_tipo($locator->component_tipo,true);
		$component 		= component_common::get_instance($modelo_name,
														 $locator->component_tipo,
														 $locator->section_id,
														 'list',
														 DEDALO_DATA_NOLAN,
														 $locator->section_tipo
														 );
		$url = $component->get_url();

		return $url;
	}//end get_url_from_locator



	/**
	* GET_DIFFUSION_VALUE
	* Overwrite component common method
	* Calculate current component diffusion value for target field (usually a mysql field)
	* Used for diffusion_mysql to unify components diffusion value call
	* @return string $diffusion_value
	*
	* @see class.diffusion_mysql.php
	*/
	public function get_diffusion_value( $lang=null ) {

		$diffusion_value = $this->get_url();


		return (string)$diffusion_value;
	}//end get_diffusion_value



	/**
	* GET_ALLOWED_EXTENSIONS
	* @return array $allowed_extensions
	*/
	public function get_allowed_extensions() {

		$allowed_extensions = defined('DEDALO_SVG_EXTENSIONS_SUPPORTED')
			? (is_array(DEDALO_SVG_EXTENSIONS_SUPPORTED) ? DEDALO_SVG_EXTENSIONS_SUPPORTED : unserialize(DEDALO_SVG_EXTENSIONS_SUPPORTED))
			: ['svg'];

		return $allowed_extensions;
	}//end get_allowed_extensions



	/**
	* GET_ORIGINAL_QUALITY
	* @return $original_quality
	*/
	public function get_original_quality() {

		$original_quality = defined('DEDALO_SVG_QUALITY_ORIGINAL')
			? DEDALO_SVG_QUALITY_ORIGINAL
			: DEDALO_SVG_QUALITY_DEFAULT;

		return $original_quality;
	}//end get_original_quality



	/**
	* GET_PREVIEW_URL
	* @return string $url
	*/
	public function get_preview_url() {

		// $preview_url = $this->get_thumb_url();
		$preview_url = $this->get_url($quality=false, $test_file=true, $absolute=false, $default_add=false);

		return $preview_url;
	}//end get_preview_url



}//end class component_svg
