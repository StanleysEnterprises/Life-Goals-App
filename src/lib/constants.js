export const PEOPLE = {
  tegan: { id: 'tegan', name: 'Tegan', initial: 'T', tone: 'bg-sage', text: 'text-sage' },
  will: { id: 'will', name: 'Will', initial: 'W', tone: 'bg-taupe', text: 'text-taupe' },
}

export const CATEGORIES = [
  { id: 'personal', label: 'Personal' },
  { id: 'shared', label: 'Shared' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'ventures', label: 'Ventures' },
]

export const TYPES = [
  { id: 'daily', label: 'Daily', section: 'Daily habits' },
  { id: 'weekly', label: 'Weekly', section: 'Weekly targets' },
  { id: 'milestone', label: 'Milestone', section: 'Milestones' },
]

export const categoryLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label ?? 'Personal'
