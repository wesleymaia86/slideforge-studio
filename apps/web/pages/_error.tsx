import type { NextPageContext } from 'next'

interface ErrorProps {
  statusCode?: number
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 'bold' }}>{statusCode ?? 'Error'}</h1>
        <p style={{ marginTop: '0.5rem' }}>
          {statusCode === 404 ? 'Page not found' : statusCode === 500 ? 'Internal server error' : 'An error occurred'}
        </p>
        <a href="/" style={{ display: 'inline-block', marginTop: '1.5rem' }}>Go home</a>
      </div>
    </div>
  )
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
