<?php
/** Set my namespace */
namespace ikanspelwel;

/**
 * @author ikanspelwel October 16th, 2020
 *
 * Class to handle connecting to the database and
 * returing a DB handle.
 *
 */
class MyDatabase {
	// Default hosts and user are stored in the php/config.php file.
    private $Host = DB_HOST;
	private $User = DB_USER;
	private $Pass = DB_PASSWORD;
	private $Database = DB_NAME;
	private $dbh, $sth;
	
	/**
	 * Default constructor, initiates connection to database. 
	 * By default with no overrides it connects to the db configured
	 * in the php/config.php file.
	 * 
	 * @param array $overrides
	 */
	public function __construct( $overrides = array() ) {
		if ( array_key_exists('Host', $overrides) && $overrides['Host'] ) {
			$this->Host= $overrides['Host'];
		}
		
		if ( array_key_exists('Database', $overrides) && $overrides['Database'] ) {
			$this->Database = $overrides['Database'];
		}

		if ( array_key_exists('User', $overrides) && $overrides['User'] ) {
			$this->User= $overrides['User'];
		}

		if ( array_key_exists('Pass', $overrides) && $overrides['Pass'] ) {
			$this->Pass= $overrides['Pass'];
		}
		
		// Now that all the Vars have been setup we will actually connect to the DB
		$this->dbh = new \PDO ( 'mysql:host=' . $this->Host . ';dbname='. $this->Database, $this->User, $this->Pass,
				array (\PDO::ATTR_PERSISTENT => true, \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION) );
		
	}
	

	/**
	 * @return the database handle
	 */
	public function get_dbh() {
		return $this->dbh;
	}
	
}