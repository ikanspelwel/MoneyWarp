-- phpMyAdmin SQL Dump
-- version 4.0.10.20
-- https://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Oct 03, 2020 at 02:12 PM
-- Server version: 5.5.65-MariaDB
-- PHP Version: 5.4.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

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
  `description` varchar(128) NOT NULL,
  `type` enum('Checking','Savings') NOT NULL DEFAULT 'Checking',
  `account_num` varchar(64) NOT NULL,
  `aba` varchar(64) NOT NULL,
  `active` int(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`account_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `account_entries`
--

CREATE TABLE IF NOT EXISTS `account_entries` (
  `account_entries_id` int(10) unsigned NOT NULL,
  `account_id` int(10) unsigned NOT NULL,
  `amount` decimal(10,0) NOT NULL,
  `date` date NOT NULL,
  `reconciled` int(1) NOT NULL,
  `type` varchar(32) NOT NULL,
  `check_num` varchar(16) NOT NULL,
  `payee_id` int(10) unsigned NOT NULL,
  `category_id` int(10) unsigned NOT NULL,
  `memo` text NOT NULL,
  PRIMARY KEY (`account_entries_id`),
  KEY `account_id` (`account_id`),
  KEY `payee_id` (`payee_id`),
  KEY `category_id` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE IF NOT EXISTS `category` (
  `category_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `description` varchar(256) NOT NULL,
  `notes` text NOT NULL,
  PRIMARY KEY (`category_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `payee`
--

CREATE TABLE IF NOT EXISTS `payee` (
  `payee_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `description` varchar(256) NOT NULL,
  `notes` text NOT NULL,
  PRIMARY KEY (`payee_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `user_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_name` varchar(32) NOT NULL,
  `password` varchar(128) NOT NULL,
  `name` varchar(256) NOT NULL,
  `email` varchar(512) NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `warp_entry`
--

CREATE TABLE IF NOT EXISTS `warp_entry` (
  `warp_entry_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `account_id` int(10) unsigned NOT NULL,
  `amount` decimal(10,0) NOT NULL,
  `frequency` varchar(64) NOT NULL,
  `start_date` date NOT NULL,
  `type` varchar(32) NOT NULL,
  `category_id` int(10) unsigned NOT NULL,
  `payee_id` int(10) unsigned NOT NULL,
  `memo` text NOT NULL,
  PRIMARY KEY (`warp_entry_id`),
  KEY `account_id` (`account_id`),
  KEY `category_id` (`category_id`),
  KEY `payee_id` (`payee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `account`
--
ALTER TABLE `account`
  ADD CONSTRAINT `account_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON UPDATE CASCADE;

--
-- Constraints for table `account_entries`
--
ALTER TABLE `account_entries`
  ADD CONSTRAINT `account_entries_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `account_entries_ibfk_2` FOREIGN KEY (`payee_id`) REFERENCES `payee` (`payee_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `account_entries_ibfk_3` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`) ON UPDATE CASCADE;

--
-- Constraints for table `category`
--
ALTER TABLE `category`
  ADD CONSTRAINT `category_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `payee`
--
ALTER TABLE `payee`
  ADD CONSTRAINT `payee_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `warp_entry`
--
ALTER TABLE `warp_entry`
  ADD CONSTRAINT `warp_entry_ibfk_3` FOREIGN KEY (`payee_id`) REFERENCES `payee` (`payee_id`),
  ADD CONSTRAINT `warp_entry_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `warp_entry_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`);
