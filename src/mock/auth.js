export function mockLogin(data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (data.username === 'admin' && data.password === '123456') {
        resolve({
          code: 0,
          token: 'mock-admin-token-123456',
          role: 'admin',
          data: {
            token: 'mock-admin-token-123456',
            role: 'admin'
          }
        })
      } else if (data.username === 'user' && data.password === '123456') {
        resolve({
          code: 0,
          token: 'mock-user-token-789012',
          role: 'user',
          data: {
            token: 'mock-user-token-789012',
            role: 'user'
          }
        })
      } else {
        reject(new Error('用户名或密码错误'))
      }
    }, 500)
  })
}
