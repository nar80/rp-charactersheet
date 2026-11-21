<template>
  <div class="armor-visualization">
    <svg
      viewBox="-5 -15 290 145"
      class="armor-figure"
      preserveAspectRatio="xMidYMid meet"
    >
      <!-- Head -->
      <ellipse
        cx="140"
        cy="16"
        rx="13"
        ry="16"
        :fill="getZoneColor('Kopf')"
        :stroke="getZoneStroke('Kopf')"
        stroke-width="1.5"
        class="armor-zone"
      >
        <title>Kopf: {{ getZoneAP("Kopf") }} RP</title>
      </ellipse>

      <!-- Body (Torso) -->
      <rect
        x="121"
        y="32"
        width="38"
        height="42"
        rx="5"
        :fill="getZoneColor('Körper')"
        :stroke="getZoneStroke('Körper')"
        stroke-width="1.5"
        class="armor-zone"
      >
        <title>Körper: {{ getZoneAP("Körper") }} RP</title>
      </rect>

      <!-- Left Arm (viewer's right = character's left) -->
      <rect
        x="161"
        y="34"
        width="14"
        height="38"
        rx="7"
        :fill="getZoneColor('Linker Arm')"
        :stroke="getZoneStroke('Linker Arm')"
        stroke-width="1.5"
        class="armor-zone"
      >
        <title>Linker Arm: {{ getZoneAP("Linker Arm") }} RP</title>
      </rect>

      <!-- Right Arm (viewer's left = character's right) -->
      <rect
        x="105"
        y="34"
        width="14"
        height="38"
        rx="7"
        :fill="getZoneColor('Rechter Arm')"
        :stroke="getZoneStroke('Rechter Arm')"
        stroke-width="1.5"
        class="armor-zone"
      >
        <title>Rechter Arm: {{ getZoneAP("Rechter Arm") }} RP</title>
      </rect>

      <!-- Left Leg (viewer's right = character's left) -->
      <rect
        x="146"
        y="76"
        width="14"
        height="48"
        rx="6"
        :fill="getZoneColor('Linkes Bein')"
        :stroke="getZoneStroke('Linkes Bein')"
        stroke-width="1.5"
        class="armor-zone"
      >
        <title>Linkes Bein: {{ getZoneAP("Linkes Bein") }} RP</title>
      </rect>

      <!-- Right Leg (viewer's left = character's right) -->
      <rect
        x="120"
        y="76"
        width="14"
        height="48"
        rx="6"
        :fill="getZoneColor('Rechtes Bein')"
        :stroke="getZoneStroke('Rechtes Bein')"
        stroke-width="1.5"
        class="armor-zone"
      >
        <title>Rechtes Bein: {{ getZoneAP("Rechtes Bein") }} RP</title>
      </rect>

      <!-- AP Labels on body parts -->
      <!-- Kopf -->
      <text x="140" y="18" text-anchor="middle" class="zone-label-sm" :fill="getZoneLabelColor('Kopf')">
        {{ getZoneAPWithQuality("Kopf").total }}
      </text>
      <text v-if="getZoneAPWithQuality('Kopf').gutBonus" x="140" y="27" text-anchor="middle" class="zone-label-bonus" :fill="getZoneLabelColor('Kopf')">
        ({{ getZoneAPWithQuality("Kopf").total + getZoneAPWithQuality("Kopf").gutBonus }})
      </text>

      <!-- Körper -->
      <text x="140" y="50" text-anchor="middle" class="zone-label" :fill="getZoneLabelColor('Körper')">
        {{ getZoneAPWithQuality("Körper").total }}
      </text>
      <text v-if="getZoneAPWithQuality('Körper').gutBonus" x="140" y="62" text-anchor="middle" class="zone-label-bonus" :fill="getZoneLabelColor('Körper')">
        ({{ getZoneAPWithQuality("Körper").total + getZoneAPWithQuality("Körper").gutBonus }})
      </text>

      <!-- Rechter Arm (links im Bild) -->
      <text x="112" y="50" text-anchor="middle" class="zone-label-xs" :fill="getZoneLabelColor('Rechter Arm')">
        {{ getZoneAPWithQuality("Rechter Arm").total }}
      </text>
      <text v-if="getZoneAPWithQuality('Rechter Arm').gutBonus" x="112" y="60" text-anchor="middle" class="zone-label-bonus-sm" :fill="getZoneLabelColor('Rechter Arm')">
        ({{ getZoneAPWithQuality("Rechter Arm").total + getZoneAPWithQuality("Rechter Arm").gutBonus }})
      </text>

      <!-- Linker Arm (rechts im Bild) -->
      <text x="168" y="50" text-anchor="middle" class="zone-label-xs" :fill="getZoneLabelColor('Linker Arm')">
        {{ getZoneAPWithQuality("Linker Arm").total }}
      </text>
      <text v-if="getZoneAPWithQuality('Linker Arm').gutBonus" x="168" y="60" text-anchor="middle" class="zone-label-bonus-sm" :fill="getZoneLabelColor('Linker Arm')">
        ({{ getZoneAPWithQuality("Linker Arm").total + getZoneAPWithQuality("Linker Arm").gutBonus }})
      </text>

      <!-- Rechtes Bein (links im Bild) -->
      <text x="127" y="98" text-anchor="middle" class="zone-label-xs" :fill="getZoneLabelColor('Rechtes Bein')">
        {{ getZoneAPWithQuality("Rechtes Bein").total }}
      </text>
      <text v-if="getZoneAPWithQuality('Rechtes Bein').gutBonus" x="127" y="108" text-anchor="middle" class="zone-label-bonus-sm" :fill="getZoneLabelColor('Rechtes Bein')">
        ({{ getZoneAPWithQuality("Rechtes Bein").total + getZoneAPWithQuality("Rechtes Bein").gutBonus }})
      </text>

      <!-- Linkes Bein (rechts im Bild) -->
      <text x="153" y="98" text-anchor="middle" class="zone-label-xs" :fill="getZoneLabelColor('Linkes Bein')">
        {{ getZoneAPWithQuality("Linkes Bein").total }}
      </text>
      <text v-if="getZoneAPWithQuality('Linkes Bein').gutBonus" x="153" y="108" text-anchor="middle" class="zone-label-bonus-sm" :fill="getZoneLabelColor('Linkes Bein')">
        ({{ getZoneAPWithQuality("Linkes Bein").total + getZoneAPWithQuality("Linkes Bein").gutBonus }})
      </text>

      <!-- Hit Zone Lines and Labels (dezent) -->
      <!-- Kopf (1-10) - top -->
      <line x1="140" y1="0" x2="140" y2="-8" stroke="#444" stroke-width="0.5" />
      <line x1="140" y1="-8" x2="200" y2="-8" stroke="#444" stroke-width="0.5" />
      <text x="205" y="-5" class="hitzone-label">Kopf</text>
      <text x="205" y="4" class="hitzone-range">1-10</text>

      <!-- Rechter Arm (11-20) - left side -->
      <line x1="105" y1="53" x2="90" y2="53" stroke="#444" stroke-width="0.5" />
      <line x1="90" y1="53" x2="90" y2="25" stroke="#444" stroke-width="0.5" />
      <line x1="90" y1="25" x2="5" y2="25" stroke="#444" stroke-width="0.5" />
      <text x="3" y="22" class="hitzone-label" text-anchor="start">Rechter Arm</text>
      <text x="3" y="31" class="hitzone-range" text-anchor="start">11-20</text>

      <!-- Linker Arm (21-30) - right side -->
      <line x1="175" y1="53" x2="190" y2="53" stroke="#444" stroke-width="0.5" />
      <line x1="190" y1="53" x2="190" y2="25" stroke="#444" stroke-width="0.5" />
      <line x1="190" y1="25" x2="275" y2="25" stroke="#444" stroke-width="0.5" />
      <text x="205" y="22" class="hitzone-label">Linker Arm</text>
      <text x="205" y="31" class="hitzone-range">21-30</text>

      <!-- Körper (31-70) - right side -->
      <line x1="159" y1="53" x2="190" y2="53" stroke="#444" stroke-width="0.5" />
      <line x1="190" y1="53" x2="275" y2="53" stroke="#444" stroke-width="0.5" />
      <text x="205" y="50" class="hitzone-label">Körper</text>
      <text x="205" y="59" class="hitzone-range">31-70</text>

      <!-- Rechtes Bein (71-85) - left side -->
      <line x1="120" y1="100" x2="90" y2="100" stroke="#444" stroke-width="0.5" />
      <line x1="90" y1="100" x2="90" y2="75" stroke="#444" stroke-width="0.5" />
      <line x1="90" y1="75" x2="5" y2="75" stroke="#444" stroke-width="0.5" />
      <text x="3" y="72" class="hitzone-label" text-anchor="start">Rechtes Bein</text>
      <text x="3" y="81" class="hitzone-range" text-anchor="start">71-85</text>

      <!-- Linkes Bein (86-100) - right side -->
      <line x1="160" y1="100" x2="190" y2="100" stroke="#444" stroke-width="0.5" />
      <line x1="190" y1="100" x2="275" y2="100" stroke="#444" stroke-width="0.5" />
      <text x="205" y="97" class="hitzone-label">Linkes Bein</text>
      <text x="205" y="106" class="hitzone-range">86-100</text>
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

