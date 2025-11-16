import type { IPTCField } from './types'

interface Category {
  title: string
  rows: Array<Array<{
    key: IPTCField['key']
    width?: number
  }>>
}

export const categories: Category[] = [
  {
    title: 'Description & Textual Content',
    rows: [[{ key: '2:105' }], [{ key: '2:120' }]],
  },
  {
    title: 'Credits, Authors & Rights',
    rows: [[{ key: '2:85' }, { key: '2:80' }], [{ key: '2:122' }, { key: '2:110' }, { key: '2:115' }], [{ key: '2:116' }], [{ key: '2:118' }]],
  },
  {
    title: 'Content & Origin Locations',
    rows: [[{ key: '2:27', width: 66 }, { key: '2:26', width: 33 }], [{ key: '2:90' }, { key: '2:92' }, { key: '2:95' }]],
  },
  {
    title: 'Lifecycle & Creation Times',
    rows: [[{ key: '2:30' }, { key: '2:35' }], [{ key: '2:37' }, { key: '2:38' }], [{ key: '2:55' }, { key: '2:60' }], [{ key: '2:62' }, { key: '2:63' }]],
  },
  {
    title: 'Subject & Clarification',
    rows: [[{ key: '2:12' }], [{ key: '2:15' }, { key: '2:20' }], [{ key: '2:25' }]],
  },
  {
    title: 'Object Identification & Structure',
    rows: [[{ key: '2:03' }, { key: '2:04' }], [{ key: '2:05' }], [{ key: '2:22' }, { key: '2:75' }], [{ key: '2:131' }, { key: '2:135' }]],
  },
  {
    title: 'Editorial Workflow & Status',
    rows: [[{ key: '2:07' }, { key: '2:10' }], [{ key: '2:08' }, { key: '2:42' }], [{ key: '2:40' }]],
  },
  {
    title: 'Reference & Administrative Metadata',
    rows: [[{ key: '2:45' }, { key: '2:47' }], [{ key: '2:50' }, { key: '2:103' }]],
  },
]
