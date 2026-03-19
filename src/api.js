const BASE_URL = 'https://ai-iv-backend.onrender.com'

export const checkHealth = async () => {
  const res = await fetch(`${BASE_URL}/health`)
  const data = await res.json()
  return data
}