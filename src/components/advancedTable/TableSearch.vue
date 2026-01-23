<template>
    <div class="position-relative">
      <div class="input-group">
        <span class="input-group-text">
          <i class="fas fa-search"></i>
        </span>
        <input
          v-model="localSearch"
          type="text"
          class="form-control"
          :placeholder="placeholder"
          @input="handleInput"
          @keyup.enter="handleSearch"
        />
        <button
          v-if="localSearch"
          class="btn btn-outline-secondary"
          type="button"
          @click="clearSearch"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
  
const props = defineProps({
    modelValue: String,
    placeholder: {
      type: String,
      default: 'Rechercher...'
    },
    debounce: {
      type: Number,
      default: 500
    }
})
  
const emit = defineEmits(['update:modelValue', 'search'])
  
const localSearch = ref(props.modelValue || '')
let debounceTimer = null
  
const handleInput = () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      emit('update:modelValue', localSearch.value)
      emit('search', localSearch.value)
    }, props.debounce)
}
  
const handleSearch = () => {
    clearTimeout(debounceTimer)
    emit('update:modelValue', localSearch.value)
    emit('search', localSearch.value)
}
  
const clearSearch = () => {
    localSearch.value = ''
    emit('update:modelValue', '')
    emit('search', '')
}
  
watch(() => props.modelValue, (newValue) => {
    localSearch.value = newValue || ''
})
</script>