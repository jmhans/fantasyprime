﻿<?php
  header("Access-Control-Allow-Origin: *");
  header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
  header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
//$http_origin = $_SERVER['HTTP_ORIGIN'];
//ini_set('display_errors', 1);

//if ($http_origin == "http://localhost:55626")
//{  
//    header("Access-Control-Allow-Origin: $http_origin");
//}
	
function retrieveInputs($data) {
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
		echo($input);
		var_dump($input);
		return is_array($input)?$input:array($input);
		echo($input);
		var_dump($input);
}
    
    $postdata = file_get_contents("php://input");
    $jsonData = retrieveInputs($postdata);

   /* sanity check */
   if ($jsonData != null)
   {
   
     $flName = $jsonData[0]->{'filename'};
     if ($flName != null) {
		$fullFileName = '../data/' . $flName . '.json';
		$originalData = file_get_contents($fullFileName);
		$originalDataObj = json_decode($originalData, true);
		array_push($originalDataObj['games'], $jsonData);
	   
	   $file = fopen($fullFileName,'w+');
       fwrite($file, json_encode($originalDataObj));
       fclose($file);
       }
   }
   else
   {
     // user has posted invalid JSON, handle the error 
     echo ("bad JSON");
   }
?>
