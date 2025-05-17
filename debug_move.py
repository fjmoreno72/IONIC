#!/usr/bin/env python
"""
Debug script for testing the move_entity function
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
    # Load the CIS_Plan.json file directly
    json_file_path = Path('data/ciav/CIS_Plan.json')
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            original_data = json.load(f)
            logger.info(f"Successfully loaded CIS_Plan.json with {len(original_data.get('missionNetworks', []))} mission networks")
    except Exception as e:
        logger.error(f"Error loading CIS_Plan.json: {e}")
        return
    
    # Choose sample entities for testing
    # These are example GUIDs from the provided CIS Plan data
    source_guid = "959982ca-b5f8-4aa6-991c-f933dd899ad3"  # Asset 1
    target_guid = "c2460565-06c0-4874-b60b-3b31b61a1b26"  # Asset 2
    
    # 1. First verify that both entities exist
    source_entity, source_type, _, _ = find_entity_by_guid(original_data, source_guid)
    if not source_entity:
        logger.error(f"Source entity with GUID {source_guid} not found")
        return
    logger.info(f"Found source entity: {source_type} - {source_entity.get('name')}")
    
    target_entity, target_type, _, _ = find_entity_by_guid(original_data, target_guid)
    if not target_entity:
        logger.error(f"Target entity with GUID {target_guid} not found")
        return
    logger.info(f"Found target entity: {target_type} - {target_entity.get('name')}")
    
    # 2. Get the hierarchy for the source entity
    hierarchy = get_entity_hierarchy(original_data, source_guid)
    if not hierarchy:
        logger.error(f"Failed to get hierarchy for source entity {source_guid}")
        return
    logger.info(f"Source entity hierarchy: {hierarchy}")
    
    # 3. Test the move operation (but don't save the changes)
    environment = "ciav"  # For testing only
    try:
        # First attempt to get entity hierarchy using environment and GUID
        logger.info("Testing get_entity_hierarchy with environment and GUID...")
        hierarchy_test = get_entity_hierarchy(environment, source_guid)
        logger.info(f"Result: {hierarchy_test}")
        
        # Then try the move operation
        logger.info(f"Testing move_entity from {source_guid} to {target_guid}...")
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