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
      default: () => [59.33, 18.06], // typ Stockholm
    },
    zoom: {
      type: Number,
      default: 4,
    },
    clickable: {
      type: Boolean,
      default: false, // om true: vi lyssnar på klick på kartan
    },
    markers: {
      type: Array,
      default: () => [], // [{ id, lat, lng, label }]
    },
    allowGuessMarker: {
      type: Boolean,
      default: false, // om true: vi sätter en "guess"-marker där man klickar
    },
    guessMarker: {
      // aktuell gissning från parent: { lat, lng }
      type: Object,
      default: null,
    },
  });
  
  const emit = defineEmits(['map-click']);
  
  const mapContainer = ref(null);
  let map;
  let markerLayer; // LayerGroup för markers
  let guessMarkerInstance;
  
  const initMap = () => {
    map = L.map(mapContainer.value).setView(props.center, props.zoom);
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);
  
    markerLayer = L.layerGroup().addTo(map);
  
    if (props.clickable) {
      map.on('click', handleMapClick);
    }
  
    renderMarkers();
  };
  
  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
  
    // Sätt/uppdatera "guess"-markern om tillåtet
    if (props.allowGuessMarker) {
      if (!guessMarkerInstance) {
        guessMarkerInstance = L.marker([lat, lng]).addTo(map);
      } else {
        guessMarkerInstance.setLatLng([lat, lng]);
      }
    }
  
    // Skicka upp klicket till parent
    emit('map-click', { lat, lng });
  };
  
  const renderMarkers = () => {
    if (!map || !markerLayer) return;
  
    markerLayer.clearLayers();
  
    // Vanliga markers från props
    if (props.markers && props.markers.length > 0) {
      props.markers.forEach((m) => {
        const marker = L.marker([m.lat, m.lng]);
        if (m.label) {
          marker.bindPopup(m.label);
        }
        marker.addTo(markerLayer);
      });
    }
  
    // GuessMarker från parent
    if (props.guessMarker && props.allowGuessMarker) {
      if (!guessMarkerInstance) {
        guessMarkerInstance = L.marker([
          props.guessMarker.lat,
          props.guessMarker.lng,
        ]).addTo(map);
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
    height: 300px; /* justera som du vill */
    border-radius: 8px;
    overflow: hidden;
  }
  </style>
  