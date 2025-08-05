export default function BasicLoginPage() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{ 
        padding: '2rem', 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        maxWidth: '400px',
        width: '100%',
        backgroundColor: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>
          Basic Login
        </h1>
        
        <form action="/api/temp-login" method="POST">
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>
              Email:
            </label>
            <input
              type="email"
              name="email"
              value="admin@example.com"
              readOnly
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#f9f9f9'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>
              Password:
            </label>
            <input
              type="password"
              name="password"
              value="temp123"
              readOnly
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#f9f9f9'
              }}
            />
          </div>
          
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Login
          </button>
        </form>
        
        <div style={{ 
          marginTop: '1.5rem', 
          textAlign: 'center', 
          fontSize: '0.875rem',
          color: '#666',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px'
        }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Default credentials:</p>
          <p style={{ margin: '0.25rem 0' }}>Email: admin@example.com</p>
          <p style={{ margin: '0.25rem 0' }}>Password: temp123</p>
        </div>
        
        <div style={{ 
          marginTop: '1rem', 
          textAlign: 'center', 
          fontSize: '0.75rem',
          color: '#999'
        }}>
          <p>This is a basic form that submits directly to the server.</p>
        </div>
      </div>
    </div>
  );
} 