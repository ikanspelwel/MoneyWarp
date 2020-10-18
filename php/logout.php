<?php
/**
 * Loading all my classes
 */
require_once 'includePHP.php';

/** Initiate the Sessions class */
$mySession = new ikanspelwel\MySessions();

/**
 * Logout the session
 */
$mySession->Logout();

header("Location: ../");