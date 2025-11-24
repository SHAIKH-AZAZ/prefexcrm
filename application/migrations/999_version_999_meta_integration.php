<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Migration_Version_999_meta_integration extends CI_Migration
{
    function __construct()
    {
        parent::__construct();
    }

    public function up()
    {
        // Add Meta API configuration options
        add_option('meta_api_enabled', '0');
        add_option('meta_api_page_id', '');
        add_option('meta_api_access_token', '');
        add_option('meta_api_last_sync', '');
        add_option('meta_api_auto_sync_enabled', '1');
        add_option('meta_api_sync_interval', '3600'); // 1 hour in seconds

        // Add columns to tblleads for tracking Meta-imported leads
        $this->db->query("ALTER TABLE `tblleads` ADD `external_id` VARCHAR(255) NULL DEFAULT NULL AFTER `id`;");
        $this->db->query("ALTER TABLE `tblleads` ADD `imported_from` VARCHAR(50) NULL DEFAULT NULL AFTER `external_id`;");
        
        // Add index on external_id for faster lookups
        $this->db->query("ALTER TABLE `tblleads` ADD INDEX `idx_external_id` (`external_id`);");
        $this->db->query("ALTER TABLE `tblleads` ADD INDEX `idx_imported_from` (`imported_from`);");

        // Create Meta sync log table
        $this->db->query("CREATE TABLE IF NOT EXISTS `tblmeta_sync_log` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `sync_date` datetime NOT NULL,
            `status` enum('success','error','partial') NOT NULL DEFAULT 'success',
            `leads_fetched` int(11) NOT NULL DEFAULT '0',
            `leads_imported` int(11) NOT NULL DEFAULT '0',
            `leads_skipped` int(11) NOT NULL DEFAULT '0',
            `error_message` text DEFAULT NULL,
            `sync_duration` int(11) DEFAULT NULL COMMENT 'Duration in seconds',
            `triggered_by` enum('manual','cron','webhook') NOT NULL DEFAULT 'manual',
            `staff_id` int(11) DEFAULT NULL,
            PRIMARY KEY (`id`),
            INDEX `idx_sync_date` (`sync_date`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;");

        // Check if Facebook source exists, if not create it
        $facebook_source = $this->db->query("SELECT id FROM tblleads_sources WHERE name = 'Facebook'")->row();
        if (!$facebook_source) {
            $this->db->query("INSERT INTO `tblleads_sources` (`name`) VALUES ('Facebook');");
        }
        
        $instagram_source = $this->db->query("SELECT id FROM tblleads_sources WHERE name = 'Instagram'")->row();
        if (!$instagram_source) {
            $this->db->query("INSERT INTO `tblleads_sources` (`name`) VALUES ('Instagram');");
        }
    }

    public function down()
    {
        // Remove Meta API options
        $this->db->query("DELETE FROM `tbloptions` WHERE `name` IN ('meta_api_enabled', 'meta_api_page_id', 'meta_api_access_token', 'meta_api_last_sync', 'meta_api_auto_sync_enabled', 'meta_api_sync_interval');");
        
        // Remove columns from tblleads
        $this->db->query("ALTER TABLE `tblleads` DROP INDEX `idx_external_id`;");
        $this->db->query("ALTER TABLE `tblleads` DROP INDEX `idx_imported_from`;");
        $this->db->query("ALTER TABLE `tblleads` DROP COLUMN `external_id`;");
        $this->db->query("ALTER TABLE `tblleads` DROP COLUMN `imported_from`;");
        
        // Drop sync log table
        $this->db->query("DROP TABLE IF EXISTS `tblmeta_sync_log`;");
    }
}
