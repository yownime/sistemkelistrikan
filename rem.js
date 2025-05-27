document.addEventListener('DOMContentLoaded', () => {
    const components = document.querySelectorAll('.component');
    const workspaceArea = document.getElementById('workspace-area');
    let selectedPoint = null;
    let connections = [];
    let connectionPointIdCounter = 0;
    let brakeStates = {
        front: false,
        rear: false
    };

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
            // Add positive terminal (output)
            const positivePoint = document.createElement('div');
            positivePoint.className = 'connection-point output positive';
            positivePoint.dataset.type = 'output';
            positivePoint.dataset.polarity = 'positive';
            clone.appendChild(positivePoint);
            positivePoint.addEventListener('click', handleConnectionPointClick);

            // Add negative terminal (output)
            const negativePoint = document.createElement('div');
            negativePoint.className = 'connection-point output negative';
            negativePoint.dataset.type = 'output';
            negativePoint.dataset.polarity = 'negative';
            clone.appendChild(negativePoint);
            negativePoint.addEventListener('click', handleConnectionPointClick);

            // Only add voltage control to battery
            const voltageControl = document.createElement('div');
            voltageControl.className = 'voltage-control';
            voltageControl.innerHTML = `
                <input type="number" min="0" max="12" step="0.1" value="12.0" class="voltage-input">
                <span>V</span>
            `;
            clone.appendChild(voltageControl);

            const input = voltageControl.querySelector('.voltage-input');
            const batteryLevel = clone.querySelector('.battery-level');

            input.addEventListener('input', (e) => {
                let value = parseFloat(e.target.value);
                if (isNaN(value)) value = 0;
                if (value < 0) value = 0;
                if (value > 12) value = 12;
                
                const percentage = (value / 12) * 100;
                batteryLevel.style.width = `${percentage}%`;
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
        } else if (this.dataset.component === 'light') {
            const inputPoint = document.createElement('div');
            inputPoint.className = 'connection-point input';
            inputPoint.dataset.type = 'input';
            clone.appendChild(inputPoint);
            inputPoint.addEventListener('click', handleConnectionPointClick);
        } else if (this.dataset.component === 'brake-switch-front' || this.dataset.component === 'brake-switch-rear') {
            // Add input/output points for brake switch
            const inputPoint = document.createElement('div');
            inputPoint.className = 'connection-point input';
            inputPoint.dataset.type = 'input';
            clone.appendChild(inputPoint);
            inputPoint.addEventListener('click', handleConnectionPointClick);

            const outputPoint = document.createElement('div');
            outputPoint.className = 'connection-point output';
            outputPoint.dataset.type = 'output';
            clone.appendChild(outputPoint);
            outputPoint.addEventListener('click', handleConnectionPointClick);

            // Add switch functionality
            const switchButton = document.createElement('button');
            switchButton.className = 'brake-switch-button';
            switchButton.textContent = this.dataset.component === 'brake-switch-front' ? 'Front Brake' : 'Rear Brake';
            clone.appendChild(switchButton);

            const switchType = this.dataset.component === 'brake-switch-front' ? 'front' : 'rear';
            
            switchButton.addEventListener('mousedown', () => {
                brakeStates[switchType] = true;
                switchButton.classList.add('pressed');
                updatePowerState();
            });

            switchButton.addEventListener('mouseup', () => {
                brakeStates[switchType] = false;
                switchButton.classList.remove('pressed');
                updatePowerState();
            });

            switchButton.addEventListener('mouseleave', () => {
                if (brakeStates[switchType]) {
                    brakeStates[switchType] = false;
                    switchButton.classList.remove('pressed');
                    updatePowerState();
                }
            });
        } else if (this.dataset.component === 'socket') {
            // Add red terminal (input/output)
            const redPoint = document.createElement('div');
            redPoint.className = 'connection-point input red';
            redPoint.dataset.type = 'input';
            redPoint.dataset.color = 'red';
            redPoint.style.left = '-4px';
            redPoint.style.top = '4px';
            clone.appendChild(redPoint);
            redPoint.addEventListener('click', handleConnectionPointClick);

            // Add black terminal (input/output)
            const blackPoint = document.createElement('div');
            blackPoint.className = 'connection-point output black';
            blackPoint.dataset.type = 'output';
            blackPoint.dataset.color = 'black';
            blackPoint.style.left = '-4px';
            blackPoint.style.top = '12px';
            clone.appendChild(blackPoint);
            blackPoint.addEventListener('click', handleConnectionPointClick);

            // Add green terminal (output)
            const greenPoint = document.createElement('div');
            greenPoint.className = 'connection-point output green';
            greenPoint.dataset.type = 'output';
            greenPoint.dataset.color = 'green';
            greenPoint.style.right = '-4px';
            greenPoint.style.top = '8px';
            clone.appendChild(greenPoint);
            greenPoint.addEventListener('click', handleConnectionPointClick);
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
        if (e.target.classList.contains('brake-switch-button')) return;
        // if (e.target.classList.contains('socket-switch-button')) return; // Uncomment if socket has a button

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
        const colors = ['red', 'blue', 'green', 'yellow', 'black', 'orange', 'brown', 'gray', 'white'];
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

    function handleConnectionPointClick(e) {
        e.stopPropagation();
        const point = e.target;

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

    function handleSocketConnections() {
        const sockets = Array.from(workspaceArea.querySelectorAll('.socket'));
        const lights = Array.from(workspaceArea.querySelectorAll('.light'));
        const batteries = Array.from(workspaceArea.querySelectorAll('.battery'));
        const fuses = Array.from(workspaceArea.querySelectorAll('.fuse'));
        const brakeSwitches = Array.from(workspaceArea.querySelectorAll('.brake-switch'));

        console.log('-------- DEBUG: CIRCUIT STATUS --------');
        console.log('Components found:');
        console.log('- Sockets:', sockets.length);
        console.log('- Lights:', lights.length);
        console.log('- Batteries:', batteries.length);
        console.log('- Fuses:', fuses.length);
        console.log('- Brake Switches:', brakeSwitches.length);
        console.log('- Total connections:', connections.length);
        
        console.log('Brake switch states:');
        console.log('- Front brake pressed:', brakeStates.front);
        console.log('- Rear brake pressed:', brakeStates.rear);

        batteries.forEach(battery => {
            const batteryPositive = battery.querySelector('.connection-point.positive');
            const batteryNegative = battery.querySelector('.connection-point.negative');
            const voltage = parseFloat(battery.querySelector('.voltage-input').value) || 0;
            
            console.log('\nChecking battery:');
            console.log('- Voltage:', voltage);
            console.log('- Has positive terminal:', batteryPositive !== null);
            console.log('- Has negative terminal:', batteryNegative !== null);
            
            if (voltage !== 12) {
                console.log('- ISSUE: Battery voltage is not 12V');
                return;
            }

            sockets.forEach(socket => {
                console.log('\nChecking socket:');
                const socketRed = socket.querySelector('.connection-point.red');
                const socketBlack = socket.querySelector('.connection-point.black');
                const socketGreen = socket.querySelector('.connection-point.green');
                
                console.log('- Has red point:', socketRed !== null);
                console.log('- Has black point:', socketBlack !== null);
                console.log('- Has green point:', socketGreen !== null);

                // Cek koneksi baterai ke socket (langsung atau melalui fuse)
                let batteryToSocketConnection = null;
                let hasFuse = false;
                
                connections.forEach(conn => {
                    const startParent = conn.startPoint.parentElement;
                    const endParent = conn.endPoint.parentElement;
                    
                    // Cek koneksi langsung baterai-socket
                    if ((startParent === battery && endParent === socket) || 
                        (startParent === socket && endParent === battery)) {
                        batteryToSocketConnection = conn;
                        console.log('Direct battery-socket connection found:', conn);
                    }
                    
                    // Cek koneksi melalui fuse
                    fuses.forEach(fuse => {
                        if ((startParent === battery && endParent === fuse) || 
                            (startParent === fuse && endParent === battery)) {
                            // Cek koneksi fuse ke socket
                            connections.forEach(conn2 => {
                                if ((conn2.startPoint.parentElement === fuse && conn2.endPoint.parentElement === socket) ||
                                    (conn2.startPoint.parentElement === socket && conn2.endPoint.parentElement === fuse)) {
                                    batteryToSocketConnection = conn;
                                    hasFuse = true;
                                    console.log('Battery-socket connection through fuse found:', conn);
                                }
                            });
                        }
                    });
                });
                
                console.log('- Any battery-socket connection:', batteryToSocketConnection !== null);
                console.log('- Connection through fuse:', hasFuse);
                
                if (!batteryToSocketConnection) {
                    console.log('- ISSUE: No connection between battery and socket');
                    return;
                }

                // Instead of checking each brake switch separately, collect all connected switches first
                // and then check if any of them are pressed
                let connectedSwitches = [];
                let anyConnectedSwitchPressed = false;

                brakeSwitches.forEach(brakeSwitch => {
                    console.log('\nChecking brake switch:');
                    const switchInput = brakeSwitch.querySelector('.connection-point.input');
                    const switchOutput = brakeSwitch.querySelector('.connection-point.output');
                    const switchType = brakeSwitch.dataset.component === 'brake-switch-front' ? 'front' : 'rear';
                    const isSwitchPressed = brakeStates[switchType];
                    
                    console.log('- Switch type:', switchType);
                    console.log('- Has input point:', switchInput !== null);
                    console.log('- Has output point:', switchOutput !== null);
                    console.log('- Is pressed:', isSwitchPressed);

                    // More flexible connection check for socket-brake switch - just need ONE connection
                    let socketToSwitchConnection = null;
                    
                    connections.forEach(conn => {
                        const startParent = conn.startPoint.parentElement;
                        const endParent = conn.endPoint.parentElement;
                        
                        // Check for any socket-switch connection
                        if ((startParent === socket && endParent === brakeSwitch) || 
                            (startParent === brakeSwitch && endParent === socket)) {
                            socketToSwitchConnection = conn;
                            console.log('Socket-brake switch connection found:', conn);
                        }
                    });
                    
                    console.log('- Socket-switch connection:', socketToSwitchConnection !== null);
                    
                    if (socketToSwitchConnection) {
                        // Add this switch to the connected switches list
                        connectedSwitches.push({
                            switch: brakeSwitch,
                            connection: socketToSwitchConnection,
                            pressed: isSwitchPressed
                        });
                        
                        // If any connected switch is pressed, set the flag
                        if (isSwitchPressed) {
                            anyConnectedSwitchPressed = true;
                        }
                    }
                });
                
                console.log(`- Total connected switches: ${connectedSwitches.length}`);
                
                // Print details of each connected switch
                connectedSwitches.forEach((info, index) => {
                    console.log(`  Switch ${index + 1}: type=${info.switch.dataset.component}, pressed=${info.pressed}`);
                });
                
                console.log(`- Any connected switch pressed: ${anyConnectedSwitchPressed}`);
                
                // If no switches are connected to the socket, show an error
                if (connectedSwitches.length === 0) {
                    console.log('- ISSUE: No brake switches connected to socket');
                    return;
                }

                lights.forEach(light => {
                    console.log('\nChecking light:');
                    const lightInput = light.querySelector('.connection-point.input');
                    console.log('- Has input point:', lightInput !== null);

                    // More flexible connection check for socket/switch to light
                    let socketOrSwitchToLightConnection = null;
                    
                    connections.forEach(conn => {
                        const startParent = conn.startPoint.parentElement;
                        const endParent = conn.endPoint.parentElement;
                        
                        // Check for any connection between socket and light
                        if ((startParent === socket && endParent === light) || 
                            (startParent === light && endParent === socket)) {
                            socketOrSwitchToLightConnection = conn;
                            console.log('Socket to light connection found:', conn);
                        }
                        
                        // Check for any connection between any of the connected brake switches and light
                        connectedSwitches.forEach(switchInfo => {
                            if ((startParent === switchInfo.switch && endParent === light) || 
                                (startParent === light && endParent === switchInfo.switch)) {
                                socketOrSwitchToLightConnection = conn;
                                console.log('Brake switch to light connection found:', conn);
                            }
                        });
                    });
                    
                    console.log('- Socket or Switch to light connection:', socketOrSwitchToLightConnection !== null);
                    
                    if (!socketOrSwitchToLightConnection) {
                        console.log('- ISSUE: No connection between socket/switch and light');
                        return;
                    }

                    // More flexible connection check for battery to light
                    let batteryToLightConnection = null;
                    
                    connections.forEach(conn => {
                        const startParent = conn.startPoint.parentElement;
                        const endParent = conn.endPoint.parentElement;
                        
                        // Check for any connection between battery and light
                        if ((startParent === battery && endParent === light) || 
                            (startParent === light && endParent === battery)) {
                            batteryToLightConnection = conn;
                            console.log('Battery to light connection found:', conn);
                        }
                    });
                    
                    console.log('- Battery to light connection:', batteryToLightConnection !== null);
                    
                    if (!batteryToLightConnection) {
                        console.log('- ISSUE: No connection between battery and light');
                        return;
                    }

                    if (socketOrSwitchToLightConnection && batteryToLightConnection) {
                        console.log('\n*** Complete circuit detected ***');
                        
                        // Set wires to powered state
                        batteryToSocketConnection.wire.classList.add('powered');
                        batteryToLightConnection.wire.classList.add('powered');
                        
                        // Power all connected switch wires
                        connectedSwitches.forEach(switchInfo => {
                            switchInfo.connection.wire.classList.add('powered');
                        });
                        
                        if (anyConnectedSwitchPressed) {
                            console.log('*** At least one brake switch is pressed, light should be on ***');
                            socketOrSwitchToLightConnection.wire.classList.add('powered');
                            
                            // IMPORTANT: Get the light bulb and ensure it's lit up
                            const lightBulb = light.querySelector('.light-bulb');
                            if (lightBulb) {
                                console.log('- Light bulb element found, applying powered styles');
                                // Apply light styles DIRECTLY, not just through class
                                lightBulb.classList.add('powered');
                                lightBulb.style.backgroundColor = '#FFD700'; // Bright yellow
                                lightBulb.style.boxShadow = '0 0 20px #FFD700, 0 0 40px #FFD700'; // Glow effect
                                lightBulb.style.border = '2px solid #FFA500'; // Orange border
                                
                                // Force a reflow to apply styles
                                void lightBulb.offsetWidth;
                            } else {
                                console.log('- ISSUE: Light bulb element not found');
                            }
                        } else {
                            console.log('*** No brake switches pressed, light should be off ***');
                            socketOrSwitchToLightConnection.wire.classList.remove('powered');
                            
                            const lightBulb = light.querySelector('.light-bulb');
                            if (lightBulb) {
                                console.log('- Removing powered styles from light bulb');
                                lightBulb.classList.remove('powered');
                                lightBulb.style.backgroundColor = '';
                                lightBulb.style.boxShadow = '';
                                lightBulb.style.border = '';
                                
                                // Force a reflow to apply styles
                                void lightBulb.offsetWidth;
                            } else {
                                console.log('- ISSUE: Light bulb element not found');
                            }
                        }
                    } else {
                        console.log('- ISSUE: Circuit incomplete - missing connections');
                    }
                });
            });
        });
        
        console.log('-------- END DEBUG --------');
    }

    function updatePowerState() {
        console.log('Updating power state...');
        const batteries = Array.from(workspaceArea.querySelectorAll('.battery'));
        const lights = Array.from(workspaceArea.querySelectorAll('.light'));

        console.log('Number of batteries:', batteries.length);
        console.log('Number of lights:', lights.length);
        
        lights.forEach(light => {
            const lightBulb = light.querySelector('.light-bulb');
            console.log('Light bulb found:', lightBulb !== null);
        });
        
        batteries.forEach(battery => {
            const voltage = parseFloat(battery.querySelector('.voltage-input').value) || 0;
            console.log('Battery voltage:', voltage);
            
            if (voltage !== 12) {
                console.log('Battery voltage is not 12V, no power flow');
                return;
            }

            const positiveTerminal = battery.querySelector('.connection-point.positive');
            const negativeTerminal = battery.querySelector('.connection-point.negative');

            lights.forEach(light => {
                const lightInput = light.querySelector('.connection-point.input');

                const positiveConnection = connections.find(conn =>
                    (conn.startPoint === positiveTerminal && conn.endPoint === lightInput) ||
                    (conn.startPoint === lightInput && conn.endPoint === positiveTerminal)
                );

                const negativeConnection = connections.find(conn =>
                    (conn.startPoint === negativeTerminal && conn.endPoint === lightInput) ||
                    (conn.startPoint === lightInput && conn.endPoint === negativeTerminal)
                );

                console.log('Checking connections for light...');
                console.log('Positive terminal:', positiveTerminal !== null);
                console.log('Negative terminal:', negativeTerminal !== null);
                console.log('Light input:', lightInput !== null);
                console.log('Positive connection exists:', positiveConnection !== undefined);
                console.log('Negative connection exists:', negativeConnection !== undefined);

                if (positiveConnection && negativeConnection) {
                    console.log('Light should be powered on.');
                    positiveConnection.wire.classList.add('powered');
                    negativeConnection.wire.classList.add('powered');
                    const lightBulb = light.querySelector('.light-bulb');
                    if (lightBulb) {
                        console.log('Adding powered class to light bulb.');
                        lightBulb.classList.add('powered');
                        lightBulb.style.backgroundColor = '#FFD700';
                        lightBulb.style.boxShadow = '0 0 20px #FFD700, 0 0 40px #FFD700';
                        lightBulb.style.border = '2px solid #FFA500';
                    } else {
                        console.log('Light bulb element not found.');
                    }
                }
            });
        });

        // Check socket connections
        handleSocketConnections();
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
