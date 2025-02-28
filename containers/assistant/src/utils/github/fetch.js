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

    const fileData = await response.json()
    // If the file is large, GitHub won't include the content directly (fetch it using the download_url)
    if (fileData.download_url) {
      const contentResponse = await fetch(fileData.download_url, { headers })
      if (!contentResponse.ok) throw new Error(`GitHub content download error: ${contentResponse.status} ${contentResponse.statusText}`)
      return await contentResponse.text()
    }

    // Smaller files that have content directly in the API response
    if (fileData.content && fileData.encoding === 'base64') {
      return Buffer.from(fileData.content, 'base64').toString('utf-8')
    }

    throw new Error('Unable to retrieve file content')
  } catch (error) {
    throw error
  }
}