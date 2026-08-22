import { create } from 'zustand';

const useTripBuilderStore = create((set, get) => ({
  trip: null,
  sections: [],
  isDirty: false,

  setTrip: (trip) => set({ trip }),

  setSections: (sections) => set({ sections, isDirty: false }),

  addSection: () => {
    const sections = get().sections;
    const newSection = {
      tempId: Date.now(),
      id: null,
      cityId: null,
      cityName: '',
      startDate: '',
      endDate: '',
      budget: '',
      order: sections.length,
      activities: [],
    };
    set({ sections: [...sections, newSection], isDirty: true });
  },

  updateSection: (index, data) => {
    const sections = [...get().sections];
    sections[index] = { ...sections[index], ...data };
    set({ sections, isDirty: true });
  },

  removeSection: (index) => {
    const sections = get().sections.filter((_, i) => i !== index);
    set({ sections: sections.map((s, i) => ({ ...s, order: i })), isDirty: true });
  },

  reorderSections: (newSections) => {
    set({ sections: newSections.map((s, i) => ({ ...s, order: i })), isDirty: true });
  },

  addActivityToSection: (sectionIndex, activity) => {
    const sections = [...get().sections];
    sections[sectionIndex] = {
      ...sections[sectionIndex],
      activities: [...sections[sectionIndex].activities, activity],
    };
    set({ sections, isDirty: true });
  },

  removeActivityFromSection: (sectionIndex, activityIndex) => {
    const sections = [...get().sections];
    sections[sectionIndex] = {
      ...sections[sectionIndex],
      activities: sections[sectionIndex].activities.filter((_, i) => i !== activityIndex),
    };
    set({ sections, isDirty: true });
  },

  reset: () => set({ trip: null, sections: [], isDirty: false }),
}));

export default useTripBuilderStore;
