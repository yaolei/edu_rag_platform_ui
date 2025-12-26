import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { styled, useTheme } from '@mui/material/styles'
import { Box } from '@mui/material'

const MarkdownContainer = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isDarkMode'
})(({ theme, isDarkMode }) => ({
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
  '& code:not([class*="language-"])': {
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#f5f5f5',
    padding: theme.spacing(0.25, 0.5),
    borderRadius: 4,
    fontFamily: 'monospace'
  },
  '& pre:not([class*="prism-"])': {
    backgroundColor: isDarkMode ? '#2d2d2d' : '#f5f5f5',
    padding: theme.spacing(1),
    borderRadius: 4,
    overflow: 'auto'
  },
  '& pre[class*="language-"]': {
    margin: 0,
    borderRadius: 4,
    '& code': {
      background: 'transparent !important'
    }
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
    backgroundColor: isDarkMode ? '#3d3d3d' : '#f0f0f0',
    fontWeight: 600
  },
  '& tr:nth-of-type(even)': {
    backgroundColor: isDarkMode ? '#2a2a2a' : '#fafafa'
  },
  '& tr:hover': {
    backgroundColor: isDarkMode ? '#3a3a3a' : '#f1f1f1'
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

const MarkdownRender = ({ content, isDarkMode: propIsDarkMode }) => {
  // 使用传入的 isDarkMode，如果没有传入则使用 MUI theme
  const muiTheme = useTheme()
  const isDarkMode = propIsDarkMode !== undefined 
    ? propIsDarkMode 
    : muiTheme.palette.mode === 'dark'
  
  const processedContent = (content || '').replace(/\\n/g, '\n')
  
  // 根据主题选择语法高亮样式
  const codeStyle = isDarkMode ? vscDarkPlus : vs

  return (
    <MarkdownContainer isDarkMode={isDarkMode}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            
            // 代码块（多行代码）
            if (!inline && match) {
              return (
                <Box
                  component="div"
                  sx={{
                    backgroundColor: isDarkMode ? '#292929' : '#f5f5f5',
                    borderRadius: 1,
                    p: 2,
                    overflow: 'auto',
                    '& pre': {
                      margin: 0,
                      padding: 0,
                      background: 'transparent !important'
                    }
                  }}
                >
                  <SyntaxHighlighter
                    style={codeStyle}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      padding: 0,
                      background: 'transparent',
                      fontSize: '0.875rem'
                    }}
                    codeTagProps={{
                      style: {
                        fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                        background: 'transparent'
                      }
                    }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </Box>
              )
            }
            
            // 内联代码
            return (
              <code 
                className={className} 
                style={{
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#f5f5f5',
                  padding: '2px 4px',
                  borderRadius: 4,
                  fontFamily: 'monospace'
                }}
                {...props}
              >
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

// 设置默认 props
MarkdownRender.defaultProps = {
  isDarkMode: undefined
}

export { MarkdownRender }