<template>
  <q-card>
    <!-- Waffen Section -->
    <q-card-section>
      <div class="row items-center">
        <div class="col">
          <div class="text-h5">
            <q-icon name="gavel" class="q-mr-sm" />
            Waffen
          </div>
          <div class="text-caption text-grey-6">
            Nahkampf- und Fernkampfwaffen des Imperiums
          </div>
        </div>
        <div class="col-auto">
          <q-btn
            color="primary"
            icon="add"
            label="Waffe hinzufügen"
            @click="showAddWeaponDialog = true"
          />
        </div>
      </div>
    </q-card-section>

    <!-- Combat Stats & Weapon Stacks -->
    <q-card-section class="q-pt-none">
      <div class="row items-center justify-between">
        <!-- Combat Stats (BF/KG with modifiers) -->
        <div class="row items-center q-gutter-md">
          <!-- KG (Kampfgeschick) -->
          <div
            class="combat-stat-chip"
            @click="openModifierDialog('KG')"
          >
            <span class="text-caption text-grey-6">KG:</span>
            <span class="text-bold" :class="kgTotal >= character.attributes.KG ? 'text-positive' : 'text-negative'">
              {{ kgTotal }}
            </span>
            <span v-if="kgModifier !== 0" class="text-caption" :class="kgModifier > 0 ? 'text-positive' : 'text-negative'">
              ({{ kgModifier > 0 ? '+' : '' }}{{ kgModifier }})
            </span>
            <q-tooltip>Kampfgeschick - Klicken für Modifikatoren</q-tooltip>
          </div>

          <!-- BF (Ballistische Fertigkeit) -->
          <div
            class="combat-stat-chip"
            @click="openModifierDialog('BF')"
          >
            <span class="text-caption text-grey-6">BF:</span>
            <span class="text-bold" :class="bfTotal >= character.attributes.BF ? 'text-positive' : 'text-negative'">
              {{ bfTotal }}
            </span>
            <span v-if="bfModifier !== 0" class="text-caption" :class="bfModifier > 0 ? 'text-positive' : 'text-negative'">
              ({{ bfModifier > 0 ? '+' : '' }}{{ bfModifier }})
            </span>
            <q-tooltip>Ballistische Fertigkeit - Klicken für Modifikatoren</q-tooltip>
          </div>

          <!-- Reset Button -->
          <q-btn
            flat
            dense
            round
            size="sm"
            icon="refresh"
            :color="(kgModifier !== 0 || bfModifier !== 0) ? 'primary' : 'grey-7'"
            :disable="kgModifier === 0 && bfModifier === 0"
            @click="activeKgModifiers = []; activeBfModifiers = []; selectedKgManeuver = null; selectedBfManeuver = null; selectedKgWeaponIndex = null; selectedBfWeaponIndex = null; kgModifier = 0; bfModifier = 0"
          >
            <q-tooltip>Modifikatoren zurücksetzen</q-tooltip>
          </q-btn>
        </div>

        <!-- Weapon Stacks (only if enabled) -->
        <div v-if="settings.enableWeaponStacks" class="row items-center q-gutter-sm">
          <q-icon name="auto_awesome" size="xs" style="color: #d4af37" />
          <span class="text-caption text-grey-6">Stacks:</span>
          <NumberInput
            :model-value="weaponStacks"
            :min="0"
            :max="99"
            button-color="amber"
            text-color="#d4af37"
            @update:model-value="weaponStacks = $event"
          />
          <q-btn
            flat
            dense
            round
            size="sm"
            icon="refresh"
            :color="weaponStacks > 0 ? 'amber' : 'grey-7'"
            :disable="weaponStacks <= 0"
            @click="weaponStacks = 0"
          >
            <q-tooltip>Stacks zurücksetzen</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div
        v-if="character.weapons.length === 0"
        class="text-center text-grey-6 q-pa-lg"
      >
        <q-icon name="swords" size="4rem" color="grey-6" />
        <div class="q-mt-md">Noch keine Waffen hinzugefügt</div>
        <div class="text-caption">
          Klicke auf "Waffe hinzufügen" um zu beginnen
        </div>
      </div>

      <draggable
        v-else
        v-model="character.weapons"
        item-key="name"
        class="row q-col-gutter-md"
        handle=".drag-handle"
      >
        <template #item="{ element: weapon, index }">
          <div class="col-12 col-md-6">
            <q-card bordered flat class="bg-grey-9">
              <q-card-section class="q-pa-sm">
                <div class="row items-center q-mb-xs">
                  <div class="col-auto q-pr-xs">
                    <q-icon
                      name="drag_indicator"
                      class="drag-handle cursor-grab text-grey-6"
                      size="sm"
                    >
                      <q-tooltip>Ziehen zum Sortieren</q-tooltip>
                    </q-icon>
                  </div>
                  <div class="col-auto q-pr-xs">
                    <q-btn
                      flat
                      dense
                      round
                      size="sm"
                      icon="info"
                      color="grey-6"
                      @click="showWeaponInfo(weapon)"
                    >
                      <q-tooltip>Details anzeigen</q-tooltip>
                    </q-btn>
                  </div>
                  <div class="col">
                    <div class="text-subtitle1 text-bold">
                      {{ weapon.name }}
                      <!-- Mod/Trait Icons -->
                      <template v-if="weapon.mods?.length || weapon.traits?.length">
                        <q-icon
                          v-for="mod in (weapon.mods || [])"
                          :key="mod"
                          :name="getModIcon(mod)"
                          size="xs"
                          :color="getModColor(mod)"
                          class="q-ml-xs"
                        >
                          <q-tooltip>{{ getModLabel(mod) }}</q-tooltip>
                        </q-icon>
                        <q-icon
                          v-for="trait in (weapon.traits || [])"
                          :key="trait"
                          :name="getTraitIcon(trait)"
                          size="xs"
                          :color="getTraitColor(trait)"
                          class="q-ml-xs"
                        >
                          <q-tooltip>{{ getTraitLabel(trait) }}</q-tooltip>
                        </q-icon>
                      </template>
                      <q-chip
                        clickable
                        dense
                        size="sm"
                        :color="weapon.damageMod ? 'primary' : 'grey-8'"
                        text-color="white"
                        class="q-ml-sm"
                      >
                        {{ weapon.damageMod > 0 ? "+" : ""
                        }}{{ weapon.damageMod || 0 }}
                        <q-popup-edit
                          v-model.number="weapon.damageMod"
                          auto-save
                          anchor="center middle"
                          self="center middle"
                          @save="
                            (val) =>
                              characterStore.updateWeapon(index, {
                                damageMod: val || 0,
                              })
                          "
                        >
                          <q-input
                            v-model.number="weapon.damageMod"
                            type="number"
                            dense
                            autofocus
                            label="Mod"
                            hint="z.B. Stärkebonus"
                            style="width: 120px"
                          />
                        </q-popup-edit>
                        <q-tooltip>Klicken zum Bearbeiten</q-tooltip>
                      </q-chip>
                    </div>
                    <div class="text-caption text-grey-6">
                      {{ weapon.type || "Waffe" }}
                      <span v-if="weapon.subtype"> ({{ weapon.subtype }})</span>
                    </div>
                  </div>
                  <div class="col-auto">
                    <q-btn
                      v-if="weapon.damage"
                      flat
                      dense
                      round
                      size="sm"
                      icon="casino"
                      color="grey-6"
                      @click="copyDamageRoll(weapon)"
                    >
                      <q-tooltip>Würfelbefehl kopieren</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      dense
                      round
                      size="sm"
                      icon="edit"
                      color="grey-6"
                      @click="editWeapon(index)"
                    >
                      <q-tooltip>Bearbeiten</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      dense
                      round
                      size="sm"
                      icon="delete"
                      color="grey-6"
                      @click="removeWeapon(weapon, index)"
                    >
                      <q-tooltip>Entfernen</q-tooltip>
                    </q-btn>
                  </div>
                </div>

                <!-- Weapon Details - Reihenfolge wie Charakterbogen -->
                <div class="text-body2" style="line-height: 1.8">
                  <span v-if="weapon.damage">
                    <span class="text-grey-6">Schaden:</span>
                    <span class="text-bold">{{ weapon.damage }}</span>
                    <span class="q-mx-sm">•</span>
                  </span>
                  <span v-if="weapon.damageType">
                    <span class="text-grey-6">Art:</span>
                    <span class="text-bold">{{ weapon.damageType }}</span>
                    <span class="q-mx-sm">•</span>
                  </span>
                  <span
                    v-if="
                      weapon.penetration !== undefined &&
                      weapon.penetration !== null
                    "
                  >
                    <span class="text-grey-6">DS:</span>
                    <span class="text-bold">{{ weapon.penetration }}</span>
                    <span class="q-mx-sm">•</span>
                  </span>
                  <span v-if="weapon.range">
                    <span class="text-grey-6">Reichweite:</span>
                    <span class="text-bold">{{ weapon.range }}</span>
                    <span class="q-mx-sm">•</span>
                  </span>
                  <span v-if="weapon.rof && !isWeaponMelee(weapon)">
                    <span class="text-grey-6">SF:</span>
                    <span class="text-bold">{{ weapon.rof }}</span>
                    <span class="q-mx-sm">•</span>
                  </span>
                  <span v-if="weapon.magazine && !isWeaponMelee(weapon)">
                    <span class="text-grey-6">Mag:</span>
                    <span class="text-bold">{{ weapon.magazine }}</span>
                    <span class="q-mx-sm" v-if="weapon.reload">•</span>
                  </span>
                  <span v-if="weapon.reload && !isWeaponMelee(weapon)">
                    <span class="text-grey-6">Nachladen:</span>
                    <span class="text-bold">{{ weapon.reload }}</span>
                  </span>
                </div>

                <!-- Speziell / Eigenschaften (besonders wichtig!) -->
                <div
                  v-if="weapon.special"
                  class="q-mt-sm q-pa-xs"
                  style="
                    background: rgba(255, 213, 79, 0.1);
                    border-left: 3px solid #ffd54f;
                    border-radius: 4px;
                  "
                >
                  <div class="text-body2 text-bold text-amber">
                    Eigenschaften:
                  </div>
                  <div class="text-body2">{{ weapon.special }}</div>
                </div>

                <!-- Quality Display -->
                <div class="q-mt-sm text-body2">
                  <span class="text-grey-6">Qualität:</span>
                  <span
                    class="text-bold q-ml-xs"
                    :class="getQualityColor(weapon.quality || 'Normal')"
                    >{{ weapon.quality || "Normal" }}</span
                  >
                  <span class="text-grey-6 q-mx-xs">—</span>
                  <span :class="getQualityColor(weapon.quality || 'Normal')">
                    {{
                      getWeaponQualityEffect(
                        weapon.quality || "Normal",
                        weapon.type,
                        weapon.subtype
                      )
                    }}
                  </span>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </template>
      </draggable>
    </q-card-section>

    <q-separator />

    <!-- Rüstung Section -->
    <q-card-section>
      <div class="row items-center">
        <div class="col">
          <div class="text-h5">
            <q-icon name="shield" class="q-mr-sm" />
            Rüstung
          </div>
          <div class="text-caption text-grey-6">
            Schutzausrüstung und imperiale Panzerung
          </div>
        </div>
        <div class="col-auto">
          <q-btn
            color="primary"
            icon="add"
            label="Rüstung hinzufügen"
            @click="showAddArmorDialog = true"
          />
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div
        v-if="character.armor.length === 0"
        class="text-center text-grey-6 q-pa-lg"
      >
        <q-icon name="shield" size="4rem" color="grey-6" />
        <div class="q-mt-md">Keine Rüstung vorhanden</div>
        <div class="text-caption">
          Klicke auf "Rüstung hinzufügen" um zu beginnen
        </div>
      </div>

      <div v-else class="row q-col-gutter-md">
        <!-- Armor Visualization -->
        <div class="col-12 col-md-4">
          <ArmorVisualization :armor="character.armor" />
        </div>

        <!-- Armor List -->
        <div class="col-12 col-md-8">
          <draggable
            v-model="character.armor"
            item-key="name"
            class="row q-col-gutter-md"
            handle=".drag-handle"
          >
            <template #item="{ element: armor, index }">
              <div class="col-12 col-md-6">
                <q-card bordered flat class="bg-grey-9">
                  <q-card-section class="q-pa-sm">
                    <div class="row items-center q-mb-xs">
                      <div class="col-auto q-pr-xs">
                        <q-icon
                          name="drag_indicator"
                          class="drag-handle cursor-grab text-grey-6"
                          size="sm"
                        >
                          <q-tooltip>Ziehen zum Sortieren</q-tooltip>
                        </q-icon>
                      </div>
                      <div class="col">
                        <div class="text-subtitle1 text-bold">
                          {{ armor.name }}
                        </div>
                        <div class="text-caption text-grey-6">
                          <span
                            v-if="armor.locations && armor.locations.length > 0"
                          >
                            {{
                              getArmorLocationText(
                                armor.locations,
                                armor.additive
                              )
                            }}
                          </span>
                          <span v-else>Alle Körperteile</span>
                        </div>
                      </div>
                      <div class="col-auto">
                        <q-btn
                          flat
                          dense
                          round
                          size="sm"
                          icon="edit"
                          color="grey-6"
                          @click="editArmor(index)"
                        >
                          <q-tooltip>Bearbeiten</q-tooltip>
                        </q-btn>
                        <q-btn
                          flat
                          dense
                          round
                          size="sm"
                          icon="delete"
                          color="grey-6"
                          @click="removeArmor(armor, index)"
                        >
                          <q-tooltip>Entfernen</q-tooltip>
                        </q-btn>
                      </div>
                    </div>

                    <!-- Checkboxes -->
                    <div class="row q-col-gutter-xs q-mb-xs">
                      <div class="col-auto">
                        <q-checkbox
                          :model-value="armor.equipped"
                          label="Angelegt"
                          dense
                          size="sm"
                          @update:model-value="
                            characterStore.updateArmor(index, {
                              equipped: $event,
                            })
                          "
                        />
                      </div>
                      <div class="col-auto">
                        <q-checkbox
                          :model-value="armor.additive"
                          label="Additiv (z.B. Schild)"
                          dense
                          size="sm"
                          @update:model-value="
                            characterStore.updateArmor(index, {
                              additive: $event,
                            })
                          "
                        >
                          <q-tooltip
                            >Wird zu anderer Rüstung addiert statt Maximum zu
                            nehmen</q-tooltip
                          >
                        </q-checkbox>
                      </div>
                    </div>

                    <!-- Armor Details -->
                    <div class="row q-col-gutter-xs text-body2">
                      <div class="col-6">
                        <span class="text-grey-6">RP:</span>
                        <span class="text-bold text-primary">{{
                          getEffectiveAP(armor)
                        }}</span>
                        <span
                          v-if="armor.quality === 'Hervorragend' && armor.ap"
                          class="text-caption text-grey-6"
                        >
                          (Basis: {{ armor.ap }})</span
                        >
                      </div>
                      <div class="col-6" v-if="armor.weight">
                        <span class="text-grey-6">Gewicht:</span>
                        <span class="text-bold"
                          >{{ getEffectiveWeight(armor) }}kg</span
                        >
                        <span
                          v-if="armor.quality === 'Hervorragend'"
                          class="text-caption text-grey-6"
                        >
                          (Basis: {{ armor.weight }}kg)</span
                        >
                      </div>
                      <div class="col-12 q-mt-xs">
                        <span class="text-grey-6">Qualität:</span>
                        <span
                          class="text-bold q-ml-xs"
                          :class="getQualityColor(armor.quality || 'Standard')"
                          >{{ armor.quality || "Standard" }}</span
                        >
                        <span class="text-grey-6 q-mx-xs">—</span>
                        <span
                          :class="getQualityColor(armor.quality || 'Standard')"
                        >
                          {{ getQualityEffect(armor.quality || "Standard") }}
                        </span>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <!-- Ausrüstung Section -->
    <q-card-section>
      <div class="row items-center q-mb-md">
        <div class="col">
          <div class="text-h5">
            <q-icon name="inventory_2" class="q-mr-sm" />
            Ausrüstung
          </div>
          <div class="text-caption text-grey-6">
            Gegenstände, Werkzeuge und Versorgungsgüter
          </div>
        </div>
        <div class="col-auto">
          <q-btn
            color="primary"
            icon="add"
            label="Gegenstand hinzufügen"
            @click="showAddGearDialog = true"
          />
        </div>
      </div>

      <draggable
        v-if="character.gear.length > 0"
        v-model="character.gear"
        item-key="name"
        class="row q-col-gutter-sm"
      >
        <template #item="{ element: item, index }">
          <div class="col-12 col-md-6">
            <q-item
              dense
              bordered
              class="rounded-borders cursor-grab"
              :class="{
                'artifact-item': item.isArtifact,
                'trophy-item': item.isTrophy,
              }"
            >
              <q-item-section avatar>
                <q-avatar color="grey-8" text-color="white" size="sm">
                  {{ item.quantity || 1 }}
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label
                  :class="{
                    'text-amber text-bold': item.isArtifact,
                    'text-purple text-bold': item.isTrophy,
                  }"
                >
                  <q-icon
                    v-if="item.isArtifact"
                    name="auto_awesome"
                    size="xs"
                    color="amber"
                    class="q-mr-xs"
                  />
                  <q-icon
                    v-if="item.isTrophy"
                    name="emoji_events"
                    size="xs"
                    color="purple"
                    class="q-mr-xs"
                  />
                  {{ item.name }}
                </q-item-label>
                <q-item-label caption v-if="item.description">{{
                  item.description
                }}</q-item-label>
                <q-item-label
                  caption
                  v-if="item.quality"
                  :class="getGearQualityColor(item.quality)"
                >
                  Qualität: {{ item.quality }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="row q-gutter-xs">
                  <q-btn
                    flat
                    dense
                    round
                    size="sm"
                    icon="remove"
                    color="grey-6"
                    @click="changeGearQuantity(index, -1)"
                    :disable="item.quantity <= 1"
                  />
                  <q-btn
                    flat
                    dense
                    round
                    size="sm"
                    icon="add"
                    color="grey-6"
                    @click="changeGearQuantity(index, 1)"
                  />
                  <q-btn
                    flat
                    dense
                    round
                    size="sm"
                    icon="edit"
                    color="grey-6"
                    @click="editGear(index)"
                  />
                  <q-btn
                    flat
                    dense
                    round
                    size="sm"
                    icon="delete"
                    color="grey-6"
                    @click="removeGear(item, index)"
                  />
                </div>
              </q-item-section>
            </q-item>
          </div>
        </template>
      </draggable>
      <div v-else class="text-center text-grey-6 q-pa-md">
        <q-icon name="inventory_2" size="3rem" color="grey-6" />
        <div class="q-mt-sm">Keine Ausrüstung vorhanden</div>
      </div>
    </q-card-section>

    <!-- Delete Weapon Confirmation Dialog -->
    <q-dialog v-model="showDeleteWeaponDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Waffe löschen?</div>
        </q-card-section>

        <q-card-section>
          <p>
            Möchtest du die Waffe
            <strong>{{ weaponToDelete?.weapon?.name }}</strong>
            wirklich löschen?
          </p>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Abbrechen" color="grey" v-close-popup />
          <q-btn
            flat
            label="Löschen"
            color="negative"
            @click="confirmDeleteWeapon"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Gear Confirmation Dialog -->
    <q-dialog v-model="showDeleteGearDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Gegenstand löschen?</div>
        </q-card-section>

        <q-card-section>
          <p>
            Möchtest du <strong>{{ gearToDelete?.item?.name }}</strong>
            wirklich löschen?
          </p>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Abbrechen" color="grey" v-close-popup />
          <q-btn
            flat
            label="Löschen"
            color="negative"
            @click="confirmDeleteGear"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Combat Modifier Dialog -->
    <q-dialog v-model="showModifierDialog">
      <q-card style="min-width: 450px; max-width: 550px;">
        <q-card-section class="row items-center q-pb-sm">
          <div class="text-h6">
            {{ currentModifierStat === 'KG' ? 'Kampfgeschick (KG)' : 'Ballistische Fertigkeit (BF)' }}
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <!-- Current Total Display -->
        <q-card-section class="q-pt-none q-pb-sm">
          <div class="row items-center justify-center q-gutter-sm">
            <div class="text-h4 text-bold text-primary">
              {{ currentModifierStat === 'KG' ? character.attributes.KG : character.attributes.BF }}
            </div>
            <div v-if="currentModifierValue !== 0" class="text-h5" :class="currentModifierValue > 0 ? 'text-positive' : 'text-negative'">
              {{ currentModifierValue > 0 ? '+' : '' }}{{ currentModifierValue }}
            </div>
            <div class="text-h4">=</div>
            <div
              class="text-h4 text-bold"
              :class="currentModifierValue > 0 ? 'text-positive' : currentModifierValue < 0 ? 'text-negative' : 'text-white'"
            >
              {{ currentTotal }}
            </div>
          </div>
          <div v-if="currentModifierValue >= 60 || currentModifierValue <= -60" class="text-caption text-center text-warning q-mt-xs">
            Maximum erreicht (±60)
          </div>
        </q-card-section>

        <!-- Weapon Selection -->
        <q-card-section class="q-py-sm">
          <q-select
            :model-value="currentSelectedWeaponIndex"
            :options="currentWeaponsList.map(w => ({ label: w.name, value: w.originalIndex, weapon: w }))"
            label="Aktive Waffe"
            filled
            dense
            clearable
            emit-value
            map-options
            @update:model-value="selectWeapon($event)"
          >
            <template v-slot:option="{ opt, itemProps }">
              <q-item v-bind="itemProps">
                <q-item-section>
                  <q-item-label>{{ opt.label }}</q-item-label>
                  <q-item-label caption>
                    {{ opt.weapon.quality || 'Normal' }}
                    <span v-if="opt.weapon.traits?.length"> • {{ opt.weapon.traits.join(', ') }}</span>
                    <span v-if="opt.weapon.mods?.length"> • {{ opt.weapon.mods.join(', ') }}</span>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:selected-item="{ opt }">
              {{ opt.label }}
              <q-badge v-if="currentSelectedWeapon?.quality === 'Gut'" color="positive" class="q-ml-sm">+5</q-badge>
              <q-badge v-if="currentSelectedWeapon?.quality === 'Hervorragend'" color="positive" class="q-ml-sm">+10</q-badge>
              <q-badge v-if="currentSelectedWeapon?.quality === 'Gering'" color="negative" class="q-ml-sm">-10</q-badge>
            </template>
          </q-select>
          <div v-if="currentSelectedWeapon && getWeaponBonusDescription()" class="text-caption text-grey-5 q-mt-xs">
            {{ getWeaponBonusDescription() }}
          </div>
        </q-card-section>

        <q-separator />

        <!-- Tabs for Modifiers and Maneuvers -->
        <q-tabs
          v-model="modifierDialogTab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="modifiers" label="Modifikatoren" />
          <q-tab name="maneuvers" label="Manöver" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="modifierDialogTab" animated>
          <!-- Modifiers Tab -->
          <q-tab-panel name="modifiers" class="q-pa-sm">
            <div style="max-height: 300px; overflow-y: auto;">
              <div v-for="(category, catKey) in currentCategories" :key="catKey" class="q-mb-md">
                <div class="text-subtitle2 text-grey-6 q-mb-xs">{{ category.name }}</div>
                <div class="row q-col-gutter-xs">
                  <div
                    v-for="mod in category.modifiers"
                    :key="mod.id"
                    class="col-6"
                  >
                    <q-btn
                      :color="isModifierActive(mod.id) ? (mod.value > 0 ? 'positive' : mod.value < 0 ? 'negative' : 'grey') : 'grey-8'"
                      :outline="!isModifierActive(mod.id)"
                      :text-color="isModifierActive(mod.id) ? 'white' : 'grey-4'"
                      dense
                      no-caps
                      class="full-width modifier-btn"
                      @click="toggleModifier(mod.id)"
                    >
                      <div class="row items-center full-width justify-between">
                        <span class="text-left ellipsis" style="flex: 1;">{{ mod.name }}</span>
                        <span class="text-bold q-ml-sm">{{ mod.value > 0 ? '+' : '' }}{{ mod.value }}</span>
                      </div>
                    </q-btn>
                  </div>
                </div>
              </div>
            </div>
          </q-tab-panel>

          <!-- Maneuvers Tab -->
          <q-tab-panel name="maneuvers" class="q-pa-sm">
            <div style="max-height: 300px; overflow-y: auto;">
              <div class="text-caption text-grey-6 q-mb-sm">Wähle ein Manöver (exklusiv):</div>
              <div class="row q-col-gutter-xs">
                <div
                  v-for="maneuver in currentManeuvers"
                  :key="maneuver.id"
                  class="col-6"
                >
                  <q-btn
                    :color="isManeuverActive(maneuver.id) ? (maneuver.value > 0 ? 'positive' : maneuver.value < 0 ? 'negative' : 'grey') : 'grey-8'"
                    :outline="!isManeuverActive(maneuver.id)"
                    :text-color="isManeuverActive(maneuver.id) ? 'white' : 'grey-4'"
                    dense
                    no-caps
                    class="full-width modifier-btn"
                    @click="selectManeuver(maneuver.id)"
                  >
                    <div class="column full-width">
                      <div class="row items-center full-width justify-between">
                        <span class="text-left ellipsis" style="flex: 1;">{{ maneuver.name }}</span>
                        <span class="text-bold q-ml-sm">{{ maneuver.value > 0 ? '+' : '' }}{{ maneuver.value }}</span>
                      </div>
                      <div class="text-caption text-left text-grey-5" style="font-size: 10px;">{{ maneuver.type }}</div>
                    </div>
                    <q-tooltip class="text-body2" :delay="300">{{ maneuver.description }}</q-tooltip>
                  </q-btn>
                </div>
              </div>
              <!-- Maneuver description -->
              <div v-if="currentSelectedManeuver" class="q-mt-md q-pa-sm bg-grey-9 rounded-borders">
                <div class="text-subtitle2">{{ getManeuverById(currentSelectedManeuver)?.name }}</div>
                <div class="text-caption text-grey-5">{{ getManeuverById(currentSelectedManeuver)?.description }}</div>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>

        <q-separator />

        <!-- Automatic Modifiers (from character state) -->
        <q-card-section v-if="isExhausted" class="q-py-sm">
          <div class="text-caption text-grey-6 q-mb-xs">Automatische Modifikatoren:</div>
          <div class="row q-gutter-xs">
            <q-chip
              clickable
              dense
              size="sm"
              :color="isAutoModifierIgnored('auto_erschoepft') ? 'grey-7' : 'negative'"
              :text-color="isAutoModifierIgnored('auto_erschoepft') ? 'grey-5' : 'white'"
              :style="isAutoModifierIgnored('auto_erschoepft') ? 'text-decoration: line-through' : ''"
              @click="toggleIgnoreAutoModifier('auto_erschoepft')"
            >
              <q-icon name="local_fire_department" size="xs" class="q-mr-xs" />
              Erschöpft (-10)
              <q-tooltip>Klicken um zu {{ isAutoModifierIgnored('auto_erschoepft') ? 'aktivieren' : 'ignorieren' }}</q-tooltip>
            </q-chip>
          </div>
        </q-card-section>

        <!-- Active Modifiers/Maneuver/Weapon Summary -->
        <q-card-section v-if="currentActiveModifiers.length > 0 || currentSelectedManeuver || currentSelectedWeapon" class="q-py-sm">
          <div class="text-caption text-grey-6 q-mb-xs">Aktive Boni/Mali:</div>
          <div class="row q-gutter-xs">
            <!-- Selected Weapon -->
            <q-chip
              v-if="currentSelectedWeapon"
              removable
              dense
              size="sm"
              color="amber-8"
              text-color="white"
              @remove="selectWeapon(null)"
            >
              {{ currentSelectedWeapon.name }}
              <span v-if="getWeaponBonusDescription()"> ({{ getWeaponBonusDescription() }})</span>
            </q-chip>
            <!-- Selected Maneuver -->
            <q-chip
              v-if="currentSelectedManeuver"
              removable
              dense
              size="sm"
              color="primary"
              text-color="white"
              @remove="selectManeuver(null)"
            >
              {{ getManeuverById(currentSelectedManeuver)?.name }} ({{ getManeuverById(currentSelectedManeuver)?.value > 0 ? '+' : '' }}{{ getManeuverById(currentSelectedManeuver)?.value }})
            </q-chip>
            <!-- Active Modifiers -->
            <q-chip
              v-for="modId in currentActiveModifiers"
              :key="modId"
              removable
              dense
              size="sm"
              :color="getModifierById(modId)?.value > 0 ? 'positive' : 'negative'"
              text-color="white"
              @remove="toggleModifier(modId)"
            >
              {{ getModifierById(modId)?.name }} ({{ getModifierById(modId)?.value > 0 ? '+' : '' }}{{ getModifierById(modId)?.value }})
            </q-chip>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Alle zurücksetzen" color="grey" @click="resetCurrentAll" :disable="currentActiveModifiers.length === 0 && !currentSelectedManeuver && !currentSelectedWeapon" />
          <q-btn flat label="Schließen" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Armor Confirmation Dialog -->
    <q-dialog v-model="showDeleteArmorDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Rüstung löschen?</div>
        </q-card-section>

        <q-card-section>
          <p>
            Möchtest du die Rüstung
            <strong>{{ armorToDelete?.armor?.name }}</strong>
            wirklich löschen?
          </p>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Abbrechen" color="grey" v-close-popup />
          <q-btn
            flat
            label="Löschen"
            color="negative"
            @click="confirmDeleteArmor"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Add/Edit Weapon Dialog -->
    <q-dialog v-model="showAddWeaponDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">
            {{
              editingWeaponIndex !== null
                ? "Waffe bearbeiten"
                : "Waffe hinzufügen"
            }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <!-- Name -->
          <q-input v-model="newWeapon.name" label="Name" filled dense />

          <!-- Gattung -->
          <q-select
            v-model="newWeapon.type"
            :options="weaponTypeOptions"
            label="Gattung"
            filled
            dense
          />

          <!-- Subtype for Exotic weapons -->
          <q-select
            v-if="newWeapon.type && newWeapon.type.includes('Exotisch')"
            v-model="newWeapon.subtype"
            :options="['Nahkampf', 'Fernkampf']"
            label="Exotisch-Untertyp"
            filled
            dense
            hint="Ist diese exotische Waffe für Nah- oder Fernkampf?"
          />

          <!-- RW (Reichweite) -->
          <q-input
            v-model="newWeapon.range"
            label="RW (Reichweite)"
            filled
            dense
            hint="z.B. '—' oder '3m'"
          />

          <!-- Sch (Schaden) -->
          <div class="row q-col-gutter-sm">
            <div class="col">
              <q-input
                v-model="newWeapon.damage"
                label="Sch (Schaden)"
                filled
                dense
                hint="z.B. '1W10+4'"
              />
            </div>
            <div class="col-4">
              <q-input
                v-model.number="newWeapon.damageMod"
                label="Mod"
                type="number"
                filled
                dense
                hint="z.B. SB"
              />
            </div>
          </div>

          <!-- Art (Schadensart) -->
          <q-select
            v-model="newWeapon.damageType"
            :options="[
              'E (Energie)',
              'I (Einschlag)',
              'R (Reißend)',
              'X (Explosiv)',
            ]"
            label="Art (Schadensart)"
            filled
            dense
            clearable
          />

          <!-- DS (Durchschlag) -->
          <q-input
            v-model.number="newWeapon.penetration"
            label="DS (Durchschlag)"
            type="number"
            filled
            dense
          />

          <!-- SF (Schussfolge) - nur für Fernkampf -->
          <q-input
            v-if="!isMeleeWeapon"
            v-model="newWeapon.rof"
            label="SF (Schussfolge)"
            filled
            dense
            hint="z.B. 'S/3/-'"
          />

          <!-- Mag (Magazin) - nur für Fernkampf -->
          <q-input
            v-if="!isMeleeWeapon"
            v-model.number="newWeapon.magazine"
            label="Mag (Magazin)"
            type="number"
            filled
            dense
          />

          <!-- Nachladen - nur für Fernkampf -->
          <q-select
            v-if="!isMeleeWeapon"
            v-model="newWeapon.reload"
            :options="[
              'Halbe',
              'Volle',
              '2 Volle',
              '3 Volle',
              '4 Volle',
              '5 Volle',
            ]"
            label="Nachladen"
            filled
            dense
            clearable
          />

          <!-- Speziell (Eigenschaften) -->
          <q-input
            v-model="newWeapon.special"
            label="Speziell"
            type="textarea"
            filled
            rows="2"
            hint="z.B. 'Ausgewogen, Reißend'"
          />

          <!-- Qualität -->
          <q-select
            v-model="newWeapon.quality"
            :options="['Gering', 'Normal', 'Gut', 'Hervorragend']"
            label="Qualität"
            filled
            dense
          >
            <template v-slot:hint>
              <span v-if="isMeleeWeapon">
                <span v-if="newWeapon.quality === 'Gering'"
                  >-10 auf Angriffe/Paraden</span
                >
                <span v-else-if="newWeapon.quality === 'Gut'"
                  >+5 auf Angriffe</span
                >
                <span v-else-if="newWeapon.quality === 'Hervorragend'"
                  >+10 Angriffe, +1 Schaden</span
                >
              </span>
              <span v-else>
                <span v-if="newWeapon.quality === 'Gering'"
                  >Eigenschaft Unzuverlässig</span
                >
                <span v-else-if="newWeapon.quality === 'Gut'"
                  >Eigenschaft Zuverlässig</span
                >
                <span v-else-if="newWeapon.quality === 'Hervorragend'"
                  >Keine Ladehemmung/Überhitzung</span
                >
              </span>
            </template>
          </q-select>

          <!-- Nahkampf Traits -->
          <q-select
            v-if="isMeleeWeapon"
            v-model="newWeapon.traits"
            :options="meleeTraitOptions"
            label="Eigenschaften"
            filled
            dense
            multiple
            emit-value
            map-options
            clearable
          />

          <!-- Fernkampf Mods -->
          <q-select
            v-if="!isMeleeWeapon"
            v-model="newWeapon.mods"
            :options="rangedModOptions"
            label="Modifikationen"
            filled
            dense
            multiple
            emit-value
            map-options
            clearable
            hint="Nur eine Zielvorrichtung möglich"
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            v-if="editingWeaponIndex !== null"
            flat
            label="Duplizieren"
            color="secondary"
            icon="content_copy"
            @click="duplicateWeapon"
          >
            <q-tooltip>Erstellt eine Kopie dieser Waffe</q-tooltip>
          </q-btn>
          <q-btn
            flat
            label="Abbrechen"
            color="grey"
            @click="cancelWeaponDialog"
          />
          <q-btn
            flat
            label="Speichern"
            color="primary"
            @click="saveWeapon"
            :disable="!newWeapon.name"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Weapon Info Dialog -->
    <q-dialog v-model="showWeaponInfoDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ currentWeapon?.name }}</div>
          <div class="text-caption text-grey-6">{{ currentWeapon?.type }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <div class="text-caption text-grey-6">Schaden</div>
              <div class="text-body1">{{ currentWeapon?.damage || "-" }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-6">Penetration</div>
              <div class="text-body1">
                {{ currentWeapon?.penetration || 0 }}
              </div>
            </div>
            <div class="col-4">
              <div class="text-caption text-grey-6">Reichweite</div>
              <div class="text-body1">{{ currentWeapon?.range || "-" }}</div>
            </div>
            <div class="col-4">
              <div class="text-caption text-grey-6">RoF</div>
              <div class="text-body1">{{ currentWeapon?.rof || "-" }}</div>
            </div>
            <div class="col-4">
              <div class="text-caption text-grey-6">Magazin</div>
              <div class="text-body1">{{ currentWeapon?.magazine || "-" }}</div>
            </div>
            <div class="col-12" v-if="currentWeapon?.reload">
              <div class="text-caption text-grey-6">Nachladen</div>
              <div class="text-body1">{{ currentWeapon.reload }}</div>
            </div>
          </div>
          <div v-if="currentWeapon?.special" class="q-mt-md">
            <div class="text-caption text-grey-6">Besondere Eigenschaften</div>
            <div class="text-body2" style="white-space: pre-wrap">
              {{ currentWeapon.special }}
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            flat
            label="Schließen"
            color="primary"
            @click="showWeaponInfoDialog = false"
          />
          <q-btn
            flat
            label="Bearbeiten"
            color="primary"
            @click="editFromWeaponInfo"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Add/Edit Armor Dialog -->
    <q-dialog v-model="showAddArmorDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">
            {{
              editingArmorIndex !== null
                ? "Rüstung bearbeiten"
                : "Rüstung hinzufügen"
            }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <q-input v-model="newArmor.name" label="Rüstungsname" filled dense />

          <q-input
            v-model.number="newArmor.ap"
            label="Rüstungspunkte (RP)"
            type="number"
            filled
            dense
            hint="Grundwert der Rüstung"
          />

          <div>
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-6">
                <q-checkbox v-model="newArmor.equipped" label="Angelegt" dense>
                  <q-tooltip
                    >Wird getragen und in RP-Berechnung einbezogen</q-tooltip
                  >
                </q-checkbox>
              </div>
              <div class="col-6">
                <q-checkbox
                  v-model="newArmor.additive"
                  label="Additiv (z.B. Schild)"
                  dense
                  @update:model-value="onAdditiveChange"
                >
                  <q-tooltip
                    >Wird zu anderer Rüstung addiert statt Maximum zu
                    nehmen</q-tooltip
                  >
                </q-checkbox>
              </div>
            </div>
          </div>

          <div>
            <div class="text-subtitle2 q-mb-sm">Bedeckte Körperteile:</div>
            <!-- Standard-Rüstung: Einfache Körperteile -->
            <div v-if="!newArmor.additive" class="row q-col-gutter-sm">
              <div class="col-6">
                <q-checkbox
                  v-model="newArmor.locations"
                  val="Kopf"
                  label="Kopf"
                  dense
                />
              </div>
              <div class="col-6">
                <q-checkbox
                  v-model="newArmor.locations"
                  val="Arme"
                  label="Arme"
                  dense
                />
              </div>
              <div class="col-6">
                <q-checkbox
                  v-model="newArmor.locations"
                  val="Körper"
                  label="Körper"
                  dense
                />
              </div>
              <div class="col-6">
                <q-checkbox
                  v-model="newArmor.locations"
                  val="Beine"
                  label="Beine"
                  dense
                />
              </div>
            </div>
            <!-- Additive Rüstung: Erweiterte Körperteile (Links/Rechts) -->
            <div v-else class="row q-col-gutter-sm">
              <div class="col-6">
                <q-checkbox
                  v-model="newArmor.locations"
                  val="Kopf"
                  label="Kopf"
                  dense
                />
              </div>
              <div class="col-6">
                <q-checkbox
                  v-model="newArmor.locations"
                  val="Körper"
                  label="Körper"
                  dense
                />
              </div>
              <div class="col-6">
                <q-checkbox
                  v-model="newArmor.locations"
                  val="Linker Arm"
                  label="Linker Arm"
                  dense
                />
              </div>
              <div class="col-6">
                <q-checkbox
                  v-model="newArmor.locations"
                  val="Rechter Arm"
                  label="Rechter Arm"
                  dense
                />
              </div>
              <div class="col-6">
                <q-checkbox
                  v-model="newArmor.locations"
                  val="Linkes Bein"
                  label="Linkes Bein"
                  dense
                />
              </div>
              <div class="col-6">
                <q-checkbox
                  v-model="newArmor.locations"
                  val="Rechtes Bein"
                  label="Rechtes Bein"
                  dense
                />
              </div>
            </div>
          </div>

          <q-input
            v-model.number="newArmor.weight"
            label="Gewicht (kg)"
            type="number"
            step="0.5"
            filled
            dense
            hint="In 0.5 kg Schritten"
          />

          <q-select
            v-model="newArmor.quality"
            :options="['Standard', 'Gering', 'Gut', 'Hervorragend']"
            label="Qualität"
            filled
            dense
          >
            <template v-slot:hint>
              <div v-if="newArmor.quality === 'Gering'">
                -10 auf alle GE-Würfe
              </div>
              <div v-else-if="newArmor.quality === 'Gut'">
                Gegen ersten Angriff pro Runde +1 RP
              </div>
              <div v-else-if="newArmor.quality === 'Hervorragend'">
                Halbes Gewicht, +1 RP an allen Zonen
              </div>
              <div v-else>Normale Rüstung ohne Modifikatoren</div>
            </template>
          </q-select>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            flat
            label="Abbrechen"
            color="grey"
            @click="cancelArmorDialog"
          />
          <q-btn
            flat
            :label="editingArmorIndex !== null ? 'Speichern' : 'Hinzufügen'"
            color="primary"
            @click="saveArmor"
            :disable="!newArmor.name"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Add/Edit Gear Dialog -->
    <q-dialog v-model="showAddGearDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{
              editingGearIndex !== null
                ? "Gegenstand bearbeiten"
                : "Gegenstand hinzufügen"
            }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="newGear.name"
            label="Gegenstandsname"
            filled
            dense
          />

          <q-input
            v-model.number="newGear.quantity"
            label="Anzahl"
            type="number"
            filled
            dense
            min="1"
          />

          <q-select
            v-model="newGear.quality"
            :options="['Gering', 'Standard', 'Gut', 'Hervorragend']"
            label="Qualität"
            filled
            dense
            clearable
          />

          <q-input
            v-model="newGear.description"
            label="Beschreibung (optional)"
            type="textarea"
            filled
            rows="3"
          />

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-checkbox
                v-model="newGear.isArtifact"
                label="Artefakt"
                color="amber"
              >
                <q-tooltip>Hebt den Gegenstand als Artefakt hervor</q-tooltip>
              </q-checkbox>
            </div>
            <div class="col-6">
              <q-checkbox
                v-model="newGear.isTrophy"
                label="Trophäe"
                color="purple"
              >
                <q-tooltip>Hebt den Gegenstand als Trophäe hervor</q-tooltip>
              </q-checkbox>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            flat
            label="Abbrechen"
            color="grey"
            @click="cancelGearDialog"
          />
          <q-btn
            flat
            label="Speichern"
            color="primary"
            @click="saveGear"
            :disable="!newGear.name"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useQuasar } from "quasar";
import { useCharacterStore } from "../../stores/characterStore";
import { useSettingsStore } from "../../stores/settingsStore";
import ArmorVisualization from "../ArmorVisualization.vue";
import NumberInput from "../NumberInput.vue";
import draggable from "vuedraggable";

const $q = useQuasar();

const characterStore = useCharacterStore();
const { character } = storeToRefs(characterStore);

const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);

