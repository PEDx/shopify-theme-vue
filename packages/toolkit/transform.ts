import type { AttributeNode, NodeTransform } from '@vue/compiler-core';
import { createSimpleExpression } from '@vue/compiler-core';
import type { SFCTemplateCompileOptions } from '@vue/compiler-sfc';
import { NodeTypes } from '@vue/compiler-core';

const LIQUID_TAG_NAME = 'liquid';
const LIQUID_ATTRIBUTE_NAME = 'liquid';
const TAG_ATTRIBUTE_NAME = 'tag';
const DEFAULT_WRAP_TAG_NAME = 'div';

export const transformLiquidTag: NodeTransform = (node) => {
  if (node.type === NodeTypes.ELEMENT) {
    /**
     * <liquid> 标签的转换
     */
    if (node.tag === LIQUID_TAG_NAME) {
      const rawContent = node.children.map((child) => child.loc.source).join('');

      node.tag = DEFAULT_WRAP_TAG_NAME;

      node.props.forEach((prop: AttributeNode) => {
        if (prop.name === TAG_ATTRIBUTE_NAME) {
          node.tag = prop.value.content;
          node.props.splice(node.props.indexOf(prop), 1);
        }
      });

      node.children = [];
      node.props.push({
        type: NodeTypes.DIRECTIVE,
        name: 'html',
        rawName: `v-html`,
        loc: node.loc,
        exp: createSimpleExpression(rawContent, true, node.loc),
        arg: undefined,
        modifiers: [],
      });
    }

    /**
     * liquid="{{ section.settings.title | upcase }}" 属性的转换
     */
    if (node.props.some((prop) => prop.name === LIQUID_ATTRIBUTE_NAME)) {
      const liquidAttribute = node.props.find((prop) => prop.name === LIQUID_ATTRIBUTE_NAME) as AttributeNode;
      const liquidContent = liquidAttribute.value.content;

      node.props.splice(node.props.indexOf(liquidAttribute), 1);

      node.props.push({
        type: NodeTypes.DIRECTIVE,
        name: 'html',
        rawName: `v-html`,
        loc: node.loc,
        exp: createSimpleExpression(liquidContent, true, node.loc),
        arg: undefined,
        modifiers: [],
      });
    }
  }
};

export const compilerOptions: SFCTemplateCompileOptions['compilerOptions'] = {
  nodeTransforms: [transformLiquidTag],
  isCustomElement: (tag) => tag === LIQUID_TAG_NAME,
};
