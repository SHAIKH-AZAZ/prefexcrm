<?php

defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Meta Lead API Service
 * 
 * Handles integration with Facebook/Instagram Lead Ads via Meta Graph API
 * Based on reference implementation in additions/nexus-crm/services/metaService.ts
 */
class Meta_lead_api
{
    private $CI;
    private $graph_api_version = 'v19.0';
    private $graph_api_base_url = 'https://graph.facebook.com';

    public function __construct()
    {
        $this->CI =& get_instance();
        $this->CI->load->model('leads_model');
    }

    /**
     * Validate Meta API connection
     * 
     * @param string $page_id Facebook Page ID
     * @param string $access_token Graph API Access Token
     * @return array ['success' => bool, 'message' => string, 'data' => mixed]
     */
    public function validate_connection($page_id, $access_token)
    {
        if (empty($page_id) || empty($access_token)) {
            return [
                'success' => false,
                'message' => 'Page ID and Access Token are required',
                'data' => null
            ];
        }

        $url = $this->graph_api_base_url . '/' . $this->graph_api_version . '/' . $page_id;
        $url .= '?access_token=' . urlencode($access_token) . '&fields=id,name';

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if (!$response) {
            return [
                'success' => false,
                'message' => 'Failed to connect to Meta API',
                'data' => null
            ];
        }

        $data = json_decode($response, true);

        if (isset($data['error'])) {
            return [
                'success' => false,
                'message' => 'Meta API Error: ' . $data['error']['message'],
                'data' => $data['error']
            ];
        }

        if ($http_code === 200 && isset($data['id']) && $data['id'] === $page_id) {
            return [
                'success' => true,
                'message' => 'Connection successful! Page: ' . $data['name'],
                'data' => $data
            ];
        }

        return [
            'success' => false,
            'message' => 'Invalid credentials or page not found',
            'data' => null
        ];
    }

    /**
     * Fetch leads from Meta Graph API
     * 
     * @param string $page_id Facebook Page ID
     * @param string $access_token Graph API Access Token
     * @return array ['success' => bool, 'leads' => array, 'error' => string]
     */
    public function fetch_leads($page_id, $access_token)
    {
        $url = $this->graph_api_base_url . '/' . $this->graph_api_version . '/' . $page_id . '/leads';
        $url .= '?access_token=' . urlencode($access_token) . '&fields=created_time,id,field_data';

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);

        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if (!$response) {
            return [
                'success' => false,
                'leads' => [],
                'error' => 'Failed to fetch leads from Meta API'
            ];
        }

        $data = json_decode($response, true);

        if (isset($data['error'])) {
            return [
                'success' => false,
                'leads' => [],
                'error' => 'Meta API Error: ' . $data['error']['message']
            ];
        }

        if ($http_code === 200 && isset($data['data'])) {
            return [
                'success' => true,
                'leads' => $data['data'],
                'error' => null
            ];
        }

