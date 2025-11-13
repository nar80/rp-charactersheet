<template>
  <q-card>
    <q-card-section>
      <div class="row items-center">
        <div class="col">
          <div class="text-h5">
            <q-icon name="library_books" class="q-mr-sm" />
            Vox-Log
          </div>
          <div class="text-caption text-grey-6">
            Aufzeichnungen, Missionsberichte und wichtige Erkenntnisse
          </div>
        </div>
        <div class="col-auto">
          <q-btn
            color="primary"
            icon="add"
            label="Eintrag hinzufügen"
            @click="showAddNoteDialog = true"
          />
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div v-if="character.notes.length === 0" class="text-center text-grey-6 q-pa-lg">
        <q-icon name="library_books" size="4rem" color="grey-6" />
        <div class="q-mt-md">Keine Vox-Einträge vorhanden</div>
        <div class="text-caption">Klicke auf "Eintrag hinzufügen" um zu beginnen</div>
      </div>

      <div v-else class="q-gutter-md">
        <q-card
          v-for="(note, index) in sortedNotes"
          :key="note.originalIndex"
          bordered
          flat
          class="bg-grey-9"
        >
          <q-card-section>
            <div class="row items-start">
              <div class="col">
                <div class="text-h6">{{ note.title }}</div>
                <div class="text-caption text-grey-6">
                  {{ formatDate(note.date) }}
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
                  @click="editNote(note.originalIndex)"
                >
                  <q-tooltip>Bearbeiten</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  round
                  size="sm"
                  icon="delete"
                  color="negative"
                  @click="removeNote(note.originalIndex)"
                >
                  <q-tooltip>Löschen</q-tooltip>
                </q-btn>
              </div>
            </div>
            <div class="q-mt-sm text-body2" style="white-space: pre-wrap;">{{ note.content }}</div>
          </q-card-section>
        </q-card>
      </div>
    </q-card-section>

    <!-- Add/Edit Note Dialog -->
    <q-dialog v-model="showAddNoteDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ editingNoteIndex !== null ? 'Vox-Eintrag bearbeiten' : 'Vox-Eintrag hinzufügen' }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="newNote.title"
            label="Titel"
            filled
            dense
          />

          <q-input
            v-model="newNote.content"
            label="Inhalt"
            type="textarea"
            filled
            rows="10"
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            flat
            label="Abbrechen"
            color="grey"
            @click="cancelNoteDialog"
          />
          <q-btn
            flat
            :label="editingNoteIndex !== null ? 'Speichern' : 'Hinzufügen'"
            color="primary"
            @click="saveNote"
            :disable="!newNote.title"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCharacterStore } from '../../stores/characterStore'

const characterStore = useCharacterStore()
const { character } = storeToRefs(characterStore)

const showAddNoteDialog = ref(false)
const editingNoteIndex = ref(null)

const newNote = ref({
  title: '',
  content: '',
  date: null
})

// Sort notes by date (newest first)
const sortedNotes = computed(() => {
  const notesWithIndex = character.value.notes.map((note, index) => ({
    ...note,
    originalIndex: index
  }))

  return notesWithIndex.sort((a, b) => {
    const dateA = new Date(a.date || 0)
    const dateB = new Date(b.date || 0)
    return dateB - dateA // Newest first
  })
})

const formatDate = (dateString) => {
  if (!dateString) return 'Kein Datum'

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Ungültiges Datum'

  return date.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const editNote = (index) => {
  editingNoteIndex.value = index
  const note = character.value.notes[index]
  newNote.value = {
    title: note.title,
    content: note.content,
    date: note.date
  }
  showAddNoteDialog.value = true
}

const saveNote = () => {
  if (!newNote.value.title) return

  if (editingNoteIndex.value !== null) {
    // Update existing note, but update the date
    characterStore.updateNote(editingNoteIndex.value, {
      ...newNote.value,
      date: new Date().toISOString()
    })
  } else {
    // Add new note with current date
    characterStore.addNote({
      ...newNote.value,
      date: new Date().toISOString()
    })
  }

  cancelNoteDialog()
}

const removeNote = (index) => {
  characterStore.removeNote(index)
}

const cancelNoteDialog = () => {
  showAddNoteDialog.value = false
  editingNoteIndex.value = null
  newNote.value = {
    title: '',
    content: '',
    date: null
  }
}
</script>
