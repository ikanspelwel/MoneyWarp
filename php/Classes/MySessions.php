<?php
/** Set my namespace */
namespace ikanspelwel;

/**
 * @author ikanspelwel October 10th, 2020
 * 
 * Class to do all the heavy lifting for session management. 
 * 
 */
class MySessions {
    /**
     * Default constructor that takes no arguments
     */
    public function __construct() {
        /**
         * Starting a new session if one doesn't exist
         * or grabing the existing session if one already exists.
         */
        @session_start();
    }
    
    /**
     * Function to securely setup a new session. This
     * function does not do any user validation etc. so
     * this should only be called after the user has
     * been validated by other means.
     * 
     * @param int $userId
     */
    public function Login($userId) {
        /**
         * When first loging in we will getting a new session ID
         * to prevent Session Fixation.
         */
        session_regenerate_id(); 

        /**
         * Storing the users user id, which is the 
         * primary means of associating everything 
         * within this application.
         */
        $_SESSION['userId'] = $userId;        
        
        /**
         * Generating and storing a new random value, that we can 
         * store in a cookie and a session var to use as a second
         * layer of session validation/checking.
         * 
         * Cookie is only available to the http method via secure
         * connections.
         */        
        $_SESSION['Unique'] = md5(uniqid(rand(), true));
        setcookie('UniqueCookie', $_SESSION['Unique'], 0, '/', $_SERVER['HTTP_HOST'], TRUE, TRUE);
    }
    
    /**
     * Function to clean up and remove an active session.
     * This will remove all session vars from the server
     * and delete the two cookies used for this session.
     */
    public function Logout(){
        
        /**
         * Removing all the vars in the session by 
         * setting it to an empty array.
         */
        $_SESSION = array();
        
        /** 
         * Removing the session cookie and my 
         * unique cookie by expiring them.
         */
        if( array_key_exists(session_name(), $_COOKIE) ) {
            setcookie(session_name(), '', time() - 3600, '/');
        }
        if( array_key_exists('UniqueCookie', $_COOKIE) ) {
            setcookie('UniqueCookie', '', time() - 3600, '/', $_SERVER['HTTP_HOST'], TRUE, TRUE);
        }
        
        /**
         * Finally destroying this session so that it 
         * cannot be reused.
         */
        session_destroy();
    }
    
    
    /**
     * Function to verify the session is still active 
     * and valid. Will return TRUE on valid session
     * and FALSE for any invalid session. 
     * 
     * *** NOTE: Make sure you don't try and call this immediately 
     * after calling the Login() function, as the newly set cookie 
     * 'UniqueCookie' is not available until the next page refresh
     * and would return an invalid session because of it. ***
     * 
     * @return boolean TRUE if session is good FALSE otherwise.
     */
    public function Active() {
        
        if(array_key_exists('userId', $_SESSION) && $_SESSION['userId']) {
            //TODO verify the userid exists in the database
        } else {
            // Return invalid session
            return FALSE;
        }
        
        
        /**
         * Checking that our unique cookie matches the 
         * corresponding sesson variable. 
         */
        if($_SESSION['Unique'] != $_COOKIE['UniqueCookie']) {
            // Return invalid session
            return FALSE;
        }
        
        /**
         * If we have gotten here then the session is still
         * valid and we should return true.
         */      
        return TRUE;
    }
    
}