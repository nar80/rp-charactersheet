<template>
  <q-page padding>
    <div class="q-gutter-md">
      <!-- Basic Info Section -->
      <BasicInfoSection />

      <!-- Attributes Section -->
      <AttributesSection />

      <!-- Skills Section -->
      <SkillsSection />
    </div>
  </q-page>
</template>

<script setup>
import BasicInfoSection from '../components/sections/BasicInfoSection.vue'
import AttributesSection from '../components/sections/AttributesSection.vue'
import SkillsSection from '../components/sections/SkillsSection.vue'
</script>
