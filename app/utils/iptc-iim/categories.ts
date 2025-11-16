import type { IPTCField } from './types'

interface Category {
  title: string
  rows: Array<Array<IPTCField['key']>>
}

export const categories: Category[] = [
  {
    title: 'Description & Textual Content',
    rows: [['2:105'], ['2:120']],
  },
  {
    title: 'Credits, Authors & Rights',
    rows: [['2:85', '2:80'], ['2:122', '2:110', '2:115'], ['2:116'], ['2:118']],
  },
  {
    title: 'Content & Origin Locations',
    rows: [['2:26', '2:27'], ['2:90', '2:92', '2:95']],
  },
  {
    title: 'Lifecycle & Creation Times',
    rows: [['2:30', '2:35'], ['2:37', '2:38'], ['2:55', '2:60'], ['2:62', '2:63']],
  },
  {
    title: 'Subject & Clarification',
    rows: [['2:12'], ['2:15', '2:20'], ['2:25']],
  },
  {
    title: 'Object Identification & Structure',
    rows: [['2:03', '2:04'], ['2:05'], ['2:22', '2:75'], ['2:131', '2:135']],
  },
  {
    title: 'Editorial Workflow & Status',
    rows: [['2:07', '2:10'], ['2:08', '2:42'], ['2:40']],
  },
  {
    title: 'Reference & Administrative Metadata',
    rows: [['2:45', '2:47'], ['2:50', '2:103']],
  },
]
