<?php
/**
 * Primary Configuration file for Money Warp.
 * 
 * Follow the instructions indicated for each option below.
 * 
 */

/** Recipient of system emails */
define('ADMIN_EMAIL', 'adam@thelastbyte.com');

/** The systems email's from address */
define('FROM_ADDRESS', 'moneywarp@thelastbyte.com');

/** System email's from Name */ 
define('FROM_NAME', 'Money Warp');

/** MySQL hostname */
define('DB_HOST', 'localhost');

/** The name of the database for Money Warp */
define('DB_NAME', 'SDEV-435');

/** MySQL database username */
define('DB_USER', 'SDEV-435');

/** MySQL database password */
define('DB_PASSWORD', 'Put in your own password here.');

/**
 * System vars, don't modify anything below this line.
 */

/** Combining email vars from above for nice email formatting */
define('FORMATED_FROM', 'From: "'. FROM_NAME .'" <'. FROM_ADDRESS .'>');

/*
 * Making sure that the PHP session cookie is
 * only available via http method, and only
 * available over a secure connection.
 */
session_set_cookie_params(0, '/', $_SERVER['HTTP_HOST'], TRUE, TRUE);
