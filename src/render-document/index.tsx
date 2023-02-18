import React from 'react';
import { marked } from 'marked';
import frontMatter from 'front-matter';
import hljs from 'highlight.js';
import classNames from 'classnames';

type DocumentPiece = {
  type: 'react' | 'html' | 'markdown';
  value: string;
  component: string;
  module: string;
  renderView: React.ReactNode;
};

type Props = {
  modules?: any;
  markdown: string;
};

type RenderDocumentProps = Props & React.HTMLAttributes<HTMLDivElement>;

export type RenderDocumentType = React.FC<RenderDocumentProps>;

const RenderDocument: RenderDocumentType = ({
  modules,
  markdown,
  ...props
}) => {
  const [documentPieces, setDocumentPieces] = React.useState<DocumentPiece[]>(
    []
  );

  React.useEffect(() => {
    (async () => {
      let rawMarkdown = markdown;

      if (rawMarkdown.startsWith('/') && rawMarkdown.endsWith('.md')) {
        rawMarkdown = await fetch(rawMarkdown).then((response) =>
          response.text()
        );
      }

      // Remove metadata
      rawMarkdown = frontMatter(rawMarkdown).body;

      // Locate thon blocks
      const componentsCount = rawMarkdown.match(/```thon/g)?.length || 0;

      let pieces: DocumentPiece[] = [];

      if (componentsCount > 0) {
        const [componentOpenKey, componentCloseKey] = ['```thon', '```'];

        // Separate the React component and markdown blocks
        for (let i = 0; i < componentsCount; i++) {
          const startComponentIndex =
            rawMarkdown.indexOf(componentOpenKey) + componentOpenKey.length;
          const endComponentIndex =
            startComponentIndex +
            rawMarkdown
              .substring(startComponentIndex)
              .indexOf(componentCloseKey);

          const componentData = JSON.parse(
            rawMarkdown.substring(startComponentIndex, endComponentIndex).trim()
          );

          pieces.push({
            type: 'markdown',
            value: marked.parse(
              rawMarkdown
                .substring(0, startComponentIndex - componentOpenKey.length)
                .trim(),
              null,
              null
            ),
          } as unknown as DocumentPiece);
          pieces.push(componentData);

          rawMarkdown = rawMarkdown
            .substring(
              endComponentIndex + componentCloseKey.length,
              rawMarkdown.length
            )
            .trim();

          // Last part of markdown
          if (i == componentsCount - 1) {
            pieces.push({
              type: 'markdown',
              value: marked.parse(rawMarkdown.trim(), null, null),
            } as unknown as DocumentPiece);
          }
        }
      } else {
        // Keep only the markdown
        pieces.push({
          type: 'markdown',
          value: marked.parse(rawMarkdown, null, null),
        } as unknown as DocumentPiece);
      }

      setDocumentPieces(pieces);
    })();
  }, [markdown]);

  React.useEffect(() => {
    document.querySelectorAll('pre code').forEach((el) => {
      hljs.highlightElement(el as HTMLElement);
    });
  }, [documentPieces]);

  function renderMarkdownPiece(document: DocumentPiece, index: number) {
    return (
      <div
        className="thon-html"
        key={`${document.type}_${index}`}
        dangerouslySetInnerHTML={{ __html: document.value as string }}
      />
    );
  }

  function renderReactComponent(document: DocumentPiece, index: number) {
    return (
      <div
        className={`thon-component thon-${document.module.toLowerCase()}`}
        key={`${document.type}_${index}`}
      >
        {modules[document.module][document.component]()}
      </div>
    );
  }

  return (
    <div {...props}>
      {documentPieces.map((document, index) => {
        switch (document.type) {
          case 'markdown':
            return renderMarkdownPiece(document, index);
          case 'react':
          default:
            return renderReactComponent(document, index);
        }
      })}
    </div>
  );
};

function renderDocumentWrapper({
  modules,
}: {
  modules: any;
}): RenderDocumentType {
  return (props: RenderDocumentProps) => {
    const className = classNames('document', props.className);

    return (
      <RenderDocument {...props} className={className} modules={modules} />
    );
  };
}

export default renderDocumentWrapper;
