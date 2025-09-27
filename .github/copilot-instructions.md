# ioBroker Adapter Development with GitHub Copilot

**Version:** 0.4.0
**Template Source:** https://github.com/DrozmotiX/ioBroker-Copilot-Instructions

This file contains instructions and best practices for GitHub Copilot when working on ioBroker adapter development.

## Project Context

You are working on an ioBroker adapter. ioBroker is an integration platform for the Internet of Things, focused on building smart home and industrial IoT solutions. Adapters are plugins that connect ioBroker to external systems, devices, or services.

## Adapter-Specific Context
- **Adapter Name**: iobroker.envertech-pv
- **Primary Function**: Adapter to read data from www.envertecportal.com
- **Target Service**: Envertech PV inverter cloud service (envertecportal.com)
- **Key Dependencies**: Uses Axios for HTTP communication with the Envertech cloud API
- **Configuration**: JSON-Config based UI (admin5) with multiple station support
- **API Integration**: Cloud-based data polling from Envertech service
- **Device Support**: Envertech microinverters (EVB300, EVB202, EVB201, evt720, evt560, evt360, evt300)
- **Data Types**: Solar power generation, inverter status, station information, environmental data

## Testing

### Unit Testing
- Use Jest as the primary testing framework for ioBroker adapters
- Create tests for all adapter main functions and helper methods
- Test error handling scenarios and edge cases
- Mock external API calls and hardware dependencies
- For adapters connecting to APIs/devices not reachable by internet, provide example data files to allow testing of functionality without live connections
- Example test structure:
  ```javascript
  describe('AdapterName', () => {
    let adapter;
    
    beforeEach(() => {
      // Setup test adapter instance
    });
    
    test('should initialize correctly', () => {
      // Test adapter initialization
    });
  });
  ```

### Integration Testing

**IMPORTANT**: Use the official `@iobroker/testing` framework for all integration tests. This is the ONLY correct way to test ioBroker adapters.

**Official Documentation**: https://github.com/ioBroker/testing

#### Framework Structure
Integration tests MUST follow this exact pattern:

```javascript
const path = require('path');
const { tests } = require('@iobroker/testing');

// Define test coordinates or configuration
const TEST_COORDINATES = '52.520008,13.404954'; // Berlin
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

// Use tests.integration() with defineAdditionalTests
tests.integration(path.join(__dirname, '..'), {
    defineAdditionalTests({ suite }) {
        suite('Test adapter with specific configuration', (getHarness) => {
            let harness;

            before(() => {
                harness = getHarness();
            });

            it('should configure and start adapter', function () {
                return new Promise(async (resolve, reject) => {
                    try {
                        harness = getHarness();
                        
                        // Get adapter object using promisified pattern
                        const obj = await new Promise((res, rej) => {
                            harness.objects.getObject('system.adapter.your-adapter.0', (err, o) => {
                                if (err) return rej(err);
                                res(o);
                            });
                        });
                        
                        if (!obj) {
                            return reject(new Error('Adapter object not found'));
                        }

                        // Configure adapter properties
                        Object.assign(obj.native, {
                            position: TEST_COORDINATES,
                            createCurrently: true,
                            createHourly: true,
                            createDaily: true,
                            // Add other configuration as needed
                        });

                        // Set the updated configuration
                        harness.objects.setObject(obj._id, obj);

                        console.log('✅ Step 1: Configuration written, starting adapter...');
                        
                        // Start adapter and wait
                        await harness.startAdapterAndWait();
                        
                        console.log('✅ Step 2: Adapter started');

                        // Wait for adapter to process data
                        const waitMs = 15000;
                        await wait(waitMs);

                        console.log('🔍 Step 3: Checking states after adapter run...');
                        
                        // Verify states were created
                        const states = await harness.states.getKeysAsync('your-adapter.0.*');
                        console.log(`Found ${states.length} states`);
                        
                        if (states.length === 0) {
                            return reject(new Error('No states were created by the adapter'));
                        }

                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });
            });
        });
    }
});
```

