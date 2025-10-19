// Peta page specific JavaScript dengan fitur navigasi
let map;
let markers = [];
let currentLocationMarker = null;
let routingControl = null;
let currentRoute = null;

document.addEventListener('DOMContentLoaded', async function() {
    // Load data
    const data = await loadWisataData();
    
    // Initialize map
    initializeMap(data);
    
    // Setup event listeners
    setupEventListeners(data);
});

function initializeMap(data) {
    // Initialize map centered on Lombok
    map = L.map('map').setView([-8.6500, 116.3167], 9);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add markers for all wisata
    addMarkersToMap(data);
    
    // Update results list
    updateResultsList(data);
}

function addMarkersToMap(data) {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Add new markers
    data.forEach(wisata => {
        const marker = L.marker([wisata.lat, wisata.lng], {
            icon: createMarkerIcon(wisata.kategori)
        })
        .bindPopup(createPopupContentWithRouting(wisata))
        .addTo(map);
        
        markers.push(marker);
    });
}

// Enhanced popup content with routing
function createPopupContentWithRouting(wisata) {
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
                <button onclick="showRouteToDestination(${wisata.lat}, ${wisata.lng}, '${wisata.nama}')" class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex-1">
                    <i class="fas fa-route mr-1"></i>Rute
                </button>
            </div>
        </div>
    `;
}

function setupEventListeners(data) {
    // Region filter
    document.getElementById('regionFilter').addEventListener('change', function() {
        filterAndUpdateMap(data);
    });
    
    // Category filter
    document.getElementById('categoryFilter').addEventListener('change', function() {
        filterAndUpdateMap(data);
    });
    
    // Search input
    document.getElementById('searchInput').addEventListener('input', function() {
        filterAndUpdateMap(data);
    });
    
    // Current location button
    document.getElementById('currentLocation').addEventListener('click', function() {
        getCurrentLocation().then(position => {
            // Add current location marker
            if (currentLocationMarker) {
                map.removeLayer(currentLocationMarker);
            }
            
            currentLocationMarker = L.marker([position.lat, position.lng], {
                icon: L.divIcon({
                    className: 'current-location-icon',
                    html: '<div style="background-color: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                    iconSize: [22, 22],
                    iconAnchor: [11, 11]
                })
            })
            .bindPopup('Lokasi Anda Sekarang')
            .addTo(map);
            
            // Center map on current location
            map.setView([position.lat, position.lng], 13);
            
            // Sort by distance
            sortByDistance(data, position);
            
            showNotification('Lokasi Anda telah ditemukan', 'success');
        }).catch(error => {
            showNotification('Tidak dapat mengakses lokasi: ' + error.message, 'error');
        });
    });
    
    // Clear filters button
    document.getElementById('clearFilters').addEventListener('click', function() {
        document.getElementById('regionFilter').value = 'all';
        document.getElementById('categoryFilter').value = 'all';
        document.getElementById('searchInput').value = '';
        filterAndUpdateMap(data);
    });
    
    // Clear route button
    document.getElementById('clearRoute').addEventListener('click', function() {
        closeRoute();
    });
}

function filterAndUpdateMap(data) {
    const filters = {
        region: document.getElementById('regionFilter').value,
        category: document.getElementById('categoryFilter').value,
        search: document.getElementById('searchInput').value
    };
    
    const filteredData = filterWisata(data, filters);
    addMarkersToMap(filteredData);
    updateResultsList(filteredData);
}

function updateResultsList(data) {
    const resultsList = document.getElementById('resultsList');
    
    if (data.length === 0) {
        resultsList.innerHTML = '<p class="text-gray-500 text-center">Tidak ada hasil ditemukan</p>';
        return;
    }
    
    resultsList.innerHTML = data.map(wisata => `
        <div class="bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-green-50 destination-item border-l-4 border-green-500" 
             data-lat="${wisata.lat}" data-lng="${wisata.lng}" data-id="${wisata.id}">
            <h4 class="font-semibold text-green-700">${wisata.nama}</h4>
            <p class="text-sm text-gray-600">${wisata.wilayah} • ${wisata.kategori}</p>
            <p class="text-xs text-gray-500 mt-1">${wisata.jam} • ${wisata.tiket}</p>
            <div class="mt-2 flex space-x-2">
                <button onclick="viewDetail('${wisata.id}')" class="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">
                    Detail
                </button>
                <button onclick="showRouteToDestination(${wisata.lat}, ${wisata.lng}, '${wisata.nama}')" class="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">
                    <i class="fas fa-route mr-1"></i>Rute
                </button>
            </div>
        </div>
    `).join('');
    
    // Add click event to result items
    document.querySelectorAll('.destination-item').forEach(item => {
        item.addEventListener('click', function() {
            const lat = parseFloat(this.dataset.lat);
            const lng = parseFloat(this.dataset.lng);
            map.setView([lat, lng], 15);
            
            // Find and open corresponding marker popup
            markers.forEach(marker => {
                const markerLat = marker.getLatLng().lat;
                const markerLng = marker.getLatLng().lng;
                if (markerLat === lat && markerLng === lng) {
                    marker.openPopup();
                }
            });
        });
    });
}

function sortByDistance(data, position) {
    const dataWithDistance = data.map(wisata => ({
        ...wisata,
        distance: calculateDistance(position.lat, position.lng, wisata.lat, wisata.lng)
    }));
    
    dataWithDistance.sort((a, b) => a.distance - b.distance);
    updateResultsList(dataWithDistance);
}

// Show route from current location to destination
function showRouteToDestination(destinationLat, destinationLng, destinationName) {
    // Remove existing route
    if (routingControl) {
        map.removeControl(routingControl);
        routingControl = null;
    }
    
    // Check if current location is available
    if (!currentPosition) {
        showNotification('Aktifkan "Dekat Saya" terlebih dahulu untuk melihat rute', 'error');
        return;
    }
    
    // Show loading
    showNotification('Menghitung rute terbaik...', 'info');
    
    // Create routing control
    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(currentPosition.lat, currentPosition.lng),
            L.latLng(destinationLat, destinationLng)
        ],
        routeWhileDragging: false,
        showAlternatives: false,
        fitSelectedRoutes: true,
        show: false, // Hide default instructions
        lineOptions: {
            styles: [
                {
                    color: '#10b981',
                    weight: 6,
                    opacity: 0.8,
                    dashArray: '10, 10'
                }
            ]
        },
        createMarker: function(i, waypoint, n) {
            if (i === 0) {
                // Start marker (current location)
                return L.marker(waypoint.latLng, {
                    icon: L.divIcon({
                        className: 'current-location-icon',
                        html: '<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><i class="fas fa-user" style="color: white; font-size: 10px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></i></div>',
                        iconSize: [26, 26],
                        iconAnchor: [13, 13]
                    })
                }).bindPopup('<strong>Lokasi Anda</strong><br> Titik mulai perjalanan');
            } else {
                // Destination marker
                return L.marker(waypoint.latLng, {
                    icon: L.divIcon({
                        className: 'destination-icon',
                        html: '<div style="background-color: #10b981; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><i class="fas fa-flag" style="color: white; font-size: 8px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></i></div>',
                        iconSize: [26, 26],
                        iconAnchor: [13, 13]
                    })
                }).bindPopup(`<strong>${destinationName}</strong><br>Tujuan Anda`);
            }
        },
        router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1',
            profile: 'driving'
        })
    }).addTo(map);
    
    // Show clear route button
    document.getElementById('clearRoute').classList.remove('hidden');
    
    // Handle route found
    routingControl.on('routesfound', function(e) {
        const routes = e.routes;
        const summary = routes[0].summary;
        
        // Calculate distance and time
        const distance = (summary.totalDistance / 1000).toFixed(1); // km
        const time = Math.round(summary.totalTime / 60); // minutes
        
        // Convert to hours and minutes if more than 60 minutes
        let timeText;
        if (time >= 60) {
            const hours = Math.floor(time / 60);
            const minutes = time % 60;
            timeText = minutes > 0 ? `${hours} jam ${minutes} menit` : `${hours} jam`;
        } else {
            timeText = `${time} menit`;
        }
        
        // Show route info panel
        showRouteInfoPanel(distance, timeText, destinationName);
        
        showNotification(`Rute ditemukan! Jarak: ${distance} km, Waktu: ${timeText}`, 'success');
        
        // Store current route info
        currentRoute = {
            distance: distance,
            time: timeText,
            destination: destinationName,
            destinationLat: destinationLat,
            destinationLng: destinationLng
        };
    });
    
    // Handle routing errors
    routingControl.on('routingerror', function(e) {
        console.error('Routing error:', e.error);
        showNotification('Gagal menghitung rute. Silakan coba lagi.', 'error');
    });
}

// Show route information panel
function showRouteInfoPanel(distance, time, destinationName) {
    const panel = document.getElementById('routeInfoPanel');
    const distanceElement = document.getElementById('routeDistance');
    const timeElement = document.getElementById('routeTime');
    const titleElement = document.getElementById('routeTitle');
    
    // Update content
    distanceElement.textContent = `${distance} km`;
    timeElement.textContent = time;
    titleElement.textContent = `Rute ke ${destinationName}`;
    
    // Show panel
    panel.classList.remove('hidden');
    panel.classList.add('animate__animated', 'animate__fadeInUp');
}

// Close route info panel
function closeRouteInfo() {
    const panel = document.getElementById('routeInfoPanel');
    panel.classList.add('hidden');
    panel.classList.remove('animate__animated', 'animate__fadeInUp');
}

// Close route and remove from map
function closeRoute() {
    if (routingControl) {
        map.removeControl(routingControl);
        routingControl = null;
    }
    
    closeRouteInfo();
    currentRoute = null;
    
    // Hide clear route button
    document.getElementById('clearRoute').classList.add('hidden');
    
    showNotification('Rute telah dihapus', 'info');
}

// Start navigation (simulated)
function startNavigation() {
    if (!currentRoute) {
        showNotification('Tidak ada rute aktif', 'error');
        return;
    }
    
    showNotification(`Navigasi dimulai menuju ${currentRoute.destination}`, 'success');
    
    // Update UI for active navigation
    const panel = document.getElementById('routeInfoPanel');
    const startButton = panel.querySelector('button[onclick="startNavigation()"]');
    
    if (startButton) {
        startButton.innerHTML = '<i class="fas fa-compass mr-2"></i>Sedang Navigasi...';
        startButton.disabled = true;
        startButton.className = 'flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center';
        startButton.onclick = null;
    }
    
    // Center map on route
    if (currentRoute.destinationLat && currentRoute.destinationLng) {
        map.setView([currentRoute.destinationLat, currentRoute.destinationLng], 13);
    }
    
    // Simulate navigation progress
    simulateNavigationProgress();
}

// Simulate navigation progress
function simulateNavigationProgress() {
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 5;
        
        if (progress >= 100) {
            clearInterval(progressInterval);
            showNotification('Anda telah tiba di tujuan!', 'success');
            
            const panel = document.getElementById('routeInfoPanel');
            const startButton = panel.querySelector('button');
            
            if (startButton) {
                startButton.innerHTML = '<i class="fas fa-flag-checkered mr-2"></i>Tiba di Tujuan';
                startButton.className = 'flex-1 bg-green-600 text-white py-2 px-3 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center';
            }
        }
    }, 1000);
}

// Global functions for popup access
window.showRouteToDestination = showRouteToDestination;
window.closeRouteInfo = closeRouteInfo;
window.closeRoute = closeRoute;
window.startNavigation = startNavigation;
window.viewDetail = function(wisataId) {
    showNotification(`Membuka detail untuk wisata ID: ${wisataId}`, 'info');
    // In real app: window.location.href = `detail.html?id=${wisataId}`;
};