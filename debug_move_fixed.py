#!/usr/bin/env python
"""
Fixed debug script for testing the move_entity function using CIS_Plan_2.json
This version uses a hw_stack as the target parent for an asset
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
    
    # Asset to move
    source_guid = "959982ca-b5f8-4aa6-991c-f933dd899ad3"  # Asset 111
    
    # Find a valid HW stack to move to (using the one from Mission 2)
    target_guid = "92c5a11c-a9e7-457d-9e7c-f753aeb4576b"  # HW-Stack-Mission2
    
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
    
    # 2. Check if the relationship is valid
    if source_type == 'asset' and target_type == 'hw_stack':
        logger.info("Valid parent-child relationship: hw_stack can contain assets")
    else:
        logger.error(f"Invalid relationship: {target_type} cannot contain {source_type}")
        return
    
    # 3. Test the move operation
    environment = "ciav"  # For testing only
    
    try:
        logger.info(f"Testing move_entity function from {source_guid} to {target_guid}...")
        result = move_entity(environment, source_guid, target_guid)
        
        if result:
            logger.info(f"Move operation successful: {result.get('name')} moved to {target_entity.get('name')}")
            logger.info(f"New parent hierarchy now contains {len(target_entity.get('assets', []))} assets")
        else:
            logger.error("Move operation failed")
            
    except Exception as e:
        logger.error(f"Error during move operation: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")

if __name__ == "__main__":
    main() 