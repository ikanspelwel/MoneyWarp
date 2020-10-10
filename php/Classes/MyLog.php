<?php
/** Set my namespace */
namespace ikanspelwel;

/**
 * @author ikanspelwel October 10th, 2020
 *
 * Class to write out messages to the php error log. This function can be very handy
 * to debug json return items where you can't output anything to the screen because
 * it will disturb the json response.
 *
 */
class MyLog {
    /**
     * This function can be used to output information
     * into the logs without disturbing the json
     * return to the browser.
     *
     * @param mixed $data Data Structure to dump to logs.
     */
    public function errorLog($data) {
        $LogMsg = "******************************* Start **********************************************\n";
            ob_start();
            var_dump($data);
            $LogMsg .= ob_get_clean();
        $LogMsg .= "******************************** End ***********************************************";
        
        foreach(explode("\n", $LogMsg) as $EachLine) {
            error_log($EachLine);
        }
    }
    
}

