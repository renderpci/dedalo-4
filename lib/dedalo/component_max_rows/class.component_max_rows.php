<?php
/*
* CLASS COMPONENT MAX_ROWS
*/


class component_max_rows extends component_common {
	
	# Overwrite __construct var lang passed in this component
	protected $lang = DEDALO_DATA_NOLAN;

	
	
	/**
	* GET VALOR
	*/
	public function get_valor() {
		return DEDALO_MAX_ROWS_PER_PAGE;	//$_SESSION['dedalo4']['config']['max_rows'];
		#return rows_paginator::get_maxRows();
	}
	

}
?>