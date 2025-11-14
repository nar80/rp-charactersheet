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
            flat
            dense
            icon="sort_by_alpha"
            :color="sortWeaponsAlpha ? 'primary' : 'grey'"
            @click="sortWeaponsAlpha = !sortWeaponsAlpha"
          >
            <q-tooltip>Alphabetisch sortieren</q-tooltip>
          </q-btn>
          <q-btn
            color="primary"
            icon="add"
            label="Waffe hinzufügen"
            @click="showAddWeaponDialog = true"
          />
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

      <div v-else class="row q-col-gutter-md">
        <div
          v-for="(weapon, index) in sortedWeapons"
          :key="weapon.originalIndex"
          class="col-12 col-md-6"
        >
          <q-card bordered flat class="bg-grey-9">
            <q-card-section class="q-pa-sm">
              <div class="row items-center q-mb-xs">
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
                  <div class="text-subtitle1 text-bold">{{ weapon.name }}</div>
                  <div class="text-caption text-grey-6">
                    {{ weapon.type || "Waffe" }}
                    <span v-if="weapon.subtype"> ({{ weapon.subtype }})</span>
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
                    @click="editWeapon(weapon.originalIndex)"
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
                    @click="removeWeapon(weapon.originalIndex)"
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
                <span v-if="weapon.rof">
                  <span class="text-grey-6">SF:</span>
                  <span class="text-bold">{{ weapon.rof }}</span>
                  <span class="q-mx-sm">•</span>
                </span>
                <span v-if="weapon.magazine">
                  <span class="text-grey-6">Mag:</span>
                  <span class="text-bold">{{ weapon.magazine }}</span>
                  <span class="q-mx-sm" v-if="weapon.reload">•</span>
                </span>
                <span v-if="weapon.reload">
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
              <div
                v-if="weapon.quality && weapon.quality !== 'Normal'"
                class="q-mt-sm"
              >
                <div class="text-body2 text-grey-6">
                  Qualität:
                  <span
                    class="text-bold"
                    :class="getQualityColor(weapon.quality)"
                    >{{ weapon.quality }}</span
                  >
                </div>
                <div
                  class="text-body2"
                  :class="getQualityColor(weapon.quality)"
                >
                  {{
                    getWeaponQualityEffect(
                      weapon.quality,
                      weapon.type,
                      weapon.subtype
                    )
                  }}
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
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
        <div class="col-12 col-md-2">
          <ArmorVisualization :armor="character.armor" />
        </div>

        <!-- Armor List -->
        <div class="col-12 col-md-8">
          <div class="row q-col-gutter-md">
            <div
              v-for="(armor, index) in character.armor"
              :key="index"
              class="col-12 col-md-6"
            >
              <q-card bordered flat class="bg-grey-9">
                <q-card-section class="q-pa-sm">
                  <div class="row items-center q-mb-xs">
                    <div class="col">
                      <div class="text-subtitle1 text-bold">
                        {{ armor.name }}
                      </div>
                      <div class="text-caption text-grey-6">
                        <span
                          v-if="armor.locations && armor.locations.length > 0"
                        >
                          {{ getArmorLocationText(armor.locations) }}
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
                        @click="characterStore.removeArmor(index)"
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
                    <div
                      class="col-12 q-mt-xs"
                      v-if="armor.quality && armor.quality !== 'Standard'"
                    >
                      <div class="text-grey-6">
                        Qualität:
                        <span
                          class="text-bold"
                          :class="getQualityColor(armor.quality)"
                          >{{ armor.quality }}</span
                        >
                      </div>
                      <div
                        class="text-body2"
                        :class="getQualityColor(armor.quality)"
                      >
                        {{ getQualityEffect(armor.quality) }}
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
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

      <q-list v-if="character.gear.length > 0" bordered separator>
        <q-item v-for="(item, index) in character.gear" :key="index" dense>
          <q-item-section avatar>
            <q-avatar color="grey-8" text-color="white" size="sm">
              {{ item.quantity || 1 }}
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ item.name }}</q-item-label>
            <q-item-label caption v-if="item.description">{{
              item.description
            }}</q-item-label>
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
                color="negative"
                @click="characterStore.removeGear(index)"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
      <div v-else class="text-center text-grey-6 q-pa-md">
        <q-icon name="inventory_2" size="3rem" color="grey-6" />
        <div class="q-mt-sm">Keine Ausrüstung vorhanden</div>
      </div>
    </q-card-section>

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
          <q-input v-model="newWeapon.name" label="Waffenname" filled dense />

          <!-- Gattung -->
          <q-select
            v-model="newWeapon.type"
            :options="weaponTypeOptions"
            label="Gattung"
            filled
            dense
            hint="Kategorie nach Regelwerk"
          >
            <template v-slot:append>
              <q-icon name="info" class="cursor-pointer" color="grey-6">
                <q-tooltip max-width="300px">
                  <div class="text-bold">Waffengattungen:</div>
                  <div class="q-mt-xs">
                    <b>Nahkampfwaffen:</b> Schwerter, Äxte, Kraftwaffen
                  </div>
                  <div class="q-mt-xs">
                    <b>Wurfwaffen:</b> Messer, Granaten, etc.
                  </div>
                  <div class="q-mt-xs">
                    <b>Pistolen:</b> Ein-Hand-Fernkampfwaffen
                  </div>
                  <div class="q-mt-xs">
                    <b>Leichte Waffen:</b> Gewehre, leichte Bolter
                  </div>
                  <div class="q-mt-xs">
                    <b>Schwere Waffen:</b> Schwere Bolter, Plasma-Kanonen
                  </div>
                  <div class="q-mt-xs">
                    <b>Exotisch:</b> Seltene/ungewöhnliche Waffen
                  </div>
                </q-tooltip>
              </q-icon>
            </template>
          </q-select>

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

          <!-- Schaden -->
          <q-input
            v-model="newWeapon.damage"
            label="Schaden"
            filled
            dense
            hint="z.B. '1d10+3' oder '2d10'"
          />

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
            hint="E, I, R oder X"
          />

          <!-- DS (Durchschlag/Penetration) -->
          <q-input
            v-model.number="newWeapon.penetration"
            label="DS (Durchschlag)"
            type="number"
            filled
            dense
            hint="Panzerungsdurchschlag"
          />

          <!-- Reichweite -->
          <q-input
            v-model="newWeapon.range"
            label="Reichweite"
            filled
            dense
            hint="z.B. '30m' oder '-' für Nahkampf"
          />

          <!-- SF (Schussfolge/RoF) -->
          <q-input
            v-model="newWeapon.rof"
            label="SF (Schussfolge)"
            filled
            dense
            hint="z.B. 'S/3/-' oder '-' für Nahkampf"
          />

          <!-- Mag (Magazin) -->
          <q-input
            v-model.number="newWeapon.magazine"
            label="Mag (Magazin)"
            type="number"
            filled
            dense
            hint="Magazingröße"
          />

          <!-- Nachladen -->
          <q-select
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
            hint="Wie viele Runden dauert das Nachladen"
          />

          <!-- Speziell (Eigenschaften) -->
          <q-input
            v-model="newWeapon.special"
            label="Speziell (Eigenschaften)"
            type="textarea"
            filled
            rows="3"
            hint="z.B. 'Reißend, Unwuchtig, Primitiv'"
          />

          <!-- Qualität -->
          <q-select
            v-model="newWeapon.quality"
            :options="['Gering', 'Normal', 'Gut', 'Hervorragend']"
            label="Qualität"
            filled
            dense
          >
            <template v-slot:append>
              <q-icon name="info" class="cursor-pointer" color="grey-6">
                <q-tooltip max-width="300px">
                  <div class="text-bold">Waffenqualität:</div>
                  <div class="q-mt-xs">
                    <b>Gering:</b> Fernkampf: Unzuverlässig. Nahkampf: -10 auf
                    Angriffe/Paraden
                  </div>
                  <div class="q-mt-xs">
                    <b>Normal:</b> Standard-Waffe ohne Modifikationen
                  </div>
                  <div class="q-mt-xs">
                    <b>Gut:</b> Fernkampf: Zuverlässig. Nahkampf: +5 auf
                    Angriffe
                  </div>
                  <div class="q-mt-xs">
                    <b>Hervorragend:</b> Fernkampf: Keine
                    Ladehemmung/Überhitzung. Nahkampf: +10 Angriffe, +1 Schaden
                  </div>
                </q-tooltip>
              </q-icon>
            </template>
          </q-select>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
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
            <div class="text-subtitle2 q-mb-sm">Bedeckte Körperteile:</div>
            <div class="row q-col-gutter-sm">
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

          <div class="row q-col-gutter-md">
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
              >
                <q-tooltip
                  >Wird zu anderer Rüstung addiert statt Maximum zu
                  nehmen</q-tooltip
                >
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

          <q-input
            v-model="newGear.description"
            label="Beschreibung (optional)"
            type="textarea"
            filled
            rows="3"
          />
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
import { ref, computed, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useCharacterStore } from "../../stores/characterStore";
import ArmorVisualization from "../ArmorVisualization.vue";

