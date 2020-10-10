<?php
/**
 * Loading our Global Config File
 */
require_once 'config.php';

/**
 * Looping through all files in the Classes folder
 * and require_once on all .php files found 
 */
foreach(scandir('Classes') as $classFiles) {
    if(preg_match('/.php$/', $classFiles)) {
        require_once 'Classes/'. $classFiles;
    }
}