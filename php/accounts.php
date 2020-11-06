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
    case 'addUpdate':
        AddUpdate($_REQUEST);
        break;
    case 'getAccount':
        GetAccount($_REQUEST);
        break;
    default:
        /** If an action couldn't be found, toss an exception message. */
        throw new Exception('Unknown/Invalid option!');
}

/**
 * Function to add or update an account in the
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
    foreach(array('description', 'account_num', 'aba') AS $eachVar) {
        $vars[$eachVar] = trim($vars[$eachVar]);
    }
    
    /** Checking to make sure a Nickname was provided */
    if($vars['description'] == "") {
        $errors->ErrorMsg('Please provided a name for this account');
    }
    
    /**
     * Type should be either Checking or Savings
     */
    if($vars['type'] != 'Checking' && $vars['type'] != 'Savings') {
        $errors->ErrorMsg('Invalid account type');
    }

    /**
     * Account number and ABA can only contain numbers
     */
    if(!preg_match("/^\d+$/", $vars['account_num']) ) {
        $errors->ErrorMsg('Account number can only contain numbers');
    }
    if(!preg_match("/^\d+$/", $vars['aba']) ) {
        $errors->ErrorMsg('Routing number can only contain numbers');
    }

    /**
     * Sanitizing Active Var
     */
    $vars['active'] = ($vars['active'] == '1');
    
    
    /** All Checks have been performed */
    
    /** Checking our error var for any errors */
    if(!$errors->ErrorMsg()) {
        
        /** No error have been reported, okay to update database */
        try {
            /** Initiate my database class */
            $db = new ikanspelwel\MyDatabase();
            
            if($vars['account_id']) {
                /** If the account_id has been provided it is an updated */

                /** Prepare Statement */
                $updateAccount = $db->get_dbh()->prepare( 'UPDATE `account` SET `description` = :description, `type` = :type, `account_num` = :account_num, `aba` = :aba, `active` = :active WHERE `user_id` = :user_id AND `account_id` = :account_id' );
                
                /** Execute Statement */
                $updateAccount->execute( array(':user_id' => $_SESSION['user_id'], ':description' => $vars['description'], ':type' => $vars['type'], ':account_num' => $vars['account_num'], ':aba' => $vars['aba'], ':active' => $vars['active'], ':account_id' => $vars['account_id']) );
                
            } else {
                /** No account_id means it is an add */

                /** Prepare Statement */
                $addAccount = $db->get_dbh()->prepare( 'INSERT INTO `account` (`user_id`, `description`, `type`, `account_num`, `aba`, `active`) VALUES(:user_id, :description, :type, :account_num, :aba, :active)' );

                /** Execute Statement */
                $addAccount->execute( array(':user_id' => $_SESSION['user_id'], ':description' => $vars['description'], ':type' => $vars['type'], ':account_num' => $vars['account_num'], ':aba' => $vars['aba'], ':active' => $vars['active']) );

                /** Checking for affected rows */
                if($addAccount->rowCount() != 1) {
                    /**
                     * No rows were inserted, so that user_id/account_id
                     * must have been invaild. Going to report a error,
                     * However the user is probably trying to do something
                     * bad because this shouldn't ever happen in normal
                     * operation.
                     */
                    $errors->ErrorMsg('Unable to add new account.');
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
 * Function to return an account via the provided
 * account_id. It will be returned via json so that 
 * javascript can easially parse it.
 * 
 * @param array $vars passing the $_REQUEST vars in
 */
function GetAccount($vars) {
    /** Making my global var accessible to this function */
    global $mySession, $myReturn, $errors, $debug;
    
    /** Var to hold the data */
    $data = NULL;
    
    /** Need to get the account out of the Database */
    try {
        /** Initiate my database class */
        $db = new ikanspelwel\MyDatabase();
        
        /** Prepare Statement */
        $getAccount = $db->get_dbh()->prepare( 'SELECT * FROM `account` WHERE `user_id` = :user_id AND `account_id` = :account_id' );
        
        /** Execute Statement */
        $getAccount->execute( array(':user_id' => $_SESSION['user_id'], ':account_id' => $vars['account_id']) );
        
        /** Get the results */
        if($reference = $getAccount->fetch(PDO::FETCH_ASSOC)) {
            
            /** Massaging Data */
            $reference['active'] += 0; /** Converting to Numeric */
            
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