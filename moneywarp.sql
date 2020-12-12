-- phpMyAdmin SQL Dump
-- version 4.0.10.20
-- https://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Dec 12, 2020 at 08:58 PM
-- Server version: 5.5.68-MariaDB
-- PHP Version: 5.4.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `SDEV-435`
--

-- --------------------------------------------------------

--
-- Table structure for table `account`
--

CREATE TABLE IF NOT EXISTS `account` (
  `account_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `description` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  `type` enum('Checking','Savings') COLLATE utf8_unicode_ci NOT NULL DEFAULT 'Checking',
  `account_num` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `aba` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `active` int(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`account_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `account_entries`
--

CREATE TABLE IF NOT EXISTS `account_entries` (
  `account_entries_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `account_id` int(10) unsigned NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `date` date NOT NULL,
  `reconciled` int(1) NOT NULL DEFAULT '0',
  `type` enum('Deposit','Withdrawal','Transfer') COLLATE utf8_unicode_ci NOT NULL,
  `check_num` varchar(16) COLLATE utf8_unicode_ci NOT NULL,
  `payee_id` int(10) unsigned NOT NULL,
  `category_id` int(10) unsigned NOT NULL,
  `memo` text COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`account_entries_id`),
  KEY `account_id` (`account_id`),
  KEY `payee_id` (`payee_id`),
  KEY `category_id` (`category_id`),
  KEY `amount` (`amount`),
  KEY `reconciled` (`reconciled`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE IF NOT EXISTS `category` (
  `category_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `name` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `notes` text COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`category_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `current_account`
--

CREATE TABLE IF NOT EXISTS `current_account` (
  `user_id` int(10) unsigned NOT NULL,
  `account_id` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  KEY `account_id` (`account_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payee`
--

CREATE TABLE IF NOT EXISTS `payee` (
  `payee_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `name` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `notes` text COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`payee_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `user_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_name` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(512) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_name` (`user_name`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `warp_entry`
--

CREATE TABLE IF NOT EXISTS `warp_entry` (
  `warp_entry_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `account_id` int(10) unsigned NOT NULL,
  `amount` decimal(10,0) NOT NULL,
  `frequency` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `type` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `category_id` int(10) unsigned NOT NULL,
  `payee_id` int(10) unsigned NOT NULL,
  `memo` text COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`warp_entry_id`),
  KEY `account_id` (`account_id`),
  KEY `category_id` (`category_id`),
  KEY `payee_id` (`payee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `account`
--
ALTER TABLE `account`
  ADD CONSTRAINT `account_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `account_entries`
--
ALTER TABLE `account_entries`
  ADD CONSTRAINT `account_entries_ibfk_3` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `account_entries_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `account_entries_ibfk_2` FOREIGN KEY (`payee_id`) REFERENCES `payee` (`payee_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `category`
--
ALTER TABLE `category`
  ADD CONSTRAINT `category_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `current_account`
--
ALTER TABLE `current_account`
  ADD CONSTRAINT `current_account_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `current_account_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `payee`
--
ALTER TABLE `payee`
  ADD CONSTRAINT `payee_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `warp_entry`
--
ALTER TABLE `warp_entry`
  ADD CONSTRAINT `warp_entry_ibfk_3` FOREIGN KEY (`payee_id`) REFERENCES `payee` (`payee_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `warp_entry_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `warp_entry_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
