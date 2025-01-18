

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const elements = document.querySelectorAll('.element');
    const dropZones = document.querySelectorAll('.drop-zone');
    const resultZone = document.querySelector('.result-zone');
    const discoveredList = document.getElementById('discoveredElements');

    // Validate required elements
    if (!discoveredList) {
        console.error('Could not find discoveredElements container');
        return;
    }

    // Track discovered elements
    const discoveries = new Set(['Water', 'Fire', 'Earth', 'Air']);

    // Add drag and drop listeners
    elements.forEach(element => {
        element.addEventListener('dragstart', handleDragStart);
        element.addEventListener('dragend', handleDragEnd);
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });

    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.element);
        e.target.classList.add('dragging');
    }

    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        const zone = e.currentTarget;
        zone.classList.remove('drag-over');
        
        const elementName = e.dataTransfer.getData('text/plain');
        const newElement = createElementDiv(elementName);
        
        zone.innerHTML = '';
        zone.appendChild(newElement);
        
        checkCombination();
    }

    function createElementDiv(name) {
        const div = document.createElement('div');
        div.className = 'element';
        div.textContent = name;
        div.dataset.element = name;
        div.draggable = true;
        div.addEventListener('dragstart', handleDragStart);
        div.addEventListener('dragend', handleDragEnd);
        return div;
    }

    function checkCombination() {
        const zone1Element = document.querySelector('#dropZone1 .element');
        const zone2Element = document.querySelector('#dropZone2 .element');
    
        if (zone1Element && zone2Element) {
            const element1 = zone1Element.dataset.element;
            const element2 = zone2Element.dataset.element;
            console.log('Combining:', element1, element2);
    
            resultZone.textContent = 'Thinking...';
    
            fetch('/api/combinations/combine', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ element1, element2 })
            })
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    console.warn('Using fallback combination:', data.error);
                }
                displayResult(data.result);
            })
            .catch(error => {
                console.error('API Error:', error);
                const fallback = `${element1}${element2}`;
                console.warn('Using simple combination:', fallback);
                displayResult(fallback);
            });
        }
    }

    function displayResult(result) {
        resultZone.innerHTML = '';
        const resultElement = createElementDiv(result);
        resultZone.appendChild(resultElement);
        
        if (!discoveries.has(result)) {
            discoveries.add(result);
            updateDiscoveries(result);
        }
    }

    function updateDiscoveries(newElement) {
        const discoveryDiv = createElementDiv(newElement);
        discoveryDiv.classList.add('new-discovery');
        discoveredList.appendChild(discoveryDiv);
    }

    // Initialize discovered elements (only once)
    discoveries.forEach(element => {
        updateDiscoveries(element);
    });
});