// Weapon stacks for pistol damage bonus (session only)
const weaponStacks = ref(0);

// Combat modifiers (KG/BF)
const kgModifier = ref(0);
const bfModifier = ref(0);
const showModifierDialog = ref(false);
const currentModifierStat = ref('KG');
const modifierDialogTab = ref('modifiers');

// Selected maneuvers (exclusive, one per stat)
const selectedKgManeuver = ref(null);
const selectedBfManeuver = ref(null);

// Selected weapons for modifier calculation
const selectedKgWeaponIndex = ref(null);
const selectedBfWeaponIndex = ref(null);

// Computed totals for KG/BF
const kgTotal = computed(() => character.value.attributes.KG + kgModifier.value);
const bfTotal = computed(() => character.value.attributes.BF + bfModifier.value);

// Current modifier value based on selected stat
const currentModifierValue = computed(() =>
  currentModifierStat.value === 'KG' ? kgModifier.value : bfModifier.value
);

// Current total based on selected stat
const currentTotal = computed(() =>
  currentModifierStat.value === 'KG' ? kgTotal.value : bfTotal.value
);

// Active modifiers (stored as arrays of modifier IDs)
const activeKgModifiers = ref([]);
const activeBfModifiers = ref([]);

// Ignored auto-modifiers (when user wants to override automatic modifiers)
const ignoredAutoModifiers = ref([]);

