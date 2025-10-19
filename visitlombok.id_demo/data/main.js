// Main JavaScript file - Shared functions and data

// Global data storage
let wisataData = [];
let currentPosition = null;

// Initialize mobile menu
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
});

// Load data from JSON
async function loadWisataData() {
    try {
        const response = await fetch('data/wisata.json');
        wisataData = await response.json();
        return wisataData;
    } catch (error) {
        console.error('Error loading wisata data:', error);
        return [];
    }
}

// Get current location
function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentPosition = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                resolve(currentPosition);
            },
            (error) => {
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    });
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
}

// Format distance for display
function formatDistance(distance) {
    if (distance < 1) {
        return Math.round(distance * 1000) + ' m';
    } else {
        return distance.toFixed(1) + ' km';
    }
}

// Create marker icon based on category
function createMarkerIcon(category, isHighlighted = false) {
    const colors = {
        'alam': 'green',
        'budaya': 'orange',
        'kuliner': 'red',
        'religi': 'purple',
        'buatan': 'blue'
    };

    const color = colors[category] || 'gray';
    const size = isHighlighted ? '16px' : '12px';
    const border = isHighlighted ? '3px solid white' : '2px solid white';

    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: ${size}; height: ${size}; border-radius: 50%; border: ${border};"></div>`,
        iconSize: isHighlighted ? [20, 20] : [16, 16],
        iconAnchor: isHighlighted ? [10, 10] : [8, 8]
    });
}

// Create popup content for a wisata
function createPopupContent(wisata) {
    return `
        <div class="p-3 max-w-sm">
            <h3 class="font-bold text-lg mb-2">${wisata.nama}</h3>
            <img src="${wisata.gambar}" alt="${wisata.nama}" class="w-full h-32 object-cover rounded mb-2">
            <div class="space-y-1 text-sm">
                <p><strong>Kategori:</strong> ${wisata.kategori}</p>
                <p><strong>Wilayah:</strong> ${wisata.wilayah}</p>
                <p><strong>Jam:</strong> ${wisata.jam}</p>
                <p><strong>Tiket:</strong> ${wisata.tiket}</p>
            </div>
            <div class="mt-3 flex space-x-2">
                <button onclick="viewDetail('${wisata.id}')" class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex-1">
                    Detail
                </button>
                <button onclick="showRoute(${wisata.lat}, ${wisata.lng})" class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex-1">
                    Rute
                </button>
            </div>
        </div>
    `;
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.fixed-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `fixed-notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    } text-white`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Filter data based on criteria
function filterWisata(data, filters) {
    return data.filter(wisata => {
        // Region filter
        if (filters.region !== 'all' && wisata.wilayah !== filters.region) {
            return false;
        }
        
        // Category filter
        if (filters.category !== 'all' && wisata.kategori !== filters.category) {
            return false;
        }
        
        // Search filter
        if (filters.search && !wisata.nama.toLowerCase().includes(filters.search.toLowerCase())) {
            return false;
        }
        
        return true;
    });
}

// View detail function (global for popup access)
function viewDetail(wisataId) {
    // In a real application, this would redirect to a detail page
    showNotification(`Membuka detail untuk wisata ID: ${wisataId}`, 'info');
}

// Show route function (global for popup access)
function showRoute(lat, lng) {
    if (currentPosition) {
        // Simple routing line (in real app, use Leaflet Routing Machine)
        showNotification(`Menampilkan rute ke lokasi: ${lat}, ${lng}`, 'info');
    } else {
        showNotification('Aktifkan "Dekat Saya" terlebih dahulu', 'error');
    }
}