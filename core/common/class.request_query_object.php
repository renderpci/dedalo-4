<?php
/**
* CLASS REQUEST QUERY OBJECT
* Defines object with normalized properties and checks
*
*/
/*

	// structure
		dd_api 		: API class that will be used
		action 		: API method that will be used
		source	: component, section, menu, etc that made the call
			action 	: API method that will be used with the source
		sqo		: search query object active width DDBB
		show 	: layout_map and sqo_config
			(it will create the search and choose, when these objects are not sended)
		search 	: layout_map and sqo_config 
			(it modify the show and it will create the choose, when these object is not sended)
		choose 	: layout_map 
			(it modify search)

		Mandatory : dd_api, action, source
		Optional	: sqo, show, search, choose

		If you only send a source, the server will create the basic sqo and will get the layout map from user preset or generic layout from ontoloy.

	// dd_request format
	[
		{
			
			"dd_api"		: string // the API class to use,
			"action"		: string // the API method to use
			"source"		: {
				"action_opt"	: string || object || array // the API method modifier to use
				"model"			: string // model of the ddo
				"tipo"			: string // tipo of the ddo
				"section_tipo"	: string // section_tipo of the ddo
				"section_id"	: string || int || null // section_id of the ddo 
				"mode"			: string (edit || list || search || ...), mode of the ddo
				"lang"			: string // lang of the ddo
			},			
			"sqo"			: {
				// all sqo definition in search_query_object class
			}
			"show"			: {
				"ddo_map"		: array [array {ddo}, {ddo}] // layout map will be used, with specific path
				"sqo_config"	: {
					// specific sqo configuration for the show
				}
			},
			"search"		: {
				"ddo_map"		: array [array {ddo}, {ddo}] // layout map will be used, with specific path
				"sqo_config"	: {
					// specific sqo configuration for the search
			},
			"choose"		: {
				"ddo_map"		: array [array {ddo}, {ddo}] // layout map will be used, with specific path
			}
		}
	]

	// request_config (request configuration for Dédalo API or others API):

	[
		{
			"search_engine": "dedalo_engine",
			"sqo":{
				"section_tipo": [
					{"source" : "hierarchy_types", "value": [2]},
					{"source" : "section", "value":["on1"]},
					{"source" : "self"}
				],
				"filter_by_list":[
						{"section_tipo": "numisdata3","component_tipo":"numisdata309"}
						],
				"fixed_filter":[
					{ "source": "fixed_dato",
					  "value":[
						{
						  "f_path":["numisdata3","numisdata27"],
						  "q":
								{
								"value":["{\"section_id\":\"2\",\"section_tipo\":\"dd64\",\"type\":\"dd151\",\"from_component_tipo\":\"hierarchy24\"}",
								2,"abc"]
								}
							,
						"q_operator": null
					}]
						,"operator":"$and"
					},
					{ "source": "component_dato",
					  "value":[
						{
						  "q":
								{
								"value":"numisdata36"
								}
								,
						"q_operator": null
					}],
						"operator":"$or"
					},
					{ "source": "hierarchy_terms",
					  "value":[
									{"section_tipo":"on1","section_id":"2705", "recursive":true},
									{"section_tipo":"on1","section_id":"2748","recursive":true}
						  ],
					  "operator":"$or"
					}
				]
			},
			"show":{
				"ddo_map":[
					[{"section_tipo":"self","component_tipo":"numisdata27","mode":"edit","label":"number"}]
					[{"section_tipo":"self","component_tipo":"numisdata309","mode":"list","label":"catalog"},{"section_tipo":"numisdata300","component_tipo":"numisdata303","mode":"list","label":"catalog"}]
					[{"section_tipo":"self","component_tipo":"numisdata81","label":"key"}]
				],
				"divisor": ", ",
				"value_with_parents": true,
				"sqo_config": {
					 "operator": "$or",
					 "limit" : 5
				}
			},
			"search":{
				"ddo_map": [
				[{"section_tipo":"self","component_tipo":"numisdata309","mode":"list"},{"section_tipo":"numisdata300","component_tipo":"numisdata303","mode":"list"}]
			]},
			"choose":{
				"ddo_map":[
					[{"section_tipo":"self","component_tipo":"numisdata27","mode":"edit"}]
					[{"section_tipo":"self","component_tipo":"numisdata309","mode":"list"},{"section_tipo":"numisdata300","component_tipo":"numisdata303","mode":"list"}]
					[{"section_tipo":"self","component_tipo":"numisdata81"}]
			]},
		},
		{
			"search_engine": "zenon_engine",
			"section_tipo": [{"source":"section", "value":["zenon1"]}],
			"search":
				{"ddo_map": [
					[{"section_tipo":"zenon1","component_tipo":"zenon3"}]
					[{"section_tipo":"zenon1","component_tipo":"zenon4"}]
					[{"section_tipo":"zenon1","component_tipo":"zenon5"}]
					[{"section_tipo":"zenon1","component_tipo":"zenon6"}]
	
				]
			}
		}
	]
	*/

class request_query_object extends stdClass {


	
	/**
	* __CONSTRUCT
	* @param object $data
	*	optional . Default is null
	*/
	public function __construct( $data=null ) {

		$this->api_engine = 'dedalo';

		
		return true;
	}//end __construct



	/**
	* SET_TYPO
	*/
	public function set_typo(string $value) {
		$this->typo = $value;
	}



	/**
	* SET_DD_API
	*/
	public function set_dd_api(string $value) {
		$this->dd_api = $value;
	}


	/**
	* SET_API_ENGINE
	*/
	public function set_api_engine(string $value) {
		$this->api_engine = $value;
	}//end set_api_engine



	/**
	* SET_ACTION
	*/
	public function set_action(string $value) {
		$this->action = $value;
	}



	/**
	* SET_ACTION_OPT
	*/
	public function set_action_opt($value) {
		
		$this->action_opt = $value;
	}



	/**
	* SET_TIPO
	*/
	public function set_tipo(string $value) {
		if(!RecordObj_dd::get_prefix_from_tipo($value)) {
			throw new Exception("Error Processing Request. Invalid tipo: $value", 1);
		}
		$this->tipo = $value;
	}



	/**
	* SET_SECTION_TIPO
	*/
	public function set_section_tipo(string $value) {
		
		$this->section_tipo = $value;
	}



	/**
	* SET_SECTION_ID
	*/
	public function set_section_id($value) {
		
		$this->section_id = $value;
	}



	/**
	* SET_LANG
	*/
	public function set_lang(string $value) {
		if(strpos($value, 'lg-')!==0) {
			throw new Exception("Error Processing Request. Invalid lang: $value", 1);
		}
		$this->lang = $value;
	}


	/**
	* SET_MODE
	*/
	public function set_mode(string $value) {

		$this->mode = $value;
	}



	/**
	* SET_MODEL
	*/
	public function set_model(string $value) {

		$this->model = $value;
	}



	/**
	* SET_SQO
	*/
	public function set_sqo($value) {

		$this->sqo = $value;
	}



	/**
	* SET_SHOW
	*/
	public function set_show($value) {

		$this->show = $value;
	}



	/**
	* SET_SEARCH
	*/
	public function set_search($value) {

		$this->search = $value;
	}



	/**
	* SET_CHOOSE
	*/
	public function set_choose($value) {

		$this->choose = $value;
	}



}//end dd_object
