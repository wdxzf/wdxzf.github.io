import {visit} from "unist-util-visit";

export function remarkHtml() {
  const transformer = (tree) => {
    visit(tree, (node, index, parent) => {
      if (!parent || index === undefined) {
        return;
      }
      if (node.type !== 'textDirective') {
        return;
      }
      if (node.name === 'i') {
        node.data = {
          hName: node.name,
          hProperties: {
            ...node.attributes,
          },
        };
        return;
      }

      if (node.name !== 'spoiler') {
        return;
      }

      const attributes = node.attributes || {};
      const className = ['spoiler-text', attributes.class].filter(Boolean).join(' ');

      node.data = {
        hName: 'span',
        hProperties: {
          ...attributes,
          className,
          role: 'button',
          tabindex: 0,
          'data-spoiler': '',
          'data-revealed': 'false',
          'aria-pressed': 'false',
          'aria-label': attributes['aria-label'] || 'Hover or click to reveal hidden text',
        },
      };
    });
  };
  return () => transformer;
}
