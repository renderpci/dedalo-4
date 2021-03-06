<?php

	# CONTROLLER

	$tool_name	= get_class($this);
	$modo		= $this->get_modo();
	$file_name	= $modo;

	$is_authorized_tool_for_logged_user = component_security_tools::is_authorized_tool_for_logged_user($tool_name);
	if (!$is_authorized_tool_for_logged_user) {
		return;
	}
	
	
	switch($modo) {	
		
		case 'button':
			
			break;

		case 'page':

			// tool css / js main files
				css::$ar_url[] = DEDALO_LIB_BASE_URL."/tools/".$tool_name."/css/".$tool_name.".css";
				js::$ar_url[]  = DEDALO_LIB_BASE_URL."/tools/".$tool_name."/js/".$tool_name.".js";
				# Aditional css / js
				css::$ar_url[] = DEDALO_ROOT_WEB."/lib/jsoneditor/jsoneditor.min.css";
				js::$ar_url[]  = DEDALO_ROOT_WEB."/lib/jsoneditor/jsoneditor.min.js";
			
			// css includes
				array_unshift(css::$ar_url_basic, BOOTSTRAP_CSS_URL);

			// version info
				$current_dedalo_version	= $this->get_dedalo_version();
				$current_dedalo_version	= implode(".", $current_dedalo_version);

				$current_version_in_db	= tool_administration::get_current_version_in_db();
				$current_version_in_db	= implode(".", $current_version_in_db);

				$update_version = $this->get_update_version();
				if(!empty($update_version)) {
					$update_version = implode(".", $update_version);
				}
			
			break;
	}#end switch



	# INCLUDE FILE HTML
	try {
		$page_html = DEDALO_LIB_BASE_PATH . '/tools/' . get_class($this).  '/html/' . get_class($this) . '_' . $file_name .'.phtml';
		if( !include($page_html) ) {
			echo "<div class=\"error\">Invalid mode $this->modo</div>";
		}
	}catch (Exception $e) {
		$msg = 'Error on exec page file - Exception: ' . $e->getMessage();
		$page_html = $msg;
	}


