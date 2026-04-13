import type { LocaleKeys } from '../../../i18n/en';

type Translate = (key: LocaleKeys, vars?: Record<string, string>) => string;

export function getSearchEngines(t: Translate) {
  return [
    { id: 'google', label: t('option.search.google') },
    { id: 'bing', label: t('option.search.bing') },
    { id: 'baidu', label: t('option.search.baidu') },
    { id: 'duckduckgo', label: t('option.search.duckduckgo') },
  ];
}

export function getBackgroundFitOptions(t: Translate) {
  return [
    { id: 'cover', label: t('option.fit.cover') },
    { id: 'contain', label: t('option.fit.contain') },
    { id: 'center', label: t('option.fit.center') },
    { id: 'stretch', label: t('option.fit.stretch') },
  ];
}

export function getFontWeightOptions(t: Translate) {
  return [
    { id: 'light', label: t('option.weight.light') },
    { id: 'normal', label: t('option.weight.normal') },
    { id: 'bold', label: t('option.weight.bold') },
  ];
}

export function getColumnsOptions(t: Translate) {
  return [
    { id: 'auto', label: t('option.shape.auto') },
    { id: '2', label: '2' },
    { id: '3', label: '3' },
    { id: '4', label: '4' },
    { id: '5', label: '5' },
    { id: '6', label: '6' },
  ];
}

export function getBorderStyleOptions(t: Translate) {
  return [
    { id: 'none', label: t('option.border.none') },
    { id: 'solid', label: t('option.border.solid') },
    { id: 'dashed', label: t('option.border.dashed') },
    { id: 'double', label: t('option.border.double') },
  ];
}

export function getShapeOptions(t: Translate) {
  return [
    { id: 'auto', label: t('option.shape.auto') },
    { id: 'square', label: t('option.shape.square') },
    { id: 'circle', label: t('option.shape.circle') },
  ];
}

export function getFontFamilyOptions(t: Translate) {
  return [
    { id: 'system', label: t('option.font.system') },
    { id: 'serif', label: t('option.font.serif') },
    { id: 'mono', label: t('option.font.mono') },
  ];
}