const characterStore = useCharacterStore();
const { character } = storeToRefs(characterStore);

// Weapon state
const showAddWeaponDialog = ref(false);
const showWeaponInfoDialog = ref(false);
const editingWeaponIndex = ref(null);
const currentWeapon = ref(null);
const sortWeaponsAlpha = ref(false);

const weaponTypeOptions = [
  "Nahkampfwaffen",
  "Wurfwaffen",
  "Pistolen",
  "Leichte Waffen",
  "Schwere Waffen",
  "Exotische Waffen",
];

const newWeapon = ref({
  name: "",
  type: "",
  subtype: "",
  damage: "",
  damageType: "",
  penetration: 0,
  range: "",
  rof: "",
  magazine: 0,
  reload: "",
  special: "",
  quality: "Normal",
});

// Armor state
const showAddArmorDialog = ref(false);
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
const editingGearIndex = ref(null);

const newGear = ref({
  name: "",
  quantity: 1,
  description: "",
});

// Load sort preference
onMounted(() => {
  const saved = localStorage.getItem("weapons-sort-alpha");
  if (saved !== null) {
    sortWeaponsAlpha.value = saved === "true";
  }
});

// Save sort preference
watch(sortWeaponsAlpha, (newValue) => {
  localStorage.setItem("weapons-sort-alpha", newValue.toString());
});