// Check if character is exhausted (exhaustion > 0)
const isExhausted = computed(() => character.value.exhaustion > 0);

// Watch for exhaustion changes and update modifiers
watch(isExhausted, () => {
  updateModifierTotals();
});

// All available modifiers organized by category
const modifierCategories = {
  zielgroesse: {
    name: 'Zielgröße',
    stat: 'BF', // Only for BF
    exclusive: true, // Only one can be selected
    modifiers: [
      { id: 'gigantisch', name: 'Gigantisches Ziel', value: 30 },
      { id: 'riesig', name: 'Riesiges Ziel', value: 20 },
      { id: 'gross', name: 'Großes Ziel', value: 10 },
      { id: 'klein', name: 'Kleines Ziel', value: -10 },
      { id: 'sehrklein', name: 'Sehr kleines Ziel', value: -20 },
      { id: 'winzig', name: 'Winziges Ziel', value: -30 },
    ]
  },
  distanz: {
    name: 'Distanz',
    stat: 'BF',
    exclusive: true, // Only one can be selected
    modifiers: [
      { id: 'kernschuss', name: 'Kernschussweite', value: 30 },
      { id: 'kurz', name: 'Kurze Distanz', value: 10 },
      { id: 'gross_entf', name: 'Große Entfernung', value: -10 },
      { id: 'extrem', name: 'Extreme Distanz', value: -30 },
    ]
  },
  ueberzahl: {
    name: 'Überzahl',
    stat: 'KG', // Only for KG
    exclusive: true, // Only one can be selected (2:1 OR 3:1)
    modifiers: [
      { id: 'ueber3zu1', name: '3:1 Überzahl', value: 20 },
      { id: 'ueber2zu1', name: '2:1 Überzahl', value: 10 },
    ]
  },
  zielzustand: {
    name: 'Ziel-Zustand',
    stat: 'both',
    exclusive: true, // Only one can be selected
    modifiers: [
      { id: 'unaufmerksam', name: 'Unaufmerksamer Gegner', value: 30 },
      { id: 'betaeubt', name: 'Betäubter Gegner', value: 20 },
      { id: 'liegend_nah', name: 'Liegendes Ziel (Nahkampf)', value: 10, stat: 'KG' },
      { id: 'liegend_fern', name: 'Liegendes Ziel (Fernkampf)', value: -10, stat: 'BF' },
      { id: 'verborgen', name: 'Völlig verborgenes Ziel', value: -30, stat: 'BF' },
    ]
  },
  eigenposition: {
    name: 'Eigene Position/Zustand',
    stat: 'both',
    exclusive: false, // Can be additive
    modifiers: [
      { id: 'erhoeht', name: 'Erhöhte Position', value: 10 },
      { id: 'liegend_selbst', name: 'Im Liegen (Nahkampf)', value: -10, stat: 'KG' },
      { id: 'schlamm', name: 'Im Schlamm/dichter Regen', value: -10 },
      { id: 'tiefschnee', name: 'In Tiefschnee', value: -30 },
    ]
  },
  sicht: {
    name: 'Sicht/Umgebung',
    stat: 'both',
    exclusive: true, // Only one can be selected
    modifiers: [
      { id: 'nebel', name: 'Nebel/Dunst/Schatten', value: -20, stat: 'BF' },
      { id: 'dunkel_nah', name: 'Im Dunkeln', value: -20, stat: 'KG' },
      { id: 'dunkel_fern', name: 'Schuss im Dunkeln', value: -30, stat: 'BF' },
    ]
  },
  spezial: {
    name: 'Spezielle Situationen',
    stat: 'both',
    exclusive: false, // Can be additive
    modifiers: [
      { id: 'nahkampf_schuss', name: 'Schuss in den Nahkampf', value: -20, stat: 'BF' },
      { id: 'unbewaffnet', name: 'Unbewaffnet vs. bewaffnet', value: -20, stat: 'KG' },
      { id: 'ohne_talent', name: 'Waffe ohne Talent', value: -20 },
      { id: 'schwer_nicht_abgestuetzt', name: 'Schwere Waffe nicht abgestützt', value: -30, stat: 'BF' },
    ]
  },
};

