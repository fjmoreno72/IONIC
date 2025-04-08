import { UiService } from '../services/uiService.js';

/**
 * GpSpEditForm - Component to edit SP instances within a single GP instance.
 */
export class GpSpEditForm {
    /**
     * Constructor
     * @param {object} config
     * @param {object} config.gpInstance - The GP instance data object to edit (contains gpId, instanceLabel, spInstances).
     * @param {Array} config.allSps - Array of all available SPs (from _sps.json).
     * @param {Array} config.allGps - Array of all available GPs (from _gps.json). Needed for name lookup.
     * @param {Function} config.onSave - Callback function to save the updated gpInstance data. receives the updated gpInstance as argument.
     * @param {Function} [config.onCancel] - Optional callback for cancellation.
     */
    constructor(config = {}) {
        // Add check for allGps
        if (!config.gpInstance || !config.allSps || !config.allGps || !config.onSave) {
            throw new Error("GpSpEditForm requires gpInstance, allSps, allGps, and onSave configuration.");
        }
        this.gpInstance = JSON.parse(JSON.stringify(config.gpInstance)); // Deep copy
        this.allSps = config.allSps;
        this.allGps = config.allGps; // Store allGps
        this.onSaveCallback = config.onSave;
        this.onCancel = config.onCancel; // Currently unused, handled by DialogManager

        this.element = null;
        this.spListContainer = null;
        this.spSelect = null;
        this.versionSelect = null;
        this.scoreInput = null;
        this.addSpButton = null; // Reference to the add/update button
        this.cancelEditSpButton = null; // Reference to cancel button
        this.editingSpIndex = null; // Track which SP index is being edited
        this.gpScoreDisplay = null; // Element to display calculated GP score

        this.createForm();
        this.renderSpInstances();
        this.populateSpDropdown();
    }

    createForm() {
        this.element = document.createElement('div');
        this.element.id = 'gpSpEditForm';

        // Display GP Info (Readonly) - Use Name
        const gpInfo = this.allGps.find(gp => gp.id === this.gpInstance.gpId);
        const gpName = gpInfo ? gpInfo.name : this.gpInstance.gpId; // Use name, fallback to ID
        const gpLabel = this.gpInstance.instanceLabel || '';

        this.element.innerHTML = `
            <h6>Editing SPs for GP: ${gpName} ${gpLabel ? `- ${gpLabel}` : ''} (${this.gpInstance.gpId})</h6>
            <hr>
            <div id="spListContainer" class="mb-3">
                <!-- SP instances will be rendered here -->
                <p>Loading SP instances...</p>
            </div>
            <hr>
            <h6>Add/Edit SP Instance <span id="calculatedGpScore" class="badge bg-info float-end">GP Score: 0%</span></h6>
             <div class="row g-3 mb-3"> <!-- Add search input -->
                 <div class="col-12">
                    <label for="spSearchInput" class="form-label">Search SP</label>
                    <input type="text" id="spSearchInput" class="form-control form-control-sm" placeholder="Type to filter SPs...">
                 </div>
             </div>
            <div class="row g-3 align-items-end">
                <div class="col-md-4">
                    <label for="spSelect" class="form-label">Select SP</label>
                    <select id="spSelect" class="form-select form-select-sm" size="5"> <!-- Add size to show multiple options -->
                        <option value="" selected>Select SP...</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <label for="spVersionSelect" class="form-label">Version</label>
                    <select id="spVersionSelect" class="form-select form-select-sm" disabled>
                        <option value="" selected>Select SP first</option>
                    </select>
                </div>
                 <div class="col-md-2">
                    <label for="spScoreInput" class="form-label">Score (%)</label>
                    <input type="number" id="spScoreInput" class="form-control form-control-sm" min="0" max="100" value="0">
                 </div>
                 <div class="col-md-3">
                      <button type="button" id="addSpInstanceButton" class="btn btn-success btn-sm w-100">
                         <i class="fas fa-plus me-1"></i> Add SP
                     </button>
                     <button type="button" id="cancelEditSpButton" class="btn btn-secondary btn-sm w-100 mt-1" style="display: none;">
                         Cancel Edit
                     </button>
                 </div>
            </div>
        `;

        this.spListContainer = this.element.querySelector('#spListContainer');
        this.spSelect = this.element.querySelector('#spSelect');
        this.versionSelect = this.element.querySelector('#spVersionSelect');
        this.scoreInput = this.element.querySelector('#spScoreInput');
        this.spSearchInput = this.element.querySelector('#spSearchInput'); // Search input
        this.addSpButton = this.element.querySelector('#addSpInstanceButton'); // Get button reference
        this.cancelEditSpButton = this.element.querySelector('#cancelEditSpButton'); // Get cancel button reference
        this.gpScoreDisplay = this.element.querySelector('#calculatedGpScore'); // Get score display element


        this.setupEventListeners();
        this.updateCalculatedGpScore(); // Initial calculation
    }