#### Test Execution Patterns
```javascript
// Always use this timeout for integration tests
.timeout(90000);

// Use proper async/await patterns
it('should handle configuration correctly', async function() {
    const result = await harness.startAdapterAndWait();
    // assertions...
});

// Handle adapter state changes
harness.onAdapterStateChanged = (id, state) => {
    console.log(`State changed: ${id} = ${state.val}`);
};
```

## Error Handling

### Standard ioBroker Error Patterns
```javascript
// Standard error handling in main functions
try {
    await this.doSomething();
} catch (error) {
    this.log.error(`Error in doSomething: ${error.message}`);
    // Continue execution or handle gracefully
}

// Network request error handling (for cloud adapters)
try {
    const response = await axios.get(url, { timeout: 30000 });
    return response.data;
} catch (error) {
    if (error.code === 'ENOTFOUND') {
        this.log.error('DNS resolution failed - check internet connection');
    } else if (error.response) {
        this.log.error(`API returned ${error.response.status}: ${error.response.statusText}`);
    } else {
        this.log.error(`Network error: ${error.message}`);
    }
    throw error;
}
```

### Connection State Management
```javascript
// Set connection state on errors
await this.setStateAsync('info.connection', { val: false, ack: true });

// Set connection state on success
await this.setStateAsync('info.connection', { val: true, ack: true });
```

## ioBroker Adapter Patterns

### State Creation and Management
```javascript
// Create state with proper definition
await this.setObjectNotExistsAsync('device.value', {
    type: 'state',
    common: {
        name: 'Device Value',
        type: 'number',
        role: 'value',
        read: true,
        write: false,
        unit: 'W'
    },
    native: {}
});

// Set state value
await this.setStateAsync('device.value', { val: 123.45, ack: true });
```

### JSON-Config Management
When working with JSON-Config (admin5), handle configuration properly:

```javascript
// Access configuration values
const stationId = this.config.stationId;
const pollInterval = this.config.pollInterval || 60;

// Handle arrays in configuration
if (this.config.stations && Array.isArray(this.config.stations)) {
    this.config.stations.forEach(station => {
        if (station.active && station.stationId) {
            this.processStation(station);
        }
    });
}
```

### Lifecycle Management
```javascript
class YourAdapter extends utils.Adapter {
    async onReady() {
        // Initialize adapter
        this.log.info('Adapter starting...');
        await this.setStateAsync('info.connection', { val: false, ack: true });
        
        // Start your main logic
        this.startMainLoop();
    }

    onUnload(callback) {
        try {
            // Clean up resources
            if (this.connectionTimer) {
                clearTimeout(this.connectionTimer);
            }
            // Stop any running processes
            callback();
        } catch (e) {
            callback();
        }
    }
}
```

## Code Style and Standards

- Follow JavaScript/TypeScript best practices
- Use async/await for asynchronous operations
- Implement proper resource cleanup in `unload()` method
- Use semantic versioning for adapter releases
- Include proper JSDoc comments for public methods

## CI/CD and Testing Integration

### GitHub Actions for API Testing
For adapters with external API dependencies, implement separate CI/CD jobs:

```yaml
# Tests API connectivity with demo credentials (runs separately)
demo-api-tests:
  if: contains(github.event.head_commit.message, '[skip ci]') == false
  
  runs-on: ubuntu-22.04
  
  steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Use Node.js 20.x
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run demo API tests
      run: npm run test:integration-demo
```

### CI/CD Best Practices
- Run credential tests separately from main test suite
- Use ubuntu-22.04 for consistency
- Don't make credential tests required for deployment
- Provide clear failure messages for API connectivity issues
- Use appropriate timeouts for external API calls (120+ seconds)

### Package.json Script Integration
Add dedicated script for credential testing:
```json
{
  "scripts": {
    "test:integration-demo": "mocha test/integration-demo --exit"
  }
}
```

