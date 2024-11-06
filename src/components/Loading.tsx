// components/Loading.js

const Loading = () => {
    return (
      <div style={styles.container}>
        <div style={styles.spinner}></div>
      </div>
    );
  };
  
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#007BFF', // Cor azul para o fundo
    },
    spinner: {
      width: '50px',
      height: '50px',
      border: '5px solid #f3f3f3', // Cor do spinner
      borderTop: '5px solid #ffffff', // Cor da borda superior do spinner
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
  };
  
  // Animação do spinner
  const stylesGlobal = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  `;
  
  export default Loading;
  