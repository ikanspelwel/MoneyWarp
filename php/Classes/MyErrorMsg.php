<?php
/** Set my namespace */
namespace ikanspelwel;

/**
 * @author ikanspelwel October 10th, 2020
 *
 * Class to save and retrieve and test for existing
 * error messages.
 *
 */
class MyErrorMsg {
    /** Var to hold all of our error messages */
    private $error;
    
    /**
     * Default constructor for this class. 
     * It sets the intial error var to an 
     * empty array.
     */
    public function __construct() {
        $this->error = array();
    }
    
    /**
     * Generic call to view this class as a string.
     * 
     * @return string error messages represented as a string.
     */
    public function __toString() {
        return $this->getString();
    }
    
    /**
     * Return the error array as strings seperated by
     * the provided delimiter. If no delimiter is provided
     * it will default to a "\n"
     * 
     * @param string $delimiter optional delimiter to override the default "\n"
     * @return string all the errors in the array, concatenated together.
     */
    public function getString($delimiter = "\n") {
        return implode($delimiter, $this->error);
    }
    
    
    /**
     * Function to create or append to the error log.
     *
     * This should cover all scenarios and avoid all
     * errors and warnings in the logs. With no arguments
     * it will return true/false if an error has been set.
     *
     * @param string $Msg the error to add to the error message.
     * @return boolean returns if an error exists or not.
     */
    public function ErrorMsg($Msg = NULL) {
        
        // If there isn't a message provided simply
        // return if there is an error set or not.
        if(!$Msg) {
            return $this->Exists();
        }
        
        // Checking if we already have an error not, so we know to append or create.
        if( $this->Exists() ) {
            $this->error[] = $Msg;
        } else {
            $this->error = array($Msg);
        }
        
        // Return that there is a error set.
        return true;
    }
    
    /**
     * Simple function to if there are errors 
     * present in the array or not.
     * 
     * @return boolean true if there are errors, false if there are none.
     */
    private function Exists() {
        return (count($this->error) != 0);
    }
    
}

