     populateMappingUI() {
        if (!this.dom) return;
        if (!this.appSettings) return;
        
        if (!this.appSettings.gestureMappings || Object.keys(this.appSettings.gestureMappings).length === 0) {
            this.applyDefaultGestureMappings();
        }
        
        if (!this.appSettings.gestureProfiles) this.appSettings.gestureProfiles = {};

        // 1. CLEAN TAB ROOT (Sliders Removed)
        const tabRoot = document.getElementById('tab-mapping');
        if (tabRoot) {
            tabRoot.className = "tab-content p-1 space-y-4";
            
            // Only inject the containers for the actual gesture mappings
            tabRoot.innerHTML = `
                <div id="mapping-9-container" class="space-y-2"></div>
                <div id="mapping-12-container" class="space-y-2 hidden"></div>
                <div id="mapping-piano-container" class="space-y-2 hidden"></div>
            `;

            // Update DOM cache references since we just re-wrote the HTML
            this.dom.mapping9Container = document.getElementById('mapping-9-container');
            this.dom.mapping12Container = document.getElementById('mapping-12-container');
            this.dom.mappingPianoContainer = document.getElementById('mapping-piano-container');
        }

        
        // 2. DEFINE THE EXPANDED GESTURE LIST
        const gestureList = [
            // --- Taps ---
            'tap', 'double_tap', 'triple_tap', 'long_tap',
            
            // --- Multi-Finger Taps ---
            'tap_2f_any', 'double_tap_2f_any', 'triple_tap_2f_any', 'long_tap_2f_any',
            'tap_3f_any', 'double_tap_3f_any', 'triple_tap_3f_any', 'long_tap_3f_any',
            
            // --- Standard Swipes ---
            'swipe_up', 'swipe_down', 'swipe_left', 'swipe_right', 
            'swipe_nw', 'swipe_ne', 'swipe_sw', 'swipe_se',
            
            // --- Long Swipes (Throw) ---
            'swipe_long_up', 'swipe_long_down', 'swipe_long_left', 'swipe_long_right',
            
            // --- Multi-Finger Swipes ---
            'swipe_up_2f', 'swipe_down_2f', 'swipe_left_2f', 'swipe_right_2f',
            
            // --- Shapes: Boomerangs (I-Shape / 180 flip) ---
            'boomerang_up', 'boomerang_down', 'boomerang_left', 'boomerang_right',
            
            // --- Shapes: Switchbacks (V-Shape / < >) ---
            'switchback_up', 'switchback_down', 'switchback_left', 'switchback_right',
            
            // --- Shapes: Corners (L-Shape) ---
            'corner_cw', 'corner_ccw',
            
            // --- Shapes: Closed & Complex ---
            'square_cw', 'square_ccw', 
            'triangle_cw', 'triangle_ccw',
            'u_shape_cw', 'u_shape_ccw',
            'zigzag_right', 'zigzag_left'
        ];

        // 3. BUILD UI (With Accordions)
        const buildSection = (type, title, keyPrefix, count, customKeys = null, isOpen = false) => {
            const details = document.createElement('details');
            details.className = "group rounded-lg border border-custom bg-black bg-opacity-20 mb-3 open:bg-opacity-40 transition-all";
            if (isOpen) details.open = true;

            const summary = document.createElement('summary');
            summary.className = "cursor-pointer p-3 font-bold text-sm select-none flex justify-between items-center text-gray-200 hover:text-white";
            summary.innerHTML = `<span>${title} Mapping</span><span class="group-open:rotate-180 transition-transform">▼</span>`;
            details.appendChild(summary);

            const contentDiv = document.createElement('div');
            contentDiv.className = "p-3 pt-0 border-t border-gray-700 mt-2";
            
            // --- PROFILE SELECTOR INSIDE ACCORDION ---
            const profileHeader = document.createElement('div');
            profileHeader.innerHTML = `<label class="text-xs font-bold uppercase text-muted-custom block mb-1 mt-2">Active Preset</label>`;
            contentDiv.appendChild(profileHeader);

            const select = document.createElement('select');
            select.className = "settings-input w-full p-2 rounded mb-3 font-bold text-xs";
            
            const populateSelect = () => {
                select.innerHTML = '';
                const def = document.createElement('option');
                def.textContent = "-- Select Preset --";
                def.value = "";
                select.appendChild(def);

                const grp1 = document.createElement('optgroup'); grp1.label = "Built-in";
                
                // Fallback logic for safety in this snippet:
                const safePresets = (typeof GESTURE_PRESETS !== 'undefined') ? GESTURE_PRESETS : {};

                Object.keys(safePresets).forEach(k => {
                    if(safePresets[k].type === type) {
                        const opt = document.createElement('option');
                        opt.value = k;
                        opt.textContent = safePresets[k].name;
                        grp1.appendChild(opt);
                    }
                });
                select.appendChild(grp1);

                const grp2 = document.createElement('optgroup'); grp2.label = "My Setups";
                if(this.appSettings.gestureProfiles) {
                    Object.keys(this.appSettings.gestureProfiles).forEach(k => {
                        if(this.appSettings.gestureProfiles[k].type === type) {
                            const opt = document.createElement('option');
                            opt.value = k;
                            opt.textContent = this.appSettings.gestureProfiles[k].name;
                            grp2.appendChild(opt);
                        }
                    });
                }
                select.appendChild(grp2);
            };
            populateSelect();
            contentDiv.appendChild(select);

            // --- BUTTONS ---
            const btnGrid = document.createElement('div');
            btnGrid.className = "grid grid-cols-2 gap-2 mb-4"; 
            
            const createBtn = (txt, color, onClick) => {
                const b = document.createElement('button');
                b.textContent = txt;
                b.className = `py-2 text-xs bg-${color}-600 hover:bg-${color}-500 rounded text-white font-bold transition shadow`;
                b.onclick = (e) => { e.stopPropagation(); onClick(); }; // Stop propagation so accordion doesn't close
                return b;
            };

            btnGrid.append(
                createBtn("NEW", "blue", () => {
                    const name = prompt("New Profile Name:");
                    if(!name) return;
                    const id = 'cust_gest_' + Date.now();
                    const currentMap = {};
                    listContainer.querySelectorAll('select').forEach(inp => currentMap[inp.dataset.key] = inp.value);
                    this.appSettings.gestureProfiles[id] = { name: name, type: type, map: currentMap };
                    this.callbacks.onSave();
                    populateSelect();
                    select.value = id;
                }),
                createBtn("SAVE 💾", "green", () => {
                    const val = select.value;
                    if(!val || val.indexOf('cust_') === -1) return alert("Select a custom profile to save (or use NEW).");
                    const currentMap = {};
                    listContainer.querySelectorAll('select').forEach(inp => currentMap[inp.dataset.key] = inp.value);
                    this.appSettings.gestureProfiles[val].map = currentMap;
                    this.callbacks.onSave();
                    alert("Profile Saved!");
                }),
                createBtn("RENAME", "gray", () => {
                    const val = select.value;
                    if(!val || val.indexOf('cust_') === -1) return alert("Cannot rename built-in profiles.");
                    const newName = prompt("Rename:", this.appSettings.gestureProfiles[val].name);
                    if(newName) {
                        this.appSettings.gestureProfiles[val].name = newName;
                        this.callbacks.onSave();
                        populateSelect();
                        select.value = val;
                    }
                }),
                createBtn("DELETE", "red", () => {
                    const val = select.value;
                    if(!val || val.indexOf('cust_') === -1) return alert("Cannot delete built-in profiles.");
                    if(confirm("Delete this profile?")) {
                        delete this.appSettings.gestureProfiles[val];
                        this.callbacks.onSave();
                        populateSelect();
                    }
                })
            );
            contentDiv.appendChild(btnGrid);

            // --- LIST ---
            const listContainer = document.createElement('div');
            listContainer.className = "space-y-2 border-t border-custom pt-3 max-h-60 overflow-y-auto";
            contentDiv.appendChild(listContainer);

            const renderMappings = () => {
                listContainer.innerHTML = '';
                const keysToRender = customKeys || Array.from({length: count}, (_, i) => String(i + 1));
                
                keysToRender.forEach(k => {
                    const keyId = keyPrefix + k;
                    const row = document.createElement('div');
                    row.className = "flex items-center space-x-2 mb-2";

                    const lbl = document.createElement('div');
                    lbl.className = "text-sm font-bold w-8 h-10 flex items-center justify-center bg-gray-800 rounded border border-gray-600 shrink-0";
                    lbl.textContent = k;

                    // 1. TOUCH GESTURE DROPDOWN
                    const dropTouch = document.createElement('select');
                    dropTouch.className = "settings-input p-1 rounded text-[10px] h-10 border border-custom flex-1 w-0";
                    dropTouch.dataset.key = keyId; // For saving presets

                    // Add default "Choose..." or iterate your gestureList
                    gestureList.forEach(g => {
                        const opt = document.createElement('option');
                        opt.value = g;
                        opt.textContent = g; 
                        dropTouch.appendChild(opt);
                    });

                    // 2. HAND GESTURE DROPDOWN
                    const dropHand = document.createElement('select');
                    dropHand.className = "settings-input p-1 rounded text-[10px] h-10 border border-custom flex-1 w-0 bg-blue-900 bg-opacity-20";
                    
                    const defHand = document.createElement('option');
                    defHand.value = ""; 
                    defHand.textContent = "- Hand -";
                    dropHand.appendChild(defHand);
                    
                    // Safe access to HAND_GESTURES_LIST
                    const handList = (typeof HAND_GESTURES_LIST !== 'undefined') ? HAND_GESTURES_LIST : [];

                    handList.forEach(g => {
                        const opt = document.createElement('option');
                        opt.value = g;
                        // Format: hand_2_up -> 2 Fingers Up
                        opt.textContent = g.replace('hand_', '').replace('_', ' ').replace('fist', '✊ Fist').toUpperCase(); 
                        dropHand.appendChild(opt);
                    });

                    // LOAD SAVED VALUES
                    const mapping = (this.appSettings.gestureMappings && this.appSettings.gestureMappings[keyId]) 
                        ? this.appSettings.gestureMappings[keyId] 
                        : {};

                    dropTouch.value = mapping.gesture || 'tap';
                    dropHand.value = mapping.hand || '';

                    // SAVE LISTENER
                    const save = () => {
                        if(!this.appSettings.gestureMappings[keyId]) this.appSettings.gestureMappings[keyId] = {};
                        this.appSettings.gestureMappings[keyId].gesture = dropTouch.value;
                        this.appSettings.gestureMappings[keyId].hand = dropHand.value;
                        this.callbacks.onSave();
                    };

                    dropTouch.onchange = save;
                    dropHand.onchange = save;

                    row.appendChild(lbl);
                    row.appendChild(dropTouch);
                    row.appendChild(dropHand);
                    listContainer.appendChild(row);
                });
            };

            renderMappings();

            select.onchange = () => {
                 const val = select.value;
                 if(!val) return;
                 // Safe Preset Access again
                 const safePresets = (typeof GESTURE_PRESETS !== 'undefined') ? GESTURE_PRESETS : {};
                 
                 let data = safePresets[val] ? safePresets[val].map : (this.appSettings.gestureProfiles[val] ? this.appSettings.gestureProfiles[val].map : null);
                 if(data) {
                     // Check if this is a simple string map (old presets) or object map (new presets)
                     // Convert old string map to new object format for internal storage if needed
                     Object.keys(data).forEach(key => {
                         if(!this.appSettings.gestureMappings[key]) this.appSettings.gestureMappings[key] = {};
                         
                         const entry = data[key];
                         if (typeof entry === 'string') {
                             this.appSettings.gestureMappings[key].gesture = entry;
                         } else if (typeof entry === 'object') {
                             if(entry.gesture) this.appSettings.gestureMappings[key].gesture = entry.gesture;
                             if(entry.hand) this.appSettings.gestureMappings[key].hand = entry.hand;
                         }
                     });
                     this.callbacks.onSave();
                     renderMappings();
                 }
            };
            
            details.appendChild(contentDiv);
            if(tabRoot) tabRoot.appendChild(details);
        };

        buildSection('key9', '9-Key', 'k9_', 9, null, true); // Open first one by default
        buildSection('key12', '12-Key', 'k12_', 12);
        buildSection('piano', 'Piano', 'piano_', 0, ['C','D','E','F','G','A','B','1','2','3','4','5']);
    }