// Combat maneuvers (KG)
const kgManeuvers = [
  { id: 'standard_kg', name: 'Standardangriff', value: 0, type: 'Halb', description: 'Ein normaler Nahkampfangriff ohne Modifikatoren.' },
  { id: 'sturmangriff', name: 'Sturmangriff', value: 10, type: 'Voll', description: 'Muss sich mindestens 4m bewegen. +10 KG.' },
  { id: 'kompromisslos', name: 'Kompromißloser Angriff', value: 20, type: 'Voll', description: '+20 KG, kann in dieser Runde weder ausweichen noch parieren.' },
  { id: 'vorsichtig', name: 'Vorsichtiger Angriff', value: -10, type: 'Voll', description: '-10 KG, aber +10 auf Parade und Ausweichen.' },
  { id: 'gezielt_kg', name: 'Gezielter Angriff', value: -20, type: 'Voll', description: 'Bestimmtes Körperteil angreifen mit -20 KG.' },
  { id: 'finte', name: 'Finte', value: 0, type: 'Halb', description: 'Vergleichender KG-Wurf. Bei Erfolg kann Ziel weder ausweichen noch parieren.' },
  { id: 'manoever', name: 'Manöver', value: 0, type: 'Halb', description: 'Vergleichender KG-Wurf. Bei Erfolg kann Feind 1m bewegt werden.' },
  { id: 'umreissen', name: 'Umreißen', value: 0, type: 'Halb', description: 'Versuch, den Gegner zu Boden zu werfen.' },
  { id: 'betaeuben', name: 'Betäuben', value: 0, type: 'Voll', description: 'Versuch, einen Gegner zu betäuben.' },
  { id: 'packen', name: 'Packen', value: 0, type: 'Halb/Voll', description: 'Packen-Angriff oder Befreiungsversuch.' },
];

