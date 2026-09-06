const API = 'http://localhost:8000/api'
const login = await fetch(`${API}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@admin.com', password: 'password' }),
})
const { token } = await login.json()
const h = { Authorization: `Bearer ${token}` }
const j = async (u) => {
  const r = await fetch(API + u, { headers: h })
  return r.json()
}
// batches for ULTRATECH COMPOSITE SUPER (id 1004) across godowns w/ negative stock
for (const godownId of [15, 14, 13]) {
  const d = await j(`/godown_item_batches/1004/${godownId}`)
  const rows = d.data || []
  console.log(`godown ${godownId}: ${rows.length} batches`)
  const empty = rows.filter(
    (b) => !b.batchNo || String(b.batchNo).trim() === '',
  )
  console.log(
    '  empty batchNo count:',
    empty.length,
    empty[0] ? JSON.stringify(empty[0]).slice(0, 140) : '',
  )
  console.log('  first:', JSON.stringify(rows[0] || null).slice(0, 160))
}