// Helper function to check if armor covers a specific zone
// Handles both standard locations (Arme, Beine) and specific locations (Linker Arm, etc.)
const armorCoversZone = (armorPiece, zone) => {
  const locations = armorPiece.locations;

  // No locations means all zones are covered
  if (!locations || locations.length === 0) return true;

  // Direct match
  if (locations.includes(zone)) return true;

  // Check for specific arm/leg locations
  if (zone === "Linker Arm") {
    return locations.includes("Arme") || locations.includes("Linker Arm");
  }
  if (zone === "Rechter Arm") {
    return locations.includes("Arme") || locations.includes("Rechter Arm");
  }
  if (zone === "Linkes Bein") {
    return locations.includes("Beine") || locations.includes("Linkes Bein");
  }
  if (zone === "Rechtes Bein") {
    return locations.includes("Beine") || locations.includes("Rechtes Bein");
  }

  // For generic zones (Arme, Beine), also check specific locations
  if (zone === "Arme") {
    return locations.includes("Arme") ||
           locations.includes("Linker Arm") ||
           locations.includes("Rechter Arm");
  }
  if (zone === "Beine") {
    return locations.includes("Beine") ||
           locations.includes("Linkes Bein") ||
           locations.includes("Rechtes Bein");
  }

  return false;
};

