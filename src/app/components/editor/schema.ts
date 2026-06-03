import { Schema, NodeSpec, MarkSpec } from 'prosemirror-model';
import { nodes as defaultNodes, marks as defaultMarks } from 'ngx-editor';

// Utility to convert styles object to string, copied logic from ngx-editor
function toStyleString(styles: Record<string, string | null | undefined>): string {
  return Object.keys(styles)
    .filter((key) => styles[key] != null)
    .map((key) => {
      const kebabKey = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      return `${kebabKey}:${styles[key]};`;
    })
    .join('');
}

// Extend the paragraph node to support 'start' and 'end' alignment
const paragraph: NodeSpec = {
  ...defaultNodes['paragraph'],
  attrs: {
    ...defaultNodes['paragraph'].attrs,
    align: { default: null },
  },
  toDOM(node) {
    const { align, indent } = node.attrs;
    
    // Convert logic to support text-align natively for 'start' and 'end'
    const styles: any = {
      textAlign: align !== 'left' ? align : null,
      marginLeft: indent !== null ? `${indent * 40}px` : null,
    };
    const style = toStyleString(styles) || null;
    const attrs: any = {
      style,
      'data-indent': indent ?? null,
    };
    // Also add direct attribute align for CSS fallback if needed, but style covers it
    if (align) attrs['align'] = align;

    return ['p', attrs, 0];
  },
};

// Extend the heading node to support 'start' and 'end' alignment
const heading: NodeSpec = {
  ...defaultNodes['heading'],
  attrs: {
    ...defaultNodes['heading'].attrs,
    align: { default: null },
  },
  toDOM(node) {
    const { level, align, indent } = node.attrs;
    const styles: any = {
      textAlign: align !== 'left' ? align : null,
      marginLeft: indent !== null ? `${indent * 40}px` : null,
    };
    const style = toStyleString(styles) || null;
    const attrs: any = {
      style,
      'data-indent': indent ?? null,
    };
    if (align) attrs['align'] = align;

    return [`h${level}`, attrs, 0];
  },
};

// Add font_family mark
const fontFamily: MarkSpec = {
  attrs: {
    family: { default: null },
  },
  parseDOM: [
    {
      style: 'font-family',
      getAttrs: (value) => {
        return { family: value };
      },
    },
  ],
  toDOM(mark) {
    const { family } = mark.attrs;
    return ['span', { style: `font-family: ${family}` }, 0];
  },
};

const nodes = {
  ...defaultNodes,
  paragraph,
  heading,
};

const marks = {
  ...defaultMarks,
  font_family: fontFamily,
};

export const schema = new Schema({
  nodes,
  marks,
});
