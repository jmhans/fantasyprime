﻿<?php

class PHP_FILESYSTEM_API {
	protected $settings;
	protected function mapMethodToAction($method,$key) {
		switch ($method) {
			case 'OPTIONS': return 'headers';
			case 'GET': return ($key===false)?'list':'read';
			case 'PUT': return 'update';
			case 'POST': return 'create';
			case 'DELETE': return 'delete';
			case 'PATCH': return 'increment';
			default: $this->exitWith404('method');
		}
		return false;
	}
	protected function parseRequestParameter(&$request,$characters) {
		if ($request==='') return false;
		$pos = strpos($request,'/');
		$value = $pos?substr($request,0,$pos):$request;
		$request = $pos?substr($request,$pos+1):'';
		if (!$characters) return $value;
		return preg_replace("/[^$characters]/",'',$value);
	}
	public function __construct($config) {
		extract($config);
		// initialize

		$allow_origin = isset($allow_origin)?$allow_origin:null;
		$method = isset($method)?$method:null;
		$request = isset($request)?$request:null;
		$get = isset($get)?$get:null;
		$post = isset($post)?$post:null;
		$origin = isset($origin)?$origin:null;
		// defaults

		if (!$method) {
			$method = $_SERVER['REQUEST_METHOD'];
		}
		if (!$request) {
			$request = isset($_SERVER['PATH_INFO'])?$_SERVER['PATH_INFO']:'';
			if (!$request) {
				$request = isset($_SERVER['ORIG_PATH_INFO'])?$_SERVER['ORIG_PATH_INFO']:'';
				$request = $request!=$_SERVER['SCRIPT_NAME']?$request:'';
			}
		}
		
		if (!$get) {
			$get = $_GET;
		}
		if (!$post) {
			$post = $this->retrievePostData();
		}
		if (!$origin) {
			$origin = isset($_SERVER['HTTP_ORIGIN'])?$_SERVER['HTTP_ORIGIN']:'';
		}
		$request = trim($request,'/');
		if ($auto_include===null) {
			$auto_include = true;
		}
		if ($allow_origin===null) {
			$allow_origin = '*';
		}
		$this->settings = compact('method', 'request', 'get', 'post', 'origin', 'allow_origin');
	}

	protected function getParameters($settings) {
		extract($settings);
		$table     = $this->parseRequestParameter($request, 'a-zA-Z0-9\-_');
		$key       = $this->parseRequestParameter($request, 'a-zA-Z0-9\-_,'); // auto-increment or uuid
		$action    = $this->mapMethodToAction($method,$key);
		$inputs	   = $this->retrieveInputs($post);
		return compact('action','inputs');
	}
	protected function retrieveInputs($data) {
			if (strlen($data)==0) {
				$input = false;
			} else if ($data[0]=='{' || $data[0]=='[') {
				$input = json_decode($data);
			} else {
				parse_str($data, $input);
				foreach ($input as $key => $value) {
					if (substr($key,-9)=='__is_null') {
						$input[substr($key,0,-9)] = null;
						unset($input[$key]);
					}
				}
				$input = (object)$input;
			}

			return $input; //is_array($input)?$input:array($input);
	}
	protected function allowOrigin($origin,$allowOrigins) {
		if (isset($_SERVER['REQUEST_METHOD'])) {
			header('Access-Control-Allow-Credentials: true');
			foreach (explode(',',$allowOrigins) as $o) {
				if (preg_match('/^'.str_replace('\*','.*',preg_quote(strtolower(trim($o)))).'$/',$origin)) { 
					header('Access-Control-Allow-Origin: '.$origin);
					break;
				}
			}
		}
	}

   	public function executeCommand() {
		if ($this->settings['origin']) {
			 $this->allowOrigin($this->settings['origin'],$this->settings['allow_origin']);
		}
		if (!$this->settings['request']) {
			var_dump( $this->settings);
			echo 'Request not understood';
		} else {
			 $parameters = $this->getParameters($this->settings);
			 $this->saveFile($parameters); 
		}
	}
	protected function retrievePostData() {
		if ($_FILES) {
			$files = array();
			foreach ($_FILES as $name => $file) {
				foreach ($file as $key => $value) {
					switch ($key) {
						case 'tmp_name': $files[$name] = $value?base64_encode(file_get_contents($value)):''; break;
						default: $files[$name.'_'.$key] = $value;
					}
				}
			}
			return http_build_query(array_merge($files,$_POST));
		}
		return file_get_contents('php://input');
	}
	protected function saveFile($parameters) {
		extract($parameters);
		// $parameters is an array that contains an 'inputs' variable that will be used in this function. 

		/* sanity check */
	   if ($inputs != null)
	   {
   
		 $flName = $this->settings['request'];
		 if ($flName != null) {
			$fullFileName = '../data/' . $flName . '.json';
			if (file_exists($fullFileName)) {
				$originalData = file_get_contents($fullFileName);
			}

			$originalDataObj = json_decode($originalData);
			
		   $file = fopen($fullFileName,'w+');
		   fwrite($file, json_encode($originalDataObj));
		   fclose($file);

		   }
	   }
	   else
	   {
		 // user has posted invalid JSON, handle the error 
		 echo ("Bad JSON");
	   }
	}



}


    
//    $postdata = file_get_contents("php://input");
//    $jsonData = retrieveInputs($postdata);

   

$api = new PHP_FILESYSTEM_API();
 $api->executeCommand();



?>
