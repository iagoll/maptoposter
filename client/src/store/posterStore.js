import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiService from '../services/api'
import sseService from '../services/sseService'
import { defaultFormValues } from '../services/utils'

export const usePosterStore = defineStore('poster', () => {
  // State
  const formData = ref({ ...defaultFormValues })
  const useCoordinates = ref(false)
  const formValid = ref(false)
  
  // Generation state
  const generating = ref(false)
  const jobId = ref(null)
  const jobStatus = ref('idle')
  const logs = ref([])
  const showTerminal = ref(false)
  
  // Results
  const generatedPoster = ref(null)
  
  // Themes
  const themes = ref([])
  const loadingThemes = ref(false)
  
  // Posters gallery
  const posters = ref([])
  const loadingPosters = ref(false)
  
  // UI state
  const snackbar = ref({
    show: false,
    message: '',
    color: 'info',
    timeout: 3000
  })

  // Computed
  const statusColor = computed(() => {
    switch (jobStatus.value) {
      case 'running': return 'info'
      case 'completed': return 'success'
      case 'failed': return 'error'
      default: return 'default'
    }
  })

  // Actions
  const loadThemes = async () => {
    loadingThemes.value = true
    try {
      themes.value = await apiService.getThemes()
    } catch (error) {
      showSnackbar('Failed to load themes', 'error')
      console.error('Error loading themes:', error)
    } finally {
      loadingThemes.value = false
    }
  }

  const loadPosters = async () => {
    loadingPosters.value = true
    try {
      posters.value = await apiService.getPosters()
    } catch (error) {
      console.error('Error loading posters:', error)
    } finally {
      loadingPosters.value = false
    }
  }

  const generatePoster = async () => {
    generating.value = true
    showTerminal.value = true
    logs.value = []
    generatedPoster.value = null
    jobStatus.value = 'running'

    try {
      // Prepare request body
      const requestBody = {
        country: formData.value.country,
        theme: formData.value.theme,
        distance: formData.value.distance,
        orientation: formData.value.orientation,
        titlePos: formData.value.titlePos,
        fullBorders: formData.value.fullBorders
      }

      if (useCoordinates.value) {
        requestBody.coords = formData.value.coords
        if (formData.value.title) {
          requestBody.title = formData.value.title
        }
      } else {
        requestBody.city = formData.value.city
        if (formData.value.title) {
          requestBody.title = formData.value.title
        }
      }

      // Start generation
      const response = await apiService.generatePoster(requestBody)
      jobId.value = response.jobId

      showSnackbar('Generation started! Connecting to live logs...', 'info')

      // Connect to SSE for real-time logs
      connectToLogs(jobId.value)

    } catch (error) {
      generating.value = false
      jobStatus.value = 'failed'
      showSnackbar(error.response?.data?.error || 'Failed to start generation', 'error')
      console.error('Error generating poster:', error)
    }
  }

  const connectToLogs = (id) => {
    const logsUrl = apiService.getLogsUrl(id)

    sseService.connect(logsUrl, {
      onMessage: (log) => {
        logs.value.push(log)
      },
      onComplete: (data) => {
        jobStatus.value = data.status
        generating.value = false

        if (data.status === 'completed' && data.result) {
          generatedPoster.value = data.result
          showSnackbar('Poster generated successfully! 🎉', 'success')
          loadPosters() // Refresh posters list
        } else {
          showSnackbar('Generation failed. Check logs for details.', 'error')
        }
      },
      onError: (error) => {
        jobStatus.value = 'failed'
        generating.value = false
        showSnackbar('Generation error: ' + (error.message || 'Unknown error'), 'error')
      }
    })
  }

  const resetForm = () => {
    formData.value = { ...defaultFormValues }
    useCoordinates.value = false
    showSnackbar('Form reset', 'info')
  }

  const viewPoster = (poster) => {
    generatedPoster.value = poster
    showTerminal.value = false
  }

  const showSnackbar = (message, color = 'info', timeout = 3000) => {
    snackbar.value = {
      show: true,
      message,
      color,
      timeout
    }
  }

  const closeSnackbar = () => {
    snackbar.value.show = false
  }

  return {
    // State
    formData,
    useCoordinates,
    formValid,
    generating,
    jobId,
    jobStatus,
    logs,
    showTerminal,
    generatedPoster,
    themes,
    loadingThemes,
    posters,
    loadingPosters,
    snackbar,
    
    // Computed
    statusColor,
    
    // Actions
    loadThemes,
    loadPosters,
    generatePoster,
    resetForm,
    viewPoster,
    showSnackbar,
    closeSnackbar
  }
})