// Combat maneuvers (BF)
const bfManeuvers = [
  { id: 'standard_bf', name: 'Standardangriff', value: 0, type: 'Halb', description: 'Ein normaler Fernkampfangriff ohne Modifikatoren.' },
  { id: 'halbautomatisch', name: 'Halbautom. Feuer', value: 10, type: 'Voll', description: '+10 BF, weiterer Treffer für je zwei Erfolgsgrade.' },
  { id: 'automatisch', name: 'Automatisches Feuer', value: 20, type: 'Voll', description: '+20 BF, weiterer Treffer für jeden Erfolgsgrad.' },
  { id: 'zielen_halb', name: 'Zielen (Halb)', value: 10, type: 'Halb', description: '+10 auf den nächsten Angriff.' },
  { id: 'zielen_voll', name: 'Zielen (Voll)', value: 20, type: 'Voll', description: '+20 auf den nächsten Angriff.' },
  { id: 'gezielt_bf', name: 'Gezielter Angriff', value: -20, type: 'Voll', description: 'Bestimmtes Körperteil angreifen mit -20 BF.' },
  { id: 'sperrfeuer', name: 'Sperrfeuer', value: -20, type: 'Voll', description: 'Zwingt Gegner in Deckung. -20 BF.' },
];

// Get maneuvers for current stat
const currentManeuvers = computed(() =>
  currentModifierStat.value === 'KG' ? kgManeuvers : bfManeuvers
);

