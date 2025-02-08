window.onload = () => {
    const urlInput = document.getElementById('url-input');
    const addUrlBtn = document.getElementById('add-url-btn');
    const dashboard = document.getElementById('dashboard');
    const refreshIntervalInput = document.getElementById('refresh-interval');

    addUrlBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (url) {
            addWebView(url);
            urlInput.value = '';
        }
    });

    // Add apply refresh button handler
    const applyRefreshBtn = document.getElementById('apply-refresh');
    applyRefreshBtn.addEventListener('click', () => {
        const seconds = parseInt(refreshIntervalInput.value);
        document.querySelectorAll('.frame-container').forEach(container => {
            const event = new Event('change');
            container.refreshIntervalInput = refreshIntervalInput;
            container.dispatchEvent(event);
        });
    });

    // Add theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    function getDomainFromUrl(url) {
        try {
            const domain = new URL(url).hostname;
            return domain.replace('www.', '');
        } catch (e) {
            return url;
        }
    }

    // Add grid snap state
    let gridSnapEnabled = false;
    const gridSize = 20; // Size of grid cells

    // Add grid snap toggle
    const gridSnapBtn = document.getElementById('grid-snap');
    gridSnapBtn.addEventListener('click', () => {
        gridSnapEnabled = !gridSnapEnabled;
        gridSnapBtn.classList.toggle('active', gridSnapEnabled);
    });

    // Add layout management
    document.querySelectorAll('.layout-menu button').forEach(btn => {
        btn.addEventListener('click', () => {
            applyLayout(btn.dataset.layout);
        });
    });

    // Save layout button
    document.getElementById('save-layout').addEventListener('click', saveCurrentLayout);
    
    // Load layout button
    document.getElementById('load-layout').addEventListener('click', loadSavedLayout);

    function applyLayout(layoutType) {
        const dashboard = document.getElementById('dashboard');
        const panels = Array.from(document.querySelectorAll('.frame-container'));
        const dashboardRect = dashboard.getBoundingClientRect();

        // Remove any existing layout classes
        panels.forEach(panel => {
            panel.style.position = 'relative';
            panel.style.left = '';
            panel.style.top = '';
            panel.classList.remove('locked');
        });

        switch(layoutType) {
            case '2x2':
                arrangeGrid(panels, 2, 2);
                break;
            case '3x3':
                arrangeGrid(panels, 3, 3);
                break;
            case '1x2':
                arrangeGrid(panels, 1, 2);
                break;
            case '2x1':
                arrangeGrid(panels, 2, 1);
                break;
        }
    }

    function arrangeGrid(panels, rows, cols) {
        const dashboard = document.getElementById('dashboard');
        const dashboardRect = dashboard.getBoundingClientRect();
        const panelWidth = (dashboardRect.width / cols) - 10;
        const panelHeight = (dashboardRect.height / rows) - 10;

        panels.forEach((panel, index) => {
            if (index < rows * cols) {
                const row = Math.floor(index / cols);
                const col = index % cols;
                
                panel.style.width = `${panelWidth}px`;
                panel.style.height = `${panelHeight}px`;
                panel.style.position = 'absolute';
                panel.style.left = `${(col * panelWidth) + (col * 10) + 5}px`;
                panel.style.top = `${(row * panelHeight) + (row * 10) + 5}px`;
                
                // Force webview resize
                const webview = panel.querySelector('webview');
                if (webview) {
                    webview.style.width = `${panelWidth}px`;
                    webview.style.height = `${panelHeight - 43}px`;
                }
            }
        });
    }

    function saveCurrentLayout() {
        const layout = {
            panels: Array.from(document.querySelectorAll('.frame-container')).map(panel => ({
                url: panel.querySelector('webview').src,
                position: {
                    left: panel.style.left,
                    top: panel.style.top,
                    width: panel.style.width,
                    height: panel.style.height
                },
                state: panel.dataset.state,
                isLocked: panel.classList.contains('locked')
            }))
        };
        
        localStorage.setItem('savedLayout', JSON.stringify(layout));
        showToast('Layout saved!');
    }

    function loadSavedLayout() {
        const savedLayout = localStorage.getItem('savedLayout');
        if (savedLayout) {
            const layout = JSON.parse(savedLayout);
            
            // Clear existing panels
            dashboard.innerHTML = '';
            
            // Restore panels
            layout.panels.forEach(panelData => {
                addWebView(panelData.url, panelData.position, panelData.state, panelData.isLocked);
            });
            
            showToast('Layout restored!');
        }
    }

    function addWebView(url, position = null, state = 'normal', isLocked = false) {
        const frameContainer = document.createElement('div');
        frameContainer.className = 'frame-container';
        
        // Store original dimensions for maximize/minimize
        frameContainer.dataset.originalHeight = '400px';
        frameContainer.dataset.originalWidth = 'calc(50% - 20px)';

        const domain = getDomainFromUrl(url);
        
        frameContainer.innerHTML = `
            <div class="frame-header">
                <span>${domain}</span>
                <div class="frame-controls">
                    <button class="frame-btn refresh" title="Refresh">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button class="frame-btn minimize" title="Minimize/Maximize">
                        <i class="fas fa-compress"></i>
                    </button>
                    <button class="frame-btn close" title="Close">
                        <i class="fas fa-times"></i>
                    </button>
                    <button class="frame-btn lock" title="Lock/Unlock position and size">
                        <i class="fas fa-unlock"></i>
                    </button>
                </div>
            </div>
            <webview 
                src="${url}" 
                style="flex: 1; width: 100%; height: 100%;"
                useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
                autosize="on"
                nodeintegration
            ></webview>
        `;

        dashboard.appendChild(frameContainer);

        const webview = frameContainer.querySelector('webview');

        // Add countdown span to header
        const headerSpan = frameContainer.querySelector('.frame-header span');
        headerSpan.insertAdjacentHTML('beforeend', '<span class="refresh-countdown"></span>');
        const countdownSpan = headerSpan.querySelector('.refresh-countdown');

        let refreshInterval;
        let countdownInterval;

        function updateRefreshInterval() {
            clearInterval(refreshInterval);
            clearInterval(countdownInterval);
            
            const seconds = parseInt(frameContainer.refreshIntervalInput?.value || refreshIntervalInput.value);
            countdownSpan.textContent = '';
            
            if (seconds > 0) {
                let nextRefresh = seconds;
                
                refreshInterval = setInterval(() => {
                    if (!frameContainer.classList.contains('minimized')) {
                        webview.reload();
                        nextRefresh = seconds;
                    }
                }, seconds * 1000);

                countdownInterval = setInterval(() => {
                    if (!frameContainer.classList.contains('minimized')) {
                        nextRefresh--;
                        countdownSpan.textContent = ` (${nextRefresh}s)`;
                        if (nextRefresh <= 0) nextRefresh = seconds;
                    }
                }, 1000);
            }
        }

        frameContainer.addEventListener('change', updateRefreshInterval);
        refreshIntervalInput.addEventListener('change', () => {
            frameContainer.refreshIntervalInput = refreshIntervalInput;
        });
        
        // Initialize refresh interval
        updateRefreshInterval();

        // Add button event listeners
        const refreshBtn = frameContainer.querySelector('.refresh');
        refreshBtn.addEventListener('click', () => webview.reload());

        // Improved resize handling with debounce and throttle
        let resizeTimeout;
        let isResizing = false;
        
        const resizeObserver = new ResizeObserver((entries) => {
            if (isResizing) return;
            
            for (const entry of entries) {
                const webview = entry.target.querySelector('webview');
                if (webview && !frameContainer.classList.contains('minimized')) {
                    if (resizeTimeout) {
                        clearTimeout(resizeTimeout);
                    }
                    
                    isResizing = true;
                    frameContainer.classList.add('resizing');
                    
                    const width = entry.contentRect.width;
                    const height = entry.contentRect.height - 43;

                    resizeTimeout = setTimeout(() => {
                        isResizing = false;
                        frameContainer.classList.remove('resizing');
                        updateWebviewContent(webview, width, height);
                    }, 150);
                }
            }
        });

        resizeObserver.observe(frameContainer);

        // Add resize handle interaction improvement
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        frameContainer.appendChild(resizeHandle);

        // Add webview load handler with improved content scaling
        webview.addEventListener('dom-ready', () => {
            webview.executeJavaScript(`
                (function() {
                    // Enable proper scrolling
                    document.body.style.overflow = 'auto';
                    document.documentElement.style.overflow = 'auto';
                    
                    // Ensure proper viewport settings
                    let viewport = document.querySelector('meta[name="viewport"]');
                    if (!viewport) {
                        viewport = document.createElement('meta');
                        viewport.name = 'viewport';
                        document.head.appendChild(viewport);
                    }
                    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';
                    
                    // Add resize event listener within the webview
                    window.addEventListener('resize', () => {
                        document.body.style.width = '100%';
                        document.body.style.height = '100%';
                    });
                    
                    // Force any fixed position elements to respect container bounds
                    const style = document.createElement('style');
                    style.textContent = \`
                        body * {
                            max-width: 100% !important;
                        }
                        *:not(body):not(html) {
                            transform-origin: top left;
                        }
                        .fixed-adjust {
                            position: absolute !important;
                            transform: none !important;
                        }
                    \`;
                    document.head.appendChild(style);
                })();
            `);
        });

        // Update mouseup handler
        document.addEventListener('mouseup', () => {
            if (frameContainer.classList.contains('resizing')) {
                handleResize();
            }
        });

        // Add panel state tracking
        frameContainer.dataset.state = state;
        if (isLocked) {
            frameContainer.classList.add('locked');
            makeFrameDraggable(frameContainer);
        }
        frameContainer.dataset.originalWidth = 'calc(50% - 20px)';
        frameContainer.dataset.originalHeight = '400px';

        // Modify the minimize handler for better state management
        const minimizeBtn = frameContainer.querySelector('.minimize');
        minimizeBtn.addEventListener('click', () => {
            const icon = minimizeBtn.querySelector('i');
            
            if (frameContainer.dataset.state === 'minimized') {
                // Restore to previous state
                const prevState = frameContainer.dataset.prevState || 'normal';
                frameContainer.dataset.state = prevState;
                
                if (prevState === 'maximized') {
                    icon.classList.replace('fa-expand', 'fa-compress');
                    frameContainer.style.width = '100%';
                    frameContainer.style.height = '100vh';
                } else {
                    icon.classList.replace('fa-expand', 'fa-compress');
                    frameContainer.style.width = frameContainer.dataset.prevWidth || frameContainer.dataset.originalWidth;
                    frameContainer.style.height = frameContainer.dataset.prevHeight || frameContainer.dataset.originalHeight;
                }
                
                frameContainer.classList.remove('minimized');
                webview.style.display = 'block';
                
                // Restore position if was locked
                if (frameContainer.classList.contains('locked')) {
                    frameContainer.style.left = frameContainer.dataset.prevLeft || '0px';
                    frameContainer.style.top = frameContainer.dataset.prevTop || '0px';
                }
            } else {
                // Store current state before minimizing
                frameContainer.dataset.prevState = frameContainer.dataset.state;
                frameContainer.dataset.state = 'minimized';
                frameContainer.dataset.prevWidth = frameContainer.style.width || getComputedStyle(frameContainer).width;
                frameContainer.dataset.prevHeight = frameContainer.style.height || getComputedStyle(frameContainer).height;
                
                if (frameContainer.classList.contains('locked')) {
                    frameContainer.dataset.prevLeft = frameContainer.style.left;
                    frameContainer.dataset.prevTop = frameContainer.style.top;
                }
                
                icon.classList.replace('fa-compress', 'fa-expand');
                frameContainer.classList.add('minimized');
                webview.style.display = 'none';
                frameContainer.style.height = '43px';
                
                // Move minimized panels to top if locked
                if (frameContainer.classList.contains('locked')) {
                    const minimizedY = Array.from(document.querySelectorAll('.frame-container.minimized.locked'))
                        .reduce((acc, panel) => Math.max(acc, panel.offsetTop), 0);
                    frameContainer.style.top = (minimizedY + 43 + 10) + 'px';
                    frameContainer.style.left = '10px';
                }
            }
            
            // Force webview refresh if restoring
            if (frameContainer.dataset.state !== 'minimized') {
                requestAnimationFrame(() => {
                    const rect = frameContainer.getBoundingClientRect();
                    webview.style.width = rect.width + 'px';
                    webview.style.height = (rect.height - 43) + 'px';
                });
            }
        });

        // Improve lock functionality
        const lockBtn = frameContainer.querySelector('.lock');
        lockBtn.addEventListener('click', () => {
            frameContainer.classList.toggle('locked');
            const icon = lockBtn.querySelector('i');
            
            if (frameContainer.classList.contains('locked')) {
                icon.classList.replace('fa-unlock', 'fa-lock');
                frameContainer.style.resize = 'none';
                
                // Convert to absolute positioning
                const rect = frameContainer.getBoundingClientRect();
                const dashboardRect = dashboard.getBoundingClientRect();
                
                frameContainer.style.position = 'absolute';
                frameContainer.style.left = (rect.left - dashboardRect.left + dashboard.scrollLeft) + 'px';
                frameContainer.style.top = (rect.top - dashboardRect.top + dashboard.scrollTop) + 'px';
                frameContainer.style.margin = '0';
                
                // Set z-index
                frameContainer.dataset.zIndex = getNextZIndex();
                frameContainer.style.zIndex = frameContainer.dataset.zIndex;
                
                makeFrameDraggable(frameContainer);
                
                // If minimized, move to top
                if (frameContainer.classList.contains('minimized')) {
                    const minimizedY = Array.from(document.querySelectorAll('.frame-container.minimized.locked'))
                        .reduce((acc, panel) => Math.max(acc, panel.offsetTop), 0);
                    frameContainer.style.top = (minimizedY + 43 + 10) + 'px';
                    frameContainer.style.left = '10px';
                }
            } else {
                icon.classList.replace('fa-lock', 'fa-unlock');
                frameContainer.style.resize = 'both';
                frameContainer.style.position = 'relative';
                frameContainer.style.left = '';
                frameContainer.style.top = '';
                frameContainer.style.margin = '10px';
                frameContainer.style.zIndex = '';
                
                removeDraggable(frameContainer);
            }
        });

        const closeBtn = frameContainer.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            clearInterval(refreshInterval);
            frameContainer.remove();
        });

        // Update webview event handlers
        webview.addEventListener('did-start-loading', () => {
            frameContainer.classList.add('loading');
            refreshBtn.querySelector('i').classList.add('fa-spin');
            countdownSpan.style.visibility = 'hidden';
        });

        webview.addEventListener('did-stop-loading', () => {
            frameContainer.classList.remove('loading');
            refreshBtn.querySelector('i').classList.remove('fa-spin');
            countdownSpan.style.visibility = 'visible';
        });

        webview.addEventListener('did-fail-load', (event) => {
            if (event.errorCode !== -3) {
                webview.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        Failed to load: ${event.errorDescription}
                    </div>
                `;
            }
        });

        // Add double-click handler for header to toggle maximize
        const header = frameContainer.querySelector('.frame-header');
        header.addEventListener('dblclick', (e) => {
            if (e.target === header || e.target === headerSpan) {
                if (frameContainer.classList.contains('maximized')) {
                    frameContainer.classList.remove('maximized');
                    frameContainer.style.width = frameContainer.dataset.prevWidth || '50%';
                    frameContainer.style.height = frameContainer.dataset.prevHeight || '400px';
                } else {
                    frameContainer.dataset.prevWidth = frameContainer.style.width;
                    frameContainer.dataset.prevHeight = frameContainer.style.height;
                    frameContainer.classList.add('maximized');
                    frameContainer.style.width = '100%';
                    frameContainer.style.height = '100vh';
                }
                // Force webview refresh
                requestAnimationFrame(() => {
                    const rect = frameContainer.getBoundingClientRect();
                    webview.style.width = rect.width + 'px';
                    webview.style.height = (rect.height - 43) + 'px';
                });
            }
        });

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'r') {
                webview.reload();
            }
        });

        // Apply position if provided
        if (position) {
            frameContainer.style.position = 'absolute';
            frameContainer.style.left = position.left;
            frameContainer.style.top = position.top;
            frameContainer.style.width = position.width;
            frameContainer.style.height = position.height;
        }
    }

    function getNextZIndex() {
        let maxZ = 1;
        document.querySelectorAll('.frame-container.locked').forEach(panel => {
            const z = parseInt(panel.dataset.zIndex || 1);
            maxZ = Math.max(maxZ, z + 1);
        });
        return maxZ;
    }

    function makeFrameDraggable(frameContainer) {
        const header = frameContainer.querySelector('.frame-header');
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        function dragStart(e) {
            // Only allow dragging from header (not buttons)
            if (e.target !== header && e.target !== header.querySelector('span')) {
                return;
            }

            isDragging = true;
            frameContainer.style.transition = 'none';
            
            // Bring to front when dragging
            frameContainer.style.zIndex = getNextZIndex();
            
            initialX = e.clientX - frameContainer.offsetLeft;
            initialY = e.clientY - frameContainer.offsetTop;
            
            frameContainer.classList.add('dragging');
        }

        function drag(e) {
            if (!isDragging) return;
            e.preventDefault();
            
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            if (gridSnapEnabled) {
                currentX = Math.round(currentX / gridSize) * gridSize;
                currentY = Math.round(currentY / gridSize) * gridSize;
            }

            const dashboardRect = dashboard.getBoundingClientRect();
            const frameRect = frameContainer.getBoundingClientRect();

            // Adjust constraints for minimized panels
            const minY = frameContainer.classList.contains('minimized') ? 0 : 0;
            const maxY = frameContainer.classList.contains('minimized') 
                ? dashboardRect.height - 43 
                : dashboardRect.height - frameRect.height;

            // Constrain to dashboard boundaries
            currentX = Math.max(-10, Math.min(currentX, dashboardRect.width - frameRect.width + 10));
            currentY = Math.max(minY, Math.min(currentY, maxY));

            // Improved collision detection
            const currentPanel = frameContainer;
            document.querySelectorAll('.frame-container.locked').forEach(panel => {
                if (panel !== currentPanel && !panel.classList.contains('minimized')) {
                    const panelRect = panel.getBoundingClientRect();
                    const overlap = getOverlap(
                        {x: currentX, y: currentY, width: frameRect.width, height: frameRect.height},
                        {x: panel.offsetLeft, y: panel.offsetTop, width: panelRect.width, height: panelRect.height}
                    );
                    
                    if (overlap) {
                        if (overlap.fromLeft || overlap.fromRight) {
                            currentX = overlap.suggestedX;
                        }
                        if (overlap.fromTop || overlap.fromBottom) {
                            currentY = overlap.suggestedY;
                        }
                    }
                }
            });

            frameContainer.style.left = currentX + 'px';
            frameContainer.style.top = currentY + 'px';
        }

        function dragEnd() {
            if (!isDragging) return;
            
            isDragging = false;
            frameContainer.classList.remove('dragging');
            frameContainer.style.transition = '';
        }

        frameContainer.dragCleanup = () => {
            header.removeEventListener('mousedown', dragStart);
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', dragEnd);
        };
    }

    function removeDraggable(frameContainer) {
        if (frameContainer.dragCleanup) {
            frameContainer.dragCleanup();
            delete frameContainer.dragCleanup;
        }
    }

    function getOverlap(rect1, rect2) {
        const horizontalOverlap = !(rect1.x + rect1.width < rect2.x || rect1.x > rect2.x + rect2.width);
        const verticalOverlap = !(rect1.y + rect1.height < rect2.y || rect1.y > rect2.y + rect2.height);

        if (horizontalOverlap && verticalOverlap) {
            const fromLeft = rect1.x < rect2.x;
            const fromRight = rect1.x > rect2.x;
            const fromTop = rect1.y < rect2.y;
            const fromBottom = rect1.y > rect2.y;

            return {
                fromLeft,
                fromRight,
                fromTop,
                fromBottom,
                suggestedX: fromLeft ? rect2.x - rect1.width - 10 : rect2.x + rect2.width + 10,
                suggestedY: fromTop ? rect2.y - rect1.height - 10 : rect2.y + rect2.height + 10
            };
        }

        return null;
    }

    // Add a simple toast notification system
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Add after the existing layout functions
    function autoLayout() {
        const panels = Array.from(document.querySelectorAll('.frame-container:not(.minimized)'));
        if (!panels.length) return;

        const dashboard = document.getElementById('dashboard');
        const dashboardRect = dashboard.getBoundingClientRect();
        const availableWidth = dashboardRect.width - 20; // Account for margins
        const availableHeight = dashboardRect.height - 20;

        // Calculate optimal grid dimensions
        const count = panels.length;
        const aspectRatio = availableWidth / availableHeight;
        const cols = Math.ceil(Math.sqrt(count * aspectRatio));
        const rows = Math.ceil(count / cols);

        const panelWidth = (availableWidth / cols) - 10;
        const panelHeight = (availableHeight / rows) - 10;

        panels.forEach((panel, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            
            panel.style.position = 'absolute';
            panel.style.width = `${panelWidth}px`;
            panel.style.height = `${panelHeight}px`;
            panel.style.left = `${(col * panelWidth) + (col * 10) + 5}px`;
            panel.style.top = `${(row * panelHeight) + (row * 10) + 5}px`;

            // Force webview update
            const webview = panel.querySelector('webview');
            if (webview) {
                updateWebviewContent(webview, panelWidth, panelHeight - 43);
            }
        });
    }

    // Add auto-layout button handler
    document.getElementById('auto-layout').addEventListener('click', autoLayout);

    // Improve webview content handling
    function updateWebviewContent(webview, width, height) {
        webview.style.width = `${width}px`;
        webview.style.height = `${height}px`;

        // Inject responsive handling
        webview.executeJavaScript(`
            (function() {
                // Set viewport
                let viewport = document.querySelector('meta[name="viewport"]');
                if (!viewport) {
                    viewport = document.createElement('meta');
                    viewport.name = 'viewport';
                    document.head.appendChild(viewport);
                }
                viewport.content = 'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1';

                // Add responsive styles
                const style = document.createElement('style');
                style.textContent = \`
                    body {
                        width: 100% !important;
                        height: 100% !important;
                        overflow-x: hidden !important;
                        transform-origin: top left;
                        min-width: 0 !important;
                    }
                    img, video, iframe {
                        max-width: 100% !important;
                        height: auto !important;
                    }
                    * {
                        max-width: 100% !important;
                        box-sizing: border-box !important;
                    }
                    @media (max-width: \${width}px) {
                        body {
                            zoom: 0.9;
                        }
                    }
                \`;
                document.head.appendChild(style);

                // Force layout recalculation
                document.body.style.width = '100%';
                document.body.style.height = '100%';
                window.dispatchEvent(new Event('resize'));

                // Handle fixed position elements
                const fixedElements = document.querySelectorAll('*[style*="position: fixed"]');
                fixedElements.forEach(el => {
                    el.style.position = 'absolute';
                    el.style.transform = 'none';
                });
            })();
        `);
    }

    // Add window resize handler for responsive layout
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const panels = document.querySelectorAll('.frame-container:not(.minimized)');
            panels.forEach(panel => {
                const webview = panel.querySelector('webview');
                if (webview) {
                    const rect = panel.getBoundingClientRect();
                    updateWebviewContent(webview, rect.width, rect.height - 43);
                }
            });
        }, 250);
    });

    // Add this function to handle smart tooltip positioning
    function setupSmartTooltips() {
        document.querySelectorAll('[title]').forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                const tooltip = document.createElement('div');
                tooltip.className = 'smart-tooltip';
                tooltip.textContent = element.getAttribute('title');
                tooltip.style.position = 'fixed';
                tooltip.style.visibility = 'hidden';
                document.body.appendChild(tooltip);

                // Get element and tooltip dimensions
                const elementRect = element.getBoundingClientRect();
                const tooltipRect = tooltip.getBoundingClientRect();
                
                // Calculate best position
                let left = elementRect.left + (elementRect.width - tooltipRect.width) / 2;
                let top = elementRect.top - tooltipRect.height - 5;

                // Adjust if tooltip would go off screen
                if (left < 10) left = 10;
                if (left + tooltipRect.width > window.innerWidth - 10) {
                    left = window.innerWidth - tooltipRect.width - 10;
                }
                
                if (top < 10) {
                    // Show below element if not enough space above
                    top = elementRect.bottom + 5;
                }

                // Apply position
                tooltip.style.left = `${left}px`;
                tooltip.style.top = `${top}px`;
                tooltip.style.visibility = 'visible';
                tooltip.style.opacity = '1';

                // Remove tooltip when mouse leaves
                const removeTooltip = () => {
                    tooltip.remove();
                    element.removeEventListener('mouseleave', removeTooltip);
                };
                element.addEventListener('mouseleave', removeTooltip);
            });

            // Prevent default title tooltip
            element.addEventListener('mouseenter', () => {
                element.dataset.originalTitle = element.getAttribute('title');
                element.removeAttribute('title');
            });

            element.addEventListener('mouseleave', () => {
                element.setAttribute('title', element.dataset.originalTitle);
            });
        });
    }

    // Call this after the DOM is loaded
    window.addEventListener('DOMContentLoaded', setupSmartTooltips);
};