### Practical Example: Complete API Testing Implementation
Here's a complete example based on lessons learned from the Discovergy adapter:

#### test/integration-demo.js
```javascript
const path = require("path");
const { tests } = require("@iobroker/testing");

// Helper function to encrypt password using ioBroker's encryption method
async function encryptPassword(harness, password) {
    const systemConfig = await harness.objects.getObjectAsync("system.config");
    
    if (!systemConfig || !systemConfig.native || !systemConfig.native.secret) {
        throw new Error("Could not retrieve system secret for password encryption");
    }
    
    const secret = systemConfig.native.secret;
    let result = '';
    for (let i = 0; i < password.length; ++i) {
        result += String.fromCharCode(secret[i % secret.length].charCodeAt(0) ^ password.charCodeAt(i));
    }
    
    return result;
}

// Run integration tests with demo credentials
tests.integration(path.join(__dirname, ".."), {
    defineAdditionalTests({ suite }) {
        suite("API Testing with Demo Credentials", (getHarness) => {
            let harness;
            
            before(() => {
                harness = getHarness();
            });

            it("Should connect to API and initialize with demo credentials", async () => {
                console.log("Setting up demo credentials...");
                
                if (harness.isAdapterRunning()) {
                    await harness.stopAdapter();
                }
                
                const encryptedPassword = await encryptPassword(harness, "demo_password");
                
                await harness.changeAdapterConfig("your-adapter", {
                    native: {
                        username: "demo@provider.com",
                        password: encryptedPassword,
                        // other config options
                    }
                });

                console.log("Starting adapter with demo credentials...");
                await harness.startAdapter();
                
                // Wait for API calls and initialization
                await new Promise(resolve => setTimeout(resolve, 60000));
                
                const connectionState = await harness.states.getStateAsync("your-adapter.0.info.connection");
                
                if (connectionState && connectionState.val === true) {
                    console.log("✅ SUCCESS: API connection established");
                    return true;
                } else {
                    throw new Error("API Test Failed: Expected API connection to be established with demo credentials. " +
                        "Check logs above for specific API errors (DNS resolution, 401 Unauthorized, network issues, etc.)");
                }
            }).timeout(120000);
        });
    }
});
```

## Adapter-Specific Development Guidelines

### Envertech PV Cloud Integration
- Always use secure HTTPS connections to envertecportal.com
- Implement proper retry logic for network failures
- Handle multiple station configurations properly
- Respect API rate limits and implement appropriate delays
- Parse numeric values from API responses that may contain units (e.g., "123.45 kWh")
- Handle different device types (EVB300, EVB202, etc.) appropriately
- Implement proper state mapping for inverter status codes
- Use meaningful units for energy values (W, kWh, V, A)
- Support pagination for stations with many inverters (>20)

### Station and Device Management
```javascript
// Process multiple stations
async processStations() {
    if (!this.config.stations) return;
    
    for (const station of this.config.stations) {
        if (station.active && station.stationId) {
            try {
                await this.queryStation(station.stationId);
            } catch (error) {
                this.log.error(`Failed to query station ${station.stationId}: ${error.message}`);
            }
        }
    }
}

// Handle API responses with units
parseValueWithUnit(valueString, expectedUnit) {
    if (!valueString) return null;
    
    const match = valueString.match(/(\d+(?:\.\d+)?)\s*(\w*)/);
    if (match) {
        const value = parseFloat(match[1]);
        const unit = match[2] || expectedUnit;
        return { value, unit };
    }
    return null;
}
```

### Error Recovery and Resilience
```javascript
// Implement robust error recovery
async queryStationWithRetry(stationId, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await this.queryStation(stationId);
        } catch (error) {
            this.log.warn(`Station ${stationId} query attempt ${attempt} failed: ${error.message}`);
            
            if (attempt === maxRetries) {
                throw error;
            }
            
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }
    }
}
```