const config = {
    'validation': {
        'folder': {
            'regex': /^\/[A-Za-z-]+$/,
            'default': 'output/',
            'message': ''
        },
        'fileName': {
            'regex': /^[^\\/:\*\?"<>\|]+$/,
            'default': 'file.txt',
            'message': ''
        }
    }
}


export { config }