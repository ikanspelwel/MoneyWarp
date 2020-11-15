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

/** Initiate my loging error class */
$debug = new ikanspelwel\MyLog();

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
    case 'updateCurrentAccount':
        UpdateCurrentAccount($_REQUEST);
        break;
    case 'addUpdate':
        AddUpdate($_REQUEST);
        break;
    case 'getRegister':
        GetItem($_REQUEST);
        break;
    default:
        /** If an action couldn't be found, toss an exception message. */
        throw new Exception('Unknown/Invalid option!');
}


/**
 * Function to update the current/last used
 * account in the Db so we can pull it up as
 * the default account the next time they load
 * the program. 
 * 
 * @param array $vars passing the $_REQUEST vars in
 */
function UpdateCurrentAccount($vars) {
    /** Making my global var accessible to this function */
    global $mySession, $myReturn, $errors, $debug;
    
    /** Checking for required account_id var */  
    if(!array_key_exists('account_id', $vars) || !$vars['account_id']) {
        $errors->ErrorMsg('Unknown or invalid account, please refresh and try again.');
    }
    
    /** Checking our error var for any errors */
    if(!$errors->ErrorMsg()) {

        /** No error have been reported, okay to update database */
        try {
            /** Initiate my database class */
            $db = new ikanspelwel\MyDatabase();
            
            /** Prepare Statement */
            $updateItem = $db->get_dbh()->prepare( 'UPDATE `current_account` SET `account_id` = :account_id WHERE `user_id` = :user_id' );
            
            /** Execute Statement */
            $updateItem->execute( array(':user_id' => $_SESSION['user_id'], ':account_id' => $vars['account_id']) );
                
        } catch (Exception $e) {
            /** If any exception occurred report it */
            mail(ADMIN_EMAIL, 'MySQL PDO Error', $e->getMessage() .' in '. __FILE__ ." on line ". __LINE__, FORMATED_FROM, '-f'. FROM_ADDRESS);
            $myReturn->json( array('error' => "A system error has occurred, please refresh and try again. If this error persists please report it.") );
            exit;
        }

    } /** end of no errors */

    /** Returning data via json */
    $myReturn->json( array('data' => $data, 'error' => $errors->getString('<br/> - ')) );
}

/**
 * Function to add or update an payee in the
 * database. We will first check to make sure all
 * the provided values are valid and then we will
 * attempt to update the database. 
 *
 * @param array $vars passing the $_REQUEST vars in
 */
function AddUpdate($vars) {
    /** Making my global var accessible to this function */
    global $mySession, $myReturn, $errors, $debug;
    
    /** Var to hold all the data */
    $data = array();
    
    /** Removing white spaces from beginning and end of fields */
    foreach(array('name', 'notes') AS $eachVar) {
        $vars[$eachVar] = trim($vars[$eachVar]);
    }
    
    /** Checking to make sure a Nickname was provided */
    if($vars['name'] == "") {
        $errors->ErrorMsg('Please provided a name for this payee');
    }
    
    /** All Checks have been performed */
    
    /** Checking our error var for any errors */
    if(!$errors->ErrorMsg()) {
        
        /** No error have been reported, okay to update database */
        try {
            /** Initiate my database class */
            $db = new ikanspelwel\MyDatabase();
            
            if($vars['payee_id']) {
                /** If the payee_id has been provided it is an updated */

                /** Prepare Statement */
                $updateItem = $db->get_dbh()->prepare( 'UPDATE `payee` SET `name` = :name, `notes` = :notes WHERE `user_id` = :user_id AND `payee_id` = :payee_id' );
                
                /** Execute Statement */
                $updateItem->execute( array(':user_id' => $_SESSION['user_id'], ':payee_id' => $vars['payee_id'], ':name' => $vars['name'], ':notes' => $vars['notes']) );
                
            } else {
                /** No payee_id means it is an add */

                /** Prepare Statement */
                $addItem = $db->get_dbh()->prepare( 'INSERT INTO `payee` (`user_id`, `name`, `notes`) VALUES(:user_id, :name, :notes)' );

                /** Execute Statement */
                $addItem->execute( array(':user_id' => $_SESSION['user_id'], ':name' => $vars['name'], ':notes' => $vars['notes']) );

                /** Checking for affected rows */
                if($addItem->rowCount() != 1) {
                    /**
                     * No rows were inserted, so that user_id/payee_id
                     * must have been invaild. Going to report a error,
                     * However the user is probably trying to do something
                     * bad because this shouldn't ever happen in normal
                     * operation.
                     */
                    $errors->ErrorMsg('Unable to add new payee.');
                }
                
            }
            
        } catch (Exception $e) {
            /** If any exception occurred report it */
            mail(ADMIN_EMAIL, 'MySQL PDO Error', $e->getMessage() .' in '. __FILE__ ." on line ". __LINE__, FORMATED_FROM, '-f'. FROM_ADDRESS);
            $myReturn->json( array('error' => "A system error has occurred, please refresh and try again. If this error persists please report it.") );
            exit;
        }
        
    }
    
    /** Returning data via json */
    $myReturn->json( array('data' => $data, 'error' => $errors->getString('<br/> - ')) );
}

/**
 * Function to return an payee via the provided
 * payee_id. It will be returned via json so that 
 * javascript can easially parse it.
 * 
 * @param array $vars passing the $_REQUEST vars in
 */
function GetItem($vars) {
    /** Making my global var accessible to this function */
    global $mySession, $myReturn, $errors, $debug;
    
    /** Var to hold the data */
    $data = NULL;
    
    /** Need to get the payee out of the Database */
    try {
        /** Initiate my database class */
        $db = new ikanspelwel\MyDatabase();
        
        /** Prepare Statement */
        $getItem = $db->get_dbh()->prepare( 'SELECT * FROM `payee` WHERE `user_id` = :user_id AND `payee_id` = :payee_id' );
        
        /** Execute Statement */
        $getItem->execute( array(':user_id' => $_SESSION['user_id'], ':payee_id' => $vars['payee_id']) );
        
        /** Get the results */
        if($reference = $getItem->fetch(PDO::FETCH_ASSOC)) {
            /** Storing each returned row in the data var */
            $data = $reference;
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

/**
 * Function to return all the accounts associated with
 * this user. They will be returned via json so that 
 * javascript can easially parse it.
 * 
 * @param array $vars passing the $_REQUEST vars in
 */
function GetAccounts($vars) {
    /** Making my global var accessible to this function */
    global $mySession, $myReturn, $errors;
    
    /** Var to hold all the data */
    $data = array();

    /** Need to get all the payees out of the Database */
    try {
        /** Initiate my database class */
        $db = new ikanspelwel\MyDatabase();
        
        /** Prepare Statement */
        $getList = $db->get_dbh()->prepare( 'SELECT `account`.`account_id`, `description`, `active`, `current_account`.`account_id` AS `current` FROM `account` LEFT JOIN `current_account` USING(`user_id`, `account_id`) WHERE `user_id` = :user_id ORDER BY `description`' );
        
        /** Execute Statement */
        $getList->execute( array(':user_id' => $_SESSION['user_id']) );
        
        /** Get the results */
        while ($reference = $getList->fetch(PDO::FETCH_ASSOC)) {
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
