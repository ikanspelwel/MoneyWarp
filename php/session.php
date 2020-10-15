<?php
/**
 * Loading all my classes
 */
require_once 'includePHP.php';

// Initiate my session class
$mySession = new ikanspelwel\MySessions();

// Initiate my json return class
$myReturn = new ikanspelwel\MyReturnJson();

// Initiate my error message class
$errors = new ikanspelwel\MyErrorMsg();

$doWhat = (array_key_exists('doWhat', $_REQUEST) ? $_REQUEST['doWhat'] : NULL);

switch ( $doWhat ) {
    case 'checkActive':
        checkActive($_REQUEST);
        break;
    default:
        echo 'Unknown!';
}

function checkActive($vars) {
    global $mySession, $myReturn, $errors;
    
//     // Initiate my json return class
//     $debug = new ikanspelwel\MyLog();
    
//     $errors->ErrorMsg("You did something bad!!");
//     $errors->ErrorMsg("You also did something bad!!");
    
//     if($errors->ErrorMsg()) {
//         $debug->errorLog($errors->getString());
//     }
    
//     $debug->errorLog('before json');
    
    $myReturn->json( array('active' => $mySession->Active()) );
    
//     $debug->errorLog('after json');
}