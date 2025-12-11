import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { styled } from '@mui/material/styles'

const MarkdownContainer = styled('div')(({ theme }) => ({
  width: '100%',
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    margin: theme.spacing(1, 0),
    fontWeight: 600
  },
  '& h1': { fontSize: '1.8rem' },
  '& h2': { fontSize: '1.5rem' },
  '& h3': { fontSize: '1.3rem' },
  '& p': { margin: theme.spacing(1, 0), textAlign: 'left' },
  '& ul, & ol': { margin: theme.spacing(3), textAlign: 'left' },
  '& li': { margin: theme.spacing(0.5, 0) },
  '& code': {
    backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#2d2d2d',
    padding: theme.spacing(0.25, 0.5),
    borderRadius: 4
  },
  '& pre': {
    backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#2d2d2d',
    padding: theme.spacing(1),
    borderRadius: 4,
    overflow: 'auto'
  },
  '& blockquote': {
    borderLeft: `4px solid ${theme.palette.divider}`,
    margin: theme.spacing(1, 0),
    padding: theme.spacing(0, 1),
    color: theme.palette.text.secondary
  },
  '& table': {
    width: '100%',
    borderCollapse: 'collapse',
    margin: theme.spacing(1, 0),
    tableLayout: 'fixed'
  },
  '& th, & td': {
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(0.5, 1),
    textAlign: 'left',
    wordWrap: 'break-word',
    verticalAlign: 'top'
  },
  '& th': {
    backgroundColor: theme.palette.mode === 'light' ? '#f0f0f0' : '#3d3d3d',
    fontWeight: 600
  },
  '& tr:nth-of-type(even)': {
    backgroundColor: theme.palette.mode === 'light' ? '#fafafa' : '#2a2a2a'
  },
  '& tr:hover': {
    backgroundColor: theme.palette.mode === 'light' ? '#f1f1f1' : '#3a3a3a'
  },
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': { textDecoration: 'underline' }
  },
  '& img': {
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
    margin: theme.spacing(2, 'auto')
  }
}))

const MarkdownRender = ({ content }) => {
  const processedContent = (content || '').replace(/\\n/g, '\n')

  return (
    <MarkdownContainer>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            )
          }
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </MarkdownContainer>
  )
}

export { MarkdownRender }