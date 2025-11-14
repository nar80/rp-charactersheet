<template>
  <div class="armor-visualization">
    <svg
      viewBox="0 0 120 240"
      class="armor-figure"
      preserveAspectRatio="xMidYMid meet"
    >
      <!-- Head -->
      <ellipse
        cx="60"
        cy="24"
        rx="15"
        ry="18"
        :fill="getZoneColor('Kopf')"
        :stroke="getZoneStroke('Kopf')"
        stroke-width="1.5"
        class="armor-zone"
      >
        <title>Kopf: {{ getZoneAP("Kopf") }} RP</title>
      </ellipse>

      <!-- Body (Torso) -->
      <rect
        x="39"
        y="42"
        width="42"
        height="48"
        rx="6"
        :fill="getZoneColor('Körper')"
        :stroke="getZoneStroke('Körper')"
        stroke-width="1.5"
        class="armor-zone"
      >
        <title>Körper: {{ getZoneAP("Körper") }} RP</title>
      </rect>

      <!-- Left Arm -->
      <rect
        x="21"
        y="45"
        width="15"
        height="42"
        rx="7"
        :fill="getZoneColor('Arme')"
        :stroke="getZoneStroke('Arme')"
        stroke-width="1.5"
        class="armor-zone"
      >
        <title>Arme: {{ getZoneAP("Arme") }} RP</title>
      </rect>

      <!-- Right Arm -->
      <rect
        x="84"
        y="45"
        width="15"
        height="42"
        rx="7"
        :fill="getZoneColor('Arme')"
        :stroke="getZoneStroke('Arme')"
        stroke-width="1.5"
        class="armor-zone"
      >
        <title>Arme: {{ getZoneAP("Arme") }} RP</title>
      </rect>

      <!-- Left Leg -->
      <rect
        x="42"
        y="93"
        width="15"
        height="54"
        rx="6"
        :fill="getZoneColor('Beine')"
        :stroke="getZoneStroke('Beine')"
        stroke-width="1.5"
        class="armor-zone"
      >
        <title>Beine: {{ getZoneAP("Beine") }} RP</title>
      </rect>

      <!-- Right Leg -->
      <rect
        x="63"
        y="93"
        width="15"
        height="54"
        rx="6"
        :fill="getZoneColor('Beine')"
        :stroke="getZoneStroke('Beine')"
        stroke-width="1.5"
        class="armor-zone"
      >
        <title>Beine: {{ getZoneAP("Beine") }} RP</title>
      </rect>

      <!-- Zone Labels with AP values -->
      <text
        x="60"
        y="27"
        text-anchor="middle"
        class="zone-label"
        :fill="getZoneLabelColor('Kopf')"
      >
        {{ getZoneAPDisplay("Kopf") }}
      </text>
      <text
        x="60"
        y="69"
        text-anchor="middle"
        class="zone-label"
        :fill="getZoneLabelColor('Körper')"
      >
        {{ getZoneAPDisplay("Körper") }}
      </text>
      <text
        x="28"
        y="69"
        text-anchor="middle"
        class="zone-label-sm"
        :fill="getZoneLabelColor('Arme')"
      >
        {{ getZoneAPDisplay("Arme") }}
      </text>
      <text
        x="92"
        y="69"
        text-anchor="middle"
        class="zone-label-sm"
        :fill="getZoneLabelColor('Arme')"
      >
        {{ getZoneAPDisplay("Arme") }}
      </text>
      <text
        x="49"
        y="123"
        text-anchor="middle"
        class="zone-label-sm"
        :fill="getZoneLabelColor('Beine')"
      >
        {{ getZoneAPDisplay("Beine") }}
      </text>
      <text
        x="70"
        y="123"
        text-anchor="middle"
        class="zone-label-sm"
        :fill="getZoneLabelColor('Beine')"
      >
        {{ getZoneAPDisplay("Beine") }}
      </text>
    </svg>

    <!-- Total Weight -->
    <div class="armor-total q-mt-sm text-center">
      <div class="text-caption text-grey-6">Gesamtgewicht:</div>
      <div class="text-h6 text-bold text-primary">{{ totalWeight }} kg</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  armor: {
    type: Array,
    required: true,
  },
});

