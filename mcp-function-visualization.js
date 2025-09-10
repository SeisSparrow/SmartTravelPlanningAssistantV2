/**
 * MCP Function Call Visualization
 * Enhanced real-time display of MCP tool calls, parameters, and responses
 */

class MCPFunctionVisualization {
    constructor() {
        this.functionCalls = [];
        this.maxCallsToShow = 10;
        this.initializeVisualization();
    }

    initializeVisualization() {
        this.createVisualizationPanel();
        this.setupStyles();
    }

    createVisualizationPanel() {
        // Add visualization panel to the tool panel
        const toolPanel = document.querySelector('.tool-panel');
        
        const visualizationSection = document.createElement('div');
        visualizationSection.className = 'mcp-visualization';
        visualizationSection.innerHTML = `
            <div class="viz-header">
                <h4><i class="fas fa-code"></i> MCP Function Calls</h4>
                <button id="clear-viz" class="btn-icon" title="Clear visualization">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div id="function-calls" class="function-calls-container">
                <div class="no-calls">Waiting for function calls...</div>
            </div>
        `;
        
        // Insert after the tool activity section
        const toolActivity = document.querySelector('.tool-activity');
        toolActivity.parentNode.insertBefore(visualizationSection, toolActivity.nextSibling);
        
        // Add clear button functionality
        document.getElementById('clear-viz').addEventListener('click', () => this.clearVisualization());
    }

    setupStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .mcp-visualization {
                border-top: 1px solid var(--border-color);
                padding: 1rem;
                background-color: var(--background-color);
                max-height: 400px;
                overflow-y: auto;
            }
            
