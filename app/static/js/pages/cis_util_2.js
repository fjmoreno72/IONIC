/**
 * CIS Plan Utilities 2.0
 * 
 * Common utility functions for the CIS Plan 2.0 components.
 */

const CISUtil2 = {
    /**
     * Get the appropriate icon for an entity type
     * @param {string} type - Entity type
     * @returns {string} URL of the icon
     */
    getEntityIcon: function(type) {
        // Use the exact names from the data structure for icons
        const iconMap = {
            'cisplan': '/static/img/cisPlan.svg',
            'mission_network': '/static/img/missionNetworks.svg',
            'network_segment': '/static/img/networkSegments.svg',
            'security_domain': '/static/img/securityDomains.svg',
            'hw_stack': '/static/img/hwStacks.svg',
            'asset': '/static/img/assets.svg',
            'network_interface': '/static/img/networkInterfaces.svg',
            'gp_instance': '/static/img/gpInstances.svg',
            'sp_instance': '/static/img/spInstances.svg'
        };
        
        return iconMap[type] || '/static/img/default.svg';
    },
    
    /**
     * Get a human-readable name for an entity type
     * @param {string} type - The entity type
     * @returns {string} Human-readable type name
     */
    getEntityTypeName: function(type) {
        const typeNames = {
            'cisplan': 'CIS Plan',
            'mission_network': 'Mission Network',
            'network_segment': 'Network Segment',
            'security_domain': 'Security Domain',
            'hw_stack': 'HW Stack',
            'asset': 'Asset',
            'network_interface': 'Network Interface',
            'gp_instance': 'GP Instance',
            'sp_instance': 'SP Instance'
        };
        
        return typeNames[type] || type;
    }
};