// Filter weapons by type for dropdown
const meleeWeapons = computed(() =>
  character.value.weapons
    .map((w, i) => ({ ...w, originalIndex: i }))
    .filter(w => isWeaponMelee(w))
);

const rangedWeapons = computed(() =>
  character.value.weapons
    .map((w, i) => ({ ...w, originalIndex: i }))
    .filter(w => !isWeaponMelee(w))
);

// Current weapons list based on stat
const currentWeaponsList = computed(() =>
  currentModifierStat.value === 'KG' ? meleeWeapons.value : rangedWeapons.value
);

// Current selected weapon index
const currentSelectedWeaponIndex = computed(() =>
  currentModifierStat.value === 'KG' ? selectedKgWeaponIndex.value : selectedBfWeaponIndex.value
);

// Current selected weapon object
const currentSelectedWeapon = computed(() => {
  const index = currentSelectedWeaponIndex.value;
  if (index === null) return null;
  return character.value.weapons[index] || null;
});

// Select weapon
const selectWeapon = (index) => {
  if (currentModifierStat.value === 'KG') {
    selectedKgWeaponIndex.value = index;
  } else {
    selectedBfWeaponIndex.value = index;
  }
  updateModifierTotals();
};

// Calculate weapon bonus based on quality, traits, mods, and selected maneuver
const calculateWeaponBonus = (weapon, stat, maneuver) => {
  if (!weapon) return { bonus: 0, details: [] };

  let bonus = 0;
  const details = [];

  if (stat === 'KG') {
    // Melee weapon quality
    if (weapon.quality === 'Gering') {
      bonus -= 10;
      details.push('Gering: -10');
    } else if (weapon.quality === 'Gut') {
      bonus += 5;
      details.push('Gut: +5');
    } else if (weapon.quality === 'Hervorragend') {
      bonus += 10;
      details.push('Hervorragend: +10');
    }

    // Melee traits
    if (weapon.traits?.includes('defensiv')) {
      bonus -= 10;
      details.push('Defensiv: -10 Angriff');
    }
  } else {
    // Ranged weapon mods
    const mods = weapon.mods || [];

    // Laser-Zielvorrichtung: +10 bei Einzelschuss (standard_bf)
    if ((mods.includes('laserziel') || mods.includes('praezision')) && maneuver === 'standard_bf') {
      bonus += 10;
      details.push('Laser-Zielvorrichtung: +10');
    }

    // Bewegungsspuerer: +10 bei Salve/Auto
    if (mods.includes('bewegungsspuerer') && (maneuver === 'halbautomatisch' || maneuver === 'automatisch')) {
      bonus += 10;
      details.push('Bewegungsspürer: +10');
    }
  }

  return { bonus, details };
};

// Get description of current weapon bonus
const getWeaponBonusDescription = () => {
  if (!currentSelectedWeapon.value) return '';

  const maneuver = currentSelectedManeuver.value;
  const stat = currentModifierStat.value;
  const { details } = calculateWeaponBonus(currentSelectedWeapon.value, stat, maneuver);

  return details.join(', ');
};

// Get currently selected maneuver for current stat
const currentSelectedManeuver = computed(() =>
  currentModifierStat.value === 'KG' ? selectedKgManeuver.value : selectedBfManeuver.value
);

// Check if maneuver is active
const isManeuverActive = (maneuverId) => {
  return currentSelectedManeuver.value === maneuverId;
};

// Select a maneuver (or deselect if same or null)
const selectManeuver = (maneuverId) => {
  if (currentModifierStat.value === 'KG') {
    selectedKgManeuver.value = selectedKgManeuver.value === maneuverId ? null : maneuverId;
  } else {
    selectedBfManeuver.value = selectedBfManeuver.value === maneuverId ? null : maneuverId;
  }
  updateModifierTotals();
};

// Get maneuver by ID
const getManeuverById = (maneuverId) => {
  return [...kgManeuvers, ...bfManeuvers].find(m => m.id === maneuverId) || null;
};

// Get modifiers for current stat (KG or BF)
const getModifiersForStat = (stat) => {
  const result = {};
  for (const [catKey, category] of Object.entries(modifierCategories)) {
    const filteredMods = category.modifiers.filter(mod => {
      const modStat = mod.stat || category.stat;
      return modStat === 'both' || modStat === stat;
    });
    if (filteredMods.length > 0) {
      result[catKey] = { ...category, modifiers: filteredMods };
    }
  }
  return result;
};

// Computed: categories for current stat
const currentCategories = computed(() => getModifiersForStat(currentModifierStat.value));

// Computed: active modifiers list for current stat
const currentActiveModifiers = computed(() =>
  currentModifierStat.value === 'KG' ? activeKgModifiers.value : activeBfModifiers.value
);

// Calculate total modifier from active modifiers, maneuver, and weapon
const calculateModifierTotal = (activeIds, stat) => {
  let total = 0;

  // Add modifier values
  for (const category of Object.values(modifierCategories)) {
    for (const mod of category.modifiers) {
      if (activeIds.includes(mod.id)) {
        const modStat = mod.stat || category.stat;
        if (modStat === 'both' || modStat === stat) {
          total += mod.value;
        }
      }
    }
  }

  // Add selected maneuver value
  const selectedManeuver = stat === 'KG' ? selectedKgManeuver.value : selectedBfManeuver.value;
  if (selectedManeuver) {
    const maneuver = getManeuverById(selectedManeuver);
    if (maneuver) {
      total += maneuver.value;
    }
  }

  // Add weapon bonus (quality, traits, mods)
  const selectedWeaponIndex = stat === 'KG' ? selectedKgWeaponIndex.value : selectedBfWeaponIndex.value;
  if (selectedWeaponIndex !== null) {
    const weapon = character.value.weapons[selectedWeaponIndex];
    if (weapon) {
      const { bonus } = calculateWeaponBonus(weapon, stat, selectedManeuver);
      total += bonus;

      // Check for mods that negate darkness penalty
      if (stat === 'BF') {
        const mods = weapon.mods || [];
        const hasDarknessNegation = mods.includes('beutespuerer') || mods.includes('restlicht') || mods.includes('praezision');
        if (hasDarknessNegation && activeIds.includes('dunkel_fern')) {
          // Remove darkness penalty
          total += 30; // Negate the -30
        }

        // Zielfernrohr negates distance penalties when using Zielen Voll
        const hasScope = mods.includes('zielfernrohr') || mods.includes('praezision');
        if (hasScope && selectedManeuver === 'zielen_voll') {
          if (activeIds.includes('gross_entf')) total += 10;
          if (activeIds.includes('extrem')) total += 30;
        }
      }
    }
  }

  // Add automatic exhaustion modifier (-10) if exhausted and not ignored
  if (isExhausted.value && !ignoredAutoModifiers.value.includes('auto_erschoepft')) {
    total -= 10;
  }

  // Clamp between -60 and +60
  return Math.max(-60, Math.min(60, total));
};

// Update computed totals when active modifiers change
const updateModifierTotals = () => {
  kgModifier.value = calculateModifierTotal(activeKgModifiers.value, 'KG');
  bfModifier.value = calculateModifierTotal(activeBfModifiers.value, 'BF');
};

