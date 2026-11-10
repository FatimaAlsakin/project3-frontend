export function toFormData(obj) {
    const data = new FormData()
    Object.entries(obj).forEach(([key, value]) => {
        if (value === undefined) return
        data.append(key, value === null ? '' : value)
    })
    return data
}
