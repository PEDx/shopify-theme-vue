import type { NodeTransform } from '@vue/compiler-core';
import { NodeTypes } from '@vue/compiler-core';


export const transformLiquidTag: NodeTransform = (node, context) => {
  if (node.type === NodeTypes.ELEMENT && node.tag === 'liquid') {
    const rawContent = node.children.map((child) => child.loc.source).join('');

    const textNode = {
      ...node.children[0],
      type: NodeTypes.TEXT,
      content: rawContent,
    };
    context.replaceNode(textNode as any);
  }
};

export const compilerOptions = {
  isCustomElement: (tag: string) => tag === 'liquid',
  nodeTransforms: [transformLiquidTag],
};
