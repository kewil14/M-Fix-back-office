import { DataStateEnum } from "src/app/core/config/data.state.enum";
import { Avis } from "../../models/avis.modal";
import { AddressNominatimResponseDto } from "../../dtos/address-nominatim-response-dto";

export interface AddressState{
    dataState: DataStateEnum,
    address: AddressNominatimResponseDto,
    adresses: AddressNominatimResponseDto[],
    messages: string,
}
