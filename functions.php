<?php

function sqlQuery($query) {
   
   	//echo "Debug: $query<br/>";
   
	$user="user";
	$password="password";
	$database="secretChat";
	mysql_connect("localhost",$user,$password);
	@mysql_select_db($database) or die( "Unable to select database");
	($result = mysql_query("$query")) or print("errore nella query: [".mysql_error()."] - <br/>Dettaglio query:'$query'");
    if(is_resource($result)) {
	    if(mysql_numrows($result) == 0)  {
            $result = false;
        }
    }
	mysql_close();
	return $result;
}

function mysqlEscape( $string ) {
	$user="user";
	$password="password";
	$database="secretChat";
	$l = mysql_connect("localhost",$user,$password);
   	$ret = mysql_real_escape_string($string,$l);
   	mysql_close();
   	return $ret;
}

function arrayFromResult($result) {
	$rows=mysql_numrows($result);
	$array = null;
	for($i=0;$i<$rows; $i++) {
		$array[$i] = mysql_fetch_assoc($result);
	}
	return $array;
}

?>
