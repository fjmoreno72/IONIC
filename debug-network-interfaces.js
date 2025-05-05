/**
 * Debug helper to trace network interface paths for the CIS Plan UI
 * Insert this at the top of your app/static/js/pages/cis_plan.js file
 */

// Override window.fetch to log all network interface API calls
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  // Only log requests to network interface APIs
  if (typeof url === 'string' && url.includes('network_interfaces')) {
    console.log('==== FETCH DEBUG ====');
    console.log('URL:', url);
    console.log('Method:', options?.method || 'GET');
    console.log('Body:', options?.body);
    console.log('====================');
    
    // Extract asset ID from URL
    const match = url.match(/assets\/(AS-[0-9]+)/);
    if (match && match[1]) {
      console.log('ASSET ID FROM URL:', match[1]);
    }
  }
  
  // Call the original fetch function
  return originalFetch.apply(this, arguments);
};

// Helper function to inspect form values before submission
function debugNetworkInterfaceForm() {
  // This will run right before form submission to show all values
  setTimeout(() => {
    const formData = {
      id: document.getElementById("editNetworkInterfaceId")?.value,
      name: document.getElementById("editNetworkInterfaceName")?.value,
      assetId: document.getElementById("editNetworkInterfaceAssetId")?.value,
      hwStackId: document.getElementById("editNetworkInterfaceHwStackId")?.value,
      domainId: document.getElementById("editNetworkInterfaceDomainId")?.value,
      segmentId: document.getElementById("editNetworkInterfaceSegmentId")?.value,
      missionNetworkId: document.getElementById("editNetworkInterfaceMissionNetworkId")?.value
    };
    
    console.log('==== FORM DEBUG ====');
    console.log('Network Interface Edit Form Values:', formData);
    console.log('====================');
  }, 0);
}

// Inject this call at the start of updateNetworkInterface function 
// Add this line after reading all the form values
// debugNetworkInterfaceForm();
