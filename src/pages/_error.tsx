import { NextPage } from 'next'

interface ErrorProps {
  statusCode?: number
}

const Error: NextPage<ErrorProps> = ({ statusCode }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1>
        {statusCode
          ? `Ocorreu um erro ${statusCode} no servidor`
          : 'Ocorreu um erro no cliente'}
      </h1>
      <p>Por favor, tente novamente mais tarde.</p>
    </div>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error 