/**
 * Utility functions
 */

/**
 * Format date to locale string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

/**
 * Format time from timestamp
 * @param {number} timestamp - Timestamp in milliseconds
 * @returns {string} Formatted time string
 */
export const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString()
}

/**
 * Validate coordinates format
 * @param {string} coords - Coordinates string
 * @returns {boolean} Is valid
 */
export const validateCoordinates = (coords) => {
  if (!coords) return false
  const regex = /^-?\d+\.?\d*,-?\d+\.?\d*$/
  return regex.test(coords)
}

/**
 * Example cities for quick loading
 */
export const exampleCities = [
  { 
    city: 'Tokyo', 
    country: 'Japan', 
    theme: 'japanese_ink', 
    distance: 45000, 
    orientation: 'horizontal' 
  },
  { 
    city: 'Paris', 
    country: 'France', 
    theme: 'pastel_dream', 
    distance: 15000, 
    orientation: 'vertical' 
  },
  { 
    city: 'New York', 
    country: 'USA', 
    theme: 'noir', 
    distance: 20000, 
    orientation: 'vertical' 
  },
  { 
    city: 'Venice', 
    country: 'Italy', 
    theme: 'blueprint', 
    distance: 6000, 
    orientation: 'vertical' 
  },
  { 
    city: 'Barcelona', 
    country: 'Spain', 
    theme: 'warm_beige', 
    distance: 12000, 
    orientation: 'horizontal' 
  }
]

/**
 * Get random example city
 * @returns {Object} Example city configuration
 */
export const getRandomExample = () => {
  return exampleCities[Math.floor(Math.random() * exampleCities.length)]
}

/**
 * Title position options
 */
export const titlePositions = [
  { title: 'Top Left', value: 'top-left' },
  { title: 'Top Center', value: 'top-center' },
  { title: 'Top Right', value: 'top-right' },
  { title: 'Bottom Left', value: 'bottom-left' },
  { title: 'Bottom Center', value: 'bottom-center' },
  { title: 'Bottom Right', value: 'bottom-right' }
]

/**
 * Default city per UI language — shown when the user first opens the form
 * or switches language.
 */
export const LOCALE_CITY_DEFAULTS = {
  en: { city: 'London',  country: 'United Kingdom', lat: 51.5074, lng: -0.1278, zoom: 12 },
  es: { city: 'Madrid',  country: 'España',          lat: 40.4168, lng: -3.7038, zoom: 12 },
  pt: { city: 'Lisboa',  country: 'Portugal',         lat: 38.7169, lng: -9.1399, zoom: 13 },
  fr: { city: 'Paris',   country: 'France',           lat: 48.8566, lng:  2.3522, zoom: 12 },
  de: { city: 'Berlin',  country: 'Deutschland',      lat: 52.5200, lng: 13.4050, zoom: 12 },
}

/**
 * Default form values
 */
export const defaultFormValues = {
  city: 'London',
  country: 'United Kingdom',
  coords: '',
  title: '',
  subtitle: '',
  theme: 'feature_based',
  distance: 29000,
  orientation: 'vertical',
  titlePos: 'bottom-center',
  fullBorders: false
}
