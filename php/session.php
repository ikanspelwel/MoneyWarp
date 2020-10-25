<?php
/**
 * Loading all my classes
 */
require_once 'includePHP.php';

/** Initiate the Sessions class */
$mySession = new ikanspelwel\MySessions();

/** Initiate my json return class */
$myReturn = new ikanspelwel\MyReturnJson();

/** Sterilizing the doWhat var, setting to null if it doesn't exist */
$doWhat = (array_key_exists('doWhat', $_REQUEST) ? $_REQUEST['doWhat'] : NULL);

/** Deciding what to do based on the doWhat var */
switch ( $doWhat ) {
    case 'checkActive':
        checkActive($_REQUEST);
        break;
    default:
        /** If an action couldn't be found, toss an exception message. */
        throw new Exception('Unknown/Invalid option!');
}

function checkActive($vars) {
    /** Making my global var accessible to this function */
    global $mySession, $myReturn;
    
    /** Returning via json if there is an active session or not */    
    $myReturn->json( array('active' => $mySession->Active()) );
}