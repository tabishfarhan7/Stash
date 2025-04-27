document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('tripForm');
    const output = document.getElementById('packingPlanOutput');
  
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Show loading state
      output.innerHTML = '<div class="loading-spinner"></div><p>Generating your personalized packing list...</p>';
      
      // Get form data
      const formData = {
        destination: document.getElementById('destination').value,
        startDate: document.getElementById('start-date').value,
        endDate: document.getElementById('end-date').value,
        tripType: document.getElementById('trip-type').value,
        activities: document.getElementById('activities').value
      };
  
      try {
        // Send data to server
        const response = await fetch('http://localhost:3000/generate-packing-list', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || 
            errorData.message || 
            `Server responded with status ${response.status}`
          );
        }
  
        const data = await response.json();
        
        // Format the packing list response
        formatPackingList(data.packingList);
        
      } catch (error) {
        console.error('Full error:', error);
        output.innerHTML = `
          <div class="error-message">
            <h3>Error generating packing list</h3>
            <p>${error.message}</p>
            <p>Please check your connection and try again.</p>
          </div>
        `;
      }
    });
  
    function formatPackingList(packingListText) {
      // Remove markdown code blocks if present
      let cleanedText = packingListText.replace(/```html/g, '').replace(/```/g, '').trim();
      
      // Create DOM element to parse the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = cleanedText;
  
      // Apply our styling classes
      const sections = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
      sections.forEach(section => {
        section.classList.add('packing-section-title');
      });
  
      const lists = tempDiv.querySelectorAll('ul, ol');
      lists.forEach(list => {
        list.classList.add('packing-list');
        
        const items = list.querySelectorAll('li');
        items.forEach(item => {
          item.classList.add('packing-item');
        });
      });
  
      // Insert into DOM
      output.innerHTML = tempDiv.innerHTML;
    }
  });