            .viz-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            }
            
            .viz-header h4 {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.875rem;
                font-weight: 600;
                color: var(--text-secondary);
                margin: 0;
            }
            
            .function-calls-container {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }
            
            .function-call {
                background-color: var(--surface-color);
                border: 1px solid var(--border-color);
                border-radius: var(--radius-md);
                padding: 0.75rem;
                font-size: 0.75rem;
                transition: all 0.2s;
            }
            
            .function-call:hover {
                box-shadow: var(--shadow-sm);
                border-color: var(--primary-color);
            }
            
            .call-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
            }
            
            .call-function {
                font-family: 'Monaco', 'Menlo', monospace;
                font-weight: 600;
                color: var(--primary-color);
                font-size: 0.7rem;
            }
            
            .call-status {
                padding: 0.25rem 0.5rem;
                border-radius: var(--radius-sm);
                font-size: 0.65rem;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            .call-status.loading {
                background-color: var(--warning-color);
                color: white;
                animation: pulse 1.5s infinite;
            }
            
            .call-status.success {
                background-color: var(--success-color);
                color: white;
            }
            
            .call-status.error {
                background-color: var(--error-color);
                color: white;
            }
            
            .call-parameters {
                background-color: var(--background-color);
                border-radius: var(--radius-sm);
                padding: 0.5rem;
                margin: 0.5rem 0;
                font-family: 'Monaco', 'Menlo', monospace;
                font-size: 0.65rem;
                color: var(--text-secondary);
                max-height: 100px;
                overflow-y: auto;
            }
            
            .call-response {
                background-color: var(--background-color);
                border-left: 3px solid var(--primary-color);
                border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
                padding: 0.5rem;
                margin-top: 0.5rem;
                font-size: 0.65rem;
                color: var(--text-primary);
                max-height: 150px;
                overflow-y: auto;
            }
            
            .call-timestamp {
                font-size: 0.6rem;
                color: var(--text-secondary);
                margin-top: 0.5rem;
                text-align: right;
            }
            
            .no-calls {
                text-align: center;
                color: var(--text-secondary);
                font-style: italic;
                padding: 2rem;
            }
            
            .expand-btn {
                background: none;
                border: none;
                color: var(--primary-color);
                cursor: pointer;
                font-size: 0.65rem;
                padding: 0.25rem;
                margin-left: 0.5rem;
            }
            
            .expand-btn:hover {
                text-decoration: underline;
            }
        `;
        
        document.head.appendChild(style);
    }

    addFunctionCall(callData) {
        const callId = Date.now() + Math.random();
        const call = {
            id: callId,
            server: callData.server,
            function: callData.function,
            parameters: callData.parameters,
            status: callData.status || 'loading',
            response: callData.response || null,
            timestamp: new Date(),
            expanded: false
        };
        
        this.functionCalls.unshift(call);
        
        // Keep only the most recent calls
        if (this.functionCalls.length > this.maxCallsToShow) {
            this.functionCalls = this.functionCalls.slice(0, this.maxCallsToShow);
        }
        
        this.renderFunctionCall(call);
        return callId;
    }

    updateFunctionCall(callId, updates) {
        const call = this.functionCalls.find(c => c.id === callId);
        if (!call) return;
        
        Object.assign(call, updates);
        this.renderAllCalls();
    }

    renderFunctionCall(call) {
        const container = document.getElementById('function-calls');
        
        // Remove "no calls" message if it exists
        const noCallsMsg = container.querySelector('.no-calls');
        if (noCallsMsg) {
            noCallsMsg.remove();
        }
        
        const callElement = document.createElement('div');
        callElement.className = 'function-call';
        callElement.dataset.callId = call.id;
        
        callElement.innerHTML = this.getCallHTML(call);
        container.insertBefore(callElement, container.firstChild);
        
        // Add event listeners for expand/collapse
        const expandBtn = callElement.querySelector('.expand-btn');
        if (expandBtn) {
            expandBtn.addEventListener('click', () => this.toggleExpand(call.id));
        }
    }

    getCallHTML(call) {
        const paramsStr = JSON.stringify(call.parameters, null, 2);
        const responseStr = call.response ? JSON.stringify(call.response, null, 2) : '';
        const timestamp = call.timestamp.toLocaleTimeString();
        
        let html = `
            <div class="call-header">
                <span class="call-function">${call.server}.${call.function}</span>
                <span class="call-status ${call.status}">${call.status}</span>
            </div>
        `;
        
        // Show parameters
        if (call.parameters && Object.keys(call.parameters).length > 0) {
            const paramsPreview = this.getPreview(paramsStr, call.expanded);
            html += `
                <div class="call-parameters">
                    <strong>Parameters:</strong>
                    <pre>${paramsPreview}</pre>
                    ${paramsStr.length > 200 ? `<button class="expand-btn" onclick="mcpViz.toggleExpand(${call.id})">${call.expanded ? 'Show less' : 'Show more'}</button>` : ''}
                </div>
            `;
        }
        
        // Show response if available
        if (call.response && call.status === 'success') {
            const responsePreview = this.getPreview(responseStr, call.expanded);
            html += `
                <div class="call-response">
                    <strong>Response:</strong>
                    <pre>${responsePreview}</pre>
                    ${responseStr.length > 200 ? `<button class="expand-btn" onclick="mcpViz.toggleExpand(${call.id})">${call.expanded ? 'Show less' : 'Show more'}</button>` : ''}
                </div>
            `;
        }
        
        html += `<div class="call-timestamp">${timestamp}</div>`;
        return html;
    }

    getPreview(text, expanded) {
        if (expanded || text.length <= 200) {
            return text;
        }
        return text.substring(0, 200) + '...';
    }

    toggleExpand(callId) {
        const call = this.functionCalls.find(c => c.id === callId);
        if (!call) return;
        
        call.expanded = !call.expanded;
        this.renderAllCalls();
    }

    renderAllCalls() {
        const container = document.getElementById('function-calls');
        container.innerHTML = '';
        
        if (this.functionCalls.length === 0) {
            container.innerHTML = '<div class="no-calls">Waiting for function calls...</div>';
            return;
        }
        
        this.functionCalls.forEach(call => {
            this.renderFunctionCall(call);
        });
    }

    clearVisualization() {
        this.functionCalls = [];
        this.renderAllCalls();
    }

    // Integration method to be called from MCP client
    logFunctionCall(server, functionName, parameters, status = 'loading') {
        return this.addFunctionCall({
            server: server,
            function: functionName,
            parameters: parameters,
            status: status
        });
    }

    logFunctionResponse(callId, response, status = 'success') {
        this.updateFunctionCall(callId, {
            response: response,
            status: status
        });
    }

    logFunctionError(callId, error) {
        this.updateFunctionCall(callId, {
            response: { error: error.message || 'Unknown error' },
            status: 'error'
        });
    }
}

// Create global instance
window.mcpViz = new MCPFunctionVisualization();