    populateSpDropdown() {
        this.spSelect.innerHTML = '<option value="" selected>Select SP...</option>';
        const sortedSps = [...this.allSps].sort((a, b) => a.name.localeCompare(b.name));
        sortedSps.forEach(sp => {
            const option = document.createElement('option');
            option.value = sp.id;
            option.textContent = `${sp.name} (${sp.id})`;
            this.spSelect.appendChild(option);
        });
    }

    populateVersionDropdown(spId) {
        this.versionSelect.innerHTML = '<option value="">(No Version)</option>'; // Allow no version
        this.versionSelect.disabled = true;

        if (!spId) {
             this.versionSelect.innerHTML = '<option value="" selected>Select SP first</option>';
             return;
        }

        const selectedSp = this.allSps.find(sp => sp.id === spId);
        if (selectedSp && selectedSp.versions && selectedSp.versions.length > 0) {
            // Assuming versions are strings, sort them (consider semantic version sorting if needed)
            selectedSp.versions.sort().forEach(version => {
                const option = document.createElement('option');
                option.value = version;
                option.textContent = version;
                this.versionSelect.appendChild(option);
            });
            this.versionSelect.disabled = false;
        } else {
             this.versionSelect.innerHTML = '<option value="" selected>(No Versions Available)</option>';
             // Keep disabled if no versions
        }
    }

