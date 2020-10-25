<?php
/**
 * Loading all my classes
 */
require_once 'includePHP.php';

/** Initiate the Sessions class */
$mySession = new ikanspelwel\MySessions();

/** Initiate my json return class */
$myReturn = new ikanspelwel\MyReturnJson();

/**
 * Since we are trying to login, we will logout
 * any other active session, so we can start clean
 * and fresh.
 */
$mySession->Logout();

/** Connecting to the Db */
try {
    /** Initiate my database class */
    $db = new ikanspelwel\MyDatabase();
    
    /** Prepare Statement */
    $userCheck = $db->get_dbh()->prepare( 'SELECT `user_id` FROM `user` WHERE `user_name` = :user_name AND `password` = :password' );
    
    /** Execute Statement */
    $userCheck->execute( array(':user_name' => $_REQUEST['user_name'], ':password' => $_REQUEST['password']) );
    
    /** Get the results */
    list($user_id) = $userCheck->fetch(PDO::FETCH_NUM);
    
} catch (Exception $e) {
    /** If any exception occurred report it */
    mail(ADMIN_EMAIL, 'MySQL PDO Error', $e->getMessage() .' in '. __FILE__ ." on line ". __LINE__, FORMATED_FROM, '-f'. FROM_ADDRESS);
    $myReturn->json( array('error' => "A system error has occurred, please refresh and try again. If this error persists please report it.") );
    exit;
}

/** Check if the login was successfull */
if($user_id) {
    /** If success login a session */
    $mySession->Login($user_id);
}

/** Now return success or failure. */
$myReturn->json( array('success' => ($user_id !== NULL)) );