// Toggle ignore for auto-modifier
const toggleIgnoreAutoModifier = (modId) => {
  const index = ignoredAutoModifiers.value.indexOf(modId);
  if (index >= 0) {
    ignoredAutoModifiers.value.splice(index, 1);
  } else {
    ignoredAutoModifiers.value.push(modId);
  }
  updateModifierTotals();
};

// Check if auto-modifier is ignored
const isAutoModifierIgnored = (modId) => {
  return ignoredAutoModifiers.value.includes(modId);
};

// Find which category a modifier belongs to
const findModifierCategory = (modId) => {
  for (const [catKey, category] of Object.entries(modifierCategories)) {
    if (category.modifiers.some(m => m.id === modId)) {
      return { key: catKey, category };
    }
  }
  return null;
};

// Toggle a modifier on/off
const toggleModifier = (modId) => {
  const activeList = currentModifierStat.value === 'KG' ? activeKgModifiers : activeBfModifiers;
  const index = activeList.value.indexOf(modId);

  if (index >= 0) {
    // Deselect
    activeList.value.splice(index, 1);
  } else {
    // Select - check if category is exclusive
    const catInfo = findModifierCategory(modId);
    if (catInfo && catInfo.category.exclusive) {
      // Remove all other modifiers from this category first
      const categoryModIds = catInfo.category.modifiers.map(m => m.id);
      activeList.value = activeList.value.filter(id => !categoryModIds.includes(id));
    }
    activeList.value.push(modId);
  }
  updateModifierTotals();
};

// Check if modifier is active
const isModifierActive = (modId) => {
  return currentActiveModifiers.value.includes(modId);
};

// Get modifier by ID
const getModifierById = (modId) => {
  for (const category of Object.values(modifierCategories)) {
    const mod = category.modifiers.find(m => m.id === modId);
    if (mod) return mod;
  }
  return null;
};

// Open modifier dialog for KG or BF
const openModifierDialog = (stat) => {
  currentModifierStat.value = stat;
  showModifierDialog.value = true;
};

// Reset all modifiers, maneuver, and weapon for current stat
const resetCurrentAll = () => {
  if (currentModifierStat.value === 'KG') {
    activeKgModifiers.value = [];
    selectedKgManeuver.value = null;
    selectedKgWeaponIndex.value = null;
  } else {
    activeBfModifiers.value = [];
    selectedBfManeuver.value = null;
    selectedBfWeaponIndex.value = null;
  }
  updateModifierTotals();
};

// Weapon state
const showAddWeaponDialog = ref(false);
const showWeaponInfoDialog = ref(false);
const showDeleteWeaponDialog = ref(false);
const weaponToDelete = ref(null);
const editingWeaponIndex = ref(null);
const currentWeapon = ref(null);

const weaponTypeOptions = [
  "Nahkampfwaffen",
  "Wurfwaffen",
  "Pistolen",
  "Leichte Waffen",
  "Schwere Waffen",
  "Exotische Waffen",
];

// Melee weapon traits
const meleeTraitOptions = [
  { label: 'Ausgewogen (+10 Parade)', value: 'ausgewogen' },
  { label: 'Defensiv (+15 Parade, -10 Angriff)', value: 'defensiv' },
  { label: 'Unausgewogen (-10 Parade)', value: 'unausgewogen' },
];

// Ranged weapon mods
const rangedModOptions = [
  { label: 'Beutespürer (negiert Dunkelheit)', value: 'beutespuerer' },
  { label: 'Bewegungsspürer (+10 bei Salve/Auto)', value: 'bewegungsspuerer' },
  { label: 'Laser-Zielvorrichtung (+10 Einzelschuss)', value: 'laserziel' },
  { label: 'Zielfernrohr (ignoriert Distanz bei Zielen Voll)', value: 'zielfernrohr' },
  { label: 'Restlichtverstärker (negiert Dunkelheit)', value: 'restlicht' },
  { label: 'Präzisionszielfernrohr (Kombi)', value: 'praezision' },
];

// Icon helpers for mods
const getModIcon = (mod) => {
  const icons = {
    beutespuerer: 'visibility',
    bewegungsspuerer: 'speed',
    laserziel: 'gps_fixed',
    zielfernrohr: 'zoom_in',
    restlicht: 'nightlight',
    praezision: 'my_location',
  };
  return icons[mod] || 'settings';
};

const getModColor = (mod) => {
  const colors = {
    beutespuerer: 'cyan',
    bewegungsspuerer: 'orange',
    laserziel: 'red',
    zielfernrohr: 'blue',
    restlicht: 'purple',
    praezision: 'amber',
  };
  return colors[mod] || 'grey';
};

const getModLabel = (mod) => {
  const labels = {
    beutespuerer: 'Beutespürer',
    bewegungsspuerer: 'Bewegungsspürer',
    laserziel: 'Laser-Zielvorrichtung',
    zielfernrohr: 'Zielfernrohr',
    restlicht: 'Restlichtverstärker',
    praezision: 'Präzisionszielfernrohr',
  };
  return labels[mod] || mod;
};

// Icon helpers for traits
const getTraitIcon = (trait) => {
  const icons = {
    ausgewogen: 'balance',
    defensiv: 'shield',
    unausgewogen: 'warning',
  };
  return icons[trait] || 'star';
};

const getTraitColor = (trait) => {
  const colors = {
    ausgewogen: 'positive',
    defensiv: 'blue',
    unausgewogen: 'negative',
  };
  return colors[trait] || 'grey';
};

const getTraitLabel = (trait) => {
  const labels = {
    ausgewogen: 'Ausgewogen (+10 Parade)',
    defensiv: 'Defensiv (+15 Parade, -10 Angriff)',
    unausgewogen: 'Unausgewogen (-10 Parade)',
  };
  return labels[trait] || trait;
};

const newWeapon = ref({
  name: "",
  type: "",
  subtype: "",
  damage: "",
  damageMod: 0,
  damageType: "",
  penetration: 0,
  range: "",
  rof: "",
  magazine: 0,
  reload: "",
  special: "",
  quality: "Normal",
  traits: [],
  mods: [],
});

// Check if current weapon is melee
const isMeleeWeapon = computed(() => {
  return isWeaponMelee(newWeapon.value);
});

// Helper to check if any weapon is melee
const isWeaponMelee = (weapon) => {
  return (
    weapon.type === "Nahkampfwaffen" ||
    (weapon.type === "Exotische Waffen" && weapon.subtype === "Nahkampf")
  );
};

// Copy damage roll command to clipboard for Discord
const copyDamageRoll = async (weapon) => {
  if (!weapon.damage) return;

  // Convert damage format: "1W10+4 R" -> "1d10+4"
  let diceCode = weapon.damage
    .replace(/W/gi, "d") // W -> d
    .replace(/\s*[EIRX]\s*$/i, "") // Remove damage type suffix
    .trim();

  // Add extra d10 for "Reißend" damage type
  if (weapon.damageType && weapon.damageType.includes("R")) {
    const diceMatch = diceCode.match(/^(\d+)(d\d+)/);
    if (diceMatch) {
      const diceCount = parseInt(diceMatch[1]) + 1;
      diceCode = diceCode.replace(/^\d+(d\d+)/, `${diceCount}$1`);
    }
  }

  // Calculate total modifier: damageMod + weapon stacks (for pistols)
  let extraMod = weapon.damageMod || 0;

  // Add weapon stacks bonus for pistols
  if (weapon.type === "Pistolen" && weaponStacks.value > 0) {
    extraMod += weaponStacks.value;
  }

  // Combine modifiers: "1d10+4" with extraMod 5 -> "1d10+9"
  if (extraMod) {
    // Check if there's already a modifier in the dice code
    const match = diceCode.match(/^(.+?)([+-]\d+)$/);
    if (match) {
      // Has existing modifier, combine them
      const baseDice = match[1];
      const existingMod = parseInt(match[2]);
      const totalMod = existingMod + extraMod;
      if (totalMod === 0) {
        diceCode = baseDice;
      } else if (totalMod > 0) {
        diceCode = `${baseDice}+${totalMod}`;
      } else {
        diceCode = `${baseDice}${totalMod}`;
      }
    } else {
      // No existing modifier, just add
      if (extraMod > 0) {
        diceCode += `+${extraMod}`;
      } else {
        diceCode += `${extraMod}`;
      }
    }
  }

  const command = `/würfle generic eingabe: ${diceCode}`;

  try {
    await navigator.clipboard.writeText(command);
    $q.notify({
      message: `Kopiert: ${command}`,
      color: "positive",
      icon: "content_copy",
      timeout: 2000,
    });
  } catch (err) {
    $q.notify({
      message: "Kopieren fehlgeschlagen",
      color: "negative",
      icon: "error",
      timeout: 2000,
    });
  }
};

// Armor state
const showAddArmorDialog = ref(false);
const showDeleteArmorDialog = ref(false);
const armorToDelete = ref(null);
const editingArmorIndex = ref(null);

const newArmor = ref({
  name: "",
  ap: 0,
  locations: [],
  weight: 0,
  quality: "Standard",
  equipped: true,
  additive: false,
});

// Gear state
const showAddGearDialog = ref(false);
const showDeleteGearDialog = ref(false);
const gearToDelete = ref(null);
const editingGearIndex = ref(null);

const newGear = ref({
  name: "",
  quantity: 1,
  quality: "",
  description: "",
  isArtifact: false,
  isTrophy: false,
});

// Weapon functions
const showWeaponInfo = (weapon) => {
  currentWeapon.value = weapon;
  showWeaponInfoDialog.value = true;
};

const editFromWeaponInfo = () => {
  showWeaponInfoDialog.value = false;
  const index = character.value.weapons.indexOf(currentWeapon.value);
  if (index !== -1) {
    editWeapon(index);
  }
};

