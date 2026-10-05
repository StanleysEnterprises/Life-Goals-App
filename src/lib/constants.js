export const PEOPLE = {
  tegan: { id: 'tegan', name: 'Tegan', initial: 'T', tone: 'bg-yellow', soft: 'bg-yellow-soft', mark: 'decoration-yellow' },
  will: { id: 'will', name: 'Will', initial: 'W', tone: 'bg-blue', soft: 'bg-blue-soft', mark: 'decoration-blue' },
}

// Each category gets its own little splash of colour
export const CATEGORIES = [
  { id: 'personal', label: 'Personal', dot: 'bg-blue', chip: 'bg-blue-soft' },
  { id: 'shared', label: 'Shared', dot: 'bg-pink', chip: 'bg-pink-soft' },
  { id: 'wellness', label: 'Wellness', dot: 'bg-mint', chip: 'bg-mint-soft' },
  { id: 'ventures', label: 'Ventures', dot: 'bg-yellow', chip: 'bg-yellow-soft' },
]

export const TYPES = [
  { id: 'daily', label: 'Daily', section: 'Daily habits' },
  { id: 'weekly', label: 'Weekly', section: 'Weekly targets' },
  { id: 'milestone', label: 'Milestone', section: 'Milestones' },
]

export const category = (id) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0]
export const categoryLabel = (id) => category(id).label
