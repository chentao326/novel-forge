// ============================================================
// Novel Forge - World Layer Templates (Brandon Sanderson's Three-Layer Model)
// ============================================================

export interface LayerTemplate {
  id: string;
  name: string;
  description: string;
  fields: LayerField[];
}

export interface LayerField {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'list';
}

export const PHYSICAL_LAYER: LayerTemplate = {
  id: 'physical',
  name: '物理层',
  description: '世界的物质基础：地理、气候、资源',
  fields: [
    { key: 'geography', label: '地理概况', placeholder: '描述主要大陆、山脉、河流...', type: 'textarea' },
    { key: 'climate', label: '气候特征', placeholder: '不同地区的气候特点...', type: 'textarea' },
    { key: 'flora_fauna', label: '动植物', placeholder: '独特的物种和生态系统...', type: 'textarea' },
    { key: 'resources', label: '自然资源', placeholder: '重要的矿产、能源、材料...', type: 'textarea' },
    { key: 'transportation', label: '交通方式', placeholder: '人们如何出行...', type: 'textarea' },
  ]
}

export const CULTURAL_LAYER: LayerTemplate = {
  id: 'cultural',
  name: '文化/社会层',
  description: '人类社会组织与文化形态',
  fields: [
    { key: 'religion', label: '宗教信仰', placeholder: '主要宗教和信仰体系...', type: 'textarea' },
    { key: 'technology', label: '科技水平', placeholder: '关键技术发明和科技水平...', type: 'textarea' },
    { key: 'language', label: '语言文字', placeholder: '主要语言和方言...', type: 'textarea' },
    { key: 'social_norms', label: '社会规范', placeholder: '重要的社会规则和禁忌...', type: 'textarea' },
    { key: 'class_system', label: '阶级分工', placeholder: '社会阶层和分工方式...', type: 'textarea' },
    { key: 'festivals', label: '节日习俗', placeholder: '重要的节日和传统...', type: 'textarea' },
    { key: 'arts', label: '艺术文化', placeholder: '音乐、绘画、文学等艺术形式...', type: 'textarea' },
  ]
}

export const PHILOSOPHICAL_LAYER: LayerTemplate = {
  id: 'philosophical',
  name: '哲学/理念层',
  description: '世界运作的核心法则与价值观',
  fields: [
    { key: 'core_laws', label: '核心法则', placeholder: '世界运作的基本规则...', type: 'textarea' },
    { key: 'values', label: '价值体系', placeholder: '社会推崇和贬抑的价值观...', type: 'textarea' },
    { key: 'justice', label: '权力与正义', placeholder: '权力如何分配，正义如何定义...', type: 'textarea' },
    { key: 'meaning', label: '生命意义', placeholder: '人们认为生命的意义是什么...', type: 'textarea' },
  ]
}

export const ALL_LAYERS: LayerTemplate[] = [PHYSICAL_LAYER, CULTURAL_LAYER, PHILOSOPHICAL_LAYER];