// Sorted weapons
const sortedWeapons = computed(() => {
  const weaponsWithIndex = character.value.weapons.map((weapon, index) => ({
    ...weapon,
    originalIndex: index,
  }));

  if (sortWeaponsAlpha.value) {
    return weaponsWithIndex.sort((a, b) => a.name.localeCompare(b.name, "de"));
  }

  return weaponsWithIndex;
});

// Weapon functions
const showWeaponInfo = (weapon) => {
  currentWeapon.value = weapon;
  showWeaponInfoDialog.value = true;
};

const editFromWeaponInfo = () => {
  showWeaponInfoDialog.value = false;
  editWeapon(currentWeapon.value.originalIndex);
};

const editWeapon = (index) => {
  editingWeaponIndex.value = index;
  const weapon = character.value.weapons[index];
  newWeapon.value = {
    ...weapon,
    quality: weapon.quality || "Normal", // Default for old weapons
    subtype: weapon.subtype || "", // Default for old weapons
    damageType: weapon.damageType || "", // Default for old weapons
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

const removeWeapon = (index) => {
  characterStore.removeWeapon(index);
};

const cancelWeaponDialog = () => {
  showAddWeaponDialog.value = false;
  editingWeaponIndex.value = null;
  newWeapon.value = {
    name: "",
    type: "",
    subtype: "",
    damage: "",
    damageType: "",
    penetration: 0,
    range: "",
    rof: "",
    magazine: 0,
    reload: "",
    special: "",
    quality: "Normal",
  };
};

// Armor functions
const getArmorLocationText = (locations) => {
  if (!locations || locations.length === 0) return "Alle Körperteile";
  if (locations.length === 4) return "Alle Körperteile";
  return locations.join(", ");
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
    default:
      return "";
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
    default:
      return "";
  }
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
  newGear.value = { ...character.value.gear[index] };
  showAddGearDialog.value = true;
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
    description: "",
  };
};
</script>
