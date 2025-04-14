"""
Test module for actors_to_gp.py
"""
import unittest
import json
import os
import sys
from unittest.mock import patch, mock_open, MagicMock
from pathlib import Path

# Add the app directory to the path so we can import the module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import the module to test
import app.data_access.actors_to_gp as actors_to_gp

class TestActorsToGP(unittest.TestCase):
    """Test case for actors_to_gp module."""

    def setUp(self):
        # Create a patch for the Flask current_app
        self.app_patcher = patch('app.data_access.actors_to_gp.current_app')
        self.mock_app = self.app_patcher.start()
        self.mock_app.static_folder = '/mock/static'
        
    def tearDown(self):
        # Stop the patcher after the test
        self.app_patcher.stop()
        
    def test_get_actor_to_gp_path(self):
        """Test get_actor_to_gp_path function."""
        # Execute
        result = actors_to_gp.get_actor_to_gp_path()
        
        # Assert
        expected_path = Path('/mock/static/ASC/data/_actor_to_gp.json')
        self.assertEqual(result, expected_path)
        
    @patch('app.data_access.actors_to_gp.get_actor_to_gp_path')
    @patch('builtins.open', new_callable=mock_open)
    @patch('json.load')
    def test_get_all_actor_gp_success(self, mock_json_load, mock_file_open, mock_get_path):
        """Test get_all_actor_gp function with successful file read."""
        # Setup
        mock_get_path.return_value = Path('/mock/path/to/_actor_to_gp.json')
        mock_data = {
            "services": [
                {
                    "service_id": "SRV-0001",
                    "service_name": "Test Service",
                    "model_id": "MOD-0001",
                    "model_name": "Test Model",
                    "actors": []
                }
            ]
        }
        mock_json_load.return_value = mock_data
        
        # Execute
        result = actors_to_gp.get_all_actor_gp()
        
        # Assert
        mock_get_path.assert_called_once()
        mock_file_open.assert_called_once_with(Path('/mock/path/to/_actor_to_gp.json'), 'r', encoding='utf-8')
        mock_json_load.assert_called_once()
        self.assertEqual(result, mock_data)
    
    @patch('app.data_access.actors_to_gp.get_actor_to_gp_path')
    @patch('builtins.open', side_effect=FileNotFoundError)
    def test_get_all_actor_gp_file_not_found(self, mock_file_open, mock_get_path):
        """Test get_all_actor_gp function when file is not found."""
        # Setup
        mock_get_path.return_value = Path('/mock/path/to/_actor_to_gp.json')
        
        # Execute
        result = actors_to_gp.get_all_actor_gp()
        
        # Assert
        self.assertEqual(result, {"services": []})
    
    @patch('app.data_access.actors_to_gp.get_actor_to_gp_path')
    @patch('builtins.open', side_effect=json.JSONDecodeError("Expecting value", "", 0))
    def test_get_all_actor_gp_invalid_json(self, mock_file_open, mock_get_path):
        """Test get_all_actor_gp function with invalid JSON."""
        # Setup
        mock_get_path.return_value = Path('/mock/path/to/_actor_to_gp.json')
        
        # Execute
        result = actors_to_gp.get_all_actor_gp()
        
        # Assert
        self.assertEqual(result, {"services": []})
    
    @patch('app.data_access.actors_to_gp.get_all_actor_gp')
    @patch('app.data_access.actors_to_gp.get_actor_to_gp_path')
    @patch('builtins.open', new_callable=mock_open)
    @patch('json.dump')
    def test_update_actor_to_gp_existing_service_existing_actor(self, mock_json_dump, mock_file_open, 
                                                               mock_get_path, mock_get_all):
        """Test update_actor_to_gp with existing service and actor."""
        # Setup
        mock_get_path.return_value = Path('/mock/path/to/_actor_to_gp.json')
        mock_data = {
            "services": [
                {
                    "service_id": "SRV-0001",
                    "service_name": "Test Service",
                    "model_id": "MOD-0001",
                    "actors": [
                        {
                            "actor_id": "ACT-0001",
                            "actor_name": "Test Actor",
                            "gps": [
                                {
                                    "gp_id": "GP-0001",
                                    "gp_name": "Old GP"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
        mock_get_all.return_value = mock_data
        
        # New GPs to update
        new_gps = [
            {
                "gp_id": "GP-0002",
                "gp_name": "New GP"
            }
        ]
        
        # Execute
        result = actors_to_gp.update_actor_to_gp("SRV-0001", "MOD-0001", "ACT-0001", new_gps)
        
        # Assert
        self.assertTrue(result)
        mock_get_all.assert_called_once()
        mock_file_open.assert_called_once_with(Path('/mock/path/to/_actor_to_gp.json'), 'w', encoding='utf-8')
        
        # Check that the JSON was updated correctly
        expected_data = {
            "services": [
                {
                    "service_id": "SRV-0001",
                    "service_name": "Test Service",
                    "model_id": "MOD-0001",
                    "actors": [
                        {
                            "actor_id": "ACT-0001",
                            "actor_name": "Test Actor",
                            "gps": [
                                {
                                    "gp_id": "GP-0002",
                                    "gp_name": "New GP"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
        mock_json_dump.assert_called_once()
        # Get the first argument of the first call
        actual_data = mock_json_dump.call_args[0][0]
        self.assertEqual(actual_data, expected_data)
    
    @patch('app.data_access.actors_to_gp.get_all_actor_gp')
    @patch('app.data_access.actors_to_gp.get_actor_to_gp_path')
    @patch('builtins.open', new_callable=mock_open)
    @patch('json.dump')
    def test_update_actor_to_gp_existing_service_new_actor(self, mock_json_dump, mock_file_open, 
                                                          mock_get_path, mock_get_all):
        """Test update_actor_to_gp with existing service but new actor."""
        # Setup
        mock_get_path.return_value = Path('/mock/path/to/_actor_to_gp.json')
        mock_data = {
            "services": [
                {
                    "service_id": "SRV-0001",
                    "service_name": "Test Service",
                    "model_id": "MOD-0001",
                    "actors": []
                }
            ]
        }
        mock_get_all.return_value = mock_data
        
        # New GPs to update
        new_gps = [
            {
                "gp_id": "GP-0002",
                "gp_name": "New GP"
            }
        ]
        
        # Execute
        result = actors_to_gp.update_actor_to_gp("SRV-0001", "MOD-0001", "ACT-0002", new_gps)
        
        # Assert
        self.assertTrue(result)
        mock_get_all.assert_called_once()
        mock_file_open.assert_called_once_with(Path('/mock/path/to/_actor_to_gp.json'), 'w', encoding='utf-8')
        
        # Check that the JSON was updated correctly
        expected_data = {
            "services": [
                {
                    "service_id": "SRV-0001",
                    "service_name": "Test Service",
                    "model_id": "MOD-0001",
                    "actors": [
                        {
                            "actor_id": "ACT-0002",
                            "actor_name": "ACT-0002",
                            "gps": [
                                {
                                    "gp_id": "GP-0002",
                                    "gp_name": "New GP"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
        mock_json_dump.assert_called_once()
        # Get the first argument of the first call
        actual_data = mock_json_dump.call_args[0][0]
        self.assertEqual(actual_data, expected_data)
    
    @patch('app.data_access.actors_to_gp.get_all_actor_gp')
    @patch('app.data_access.actors_to_gp.get_actor_to_gp_path')
    @patch('builtins.open', new_callable=mock_open)
    @patch('json.dump')
    def test_update_actor_to_gp_new_service(self, mock_json_dump, mock_file_open, 
                                           mock_get_path, mock_get_all):
        """Test update_actor_to_gp with new service."""
        # Setup
        mock_get_path.return_value = Path('/mock/path/to/_actor_to_gp.json')
        mock_data = {
            "services": []
        }
        mock_get_all.return_value = mock_data
        
        # New GPs to update
        new_gps = [
            {
                "gp_id": "GP-0002",
                "gp_name": "New GP"
            }
        ]
        
        # Execute
        result = actors_to_gp.update_actor_to_gp("SRV-0002", "MOD-0002", "ACT-0002", new_gps)
        
        # Assert
        self.assertTrue(result)
        mock_get_all.assert_called_once()
        mock_file_open.assert_called_once_with(Path('/mock/path/to/_actor_to_gp.json'), 'w', encoding='utf-8')
        
        # Check that the JSON was updated correctly
        expected_data = {
            "services": [
                {
                    "service_id": "SRV-0002",
                    "service_name": "SRV-0002",
                    "model_id": "MOD-0002",
                    "actors": [
                        {
                            "actor_id": "ACT-0002",
                            "actor_name": "ACT-0002",
                            "gps": [
                                {
                                    "gp_id": "GP-0002",
                                    "gp_name": "New GP"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
        mock_json_dump.assert_called_once()
        # Get the first argument of the first call
        actual_data = mock_json_dump.call_args[0][0]
        self.assertEqual(actual_data, expected_data)
    
    @patch('app.data_access.actors_to_gp.get_all_actor_gp')
    @patch('app.data_access.actors_to_gp.get_actor_to_gp_path')
    @patch('builtins.open', side_effect=Exception("Test exception"))
    def test_update_actor_to_gp_exception(self, mock_file_open, mock_get_path, mock_get_all):
        """Test update_actor_to_gp with an exception."""
        # Setup
        mock_get_path.return_value = Path('/mock/path/to/_actor_to_gp.json')
        mock_data = {
            "services": []
        }
        mock_get_all.return_value = mock_data
        
        # New GPs to update
        new_gps = [
            {
                "gp_id": "GP-0002",
                "gp_name": "New GP"
            }
        ]
        
        # Execute
        result = actors_to_gp.update_actor_to_gp("SRV-0002", "MOD-0002", "ACT-0002", new_gps)
        
        # Assert
        self.assertFalse(result)
        mock_get_all.assert_called_once()

if __name__ == '__main__':
    unittest.main()