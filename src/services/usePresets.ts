import { ref, onMounted } from 'vue';
import type { Preset } from '@/types/preset';

const presets = ref<Preset[]>([]);
const isLoading = ref(true);

export function usePresets() {
  const loadPresets = async () => {
    if (presets.value.length > 0) {
      isLoading.value = false;
      return; // Already loaded
    }

    // This is the Vite magic. It finds all .ts files in /src/presets/
    const presetModules = import.meta.glob('/src/presets/*.ts');
    
    const loadedPresets: Preset[] = [];
    for (const path in presetModules) {
      const module = await presetModules[path]();
      loadedPresets.push(module.default as Preset);
    }
    
    presets.value = loadedPresets.sort((a, b) => a.name.localeCompare(b.name));
    isLoading.value = false;
  };

  onMounted(loadPresets);

  return { presets, isLoading };
}