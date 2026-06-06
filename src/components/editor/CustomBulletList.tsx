import { BulletList, OrderedList } from '@tiptap/extension-list';

/**
 * CustomBulletList — extends the default BulletList to allow a `style`
 * attribute in the ProseMirror schema. Without this, setNodeMarkup /
 * updateAttributes silently drops the `style` attr because it isn't
 * declared as an allowed attribute in the node spec.
 *
 * This makes toolbar style changes (disc / circle / square) actually persist.
 */
export const CustomBulletList = BulletList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('style') || null,
        renderHTML: (attributes: Record<string, string>) => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },
});

/**
 * CustomOrderedList — same as above but for ordered lists.
 * Makes toolbar style changes (decimal / alpha / roman) persist.
 */
export const CustomOrderedList = OrderedList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('style') || null,
        renderHTML: (attributes: Record<string, string>) => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },
});
