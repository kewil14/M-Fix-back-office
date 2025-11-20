import { DataStateEnum } from "src/app/core/config/data.state.enum";
import { ShopResponseDto } from "../../dtos/shop-response-dto";

export interface ShopState {
    dataState: DataStateEnum;
    shops: ShopResponseDto[];
    shop: ShopResponseDto | null;
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    messages: string;
}

export const initialShopState: ShopState = {
    dataState: DataStateEnum.INITIAL,
    shops: [],
    shop: null,
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
    messages: ''
};

