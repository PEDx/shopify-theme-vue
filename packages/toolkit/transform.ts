import type { AttributeNode, NodeTransform, RootNode, TemplateChildNode, TransformContext } from '@vue/compiler-core';
import { createSimpleExpression } from '@vue/compiler-core';
import type { SFCTemplateCompileOptions } from '@vue/compiler-sfc';
import { CompilerDeprecationTypes, NodeTypes } from '@vue/compiler-core';

const LIQUID_TAG_NAME = 'liquid';
const DEFAULT_REPLACEMENT_TAG = 'div';
const DEFAULT_REPLACEMENT_ATTRIBUTE = 'as';

const traverse = (
  node: RootNode | TemplateChildNode,
  context: TransformContext,
  children: TemplateChildNode[],
  index: number,
) => {
  if (node.type === NodeTypes.INTERPOLATION) {
    const rawContent = node.loc.source;

    const textNode = {
      ...node,
      type: NodeTypes.TEXT,
      content: rawContent,
      isStatic: true,
      constType: 3,
    };

    children[index] = textNode as any;
    return;
  }
  if (node.type === NodeTypes.ELEMENT && node.children) {
    node.children.forEach((child, index) => traverse(child, context, node.children, index));
  }
};

export const transformLiquidTag: NodeTransform = (node, context) => {
  if (node.type === NodeTypes.ELEMENT && node.tag === LIQUID_TAG_NAME) {
    // console.log('liquid tag', JSON.stringify(node, null, 1));
    node.tag = DEFAULT_REPLACEMENT_TAG;
    node.props.forEach((prop: AttributeNode) => {
      if (prop.name === DEFAULT_REPLACEMENT_ATTRIBUTE) {
        node.props.splice(node.props.indexOf(prop), 1);
        node.tag = prop.value.content;
      }
    });

    // const loc = node.loc;
    // const innerHTML = createSimpleExpression(`innerHTML`, true, loc);
    // console.log('innerHTML', innerHTML);

    // context.replaceNode(innerHTML as any);

    // node.children.push(innerHTML as any);
    traverse(node, context, node.children, 0);
  }
};

export const compilerOptions: SFCTemplateCompileOptions['compilerOptions'] = {
  isCustomElement: (tag: string) => tag === LIQUID_TAG_NAME,
  nodeTransforms: [transformLiquidTag],
};