defineEmits(["zone-click"]);

const zones = ["Kopf", "Körper", "Arme", "Beine"];

// Calculate effective AP for each zone and track which armor provides the max
const getZoneAPWithQuality = (zone) => {
  let maxArmor = null;
  let maxAP = 0;
  let additiveAP = 0;

  props.armor.forEach((armorPiece) => {
    // Only consider equipped armor
    if (!armorPiece.equipped) return;

    // Check if this armor covers this zone or all zones
    if (
      armorPiece.locations.includes(zone) ||
      armorPiece.locations.length === 0
    ) {
      let ap = armorPiece.ap || 0;

      // Apply quality modifiers
      if (armorPiece.quality === "Hervorragend") {
        ap += 1;
      }

      // Additive armor (shields, etc.) adds to base
      if (armorPiece.additive) {
        additiveAP += ap;
      } else {
        // Normal armor takes maximum - track which one
        if (ap > maxAP) {
          maxAP = ap;
          maxArmor = armorPiece;
        }
      }
    }
  });

  return {
    total: maxAP + additiveAP,
    hasGutBonus: maxArmor?.quality === "Gut",
  };
};

// Calculate effective AP for each zone (for backward compatibility)
const getZoneAP = (zone) => {
  return getZoneAPWithQuality(zone).total;
};

// Get display text for zone AP (shows bonus from "Gut" quality)
const getZoneAPDisplay = (zone) => {
  const zoneData = getZoneAPWithQuality(zone);
  if (zoneData.hasGutBonus && zoneData.total > 0) {
    return `${zoneData.total}(${zoneData.total + 1})`;
  }
  return zoneData.total.toString();
};

// Calculate total weight of equipped armor
const totalWeight = computed(() => {
  let total = 0;

  props.armor.forEach((armorPiece) => {
    if (armorPiece.equipped) {
      let weight = armorPiece.weight || 0;

      // Apply quality modifiers
      if (armorPiece.quality === "Hervorragend") {
        weight = weight / 2;
      }

      total += weight;
    }
  });

  return total.toFixed(1);
});

const hasArmor = (zone) => {
  return getZoneAP(zone) > 0;
};

// Color based on armor level
const getZoneColor = (zone) => {
  const ap = getZoneAP(zone);

  if (ap === 0) {
    return "rgba(150, 150, 150, 0.2)"; // Unarmored - grey
  } else if (ap <= 2) {
    return "rgba(255, 193, 7, 0.4)"; // Light armor - amber
  } else if (ap <= 4) {
    return "rgba(33, 150, 243, 0.5)"; // Medium armor - blue
  } else if (ap <= 6) {
    return "rgba(76, 175, 80, 0.6)"; // Heavy armor - green
  } else {
    return "rgba(156, 39, 176, 0.7)"; // Super heavy - purple
  }
};

const getZoneStroke = (zone) => {
  const ap = getZoneAP(zone);
  return ap > 0 ? "#d4af37" : "rgba(255, 255, 255, 0.3)";
};

const getZoneLabelColor = (zone) => {
  const ap = getZoneAP(zone);
  return ap > 0 ? "#ffffff" : "#999999";
};
</script>

<style scoped>
.armor-visualization {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 213, 79, 0.2);
  border-radius: 8px;
  height: 100%;
}

.armor-figure {
  width: 160px;
  height: 320px;
  max-width: 100%;
}

.armor-zone {
  cursor: pointer;
  transition: all 0.2s ease;
}

.armor-zone:hover {
  filter: brightness(1.3);
  stroke-width: 2.5;
}

.zone-label {
  font-size: 14px;
  font-weight: bold;
  pointer-events: none;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
}

.zone-label-sm {
  font-size: 10px;
  font-weight: bold;
  pointer-events: none;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
}

.armor-total {
  width: 100%;
}
</style>
