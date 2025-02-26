const baseURL = 'https://api.github.com'
const headers = {
  'Authorization': `token ${process.env.GITHUB_PAT}`,
  'Accept': 'application/vnd.github.v3+json'
}

export async function GHMetadata(owner, repo, dirPath, ref = 'main') {
  try {
    const url = `${baseURL}/repos/${owner}/${repo}/contents/${dirPath}?ref=${ref}`
    const response = await fetch(url, { headers })

    if (!response.ok) throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)

    const data = await response.json()
    const files = Array.isArray(data) ? data.filter(i => i.type === 'file') : []
    console.log(`Found ${files.length} files in "${dirPath}" of "${repo}" repository.`)
    return files
  } catch (error) {
    throw error
  }
}

export async function GHContent(owner, repo, filePath, ref = 'main') {
  try {
    const url = `${baseURL}/repos/${owner}/${repo}/contents/${filePath}?ref=${ref}`
    const response = await fetch(url, { headers })

    if (!response.ok) throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)

    const fileContent = await response.text()
    return fileContent
  } catch (error) {
    throw error
  }
}