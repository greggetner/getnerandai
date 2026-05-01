/**
 * Minimal ActiveCampaign API client — only the operations needed by the
 * draft-and-send-reply function. AC API docs: https://developers.activecampaign.com/reference
 *
 * Resolves contact by email (create or update), applies tags by name, and
 * writes custom field values. Uses native fetch; no SDK.
 */

type AcConfig = { apiUrl: string; apiKey: string }

async function acFetch(cfg: AcConfig, path: string, init: RequestInit = {}): Promise<any> {
  const headers = {
    'Api-Token': cfg.apiKey,
    'Content-Type': 'application/json',
    ...(init.headers || {}),
  }
  const url = cfg.apiUrl.replace(/\/$/, '') + path
  const res = await fetch(url, { ...init, headers })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`AC ${init.method || 'GET'} ${path} failed: ${res.status} ${text.slice(0, 500)}`)
  }
  return text ? JSON.parse(text) : {}
}

/** Create or update a contact by email; returns AC contact id. */
export async function createOrUpdateContact(
  cfg: AcConfig,
  contact: { email: string; firstName?: string; lastName?: string; phone?: string }
): Promise<string> {
  const payload = {
    contact: {
      email: contact.email,
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      phone: contact.phone || '',
    },
  }
  const data = await acFetch(cfg, '/api/3/contact/sync', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return String(data.contact?.id ?? '')
}

/** Look up tag id by name; returns null if not found. Caches in module scope. */
const tagIdCache = new Map<string, string>()
export async function getTagIdByName(cfg: AcConfig, tagName: string): Promise<string | null> {
  if (tagIdCache.has(tagName)) return tagIdCache.get(tagName)!
  const data = await acFetch(cfg, `/api/3/tags?search=${encodeURIComponent(tagName)}`)
  const match = (data.tags || []).find((t: any) => t.tag === tagName)
  if (!match) return null
  tagIdCache.set(tagName, String(match.id))
  return String(match.id)
}

/** Add a tag (by name) to a contact. Returns true if added, false if tag missing. */
export async function addTagToContact(
  cfg: AcConfig,
  contactId: string,
  tagName: string
): Promise<boolean> {
  const tagId = await getTagIdByName(cfg, tagName)
  if (!tagId) return false
  await acFetch(cfg, '/api/3/contactTags', {
    method: 'POST',
    body: JSON.stringify({ contactTag: { contact: contactId, tag: tagId } }),
  })
  return true
}

/** Add a contact to a list (subscription). */
export async function addContactToList(
  cfg: AcConfig,
  contactId: string,
  listId: string | number
): Promise<void> {
  await acFetch(cfg, '/api/3/contactLists', {
    method: 'POST',
    body: JSON.stringify({
      contactList: { list: String(listId), contact: contactId, status: 1 },
    }),
  })
}

/** Look up custom field id by perstag (e.g. "CONTEXT"). Cached in module scope. */
const fieldIdCache = new Map<string, string>()
export async function getFieldIdByPerstag(cfg: AcConfig, perstag: string): Promise<string | null> {
  if (fieldIdCache.has(perstag)) return fieldIdCache.get(perstag)!
  const data = await acFetch(cfg, '/api/3/fields?limit=100')
  for (const f of data.fields || []) {
    fieldIdCache.set(f.perstag, String(f.id))
  }
  return fieldIdCache.get(perstag) || null
}

/** Set a custom field value on a contact. Silently no-ops if field doesn't exist. */
export async function setFieldValue(
  cfg: AcConfig,
  contactId: string,
  perstag: string,
  value: string
): Promise<void> {
  const fieldId = await getFieldIdByPerstag(cfg, perstag)
  if (!fieldId) return
  await acFetch(cfg, '/api/3/fieldValues', {
    method: 'POST',
    body: JSON.stringify({
      fieldValue: { contact: contactId, field: fieldId, value },
    }),
  })
}
