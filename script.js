document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Hide navbar when scrolling down, show when scrolling up
        if (scrollTop > lastScrollTop) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        // Add background when scrolled
        if (scrollTop > 50) {
            navbar.style.background = 'rgba(10, 10, 15, 0.95)';
        } else {
            navbar.style.background = 'rgba(10, 10, 15, 0.8)';
        }
        
        lastScrollTop = scrollTop;
    });

    // Button hover effects
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
        });
    });

    // Mobile menu toggle (if needed for future expansion)
    const setupMobileMenu = () => {
        const navLinks = document.querySelector('.nav-links');
        const navButtons = document.querySelector('.nav-buttons');
        
        if (window.innerWidth <= 768) {
            // Add mobile menu functionality here if needed
            console.log('Mobile menu setup');
        }
    };

    // Initial setup and window resize handler
    setupMobileMenu();
    window.addEventListener('resize', setupMobileMenu);

    const form = document.getElementById('tripForm');
    const packingResult = document.getElementById('packingResult');
    const tryNowButton = document.querySelector('.btn-large');

    // Sample packing lists based on trip type
    const packingLists = {
        business: [
            'Laptop and charger',
            'Business casual attire',
            'Formal shoes',
            'Business cards',
            'Notebook and pen',
            'Phone charger',
            'Travel documents'
        ],
        leisure: [
            'Casual clothes',
            'Comfortable shoes',
            'Camera',
            'Phone charger',
            'Sunglasses',
            'Travel guide',
            'Medications'
        ],
        adventure: [
            'Hiking boots',
            'Weather-appropriate clothing',
            'First aid kit',
            'Water bottle',
            'Backpack',
            'Navigation tools',
            'Emergency supplies'
        ],
        beach: [
            'Swimwear',
            'Sunscreen',
            'Beach towel',
            'Sunglasses',
            'Flip-flops',
            'Beach bag',
            'Hat'
        ],
        winter: [
            'Warm jacket',
            'Thermal layers',
            'Winter boots',
            'Gloves',
            'Scarf',
            'Hat',
            'Warm socks'
        ]
    };

    // Function to calculate trip duration
    function calculateDuration(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return duration;
    }

    // Function to generate packing list with typing animation
    function generatePackingList(tripType, duration, activities) {
        const baseList = packingLists[tripType] || [];
        let customList = [...baseList];

        // Add items based on duration
        if (duration > 7) {
            customList.push('Laundry supplies');
        }

        // Add items based on activities
        if (activities.toLowerCase().includes('swimming')) {
            customList.push('Swimwear', 'Goggles');
        }
        if (activities.toLowerCase().includes('hiking')) {
            customList.push('Hiking boots', 'Trail map', 'Water bottle');
        }
        if (activities.toLowerCase().includes('meeting')) {
            customList.push('Business attire', 'Presentation materials');
        }

        // Remove duplicates
        customList = [...new Set(customList)];

        // Create HTML for the packing list with typing animation
        let html = '<h3 class="gradient-text">Your AI-Generated Packing List</h3>';
        html += '<div class="typing-container">';
        html += '<ul class="packing-list">';
        
        customList.forEach((item, index) => {
            html += `<li class="typing-item" style="animation-delay: ${index * 0.1}s">
                        <span class="item-bullet">></span> ${item}
                    </li>`;
        });
        
        html += '</ul></div>';
        return html;
    }

    // Function to test server connection
    async function testServerConnection(port) {
        try {
            const response = await fetch(`http://localhost:${port}/test`);
            if (response.ok) {
                const data = await response.json();
                console.log(`Server found on port ${port}`);
                return true;
            }
        } catch (error) {
            console.log(`Port ${port} not available:`, error.message);
            return false;
        }
        return false;
    }

    // Function to find working server port
    async function findServerPort() {
        for (let port = 3000; port < 3010; port++) {
            if (await testServerConnection(port)) {
                return port;
            }
        }
        throw new Error('Could not find server on any port');
    }

    // Handle "Try It Now" button click
    tryNowButton.addEventListener('click', function(e) {
        e.preventDefault();
        const packingInterface = document.getElementById('packing-interface');
        
        // Calculate the position to scroll to
        const offset = 80; // Adjust this value based on your navbar height
        const elementPosition = packingInterface.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        // Smooth scroll to the packing interface
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });

        // Add a highlight effect to the packing interface
        packingInterface.classList.add('highlight-section');
        
        // Remove the highlight effect after animation completes
        setTimeout(() => {
            packingInterface.classList.remove('highlight-section');
        }, 2000);

        // Focus on the first input field
        const firstInput = packingInterface.querySelector('input');
        if (firstInput) {
            setTimeout(() => {
                firstInput.focus();
            }, 1000);
        }
    });

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Show initial loading state
        packingResult.innerHTML = '<div class="loading">Initializing AI service...</div>';

        const tripData = {
            destination: document.getElementById('destination').value,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            tripType: document.getElementById('tripType').value,
            activities: document.getElementById('activities').value
        };

        try {
            // First check if server is running
            let serverRunning = false;
            try {
                const testResponse = await fetch('http://localhost:3000/test', {
                    signal: AbortSignal.timeout(3000) // 3 second timeout
                });
                serverRunning = testResponse.ok;
            } catch (error) {
                console.log('Server test failed:', error);
            }

            if (!serverRunning) {
                throw new Error('Server is not running');
            }

            // Update loading message
            packingResult.innerHTML = '<div class="loading">Generating your personalized packing list...</div>';

            // Make the API call
            const response = await fetch('http://localhost:3000/api/generate-packing-list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(tripData),
                signal: AbortSignal.timeout(10000) // 10 second timeout
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to generate packing list');
            }

            // Create the packing list HTML
            const packingListHTML = `
                <h3 class="section-title">Your AI-Generated Packing List</h3>
                <div class="typing-container">
                    <ul class="packing-list">
                        ${data.data.map((item, index) => `
                            <li class="typing-item" style="animation-delay: ${index * 0.1}s">
                                <span class="item-bullet">></span>${item}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;

            packingResult.innerHTML = packingListHTML;

        } catch (error) {
            console.error('Error:', error);
            
            // Show error message with troubleshooting steps
            packingResult.innerHTML = `
                <div class="error-message">
                    <h3>Connection Error</h3>
                    <p>${error.message}</p>
                    <div class="error-details">
                        <p>Troubleshooting steps:</p>
                        <ol>
                            <li>Make sure the server is running:
                                <ul>
                                    <li>Open Command Prompt as administrator</li>
                                    <li>Navigate to the server folder: <code>cd server</code></li>
                                    <li>Install dependencies: <code>npm install</code></li>
                                    <li>Start the server: <code>npm start</code></li>
                                </ul>
                            </li>
                            <li>Check your internet connection</li>
                            <li>Make sure no other application is using port 3000</li>
                            <li>Try refreshing the page after starting the server</li>
                        </ol>
                    </div>
                    <div class="error-actions">
                        <button class="btn-primary" onclick="location.reload()">Try Again</button>
                        <button class="btn-secondary" onclick="window.open('http://localhost:3000/test', '_blank')">Test Server</button>
                    </div>
                </div>
            `;

            // After showing the error, use local generation as fallback
            setTimeout(() => {
                const duration = calculateDuration(tripData.startDate, tripData.endDate);
                const localGeneratedList = generatePackingList(tripData.tripType, duration, tripData.activities);
                
                packingResult.innerHTML = `
                    <div class="fallback-message">
                        <p>⚠️ Using offline mode - AI service unavailable</p>
                    </div>
                    ${localGeneratedList}
                `;
            }, 5000); // Show fallback after 5 seconds
        }
    });
});