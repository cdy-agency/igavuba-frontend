import { Node, mergeAttributes, type CommandProps } from '@tiptap/core';
import type { NodeViewRendererProps } from '@tiptap/core';

export interface VideoAttributes {
  src: string | null;
  title?: string;
  width?: string | number | null;
  height?: string | number | null;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: VideoAttributes) => ReturnType;
    };
  }
}

/**
 * Detects if a URL is an external video platform (YouTube/Vimeo) and returns
 * the corresponding embed URL. Returns null for direct video file URLs.
 */
function getEmbedUrl(url: string): string | null {
  for (const pattern of [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ]) {
    const m = url.match(pattern);
    if (m?.[1]) return `https://www.youtube.com/embed/${m[1]}`;
  }
  for (const pattern of [/vimeo\.com\/(\d+)/, /player\.vimeo\.com\/video\/(\d+)/]) {
    const m = url.match(pattern);
    if (m?.[1]) return `https://player.vimeo.com/video/${m[1]}`;
  }
  return null;
}

export const Video = Node.create({
  name: 'video',
  group: 'block',
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      title: { default: 'Video' },
      width: { default: null },
      height: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'video' }, { tag: 'div[data-type="video"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = HTMLAttributes as VideoAttributes & Record<string, unknown>;
    const src = (attrs.src as string) ?? '';
    const embedUrl = getEmbedUrl(src);

    if (embedUrl) {
      return [
        'div',
        { class: 'video-wrapper', 'data-type': 'video' },
        [
          'iframe',
          {
            src: embedUrl,
            'data-original-src': src,
            frameborder: '0',
            allowfullscreen: 'true',
            allow:
              'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
            style: 'width: 100%; aspect-ratio: 16/9; border-radius: 0.5rem;',
          },
        ],
      ];
    }

    return [
      'div',
      { class: 'video-wrapper', 'data-type': 'video' },
      [
        'video',
        mergeAttributes(attrs, {
          controls: true,
          style: attrs.width
            ? `width: ${attrs.width}; height: auto;`
            : 'width: 100%; height: auto;',
        }),
      ],
    ];
  },

  addCommands() {
    return {
      setVideo:
        (options: VideoAttributes) =>
        ({ commands }: CommandProps) =>
          commands.insertContent({
            type: this.name,
            attrs: options,
          }),
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-v': () => this.editor.commands.setVideo({ src: '' }),
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }: NodeViewRendererProps) => {
      const attrs = node.attrs as VideoAttributes;
      const src = attrs.src ?? '';
      const embedUrl = getEmbedUrl(src);

      const container = document.createElement('div');
      container.className = 'video-node';
      container.style.position = 'relative';
      container.style.marginBottom = '1rem';

      let mediaEl: HTMLVideoElement | HTMLIFrameElement;

      if (embedUrl) {
        // YouTube / Vimeo → render as iframe
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.setAttribute(
          'allow',
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        );
        iframe.style.width = '100%';
        iframe.style.aspectRatio = '16/9';
        iframe.style.borderRadius = '0.5rem';
        iframe.style.border = '1px solid var(--border)';
        mediaEl = iframe;
      } else {
        // Direct video file → render as <video>
        const video = document.createElement('video');
        video.src = src;
        video.controls = true;
        video.style.width = '100%';
        video.style.height = 'auto';
        video.style.borderRadius = '0.5rem';
        video.style.border = '1px solid var(--border)';
        video.style.cursor = 'pointer';
        video.title = attrs.title ?? 'Video';
        mediaEl = video;
      }

      container.appendChild(mediaEl);

      if (editor.isEditable) {
        const deleteBtn = document.createElement('button');

        deleteBtn.innerHTML = '×';
        deleteBtn.style.position = 'absolute';
        deleteBtn.style.top = '0.5rem';
        deleteBtn.style.right = '0.5rem';
        deleteBtn.style.width = '2rem';
        deleteBtn.style.height = '2rem';
        deleteBtn.style.borderRadius = '0.25rem';
        deleteBtn.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
        deleteBtn.style.color = 'white';
        deleteBtn.style.border = 'none';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.fontSize = '1.5rem';
        deleteBtn.style.display = 'flex';
        deleteBtn.style.alignItems = 'center';
        deleteBtn.style.justifyContent = 'center';
        deleteBtn.style.zIndex = '10';

        deleteBtn.addEventListener('click', () => {
          const pos = typeof getPos === 'function' ? getPos() : undefined;
          if (pos == null) return;

          editor
            .chain()
            .focus()
            .deleteRange({ from: pos, to: pos + node.nodeSize })
            .run();
        });

        container.appendChild(deleteBtn);
      }

      return {
        dom: container,
        contentDOM: null,

        selectNode: () => {
          mediaEl.style.border = '2px solid var(--primary)';
        },

        deselectNode: () => {
          mediaEl.style.border = '1px solid var(--border)';
        },

        update: (newNode) => {
          if (newNode.type.name !== 'video') return false;

          const newAttrs = newNode.attrs as VideoAttributes;
          const newSrc = newAttrs.src ?? '';
          const newEmbedUrl = getEmbedUrl(newSrc);

          if (mediaEl instanceof HTMLIFrameElement && newEmbedUrl) {
            mediaEl.src = newEmbedUrl;
          } else if (mediaEl instanceof HTMLVideoElement && !newEmbedUrl) {
            mediaEl.src = newSrc;
            mediaEl.title = newAttrs.title ?? 'Video';
          } else {
            // Type changed (e.g. from direct to YouTube) — force full re-render
            return false;
          }

          return true;
        },

        destroy: () => {
          container.remove();
        },
      };
    };
  },
});
