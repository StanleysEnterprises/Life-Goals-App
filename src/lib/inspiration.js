import { dayNumber } from './dates'

export const QUOTES = [
  { text: 'A journey of a thousand miles begins with a single step.', by: 'Lao Tzu' },
  { text: 'How we spend our days is, of course, how we spend our lives.', by: 'Annie Dillard' },
  { text: 'First say to yourself what you would be; and then do what you have to do.', by: 'Epictetus' },
  { text: 'The impediment to action advances action. What stands in the way becomes the way.', by: 'Marcus Aurelius' },
  { text: 'It is not that we have a short time to live, but that we waste a lot of it.', by: 'Seneca' },
  { text: 'You do not rise to the level of your goals. You fall to the level of your systems.', by: 'James Clear' },
  { text: 'Well begun is half done.', by: 'Aristotle' },
  { text: 'The creation of a thousand forests is in one acorn.', by: 'Ralph Waldo Emerson' },
  { text: 'Waste no more time arguing about what a good man should be. Be one.', by: 'Marcus Aurelius' },
  { text: 'How wonderful it is that nobody need wait a single moment before starting to improve the world.', by: 'Anne Frank' },
  { text: 'Write it on your heart that every day is the best day in the year.', by: 'Ralph Waldo Emerson' },
  { text: 'No man is free who is not master of himself.', by: 'Epictetus' },
]

// Small daily nudges — the "inspiration" card
export const PROMPTS = [
  'Do one small thing slowly and well.',
  'Leave one space tidier than you found it.',
  'Choose the version of today you’ll be glad you lived.',
  'Notice one thing you’re grateful for before noon.',
  'Move your body somewhere with a view.',
  'Finish something you started.',
  'Send a kind message to someone who’d least expect it.',
  'Protect one quiet hour for yourself.',
  'Make the next step smaller, then take it.',
  'Drink the water. Take the walk. Go to bed early.',
  'Say no to one thing so you can say yes to another.',
  'Be a little braver than yesterday.',
  'Cook something with care tonight.',
  'Put your phone down for the first hour.',
]

// Same pick all day on both phones; Tegan and Will get different ones
const pick = (list, day, person) => list[(dayNumber(day) + (person === 'will' ? 5 : 0)) % list.length]

export const quoteFor = (day, person) => pick(QUOTES, day, person)
export const promptFor = (day, person) => pick(PROMPTS, day, person)
