import { getVideoEmbedUrl, isEmbeddableVideoUrl } from '@/lib/video-utils';
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

function parseVideoSrc(element: HTMLElement): string | null {
  const dataSrc = element.getAttribute('data-src');
  if (dataSrc) return dataSrc;

  const iframe = element.querySelector('iframe');
  const original =
    iframe?.getAttribute('data-original-src') || iframe?.getAttribute('src');
  if (original) return original;

  const video = element.querySelector('video');
  const videoSrc = video?.getAttribute('src');
  if (videoSrc) return videoSrc;

  return element.getAttribute('src');
}

function applyIframeAttrs(iframe: HTMLIFrameElement, embedUrl: string, title: string) {
  iframe.setAttribute('src', embedUrl);
  iframe.setAttribute('data-original-src', embedUrl);
  iframe.title = title;
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allowfullscreen', 'true');
  iframe.setAttribute('loading', 'eager');
  iframe.setAttribute(
    'allow',
    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
  );
  iframe.style.width = '100%';
  iframe.style.aspectRatio = '16/9';
  iframe.style.borderRadius = '0.5rem';
  iframe.style.border = '1px solid var(--border)';
}

export const Video = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element: HTMLElement) => parseVideoSrc(element),
      },
      title: {
        default: 'Video',
        parseHTML: (element: HTMLElement) =>
          element.getAttribute('data-title') ||
          element.querySelector('video')?.getAttribute('title') ||
          'Video',
      },
      width: { default: null },
      height: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'video' }, { tag: 'div[data-type="video"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = HTMLAttributes as VideoAttributes & Record<string, unknown>;
    const src = ((attrs.src as string) ?? '').trim();
    const title = (attrs.title as string) || 'Video';
    const wrapperAttrs = {
      class: 'video-wrapper',
      'data-type': 'video',
      'data-src': src,
      'data-title': title,
    };

    if (src && isEmbeddableVideoUrl(src)) {
      return [
        'div',
        wrapperAttrs,
        [
          'iframe',
          {
            src: getVideoEmbedUrl(src),
            'data-original-src': src,
            title,
            loading: 'eager',
            frameborder: '0',
            allowfullscreen: 'true',
            allow:
              'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
            style: 'width: 100%; aspect-ratio: 16/9; border-radius: 0.5rem;',
          },
        ],
      ];
    }

    return [
      'div',
      wrapperAttrs,
      [
        'video',
        mergeAttributes({
          src,
          title,
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
      const src = (attrs.src ?? '').trim();
      const useEmbed = Boolean(src && isEmbeddableVideoUrl(src));
      const embedUrl = useEmbed ? getVideoEmbedUrl(src) : null;

      const container = document.createElement('div');
      container.className = 'video-node';
      container.setAttribute('data-type', 'video');
      if (src) container.setAttribute('data-src', src);
      container.style.position = 'relative';
      container.style.marginBottom = '1rem';

      let mediaEl: HTMLVideoElement | HTMLIFrameElement;

      if (embedUrl) {
        const iframe = document.createElement('iframe');
        applyIframeAttrs(iframe, embedUrl, attrs.title ?? 'Video');
        mediaEl = iframe;
      } else {
        const video = document.createElement('video');
        video.src = src;
        video.controls = true;
        video.playsInline = true;
        video.style.width = '100%';
        video.style.height = 'auto';
        video.style.borderRadius = '0.5rem';
        video.style.border = '1px solid var(--border)';
        video.style.backgroundColor = '#000';
        video.style.cursor = 'pointer';
        video.title = attrs.title ?? 'Video';
        mediaEl = video;
      }

      container.appendChild(mediaEl);

      if (editor.isEditable) {
        const deleteBtn = document.createElement('button');

        deleteBtn.innerHTML = '×';
        deleteBtn.type = 'button';
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

        // YouTube/Vimeo iframes mutate attributes as they load; ignore so
        // ProseMirror does not tear down and recreate the node view.
        ignoreMutation: () => true,

        selectNode: () => {
          mediaEl.style.border = '2px solid var(--primary)';
        },

        deselectNode: () => {
          mediaEl.style.border = '1px solid var(--border)';
        },

        update: (newNode) => {
          if (newNode.type.name !== 'video') return false;

          const newAttrs = newNode.attrs as VideoAttributes;
          const newSrc = (newAttrs.src ?? '').trim();
          const newUseEmbed = Boolean(newSrc && isEmbeddableVideoUrl(newSrc));
          const newEmbedUrl = newUseEmbed ? getVideoEmbedUrl(newSrc) : null;
          const nextTitle = newAttrs.title ?? 'Video';

          if (mediaEl instanceof HTMLIFrameElement && newEmbedUrl) {
            // Reassigning iframe.src always reloads the embed — only update when changed.
            const currentSrc = mediaEl.getAttribute('src') || '';
            if (currentSrc !== newEmbedUrl) {
              mediaEl.setAttribute('src', newEmbedUrl);
            }
            if (mediaEl.title !== nextTitle) {
              mediaEl.title = nextTitle;
            }
            container.setAttribute('data-src', newSrc);
            return true;
          }

          if (mediaEl instanceof HTMLVideoElement && !newEmbedUrl) {
            if (mediaEl.getAttribute('src') !== newSrc) {
              mediaEl.src = newSrc;
            }
            if (mediaEl.title !== nextTitle) {
              mediaEl.title = nextTitle;
            }
            container.setAttribute('data-src', newSrc);
            return true;
          }

          // Embed ↔ native switch needs a full node-view remount.
          return false;
        },
      };
    };
  },
});