// Calculate effective AP for each zone and track quality bonuses
const getZoneAPWithQuality = (zone) => {
  let maxArmor = null;
  let maxAP = 0;
  let additiveAP = 0;
  let additiveGutBonus = 0; // Track "Gut" bonus from additive armor only

  props.armor.forEach((armorPiece) => {
    // Only consider equipped armor
    if (!armorPiece.equipped) return;

    // Check if this armor covers this zone
    if (armorCoversZone(armorPiece, zone)) {
      let ap = armorPiece.ap || 0;

      // Apply quality modifiers
      if (armorPiece.quality === "Hervorragend") {
        ap += 1;
      }

      // Additive armor (shields, etc.) adds to base
      if (armorPiece.additive) {
        additiveAP += ap;
        // Track "Gut" bonus for additive armor
        if (armorPiece.quality === "Gut") {
          additiveGutBonus += 1;
        }
      } else {
        // Normal armor takes maximum - track which one
        // At equal AP, prefer "Gut" quality armor for the bonus
        if (ap > maxAP || (ap === maxAP && armorPiece.quality === "Gut" && maxArmor?.quality !== "Gut")) {
          maxAP = ap;
          maxArmor = armorPiece;
        }
      }
    }
  });

  // "Gut" bonus comes from: the winning base armor (if "Gut") + all additive "Gut" armors
  const baseGutBonus = maxArmor?.quality === "Gut" ? 1 : 0;
  const totalGutBonus = baseGutBonus + additiveGutBonus;

  return {
    total: maxAP + additiveAP,
    gutBonus: totalGutBonus, // Can be 0, 1, 2, etc.
    hasGutBonus: totalGutBonus > 0, // For backward compatibility
  };
};

// Calculate effective AP for each zone (for backward compatibility)
const getZoneAP = (zone) => {
  return getZoneAPWithQuality(zone).total;
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
  width: 100%;
  height: auto;
  min-height: 150px;
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

.zone-label-xs {
  font-size: 8px;
  font-weight: bold;
  pointer-events: none;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
}

.zone-label-bonus {
  font-size: 9px;
  font-weight: normal;
  pointer-events: none;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
  opacity: 0.8;
}

.zone-label-bonus-sm {
  font-size: 7px;
  font-weight: normal;
  pointer-events: none;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
  opacity: 0.8;
}

.hitzone-label {
  font-size: 8px;
  font-weight: normal;
  fill: #666;
}

.hitzone-range {
  font-size: 7px;
  fill: #555;
}

.armor-total {
  width: 100%;
}
</style>
