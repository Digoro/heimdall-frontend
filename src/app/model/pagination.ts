export class Pagination<T> {
    constructor(
        public items: Array<T>,
        public meta: PaginationMeta,
    ) { }
}

export class PaginationMeta {
    constructor(
        public totalItems: number,
        public itemCount: number,
        public itemsPerPage: number,
        public totalPages: number,
        public currentPage: number
    ) { }
}