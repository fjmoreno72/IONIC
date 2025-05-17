#!/usr/bin/env python
"""
Test script for the move_entity function using CIS_Plan_2.json
This version correctly moves an asset to a hw_stack
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
    Main function to test moving an asset from one hw_stack to another
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
    
    # GUIDs from CIS_Plan_2.json
    source_guid = "959982ca-b5f8-4aa6-991c-f933dd899ad3"  # Asset 111 in HW-Stack POP-55 
    target_guid = "92c5a11c-a9e7-457d-9e7c-f753aeb4576b"  # HW-Stack-Mission2 in Mission 2
    
    # 1. First verify that both entities exist
    source_entity, source_type, _, _ = find_entity_by_guid(data, source_guid)
    if not source_entity:
        logger.error(f"Source entity with GUID {source_guid} not found")
        return
    logger.info(f"Found source entity: {source_type} - {source_entity.get('name')}")
    
    target_entity, target_type, _, _ = find_entity_by_guid(data, target_guid)
    if not target_entity:
        logger.error(f"Target entity with GUID {target_guid} not found")
        return
    logger.info(f"Found target entity: {target_type} - {target_entity.get('name')}")
    
    # 2. Validate the relationship is valid
    if source_type == 'asset' and target_type == 'hw_stack':
        logger.info("Valid parent-child relationship: hw_stack can contain assets")
    else:
        logger.error(f"Invalid relationship: {target_type} cannot contain {source_type}")
        return
    
    # 3. Show the hierarchies before the move
    source_hierarchy = get_entity_hierarchy(data, source_guid)
    logger.info(f"Source entity hierarchy BEFORE move: {source_hierarchy}")
    
    target_children_count = len(target_entity.get('assets', []))
    logger.info(f"Target parent has {target_children_count} assets BEFORE move")
    
    # 4. Make a backup copy of the file before modifying it
    backup_path = json_file_path.with_name(f"{json_file_path.stem}_backup{json_file_path.suffix}")
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
        logger.info(f"Moving element {source_guid} to parent {target_guid}...")
        result = move_entity(environment, source_guid, target_guid)
        
        if result:
            logger.info(f"Move operation successful: {result.get('name')} moved to {target_entity.get('name')}")
            
            # Reload the data to verify the move
            with open(json_file_path, 'r', encoding='utf-8') as f:
                updated_data = json.load(f)
            
            # Check the hierarchies after the move
            source_hierarchy_after = get_entity_hierarchy(updated_data, source_guid)
            logger.info(f"Source entity hierarchy AFTER move: {source_hierarchy_after}")
            
            # Find the target entity again
            target_after, _, _, _ = find_entity_by_guid(updated_data, target_guid)
            target_children_count_after = len(target_after.get('assets', []))
            logger.info(f"Target parent now has {target_children_count_after} assets AFTER move")
        else:
            logger.error("Move operation failed")
            
    except Exception as e:
        logger.error(f"Error during move operation: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")

if __name__ == "__main__":
    main() 