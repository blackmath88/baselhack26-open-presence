import type { IconName } from '../components/aurora/Icon'
export const investigationId = 'schwamm-zitat'
export const actionId = 'zuschreibung-14'
export const shell = {
  workspace: 'Basel Gemeingut',
  pinned: [ ['home', 'Start'], ['search', 'Finden'], ['eye', 'Prüfen'], ['compare', 'Vergleichen'], ['doc', 'PDF Lab'], ['graph', 'Observatory'], ['pin', '+3'] ] as [IconName, string][],
  modes: [['spark', 'Assistent'], ['canvas', 'Canvas'], ['bolt', 'Prüfungen']] as [IconName, string][],
  launcher: [
    {title: 'Plattform', items: [['home', 'Start'], ['search', 'Finden'], ['eye', 'Prüfen'], ['compare', 'Vergleichen'], ['voices', 'Stimmen']] as [IconName, string][]},
    {title: 'Werkzeuge', items: [['doc', 'PDF Lab'], ['graph', 'Observatory'], ['doc', '.phf-Export']] as [IconName, string][]},
    {title: 'Sammlungen', items: [['canvas', 'Schwammstadt-Dossier'], ['canvas', 'Basler Lesungen'], ['canvas', 'Rheinlicht']] as [IconName, string][]},
  ],
}
