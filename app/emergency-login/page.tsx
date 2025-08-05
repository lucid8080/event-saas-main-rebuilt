export default function EmergencyLoginPage() {
  return (
    <html>
      <head>
        <title>Emergency Login</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '90%'
        }}>
          <h1 style={{
            textAlign: 'center',
            color: '#333',
            marginBottom: '30px',
            fontSize: '24px'
          }}>
            Emergency Login
          </h1>
          
          <form action="/api/temp-login" method="POST" style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                color: '#555',
                fontWeight: 'bold'
              }}>
                Email:
              </label>
              <input
                type="email"
                name="email"
                value="admin@example.com"
                readonly
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  backgroundColor: '#f9f9f9',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                color: '#555',
                fontWeight: 'bold'
              }}>
                Password:
              </label>
              <input
                type="password"
                name="password"
                value="temp123"
                readonly
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  backgroundColor: '#f9f9f9',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Login Now
            </button>
          </form>
          
          <div style={{
            background: '#e8f5e8',
            padding: '15px',
            borderRadius: '5px',
            border: '1px solid #d4edda'
          }}>
            <h3 style={{
              margin: '0 0 10px 0',
              color: '#155724',
              fontSize: '16px'
            }}>
              Login Credentials:
            </h3>
            <p style={{ margin: '5px 0', color: '#155724' }}>
              <strong>Email:</strong> admin@example.com
            </p>
            <p style={{ margin: '5px 0', color: '#155724' }}>
              <strong>Password:</strong> temp123
            </p>
          </div>
          
          <div style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#666'
          }}>
            <p>This is an emergency login bypass.</p>
            <p>No JavaScript required.</p>
          </div>
        </div>
      </body>
    </html>
  );
} 