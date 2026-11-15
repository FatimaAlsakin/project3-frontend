const isPlainObject = (value) =>
    value !== null && typeof value === 'object' && value.constructor === Object

export function toFormData(obj, data = new FormData(), prefix = '') {
    Object.entries(obj).forEach(([key, value]) => {
        if (value === undefined) return
        const name = prefix ? `${prefix}[${key}]` : key
        // objects and lists are sent as victim[name], witnesses[0][name], ... which multer turns back into objects
        if (isPlainObject(value) || Array.isArray(value)) return toFormData(value, data, name)
        data.append(name, value === null ? '' : value)
    })
    return data
}
