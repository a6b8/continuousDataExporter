const arr = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]

const size = 3
const result = arr.slice( 0, size)
arr.splice( 0, size )
console.log( 'process', result )
console.log( '>>>', arr )