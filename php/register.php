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
    case 'getRegisterFormItems':
        GetRegisterFormItems($_REQUEST);
        break;
    case 'addUpdateRegisterEntry':
        AddUpdateRegisterEntry($_REQUEST);
        break;
    case 'getRegister':
        GetRegister($_REQUEST);
        break;
    case 'addUpdate':
        AddUpdate($_REQUEST);
        break;
    default:
        /** If an action couldn't be found, toss an exception message. */
        throw new Exception('Unknown/Invalid option!');
}

/**
 * Function to return all the register entries
 * from the database.
 * 
 * @param array $vars passing the $_REQUEST vars in
 */
function GetRegister($vars) {
    /** Making my global var accessible to this function */
    global $mySession, $myReturn, $errors, $debug;
    
    /** Var to hold all the data */
    $data = array();
    
    /** Var to hold the balance total */
    $balance = 0;
 
    /** Need to get all the registry entries out of the Database */
    try {
        /** Initiate my database class */
        $db = new ikanspelwel\MyDatabase();
        
        /** Prepare Statement */
        $getAccountEntries = $db->get_dbh()->prepare( 'SELECT `account_entries_id`, `amount`, `account_entries`.`type`, date, DATE_FORMAT(`date`, "%b %e, %Y") AS `displayDate`, `check_num`, `payee_id`, `payee`.`name`, `category_id`, `memo` FROM `account_entries` LEFT JOIN `account` USING(`account_id`) LEFT JOIN `payee` USING(`payee_id`) WHERE `account_id` = :account_id AND `account`.`user_id` = :user_id ORDER BY `date`, `account_entries_id`' );
        
        /** Execute Statement */
        $getAccountEntries->execute( array(':user_id' => $_SESSION['user_id'], ':account_id' => $vars['account_id']) );
        
        /** Get the results */
        while ($reference = $getAccountEntries->fetch(PDO::FETCH_ASSOC)) {
            /** Massaging Data */
            $balance += $reference['amount'];
            $reference['balance'] = sprintf("%.2f", $balance);
            $reference['check_num'] = ($reference['check_num'] ? $reference['check_num'] : 'n/a');
            
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
    $myReturn->json( array('data' => $data, 'error' => $errors->getString('<br />')) );
}

/**
 * Function to add a new registry entry to the database.
 * This function will first verify all the data is 
 * acceptable, and then process the add.
 * 
 * @param array $vars passing the $_REQUEST vars in
 */
function AddUpdateRegisterEntry($vars) {
    /** Making my global var accessible to this function */
    global $mySession, $myReturn, $errors, $debug;
    
    /** Var to hold all the data */
    $data = array();
    
    /** Database initialization and preparing statements */
    try {
        /** Initiate my database class */
        $db = new ikanspelwel\MyDatabase();
        
        /** Prepare Statements */
        $verifyAccount = $db->get_dbh()->prepare( 'SELECT `account_id` FROM `account` WHERE `user_id` = :user_id AND `account_id` = :account_id' );
        $verifyAccountEntry = $db->get_dbh()->prepare( 'SELECT `account_entries_id` FROM `account_entries` LEFT JOIN `account` USING(`account_id`)  WHERE `user_id` = :user_id AND `account_entries_id` = :account_entries_id' );
        $verifyPayee = $db->get_dbh()->prepare( 'SELECT `payee_id` FROM `payee` WHERE `payee_id` = :payee_id AND `user_id` = :user_id' );
        $verifyCategory = $db->get_dbh()->prepare( 'SELECT `category_id` FROM `category` WHERE `category_id` = :category_id AND `user_id` = :user_id' );
        $accountEntryAdd = $db->get_dbh()->prepare( 'INSERT INTO `account_entries` (`account_id`, `amount`, `date`, `type`, `check_num`, `payee_id`, `category_id`, `memo`) VALUES(:account_id, :amount, :date, :type, :check_num, :payee_id, :category_id, :memo)' );
        $accountEntryUpdate = $db->get_dbh()->prepare( 'UPDATE `account_entries` SET `account_id` = :account_id, `amount` = :amount, `date` = :date, `type` = :type, `check_num` = :check_num, `payee_id` = :payee_id, `category_id` = :category_id, `memo` = :memo WHERE `account_entries_id` = :account_entries_id' );
        
    } catch (Exception $e) {
        /** If any exception occurred report it */
        mail(ADMIN_EMAIL, 'MySQL PDO Error', $e->getMessage() .' in '. __FILE__ ." on line ". __LINE__, FORMATED_FROM, '-f'. FROM_ADDRESS);
        $myReturn->json( array('error' => "A system error has occurred, please refresh and try again. If this error persists please report it.") );
    }
    
    /**
     * 
     * Data Verification
     * 
     */
    
    /** Verifying the account_id */
    try {
        /** Execute Statement */
        $verifyAccount->execute( array(':user_id' => $_SESSION['user_id'], ':account_id' => $vars['account_id']) );
        
        /** Get the results */
        list($db_account_id) = $verifyAccount->fetch(PDO::FETCH_NUM);
        
    } catch (Exception $e) {
        /** If any exception occurred report it */
        mail(ADMIN_EMAIL, 'MySQL PDO Error', $e->getMessage() .' in '. __FILE__ ." on line ". __LINE__, FORMATED_FROM, '-f'. FROM_ADDRESS);
        $myReturn->json( array('error' => "A system error has occurred, please refresh and try again. If this error persists please report it.") );
    }
    
    /** Verifying that the provided account_id was found in the db. */
    if($vars['account_id'] != $db_account_id) {
        $errors->ErrorMsg(' - Invalid Account, please select one from the pull down list.');
    }

    /** Checking to see if this is an update */
    if($vars['account_entries_id']) {
        /** Verifying the account_entries_id */
        try {
            /** Execute Statement */
            $verifyAccountEntry->execute( array(':user_id' => $_SESSION['user_id'], ':account_entries_id' => $vars['account_entries_id']) );
            
            /** Get the results */
            list($db_account_entries_id) = $verifyAccountEntry->fetch(PDO::FETCH_NUM);
            
        } catch (Exception $e) {
            /** If any exception occurred report it */
            mail(ADMIN_EMAIL, 'MySQL PDO Error', $e->getMessage() .' in '. __FILE__ ." on line ". __LINE__, FORMATED_FROM, '-f'. FROM_ADDRESS);
            $myReturn->json( array('error' => "A system error has occurred, please refresh and try again. If this error persists please report it.") );
        }
        
        /** Verifying that the provided account_id was found in the db. */
        if($vars['account_entries_id'] != $db_account_entries_id) {
            $errors->ErrorMsg(' - Invalid Registry Entry, please refresh and try again.');
        }
    }
    
    /** Verifying Type */
    if($vars['type'] != 'Deposit' && $vars['type'] != 'Withdrawal' && $vars['type'] != 'Transfer') {
        $errors->ErrorMsg(' - Please select a Type from the pull down list.');
    }
    
    /** Verifying Payee */
    if(!array_key_exists('payee_id', $vars) || !$vars['payee_id'] || $vars['payee_id'] < 1) {
        $errors->ErrorMsg(' - Please select a Payee from the pull down list.');
    } else {
        /** Need to verify this payee exists in the Database */
        try {
            /** Execute Statement */
            $verifyPayee->execute( array(':user_id' => $_SESSION['user_id'], ':payee_id' => $vars['payee_id']) );
            
            /** Get the results */
            list($db_payee_id) = $verifyPayee->fetch(PDO::FETCH_NUM);
            
        } catch (Exception $e) {
            /** If any exception occurred report it */
            mail(ADMIN_EMAIL, 'MySQL PDO Error', $e->getMessage() .' in '. __FILE__ ." on line ". __LINE__, FORMATED_FROM, '-f'. FROM_ADDRESS);
            $myReturn->json( array('error' => "A system error has occurred, please refresh and try again. If this error persists please report it.") );
        }
        
        /** Verifying that the provided payee_id was found in the db. */
        if($vars['payee_id'] != $db_payee_id) {
            $errors->ErrorMsg(' - Invalid Payee, please select one from the pull down list.');
        }
    }
    
    /** Verifying Category */
    if(!array_key_exists('category_id', $vars) || !$vars['category_id'] || $vars['category_id'] < 1) {
        $errors->ErrorMsg(' - Please select a Category from the pull down list.');
    } else {
        /** Need to verify this category exists in the Database */
        try {
            /** Execute Statement */
            $verifyCategory->execute( array(':user_id' => $_SESSION['user_id'], ':category_id' => $vars['category_id']) );
            
            /** Get the results */
            list($db_category_id) = $verifyCategory->fetch(PDO::FETCH_NUM);
            
        } catch (Exception $e) {
            /** If any exception occurred report it */
            mail(ADMIN_EMAIL, 'MySQL PDO Error', $e->getMessage() .' in '. __FILE__ ." on line ". __LINE__, FORMATED_FROM, '-f'. FROM_ADDRESS);
            $myReturn->json( array('error' => "A system error has occurred, please refresh and try again. If this error persists please report it.") );
        }
        
        /** Verifying that the provided category_id was found in the db. */
        if($vars['category_id'] != $db_category_id) {
            $errors->ErrorMsg(' - Invalid Category, please select one from the pull down list.');
        }
    }
    
    
    /** Verifying Date */
    if($vars['date'] == '') {
        $errors->ErrorMsg(' - Please provide a Date.');
    } else if(!preg_match("/^[0-9]{4,4}-[0-9]{2,2}-[0-9]{2,2}$/", $vars['date'])) {
        $errors->ErrorMsg(' - Date is not valid, please use the date picker to provide the date.');
    }
    
    /** Verifying Check Number */
    if(strlen($vars['check_num']) > 16) {
        $errors->ErrorMsg(' - Check Number cannont exceed 16 charactors.');
    }
    
    /** Removing any "," or "$" from the amount var */
    $vars['amount'] = preg_replace('/[$,]/', '', $vars['amount']);
    
    /** Verifying Amount */
    if($vars['amount'] == '') {
        $errors->ErrorMsg(' - Please provide an Amount.');
    } else if(!preg_match("/^[0-9]*(\.([0-9]{1,2})?)?$/", $vars['amount'])) {
        $errors->ErrorMsg(' - Amount is invalid, amount must be a number with no more than two decimal places, ie $1.00');
    }

    /** Checking to see if any errors were found */
    if($errors->ErrorMsg()) {
        /** If there were any errors */
        
        /** Returning data via json */
        $myReturn->json( array('error' => $errors->getString('<br />')) );
    }
    
    /**
     *
     * Done all Data Verification
     * 
     * We are now good to proceed with an insert/update.
     *
     */

    /** Converting Amount into a float */
    $vars['amount'] += 0.00;
    
    /** Converting Withdrawls into negative numbers */
    if($vars['type'] == 'Withdrawal') {
        $vars['amount'] *= -1;
    }    
    
    /**
     * Inserting or Updating the data in the database
     */
    try {
        
        /** Checking to see if this is an update */
        if($vars['account_entries_id']) {
         
            $accountEntryUpdate->execute( array(':account_id' => $vars['account_id'], ':amount' => $vars['amount'], ':date' => $vars['date'], ':type' => $vars['type'], ':check_num' => $vars['check_num'], ':payee_id' => $vars['payee_id'], ':category_id' => $vars['category_id'], ':memo' => $vars['memo'], ':account_entries_id' => $vars['account_entries_id']) );
            
        } else {
            
            /** Execute Statement */
            $accountEntryAdd->execute( array(':account_id' => $vars['account_id'], ':amount' => $vars['amount'], ':date' => $vars['date'], ':type' => $vars['type'], ':check_num' => $vars['check_num'], ':payee_id' => $vars['payee_id'], ':category_id' => $vars['category_id'], ':memo' => $vars['memo']) );
            
            /** Checking for affected rows */
            if($accountEntryAdd->rowCount() != 1) {
                /**
                 * No rows were inserted, this shouldn't normally ever happen.
                 */
                $errors->ErrorMsg(' - Unable to add new account entry, please try again.');
            } else {
                $data['success'] = TRUE;
            }
            
        }
        
    } catch (Exception $e) {
        /** If any exception occurred report it */
        mail(ADMIN_EMAIL, 'MySQL PDO Error', $e->getMessage() .' in '. __FILE__ ." on line ". __LINE__, FORMATED_FROM, '-f'. FROM_ADDRESS);
        $myReturn->json( array('error' => "A system error has occurred, please refresh and try again. If this error persists please report it.") );
    }
    
    /** Returning data via json */
    $myReturn->json( array('data' => $data, 'error' => $errors->getString('<br />')) );
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
    $myReturn->json( array('error' => $errors->getString('<br/>')) );
}

/**
 * Function to return the payees and Categories to
 * populate the pull down fields in the account 
 * register form.
 * 
 * Data will be returned via json
 * 
 * @param array $vars passing the $_REQUEST vars in
 */
function GetRegisterFormItems($vars) {
    /** Making my global var accessible to this function */
    global $mySession, $myReturn, $errors, $debug;
    
    /** Var to hold the data */
    $data = array('payees' => array(), 'categories' => array());
    
    /** Need to get the payee out of the Database */
    try {
        /** Initiate my database class */
        $db = new ikanspelwel\MyDatabase();
        
        /** Prepare Statement */
        $getPayees = $db->get_dbh()->prepare( 'SELECT `payee_id`, `name` FROM `payee` WHERE `user_id` = :user_id ORDER BY `name`' );
        $getCategories = $db->get_dbh()->prepare( 'SELECT `category_id`, `name` FROM `category` WHERE `user_id` = :user_id ORDER BY `name`' );
        
        /** Execute Statement */
        $getPayees->execute( array(':user_id' => $_SESSION['user_id']) );
        $getCategories->execute( array(':user_id' => $_SESSION['user_id']) );
        
        /** Get the results */
        while ($reference = $getPayees->fetch(PDO::FETCH_ASSOC)) {
            /** Storing each returned row in the data var */
            $data['payees'][] = $reference;
        }
        
        /** Get the results */
        while ($reference = $getCategories->fetch(PDO::FETCH_ASSOC)) {
            /** Storing each returned row in the data var */
            $data['categories'][] = $reference;
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
