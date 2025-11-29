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
        :fill="getZoneColor('Arme')"
        :stroke="getZoneStroke('Arme')"
        stroke-width="1.5"
        class="armor-zone"
      >
        <title>Linker Arm: {{ getZoneAP("Arme") }} RP</title>
      </rect>

      <!-- Right Arm (viewer's left = character's right) -->
      <rect
        x="105"
        y="34"
        width="14"
        height="38"
        rx="7"
        :fill="getZoneColor('Arme')"
        :stroke="getZoneStroke('Arme')"
        stroke-width="1.5"
        class="armor-zone"
      >
        <title>Rechter Arm: {{ getZoneAP("Arme") }} RP</title>
      </rect>

      <!-- Left Leg (viewer's right = character's left) -->
      <rect
        x="146"
        y="76"
        width="14"
        height="48"
        rx="6"
        :fill="getZoneColor('Beine')"
        :stroke="getZoneStroke('Beine')"
        stroke-width="1.5"
        class="armor-zone"
      >
        <title>Linkes Bein: {{ getZoneAP("Beine") }} RP</title>
      </rect>

      <!-- Right Leg (viewer's left = character's right) -->
      <rect
        x="120"
        y="76"
        width="14"
        height="48"
        rx="6"
        :fill="getZoneColor('Beine')"
        :stroke="getZoneStroke('Beine')"
        stroke-width="1.5"
        class="armor-zone"
      >
        <title>Rechtes Bein: {{ getZoneAP("Beine") }} RP</title>
      </rect>

      <!-- AP Labels on body parts -->
      <!-- Kopf -->
      <text x="140" y="18" text-anchor="middle" class="zone-label-sm" :fill="getZoneLabelColor('Kopf')">
        {{ getZoneAPWithQuality("Kopf").total }}
      </text>
      <text v-if="getZoneAPWithQuality('Kopf').hasGutBonus" x="140" y="27" text-anchor="middle" class="zone-label-bonus" :fill="getZoneLabelColor('Kopf')">
        ({{ getZoneAPWithQuality("Kopf").total + 1 }})
      </text>

      <!-- Körper -->
      <text x="140" y="50" text-anchor="middle" class="zone-label" :fill="getZoneLabelColor('Körper')">
        {{ getZoneAPWithQuality("Körper").total }}
      </text>
      <text v-if="getZoneAPWithQuality('Körper').hasGutBonus" x="140" y="62" text-anchor="middle" class="zone-label-bonus" :fill="getZoneLabelColor('Körper')">
        ({{ getZoneAPWithQuality("Körper").total + 1 }})
      </text>

      <!-- Rechter Arm (links im Bild) -->
      <text x="112" y="50" text-anchor="middle" class="zone-label-xs" :fill="getZoneLabelColor('Arme')">
        {{ getZoneAPWithQuality("Arme").total }}
      </text>
      <text v-if="getZoneAPWithQuality('Arme').hasGutBonus" x="112" y="60" text-anchor="middle" class="zone-label-bonus-sm" :fill="getZoneLabelColor('Arme')">
        ({{ getZoneAPWithQuality("Arme").total + 1 }})
      </text>

      <!-- Linker Arm (rechts im Bild) -->
      <text x="168" y="50" text-anchor="middle" class="zone-label-xs" :fill="getZoneLabelColor('Arme')">
        {{ getZoneAPWithQuality("Arme").total }}
      </text>
      <text v-if="getZoneAPWithQuality('Arme').hasGutBonus" x="168" y="60" text-anchor="middle" class="zone-label-bonus-sm" :fill="getZoneLabelColor('Arme')">
        ({{ getZoneAPWithQuality("Arme").total + 1 }})
      </text>

      <!-- Rechtes Bein (links im Bild) -->
      <text x="127" y="98" text-anchor="middle" class="zone-label-xs" :fill="getZoneLabelColor('Beine')">
        {{ getZoneAPWithQuality("Beine").total }}
      </text>
      <text v-if="getZoneAPWithQuality('Beine').hasGutBonus" x="127" y="108" text-anchor="middle" class="zone-label-bonus-sm" :fill="getZoneLabelColor('Beine')">
        ({{ getZoneAPWithQuality("Beine").total + 1 }})
      </text>

      <!-- Linkes Bein (rechts im Bild) -->
      <text x="153" y="98" text-anchor="middle" class="zone-label-xs" :fill="getZoneLabelColor('Beine')">
        {{ getZoneAPWithQuality("Beine").total }}
      </text>
      <text v-if="getZoneAPWithQuality('Beine').hasGutBonus" x="153" y="108" text-anchor="middle" class="zone-label-bonus-sm" :fill="getZoneLabelColor('Beine')">
        ({{ getZoneAPWithQuality("Beine").total + 1 }})
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