const editWeapon = (index) => {
  editingWeaponIndex.value = index;
  const weapon = character.value.weapons[index];
  newWeapon.value = {
    ...weapon,
    quality: weapon.quality || "Normal",
    subtype: weapon.subtype || "",
    damageType: weapon.damageType || "",
    damageMod: weapon.damageMod || 0,
    traits: weapon.traits || [],
    mods: weapon.mods || [],
  };
  showAddWeaponDialog.value = true;
};

const saveWeapon = () => {
  if (!newWeapon.value.name) return;

  if (editingWeaponIndex.value !== null) {
    characterStore.updateWeapon(editingWeaponIndex.value, {
      ...newWeapon.value,
    });
  } else {
    characterStore.addWeapon({ ...newWeapon.value });
  }

  cancelWeaponDialog();
};

const removeWeapon = (weapon, index) => {
  weaponToDelete.value = { weapon, index };
  showDeleteWeaponDialog.value = true;
};

const confirmDeleteWeapon = () => {
  if (weaponToDelete.value !== null) {
    characterStore.removeWeapon(weaponToDelete.value.index);
  }
  showDeleteWeaponDialog.value = false;
  weaponToDelete.value = null;
};

const duplicateWeapon = () => {
  // Create a copy with "(Kopie)" suffix
  const copy = {
    ...newWeapon.value,
    name: newWeapon.value.name + " (Kopie)",
  };
  characterStore.addWeapon(copy);
  cancelWeaponDialog();
};

const cancelWeaponDialog = () => {
  showAddWeaponDialog.value = false;
  editingWeaponIndex.value = null;
  newWeapon.value = {
    name: "",
    type: "",
    subtype: "",
    damage: "",
    damageMod: 0,
    damageType: "",
    penetration: 0,
    range: "",
    rof: "",
    magazine: 0,
    reload: "",
    special: "",
    quality: "Normal",
    traits: [],
    mods: [],
  };
};

// Armor functions
const getArmorLocationText = (locations, isAdditive = false) => {
  if (!locations || locations.length === 0) return "Alle Körperteile";

  // Standard armor has 4 locations, additive has 6
  const allLocationsCount = isAdditive ? 6 : 4;
  if (locations.length === allLocationsCount) return "Alle Körperteile";

  // Check if both arms or both legs are selected (for additive)
  const hasLeftArm = locations.includes("Linker Arm");
  const hasRightArm = locations.includes("Rechter Arm");
  const hasLeftLeg = locations.includes("Linkes Bein");
  const hasRightLeg = locations.includes("Rechtes Bein");

  // Build display text, combining arm/leg pairs
  const displayParts = [];
  const processedLocations = [...locations];

  if (hasLeftArm && hasRightArm) {
    displayParts.push("Arme");
    processedLocations.splice(processedLocations.indexOf("Linker Arm"), 1);
    processedLocations.splice(processedLocations.indexOf("Rechter Arm"), 1);
  }
  if (hasLeftLeg && hasRightLeg) {
    displayParts.push("Beine");
    processedLocations.splice(processedLocations.indexOf("Linkes Bein"), 1);
    processedLocations.splice(processedLocations.indexOf("Rechtes Bein"), 1);
  }

  // Add remaining locations
  displayParts.push(...processedLocations);

  return displayParts.join(", ");
};

// Handler for additive checkbox change - reset locations when switching modes
const onAdditiveChange = (isAdditive) => {
  // Clear locations when switching between modes since the options are different
  newArmor.value.locations = [];
};

const getEffectiveAP = (armor) => {
  const baseAP = armor.ap || 0;
  if (armor.quality === "Hervorragend") {
    return baseAP + 1;
  }
  return baseAP;
};

const getEffectiveWeight = (armor) => {
  const baseWeight = armor.weight || 0;
  if (armor.quality === "Hervorragend") {
    return baseWeight / 2;
  }
  return baseWeight;
};

const getQualityColor = (quality) => {
  switch (quality) {
    case "Gering":
      return "text-negative";
    case "Gut":
      return "text-positive";
    case "Hervorragend":
      return "text-positive";
    default:
      return "text-grey-6";
  }
};

const getQualityEffect = (quality) => {
  switch (quality) {
    case "Gering":
      return "-10 auf alle GE-Würfe";
    case "Gut":
      return "Gegen ersten Angriff pro Runde +1 RP";
    case "Hervorragend":
      return "Halbes Gewicht, +1 RP an allen Zonen";
    case "Standard":
    default:
      return "Keine Modifikatoren";
  }
};

const getWeaponQualityEffect = (quality, weaponType, weaponSubtype) => {
  // Determine if weapon is ranged based on type
  const isRanged =
    weaponType &&
    (weaponType === "Pistolen" ||
      weaponType === "Leichte Waffen" ||
      weaponType === "Schwere Waffen" ||
      weaponType === "Wurfwaffen" ||
      (weaponType === "Exotische Waffen" && weaponSubtype === "Fernkampf") ||
      // Fallback for old weapons with text-based types
      weaponType.toLowerCase().includes("fern") ||
      weaponType.toLowerCase().includes("pistole") ||
      weaponType.toLowerCase().includes("laser") ||
      weaponType.toLowerCase().includes("bolter") ||
      weaponType.toLowerCase().includes("plasma") ||
      weaponType.toLowerCase().includes("gewehr") ||
      weaponType.toLowerCase().includes("schuss"));

  switch (quality) {
    case "Gering":
      return isRanged
        ? "Eigenschaft Unzuverlässig (oder Ladehemmung bei jedem Fehlschuss)"
        : "-10 auf Angriffswürfe und Paraden";
    case "Gut":
      return isRanged ? "Eigenschaft Zuverlässig" : "+5 auf Angriffswürfe";
    case "Hervorragend":
      return isRanged
        ? "Keine Ladehemmung oder Überhitzung (werden zu Fehlschuss)"
        : "+10 auf Angriffswürfe, +1 Schaden";
    case "Normal":
    default:
      return "Keine Modifikatoren";
  }
};

const removeArmor = (armor, index) => {
  armorToDelete.value = { armor, index };
  showDeleteArmorDialog.value = true;
};

const confirmDeleteArmor = () => {
  if (armorToDelete.value !== null) {
    characterStore.removeArmor(armorToDelete.value.index);
  }
  showDeleteArmorDialog.value = false;
  armorToDelete.value = null;
};

const editArmor = (index) => {
  editingArmorIndex.value = index;
  const armor = character.value.armor[index];
  newArmor.value = {
    name: armor.name,
    ap: armor.ap || 0,
    locations: armor.locations ? [...armor.locations] : [],
    weight: armor.weight || 0,
    quality: armor.quality || "Standard",
    equipped: armor.equipped !== undefined ? armor.equipped : true,
    additive: armor.additive || false,
  };
  showAddArmorDialog.value = true;
};

const saveArmor = () => {
  if (!newArmor.value.name) return;

  if (editingArmorIndex.value !== null) {
    characterStore.updateArmor(editingArmorIndex.value, { ...newArmor.value });
  } else {
    characterStore.addArmor({ ...newArmor.value });
  }

  cancelArmorDialog();
};

const cancelArmorDialog = () => {
  showAddArmorDialog.value = false;
  editingArmorIndex.value = null;
  newArmor.value = {
    name: "",
    ap: 0,
    locations: [],
    weight: 0,
    quality: "Standard",
    equipped: true,
    additive: false,
  };
};

// Gear functions
const editGear = (index) => {
  editingGearIndex.value = index;
  const gear = character.value.gear[index];
  newGear.value = {
    name: gear.name || "",
    quantity: gear.quantity || 1,
    quality: gear.quality || "",
    description: gear.description || "",
    isArtifact: gear.isArtifact || false,
    isTrophy: gear.isTrophy || false,
  };
  showAddGearDialog.value = true;
};

const removeGear = (item, index) => {
  gearToDelete.value = { item, index };
  showDeleteGearDialog.value = true;
};

const confirmDeleteGear = () => {
  if (gearToDelete.value !== null) {
    characterStore.removeGear(gearToDelete.value.index);
  }
  showDeleteGearDialog.value = false;
  gearToDelete.value = null;
};

const getGearQualityColor = (quality) => {
  switch (quality) {
    case "Gering":
      return "text-negative";
    case "Gut":
    case "Hervorragend":
      return "text-positive";
    default:
      return "text-grey-6";
  }
};

const saveGear = () => {
  if (!newGear.value.name) return;

  if (editingGearIndex.value !== null) {
    characterStore.updateGear(editingGearIndex.value, { ...newGear.value });
  } else {
    characterStore.addGear({ ...newGear.value });
  }

  cancelGearDialog();
};

const changeGearQuantity = (index, delta) => {
  const item = character.value.gear[index];
  const newQuantity = (item.quantity || 1) + delta;
  if (newQuantity >= 1) {
    characterStore.updateGear(index, { quantity: newQuantity });
  }
};

const cancelGearDialog = () => {
  showAddGearDialog.value = false;
  editingGearIndex.value = null;
  newGear.value = {
    name: "",
    quantity: 1,
    quality: "",
    description: "",
    isArtifact: false,
    isTrophy: false,
  };
};
</script>

<style scoped>
.cursor-grab {
  cursor: grab;
}

.cursor-grab:active {
  cursor: grabbing;
}

.drag-handle:hover {
  color: #ffd54f !important;
}

.artifact-item {
  background: rgba(255, 213, 79, 0.1) !important;
  border-left: 3px solid #ffd54f;
}

.trophy-item {
  background: rgba(156, 39, 176, 0.1) !important;
  border-left: 3px solid #9c27b0;
}

.artifact-item.trophy-item {
  background: linear-gradient(
    90deg,
    rgba(255, 213, 79, 0.1),
    rgba(156, 39, 176, 0.1)
  ) !important;
  border-left: 3px solid #ffd54f;
  border-right: 3px solid #9c27b0;
}

.combat-stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.combat-stat-chip:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.modifier-btn {
  min-height: 36px;
  padding: 4px 8px;
}

.modifier-btn .q-btn__content {
  flex-wrap: nowrap;
}
</style>
