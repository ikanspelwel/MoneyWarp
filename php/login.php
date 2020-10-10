<?php
/**
 * Loading all my classes
 */
require_once 'includePHP.php';


$mySession = new ikanspelwel\MySessions();

//$mySession->Login('10');
//$mySession->Logout();

echo "<pre>";
echo PHP_EOL;
if( $mySession->Active() ){
    echo 'Valid/Active Session - User ID: '. $_SESSION['userId'] . PHP_EOL;
} else {
    echo 'Invalid/Inactive Session'. PHP_EOL;
}
echo PHP_EOL;
echo DB_NAME .PHP_EOL;
echo DB_USER .PHP_EOL;
echo DB_PASSWORD .PHP_EOL;
echo DB_HOST .PHP_EOL;
echo "</pre>";

