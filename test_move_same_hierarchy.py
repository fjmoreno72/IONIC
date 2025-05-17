#!/usr/bin/env python
"""
Test script for moving a hw_stack between two security domains in the same network segment
"""

import json
import logging
import sys
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Import the functions we need to test
sys.path.insert(0, '.')
from app.data_access.cis_plan_repository_2 import (
    find_entity_by_guid,
    get_entity_hierarchy,
    move_entity,
    _load_cis_plan
)

def main():
    """
    Main function to test moving a hw_stack between two security domains within the same network segment
    """
    # Environment for loading data
    environment = "ciav"
    
    # Load the CIS_Plan_2.json data directly
    data = _load_cis_plan(environment)
    if not data:
        logger.error(f"Failed to load CIS plan data for environment {environment}")
        return
    
    logger.info(f"Successfully loaded CIS_Plan_2.json with {len(data.get('missionNetworks', []))} mission networks")
    
    # For this test, we need:
    # 1. One network segment with at least two security domains
    # 2. A hw_stack in one of those security domains
    
    # Let's find them
    mission_networks = data.get('missionNetworks', [])
    test_hw_stack = None
    current_security_domain = None
    other_security_domain = None
    containing_segment = None
    
    # Search for our test candidates
    for mn in mission_networks:
        for ns in mn.get('networkSegments', []):
            domains = ns.get('securityDomains', [])
            if len(domains) >= 2:  # We need at least two domains
                # Check first domain for hw stacks
                for i, domain in enumerate(domains):
                    stacks = domain.get('hwStacks', [])
                    if stacks and i < len(domains) - 1:  # Ensure there's at least one more domain
                        # We have a match!
                        test_hw_stack = stacks[0]
                        current_security_domain = domain
                        other_security_domain = domains[i+1]  # Take the next domain
                        containing_segment = ns
                        break
            if test_hw_stack:
                break
        if test_hw_stack:
            break
    
    if not test_hw_stack or not current_security_domain or not other_security_domain:
        logger.error("Could not find suitable test candidates in the data")
        return
    
    # Log what we found
    hw_stack_guid = test_hw_stack.get('guid')
    current_domain_guid = current_security_domain.get('guid')
    other_domain_guid = other_security_domain.get('guid')
    segment_guid = containing_segment.get('guid')
    
    logger.info(f"Test HW Stack: {test_hw_stack.get('name')} with GUID: {hw_stack_guid}")
    logger.info(f"Current security domain: {current_security_domain.get('id')} with GUID: {current_domain_guid}")
    logger.info(f"Target security domain: {other_security_domain.get('id')} with GUID: {other_domain_guid}")
    logger.info(f"Both domains are in segment: {containing_segment.get('name')} with GUID: {segment_guid}")
    
    # Make a backup copy of the file before modifying it
    json_file_path = Path(f"data/{environment}/CIS_Plan_2.json")
    backup_path = json_file_path.with_name(f"{json_file_path.stem}_backup_same_hierarchy{json_file_path.suffix}")
    try:
        with open(json_file_path, 'r') as f_in, open(backup_path, 'w') as f_out:
            f_out.write(f_in.read())
        logger.info(f"Created backup at {backup_path}")
    except Exception as e:
        logger.error(f"Failed to create backup: {e}")
        # Continue anyway
    
    # Test the move operation
    try:
        logger.info(f"Moving HW Stack {hw_stack_guid} to security domain {other_domain_guid} within the same segment...")
        result = move_entity(environment, hw_stack_guid, other_domain_guid)
        
        if result:
            logger.info(f"Move operation successful: {result.get('name')} moved to {other_security_domain.get('id')}")
            
            # Reload the data to verify the move
            updated_data = _load_cis_plan(environment)
            
            # Verify the hw_stack is now in the new security domain
            new_hw_stack, _, _, new_parent = find_entity_by_guid(updated_data, hw_stack_guid)
            if new_parent and new_parent.get('guid') == other_domain_guid:
                logger.info("Success: HW Stack's parent GUID now matches the target domain GUID")
            else:
                logger.error(f"Error: HW Stack's parent GUID does not match the target domain GUID")
                
            # Reload the original file to clean up after the test
            logger.info("Restoring the original file from backup...")
            try:
                with open(backup_path, 'r') as f_in, open(json_file_path, 'w') as f_out:
                    f_out.write(f_in.read())
                logger.info("Original file restored.")
            except Exception as e:
                logger.error(f"Failed to restore original file: {e}")
        else:
            logger.error("Move operation failed")
            
    except Exception as e:
        logger.error(f"Error during move operation: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")

if __name__ == "__main__":
    main() 