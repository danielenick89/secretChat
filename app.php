<?php
include('functions.php');


function convert_time_sql($date){
    $date = strtotime($date);
    $date = date("Y-m-d ",$date).date("G:i:s");
    return $date;
}

if(isset($_GET['k'])) {
    $key = mysqlEscape($_GET['k']);
}
if(isset($_GET['d'])) {
    $data = mysqlEscape($_GET['d']);
}
if(isset($_GET['t'])) {
    $time=mysqlEscape($_GET['t']);
}
if(isset($_GET['e'])) {
    sqlQuery("DELETE FROM Message WHERE k = '$key'");
}

if(!isset($key) || !isset($time)) {
    die("error");
} else //echo date('Y-m-d', $time);

if(isset($data)) {
    sqlQuery("INSERT INTO Message(k, d) VALUES('$key', '$data')");
}


$r = arrayFromResult(sqlQuery("SELECT UNIX_TIMESTAMP(NOW()) as t"));

$result = sqlQuery("SELECT d FROM Message WHERE k = '$key' AND TIMESTAMP(t) > FROM_UNIXTIME($time)");
if($result) {
    $array = arrayFromResult($result);
    $json = json_encode($array);
    $arr = $json;
} else {
    $arr =  "[]";
}

echo "{\"now\": \"{$r[0]['t']}\", \"messages\": $arr}";
?>
