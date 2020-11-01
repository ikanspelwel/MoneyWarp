<?php
/**
 * Loading all my classes
 */
require_once 'includePHP.php';

/** Initiate the Sessions class */
$mySession = new ikanspelwel\MySessions();

/** Initiate my json return class */
$myReturn = new ikanspelwel\MyReturnJson();

/** Initiate my error message class */
$errors = new ikanspelwel\MyErrorMsg();

/**
 * First verifying they have an active session
 * if they don't then we cannot proceed and we
 * need to kick them out and indicate that.
 */
if( !$mySession->Active() ) {
    /** Invalid session, kick them out. */
    
    /** Friendly error to show. */
    $errors->ErrorMsg('Your session has expired, please log back in.');
    
    /** Return trigger vars */
    $return['loggedOut'] = TRUE;
    $return['error'] = $errors->getString();
    
    $myReturn->json( $return );
}

/** Sterilizing the doWhat var, setting to null if it doesn't exist */
$doWhat = (array_key_exists('doWhat', $_REQUEST) ? $_REQUEST['doWhat'] : NULL);

/** Deciding what to do based on the doWhat var */
switch ( $doWhat ) {
    case 'getAccounts':
        GetAccounts($_REQUEST);
        break;
    default:
        /** If an action couldn't be found, toss an exception message. */
        throw new Exception('Unknown/Invalid option!');
}

/**
 * Function to return if there is an active session or not.
 * It will be returned via json so that javascript can
 * easially parse it.
 * 
 * @param array $vars passing the $_REQUEST vars in
 */
function GetAccounts($vars) {
    /** Making my global var accessible to this function */
    global $mySession, $myReturn, $errors;
    
    /** Var to hold all the data */
    $data = array();

    /** Need to get all the accounts out of the Database */
    try {
        /** Initiate my database class */
        $db = new ikanspelwel\MyDatabase();
        
        /** Prepare Statement */
        $getAccounts = $db->get_dbh()->prepare( 'SELECT * FROM `account` WHERE `user_id` = :user_id' );
        
        /** Execute Statement */
        $getAccounts->execute( array(':user_id' => $_SESSION['user_id']) );
        
        /** Get the results */
        while ($reference = $getAccounts->fetch(PDO::FETCH_ASSOC)){
            /** Massaging Data */
            $reference['active'] += 0; /** Converting to Numeric */
            
            /** Storing each returned row in the data var */
            $data[] = $reference;
        }
        
    } catch (Exception $e) {
        /** If any exception occurred report it */
        mail(ADMIN_EMAIL, 'MySQL PDO Error', $e->getMessage() .' in '. __FILE__ ." on line ". __LINE__, FORMATED_FROM, '-f'. FROM_ADDRESS);
        $myReturn->json( array('error' => "A system error has occurred, please refresh and try again. If this error persists please report it.") );
        exit;
    }

    /** Returning data via json */    
    $myReturn->json( array('data' => $data, 'error' => $errors->getString()) );
}