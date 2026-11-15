const isPlainObject = (value) =>
    value !== null && typeof value === 'object' && value.constructor === Object

export function toFormData(obj, data = new FormData(), prefix = '') {
    Object.entries(obj).forEach(([key, value]) => {
        if (value === undefined) return
        const name = prefix ? `${prefix}[${key}]` : key
        // nested objects are sent as victim[name], victim[age], ... which multer turns back into an object
        if (isPlainObject(value)) return toFormData(value, data, name)
        data.append(name, value === null ? '' : value)
    })
    return data
}
