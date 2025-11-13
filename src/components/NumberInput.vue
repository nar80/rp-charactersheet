<template>
  <div class="number-input-container">
    <q-btn
      round
      dense
      flat
      :disable="isAtMin"
      :color="buttonColor"
      icon="remove"
      @click="decrement"
      size="sm"
      class="number-btn"
    >
      <q-tooltip v-if="isAtMin">Minimum erreicht</q-tooltip>
    </q-btn>

    <input
      type="number"
      :value="modelValue"
      @input="handleInput"
      @blur="handleBlur"
      class="number-input"
      :min="min"
      :max="max"
      :style="{ color: textColor }"
    />

    <q-btn
      round
      dense
      flat
      :disable="isAtMax"
      :color="buttonColor"
      icon="add"
      @click="increment"
      size="sm"
      class="number-btn"
    >
      <q-tooltip v-if="isAtMax">Maximum erreicht</q-tooltip>
    </q-btn>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 999,
  },
  buttonColor: {
    type: String,
    default: "amber",
  },
  textColor: {
    type: String,
    default: "#ffd54f",
  },
});

const emit = defineEmits(["update:modelValue"]);

const isAtMin = computed(() => props.modelValue <= props.min);
const isAtMax = computed(() => props.modelValue >= props.max);

const decrement = () => {
  if (!isAtMin.value) {
    emit("update:modelValue", props.modelValue - 1);
  }
};

const increment = () => {
  if (!isAtMax.value) {
    emit("update:modelValue", props.modelValue + 1);
  }
};

const handleInput = (event) => {
  let value = parseInt(event.target.value) || props.min;
  value = Math.max(props.min, Math.min(props.max, value));
  emit("update:modelValue", value);
};

const handleBlur = (event) => {
  // Ensure value is within bounds when user leaves the field
  let value = parseInt(event.target.value);
  if (isNaN(value)) {
    value = props.min;
  }
  value = Math.max(props.min, Math.min(props.max, value));
  emit("update:modelValue", value);
};
</script>

<style scoped>
.number-input-container {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 213, 79, 0.2);
  border-radius: 8px;
  padding: 4px 8px;
  transition: all 0.2s ease;
}

.number-input-container:hover {
  border-color: rgba(255, 213, 79, 0.4);
  box-shadow: 0 0 8px rgba(255, 213, 79, 0.2);
}

.number-input-container:focus-within {
  border-color: rgba(255, 213, 79, 0.6);
  box-shadow: 0 0 12px rgba(255, 213, 79, 0.3);
}

.number-input {
  width: 40px;
  text-align: center;
  font-size: 1.1rem;
  font-weight: bold;
  background: transparent;
  border: none;
  color: #ffd54f;
  font-family: "Cinzel", serif;
  letter-spacing: 0.5px;
}

.number-input:focus {
  outline: none;
}

/* Hide default number input spinners */
.number-input::-webkit-outer-spin-button,
.number-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.number-input[type="number"] {
  -moz-appearance: textfield;
}

.number-btn {
  min-width: 28px;
  min-height: 28px;
  transition: all 0.2s ease;
}

.number-btn:not(:disabled):hover {
  transform: scale(1.1);
}

.number-btn:not(:disabled):active {
  transform: scale(0.95);
}
</style>
