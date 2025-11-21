import { ref, onMounted } from 'vue';
import type { Preset } from '@/types/preset';

const presets = ref<Preset[]>([]);
const isLoading = ref(true);

export function usePresets() {
  const loadPresets = async () => {
    if (presets.value.length > 0) {
      isLoading.value = false;
      return;
    }

    const presetModules = import.meta.glob('/src/presets/*.ts');
    
    const loadedPresets: Preset[] = [];
    for (const path in presetModules) {
      const moduleLoader = presetModules[path];

      if (moduleLoader) {
        const module = await moduleLoader();
        
        // --- THE FIX IS HERE ---
        // 1. First, check if the module is a non-null object.
        if (typeof module === 'object' && module !== null && 'default' in module) {
          // 2. Now that TypeScript knows `module` is an object with a `default` property,
          //    it's safe to access and cast it.
          loadedPresets.push(module.default as Preset);
        }
      }
    }
    
    presets.value = loadedPresets.sort((a, b) => a.name.localeCompare(b.name));
    isLoading.value = false;
  };

  onMounted(loadPresets);

  return { presets, isLoading };
}