    renderSpInstances() {
        this.spListContainer.innerHTML = ''; // Clear existing list
        if (!this.gpInstance.spInstances || this.gpInstance.spInstances.length === 0) {
            this.spListContainer.innerHTML = '<p class="text-muted">No SP instances added yet.</p>';
            return;
        }

        const listGroup = document.createElement('ul');
        listGroup.className = 'list-group list-group-flush';

        this.gpInstance.spInstances.forEach((spInstance, index) => {
            const spInfo = this.allSps.find(sp => sp.id === spInstance.spId);
            const spName = spInfo ? spInfo.name : spInstance.spId;

            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            listItem.dataset.spIndex = index;

            listItem.innerHTML = `
                <div class="flex-grow-1"> <!-- Allow text to take space -->
                    <strong>${spName}</strong>
                    <small class="d-block text-muted">
                        Version: ${spInstance.spVersion || 'N/A'} | Score: ${spInstance.spScore || '0%'}
                    </small>
                </div>
                <div>
                    <button type="button" class="btn btn-sm btn-outline-secondary me-2 edit-sp-btn">
                         <i class="fas fa-pencil-alt"></i> Edit
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger remove-sp-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            listItem.querySelector('.remove-sp-btn').addEventListener('click', () => {
                this.handleRemoveSpInstance(index);
            });

            // Add Edit button functionality
             listItem.querySelector('.edit-sp-btn').addEventListener('click', () => {
                 this.populateEditForm(index);
             });


            listGroup.appendChild(listItem);
        });
        this.spListContainer.appendChild(listGroup);
    }

    setupEventListeners() {
         // Filter SP dropdown on search input
        this.spSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const options = this.spSelect.options;
            let firstMatch = null;

            for (let i = 1; i < options.length; i++) { // Start from 1 to skip "Select SP..."
                const option = options[i];
                const text = option.textContent.toLowerCase();
                const match = text.includes(searchTerm);
                option.style.display = match ? '' : 'none';
                if (match && !firstMatch) {
                    firstMatch = option; // Store the first match
                }
            }
             // Optional: Select the first match automatically?
             // if (firstMatch) {
             //    this.spSelect.value = firstMatch.value;
             //    this.spSelect.dispatchEvent(new Event('change')); // Trigger version load
             // } else {
             //    this.spSelect.value = ''; // Clear selection if no match
             //    this.spSelect.dispatchEvent(new Event('change'));
             // }
        });


        this.spSelect.addEventListener('change', (e) => {
            this.populateVersionDropdown(e.target.value);
        });

        this.addSpButton.addEventListener('click', () => {
            this.handleSaveSpInstance(); // Renamed function
        });

        this.cancelEditSpButton.addEventListener('click', () => {
            this.resetSpForm();
        });

        // Note: The main save action is handled by the DialogManager calling the onSaveCallback
    }

    populateEditForm(index) {
        if (!this.gpInstance.spInstances || index < 0 || index >= this.gpInstance.spInstances.length) return;

        const spInstance = this.gpInstance.spInstances[index];

        // Set form values
        this.spSelect.value = spInstance.spId;
        this.populateVersionDropdown(spInstance.spId); // Populate versions for the selected SP
        // Need a slight delay or check for options before setting version value
        setTimeout(() => {
             this.versionSelect.value = spInstance.spVersion || '';
        }, 50); // Small delay to allow dropdown population
        this.scoreInput.value = parseInt(spInstance.spScore || '0', 10); // Set score as number

        // Update button text and state
        this.addSpButton.textContent = 'Update SP';
        this.addSpButton.classList.remove('btn-success');
        this.addSpButton.classList.add('btn-warning');
        this.cancelEditSpButton.style.display = 'inline-block'; // Show cancel button
        this.editingSpIndex = index; // Store the index being edited
    }

     resetSpForm() {
        this.spSelect.value = '';
        this.populateVersionDropdown(''); // Reset versions
        this.scoreInput.value = '0';
        this.spSearchInput.value = ''; // Clear search
        // Reset search filter display
        const options = this.spSelect.options;
         for (let i = 1; i < options.length; i++) {
             options[i].style.display = '';
         }


        // Reset button text and state
        this.addSpButton.textContent = 'Add SP';
        this.addSpButton.classList.remove('btn-warning');
        this.addSpButton.classList.add('btn-success');
        this.cancelEditSpButton.style.display = 'none'; // Hide cancel button
        this.editingSpIndex = null; // Clear editing index
    }


    handleSaveSpInstance() { // Renamed from handleAddSpInstance
        const spId = this.spSelect.value;
        const version = this.versionSelect.value; // Will be "" if "(No Version)" is selected
        let scoreValue = parseInt(this.scoreInput.value, 10);
        let score = '0%'; // Default to 0%

        // Enforce score rule: Score > 0 only if version is set
        if (version && !isNaN(scoreValue)) {
             score = `${Math.max(0, Math.min(100, scoreValue))}%`; // Clamp between 0-100
        } else if (version && isNaN(scoreValue)) {
             // If version is set but score is invalid, default to 0%
             score = '0%';
             this.scoreInput.value = '0'; // Correct the input field
             UiService.showNotification("Invalid score entered, defaulting to 0%.", "warning");
        } else if (!version) {
             // If no version, force score to 0%
             score = '0%';
             if (scoreValue !== 0) {
                 this.scoreInput.value = '0'; // Correct the input field
                 UiService.showNotification("Score set to 0% as no version is selected.", "info");
             }
        }


        if (!spId) {
            UiService.showNotification("Please select an SP.", "warning");
            return;
        }

        const newSpData = {
             spId: spId,
             spVersion: version || null, // Store null if no version selected
             spScore: score
        };

        if (this.editingSpIndex !== null) {
            // Update existing SP instance
            // Check if the combination already exists elsewhere (excluding the current index)
            const duplicateIndex = this.gpInstance.spInstances.findIndex((sp, idx) =>
                idx !== this.editingSpIndex && sp.spId === spId && sp.spVersion === (version || null)
            );
            if (duplicateIndex !== -1) {
                 UiService.showNotification(`Another instance with SP ${spId} ${version ? `(v${version})` : ''} already exists. Cannot update.`, "danger");
                 return;
            }

            this.gpInstance.spInstances[this.editingSpIndex] = newSpData;
            UiService.showNotification(`SP ${spId} updated.`, 'success');
        } else {
            // Add new SP instance
            // Check if SP/Version combo already exists
            const existingIndex = this.gpInstance.spInstances.findIndex(sp => sp.spId === spId && sp.spVersion === (version || null));
            if (existingIndex !== -1) {
                 UiService.showNotification(`SP ${spId} ${version ? `(v${version})` : ''} already exists. Use Edit to modify score.`, "warning");
                 return; // Prevent adding duplicate
            }
            this.gpInstance.spInstances.push(newSpData);
            UiService.showNotification(`SP ${spId} added.`, 'success');
        }

        this.renderSpInstances(); // Re-render the list
        this.updateCalculatedGpScore(); // Recalculate GP score
        this.resetSpForm(); // Reset form fields and button state
    }

    handleRemoveSpInstance(index) {
        if (!this.gpInstance.spInstances || index < 0 || index >= this.gpInstance.spInstances.length) return;

        const spToRemove = this.gpInstance.spInstances[index];
        const spInfo = this.allSps.find(sp => sp.id === spToRemove.spId);
        const spName = spInfo ? spInfo.name : spToRemove.spId;

        if (confirm(`Are you sure you want to remove SP instance "${spName}" (v${spToRemove.spVersion || 'N/A'})?`)) {
            this.gpInstance.spInstances.splice(index, 1);
            this.renderSpInstances(); // Re-render the list
            this.updateCalculatedGpScore(); // Recalculate GP score
            UiService.showNotification(`SP Instance ${spName} removed.`, 'warning');
        }
    }

    // Method to be called by DialogManager's save action
    save() {
        // Ensure the calculated score is up-to-date before saving
        this.updateCalculatedGpScore();
        // The actual data modification happens directly on this.gpInstance via add/remove handlers
        // We just need to pass the final state back via the callback
        if (this.onSaveCallback) {
            this.onSaveCallback(this.gpInstance); // Pass the modified gpInstance data back (including updated gpScore)
        }
    }

    calculateGpScore() {
        if (!this.gpInstance.spInstances || this.gpInstance.spInstances.length === 0) {
            return '0%';
        }

        let totalScore = 0;
        let validScoresCount = 0; // Count SPs that contribute to the average (have version and valid score)

        this.gpInstance.spInstances.forEach(spInst => {
             // Only include score if version is set
             if (spInst.spVersion) {
                 const scoreValue = parseInt(spInst.spScore || '0', 10);
                 if (!isNaN(scoreValue)) {
                     totalScore += scoreValue;
                     validScoresCount++;
                 }
             }
             // If spVersion is null/empty, its score is implicitly 0 and doesn't count towards average divisor
        });

        // Calculate average, handle division by zero
        const averageScore = validScoresCount > 0 ? Math.round(totalScore / validScoresCount) : 0;
        return `${averageScore}%`;
    }

    updateCalculatedGpScore() {
        const calculatedScore = this.calculateGpScore();
        this.gpInstance.gpScore = calculatedScore; // Update the data object
        if (this.gpScoreDisplay) {
            this.gpScoreDisplay.textContent = `GP Score: ${calculatedScore}`; // Update the display
        }
    }
}
