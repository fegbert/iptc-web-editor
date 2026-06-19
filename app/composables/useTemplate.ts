import type { TemplateIdb, TemplateIdbCreateInput } from '~/shared/types'

const TEMPLATES_IDB_KEY = 'iptc-templates'

const templates = ref<TemplateIdb[]>([])

export default function useTemplate() {
  async function loadTemplatesFromIndexedDB() {
    if (import.meta.env.SSR) {
      return
    }

    const idbTemplates = await loadFromIdb<TemplateIdb[]>(TEMPLATES_IDB_KEY, [])
    templates.value = idbTemplates ?? []
  }

  async function createTemplate(template: TemplateIdbCreateInput) {
    templates.value.push({
      id: crypto.randomUUID(),
      ...template,
    })
  }

  async function updateTemplate(updatedTemplate: Partial<TemplateIdb> & { id: string }) {
    const existingTemplate = templates.value.find(template => template.id === updatedTemplate.id)
    if (!existingTemplate) {
      throw new Error('Template could not be found')
    }

    const updated = Object.assign(existingTemplate, updatedTemplate)
    templates.value = templates.value.map(template => template.id === updated.id ? updated : template)
  }

  async function deleteTemplate(templateId: string) {
    templates.value = templates.value.filter(template => template.id !== templateId)
  }

  return { loadTemplatesFromIndexedDB, templates, createTemplate, updateTemplate, deleteTemplate }
}
