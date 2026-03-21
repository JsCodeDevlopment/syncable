export function formatDuration(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60))
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`
}

export function formatTimer(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60))
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)
  
  const hText = hours > 0 ? `${hours}:` : ""
  const mText = minutes.toString().padStart(2, "0")
  const sText = seconds.toString().padStart(2, "0")
  
  return `${hText}${mText}:${sText}`
}