<?php
/** Set my namespace */
namespace ikanspelwel;

/**
 * @author ikanspelwel October 10th, 2020
 *
 * Class to handle the returning of json to the browser. 
 *
 */
class MyReturnJson {
    /**
     * This fuction will return the actual json to the browser.
     *
     * @param mixed $Return Data Structure to encode and return.
     */
    public function json($Return = NULL) {
        // If the $Return var isn't set, set it.
        if($Return == NULL) {
            $Return = array();
        }
        
        // We'll be outputting json
        header("Cache-Control: no-cache, must-revalidate");
        header("Pragma: no-cache");
        header('Content-type: application/json');
        
        // Echo/Return the json encoded var.
        echo json_encode( $Return );
        
        // and now stop execution.
        exit;
    }
    
}

