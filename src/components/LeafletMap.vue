<template>
    <div class="leaflet-map-wrapper">
      <div ref="mapContainer" class="leaflet-map"></div>
    </div>
  </template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import L from 'leaflet';

const props = defineProps({
  center: {
    type: Array, // [lat, lng]
    default: () => [59.33, 18.06],
  },
  zoom: {
    type: Number,
    default: 4,
  },
  clickable: {
    type: Boolean,
    default: false, // when true, clicks on the map are emitted
  },
  markers: {
    type: Array,
    default: () => [], // [{ id, lat, lng, label }]
  },
  correctLocation: {
    // Correct answer location: { lat, lng, label }
    type: Object,
    default: null,
  },
  allowGuessMarker: {
    type: Boolean,
    default: false, // when true, place a temporary marker where the user clicks
  },
  guessMarker: {
    // current guess from the parent: { lat, lng }
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['map-click']);

const mapContainer = ref(null);
let map;
let markerLayer; // LayerGroup for markers
let guessMarkerInstance;
let polylineLayer; // LayerGroup for polylines
let correctMarkerInstance; // Grey marker for correct location

const initMap = () => {
  map = L.map(mapContainer.value).setView(props.center, props.zoom);

  // Add CARTO light basemap (OpenStreetMap data) before any overlays/markers
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd',
    attribution: '© OpenStreetMap contributors © CARTO',
  }).addTo(map);

  markerLayer = L.layerGroup().addTo(map);
  polylineLayer = L.layerGroup().addTo(map);

  if (props.clickable) {
    map.on('click', handleMapClick);
  }

  renderMarkers();
};

const handleMapClick = (e) => {
  const { lat, lng } = e.latlng;

  // Set or update the temporary guess marker when allowed
  if (props.allowGuessMarker) {
    if (!guessMarkerInstance) {
      guessMarkerInstance = L.marker([lat, lng]).addTo(map);
    } else {
      guessMarkerInstance.setLatLng([lat, lng]);
    }
  }

  // Emit click to parent
  emit('map-click', { lat, lng });
};

const renderMarkers = () => {
  if (!map || !markerLayer) return;

  markerLayer.clearLayers();
  polylineLayer.clearLayers();

  // Draw polylines from guesses to correct location
  if (props.correctLocation && props.markers && props.markers.length > 0) {
    props.markers.forEach((m) => {
      const polyline = L.polyline(
        [[m.lat, m.lng], [props.correctLocation.lat, props.correctLocation.lng]],
        {
          color: '#999999',
          weight: 2,
          dashArray: '5, 5', // dotted line
          opacity: 0.6,
        }
      );
      polyline.addTo(polylineLayer);
    });
  }

  // Helper function to create colored pin SVG
  const createColoredPinIcon = (color) => {
    const svg = `<svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Map pin"
      role="img"
    >
      <!-- Pin body -->
      <path
        d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"
        fill="${color}"
      />
      <!-- Inner circle -->
      <circle cx="12" cy="10" r="2.6" fill="#ffffff" />
    </svg>`;

    return L.icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  };

  // Regular markers from props
  if (props.markers && props.markers.length > 0) {
    props.markers.forEach((m) => {
      const color = m.playerColor || '#999999';
      const icon = createColoredPinIcon(color);
      const marker = L.marker([m.lat, m.lng], { icon });
      if (m.label) {
        marker.bindPopup(m.label);
      }
      marker.addTo(markerLayer);
    });
  }

  // Correct location marker (grey dot)
  if (props.correctLocation) {
    const greyIcon = L.icon({
      iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iIzk5OTk5OSIgc3Ryb2tlPSIjNjY2NjY2IiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
    });
    correctMarkerInstance = L.marker([props.correctLocation.lat, props.correctLocation.lng], { icon: greyIcon });
    if (props.correctLocation.label) {
      correctMarkerInstance.bindPopup(`Correct: ${props.correctLocation.label}`);
    }
    correctMarkerInstance.addTo(markerLayer);
  }

  // Guess marker from parent
  if (props.guessMarker && props.allowGuessMarker) {
    // Create a primary-colored pin icon for the guess marker
    const svg = `<svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Map pin"
      role="img"
    >
      <!-- Pin body -->
      <path
        d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"
        fill="var(--primary)"
      />
      <!-- Inner circle -->
      <circle cx="12" cy="10" r="2.6" fill="#ffffff" />
    </svg>`;

    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#80c860';
    const svgWithColor = svg.replace('fill="var(--primary)"', `fill="${primaryColor}"`);

    const icon = L.icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(svgWithColor)}`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    if (!guessMarkerInstance) {
      guessMarkerInstance = L.marker([
        props.guessMarker.lat,
        props.guessMarker.lng,
      ], { icon }).addTo(map);
    } else {
      guessMarkerInstance.setLatLng([
        props.guessMarker.lat,
        props.guessMarker.lng,
      ]);
    }
  }
};

onMounted(() => {
  initMap();
});

onBeforeUnmount(() => {
  if (map) {
    map.off();
    map.remove();
  }
});

watch(
  () => props.markers,
  () => {
    renderMarkers();
  },
  { deep: true }
);

watch(
  () => props.correctLocation,
  () => {
    renderMarkers();
  },
  { deep: true }
);

watch(
  () => props.center,
  (newCenter) => {
    if (map && Array.isArray(newCenter)) {
      map.setView(newCenter, props.zoom);
    }
  }
);

watch(
  () => props.zoom,
  (newZoom) => {
    if (map && typeof newZoom === 'number') {
      map.setZoom(newZoom);
    }
  }
);

watch(
  () => props.guessMarker,
  () => {
    renderMarkers();
  },
  { deep: true }
);
</script>

<style scoped>
.leaflet-map-wrapper {
  width: 100%;
  height: 100%;
}

.leaflet-map {
  width: 100%;
  height: 300px; /* adjust as needed */
  border-radius: 8px;
  overflow: hidden;
}
</style>
