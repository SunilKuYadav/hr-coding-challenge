import { TREE_HELPERS } from './trees';
import { LINKED_LIST_HELPERS } from './linkedLists';
import { GRAPH_HELPERS } from './graphs';
import { MATRIX_HELPERS } from './matrices';

const HELPER_REGISTRY: Record<string, string> = {
  'Trees': TREE_HELPERS,
  'Binary Trees': TREE_HELPERS,
  'Linked Lists': LINKED_LIST_HELPERS,
  'Graphs': GRAPH_HELPERS,
  'Matrices': MATRIX_HELPERS,
};

export function getCategoryHelpers(category: string, _language: string): string {
  if (Object.prototype.hasOwnProperty.call(HELPER_REGISTRY, category)) {
    return HELPER_REGISTRY[category];
  }
  return '';
}
