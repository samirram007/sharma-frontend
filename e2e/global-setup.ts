const BACKEND_API_URL = process.env.E2E_API_URL ?? 'http://localhost:8000/api'

/**
 * Playwright globalSetup — fail fast with a clear message if the Laravel
 * backend isn't reachable, instead of every test failing cryptically.
 *
 * The backend is NOT started by Playwright (it needs its own database);
 * see knowledge.md for the prerequisites.
 */
export default async function globalSetup(): Promise<void> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/clear`)
    // 401 (JWT required) proves the API is up; any HTTP response is fine.
    if (response.status === 401 || response.ok) {
      return
    }
    throw new Error(`Unexpected status ${response.status}`)
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    throw new Error(
      [
        `Laravel backend not reachable at ${BACKEND_API_URL} (${detail}).`,
        'Start it first (e.g. `cd sharma-api && composer run dev`) with the',
        'demo users seeded, then run the e2e suite. Override with E2E_API_URL.',
      ].join(' '),
    )
  }
}
