<template>
  <v-container class="pa-4">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="2">
          <v-card-title class="text-h4 text-center py-6">
            <v-icon size="large" class="mr-3">mdi-information</v-icon>
            About Map Poster Generator
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-6">
            <p class="text-body-1 mb-4">
              Create beautiful, high-quality map posters of any city in the world using
              OpenStreetMap data. Perfect for home decor, gifts, or commemorating special places.
            </p>

            <v-row class="my-6">
              <v-col cols="12" md="4">
                <v-card variant="tonal" color="primary">
                  <v-card-text class="text-center pa-6">
                    <v-icon size="64" color="primary">mdi-palette</v-icon>
                    <h3 class="text-h5 mt-3 mb-2">17+ Themes</h-icon>
                    <p class="text-body-2">
                      From noir to pastel, blueprint to cyberpunk
                    </p>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card variant="tonal" color="success">
                  <v-card-text class="text-center pa-6">
                    <v-icon size="64" color="success">mdi-responsive</v-icon>
                    <h3 class="text-h5 mt-3 mb-2">Flexible</h3>
                    <p class="text-body-2">
                      Vertical or horizontal, any size
                    </p>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card variant="tonal" color="info">
                  <v-card-text class="text-center pa-6">
                    <v-icon size="64" color="info">mdi-earth</v-icon>
                    <h3 class="text-h5 mt-3 mb-2">Any City</h3>
                    <p class="text-body-2">
                      Worldwide coverage via OpenStreetMap
                    </p>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <h2 class="text-h5 mb-3 mt-6">✨ Features</h2>
            <v-list density="comfortable" class="mb-4">
              <v-list-item prepend-icon="mdi-check-circle" title="17+ professional themes">
              </v-list-item>
              <v-list-item prepend-icon="mdi-check-circle" title="Customizable orientations and sizes">
              </v-list-item>
              <v-list-item prepend-icon="mdi-check-circle" title="Direct coordinate input">
              </v-list-item>
              <v-list-item prepend-icon="mdi-check-circle" title="Real-time generation progress">
              </v-list-item>
              <v-list-item prepend-icon="mdi-check-circle" title="High-resolution output (300 DPI)">
              </v-list-item>
              <v-list-item prepend-icon="mdi-check-circle" title="Title positioning control">
              </v-list-item>
              <v-list-item prepend-icon="mdi-check-circle" title="Full borders option">
              </v-list-item>
            </v-list>

            <h2 class="text-h5 mb-3 mt-6">💡 Tips</h2>
            <v-alert type="info" variant="tonal" class="mb-3">
              <strong>Distance Selection:</strong> Smaller distances (4-8km) work best for dense city centers. 
              Larger distances (20-50km) capture entire metropolitan areas.
            </v-alert>
            <v-alert type="info" variant="tonal" class="mb-3">
              <strong>Custom Titles:</strong> Use the custom title field when city names are too long to fit nicely.
            </v-alert>
            <v-alert type="info" variant="tonal" class="mb-3">
              <strong>Full Borders:</strong> Enable "full borders" to remove gradient fades and show edge-to-edge maps.
            </v-alert>
            <v-alert type="info" variant="tonal">
              <strong>Direct Coordinates:</strong> Use coordinates for precise locations or areas not recognized by city name.
            </v-alert>

            <h2 class="text-h5 mb-3 mt-6">🛠️ Technology Stack</h2>
            <v-chip-group>
              <v-chip prepend-icon="mdi-vuejs">Vue 3</v-chip>
              <v-chip prepend-icon="mdi-vuetify">Vuetify 3</v-chip>
              <v-chip prepend-icon="mdi-nodejs">Node.js</v-chip>
              <v-chip prepend-icon="mdi-language-python">Python</v-chip>
              <v-chip prepend-icon="mdi-map">OSMnx</v-chip>
              <v-chip prepend-icon="mdi-chart-line">Matplotlib</v-chip>
            </v-chip-group>

            <h2 class="text-h5 mb-3 mt-6">🙏 Credits</h2>
            <p class="text-body-1 mb-2">
              Map data © <strong>OpenStreetMap</strong> contributors
            </p>
            <p class="text-body-2 text-medium-emphasis">
              This application uses data from OpenStreetMap, which is made available under the 
              Open Database License (ODbL). OpenStreetMap contributors retain copyright over their 
              contributions.
            </p>

            <div class="text-center mt-8">
              <v-btn
                color="primary"
                to="/"
                size="large"
                prepend-icon="mdi-plus"
              >
                Create Your First Poster
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
</script>
