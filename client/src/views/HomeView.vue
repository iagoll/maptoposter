<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// HomeView is superseded by LandingView — redirect transparently
onMounted(() => router.replace('/'))
</script>
