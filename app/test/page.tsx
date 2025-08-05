export default function TestPage() {
  return (
    <div style={{ 
      padding: '2rem',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1>Server Test Page</h1>
      <p>If you can see this page, the server is working!</p>
      
      <div style={{ 
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#f0f0f0',
        borderRadius: '4px'
      }}>
        <h2>Test Links:</h2>
        <ul>
          <li><a href="/api/test">API Test Endpoint</a></li>
          <li><a href="/basic-login">Basic Login</a></li>
          <li><a href="/simple-login">Simple Login</a></li>
          <li><a href="/temp-login">Temp Login</a></li>
        </ul>
      </div>
      
      <div style={{ 
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#e8f5e8',
        borderRadius: '4px'
      }}>
        <h2>Login Credentials:</h2>
        <p><strong>Email:</strong> admin@example.com</p>
        <p><strong>Password:</strong> temp123</p>
      </div>
    </div>
  );
} 