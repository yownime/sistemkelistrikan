document.addEventListener('DOMContentLoaded', () => {
    const components = document.querySelectorAll('.component');
    const workspaceArea = document.getElementById('workspace-area');
    let selectedPoint = null;
    let connections = [];
    let switchStates = {};
    let connectionPointIdCounter = 1;
    let wireIdCounter = 1;
    let ignitionKeyState = false;

    components.forEach(component => {
        component.addEventListener('click', handleComponentClick);
    });

    function handleComponentClick(e) {
        const clone = this.cloneNode(true);
        clone.style.position = 'absolute';
        
        // Calculate center position of workspace
        const workspaceRect = workspaceArea.getBoundingClientRect();
        const centerX = workspaceRect.width / 2;
        const centerY = workspaceRect.height / 2;
        
        clone.style.left = `${centerX - clone.offsetWidth / 2}px`;
        clone.style.top = `${centerY - clone.offsetHeight / 2}px`;

        // Add connection points based on component type
        if (this.dataset.component === 'massa') {
            setupMassa(clone);
        } else if (this.dataset.component === 'battery') {
            console.log("Creating battery component");
            
            // Tambahkan kutub positif (kanan atas, merah)
            const positivePoint = document.createElement('div');
            positivePoint.className = 'connection-point output positive';
            positivePoint.dataset.type = 'output';
            positivePoint.dataset.id = `connection-${connectionPointIdCounter++}`;
            positivePoint.style.right = '-5px';
            positivePoint.style.top = '5px';
            positivePoint.style.backgroundColor = '#ff0000';
            clone.appendChild(positivePoint);
            positivePoint.addEventListener('click', handleConnectionPointClick);

            // Tambahkan kutub negatif (kanan bawah, hitam)
            const negativePoint = document.createElement('div');
            negativePoint.className = 'connection-point output negative';
            negativePoint.dataset.type = 'output';
            negativePoint.dataset.id = `connection-${connectionPointIdCounter++}`;
            negativePoint.style.right = '-5px';
            negativePoint.style.bottom = '5px';
            negativePoint.style.backgroundColor = '#000000';
            clone.appendChild(negativePoint);
            negativePoint.addEventListener('click', handleConnectionPointClick);

            // Modifikasi kontrol tegangan
            const voltageControl = document.createElement('div');
            voltageControl.className = 'voltage-control';
            voltageControl.innerHTML = `
                <input type="number" min="0" max="24" step="0.1" value="12.0" class="voltage-input">
                <span>V</span>
            `;
            clone.appendChild(voltageControl);

            const input = voltageControl.querySelector('.voltage-input');

            input.addEventListener('input', (e) => {
                let value = parseFloat(e.target.value);
                if (isNaN(value)) value = 0;
                if (value < 0) value = 0;
                if (value > 24) value = 24;
                
                // Tambahkan indikator visual untuk tegangan
                const batteryIcon = clone.querySelector('.battery-icon');
                if (value === 12) {
                    batteryIcon.style.borderColor = '#4CAF50'; // Hijau untuk tegangan tepat
                    batteryIcon.style.boxShadow = '0 0 5px #4CAF50';
                } else {
                    batteryIcon.style.borderColor = '#ff4444'; // Merah untuk tegangan tidak tepat
                    batteryIcon.style.boxShadow = '0 0 5px #ff4444';
                }
                
                updatePowerState();
            });
        } else if (this.dataset.component === 'fuse') {
            console.log("Creating fuse component");
            
            // Tambahkan titik koneksi input
            const inputPoint = document.createElement('div');
            inputPoint.className = 'connection-point input';
            inputPoint.dataset.type = 'input';
            inputPoint.dataset.id = `connection-${connectionPointIdCounter++}`;
            inputPoint.style.left = '-4px';
            inputPoint.style.top = '50%';
            inputPoint.style.transform = 'translateY(-50%)';
            clone.appendChild(inputPoint);
            
            // Tambahkan titik koneksi output
            const outputPoint = document.createElement('div');
            outputPoint.className = 'connection-point output';
            outputPoint.dataset.type = 'output';
            outputPoint.dataset.id = `connection-${connectionPointIdCounter++}`;
            outputPoint.style.right = '-4px';
            outputPoint.style.top = '50%';
            outputPoint.style.transform = 'translateY(-50%)';
            clone.appendChild(outputPoint);
            
            inputPoint.addEventListener('click', handleConnectionPointClick);
            outputPoint.addEventListener('click', handleConnectionPointClick);
        } else if (this.dataset.component === 'ignition-key') {
            console.log("Creating ignition key component");
            
            // Tambahkan titik koneksi input
            const inputPoint = document.createElement('div');
            inputPoint.className = 'connection-point input';
            inputPoint.dataset.type = 'input';
            inputPoint.dataset.id = `connection-${connectionPointIdCounter++}`;
            inputPoint.style.left = '-4px';
            inputPoint.style.top = '50%';
            inputPoint.style.transform = 'translateY(-50%)';
            clone.appendChild(inputPoint);
            
            // Tambahkan titik koneksi output
            const outputPoint = document.createElement('div');
            outputPoint.className = 'connection-point output';
            outputPoint.dataset.type = 'output';
            outputPoint.dataset.id = `connection-${connectionPointIdCounter++}`;
            outputPoint.style.right = '-4px';
            outputPoint.style.top = '50%';
            outputPoint.style.transform = 'translateY(-50%)';
            clone.appendChild(outputPoint);
            
            // Tambahkan tombol on/off untuk kunci kontak
            const ignitionSwitch = document.createElement('button');
            ignitionSwitch.className = 'ignition-switch-button';
            ignitionSwitch.textContent = 'OFF';
            ignitionSwitch.dataset.state = 'off';
            ignitionSwitch.style.padding = '4px 8px';
            ignitionSwitch.style.fontSize = '12px';
            ignitionSwitch.style.marginTop = '5px';
            ignitionSwitch.style.width = '100%';
            ignitionSwitch.style.backgroundColor = '#ff9800';
            ignitionSwitch.style.color = 'white';
            ignitionSwitch.style.border = 'none';
            ignitionSwitch.style.borderRadius = '4px';
            ignitionSwitch.style.cursor = 'pointer';
            ignitionSwitch.addEventListener('click', handleIgnitionSwitchClick);
            clone.appendChild(ignitionSwitch);
            
            inputPoint.addEventListener('click', handleConnectionPointClick);
            outputPoint.addEventListener('click', handleConnectionPointClick);
        } else if (this.dataset.component === 'headlight') {
            console.log("Creating headlight component");
            
            // Tambahkan titik koneksi input
            const inputPoint = document.createElement('div');
            inputPoint.className = 'connection-point input';
            inputPoint.dataset.type = 'input';
            inputPoint.dataset.id = `connection-${connectionPointIdCounter++}`;
            inputPoint.style.left = '-4px';
            inputPoint.style.top = '50%';
            inputPoint.style.transform = 'translateY(-50%)';
            clone.appendChild(inputPoint);
            
            // Tambahkan elemen visual lampu
            const headlightBulb = document.createElement('div');
            headlightBulb.className = 'headlight-bulb';
            clone.querySelector('.headlight-icon').appendChild(headlightBulb);
            
            inputPoint.addEventListener('click', handleConnectionPointClick);
        } else if (this.dataset.component === 'switch') {
            console.log("Creating power switch component");
            
            // Tambahkan titik koneksi input dan output
            const inputPoint = document.createElement('div');
            inputPoint.className = 'connection-point input';
            inputPoint.dataset.type = 'input';
            inputPoint.dataset.id = `connection-${connectionPointIdCounter++}`;
            inputPoint.style.left = '-4px';
            inputPoint.style.top = '50%';
            inputPoint.style.transform = 'translateY(-50%)';
            clone.appendChild(inputPoint);
            
            const outputPoint = document.createElement('div');
            outputPoint.className = 'connection-point output';
            outputPoint.dataset.type = 'output';
            outputPoint.dataset.id = `connection-${connectionPointIdCounter++}`;
            outputPoint.style.right = '-4px';
            outputPoint.style.top = '50%';
            outputPoint.style.transform = 'translateY(-50%)';
            clone.appendChild(outputPoint);
            
            // PENTING: Buat elemen visual switch jika belum ada
            if (!clone.querySelector('.switch-body')) {
                const switchBody = document.createElement('div');
                switchBody.className = 'switch-body';
                
                const switchToggle = document.createElement('div');
                switchToggle.className = 'switch-toggle';
                
                switchBody.appendChild(switchToggle);
                clone.appendChild(switchBody);
            }
            
            // Tambahkan event listener untuk koneksi dan toggle
            inputPoint.addEventListener('click', handleConnectionPointClick);
            outputPoint.addEventListener('click', handleConnectionPointClick);
            
            // Event listener untuk toggle switch
            const switchBody = clone.querySelector('.switch-body');
            if (switchBody) {
                switchBody.addEventListener('click', function() {
                    const switchComponent = this.closest('.switch');
                    switchComponent.classList.toggle('active');
                    
                    // Log status switch
                    const isActive = switchComponent.classList.contains('active');
                    console.log(`Power switch turned ${isActive ? 'ON' : 'OFF'}`);
                    
                    // Update power state
                    updatePowerState();
                });
            } else {
                console.error("Switch body element not found!");
            }
        } else if (this.dataset.component === 'speedometer') {
            console.log("Creating speedometer component");
            
            // Tambahkan titik koneksi input
            const inputPoint = document.createElement('div');
            inputPoint.className = 'connection-point input';
            inputPoint.dataset.type = 'input';
            inputPoint.dataset.id = `connection-${connectionPointIdCounter++}`;
            inputPoint.style.left = '-4px';
            inputPoint.style.top = '50%';
            inputPoint.style.transform = 'translateY(-50%)';
            clone.appendChild(inputPoint);
            
            // Pastikan elemen speedometer-light ada
            if (!clone.querySelector('.speedometer-light')) {
                console.log("Adding missing speedometer-light element");
                const iconContainer = clone.querySelector('.speedometer-icon');
                
                if (iconContainer) {
                    const speedoLight = document.createElement('div');
                    speedoLight.className = 'speedometer-light';
                    iconContainer.appendChild(speedoLight);
                } else {
                    console.error("Speedometer icon container not found!");
                    
                    // Buat dari awal jika perlu
                    const iconContainer = document.createElement('div');
                    iconContainer.className = 'speedometer-icon';
                    
                    const speedoLight = document.createElement('div');
                    speedoLight.className = 'speedometer-light';
                    
                    iconContainer.appendChild(speedoLight);
                    clone.appendChild(iconContainer);
                }
            }
            
            inputPoint.addEventListener('click', handleConnectionPointClick);
            
            // Log struktur speedometer untuk debugging
            console.log("Speedometer component created with structure:", clone.innerHTML);
        } else if (this.dataset.component === 'high-beam-switch') {
            console.log("Creating high-beam switch component");
            
            // Tambahkan titik koneksi input
            const inputPoint = document.createElement('div');
            inputPoint.className = 'connection-point input';
            inputPoint.dataset.type = 'input';
            inputPoint.dataset.id = `connection-${connectionPointIdCounter++}`;
            inputPoint.style.left = '-4px';
            inputPoint.style.top = '50%';
            inputPoint.style.transform = 'translateY(-50%)';
            clone.appendChild(inputPoint);
            
            // Tambahkan titik koneksi output
            const outputPoint = document.createElement('div');
            outputPoint.className = 'connection-point output';
            outputPoint.dataset.type = 'output';
            outputPoint.dataset.id = `connection-${connectionPointIdCounter++}`;
            outputPoint.style.right = '-4px';
            outputPoint.style.top = '50%';
            outputPoint.style.transform = 'translateY(-50%)';
            clone.appendChild(outputPoint);
            
            // Tambahkan event listener
            inputPoint.addEventListener('click', handleConnectionPointClick);
            outputPoint.addEventListener('click', handleConnectionPointClick);
            
            // Event listener untuk toggle switch
            const switchBody = clone.querySelector('.switch-body');
            switchBody.addEventListener('click', function() {
                const switchComponent = this.closest('.high-beam-switch');
                switchComponent.classList.toggle('active');
                console.log("High-beam switch toggled:", switchComponent.classList.contains('active') ? "ON (JAUH)" : "OFF (DEKAT)");
                updatePowerState();
            });
        } else if (this.dataset.component === 'high-beam-indicator') {
            console.log("Creating high beam indicator component");
            
            // Tambahkan titik koneksi input
            const inputPoint = document.createElement('div');
            inputPoint.className = 'connection-point input';
            inputPoint.dataset.type = 'input';
            inputPoint.dataset.id = `connection-${connectionPointIdCounter++}`;
            inputPoint.style.left = '-4px';
            inputPoint.style.top = '50%';
            inputPoint.style.transform = 'translateY(-50%)';
            clone.appendChild(inputPoint);
            
            // Pastikan elemen high-beam-light ada
            if (!clone.querySelector('.high-beam-light')) {
                console.log("Adding high beam light element");
                const iconContainer = clone.querySelector('.high-beam-icon');
                
                if (iconContainer) {
                    const highBeamLight = document.createElement('div');
                    highBeamLight.className = 'high-beam-light';
                    iconContainer.appendChild(highBeamLight);
                } else {
                    // Buat dari awal jika container tidak ada
                    const iconContainer = document.createElement('div');
                    iconContainer.className = 'high-beam-icon';
                    
                    const highBeamLight = document.createElement('div');
                    highBeamLight.className = 'high-beam-light';
                    
                    iconContainer.appendChild(highBeamLight);
                    clone.appendChild(iconContainer);
                }
            }
            
            inputPoint.addEventListener('click', handleConnectionPointClick);
            console.log("High beam indicator component created with structure:", clone.innerHTML);
        }
        
        clone.addEventListener('mousedown', handleMouseDown);
        clone.addEventListener('contextmenu', handleContextMenu);
        workspaceArea.appendChild(clone);
    }

    function handleContextMenu(e) {
        e.preventDefault();
        const component = e.currentTarget;

        // Remove associated connections
        const points = component.querySelectorAll('.connection-point');
        points.forEach(point => {
            connections = connections.filter(conn => {
                if (conn.startPoint === point || conn.endPoint === point) {
                    conn.wire.remove();
                    return false;
                }
                return true;
            });
        });

        component.remove();
        updatePowerState();
    }

    function handleMouseDown(e) {
        // Handle both mouse and touch events
        if (e.button !== undefined && e.button !== 0 && !e.touches) return; // Only left mouse button or touchstart
        if (e.target.classList.contains('voltage-input')) return;
        if (e.target.classList.contains('connection-point')) return;
        if (e.target.classList.contains('ignition-switch-button')) return;
        // Add other button classes if necessary

        // Prevent default touch behavior (like scrolling)
        if (e.cancelable) {
            e.preventDefault();
        }

        const component = e.currentTarget;
        let isDragging = true;
        // Use the first touch point or mouse coordinates
        let startX = (e.touches ? e.touches[0].clientX : e.clientX) - component.offsetLeft;
        let startY = (e.touches ? e.touches[0].clientY : e.clientY) - component.offsetTop;

        function handleMove(ev) {
            if (!isDragging) return;
            // Prevent default touch behavior (like scrolling)
            if (ev.cancelable) {
               ev.preventDefault();
            }
            const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
            const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
            const newX = clientX - startX;
            const newY = clientY - startY;

            component.style.left = `${newX}px`;
            component.style.top = `${newY}px`;

            // Update connected wires
            const points = component.querySelectorAll('.connection-point');
            points.forEach(point => {
                connections.forEach(conn => {
                    if (conn.startPoint === point || conn.endPoint === point) {
                        updateWirePosition(conn);
                    }
                });
            });
        }

        function handleUp() {
            isDragging = false;
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleUp);
        }

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', handleUp);
    }

    function showColorPicker(callback) {
        const colors = ['red', 'blue', 'green', 'yellow', 'black', 'purple'];
        const dialog = document.createElement('div');
        dialog.className = 'color-picker-dialog';
        dialog.innerHTML = `
            <div class="color-picker-content">
                <h3>Pilih Warna Kabel</h3>
                <div class="color-options"></div>
            </div>
        `;

        const colorOptions = dialog.querySelector('.color-options');
        colors.forEach(color => {
            const option = document.createElement('div');
            option.className = 'color-option';
            option.style.backgroundColor = color;
            option.addEventListener('click', () => {
                dialog.remove();
                callback(color);
            });
            colorOptions.appendChild(option);
        });

        document.body.appendChild(dialog);
    }

    function handleConnectionPointClick(event) {
        const point = event.target;
        
        // Pastikan point memiliki ID
        if (!point.dataset.id) {
            console.error("Connection point missing ID! Creating one now.");
            point.dataset.id = `connection-${connectionPointIdCounter++}`;
        }
        
        console.log("Connection point clicked:", point.dataset.id, "Type:", point.dataset.type);
        
        if (!selectedPoint) {
            selectedPoint = point;
            point.classList.add('selected');
        } else if (selectedPoint !== point && selectedPoint.dataset.type !== point.dataset.type) {
            showColorPicker(color => {
                // Batasi koneksi ke massa hanya dari kutub negatif baterai
                const isMassa = (selectedPoint.closest('.component')?.classList.contains('massa') || point.closest('.component')?.classList.contains('massa'));
                if (isMassa) {
                    // Salah satu ujung harus kutub negatif baterai
                    const isNegBat = (selectedPoint.classList.contains('negative') || point.classList.contains('negative'));
                    if (!isNegBat) {
                        alert('Massa hanya boleh dihubungkan ke kutub negatif baterai!');
                        selectedPoint.classList.remove('selected');
                        selectedPoint = null;
                        return;
                    }
                }
                // Create wire connection
                const wire = document.createElement('div');
                wire.className = 'wire';
                wire.style.backgroundColor = color;
                wire.dataset.id = `wire-${wireIdCounter++}`;
                wire.dataset.source = selectedPoint.dataset.id;
                wire.dataset.target = point.dataset.id;
                workspaceArea.appendChild(wire);

                const connection = {
                    wire,
                    startPoint: selectedPoint.dataset.type === 'output' ? selectedPoint : point,
                    endPoint: selectedPoint.dataset.type === 'output' ? point : selectedPoint,
                    color: color
                };

                connections.push(connection);
                updateWirePosition(connection);
                updatePowerState();

                // Reset selection
                selectedPoint.classList.remove('selected');
                selectedPoint = null;
            });
        } else {
            selectedPoint.classList.remove('selected');
            selectedPoint = null;
        }
    }

    function updateWirePosition(connection) {
        const startRect = connection.startPoint.getBoundingClientRect();
        const endRect = connection.endPoint.getBoundingClientRect();
        const workspaceRect = workspaceArea.getBoundingClientRect();

        const startX = startRect.left + startRect.width / 2 - workspaceRect.left;
        const startY = startRect.top + startRect.height / 2 - workspaceRect.top;
        const endX = endRect.left + endRect.width / 2 - workspaceRect.left;
        const endY = endRect.top + endRect.height / 2 - workspaceRect.top;

        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angle = Math.atan2(deltaY, deltaX);

        connection.wire.style.left = `${startX}px`;
        connection.wire.style.top = `${startY}px`;
        connection.wire.style.width = `${length}px`;
        connection.wire.style.transform = `rotate(${angle}rad)`;
    }

    function updatePowerState() {
        console.log("=== DEBUGGING UPDATE POWER STATE ===");
        
        // Reset semua komponen dan wire
        const wires = Array.from(workspaceArea.querySelectorAll('.wire'));
        const batteries = Array.from(workspaceArea.querySelectorAll('.battery'));
        const fuses = Array.from(workspaceArea.querySelectorAll('.fuse'));
        const ignitionKeys = Array.from(workspaceArea.querySelectorAll('.ignition-key'));
        const headlights = Array.from(workspaceArea.querySelectorAll('.headlight'));
        const speedometers = Array.from(workspaceArea.querySelectorAll('.speedometer'));
        const highBeamIndicators = Array.from(workspaceArea.querySelectorAll('.high-beam-indicator'));
        const highBeamSwitches = Array.from(workspaceArea.querySelectorAll('.high-beam-switch'));
        const powerSwitches = Array.from(workspaceArea.querySelectorAll('.switch:not(.high-beam-switch)'));
        
        // Reset semua status komponen
        wires.forEach(wire => wire.classList.remove('powered'));
        headlights.forEach(headlight => {
            const headlightBulb = headlight.querySelector('.headlight-bulb');
            if (headlightBulb) {
                headlightBulb.classList.remove('powered', 'high-beam');
                headlightBulb.style.backgroundColor = '#777';
                headlightBulb.style.boxShadow = 'none';
            }
        });
        speedometers.forEach(speedometer => {
            const speedoLight = speedometer.querySelector('.speedometer-light');
            if (speedoLight) {
                speedoLight.classList.remove('powered');
                speedoLight.style.backgroundColor = '#777';
                speedoLight.style.boxShadow = 'none';
            }
        });
        highBeamIndicators.forEach(indicator => {
            const indicatorLight = indicator.querySelector('.high-beam-light');
            if (indicatorLight) {
                indicatorLight.classList.remove('powered');
                indicatorLight.style.backgroundColor = '#777';
                indicatorLight.style.boxShadow = 'none';
            }
        });
        
        // Check if ignition key is ON
        if (!ignitionKeyState) {
            showDebugMessage('Kunci kontak dalam posisi OFF. Nyalakan kunci kontak terlebih dahulu.');
            return;
        }
        
        console.log("Komponen terdeteksi:", {
            "batteries": batteries.length,
            "fuses": fuses.length,
            "ignitionKeys": ignitionKeys.length,
            "headlights": headlights.length,
            "speedometers": speedometers.length,
            "highBeamIndicators": highBeamIndicators.length,
            "highBeamSwitches": highBeamSwitches.length,
            "powerSwitches": powerSwitches.length,
            "wires": wires.length
        });
        
        // Cek tegangan baterai
        let validVoltage = false;
        let currentVoltage = 0;
        
        batteries.forEach(battery => {
            const voltageInput = battery.querySelector('.voltage-input');
            const voltage = parseFloat(voltageInput.value) || 0;
            currentVoltage = voltage;
            
            if (voltage === 12) {
                validVoltage = true;
                console.log("Battery voltage is correct (12V)");
            } else if (voltage > 12) {
                console.log(`Battery voltage is too high (${voltage}V)`);
                showDebugMessage(`Tegangan terlalu tinggi (${voltage}V)! Fuse akan putus.`, false);
                // Putuskan semua fuse
                fuses.forEach(fuse => {
                    fuse.classList.add('blown');
                    console.log("Fuse blown due to high voltage");
                });
                return;
            } else {
                console.log(`Battery voltage is incorrect (${voltage}V)`);
                showDebugMessage(`Tegangan baterai harus tepat 12V (saat ini: ${voltage}V)`, false);
                return;
            }
        });
        
        if (!validVoltage) {
            return;
        }
        
        // Cek koneksi wire
        const wireConnections = [];
        wires.forEach(wire => {
            const sourceId = wire.dataset.source;
            const targetId = wire.dataset.target;
            
            const sourcePoint = document.querySelector(`[data-id="${sourceId}"]`);
            const targetPoint = document.querySelector(`[data-id="${targetId}"]`);
            
            if (sourcePoint && targetPoint) {
                const sourceComponent = sourcePoint.closest('.component');
                const targetComponent = targetPoint.closest('.component');
                
                if (sourceComponent && targetComponent) {
                    wireConnections.push({
                        wire: wire,
                        sourceComponent: sourceComponent,
                        targetComponent: targetComponent,
                        sourcePoint: sourcePoint,
                        targetPoint: targetPoint
                    });
                    
                    console.log(`Wire connection: ${sourceComponent.dataset.component} -> ${targetComponent.dataset.component}`);
                }
            }
        });
        
        // Cek koneksi ke speedometer
        speedometers.forEach((speedometer, index) => {
            const connections = wireConnections.filter(conn => 
                conn.sourceComponent === speedometer || conn.targetComponent === speedometer
            );
            
            console.log(`Speedometer #${index+1} memiliki ${connections.length} koneksi wire`);
            connections.forEach(conn => {
                const otherComponent = conn.sourceComponent === speedometer ? 
                    conn.targetComponent : conn.sourceComponent;
                console.log(`  - Terhubung ke: ${otherComponent.dataset.component}`);
            });
        });
        
        // Daftar untuk melacak komponen yang terhubung ke daya
        const poweredComponents = new Set();
        
        // Fungsi untuk menemukan komponen yang terhubung
        function traceConnections(component, visited = new Set(), pathBlocked = false) {
            if (visited.has(component)) return;
            visited.add(component);
            
            console.log(`Visiting component: ${component.dataset.component}, blocked path: ${pathBlocked}`);
            
            // Jika jalur tidak diblokir, tandai komponen sebagai bertenaga
            if (!pathBlocked) {
                poweredComponents.add(component);
                console.log(`Added ${component.dataset.component} to powered components`);
            }
            
            // Cek apakah komponen ini adalah switch on/off yang mati
            let nextPathBlocked = pathBlocked;
            
            if (component.classList.contains('switch') && !component.classList.contains('high-beam-switch')) {
                const isSwitchActive = component.classList.contains('active');
                const isSwitchOff = !isSwitchActive;
                
                console.log(`Power switch is: ${isSwitchActive ? 'ON' : 'OFF'}`);
                
                if (isSwitchOff) {
                    nextPathBlocked = true;
                    console.log(`Switch ${component.dataset.component} is OFF, blocking path`);
                } else {
                    console.log(`Switch ${component.dataset.component} is ON, path remains open`);
                }
            }
            
            // Cek apakah komponen ini adalah fuse yang putus
            if (component.classList.contains('fuse') && component.classList.contains('blown')) {
                nextPathBlocked = true;
                console.log(`Fuse is blown, blocking path`);
            }
            
            // Lanjutkan trace ke komponen lain yang terhubung
            wireConnections.forEach(connection => {
                if (connection.sourceComponent === component) {
                    traceConnections(connection.targetComponent, visited, nextPathBlocked);
                } else if (connection.targetComponent === component) {
                    traceConnections(connection.sourceComponent, visited, nextPathBlocked);
                }
            });
        }
        
        // Mulai dari baterai
        batteries.forEach(battery => {
            console.log("Tracing connections from battery");
            traceConnections(battery);
        });
        
        console.log("Powered components:", Array.from(poweredComponents).map(comp => comp.dataset.component));
        
        // Cek speedometer dalam komponen bertenaga
        const connectedSpeedometers = Array.from(poweredComponents).filter(comp => comp.classList.contains('speedometer'));
        console.log(`Speedometers connected to power: ${connectedSpeedometers.length}`);
        
        // Aktifkan wire yang terhubung
        wireConnections.forEach(connection => {
            if (
                poweredComponents.has(connection.sourceComponent) && 
                poweredComponents.has(connection.targetComponent)
            ) {
                connection.wire.classList.add('powered');
            }
        });
        
        // === BAGIAN PENTING: NYALAKAN SPEEDOMETER ===
        
        // Nyalakan speedometer yang terhubung ke daya
        speedometers.forEach(speedometer => {
            if (poweredComponents.has(speedometer)) {
                console.log("Power detected at speedometer - turning on");
                
                const speedoLight = speedometer.querySelector('.speedometer-light');
                if (speedoLight) {
                    speedoLight.classList.add('powered');
                    speedoLight.style.backgroundColor = '#00FFFF'; // Cyan
                    speedoLight.style.boxShadow = '0 0 10px #00FFFF, 0 0 20px rgba(0, 255, 255, 0.8)';
                    console.log("Speedometer light activated with cyan color");
                } else {
                    console.error("Speedometer light element not found!");
                }
            } else {
                console.log("Speedometer not connected to power");
            }
        });
        
        // ==== BAGIAN PENTING: LAMPU JAUH/DEKAT ====
        
        // Cek mode lampu jauh berdasarkan switch
        let highBeamMode = false;
        
        highBeamSwitches.forEach(switchComp => {
            if (poweredComponents.has(switchComp) && switchComp.classList.contains('active')) {
                highBeamMode = true;
                console.log("High beam mode activated via switch");
            }
        });
        
        // Nyalakan lampu yang terhubung ke daya
        headlights.forEach(headlight => {
            // Jika lampu terhubung ke daya (baterai → switch (jika on) → lampu)
            if (poweredComponents.has(headlight)) {
                console.log("Power detected at headlight - turning on");
                
                const headlightBulb = headlight.querySelector('.headlight-bulb');
                if (headlightBulb) {
                    headlightBulb.classList.add('powered');
                    
                    if (highBeamMode) {
                        // Mode lampu jauh
                        headlightBulb.classList.add('high-beam');
                        headlightBulb.style.backgroundColor = '#FFFFFF'; // Putih terang
                        headlightBulb.style.boxShadow = '0 0 15px #FFFFFF, 0 0 25px rgba(255, 255, 255, 0.9), 0 0 40px rgba(255, 255, 255, 0.7)';
                        console.log("Applied high beam effect");
                    } else {
                        // Mode lampu dekat
                        headlightBulb.classList.remove('high-beam');
                        headlightBulb.style.backgroundColor = '#F5F5DC'; // Warna normal
                        headlightBulb.style.boxShadow = '0 0 10px #F5F5DC, 0 0 15px rgba(245, 245, 220, 0.7)';
                        console.log("Applied low beam effect");
                    }
                }
            } else {
                console.log("Headlight not connected to power");
            }
        });
        
        // Tambahkan logging visual status switch untuk memastikan
        powerSwitches.forEach(switchComp => {
            console.log(`Power switch status visual check: ${switchComp.classList.contains('active') ? 'ON' : 'OFF'}`);
            // Cek apakah switch memiliki elemen toggle yang aktif
            const toggleElement = switchComp.querySelector('.switch-toggle');
            if (toggleElement) {
                console.log(`Toggle position: ${getComputedStyle(toggleElement).transform}`);
            }
        });
        
        // Nyalakan indikator lampu jauh HANYA jika mode lampu jauh aktif DAN terhubung ke daya
        highBeamIndicators.forEach(indicator => {
            if (poweredComponents.has(indicator)) {
                const indicatorLight = indicator.querySelector('.high-beam-light');
                
                if (indicatorLight) {
                    // Indikator terhubung ke daya, tapi hanya nyala jika mode lampu jauh aktif
                    if (highBeamMode) {
                        console.log("High beam indicator activated - high beam mode ON");
                        indicatorLight.classList.add('powered');
                        indicatorLight.style.backgroundColor = '#0066FF'; // Biru terang
                        indicatorLight.style.boxShadow = '0 0 10px #0066FF, 0 0 20px rgba(0, 102, 255, 0.8)';
                    } else {
                        console.log("High beam indicator connected but not lit - high beam mode OFF");
                    }
                }
            } else {
                console.log("High beam indicator not connected to power");
            }
        });
        
        console.log("=== END DEBUGGING ===");
    }

    function getComponentConnections(component) {
        if (!component) return [];
        
        const connections = [];
        const wires = Array.from(workspaceArea.querySelectorAll('.wire'));
        
        // Dapatkan semua titik koneksi di komponen
        const connectionPoints = Array.from(component.querySelectorAll('.connection-point'));
        
        connectionPoints.forEach(point => {
            const pointId = point.dataset.id;
            
            // Cari wire yang terhubung ke titik ini
            wires.forEach(wire => {
                if (wire.dataset.source === pointId) {
                    const targetPoint = document.querySelector(`[data-id="${wire.dataset.target}"]`);
                    if (targetPoint) {
                        connections.push({
                            source: point,
                            target: targetPoint,
                            wire: wire
                        });
                    }
                } else if (wire.dataset.target === pointId) {
                    const sourcePoint = document.querySelector(`[data-id="${wire.dataset.source}"]`);
                    if (sourcePoint) {
                        connections.push({
                            source: sourcePoint,
                            target: point,
                            wire: wire
                        });
                    }
                }
            });
        });
        
        return connections;
    }

    function initializeSimulation() {
        // Reset counter
        connectionPointIdCounter = 1;
        wireIdCounter = 1;
        
        // Berikan id baru ke semua connection point yang sudah ada
        const existingPoints = document.querySelectorAll('.connection-point');
        existingPoints.forEach(point => {
            point.dataset.id = `connection-${connectionPointIdCounter++}`;
        });
        
        console.log("Simulation initialized with fresh IDs");
    }

    // Panggil fungsi ini saat halaman dimuat
    initializeSimulation();

    // Perbaikan inisialisasi: assign ID ke semua connection point yang sudah ada
    function fixAllConnectionPoints() {
        const allConnectionPoints = document.querySelectorAll('.connection-point');
        allConnectionPoints.forEach(point => {
            if (!point.dataset.id) {
                point.dataset.id = `connection-${connectionPointIdCounter++}`;
                console.log(`Fixed missing ID for ${point.dataset.type} point:`, point.dataset.id);
            }
        });
    }

    // Panggil fungsi ini setelah DOM dimuat dan juga setiap kali updatePowerState dipanggil
    window.addEventListener('DOMContentLoaded', fixAllConnectionPoints);

    // Modifikasi fungsi updatePowerState untuk memanggil fixAllConnectionPoints di awal
    const originalUpdatePowerState = updatePowerState;
    updatePowerState = function() {
        fixAllConnectionPoints(); // Pastikan semua titik koneksi memiliki ID
        originalUpdatePowerState(); // Panggil fungsi asli
    };

    // Fix aktifasi toggle secara manual
    // Tambahkan fungsi ini untuk debug dan panggil dari konsol jika diperlukan
    function togglePowerSwitch() {
        const switches = Array.from(workspaceArea.querySelectorAll('.switch:not(.high-beam-switch)'));
        
        switches.forEach(switchComp => {
            switchComp.classList.toggle('active');
            const isActive = switchComp.classList.contains('active');
            console.log(`Power switch toggled to: ${isActive ? 'ON' : 'OFF'}`);
            
            // Geser toggle secara visual
            const toggle = switchComp.querySelector('.switch-toggle');
            if (toggle) {
                toggle.style.transform = isActive ? 'translateX(20px)' : 'translateX(0)';
            }
        });
        
        updatePowerState();
    }

    // Add ignition switch click handler
    function handleIgnitionSwitchClick(e) {
        e.stopPropagation();
        const button = e.target;
        
        if (button.dataset.state === 'off') {
            button.dataset.state = 'on';
            button.textContent = 'ON';
            button.style.backgroundColor = '#4CAF50';
            ignitionKeyState = true;
        } else {
            button.dataset.state = 'off';
            button.textContent = 'OFF';
            button.style.backgroundColor = '#ff9800';
            ignitionKeyState = false;
        }
        
        updatePowerState();
    }

    // Komponen Massa: hanya satu connection point (input), hanya bisa dihubungkan ke kutub negatif baterai
    function setupMassa(clone) {
        const inputPoint = document.createElement('div');
        inputPoint.className = 'connection-point input';
        inputPoint.dataset.type = 'input';
        inputPoint.style.left = '-4px';
        inputPoint.style.top = '50%';
        inputPoint.style.transform = 'translateY(-50%)';
        clone.appendChild(inputPoint);
        inputPoint.addEventListener('click', handleConnectionPointClick);
    }
});
