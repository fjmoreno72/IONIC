#!/usr/bin/env python
"""
Debug script for testing the move_entity function using CIS_Plan_2.json
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
    source_guid = "959982ca-b5f8-4aa6-991c-f933dd899ad3"  # Asset 111
    target_guid = "79ea3eec-313b-4fa6-9071-141bab4bfcc7"  # ASSET X*
    
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
    
    # 2. Get the hierarchy for the source entity
    hierarchy = get_entity_hierarchy(data, source_guid)
    if not hierarchy:
        logger.error(f"Failed to get hierarchy for source entity {source_guid}")
        return
    logger.info(f"Source entity hierarchy: {hierarchy}")
    
    # 3. Get the hierarchy for the target entity
    target_hierarchy = get_entity_hierarchy(data, target_guid)
    if not target_hierarchy:
        logger.error(f"Failed to get hierarchy for target entity {target_guid}")
        return
    logger.info(f"Target entity hierarchy: {target_hierarchy}")
    
    # 4. Check if a move is possible (entities should be of same type, and target's parent should be able to contain source)
    if source_type != target_type:
        logger.warning(f"Source entity type ({source_type}) doesn't match target entity type ({target_type})")
    
    # 5. Test the move operation (without saving changes)
    environment = "ciav"  # For testing only
    
    # Create a copy of the data structure to test with
    import copy
    test_data = copy.deepcopy(data)
    
    try:
        # Let's manually try the find and move operations
        logger.info(f"Testing move operation from {source_guid} to {target_guid}...")
        
        # Find the entity to move
        entity, entity_type, parent_array, parent = find_entity_by_guid(test_data, source_guid)
        logger.info(f"Found entity: {entity_type}, parent: {parent.get('name') if parent else 'None'}")
        
        # Find the new parent
        new_parent, new_parent_type, _, _ = find_entity_by_guid(test_data, target_guid)
        logger.info(f"Found new parent: {new_parent_type}, name: {new_parent.get('name')}")
        
        # Check if the new parent can contain this type of entity
        if new_parent_type == entity_type and 'assets' in new_parent:
            logger.info(f"New parent can contain {entity_type} entities")
        else:
            logger.warning(f"New parent ({new_parent_type}) may not be able to contain {entity_type} entities")
        
        # Test the actual move operation with the real API function
        logger.info(f"Testing API move_entity function from {source_guid} to {target_guid}...")
        result = move_entity(environment, source_guid, target_guid)
        
        if result:
            logger.info(f"Move operation successful: {result.get('name')}")
        else:
            logger.error("Move operation failed")
            
    except Exception as e:
        logger.error(f"Error during move operation: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")

if __name__ == "__main__":
    main() 