        return [
            'success' => false,
            'leads' => [],
            'error' => 'Unexpected API response'
        ];
    }

    /**
     * Synchronize leads from Meta to Perfex CRM
     * 
     * @param int|null $staff_id Staff member triggering the sync (null for cron)
     * @param string $trigger Type of trigger: 'manual', 'cron', 'webhook'
     * @return array Sync results
     */
    public function sync_leads($staff_id = null, $trigger = 'manual')
    {
        $start_time = time();
        
        // Check if Meta API is configured
        $page_id = get_option('meta_api_page_id');
        $access_token = get_option('meta_api_access_token');
        
        if (empty($page_id) || empty($access_token)) {
            return [
                'success' => false,
                'message' => 'Meta API is not configured',
                'leads_imported' => 0,
                'leads_skipped' => 0
            ];
        }

        // Fetch leads from Meta
        $fetch_result = $this->fetch_leads($page_id, $access_token);
        
        if (!$fetch_result['success']) {
            $this->log_sync($start_time, 'error', 0, 0, 0, $fetch_result['error'], $trigger, $staff_id);
            return [
                'success' => false,
                'message' => $fetch_result['error'],
                'leads_imported' => 0,
                'leads_skipped' => 0
            ];
        }

        $meta_leads = $fetch_result['leads'];
        $imported_count = 0;
        $skipped_count = 0;
        $errors = [];

        foreach ($meta_leads as $meta_lead) {
            try {
                $result = $this->import_single_lead($meta_lead);
                if ($result['imported']) {
                    $imported_count++;
                } else {
                    $skipped_count++;
                }
            } catch (Exception $e) {
                $errors[] = 'Lead ID ' . $meta_lead['id'] . ': ' . $e->getMessage();
                $skipped_count++;
            }
        }

        $status = empty($errors) ? 'success' : (($imported_count > 0) ? 'partial' : 'error');
        $error_message = empty($errors) ? null : implode('; ', $errors);
        
        $this->log_sync($start_time, $status, count($meta_leads), $imported_count, $skipped_count, $error_message, $trigger, $staff_id);
        
        // Update last sync time
        update_option('meta_api_last_sync', date('Y-m-d H:i:s'));

        return [
            'success' => true,
            'message' => sprintf('Sync completed. Imported: %d, Skipped: %d', $imported_count, $skipped_count),
            'leads_fetched' => count($meta_leads),
            'leads_imported' => $imported_count,
            'leads_skipped' => $skipped_count,
            'errors' => $errors
        ];
    }

    /**
     * Import a single lead from Meta to Perfex CRM
     * 
     * @param array $meta_lead Lead data from Meta API
     * @return array ['imported' => bool, 'lead_id' => int|null]
     */
    private function import_single_lead($meta_lead)
    {
        $external_id = 'meta_' . $meta_lead['id'];
        
        // Check if lead already exists
        $existing = $this->CI->leads_model->get_lead_by_external_id($external_id);
        if ($existing) {
            return ['imported' => false, 'lead_id' => $existing->id, 'reason' => 'duplicate'];
        }

        // Map Meta lead to CRM format
        $crm_lead = $this->map_meta_lead_to_crm($meta_lead);
        
        // Add lead to database
        $lead_id = $this->CI->leads_model->add_from_meta($crm_lead);
        
        if ($lead_id) {
            // Log activity
            $this->CI->leads_model->log_lead_activity(
                $lead_id,
                'Lead automatically imported from Meta Lead Ads',
                true
            );
            
            return ['imported' => true, 'lead_id' => $lead_id];
        }

        return ['imported' => false, 'lead_id' => null, 'reason' => 'import_failed'];
    }

    /**
     * Map Meta lead data to Perfex CRM lead format
     * 
     * @param array $meta_lead Lead from Meta API
     * @return array CRM-compatible lead data
     */
    private function map_meta_lead_to_crm($meta_lead)
    {
        $field_data = isset($meta_lead['field_data']) ? $meta_lead['field_data'] : [];
        
        // Helper function to extract field value
        $get_field = function($name) use ($field_data) {
            foreach ($field_data as $field) {
                if (isset($field['name']) && $field['name'] === $name) {
                    return isset($field['values'][0]) ? $field['values'][0] : '';
                }
            }
            return '';
        };

        // Extract common fields
        $full_name = $get_field('full_name') ?: $get_field('name');
        if (empty($full_name)) {
            $first_name = $get_field('first_name');
            $last_name = $get_field('last_name');
            $full_name = trim($first_name . ' ' . $last_name);
        }
        if (empty($full_name)) {
            $full_name = 'Meta Lead';
        }

        $email = $get_field('email') ?: $get_field('email_address');
        $phone = $get_field('phone_number') ?: $get_field('phone');
        $company = $get_field('company') ?: $get_field('company_name');
        $website = $get_field('website');
        $city = $get_field('city');
        $state = $get_field('state') ?: $get_field('province');
        $country = $get_field('country');
        $zip = $get_field('zip') ?: $get_field('postal_code');

        // Get Facebook source ID
        $facebook_source = $this->CI->db->query("SELECT id FROM tblleads_sources WHERE name = 'Facebook'")->row();
        $source_id = $facebook_source ? $facebook_source->id : get_option('leads_default_source');

        // Get default status
        $default_status = get_option('leads_default_status');

        $crm_lead = [
            'external_id' => 'meta_' . $meta_lead['id'],
            'imported_from' => 'meta_api',
            'name' => $full_name,
            'email' => $email,
            'phonenumber' => $phone,
            'company' => $company,
            'website' => $website,
            'city' => $city,
            'state' => $state,
            'country' => $country,
            'zip' => $zip,
            'source' => $source_id,
            'status' => $default_status,
            'dateadded' => isset($meta_lead['created_time']) ? date('Y-m-d H:i:s', strtotime($meta_lead['created_time'])) : date('Y-m-d H:i:s'),
            'description' => 'Lead imported from Meta Lead Ads on ' . date('Y-m-d H:i:s'),
            'is_public' => 0,
            'contacted_today' => 0,
            'addedfrom' => 0 // System added
        ];

        return $crm_lead;
    }

    /**
     * Log sync activity
     */
    private function log_sync($start_time, $status, $fetched, $imported, $skipped, $error, $trigger, $staff_id)
    {
        $duration = time() - $start_time;
        
        $this->CI->db->insert('tblmeta_sync_log', [
            'sync_date' => date('Y-m-d H:i:s'),
            'status' => $status,
            'leads_fetched' => $fetched,
            'leads_imported' => $imported,
            'leads_skipped' => $skipped,
            'error_message' => $error,
            'sync_duration' => $duration,
            'triggered_by' => $trigger,
            'staff_id' => $staff_id
        ]);
    }
}
