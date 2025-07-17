export class RequestResultPaginateDto<T> {
    constructor(
        public content?: T,
        public pageable?: {
            sort: {
                sorted: boolean;
                unsorted: boolean;
                empty: boolean;
            },
            offset: number;
            pageNumber: number;
            pageSize: number;
            paged: boolean;
            unpaged: false;
        },
        public totalPages?: number,
        public totalElements?: 0,
        public last?: true,
        public number?: number,
        public sort?: {
            sorted: boolean;
            unsorted: boolean;
            empty: boolean;
        },
        public size?: number,
        public numberOfElements?: number,
        public first?: boolean,
        public empty?: boolean,
    ){}
}
