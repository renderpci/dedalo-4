<?php


/*
* CLASS MENU
*/
class menu extends common {



	protected $tipo = 'dd85';
	protected $RecordObj_dd;



	/**
	* __CONSTRUCT
	*/
	public function __construct($modo='edit') {

		$id					= null;
		$tipo				= $this->tipo;
		$this->id			= $id;
		$this->tipo			= $tipo;
		$this->lang			= DEDALO_DATA_LANG;
		$this->modo			= $modo;
		$this->section_tipo	= 'dd1';

		parent::load_structure_data();

	}//end __construct



	/**
	* GET_TREE_DATALIST
	* Get the autorized areas for current user, datalist will be used for build menu tree.
	* $data->datalist = [{ontology_items}]
	* @return array $ar_areas
	*/
	public function get_tree_datalist() {

		$ar_areas = [];

		$user_id			= navigator::get_user_id();
		$is_global_admin	= security::is_global_admin($user_id);		

		if($user_id===DEDALO_SUPERUSER || $is_global_admin===true){
			// get all aras of the current instalation
			$ar_areas = area::get_areas();

		}else{
			// get autorizaed areas for the current user with the data of component_security_access
			$ar_permisions_areas = security::get_ar_authorized_areas_for_user();

			foreach ($ar_permisions_areas as $item) {
				$ar_areas[]	= ontology::tipo_to_json_item($item->tipo);
			}
		}

		$tree_datalist = $ar_areas;

		return $tree_datalist;
	}//end get_tree_datalist



	/**
	* GET_INFO_DATA
	* get the global information of the current intalation.
	* @return object $info_data
	*/
	public function get_info_data() {

		$info_data = new stdClass();
			$info_data->entity				= DEDALO_ENTITY;
			$info_data->php_user			= get_current_user();
			$info_data->php_version			= phpversion();
			$info_data->php_session_handler	= ini_get('session.save_handler');
			$info_data->pg_db				= pg_version(DBi::_getConnection())['server'];
			$info_data->pg_db_name			= DEDALO_DATABASE_CONN;
			$info_data->server_software		= $_SERVER['SERVER_SOFTWARE'];
			$info_data->dedalo_version		= DEDALO_VERSION;
			$info_data->dedalo_build		= DEDALO_BUILD;
			$info_data->php_sapi_name		= php_sapi_name();

		return $info_data;
	}//end get_info_data



	/**
	* GET_STRUCTURE_CONTEXT
	* @return object $dd_object
	*/
	public function get_structure_context($permissions=1, $add_rqo=false) {

		// short vars
			$tipo	= $this->get_tipo();
			$mode	= $this->get_modo();
			$label	= $this->get_label();
			$lang	= $this->get_lang();
			$model	= get_class($this);

		// dd_object
			$dd_object = new dd_object((object)[
				'label'			=> $label,
				'tipo'			=> $tipo,
				'model'			=> $model,
				'lang'			=> $lang,
				'mode'			=> $mode,
				'permissions'	=> $permissions
			]);

			
		return $dd_object;
	}//end get_structure_context




}//end class
