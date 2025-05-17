#!/usr/bin/env python
"""
Test script for moving a hw_stack to a different security_domain
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
    move_entity
)

def main():
    """
    Main function to test moving a hw_stack to a different security_domain
    """
    # Load the CIS_Plan_2.json file directly
    json_file_path = Path('data/ciav/CIS_Plan_2.json')
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            logger.info(f"Successfully loaded CIS_Plan_2.json with {len(data.get('missionNetworks', []))} mission networks")
    except Exception as e:
        logger.error(f"Error loading CIS_Plan_2.json: {e}")
        return
    
    # Find a hw_stack and a different security_domain to move it to
    hw_stack_guid = "8fc3c9e1-7d34-41c7-ae0e-ac0dfce2a91a"  # POP-55
    target_domain_guid = "ceee1dc6-1051-40c6-80d0-7872703cf180"  # CL-UNCLASS in Mission 2
    
    # 1. Verify that both entities exist
    hw_stack, hw_stack_type, _, _ = find_entity_by_guid(data, hw_stack_guid)
    if not hw_stack:
        logger.error(f"HW Stack with GUID {hw_stack_guid} not found")
        return
    logger.info(f"Found HW Stack: {hw_stack_type} - {hw_stack.get('name')}")
    
    target_domain, target_domain_type, _, _ = find_entity_by_guid(data, target_domain_guid)
    if not target_domain:
        logger.error(f"Security domain with GUID {target_domain_guid} not found")
        return
    logger.info(f"Found target domain: {target_domain_type} - {target_domain.get('id')}")
    
    # 2. Validate the relationship is valid
    if hw_stack_type == 'hw_stack' and target_domain_type == 'security_domain':
        logger.info("Valid parent-child relationship: security_domain can contain hw_stack")
    else:
        logger.error(f"Invalid relationship: {target_domain_type} cannot contain {hw_stack_type}")
        return
    
    # 3. Show the hierarchies before the move
    hw_stack_hierarchy = get_entity_hierarchy(data, hw_stack_guid)
    logger.info(f"HW Stack hierarchy BEFORE move: {hw_stack_hierarchy}")
    
    current_parent_guid = None
    if 'parent' in hw_stack_hierarchy and isinstance(hw_stack_hierarchy['parent'], dict):
        current_parent_guid = hw_stack_hierarchy['parent'].get('guid')
        logger.info(f"Current parent GUID: {current_parent_guid}")
    
    if current_parent_guid == target_domain_guid:
        logger.error(f"HW Stack is already a child of this domain. Trying a different domain.")
        return
    
    target_children_count = len(target_domain.get('hwStacks', []))
    logger.info(f"Target domain has {target_children_count} HW Stacks BEFORE move")
    
    # 4. Make a backup copy of the file before modifying it
    backup_path = json_file_path.with_name(f"{json_file_path.stem}_backup_hw{json_file_path.suffix}")
    try:
        with open(json_file_path, 'r') as f_in, open(backup_path, 'w') as f_out:
            f_out.write(f_in.read())
        logger.info(f"Created backup at {backup_path}")
    except Exception as e:
        logger.error(f"Failed to create backup: {e}")
        # Continue anyway
    
    # 5. Test the move operation
    environment = "ciav"  # For testing only
    
    try:
        logger.info(f"Moving HW Stack {hw_stack_guid} to security domain {target_domain_guid}...")
        result = move_entity(environment, hw_stack_guid, target_domain_guid)
        
        if result:
            logger.info(f"Move operation successful: {result.get('name')} moved to {target_domain.get('id')}")
            
            # Reload the data to verify the move
            with open(json_file_path, 'r', encoding='utf-8') as f:
                updated_data = json.load(f)
            
            # Check the hierarchies after the move
            hw_stack_hierarchy_after = get_entity_hierarchy(updated_data, hw_stack_guid)
            logger.info(f"HW Stack hierarchy AFTER move: {hw_stack_hierarchy_after}")
            
            # Find the target domain again and check its children
            target_after, _, _, _ = find_entity_by_guid(updated_data, target_domain_guid)
            target_children_count_after = len(target_after.get('hwStacks', []))
            logger.info(f"Target domain now has {target_children_count_after} HW Stacks AFTER move")
            
            # Ensure that the hw_stack now has the correct parent
            new_parent_guid = hw_stack_hierarchy_after.get('parent', {}).get('guid')
            if new_parent_guid == target_domain_guid:
                logger.info("Success: HW Stack's parent GUID now matches the target domain GUID")
            else:
                logger.error(f"Error: HW Stack's parent GUID ({new_parent_guid}) does not match the target domain GUID ({target_domain_guid})")
        else:
            logger.error("Move operation failed")
            
    except Exception as e:
        logger.error(f"Error during move operation: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")

if __name__ == "__main__":
    main() 